import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, expo, MONO, SANS, shadowFloat } from "./brand";
import { Pointer } from "./parts";

/** "Someone would sign up with their Gmail, and I'd be like, okay, who is this? I would have 10 tabs open,
 *  LinkedIn, GitHub, their X, trying to just piece things together."
 *  A full-bleed browser: the signup list with an anonymous Gmail, then ten tabs of guesswork.
 *  All cue props are frames local to the cutaway. */
type Cues = { who: number; tabs: number; linkedin: number; github: number; x: number; trying: number; dur: number };

const EMAIL = "jellis.dev@gmail.com";
type Row = { name: string; sub: string; init: string };
type Page = { site: string; tint: string; fav: string; title: string; url: string; query: string; meta: string; rows: Row[] };

const LI = "#0a66c2", GH = "#1f2328", XC = "#0f1419", GG = "#4d6fa8", CB = "#146aff";
const PAGES: Page[] = [
  { site: "admin", tint: C.orange, fav: C.orange, title: "Signups · Admin", url: "app.yourproduct.com/admin/signups", query: "", meta: "", rows: [] },
  { site: "Google", tint: GG, fav: GG, title: `"${EMAIL}" - Search`, url: `google.com/search?q="${EMAIL}"`, query: `"${EMAIL}"`,
    meta: "No results found for this exact address", rows: [] },
  { site: "LinkedIn", tint: LI, fav: LI, title: "jordan ellis | Search", url: "linkedin.com/search/results/people/?keywords=jordan%20ellis", query: "jordan ellis",
    meta: "About 2,400 results", rows: [
      { name: "Jordan Ellis", sub: "Product Designer · Austin, TX", init: "JE" },
      { name: "Jordan Ellis", sub: "Platform Lead · San Francisco Bay Area", init: "JE" },
      { name: "Jordan Ellis", sub: "Software Engineer · Seattle, WA", init: "JE" },
      { name: "Jordan Ellison", sub: "Founder · Denver, CO", init: "JE" },
    ] },
  { site: "GitHub", tint: GH, fav: GH, title: "Search · jellis", url: "github.com/search?q=jellis&type=users", query: "jellis",
    meta: "38 users", rows: [
      { name: "jellis", sub: "4 repositories · no bio", init: "j" },
      { name: "jellis-dev", sub: "31 repositories · San Francisco", init: "jd" },
      { name: "jordanellis", sub: "2 repositories · no bio", init: "je" },
      { name: "j-ellis", sub: "0 repositories", init: "j" },
    ] },
  { site: "X", tint: XC, fav: XC, title: "jellis.dev - Search / X", url: "x.com/search?q=jellis.dev&f=user", query: "jellis.dev",
    meta: "People", rows: [
      { name: "Jordan Ellis  @jellis", sub: "running, coffee, distributed systems", init: "JE" },
      { name: "J. Ellis  @jordan_ellis", sub: "3 posts · joined 2014", init: "JE" },
      { name: "jellisdev  @jellisdev", sub: "These posts are protected", init: "j" },
    ] },
  { site: "LinkedIn", tint: LI, fav: LI, title: "Jordan Ellis | LinkedIn", url: "linkedin.com/in/jordan-ellis-4b2a91", query: "Jordan Ellis",
    meta: "Platform Lead · 500+ connections", rows: [{ name: "Experience", sub: "Private — sign in to view", init: "?" }] },
  { site: "Google", tint: GG, fav: GG, title: "jordan ellis engineer sf - Search", url: "google.com/search?q=jordan+ellis+engineer+sf", query: "jordan ellis engineer sf",
    meta: "About 1,240,000 results", rows: [
      { name: "Jordan Ellis – Software Engineer", sub: "linkedin.com › in › jordanellis", init: "G" },
      { name: "Jordan Ellis (@jordanellis)", sub: "instagram.com › jordanellis", init: "G" },
    ] },
  { site: "GitHub", tint: GH, fav: GH, title: "jellis-dev", url: "github.com/jellis-dev", query: "jellis-dev",
    meta: "Popular repositories", rows: [{ name: "dotfiles", sub: "Shell", init: "▢" }, { name: "k8s-playground", sub: "Go", init: "▢" }] },
  { site: "Crunchbase", tint: CB, fav: CB, title: "Jordan Ellis - Crunchbase", url: "crunchbase.com/person/jordan-ellis", query: "Jordan Ellis",
    meta: "2 results · upgrade to view", rows: [] },
  { site: "Google", tint: GG, fav: GG, title: "jellis.dev - Search", url: "google.com/search?q=jellis.dev", query: "jellis.dev",
    meta: "This site can’t be reached", rows: [] },
];

const WIN = { x: 70, y: 46, w: 1780, h: 988 };
const BAR = 58, URLBAR = 62, TAB_X0 = 96, TAB_MAX = 280, NEWTAB = 56;

const AdminPage: React.FC<{ who: number }> = ({ who }) => {
  const f = useCurrentFrame();
  const hl = interpolate(f, [who - 4, who + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
  const rows = [
    { email: EMAIL, name: "", co: "", when: "Just now", fresh: true },
    { email: "maya@loophealth.com", name: "Maya Chen", co: "Loop Health", when: "2h ago" },
    { email: "s.okafor@brightpath.io", name: "Sam Okafor", co: "Brightpath", when: "5h ago" },
    { email: "dev.k1988@outlook.com", name: "", co: "", when: "Yesterday" },
    { email: "hello@tinyfox.studio", name: "", co: "", when: "Yesterday" },
  ];
  const col = (w: number): React.CSSProperties => ({ width: w, flexShrink: 0 });
  return (
    <div style={{ padding: "56px 72px", fontFamily: SANS }}>
      <div style={{ fontSize: 46, fontWeight: 500, color: C.ink, letterSpacing: "-0.02em" }}>Signups</div>
      <div style={{ fontSize: 24, color: "rgba(33,19,14,0.55)", marginTop: 8 }}>New accounts this week</div>
      <div style={{ marginTop: 40, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex", padding: "16px 28px", background: C.well4, fontFamily: MONO, fontSize: 17, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(33,19,14,0.55)" }}>
          <div style={col(640)}>Email</div><div style={col(360)}>Name</div><div style={col(360)}>Company</div><div>Signed up</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "22px 28px", fontSize: 29, color: C.ink,
            borderTop: `1px solid ${C.well4}`, background: r.fresh ? `rgba(216,107,35,${0.05 + 0.07 * hl})` : C.paper,
            boxShadow: r.fresh ? `inset 5px 0 0 rgba(216,107,35,${hl})` : undefined }}>
            <div style={{ ...col(640), fontFamily: MONO, fontSize: 27 }}>{r.email}</div>
            <div style={{ ...col(360), color: r.name ? C.ink : "rgba(33,19,14,0.3)" }}>{r.name || "—"}</div>
            <div style={{ ...col(360), color: r.co ? C.ink : "rgba(33,19,14,0.3)" }}>{r.co || "—"}</div>
            <div style={{ color: r.fresh ? C.orange : "rgba(33,19,14,0.55)", fontWeight: r.fresh ? 500 : 400 }}>{r.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsPage: React.FC<{ p: Page }> = ({ p }) => (
  <div style={{ fontFamily: SANS, height: "100%" }}>
    <div style={{ height: 92, background: p.tint, display: "flex", alignItems: "center", padding: "0 72px", gap: 28 }}>
      <div style={{ fontSize: 34, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", width: 200 }}>{p.site}</div>
      <div style={{ flex: 1, maxWidth: 900, height: 54, borderRadius: 27, background: "rgba(255,255,255,0.95)", display: "flex",
        alignItems: "center", padding: "0 28px", fontSize: 27, color: "#222" }}>{p.query}</div>
    </div>
    <div style={{ padding: "40px 72px 0 300px" }}>
      <div style={{ fontSize: 24, color: "rgba(0,0,0,0.55)" }}>{p.meta}</div>
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 4 }}>
        {p.rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: `${p.tint}22`, color: p.tint, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 600 }}>{r.init}</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.01em" }}>{r.name}</div>
              <div style={{ fontSize: 24, color: "rgba(0,0,0,0.55)", marginTop: 4 }}>{r.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TabsCutaway: React.FC<Cues> = (q) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const openAt = (i: number) => (i === 0 ? -999 : q.tabs + (i - 1) * 3);
  const n = PAGES.filter((_, i) => f >= openAt(i)).length;
  const tabW = Math.min(TAB_MAX, (WIN.w - TAB_X0 - NEWTAB - 24) / n);
  const tabCx = (i: number) => WIN.x + TAB_X0 + tabW * (i + 0.5);

  // which tab is in front
  const cycle = [5, 6, 7, 8, 9, 1, 2, 3, 4];
  let active = 0;
  if (f >= q.tabs) active = n - 1;
  if (f >= q.linkedin) active = 2;
  if (f >= q.github) active = 3;
  if (f >= q.x) active = 4;
  if (f >= q.trying) active = cycle[Math.floor((f - q.trying) / 5) % cycle.length];

  // pointer: rests on the new signup, then clicks each tab as it's named
  const keys: [number, number, number][] = [
    [0, 1320, 560], [q.who - 2, 540, 448], [q.tabs, 540, 448], [q.linkedin - 7, tabCx(2), WIN.y + 30], [q.github - 7, tabCx(3), WIN.y + 30],
    [q.x - 7, tabCx(4), WIN.y + 30], [q.trying, tabCx(4), WIN.y + 30], [q.trying + 14, tabCx(7), WIN.y + 30],
  ];
  let px = keys[0][1], py = keys[0][2];
  for (let k = 1; k < keys.length; k++) {
    const [t0, x0, y0] = keys[k - 1], [t1, x1, y1] = keys[k];
    if (f >= t0) {
      const e = interpolate(f, [t0, Math.max(t0 + 1, t1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
      px = x0 + (x1 - x0) * e; py = y0 + (y1 - y0) * e;
    }
  }
  const clicks = [q.linkedin, q.github, q.x];
  const down = Math.max(0, ...clicks.map((c) => interpolate(f, [c - 2, c, c + 4], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const enter = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 16 });
  const page = PAGES[active];
  // camera: start pushed in on the signup table, pull back as the tabs pile up
  const zoom = 1 + 0.14 * (1 - interpolate(f, [q.tabs - 4, q.tabs + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo }))
    + 0.012 * (f / q.dur);
  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, overflow: "hidden" }}>
      <Img src={staticFile("dither-corners.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 22%" }}>
      <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, overflow: "hidden",
        background: C.paper, boxShadow: shadowFloat, border: `1px solid ${C.border}`,
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.97 + 0.03 * enter})`, opacity: enter }}>
        {/* tab strip */}
        <div style={{ height: BAR, background: "#e6e0d8", display: "flex", alignItems: "flex-end", paddingLeft: TAB_X0, position: "relative" }}>
          <div style={{ position: "absolute", left: 24, top: 22, display: "flex", gap: 9 }}>
            {["#e46a5e", "#e9b54e", "#62c25b"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          </div>
          {PAGES.map((p, i) => {
            if (f < openAt(i)) return null;
            const pop = interpolate(f, [openAt(i), openAt(i) + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expo });
            const on = i === active;
            return (
              <div key={i} style={{ width: tabW * pop, height: 46, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center",
                gap: 10, padding: tabW > 60 ? "0 14px" : "0 6px", boxSizing: "border-box", borderRadius: "10px 10px 0 0",
                background: on ? C.paper : "transparent", borderRight: on ? "none" : "1px solid rgba(33,19,14,0.12)" }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, background: p.fav, flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: 18, color: on ? C.ink : "rgba(33,19,14,0.62)", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
              </div>
            );
          })}
          <span style={{ width: NEWTAB, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
            color: "rgba(33,19,14,0.5)", fontFamily: SANS }}>+</span>
        </div>
        {/* url bar */}
        <div style={{ height: URLBAR, display: "flex", alignItems: "center", padding: "0 24px", gap: 18, borderBottom: `1px solid ${C.well4}` }}>
          <span style={{ fontSize: 28, color: "rgba(33,19,14,0.4)", fontFamily: SANS }}>‹ ›</span>
          <div style={{ flex: 1, height: 42, borderRadius: 21, background: C.well4, display: "flex", alignItems: "center", padding: "0 22px",
            fontFamily: SANS, fontSize: 21, color: "rgba(33,19,14,0.7)" }}>{page.url}</div>
        </div>
        <div style={{ height: WIN.h - BAR - URLBAR }}>
          {active === 0 ? <AdminPage who={q.who} /> : <ResultsPage p={page} />}
        </div>
      </div>
      <Pointer x={px} y={py} down={down} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
