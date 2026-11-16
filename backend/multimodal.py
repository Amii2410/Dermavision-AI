
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F

from backend.inference import (
    CLASS_NAMES,
    IMAGE_SIZE,
    device,
    image_transform,
    model as image_model,
    inference_lock,
    create_gradcam_overlay,
)


# ============================================================
# 1. MODEL FILE PATHS
# ============================================================

MODEL_DIR = Path(__file__).resolve().parent / "models"

FUSION_PATH = (
    MODEL_DIR / "resnet50_metadata_fusion_aligned_best.pth"
)

PREPROCESSOR_PATH = (
    MODEL_DIR / "metadata_preprocessor.joblib"
)


# ============================================================
# 2. MULTIMODAL CLASSIFIER
# Exact architecture from the original training notebook.
# ============================================================

class MultimodalClassifier(nn.Module):
    def __init__(
        self,
        image_features=2048,
        metadata_features=17,
        num_classes=7,
    ):
        super().__init__()

        combined_features = image_features + metadata_features

        self.classifier = nn.Sequential(
            nn.Linear(combined_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes),
        )

    def forward(self, image_features, metadata_features):
        combined = torch.cat(
            [image_features, metadata_features],
            dim=1,
        )

        return self.classifier(combined)


# ============================================================
# 3. LOAD TRAINED MULTIMODAL MODEL
# ============================================================

preprocessor = joblib.load(PREPROCESSOR_PATH)

metadata_feature_count = len(
    preprocessor.get_feature_names_out()
)

if metadata_feature_count != 17:
    raise RuntimeError(
        f"Expected 17 metadata features, "
        f"but got {metadata_feature_count}"
    )

multimodal_model = MultimodalClassifier(
    image_features=2048,
    metadata_features=metadata_feature_count,
    num_classes=len(CLASS_NAMES),
)

state_dict = torch.load(
    FUSION_PATH,
    map_location=device,
    weights_only=True,
)

multimodal_model.load_state_dict(
    state_dict,
    strict=True,
)

multimodal_model.to(device)
multimodal_model.eval()


# ============================================================
# 4. RESNET50 IMAGE FEATURE EXTRACTOR
# Matches the original Colab notebook.
# ============================================================

image_feature_extractor = nn.Sequential(
    *list(image_model.children())[:-1]
)

image_feature_extractor.eval()


# ============================================================
# 5. MULTIMODAL GRAD-CAM
# Gradients flow from the fusion classifier through ResNet50.
# ============================================================

def create_multimodal_gradcam(
    image_tensor,
    metadata_tensor,
    predicted_index,
):
    captured = {}

    def forward_hook(module, inputs, output):
        captured["activations"] = output.detach()

        def save_gradient(gradient):
            captured["gradients"] = gradient.detach()

        output.register_hook(save_gradient)

    target_layer = image_model.layer4[-1].conv3

    handle = target_layer.register_forward_hook(
        forward_hook
    )

    try:
        image_model.zero_grad(set_to_none=True)
        multimodal_model.zero_grad(set_to_none=True)

        with torch.enable_grad():
            image_features = image_feature_extractor(
                image_tensor
            ).flatten(1)

            logits = multimodal_model(
                image_features,
                metadata_tensor,
            )

            target_score = logits[0, predicted_index]
            target_score.backward()

        activations = captured["activations"]
        gradients = captured["gradients"]

        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True,
        )

        heatmap = (
            weights * activations
        ).sum(dim=1, keepdim=True)

        heatmap = F.relu(heatmap)

        heatmap = F.interpolate(
            heatmap,
            size=(IMAGE_SIZE, IMAGE_SIZE),
            mode="bilinear",
            align_corners=False,
        )[0, 0]

        maximum = heatmap.max()

        if maximum.item() > 0:
            heatmap = heatmap / maximum
        else:
            heatmap = torch.zeros_like(heatmap)

        return heatmap.detach().cpu()

    finally:
        handle.remove()

        image_model.zero_grad(set_to_none=True)
        multimodal_model.zero_grad(set_to_none=True)


# ============================================================
# 6. MULTIMODAL PREDICTION + GRAD-CAM
# ============================================================

def predict_multimodal(image, age, sex, localization):

    # Convert clinical metadata into the original
    # training-time feature representation.
    metadata = pd.DataFrame([
        {
            "age": age,
            "sex": sex,
            "localization": localization,
        }
    ])

    transformed = preprocessor.transform(metadata)

    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()

    metadata_array = np.asarray(
        transformed,
        dtype=np.float32,
    )

    if metadata_array.shape != (1, 17):
        raise ValueError(
            f"Unexpected metadata shape: "
            f"{metadata_array.shape}"
        )

    metadata_tensor = torch.from_numpy(
        metadata_array
    ).to(device)

    image = image.convert("RGB")

    image_tensor = image_transform(
        image
    ).unsqueeze(0).to(device)

    # The image-only and multimodal models share
    # the same ResNet50 backbone. This lock prevents
    # concurrent Grad-CAM hooks from interfering.
    with inference_lock:

        # First calculate the actual multimodal prediction.
        with torch.no_grad():

            image_features = image_feature_extractor(
                image_tensor
            ).flatten(1)

            logits = multimodal_model(
                image_features,
                metadata_tensor,
            )

            probabilities = torch.softmax(
                logits,
                dim=1,
            )[0]

        predicted_index = int(
            probabilities.argmax().item()
        )

        # Now calculate Grad-CAM for that same
        # multimodal prediction class.
        heatmap = create_multimodal_gradcam(
            image_tensor,
            metadata_tensor,
            predicted_index,
        )

    gradcam_image = create_gradcam_overlay(
        image,
        heatmap,
    )

    predictions = [
        {
            "class": name,
            "probability": round(float(prob), 6),
        }
        for name, prob in zip(
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
        "model": "Multimodal ResNet50",
        "metadata_used": {
            "age": age,
            "sex": sex,
            "localization": localization,
        },
        "gradcam_image": gradcam_image,
        "disclaimer": (
            "Research and educational use only. "
            "Not a medical diagnosis. "
            "Model probabilities are not clinically calibrated. "
            "Grad-CAM highlights image regions influencing "
            "the multimodal prediction, but does not explain "
            "the contribution of clinical metadata."
        ),
    }
