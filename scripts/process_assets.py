import os
import glob
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

BRAIN_DIR = r"C:\Users\kaled\.gemini\antigravity-ide\brain\860ed9c0-93c4-4230-b84d-c4d0eb53c1ce"
PUBLIC_DIR = r"c:\Users\kaled\OneDrive\Desktop\Build Next.js Landing Page (1)\public"

os.makedirs(PUBLIC_DIR, exist_ok=True)

def find_latest(pattern):
    files = glob.glob(os.path.join(BRAIN_DIR, pattern))
    if not files:
        raise FileNotFoundError(f"No file matching {pattern}")
    files.sort(key=os.path.getmtime)
    return files[-1]

def process_plate(src_path, dest_path, is_back=False):
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    
    # Plates in generated images are centered circles
    # Let's inspect center and radius
    # Find plate boundary by looking at brightness change from white border
    arr = np.array(img.convert("L"))
    # The plate has a rim. In plate_top, rim is gold/darker around radius ~320-330 for 1024x1024
    # Let's check plate center and radius
    cx, cy = w / 2, h / 2
    
    # We can create a high-res antialiased circular mask
    mask = Image.new("L", (w * 2, h * 2), 0)
    draw = ImageDraw.Draw(mask)
    
    if is_back:
        # plate back radius
        radius = w * 0.405 * 2
    else:
        # plate top radius
        radius = w * 0.322 * 2
        
    draw.ellipse((cx * 2 - radius, cy * 2 - radius, cx * 2 + radius, cy * 2 + radius), fill=255)
    mask = mask.resize((w, h), Image.Resampling.LANCZOS)
    
    img.putalpha(mask)
    
    # Crop to plate bounding box with slight margin
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        # Pad slightly to square
        max_dim = max(cropped.width, cropped.height) + 16
        square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
        square.paste(cropped, ((max_dim - cropped.width) // 2, (max_dim - cropped.height) // 2))
        img = square
        
    img = img.resize((600, 600), Image.Resampling.LANCZOS)
    img.save(dest_path, "WEBP", quality=90)
    print(f"Saved plate: {dest_path} {img.size}")

def process_item(src_path, dest_path):
    img = Image.open(src_path).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    h, w, _ = arr.shape
    
    # Distance from pure white
    dist_white = np.sqrt(np.sum((255.0 - arr)**2, axis=2))
    diff_max_min = np.max(arr, axis=2) - np.min(arr, axis=2)
    
    # Shadow has low saturation (diff_max_min is small) and is relatively bright
    # Also background itself has dist_white < 35
    is_shadow_or_bg = ((dist_white < 185) & (diff_max_min < 42)) | (dist_white < 38)
    
    # Flood fill from borders to only remove background and cast shadows attached to background
    visited = np.zeros((h, w), dtype=bool)
    from collections import deque
    queue = deque()
    for x in range(w):
        queue.append((0, x))
        queue.append((h-1, x))
        visited[0, x] = True
        visited[h-1, x] = True
    for y in range(h):
        queue.append((y, 0))
        queue.append((y, w-1))
        visited[y, 0] = True
        visited[y, w-1] = True

    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if is_shadow_or_bg[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))

    alpha = (~visited).astype(np.uint8) * 255
    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(1.0))
    res = img.convert("RGBA")
    res.putalpha(alpha_img)
    
    bbox = res.getbbox()
    if bbox:
        cropped = res.crop(bbox)
        max_dim = max(cropped.width, cropped.height) + 16
        square = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
        square.paste(cropped, ((max_dim - cropped.width) // 2, (max_dim - cropped.height) // 2))
        res = square
        
    res = res.resize((480, 480), Image.Resampling.LANCZOS)
    res.save(dest_path, "WEBP", quality=90)
    print(f"Saved clean item: {dest_path}")


if __name__ == "__main__":
    process_plate(find_latest("plate_top_raw*.jpg"), os.path.join(PUBLIC_DIR, "plate-top.webp"), is_back=False)
    process_plate(find_latest("plate_back_raw*.jpg"), os.path.join(PUBLIC_DIR, "plate-back.webp"), is_back=True)
    
    items = [
        ("tomato", "tomato_raw*.jpg"),
        ("cucumber", "cucumber_raw*.jpg"),
        ("carrot", "carrot_raw*.jpg"),
        ("bell-pepper", "bell_pepper_raw*.jpg"),
        ("broccoli", "broccoli_raw*.jpg"),
        ("lemon", "lemon_raw*.jpg"),
        ("avocado", "avocado_raw*.jpg"),
        ("pomegranate", "pomegranate_raw*.jpg"),
        ("orange", "orange_raw*.jpg"),
        ("basil", "basil_raw*.jpg"),
    ]
    
    for name, pat in items:
        process_item(find_latest(pat), os.path.join(PUBLIC_DIR, f"{name}.webp"))
