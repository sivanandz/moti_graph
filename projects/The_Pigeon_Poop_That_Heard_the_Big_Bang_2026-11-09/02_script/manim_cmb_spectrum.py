from manim import *
import numpy as np

class CMBBlackbodyPlot(Scene):
    def construct(self):
        self.camera.background_color = "#0D141C"
        
        # Title
        title = Text("COSMIC MICROWAVE BACKGROUND SPECTRUM", font="Courier New", weight=BOLD, font_size=26, color="#F2B705")
        title.to_edge(UP, buff=0.5)
        
        sub = Text("PLANCK BLACKBODY LAW: T = 2.725 K", font="Courier New", font_size=15, color="#87DAEE")
        sub.next_to(title, DOWN, buff=0.15)
        
        self.play(FadeIn(title, shift=DOWN*0.1), FadeIn(sub), run_time=0.8)
        
        # Axes
        axes = Axes(
            x_range=[0, 450, 50],
            y_range=[0, 1.2, 0.2],
            x_length=9.2,
            y_length=4.6,
            axis_config={
                "color": "#4A6274",
                "stroke_width": 2.5,
                "include_numbers": False,
            },
        ).shift(DOWN * 0.4)
        
        x_nums = VGroup()
        for x_val in [50, 100, 150, 200, 250, 300, 350, 400]:
            t = Text(str(x_val), font="Courier New", font_size=13, color="#87DAEE")
            t.next_to(axes.c2p(x_val, 0), DOWN, buff=0.15)
            x_nums.add(t)
            
        y_nums = VGroup()
        for y_val in [0.2, 0.4, 0.6, 0.8, 1.0]:
            t = Text(f"{y_val:.1f}", font="Courier New", font_size=13, color="#87DAEE")
            t.next_to(axes.c2p(0, y_val), LEFT, buff=0.15)
            y_nums.add(t)
            
        x_lbl = Text("FREQUENCY ν (GHz)", font="Courier New", font_size=14, color="#87DAEE")
        x_lbl.next_to(x_nums, DOWN, buff=0.2)
        
        y_lbl = Text("INTENSITY I(ν) (MJy / sr)", font="Courier New", font_size=14, color="#87DAEE")
        y_lbl.rotate(PI / 2).next_to(y_nums, LEFT, buff=0.25)
        
        self.play(Create(axes), FadeIn(x_nums), FadeIn(y_nums), Write(x_lbl), Write(y_lbl), run_time=1.2)
        
        # Planck Blackbody Curve function f(nu)
        # Peak around 160 GHz for 2.725K
        def planck(nu):
            if nu <= 0:
                return 0
            x = nu / 56.7  # normalized h*nu/(k*T)
            if x > 15:
                return 0
            # Intensity shape: x^3 / (exp(x) - 1)
            intensity = (x**3) / (np.exp(x) - 1)
            # scale so peak is approx 1.05
            return intensity * 0.73
            
        curve = axes.plot(planck, x_range=[1, 440], color="#F2B705", stroke_width=3.5)
        curve_lbl = Text("2.725 K BLACKBODY RADIATION", font="Courier New", weight=BOLD, font_size=15, color="#F2B705")
        curve_lbl.next_to(axes.c2p(160, 1.05), UP, buff=0.2)
        
        self.play(Create(curve), Write(curve_lbl), run_time=2.0)
        
        # Penzias & Wilson 1964 measurement point at 4.08 GHz
        pw_dot = Dot(point=axes.c2p(4.08, planck(4.08)), radius=0.12, color="#DE3831")
        pw_circle = Circle(radius=0.25, color="#DE3831", stroke_width=2).move_to(pw_dot)
        
        pw_box = VGroup(
            Text("1964: PENZIAS & WILSON", font="Courier New", weight=BOLD, font_size=14, color="#DE3831"),
            Text("ν = 4.08 GHz (λ = 7.35 cm)", font="Courier New", font_size=13, color="#DE3831"),
            Text("CONFIRMED T ≈ 3.5 ± 1.0 K", font="Courier New", font_size=12, color="#FAF7EE")
        ).arrange(DOWN, buff=0.08).next_to(pw_dot, RIGHT, buff=0.3).shift(UP * 0.4)
        
        self.play(FadeIn(pw_dot), Create(pw_circle), FadeIn(pw_box), run_time=1.2)
        
        # COBE Satellite FIRAS Data points (1990)
        cobe_pts = VGroup()
        for nu in np.linspace(60, 420, 25):
            val = planck(nu) + np.random.normal(0, 0.008)
            d = Dot(point=axes.c2p(nu, val), radius=0.06, color="#87DAEE")
            cobe_pts.add(d)
            
        cobe_lbl = Text("1990: NASA COBE / FIRAS (PERFECT FIT)", font="Courier New", font_size=13, color="#87DAEE")
        cobe_lbl.next_to(axes.c2p(280, 0.45), UP, buff=0.2)
        
        self.play(FadeIn(cobe_pts), Write(cobe_lbl), run_time=1.5)
        self.wait(2.0)
