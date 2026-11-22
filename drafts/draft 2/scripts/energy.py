"""Per-sentence delivery stats for every take: pitch movement (semitone sd), loudness swing, pace."""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np, torch, torchaudio

TX = Path(sys.argv[1])
TAKES = {"C004": "A001_11181742_C004", "C011": "A001_11181800_C011", "C014": "A001_11181805_C014", "C017": "A001_11181814_C017"}
STARTS = [("S1 black box", ["honestly"]), ("S2 who is this", ["somebody", "would"], ["someone", "would"]),
          ("S3 ten tabs", ["have"]), ("S4 most days", ["most", "days"]), ("S5 don't think", ["don't", "even"]),
          ("S6 signs up/slack", ["signs"]), ("S7 CTO story", ["there", "was"]), ("S8 same day", ["reached"], ["reach"]),
          ("S9 part I love", ["this", "is", "the", "part"], ["that's", "the", "part"]), ("END", ["__never__"])]
def clean(w): return re.sub(r"[^a-z0-9']", "", w.lower())
for take, stem in TAKES.items():
    d = json.loads((TX / f"{stem}_w.json").read_text())
    ws = [(clean(s["text"]), s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000) for s in d["transcription"] if s["text"].strip()]
    idx = []
    pos = 0
    for name, *pats in STARTS:
        found = None
        for i in range(pos, len(ws)):
            for p in pats:
                if [w for w, _, _ in ws[i:i + len(p)]] == p:
                    found = i; break
            if found is not None: break
        idx.append(found)
        if found is not None: pos = found + 1
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(Path.home() / f"Downloads/{stem}.mov"), "-map", "0:a:0", "-ac", "1", "-ar", "16000",
                          "-f", "f32le", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32)
    print(f"== {take}")
    for k in range(len(STARTS) - 1):
        i0 = idx[k]
        if i0 is None: print(f"  {STARTS[k][0]:18s} missing"); continue
        i1 = next((x for x in idx[k + 1:] if x is not None), len(ws))
        if k == 0 and take == "C017": i0 = i0
        t0, t1 = ws[i0][1], ws[i1 - 1][2]
        seg = torch.from_numpy(a[int(t0 * 16000):int(t1 * 16000)].copy())
        f0 = torchaudio.functional.detect_pitch_frequency(seg[None], 16000, frame_time=0.02, win_length=15).numpy()[0]
        frame = 320; rms = np.array([np.sqrt(np.mean(seg[j:j + frame].numpy() ** 2)) for j in range(0, len(seg) - frame, frame)])
        voiced = rms > np.percentile(rms, 45)
        f0v = f0[:len(voiced)][voiced[:len(f0)]] if len(f0) else f0
        f0v = f0v[(f0v > 70) & (f0v < 300)]
        st_sd = float(np.std(12 * np.log2(f0v / np.median(f0v)))) if len(f0v) > 5 else float("nan")
        db = 20 * np.log10(rms[voiced] + 1e-6)
        print(f"  {STARTS[k][0]:18s} {t0:5.1f}-{t1:5.1f}s  pitch-sd {st_sd:4.2f} st  loud-swing {np.percentile(db,95)-np.percentile(db,20):4.1f} dB  "
              f"pace {(i1 - i0) / (t1 - t0):4.2f} w/s  level {np.mean(db):5.1f}")
