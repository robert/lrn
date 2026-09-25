"""Turn narration lines into WAV files with the Kokoro neural voice (offline).

Usage: .venv/bin/python speak.py lines.json out_dir [voice] [speed]
lines.json is a list of {"id": "...", "text": "..."}. Writes out_dir/<id>.wav
and out_dir/durations.json ({id: seconds}). Lines already rendered with the
same text are skipped, so re-running after an edit is quick.
"""
import json, sys, hashlib
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
lines = json.loads(Path(sys.argv[1]).read_text())
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
voice = sys.argv[3] if len(sys.argv) > 3 else "bf_emma"
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 0.95

kokoro = Kokoro(str(HERE / "models/kokoro-v1.0.onnx"), str(HERE / "models/voices-v1.0.bin"))
manifest_file = out / "durations.json"
manifest = json.loads(manifest_file.read_text()) if manifest_file.exists() else {}

for line in lines:
    # A line may choose its own voice and speed (for films with a cast).
    v, sp = line.get("voice") or voice, float(line.get("speed") or speed)
    key = hashlib.sha1(f"{v}|{sp}|{line['text']}".encode()).hexdigest()
    wav = out / f"{line['id']}.wav"
    if wav.exists() and manifest.get(line["id"], {}).get("key") == key:
        continue
    samples, rate = kokoro.create(line["text"], voice=v, speed=sp, lang="en-gb")
    sf.write(wav, samples, rate)
    manifest[line["id"]] = {"key": key, "seconds": round(len(samples) / rate, 3)}
    print(f"{line['id']}: {manifest[line['id']]['seconds']}s")

manifest_file.write_text(json.dumps(manifest, indent=2))
