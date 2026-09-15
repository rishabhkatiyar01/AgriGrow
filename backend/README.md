# 🌿 AgriGrow PlantVillage CNN & Python Backend Documentation

An intelligent computer vision backend for crop leaf disease detection built using **PyTorch**, **Torchvision**, and **Flask**, pre-configured for the **PlantVillage Benchmark Dataset (38 Classes)**.

---

## 📐 1. CNN Model Neural Architecture

The model implements a Deep Convolutional Neural Network (`PlantDiseaseCNN`) with 4 spatial feature extraction blocks followed by adaptive spatial pooling and a fully connected classification head.

```
Input Image (RGB, 224x224x3)
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Conv Block 1: Conv2d(3 -> 32, k=3, p=1) + BN + ReLU   │ ──► [B, 32, 224, 224]
│               MaxPool2d(2, 2)                          │ ──► [B, 32, 112, 112]
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Conv Block 2: Conv2d(32 -> 64, k=3, p=1) + BN + ReLU  │ ──► [B, 64, 112, 112]
│               MaxPool2d(2, 2)                          │ ──► [B, 64, 56, 56]
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Conv Block 3: Conv2d(64 -> 128, k=3, p=1) + BN + ReLU │ ──► [B, 128, 56, 56]
│               MaxPool2d(2, 2)                          │ ──► [B, 128, 28, 28]
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Conv Block 4: Conv2d(128 -> 256, k=3, p=1)+ BN + ReLU │ ──► [B, 256, 28, 28]
│               MaxPool2d(2, 2)                          │ ──► [B, 256, 14, 14]
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Spatial Pooling: AdaptiveAvgPool2d((7, 7))             │ ──► [B, 256, 7, 7]
│ Flatten                                                │ ──► [B, 12,544]
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Fully Connected 1: Linear(12544 -> 512) + ReLU         │ ──► [B, 512]
│ Regularization:    Dropout(p = 0.5)                    │ ──► [B, 512]
│ Fully Connected 2: Linear(512 -> 38)                   │ ──► [B, 38] (Raw Logits)
└────────────────────────────────────────────────────────┘
       │
       ▼
  Softmax Activation ──► Class Probabilities P(Y = c | X)
```

### Layer Parameters & Receptive Fields

| Layer Name | Layer Type | Input Shape `(C, H, W)` | Output Shape `(C, H, W)` | Kernel / Stride | Activation | Learnable Parameters |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Input** | RGB Image | `(3, 224, 224)` | `(3, 224, 224)` | - | - | 0 |
| **Conv1** | Conv2d | `(3, 224, 224)` | `(32, 224, 224)` | `3x3 / s=1, p=1` | ReLU | $(3 \times 3 \times 3 \times 32) + 32 = 896$ |
| **BN1** | BatchNorm2d | `(32, 224, 224)` | `(32, 224, 224)` | - | - | $32 \times 2 = 64$ |
| **Pool1** | MaxPool2d | `(32, 224, 224)` | `(32, 112, 112)` | `2x2 / s=2` | - | 0 |
| **Conv2** | Conv2d | `(32, 112, 112)` | `(64, 112, 112)` | `3x3 / s=1, p=1` | ReLU | $(32 \times 3 \times 3 \times 64) + 64 = 18,496$ |
| **BN2** | BatchNorm2d | `(64, 112, 112)` | `(64, 112, 112)` | - | - | $64 \times 2 = 128$ |
| **Pool2** | MaxPool2d | `(64, 112, 112)` | `(64, 56, 56)` | `2x2 / s=2` | - | 0 |
| **Conv3** | Conv2d | `(64, 56, 56)` | `(128, 56, 56)` | `3x3 / s=1, p=1` | ReLU | $(64 \times 3 \times 3 \times 128) + 128 = 73,856$ |
| **BN3** | BatchNorm2d | `(128, 56, 56)` | `(128, 56, 56)` | - | - | $128 \times 2 = 256$ |
| **Pool3** | MaxPool2d | `(128, 56, 56)` | `(128, 28, 28)` | `2x2 / s=2` | - | 0 |
| **Conv4** | Conv2d | `(128, 28, 28)` | `(256, 28, 28)` | `3x3 / s=1, p=1` | ReLU | $(128 \times 3 \times 3 \times 256) + 256 = 295,168$ |
| **BN4** | BatchNorm2d | `(256, 28, 28)` | `(256, 28, 28)` | - | - | $256 \times 2 = 512$ |
| **Pool4** | MaxPool2d | `(256, 28, 28)` | `(256, 14, 14)` | `2x2 / s=2` | - | 0 |
| **AdaptivePool**| AdaptiveAvgPool | `(256, 14, 14)` | `(256, 7, 7)` | Target `(7, 7)` | - | 0 |
| **Flatten** | Reshape | `(256, 7, 7)` | `(12544)` | - | - | 0 |
| **FC1** | Linear | `(12544)` | `(512)` | - | ReLU | $(12,544 \times 512) + 512 = 6,423,040$ |
| **Dropout** | Dropout | `(512)` | `(512)` | `p=0.5` | - | 0 |
| **FC2 (Out)** | Linear | `(512)` | `(38)` | - | Logits | $(512 \times 38) + 38 = 19,494$ |

*Total Trainable Parameters:* **~6,831,914 parameters (~6.83 M)**

---

## 📊 2. Model Metrics & Output Matrix Evaluation

### A. Mathematical Loss Function & Optimization
- **Loss Function**: Categorical Cross-Entropy Loss over 38 classes:
  $$\mathcal{L}_{CE} = -\sum_{i=1}^{38} y_i \log(\hat{y}_i)$$
  where $\hat{y}_i = \frac{e^{z_i}}{\sum_{j=1}^{38} e^{z_j}}$ represents the Softmax class probability output.
- **Optimizer**: Adam Optimizer ($lr = 0.001$, $\beta_1 = 0.9$, $\beta_2 = 0.999$) with `ReduceLROnPlateau` scheduler.

### B. Classification Performance Matrices

| Evaluation Metric | Formula / Mathematical Definition | Target Benchmark | Description |
| :--- | :--- | :--- | :--- |
| **Accuracy** | $\frac{TP + TN}{TP + TN + FP + FN}$ | **> 96.5%** | Overall correct disease predictions across all 38 classes |
| **Precision** | $\frac{TP}{TP + FP}$ | **> 95.8%** | Ratio of true positive disease detections vs false alarms |
| **Recall (Sensitivity)** | $\frac{TP}{TP + FN}$ | **> 96.2%** | Ability of the CNN to correctly identify diseased leaves |
| **F1-Score** | $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$ | **> 96.0%** | Harmonic mean balancing Precision and Recall |
| **Confusion Matrix** | $38 \times 38 \text{ matrix } C_{i, j}$ | Low off-diagonal | Tracks true vs predicted counts per PlantVillage class |

### C. Visual Feature Extractions & Heuristic Metrics

In addition to neural tensor activations, the inference engine computes raw visual color space matrices:

1. **Greenness Ratio ($\gamma_G$)**:
   $$\gamma_G = \frac{1}{N} \sum_{p=1}^N \frac{G_p}{R_p + G_p + B_p + \epsilon}$$
   *(Measures healthy chlorophyll density across leaf surface)*

2. **Discoloration Index ($\sigma_{R-G}$)**:
   $$\sigma_{R-G} = \text{std}(R - G)$$
   *(Quantifies leaf necrotic spot variance and lesion distribution)*

3. **Red-Brown Lesion Ratio ($\rho_{RB}$)**:
   $$\rho_{RB} = \frac{1}{N} \sum_{p=1}^N \frac{R_p + B_p}{G_p + \epsilon}$$

4. **Severity Matrix Mapping**:
   $$\text{Severity} = \begin{cases} \text{low} & \text{if } \gamma_G > 0.46 \text{ and } \sigma_{R-G} < 0.12 \\ \text{medium} & \text{if } \sigma_{R-G} \in [0.12, 0.22] \\ \text{high} & \text{if } \sigma_{R-G} \in (0.22, 0.32] \\ \text{critical} & \text{if } \sigma_{R-G} > 0.32 \text{ or Phytophthora/Xanthomonas pathogens} \end{cases}$$

---

## 🛠️ 3. Backend REST API Reference

### Health Check Endpoint
- **URL**: `GET /api/health`
- **Response**:
```json
{
  "status": "online",
  "service": "AgriGrow Plant Disease Detection CNN API",
  "modelLoaded": true,
  "supportedClasses": 38
}
```

### CNN Prediction Endpoint
- **URL**: `POST /api/predict`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: `file: <crop_leaf_image.jpg>`
- **Response JSON**:
```json
{
  "success": true,
  "data": {
    "crop": "Potato",
    "diseaseName": "Potato Late Blight (Phytophthora infestans)",
    "confidence": 94.2,
    "severity": "critical",
    "dataset": "PlantVillage Benchmark (38 Classes)",
    "classKey": "Potato___Late_blight",
    "metrics": {
      "greenRatio": 0.284,
      "discolorationIndex": 0.341
    },
    "symptoms": [
      "Dark brown/black water-soaked lesions on leaf tips and margins",
      "White velvety fungal growth on leaf undersides during high humidity",
      "Rapid leaf collapse and stem blighting"
    ],
    "treatment": "Apply systemic fungicides like Cymoxanil + Mancozeb or Metalaxyl immediately.",
    "prevention": "Plant resistant varieties, destroy volunteer potatoes, maintain good canopy ventilation."
  }
}
```

---

## 💻 4. Running & Training Instructions

### Run API Backend
```bash
python app.py
```

### Download PlantVillage Dataset
```bash
python download_plantvillage.py
```

### Train CNN Model
```bash
python train_model.py --epochs 15 --batch_size 32
```
