from manim import *
import numpy as np

class AntennaTelemetryPlot(Scene):
    def construct(self):
        # Configure dark CRT / cutting-mat background
        self.camera.background_color = "#0D141C"
        
        # Title
        title = Text("BELL LABS 4080 MHz RADIOMETER", font="Courier New", weight=BOLD, font_size=28, color="#DE3831")
        title.to_edge(UP, buff=0.5)
        
        sub = Text("CRAWFORD HILL · MAY 1964 · LIQUID HELIUM COOLED", font="Courier New", font_size=16, color="#87DAEE")
        sub.next_to(title, DOWN, buff=0.15)
        
        self.play(FadeIn(title, shift=DOWN*0.1), FadeIn(sub), run_time=0.8)
        
        # Axes (NO LATEX: include_numbers=False)
        axes = Axes(
            x_range=[0, 12, 2],
            y_range=[0, 10, 2],
            x_length=9.2,
            y_length=4.6,
            axis_config={
                "color": "#4A6274",
                "stroke_width": 2.5,
                "include_numbers": False,
            },
        ).shift(DOWN * 0.4)
        
        # Add Pango Text tick numbers manually (zero LaTeX dependency)
        x_nums = VGroup()
        for x_val in range(0, 13, 2):
            t = Text(str(x_val), font="Courier New", font_size=15, color="#87DAEE")
            t.next_to(axes.c2p(x_val, 0), DOWN, buff=0.15)
            x_nums.add(t)
            
        y_nums = VGroup()
        for y_val in range(2, 11, 2):
            t = Text(f"{y_val}K", font="Courier New", font_size=15, color="#87DAEE")
            t.next_to(axes.c2p(0, y_val), LEFT, buff=0.15)
            y_nums.add(t)

        x_lbl = Text("OBSERVATION TIME (HOURS)", font="Courier New", font_size=15, color="#87DAEE")
        x_lbl.next_to(x_nums, DOWN, buff=0.2)
        
        y_lbl = Text("ANTENNA TEMPERATURE (K)", font="Courier New", font_size=15, color="#87DAEE")
        y_lbl.rotate(PI / 2).next_to(y_nums, LEFT, buff=0.25)
        
        self.play(Create(axes), FadeIn(x_nums), FadeIn(y_nums), Write(x_lbl), Write(y_lbl), run_time=1.2)
        
        # Expected baseline: 3.3K (dashed cyan line)
        calc_line = DashedLine(
            start=axes.c2p(0, 3.3),
            end=axes.c2p(12, 3.3),
            color="#87DAEE",
            dash_length=0.14,
            stroke_width=3
        )
        calc_lbl = Text("THEORETICAL BASELINE: 3.3 K", font="Courier New", font_size=15, color="#87DAEE")
        calc_lbl.next_to(axes.c2p(0.5, 3.3), UP, buff=0.12).align_to(axes.c2p(0.5, 3.3), LEFT)
        
        self.play(Create(calc_line), Write(calc_lbl), run_time=1.0)
        
        # Measured curve: noisy trace around 6.7K (yellow)
        np.random.seed(42)
        pts = []
        for t_step in np.linspace(0, 12, 80):
            noise = np.random.normal(0, 0.08) + 0.04 * np.sin(t_step * 1.5)
            pts.append([t_step, 6.7 + noise])
            
        real_line = axes.plot_line_graph(
            x_values=[p[0] for p in pts],
            y_values=[p[1] for p in pts],
            line_color="#F2B705",
            stroke_width=3.5,
            add_vertex_dots=False
        )
        
        meas_lbl = Text("MEASURED SIGNAL: 6.7 K", font="Courier New", weight=BOLD, font_size=16, color="#F2B705")
        meas_lbl.next_to(axes.c2p(0.5, 6.7), UP, buff=0.15).align_to(axes.c2p(0.5, 6.7), LEFT)
        
        self.play(Create(real_line["line_graph"]), Write(meas_lbl), run_time=1.8)
        
        # Excess Noise Anomaly bracket and text (+3.5K)
        anomaly_arrow = DoubleArrow(
            start=axes.c2p(9.2, 3.3),
            end=axes.c2p(9.2, 6.7),
            color="#DE3831",
            buff=0.04,
            stroke_width=3.5,
            max_tip_length_to_length_ratio=0.15
        )
        
        anomaly_box = VGroup(
            Text("UNEXPLAINED EXCESS", font="Courier New", weight=BOLD, font_size=15, color="#DE3831"),
            Text("+3.5 K RESIDUAL", font="Courier New", weight=BOLD, font_size=17, color="#DE3831"),
            Text("(OMNIDIRECTIONAL)", font="Courier New", font_size=13, color="#FAF7EE")
        ).arrange(DOWN, buff=0.08).next_to(anomaly_arrow, RIGHT, buff=0.2)
        
        self.play(GrowArrow(anomaly_arrow), FadeIn(anomaly_box, shift=LEFT*0.15), run_time=1.2)
        self.wait(2.0)
