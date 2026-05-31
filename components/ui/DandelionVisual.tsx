"use client";

import React, { useEffect, useRef } from "react";

const PARTICLE_COUNT = 250;

type Particle = {
  angle: number;
  targetRadiusFactor: number;
  initialDist: number;
  size: number;
  opacity: number;
};

const createParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const targetRadiusFactor = 0.2 + Math.pow(Math.random(), 1.3) * 0.8; // radial distribution
    const initialDist = 1 + Math.random() * 5; // extremely tight circular nucleus
    const size = 0.6 + Math.random() * 1.2;
    const opacity = 0.6 + Math.random() * 0.4;
    return {
      angle,
      targetRadiusFactor,
      initialDist,
      size,
      opacity,
    };
  });
};

export default function DandelionVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthRef = useRef(150);
  const heightRef = useRef(120);

  const particlesRef = useRef<Particle[]>([]);
  if (particlesRef.current.length === 0) {
    particlesRef.current = createParticles();
  }

  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  // Resize canvas for high-DPI
  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const updateDimensions = () => {
      const width = el.clientWidth || 150;
      const height = el.clientHeight || 120;
      widthRef.current = width;
      heightRef.current = height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Intersection observer to trigger animation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            startTimeRef.current = performance.now();
            startLoop();
          }
        } else {
          // Reset when out of view so it replays next time
          hasStartedRef.current = false;
          startTimeRef.current = null;
          drawInitialCore();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const drawInitialCore = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = widthRef.current;
    const h = heightRef.current;
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    // Draw only the dense green core
    particlesRef.current.forEach((p) => {
      const x = centerX + p.initialDist * Math.cos(p.angle);
      const y = centerY + p.initialDist * Math.sin(p.angle);

      // Core green dot
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
      ctx.fill();
    });
  };

  const startLoop = () => {
    let rafId: number;

    const render = () => {
      if (!hasStartedRef.current || startTimeRef.current === null) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const elapsed = (performance.now() - startTimeRef.current) / 1000;

      const w = widthRef.current;
      const h = heightRef.current;
      const centerX = w / 2;
      const centerY = h / 2;

      // Restrict radius so particles don't touch card borders
      const maxRadius = Math.min(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      // Calculate interpolation progress
      let progress = 0;
      let linesOpacity = 0;

      if (elapsed < 0.8) {
        progress = 0;
      } else if (elapsed >= 0.8 && elapsed < 2.0) {
        const t = (elapsed - 0.8) / 1.2;
        progress = 1 - Math.pow(1 - t, 5); // quintic ease-out

        if (elapsed >= 1.0) {
          const tLine = (elapsed - 1.0) / 1.0;
          linesOpacity = 1 - Math.pow(1 - tLine, 5);
        }
      } else {
        progress = 1.0;
        linesOpacity = 1.0;
      }

      // Draw lines first (so they render behind dots)
      if (linesOpacity > 0) {
        ctx.strokeStyle = `rgba(74, 222, 128, ${0.12 * linesOpacity})`;
        ctx.lineWidth = 0.75;
        
        particlesRef.current.forEach((p) => {
          const targetDist = p.targetRadiusFactor * maxRadius;
          const currentDist = p.initialDist + (targetDist - p.initialDist) * progress;
          
          const x = centerX + currentDist * Math.cos(p.angle);
          const y = centerY + currentDist * Math.sin(p.angle);

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.stroke();
        });
      }

      // Draw green dots
      particlesRef.current.forEach((p) => {
        const targetDist = p.targetRadiusFactor * maxRadius;
        const currentDist = p.initialDist + (targetDist - p.initialDist) * progress;
        
        const x = centerX + currentDist * Math.cos(p.angle);
        const y = centerY + currentDist * Math.sin(p.angle);

        // Soft green outer glow
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${0.15 * p.opacity})`;
        ctx.fill();

        // Solid green dot core
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
        ctx.fill();
      });

      // Stop requesting animation frames once we reach the final state at 2.0s
      if (elapsed >= 2.0) {
        return;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
