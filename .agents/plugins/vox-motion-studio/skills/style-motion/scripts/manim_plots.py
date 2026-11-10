#!/usr/bin/env python3
"""Manim Community plot & graph generator for style-motion.

Renders style-locked animated charts, mathematical functions, and network graphs
using Manim Community (https://docs.manim.community/en/stable/) as alpha-transparent
WebM layers (or opaque MP4s) ready for Remotion (<OffthreadVideo transparent />).

Supported declarative plot types:
  - line      : 2D single or multi-series line chart with animated trace & dot markers
  - bar       : Vertical bar chart with animated bar growth & value labels
  - function  : Mathematical function plot f(x) with optional area fill & moving tracker
  - scatter   : 2D scatter / bubble plot with optional trendline
  - area      : Shaded area chart under curve(s)
  - network   : Node-link graph / state diagram with animated edges & pulse highlights
  - custom    : External Python file (`script`) or inline `construct` body (`code`)
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

FORMATS = {
    "9x16": (1080, 1080),   # Square 1:1 plot canvas fits cleanly inside 9x16 safe area & split layouts
    "4x5": (1080, 1080),
    "1x1": (1080, 1080),
    "16x9": (1440, 900),    # Wide 16:10 plot canvas for 16x9 explainers
}


def find_manim() -> str | None:
    """Locate the Manim Community executable across PATH and uv tool environments."""
    if os.environ.get("STYLE_MOTION_MANIM"):
        p = Path(os.environ["STYLE_MOTION_MANIM"])
        if p.exists():
            return str(p)
    which = shutil.which("manim") or shutil.which("manimce")
    if which:
        return which
    candidates = [
        Path.home() / ".local" / "bin" / ("manim.exe" if os.name == "nt" else "manim"),
        Path.home() / "AppData" / "Roaming" / "uv" / "tools" / "manim" / "Scripts" / "manim.exe",
        Path.home() / ".cargo" / "bin" / ("manim.exe" if os.name == "nt" else "manim"),
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return None


def has_latex() -> bool:
    """Return True if both a LaTeX engine and dvisvgm are available on PATH."""
    tex = shutil.which("latex") or shutil.which("pdflatex") or shutil.which("xelatex")
    dvi = shutil.which("dvisvgm")
    return bool(tex and dvi)


def resolve_color(palette: dict[str, str], key_or_hex: str | None, fallback: str = "#FFFFFF") -> str:
    """Resolve a palette role name or hex string to a valid hex color."""
    if not key_or_hex:
        return fallback
    if key_or_hex in palette:
        return palette[key_or_hex]
    if key_or_hex.startswith("#"):
        return key_or_hex
    # Common role aliases across styles (vox-halftone-cutout, retro-digital-ephemera, _template)
    aliases = {
        "accent": palette.get("accent") or palette.get("green") or palette.get("gold") or fallback,
        "accent2": palette.get("accent2") or palette.get("gold") or palette.get("rule") or fallback,
        "primary": palette.get("accent") or palette.get("green") or palette.get("ink") or fallback,
        "secondary": palette.get("accent2") or palette.get("gold") or palette.get("muted") or fallback,
    }
    return aliases.get(key_or_hex, fallback)


def font_candidates(style: dict[str, Any], role: str = "caption") -> list[str]:
    """Extract ordered font family candidates from style.json."""
    t = style.get("type", {})
    spec = t.get(role) or t.get("headline") or {}
    raw = spec.get("font", "Sans")
    items = [p.strip().strip('"').strip("'") for p in raw.split(",") if p.strip()]
    return items or ["Sans"]


SCENE_TEMPLATE = r'''# Auto-generated Manim scene for style-motion
import json
import math
import manimpango
import numpy as np
from manim import *

SPEC = json.loads(__SPEC_JSON_REPR__)
PALETTE = SPEC["palette"]
PLOT = SPEC["plot"]
_INSTALLED_FONTS = {f.lower(): f for f in manimpango.list_fonts()}


def _pick_font(candidates, fallback="Arial"):
    for c in candidates:
        cl = c.lower()
        if cl in _INSTALLED_FONTS:
            return _INSTALLED_FONTS[cl]
        if cl in ("monospace", "mono"):
            return _INSTALLED_FONTS.get("courier new", fallback)
        if cl == "serif":
            return _INSTALLED_FONTS.get("georgia", _INSTALLED_FONTS.get("times new roman", fallback))
        if cl in ("sans-serif", "sans"):
            return _INSTALLED_FONTS.get("segoe ui", _INSTALLED_FONTS.get("arial", fallback))
    return fallback


FONT = _pick_font(SPEC.get("font_candidates", [SPEC.get("font", "Arial")]))
HEAD_FONT = _pick_font(SPEC.get("head_font_candidates", [SPEC.get("head_font", "Impact")]))
HAS_LATEX = SPEC["has_latex"]
USE_LATEX = bool(PLOT.get("use_latex", False) and HAS_LATEX)
DURATION = float(SPEC.get("duration", 4.0))

if not SPEC.get("transparent", True):
    config.background_color = PALETTE["paper"]


def make_label(text_str, font_size=26, color=None, weight="NORMAL", is_math=False):
    col = color or PALETTE["ink"]
    if is_math and USE_LATEX:
        return MathTex(str(text_str), color=col, font_size=int(font_size * 1.25))
    return Text(str(text_str), font=FONT, font_size=font_size, color=col, weight=weight)


def make_decimal(val=0, num_decimal_places=0, font_size=24, color=None, **kwargs):
    col = color or PALETTE["ink"]
    if USE_LATEX:
        return DecimalNumber(val, num_decimal_places=num_decimal_places, font_size=int(font_size * 1.2), color=col, **kwargs)
    fmt = f"{{:.{num_decimal_places}f}}"
    return Text(fmt.format(val), font=FONT, font_size=font_size, color=col)


class StyleMotionPlotScene(Scene):
    def construct(self):
        ptype = PLOT.get("type", "line").lower()
        if ptype == "bar":
            self.build_bar()
        elif ptype in ("function", "axes_func", "func"):
            self.build_function()
        elif ptype == "scatter":
            self.build_scatter()
        elif ptype == "area":
            self.build_area()
        elif ptype in ("network", "graph"):
            self.build_network()
        elif ptype == "custom":
            self.build_custom()
        else:
            self.build_line()

    def _add_chart_frame(self, mob, title_text=None, subtitle_text=None):
        group = VGroup(mob)
        if title_text:
            t_mob = Text(str(title_text), font=HEAD_FONT, font_size=36, color=PALETTE["ink"], weight="BOLD")
            if subtitle_text:
                s_mob = Text(str(subtitle_text), font=FONT, font_size=24, color=PALETTE["muted"], weight="BOLD")
                header = VGroup(t_mob, s_mob).arrange(DOWN, buff=0.14, aligned_edge=LEFT)
            else:
                header = t_mob
            header.next_to(mob, UP, buff=0.45, aligned_edge=LEFT)
            group.add(header)
            return group, header
        return group, None

    def _fit_canvas(self, group):
        target_w = config.frame_width * 0.84
        target_h = config.frame_height * 0.82
        if group.width > 0:
            group.scale_to_fit_width(target_w)
        if group.height > target_h:
            group.scale_to_fit_height(target_h)
        group.move_to(ORIGIN)

    def _build_axes(self, x_range, y_range, x_length=8.8, y_length=5.2):
        ax = Axes(
            x_range=x_range,
            y_range=y_range,
            x_length=x_length,
            y_length=y_length,
            axis_config={
                "color": PALETTE["ink"],
                "stroke_width": 3.5,
                "include_tip": bool(PLOT.get("tips", False)),
                "include_ticks": True,
                "tick_size": 0.08,
            },
             tips=bool(PLOT.get("tips", False)),
        )
        grid = VGroup()
        if PLOT.get("grid", True):
            x_min, x_max, x_step = x_range[0], x_range[1], (x_range[2] if len(x_range) > 2 else (x_range[1] - x_range[0]) / 5)
            y_min, y_max, y_step = y_range[0], y_range[1], (y_range[2] if len(y_range) > 2 else (y_range[1] - y_range[0]) / 4)
            for yv in np.arange(y_min + y_step, y_max + 1e-6, y_step):
                p1 = ax.c2p(x_min, yv)
                p2 = ax.c2p(x_max, yv)
                grid.add(DashedLine(p1, p2, dash_length=0.1, color=PALETTE["muted"], stroke_width=1.5, stroke_opacity=0.45))

        labels = VGroup()
        x_labels_custom = PLOT.get("x_labels")
        x_min, x_max, x_step = x_range[0], x_range[1], (x_range[2] if len(x_range) > 2 else 1)
        if x_labels_custom:
            for idx, lbl in enumerate(x_labels_custom):
                xv = x_min + idx * x_step
                if xv <= x_max + 1e-6:
                    t = make_label(lbl, font_size=22, color=PALETTE["muted"], weight="BOLD")
                    t.next_to(ax.c2p(xv, y_range[0]), DOWN, buff=0.22)
                    labels.add(t)
        else:
            for xv in np.arange(x_min, x_max + 1e-6, x_step):
                lbl = f"{xv:g}"
                t = make_label(lbl, font_size=22, color=PALETTE["muted"], weight="BOLD")
                t.next_to(ax.c2p(xv, y_range[0]), DOWN, buff=0.22)
                labels.add(t)

        y_min, y_max, y_step = y_range[0], y_range[1], (y_range[2] if len(y_range) > 2 else (y_range[1] - y_range[0]) / 4)
        y_prefix = PLOT.get("y_prefix", "")
        y_suffix = PLOT.get("y_suffix", "")
        for yv in np.arange(y_min, y_max + 1e-6, y_step):
            lbl = f"{y_prefix}{yv:g}{y_suffix}"
            t = make_label(lbl, font_size=22, color=PALETTE["muted"], weight="BOLD")
            t.next_to(ax.c2p(x_min, yv), LEFT, buff=0.22)
            labels.add(t)

        if PLOT.get("x_label"):
            xl = make_label(PLOT["x_label"], font_size=22, color=PALETTE["ink"], weight="BOLD")
            xl.next_to(ax, DOWN, buff=0.58)
            labels.add(xl)
        if PLOT.get("y_label"):
            yl = make_label(PLOT["y_label"], font_size=22, color=PALETTE["ink"], weight="BOLD")
            yl.rotate(PI / 2).next_to(ax, LEFT, buff=0.75)
            labels.add(yl)

        return ax, grid, labels

    def build_line(self):
        series_list = PLOT.get("series")
        if not series_list:
            raw_data = PLOT.get("data", [12, 28, 22, 45, 38, 64, 82])
            if raw_data and isinstance(raw_data[0], (list, tuple)):
                pts = [(float(p[0]), float(p[1])) for p in raw_data]
            else:
                pts = [(float(i), float(v)) for i, v in enumerate(raw_data)]
            series_list = [{"name": PLOT.get("label", ""), "points": pts, "color": PLOT.get("color", "accent")}]
        else:
            norm = []
            for s in series_list:
                d = s.get("points") or s.get("data") or []
                if d and isinstance(d[0], (list, tuple)):
                    pts = [(float(p[0]), float(p[1])) for p in d]
                else:
                    pts = [(float(i), float(v)) for i, v in enumerate(d)]
                norm.append({**s, "points": pts})
            series_list = norm

        all_x = [p[0] for s in series_list for p in s["points"]]
        all_y = [p[1] for s in series_list for p in s["points"]]
        x_min, x_max = min(all_x), max(all_x)
        y_min = min(0.0, min(all_y))
        y_max = max(all_y) * 1.15 if max(all_y) > 0 else 10.0
        x_step = max(1.0, round((x_max - x_min) / min(6, max(1, len(all_x) - 1)), 2))
        y_step = max(1.0, round((y_max - y_min) / 4.0, 1))
        x_range = PLOT.get("x_range", [x_min, x_max, x_step])
        y_range = PLOT.get("y_range", [y_min, y_max, y_step])

        ax, grid, labels = self._build_axes(x_range, y_range)
        root = VGroup(grid, ax, labels)
        _, header = self._add_chart_frame(root, PLOT.get("title"), PLOT.get("subtitle"))
        root.move_to(ORIGIN)

        self.play(Create(ax, run_time=0.65), FadeIn(grid, run_time=0.5), FadeIn(labels, run_time=0.6),
                  *([FadeIn(header, shift=UP * 0.15, run_time=0.5)] if header else []))

        role_cycle = ["accent", "accent2", "ink", "muted"]
        anims = []
        dot_groups = []
        end_badges = []
        for idx, s in enumerate(series_list):
            col_key = s.get("color") or role_cycle[idx % len(role_cycle)]
            col = PALETTE.get(col_key, col_key if str(col_key).startswith("#") else PALETTE["accent"])
            coords = [ax.c2p(x, y) for x, y in s["points"]]
            line_vmob = VMobject(color=col, stroke_width=float(PLOT.get("stroke_width", 6)))
            line_vmob.set_points_as_corners(coords)
            anims.append(Create(line_vmob, run_time=max(1.0, DURATION * 0.5), rate_func= rate_functions.ease_in_out_cubic))

            if PLOT.get("dots", True):
                dots = VGroup(*[Dot(c, radius=0.09, color=col).set_stroke(PALETTE["paper"], width=2.5) for c in coords])
                dot_groups.append(dots)

            if s.get("name") or PLOT.get("show_end_value", True):
                last_x, last_y = s["points"][-1]
                y_suf = PLOT.get("y_suffix", "")
                y_pre = PLOT.get("y_prefix", "")
                txt = s.get("name") or f"{y_pre}{last_y:g}{y_suf}"
                badge_txt = make_label(txt, font_size=22, color=PALETTE["paper"], weight="BOLD")
                badge_bg = SurroundingRectangle(badge_txt, color=col, fill_color=col, fill_opacity=1.0, buff=0.14, corner_radius=0.1)
                badge = VGroup(badge_bg, badge_txt).next_to(coords[-1], UR, buff=0.15)
                end_badges.append(badge)

        if anims:
            self.play(*anims)
        if dot_groups or end_badges:
            extra = [LaggedStart(*[GrowFromCenter(d) for d in dg], lag_ratio=0.12, run_time=0.55) for dg in dot_groups]
            extra += [FadeIn(b, scale=0.85, run_time=0.4) for b in end_badges]
            self.play(*extra)

        if PLOT.get("threshold") is not None:
            th_val = float(PLOT["threshold"])
            th_line = DashedLine(ax.c2p(x_range[0], th_val), ax.c2p(x_range[1], th_val), color=PALETTE["accent2"], stroke_width=3)
            th_lbl = make_label(PLOT.get("threshold_label", f"Threshold: {th_val:g}"), font_size=18, color=PALETTE["accent2"], weight="BOLD")
            th_lbl.next_to(th_line, UP, buff=0.1, aligned_edge=RIGHT)
            self.play(Create(th_line, run_time=0.4), FadeIn(th_lbl, run_time=0.3))

        self.wait(max(0.2, DURATION - 2.6))

    def build_bar(self):
        values = [float(v) for v in PLOT.get("data", [24, 42, 35, 68, 54])]
        names = [str(n) for n in PLOT.get("labels", [f"#{i+1}" for i in range(len(values))])]
        y_max = max(values) * 1.2 if values else 10.0
        y_min = min(0.0, min(values))
        y_step = max(1.0, round((y_max - y_min) / 4.0, 1))
        y_range = PLOT.get("y_range", [y_min, y_max, y_step])

        bar_cols_raw = PLOT.get("colors", ["accent", "accent2", "accent", "accent2", "accent"])
        bar_cols = [PALETTE.get(c, c if str(c).startswith("#") else PALETTE["accent"]) for c in bar_cols_raw]

        ax, grid, labels = self._build_axes([0, len(values), 1], y_range, x_length=8.6, y_length=5.0)
        # Remove numeric x labels and replace with bar category names
        labels_clean = VGroup(*[m for m in labels if m.get_center()[1] > ax.c2p(0, y_min)[1] - 0.1])

        bars = VGroup()
        cat_labels = VGroup()
        val_labels = VGroup()
        bar_w = (8.6 / max(len(values), 1)) * 0.56
        y_pre = PLOT.get("y_prefix", "")
        y_suf = PLOT.get("y_suffix", "")

        for i, val in enumerate(values):
            xc = i + 0.5
            p_base = ax.c2p(xc, 0)
            p_top = ax.c2p(xc, val)
            h = max(0.04, abs(p_top[1] - p_base[1]))
            col = bar_cols[i % len(bar_cols)]
            rect = RoundedRectangle(width=bar_w, height=h, corner_radius=0.06,
                                    fill_color=col, fill_opacity=0.92, stroke_color=PALETTE["ink"], stroke_width=2.5)
            rect.move_to([p_base[0], (p_base[1] + p_top[1]) / 2.0, 0])
            bars.add(rect)

            if i < len(names):
                cl = make_label(names[i], font_size=20, color=PALETTE["ink"], weight="BOLD")
                cl.next_to(p_base, DOWN, buff=0.24)
                cat_labels.add(cl)

            vl = make_label(f"{y_pre}{val:g}{y_suf}", font_size=21, color=col, weight="BOLD")
            vl.next_to(rect, UP, buff=0.14)
            val_labels.add(vl)

        root = VGroup(grid, ax, labels_clean, cat_labels, bars, val_labels)
        _, header = self._add_chart_frame(root, PLOT.get("title"), PLOT.get("subtitle"))
        root.move_to(ORIGIN)

        self.play(Create(ax, run_time=0.6), FadeIn(grid, run_time=0.4), FadeIn(labels_clean, run_time=0.5),
                  FadeIn(cat_labels, run_time=0.5), *([FadeIn(header, shift=UP * 0.15, run_time=0.5)] if header else []))
        self.play(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.14, run_time=max(1.0, DURATION * 0.45)))
        self.play(LaggedStart(*[FadeIn(vl, shift=UP * 0.1) for vl in val_labels], lag_ratio=0.1, run_time=0.5))
        self.wait(max(0.2, DURATION - 2.4))

    def build_function(self):
        expr = PLOT.get("fn") or PLOT.get("expression") or "math.sin(x) * math.exp(-0.18 * x)"
        x_range = PLOT.get("x_range", [0, 10, 2])
        y_range = PLOT.get("y_range", [-1.2, 1.2, 0.5])
        ax, grid, labels = self._build_axes(x_range, y_range)
        root = VGroup(grid, ax, labels)
        _, header = self._add_chart_frame(root, PLOT.get("title"), PLOT.get("subtitle"))
        root.move_to(ORIGIN)

        safe_ns = {"math": math, "np": np, "sin": np.sin, "cos": np.cos, "tan": np.tan,
                   "exp": np.exp, "log": np.log, "sqrt": np.sqrt, "pi": math.pi, "abs": abs}
        fn = lambda x: float(eval(expr, {"__builtins__": {}}, {**safe_ns, "x": x}))

        col_key = PLOT.get("color", "accent")
        col = PALETTE.get(col_key, col_key if str(col_key).startswith("#") else PALETTE["accent"])
        curve = ax.plot(fn, x_range=[x_range[0], x_range[1]], color=col, stroke_width=6)

        self.play(Create(ax, run_time=0.6), FadeIn(grid, run_time=0.4), FadeIn(labels, run_time=0.5),
                  *([FadeIn(header, shift=UP * 0.15, run_time=0.5)] if header else []))

        if PLOT.get("formula"):
            f_mob = make_label(PLOT["formula"], font_size=26, color=col, weight="BOLD", is_math=True)
            f_mob.to_corner(UR, buff=0.65)
            self.play(Create(curve, run_time=max(1.1, DURATION * 0.48)), FadeIn(f_mob, shift=DOWN * 0.1, run_time=0.6))
        else:
            self.play(Create(curve, run_time=max(1.1, DURATION * 0.48)))

        if PLOT.get("fill_area", False):
            area_range = PLOT.get("area_range", [x_range[0], x_range[1]])
            area = ax.get_area(curve, x_range=area_range, color=[col, PALETTE["accent2"]], opacity=0.35)
            self.play(FadeIn(area, run_time=0.55))

        if PLOT.get("tracker", True):
            t_val = ValueTracker(x_range[0])
            dot = always_redraw(lambda: Dot(ax.i2gp(t_val.get_value(), curve), radius=0.11, color=PALETTE["accent2"]).set_stroke(PALETTE["paper"], width=2.5))
            v_line = always_redraw(lambda: DashedLine(ax.c2p(t_val.get_value(), 0), ax.i2gp(t_val.get_value(), curve), color=PALETTE["accent2"], stroke_width=2.5))
            self.add(v_line, dot)
            target_x = PLOT.get("tracker_target", x_range[0] + (x_range[1] - x_range[0]) * 0.78)
            self.play(t_val.animate.set_value(target_x), run_time=max(0.8, DURATION * 0.3))

        self.wait(max(0.2, DURATION - 2.6))

    def build_scatter(self):
        raw = PLOT.get("data", [[1, 18], [2, 26], [3, 29], [4, 44], [5, 48], [6, 63], [7, 74], [8, 88]])
        pts = [(float(p[0]), float(p[1]), float(p[2]) if len(p) > 2 else 0.11) for p in raw]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x_range = PLOT.get("x_range", [min(0.0, min(xs)), max(xs) * 1.1, max(1.0, round(max(xs) / 5.0, 1))])
        y_range = PLOT.get("y_range", [min(0.0, min(ys)), max(ys) * 1.15, max(1.0, round(max(ys) / 4.0, 1))])

        ax, grid, labels = self._build_axes(x_range, y_range)
        root = VGroup(grid, ax, labels)
        _, header = self._add_chart_frame(root, PLOT.get("title"), PLOT.get("subtitle"))
        root.move_to(ORIGIN)

        dots = VGroup(*[
            Dot(ax.c2p(x, y), radius=r, color=PALETTE["accent"]).set_fill(PALETTE["accent"], opacity=0.82).set_stroke(PALETTE["ink"], width=2)
            for x, y, r in pts
        ])
        self.play(Create(ax, run_time=0.6), FadeIn(grid, run_time=0.4), FadeIn(labels, run_time=0.5),
                  *([FadeIn(header, shift=UP * 0.15, run_time=0.5)] if header else []))
        self.play(LaggedStart(*[GrowFromCenter(d) for d in dots], lag_ratio=0.08, run_time=max(0.9, DURATION * 0.42)))

        if PLOT.get("trendline", True) and len(pts) >= 2:
            m, b = np.polyfit(xs, ys, 1)
            t_line = ax.plot(lambda x: m * x + b, x_range=[min(xs), max(xs)], color=PALETTE["accent2"], stroke_width=4.5)
            self.play(Create(t_line, run_time=0.7))

        self.wait(max(0.2, DURATION - 2.3))

    def build_area(self):
        raw_data = PLOT.get("data", [10, 24, 32, 28, 52, 68, 92])
        pts = [(float(p[0]), float(p[1])) if isinstance(p, (list, tuple)) else (float(i), float(p)) for i, p in enumerate(raw_data)]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x_range = PLOT.get("x_range", [min(xs), max(xs), max(1.0, round((max(xs) - min(xs)) / 5.0, 1))])
        y_range = PLOT.get("y_range", [0, max(ys) * 1.18, max(1.0, round(max(ys) / 4.0, 1))])

        ax, grid, labels = self._build_axes(x_range, y_range)
        root = VGroup(grid, ax, labels)
        _, header = self._add_chart_frame(root, PLOT.get("title"), PLOT.get("subtitle"))
        root.move_to(ORIGIN)

        coords = [ax.c2p(x, y) for x, y in pts]
        line_vmob = VMobject(color=PALETTE["accent"], stroke_width=6)
        line_vmob.set_points_as_corners(coords)

        poly_pts = [ax.c2p(xs[0], 0)] + coords + [ax.c2p(xs[-1], 0)]
        area_poly = Polygon(*poly_pts, stroke_width=0, fill_color=PALETTE["accent"], fill_opacity=0.32)

        self.play(Create(ax, run_time=0.6), FadeIn(grid, run_time=0.4), FadeIn(labels, run_time=0.5),
                  *([FadeIn(header, shift=UP * 0.15, run_time=0.5)] if header else []))
        self.play(Create(line_vmob, run_time=max(1.0, DURATION * 0.45)), FadeIn(area_poly, run_time=max(1.0, DURATION * 0.45)))
        self.wait(max(0.2, DURATION - 2.2))

    def build_network(self):
        nodes_spec = PLOT.get("nodes", [
            {"id": "A", "label": "Input", "pos": [-3.2, 1.2]},
            {"id": "B", "label": "Router", "pos": [0.0, 1.8]},
            {"id": "C", "label": "Validator", "pos": [0.0, -1.2]},
            {"id": "D", "label": "Output", "pos": [3.2, 0.2]},
        ])
        edges_spec = PLOT.get("edges", [["A", "B"], ["A", "C"], ["B", "C"], ["B", "D"], ["C", "D"]])
        directed = bool(PLOT.get("directed", True))

        node_mobs = {}
        node_group = VGroup()
        n = len(nodes_spec)
        for i, nd in enumerate(nodes_spec):
            nid = str(nd["id"] if isinstance(nd, dict) else nd)
            lbl = str(nd.get("label", nid) if isinstance(nd, dict) else nd)
            if isinstance(nd, dict) and "pos" in nd:
                pos = [float(nd["pos"][0]), float(nd["pos"][1]), 0.0]
            else:
                ang = 2 * math.pi * i / max(n, 1)
                pos = [3.0 * math.cos(ang), 2.0 * math.sin(ang), 0.0]
            col_key = nd.get("color", "accent" if i in (0, n - 1) else "paperShade") if isinstance(nd, dict) else "accent"
            fill_col = PALETTE.get(col_key, PALETTE["accent"])
            txt_col = PALETTE["paper"] if col_key in ("accent", "accent2", "ink") else PALETTE["ink"]
            t_mob = make_label(lbl, font_size=22, color=txt_col, weight="BOLD")
            box = RoundedRectangle(width=max(1.7, t_mob.width + 0.55), height=0.82, corner_radius=0.18,
                                   fill_color=fill_col, fill_opacity=0.95, stroke_color=PALETTE["ink"], stroke_width=3)
            grp = VGroup(box, t_mob).move_to(pos)
            node_mobs[nid] = grp
            node_group.add(grp)

        edge_group = VGroup()
        for e in edges_spec:
            u, v = str(e[0]), str(e[1])
            if u in node_mobs and v in node_mobs:
                m1, m2 = node_mobs[u], node_mobs[v]
                if directed:
                    arr = Arrow(m1.get_center(), m2.get_center(), buff=0.65, color=PALETTE["ink"], stroke_width=3.5, max_tip_length_to_length_ratio=0.15)
                else:
                    arr = Line(m1.get_center(), m2.get_center(), buff=0.65, color=PALETTE["ink"], stroke_width=3.5)
                edge_group.add(arr)

        root = VGroup(edge_group, node_group)
        _, header = self._add_chart_frame(root, PLOT.get("title"), PLOT.get("subtitle"))
        root.move_to(ORIGIN)

        if header:
            self.play(FadeIn(header, shift=UP * 0.15, run_time=0.45))
        self.play(LaggedStart(*[GrowFromCenter(m) for m in node_group], lag_ratio=0.12, run_time=0.8))
        self.play(LaggedStart(*[Create(e) for e in edge_group], lag_ratio=0.12, run_time=max(0.8, DURATION * 0.4)))
        self.wait(max(0.2, DURATION - 2.2))

    def build_custom(self):
        code = PLOT.get("code", "")
        if code:
            exec(code, {"self": self, "manim": __import__("manim"), "np": np, "math": math,
                        "PALETTE": PALETTE, "PLOT": PLOT, "FONT": FONT, "HEAD_FONT": HEAD_FONT,
                        "make_label": make_label, "DURATION": DURATION, **globals()})
'''


def render_scene_plot(
    plot_spec: dict[str, Any],
    style: dict[str, Any],
    fmt: str,
    seconds: float,
    out_webm: Path,
    cache_dir: Path,
    root_dir: Path,
    force: bool = False,
) -> dict[str, Path]:
    """Render a Manim plot specification to a cached WebM/MP4 + PNG preview."""
    manim_bin = find_manim()
    if not manim_bin:
        raise RuntimeError(
            "Manim Community ('manim') is not installed or not on PATH. "
            "Install via: uv tool install --python 3.12 manim"
        )

    raw_pal = style.get("palette", {})
    normalized_palette = {
        "paper": resolve_color(raw_pal, "paper", "#123544"),
        "paperShade": resolve_color(raw_pal, "paperShade", "#3B4652"),
        "ink": resolve_color(raw_pal, "ink", "#FFFFFF"),
        "accent": resolve_color(raw_pal, "accent", "#F2B705"),
        "accent2": resolve_color(raw_pal, "accent2", "#D62828"),
        "muted": resolve_color(raw_pal, "muted", "#C8CCC1"),
        "rule": resolve_color(raw_pal, "rule", "#F2B705"),
        "pill": resolve_color(raw_pal, "pill", "#EAE0C8"),
        **raw_pal,
    }

    transparent = bool(plot_spec.get("transparent", True))
    w, h = plot_spec.get("resolution") or FORMATS.get(fmt, (1080, 1080))
    fps = int(style.get("canvas", {}).get("fps", 30))
    latex_avail = has_latex()

    full_spec = {
        "plot": plot_spec,
        "palette": normalized_palette,
        "font": font_candidates(style, "caption")[0],
        "head_font": font_candidates(style, "headline")[0],
        "font_candidates": font_candidates(style, "caption"),
        "head_font_candidates": font_candidates(style, "headline"),
        "has_latex": latex_avail,
        "transparent": transparent,
        "duration": float(seconds),
        "width": int(w),
        "height": int(h),
        "fps": fps,
    }

    # Include external script bytes in cache key if `script` is provided
    ext_script_code = ""
    if plot_spec.get("script"):
        sp = (root_dir / plot_spec["script"]).resolve()
        if not sp.exists():
            raise FileNotFoundError(f"Manim custom script not found: {sp}")
        ext_script_code = sp.read_text(encoding="utf-8")

    ext = ".webm" if transparent else ".mp4"
    out_video = out_webm.with_suffix(ext)
    out_png = out_webm.with_suffix(".png")

    key_payload = json.dumps({"spec": full_spec, "ext_script": ext_script_code, "v": "manim-v1"}, sort_keys=True)
    digest = hashlib.sha256(key_payload.encode("utf-8")).hexdigest()[:24]
    cache_dir.mkdir(parents=True, exist_ok=True)
    cached_vid = cache_dir / f"manim_{digest}{ext}"
    cached_png = cache_dir / f"manim_{digest}.png"

    if not force and cached_vid.exists() and cached_png.exists():
        print(f"  cache manim -> {out_video.name}")
        out_video.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(cached_vid, out_video)
        shutil.copy(cached_png, out_png)
        return {"video": out_video, "preview": out_png}

    with tempfile.TemporaryDirectory(prefix="sm_manim_") as tmp:
        tmp_path = Path(tmp)
        script_file = tmp_path / "scene_gen.py"
        scene_cls = plot_spec.get("scene_class", "StyleMotionPlotScene")

        if ext_script_code:
            prelude = (
                f"STYLE_SPEC = json.loads({json.dumps(full_spec)!r})\n"
                f"STYLE_PALETTE = STYLE_SPEC['palette']\n"
            )
            script_file.write_text(prelude + "\n" + ext_script_code, encoding="utf-8")
        else:
            script_file.write_text(SCENE_TEMPLATE.replace("__SPEC_JSON_REPR__", repr(json.dumps(full_spec))), encoding="utf-8")

        out_file = tmp_path / f"render{ext}"
        cmd = [
            manim_bin,
            "render",
            str(script_file),
            scene_cls,
            "-r", f"{w},{h}",
            "--fps", str(fps),
            "--media_dir", str(tmp_path / "media"),
            "-o", str(out_file),
            "-v", "ERROR",
        ]
        if transparent:
            cmd.extend(["-t", "--format=webm"])
        else:
            cmd.extend(["--format=mp4"])

        env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        print(f"  manim ({plot_spec.get('type', 'line')}) -> {out_video.name} ({w}x{h} @ {fps}fps, transparent={transparent})")
        subprocess.run(cmd, check=True, env=env)

        # Locate the produced video file
        rendered = out_file if out_file.exists() else next((tmp_path / "media").rglob(f"*{ext}"), None)
        if not rendered or not rendered.exists():
            raise RuntimeError(f"Manim did not produce expected output file ({ext}) in {tmp_path}")

        shutil.copy(rendered, cached_vid)

        # Extract a clean alpha-preserving PNG still near the end of the animation for hero/QA preview
        ffmpeg_bin = shutil.which("ffmpeg") or "ffmpeg"
        subprocess.run(
            [ffmpeg_bin, "-v", "error", "-y", "-sseof", "-0.15", "-i", str(cached_vid), "-frames:v", "1", str(cached_png)],
            check=True,
            shell=(os.name == "nt"),
        )

    out_video.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(cached_vid, out_video)
    shutil.copy(cached_png, out_png)
    return {"video": out_video, "preview": out_png}
