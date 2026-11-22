import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";
import { Easing } from "remotion";

export const SANS = loadGeist("normal", { weights: ["300", "400", "500", "600"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["400", "500"] }).fontFamily;

export const C = {
  orange: "#d86b23", ink: "#21130e", paper: "#fffdfb", raised: "#fbfaf8", canvas: "#eee9e2",
  border: "#c8bfb4", borderB: "#b9aea2", eyebrow: "#b5601f", tan: "#9f6b43",
  well1: "#faf7f3", well2: "#f8f5f1", well3: "#f5f1ec", well4: "#f3eee8", link: "#2e6da4", positive: "#4f9d69",
};
export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const shadowFloat = "0 1px 2px rgba(33,19,14,0.08), 0 18px 48px -12px rgba(33,19,14,0.28)";
export const mono = (size: number, color: string = C.eyebrow) => ({
  fontFamily: MONO, fontSize: size, letterSpacing: "0.14em", textTransform: "uppercase" as const, color,
});

/** NAME/ROLE for the lower third. Leave ROLE empty to show the name alone. */
export const SPEAKER = { name: "Saai", role: "" };
