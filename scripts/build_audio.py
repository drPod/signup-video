"""Cut the EDL segments from the voice takes and master them -> public/voice.wav.
AUDIO=raw uses the camera audio instead of the resemble-enhance output."""
import json, os, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
edl = json.loads((ROOT / "src/edl.json").read_text())
kind = os.environ.get("AUDIO", "enhanced")
fps, fade, rate = edl["fps"], 0.012, edl.get("rate", 1.0)
inputs, parts = [], []
for i, s in enumerate(edl["segments"]):
    dur = round((s["out"] - s["in"]) / rate * fps) * rate / fps
    inputs += ["-i", str(ROOT / f"audio/{s['take']}-{kind}.wav")]
    parts.append(f"[{i}:a]atrim={s['in']}:{s['in'] + dur},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d={fade},afade=t=out:st={dur - fade}:d={fade}[s{i}]")
n = len(edl["segments"])
chain = ("".join(f"[s{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1," + (f"atempo={rate}," if rate != 1 else "") +
         "highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.5:g=1.5,"
         "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=2,"
         f"apad=pad_dur={edl['endCardSeconds']},"
         "loudnorm=I=-13:TP=-1.5:LRA=7,aresample=48000[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(parts) + ";" + chain,
                "-map", "[out]", "-ac", "2", "-c:a", "pcm_s16le", str(ROOT / "public/voice.wav")], check=True)
print("wrote public/voice.wav from", kind)
