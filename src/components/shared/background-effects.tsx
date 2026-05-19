"use client";

// ============================================================
// 全屏背景 Canvas 动效
//   · 明亮模式 → 动态飘带 (Fluttering Ribbon)
//   · 暗色模式 → 深空粒子场 (Universe)
// 跟随 next-themes 的 resolvedTheme 自动切换
// ============================================================

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// ============================================================
//  飘带效果 (Light mode)
// ============================================================

interface RibbonPoint {
  x: number;
  y: number;
}

interface RibbonSection {
  p1: RibbonPoint;
  p2: RibbonPoint;
  p3: RibbonPoint;
  color: number;
  delay: number;
  dir: "right" | "left";
  alpha: number;
  phase: number;
}

const RIBBON_OPTIONS = {
  colorSaturation: "60%",
  colorBrightness: "50%",
  colorAlpha: 0.5,
  colorCycleSpeed: 5,
  verticalPosition: "random" as const,
  horizontalSpeed: 200,
  ribbonCount: 3,
  strokeSize: 0,
  parallaxAmount: -0.2,
  animateSections: true,
};

function rand(a: number): number;
function rand<T>(a: T[]): T;
function rand(a: number, b: number): number;
function rand(a: number | unknown[], b?: number): number | unknown {
  if (Array.isArray(a)) return a[Math.floor(Math.random() * a.length)];
  if (b !== undefined) return Math.random() * (b - a) + a;
  return Math.random() * a;
}

class RibbonRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private scrollY = 0;
  private ribbons: (RibbonSection[] | null)[] = [];
  private rafId = 0;
  private resizeHandler: () => void;
  private scrollHandler: () => void;
  private active = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.resizeHandler = this.resize.bind(this);
    this.scrollHandler = this.onScroll.bind(this);
  }

  start() {
    this.active = true;
    this.resize();
    this.addRibbon();
    window.addEventListener("resize", this.resizeHandler);
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    this.draw();
  }

  stop() {
    this.active = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.resizeHandler);
    window.removeEventListener("scroll", this.scrollHandler);
    this.ribbons = [];
  }

  private resize() {
    this.W = Math.max(0, window.innerWidth);
    this.H = Math.max(0, window.innerHeight);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
  }

  private onScroll() {
    this.scrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
  }

  private addRibbon() {
    const dir: "right" | "left" = Math.round(rand(1, 9)) > 5 ? "right" : "left";
    const pad = 200;
    const leftEdge = 0 - pad;
    const rightEdge = this.W + pad;
    let y: number;
    const vp = RIBBON_OPTIONS.verticalPosition;
    if (/^(top|min)$/i.test(vp)) y = pad;
    else if (/^(middle|center)$/i.test(vp)) y = this.H / 2;
    else if (/^(bottom|max)$/i.test(vp)) y = this.H - pad;
    else y = Math.round(rand(0, this.H));

    const startX = dir === "right" ? leftEdge : rightEdge;
    const p1 = { x: startX, y };
    const p2 = { x: startX, y };
    const segments: RibbonSection[] = [];
    let color = Math.round(rand(0, 360));
    let delay = 0;

    for (let i = 1000; i > 0; i--) {
      const dx = Math.round((rand(0, 1) - 0.2) * RIBBON_OPTIONS.horizontalSpeed);
      const dy = Math.round((rand(0, 1) - 0.5) * (0.25 * this.H));
      const p3 = { x: p2.x, y: p2.y };
      if (dir === "right") {
        p3.x += dx;
        p3.y += dy;
        if (p2.x >= rightEdge) break;
      } else {
        p3.x -= dx;
        p3.y -= dy;
        if (p2.x <= leftEdge) break;
      }

      segments.push({
        p1: { x: p1.x, y: p1.y },
        p2: { x: p2.x, y: p2.y },
        p3: { x: p3.x, y: p3.y },
        color,
        delay,
        dir,
        alpha: 0,
        phase: 0,
      });
      p1.x = p2.x;
      p1.y = p2.y;
      p2.x = p3.x;
      p2.y = p3.y;
      delay += 4;
      color += RIBBON_OPTIONS.colorCycleSpeed;
    }
    this.ribbons.push(segments);
  }

  private drawSection(s: RibbonSection): boolean {
    if (s.phase >= 1 && s.alpha <= 0) return true;
    if (s.delay <= 0) {
      s.phase += 0.02;
      s.alpha = Math.sin(s.phase);
      s.alpha = s.alpha <= 0 ? 0 : s.alpha >= 1 ? 1 : s.alpha;
      if (RIBBON_OPTIONS.animateSections) {
        const wave = 0.1 * Math.sin(1 + s.phase * Math.PI / 2);
        if (s.dir === "right") {
          s.p1.x += wave;
          s.p2.x += wave;
          s.p3.x += wave;
        } else {
          s.p1.x -= wave;
          s.p2.x -= wave;
          s.p3.x -= wave;
        }
        s.p1.y += wave;
        s.p2.y += wave;
        s.p3.y += wave;
      }
    } else {
      s.delay -= 0.5;
    }

    const c = `hsla(${s.color}, ${RIBBON_OPTIONS.colorSaturation}, ${RIBBON_OPTIONS.colorBrightness}, ${s.alpha})`;
    this.ctx.save();
    if (RIBBON_OPTIONS.parallaxAmount) {
      this.ctx.translate(0, this.scrollY * RIBBON_OPTIONS.parallaxAmount);
    }
    this.ctx.beginPath();
    this.ctx.moveTo(s.p1.x, s.p1.y);
    this.ctx.lineTo(s.p2.x, s.p2.y);
    this.ctx.lineTo(s.p3.x, s.p3.y);
    this.ctx.fillStyle = c;
    this.ctx.fill();
    if (RIBBON_OPTIONS.strokeSize > 0) {
      this.ctx.lineWidth = RIBBON_OPTIONS.strokeSize;
      this.ctx.strokeStyle = c;
      this.ctx.lineCap = "round";
      this.ctx.stroke();
    }
    this.ctx.restore();
    return false;
  }

  private draw = () => {
    if (!this.active) return;

    for (let i = 0; i < this.ribbons.length; i++) {
      if (!this.ribbons[i]) this.ribbons.splice(i--, 1);
    }
    this.ctx.clearRect(0, 0, this.W, this.H);
    for (let i = 0; i < this.ribbons.length; i++) {
      const segs = this.ribbons[i];
      if (!segs) continue;
      let done = 0;
      for (let j = 0; j < segs.length; j++) {
        if (this.drawSection(segs[j])) done++;
      }
      if (done >= segs.length) this.ribbons[i] = null;
    }
    if (this.ribbons.filter(Boolean).length < RIBBON_OPTIONS.ribbonCount) {
      this.addRibbon();
    }
    this.rafId = requestAnimationFrame(this.draw);
  };
}

// ============================================================
//  深空粒子场效果 (Dark mode)
// ============================================================

interface Particle {
  giant: boolean;
  comet: boolean;
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  fadingOut: boolean | null;
  fadingIn: boolean;
  opacity: number;
  opacityThresh: number;
  do: number;
  reset: () => void;
  fadeIn: () => void;
  fadeOut: () => void;
  draw: () => void;
  move: () => void;
}

class UniverseRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private count = 0;
  private particles: Particle[] = [];
  private rafId = 0;
  private resizeHandler: () => void;
  private active = false;

  private readonly colorGiant = "180,184,240";
  private readonly colorStar = "226,225,142";
  private readonly colorComet = "226,225,224";
  private readonly speed = 0.05;
  private firstBatchDone = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.resizeHandler = this.uResize.bind(this);
  }

  start() {
    this.active = true;
    this.firstBatchDone = false;
    this.uResize();
    this.initParticles();
    window.addEventListener("resize", this.resizeHandler);
    this.uDraw();
  }

  stop() {
    this.active = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.resizeHandler);
    this.particles = [];
  }

  private uResize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.count = Math.floor(0.216 * this.W);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
  }

  private m(t: number) {
    return Math.floor(1000 * Math.random()) + 1 < 10 * t;
  }

  private r(a: number, b: number) {
    return Math.random() * (b - a) + a;
  }

  private createParticle(): Particle {
    const self = this;
    const p: Particle = {
      giant: false,
      comet: false,
      x: 0,
      y: 0,
      r: 0,
      dx: 0,
      dy: 0,
      fadingOut: null,
      fadingIn: true,
      opacity: 0,
      opacityThresh: 0,
      do: 0,
      reset() {
        p.giant = self.m(3);
        p.comet = !p.giant && !self.firstBatchDone && self.m(10);
        p.x = self.r(0, self.W - 10);
        p.y = self.r(0, self.H);
        p.r = self.r(1.1, 2.6);
        p.dx =
          self.r(self.speed, 6 * self.speed) +
          (p.comet ? self.speed * self.r(50, 120) : 0) +
          2 * self.speed;
        p.dy =
          -self.r(self.speed, 6 * self.speed) -
          (p.comet ? self.speed * self.r(50, 120) : 0);
        p.fadingOut = null;
        p.fadingIn = true;
        p.opacity = 0;
        p.opacityThresh = self.r(0.2, 1 - (p.comet ? 0.4 : 0));
        p.do = self.r(0.0005, 0.002) + (p.comet ? 0.001 : 0);
      },
      fadeIn() {
        if (p.fadingIn) {
          p.fadingIn = p.opacity <= p.opacityThresh;
          p.opacity += p.do;
        }
      },
      fadeOut() {
        if (!p.fadingOut) return;
        p.fadingOut = p.opacity >= 0;
        p.opacity -= p.do / 2;
        if (p.x > self.W || p.y < 0) {
          p.fadingOut = false;
          p.reset();
        }
      },
      draw() {
        self.ctx.beginPath();
        if (p.giant) {
          self.ctx.fillStyle = `rgba(${self.colorGiant},${p.opacity})`;
          self.ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        } else if (p.comet) {
          self.ctx.fillStyle = `rgba(${self.colorComet},${p.opacity})`;
          self.ctx.arc(p.x, p.y, 1.5, 0, 2 * Math.PI);
          for (let i = 0; i < 30; i++) {
            self.ctx.fillStyle = `rgba(${self.colorComet},${p.opacity - (p.opacity / 20) * i})`;
            self.ctx.fillRect(
              p.x - (p.dx / 4) * i,
              p.y - (p.dy / 4) * i - 2,
              2,
              2,
            );
          }
        } else {
          self.ctx.fillStyle = `rgba(${self.colorStar},${p.opacity})`;
          self.ctx.fillRect(p.x, p.y, p.r, p.r);
        }
        self.ctx.closePath();
        self.ctx.fill();
      },
      move() {
        p.x += p.dx;
        p.y += p.dy;
        if (p.fadingOut === false) p.reset();
        if (p.x > self.W - self.W / 4 || p.y < 0) p.fadingOut = true;
      },
    };
    return p;
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      const p = this.createParticle();
      p.reset();
      this.particles.push(p);
    }
    setTimeout(() => {
      this.firstBatchDone = true;
    }, 50);
  }

  private uDraw = () => {
    if (!this.active) return;

    this.ctx.clearRect(0, 0, this.W, this.H);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.move();
      p.fadeIn();
      p.fadeOut();
      p.draw();
    }
    this.rafId = requestAnimationFrame(this.uDraw);
  };
}

// ============================================================
//  React 组件
// ============================================================

export function BackgroundEffects() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const ribbonCanvasRef = useRef<HTMLCanvasElement>(null);
  const universeCanvasRef = useRef<HTMLCanvasElement>(null);
  const ribbonRendererRef = useRef<RibbonRenderer | null>(null);
  const universeRendererRef = useRef<UniverseRenderer | null>(null);
  const prevThemeRef = useRef<string | undefined>(undefined);

  // 文章详情页不展示背景动效，避免干扰阅读
  const isPostDetail = /^\/posts\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (!ribbonCanvasRef.current || !universeCanvasRef.current) return;

    // 初始化渲染器（仅一次）
    if (!ribbonRendererRef.current) {
      ribbonRendererRef.current = new RibbonRenderer(ribbonCanvasRef.current);
    }
    if (!universeRendererRef.current) {
      universeRendererRef.current = new UniverseRenderer(universeCanvasRef.current);
    }

    const prev = prevThemeRef.current;
    prevThemeRef.current = resolvedTheme;

    // 主题切换：停止旧效果，启动新效果
    if (resolvedTheme === "light" && prev !== "light") {
      universeRendererRef.current.stop();
      ribbonRendererRef.current.start();
    } else if (resolvedTheme === "dark" && prev !== "dark") {
      ribbonRendererRef.current.stop();
      universeRendererRef.current.start();
    } else if (!prev) {
      // 首次加载
      if (resolvedTheme === "light") {
        ribbonRendererRef.current.start();
      } else {
        universeRendererRef.current.start();
      }
    }

    return () => {
      ribbonRendererRef.current?.stop();
      universeRendererRef.current?.stop();
    };
  }, [resolvedTheme]);

  const canvasStyle = isPostDetail ? { display: "none" } : undefined;

  return (
    <>
      <canvas
        ref={ribbonCanvasRef}
        id="bg-ribbon-canvas"
        aria-hidden="true"
        style={canvasStyle}
      />
      <canvas
        ref={universeCanvasRef}
        id="bg-universe-canvas"
        aria-hidden="true"
        style={canvasStyle}
      />
    </>
  );
}
