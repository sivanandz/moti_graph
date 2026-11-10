"""Compose fullbleed 9:16 plates s02-s07 from real archival photos + vector assets.

Style: Tactile Retro-Digital Ephemera — archival photos get a Bayer-halftone
(ink on cream, occasional red fleck) and polaroid frames; vector stamps,
tickers, charts and cards are composited on the deckle-paper / carbon-void
backdrops. Headlines/captions/kickers are NOT drawn here — the Remotion
renderer adds type over the plate. Outputs use the sm renderer's exact naming:
02_assets/style_motion/s0N_plate.png (s01 already exists from nanobanana).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

PROJ = Path(__file__).resolve().parents[1]
IMG = PROJ / "04_images"
VEC = PROJ / "02_assets" / "vector"
OUT = PROJ / "02_assets" / "style_motion"

W, H = 1080, 1920
PAPER, SHADE, INK = (244, 239, 230), (235, 227, 213), (25, 25, 25)
RED, GREEN, PILL, VOID = (222, 56, 49), (37, 72, 56), (234, 224, 200), (12, 12, 12)
rng = np.random.default_rng(23)


def F(name: str, size: int):
    try:
        return ImageFont.truetype(rf"C:\Windows\Fonts\{name}", size)
    except OSError:
        return ImageFont.load_default()


MONO = lambda s: F("cour.ttf", s)
MONO_B = lambda s: F("courbd.ttf", s)

BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16.0


def halftone(src, w: int) -> Image.Image:
    im = src.convert("L") if isinstance(src, Image.Image) else Image.open(src).convert("L")
    h = max(1, int(im.height * w / im.width))
    im = im.resize((w, h), Image.Resampling.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=1)
    arr = np.asarray(im).astype(np.float32) / 255.0
    th = np.tile(BAYER + 0.0625, (h // 4 + 1, w // 4 + 1))[:h, :w]
    dark = arr < th * 0.92
    out = np.full((h, w, 3), 247, np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = 244, 239, 230
    out[dark] = (25, 25, 25)
    fleck = (rng.random((h, w)) > 0.998) & dark
    out[fleck] = RED
    return Image.fromarray(out, "RGB")


def polaroid(src: Path, w: int, caption: str, angle: float = 0.0) -> Image.Image:
    ph = halftone(src, w - 36)
    cap_h = 66
    frame = Image.new("RGBA", (w, ph.height + cap_h + 46), (255, 253, 246, 255))
    d = ImageDraw.Draw(frame)
    d.rectangle((0, 0, w - 1, frame.height - 1), outline=(190, 185, 175, 255), width=2)
    frame.paste(ph, (18, 18))
    d.text((22, ph.height + 30), caption, font=MONO(24), fill=INK + (255,))
    return frame.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)


def vec(name: str) -> Image.Image:
    return Image.open(VEC / name).convert("RGBA")


def paper_bg(speck_seed_shift: int = 0) -> Image.Image:
    img = vec("paper_cream.png").copy()
    d = ImageDraw.Draw(img)
    r = np.random.default_rng(7 + speck_seed_shift)
    for _ in range(2200):
        x, y = int(r.integers(0, W)), int(r.integers(0, H))
        rr = int(r.integers(1, 3))
        d.ellipse((x, y, x + rr, y + rr), fill=(214, 205, 190, r.integers(25, 80)))
    return img


def put(canvas: Image.Image, piece: Image.Image, xy: tuple[int, int]):
    canvas.alpha_composite(piece, xy)


def new_plate(void: bool = False, seed: int = 0) -> Image.Image:
    img = vec("paper_void.png").copy() if void else paper_bg(seed)
    if not void:
        img.alpha_composite(vec("film_grain.png"))
    return img


def light_mode(img: Image.Image) -> Image.Image:
    """Recolor near-ink pixels to paper for charts placed on the void background."""
    arr = np.asarray(img.convert("RGBA")).copy()
    dark = (arr[..., :3] < 70).all(axis=2)
    arr[dark, 0], arr[dark, 1], arr[dark, 2] = 244, 239, 230
    return Image.fromarray(arr, "RGBA")


def plate_s01() -> Image.Image:
    img = new_plate(seed=0)
    st = vec("stamp_23may1967.png")
    put(img, st.rotate(-6, expand=True, resample=Image.Resampling.BICUBIC), (150, 320))
    ca = Image.open(IMG / "beat1_clear_bmews_antenna.jpg").convert("RGB")
    ca = ca.crop((0, 0, int(ca.width * 0.56), ca.height))  # drop baked-in caption panel
    tmp = IMG / "_clear_crop.jpg"
    ca.save(tmp)
    put(img, polaroid(tmp, 440, "SITE II - CLEAR ALASKA", 1.2), (40, 560))
    put(img, polaroid(IMG / "beat1_thule_radome.jpg", 440, "SITE I - THULE GREENLAND", -1.5), (560, 545))
    put(img, polaroid(IMG / "beat1_fylingdales_golfballs.jpg", 620, "SITE III - FYLINGDALES MOOR UK", 0.8), (230, 1120))
    tmp.unlink(missing_ok=True)
    return img


def plate_s02() -> Image.Image:
    img = new_plate(seed=1)
    put(img, vec("memo_doctrine.png"), (50, 410))
    put(img, polaroid(IMG / "gap_1_b52_alert_pad.jpeg", 880, "B-52 ALERT LINE - ANDERSEN AFB", -1.5), (100, 1075))
    return img


def plate_s03() -> Image.Image:
    img = new_plate(seed=2)
    g = vec("graticule.png").resize((760, 760), Image.Resampling.LANCZOS)
    g.putalpha(g.split()[3].point(lambda a: int(a * 0.45)))
    put(img, g, (160, 300))
    card = Image.new("RGBA", (940, 760), (255, 253, 246, 255))
    d = ImageDraw.Draw(card)
    d.rectangle((0, 0, 939, 759), outline=(190, 185, 175, 255), width=2)
    ph = halftone(IMG / "beat3_carrington_drawing.jpeg", 900)
    card.paste(ph, (20, 20))
    d.text((24, 720), "SUNSPOT GROUP - H-ALPHA PLATE - MAY 1967", font=MONO(24), fill=INK + (255,))
    put(img, card.rotate(0.8, expand=True, resample=Image.Resampling.BICUBIC), (66, 540))
    put(img, vec("chart_freq.png").resize((950, 589), Image.Resampling.LANCZOS), (40, 1326))
    return img


def plate_s04() -> Image.Image:
    img = new_plate(seed=3)
    pano = Image.open(IMG / "gap_3_ent_afb_1962.png").convert("RGB")
    pw = 3000
    left = (pano.width - pw) // 2
    seg = halftone(pano.crop((left, 0, left + pw, pano.height)), 1000)
    card = Image.new("RGBA", (1040, seg.height + 96), (255, 253, 246, 255))
    d = ImageDraw.Draw(card)
    d.rectangle((0, 0, 1039, card.height - 1), outline=(190, 185, 175, 255), width=2)
    card.paste(seg, (20, 18))
    d.text((24, seg.height + 40), "ENT AFB - COLORADO SPRINGS - 1962", font=MONO(26), fill=INK + (255,))
    put(img, card.rotate(-0.7, expand=True, resample=Image.Resampling.BICUBIC), (20, 360))
    qc = Image.new("RGBA", (980, 330), (255, 253, 246, 255))
    d = ImageDraw.Draw(qc)
    d.rectangle((0, 0, 979, 329), outline=INK + (255,), width=4)
    d.text((36, 34), "YES - HALF THE SUN", font=MONO_B(64), fill=INK + (255,))
    d.text((36, 118), "HAS BLOWN AWAY.", font=MONO_B(64), fill=INK + (255,))
    d.line((36, 218, 700, 218), fill=RED + (255,), width=6)
    d.text((36, 250), "COL. ARNOLD L. SNYDER - SOLAR FORECAST CENTER", font=MONO(26), fill=INK + (255,))
    put(img, qc.rotate(0.9, expand=True, resample=Image.Resampling.BICUBIC), (52, 1170))
    put(img, vec("ticker_forecast.png"), (50, 1610))
    return img


def plate_s05() -> Image.Image:
    img = new_plate(seed=4)
    put(img, polaroid(IMG / "gap_2_sac_ops_consoles.jpg", 980, "COMMAND POST - READY-TO-LAUNCH", 0.8), (48, 330))
    st = vec("stamp_standdown.png")
    put(img, st.rotate(-5, expand=True, resample=Image.Resampling.BICUBIC), (330, 1080))
    put(img, vec("chart_standdown.png").resize((1000, 538), Image.Resampling.LANCZOS), (40, 1330))
    return img


def plate_s06() -> Image.Image:
    img = new_plate(seed=5)
    folder = Image.new("RGBA", (880, 560), PILL + (255,))
    d = ImageDraw.Draw(folder)
    d.rectangle((14, 40, 866, 546), outline=INK + (255,), width=5)
    d.rectangle((14, 0, 420, 48), fill=PILL + (255,), outline=INK + (255,), width=4)
    d.text((40, 74), "CLASSIFIED", font=MONO_B(56), fill=INK + (255,))
    d.text((40, 150), "MAY 1967 INCIDENT FILE", font=MONO(30), fill=INK + (255,))
    d.text((40, 200), "// DO NOT REMOVE FROM ROOM", font=MONO(30), fill=INK + (255,))
    put(img, folder.rotate(-1.0, expand=True, resample=Image.Resampling.BICUBIC), (100, 430))
    st = vec("stamp_declassified.png")
    put(img, st.rotate(-7, expand=True, resample=Image.Resampling.BICUBIC), (170, 630))
    put(img, vec("ticker_paper2016.png"), (50, 1120))
    pc = vec("punchcard_1966.png").resize((900, 367), Image.Resampling.LANCZOS)
    put(img, pc.rotate(-1.2, expand=True, resample=Image.Resampling.BICUBIC), (86, 1490))
    return img


def plate_s07() -> Image.Image:
    img = new_plate(void=True)
    put(img, light_mode(vec("chart_cycles.png")).resize((1000, 577), Image.Resampling.LANCZOS), (40, 560))
    st = vec("stamp_cycle25.png")
    put(img, st.rotate(-6, expand=True, resample=Image.Resampling.BICUBIC), (560, 452))
    put(img, polaroid(IMG / "gap_6_montreal_night.jpg", 470, "GRID AT NIGHT - MONTREAL", -1.8), (44, 1240))
    put(img, polaroid(IMG / "beat5_iss_aurora.jpg", 470, "AURORA - ISS VIEW", 1.8), (566, 1240))
    d = ImageDraw.Draw(img)
    d.text((44, 1152), "THE SUN NEVER DEMOBILIZED.", font=MONO_B(40), fill=(244, 239, 230, 255))
    small = F("cour.ttf", 21)
    credits = ("PHOTOS: L.KIRTON · HARKE · J.PURVIS · RAJ&NEHA (CC) + USAF/NASA/NOAA (PD)",
               "RESEARCH: KNIPP ET AL. 2016, SPACE WEATHER 14(9) - DOI 10.1002/2016SW001423")
    for i, line in enumerate(credits):
        d.text((46, 1712 + i * 30), line, font=small, fill=(200, 194, 182, 255))
    return img


if __name__ == "__main__":
    # renderer requires a hero layer per scene; it draws even in fullbleed, so
    # heroes are fully transparent stand-ins (content lives in the plate only)
    def hero_stub():
        h = Image.new("RGBA", (540, 960), (0, 0, 0, 0))
        return h

    plate_s01_fn = plate_s01
    p1_old = OUT / "s01_plate.png"
    if p1_old.exists():  # keep the nanobanana original as backup
        p1_old.rename(OUT / "s01_plate_nanobanana.png")
    for n, fn in {1: plate_s01_fn, 2: plate_s02, 3: plate_s03, 4: plate_s04,
                  5: plate_s05, 6: plate_s06, 7: plate_s07}.items():
        plate = fn().convert("RGB")
        plate.save(OUT / f"s{n:02d}_plate.png")
        hero_stub().save(OUT / f"s{n:02d}_hero.png")
        print(f"s{n:02d}_plate.png {plate.size} (+transparent hero)")
    print("done ->", OUT)
