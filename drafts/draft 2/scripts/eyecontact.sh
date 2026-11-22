#!/usr/bin/env bash
# NVIDIA Maxine Eye Contact on the C011 (front) frame ranges that appear in the edit; spliced back
# into a full-length public/footage-ec/C011.mp4 so the EDL stays unchanged.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
S=${TMPDIR:-/tmp}/signup-ec; mkdir -p "$S" public/footage-ec
SRC=public/footage-soft/C011.mp4
FN=480bffcb-6fea-4571-9741-eb50212c9c0f
RANGES=(12:128 470:548 992:1258)
frames() { ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$1"; }
for r in "${RANGES[@]}"; do
  a=${r%:*}; b=${r#*:}
  ffmpeg -v error -y -i "$SRC" -vf "trim=start_frame=$a:end_frame=$b,setpts=PTS-STARTPTS" -an -c:v libx264 -crf 14 -preset medium \
    -r 30000/1001 -pix_fmt yuv420p "$S/r_$a.mp4"
  (cd ~/.cache/maxine/nim-clients/eye-contact/scripts && ~/.venvs/maxine/bin/python eye-contact.py --preview-mode \
    --target grpc.nvcf.nvidia.com:443 --function-id $FN --api-key "$NVIDIA_API_KEY" \
    --input "$S/r_$a.mp4" --output "$S/ec_$a.mp4" --enable-lookaway 1 >/dev/null 2>&1)
  echo "range $a-$b: in $(frames "$S/r_$a.mp4") frames, out $(frames "$S/ec_$a.mp4") frames"
done
# splice: original | ec | original | ec | original | ec | original
fc=""; ins=(-i "$SRC"); k=1; prev=0; parts=""
for r in "${RANGES[@]}"; do
  a=${r%:*}; b=${r#*:}
  ins+=(-i "$S/ec_$a.mp4")
  fc+="[0:v]trim=start_frame=$prev:end_frame=$a,setpts=PTS-STARTPTS[o$k];"
  fc+="[$k:v]trim=end_frame=$((b - a)),setpts=PTS-STARTPTS,format=yuv420p[e$k];"
  parts+="[o$k][e$k]"; prev=$b; k=$((k + 1))
done
fc+="[0:v]trim=start_frame=$prev,setpts=PTS-STARTPTS[tail];${parts}[tail]concat=n=$((2 * ${#RANGES[@]} + 1)):v=1:a=0[v]"
ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[v]" -c:v libx264 -crf 15 -preset medium -g 8 -bf 0 -r 30000/1001 \
  -pix_fmt yuv420p public/footage-ec/C011.mp4
cp -c public/footage-soft/C017.mp4 public/footage-ec/C017.mp4
echo "frames: soft $(frames $SRC) ec $(frames public/footage-ec/C011.mp4)"
