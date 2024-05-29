import torch
import pandas as pd
import os
import ast
import numpy as np
from skimage import io, transform
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, utils
import matplotlib.pyplot as plt

class CustomDataset(Dataset):
    def __init__(self, root, csv_file, transform=None):
        """
        Arguments:
            csv_file (string): Path to the csv file with annotations.
            root (string): Directory with all the images.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root = root
        self.transform = transform
        self.landmarks = pd.read_csv(csv_file)
        self.transform = transform
        self.classes = {'mid':0, 'high':1, 'not':2, 'drizzle':3}
    def __len__(self):
        return len(self.landmarks)
    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()
        img_name = os.path.join(self.root, self.landmarks.iloc[idx,0])
        img = io.imread(img_name)
        # print(type(img))
        classification = self.classes[self.landmarks.iloc[idx, 1]]
        # sample = {'image': img, 'classification': classification} 
        # if self.transform:
        #     sample = self.transform(sample)
        if self.transform:
            img = self.transform(img)
            classification = torch.tensor(int(classification))
            
        return img, classification
