#!/usr/bin/env python3
"""Rebuild the generated blocks of README.md from data/papers.yaml.

    python3 scripts/build_readme.py           # rewrite README.md in place
    python3 scripts/build_readme.py --check   # exit 1 if README.md is out of date

Generated blocks sit between marker comments in README.md:

    <!-- BEGIN GENERATED: name -->  ...  <!-- END GENERATED: name -->

with name in: badges (the badge row), stats (the counts line), toc (the
contents list), corpus (counts per category and year) and papers (the paper
list). Text outside the markers is written by hand. The script also writes the
two counts on assets/banner.svg (the tspans with ids count-works and
count-judge-systems). Before writing, the script validates the data file and checks
that the counts per category and per year equal the ones the survey reports
(the `corpus` block of data/papers.yaml); it stops with an error otherwise.

Needs Python 3.8+ and PyYAML (pip install pyyaml).
"""
import argparse
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "papers.yaml"
README = ROOT / "README.md"
BANNER = ROOT / "assets" / "banner.svg"
FIGURES = "assets/figures"

THEME = "1F6F6F"   # the survey's deep teal (tealhead in main.tex)
LABEL = "0B2B2B"   # darker teal for badge labels
ICONS = {
    "judge-systems": "⚖️",
    "benchmarks-metrics": "📊",
    "training-methodology": "🛠️",
    "bias-robustness": "🛡️",
    "foundational-models": "🧱",
}
FIGURE_TITLES = {
    "4_family_heatmap": "Figure 4. Relative strengths of the major SLM families across judge-relevant capabilities (App. B)",
    "5_paradigm_scatter": "Figure 5. Judge training paradigms by training cost and bias-mitigation strength (App. C)",
    "6_paradigm_supervision": "Figure 6. The decreasing-supervision gradient from distillation to probing (App. C)",
    "10_bias_heatmap": "Figure 10. Relative bias severity for SLM (≤14B) and large LLM (>70B) judges (App. H)",
    "11_benchmark_coverage": "Figure 11. Meta-evaluation dimensions covered by the major judge benchmarks (App. I)",
}
YEAR_BINS = ["2023 or earlier", "2024", "2025", "2026"]


def year_bin(year):
    return "2023 or earlier" if year <= 2023 else str(year)


# ── validation ───────────────────────────────────────────────────────────────
def validate(data):
    errors = []
    cats = {c["id"]: c for c in data["categories"]}
    groups = {(c["id"], g["id"]) for c in data["categories"] for g in c["groups"]}
    seen = set()
    for p in data["papers"]:
        key = p.get("key", "?")
        if key in seen:
            errors.append(f"{key}: duplicate key")
        seen.add(key)
        for field in ("title", "authors", "year", "venue", "category", "group", "links"):
            if not p.get(field):
                errors.append(f"{key}: missing {field}")
        if p.get("category") not in cats:
            errors.append(f"{key}: unknown category {p.get('category')!r}")
        elif (p["category"], p.get("group")) not in groups:
            errors.append(f"{key}: unknown group {p.get('group')!r} in {p['category']}")
        for name, url in (p.get("links") or {}).items():
            if not str(url).startswith("https://"):
                errors.append(f"{key}: links.{name} is not an https URL")
        if not (p.get("links") or {}).get("paper"):
            errors.append(f"{key}: missing links.paper")
    for c in data["categories"]:
        if c.get("figure") and not (ROOT / FIGURES / f"{c['figure']}.svg").exists():
            errors.append(f"category {c['id']}: missing figure {c['figure']}.svg")
    return errors


def check_counts(data):
    surveyed = [p for p in data["papers"] if p.get("in_survey", True)]
    by_cat = Counter(p["category"] for p in surveyed)
    by_year = Counter(year_bin(p["year"]) for p in surveyed)
    expected = data["corpus"]
    errors = []
    if len(surveyed) != expected["total"]:
        errors.append(f"total: {len(surveyed)} works, the survey reports {expected['total']}")
    for cat, n in expected["categories"].items():
        if by_cat.get(cat, 0) != n:
            errors.append(f"{cat}: {by_cat.get(cat, 0)} works, the survey reports {n}")
    for bin_, n in expected["years"].items():
        if by_year.get(str(bin_), 0) != n:
            errors.append(f"year {bin_}: {by_year.get(str(bin_), 0)} works, the survey reports {n}")
    return errors


# ── rendering helpers ────────────────────────────────────────────────────────
def esc(text):
    return text.replace("|", "\\|")


def short_authors(p):
    names = p["authors"]
    last = lambda n: n.split()[-1] if n != "Gemma Team" else n
    if len(names) == 1 and not p.get("et_al"):
        return last(names[0])
    if len(names) == 2 and not p.get("et_al"):
        return f"{last(names[0])} and {last(names[1])}"
    return f"{last(names[0])} et al."


def github_repo(url):
    u = urlparse(url)
    if u.netloc != "github.com":
        return None
    parts = [x for x in u.path.split("/") if x]
    return "/".join(parts[:2]) if len(parts) >= 2 else None


def sections_text(sections):
    main = [s for s in sections if s.startswith("§")]
    app = [s.split()[-1] for s in sections if s.startswith("App.")]
    out = []
    if main:
        out.append(", ".join(main))
    if app:
        out.append(("App. " if len(app) == 1 else "Apps. ") + ", ".join(app))
    return "; ".join(out)


def paper_row(p):
    links = p["links"]
    title = f"**[{esc(p['title'])}]({links['paper']})**"
    meta = []
    if p.get("name") and p["name"].lower() not in p["title"].lower():
        meta.append(f"<b>{p['name']}</b>")
    meta.append(short_authors(p))
    if p.get("sections"):
        meta.append("survey: " + sections_text(p["sections"]))
    cell = f"{title}<br><sub>{' · '.join(meta)}</sub>"
    out = []
    if links.get("arxiv"):
        out.append(f"[arXiv]({links['arxiv']})")
    if links.get("code"):
        out.append(f"[Code]({links['code']})")
    if links.get("model"):
        out.append(f"[Model]({links['model']})")
    repo = github_repo(links["code"]) if links.get("code") else None
    if repo:
        badge = (f"https://img.shields.io/github/stars/{repo}"
                 f"?style=flat&logo=github&label=&color={THEME}&labelColor={LABEL}")
        out.append(f'<a href="https://github.com/{repo}"><img src="{badge}" alt="GitHub stars of {repo}"></a>')
    links_cell = " · ".join(out) if out else "–"
    return f"| {cell} | {esc(p['venue'])} | {p['year']} | {links_cell} |"


def sort_key(p):
    return (-p["year"], short_authors(p).lower(), p["title"].lower())


# ── blocks ───────────────────────────────────────────────────────────────────
REPO = "anishh15/Awesome-SLM-as-a-Judge"
SITE = "https://anishh15.github.io/Awesome-SLM-as-a-Judge/"


def badge(label, message, logo=None):
    url = (f"https://img.shields.io/badge/{label}-{message}-{THEME}?style=for-the-badge"
           f"&labelColor={LABEL}")
    return url + (f"&logo={logo}&logoColor=white" if logo else "")


def block_badges(data):
    n = sum(1 for p in data["papers"] if p.get("in_survey", True))
    items = [
        (SITE + "paper.pdf", badge("Paper", "PDF", "readthedocs"), "Paper (PDF)"),
        (SITE, badge("Website", "project_page", "googlechrome"), "Project website"),
        ("#paper-list", badge("surveyed_works", str(n)), f"{n} works in the survey"),
        (f"https://github.com/{REPO}",
         f"https://img.shields.io/github/stars/{REPO}?style=for-the-badge&logo=github"
         f"&color={THEME}&labelColor={LABEL}", "GitHub stars"),
        ("LICENSE", badge("License", "MIT"), "MIT License"),
        ("CONTRIBUTING.md", badge("PRs", "welcome", "github"), "Pull requests welcome"),
    ]
    return "\n".join(f'<a href="{href}"><img src="{src}" alt="{alt}"></a>' for href, src, alt in items)


def block_stats(data):
    surveyed = [p for p in data["papers"] if p.get("in_survey", True)]
    by_cat = Counter(p["category"] for p in surveyed)
    parts = [f"{ICONS.get(c['id'], '')} {by_cat[c['id']]} {c['title'][0].lower() + c['title'][1:]}"
             for c in data["categories"]]
    return f"**{len(surveyed)} works in the survey**<br>\n<sub>" + " &nbsp;&bull;&nbsp; ".join(parts) + "</sub>"


def block_toc(data):
    lines = ["- [About](#about)", "- [Overview of the survey](#overview)",
             "- [Five insights](#five-insights)", "- [Six open challenges](#six-open-challenges)",
             "- [From insights to deployment](#from-insights-to-deployment)",
             "- [Paper list](#paper-list)"]
    for c in data["categories"]:
        n = sum(1 for p in data["papers"] if p["category"] == c["id"] and p.get("in_survey", True))
        lines.append(f"  - [{c['title']}](#{c['id']}) ({n})")
    extra = [p for p in data["papers"] if not p.get("in_survey", True)]
    if extra:
        lines.append(f"  - [Added after the survey](#added-after-the-survey) ({len(extra)})")
    lines += ["- [Figures](#figures)",
              "- [Citation](#citation)", "- [Contributing](#contributing)", "- [Contact](#contact)"]
    return "\n".join(lines)


def block_corpus(data):
    surveyed = [p for p in data["papers"] if p.get("in_survey", True)]
    rows = ["| Category | Works | " + " | ".join(YEAR_BINS) + " |",
            "|:--|:--:|" + ":--:|" * len(YEAR_BINS)]
    for c in data["categories"]:
        ps = [p for p in surveyed if p["category"] == c["id"]]
        years = Counter(year_bin(p["year"]) for p in ps)
        rows.append(f"| {ICONS.get(c['id'], '')} [{c['title']}](#{c['id']}) | **{len(ps)}** | "
                    + " | ".join(str(years.get(b, 0)) for b in YEAR_BINS) + " |")
    years = Counter(year_bin(p["year"]) for p in surveyed)
    rows.append(f"| **All works** | **{len(surveyed)}** | "
                + " | ".join(f"**{years.get(b, 0)}**" for b in YEAR_BINS) + " |")
    return "\n".join(rows)


def render_group(title, papers, level="####"):
    lines = [f"{level} {title} <sub>({len(papers)})</sub>", "",
             "| Paper | Venue | Year | Links |", "|:--|:--:|:--:|:--|"]
    lines += [paper_row(p) for p in sorted(papers, key=sort_key)]
    return lines + [""]


def block_papers(data):
    out = []
    surveyed = [p for p in data["papers"] if p.get("in_survey", True)]
    for c in data["categories"]:
        ps = [p for p in surveyed if p["category"] == c["id"]]
        out += [f'<a id="{c["id"]}"></a>', "",
                f"### {ICONS.get(c['id'], '')} {c['title']} <sub>{len(ps)} works</sub>", "",
                f"{c['summary']} <sub>Survey: {c['where']}</sub>", ""]
        if c.get("figure"):
            out += ["<details>",
                    f"<summary>{FIGURE_TITLES.get(c['figure'], c['figure'])}</summary>", "<br>",
                    f'<p align="center"><img src="{FIGURES}/{c["figure"]}.svg" width="70%" '
                    f'alt="{FIGURE_TITLES.get(c["figure"], c["figure"])}"></p>',
                    "</details>", ""]
        for g in c["groups"]:
            gs = [p for p in ps if p["group"] == g["id"]]
            if gs:
                out += render_group(g["title"], gs)
        out += ['<p align="right"><a href="#contents">back to contents ↑</a></p>', ""]
    extra = [p for p in data["papers"] if not p.get("in_survey", True)]
    if extra:
        out += ['<a id="added-after-the-survey"></a>', "",
                "### Added after the survey", "",
                f"Works added to this list after the survey was written. They are not part of the "
                f"{data['corpus']['total']} works the survey cites.", ""]
        out += render_group("All additions", extra)
    return "\n".join(out).rstrip()


BLOCKS = {"badges": block_badges, "stats": block_stats, "toc": block_toc,
          "corpus": block_corpus, "papers": block_papers}


def render_banner(svg, data):
    """Write the two counts shown on the banner (tspans with these ids)."""
    surveyed = [p for p in data["papers"] if p.get("in_survey", True)]
    counts = {"count-works": len(surveyed),
              "count-judge-systems": sum(1 for p in surveyed if p["category"] == "judge-systems")}
    for tid, n in counts.items():
        svg, k = re.subn(rf'(<tspan id="{tid}">)[^<]*(</tspan>)', rf"\g<1>{n}\g<2>", svg)
        if k != 1:
            raise SystemExit(f"assets/banner.svg needs exactly one <tspan id=\"{tid}\">")
    return svg


def render(readme, data):
    for name, fn in BLOCKS.items():
        pattern = re.compile(rf"(<!-- BEGIN GENERATED: {name} -->\n)(?:.*?\n)?(<!-- END GENERATED: {name} -->)", re.S)
        if not pattern.search(readme):
            raise SystemExit(f"README.md has no '{name}' block markers")
        readme = pattern.sub(lambda m: m.group(1) + fn(data) + "\n" + m.group(2), readme)
    return readme


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--check", action="store_true", help="exit 1 if README.md is out of date")
    args = ap.parse_args()

    data = yaml.safe_load(DATA.read_text())
    errors = validate(data) + check_counts(data)
    if errors:
        print("data/papers.yaml has problems:", *errors, sep="\n  ")
        return 1
    old, old_svg = README.read_text(), BANNER.read_text()
    new, new_svg = render(old, data), render_banner(old_svg, data)
    if args.check:
        if new != old or new_svg != old_svg:
            print("README.md or assets/banner.svg is out of date; run python3 scripts/build_readme.py")
            return 1
        print("README.md and assets/banner.svg are up to date")
        return 0
    README.write_text(new)
    BANNER.write_text(new_svg)
    n = sum(1 for p in data["papers"] if p.get("in_survey", True))
    print(f"README.md rebuilt: {n} works in {len(data['categories'])} categories; counts match the survey")
    return 0


if __name__ == "__main__":
    sys.exit(main())
