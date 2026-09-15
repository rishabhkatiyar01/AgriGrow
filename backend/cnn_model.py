import sys
import os
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ----------------------------------------------------
# 1. Pretrained PyTorch MobileNetV2 Deep Feature CNN
# ----------------------------------------------------
class PlantDiseaseMobileNet(nn.Module):
    """
    Deep Transfer Learning CNN for Plant Leaf Disease Classification.
    Uses pre-trained MobileNetV2 feature extractor backbone (ImageNet weights)
    connected to a 38-class PlantVillage classifier head.
    Matches Kaggle 99.6% accuracy architecture setup.
    """
    def __init__(self, num_classes=38):
        super(PlantDiseaseMobileNet, self).__init__()
        
        try:
            weights = models.MobileNet_V2_Weights.DEFAULT
            backbone = models.mobilenet_v2(weights=weights)
        except Exception:
            backbone = models.mobilenet_v2(pretrained=True)
            
        self.features = backbone.features
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        
        self.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(1280, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(p=0.4),
            nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

PlantDiseaseCNN = PlantDiseaseMobileNet

# ----------------------------------------------------
# 2. Official 38 PlantVillage Classes (14 Crops) & Metadata
# ----------------------------------------------------
PLANTVILLAGE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

DISEASE_CLASSES = PLANTVILLAGE_CLASSES

DISEASE_INFO = {
    "Apple___Apple_scab": {
        "crop": "Apple",
        "diseaseName": "Apple Scab (Venturia inaequalis)",
        "severity": "medium",
        "symptoms": ["Olive-green velvety spots on upper leaf surface", "Deformed yellowing leaves dropping prematurely"],
        "treatment": "Apply captan, myclobutanil, or liquid copper fungicide during spring bud break.",
        "prevention": "Rake and destroy fallen leaves in autumn to eliminate overwintering spores."
    },
    "Apple___Black_rot": {
        "crop": "Apple",
        "diseaseName": "Apple Black Rot (Botryosphaeria obtusa)",
        "severity": "high",
        "symptoms": ["Frog-eye spots (purple spots with tan centers)", "Dark brown sunken cankers on branches"],
        "treatment": "Prune out dead branches and apply copper or thiophanate-methyl fungicides.",
        "prevention": "Remove mummified fruit and prune out cankers during winter dormancy."
    },
    "Apple___Cedar_apple_rust": {
        "crop": "Apple",
        "diseaseName": "Cedar Apple Rust (Gymnosporangium juniperi-virginianae)",
        "severity": "medium",
        "symptoms": ["Bright yellow/orange spots on upper leaf surface", "Tube-like spore projections under leaves"],
        "treatment": "Spray myclobutanil or propiconazole fungicide when flower buds open.",
        "prevention": "Remove nearby eastern red cedar trees within 1-2 miles."
    },
    "Apple___healthy": {
        "crop": "Apple",
        "diseaseName": "Healthy Apple Tree Foliage",
        "severity": "low",
        "symptoms": ["Clean glossy green foliage without spots or discoloration"],
        "treatment": "No treatment required.",
        "prevention": "Maintain annual canopy pruning for sunlight penetration."
    },
    "Blueberry___healthy": {
        "crop": "Blueberry",
        "diseaseName": "Healthy Blueberry Foliage",
        "severity": "low",
        "symptoms": ["Deep green, oval glossy leaves with healthy bush foliage"],
        "treatment": "No treatment required.",
        "prevention": "Maintain acidic soil pH (4.5 - 5.5) and organic pine bark mulch."
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "crop": "Cherry",
        "diseaseName": "Cherry Powdery Mildew (Podosphaera clandestina)",
        "severity": "medium",
        "symptoms": ["White powdery fungal patches on leaf undersides", "Curling and puckering of young shoots"],
        "treatment": "Apply sulfur spray or potassium bicarbonate fungicide.",
        "prevention": "Prune tree center to maximize air circulation and reduce shade canopy."
    },
    "Cherry_(including_sour)___healthy": {
        "crop": "Cherry",
        "diseaseName": "Healthy Cherry Tree Foliage",
        "severity": "low",
        "symptoms": ["Smooth, rich green serrated leaves with strong shoots"],
        "treatment": "No treatment needed.",
        "prevention": "Ensure good irrigation and annual spring feeding."
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "crop": "Corn (Maize)",
        "diseaseName": "Corn Gray Leaf Spot (Cercospora zeae-maydis)",
        "severity": "high",
        "symptoms": ["Rectangular tan to gray lesions bounded by leaf veins", "Severe foliar blight"],
        "treatment": "Apply foliar strobilurin or triazole fungicides at tasseling stage.",
        "prevention": "Plant resistant corn hybrids and practice crop rotation with non-host crops."
    },
    "Corn_(maize)___Common_rust_": {
        "crop": "Corn (Maize)",
        "diseaseName": "Corn Common Rust (Puccinia sorghi)",
        "severity": "medium",
        "symptoms": ["Oval cinnamon-brown pustules on both leaf surfaces", "Pustules rupture releasing rusty spores"],
        "treatment": "Spray foliar fungicide if infection occurs prior to tasseling on susceptible lines.",
        "prevention": "Select rust-resistant corn hybrids."
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "crop": "Corn (Maize)",
        "diseaseName": "Northern Corn Leaf Blight (Exserohilum turcicum)",
        "severity": "high",
        "symptoms": ["Long cigar-shaped gray-green to tan lesions", "Dark spore zones inside lesions in moist weather"],
        "treatment": "Apply foliar fungicides during early silking if upper canopy shows lesions.",
        "prevention": "Rotate crops and till under infected crop residue."
    },
    "Corn_(maize)___healthy": {
        "crop": "Corn (Maize)",
        "diseaseName": "Healthy Corn Foliage",
        "severity": "low",
        "symptoms": ["Uniform green leaf blades without pustules or lesions"],
        "treatment": "No treatment required.",
        "prevention": "Maintain nitrogen fertilizer levels and weed control."
    },
    "Grape___Black_rot": {
        "crop": "Grape",
        "diseaseName": "Grape Black Rot (Guignardia bidwellii)",
        "severity": "high",
        "symptoms": ["Small reddish-brown circular leaf spots with black fruiting dots", "Shriveled black mummy berries"],
        "treatment": "Apply mancozeb or myclobutanil fungicide from pre-bloom to post-bloom.",
        "prevention": "Prune out mummified berries and old infected canes."
    },
    "Grape___Esca_(Black_Measles)": {
        "crop": "Grape",
        "diseaseName": "Grape Black Measles / Esca Complex",
        "severity": "critical",
        "symptoms": ["Tiger-stripe interveinal yellowing and browning", "Dark purple speckling on grape skins"],
        "treatment": "Apply wound sealants to large pruning cuts. Severe cases require vine trunk renewal.",
        "prevention": "Avoid pruning during rainy weather."
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "crop": "Grape",
        "diseaseName": "Grape Leaf Blight (Pseudocercospora vitis)",
        "severity": "medium",
        "symptoms": ["Irregular reddish-brown spots on leaf surface", "Dark fungal tufts under leaves"],
        "treatment": "Apply copper-based fungicides post-harvest or early spring.",
        "prevention": "Improve vineyard air drainage and strip lower leaves."
    },
    "Grape___healthy": {
        "crop": "Grape",
        "diseaseName": "Healthy Grape Foliage",
        "severity": "low",
        "symptoms": ["Vibrant green, lobed leaf blades free of lesions or mildew"],
        "treatment": "No treatment required.",
        "prevention": "Maintain proper trellis canopy management."
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "crop": "Orange / Citrus",
        "diseaseName": "Citrus Greening / Huanglongbing (Candidatus Liberibacter)",
        "severity": "critical",
        "symptoms": ["Asymmetric blotchy mottle on leaves", "Small, lopsided green fruits with bitter taste"],
        "treatment": "No cure once infected. Remove infected trees immediately to prevent vector spread.",
        "prevention": "Control Asian citrus psyllid vector with targeted insecticides and protective netting."
    },
    "Peach___Bacterial_spot": {
        "crop": "Peach",
        "diseaseName": "Peach Bacterial Spot (Xanthomonas arboricola)",
        "severity": "high",
        "symptoms": ["Small purple-brown angular leaf lesions dropping out ('shot-hole')", "Deep pitted spots on fruit surface"],
        "treatment": "Apply oxytetracycline or low rates of copper spray during early spring.",
        "prevention": "Plant resistant peach cultivars and avoid overhead irrigation."
    },
    "Peach___healthy": {
        "crop": "Peach",
        "diseaseName": "Healthy Peach Tree Foliage",
        "severity": "low",
        "symptoms": ["Narrow lanceolate glossy green leaves with intact margins"],
        "treatment": "No treatment needed.",
        "prevention": "Maintain annual dormant pruning and balanced fertilizing."
    },
    "Pepper,_bell___Bacterial_spot": {
        "crop": "Bell Pepper",
        "diseaseName": "Bell Pepper Bacterial Spot (Xanthomonas euvesicatoria)",
        "severity": "high",
        "symptoms": ["Small dark brown water-soaked leaf spots turning necrotic", "Warty raised spots on fruit skin"],
        "treatment": "Apply copper hydroxide mixed with mancozeb at first sign of spots.",
        "prevention": "Use certified disease-free seeds and avoid handling wet foliage."
    },
    "Pepper,_bell___healthy": {
        "crop": "Bell Pepper",
        "diseaseName": "Healthy Bell Pepper Foliage",
        "severity": "low",
        "symptoms": ["Dark green shiny pepper leaves with strong vegetative growth"],
        "treatment": "No treatment required.",
        "prevention": "Maintain soil moisture consistency and apply calcium to prevent blossom end rot."
    },
    "Potato___Early_blight": {
        "crop": "Potato",
        "diseaseName": "Potato Early Blight (Alternaria solani)",
        "severity": "high",
        "symptoms": ["Concentric target-board ring spots on older lower leaves", "Yellow halo around dark lesions"],
        "treatment": "Apply chlorothalonil, mancozeb, or azoxystrobin fungicide on 7-10 day schedules.",
        "prevention": "Rotate with non-solanaceous crops and avoid late afternoon leaf wetness."
    },
    "Potato___Late_blight": {
        "crop": "Potato",
        "diseaseName": "Potato Late Blight (Phytophthora infestans)",
        "severity": "critical",
        "symptoms": ["Large pale green to dark water-soaked leaf lesions", "White cottony mildew growth under leaves"],
        "treatment": "Apply systemic fungicides like copper sulphate, ridomil gold, or cyazofamid immediately.",
        "prevention": "Plant certified seed potatoes and destroy infected volunteer tubers."
    },
    "Potato___healthy": {
        "crop": "Potato",
        "diseaseName": "Healthy Potato Foliage",
        "severity": "low",
        "symptoms": ["Lush green compound leaves without blight spots or yellowing"],
        "treatment": "No treatment required.",
        "prevention": "Hill up soil around stems and maintain balanced potassium fertilizing."
    },
    "Raspberry___healthy": {
        "crop": "Raspberry",
        "diseaseName": "Healthy Raspberry Foliage",
        "severity": "low",
        "symptoms": ["Vibrant green serrated compound leaves on sturdy canes"],
        "treatment": "No treatment required.",
        "prevention": "Thin old canes post-harvest to foster new vegetative growth."
    },
    "Soybean___healthy": {
        "crop": "Soybean",
        "diseaseName": "Healthy Soybean Foliage",
        "severity": "low",
        "symptoms": ["Trifoliate rich green leaves free of leaf spots or mosaic"],
        "treatment": "No treatment required.",
        "prevention": "Practice crop rotation with corn or small grains."
    },
    "Squash___Powdery_mildew": {
        "crop": "Squash",
        "diseaseName": "Squash Powdery Mildew (Podosphaera xanthii)",
        "severity": "medium",
        "symptoms": ["White talcum-powder like coating on leaf surfaces and stems", "Leaves yellowing and drying up"],
        "treatment": "Apply neem oil, potassium bicarbonate, or sulfur fungicide.",
        "prevention": "Plant in full sun and space plants generously for ventilation."
    },
    "Strawberry___Leaf_scorch": {
        "crop": "Strawberry",
        "diseaseName": "Strawberry Leaf Scorch (Diplocarpon earlianum)",
        "severity": "medium",
        "symptoms": ["Numerous purplish spots with dark red centers on leaves", "Leaf margins dry out looking scorched"],
        "treatment": "Apply captan or copper fungicide post-renovation.",
        "prevention": "Remove older infected leaves after harvest and maintain weed control."
    },
    "Strawberry___healthy": {
        "crop": "Strawberry",
        "diseaseName": "Healthy Strawberry Foliage",
        "severity": "low",
        "symptoms": ["Deep green trifoliate leaves with healthy crown growth"],
        "treatment": "No treatment required.",
        "prevention": "Renovate beds annually and mulch with clean straw."
    },
    "Tomato___Bacterial_spot": {
        "crop": "Tomato",
        "diseaseName": "Tomato Bacterial Spot (Xanthomonas perforans)",
        "severity": "high",
        "symptoms": ["Small dark greasy spots on leaves turning brown and papery", "Scabby spots on green fruits"],
        "treatment": "Spray fixed copper combined with mancozeb or bacteriophages.",
        "prevention": "Use drip irrigation instead of overhead sprinklers and disinfect garden tools."
    },
    "Tomato___Early_blight": {
        "crop": "Tomato",
        "diseaseName": "Tomato Early Blight (Alternaria linariae)",
        "severity": "high",
        "symptoms": ["Target-like ringed dark spots starting on lower mature leaves", "Leaves turn yellow and drop off"],
        "treatment": "Apply copper octanoate or chlorothalonil fungicide upon first sight.",
        "prevention": "Mulch around stem base to stop soil-borne spore splashing."
    },
    "Tomato___Late_blight": {
        "crop": "Tomato",
        "diseaseName": "Tomato Late Blight (Phytophthora infestans)",
        "severity": "critical",
        "symptoms": ["Dark irregular greasy leaf blotches with greyish mold underneath", "Stem lesions causing collapse"],
        "treatment": "Apply copper or chlorothalonil immediately; destroy severely blighted plants.",
        "prevention": "Avoid planting near potato fields and destroy volunteer solanaceous weeds."
    },
    "Tomato___Leaf_Mold": {
        "crop": "Tomato",
        "diseaseName": "Tomato Leaf Mold (Passalora fulva)",
        "severity": "medium",
        "symptoms": ["Pale green/yellow spots on upper leaf surfaces", "Olive-green velvety mold underneath leaves"],
        "treatment": "Apply copper or chlorothalonil fungicide and lower greenhouse humidity.",
        "prevention": "Increase greenhouse ventilation and keep humidity below 85%."
    },
    "Tomato___Septoria_leaf_spot": {
        "crop": "Tomato",
        "diseaseName": "Tomato Septoria Leaf Spot (Septoria lycopersici)",
        "severity": "high",
        "symptoms": ["Circular small spots with dark brown borders and light grey centers", "Black tiny dots (pycnidia) inside spots"],
        "treatment": "Apply copper spray or mancozeb every 7-14 days.",
        "prevention": "Clear crop debris after season and stake plants to lift foliage."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "crop": "Tomato",
        "diseaseName": "Two-Spotted Spider Mites (Tetranychus urticae)",
        "severity": "high",
        "symptoms": ["Fine white/yellow stippling dot pattern on leaf surfaces", "Silky webbing underneath leaves"],
        "treatment": "Apply insecticidal soap, neem oil, or abamectin miticide.",
        "prevention": "Avoid dusty dry conditions and encourage predatory mites."
    },
    "Tomato___Target_Spot": {
        "crop": "Tomato",
        "diseaseName": "Tomato Target Spot (Corynespora cassiicola)",
        "severity": "medium",
        "symptoms": ["Pinpoint brown spots expanding into circular target-patterned lesions", "Light brown center with dark halo"],
        "treatment": "Apply azoxystrobin, chlorothalonil, or copper fungicides.",
        "prevention": "Ensure good crop spacing and avoid excessive nitrogen fertilizing."
    },
    "Tomato___Yellow_Leaf_Curl_Virus": {
        "crop": "Tomato",
        "diseaseName": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "severity": "critical",
        "symptoms": ["Severe upward curling and yellowing of leaf margins", "Stunted bushy plant growth and flower drop"],
        "treatment": "No chemical cure for virus. Remove infected plants immediately.",
        "prevention": "Control silverleaf whitefly vectors using yellow sticky traps and insect mesh."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "crop": "Tomato",
        "diseaseName": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "severity": "critical",
        "symptoms": ["Severe upward curling and yellowing of leaf margins", "Stunted bushy plant growth and flower drop"],
        "treatment": "No chemical cure for virus. Remove infected plants immediately.",
        "prevention": "Control silverleaf whitefly vectors using yellow sticky traps and insect mesh."
    },
    "Tomato___mosaic_virus": {
        "crop": "Tomato",
        "diseaseName": "Tomato Mosaic Virus (ToMV)",
        "severity": "high",
        "symptoms": ["Mottled light and dark green mosaic patterns on leaves", "Shoestringing/leaf distortion"],
        "treatment": "Remove and incinerate infected vines. Disinfect hands and shears with milk or trisodium phosphate.",
        "prevention": "Plant virus-resistant tomato hybrids and wash hands thoroughly."
    },
    "Tomato___Tomato_mosaic_virus": {
        "crop": "Tomato",
        "diseaseName": "Tomato Mosaic Virus (ToMV)",
        "severity": "high",
        "symptoms": ["Mottled light and dark green mosaic patterns on leaves", "Shoestringing/leaf distortion"],
        "treatment": "Remove and incinerate infected vines. Disinfect hands and shears with milk or trisodium phosphate.",
        "prevention": "Plant virus-resistant tomato hybrids and wash hands thoroughly."
    },
    "Tomato___healthy": {
        "crop": "Tomato",
        "diseaseName": "Healthy Tomato Foliage",
        "severity": "low",
        "symptoms": ["Deep green, crisp tomato leaves with healthy stem vigor"],
        "treatment": "No treatment required.",
        "prevention": "Maintain regular watering schedule and balanced fertilization."
    }
}

# Image Preprocessing Transform pipeline
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

import json

# Try loading classes.json if available
_classes_path = os.path.join(os.path.dirname(__file__), "classes.json")
if os.path.exists(_classes_path):
    try:
        with open(_classes_path, "r", encoding="utf-8") as f:
            PLANTVILLAGE_CLASSES = json.load(f)
        DISEASE_CLASSES = PLANTVILLAGE_CLASSES
        print(f"Loaded {len(PLANTVILLAGE_CLASSES)} classes from '{_classes_path}'")
    except Exception as e:
        print(f"Warning loading classes.json: {e}")

# Global model instance for Flask app / inference
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = PlantDiseaseCNN(num_classes=len(PLANTVILLAGE_CLASSES)).to(_device)
_model_path = os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")

if os.path.exists(_model_path):
    try:
        model.load_state_dict(torch.load(_model_path, map_location=_device))
        model.eval()
        print(f"Loaded PyTorch PlantDiseaseCNN model weights from '{_model_path}'")
    except Exception as e:
        print(f"Warning loading weights: {e}")
else:
    model.eval()

def predict_image(image_bytes, model=None, class_names=PLANTVILLAGE_CLASSES, device=None):
    """
    Predicts plant disease from raw image bytes.
    Returns dictionary with class index, label, confidence, crop, treatment, and metadata.
    """
    model_inst = model if model is not None else globals()['model']
    if device is None:
        device = _device
        
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = val_transform(image).unsqueeze(0).to(device)
    
    model_inst.eval()
    with torch.no_grad():
        outputs = model_inst(tensor)
        probabilities = F.softmax(outputs, dim=1)
        conf, pred_idx = torch.max(probabilities, dim=1)
        
    class_idx = pred_idx.item()
    confidence_float = float(conf.item())
    raw_label = class_names[class_idx] if class_idx < len(class_names) else "Unknown"
    
    info = DISEASE_INFO.get(raw_label, {
        "crop": raw_label.split("___")[0].replace("_", " "),
        "diseaseName": raw_label.split("___")[-1].replace("_", " "),
        "severity": "medium",
        "symptoms": ["Foliar symptoms detected"],
        "treatment": "Consult agricultural expert.",
        "prevention": "Practice good crop sanitation."
    })
    
    # Calculate green ratio / discoloration metrics
    np_img = np.array(image)
    if np_img.size > 0:
        r, g, b = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2]
        total_pixels = np_img.shape[0] * np_img.shape[1]
        green_mask = (g > r) & (g > b) & (g > 30)
        green_ratio = float(np.sum(green_mask) / total_pixels * 100)
        discoloration_index = float(100.0 - green_ratio)
    else:
        green_ratio = 50.0
        discoloration_index = 50.0

    return {
        "class_index": class_idx,
        "raw_label": raw_label,
        "crop": info.get("crop", "Unknown"),
        "diseaseName": info.get("diseaseName", raw_label),
        "disease_name": info.get("diseaseName", raw_label),
        "severity": info.get("severity", "medium"),
        "symptoms": info.get("symptoms", []),
        "treatment": info.get("treatment", ""),
        "prevention": info.get("prevention", ""),
        "confidence": round(confidence_float * 100, 1),
        "metrics": {
            "greenRatio": round(green_ratio, 1),
            "discolorationIndex": round(discoloration_index, 1)
        }
    }

def run_cnn_inference(image_bytes):
    """
    Exported helper function called by app.py to classify uploaded leaf images.
    """
    return predict_image(image_bytes, model=model, device=_device)
