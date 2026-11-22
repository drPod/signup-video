import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, expo, mono, SANS, shadowFloat } from "./brand";

/** "Somebody signs up, and we get notified in Slack. And by the time I look at it, Autumn's already
 *  figured out who they are and what they're working on."  Mirrors the real signup card
 *  (sixtyfive/src/signup/blocks.py): pending card -> confirmed "Name — Title at Company" + context line. */
type Cues = { notified: number; figured: number; working: number };

const SLACK_LINK = "#1264a3";
const muted = "rgba(29,28,29,0.62)";
const text = "#1d1c1d";

const Ctx: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: SANS, fontSize: 22, color: muted, marginTop: 8, ...style }}>{children}</div>
);
const Sep = () => <span style={{ margin: "0 10px", opacity: 0.6 }}>·</span>;

const Message: React.FC<{ time: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ time, children, style }) => (
  <div style={{ display: "flex", gap: 16, padding: "16px 36px", ...style }}>
    <Img src={staticFile("autumn-logo.svg")} style={{ width: 58, height: 58, borderRadius: 11, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: SANS }}>
        <span style={{ fontSize: 25, fontWeight: 600, color: text }}>Autumn</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: muted, background: "rgba(29,28,29,0.07)", padding: "1px 5px", borderRadius: 3 }}>APP</span>
        <span style={{ fontSize: 17, color: muted }}>{time}</span>
      </div>
      {children}
    </div>
  </div>
);

const Button: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: text, border: "1px solid rgba(29,28,29,0.3)",
    borderRadius: 6, padding: "7px 14px", background: "#fff" }}>{children}</span>
);

export const SlackCutaway: React.FC<Cues & { dur: number }> = ({ notified, figured, working, dur }) => {
  const f = useCurrentFrame();
  const win = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp", easing: expo });
  const msg = interpolate(f, [notified, notified + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const resolved = f >= figured;
  const res = interpolate(f, [figured, figured + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const work = interpolate(f, [working, working + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  // camera: settle, then lean into the card once it resolves
  const zp = interpolate(f, [figured - 6, figured + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const zoom = 1.12 + 0.2 * interpolate(f, [figured - 6, figured + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo })
    + 0.015 * (f / dur);
  const shimmer = (Math.sin(f * 0.35) + 1) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, overflow: "hidden" }}>
      <Img src={staticFile("dither-corners.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }} />
      <div style={{ position: "absolute", left: 170, top: 110, width: 1580, height: 860, opacity: win,
        transform: `translateY(${(1 - win) * 30 - zp * 90}px) scale(${zoom})`, transformOrigin: "64% 88%",
        borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: shadowFloat, border: `1px solid ${C.border}`, display: "flex" }}>
        {/* sidebar */}
        <div style={{ width: 300, background: C.ink, padding: "26px 0", fontFamily: SANS }}>
          <div style={{ color: C.paper, fontSize: 22, fontWeight: 600, padding: "0 24px 22px" }}>Your team</div>
          {["general", "product", "signups", "sales", "eng"].map((ch) => (
            <div key={ch} style={{ fontSize: 19, padding: "8px 24px", color: ch === "signups" ? C.paper : "rgba(255,253,251,0.62)",
              background: ch === "signups" ? C.orange : "transparent", fontWeight: ch === "signups" ? 600 : 400 }}># {ch}</div>
          ))}
        </div>
        {/* channel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ height: 70, borderBottom: "1px solid rgba(29,28,29,0.13)", display: "flex", alignItems: "center", padding: "0 32px",
            fontFamily: SANS, fontSize: 22, fontWeight: 600, color: text }}># signups</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 30 }}>
            <Message time="9:21 AM" style={{ opacity: 0.4 }}>
              <div style={{ fontFamily: SANS, fontSize: 25, color: text, marginTop: 6 }}>
                <b style={{ fontWeight: 600 }}>Sam Okafor</b> — Founder at Brightpath
              </div>
              <Ctx><span style={{ color: SLACK_LINK }}>sam.okafor@outlook.com</span><Sep /><span style={{ color: SLACK_LINK }}>in/samokafor</span><Sep />Free trial<Sep />Lagos</Ctx>
            </Message>
            <div style={{ height: 1, background: "rgba(29,28,29,0.08)", margin: "10px 36px" }} />
            {/* an earlier, already-resolved card for context */}
            <Message time="9:58 AM" style={{ opacity: 0.55 }}>
              <div style={{ fontFamily: SANS, fontSize: 25, color: text, marginTop: 6 }}>
                <b style={{ fontWeight: 600 }}>Maya Chen</b> — Engineering Manager at Loop Health
              </div>
              <Ctx><span style={{ color: SLACK_LINK }}>maya@loophealth.com</span><Sep /><span style={{ color: SLACK_LINK }}>in/mayachen</span><Sep />Team plan<Sep />New York, NY</Ctx>
            </Message>
            <div style={{ height: 1, background: "rgba(29,28,29,0.08)", margin: "10px 36px" }} />
            {/* the new signup */}
            <div style={{ opacity: msg, transform: `translateY(${(1 - msg) * 26}px)`, background: msg > 0 && !resolved ? "rgba(216,107,35,0.06)" : "transparent" }}>
              <Message time="10:42 AM">
                {!resolved ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 26, color: text, marginTop: 8 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 5, background: "#d9d2ca", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6b5d52", fontWeight: 600 }}>JE</span>
                      <b style={{ fontWeight: 600 }}>Jordan Ellis</b>
                      <span style={{ color: SLACK_LINK }}>jellis.dev@gmail.com</span>
                    </div>
                    <Ctx>Free trial<Sep />San Francisco, CA<Sep />Chrome on macOS<Sep />via Google</Ctx>
                    <Ctx style={{ opacity: 0.55 + 0.45 * shimmer }}>Looking up identity…</Ctx>
                  </>
                ) : (
                  <div style={{ opacity: res, transform: `translateY(${(1 - res) * 8}px)` }}>
                    <div style={{ fontFamily: SANS, fontSize: 28, color: text, marginTop: 8 }}>
                      <b style={{ fontWeight: 600 }}>Jordan Ellis</b>  —  Head of Platform at Fieldline
                    </div>
                    <Ctx><span style={{ color: SLACK_LINK }}>jellis.dev@gmail.com</span><Sep /><span style={{ color: SLACK_LINK }}>in/jordan-ellis</span><Sep />Free trial<Sep />San Francisco, CA<Sep />via Google</Ctx>
                    <div style={{ marginTop: 16, borderLeft: `4px solid ${C.orange}`, paddingLeft: 16, opacity: work, transform: `translateY(${(1 - work) * 8}px)` }}>
                      <div style={{ ...mono(15, C.eyebrow) }}>Working on</div>
                      <div style={{ fontFamily: SANS, fontSize: 24, color: text, marginTop: 8, lineHeight: 1.4 }}>
                        Rebuilding Fieldline’s onboarding flow · team of 14 · hiring two platform engineers
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 16, opacity: work }}>
                      <Button>See all details</Button><Button>Open in CRM</Button>
                    </div>
                  </div>
                )}
              </Message>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
