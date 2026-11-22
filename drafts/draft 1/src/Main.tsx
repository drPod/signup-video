import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, expo, mono, SANS } from "./brand";
import { Callout, Captions, DitherCut, LowerThird, Shot } from "./parts";
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
  const somebodyA = at(0, "Somebody") - 4;
  const tabsIn = at(0, "I'd", 1) - 6;
  const slackIn = at(2, "Somebody") - 6;
  const ctoCard = at(4, "CTO");
  const weReached = at(4, "We") - 4;
  const thisPart = at(4, "This") - 5;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* interview */}
      <Shot seg={A} keys={[{ at: A.start, f: "wide" }, { at: somebodyA, f: "medium" }]} />
      <Shot seg={B} keys={[{ at: B.start, f: "side" }]} />
      <Shot seg={Cs} keys={[{ at: Cs.start, f: "close" }]} />
      <Shot seg={D} keys={[{ at: D.start, f: "side" }]} />
      <Shot seg={E} keys={[{ at: E.start, f: "wide" }, { at: weReached, f: "medium" }, { at: thisPart, f: "close" }]} />

      {/* name */}
      <Sequence from={14} durationInFrames={somebodyA - 14 + 70} layout="none"><LowerThird dur={somebodyA - 14 + 70} /></Sequence>

      {/* "somebody would sign up with a Gmail" */}
      <Sequence from={at(0, "Gmail,") - 4} durationInFrames={tabsIn - at(0, "Gmail,") + 4} layout="none">
        <Callout x={1240} y={250} dur={tabsIn - at(0, "Gmail,") + 4}
          states={[{ at: 0, s: { eyebrow: "New signup", big: "jellis.dev@gmail.com", bigSize: 40, sub: "No name. No company. No idea." } }]} />
      </Sequence>

      {/* cutaway: ten tabs */}
      <Cut from={tabsIn} to={segEnd(0)}>
        <TabsCutaway tabs={at(0, "10") - tabsIn} linkedin={at(0, "LinkedIn,") - tabsIn} github={at(0, "GitHub,") - tabsIn}
          x={at(0, "X,") - tabsIn} piece={at(0, "trying") - tabsIn} />
      </Cut>
      <DitherCut at={tabsIn} />
      <DitherCut at={segEnd(0)} />

      {/* cutaway: the Slack card */}
      <Cut from={slackIn} to={segEnd(2)}>
        <SlackCutaway dur={segEnd(2) - slackIn} notified={at(2, "notified") - slackIn - 4}
          figured={at(2, "figured") - slackIn} working={at(2, "working") - slackIn - 6} />
      </Cut>
      <DitherCut at={slackIn} />
      <DitherCut at={segEnd(2)} />

      {/* "just a personal email" -> "a CTO" */}
      <Sequence from={at(3, "personal") - 6} durationInFrames={segEnd(3) - at(3, "personal") + 6} layout="none">
        <Callout x={110} y={300} dur={segEnd(3) - at(3, "personal") + 6 + 9}
          states={[{ at: 0, s: { eyebrow: "New signup", big: "m.reyes.97@gmail.com", bigSize: 40, sub: "Personal email" } }]} />
      </Sequence>
      <Sequence from={E.start} durationInFrames={weReached - E.start} layout="none">
        <Callout enter={false} x={110} y={300} dur={weReached - E.start}
          states={[
            { at: 0, s: { eyebrow: "New signup", big: "m.reyes.97@gmail.com", bigSize: 40, sub: "Personal email" } },
            { at: ctoCard - E.start, s: { eyebrow: "Autumn found", big: "CTO", sub: "Behind a personal Gmail" } },
          ]} />
      </Sequence>

      {/* "we reached out the same day" */}
      <Sequence from={at(4, "same") - 4} durationInFrames={thisPart - at(4, "same") + 4} layout="none">
        <Callout x={110} y={300} dur={thisPart - at(4, "same") + 4}
          states={[{ at: 0, s: { eyebrow: "Signup to shared channel", big: "Same day", sub: "From signup to a shared Slack channel" } }]} />
      </Sequence>

      <Captions />

      {/* end card */}
      <Sequence from={SPEECH_END} durationInFrames={END_CARD} layout="none"><AbsoluteFill style={{ zIndex: 30 }}><EndCard /></AbsoluteFill></Sequence>
      <DitherCut at={SPEECH_END} />

      <Audio src={staticFile("voice.wav")} />
    </AbsoluteFill>
  );
};
