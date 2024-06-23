import matplotlib.pyplot as plt
import albumentations as A
import scipy.ndimage as ndimage
import numpy as np
import random
import os
import cv2

def convolve(image, kernel):
    kernel = kernel[:,:,None]
    img = ndimage.convolve(image, kernel, mode='constant').squeeze()
    img = img/np.max(img)
    return img


transform = A.Compose([
    A.RandomCrop(width=480, height=480),
    A.HorizontalFlip(p=0.5),
    A.RandomRotate90(p=0.5)
])

kernel = np.array([[1,4,6,4,1], 
                   [4,18,26,18,4], 
                   [6,26,38,26,6], 
                   [4,18,26,18,4], 
                   [1,4,6,4,1]]) / 256


def augment_folder(folder, output_folder):
    for img in os.listdir(folder):
        image = cv2.imread(os.path.join(folder, img), cv2.IMREAD_GRAYSCALE).astype(np.float32)
        image_name = os.path.basename(img)
        for i in range(100):
            trasnformed = transform(image=image)
            transformed_image = trasnformed['image']
            transformed_image = np.clip(transformed_image, 0, 255).astype(np.uint8)
            cv2.imwrite(os.path.join(output_folder,('aug{}_'.format(i))+image_name), transformed_image)
if __name__ == '__main__':
    augment_folder(r'D:\uni\ui\Umetna inteligenca\slike2', r'D:\uni\ui\Umetna inteligenca\images')