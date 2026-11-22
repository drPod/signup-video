# Signup deanonymization testimonial

Remotion edit of the Nov 18 glass-wall interview with Saai (front take C011, side take C017).
The root of this folder is the **current working version** (= draft 3). Finished drafts are frozen in `drafts/`.

## Layout
    src/            the video (Main.tsx timeline; Tabs.tsx browser scene; Slack.tsx; Cto.tsx; parts.tsx shots/captions/Decode)
    src/edl.json    the cut list (take, in/out seconds) + which footage folder to use; drives picture and audio
    scripts/        pipeline: align.py (word timing), captions.py, build_audio.py, dof.py (1% bg blur), eyecontact.sh (NVIDIA Maxine), dither.py
    audio/          camera audio, raw + enhanced (resemble-enhance)
    public/         footage (graded) -> footage-soft (+1% blur) -> footage-ec (+eye contact, used now); voice.wav; brand art
    out/            current render (draft3.mp4)
    drafts/         draft 1, draft 2, draft 3: self-contained snapshots, each with its video in out/ and a DRAFT.md
    archive/        rejected experiments (processed voices, relight test, steady side-shot render, gaze analysis)
    .env            NVIDIA + Runway API keys (private; never copied into drafts)

## Draft history
- Draft 1: front-angle-led cut, first graphics.
- Draft 2: side angle leads, 1% background blur, NVIDIA eye contact on front shots (base render without eye contact also kept).
- Draft 3: graphics rebuilt (browser/tabs, Slack identity decode, CTO reveal), hard cuts, still final close-up.
- Rejected: heavy background blur, processed "lively" voices, NVIDIA relighting, fully steady side shots.

## Rebuild
    ~/.venvs/enhance/bin/python scripts/align.py && cp scripts/words.json src/words.json
    python3 -I scripts/captions.py && python3 -I scripts/build_audio.py
    npx remotion render src/index.ts SignupTestimonial out/draft3.mp4 --crf=16 --audio-bitrate=320k
Preview/tweak live: `npm run studio`. In a draft snapshot, run `npm ci` first.
