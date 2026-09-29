import { LiquidField, noise } from "./field.js";
import { drawContours, traceContours } from "./contours.js";

export interface EngineOptions {
  size: number;
  trail: number;
  organic: number;
  onError?: (error: Error) => void;
}

export function mountReveal(host: HTMLElement, canvas: HTMLCanvasElement, source: string, options: EngineOptions) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const mask = document.createElement("canvas");
  const maskContext = mask.getContext("2d");
  if (!maskContext) return () => {};
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const image = new Image();
  // Canvas is not read back/exported: cross-origin display works without CORS credentials.
  image.decoding = "async";
  let ready = false, disposed = false, inside = false, visible = true;
  let width = 1, height = 1, ratio = 1, frame = 0, last = 0, clock = 0;
  let idleTime = 0, accumulator = 0;
  let field = new LiquidField(4, 4);
  let surface = new Float32Array(16);
  const seed = Math.floor(Math.random() * 1e6);
  let target = { x: 0.5, y: 0.5 };
  let previous = { ...target };
  let positioned = false;

  const paint = () => {
    const w = field.width, h = field.height;
    let maximum = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, d = field.dye[i];
      maximum = Math.max(maximum, d);
      let signedDistance = -1;
      if (d > 0.08) {
        const scale = 8 / Math.min(w, h);
        const n = noise(x * scale, y * scale, clock * 0.24, seed);
        const detail = noise(x * scale * 2, y * scale * 2, clock * 0.16, seed + 41);
        const boundary = 0.28 + options.organic * (0.22 + 0.32 * (n - 0.5) + 0.045 * (detail - 0.5));
        signedDistance = d - boundary - 0.035;
      }
      surface[i] = signedDistance;
    }
    maskContext.setTransform(1, 0, 0, 1, 0, 0);
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.setTransform(mask.width / (w - 1), 0, 0, mask.height / (h - 1), 0, 0);
    maskContext.fillStyle = "white";
    drawContours(maskContext, traceContours(surface, w, h));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, width, height);
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const iw = image.naturalWidth * scale, ih = image.naturalHeight * scale;
    context.drawImage(image, (width - iw) / 2, (height - ih) / 2, iw, ih);
    context.globalCompositeOperation = "destination-in";
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(mask, 0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    return maximum;
  };

  const tick = (now: number) => {
    frame = 0;
    if (disposed || !ready || !visible || document.hidden || !fine.matches) return;
    const elapsed = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    if (!reduced.matches) clock += elapsed;
    accumulator = Math.min(accumulator + elapsed, 0.05);
    const w = field.width, h = field.height;
    while (accumulator >= 1 / 60) {
      const dt = 1 / 60;
      field.step(dt, reduced.matches ? 0.18 : options.trail);
      if (inside) {
        const x = target.x * w, y = target.y * h;
        const fromX = previous.x * w, fromY = previous.y * h;
        const dx = x - fromX, dy = y - fromY;
        const length = Math.hypot(dx, dy);
        const radius = Math.min(w, h) * 0.28 * options.size;
        // Resample the whole movement, even when pointer events are sparse.
        const count = Math.min(64, Math.max(1, Math.ceil(length / Math.max(1, radius / 6))));
        for (let j = 1; j <= count; j++) {
          const t = j / count;
          const amount = length > 0.1 ? Math.min(0.6, 0.15 + length / radius * 0.14) : 0.11;
          field.deposit(fromX + dx * t, fromY + dy * t, radius,
            reduced.matches ? 0 : dx * 7 / count,
            reduced.matches ? 0 : dy * 7 / count, amount / Math.sqrt(count));
        }
        previous = { ...target };
      }
      accumulator -= dt;
    }
    const max = paint();
    idleTime = inside || max > 0.09 ? 0 : idleTime + elapsed;
    if (idleTime < 0.1) frame = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (!frame && ready && visible && fine.matches && !document.hidden && !disposed) {
      last = 0;
      idleTime = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    const nextWidth = Math.max(1, bounds.width), nextHeight = Math.max(1, bounds.height);
    const nextRatio = Math.min(devicePixelRatio || 1, 2);
    if (width === nextWidth && height === nextHeight && ratio === nextRatio) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const scale = Math.min(0.5, 280 / Math.max(width, height));
    field = new LiquidField(Math.max(8, Math.round(width * scale)), Math.max(8, Math.round(height * scale)));
    mask.width = canvas.width; mask.height = canvas.height;
    surface = new Float32Array(field.width * field.height);
    previous = { ...target };
    if (positioned) wake();
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !fine.matches) return;
    const bounds = host.getBoundingClientRect();
    target = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    if (!inside) previous = { ...target };
    inside = true; positioned = true;
    wake();
  };
  const leave = () => { inside = false; wake(); };
  const visibility = () => {
    if (document.hidden) { inside = false; cancelAnimationFrame(frame); frame = 0; }
    else if (positioned) wake();
  };
  const preference = () => {
    if (!fine.matches) {
      inside = false;
      cancelAnimationFrame(frame); frame = 0;
      context.clearRect(0, 0, width, height);
    } else if (positioned) wake();
  };
  const observer = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { inside = false; cancelAnimationFrame(frame); frame = 0; }
    else if (positioned) wake();
  });
  image.onload = () => { if (!disposed) { ready = true; resize(); if (positioned) wake(); } };
  image.onerror = () => { if (!disposed) options.onError?.(new Error("Unable to load the reveal image: " + source)); };
  image.src = source;
  resize();
  observer.observe(host); intersection.observe(host);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  window.addEventListener("blur", leave);
  document.addEventListener("visibilitychange", visibility);
  fine.addEventListener("change", preference);
  reduced.addEventListener("change", preference);
  return () => {
    disposed = true; cancelAnimationFrame(frame);
    observer.disconnect(); intersection.disconnect();
    image.onload = null; image.onerror = null;
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    window.removeEventListener("blur", leave);
    document.removeEventListener("visibilitychange", visibility);
    fine.removeEventListener("change", preference);
    reduced.removeEventListener("change", preference);
    context.clearRect(0, 0, width, height);
  };
}
