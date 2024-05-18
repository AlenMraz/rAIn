import cv2

input_img = cv2.imread('meritev.png')
input_img = cv2.GaussianBlur(input_img, (3, 3), 0)
edge_image = cv2.cvtColor(input_img, cv2.COLOR_BGR2GRAY)
edge_image = cv2.Canny(edge_image, 100, 500)
cv2.imwrite("edge_image5.png", edge_image)  