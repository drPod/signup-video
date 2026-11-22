import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, expo, mono, SANS, SPEAKER } from "./brand";
import captions from "./captions.json";
import { FOOTAGE, FPS, RATE, Seg } from "./timeline";

// ---------- camera ----------
type Framing = { scale: number; ox: number; oy: number };
export const FRAMES: Record<string, Framing> = {
  wide: { scale: 1.0, ox: 0.6, oy: 0.22 },
  medium: { scale: 1.28, ox: 0.6, oy: 0.2 },
  close: { scale: 1.62, ox: 0.6, oy: 0.17 },
  side: { scale: 1.3, ox: 0.5, oy: 0.3 },
  sideClose: { scale: 1.62, ox: 0.54, oy: 0.3 },
};
export type Key = { at: number; f: keyof typeof FRAMES; still?: boolean };

/** One continuous piece of a take. `keys` are absolute output frames where the framing cuts. */
export const Shot: React.FC<{ seg: Seg; keys: Key[] }> = ({ seg, keys }) => (
  <Sequence from={seg.start} durationInFrames={seg.frames} layout="none">
    <ShotInner seg={seg} keys={keys} />
  </Sequence>
);

const ShotInner: React.FC<{ seg: Seg; keys: Key[] }> = ({ seg, keys }) => {
  const local = useCurrentFrame();
  const abs = seg.start + local;
  const idx = Math.max(0, keys.findLastIndex((k) => k.at <= abs));
  const k = keys[idx];
  const kEnd = keys[idx + 1]?.at ?? seg.start + seg.frames;
  const fr = FRAMES[k.f];
  // slow push-in within each framing: barely perceptible, keeps the frame alive
  const push = k.still ? 1 : 1 + 0.03 * Math.min(1, (abs - k.at) / Math.max(1, kEnd - k.at));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${fr.scale * push})`, transformOrigin: `${fr.ox * 100}% ${fr.oy * 100}%` }}>
        <OffthreadVideo
          src={staticFile(`${FOOTAGE}/${seg.take}.mp4`)}
          trimBefore={Math.round(seg.in * FPS)}
          muted
          playbackRate={RATE}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {/* soft vignette for depth and caption legibility */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(20,13,9,0.32) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- lower third ----------
export const LowerThird: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: expo });
  const out = interpolate(f, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = interpolate(f, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  return (
    <div style={{ position: "absolute", left: 96, bottom: 190, opacity: p * out, zIndex: 20,
      transform: `translateX(${(1 - p) * -16}px)`, textShadow: "0 1px 18px rgba(20,13,9,0.45)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 5, height: 62, background: C.orange, borderRadius: 2, transform: `scaleY(${bar})` }} />
        <div>
          <div style={{ fontFamily: SANS, fontSize: 54, fontWeight: 450 as never, color: C.paper, letterSpacing: "-0.02em" }}>{SPEAKER.name}</div>
          {SPEAKER.role && <div style={{ ...mono(17, "rgba(255,253,251,0.85)"), marginTop: 4 }}>{SPEAKER.role}</div>}
        </div>
      </div>
    </div>
  );
};

// ---------- captions ----------
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const cur = captions.find((c) => f >= c.from && f < c.to);
  if (!cur) return null;
  const p = interpolate(f - cur.from, [0, 5], [0, 1], { extrapolateRight: "clamp", easing: expo });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 72, display: "flex", justifyContent: "center", zIndex: 40 }}>
      <div style={{ fontFamily: SANS, fontSize: 38, fontWeight: 450 as never, color: C.paper, letterSpacing: "-0.01em",
        background: "rgba(33,19,14,0.86)", padding: "9px 20px 11px", borderRadius: 6, opacity: p,
        transform: `translateY(${(1 - p) * 6}px)` }}>
        {cur.text}
      </div>
    </div>
  );
};

// ---------- decode: text scrambles into place, left to right (the "deanonymize" motion) ----------
const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#@._/-";
export const Decode: React.FC<{ text: string; start: number; dur?: number; placeholder?: React.ReactNode; style?: React.CSSProperties }> = ({
  text, start, dur = 14, placeholder = null, style,
}) => {
  const f = useCurrentFrame();
  if (f < start) return <>{placeholder}</>;
  const n = text.length;
  const done = Math.floor(((f - start) / dur) * n);
  return (
    <span style={style}>
      {text.split("").map((ch, i) => {
        if (i < done || ch === " ") return <span key={i}>{ch}</span>;
        if (i < done + 4) {
          const g = GLYPHS[Math.floor(random(`${text}-${i}-${Math.floor(f / 2)}`) * GLYPHS.length)];
          return <span key={i} style={{ color: C.orange }}>{g}</span>;
        }
        return null;
      })}
    </span>
  );
};

/** Loading placeholder bar. */
export const Shimmer: React.FC<{ w: number; h?: number }> = ({ w, h = 22 }) => {
  const f = useCurrentFrame();
  return <span style={{ display: "inline-block", width: w, height: h, borderRadius: 5, verticalAlign: "middle",
    background: `rgba(33,19,14,${0.07 + 0.05 * (Math.sin(f * 0.3) + 1) / 2})` }} />;
};

/** Mouse pointer. */
export const Pointer: React.FC<{ x: number; y: number; down?: number }> = ({ x, y, down = 0 }) => (
  <svg width="34" height="44" viewBox="0 0 17 22" style={{ position: "absolute", left: x, top: y, zIndex: 60,
    transform: `scale(${1 - 0.12 * down})`, transformOrigin: "0 0", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}>
    <path d="M1 1 L1 17 L5.2 13.2 L8 19.6 L10.6 18.5 L7.9 12.2 L13.6 12.2 Z" fill="#111" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
