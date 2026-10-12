"""Sample all lyric cues from a supplied local video; run macOS Vision on the stills.

No lyric text is embedded in this script. Images/OCR output are local out/ artifacts.
The reference starts with the same five-second warning as the film.
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument("video", type=Path)
ap.add_argument("--lead", type=float, default=5.0)
ap.add_argument("--fraction", type=float, default=0.82)
ap.add_argument("--indices", help="Comma-separated zero-based indices; defaults to all lines")
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--ffmpeg", default="ffmpeg")
ap.add_argument("--ocr", type=Path, required=True)
args = ap.parse_args()
table = json.loads((ROOT / "data/lyric_timing.json").read_text())
folder = ROOT / "out/lyric_recovery"
frames = folder / "source_frames"
frames.mkdir(parents=True, exist_ok=True)
indices = list(map(int, args.indices.split(","))) if args.indices else list(range(table["count"]))
samples = []
for i in indices:
    line = table["lines"][i]
    t = args.lead + line["start"] + (line["end"] - line["start"]) * args.fraction
    image = frames / f"line_{i:03d}_{args.fraction:.2f}.png"
    if not image.exists():
        subprocess.run([args.ffmpeg, "-v", "error", "-ss", f"{t:.6f}", "-i", str(args.video),
                        "-frames:v", "1", "-vf", f"scale={args.width}:-1", "-y", str(image)], check=True)
    samples.append({"index": i, "songTime": t - args.lead, "fileTime": t, "frame": str(image)})
print(f"Sampled {len(samples)} cue frames", flush=True)
stem = f"samples_{args.fraction:.2f}_{indices[0]:03d}_{indices[-1]:03d}"
(folder / f"{stem}.json").write_text(json.dumps(samples, indent=2))
with (folder / f"{stem}_ocr.jsonl").open("w") as out:
    subprocess.run([str(args.ocr), *[s["frame"] for s in samples]], stdout=out, check=True)
print(f"OCR complete: {stem}", flush=True)
