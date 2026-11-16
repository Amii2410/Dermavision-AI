# 🔬 DermaVision AI

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&pause=1100&color=00C9FF&center=true&vCenter=true&width=780&lines=Explainable+Multimodal+Skin+Lesion+Classification;Deep+Learning+%7C+Computer+Vision+%7C+Grad-CAM;ResNet50+%7C+PyTorch+%7C+Next.js;Making+AI+Predictions+More+Interpretable)](https://git.io/typing-svg)

**An explainable AI-powered platform for skin-lesion classification using deep learning, dermoscopic images, and clinical metadata.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)


**🌐 [Live Website](https://dermavision-ai-seven.vercel.app/) • 💻 [Source Code](https://github.com/Amii2410/Dermavision-AI)**

</div>

---

## 🌟 About the Project

**DermaVision AI** is a full-stack deep learning application designed to explore intelligent and interpretable skin-lesion classification.

The platform combines **computer vision, multimodal learning, and explainable AI** to analyze dermoscopic images and provide visual insights into model predictions.

It offers two classification approaches:

- **Image-Only Model:** Classifies dermoscopic images using a ResNet50-based neural network.
- **Multimodal Model:** Combines image features with clinical metadata such as age, sex, and anatomical lesion location.

To improve interpretability, **Grad-CAM** generates heatmaps highlighting regions that influence model predictions.

The platform also includes **DermaBot**, an interactive AI assistant that provides educational explanations about skin lesions and AI-related concepts.

---

## ✨ Key Features

- 🧠 **Deep Learning Classification** — ResNet50-based prediction across seven skin-lesion categories.
- 🧬 **Multimodal Analysis** — Combines dermoscopic images with structured clinical metadata.
- 🔍 **Explainable AI** — Grad-CAM heatmaps visualize influential image regions.
- 📊 **Prediction Insights** — Displays predicted classes and probability distributions.
- 🤖 **DermaBot** — Integrated AI assistant powered by Ollama and Qwen2.5 1.5B.
- 💻 **Interactive Dashboard** — Responsive Next.js interface with image upload, model selection, and analysis results.

---

## 📂 Dataset — HAM10000

The models were developed using the **HAM10000 (Human Against Machine with 10,000 Training Images)** dataset, containing **10,015 dermoscopic images** across seven skin-lesion categories.

| Class | Skin-Lesion Category |
|---|---|
| `akiec` | Actinic keratoses and intraepithelial carcinoma |
| `bcc` | Basal cell carcinoma |
| `bkl` | Benign keratosis-like lesions |
| `df` | Dermatofibroma |
| `mel` | Melanoma |
| `nv` | Melanocytic nevi |
| `vasc` | Vascular lesions |

The dataset also includes metadata such as **age, sex, and anatomical localization**, which are incorporated into the multimodal classification pipeline.

📎 **Dataset:** [HAM10000 — Harvard Dataverse](https://doi.org/10.7910/DVN/DBW86T)

*The dataset is not included in this repository.*

---

## 📊 Model Performance

Both models were evaluated on held-out test data.

| Model | Input | Test Accuracy |
|---|---|---:|
| **Image-Only ResNet50** | Dermoscopic image | **74.85%** |
| **Multimodal ResNet50** | Image + clinical metadata | **78.46%** |

The multimodal model achieved a **3.61 percentage-point improvement** over the image-only model in these experiments.

Grad-CAM provides visual explanations for model predictions by highlighting influential regions in the input image.

*These results represent research-model performance, not validated clinical diagnostic accuracy.*

---

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **Deep Learning** | PyTorch, Torchvision, ResNet50 |
| **Explainable AI** | Grad-CAM |
| **Multimodal Learning** | Image features + clinical metadata |
| **AI Chatbot** | Ollama, Qwen2.5 1.5B |
| **Dataset** | HAM10000 |
| **Deployment** | Vercel (frontend) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Amii2410/Dermavision-AI.git
cd Dermavision-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Frontend

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 4. Start the Frontend

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### 5. Run the AI Backend

Set up a Python environment, install the required backend dependencies, and configure the trained model files.

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 6. Run DermaBot

Install Ollama and download the language model:

```bash
ollama pull qwen2.5:1.5b
```

Ensure the Ollama service is running.

> **Note:** Trained model weights and the complete backend environment are not included in this repository. They must be configured separately for local inference.

---

## 🌐 Deployment

The Next.js frontend is deployed on **Vercel**.

**🔗 [Explore the Live Website](https://dermavision-ai-seven.vercel.app/)**

| Service | Status |
|---|---|
| Next.js Frontend | ✅ Deployed |
| FastAPI Backend | ⏳ Cloud deployment pending |
| ResNet50 Inference | 💻 Running locally |
| DermaBot | 💻 Running locally |

The website is publicly accessible, while AI inference and chatbot functionality require the backend services to be deployed and connected for remote visitors.

---

## 🔮 Future Improvements

- Cloud deployment of AI inference and chatbot services
- Improved model robustness and calibration
- Additional explainability techniques
- Optimized inference speed and scalability
- Enhanced user experience and accessibility

---

## ⚠️ Disclaimer

DermaVision AI is a **research and educational software prototype**, not a medical diagnostic tool.

Model predictions, Grad-CAM explanations, and AI-generated responses may be inaccurate and should not replace professional medical evaluation or advice.

---

<div align="center">

**Developed by [Amii2410](https://github.com/Amii2410)**

*Exploring deep learning, multimodal AI, and explainable computer vision.*

⭐ **If you find this project interesting, consider starring the repository!**

</div>
