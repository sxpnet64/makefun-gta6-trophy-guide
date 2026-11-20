# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sxpnet64/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sxpnet64/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 0 online). Every trophy has its official name, description and grade, a guide written in our own words with cited sources, and a note on when it can be missed. It includes a four-stage platinum roadmap (story → 100% Completion Checklist → Strangers &amp; Freaks clean-up → platinum), filters by kind (story / missable / collectibles / activities / online) and grade, search, difficulty ratings, a spoiler setting that hides story trophies until earned, and a checklist whose progress is saved in the browser (localStorage) and can be exported to a file and imported back. Static files only — it works with the network off.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or build the submission output (what the grader runs):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/app is the guide, out/screenshots are its screenshots, out/dossier.json is the judge's summary
```

## What is inside

- `main.ts` — the entrypoint (Node 22, standard library only): copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`.
- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself: static files, no build step, no network requests at run time.
- `app/data/trophies.json` — the 55 trophies with official names/descriptions/grades, our own guide text, steps, timing notes, sources, kind, difficulty, roadmap stage, and the missable flag.
- `screenshots/` — 4 screenshots of the guide taken with Playwright + Chromium from the running app (see `shots.json` for what each one shows).
- `serve.ts` — a tiny static server for local development only.

## Trophy data sources

Names, descriptions and grades are the official PlayStation 5 list as mirrored by PSNProfiles and Exophase, cross-checked on 2026-11-20 against:

- PowerPyx — GTA 6 Trophy Guide &amp; Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- Push Square — GTA 6: Trophy Guide &amp; Roadmap: https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap
- KeenGamer — GTA 6 Trophy Guide &amp; Platinum Roadmap: https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- Insider Gaming — Complete GTA 6 Trophy List: https://insider-gaming.com/complete-gta-6-trophy-list-how-to-get-all-trophies-achievements/
- HowToVideoGame — GTA 6: Trophy and Achievement List: https://howtovideogame.com/gta-6-trophies/
- GTASpotter — GTA VI trophies and achievements: https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/
- GTA Zone — GTA 6 Trophy List: https://gta-zone.com/news/gta-6-trophies-achievements/

Each trophy in `app/data/trophies.json` names the guide its facts come from. Guide text is written in our own words; nothing is copied from those guides. Trophy names and descriptions are shown as PlayStation publishes them. Where a fact is unconfirmed — the unlock method for **Bad Luck, I Guess**, and whether the Chapter 1 meditation is actually required for **Positive Mental Attitude** — the guide says so instead of guessing.

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive, or Sony Interactive Entertainment. No Rockstar logos, artwork, box art, or game screenshots are used.

---

<sub>Entered on [make.fun](https://make.fun/?ref=86976acr&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
