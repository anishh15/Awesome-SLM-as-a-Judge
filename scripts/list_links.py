#!/usr/bin/env python3
"""Print every external URL in the repository, one per line, with where it appears.

    python3 scripts/list_links.py              # tab-separated: url, files
    python3 scripts/list_links.py --urls-only  # bare URLs, e.g. for a link checker

Scans README.md, CONTRIBUTING.md, CITATION.cff and data/papers.yaml. The
website/ folder has its own build and is not scanned.
"""
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ["README.md", "CONTRIBUTING.md", "CITATION.cff", "data/papers.yaml"]
URL = re.compile(r"""(?:https?://|mailto:)[^\s<>"'`)\]}]+""")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--urls-only", action="store_true")
    args = ap.parse_args()
    found = {}
    for name in FILES:
        text = (ROOT / name).read_text()
        for m in URL.finditer(text):
            url = m.group(0).rstrip(".,;:")
            found.setdefault(url, [])
            if name not in found[url]:
                found[url].append(name)
    for url in sorted(found):
        print(url if args.urls_only else f"{url}\t{','.join(found[url])}")


if __name__ == "__main__":
    main()
