import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, expo, mono, MONO, SANS, shadowFloat } from "./brand";

/** "I'd have like 10 tabs open, LinkedIn, GitHub, their X, trying to piece it together."
 *  Frames are local to the cutaway; cue props are local frames of the spoken words. */
type Cues = { tabs: number; linkedin: number; github: number; x: number; piece: number };

const EMAIL = "jellis.dev@gmail.com";
const TABS: { url: string; site: string; title: string; rows: string[] }[] = [
  { url: `google.com/search?q="${EMAIL}"`, site: "google", title: `“${EMAIL}”`, rows: ["No results for this exact address", "Did you mean: jellis dev gmail"] },
  { url: "linkedin.com/search/results/people/?keywords=jordan ellis", site: "linkedin", title: "People · “Jordan Ellis”", rows: ["Jordan Ellis · Product Designer · Austin", "Jordan Ellis · Platform Lead · San Francisco", "Jordan Ellison · Founder · Denver", "Jordan Ellis · Student · Boston"] },
  { url: "github.com/search?q=jellis&type=users", site: "github", title: "Users · jellis", rows: ["jellis · 4 repositories", "jellis-dev · 31 repositories", "jordanellis · 2 repositories"] },
  { url: "crunchbase.com/discover/people/jordan-ellis", site: "crunchbase", title: "People · Jordan Ellis", rows: ["2 results · upgrade to view"] },
  { url: "x.com/search?q=jellis.dev&f=user", site: "x", title: "People · jellis.dev", rows: ["@jellis · 212 posts", "@jordan_ellis · 3 posts", "@jellisdev · protected"] },
  { url: "google.com/search?q=jordan+ellis+engineer+san+francisco", site: "google", title: "jordan ellis engineer san francisco", rows: ["About 1,240,000 results", "Jordan Ellis – Software Engineer", "Jordan Ellis (@jordanellis)"] },
  { url: "linkedin.com/in/jordan-ellis-4b2a91", site: "linkedin", title: "Jordan Ellis", rows: ["Platform Lead · 500+ connections", "Is this them? Photo doesn’t match"] },
  { url: "github.com/jellis-dev", site: "github", title: "jellis-dev", rows: ["Popular repositories", "dotfiles · infra-notes · k8s-playground"] },
  { url: "x.com/jordan_ellis", site: "x", title: "Jordan Ellis (@jordan_ellis)", rows: ["Posts about running", "Joined March 2014"] },
  { url: "google.com/search?q=jellis.dev", site: "google", title: "jellis.dev", rows: ["jellis.dev – Personal site", "This site can’t be reached"] },
];
// cascade positions: a messy pile that fills the right two-thirds
const POS = [
  [700, 250, -2.5], [760, 200, 1.8], [650, 300, -1.2], [800, 280, 2.6], [690, 230, -3.2],
  [780, 320, 0.8], [720, 190, 2.2], [640, 270, -1.8], [820, 220, -0.6], [740, 300, 1.2],
] as const;

const SITE_TINT: Record<string, string> = { linkedin: "#2e6da4", github: C.ink, x: C.ink, google: C.tan, crunchbase: "#2e6da4" };

export const TabsCutaway: React.FC<Cues> = (cue) => {
  const f = useCurrentFrame();
  const appear = (i: number) => cue.tabs - 6 + i * 3.2; // 10 windows in ~1s, landing on "10 tabs"
  const focusSite = f >= cue.x ? "x" : f >= cue.github ? "github" : f >= cue.linkedin ? "linkedin" : "";
  const focusIdx = focusSite ? TABS.findIndex((t) => t.site === focusSite) : -1;
  const open = TABS.filter((_, i) => f >= appear(i)).length;
  const shuffle = interpolate(f, [cue.piece, cue.piece + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const head = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: expo });

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, overflow: "hidden" }}>
      <Img src={staticFile("dither-corners.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }} />
      {/* headline */}
      <div style={{ position: "absolute", left: 110, top: 170, width: 520, opacity: head, transform: `translateY(${(1 - head) * 14}px)` }}>
        <div style={{ ...mono(17), display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ width: 9, height: 9, background: C.orange, borderRadius: 2 }} /> New signup
        </div>
        <div style={{ fontFamily: SANS, fontSize: 92, fontWeight: 360 as never, letterSpacing: "-0.03em", color: C.ink, lineHeight: 1.02, marginTop: 22 }}>
          Who is
        </div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: C.ink, marginTop: 14, letterSpacing: "-0.01em" }}>{EMAIL}?</div>
        <div style={{ marginTop: 56, display: "flex", gap: 14, alignItems: "center", opacity: open ? 1 : 0 }}>
          <div style={{ ...mono(17, "rgba(33,19,14,0.55)") }}>Tabs open</div>
          <div style={{ fontFamily: SANS, fontSize: 72, fontWeight: 360 as never, color: C.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>
            {open}
          </div>
        </div>
        <div style={{ marginTop: 18, ...mono(17, C.eyebrow), opacity: shuffle > 0.15 ? 1 : 0 }}>
          9 candidates · 0 confirmed
        </div>
      </div>
      {/* the pile */}
      {TABS.map((t, i) => {
        const p = interpolate(f, [appear(i), appear(i) + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
        if (p <= 0) return null;
        const [x, y, r] = POS[i];
        const focused = i === focusIdx;
        const jitter = Math.sin(i * 1.7 + f * 0.09) * 6 * shuffle;
        const lift = focused ? 1 : 0;
        return (
          <div key={i} style={{
            position: "absolute", left: x + jitter, top: y + (1 - p) * 60 - lift * 24 + Math.cos(i + f * 0.07) * 4 * shuffle,
            width: 1000, height: 580, opacity: p, zIndex: focused ? 30 : i,
            transform: `rotate(${r + jitter * 0.25}deg) scale(${(0.94 + 0.06 * p) * (focused ? 1.04 : 1)})`,
            borderRadius: 10, background: C.paper, overflow: "hidden",
            border: `1px solid ${focused ? C.orange : C.border}`, borderBottom: `1.5px solid ${focused ? C.orange : C.borderB}`,
            boxShadow: shadowFloat,
          }}>
            <div style={{ height: 50, background: C.well4, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
              {[0, 1, 2].map((d) => <span key={d} style={{ width: 12, height: 12, borderRadius: 6, background: C.border }} />)}
              <div style={{ marginLeft: 16, flex: 1, height: 30, borderRadius: 6, background: C.paper, border: `1px solid ${C.border}`,
                fontFamily: MONO, fontSize: 15, color: "rgba(33,19,14,0.62)", display: "flex", alignItems: "center", padding: "0 12px",
                whiteSpace: "nowrap", overflow: "hidden" }}>{t.url}</div>
            </div>
            <div style={{ padding: "26px 32px" }}>
              <div style={{ ...mono(13, SITE_TINT[t.site]) }}>{t.site}</div>
              <div style={{ fontFamily: SANS, fontSize: 30, color: C.ink, marginTop: 8, letterSpacing: "-0.015em" }}>{t.title}</div>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                {t.rows.map((row, j) => (
                  <div key={j} style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 12, borderBottom: `1px solid ${C.well4}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: t.site === "linkedin" || t.site === "x" ? 20 : 6, background: C.well4, flexShrink: 0 }} />
                    <div style={{ fontFamily: SANS, fontSize: 21, color: "rgba(33,19,14,0.75)" }}>{row}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
