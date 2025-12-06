import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import timm
import os
from collections import OrderedDict

def initialize_model(model_name, num_classes, use_pretrained=False):
    model_ft = None
    input_size = 0

    if model_name == "resnet18":
        model_ft = models.resnet18(pretrained=use_pretrained)
        num_ftrs = model_ft.fc.in_features
        model_ft.fc = nn.Linear(num_ftrs, num_classes)
        input_size = 224
    elif model_name == "alexnet":
        model_ft = models.alexnet(pretrained=use_pretrained)
        num_ftrs = model_ft.classifier[6].in_features
        model_ft.classifier[6] = nn.Linear(num_ftrs, num_classes)
        input_size = 224
    elif model_name == "vgg16":
        model_ft = models.vgg16(pretrained=use_pretrained)
        num_ftrs = model_ft.classifier[6].in_features
        model_ft.classifier[6] = nn.Linear(num_ftrs, num_classes)
        input_size = 224
    elif model_name == "mobilenet_v2":
        model_ft = models.mobilenet_v2(pretrained=use_pretrained)
        num_ftrs = model_ft.classifier[1].in_features
        model_ft.classifier[1] = nn.Linear(num_ftrs, num_classes)
        input_size = 224
    elif model_name == "vit_base_patch16_224":
        model_ft = timm.create_model('vit_base_patch16_224', pretrained=use_pretrained, num_classes=num_classes)
        input_size = 224
    else:
        print(f"Model {model_name} not supported in this script.")
        exit()

    return model_ft, input_size

def main():
    # --- Configuration ---
    num_classes = 7
    sample_images_dir = '/home/hannan/machineLearning/Projects/BuildingDefectsDetection/BD3-Dataset/sample images/class_images/'

    models_to_test = {
        "vit_base_patch16_224_best": {
            "weights": "/home/hannan/machineLearning/Projects/BuildingDefectsDetection/BD3-Dataset/code/model-train/vit/best_model.pt",
            "correct": 0,
            "total": 0,
            "model_name": "vit_base_patch16_224"
        },
        "vit_base_patch16_224_checkpoint": {
            "weights": "/home/hannan/machineLearning/Projects/BuildingDefectsDetection/BD3-Dataset/code/model-train/vit/checkpoint.pt",
            "correct": 0,
            "total": 0,
            "model_name": "vit_base_patch16_224"
        },
        "vit_base_patch16_224_org": {
            "weights": "/home/hannan/machineLearning/Projects/BuildingDefectsDetection/BD3-Dataset/code/model-train/vit/nn-vt-org-weights.pth",
            "correct": 0,
            "total": 0,
            "model_name": "vit_base_patch16_224"
        },
        "alexnet": {
            # NOTE: The weight file for this model was not found.
            # If you have the weights, please update the path.
            "weights": None, 
            "correct": 0,
            "total": 0,
            "model_name": "alexnet"
        },
        "mobilenet_v2": {
            # NOTE: The weight file for this model was not found.
            # If you have the weights, please update the path.
            "weights": None,
            "correct": 0,
            "total": 0,
            "model_name": "mobilenet_v2"
        },
        "resnet18": {
            # NOTE: The weight file for this model was not found.
            # If you have the weights, please update the path.
            "weights": None,
            "correct": 0,
            "total": 0,
            "model_name": "resnet18"
        },
        "vgg16": {
            # NOTE: The weight file for this model was not found.
            # If you have the weights, please update the path.
            "weights": None,
            "correct": 0,
            "total": 0,
            "model_name": "vgg16"
        }
    }

    # --- Device ---
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # --- Data Transformations ---
    data_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # --- Class Names ---
    class_names = sorted([d.name for d in os.scandir(sample_images_dir) if d.is_dir()])

    # --- Inference ---
    for model_key, model_info in models_to_test.items():
        if model_info["weights"] is None:
            print(f"--- Skipping {model_key}: weight file not found. ---")
            continue

        print(f"--- Testing {model_key} ---")
        model_ft, _ = initialize_model(model_info["model_name"], num_classes)
        
        try:
            state_dict = torch.load(model_info["weights"], map_location=device)
            # Handle checkpoint files that are dictionaries
            if "model" in state_dict:
                state_dict = state_dict["model"]
            
            # Handle DataParallel wrapped models
            try:
                model_ft.load_state_dict(state_dict)
            except RuntimeError:
                new_state_dict = OrderedDict()
                for k, v in state_dict.items():
                    name = k[7:] # remove `module.`
                    new_state_dict[name] = v
                model_ft.load_state_dict(new_state_dict)

        except Exception as e:
            print(f"Could not load weights for {model_key}. Error: {e}")
            continue

        model_ft.to(device)
        model_ft.eval()

        for class_name in class_names:
            class_dir = os.path.join(sample_images_dir, class_name)
            image_files = [f for f in os.listdir(class_dir) if os.path.isfile(os.path.join(class_dir, f))]
            
            for image_file in image_files:
                image_path = os.path.join(class_dir, image_file)
                try:
                    image = Image.open(image_path).convert('RGB')
                    image_tensor = data_transforms(image).unsqueeze(0).to(device)

                    with torch.no_grad():
                        outputs = model_ft(image_tensor)
                        _, preds = torch.max(outputs, 1)
                        predicted_class = class_names[preds[0]]
                    
                    if predicted_class == class_name:
                        model_info["correct"] += 1
                    model_info["total"] += 1

                except Exception as e:
                    print(f"Could not process image {image_path}. Error: {e}")

    # --- Results ---
    best_model = None
    best_accuracy = -1

    print("\n--- Prediction Results ---")
    for model_key, model_info in models_to_test.items():
        if model_info["weights"] is not None:
            accuracy = (model_info["correct"] / model_info["total"]) * 100 if model_info["total"] > 0 else 0
            print(f"{model_key}: Accuracy = {accuracy:.2f}% ({model_info['correct']}/{model_info['total']})")
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                best_model = model_key
        else:
            print(f"{model_key}: Skipped (no weights).")

    if best_model:
        print(f"\n--- Best performing model: {best_model} with {best_accuracy:.2f}% accuracy. ---")
    else:
        print("\n--- No models were tested. ---")


if __name__ == '__main__':
    main()
