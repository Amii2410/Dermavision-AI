# 🔬 DermaVision AI

### Explainable Multimodal Skin-Lesion Classification

**DermaVision AI** is an AI-powered web application for skin-lesion classification using deep learning, clinical metadata, and explainable artificial intelligence.

The platform combines **ResNet50-based image classification**, **multimodal learning**, and **Grad-CAM visual explanations** to provide interpretable predictions from dermoscopic images. It also features **DermaBot**, an AI assistant for dermatology-related educational questions.

🌐 **[Live Website](https://dermavision-ai-seven.vercel.app/)** | 💻 **[GitHub Repository](https://github.com/Amii2410/Dermavision-AI)**

> **Deployment:** The frontend is live on Vercel. Cloud deployment of the AI inference backend and chatbot is in progress.

---

## ✨ Key Features

- **Image-Only Classification:** Predicts skin-lesion categories using a ResNet50-based deep learning model.
- **Multimodal Classification:** Combines dermoscopic images with patient metadata such as age, sex, and lesion location.
- **Explainable AI:** Uses Grad-CAM heatmaps to highlight image regions influencing model predictions.
- **Prediction Insights:** Displays predicted lesion categories and class probabilities.
- **DermaBot:** An interactive AI chatbot powered by Ollama and Qwen2.5 1.5B.
- **Interactive Web Interface:** Responsive dashboard for image uploads, model selection, analysis, and chatbot interaction.

## 📂 Dataset — HAM10000

The models were developed using the **HAM10000 (Human Against Machine with 10,000 Training Images)** dataset, a publicly available collection of dermoscopic images used for skin-lesion classification research.

The dataset contains **10,015 dermoscopic images** covering seven diagnostic categories.

| Class | Skin-Lesion Category |
|---|---|
| `akiec` | Actinic keratoses and intraepithelial carcinoma |
| `bcc` | Basal cell carcinoma |
| `bkl` | Benign keratosis-like lesions |
| `df` | Dermatofibroma |
| `mel` | Melanoma |
| `nv` | Melanocytic nevi |
| `vasc` | Vascular lesions |

Alongside image data, HAM10000 provides metadata fields such as **age, sex, and anatomical localization**, which are used in the multimodal classification pipeline.

**Dataset Source:** [HAM10000 on Harvard Dataverse](https://doi.org/10.7910/DVN/DBW86T)

The dataset is not included in this repository.

## 🧠 Models & Performance

Two ResNet50-based classification approaches were developed and evaluated on held-out test data.

| Model | Input | Test Accuracy |
|---|---|---:|
| **Image-Only ResNet50** | Dermoscopic image | **74.85%** |
| **Multimodal ResNet50** | Image + clinical metadata | **78.46%** |

The multimodal model achieved an improvement of **3.61 percentage points**, demonstrating the potential value of combining visual and structured clinical information.

**Explainability:** Grad-CAM is used to generate heatmaps showing image regions that influence the model's predictions.

These evaluation results do not establish clinical diagnostic reliability.

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Deep Learning | PyTorch, Torchvision, ResNet50 |
| Explainable AI | Grad-CAM |
| Multimodal Learning | Image features + clinical metadata |
| AI Assistant | Ollama, Qwen2.5 1.5B |
| Dataset | HAM10000 |
| Deployment | Vercel (frontend) |

## 🚀 Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Amii2410/Dermavision-AI.git
cd Dermavision-AI
```

**2. Install frontend dependencies**

```bash
npm install
```

**3. Configure the API URL**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

**4. Start the frontend**

```bash
npm run dev
```

Visit `http://localhost:3000`.

**5. Start the backend**

Set up a Python environment with the required backend dependencies and trained model files, then run:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**6. Run DermaBot locally**

Install Ollama and download the language model:

```bash
ollama pull qwen2.5:1.5b
```

Ensure the Ollama service is running and accessible to the FastAPI backend.

**Note:** Trained model weights and the complete backend environment are not included in this repository. They must be configured separately for local AI inference.

## 🌐 Deployment

The Next.js frontend is deployed on **Vercel**.

**Live Application:** [DermaVision AI](https://dermavision-ai-seven.vercel.app/)

The FastAPI inference backend and Ollama-based chatbot currently run locally. Public cloud deployment of these services is planned.

## 🔮 Future Improvements

- Cloud deployment of AI inference and chatbot services
- Improved model calibration and robustness
- Additional model evaluation and explainability methods
- Optimized inference performance
- Enhanced user experience and accessibility

## ⚠️ Disclaimer

DermaVision AI is a research and educational software prototype, **not a medical diagnostic tool**. Model predictions and AI-generated responses may be inaccurate and must not replace evaluation by a qualified healthcare professional.

---

**Developed by [Amii2410](https://github.com/Amii2410)**

*Exploring the intersection of deep learning, multimodal AI, and explainable computer vision.*
