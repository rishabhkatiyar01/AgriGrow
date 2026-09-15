"""
PlantVillage Dataset Downloader & Setup Script
------------------------------------------------
Automates cleaning old model/dataset files, downloading the complete
official PlantVillage dataset (38 classes, 54,000+ real images) via KaggleHub,
and setting up dataset directories.
"""

import sys
import os
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def delete_previous_dataset_and_model(dataset_dir="plantvillage_dataset", model_path="plant_disease_model.pth"):
    """
    Deletes the previous dataset folder and model checkpoint file cleanly.
    """
    print("🧹 Cleaning previous dataset and model...")
    if os.path.exists(model_path):
        try:
            os.remove(model_path)
            print(f"  ✓ Deleted previous model file: '{model_path}'")
        except Exception as e:
            print(f"  ! Warning deleting model file: {e}")

    if os.path.exists(dataset_dir):
        try:
            shutil.rmtree(dataset_dir)
            print(f"  ✓ Deleted previous dataset directory: '{dataset_dir}'")
        except Exception as e:
            print(f"  ! Warning deleting dataset folder: {e}")

def download_or_setup_dataset(dataset_dir="plantvillage_dataset", force_clean=True):
    if force_clean:
        delete_previous_dataset_and_model(dataset_dir=dataset_dir)
        
    print("\n📦 Setting up new real PlantVillage Dataset...")
    target_color = os.path.join(dataset_dir, "color")
    os.makedirs(dataset_dir, exist_ok=True)
    
    download_success = False
    try:
        import kagglehub
        print("  Downloading official 38-class PlantVillage dataset from Kaggle...")
        path = kagglehub.dataset_download("abdallahalidev/plantvillage-dataset")
        print(f"  ✓ KaggleHub downloaded dataset to: {path}")
        
        found_color = None
        for root, dirs, files in os.walk(path):
            if os.path.basename(root) == "color" and len(dirs) >= 10:
                found_color = root
                break
            elif "plantvillage dataset" in root.lower() and "color" in dirs:
                found_color = os.path.join(root, "color")
                break
                
        if found_color and os.path.exists(found_color):
            print(f"  Copying real PlantVillage dataset to '{target_color}'...")
            shutil.copytree(found_color, target_color, dirs_exist_ok=True)
            download_success = True
        else:
            for root, dirs, files in os.walk(path):
                if len(dirs) >= 35:
                    print(f"  Copying classes from '{root}' to '{target_color}'...")
                    shutil.copytree(root, target_color, dirs_exist_ok=True)
                    download_success = True
                    break
    except Exception as e:
        print(f"  ! KaggleHub download error: {e}")

    if download_success and os.path.exists(target_color):
        subdirs = [d for d in os.listdir(target_color) if os.path.isdir(os.path.join(target_color, d))]
        total_imgs = sum(len(files) for root, dirs, files in os.walk(target_color))
        print(f"\n✅ New Real PlantVillage Dataset downloaded! Total classes: {len(subdirs)}, Total leaf images: {total_imgs}")
    else:
        print("\n❌ Dataset setup failed. Ensure kagglehub is installed (`pip install kagglehub`).")

if __name__ == "__main__":
    download_or_setup_dataset(force_clean=True)
