import numpy as np

W = 800
H = 600

n = 0.2
f = 20

fx = 800
fy = 800
ox = 400
oy = 400

Pc = np.array([0.3, -0.15, -6.0, 1.0])

# projection matrix
P = np.array([
    [2*fx/W, 0, 1-2*ox/W, 0],
    [0, 2*fy/H, 1-2*oy/H, 0],
    [0, 0, -(f+n)/(f-n), -2*f*n/(f-n)],
    [0, 0, -1, 0]
])

# camera point to clip coordinates
clip = P @ Pc

# clip coordinates to NDC
ndc = clip[:3] / clip[3]

# NDC to pixel coordinates
u = 0.5 * (ndc[0] + 1) * W
v = 0.5 * (ndc[1] + 1) * H

print("Projection matrix:")
print(P)

print("Clip coordinates:")
print(clip)

print("NDC:")
print(ndc)

print("Pixel coordinates:")
print(u, v)