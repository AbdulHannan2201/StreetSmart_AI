import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import timm
import os
import sys
import json
from collections import OrderedDict

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

def initialize_model(model_name, num_classes, use_pretrained=False):
    model_ft = None
    if model_name == "vit_base_patch16_224":
        model_ft = timm.create_model('vit_base_patch16_224', pretrained=use_pretrained, num_classes=num_classes)
    else:
        print(json.dumps({"error": f"Model {model_name} not supported"}))
        sys.exit(1)
    return model_ft

def predict(model, image_path, data_transforms, device, class_names):
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image path not found: {image_path}"}))
        return

    try:
        image = Image.open(image_path).convert('RGB')
        image_tensor = data_transforms(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            max_prob, preds = torch.max(probabilities, 1)
            predicted_class = class_names[preds[0]]
            confidence = max_prob.item()
        
        result = {
            "defect_detected": predicted_class != "normal",
            "defect_type": predicted_class,
            "confidence": round(confidence, 4),
            "severity": "High" if confidence > 0.8 else "Medium" # Simple heuristic
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": f"Inference failed: {str(e)}"}))

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        return

    image_path = sys.argv[1]

    # --- Configuration ---
    num_classes = 7
    model_name = "vit_base_patch16_224"
    
    # Path to the model file relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_weights = os.path.join(script_dir, "Model", "best_model.pt")
    
    class_names = ['Algae', 'major crack', 'minor crack', 'normal', 'peeling', 'spalling', 'stain']

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    data_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # --- Model Initialization ---
    try:
        model_ft = initialize_model(model_name, num_classes)
        
        if not os.path.exists(model_weights):
             print(json.dumps({"error": f"Model weights not found at {model_weights}"}))
             return

        state_dict = torch.load(model_weights, map_location=device)
        if "model" in state_dict:
            state_dict = state_dict["model"]
        
        try:
            model_ft.load_state_dict(state_dict)
        except RuntimeError:
            new_state_dict = OrderedDict()
            for k, v in state_dict.items():
                name = k[7:] # remove `module.`
                new_state_dict[name] = v
            model_ft.load_state_dict(new_state_dict)

        model_ft.to(device)
        model_ft.eval()
        
        predict(model_ft, image_path, data_transforms, device, class_names)

    except Exception as e:
        print(json.dumps({"error": f"Model loading failed: {str(e)}"}))

if __name__ == '__main__':
    main()
