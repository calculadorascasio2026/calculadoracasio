from PIL import Image
import os
from collections import deque

src = r"C:\Users\LisyAndy\.cursor\projects\c-Users-LisyAndy-Desktop-cursor-calculadorascasio\assets\c__Users_LisyAndy_AppData_Roaming_Cursor_User_workspaceStorage_870c3c533bab629cea99ed9925a67118_images_sello_de_garantia2-14185333-3056-463b-b8e0-aa5211551d23.png"
dst_dir = r"c:\Users\LisyAndy\Desktop\cursor\calculadorascasio\public\brand"
dst = os.path.join(dst_dir, "sello-eduardo-vinolo.png")
os.makedirs(dst_dir, exist_ok=True)

im = Image.open(src).convert("RGBA")
w, h = im.size
pixels = im.load()


def is_bg(r: int, g: int, b: int) -> bool:
    return r < 32 and g < 32 and b < 32


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
    r, g, b, a = pixels[x, y]
    if not is_bg(r, g, b):
        continue
    visited[y][x] = True
    pixels[x, y] = (0, 0, 0, 0)
    q.append((x + 1, y))
    q.append((x - 1, y))
    q.append((x, y + 1))
    q.append((x, y - 1))

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
        if r < 45 and g < 45 and b < 45:
            soft = False
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and pixels[nx, ny][3] == 0:
                    soft = True
                    break
            if soft:
                brightness = (r + g + b) / 3
                alpha = int(min(255, max(0, brightness * 7)))
                pixels[x, y] = (r, g, b, alpha)

im.save(dst, "PNG", optimize=True)
print("saved", dst, os.path.getsize(dst), Image.open(dst).mode)
