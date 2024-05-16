import matplotlib.pyplot as plt
import albumentations as A
import scipy.ndimage as ndimage
import numpy as np
import random

def convolve(image, kernel):
    kernel = kernel[:,:,None]
    img = ndimage.convolve(image, kernel, mode='constant').squeeze()
    img = img/np.max(img)
    return img


transform = A.Compose([
    A.RandomCrop(width=480, height=480),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.2),
    A.RandomGamma(p=0.2),
    A.Blur(p=0.2),
    A.RandomRotate90(p=0.5)
])

kernel = np.array([[1,4,6,4,1],
                   [4,18,26,18,4],
                   [6,26,38,26,6],
                   [4,18,26,18,4],
                   [1,4,6,4,1]]) / 256

if __name__ == '__main__':
    image = plt.imread('test.png').astype(np.float32)
    for i in range(100):
        trasnformed = transform(image=image)
        transformed_image = trasnformed['image']
        if random.random() < 0.2:
            transformed_image = convolve(transformed_image, kernel)
        plt.imsave('images/image_aug_{}.png'.format(i), transformed_image)