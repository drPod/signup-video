"""Forced-align scripts/script.json to each EDL segment (torchaudio MMS_FA) -> scripts/words.json.
Run with a python that has torch/torchaudio: ~/.venvs/enhance/bin/python scripts/align.py"""
import json, re, subprocess
from pathlib import Path
import numpy as np, torch, torchaudio

ROOT = Path(__file__).resolve().parent.parent
SRC = {"C011": "A001_11181800_C011.mov", "C017": "A001_11181814_C017.mov"}
edl = json.loads((ROOT / "src/edl.json").read_text())
texts = json.loads((ROOT / "scripts/script.json").read_text())
bundle = torchaudio.pipelines.MMS_FA
model, tok, aligner = bundle.get_model(with_star=False), bundle.get_tokenizer(), bundle.get_aligner()
SR = bundle.sample_rate
NUM = {"10": "ten"}

def norm(w):
    w = NUM.get(w.strip(",.?!"), w).lower().replace("-", "")
    w = {"x": "ex", "x,": "ex"}.get(w, w)
    return re.sub(r"[^a-z']", "", w)

out = []
for seg, text in zip(edl["segments"], texts):
    rate = edl.get("rate", 1.0); n = round((seg["out"] - seg["in"]) / rate * edl["fps"]); dur = n * rate / edl["fps"]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(seg["in"]), "-t", str(dur), "-i",
                          str(Path.home() / "Downloads" / SRC[seg["take"]]), "-map", "0:a:0", "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    wav = torch.from_numpy(np.frombuffer(raw, dtype=np.float32).copy())[None]
    shown = text.split()
    words = [norm(w) for w in shown]
    with torch.inference_mode():
        em, _ = model(wav)
    spans = aligner(em[0], tok(words))
    ratio = wav.size(1) / em.size(1) / SR
    out.append([{"w": s, "a": round(sp[0].start * ratio, 3), "b": round(sp[-1].end * ratio, 3)} for s, sp in zip(shown, spans)])
    print(seg["take"], " ".join(f"{d['w']}@{d['a']:.2f}" for d in out[-1]))
(ROOT / "scripts/words.json").write_text(json.dumps(out, indent=0))
