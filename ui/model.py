import PIL.Image
from torch import nn
import torch
from torch.optim import Adam
from torch.utils.data import DataLoader
import dataset
from torchvision.transforms import ToTensor
import os
import PIL
import matplotlib.pyplot as plt
import image_canny
import numpy as np
import cv2
# dodam samo za jira commit -> prvič sem naredil narobe
train = dataset.CustomDataset(root=r'D:\uni\ui\Umetna inteligenca\img2', csv_file=r'D:\uni\ui\Umetna inteligenca\output.csv', transform=ToTensor())
data  = DataLoader(train, batch_size=16)

class RainIdentifier(nn.Module):
    def __init__(self):
        super(RainIdentifier, self).__init__()
        self.model = nn.Sequential(
            nn.Conv2d(1, 32 , (3,3), padding=1),
            nn.BatchNorm2d(32),
            nn.MaxPool2d((2,2)),       
            nn.ReLU(),
            nn.Conv2d(32, 64 , (3,3), padding=1),
            nn.BatchNorm2d(64),
            nn.MaxPool2d((2,2)),
            nn.ReLU(),
            nn.Conv2d(64, 64 , (3,3), padding=1),
            nn.BatchNorm2d(64),
            nn.MaxPool2d((2,2)),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Flatten(),
            nn.Linear(64 * 60 * 60, 4)
        )
    def forward(self, x):
        return self.model(x)


#device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
clf = RainIdentifier().to('cpu')

# ONLY FOR EVALUATION - comment out in training
clf.load_state_dict(torch.load('model.pth'))
clf.eval()
#

opt = Adam(clf.parameters(), lr=0.001)
loss_fn = nn.CrossEntropyLoss()
classes = {0:'mid', 1:'high', 2:'not', 3:'drizzle'}

if __name__ == '__main__':
    #for epoch in range(10):
    #    for i, batch in enumerate(data):
    #        img , classification = batch
    #        img = img.to('cpu')
    #        classification = classification.to('cpu')
    #        print(f"Input tensor shape: {img.shape}")
    #        output = clf(img)
    #        loss = loss_fn(output, classification)
    #        opt.zero_grad()
    #        loss.backward()
    #        opt.step()
    #        print(f'Epoch: {epoch}, Batch: {i}, Loss: {loss.item()}')
    #torch.save(clf.state_dict(), 'model.pth')
    img = PIL.Image.open(r'D:\uni\ui\Umetna inteligenca\slikezaziher\slika26_high.png')
    img_original = img
    img = img.crop((0,0,480,480))
    
    img_canny = image_canny.to_canny_new(np.array(img))
    print(f"Shape of img_canny before ToTensor: {img_canny.shape}")
    img_tensor = ToTensor()(img_canny).unsqueeze(0)
    output = torch.argmax(clf(img_tensor))
    print("Klasifikacija slike: ",classes[output.item()])
    plt.subplot(1,2,1)
    plt.imshow(img_original)
    plt.subplot(1,2,2)
    plt.imshow(img_canny, cmap='gray')
    plt.show()
