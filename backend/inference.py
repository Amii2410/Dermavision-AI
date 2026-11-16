
from pathlib import Path
from io import BytesIO
import base64
import threading

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "resnet50_finetuned_best.pth"
)

device = torch.device("cpu")

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True,
)

CLASS_NAMES = checkpoint["class_names"]
IMAGE_SIZE = checkpoint["image_size"]

model = models.resnet50(weights=None)
model.fc = torch.nn.Linear(
    model.fc.in_features,
    len(CLASS_NAMES),
)

model.load_state_dict(
    checkpoint["model_state_dict"],
    strict=True,
)

model.to(device)
model.eval()

image_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# Protect shared model hooks during concurrent requests.
inference_lock = threading.Lock()


def create_gradcam(tensor, class_index):
    """
    Generate Grad-CAM for the selected ResNet50 output class.

    Returns a normalized 2D heatmap as a torch Tensor.
    """

    captured = {}

    def forward_hook(module, inputs, output):
        captured["activations"] = output.detach()

        def save_gradient(gradient):
            captured["gradients"] = gradient.detach()

        output.register_hook(save_gradient)

    # Final convolution of the last ResNet50 residual block.
    target_layer = model.layer4[-1].conv3

    handle = target_layer.register_forward_hook(forward_hook)

    try:
        model.zero_grad(set_to_none=True)

        with torch.enable_grad():
            logits = model(tensor)
            target_score = logits[0, class_index]
            target_score.backward()

        activations = captured["activations"]
        gradients = captured["gradients"]

        weights = gradients.mean(dim=(2, 3), keepdim=True)

        heatmap = (weights * activations).sum(dim=1, keepdim=True)
        heatmap = F.relu(heatmap)

        heatmap = F.interpolate(
            heatmap,
            size=(IMAGE_SIZE, IMAGE_SIZE),
            mode="bilinear",
            align_corners=False,
        )

        heatmap = heatmap[0, 0]

        maximum = heatmap.max()

        if maximum.item() > 0:
            heatmap = heatmap / maximum
        else:
            heatmap = torch.zeros_like(heatmap)

        return heatmap.cpu()

    finally:
        handle.remove()
        model.zero_grad(set_to_none=True)


def create_gradcam_overlay(image, heatmap):
    """
    Overlay a colored Grad-CAM heatmap on the input image.
    Return a base64 data URL suitable for displaying in Next.js.
    """

    original = image.convert("RGB").resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    )

    heat = heatmap.numpy()

    # Blue -> cyan -> yellow -> red color mapping.
    red = np.clip(1.5 - np.abs(4 * heat - 3), 0, 1)
    green = np.clip(1.5 - np.abs(4 * heat - 2), 0, 1)
    blue = np.clip(1.5 - np.abs(4 * heat - 1), 0, 1)

    colored = np.stack(
        [red, green, blue],
        axis=-1,
    )

    colored = (colored * 255).astype(np.uint8)

    heatmap_image = Image.fromarray(colored, mode="RGB")

    overlay = Image.blend(
        original,
        heatmap_image,
        alpha=0.4,
    )

    buffer = BytesIO()
    overlay.save(buffer, format="PNG")

    encoded = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")

    return f"data:image/png;base64,{encoded}"


def predict_image(image: Image.Image):
    image = image.convert("RGB")

    tensor = image_transform(image)
    tensor = tensor.unsqueeze(0).to(device)

    # The model is shared by requests, and Grad-CAM
    # temporarily registers a forward hook.
    with inference_lock:
        with torch.no_grad():
            logits = model(tensor)
            probabilities = torch.softmax(
                logits, dim=1
            )[0]

        predicted_index = int(
            probabilities.argmax().item()
        )

        # Grad-CAM requires gradients, so it cannot run
        # inside torch.no_grad() or torch.inference_mode().
        heatmap = create_gradcam(
            tensor,
            predicted_index,
        )

    gradcam_image = create_gradcam_overlay(
        image,
        heatmap,
    )

    predictions = [
        {
            "class": class_name,
            "probability": round(
                float(probability), 6
            ),
        }
        for class_name, probability in zip(
            CLASS_NAMES,
            probabilities.tolist(),
        )
    ]

    predictions.sort(
        key=lambda item: item["probability"],
        reverse=True,
    )

    return {
        "predicted_class": predictions[0]["class"],
        "confidence": predictions[0]["probability"],
        "predictions": predictions,
        "gradcam_image": gradcam_image,
        "model": "ResNet50 Image-Only",
        "disclaimer": (
            "Research and educational use only. "
            "Not a medical diagnosis. "
            "Model probabilities are not clinically calibrated. "
            "Grad-CAM is a model attribution visualization, "
            "not a medical explanation."
        ),
    }
