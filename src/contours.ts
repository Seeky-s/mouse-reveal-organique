export type Point = { x: number; y: number };

/** Interpolate the zero contour before rasterization, not a low-resolution alpha image. */
export function traceContours(values: Float32Array, width: number, height: number): Point[][] {
  const nodes = new Map<number, { point: Point; links: number[] }>();
  for (let y = 0; y < height - 1; y++) for (let x = 0; x < width - 1; x++) {
    const i = y * width + x;
    const a = values[i], b = values[i + 1], c = values[i + width + 1], d = values[i + width];
    const code = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (c > 0 ? 4 : 0) | (d > 0 ? 8 : 0);
    if (code === 0 || code === 15) continue;
    const ids = [2 * i, 2 * (i + 1) + 1, 2 * (i + width), 2 * i + 1];
    const edge = (e: number) => {
      const id = ids[e];
      if (!nodes.has(id)) {
        const start = e === 0 || e === 3 ? a : e === 1 ? b : d;
        const end = e === 0 ? b : e === 3 ? d : c;
        const t = start / (start - end);
        nodes.set(id, { point: {
          x: x + (e === 0 || e === 2 ? t : e === 1 ? 1 : 0),
          y: y + (e === 1 || e === 3 ? t : e === 2 ? 1 : 0),
        }, links: [] });
      }
      return id;
    };
    const connect = (first: number, second: number) => {
      const p = edge(first), q = edge(second);
      nodes.get(p)!.links.push(q); nodes.get(q)!.links.push(p);
    };
    switch (code) {
      case 1: case 14: connect(0, 3); break;
      case 2: case 13: connect(0, 1); break;
      case 3: case 12: connect(3, 1); break;
      case 4: case 11: connect(1, 2); break;
      case 6: case 9: connect(0, 2); break;
      case 7: case 8: connect(3, 2); break;
      case 5: case 10: {
        // Bilinear saddle decision keeps ambiguous cells connected consistently.
        if (a * c - b * d > 0) { connect(0, 1); connect(2, 3); }
        else { connect(0, 3); connect(1, 2); }
        break;
      }
    }
  }
  const visited = new Set<number>();
  const loops: Point[][] = [];
  for (const start of nodes.keys()) {
    if (visited.has(start)) continue;
    const points: Point[] = [];
    let current = start, previous = -1;
    while (!visited.has(current)) {
      visited.add(current);
      const node = nodes.get(current)!;
      points.push(node.point);
      const next = node.links.find(id => id !== previous);
      if (next === undefined) break;
      previous = current; current = next;
    }
    if (current === start && points.length >= 3) loops.push(points);
  }
  return loops;
}

/** Midpoint quadratic splines remove cell corners; canvas supplies device-pixel antialiasing. */
export function drawContours(context: CanvasRenderingContext2D, loops: Point[][]) {
  context.beginPath();
  for (const points of loops) {
    const first = points[0], last = points[points.length - 1];
    context.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
    for (let i = 0; i < points.length; i++) {
      const p = points[i], next = points[(i + 1) % points.length];
      context.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
    }
    context.closePath();
  }
  // Preserve holes as well as detached droplets, regardless of winding direction.
  context.fill("evenodd");
}
