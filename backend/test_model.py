
from pathlib import Path

import torch
from torchvision import models

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "resnet50_finetuned_best.pth"
)

print("Loading checkpoint...")

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

class_names = checkpoint["class_names"]
image_size = checkpoint["image_size"]

model = models.resnet50(weights=None)
model.fc = torch.nn.Linear(
    model.fc.in_features,
    len(class_names),
)

model.load_state_dict(
    checkpoint["model_state_dict"],
    strict=True,
)

model.eval()

print("\nModel loaded successfully!")
print("Architecture:", checkpoint["architecture"])
print("Image size:", image_size)
print("Classes:", class_names)
print("Model mode:", "evaluation" if not model.training else "training")
