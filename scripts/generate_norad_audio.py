"""Generate expressive female VO for the NORAD reel (edge-tts, no API keys).

Voice: en-US-AvaNeural. Expressiveness = per-sentence rate/pitch direction,
sentence pauses, and a 180s master assembled with ffmpeg (shell=False, all
paths validated inside the project dir), beat-synced to 02_script/beat-sheet.json.
Emits per-beat WAVs, master_vo.mp3, vo_manifest.json with word-level timings.
"""
from __future__ import annotations

import asyncio
import json
import re
import subprocess
from pathlib import Path

import edge_tts
import mutagen.mp3
from mutagen.wave import WAVE

REPO = Path(__file__).resolve().parents[1]
PROJ = (REPO / "projects" / "sun_fooled_norad_2026-11-09").resolve()
BEATS = json.loads((PROJ / "02_script" / "beat-sheet.json").read_text(encoding="utf-8"))
OUT = PROJ / "03_voiceover"
TMP = OUT / "_tmp"
VOICE = "en-US-AvaNeural"
LEAD_IN_S = 0.6
GAP_S = 0.35


def _safe(p: Path | str) -> str:
    rp = Path(p).resolve()
    rp.relative_to(PROJ)  # raises if outside the project dir
    return str(rp)


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, shell=False, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("ffmpeg failed: " + (r.stderr or "")[-800:])


# per beat: sentences with (text, rate, pitch) — expressive direction per line
LINES = {
    1: [("May 23, 1967.", "-10%", "-20Hz"),
        ("The three radar sites guarding America from Soviet missiles go dark — all at the same second.", "-3%", "-6Hz")],
    2: [("In Cold War doctrine, jamming meant one thing: Soviet attack was imminent.", "-2%", "-8Hz"),
        ("Nuclear-armed bombers were moved to ready-to-launch.", "+3%", "+2Hz")],
    3: [("Days earlier, a vast sunspot group had rotated onto the Sun.", "-4%", "-6Hz"),
        ("On May 21 and 23 it erupted — flares, then the century's biggest radio burst.", "+2%", "+4Hz")],
    4: [("At Ent Air Force Base, Colorado, forecaster Arnold Snyder got the panicked call.", "-3%", "-6Hz"),
        ("His answer:", "-8%", "-14Hz"),
        ("Yes — half the sun has blown away.", "-6%", "-2Hz")],
    5: [("Forecasters confirmed all three radar sites sat in daylight.", "-2%", "-4Hz"),
        ("As the Sun's burst faded, the 'jamming' faded with it.", "+1%", "+2Hz"),
        ("The launch order never came.", "-10%", "-16Hz")],
    6: [("The near-war stayed secret for half a century", "-3%", "-4Hz"),
        ("until 2016, when a declassified study named the culprit: the May 1967 Great Storm.", "+3%", "+4Hz")],
    7: [("Quebec went dark in 1989.", "-4%", "-8Hz"),
        ("Earth missed a Carrington-class blast by days in 2012.", "+1%", "+0Hz"),
        ("We just passed solar maximum. The Sun never demobilized.", "-5%", "-10Hz")],
}


def norm(s: str) -> str:
    return re.sub(r"[\s'\"“”‘’—–-]+", "", s.lower())


def check_sync():
    for b in BEATS["beats"]:
        spoken = norm("".join(t for t, _, _ in LINES[b["id"]]))
        scripted = norm(b["caption"])
        if spoken != scripted:
            raise SystemExit(f"caption sync mismatch on beat {b['id']}:\n  VO : {spoken}\n  SCR: {scripted}")


async def tts(text: str, rate: str, pitch: str, path: Path) -> list[dict]:
    comm = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch)
    words = []
    with open(path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"w": chunk["text"],
                              "t0": round(chunk["offset"] / 1e7, 3),
                              "t1": round((chunk["offset"] + chunk["duration"]) / 1e7, 3)})
    return words


async def gen_sentences():
    TMP.mkdir(parents=True, exist_ok=True)
    plan = []
    for b in BEATS["beats"]:
        sid = b["id"]
        cursor = 0.0
        for j, (text, rate, pitch) in enumerate(LINES[sid]):
            sp = TMP / f"b{sid:02d}_s{j}.mp3"
            words = await tts(text, rate, pitch, sp)
            dur = mutagen.mp3.MP3(str(sp)).info.length
            for w in words:
                w["abs_t0"] = 0.0
            plan.append({"beat": sid, "sent": j, "path": sp, "dur": round(dur, 3),
                         "gap": GAP_S, "words": words})
            cursor += dur + GAP_S
        print(f"beat {sid}: {cursor:.1f}s spoken / {b['duration_s']}s slot")
    return plan


def to_wav(mp3: Path) -> Path:
    wav = mp3.with_suffix(".wav")
    run(["ffmpeg", "-y", "-i", _safe(mp3), "-ar", "24000", "-ac", "1", _safe(wav)])
    return wav


def concat(wavs: list[Path], out: Path) -> None:
    lst = TMP / f"{out.stem}.txt"
    lst.write_text("".join(f"file '{_safe(w).replace(chr(92), '/')}'\n" for w in wavs), encoding="utf-8")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", _safe(lst), "-c", "copy", _safe(out)])


async def main() -> None:
    check_sync()
    plan = await gen_sentences()

    beat_wavs, beat_words = {}, {}
    for b in BEATS["beats"]:
        sid = b["id"]
        sents = [p for p in plan if p["beat"] == sid]
        wavs, t = [], 0.0
        for s in sents:
            wavs.append(to_wav(s["path"]))
            for w in s["words"]:
                w["abs_t0"] = round(b["start_s"] + LEAD_IN_S + t + w["t0"], 3)
            t += s["dur"] + GAP_S
        for k in range(len(wavs) - 1):
            g = TMP / f"gap_{sid}_{k}.wav"
            run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                 "-t", str(GAP_S), _safe(g)])
            wavs.insert(1 + 2 * k, g)
        beat_wav = OUT / f"beat_{sid:02d}.wav"
        concat(wavs, beat_wav)
        beat_wavs[sid] = beat_wav
        beat_words[sid] = [w for s in sents for w in s["words"]]
        dur = WAVE(str(_safe(beat_wav))).info.length
        slot = b["duration_s"]
        flag = "OK " if dur <= slot - 0.5 else "TIGHT" if dur <= slot else "OVER!"
        print(f"beat {sid}: {dur:.1f}s / {slot}s  [{flag}]")

    padded = []
    for b in BEATS["beats"]:
        sid = b["id"]
        p = TMP / f"pad_{sid:02d}.wav"
        delay_ms = int(LEAD_IN_S * 1000)
        run(["ffmpeg", "-y", "-i", _safe(beat_wavs[sid]),
             "-af", f"adelay={delay_ms}:all=1,apad=whole_dur={b['duration_s']}",
             "-ar", "24000", "-ac", "1", _safe(p)])
        padded.append(p)
    master_wav = TMP / "master.wav"
    lst = TMP / "master.txt"
    lst.write_text("".join(f"file '{_safe(p).replace(chr(92), '/')}'\n" for p in padded), encoding="utf-8")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", _safe(lst), "-c", "copy", _safe(master_wav)])
    run(["ffmpeg", "-y", "-i", _safe(master_wav), "-codec:a", "libmp3lame", "-b:a", "192k",
         "-ar", "24000", "-ac", "1", _safe(OUT / "master_vo.mp3")])

    total = mutagen.mp3.MP3(str(_safe(OUT / "master_vo.mp3"))).info.length
    manifest = {
        "voice": VOICE,
        "style": "expressive female narrator; per-sentence rate/pitch direction",
        "master": "master_vo.mp3",
        "total_seconds": round(total, 2),
        "beats": [{"id": b["id"], "start_s": b["start_s"], "slot_s": b["duration_s"],
                   "audio": f"beat_{b['id']:02d}.wav", "caption": b["caption"]} for b in BEATS["beats"]],
        "word_timings": beat_words,
    }
    (OUT / "vo_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2),
                                          encoding="utf-8")
    print(f"master_vo.mp3: {total:.1f}s (target 180s)")
    for f in sorted(OUT.glob("*")):
        if f.is_file():
            print(" -", f.name)


if __name__ == "__main__":
    asyncio.run(main())
