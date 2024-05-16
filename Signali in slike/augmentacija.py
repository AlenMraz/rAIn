import matplotlib.pyplot as plt
import albumentations as A
import scipy.ndimage as ndimage
import numpy as np
import random
import cv2
import json

def convolve(image, kernel):
    kernel = kernel[:,:,None]
    img = ndimage.convolve(image, kernel, mode='constant').squeeze()
    img = img/np.max(img)
    return img


KEYPOINT_COLOR = (0, 255, 0) # Green

def vis_keypoints(image, keypoints, color=KEYPOINT_COLOR, diameter=10):
    image = image.copy()

    for (x, y) in keypoints:
        cv2.circle(image, (int(x), int(y)), diameter, color, -1)

    
    image = image.astype(np.float32) 

    plt.figure(figsize=(8, 8))
    plt.axis('off')
    plt.imshow(image)
    plt.show()

transform = A.Compose([
    
    A.RandomCrop(width=480, height=480),
    #A.ElasticTransform(alpha=700,sigma=25,p=1, keypoints=True),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(p=0.2),
    A.RandomGamma(p=0.2),
    A.RandomRotate90(p=0.5),
    
], keypoint_params=A.KeypointParams(format='xy',label_fields=['class_labels']) )
class_labels = []

kernel = np.array([[1,4,6,4,1],
                   [4,18,26,18,4],
                   [6,26,38,26,6],
                   [4,18,26,18,4],
                   [1,4,6,4,1]]) / 256



def main():
    image = plt.imread('slika2.png').astype(np.float32)

    with open('points1.json', 'r') as f:
        points_data = json.load(f)
        
    
    
    for i in range(100):
        
        counter = 0
        keypoints = []
        transformed_data = []
        class_labels=[]
        

        
        for item in points_data:
            original_width = item.get('original_width', 4000)  
            original_height = item.get('original_height', 3000)  
        
            labels = item.get('label', [])
            
            
            for label in labels:  
                counter = counter+1  
                
                
                points = label.get('points', [])
                
                for point in points:
                    class_labels.append(counter)
                    scaled_x = int((point[0] * original_width) / 100)
                    scaled_y = int((point[1] * original_height) / 100)
                    keypoints.append((scaled_x, scaled_y,))
        print(class_labels)

       
        transformed = transform(image=image, keypoints=keypoints, class_labels=class_labels)
        transformed_image = transformed['image']
        transformed_keypoints = transformed["keypoints"]
        transformed_class_labels = transformed['class_labels']
        

        if random.random() < 0.2:
            transformed_image = convolve(transformed_image, kernel)
            
        plt.imsave('images/image_aug_{}.png'.format(i), transformed_image)
        
        label_im = {}

        j = 0
        
        transformed_data.append({
            'image': 'images/image_aug_{}.png'.format(i),
            'id': i,
            'label':{}
            
        })

        vis_keypoints(transformed_image, transformed_keypoints)
        while(j < len(transformed_class_labels)):
            current_number = transformed_class_labels[j]
            arr=[]
            while transformed_class_labels[j] == current_number:
                scaled_x = transformed_keypoints[j][0] * 100 / 480
                scaled_y = transformed_keypoints[j][1] * 100 / 480
                arr.append((scaled_x, scaled_y))
                

                j += 1
                if(j == len(transformed_class_labels)):
                   break

            transformed_data[-1]['label'] ={
                    'points': arr,
                    'poligontables': 'RainDrop'
                }
                   

            
    
        with open('transformed_data_{}.json'.format(i), 'w') as outfile:
            json.dump(transformed_data, outfile, indent=4)

if __name__ == '__main__':
    main()