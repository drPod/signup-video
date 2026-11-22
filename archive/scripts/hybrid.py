"""Hybrid voice: real recording below 7 kHz (articulation stays true; the generative enhancer was
smearing consonants, e.g. "Gmail" -> "email"), enhancer output above 7 kHz (restored air).
usage: hybrid.py base.wav enhanced.wav out.wav"""
import sys, subprocess
import numpy as np, soundfile as sf
from scipy.signal import correlate, butter, sosfiltfilt

base, enh, out = sys.argv[1:4]
a, fs = sf.read(base); b, fb = sf.read(enh)
assert fs == fb == 44100
n = min(len(a), len(b))
a, b = a[:n], b[:n]
seg = slice(fs * 5, min(n, fs * 25))
r = correlate(b[seg], a[seg], mode="full", method="fft"); lag = int(r.argmax() - (len(a[seg]) - 1))
b = np.roll(b, -lag)
# conventional (non-generative) denoise of the base band, so nothing gets re-imagined
den = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(fs), "-ac", "1", "-i", "-", "-af", "afftdn=nr=14:nf=-42:tn=1",
                      "-f", "f32le", "-"], input=a.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
a = np.frombuffer(den, np.float32).astype(np.float64)[:n]
lo = butter(8, 7000, "low", fs=fs, output="sos"); hi = butter(8, 7000, "high", fs=fs, output="sos")
# match the enhancer's level to the base so the bands sit together
g = np.sqrt(np.mean(sosfiltfilt(lo, b) ** 2) / max(np.mean(sosfiltfilt(lo, a) ** 2), 1e-12))
y = sosfiltfilt(lo, a) * g + sosfiltfilt(hi, b)
sf.write(out, (y / max(1.0, np.abs(y).max() / 0.98)).astype(np.float32), fs)
print(out.split("/")[-1], "lag", lag, "gain %.2f" % g)
