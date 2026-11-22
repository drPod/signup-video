"""Bayer-dithered orange texture (brand: 'dithered pixels, not blobs') -> public/dither-*.png"""
import numpy as np
from PIL import Image
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / "public"
B = np.array([[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],
              [3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]]) / 64
def make(name, field, px=6, rgb=(216,107,35), alpha=255):
    h, w = field.shape
    t = np.tile(B, (h // 8 + 1, w // 8 + 1))[:h, :w]
    on = field > t
    img = np.zeros((h, w, 4), np.uint8); img[on] = (*rgb, alpha)
    Image.fromarray(img).resize((w * px, h * px), Image.NEAREST).save(OUT / name)
W, H = 1920 // 6, 1080 // 6
y, x = np.mgrid[0:H, 0:W]; y = y / H; x = x / W
# end card: a sunrise of pixels rising from the bottom edge
make("dither-bottom.png", np.clip((y - 0.45) / 0.55, 0, 1) ** 1.6 * (0.75 + 0.25 * np.sin(x * 9 + 1.3)))
# cutaway backdrop: faint corners
r = np.hypot(x - 0.5, (y - 0.5) * 0.75)
make("dither-corners.png", np.clip((r - 0.42) / 0.35, 0, 1) ** 1.4 * 0.7)
print("ok")
