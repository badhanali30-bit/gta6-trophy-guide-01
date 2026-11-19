// Leonida Trophy Guide — GTA VI, 55 trophies. Node 22, standard library only.
// main.ts hands the guide in: it copies this repository's app/ (the offline guide
// and tracker) and screenshots/ to /output and writes /output/dossier.json with
// buildDossier from the vendored make.fun library, exactly as the kit's starter
// does. vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer
// requires dossier.json to be byte for byte what its own copy writes.
// Run it twice and compare: both runs must write the same bytes.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
// Determinism: the copy is byte for byte and buildDossier is a pure function of
// app/ + screenshots/, so two runs write identical bytes — the gate runs it twice.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
