"""Code-drawn (SVG-style) vector assets for the NORAD reel — no AI, no quota.

Draws the retro-digital-ephemera graphic elements with PIL + numpy into
02_assets/vector/: paper textures, rubber stamps, teletype ticker cards,
memo cards, punch cards, and 1-bit-styled data charts.
Palette + typography from styles/retro-digital-ephemera/style.json.
"""
from __future__ import annotations

import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parents[1]
OUT = HERE / "02_assets" / "vector"
OUT.mkdir(parents=True, exist_ok=True)
random.seed(1967)
rng = np.random.default_rng(1967)

PAPER, SHADE, INK = (244, 239, 230), (235, 227, 213), (25, 25, 25)
RED, GREEN, MUTED, PILL, VOID = (222, 56, 49), (37, 72, 56), (117, 150, 107), (234, 224, 200), (12, 12, 12)
BLUE_GRAY = (120, 135, 150)

FONTS = Path(r"C:\Windows\Fonts")


def font(name: str, size: int):
    try:
        return ImageFont.truetype(str(FONTS / name), size)
    except OSError:
        return ImageFont.load_default()


MONO = lambda s: font("cour.ttf", s)
MONO_B = lambda s: font("courbd.ttf", s)
SERIF_B = lambda s: font("timesbd.ttf", s)


def canvas(w, h, color):
    return Image.new("RGBA", (w, h), color + (255,))


def specks(img, n, colors, max_r=2):
    d = ImageDraw.Draw(img)
    for _ in range(n):
        x, y = rng.integers(0, img.width), rng.integers(0, img.height)
        r = int(rng.integers(1, max_r + 1))
        d.ellipse((x, y, x + r, y + r), fill=random.choice(colors) + (rng.integers(30, 110),))
    return img


def save(img, name):
    img.save(OUT / name)
    print(f"vector/{name}")


# ---------------------------------------------------------------- textures
def paper_texture(name, base, speck_colors, w=1080, h=1920):
    img = canvas(w, h, base)
    specks(img, int(w * h / 900), speck_colors)
    # soft vignette
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    shade = np.clip((dist - 0.75) * 0.55, 0, 0.22)
    arr = np.asarray(img)[..., :3].astype(np.float32) * (1 - shade[..., None])
    a = arr.astype(np.uint8)
    img = Image.fromarray(np.dstack([a, np.full((h, w), 255, np.uint8)]), "RGBA")
    save(img, name)


def graticule():
    s = 900
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = BLUE_GRAY + (150,)
    for r in (110, 220, 330, 440):
        d.ellipse((s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r), outline=c, width=2)
    d.line((0, s / 2, s, s / 2), fill=c, width=2)
    d.line((s / 2, 0, s / 2, s), fill=c, width=2)
    for k in (60, 240, 420, 660, 840):
        d.line((k, 0, k, s), fill=BLUE_GRAY + (60,), width=1)
        d.line((0, k, s, k), fill=BLUE_GRAY + (60,), width=1)
    save(img, "graticule.png")


# ---------------------------------------------------------------- stamps
def stamp(text, sub=None, color=RED, w=760):
    pad, h = 26, 150
    f, fs = MONO_B(74), MONO(30)
    probe = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    w = max(w, int(probe.textlength(text, font=f)) + 100)  # never clip the text
    img = Image.new("RGBA", (w, h + (40 if sub else 0)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((4, 4, w - 4, img.height - 4), radius=18, outline=color + (255,), width=7)
    d.rounded_rectangle((16, 16, w - 16, img.height - 16), radius=12, outline=color + (200,), width=2)
    tw = d.textlength(text, font=f)
    d.text(((w - tw) / 2, 20), text, font=f, fill=color + (255,))
    if sub:
        sw = d.textlength(sub, font=fs)
        d.text(((w - sw) / 2, h - 26), sub, font=fs, fill=color + (230,))
    # rubber-stamp distress
    alpha = np.asarray(img)[..., 3]
    mask = rng.random(alpha.shape) > 0.075
    img.putalpha(Image.fromarray((alpha * mask).astype(np.uint8)))
    return img.rotate(-7, expand=True, resample=Image.BICUBIC)


def stamps():
    save(stamp("23 MAY 1967", "BMEWS NET // ALL SITES"), "stamp_23may1967.png")
    save(stamp("JAMMING = ACT OF WAR"), "stamp_actofwar.png")
    save(stamp("VOID", color=RED, w=420), "stamp_void.png")
    save(stamp("DECLASSIFIED", "SPACE WEATHER · SEPT 2016"), "stamp_declassified.png")
    save(stamp("CYCLE 25 MAX", "ANNOUNCED OCT 15 2024"), "stamp_cycle25.png")
    save(stamp("STAND DOWN", color=GREEN), "stamp_standdown.png")


# ---------------------------------------------------------------- cards
def ticker_card(header, lines, w=980):
    lh, pad = 56, 30
    h = pad * 2 + 64 + lh * len(lines)
    img = canvas(w, h, PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, w, h), outline=INK + (255,), width=4)
    d.rectangle((0, 0, w, 58), fill=SHADE + (255,))
    d.line((0, 58, w, 58), fill=RED + (255,), width=3)
    d.text((pad, 12), header, font=MONO_B(30), fill=RED + (255,))
    for x in range(14, 30, 16):  # punched left edge
        for y in range(70, h - 10, 40):
            d.ellipse((x, y, x + 10, y + 10), fill=(200, 200, 195, 255), outline=INK + (180,), width=1)
    y = 76
    for line, bold in lines:
        d.text((52, y), line, font=MONO_B(34) if bold else MONO(32), fill=INK + (255,))
        y += lh
    for _ in range(250):  # paper noise
        x, yy = rng.integers(6, w - 6), rng.integers(64, h - 6)
        d.point((x, yy), fill=SHADE + (rng.integers(60, 160),))
    return img


def memo_card():
    w, h = 980, 620
    img = canvas(w, h, PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, w, h), outline=INK + (255,), width=5)
    d.text((40, 26), "NORAD OPERATIONS DOCTRINE - 1967", font=MONO_B(38), fill=INK + (255,))
    d.line((40, 78, w - 40, 78), fill=INK + (255,), width=3)
    body = [
        "1. DEGRADATION OF BMEWS SITES IS",
        "   CONSISTENT WITH DELIBERATE SOVIET",
        "   JAMMING - TREAT AS PRELUDE TO ATTACK.",
        "2. PLACE ADDITIONAL NUCLEAR FORCES IN",
        "   READY-TO-LAUNCH STATUS.",
        "3. CONFIRM SOURCE OF INTERFERENCE.",
    ]
    y = 104
    for line in body:
        d.text((40, y), line, font=MONO(34), fill=INK + (255,))
        y += 52
    st = stamp("JAMMING = ACT OF WAR", w=700)
    img.alpha_composite(st, (int(w * 0.5 - st.width / 2), h - st.height - 14))
    save(img, "memo_doctrine.png")


def punch_card(label, w=980, h=400):
    img = canvas(w, h, PILL)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, w, h), outline=INK + (255,), width=5)
    d.text((30, 14), label, font=MONO_B(30), fill=INK + (255,))
    for row in range(10):
        y = 70 + row * 31
        for col in range(80):
            x = 26 + col * 11.6
            if rng.random() < 0.14:
                d.ellipse((x, y, x + 8, y + 22), fill=(30, 28, 26, 255))
    for col in range(80):
        x = 26 + col * 11.6
        d.ellipse((x, 52, x + 8, 62), fill=INK + (255,))
    return img


# ---------------------------------------------------------------- charts
def chart_freq():
    w, h = 1000, 620
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 110, 60, 950, 480
    d.rectangle((x0, y0, x1, y1), outline=INK + (255,), width=5)
    d.text((x0, 12), "SOLAR RADIO BURST - 23 MAY 1967", font=MONO_B(34), fill=INK + (255,))
    for i, lab in enumerate(["0.01", "1.0", "3.0", "9.0"]):
        x = x0 + 40 + i * (x1 - x0 - 80) / 3
        d.line((x, y1, x, y1 + 12), fill=INK + (255,), width=3)
        d.text((x - 34, y1 + 18), lab, font=MONO(26), fill=INK + (255,))
    d.text((x1 - 260, y1 + 52), "FREQUENCY  GHz", font=MONO(28), fill=INK + (255,))
    for k in range(8):
        yy = y0 + 20 + k * (y1 - y0 - 40) / 7
        d.line((x0 - 10, yy, x0, yy), fill=INK + (255,), width=2)
    # 1-bit dither noise floor + red spike
    for x in range(x0 + 6, x1 - 6, 4):
        amp = rng.integers(2, 14)
        d.line((x, y1 - amp, x, y1), fill=INK + (rng.integers(90, 160),), width=2)
    sx = x0 + int((x1 - x0) * 0.58)
    for x in range(sx - 26, sx + 27, 2):
        t = 1 - abs(x - sx) / 27
        hh = int((y1 - y0 - 30) * (t ** 2.2))
        d.line((x, y1 - hh, x, y1), fill=RED + (255,), width=2)
    d.polygon([(sx + 40, y0 + 60), (sx + 40, y0 + 16), (sx + 92, y0 + 38)], fill=RED + (255,))
    d.text((sx + 100, y0 + 22), "LARGEST BURST", font=MONO_B(28), fill=RED + (255,))
    d.text((sx + 100, y0 + 56), "OF THE CENTURY", font=MONO_B(28), fill=RED + (255,))
    save(img, "chart_freq.png")


def chart_standdown():
    w, h = 1040, 560
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((30, 10), "AS THE BURST FADED - SO DID THE 'JAMMING'", font=MONO_B(30), fill=INK + (255,))
    # left: descending red burst
    x0, y0, y1 = 40, 90, 470
    pts = [(x0 + i * 6, y0 + int(300 * (i / 120) ** 0.6) + int(rng.integers(-8, 8))) for i in range(121)]
    d.line(pts, fill=RED + (255,), width=5, joint="curve")
    d.text((x0, y1 + 20), "SOLAR BURST  0.01-9.0 GHz", font=MONO(28), fill=RED + (255,))
    # right: BMEWS sweep recovering to flat-normal (green)
    x1 = 1000
    pts = []
    for i in range(121):
        xx = x1 - 720 + i * 6
        rise = min(1.0, i / 90) ** 0.7
        yy = y1 - int(280 * rise) + int(rng.integers(-8, 8) * (1 - rise))
        pts.append((xx, yy))
    for i in range(1, len(pts)):
        d.line((pts[i - 1], pts[i]), fill=GREEN + (255,), width=5)
    d.ellipse((x1 - 190, y0 + 130, x1 - 90, y0 + 230), outline=GREEN + (255,), width=4)
    d.line((x1 - 140, y0 + 180, x1 - 105, y0 + 145), fill=GREEN + (255,), width=5)
    d.text((x1 - 320, y1 + 20), "BMEWS SWEEP  NORMAL", font=MONO(28), fill=GREEN + (255,))
    d.line((520, y0, 520, y1), fill=INK + (120,), width=2)
    save(img, "chart_standdown.png")


def chart_cycles():
    w, h = 1040, 600
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((30, 10), "SUNSPOT CYCLES  1610 - PRESENT", font=MONO_B(32), fill=INK + (255,))
    x0, y0, x1, y1 = 70, 80, 1000, 500
    d.line((x0, y1, x1, y1), fill=INK + (255,), width=4)
    d.line((x0, y0, x0, y1), fill=INK + (255,), width=4)
    span0, span1 = 1610, 2025

    def xy(year):
        return x0 + (year - span0) / (span1 - span0) * (x1 - x0)

    for year in (1620, 1700, 1780, 1860, 1940, 2020):
        d.text((xy(year) - 22, y1 + 12), str(year), font=MONO(24), fill=INK + (255,))
        d.line((xy(year), y1, xy(year), y1 + 8), fill=INK + (255,), width=2)
    n = 25
    step = (span1 - span0) / n
    for k in range(n):
        cyear = span0 + 8 + k * step
        bw = step * 0.62 * (x1 - x0) / (span1 - span0)
        bx = xy(cyear) - bw / 2
        peak = 40 + 90 * abs(np.sin(k * 1.7)) + (35 if k >= 22 else 0)
        cyc = RED if k == 21 else INK  # cycle 20 peak ~ 1966-67
        for s in range(int(bw)):
            t = s / bw
            yy = y1 - int(peak * np.sin(np.pi * t) ** 1.2)
            d.line((bx + s, yy, bx + s, y1), fill=cyc + (255,), width=1)
    mx = xy(1967)
    d.line((mx, y0 - 8, mx, y1), fill=RED + (160,), width=2)
    d.text((mx - 32, y0 - 48), "1967", font=SERIF_B(34), fill=RED + (255,))
    d.text((x0 + 6, y0 + 4), "CYCLE 20 PEAK", font=MONO(22), fill=RED + (255,))
    d.text((x1 - 230, y1 + 44), "SOLAR MAX ->", font=MONO_B(26), fill=INK + (255,))
    d.line((x1 - 20, y0 + 10, x1 - 20, y1), fill=RED + (120,), width=2)
    save(img, "chart_cycles.png")


def grain():
    img = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    a = np.zeros((1920, 1080), np.uint8)
    a[rng.random((1920, 1080)) > 0.9955] = rng.integers(60, 160)
    img.putalpha(Image.fromarray(a))
    save(img, "film_grain.png")


if __name__ == "__main__":
    paper_texture("paper_cream.png", PAPER, [SHADE, (214, 205, 190), (198, 190, 176)])
    paper_texture("paper_void.png", VOID, [(40, 40, 40), (60, 60, 60), (28, 28, 28)])
    graticule()
    stamps()
    save(ticker_card("BMEWS TELETYPE // NORAD NET",
                     [("01> CLEAR      AK  [DARK]", False),
                      ("02> THULE      GL  [DARK]", False),
                      ("03> FYLINGDALES UK [DARK]", False),
                      ("SIMULTANEOUS RF JAMMING [3/3]", True)]), "ticker_dark.png")
    save(ticker_card("SOLAR FORECAST CENTER // ENT AFB",
                     [("FORECAST: WORLDWIDE", False),
                      ("GEOMAGNETIC STORM IN", False),
                      ("36-48 HOURS  ///  23 MAY", True)]), "ticker_forecast.png")
    save(ticker_card("SPACE WEATHER 14(9) 2016",
                     [("THE MAY 1967 GREAT STORM", True),
                      ("AND RADIO DISRUPTION EVENT", True),
                      ("DOI 10.1002/2016SW001423", False)]), "ticker_paper2016.png")
    memo_card()
    save(punch_card("ALERT  ///  DO NOT FOLD"), "punchcard_alert.png")
    save(punch_card("4WWM 105-1  //  1 APR 1966"), "punchcard_1966.png")
    chart_freq()
    chart_standdown()
    chart_cycles()
    grain()
    print("done ->", OUT)
