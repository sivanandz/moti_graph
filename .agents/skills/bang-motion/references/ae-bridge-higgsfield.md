# After Effects Bridge — Higgsfield MCP Integration

This manual details how Bang Motion designs and rigs can be bridged directly into Adobe After Effects via the Higgsfield MCP bridge.

---

## 1. Overview
While Bang Motion generates standalone single-file HTML5/GSAP deliverables by default, character animation rigs, scene compositions, and keyframe sequences can also be piped directly into Adobe After Effects when users prefer post-production compositing in AE.

---

## 2. Architecture of the AE Bridge
The bridge relies on:
1. **`scripts/ae/bridge/rig-tokoh.py`**: Character rigging generator that transforms vector body SVG parts into AE Shape Layers and Duik/Bassic bone parenting structures.
2. **`scripts/ae/bridge/aset-svg.py`**: Automated SVG layer asset parser and coordinate normalizer.
3. **Higgsfield MCP Bridge**: The Model Context Protocol connection interfacing with After Effects script listeners (`ExtendScript` / `CEP`).

---

## 3. Workflow
1. Ensure Adobe After Effects is running with remote script execution enabled in Preferences (`Allow Scripts to Write Files and Access Network`).
2. Run character rigging and asset conversion scripts from `scripts/ae/bridge/`.
3. The bridge translates DOM hierarchies, transforms, and timing curves directly into native After Effects timeline keyframes.
