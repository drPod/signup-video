import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, expo, mono, SANS } from "./brand";
import { Captions, LowerThird, Shot } from "./parts";
import { CtoCutaway } from "./Cto";
import { SlackCutaway } from "./Slack";
import { TabsCutaway } from "./Tabs";
import { at, END_CARD, SEGS, segEnd, SPEECH_END } from "./timeline";

const Cut: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={from} durationInFrames={to - from} layout="none">
    <AbsoluteFill style={{ zIndex: 10 }}>{children}</AbsoluteFill>
  </Sequence>
);

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const e = (d: number) => interpolate(f - d, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const fadeOut = 1;
  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <Img src={staticFile("dither-bottom.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.55 * e(4), transform: `translateY(${(1 - e(4)) * 60}px)` }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -90 }}>
        <Img src={staticFile("autumn-logo.svg")} style={{ width: 120, height: 120, borderRadius: 18, opacity: e(0),
          transform: `scale(${0.9 + 0.1 * e(0)})` }} />
        <div style={{ ...mono(18), marginTop: 46, opacity: e(8) }}>Signup deanonymization</div>
        <div style={{ fontFamily: SANS, fontWeight: 360 as never, fontSize: 92, letterSpacing: "-0.035em", color: C.ink, marginTop: 18,
          opacity: e(12), transform: `translateY(${(1 - e(12)) * 14}px)` }}>
          Know who just signed up.
        </div>
        <div style={{ ...mono(22, "rgba(33,19,14,0.6)"), marginTop: 30, opacity: e(20) }}>autumn.ai</div>
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const [A, B, Cs, D, E] = SEGS;
  // cue points (absolute output frames) from the forced alignment
  const gmail = at(1, "Gmail,") - 4;          // browser cutaway starts on "Gmail"
  const tabsOut = at(1, "And", 1) - 3;       // back to camera for "And most days"
  const slackIn = at(2, "Somebody") - 6;
  const ctoIn = at(3, "personal") - 6;
  const ctoOut = at(3, "that", 1) - 2;       // back to him for "that we'd been dying to work with"
  const thisPart = at(4, "This") - 5;
  const lowerEnd = gmail - 2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* interview: the side angle leads (documentary style), the front angle punctuates */}
      <Shot seg={A} keys={[{ at: A.start, f: "wide" }]} />
      <Shot seg={B} keys={[{ at: B.start, f: "side" }, { at: tabsOut, f: "sideClose" }]} />
      <Shot seg={Cs} keys={[{ at: Cs.start, f: "close" }]} />
      <Shot seg={D} keys={[{ at: D.start, f: "side" }, { at: ctoOut, f: "sideClose" }]} />
      <Shot seg={E} keys={[{ at: E.start, f: "medium" }, { at: thisPart, f: "close", still: true }]} />

      <Sequence from={12} durationInFrames={lowerEnd - 12} layout="none"><LowerThird dur={lowerEnd - 12} /></Sequence>

      {/* "Gmail ... who is this? ... 10 tabs open, LinkedIn, GitHub, their X, trying to just piece things together" */}
      <Cut from={gmail} to={tabsOut}>
        <TabsCutaway dur={tabsOut - gmail} who={at(1, "who") - gmail} tabs={at(1, "I", 0) - gmail}
          linkedin={at(1, "LinkedIn,") - gmail} github={at(1, "GitHub,") - gmail} x={at(1, "X,") - gmail} trying={at(1, "trying") - gmail} />
      </Cut>

      {/* "Somebody signs up ... notified in Slack ... figured out who they are and what they're working on" */}
      <Cut from={slackIn} to={segEnd(2)}>
        <SlackCutaway dur={segEnd(2) - slackIn} signs={at(2, "up,") - slackIn} notified={at(2, "notified") - slackIn}
          figured={at(2, "figured") - slackIn} working={at(2, "working") - slackIn} />
      </Cut>

      {/* "just a personal email ... the CTO" */}
      <Cut from={ctoIn} to={ctoOut}>
        <CtoCutaway dur={ctoOut - ctoIn} cto={at(3, "CTO") - ctoIn} />
      </Cut>

      <Captions />

      <Sequence from={SPEECH_END} durationInFrames={END_CARD} layout="none"><AbsoluteFill style={{ zIndex: 30 }}><EndCard /></AbsoluteFill></Sequence>

      <Audio src={staticFile("voice.wav")} />
    </AbsoluteFill>
  );
};
