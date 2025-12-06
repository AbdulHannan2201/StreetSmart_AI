# Workflow for Building and Evaluating Your Model

Based on your project's `README.md` and `requirements.txt`, here is the standard workflow to replicate your results or train a new model on your dataset.

**Step 1: Environment Setup**
First, ensure you have all the necessary libraries installed. Your `requirements.txt` specifies the exact versions needed.
*   **Action:** Create a Python 3.8 virtual environment and install the dependencies.
    ```bash
    pip install -r requirements.txt
    ```

**Step 2: Data Preparation**
Your images need to be consistently formatted. The scripts in your `data-process` folder are for this purpose. The most important step is resizing the images to a uniform dimension (e.g., 512x512, as suggested by `resize512.py`).
*   **Action:** Use the scripts in `code/data-process/` to prepare your raw images.

**Step 3: Dataset Splitting**
Before training, you must divide your data into training, validation, and test sets. Your README indicates a 60%, 20%, 20% split, respectively.
*   **Action:** Run the `code/train-test-split/train-val-split.py` script to create these data splits.

**Step 4: Data Augmentation (Recommended)**
To improve model robustness and achieve the better results shown in your README, you should create an augmented dataset.
*   **Action:** Use the `code/data-augmentation/dataset_augument.ipynb` notebook to generate augmented images. **Important:** Apply augmentation only to the images in your *training set*.

**Step 5: Model Training and Evaluation**
This is the core step. Your README shows that the Vision Transformer (ViT) model gave the best performance. I recommend starting with that.
*   **Action:** Open and run the `code/model-train/vit/vt-model.ipynb` notebook. This will:
    1.  Load the pre-trained ViT model from `torchvision`.
    2.  Train the model on your prepared training data (either original or augmented).
    3.  Evaluate its performance on the test data.

**Step 6: Analyze Results**
After training, you need to interpret the model's performance. Your `Results` directory shows you've already done this by generating confusion matrices and classification reports.
*   **Action:** Use the `code/output analysis/output-analysis.ipynb` notebook to generate visualizations and detailed reports for your newly trained model.

**Step 7: Iterate and Compare**
To replicate the comparison tables in your README, you can repeat Step 5 and 6 for the other models available in `code/model-train/` (ResNet18, VGG16, etc.).

This workflow follows the exact structure you have already established in your project.

## Project Structure and File Descriptions

### Directory Tree
```
.
├── Building_Defect_Detection_Workflow.md
├── code
│   ├── data-augmentation
│   │   └── dataset_augument.ipynb
│   ├── data-process
│   │   ├── img_path.py
│   │   ├── rename.py
│   │   ├── resize512.py
│   │   └── vid-img.py
│   ├── model-train
│   │   ├── alexnet
│   │   │   └── nn-alexnet.ipynb
│   │   ├── mobilenet
│   │   │   └── nn-MobilenetV2.ipynb
│   │   ├── resnet18
│   │   │   └── nn-ResNet-18.ipynb
│   │   ├── vgg16
│   │   │   └── nn-VGG16.ipynb
│   │   └── vit
│   │       └── vt-model.ipynb
│   ├── output analysis
│   │   └── output-analysis.ipynb
│   └── train-test-split
│       └── train-val-split.py
├── README.md
├── requirements.txt
├── Results
│   ├── bar chart
│   ├── classification report
│   ├── confusion matrix
│   ├── model_comparision
│   └── model-wise result
└── sample images
    ├── class_images
    └── markdown_images
```

### Key Files and Directories

*   `README.md`: The main documentation for the project, explaining the dataset, benchmarking results, and overall goals.
*   `requirements.txt`: A list of Python packages required to run the project.
*   `Building_Defect_Detection_Workflow.md`: This file, containing the step-by-step guide.

*   `code/`: A directory containing all the source code for the project.
    *   `data-process/`: Holds scripts for initial data collection and preprocessing.
        *   `resize512.py`: Resizes all images in a folder to a standard 512x512 resolution. This is a key preprocessing step.
        *   `rename.py`: Renames images within a class folder to a standardized format (e.g., `cls06_001.jpg`).
        *   `vid-img.py`: A utility script to extract image frames from a video file. Likely used for initial data gathering.
        *   `img_path.py`: A utility script to generate an Excel file with image paths. Likely used for organizational purposes.
    *   `train-test-split/`: Contains the script for splitting the dataset.
        *   `train-val-split.py`: A crucial script that splits the dataset (organized by class folders) into training, validation, and test sets, copying them into a new directory structure.
    *   `data-augmentation/`:
        *   `dataset_augument.ipynb`: A Jupyter Notebook to create augmented versions of the images (e.g., rotations, flips, color changes) to increase the training set size and improve model generalization.
    *   `model-train/`: Contains Jupyter Notebooks for training and evaluating various deep learning models. Each subfolder is dedicated to a specific architecture (AlexNet, ResNet18, VGG16, MobileNetV2, and ViT).
    *   `output analysis/`:
        *   `output-analysis.ipynb`: A notebook used to analyze the results from trained models, likely for generating the confusion matrices, classification reports, and comparison charts found in the `Results` folder.

*   `Results/`: This directory stores all the output artifacts from model training and evaluation, such as charts, reports, and raw CSV data. It is organized by the type of result.

*   `sample images/`: Contains the image dataset.
    *   `class_images/`: The raw images, sorted into subdirectories where each directory name corresponds to a defect class (e.g., `Algae`, `major crack`). This is the input for the entire workflow.