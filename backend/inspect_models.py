
from pathlib import Path
import torch
import joblib

MODELS_DIR = Path(__file__).resolve().parent / "models"

files = [
    "resnet50_finetuned_best.pth",
    "resnet50_metadata_fusion_aligned_best.pth",
]

for filename in files:
    path = MODELS_DIR / filename
    print(f"\n{'=' * 60}")
    print(f"FILE: {filename}")

    if not path.exists():
        print("ERROR: File not found")
        continue

    checkpoint = torch.load(
        path,
        map_location="cpu",
        weights_only=True
    )

    print("Checkpoint type:", type(checkpoint).__name__)

    if isinstance(checkpoint, dict):
        for key, value in checkpoint.items():
            if isinstance(value, torch.Tensor):
                print(f"{key}: {tuple(value.shape)}")
            else:
                print(f"{key}: {type(value).__name__}")

print(f"\n{'=' * 60}")
print("METADATA PREPROCESSOR")

preprocessor_path = MODELS_DIR / "metadata_preprocessor.joblib"

if preprocessor_path.exists():
    preprocessor = joblib.load(preprocessor_path)
    print("Type:", type(preprocessor).__name__)

    try:
        print("Feature count:", len(preprocessor.get_feature_names_out()))
        print("Features:", preprocessor.get_feature_names_out().tolist())
    except Exception as error:
        print("Could not list features:", error)
else:
    print("ERROR: Preprocessor file not found")
