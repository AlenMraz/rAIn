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

    return P1, P2, P3, P4


def dodajanje_tock(pts, P1, P2, P3, P4):

    # ustvarimo sklad, na katerega bomo dodajali trikotnike
    triangle_stack = []

    # TODO: TO VSE PONOVIMO ZA SE TRI DRUGE TRIKOTNIKE???
    # Ustvarimo štiri instance strukture trikotnik, ki bodo predstavljali lica začetnega tetraedra
    # Normalo trikotnika ΔP1P2P3 določimo s pomočjo točke P4 takole: Vn=V1×V2,V3=P4−P1,o=Vn⋅V3⋅V
    V1 = P2 - P1
    V2 = P3 - P1
    Vn = np.cross(V1, V2)
    V3 = P4 - P1
    o = np.dot(Vn, V3) * Vn
    # V primeru, ko je spremenljivka o večja od 0, moramo vektor normale obrniti, torej  Vn=−Vn
    if o > 0:
        Vn = -Vn
    # Ustvarimo strukturo trikotnik z izračunanimi vrednostmi
    triangle_P1P2P3 = Triangle(vertices=[P1, P2, P3], normal=Vn)
    # Dodamo trikotnik na sklad
    triangle_stack.append(triangle_P1P2P3)

    # Dokler sklad ni prazen, dodajamo nove točke v izbočeno lupino po naslednjem postopku
    # Vzamemo trikotnik s sklada. Poiščemo točko, ki nam da največjo vrednost skalarnega produkta z normalo trikotnika
    # (POZOR: tukaj ne računamo absolutne vrednosti skalarnega produkta!)
    #  Ponovno, če imamo ΔP1P2P3 in točko P, določimo vektor Vp=P−P1 in izračunamo skalarni produkt kot Vp⋅Vn
    #  Če nobena točka ne da pozitivnega skalarnega produkta (trikotnik ne vidi nobene točke), smo s to iteracijo končali.
    # Dokler sklad ni prazen, dodajamo nove točke v izbočeno lupino po naslednjem postopku
    while triangle_stack:
        # Vzamemo trikotnik s sklada
        current_triangle = triangle_stack.pop()

        # Poiščemo točko, ki nam da največjo vrednost skalarnega produkta z normalo trikotnika
        # Največja vrednost skalarnega produkta
        max_scalar_product = -float("inf")
        max_point = None
        for point in pts:
            # Določimo vektor od ene točke trikotnika do trenutne točke
            Vp = point - current_triangle.vertices[0]
            # Izračunamo skalarni produkt med vektorjem Vp in normalo trikotnika
            scalar_product = np.dot(Vp, current_triangle.normal)
            # Posodobimo največjo vrednost in točko, če je potrebno
            if scalar_product > max_scalar_product:
                max_scalar_product = scalar_product
                max_point = point

        # Če nobena točka ne da pozitivnega skalarnega produkta (trikotnik ne vidi nobene točke), smo s to iteracijo končali
        if max_scalar_product <= 0:
            continue

        # Pregledamo preostale trikotnike na skladu in poiščemo vse tiste, katerih normalni vektor da pozitivno vrednost skalarnega produkta z max točko.
        triangles_positive_scalar = []
        for cur_triangle in triangle_stack:
            Vp = max_point - cur_triangle.vertices[0]
            scalar_product = np.dot(Vp, cur_triangle.normal)
        
            if scalar_product > 0:
                triangles_positive_scalar.append(cur_triangle)
        
        # TODO: 1. Z nobenim trikotnikom na skladu nismo dobili pozitivnega skalarnega produkta.
        if not triangles_positive_scalar:
            # vsako tocko trikotnika current_triangle povezemo z max_point točko in tvorimo nove robove. Tvorimo nove trikotnike ΔP1P2P,ΔP1P3P,ΔP2P3P
            # Njihove normale izračunamo s pomočjo neuporabljene točke izbranega trikotnika (normala mora vedno kazati izven objekta).
            # Za vsako točko trenutnega trikotnika povežemo z max_point točko
            for vertex in current_triangle.vertices:
                # Izračunamo vektorje V1 in V2
                v1 = current_triangle.next_vertex(vertex) - vertex
                v2 = max_point - vertex

                # Izračunamo normalo za nov trikotnik
                Vn = np.cross(v1, v2)
                v3 = max_point - vertex
                o = np.dot(Vn, v3) * Vn
                # V primeru, ko je spremenljivka o večja od 0, moramo vektor normale obrniti
                if o > 0:
                    Vn = -Vn

                # Ustvarimo nov trikotnik z uporabo trenutnega oglišča, naslednjega oglišča v trenutnem trikotniku in max_point točke
                new_triangle = Triangle(vertices=[vertex, current_triangle.next_vertex(vertex), max_point], normal=Vn)
                
                # Dodamo nov trikotnik v seznam novih trikotnikov
                triangle_stack.append(new_triangle)
            
        # 2. Vsaj en trikotnik na skladu nam je dal pozitiven skalarni produkt. 
        else:
            # Definiramo slovar, kjer indeks roba predstavlja ključ, število pojavitev pa vrednost. 
            edge_count = {}
            # V slovar vstavimo robove vseh trikotnikov, ki so nam dali pozitiven skalarni produkt. 
            for cur_triangle in triangles_positive_scalar:
                # TODO: Ob vsaki ponovitvi povečamo števec pojavitev tega roba. Robove nato ločimo v dve skupini: 
            
            # TODO: 
            for edge in edge_count.items():
                # Robove, ki se pojavijo več kot enkrat odstranimo z izbočene lupine. Prav tako z izbočene lupine odstranimo vse točke, ki smo jim odstranili vse robove.
                if count > 1:
                    
        # TODO: Nato poiščemo vse robove, katerih obe oglišči pripadata robovom ki se pojavijo samo enkrat. 
        # Iz le-teh tvorimo nove robove in trikotnike z novo točko, enako kot v primeru 1. 
        new_edges = []
        for edge, count in edge_count.items():
            if count == 1:
                new_edges.append(edge)
        
        # Na koncu iteracije odstranimo vse trikotnike, ki so nam dali pozitiven skalarni produkt s sklada.
        for tri in triangles_positive_scalar:
            if tri in triangle_stack:
                triangle_stack.remove(tri)
        
        # TODO: vrnemo novo dodane tocke???
        return


def QuickHull3d(pts):
    
    P1, P2, P3, P4 = tetraeder(pts) 

    dodajanje_tock(pts, P1, P2, P3, P4)

    # TODO: kaj bi morala funkcija vracat?
    return P1, P2, P3, P4


if __name__ == "__main__":
    pts = np.random.normal(scale=2.0, size=(15, 3))
    hull = QuickHull3d(pts)
    fig = plt.figure()
    ax = plt.axes(projection="3d")

    for i in range(0, len(hull), 2):
        ax.plot3D(
            [pts[hull[i], 0], pts[hull[i + 1], 0]],
            [pts[hull[i], 1], pts[hull[i + 1], 1]],
            [pts[hull[i], 2], pts[hull[i + 1], 2]],
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