import matplotlib.pyplot as plt
import numpy as np
from math import *
import csv

def find_pixels(img):
    white_pixels = np.where(img == 1)
    pixels = list(zip(white_pixels[0], white_pixels[1]))
    return pixels

def are_pixels_connected(img):
    pixels = find_pixels(img)
    if len(pixels) == 0:
        return False
    pixels.sort(key=lambda p: (p[1], -p[0]))
    visited = set()
    connected_components = []
    for pixel in pixels:
        if pixel not in visited:
            stack = [pixel]
            connected_component = set()
            while stack:           
                current_pixel = stack.pop()
                visited.add(current_pixel)
                connected_component.add(current_pixel)
                #desno, levo, gor, dol, desno gor, levo dol, desno dol, levo gor
                neighbors = [(current_pixel[0] - 1, current_pixel[1] + 1), (current_pixel[0] + 1, current_pixel[1] - 1), (current_pixel[0] - 1, current_pixel[1] - 1), (current_pixel[0] + 1, current_pixel[1] + 1), (current_pixel[0], current_pixel[1] - 1), (current_pixel[0], current_pixel[1] + 1), (current_pixel[0] - 1, current_pixel[1]), (current_pixel[0] + 1, current_pixel[1])]
                neighbors_count = 0 
                for neighbor in neighbors:
                    if neighbor in pixels and neighbor not in visited:
                        neighbors_count += 1
                        stack.append(neighbor)
            connected_components.append(connected_component)
    return connected_components


def quickhull(pts: list) -> list:
    convexHull = []
    left, right = min(pts), max(pts)
    convexHull.append(left)
    convexHull.append(right)
    upper = upperHull(left, right, pts)
    lower = upperHull(right, left, pts)
    
    convexHull.extend(upper)
    convexHull.extend(lower)
    return convexHull
    
def upperHull(a, b, pts):
    if len(pts) == 0:
        return []
    upperHullPoints = []
    resultPoints = []
    maxDistance = 0
    furthestPoint = []
    for p in pts:
        if isLeft(a, b, p):
            upperHullPoints.append(p)
            pDis = findDistance(a, b, p)
            if pDis > maxDistance:
                maxDistance = pDis
                furthestPoint = p
    if furthestPoint:
        resultPoints.append(furthestPoint)
        
    reg1 = upperHull(a, furthestPoint, upperHullPoints)
    reg2 = upperHull(furthestPoint, b, upperHullPoints)
    resultPoints.extend(reg1)
    resultPoints.extend(reg2)
    return resultPoints
def findDistance(a, b, p):
    ax, ay, bx, by = a[0], a[1], b[0], b[1]
    px, py = p[0], p[1]
    d = 0
    d = (abs(((bx - ax) * (ay - py)) - ((ax - px) * (by - ay)))) / sqrt((pow((bx - ax), 2)) + (pow((by - ay), 2)))
    return d
def isLeft(a, b, c) -> bool:
    ax, ay, bx, by, cx, cy = a[0], a[1], b[0], b[1], c[0], c[1]
    z = ((bx - ax) * (cy - ay)) - ((cx - ax) * (by - ay))
    if z > 0:
        return True
    else:
        return False 
    
def get_convex_hull(img):
    hulls = []
    connected_comps = are_pixels_connected(img)
    
    for comp in connected_comps:
        if len(comp) < 3:
            continue
        comp = list(comp)
        convex_hull = quickhull(comp)
        hulls.append(convex_hull)
        
    return hulls     
def paint_convex_hull(img):
    hulls = get_convex_hull(img)
        
    new_img = np.zeros(img.shape, dtype=np.float32)
    print("hulls:", hulls)
    for convex_hull in hulls:
        for pixel in convex_hull:
            new_img[pixel[0]][pixel[1]] = 1.0
    plt.imsave('output.png', new_img, cmap='gray')
    write_to_csv(hulls)
def write_to_csv(hulls):
    with open('output.csv', mode='w') as file:
        writer = csv.writer(file)
        writer.writerow([point for convex_hull in hulls for point in convex_hull])
if __name__ == '__main__':
    image = plt.imread('pn22.png').astype(np.float32)
    paint_convex_hull(image)
    