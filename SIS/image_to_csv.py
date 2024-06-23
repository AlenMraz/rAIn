import csv
import os
import numpy as np
import projektna_naloga_2 as pn2

def image_to_csv(image, output_file):
    
    # hulls = pn2.get_convex_hull(image)
    classiffication = image.split('_')[-1].split('.')[0]
    # open csv file and write image name , classification and then hull values in format x1,y1,x2,y2,x3,y3...
    with open(output_file, mode='w') as file:
        writer = csv.writer(file)
        writer.writerow([os.path.basename(image), classiffication])

def folder_to_csv(folder, output_file):
    with open(output_file, mode='w',newline='') as file:
        for image in os.listdir(folder):
            classiffication = image.split('_')[-1].split('.')[0]
            writer = csv.writer(file)
            writer.writerow([os.path.basename(image), classiffication])
if __name__ == '__main__':
    folder_to_csv(r'D:\uni\ui\Umetna inteligenca\img2', 'output.csv')