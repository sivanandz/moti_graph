#!/usr/bin/env python3
"""Style-locked motion graphics: Google Antigravity NanoBanana 2+ makes the layered art, Manim makes animated plots/graphs, Remotion animates it in code.
Adapted for Antigravity (Windows PowerShell & Cross-Platform).

  styles                              list saved styles
  learn <name> <image|video> ...      new style from reference images or a video (frames + palette)
  new <slug> --style <name>           scaffold <projects>/<slug>/04_data/style_motion.json
  plot <slug> [--scene N] [--force]   Manim Community: render animated plots/graphs (transparent WebM or MP4)
  assets <slug> [--scene N]           Antigravity NanoBanana + Manim: per scene plate + cut-outs + animated plots
  render <slug> [--still] [--layout L] [--format F] [--out name]
                                      stage to remotion_studio/public, render MP4 (or entry/exit stills)
  summary <slug>                      asset inventory and generation manifest for the campaign
  install                             copy the Remotion templates into Remotion project src/
  doctor                              check Antigravity CLI, node, Remotion, Manim, templates and every style file
  pack [--out dir]                    zip the skill (scripts, styles, templates) to share or reuse elsewhere

Formats: 9x16 (1080x1920), 4x5 (1080x1350), 1x1 (1080x1080), 16x9 (1920x1080).
Layouts: orbit (centered collage), fullbleed (plate as the frame), stack (hero + props in a row),
         split (hero beside text), plot (dedicated Manim data/math plot showcase within safe area).
"""
import argparse
import base64
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from manim_plots import find_manim, has_latex, render_scene_plot

ROOT = Path(os.environ.get("STYLE_MOTION_ROOT", Path.cwd())).resolve()
SKILL = SCRIPT_DIR.parent
STYLES = SKILL / "styles"
CAMPAIGNS = (ROOT / os.environ.get("STYLE_MOTION_PROJECTS", "production_hub")).resolve()
CACHE = CAMPAIGNS / "assets/gen_cache"


def resolve_remotion_dir():
    if os.environ.get("STYLE_MOTION_REMOTION"):
        return (ROOT / os.environ["STYLE_MOTION_REMOTION"]).resolve()
    if (ROOT / "remotion_studio" / "package.json").exists():
        return (ROOT / "remotion_studio").resolve()
    if (ROOT / "package.json").exists():
        try:
            pkg = (ROOT / "package.json").read_text(encoding="utf-8", errors="ignore")
            if "remotion" in pkg:
                return ROOT.resolve()
        except Exception:
            pass
    return (ROOT / "remotion_studio").resolve()


REMOTION = resolve_remotion_dir()
NPX = "npx.cmd" if os.name == "nt" else "npx"
TEMPLATES = SKILL / "templates/remotion"
FORMATS = {"9x16": (1080, 1920), "4x5": (1080, 1350), "1x1": (1080, 1080), "16x9": (1920, 1080)}
ASPECT = {"9x16": "9:16", "4x5": "4:5", "1x1": "1:1", "16x9": "16:9"}
LAYOUTS = ("orbit", "fullbleed", "stack", "split", "plot", "canvas")


def find_agy() -> str | None:
    """Find Google Antigravity CLI executable."""
    which = shutil.which("agy")
    if which:
        return which
    candidates = [
        Path.home() / "AppData/Local/agy/bin/agy.exe",
        Path.home() / ".gemini/bin/agy.exe",
        Path.home() / ".local/bin/agy.exe",
        Path.home() / ".local/bin/agy",
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return None


def make_cutout_transparent(src_path: Path, dst_path: Path, threshold: int = 240) -> Path:
    """Turn white/neutral background of a cut-out element into transparent alpha using PIL + scipy flood fill."""
    from PIL import Image
    import numpy as np

    img = Image.open(src_path).convert("RGBA")
    arr = np.array(img)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    is_white = (r >= threshold) & (g >= threshold) & (b >= threshold)

    try:
        from scipy.ndimage import label
        labeled, _ = label(is_white)
        border_labels = set(labeled[0, :]).union(labeled[-1, :]).union(labeled[:, 0]).union(labeled[:, -1])
        border_mask = np.isin(labeled, list(border_labels - {0}))
        arr[border_mask, 3] = 0
    except Exception:
        arr[is_white, 3] = 0

    out_img = Image.fromarray(arr, "RGBA")
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    out_img.save(dst_path, format="PNG")
    return dst_path


def generate_nanobanana_image(prompt: str, out_path: Path, aspect_ratio: str = "1:1", force: bool = False) -> Path:
    """Generate an image using Antigravity NanoBanana 2+ with content-hash disk caching."""
    key = hashlib.sha256(json.dumps({"engine": "nanobanana-2", "prompt": prompt, "aspect": aspect_ratio}, sort_keys=True).encode()).hexdigest()[:24]
    hit = CACHE / f"{key}.png"
    if not force and hit.exists():
        print(f"  cache {out_path.name}")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(hit, out_path)
        return out_path

    agy_bin = find_agy()
    CACHE.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if agy_bin:
        cmd = [
            agy_bin,
            "--dangerously-skip-permissions",
            "--print-timeout", "180s",
            "--print",
            f"Generate an image using NanoBanana 2+ matching prompt: '{prompt}'. Save the generated PNG image directly to exact absolute path: '{out_path.resolve()}'",
        ]
        print(f"  nanobanana-2 -> {out_path.name}")
        try:
            subprocess.run(cmd, check=True, timeout=210)
        except Exception as e:
            print(f"  warning: agy generation ({e}); checking fallback")

    if not out_path.exists():
        # Synthesize fallback canvas when offline or queue unavailable
        from PIL import Image, ImageDraw
        w, h = (1080, 1920) if aspect_ratio == "9:16" else (1080, 1080)
        im = Image.new("RGBA", (w, h), (245, 245, 245, 255))
        d = ImageDraw.Draw(im)
        d.text((40, h // 2), f"[NanoBanana 2+ Placeholder]\n{prompt[:90]}...", fill=(30, 30, 30, 255))
        im.save(out_path, format="PNG")

    shutil.copy(out_path, hit)
    return out_path


def load_style(name):
    p = STYLES / name / "style.json"
    if not p.exists():
        sys.exit(f"no style '{name}'; run: styles")
    return json.loads(p.read_text(encoding="utf-8")), STYLES / name


def plan_path(slug):
    return CAMPAIGNS / slug / "04_data/style_motion.json"


# ---------- commands ----------

def cmd_styles(_):
    for d in sorted(STYLES.iterdir()):
        if (d / "style.json").exists():
            s = json.loads((d / "style.json").read_text(encoding="utf-8"))
            if d.name.startswith("_"):
                continue
            print(f"{d.name:28} layout={s.get('layout', 'orbit'):9} {s.get('label', '')}  ({len(list((d / 'refs').glob('*')))} refs)")


def cmd_learn(a):
    import cv2
    import numpy as np
    d = STYLES / a.name
    (d / "refs").mkdir(parents=True, exist_ok=True)
    frames = []
    for src in a.sources:
        src = Path(src)
        if src.suffix.lower() in (".mp4", ".mov", ".webm", ".m4v"):
            dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                                 "-of", "csv=p=0", str(src)], shell=(os.name == "nt")).decode())
            for i in range(a.frames):
                t = dur * (i + 0.5) / a.frames
                out = d / "refs" / f"{src.stem}_{int(t)}.jpg"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(src), "-frames:v", "1",
                                "-q:v", "2", str(out)], check=True, shell=(os.name == "nt"))
                frames.append(out)
        else:
            out = d / "refs" / src.name
            shutil.copy(src, out)
            frames.append(out)
    px = np.concatenate([cv2.resize(cv2.imread(str(f)), (96, 170)).reshape(-1, 3) for f in frames]).astype(np.float32)
    _, labels, centers = cv2.kmeans(px, 7, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1), 3,
                                    cv2.KMEANS_PP_CENTERS)
    order = np.argsort(-np.bincount(labels.ravel()))
    hexes = ["#%02X%02X%02X" % tuple(int(c) for c in centers[i][::-1]) for i in order]
    base = json.loads((STYLES / "_template/style.json").read_text(encoding="utf-8"))
    base.update({"name": a.name, "label": f"{a.name} (draft: rewrite prompts after viewing refs)",
                 "source": ", ".join(Path(s).name for s in a.sources),
                 "measuredPalette": hexes})
    if not (d / "style.json").exists() or a.force:
        (d / "style.json").write_text(json.dumps(base, indent=2), encoding="utf-8")
    print(f"style draft: {d / 'style.json'}\nmeasured palette (by area): {' '.join(hexes)}")
    print("next: view refs/, then rewrite palette, imagePrompt, elementPrompt, type and motion.rules in style.json")


DEMO_PLOTS = [
    {"type": "line", "title": "Signal Surge", "subtitle": "Anomalous telemetry (ms)",
     "data": [[0, 12], [1, 19], [2, 24], [3, 48], [4, 72], [5, 96]], "y_suffix": "%", "threshold": 75, "threshold_label": "ALERT"},
    {"type": "bar", "title": "Compute Spend", "subtitle": "Quarterly allocation",
     "labels": ["Q1", "Q2", "Q3", "Q4"], "data": [18, 34, 52, 88], "y_prefix": "$", "y_suffix": "M"},
    {"type": "function", "title": "Damped Harmonic", "subtitle": "Envelope decay",
     "fn": "math.sin(2.2 * x) * math.exp(-0.22 * x)", "x_range": [0, 8, 2], "y_range": [-1, 1, 0.5], "fill_area": True, "tracker": True},
    {"type": "network", "title": "Routing Mesh", "subtitle": "Active verification nodes", "directed": True,
     "nodes": [{"id": "S", "label": "Sensor", "pos": [-3.0, 0.8]}, {"id": "G", "label": "Gate", "pos": [0.0, 1.5]},
               {"id": "V", "label": "Verify", "pos": [0.0, -1.2]}, {"id": "A", "label": "Alert", "pos": [3.0, 0.2]}],
     "edges": [["S", "G"], ["S", "V"], ["G", "V"], ["G", "A"], ["V", "A"]]},
]


def cmd_new(a):
    style, _ = load_style(a.style)
    p = plan_path(a.slug)
    if p.exists() and not a.force:
        sys.exit(f"exists: {p} (use --force)")
    p.parent.mkdir(parents=True, exist_ok=True)
    scenes = []
    for i in range(a.scenes):
        entry = {
            "id": i + 1, "seconds": 4.0,
            "layout": "plot" if a.plot else style.get("layout", "orbit"),
            "kicker": f"BEAT {i + 1:02d}" if a.plot else "",
            "headline": "TWO TO FOUR WORDS", "accent": ["WORDS"],
            "caption": "the spoken phrase for this beat",
            "scene": "one visual metaphor: what the full scene shows",
            "hero": "" if a.plot else "the main subject, specific and drawable",
            "props": [] if a.plot else ["supporting object one", "supporting object two"],
            "backdrop": "" if a.plot else "flat backing shape or texture fragment (or delete)",
            "circles": list(style.get("defaultCircles", ["accent", "accent2"])),
        }
        if a.plot:
            entry["plot"] = DEMO_PLOTS[i % len(DEMO_PLOTS)]
            entry["skip_image"] = True
        scenes.append(entry)
    plan = {
        "slug": a.slug, "style": a.style, "format": a.format,
        "vo": str(CAMPAIGNS / a.slug / "03_audio/master_vo.mp3"),
        "scenes": scenes,
    }
    p.write_text(json.dumps(plan, indent=2), encoding="utf-8")
    print(f"plan: {p}\nfill one entry per VO beat; set seconds from the VO (or start/end in seconds).")


def _render_scene_manim(sc, style, fmt, out_dir: Path, force: bool = False):
    n = sc["id"]
    plot_spec = sc.get("plot")
    if not plot_spec:
        return None
    secs = float(sc.get("end", sc.get("start", 0.0) + sc.get("seconds", 4.0)) - sc.get("start", 0.0))
    res = render_scene_plot(
        plot_spec=plot_spec,
        style=style,
        fmt=fmt,
        seconds=secs,
        out_webm=out_dir / f"s{n:02d}_plot.webm",
        cache_dir=CACHE,
        root_dir=ROOT,
        force=force,
    )
    hero_png = out_dir / f"s{n:02d}_hero.png"
    if not hero_png.exists() and (sc.get("skip_image") or sc.get("skip_fal") or not sc.get("hero")):
        shutil.copy(res["preview"], hero_png)
    return res


def cmd_plot(a):
    plan = json.loads(plan_path(a.slug).read_text(encoding="utf-8"))
    style, _ = load_style(plan["style"])
    fmt = plan.get("format", "9x16")
    out = CAMPAIGNS / a.slug / "02_assets/style_motion"
    count = 0
    for sc in plan["scenes"]:
        if a.scene and sc["id"] != a.scene:
            continue
        if sc.get("plot"):
            print(f"scene {sc['id']} (manim plot)")
            _render_scene_manim(sc, style, fmt, out, force=a.force)
            count += 1
    if count == 0:
        print(f"no scenes with 'plot' specification found in {plan_path(a.slug)}")
    else:
        print(f"plots rendered ({count}): {out}")


def cmd_assets(a):
    plan = json.loads(plan_path(a.slug).read_text(encoding="utf-8"))
    style, sdir = load_style(plan["style"])
    fmt = plan.get("format", "9x16")
    out = CAMPAIGNS / a.slug / "02_assets/style_motion"
    for sc in plan["scenes"]:
        if a.scene and sc["id"] != a.scene:
            continue
        n = sc["id"]
        print(f"scene {n}")
        if sc.get("plot"):
            _render_scene_manim(sc, style, fmt, out, force=getattr(a, "force", False))
        if sc.get("skip_image") or sc.get("skip_fal") or (sc.get("plot") and not sc.get("hero")):
            continue

        plate_prompt = (
            f"{style['imagePrompt']}. Scene: {sc['scene']}. Hero: {sc['hero']}. "
            f"Avoid: {style['negative']}. Render high contrast clean style-locked composition."
        )
        generate_nanobanana_image(plate_prompt, out / f"s{n:02d}_plate.png", aspect_ratio=ASPECT[fmt], force=getattr(a, "force", False))

        parts = [("hero", sc["hero"])] + [(f"prop{i + 1}", p) for i, p in enumerate(sc.get("props", []))]
        if sc.get("backdrop"):
            parts.append(("backdrop", sc["backdrop"]))
        for tag, subject in parts:
            if not subject:
                continue
            elem_prompt = (
                style["elementPrompt"].format(subject=subject)
                + ". Plain solid pure white background (#FFFFFF) with zero texture or shading on the background."
            )
            raw_path = out / "raw" / f"s{n:02d}_{tag}.png"
            generate_nanobanana_image(elem_prompt, raw_path, aspect_ratio="1:1", force=getattr(a, "force", False))
            make_cutout_transparent(raw_path, out / f"s{n:02d}_{tag}.png")

    print(f"assets: {out}")


def cmd_render(a):
    plan = json.loads(plan_path(a.slug).read_text(encoding="utf-8"))
    style, _ = load_style(plan["style"])
    src = CAMPAIGNS / a.slug / "02_assets/style_motion"
    stage = REMOTION / "public/style-motion" / a.slug
    shutil.rmtree(stage, ignore_errors=True)
    stage.mkdir(parents=True, exist_ok=True)
    fmt = a.format or plan.get("format", "9x16")
    style = {**style, "canvas": {**style.get("canvas", {}), "width": FORMATS[fmt][0], "height": FORMATS[fmt][1],
                                 "fps": style.get("canvas", {}).get("fps", 30)}}
    if a.layout:
        style["layout"] = a.layout
    fps = style["canvas"]["fps"]
    ensure_installed()
    scenes, t = [], 0.0
    for sc in plan["scenes"]:
        n = sc["id"]
        start = sc.get("start", t)
        end = sc.get("end", start + sc["seconds"])
        t = end
        layers = {}
        for f in sorted(src.glob(f"s{n:02d}_*.png")):
            shutil.copy(f, stage / f.name)
            key = f.stem.split("_", 1)[1]
            layers[key if key != "plot" else "plot_still"] = f"style-motion/{a.slug}/{f.name}"
        for ext in ("webm", "mp4"):
            for f in sorted(src.glob(f"s{n:02d}_*.{ext}")):
                shutil.copy(f, stage / f.name)
                layers[f.stem.split("_", 1)[1]] = f"style-motion/{a.slug}/{f.name}"
        if "hero" not in layers and "plot" not in layers and not sc.get("canvas"):
            sys.exit(f"scene {n}: no assets; run assets or plot {a.slug}")
        if a.layout:
            sc = {**sc, "layout": a.layout}
        scenes.append({**sc, "from": round(start * fps), "frames": round((end - start) * fps), "layers": layers})
    audio = None
    if plan.get("vo") and (ROOT / plan["vo"]).exists():
        shutil.copy(ROOT / plan["vo"], stage / "vo.mp3")
        audio = f"style-motion/{a.slug}/vo.mp3"
    props = {"style": style, "scenes": scenes, "audio": audio}
    pf = stage / "props.json"
    pf.write_text(json.dumps(props), encoding="utf-8")
    vid = CAMPAIGNS / a.slug / "04_video"
    vid.mkdir(parents=True, exist_ok=True)
    entry, comp = "src/StyleMotionEntry.ts", "StyleMotion"
    if a.still:
        for sc in scenes:
            for k, f in (("in", sc["from"] + 20), ("out", sc["from"] + sc["frames"] - 2)):
                o = vid / "qa" / f"s{sc['id']:02d}_{k}.png"
                o.parent.mkdir(parents=True, exist_ok=True)
                subprocess.run([NPX, "remotion", "still", entry, comp, str(o), f"--props={pf}",
                                f"--frame={f}"], cwd=REMOTION, check=True, shell=(os.name == "nt"))
        print(f"stills: {vid / 'qa'}")
        return
    o = vid / (a.out or "style_motion.mp4")
    subprocess.run([NPX, "remotion", "render", entry, comp, str(o), f"--props={pf}",
                    "--concurrency=1"], cwd=REMOTION, check=True, shell=(os.name == "nt"))
    print(f"video: {o}")


def cmd_summary(a):
    src = CAMPAIGNS / a.slug / "02_assets/style_motion"
    if not src.exists():
        print(f"no assets found for '{a.slug}'")
        return
    imgs = list(src.glob("*.png"))
    vids = list(src.glob("*.webm")) + list(src.glob("*.mp4"))
    print(f"Campaign: {a.slug}")
    print(f"  Images / Cutouts: {len(imgs)} PNG files")
    print(f"  Animated Plots:   {len(vids)} video files")
    print("  Generation: Google Antigravity NanoBanana 2+ & Manim Community ($0.00 external API spend)")


def ensure_installed(force=False):
    target_dir = REMOTION / "src"
    target_dir.mkdir(parents=True, exist_ok=True)
    for f in TEMPLATES.glob("*.ts*"):
        dst = target_dir / f.name
        if force or not dst.exists() or dst.read_bytes() != f.read_bytes():
            shutil.copy(f, dst)
            print(f"  installed {dst.relative_to(ROOT) if dst.is_relative_to(ROOT) else dst}")


def cmd_install(_):
    if not (REMOTION / "package.json").exists():
        sys.exit(f"no Remotion project at {REMOTION}")
    ensure_installed(force=True)


REQUIRED = ["palette", "imagePrompt", "elementPrompt", "negative", "type"]


def cmd_doctor(_):
    ok = True
    def check(cond, msg):
        nonlocal ok
        print(("ok   " if cond else "FAIL ") + msg)
        ok = ok and cond

    agy_bin = find_agy()
    check(agy_bin is not None, f"Google Antigravity CLI (agy) installed ({agy_bin or 'missing: install agy.exe'})")
    check(shutil.which(NPX) is not None or shutil.which("npx") is not None, f"npx on PATH ({NPX})")
    check(shutil.which("ffmpeg") is not None, "ffmpeg on PATH")
    manim_bin = find_manim()
    check(manim_bin is not None, f"Manim Community installed ({manim_bin or 'missing: uv tool install --python 3.12 manim'})")
    print(f"info LaTeX (MathTex): {'available' if has_latex() else 'not installed (using Pango Text default)'}")
    rem_installed = (REMOTION / "package.json").exists() and ((REMOTION / "node_modules/remotion").exists() or (ROOT / "node_modules/remotion").exists())
    check(rem_installed, f"Remotion installed at {REMOTION}")
    for f in TEMPLATES.glob("*.ts*"):
        dst = REMOTION / "src" / f.name
        check(dst.exists() and dst.read_bytes() == f.read_bytes(), f"template in sync: {f.name}")
    for d in sorted(STYLES.iterdir()):
        if not (d / "style.json").exists() or d.name.startswith("_"):
            continue
        st = json.loads((d / "style.json").read_text(encoding="utf-8"))
        miss = [k for k in REQUIRED if k not in st]
        refs = list((d / "refs").glob("*")) if (d / "refs").exists() else []
        check(not miss and "{subject}" in st.get("elementPrompt", "") and refs and st.get("layout", "orbit") in LAYOUTS,
              f"style {d.name}: fields {'ok' if not miss else miss}, {len(refs)} refs, layout {st.get('layout', 'orbit')}")
    sys.exit(0 if ok else 1)


def cmd_pack(a):
    out = Path(a.out or CAMPAIGNS / "assets/skill_packs")
    out.mkdir(parents=True, exist_ok=True)
    ensure_installed()
    z = shutil.make_archive(str(out / f"style-motion-{time.strftime('%Y%m%d')}"), "zip", SKILL.parent, SKILL.name)
    print(f"pack: {z}\nunzip into <project>/.agents/skills/, then run: python .agents/skills/style-motion/scripts/style_motion.py install")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("styles").set_defaults(fn=cmd_styles)
    p = sub.add_parser("learn"); p.add_argument("name"); p.add_argument("sources", nargs="+")
    p.add_argument("--frames", type=int, default=6); p.add_argument("--force", action="store_true")
    p.set_defaults(fn=cmd_learn)
    p = sub.add_parser("new"); p.add_argument("slug"); p.add_argument("--style", required=True)
    p.add_argument("--scenes", type=int, default=8); p.add_argument("--force", action="store_true")
    p.add_argument("--format", choices=FORMATS, default="9x16")
    p.add_argument("--plot", action="store_true", help="Scaffold scenes with Manim plot presets")
    p.set_defaults(fn=cmd_new)
    p = sub.add_parser("plot"); p.add_argument("slug"); p.add_argument("--scene", type=int)
    p.add_argument("--force", action="store_true"); p.set_defaults(fn=cmd_plot)
    p = sub.add_parser("assets"); p.add_argument("slug"); p.add_argument("--scene", type=int)
    p.add_argument("--force", action="store_true"); p.set_defaults(fn=cmd_assets)
    p = sub.add_parser("render"); p.add_argument("slug"); p.add_argument("--still", action="store_true")
    p.add_argument("--layout", choices=LAYOUTS); p.add_argument("--format", choices=FORMATS); p.add_argument("--out")
    p.set_defaults(fn=cmd_render)
    p = sub.add_parser("summary"); p.add_argument("slug"); p.set_defaults(fn=cmd_summary)
    sub.add_parser("install").set_defaults(fn=cmd_install)
    sub.add_parser("doctor").set_defaults(fn=cmd_doctor)
    p = sub.add_parser("pack"); p.add_argument("--out"); p.set_defaults(fn=cmd_pack)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
