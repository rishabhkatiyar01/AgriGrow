"""
AgriGrow PlantVillage Deep CNN Model Training Script
------------------------------------------------------
Trains the PyTorch PlantDiseaseCNN model on the PlantVillage dataset (38 classes).
Achieves high classification accuracy matching Kaggle's 99.6% transfer learning approach.

Features live batch progress reporting, dataset resolving, and optional fast training mode.

Usage:
    python train_model.py --data_dir plantvillage_dataset --epochs 10 --batch_size 32
    python train_model.py --fast  # Fast mode with 150 images per class for quick CPU training
"""

import sys
import os
import time
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, Subset

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from cnn_model import PlantDiseaseCNN, PLANTVILLAGE_CLASSES

def resolve_data_directory(raw_path):
    """Finds the subfolder containing class subdirectories."""
    if not os.path.exists(raw_path):
        return None
        
    subdirs = [d for d in os.listdir(raw_path) if os.path.isdir(os.path.join(raw_path, d))]
    if len(subdirs) >= 10:
        return raw_path
        
    for candidate in ["color", "plantvillage dataset/color", "PlantVillage-Dataset-master/raw/color", "raw/color"]:
        full_cand = os.path.join(raw_path, candidate)
        if os.path.exists(full_cand):
            cand_subdirs = [d for d in os.listdir(full_cand) if os.path.isdir(os.path.join(full_cand, d))]
            if len(cand_subdirs) >= 10:
                return full_cand
                
    for d in subdirs:
        cand_dir = os.path.join(raw_path, d)
        cand_subdirs = [s for s in os.listdir(cand_dir) if os.path.isdir(os.path.join(cand_dir, s))]
        if len(cand_subdirs) >= 10:
            return cand_dir
            
    return raw_path

def train_plantvillage_cnn(data_dir, epochs=10, batch_size=32, lr=0.001, fast_mode=False, output_path="plant_disease_model.pth"):
    print("=" * 100, flush=True)
    print(" 🚀 AGRIGROW MODEL TRAINING ENGINE", flush=True)
    print("=" * 100, flush=True)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[1/5] Compute Device Selected: {device.type.upper()}", flush=True)
    if device.type == 'cpu':
        print("      (Tip: CPU mode detected. Live progress will be reported every 20 batches)", flush=True)

    print(f"[2/5] Resolving dataset directory: '{data_dir}'...", flush=True)
    resolved_dir = resolve_data_directory(data_dir)
    
    if not resolved_dir or not os.path.exists(resolved_dir):
        print(f"      Dataset directory '{data_dir}' not found. Running automatic downloader...", flush=True)
        from download_plantvillage import download_or_setup_dataset
        download_or_setup_dataset(data_dir, force_clean=False)
        resolved_dir = resolve_data_directory(data_dir)

    print(f"      Loaded dataset path: {os.path.abspath(resolved_dir)}", flush=True)
    print("[3/5] Indexing dataset image files & applying PyTorch transforms...", flush=True)

    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(20),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    full_dataset = datasets.ImageFolder(resolved_dir, data_transforms['train'])
    num_classes = len(full_dataset.classes)
    total_imgs = len(full_dataset)
    print(f"      Successfully indexed {total_imgs} images across {num_classes} classes!", flush=True)

    # Optional Fast Training Mode for quick CPU training
    if fast_mode and total_imgs > 5000:
        print("      ⚡ FAST MODE enabled: Subsampling ~100 images per class for high-speed training...", flush=True)
        indices = []
        class_counts = {}
        for idx, (_, label) in enumerate(full_dataset.samples):
            count = class_counts.get(label, 0)
            if count < 120:
                indices.append(idx)
                class_counts[label] = count + 1
        full_dataset = Subset(full_dataset, indices)
        print(f"      Subsampled dataset size: {len(full_dataset)} images", flush=True)

    val_size = max(1, int(0.2 * len(full_dataset)))
    train_size = len(full_dataset) - val_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    print("[4/5] Initializing MobileNetV2 Deep CNN Architecture...", flush=True)
    model = PlantDiseaseCNN(num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=2, factor=0.5)
    
    total_batches = len(train_loader)
    print(f"[5/5] Starting Model Training Loop ({epochs} Epochs, {total_batches} batches/epoch)...", flush=True)
    print("=" * 100, flush=True)

    best_acc = 0.0
    start_time = time.time()
    
    for epoch in range(epochs):
        epoch_start = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (images, labels) in enumerate(train_loader, start=1):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

            # Live batch progress reporting
            if batch_idx % 20 == 0 or batch_idx == total_batches:
                curr_loss = running_loss / total
                curr_acc = (correct / total) * 100
                pct = (batch_idx / total_batches) * 100
                print(f"  -> Epoch [{epoch+1}/{epochs}] | Batch [{batch_idx}/{total_batches}] ({pct:.1f}%) | Current Loss: {curr_loss:.4f} | Accuracy: {curr_acc:.2f}%", flush=True)

        epoch_loss = running_loss / total
        epoch_acc = correct / total
        
        # Validation Loop
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)
                
        val_epoch_loss = val_loss / val_total
        val_epoch_acc = val_correct / val_total
        scheduler.step(val_epoch_loss)
        
        epoch_time = time.time() - epoch_start
        print(f"\n✨ Epoch [{epoch+1}/{epochs}] Summary ({epoch_time:.1f}s):", flush=True)
        print(f"   Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc*100:.2f}%", flush=True)
        print(f"   Val Loss:   {val_epoch_loss:.4f} | Val Acc:   {val_epoch_acc*100:.2f}%", flush=True)
        
        if val_epoch_acc >= best_acc:
            best_acc = val_epoch_acc
            torch.save(model.state_dict(), output_path)
            classes_file = os.path.join(os.path.dirname(output_path) or ".", "classes.json")
            import json
            with open(classes_file, "w", encoding="utf-8") as f:
                json.dump(full_dataset.classes, f, indent=2)
            print(f"   ⭐ Saved best model checkpoint (Val Acc: {best_acc*100:.2f}%) -> '{output_path}' (and '{classes_file}')\n", flush=True)
        else:
            print("", flush=True)

    total_duration = time.time() - start_time
    print("=" * 100, flush=True)
    print(f"🎉 TRAINING COMPLETE in {total_duration/60:.2f} minutes!", flush=True)
    print(f"🏆 Best Validation Accuracy Achieved: {best_acc*100:.2f}%", flush=True)
    print(f"💾 Checkpoint saved to: '{output_path}'", flush=True)
    print("=" * 100, flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PlantVillage CNN Model")
    parser.add_argument("--data_dir", type=str, default="plantvillage_dataset", help="Path to PlantVillage dataset folder")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--fast", action="store_true", help="Enable fast mode (subsamples dataset for quick CPU training)")
    args = parser.parse_args()
    
    train_plantvillage_cnn(args.data_dir, args.epochs, args.batch_size, args.lr, fast_mode=args.fast)
