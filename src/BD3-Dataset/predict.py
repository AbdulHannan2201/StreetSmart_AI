import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import timm
import os
import argparse
from collections import OrderedDict

def initialize_model(model_name, num_classes, use_pretrained=False):
    """
    Initializes a model with the given name and number of classes.
    """
    model_ft = None
    if model_name == "vit_base_patch16_224":
        model_ft = timm.create_model('vit_base_patch16_224', pretrained=use_pretrained, num_classes=num_classes)
    else:
        print(f"Model {model_name} not supported in this script.")
        exit()
    return model_ft

def predict(model, image_path, data_transforms, device, class_names):
    """
    Makes a prediction on a single image.
    """
    try:
        image = Image.open(image_path).convert('RGB')
        image_tensor = data_transforms(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image_tensor)
            _, preds = torch.max(outputs, 1)
            predicted_class = class_names[preds[0]]
        
        print(f"Image: {image_path}, Predicted class: {predicted_class}")

    except Exception as e:
        print(f"Could not process image {image_path}. Error: {e}")

def main():
    # --- Argument Parser ---
    parser = argparse.ArgumentParser(description='Predict building defects from images.')
    parser.add_argument('image_path', type=str, help='Path to an image file or a directory of images.')
    args = parser.parse_args()

    # --- Configuration ---
    num_classes = 7
    model_name = "vit_base_patch16_224"
    model_weights = "/home/hannan/machineLearning/Projects/BuildingDefectsDetection/BD3-Dataset/code/model-train/vit/best_model.pt"
    
    # These class names are based on the subdirectories in 'sample images/class_images'
    # and should be adjusted if your training data has different class names in a different order.
    class_names = ['Algae', 'major crack', 'minor crack', 'normal', 'peeling', 'spalling', 'stain']


    # --- Device ---
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # --- Data Transformations ---
    data_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # --- Model Initialization ---
    model_ft = initialize_model(model_name, num_classes)
    
    try:
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

    except Exception as e:
        print(f"Could not load weights. Error: {e}")
        exit()

    model_ft.to(device)
    model_ft.eval()

    # --- Inference ---
    print(f"--- Predictions using {os.path.basename(model_weights)} ---")
    
    if os.path.isdir(args.image_path):
        for filename in os.listdir(args.image_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(args.image_path, filename)
                predict(model_ft, image_path, data_transforms, device, class_names)
    elif os.path.isfile(args.image_path):
        predict(model_ft, args.image_path, data_transforms, device, class_names)
    else:
        print(f"Error: The path '{args.image_path}' is not a valid file or directory.")

if __name__ == '__main__':
    main()
