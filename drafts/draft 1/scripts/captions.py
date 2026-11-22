"""scripts/words.json (forced alignment) -> src/captions.json: caption chunks in output frames."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
edl = json.loads((ROOT / "src/edl.json").read_text())
words = json.loads((ROOT / "scripts/words.json").read_text())
FPS, MAX = edl["fps"], 5
chunks, start = [], 0
for seg, ws in zip(edl["segments"], words):
    n = round((seg["out"] - seg["in"]) * FPS)
    phrases, cur = [], []
    for w in ws:
        cur.append(w)
        if re.search(r"[.,?!]$", w["w"]):
            phrases.append(cur); cur = []
    if cur:
        phrases.append(cur)
    merged = []  # glue 1-word phrases ("Honestly,") onto their neighbour when it stays short
    for ph in phrases:
        if merged and (len(ph) == 1 or len(merged[-1]) == 1) and len(merged[-1]) + len(ph) <= MAX:
            merged[-1] = merged[-1] + ph
        else:
            merged.append(ph)
    groups = []
    for ph in merged:
        k = -(-len(ph) // MAX)
        size = -(-len(ph) // k)
        groups += [ph[i:i + size] for i in range(0, len(ph), size)]
    for gi, g in enumerate(groups):
        nxt = groups[gi + 1][0]["a"] if gi + 1 < len(groups) else None
        end = min(g[-1]["b"] + 0.35, nxt) if nxt is not None else g[-1]["b"] + 0.35
        text = " ".join(w["w"] for w in g).rstrip(",")
        chunks.append({"from": start + round((g[0]["a"] - 0.04) * FPS), "to": min(start + round(end * FPS), start + n),
                       "text": text})
    start += n
(ROOT / "src/captions.json").write_text(json.dumps(chunks, indent=1))
print(len(chunks), "chunks;", "\n".join(f"{c['from']/FPS:5.2f} {c['text']}" for c in chunks))
