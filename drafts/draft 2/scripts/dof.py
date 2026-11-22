"""Fake shallow depth of field. MediaPipe selfie segmentation gives a person matte (temporally smoothed,
feathered); the background gets a normalised-convolution blur so the subject doesn't halo into it,
plus slight darkening for separation. usage: dof.py in.mp4 out.mp4 [sigma_px_at_4k=3] [bg_gain=0.985]"""
import subprocess, sys, time
import numpy as np, cv2, mediapipe as mp

src, dst = sys.argv[1], sys.argv[2]
sigma = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
darken = float(sys.argv[4]) if len(sys.argv) > 4 else 0.985
W, H = 3840, 2160
q = 4 if sigma >= 8 else 1       # heavy blur: quarter res is fine; subtle blur must stay full res
w, h = W // q, H // q
seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1)
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30000/1001", "-i", "-",
                        "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "8", "-bf", "0", "-pix_fmt", "yuv420p", dst],
                       stdin=subprocess.PIPE)
prev, n, t0 = None, 0, time.time()
s = sigma / q
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    small = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    m = seg.process(cv2.resize(img, (1280, 720), interpolation=cv2.INTER_AREA)).segmentation_mask
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
    prev = m if prev is None else 0.6 * m + 0.4 * prev          # temporal smoothing against flicker
    a = np.clip((prev - 0.35) / 0.4, 0, 1)                       # firm up, then feather
    a = cv2.GaussianBlur(a, (0, 0), 2.0)
    bw = (1 - a) ** 2
    bg = cv2.GaussianBlur(small * bw[..., None], (0, 0), s) / np.maximum(cv2.GaussianBlur(bw, (0, 0), s), 1e-3)[..., None]
    bg = cv2.resize(bg * darken, (W, H), interpolation=cv2.INTER_LINEAR)
    A = cv2.resize(a, (W, H), interpolation=cv2.INTER_LINEAR)[..., None]
    out = img.astype(np.float32) / 255 * A + bg * (1 - A)
    enc.stdin.write((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    n += 1
    if n % 150 == 0:
        print(f"{n} frames, {n / (time.time() - t0):.1f} fps", flush=True)
enc.stdin.close(); enc.wait()
print("done", n, "frames")
