"""Drip runner for generate_layers.py — Antigravity nanobanana quota refills in windows.

Loops the generator until all plates exist or 12h elapse:
  exit 0 -> done | exit 2 -> quota window, sleep 30 min | other -> transient, sleep 2 min
"""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE / "generate_layers.py"
DEADLINE_HOURS = 12


def main() -> int:
    deadline = time.time() + DEADLINE_HOURS * 3600
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        r = subprocess.run(
            [sys.executable, "-I", str(SCRIPT)],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=7200,
        )
        print(f"--- attempt {attempt} exit={r.returncode} at {time.strftime('%H:%M:%S')}", flush=True)
        tail = (r.stdout or "").strip().splitlines()[-6:]
        for line in tail:
            print("  " + line, flush=True)
        if r.returncode == 0:
            print("ALL PLATES DONE", flush=True)
            return 0
        time.sleep(1800 if r.returncode == 2 else 120)
    print("DEADLINE REACHED - some plates still missing", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main())
