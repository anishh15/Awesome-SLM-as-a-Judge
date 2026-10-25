// Site settings that cannot be derived from the paper or the data file.
// This is the one place to change the venue, the paper link and the BibTeX.
//
// The build checks these against the rest of the repository and stops if
// they disagree: `bibtex` must equal the BibTeX block in ../README.md, and
// `status` and `year` must match the preferred citation in ../CITATION.cff.
// When the venue changes, update README.md, CITATION.cff and this file together.

export default {
  // Where the site is served. `base` must match the GitHub Pages path.
  url: 'https://anishh15.github.io/Awesome-SLM-as-a-Judge/',
  base: '/Awesome-SLM-as-a-Judge/',
  repo: 'https://github.com/anishh15/Awesome-SLM-as-a-Judge',

  // Publication status, shown in the hero, the footer and the citation page.
  venue: 'Preprint, 2026',
  status: 'preprint',
  year: 2026,

  // The paper. `pdf` is relative to the site root (public/paper.pdf, written by
  // `npm run sync`). Set `arxiv` to the abstract URL once the survey is posted.
  paper: {
    pdf: 'paper.pdf',
    arxiv: null,
  },

  // Must equal the ```bibtex block in ../README.md (checked at build time).
  bibtex: `@misc{laddha2026slmjudge,
  title  = {Small Language Models as Judges: A Survey},
  author = {Laddha, Anish and Pradhan, Nitesh and Srivastava, Gaurav},
  year   = {2026},
  note   = {Preprint},
  url    = {https://anishh15.github.io/Awesome-SLM-as-a-Judge/}
}`,

  // Profile links for the authors, keyed by the name in the paper's author
  // block. Names, affiliations and emails come from the paper itself.
  authorLinks: {
    'Anish Laddha': 'https://github.com/anishh15',
    'Gaurav Srivastava': 'https://github.com/ctrl-gaurav',
  },
}
