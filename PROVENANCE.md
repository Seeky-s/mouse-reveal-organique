# Implementation provenance

This project was started on 2026-09-29 as a separate React library. The earlier application remains unchanged and is not distributed here.

## Inspiration, not bundled source

The desired interaction was visually inspired by https://www.valenvan.com/ and Framer University's [Crazy Hover Mask Reveal](https://framer.university/resources/crazy-hover-mask-reveal-in-framer). The earlier prototype used/adapted publicly accessible Framer component code. Public accessibility and permission to use a component on a website do not by themselves establish permission to redistribute that component as an npm library.

This library does not include those shaders, Framer component code, original photographs, or the earlier application's assets. Its field solver, value noise, canvas compositor, React wrapper and demo illustrations were written separately for this project. Because the reference source was previously examined, this is not a formally isolated clean-room process and is not a legal clearance opinion.

## Mathematical background

The numerical approach uses general techniques: backward/semi-Lagrangian advection, a discrete divergence/pressure solve using Jacobi iterations, velocity projection, dye decay, finite-support brush deposition and interpolated lattice value noise.

Background reference: [GPU Gems, Chapter 38 — Fast Fluid Dynamics Simulation on the GPU](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu). No source listings or shader code from that chapter are included; this implementation runs a small CPU grid in TypeScript and composites images with Canvas 2D.

## Dependencies and assets

- React / React DOM: peer dependencies, not bundled.
- TypeScript, React types and Vite: development dependencies only. Their respective licenses remain applicable.
- `demo/public/*.svg`: original geometric illustrations created for this project.
- No Three.js, simplex-noise library, remote fonts, original site images or Framer runtime.

The MIT license supplied here applies only to this project's original files. The maintainer should confirm ownership and publication authority before release; it does not grant rights to external reference works.
