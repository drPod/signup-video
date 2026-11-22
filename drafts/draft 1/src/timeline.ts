import edl from "./edl.json";
import words from "./words.json";

export const FPS = edl.fps;
export type Take = "C011" | "C017";
export type Seg = { take: Take; in: number; out: number; frames: number; start: number; words: { w: string; a: number; b: number }[] };

let cursor = 0;
export const SEGS: Seg[] = edl.segments.map((s, i) => {
  const frames = Math.round((s.out - s.in) * FPS);
  const seg = { ...s, take: s.take as Take, frames, start: cursor, words: words[i] };
  cursor += frames;
  return seg;
});
export const SPEECH_END = cursor;
export const END_CARD = Math.round(edl.endCardSeconds * FPS);
export const TOTAL = SPEECH_END + END_CARD;

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
/** Output frame where `word` (nth occurrence) starts in segment `seg`. */
export const at = (seg: number, word: string, nth = 0): number => {
  const hits = SEGS[seg].words.filter((x) => clean(x.w) === clean(word));
  const hit = hits[nth];
  if (!hit) throw new Error(`word ${word} #${nth} not in segment ${seg}`);
  return SEGS[seg].start + Math.round(hit.a * FPS);
};
export const segEnd = (seg: number) => SEGS[seg].start + SEGS[seg].frames;
