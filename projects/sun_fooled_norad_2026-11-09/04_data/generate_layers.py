"""Generate style_motion scene layers via the local Antigravity CLI (agy.exe) nanobanana.

Antigravity native pipeline:
  raw image   : agy --print -> image-generator subagent -> generate_image (NanoBanana 2+)
  cutout key  : local white-border flood-fill keying (PIL + scipy)
Outputs land in 02_assets/style_motion/ using the exact naming the sm renderer expects:
  s{nn}_plate.png (opaque 9:16), raw/s{nn}_{tag}.png (white bg), s{nn}_{tag}.png (keyed RGBA)
Resume-safe: skips any target file that already exists. Stops early on quota exhaustion.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

REPO = Path(__file__).resolve().parents[3]
SLUG_DIR = Path(__file__).resolve().parents[1]
AGY = Path(r"C:\Users\sivan\.gemini\bin\agy.exe")
STYLE_DIR = REPO / ".agents" / "skills" / "style-motion" / "styles"
REF_DIR = STYLE_DIR / "retro-digital-ephemera" / "refs"
RAW_DIR = SLUG_DIR / "02_assets" / "style_motion" / "raw"
OUT_DIR = SLUG_DIR / "02_assets" / "style_motion"
LOG = SLUG_DIR / "04_data" / "generation_log.jsonl"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def key_white(src: Path, dst: Path, thr: int = 235) -> None:
    """Make border-connected near-white pixels transparent; preserve interior fills."""
    img = np.asarray(Image.open(src).convert("RGB"), dtype=np.uint8)
    near_white = img.min(axis=2) >= thr
    lbl, _ = ndimage.label(near_white)
    border_labels = set(np.concatenate((lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1])).tolist()) - {0}
    bg = np.isin(lbl, list(border_labels)) if border_labels else np.zeros_like(near_white)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    alpha = np.clip(ndimage.gaussian_filter(alpha.astype(np.float32), sigma=0.7), 0, 255).astype(np.uint8)
    Image.fromarray(np.dstack([img, alpha]), "RGBA").save(dst)


def agy_image(prompt: str, target: Path, timeout: int = 240) -> str:
    """Run one agy generation. Returns 'ok', 'quota', or 'fail:<snippet>'."""
    if target.exists() and target.stat().st_size > 10_000:
        return "ok"
    target.parent.mkdir(parents=True, exist_ok=True)
    full = (
        "Use your image generation tool (nano-banana / Gemini image model) to create ONE image. "
        + prompt
        + " Match the visual style of these local reference images: "
        + "; ".join(str(p) for p in sorted(REF_DIR.glob("frame_*.jpg"))[:4])
        + ". Save the PNG to exactly this path: "
        + str(target)
        + " (create parent folders if needed). Reply only with the saved absolute path."
    )
    try:
        r = subprocess.run(
            [str(AGY), "--dangerously-skip-permissions", "--print-timeout", "180s", "--print", full],
            cwd=str(REPO), capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return "fail:timeout"
    text = ((r.stdout or "") + "\n" + (r.stderr or "")).strip()
    if target.exists() and target.stat().st_size > 10_000:
        return "ok"
    low = text.lower()
    if "resource_exhausted" in low or "quota" in low:
        return "quota"
    snippet = text[-300:].replace("\n", " | ") if text else "no output"
    return f"fail:{snippet}"


def log(entry: dict) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def main() -> int:
    plan = load(SLUG_DIR / "04_data" / "style_motion.json")
    style = load(STYLE_DIR / plan["style"] / "style.json")
    fmt = plan.get("format", "9x16")
    aspect = {"9x16": "vertical 9:16 portrait composition, 1080x1920"}.get(fmt, "square 1:1")

    jobs = []
    for sc in plan["scenes"]:
        n = sc["id"]
        jobs.append(("plate", n, None,
                     f"{style['imagePrompt'].replace('{subject}', sc['scene'])}. Scene: {sc['scene']}. "
                     f"Hero: {sc['hero']}. Avoid: {style['negative']}. {aspect}."))
        parts = [("hero", sc["hero"])] + [(f"prop{i + 1}", p) for i, p in enumerate(sc.get("props", []))]
        if sc.get("backdrop"):
            parts.append(("backdrop", sc["backdrop"]))
        for tag, subject in parts:
            jobs.append(("element", n, tag,
                         style["elementPrompt"].replace("{subject}", subject)
                         + ". Same medium, line work and palette as the reference images."))

    print(f"{len(jobs)} jobs", flush=True)
    if os.environ.get("PLATES_ONLY", "1") == "1":  # quota reality: one image per window
        jobs = [j for j in jobs if j[0] == "plate"]
        print(f"PLATES_ONLY: {len(jobs)} jobs", flush=True)
    failed = []
    for i, (kind, n, tag, prompt) in enumerate(jobs, 1):
        if kind == "plate":
            raw = target = OUT_DIR / f"s{n:02d}_plate.png"
        else:
            raw = RAW_DIR / f"s{n:02d}_{tag}.png"
            target = OUT_DIR / f"s{n:02d}_{tag}.png"
        label = f"s{n:02d}_{tag or 'plate'}"
        t0 = time.time()
        status = "skipped"
        if not (target.exists() and target.stat().st_size > 10_000):
            status = agy_image(prompt, raw)
            if status.startswith("fail:"):  # one retry for transient failures
                time.sleep(20)
                status = agy_image(prompt, raw)
            if status == "ok" and kind != "plate":
                try:
                    key_white(raw, target)
                    status = "ok+keyed"
                except Exception as e:  # noqa: BLE001
                    status = f"key-failed: {e}"
                    failed.append(label)
            elif status == "quota":
                log({"job": label, "kind": kind, "status": "quota-exhausted-batch-stopped",
                     "seconds": round(time.time() - t0, 1)})
                print(f"[{i}/{len(jobs)}] {label}: quota exhausted - stopping batch (resume later)", flush=True)
                return 2
            elif status.startswith(("fail", "key-failed")):
                failed.append(label)
        log({"job": label, "kind": kind, "status": status, "seconds": round(time.time() - t0, 1)})
        print(f"[{i}/{len(jobs)}] {label}: {status}", flush=True)

    print("FAILED: " + (", ".join(failed) if failed else "none"), flush=True)
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
