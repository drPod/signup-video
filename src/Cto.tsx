import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, expo, mono, MONO, SANS } from "./brand";
import { Decode } from "./parts";

/** "...just a personal email, and it turned out to be the CTO of a team..."  A random Gmail, huge; on "CTO" it
 *  steps aside and the identity decodes in. Cue props are local frames. */
export const CtoCutaway: React.FC<{ cto: number; dur: number }> = ({ cto, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 14 });
  const up = interpolate(f, [cto - 8, cto + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const push = 1 + 0.03 * (f / dur);
  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, overflow: "hidden" }}>
      <Img src={staticFile("dither-corners.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${push})` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - enter) * 30 - up * 120}px)`, opacity: enter }}>
          <div style={{ ...mono(22, "rgba(33,19,14,0.5)"), opacity: 1 - up }}>New signup</div>
          <div style={{ fontFamily: MONO, fontSize: 96 - 44 * up, color: `rgba(33,19,14,${1 - 0.45 * up})`, marginTop: 24 - 10 * up,
            letterSpacing: "-0.02em" }}>m.reyes.97@gmail.com</div>
        </div>
        <div style={{ position: "absolute", top: 470, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 200, fontWeight: 400, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1 }}>
            <Decode text="CTO" start={cto - 2} dur={8} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 52, color: "rgba(33,19,14,0.7)", marginTop: 18, letterSpacing: "-0.02em" }}>
            <Decode text="Maria Reyes · Larkspur" start={cto + 6} dur={14} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
