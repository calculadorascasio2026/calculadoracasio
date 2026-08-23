from PIL import Image
import os
from collections import deque

src = r"C:\Users\LisyAndy\.cursor\projects\c-Users-LisyAndy-Desktop-cursor-calculadorascasio\assets\c__Users_LisyAndy_AppData_Roaming_Cursor_User_workspaceStorage_870c3c533bab629cea99ed9925a67118_images_image-19454411-fcff-4136-976f-5ace1fd48adc.png"
dst = r"c:\Users\LisyAndy\Desktop\cursor\calculadorascasio\public\brand\sello-classwiz.png"
os.makedirs(os.path.dirname(dst), exist_ok=True)

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()


def is_bg(r: int, g: int, b: int) -> bool:
    # outer canvas is near-white
    return r > 245 and g > 245 and b > 245


visited = [[False] * w for _ in range(h)]
q: deque[tuple[int, int]] = deque()
for x in range(w):
    q.append((x, 0))
    q.append((x, h - 1))
for y in range(h):
    q.append((0, y))
    q.append((w - 1, y))

while q:
    x, y = q.popleft()
    if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
        continue
    r, g, b, a = px[x, y]
    if not is_bg(r, g, b):
        continue
    visited[y][x] = True
    px[x, y] = (0, 0, 0, 0)
    q.append((x + 1, y))
    q.append((x - 1, y))
    q.append((x, y + 1))
    q.append((x, y - 1))

# Soft fringe on near-white edge touching transparent
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        if r > 235 and g > 235 and b > 235:
            soft = False
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                    soft = True
                    break
            if soft:
                # fade fringe; don't punch the white interior of the seal
                dist_white = min(255 - r, 255 - g, 255 - b)
                if dist_white < 8:
                    alpha = int(max(0, 40 - dist_white * 5))
                    px[x, y] = (r, g, b, alpha)

im.save(dst, "PNG", optimize=True)
out = Image.open(dst)
print("saved", dst, os.path.getsize(dst), out.mode, out.size)
print("corner", out.getpixel((0, 0)), "center", out.getpixel((out.size[0] // 2, out.size[1] // 2)))
