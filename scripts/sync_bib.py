#!/usr/bin/env python3
"""Refresh data/papers.yaml from the survey's BibTeX file.

    python3 scripts/sync_bib.py                      # use data/references.bib
    python3 scripts/sync_bib.py --paper-dir PATH     # copy PATH/references.bib into
                                                     # data/ first and recompute where
                                                     # each work is cited in the survey
    python3 scripts/sync_bib.py --check              # report only, write nothing

The bib owns these fields of every entry: authors, et_al, year, venue,
venue_full. With --paper-dir the script also fills `sections` from the LaTeX
sources (main.tex, appendix/*.tex, tables/*.tex). Everything else (title,
category, group, links, name, note) is curated by hand and left alone. The
script also warns when a curated title no longer matches the bib title, when
a bib key has no entry in the data file, and when an entry has no bib key.

Needs Python 3.8+ and PyYAML (pip install pyyaml).
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "papers.yaml"
BIB = ROOT / "data" / "references.bib"

# Short venue names, matched against the bib's booktitle/journal (lower case).
# The first pattern that matches wins; unmatched venues fall back to the full
# string, so add a rule here when a new venue appears.
VENUE_RULES = [
    (r"^arxiv", "arXiv"),
    (r"findings of the association for computational linguistics: acl", "Findings of ACL"),
    (r"findings of the association for computational linguistics: emnlp", "Findings of EMNLP"),
    (r"findings of the association for computational linguistics: naacl", "Findings of NAACL"),
    (r"empirical methods in natural language processing", "EMNLP"),
    (r"north american chapter", "NAACL"),
    (r"annual meeting of the association for computational linguistics", "ACL"),
    (r"learning representations", "ICLR"),
    (r"neural information processing systems", "NeurIPS"),
    (r"international conference on machine learning", "ICML"),
    (r"aaai conference", "AAAI"),
    (r"intelligent user interfaces", "IUI"),
    (r"user interface software and technology", "UIST"),
    (r"operating systems principles", "SOSP"),
    (r"large language models for code", "LLM4Code"),
    (r"data in generative models", "DIG-BUG Workshop"),
    (r"^nature$", "Nature"),
    (r"^the innovation$", "The Innovation"),
]

ACCENTS = {
    "'": {"a": "á", "e": "é", "i": "í", "o": "ó", "u": "ú", "\\i": "í", "E": "É"},
    "`": {"a": "à", "e": "è", "i": "ì", "o": "ò", "u": "ù"},
    '"': {"a": "ä", "e": "ë", "i": "ï", "o": "ö", "u": "ü", "O": "Ö", "U": "Ü"},
    "~": {"n": "ñ", "a": "ã", "o": "õ"},
    "u": {"g": "ğ", "a": "ă"},
    "c": {"c": "ç", "s": "ş"},
    "v": {"s": "š", "c": "č", "z": "ž"},
}


# ── BibTeX ───────────────────────────────────────────────────────────────────
def parse_bib(text):
    """Return {key: {"type": ..., field: value}} for a well-formed bib file."""
    entries = {}
    i = 0
    while True:
        m = re.compile(r"@(\w+)\s*\{\s*([^,\s]+)\s*,").search(text, i)
        if not m:
            return entries
        etype, key = m.group(1).lower(), m.group(2)
        depth, j = 1, m.end()
        while depth and j < len(text):
            depth += {"{": 1, "}": -1}.get(text[j], 0)
            j += 1
        entries[key] = {"type": etype, **parse_fields(text[m.end():j - 1])}
        i = j


def parse_fields(body):
    fields, i = {}, 0
    while True:
        m = re.compile(r"\s*(\w+)\s*=\s*").match(body, i)
        if not m:
            return fields
        name, j = m.group(1).lower(), m.end()
        if body[j] == "{":
            depth, k = 1, j + 1
            while depth:
                depth += {"{": 1, "}": -1}.get(body[k], 0)
                k += 1
            value, j = body[j + 1:k - 1], k
        elif body[j] == '"':
            k = body.index('"', j + 1)
            value, j = body[j + 1:k], k + 1
        else:
            k = re.compile(r"[,\s]").search(body, j)
            k = k.start() if k else len(body)
            value, j = body[j:k], k
        fields[name] = " ".join(value.split())
        comma = body.find(",", j)
        if comma < 0:
            return fields
        i = comma + 1


def delatex(s):
    """Strip braces and decode the accents used in the bib."""
    def accent(m):
        mark, letter = m.group(1), m.group(2)
        return ACCENTS.get(mark, {}).get(letter, letter)
    s = re.sub(r"\{?\\([\'`\"~ucv])\s*\{?(\\i|[A-Za-z])\}?\}?", accent, s)
    s = s.replace("$\\{$", "").replace("$\\}$", "")
    s = re.sub(r"\\&", "&", s)
    s = s.replace("{", "").replace("}", "").replace("$", "")
    return " ".join(s.split())


def authors_of(field):
    names, et_al = [], False
    for part in re.split(r"\s+and\s+", field):
        part = delatex(part.strip())
        if part.lower() == "others":
            et_al = True
            continue
        if "," in part:
            last, first = [x.strip() for x in part.split(",", 1)]
            name = f"{first} {last}".strip()
        else:
            name = part
        names.append(name)
    return names, et_al


def venue_of(entry):
    full = entry.get("booktitle") or entry.get("journal") or ""
    if not full and entry.get("archiveprefix", "").lower() == "arxiv":
        full = f"arXiv preprint arXiv:{entry.get('eprint', '')}"
    full = delatex(full)
    for pattern, short in VENUE_RULES:
        if re.search(pattern, full.lower()):
            return short, full
    return full, full


def norm_title(s):
    return re.sub(r"[^a-z0-9]", "", delatex(s).lower())


# ── LaTeX sources: where each work is cited ─────────────────────────────────
CITE = re.compile(r"\\cite[a-zA-Z]*\*?(?:\[[^\]]*\])*\{([^}]+)\}")


def cited_sections(paper_dir):
    """Map bib key -> ordered list like ["§3", "App. C"]."""
    paper_dir = Path(paper_dir)
    where = {}

    def add(key, label):
        where.setdefault(key, [])
        if label not in where[key]:
            where[key].append(label)

    def scan(text, label_for_pos):
        for m in CITE.finditer(text):
            for key in m.group(1).split(","):
                add(key.strip(), label_for_pos(m.start()))
        for m in re.finditer(r"\\input\{(tables/[^}]+)\}", text):
            table = paper_dir / (m.group(1) + ("" if m.group(1).endswith(".tex") else ".tex"))
            if table.exists():
                label = label_for_pos(m.start())
                for c in CITE.finditer(table.read_text()):
                    for key in c.group(1).split(","):
                        add(key.strip(), label)

    main = (paper_dir / "main.tex").read_text()
    body = main.split("\\appendix")[0]
    starts = [m.start() for m in re.finditer(r"\\section\{", body)]

    def main_label(pos):
        n = sum(1 for s in starts if s <= pos)
        return f"§{n}" if n else "Abstract"

    scan(body, main_label)
    for f in sorted((paper_dir / "appendix").glob("[A-Z]_*.tex")):
        scan(f.read_text(), lambda pos, letter=f.name[0]: f"App. {letter}")

    def order(label):
        if label.startswith("§"):
            return (0, int(label[1:]))
        if label.startswith("App."):
            return (1, ord(label[-1]))
        return (-1, 0)

    return {k: sorted(v, key=order) for k, v in where.items()}


# ── data file ────────────────────────────────────────────────────────────────
FIELD_ORDER = ["key", "name", "title", "authors", "et_al", "year", "venue", "venue_full",
               "category", "group", "in_survey", "sections", "links", "note"]
LINK_ORDER = ["paper", "arxiv", "code", "model"]


def load_data():
    text = DATA.read_text()
    header = []
    for line in text.splitlines():
        if line.startswith("#") or not line.strip():
            header.append(line)
        else:
            break
    return "\n".join(header).rstrip() + "\n", yaml.safe_load(text)


class _Dumper(yaml.SafeDumper):
    def increase_indent(self, flow=False, indentless=False):
        return super().increase_indent(flow, False)      # indent lists under their key


class _Flow(list):
    """A list written on one line, e.g. authors: [A, B]."""


def _str(dumper, value):
    plain_ok = re.fullmatch(r"[A-Za-z0-9§(][^:#]*", value) and value == value.strip()
    return dumper.represent_scalar("tag:yaml.org,2002:str", value,
                                   style=None if plain_ok else '"')


_Dumper.add_representer(str, _str)
_Dumper.add_representer(_Flow, lambda d, v: d.represent_sequence(
    "tag:yaml.org,2002:seq", v, flow_style=True))


def dump_data(header, data):
    papers = []
    for p in data["papers"]:
        q = {k: p[k] for k in FIELD_ORDER if k in p and p[k] not in (None, [], {}, "")}
        if not q.get("et_al"):
            q.pop("et_al", None)              # written only when the bib says "and others"
        if q.get("in_survey", True) is True:
            q.pop("in_survey", None)          # default: the work is cited in the survey
        for field in ("authors", "sections"):
            if field in q:
                q[field] = _Flow(q[field])
        if "links" in q:
            q["links"] = {k: q["links"][k] for k in LINK_ORDER if q["links"].get(k)}
        papers.append(q)
    corpus = dict(data["corpus"])
    data = dict(data, corpus=corpus, papers=papers)
    body = yaml.dump(data, Dumper=_Dumper, sort_keys=False, allow_unicode=True,
                     width=4096, default_flow_style=False)
    # a blank line before each paper and each top-level key keeps diffs readable
    body = re.sub(r"\n(  - key: )", r"\n\n\1", body)
    body = re.sub(r"\n(categories:|papers:)", r"\n\n\1", body)
    DATA.write_text(header + "\n" + body)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--paper-dir", help="folder with the survey's main.tex and references.bib")
    ap.add_argument("--check", action="store_true", help="report differences, write nothing")
    args = ap.parse_args()

    if args.paper_dir and not args.check:
        shutil.copyfile(Path(args.paper_dir) / "references.bib", BIB)
    bib_path = Path(args.paper_dir) / "references.bib" if args.paper_dir else BIB
    bib = parse_bib(bib_path.read_text())
    sections = cited_sections(args.paper_dir) if args.paper_dir else None

    header, data = load_data()
    by_key = {p["key"]: p for p in data["papers"]}
    changes, warnings = [], []

    for key, entry in bib.items():
        p = by_key.get(key)
        if p is None:
            warnings.append(f"{key}: in the bib but not in data/papers.yaml (add it with a category)")
            continue
        authors, et_al = authors_of(entry.get("author", ""))
        venue, venue_full = venue_of(entry)
        new = {"authors": authors, "et_al": et_al, "year": int(entry["year"]),
               "venue": venue, "venue_full": venue_full}
        if sections is not None:
            new["sections"] = sections.get(key, [])
        for field, value in new.items():
            if p.get(field, False if field == "et_al" else None) != value:
                changes.append(f"{key}.{field}: {p.get(field)!r} -> {value!r}")
                p[field] = value
        if norm_title(p.get("title", "")) != norm_title(entry.get("title", "")):
            warnings.append(f"{key}: title differs from the bib\n    data: {p.get('title')}\n"
                            f"    bib:  {delatex(entry.get('title', ''))}")
    for key, p in by_key.items():
        if p.get("in_survey", True) and key not in bib:
            warnings.append(f"{key}: in data/papers.yaml but not in the bib")

    for line in changes:
        print("update", line)
    for line in warnings:
        print("warning", line)
    print(f"{len(bib)} bib entries, {len(data['papers'])} papers, "
          f"{len(changes)} field updates, {len(warnings)} warnings")
    if changes and not args.check:
        dump_data(header, data)
        print("wrote", DATA.relative_to(ROOT))
    return 1 if (args.check and changes) else 0


if __name__ == "__main__":
    sys.exit(main())
