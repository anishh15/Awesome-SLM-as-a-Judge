# Contributing

Thank you for helping keep this list accurate. You can report a problem, add a paper, or improve the scripts.

## Report a problem

Open an [issue](https://github.com/anishh15/Awesome-SLM-as-a-Judge/issues) for a broken link, a wrong title, venue or year, a missing code link, or a work in the wrong category. Please include the BibTeX key or the title of the entry.

## Add a paper

All entries live in [`data/papers.yaml`](data/papers.yaml). The paper list in `README.md` is generated from it, so please do not edit the tables in the README.

1. Check that the work fits the survey's scope. It should use a model with at most 14B parameters (active parameters for mixture-of-experts models) as a judge or scorer, introduce a benchmark, dataset or metric for evaluating judges, or give a method that applies directly to small judges, such as debate, ensembles or bias mitigation.
2. Add an entry under `papers:`. The header of `data/papers.yaml` explains every field. A work that the survey does not cite takes `in_survey: false` and appears under "Added after the survey". It does not change the survey's counts.

   ```yaml
     - key: doe2026example            # BibTeX-style key: first author, year, first title word
       title: "Example: A Small Judge"
       authors: [Jane Doe, John Roe]
       year: 2026
       venue: arXiv                   # short name, as in the other entries
       venue_full: "arXiv preprint arXiv:<id>"
       category: judge-systems        # one of the five category ids
       group: sft                     # a group id inside that category
       in_survey: false
       links:
         paper: "<arXiv, ACL Anthology or OpenReview URL>"
         code: "<official GitHub repository URL>"
   ```

3. Link the paper to arXiv, the ACL Anthology or OpenReview where possible, and add the official code repository if there is one. Open every link once to check that it shows the right paper.
4. Rebuild the README and check the result:

   ```bash
   pip install pyyaml
   python3 scripts/build_readme.py
   python3 scripts/build_readme.py --check
   ```

5. Open a pull request with one or two sentences on why the work belongs in the list.

## Maintainers: refresh from the survey

When the survey's bibliography or LaTeX sources change, run

```bash
python3 scripts/sync_bib.py --paper-dir "path/to/survey"   # copies references.bib, refreshes bib fields and cited sections
python3 scripts/build_readme.py
```

`sync_bib.py` lists every field it changed and warns about bib keys without an entry, entries without a bib key, and titles that no longer match the bib. `python3 scripts/list_links.py` prints every URL in the repository for a link check.

## Conduct

Please be respectful and constructive in issues and pull requests.
