# Signup deanonymization testimonial

Remotion edit of the Nov 18 glass-wall interview (front take C011, side take C017).

- `src/edl.json`: the cut list (take, in/out seconds). It drives both the picture and the audio.
- `scripts/script.json` + `scripts/align.py`: forced word alignment (torchaudio MMS_FA), producing `scripts/words.json` and then captions/cues.
- `scripts/build_audio.py`: cuts and masters `public/voice.wav` (`AUDIO=raw` uses the camera audio instead of the resemble-enhance output in `audio/`).
- `src/brand.ts`: colors, fonts and the lower-third `SPEAKER` name/role.

Rebuild:
    ~/.venvs/enhance/bin/python scripts/align.py && cp scripts/words.json src/words.json
    python3 -I scripts/captions.py && python3 -I scripts/build_audio.py
    npx remotion render src/index.ts SignupTestimonial out/signup-deanonymization.mp4 --crf=16 --audio-bitrate=320k
Preview/tweak live: `npm run studio`.
