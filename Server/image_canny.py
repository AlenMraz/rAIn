import cv2
import os
def to_cannny(img):
    input_img = cv2.imread(img)
    input_img = cv2.Canny(input_img, 100, 300)
    cv2.imwrite(img, input_img)
def to_canny_new(img):
    input_img = img
    input_img = cv2.Canny(input_img, 100, 300)
    return input_img
def folder_to_canny(folder):
    for img in os.listdir(folder):
        to_cannny(os.path.join(folder, img))    
if __name__ == '__main__':
    folder_to_canny(r'D:\uni\ui\Umetna inteligenca\slike3')

