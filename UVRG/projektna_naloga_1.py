import numpy as np
import matplotlib.pyplot as plt

# PREBERI:
# funkcija tetraeder dela
# funkcija dodaj_tocke ne dela in manjka veliko
# funkcija main je prepisana iz ucilnice


# definiramo podatkovno strukturo, s katero bomo predstavili trikotnike
# podatkovna struktura hrani: indekse oglišč v seznamu točk in normalo trikotnika (VEDNO mora biti usmerjena izven objekta).

class Triangle:
    def __init__(self, vertices, normal):
        self.vertices = vertices  # seznam indeksov oglišč
        self.normal = normal  # normala trikotnika
    

def max_distance_point_line(v1, v2, x_min, x_max, y_min, y_max, z_min, z_max):
    # Seznam točk
    points = [x_min, x_max, y_min, y_max, z_min, z_max]

    # Izračunamo smerno vektorja daljice
    edge_1 = v2 - v1

    # Najdaljša razdalja in ustrezna točka
    max_distance = 0
    v3 = None

    # Gremo čez vsako točko in izračunamo razdaljo do daljice
    for point in points:
        # Izračunamo vektor med začetno točko daljice in točko
        v = point - v1
        # Izračunamo pravokotno projekcijo vektorja v na smerno os daljice
        projection_length = np.dot(v, edge_1) / np.dot(edge_1, edge_1)
        # Izračunamo razdaljo med točko in daljico
        distance = np.linalg.norm(v - projection_length * edge_1)
        # Posodobimo najdaljšo razdaljo in ustrezno točko, če je potrebno
        if distance > max_distance:
            max_distance = distance
            v3 = point

    return v3


def max_distance(x_min, x_max, y_min, y_max, z_min, z_max):
    x_distance = np.linalg.norm(x_max - x_min)
    y_distance = np.linalg.norm(y_max - y_min)
    z_distance = np.linalg.norm(z_max - z_min)

    # Ugotovimo, katera razdalja je največja
    max_distance = max(x_distance, y_distance, z_distance)

    # Določimo ekstremni točki glede na največjo razdaljo
    if max_distance == x_distance:
        v1, v2 = x_min, x_max
    elif max_distance == y_distance:
        v1, v2 = y_min, y_max
    else:
        v1, v2 = z_min, z_max

    return v1, v2

def tetraeder(pts):
    pts = np.array(pts)
    # pridobimo indekse po sortiranju po x, y, in z in nato urejen array
    sorted_by_x = pts[np.argsort(pts[:, 0])]
    sorted_by_y = pts[np.argsort(pts[:, 1])]
    sorted_by_z = pts[np.argsort(pts[:, 2])]

    # Poiščemo šest ekstremnih točk:
    # točko z minimalno koordinato X, točko z maksimalno koordinato X,
    # točko z minimalno koordinato Y, točko z maksimalno koordinato Y,
    # točko z minimalno koordinato Z in točko z maksimalno koordinato Z
    x_min = sorted_by_x[0]
    x_max = sorted_by_x[-1]
    y_min = sorted_by_y[0]
    y_max = sorted_by_y[-1]
    z_min = sorted_by_z[0]
    z_max = sorted_by_z[-1]

    # najdlje oddaljeni tocki tvorita prvi rob tetraedra
    P1, P2 = max_distance(x_min, x_max, y_min, y_max, z_min, z_max)
    # med štirimi preostalimi točkami poiščemo tisto, ki je od roba najbolj oddaljena
    P3 = max_distance_point_line(P1, P2, x_min, x_max, y_min, y_max, z_min, z_max)

    V1 = P2 - P1
    V2 = P3 - P1
    # vektorski produkt med robovi, da izracunamo normalo trikotnika
    V_n = np.cross(V1, V2)

    # določimo vektor Vp: P - P1, kjer je P poljubna točka iz množice, nato pa izračunamo absolutno vrednost skalarnega produkta V_n in V_p
    V_p = pts - P1
    V_np = np.abs(np.sum(V_n * V_p, axis=1))
    # Najdemo točko P4, ki je najbolj oddaljena od trikotnika, ki ga tvorita P1, P2 in P3
    P4 = pts[np.argmax(V_np)]

    return np.where(pts==P1)[0][0], np.where(pts==P2)[0][0], np.where(pts==P3)[0][0], np.where(pts==P4)[0][0]


def dodajanje_tock(pts, p1, p2, p3, p4):
    P1 = pts[p1]
    P2 = pts[p2]
    P3 = pts[p3]
    P4 = pts[p4]
    # ustvarimo sklad, na katerega bomo dodajali trikotnike
    triangle_stack = []
    triangle_updated = []
    #hull of edges
    hull_edge =[]
    hull_vertex = []
    
    #P1P2P3
    V1 = P2 - P1
    V2 = P3 - P1
    Vn = np.cross(V1, V2)
    V3 = P4 - P1
    o = np.dot(Vn, V3)
    if o > 0:
        Vn = -Vn
    triangle_P1P2P3 = Triangle(vertices=[p1, p2, p3], normal=Vn)
    triangle_stack.append(triangle_P1P2P3)
    
    #P1P2P4
    V1 = P2 - P1
    V2 = P4 - P1
    Vn = np.cross(V1, V2)
    V3 = P3 - P1
    o = np.dot(Vn, V3)
    if o > 0:
        Vn = -Vn
    triangle_P1P2P4 = Triangle(vertices=[p1, p2, p4], normal=Vn)
    triangle_stack.append(triangle_P1P2P4)
    
    #P1P3P4
    V1 = P3 - P1
    V2 = P4 - P1
    Vn = np.cross(V1, V2)
    V3 = P2 - P1
    o = np.dot(Vn, V3) 
    if o > 0:
        Vn = -Vn
    triangle_P1P3P4 = Triangle(vertices=[p1, p3, p4], normal=Vn)
    triangle_stack.append(triangle_P1P3P4)
    
    #P2P3P4
    V1 = P3 - P2
    V2 = P4 - P2
    Vn = np.cross(V1, V2)
    V3 = P1 - P2
    o = np.dot(Vn, V3) 
    if o > 0:
        Vn = -Vn
    triangle_P2P3P4 = Triangle(vertices=[p2, p3, p4], normal=Vn)
    triangle_stack.append(triangle_P2P3P4)
    for triangle in triangle_stack:
        hull_edge.extend([(triangle.vertices[0], triangle.vertices[1]),
                    (triangle.vertices[1], triangle.vertices[2]),
                    (triangle.vertices[2], triangle.vertices[0])])
        hull_vertex.extend([triangle.vertices[0], triangle.vertices[1], triangle.vertices[2]])
    while triangle_stack:
        current_triangle = triangle_stack.pop()

        max_scalar_product = -float("inf")
        max_point = None
        for i in range(0,len(pts)):
            if i not in hull_vertex:
                Vp = pts[i] - pts[current_triangle.vertices[0]]
                scalar_product = np.dot(Vp, current_triangle.normal)
                if scalar_product > max_scalar_product:
                    max_scalar_product = scalar_product
                    max_point = pts[i]
        if max_point is None:
            break
        max_point_index = np.where(pts==max_point)[0][0]
        # Če nobena točka ne da pozitivnega skalarnega produkta (trikotnik ne vidi nobene točke), smo s to iteracijo končali
        if max_scalar_product <= 0:
            continue

        # Pregledamo preostale trikotnike na skladu in poiščemo vse tiste, katerih normalni vektor da pozitivno vrednost skalarnega produkta z max točko.
        triangles_positive_scalar = []
        for cur_triangle in triangle_stack:
            Vp = max_point - pts[cur_triangle.vertices[0]]
            scalar_product = np.dot(Vp, cur_triangle.normal)
        
            if scalar_product > 0:
                triangles_positive_scalar.append(cur_triangle)
        
        # 1. Z nobenim trikotnikom na skladu nismo dobili pozitivnega skalarnega produkta.
        if not triangles_positive_scalar: 
            p1 = current_triangle.vertices[0]
            p2 = current_triangle.vertices[1]
            p3 = current_triangle.vertices[2]
            P1 = pts[p1]
            P2 = pts[p2]
            P3 = pts[p3]
            #P1P2P
            V1 = P2 - P1
            V2 = max_point - P1
            V3 = max_point - P3
            Vn = np.cross(V1, V2)
            o = np.dot(Vn, V3) 
            if o > 0:
                Vn = -Vn
            triangle_P1P2P = Triangle(vertices=[p1, p2, max_point_index], normal=Vn)
            triangle_stack.append(triangle_P1P2P)
            triangle_updated.append(triangle_P1P2P)
            
            #P1P3P
            V1 = P3 - P1
            V2 = max_point - P1
            V3 = max_point - P2
            Vn = np.cross(V1, V2)
            o = np.dot(Vn, V3) 
            if o > 0:
                Vn = -Vn
            triangle_P1P3P = Triangle(vertices=[p1, p3, max_point_index], normal=Vn)
            triangle_stack.append(triangle_P1P3P)
            triangle_updated.append(triangle_P1P3P)
            
            #P2P3P
            V1 = P3 - P2
            V2 = max_point - P2
            V3 = max_point - P1
            Vn = np.cross(V1, V2)
            o = np.dot(Vn, V3) 
            if o > 0:
                Vn = -Vn
            triangle_P2P3P = Triangle(vertices=[p2, p3, max_point_index], normal=Vn)
            triangle_stack.append(triangle_P2P3P)
            triangle_updated.append(triangle_P2P3P)
            
            # hull_edge.extend([(p1, max_point_index), (p2, max_point_index), (p3, max_point_index)])
            for triangle in triangle_updated:
                hull_edge.extend([(triangle.vertices[0], triangle.vertices[1]),
                    (triangle.vertices[1], triangle.vertices[2]),
                    (triangle.vertices[2], triangle.vertices[0])])
            hull_vertex.append(max_point_index)
            triangle_updated = []
    
        # 2. Vsaj en trikotnik na skladu nam je dal pozitiven skalarni produkt. 
        else:  
            # Definiramo slovar, kjer indeks roba predstavlja ključ, število pojavitev pa vrednost. 
            edge_count = {}
            # V slovar vstavimo robove vseh trikotnikov, ki so nam dali pozitiven skalarni produkt. 
            for cur_triangle in triangles_positive_scalar:  
                edge_count[(cur_triangle.vertices[0], cur_triangle.vertices[1])] = edge_count.get((cur_triangle.vertices[0], cur_triangle.vertices[1]), 0) + 1
                edge_count[(cur_triangle.vertices[1], cur_triangle.vertices[2])] = edge_count.get((cur_triangle.vertices[1], cur_triangle.vertices[2]), 0) + 1
                edge_count[(cur_triangle.vertices[2], cur_triangle.vertices[0])] = edge_count.get((cur_triangle.vertices[2], cur_triangle.vertices[0]), 0) + 1
            new_edges = []
            for edge, count in edge_count.items():
                # Robove, ki se pojavijo več kot enkrat odstranimo z izbočene lupine. Prav tako z izbočene lupine odstranimo vse točke, ki smo jim odstranili vse robove.
                if count > 1:
                    hull_edge.remove(edge)
                if count == 1 and edge not in new_edges:
                    new_edges.append(edge)
            for vertex in hull_vertex:
                if vertex not in edge_count.keys():
                    hull_vertex.remove(vertex)   
                    
        # Nato poiščemo vse robove, katerih obe oglišči pripadata robovom ki se pojavijo samo enkrat. 
        # Iz le-teh tvorimo nove robove in trikotnike z novo točko, enako kot v primeru 1. 
        #FIXME: dela ce je len = 3 vse vec absolutno ne
            new_vertecies = []
            for edge in hull_edge:
                for v in edge:
                    if v not in new_vertecies:
                        new_vertecies.append(v)
            if len(new_vertecies) == 0:
                break
            for i in range(0, len(new_vertecies)):
                P1 = pts[new_vertecies[i]]
                P2 = pts[new_vertecies[(i+1)%len(new_vertecies)]]
                P3 = pts[new_vertecies[(i+2)%len(new_vertecies)]]
                V1 = P2 - P1
                V2 = max_point - P1
                V3 = max_point - P3
                Vn = np.cross(V1, V2)
                o = np.dot(Vn, V3)
                if o > 0:
                    Vn = -Vn
                triangle = Triangle(vertices=[new_vertecies[i], new_vertecies[(i+1)%len(new_vertecies)], max_point_index], normal=Vn)
                triangle_stack.append(triangle)
                triangle_updated.append(triangle)   
            
            for triangle in triangle_updated:
                hull_edge.extend([(triangle.vertices[0], triangle.vertices[1]),
                    (triangle.vertices[1], triangle.vertices[2]),
                    (triangle.vertices[2], triangle.vertices[0])])
            hull_vertex.append(max_point_index)
            triangle_updated = []
                
            
            # Na koncu iteracije odstranimo vse trikotnike, ki so nam dali pozitiven skalarni produkt s sklada.
            for tri in triangles_positive_scalar:
                if tri in triangle_stack:
                    triangle_stack.remove(tri)
                    edges = [
                        (tri.vertices[0], tri.vertices[1]),
                        (tri.vertices[1], tri.vertices[2]),
                        (tri.vertices[2], tri.vertices[0]),
                    ]
                    for edge in edges:
                        if edge in hull_edge:
                            hull_edge.remove(edge)
        # print("current_triangle:",current_triangle.vertices)
        hull_edge.remove((current_triangle.vertices[0], current_triangle.vertices[1]))
        hull_edge.remove((current_triangle.vertices[1], current_triangle.vertices[2]))
        hull_edge.remove((current_triangle.vertices[2], current_triangle.vertices[0]))       
    return hull_edge


def QuickHull3d(pts):
    P1, P2, P3, P4 = tetraeder(pts) 
    return dodajanje_tock(pts, P1, P2, P3, P4)
def plotHull(pts, hull):
    fig = plt.figure()
    ax = plt.axes(projection="3d")
    for i in range(0, len(hull)):
        ax.plot3D(
            [pts[hull[i][0]][0], pts[hull[i][1]][0]],
            [pts[hull[i][0]][1], pts[hull[i][1]][1]],
            [pts[hull[i][0]][2], pts[hull[i][1]][2]],
            "gray",
        )

    ax.scatter3D(
        pts[:, 0],
        pts[:, 1],
        pts[:, 2],
        color="black",
    )
    plt.show()
if __name__ == "__main__":
    np.random.seed(1)
    pts = np.random.normal(scale=2.0, size=(10, 3))
    print (pts)
    hull = QuickHull3d(pts)
    fig = plt.figure()
    ax = plt.axes(projection="3d")

    for i in range(0, len(hull)):
        ax.plot3D(
            [pts[hull[i][0]][0], pts[hull[i][1]][0]],
            [pts[hull[i][0]][1], pts[hull[i][1]][1]],
            [pts[hull[i][0]][2], pts[hull[i][1]][2]],
            "gray",
        )

    ax.scatter3D(
        pts[:, 0],
        pts[:, 1],
        pts[:, 2],
        c=np.linspace(0, pts.shape[0], num=pts.shape[0], endpoint=False),
        cmap="Greens",
    )

    plt.show()