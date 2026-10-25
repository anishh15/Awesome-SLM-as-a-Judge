# Project website

The site for *Small Language Models as Judges: A Survey*, served at
<https://anishh15.github.io/Awesome-SLM-as-a-Judge/>. It is a Vite + React app with hash routes
(`#/insights`, `#/papers?cat=judge-systems`, `#/figures?fig=2a`), so every page and filter can be linked
and GitHub Pages needs no server rules.

No number, list or passage of the paper is typed into the pages. Counts, the paper list, the insights,
the challenges, the outline and the figure captions are generated from files in this repository, and
the build stops if they disagree with the paper. The few values that cannot be derived (venue, BibTeX,
author profile links) are in `site.config.mjs`.

## Where the content comes from

| Shown on the site | Source |
|:--|:--|
| The 105 works, categories, groups, links | `../data/papers.yaml` (shared with the README) |
| BibTeX per work, citation labels such as "Li et al., 2024b" | `../data/references.bib` |
| Abstract, insight statements, challenges, deployment recipe, SLM definition | `paper/main.tex` |
| Corpus counts the build checks against (not shown on the site) | `paper/appendix/M_methodology.tex` |
| Table 2 (insights) and Table 3 (judge systems) | `paper/tables/2_insight_summary.tex`, `paper/tables/3_judge_systems.tex` |
| Section and appendix numbers, figure numbers and captions, PDF anchors | `paper/outline.json` |
| The PDF | `public/paper.pdf` |
| The 17 figure files, light and dark | `public/figures/light/*.svg`, `public/figures/dark/*.svg` |
| Venue, paper link, BibTeX, author profile links | `site.config.mjs` (the one hand-set file) |

`paper/` and `public/` are written by the sync script below. `src/generated/` is written by the data
script on every `dev` and `build` and is not committed.

## Commands

```bash
cd website
npm ci                 # install (Node 20 or newer)
npm run dev            # http://localhost:5173/Awesome-SLM-as-a-Judge/
npm run build          # production build in dist/
npm run preview        # serve dist/ at http://localhost:4173/Awesome-SLM-as-a-Judge/
npm run links          # every external URL the site shows (see below)
npm run og             # redraw public/og.png, the link-card image (needs Chrome)
```

`npm run og` (`scripts/make-og.mjs`) draws the 1200 x 630 link-card image in the layout of the README
banner and the site's dark palette, with the counts and authors from the generated data, and renders it
with headless Chrome (`CHROME=path` if Chrome is elsewhere). `--github OUT.png` (or `OG_GITHUB_OUT=OUT.png`)
also writes a 1280 x 640 copy for the repository's social preview; keep that file outside the repository. Run it again when the counts change.

`npm run dev` and `npm run build` first run `npm run data` (`scripts/build-data.mjs`), which reads the
sources above and writes `src/generated/site.json` and `src/generated/papers.json`.

## When the paper changes

```bash
# 1. the paper list and bib (repository scripts, from the repository root)
python3 scripts/sync_bib.py --paper-dir "<paper folder>"
python3 scripts/build_readme.py

# 2. the figures, if they changed (in Survey Paper/figure_source)
python3 render_all.py --fmt svg,png      # light renders in figure_source/light/
python3 render_all.py --theme dark       # dark renders in figure_source/dark/

# 3. the site's copy of the paper (from website/)
npm run sync -- --paper-dir "<paper folder>"   # or put the path in website/.paper-dir
npm run build
```

`npm run sync` (`scripts/sync-paper.mjs`) reads the paper folder and the figure folder. The paper
folder (with `main.tex`, `appendix/`, `tables/` and the built `main.pdf`) comes from `--paper-dir`, the
`PAPER_DIR` environment variable, or the first line of a local `website/.paper-dir` file, which git
ignores. The figure folder defaults to `../../figure_source` (`--figures-dir` to change it). It

- copies `main.tex`, `tables/2_insight_summary.tex`, `tables/3_judge_systems.tex` and
  `appendix/M_methodology.tex` into `paper/`, with LaTeX comments removed;
- walks the full source (all `\input` files) the way LaTeX numbers it and writes `paper/outline.json`:
  every section, appendix and `\label` with its printed number and its PDF anchor, and every figure
  with its caption and the section it sits in. It stops if a table file's number prefix or a figure
  file's number prefix disagrees with the numbering;
- copies `main.pdf` to `public/paper.pdf` and the 17 light and dark SVGs to `public/figures/`;
- records file hashes and the date in `paper/SYNC.json` (the footer shows the date).

## What the build checks

`scripts/build-data.mjs` stops with an error, and writes nothing, when

- the number of works, per category or per year, differs from App. M of the paper, from the
  `corpus` block of `papers.yaml`, or from the "105 works" in the abstract;
- a work lacks a title, authors, year, venue, category, group or an https paper link, or is missing
  from `references.bib` (or the bib has a work the list does not);
- Table 2 no longer has rows I1 to I5 with the expected columns, the text does not have five insight
  statements whose grades match Table 2, or §6 does not list C1 to C6;
- a `\ref` or `\cite` in the text the site shows cannot be resolved;
- the BibTeX in `site.config.mjs` differs from the README's citation block, or the status, year, URL,
  authors or emails differ from `CITATION.cff` and the paper's author block.

## Changing the venue

The venue, the BibTeX and the paper link live in `site.config.mjs`. Change them together with the
README citation block and `CITATION.cff`; the build fails until all three agree. If the survey gets
an arXiv page, set `paper.arxiv` in the same file.

## Links

`npm run links` prints every external URL the site shows, with where it appears.
`npm run links -- --check out.tsv` requests each one and writes the status; sites that refuse
scripted requests (OpenReview, Nature) are marked for a browser check.
`npm run links -- --pdf-dests` prints the `paper.pdf#...` anchors the site links to, which must exist
as named destinations in the PDF.

## Deploying

`.github/workflows/deploy.yml` builds `website/` with `npm ci && npm run build` and publishes `dist/`
to GitHub Pages on every push to `main` that touches `website/`, `assets/`, `data/`, `README.md`,
`CITATION.cff` or the workflow itself. `vite.config.js` sets the base path from `site.config.mjs`
(`/Awesome-SLM-as-a-Judge/`) and writes a `404.html` that sends old path-style links to the matching
hash route.

## Layout

```
website/
  site.config.mjs        venue, paper link, BibTeX, author links
  scripts/               sync-paper.mjs, build-data.mjs, list-links.mjs, lib/ (LaTeX and BibTeX readers)
  paper/                 synced paper sources and outline.json
  public/                paper.pdf, figures/, favicon.svg
  src/
    main.jsx, routes.jsx, pageLoaders.js
    pages/               Home, Survey, Insights, Challenges, Papers, Figures, Cite, NotFound
    components/          header, footer, lightbox, search, figure, citation and chart pieces
    lib/                 data access, theme, motion helpers
    styles/              tokens.css (colours, type, spacing), base, layout, components, pages
```

The design uses one font (Inter, self-hosted, with a metric-matched fallback so text does not shift),
the paper's teal `#1F6F6F` and row tint `#EAF2F2` as the theme colours, and the figure palette (coral,
ochre, slate, moss) as accents. Page changes use the View Transitions API where the browser supports
it, and every animation is turned off under `prefers-reduced-motion`.
