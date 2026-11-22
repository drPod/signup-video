import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, TOTAL } from "./timeline";

export const Root = () => (
  <Composition id="SignupTestimonial" component={Main} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
