"""Widen intonation without touching timing (WORLD vocoder): every syllable stays where it was, so
lip sync is preserved. f0' = median * (f0/median)^k inside voiced regions.
usage: prosody.py in.wav out.wav k [shift_semitones]"""
import sys, subprocess
import numpy as np, pyworld as pw, soundfile as sf
from scipy.ndimage import median_filter

src, dst, k = sys.argv[1], sys.argv[2], float(sys.argv[3])
shift = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
x, fs = sf.read(src)
x = x.astype(np.float64)
f0, t = pw.harvest(x, fs, f0_floor=65, f0_ceil=330, frame_period=5.0)
sp = pw.cheaptrick(x, f0, t, fs)
ap = pw.d4c(x, f0, t, fs)
v = f0 > 0
lf = np.log2(np.where(v, f0, 1))
med = np.median(lf[v])
# expand around a slowly-moving baseline (~1.2 s) so phrase-level declination stays natural
base = median_filter(np.where(v, lf, med), size=241, mode="nearest")
base = med + 0.5 * (base - med)
new = np.where(v, 2 ** (base + k * (lf - base) + shift / 12), 0)
new = np.where(v, np.clip(new, 60, 380), 0)
y = pw.synthesize(new, sp, ap, fs, 5.0)
sf.write(dst, (y / max(1.0, np.abs(y).max() / 0.98)).astype(np.float32), fs)
def sd(a): a = a[a > 0]; return np.std(12 * np.log2(a / np.median(a)))
print(f"{src.split('/')[-1]}: pitch sd {sd(f0):.2f} -> {sd(new):.2f} st")
