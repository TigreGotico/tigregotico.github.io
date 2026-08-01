#!/usr/bin/env node
// Verifies WCAG 2.1 contrast between --color-primary-fg and each gradient
// stop (--grad-from/--grad-via/--grad-to) for every palette block defined in
// src/styles/global.css. Fails CI (exit 1) if any pair drops below 4.5:1.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = join(__dirname, '..', 'src', 'styles', 'global.css');
const css = readFileSync(cssPath, 'utf8');

const MIN_RATIO = 4.5;
const TOKENS = ['--color-primary-fg', '--grad-from', '--grad-via', '--grad-to'];

function channelToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map(channelToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(rgbA, rgbB) {
  const lA = relativeLuminance(rgbA);
  const lB = relativeLuminance(rgbB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgbTriplet(str) {
  const parts = str.trim().split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return parts;
}

// Match each top-level selector block: `<selector> { ...body... }`.
// We only care about blocks that define at least one of our tokens.
const blockRegex = /([^{}]+)\{([^{}]*)\}/g;

const palettes = [];
let match;
while ((match = blockRegex.exec(css)) !== null) {
  const selector = match[1]
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
    .replace(/\s+/g, ' ');
  const body = match[2];

  const found = {};
  for (const token of TOKENS) {
    const tokenRegex = new RegExp(`${token}\\s*:\\s*([^;]+);`);
    const m = body.match(tokenRegex);
    if (m) {
      const rgb = parseRgbTriplet(m[1]);
      if (rgb) found[token] = rgb;
    }
  }

  if (found['--color-primary-fg'] && (found['--grad-from'] || found['--grad-via'] || found['--grad-to'])) {
    palettes.push({ selector, ...found });
  }
}

if (palettes.length === 0) {
  console.error('No palette blocks with --color-primary-fg + gradient stops found.');
  process.exit(1);
}

const stopNames = ['--grad-from', '--grad-via', '--grad-to'];
let worst = Infinity;
let anyFail = false;

const rows = [];
for (const palette of palettes) {
  const fg = palette['--color-primary-fg'];
  for (const stop of stopNames) {
    const rgb = palette[stop];
    if (!rgb) continue;
    const ratio = contrastRatio(fg, rgb);
    const pass = ratio >= MIN_RATIO;
    if (!pass) anyFail = true;
    if (ratio < worst) worst = ratio;
    rows.push({
      selector: palette.selector,
      stop,
      fg: fg.join(' '),
      bg: rgb.join(' '),
      ratio: ratio.toFixed(2),
      pass: pass ? 'PASS' : 'FAIL',
    });
  }
}

const colWidths = {
  selector: Math.max(...rows.map((r) => r.selector.length), 'selector'.length),
  stop: Math.max(...rows.map((r) => r.stop.length), 'stop'.length),
  fg: Math.max(...rows.map((r) => r.fg.length), 'fg'.length),
  bg: Math.max(...rows.map((r) => r.bg.length), 'bg'.length),
  ratio: Math.max(...rows.map((r) => r.ratio.length), 'ratio'.length),
  pass: 4,
};

function pad(str, width) {
  return str + ' '.repeat(Math.max(0, width - str.length));
}

const header = [
  pad('selector', colWidths.selector),
  pad('stop', colWidths.stop),
  pad('fg', colWidths.fg),
  pad('bg', colWidths.bg),
  pad('ratio', colWidths.ratio),
  pad('pass', colWidths.pass),
].join(' | ');
console.log(header);
console.log('-'.repeat(header.length));

for (const r of rows) {
  console.log(
    [
      pad(r.selector, colWidths.selector),
      pad(r.stop, colWidths.stop),
      pad(r.fg, colWidths.fg),
      pad(r.bg, colWidths.bg),
      pad(r.ratio, colWidths.ratio),
      pad(r.pass, colWidths.pass),
    ].join(' | ')
  );
}

console.log('-'.repeat(header.length));
console.log(`Worst-case ratio: ${worst.toFixed(2)} (minimum required: ${MIN_RATIO})`);

if (anyFail) {
  console.error('\nContrast check FAILED: one or more pairs are below 4.5:1.');
  process.exit(1);
}

console.log('\nContrast check passed: all pairs meet or exceed 4.5:1.');
process.exit(0);
