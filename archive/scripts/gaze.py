"""Per-frame gaze + head pose from MediaPipe FaceMesh (iris landmarks) -> scripts/gaze_<take>.json
gaze_x/gaze_y: iris offset from eye centre, in eye-widths (0 = centred). yaw: nose offset between eyes."""
import json, sys, subprocess
from pathlib import Path
import numpy as np, mediapipe as mp

ROOT = Path(__file__).resolve().parent.parent
take, src = sys.argv[1], sys.argv[2]
W, H, STEP = 1280, 720, 3
proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-vf", f"select='not(mod(n\\,{STEP}))',scale={W}:{H}", "-vsync", "0",
                         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False, refine_landmarks=True, max_num_faces=1)
out, i = [], 0
def eye(l, outer, inner, top, bot, iris):
    o, n, t, b, c = (np.array([l[k].x * W, l[k].y * H]) for k in (outer, inner, top, bot, iris))
    width = np.linalg.norm(n - o); mid = (o + n) / 2
    return (c[0] - mid[0]) / width, (c[1] - (t[1] + b[1]) / 2) / width, (b[1] - t[1]) / width
while True:
    buf = proc.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    r = mesh.process(img)
    t = i * STEP / 29.97; i += 1
    if not r.multi_face_landmarks:
        out.append({"t": t}); continue
    l = r.multi_face_landmarks[0].landmark
    lx, ly, lo = eye(l, 33, 133, 159, 145, 468)
    rx, ry, ro = eye(l, 263, 362, 386, 374, 473)
    # head yaw proxy: nose tip relative to the midpoint of the outer eye corners, in inter-ocular units
    a, b, nose = (np.array([l[k].x * W, l[k].y * H]) for k in (33, 263, 1))
    yaw = (nose[0] - (a[0] + b[0]) / 2) / np.linalg.norm(b - a)
    pitch = (nose[1] - (a[1] + b[1]) / 2) / np.linalg.norm(b - a)
    out.append({"t": round(t, 3), "gx": round((lx + rx) / 2, 4), "gy": round((ly + ry) / 2, 4), "open": round((lo + ro) / 2, 4),
                "yaw": round(float(yaw), 4), "pitch": round(float(pitch), 4)})
(ROOT / f"scripts/gaze_{take}.json").write_text(json.dumps(out))
ok = [o for o in out if "gx" in o]
print(take, len(out), "frames,", len(ok), "with face")
