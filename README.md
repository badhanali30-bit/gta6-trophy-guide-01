# Leonida Trophy Guide — GTA VI

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/badhanali30-bit/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/badhanali30-bit/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — built for the [make.fun GTA 6 trophy guide competition](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** with their official name, description and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden until earned), each with a guide written in our own words that **cites its sources** beside it.
- **Roadmap to the platinum** in six stages, built from the official descriptions: story chapters and missions, collectibles and counts, in order.
- **One missable trophy flagged**: Positive Mental Attitude — with the Chapter 1 warning and the save strategy.
- **Tracker**: a checklist whose progress saves in your browser (localStorage), exportable to a file and importable back; filters by kind (story, missable, collectibles, activities, exploration, other, online), by grade, and by search; a **spoiler mode** that hides story trophies until you earn them.
- **Fully offline**: static files under `app/`, no build step, no network requests at run time.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library. Run it twice — both runs write the same bytes.

## Files

- `app/index.html` — the guide page (header, roadmap, tracker, sources).
- `app/style.css` — the guide's own look (dusk purple + neon pink; no Rockstar art).
- `app/app.js` — tracker logic: renders trophies, saves progress, filters, spoiler mode, export/import.
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, hidden flag, kind, missable flag, count, roadmap stage, guide, steps, and a cited source per trophy.
- `screenshots/` — 4 screenshots of the guide running in a browser (see `shots.json`).
- `main.ts` — the entry program; `serve.ts` — a tiny static server for local testing.


## Sources

The trophy list is the 55-trophy list as published by PSNProfiles and Exophase and reported in the press on 18–19 November 2026. Method guidance draws on PowerPyx, GTABase, Output Lag, KeenGamer, GTA Vice City Hub (100% checklist: Insider Gaming), LeonidaKit, GTA Zone and eGamers — each trophy's guide names its source, and the app's Sources section links them. Five trophies have no confirmed unlock method yet in any source we found, and their guides say so plainly instead of inventing one.

Unofficial fan guide. Not affiliated with, endorsed by, or connected to Rockstar Games or Take-Two Interactive. No Rockstar logo, artwork or game imagery is used anywhere.
