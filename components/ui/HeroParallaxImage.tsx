"use client";

import { useEffect, useRef } from "react";

// Stable binary/hex chars — matches the reference image aesthetic
const CHARS = "01010110100010000110100101110001110010100001001100101100111010101001011010010110";

// Deterministic random (no flicker between frames)
function sr(seed: number): number {
  const s = Math.sin(seed * 9301 + 49297) * 233280;
  return s - Math.floor(s);
}

type Cell = {
  char: string;
  base: number; // base brightness [0..1]
  phase: number; // shimmer phase offset
};

export default function HeroParallaxImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── ASCII eye canvas ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Character grid metrics
    const CW = 8;   // cell width  (px)
    const CH = 13;  // cell height (px)
    const FS = 11;  // font size   (px)

    let grid: Cell[][] = [];
    let cols = 0;
    let rows = 0;
    let frame = 0;
    let rafId: number;

    // Build the pre-computed brightness grid — runs on resize only
    const buildGrid = (W: number, H: number) => {
      cols = Math.ceil(W / CW);
      rows = Math.ceil(H / CH);

      const cx = cols / 2;
      const cy = rows / 2;

      // Eye radii — compact and defined, centering behind the text
      const rx = cols * 0.28;
      const ry = rows * 0.45;
      const circOff = 0.45; // arc separation (smaller = rounder, larger = more almond)

      grid = [];
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          // Normalized coords relative to eye center
          const nx = (c - cx) / rx;
          const ny = (r - cy) / ry;

          // ── Eye shape: intersection of two offset circles ──
          const d1 = Math.hypot(nx, ny - circOff);
          const d2 = Math.hypot(nx, ny + circOff);
          const inEye = d1 < 1 && d2 < 1;
          const dc = Math.hypot(nx, ny); // dist from pupil center

          // ── Outline glow (sharp edge of eyelid) ──
          const outline = Math.max(
            Math.exp(-((d1 - 1) ** 2) * 28),
            Math.exp(-((d2 - 1) ** 2) * 28)
          );

          // ── Iris ring ──
          const irisGlow = inEye ? Math.exp(-((dc - 0.52) ** 2) * 40) : 0;

          // ── Radial iris texture (subtle spokes) ──
          const angle = Math.atan2(ny, nx);
          const spokes = inEye && dc > 0.22
            ? Math.pow(Math.max(0, Math.cos(angle * 10 + sr(c * 7 + r) * 3)), 5) * 0.14
            : 0;

          // ── Pupil (very dark center) ──
          const inPupil = dc < 0.20;

          // ── Assemble brightness ──
          let base = 0;
          if (inEye) {
            if (inPupil) {
              base = 0.035;
            } else {
              base = 0.05 + irisGlow * 0.55 + spokes + outline * 0.92;
            }
          }

          const charIdx = Math.floor(sr(r * 997 + c * 31) * CHARS.length);
          grid[r][c] = {
            char: CHARS[charIdx],
            base,
            phase: sr(r * 113 + c * 71) * Math.PI * 2,
          };
        }
      }
    };

    // ── Render loop ──────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FS}px "JetBrains Mono", "Courier New", monospace`;

      const breathe = 0.82 + Math.sin(frame * 0.016) * 0.18;
      // Slow top-to-bottom scan line
      const scanPos = (frame * 0.0035) % 1;

      for (let r = 0; r < rows; r++) {
        if (!grid[r]) continue;
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          if (!cell || cell.base < 0.01) continue;

          const shimmer = 1 + Math.sin(frame * 0.055 + cell.phase) * 0.07;
          const scan = Math.exp(-((r / rows - scanPos) ** 2) * 350) * 0.22;
          const rawAlpha = cell.base * breathe * shimmer + scan;
          const alpha = Math.min(1, rawAlpha * 0.40);

          if (alpha < 0.005) continue;

          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillText(cell.char, c * CW, r * CH + FS);
        }
      }

      frame++;
      rafId = requestAnimationFrame(render);
    };

    // ── Resize handler ───────────────────────────────────────
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      buildGrid(canvas.width, canvas.height);
    };

    resize();
    render();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
