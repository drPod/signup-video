import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, expo, mono, MONO, SANS, shadowFloat } from "./brand";
import { Decode, Shimmer } from "./parts";

/** "Somebody signs up, and we get notified in Slack. And by the time I look at it, Autumn's already figured out
 *  who they are and what they're working on."  The same anonymous Gmail from the tabs scene: a signup form is
 *  submitted, one large Slack message lands with blanks, and the identity decodes in on "figured out". */
type Cues = { signs: number; notified: number; figured: number; working: number; dur: number };

const EMAIL = "jellis.dev@gmail.com";
const text = "#1d1c1d", muted = "rgba(29,28,29,0.58)", link = "#1264a3";

const SignupForm: React.FC<{ signs: number }> = ({ signs }) => {
  const f = useCurrentFrame();
  const press = interpolate(f, [signs - 3, signs, signs + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const done = f >= signs + 2;
  return (
    <div style={{ width: 760, background: C.paper, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: shadowFloat,
      padding: "56px 64px", fontFamily: SANS }}>
      <div style={{ fontSize: 48, fontWeight: 500, color: C.ink, letterSpacing: "-0.02em" }}>Create your account</div>
      <div style={{ fontSize: 24, color: "rgba(33,19,14,0.55)", marginTop: 10 }}>Start your free trial</div>
      <div style={{ marginTop: 40, height: 76, borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", alignItems: "center",
        padding: "0 24px", gap: 18 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: "#d9d2ca", color: "#6b5d52", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, fontWeight: 600 }}>J</span>
        <span style={{ fontFamily: MONO, fontSize: 26, color: C.ink }}>{EMAIL}</span>
      </div>
      <div style={{ marginTop: 22, height: 76, borderRadius: 10, background: done ? C.positive : C.ink, color: C.paper, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 500, transform: `scale(${1 - 0.03 * press})` }}>
        {done ? "✓  Account created" : "Continue with Google"}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div style={{ ...mono(15, "rgba(29,28,29,0.5)") }}>{label}</div>
    <div style={{ fontFamily: SANS, fontSize: 34, color: text, marginTop: 10, height: 44, display: "flex", alignItems: "center",
      letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{children}</div>
  </div>
);

export const SlackCutaway: React.FC<Cues> = ({ signs, notified, figured, working, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const formIn = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 14 });
  const out = interpolate(f, [notified - 14, notified - 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const swap = spring({ frame: f - (notified - 9), fps, config: { damping: 18, mass: 0.8 } });
  const work = spring({ frame: f - working, fps, config: { damping: 200 }, durationInFrames: 16 });
  const lean = interpolate(f, [figured - 4, figured + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const drift = 0.02 * (f / dur);
  const d = (i: number) => figured + i * 4; // fields decode one after another
  const ph = <Shimmer w={300} h={30} />;

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, overflow: "hidden" }}>
      <Img src={staticFile("dither-corners.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }} />
      {/* the signup */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: formIn * (1 - out),
        transform: `translateY(${(1 - formIn) * 30 - out * 60}px) scale(${1.3 - 0.05 * out})` }}>
        <SignupForm signs={signs} />
      </AbsoluteFill>
      {/* the Slack message */}
      {f >= notified - 9 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center",
          transform: `translateY(${(1 - swap) * 260 - lean * 10}px) scale(${1.12 + drift + 0.04 * lean})`, opacity: Math.min(1, swap * 1.6) }}>
          <div style={{ width: 1500, background: "#fff", borderRadius: 18, boxShadow: shadowFloat, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ height: 70, borderBottom: "1px solid rgba(29,28,29,0.1)", display: "flex", alignItems: "center", padding: "0 44px",
              fontFamily: SANS, fontSize: 25, fontWeight: 600, color: text, gap: 12 }}>
              <span style={{ color: muted }}>#</span>signups
            </div>
            <div style={{ display: "flex", gap: 24, padding: "38px 44px 44px" }}>
              <Img src={staticFile("autumn-logo.svg")} style={{ width: 76, height: 76, borderRadius: 14, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily: SANS }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: text }}>Autumn</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: muted, background: "rgba(29,28,29,0.07)", padding: "2px 6px", borderRadius: 4 }}>APP</span>
                  <span style={{ fontSize: 21, color: muted }}>10:42 AM</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 32, color: text, marginTop: 8 }}>
                  New signup · <span style={{ color: link }}>{EMAIL}</span>
                </div>
                <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 30, columnGap: 40 }}>
                  <Field label="Name"><Decode text="Jordan Ellis" start={d(0)} placeholder={ph} /></Field>
                  <Field label="Title"><Decode text="Head of Platform" start={d(1)} placeholder={ph} /></Field>
                  <Field label="Company"><Decode text="Fieldline" start={d(2)} placeholder={ph} /></Field>
                  <Field label="LinkedIn"><Decode text="in/jordan-ellis" start={d(3)} placeholder={ph} style={{ color: link }} /></Field>
                  <Field label="Team size"><Decode text="14 engineers" start={d(4)} placeholder={ph} /></Field>
                  <Field label="Location">San Francisco, CA</Field>
                </div>
                <div style={{ marginTop: 34, borderLeft: `5px solid ${C.orange}`, paddingLeft: 24, opacity: work,
                  transform: `translateY(${(1 - work) * 14}px)`, height: 96 }}>
                  <div style={{ ...mono(15, C.eyebrow) }}>Working on</div>
                  <div style={{ fontFamily: SANS, fontSize: 30, color: text, marginTop: 12 }}>
                    Rebuilding Fieldline’s onboarding flow · hiring two platform engineers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
