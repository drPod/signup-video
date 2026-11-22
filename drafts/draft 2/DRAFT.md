Draft 2 (eye-contact version): out/draft2-eye-contact.mp4
Footage:  public/footage-ec (NVIDIA Maxine eye contact on the front shots + 1% background blur).
Rebuild: npx remotion render src/index.ts SignupTestimonial out/draft2-eye-contact.mp4 --crf=16 --audio-bitrate=320k

Rebuild: npm ci first (node_modules is not kept in snapshots).
