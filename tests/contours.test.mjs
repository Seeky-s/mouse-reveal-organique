import test from 'node:test';
import assert from 'node:assert/strict';
import { traceContours, drawContours } from '../dist/contours.js';

const grid = (size, fn) => Float32Array.from({length:size*size}, (_, i) => fn(i%size, Math.floor(i/size)));
test('contours interpolate between cells instead of snapping to pixels', () => {
  const loops = traceContours(grid(32, (x,y) => 8.3-Math.hypot(x-16,y-16)),32,32);
  assert.equal(loops.length, 1);
  assert.ok(loops[0].some(p => p.x % 1 !== 0 && p.y % 1 === 0));
  for(const p of loops[0]) assert.ok(Math.abs(Math.hypot(p.x-16,p.y-16)-8.3)<.04);
});
test('holes and detached droplets produce independent closed loops', () => {
  const values = grid(48, (x,y) => {
    const r = Math.hypot(x-16,y-24);
    return Math.max(Math.min(11-r,r-5), 3-Math.hypot(x-39,y-24));
  });
  assert.equal(traceContours(values,48,48).length, 3);
  assert.deepEqual(traceContours(new Float32Array(64).fill(-1),8,8), []);
});
test('drawing uses smooth quadratic segments and even-odd filling', () => {
  const loops = traceContours(grid(16, (x,y) => 4.5-Math.hypot(x-8,y-8)),16,16);
  let curves=0, closed=0, rule;
  drawContours({beginPath(){},moveTo(){},quadraticCurveTo(...args){curves++;assert.ok(args.every(Number.isFinite));},closePath(){closed++;},fill(value){rule=value;}}, loops);
  assert.equal(curves,loops[0].length);
  assert.equal(closed,1);
  assert.equal(rule,'evenodd');
});
