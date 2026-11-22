import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, expo, mono, SANS, shadowFloat, SPEAKER } from "./brand";
import captions from "./captions.json";
import { FPS, Seg } from "./timeline";

// ---------- camera ----------
type Framing = { scale: number; ox: number; oy: number };
export const FRAMES: Record<string, Framing> = {
  wide: { scale: 1.0, ox: 0.6, oy: 0.22 },
  medium: { scale: 1.28, ox: 0.6, oy: 0.2 },
  close: { scale: 1.62, ox: 0.6, oy: 0.17 },
  side: { scale: 1.3, ox: 0.5, oy: 0.3 },
};
export type Key = { at: number; f: keyof typeof FRAMES };

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
  const push = 1 + 0.03 * Math.min(1, (abs - k.at) / Math.max(1, kEnd - k.at));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${fr.scale * push})`, transformOrigin: `${fr.ox * 100}% ${fr.oy * 100}%` }}>
        <OffthreadVideo
          src={staticFile(`footage/${seg.take}.mp4`)}
          trimBefore={Math.round(seg.in * FPS)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {/* soft vignette for depth and caption legibility */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(20,13,9,0.32) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- dithered pixel transition ----------
const BAYER = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54,
  22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
const COLS = 40, ROWS = 23, CELL = 48;
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const x = i % COLS, y = Math.floor(i / COLS);
  const b = BAYER[(y % 8) * 8 + (x % 8)] / 64;
  const sweep = (x / COLS) * 0.55 + (y / ROWS) * 0.15; // left-to-right sweep with a dithered edge
  return { x, y, t: sweep * 0.6 + b * 0.4, accent: b > 0.5 };
});
export const TRANSITION = 14;

/** Pixels cover the frame for the first half, then clear: put the cut at the midpoint (`at`). */
export const DitherCut: React.FC<{ at: number; color?: string }> = ({ at, color = C.canvas }) => (
  <Sequence from={at - TRANSITION / 2} durationInFrames={TRANSITION} layout="none">
    <DitherInner color={color} />
  </Sequence>
);
const DitherInner: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  const half = TRANSITION / 2;
  const covering = f < half;
  const p = covering ? (f + 1) / half : (f - half + 1) / half;
  return (
    <AbsoluteFill style={{ zIndex: 50 }}>
      {CELLS.map((c, i) => {
        const on = covering ? p >= c.t : p < c.t;
        if (!on) return null;
        // orange only on the moving edge of the sweep, so it reads as a lit front, not a pattern
        const edge = covering ? p - c.t < 0.16 : c.t - p < 0.16;
        return (
          <div key={i} style={{ position: "absolute", left: c.x * CELL, top: c.y * CELL, width: CELL, height: CELL,
            backgroundColor: edge && c.accent ? C.orange : color }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- entrance helper ----------
export const useEnter = (delay = 0, dur = 16) => {
  const f = useCurrentFrame();
  return interpolate(f - delay, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
};

// ---------- callout card (Plain-style stat box, Autumn emboss card) ----------
type CalloutState = { eyebrow: string; big: string; sub: string; bigSize?: number };
export const Callout: React.FC<{ states: { at: number; s: CalloutState }[]; enter?: boolean; dur: number; x?: number; y?: number }> = ({
  states, enter = true, dur, x = 96, y = 300,
}) => {
  const f = useCurrentFrame();
  const inP = enter ? interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: expo }) : 1;
  const outP = interpolate(f, [dur - 9, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 560, opacity: inP * outP,
      transform: `translateY(${(1 - inP) * 18}px)`, zIndex: 20 }}>
      <div style={{ background: "rgba(255,253,251,0.95)", border: `1px solid ${C.border}`, borderBottom: `1.5px solid ${C.borderB}`,
        borderRadius: 8, padding: "30px 36px 32px", boxShadow: shadowFloat, position: "relative", overflow: "hidden", minHeight: 238 }}>
        {states.map((st, i) => {
          const local = f - st.at;
          const showIn = i === 0 ? 1 : interpolate(local, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
          const next = states[i + 1];
          const showOut = next ? interpolate(f - next.at, [0, 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
          const o = (f >= st.at ? showIn : 0) * showOut;
          return (
            <div key={i} style={{ position: i === 0 ? "relative" : "absolute", inset: i === 0 ? undefined : "30px 36px 32px",
              opacity: o, transform: `translateY(${(1 - showIn) * 10}px)` }}>
              <div style={{ ...mono(17), display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 9, height: 9, background: C.orange, borderRadius: 2, display: "inline-block" }} />
                {st.s.eyebrow}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 360 as never, fontSize: st.s.bigSize ?? 84, letterSpacing: "-0.03em",
                color: C.ink, lineHeight: 1.02, marginTop: 18, fontVariantNumeric: "tabular-nums" }}>{st.s.big}</div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: "rgba(33,19,14,0.62)", marginTop: 14, lineHeight: 1.3 }}>{st.s.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
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
