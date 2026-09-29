import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import BoxMouseOrganique, { BoxMouseOrganique as Named } from '../dist/index.js';
import { LiquidField, noise } from '../dist/field.js';
import { readFileSync } from 'node:fs';

test('distribution preserves the client directive for server-component frameworks', () => {
  assert.ok(readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8').startsWith('"use client";'));
});

test('package can render on the server without browser globals', () => {
  assert.equal(BoxMouseOrganique, Named);
  const html = renderToString(createElement(BoxMouseOrganique, { img_cover:'/a.svg', img_background:'/b.svg', className:'test' }, createElement('button', null, 'Hello')));
  assert.match(html, /Hello/);
  assert.match(html, /class="test"/);
  assert.match(html, /aria-hidden="true"/);
});
test('dye remains finite and bounded under rapid motion', () => {
  const field = new LiquidField(48, 32);
  for (let i=0; i<180; i++) {
    field.deposit(24+18*Math.sin(i), 16+10*Math.cos(i), 8, Math.sin(i)*1000, Math.cos(i)*1000, .6);
    field.step(1/60, 2.2);
    assert.ok(field.dye.every(v => Number.isFinite(v) && v >= 0 && v <= 2));
  }
});
test('trail decays and separate instances never share state', () => {
  const a = new LiquidField(32,32), b = new LiquidField(32,32);
  a.deposit(16,16,9,0,0,1);
  assert.ok(a.dye.some(v => v>0));
  assert.ok(b.dye.every(v => v===0));
  for(let i=0;i<240;i++) a.step(1/60, 2.2);
  assert.ok(Math.max(...a.dye)<.001);
});
test('value noise is deterministic, continuous and seed-specific', () => {
  const a = noise(1.9,2.4,3.1,42);
  assert.equal(a,noise(1.9,2.4,3.1,42));
  assert.ok(a>=0 && a<=1);
  assert.ok(Math.abs(a-noise(1.90001,2.4,3.1,42))<.0001);
  assert.notEqual(a,noise(1.9,2.4,3.1,43));
});
