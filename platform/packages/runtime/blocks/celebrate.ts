// celebrate(anchor) — a small confetti burst for the moment a check passes.
// Dep-free canvas overlay: ~90 particles fountain up from the anchor element,
// colored from the theme's chart tokens, gone in ~1.4s. Respects
// prefers-reduced-motion (no-op). Blocks call this automatically on success
// (Quiz/NumericAnswer correct, Challenge clear, SketchPad matched) — authors
// can also fire it from custom gameplay moments.
const COLOR_TOKENS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--primary"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  shape: 0 | 1; // rect | circle
}

export function celebrate(anchor?: Element | null): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const rect = anchor?.getBoundingClientRect();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + Math.min(40, rect.height / 2) : window.innerHeight / 2;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const styles = getComputedStyle(document.documentElement);
  const colors = COLOR_TOKENS.map((t) => styles.getPropertyValue(t).trim()).filter(Boolean);

  const particles: Particle[] = Array.from({ length: 90 }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6; // fountain up, spread
    const speed = 320 + Math.random() * 420;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 5,
      color: colors[i % colors.length] || "#8b9cf6",
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 12,
      shape: (i % 3 === 0 ? 1 : 0) as 0 | 1,
    };
  });

  const GRAVITY = 1300;
  const DURATION = 1.4;
  let last = performance.now();
  let elapsed = 0;

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const fade = elapsed > DURATION - 0.4 ? Math.max(0, (DURATION - elapsed) / 0.4) : 1;
    for (const p of particles) {
      p.vy += GRAVITY * dt;
      p.vx *= 0.995;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (elapsed < DURATION) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}
