/** Independent CPU field solver. Velocities are measured in grid cells/second. */
export class LiquidField {
  readonly width: number;
  readonly height: number;
  dye: Float32Array;
  private u: Float32Array;
  private v: Float32Array;
  private nextU: Float32Array;
  private nextV: Float32Array;
  private nextDye: Float32Array;
  private pressure: Float32Array;
  private nextPressure: Float32Array;
  private divergence: Float32Array;

  constructor(width: number, height: number) {
    this.width = Math.max(4, Math.round(width));
    this.height = Math.max(4, Math.round(height));
    const length = this.width * this.height;
    this.dye = new Float32Array(length);
    this.u = new Float32Array(length);
    this.v = new Float32Array(length);
    this.nextU = new Float32Array(length);
    this.nextV = new Float32Array(length);
    this.nextDye = new Float32Array(length);
    this.pressure = new Float32Array(length);
    this.nextPressure = new Float32Array(length);
    this.divergence = new Float32Array(length);
  }

  private sample(values: Float32Array, x: number, y: number) {
    x = Math.max(0, Math.min(this.width - 1.001, x));
    y = Math.max(0, Math.min(this.height - 1.001, y));
    const ix = Math.floor(x), iy = Math.floor(y);
    const a = x - ix, b = y - iy, i = iy * this.width + ix;
    return (values[i] * (1 - a) + values[i + 1] * a) * (1 - b)
      + (values[i + this.width] * (1 - a) + values[i + this.width + 1] * a) * b;
  }

  /** Smooth finite-support brush; no copied shader or Gaussian splat code. */
  deposit(x: number, y: number, radius: number, dx: number, dy: number, amount: number) {
    const w = this.width, h = this.height;
    const r = Math.max(1, radius);
    for (let j = Math.max(1, Math.floor(y - r)); j <= Math.min(h - 2, Math.ceil(y + r)); j++) {
      for (let k = Math.max(1, Math.floor(x - r)); k <= Math.min(w - 2, Math.ceil(x + r)); k++) {
        const distance = Math.hypot(k - x, j - y) / r;
        if (distance >= 1) continue;
        const t = 1 - distance;
        const weight = t * t * (3 - 2 * t);
        const i = j * w + k;
        this.dye[i] = Math.min(2, this.dye[i] + amount * weight);
        this.u[i] = Math.max(-200, Math.min(200, this.u[i] + dx * weight));
        this.v[i] = Math.max(-200, Math.min(200, this.v[i] + dy * weight));
      }
    }
  }

  step(dt: number, returnSeconds: number) {
    const w = this.width, h = this.height;
    const damping = Math.exp(-dt * 3.8);
    // Trace each cell backwards through the velocity field.
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const px = x - this.u[i] * dt, py = y - this.v[i] * dt;
        this.nextU[i] = this.sample(this.u, px, py) * damping;
        this.nextV[i] = this.sample(this.v, px, py) * damping;
      }
    }
    [this.u, this.nextU] = [this.nextU, this.u];
    [this.v, this.nextV] = [this.nextV, this.v];
    this.pressure.fill(0);
    this.nextPressure.fill(0);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        this.divergence[i] = (this.u[i + 1] - this.u[i - 1] + this.v[i + w] - this.v[i - w]) / 2;
      }
    }
    // Jacobi relaxation for pressure, with zero boundary values.
    for (let iteration = 0; iteration < 12; iteration++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          this.nextPressure[i] = (this.pressure[i - 1] + this.pressure[i + 1]
            + this.pressure[i - w] + this.pressure[i + w] - this.divergence[i]) / 4;
        }
      }
      [this.pressure, this.nextPressure] = [this.nextPressure, this.pressure];
    }
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        this.u[i] -= (this.pressure[i + 1] - this.pressure[i - 1]) / 2;
        this.v[i] -= (this.pressure[i + w] - this.pressure[i - w]) / 2;
      }
    }
    const decay = Math.exp(-dt * 4 / returnSeconds);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        this.nextDye[i] = this.sample(this.dye, x - this.u[i] * dt, y - this.v[i] * dt) * decay;
      }
    }
    [this.dye, this.nextDye] = [this.nextDye, this.dye];
  }
}

const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
const hash = (x: number, y: number, z: number, seed: number) => {
  let bits = Math.imul(x ^ seed, 1597334677) ^ Math.imul(y, 3812015801) ^ Math.imul(z, 958689241);
  bits = Math.imul(bits ^ (bits >>> 16), 2246822519);
  return ((bits ^ (bits >>> 13)) >>> 0) / 4294967295;
};

/** Smooth lattice value noise, independently authored (not simplex noise). */
export function noise(x: number, y: number, z: number, seed: number) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const tx = smooth(x - ix), ty = smooth(y - iy), tz = smooth(z - iz);
  let value = 0;
  for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    value += hash(ix + i, iy + j, iz + k, seed)
      * (i ? tx : 1 - tx) * (j ? ty : 1 - ty) * (k ? tz : 1 - tz);
  }
  return value;
}
