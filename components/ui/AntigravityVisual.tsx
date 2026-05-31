"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const PARTICLE_COUNT = 5500;

interface Particle {
  id: number;
  x0: number; // base x on unit sphere
  y0: number; // base y on unit sphere
  z0: number; // base z on unit sphere
  pathType: number; // 0: Ring, 1: Magnetic, 2: Neural, 3: Core
  orbitSpeed: number;
  orbitAngle: number;
  orbitInclination: number;
  phaseOffset: number;
  size: number;
  brightness: number;
  magneticL: number;
  magneticLat: number;
  magneticLong: number;
  waveFreq: number;
  waveAmp: number;
  wavePhase: number;
  noiseX: number;
  noiseY: number;
  noiseZ: number;
}

interface RenderTask {
  px: number;
  py: number;
  depth: number;
  size: number;
  opacity: number;
}

// 8 neural nodes for clustering in turbulence phase
const NEURAL_NODES = [
  { x: 0.5, y: 0.5, z: 0.7 },
  { x: -0.6, y: 0.4, z: -0.68 },
  { x: 0.7, y: -0.5, z: -0.5 },
  { x: -0.5, y: -0.6, z: 0.6 },
  { x: 0.1, y: 0.8, z: -0.58 },
  { x: -0.2, y: -0.8, z: 0.58 },
  { x: 0.8, y: 0.1, z: 0.58 },
  { x: -0.8, y: -0.1, z: -0.58 }
];

// Normalize neural nodes to unit sphere
NEURAL_NODES.forEach(node => {
  const d = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
  node.x /= d;
  node.y /= d;
  node.z /= d;
});

// Seeded PRNG for deterministic, reliable particle distribution across renders
const createParticles = (count: number): Particle[] => {
  const list: Particle[] = [];
  let seed = 12345;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const theta0 = random() * Math.PI * 2;
    const phi0 = Math.acos(2 * random() - 1);
    const x0 = Math.sin(phi0) * Math.cos(theta0);
    const y0 = Math.sin(phi0) * Math.sin(theta0);
    const z0 = Math.cos(phi0);

    // Grouping: 0: Orbital Rings, 1: Magnetic Field Lines, 2: Neural Waves, 3: Core Cloud
    const r = random();
    let pathType = 0;
    if (r < 0.22) pathType = 0;      // 22% rings
    else if (r < 0.52) pathType = 1; // 30% magnetic field lines
    else if (r < 0.78) pathType = 2; // 26% neural wave paths
    else pathType = 3;               // 22% core cloud

    const orbitInclination = (random() * 50 - 25) * Math.PI / 180;
    const orbitSpeed = (random() * 0.12 + 0.06) * (random() < 0.5 ? 1 : -1); // Slower orbit speeds
    const orbitAngle = random() * Math.PI * 2;

    const magneticL = 0.75 + random() * 0.45;
    const magneticLat = (random() * 2 - 1) * (Math.PI / 2.7);
    const magneticLong = random() * Math.PI * 2;

    const waveFreq = 3 + Math.floor(random() * 4);
    const waveAmp = 0.02 + random() * 0.03; // Slightly flatter waves for smoother surface
    const wavePhase = random() * Math.PI * 2;

    list.push({
      id: i,
      x0, y0, z0,
      pathType,
      orbitSpeed,
      orbitAngle,
      orbitInclination,
      phaseOffset: random() * Math.PI * 2,
      size: 0.35 + random() * 0.95,
      brightness: 0.3 + random() * 0.7,
      magneticL,
      magneticLat,
      magneticLong,
      waveFreq,
      waveAmp,
      wavePhase,
      noiseX: random() * 2 - 1,
      noiseY: random() * 2 - 1,
      noiseZ: random() * 2 - 1
    });
  }
  return list;
};

// Smoothstep and lerp helper functions
const smoothStep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

export default function AntigravityVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthRef = useRef(800);
  const heightRef = useRef(600);
  const startTimeRef = useRef<number | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  if (particlesRef.current.length === 0) {
    particlesRef.current = createParticles(PARTICLE_COUNT);
  }

  // Pre-allocated array of render tasks to prevent GC thrashing inside the 60fps loop
  const renderBufferRef = useRef<RenderTask[]>([]);
  if (renderBufferRef.current.length === 0) {
    renderBufferRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      px: 0,
      py: 0,
      depth: 0,
      size: 0,
      opacity: 0
    }));
  }

  // Responsive canvas setup and DPI scaling
  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const updateDimensions = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
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

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(el);

    updateDimensions();

    return () => resizeObserver.disconnect();
  }, []);

  // Main 3D animation loop
  useEffect(() => {
    let rafId: number;

    const render = (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        rafId = requestAnimationFrame(render);
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsedMs = timestamp - startTimeRef.current;
      const t = (elapsedMs / 1000) % 12; // Perfect 12-second time loop

      const w = widthRef.current;
      const h = heightRef.current;
      const centerX = w * 0.65; // Shifted further right to balance the left-heavy text layout
      const centerY = h * 0.42; // Shifted up slightly to avoid overlapping header text

      // Base radius scaled dynamically to viewport size
      const maxRadius = Math.min(w, h) * 0.28;

      ctx.clearRect(0, 0, w, h);

      // --- 1. Compute Phase Interpolation Coefficients ---
      
      // Global Fade factor for seamless looping at 12s -> 0s transition
      let fadeScale = 1.0;
      if (t < 1.0) {
        fadeScale = smoothStep(0.0, 1.0, t);
      } else if (t > 11.0) {
        fadeScale = 1.0 - smoothStep(11.0, 12.0, t);
      }

      // Phase 0 -> 2.4: Assembly / Inward drift (extended and eased quinticly to keep wide on screen even longer)
      const driftProgress = Math.pow(smoothStep(0.0, 2.4, t), 5.0);

      // Phase 2.4 -> 3.2: Path Organization
      const blendPath = smoothStep(2.4, 3.2, t);

      // Phase 3.2 -> 3.8: Scale to Full Size
      const scaleProgress = smoothStep(3.2, 3.8, t);
      const mainScale = lerp(0.7, 1.0, scaleProgress);

      // Phase 3.8 -> 5.2: Organic Breathing
      // Breathing active between 3.8s and 5.2s
      const isBreathing = t >= 3.8 && t < 5.2;

      // Phase 5 -> 6: Turbulence and Neural Attractors
      let turbBlend = 0;
      if (t >= 5.0 && t < 5.5) {
        turbBlend = smoothStep(5.0, 5.5, t);
      } else if (t >= 5.5 && t < 6.0) {
        turbBlend = 1.0 - smoothStep(5.5, 6.0, t);
      }

      // Phase 6 -> 8 -> 9: Hollow Ring Formation and Collapse
      let ringBlend = 0;
      if (t >= 6.0 && t < 7.0) {
        ringBlend = smoothStep(6.0, 7.0, t);
      } else if (t >= 7.0 && t < 8.0) {
        ringBlend = 1.0;
      } else if (t >= 8.0 && t < 9.0) {
        ringBlend = 1.0 - smoothStep(8.0, 9.0, t);
      }

      // Phase 8 -> 9: Ring Collapse
      const collapseProgress = smoothStep(8.0, 9.0, t);
      const collapseScale = 1.0 - 0.55 * Math.sin(collapseProgress * Math.PI);
      const spiralAngle = 1.5 * collapseProgress; // Slower spiral rotation

      // Phase 9 -> 10: Density Increase / Thinking
      const reformProgress = smoothStep(9.0, 10.0, t);
      const densityBoost = 0.25 * reformProgress * (1.0 - smoothStep(10.0, 11.0, t));

      // Phase 10 -> 11: Subtle Energy Wave Pulse
      const pulseProgress = Math.max(0, Math.min(1, t - 10.0));

      // Global Rotation Speed (Linear drift of ~1.7 deg/sec, extremely slow and smooth)
      const baseRotationAngle = t * 0.03;

      // Subtle Camera Sway (Cinematic Drift, max 1.5%)
      const cameraSwayAngle = (t / 12) * Math.PI * 2;
      const driftX = 0.015 * Math.sin(cameraSwayAngle) * maxRadius;
      const driftY = 0.010 * Math.cos(cameraSwayAngle * 2) * maxRadius;

      // 3D Tilt Parameters (Tilt around X-axis by 18 degrees)
      const tilt = (18 * Math.PI) / 180;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      const particles = particlesRef.current;
      const renderBuffer = renderBufferRef.current;

      // --- 2. Calculate coordinates for each particle at current timestamp ---
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        
        // Dynamic speed multiplier for "thinking" current streams during Phase 9->10
        const flowBoost = 1.0 + 0.15 * Math.sin(reformProgress * Math.PI); // Gentler boost
        const timeFactor = t * flowBoost;

        let pathX = 0, pathY = 0, pathZ = 0;

        // Path calculation depending on particle's structural type
        if (p.pathType === 0) {
          // 1. ORBITAL RINGS
          // Particle orbits on a tilted plane. Non-uniform rotation speed creates camera-front speed effect.
          const baseAng = p.orbitAngle + p.orbitSpeed * timeFactor;
          const orbitAng = baseAng + 0.1 * Math.sin(baseAng); // Smoother non-uniform speed transitions
          const xp = Math.cos(orbitAng);
          const yp = Math.sin(orbitAng);
          
          const ringLayerScale = 0.85 + 0.25 * (p.id % 4) / 4;
          pathX = xp * ringLayerScale;
          pathY = yp * Math.cos(p.orbitInclination) * ringLayerScale;
          pathZ = yp * Math.sin(p.orbitInclination) * ringLayerScale;

        } else if (p.pathType === 1) {
          // 2. DIPOLE MAGNETIC FIELD LINES
          // Follows magnetic dipole equation: r = L * cos(latitude)^2
          const dipoleR = p.magneticL * Math.pow(Math.cos(p.magneticLat), 2);
          const xp = dipoleR * Math.cos(p.magneticLat);
          const yp = dipoleR * Math.sin(p.magneticLat);
          const lon = p.magneticLong + 0.025 * timeFactor; // Slower magnetic drift
          
          pathX = xp * Math.cos(lon);
          pathZ = xp * Math.sin(lon);
          pathY = yp;

        } else if (p.pathType === 2) {
          // 3. NEURAL WAVY PATHWAYS
          const baseAng = p.orbitAngle + p.orbitSpeed * timeFactor;
          const lon = baseAng + 0.1 * Math.sin(baseAng);
          const lat = Math.acos(p.z0);
          
          const rW = 1.0 + p.waveAmp * Math.sin(p.waveFreq * lon + p.wavePhase + timeFactor * 0.5); // Slower wavy ripple (0.5 vs 1.8)
          pathX = rW * Math.sin(lat) * Math.cos(lon);
          pathY = rW * Math.sin(lat) * Math.sin(lon);
          pathZ = rW * Math.cos(lat);

        } else {
          // 4. CORE CLOUD (Volumetric distribution)
          const lon = p.orbitAngle + p.orbitSpeed * 0.4 * timeFactor; // Slower core drift (0.4 vs 1.3)
          const lat = Math.acos(p.z0);
          const coreR = 0.32 + 0.58 * ((p.id % 12) / 12);
          
          pathX = coreR * Math.sin(lat) * Math.cos(lon);
          pathY = coreR * Math.sin(lat) * Math.sin(lon);
          pathZ = coreR * Math.cos(lat);
        }

        // Loose Cloud Position for Second 0->1 Assembly
        const cloudRadius = 1.55 + 0.75 * (p.id % 15) / 15;
        const cloudX = cloudRadius * p.x0;
        const cloudY = cloudRadius * p.y0;
        const cloudZ = cloudRadius * p.z0;

        // Start Assembly position (drifting from far away outer coordinates)
        const outerRadius = 3.3; // Widen starting radius to fill the whole screen edges
        const outerX = outerRadius * p.x0;
        const outerY = outerRadius * p.y0;
        const outerZ = outerRadius * p.z0;

        // Current coordinate placeholders
        let x = 0, y = 0, z = 0;

        if (t < 2.4) {
          // --- Phase 0 -> 2.4: Magnetic drift inward (stays at edges even longer) ---
          x = lerp(outerX, cloudX, driftProgress);
          y = lerp(outerY, cloudY, driftProgress);
          z = lerp(outerZ, cloudZ, driftProgress);
        } else if (t < 3.2) {
          // --- Phase 2.4 -> 3.2: Organise from cloud to paths ---
          const cx = lerp(cloudX, pathX, blendPath);
          const cy = lerp(cloudY, pathY, blendPath);
          const cz = lerp(cloudZ, pathZ, blendPath);
          const scale = lerp(1.22, 0.7, blendPath);
          x = cx * scale;
          y = cy * scale;
          z = cz * scale;
        } else {
          // Normal structured coordinates
          x = pathX * mainScale;
          y = pathY * mainScale;
          z = pathZ * mainScale;

          // --- Phase 3.8 -> 5.2: Organic breathing expansion (inside-out ripple) ---
          if (isBreathing) {
            const radialDist = Math.sqrt(x*x + y*y + z*z);
            const breathDelay = (1.0 - radialDist) * 0.26;
            const tBreath = t - breathDelay;
            
            let breathInt = 0;
            if (tBreath >= 3.8 && tBreath < 4.5) {
              breathInt = smoothStep(3.8, 4.5, tBreath);
            } else if (tBreath >= 4.5 && tBreath < 5.2) {
              breathInt = 1.0 - smoothStep(4.5, 5.2, tBreath);
            }
            const bScale = 1.0 + 0.04 * breathInt;
            x *= bScale;
            y *= bScale;
            z *= bScale;
          }

          // --- Phase 5 -> 6: Turbulence and neural clustering ---
          if (turbBlend > 0) {
            // Find closest attractor node on unit sphere
            let closestIdx = 0;
            let maxDot = -1;
            for (let k = 0; k < NEURAL_NODES.length; k++) {
              const dot = pathX * NEURAL_NODES[k].x + pathY * NEURAL_NODES[k].y + pathZ * NEURAL_NODES[k].z;
              if (dot > maxDot) {
                maxDot = dot;
                closestIdx = k;
              }
            }
            const node = NEURAL_NODES[closestIdx];
            
            // Attract towards the neural node slightly to form clusters
            x = lerp(x, node.x * 1.02 * mainScale, 0.45 * turbBlend);
            y = lerp(y, node.y * 1.02 * mainScale, 0.45 * turbBlend);
            z = lerp(z, node.z * 1.02 * mainScale, 0.45 * turbBlend);

            // Add wave turbulence offsets (much slower sin/cos rates)
            x += p.noiseX * 0.07 * turbBlend * Math.sin(t * 2.2 + p.phaseOffset);
            y += p.noiseY * 0.07 * turbBlend * Math.cos(t * 2.2 + p.phaseOffset);
            z += p.noiseZ * 0.07 * turbBlend * Math.sin(t * 1.5 + p.phaseOffset);
          }

          // --- Phase 6 -> 8 -> 9: Ring transition and orbit layers ---
          if (ringBlend > 0) {
            const rxz = Math.sqrt(pathX*pathX + pathZ*pathZ);
            const ringR = 1.15;
            const rx = (pathX / (rxz + 1e-5)) * ringR * mainScale;
            const rz = (pathZ / (rxz + 1e-5)) * ringR * mainScale;
            const ry = pathY * 0.12 * mainScale; // compress height to form thin flat disk ring

            x = lerp(x, rx, ringBlend);
            y = lerp(y, ry, ringBlend);
            z = lerp(z, rz, ringBlend);
          }

          // --- Phase 8 -> 9: System Inward Collapse ---
          if (collapseProgress > 0 && collapseProgress < 1) {
            // Apply collapse contraction
            x *= collapseScale;
            y *= collapseScale;
            z *= collapseScale;

            // Apply spiral twist
            const pSpiralAngle = spiralAngle * (1.0 - (p.id % 5) / 5);
            const cosS = Math.cos(pSpiralAngle);
            const sinS = Math.sin(pSpiralAngle);
            const sx = x * cosS - z * sinS;
            const sz = x * sinS + z * cosS;
            x = sx;
            z = sz;
          }
        }

        // Apply scale multiplier to physical pixels
        const px_phys = x * maxRadius;
        const py_phys = y * maxRadius;
        const pz_phys = z * maxRadius;

        // Apply slow continuous orbital spin of sphere around vertical axis
        // Ring layer speed adjustments: Middle faster, front/rear slower
        const ringSpeedFactor = 1.0 + 0.65 * ringBlend * Math.cos(pz_phys / (1.2 * maxRadius) * Math.PI);
        const currentRotAngle = baseRotationAngle * ringSpeedFactor;
        const cosR = Math.cos(currentRotAngle);
        const sinR = Math.sin(currentRotAngle);
        
        const rx = px_phys * cosR - pz_phys * sinR;
        const rz = px_phys * sinR + pz_phys * cosR;
        const ry = py_phys;

        // 3D Tilt around X-axis (18 degrees tilt)
        const tx = rx;
        const ty = ry * cosT - rz * sinT;
        const tz = ry * sinT + rz * cosT;

        // Perspective projection formula
        const cameraDistance = maxRadius * 2.5;
        const f = cameraDistance / (cameraDistance + tz);

        // Project coordinate with camera drift sway
        const px = centerX + tx * f + driftX;
        const py = centerY + ty * f + driftY;

        // Opacity staggered fade-in during drift emergence (Phase 0->2.4)
        let opacityFactor = 1.0;
        if (t < 2.4) {
          const staggerDelay = (p.id % 200) / 200 * 1.2;
          opacityFactor = smoothStep(staggerDelay, staggerDelay + 0.65, t);
        }

        // Phase 10 -> 11: Propagation of energy pulse from center outward
        let pulseBoost = 0.0;
        if (pulseProgress > 0 && pulseProgress < 1) {
          const currentDist = Math.sqrt(x*x + y*y + z*z);
          const waveRadius = 1.45 * pulseProgress;
          const waveWidth = 0.15;
          const distToWave = Math.abs(currentDist - waveRadius);
          pulseBoost = 0.14 * Math.exp(-Math.pow(distToWave / waveWidth, 2));
        }

        // Final brightness configuration incorporating depth fade and loop fades (scaled down for subtle look)
        const depthRatio = Math.max(0, Math.min(1, (tz + maxRadius * 1.3) / (maxRadius * 2.6)));
        const finalOpacity = p.brightness * 
                            (1.0 - depthRatio * 0.55) * 
                            fadeScale * 
                            opacityFactor * 
                            (1.0 + densityBoost) * 
                            (1.0 + pulseBoost) *
                            0.7; // 30% brightness reduction for a more delicate glow

        // Populate pre-allocated render buffer
        const renderTask = renderBuffer[i];
        renderTask.px = px;
        renderTask.py = py;
        renderTask.depth = tz;
        renderTask.size = p.size * (1.35 - depthRatio * 0.75) * (w / 1440);
        renderTask.opacity = finalOpacity;
      }

      // --- 3. Depth Sorting (Painter's algorithm: draw back-to-front) ---
      renderBuffer.sort((a, b) => b.depth - a.depth);

      // --- 4. Canvas Drawing ---
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const task = renderBuffer[i];
        if (task.opacity <= 0.015) continue;

        // Dual-pass glow:
        // Pass 1: Soft radial ambient halo glow
        ctx.beginPath();
        ctx.arc(task.px, task.py, task.size * 2.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${task.opacity * 0.14})`;
        ctx.fill();

        // Pass 2: High intensity solid core
        ctx.beginPath();
        ctx.arc(task.px, task.py, task.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${task.opacity * 0.88})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </motion.div>
  );
}
