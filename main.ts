// Leonida Trophy Guide — entrypoint (Node 22, standard library only).
//
// The guide itself is plain static files in app/ (index.html, style.css, app.js
// and data/trophies.json): no build step, nothing fetched over the network, and
// it opens in any static file server with app/ at its root. This program hands
// the entry in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes output/dossier.json with the vendored make.fun
// library (vendor/makefun-frontend.ts, unchanged from the kit), which is the
// summary the judge reads: the screenshots, the first load's files and bytes,
// and the source. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output, so a local run is:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the guide itself with `node serve.ts`, then open http://localhost:8080.
// The program is deterministic: two runs write the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in a half-built entry.
const appDir = join(here, 'app');
if (!existsSync(join(appDir, 'index.html'))) throw new Error('app/index.html is missing');
if (!existsSync(join(appDir, 'data', 'trophies.json'))) throw new Error('app/data/trophies.json is missing');
const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing');
const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.') && statSync(join(shotsDir, name)).isFile());
if (shots.length < 3 || shots.length > 4) throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
for (const name of shots) {
  if (!/\.(png|jpe?g)$/i.test(name)) throw new Error(`screenshots/${name} is not a PNG or JPEG`);
  if (statSync(join(shotsDir, name)).size > 262144) throw new Error(`screenshots/${name} is over the 256 KiB cap`);
  if (statSync(join(shotsDir, name)).size === 0) throw new Error(`screenshots/${name} is empty`);
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files — app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
