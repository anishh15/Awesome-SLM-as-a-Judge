// Numbers drawn on the insight visuals, each with the LaTeX that states it.
// scripts/build-data.mjs fails the build if a `tex` string is not in its file
// (paper/main.tex unless `file` names another file under paper/).

export const FACTS = {
  I1: {
    papers: { value: 8, tex: String.raw`in all eight, evaluation-specific training improves the base model` },
    gainRange: { value: [15, 63], tex: String.raw`relative gains from 15\% to 63\%` },
    seleneMini: { value: [0.75, 0.891], gain: 19, tex: String.raw`from 0.750 to 0.891, a 19\% gain` },
    scale: { value: { small: 0.891, large: 0.878 }, tex: String.raw`(8B: 0.891; 24B: 0.878)` },
  },
  I2: {
    thinkingGain: { value: { '0.6B': 19, '4B': 13 }, tex: String.raw`19\% at 0.6B against 13\% at 4B` },
    flops: { value: [1.3, 4.3], tex: String.raw`at 1.3--4.3$\times$ the FLOPs` },
    chatHard: { value: 30, tex: String.raw`lifts the Chat Hard accuracy of 1.7B and 4B judges by about 30\%` },
  },
  I3: {
    cost: { value: 7, tex: String.raw`at over 7$\times$ lower API cost` },
    poll: {
      value: ['Command R', 'GPT-3.5-Turbo', 'Claude Haiku'],
      tex: String.raw`a heterogeneous ensemble of Command~R, GPT-3.5-Turbo, and Claude Haiku outperforms a single GPT-4 judge`,
    },
    condorcet: {
      value: null,
      tex: String.raw`if each juror is correct with probability $p>\tfrac12$ and errors are independent, the majority-vote accuracy $\sum_{k>n/2}\binom{n}{k}p^{k}(1-p)^{n-k}\!\rightarrow 1$ as $n$ grows`,
    },
  },
  I4: {
    mast: { value: 1 / 3, tex: String.raw`traces about a third of multi-agent failures to \emph{inter-agent misalignment}` },
    roles: {
      value: { kappa: 0.03, cost: 46 },
      tex: String.raw`a critic, a defender, and a judge built on Qwen3-14B come within 0.03 Cohen's $\kappa$ of GPT-4o at about 46\% of its cost`,
    },
  },
  I5: {
    parity: { value: null, tex: String.raw`SLM judges reach near parity on mathematics` },
    creative: { value: null, tex: String.raw`but drop sharply for creative tasks where no external oracle exists` },
    factualQA: { value: null, tex: String.raw`good agreement in factual QA`, file: 'tables/2_insight_summary.tex' },
    widest: { value: null, tex: String.raw`Widest gap in creative and medical evaluation`, file: 'tables/2_insight_summary.tex' },
  },
}

// Numbers the paper writes as words.
const AS_WORDS = { 8: 'eight', [1 / 3]: 'a third' }

/** Every fact as a flat list: { key, tex, file, numbers }, numbers being the values drawn. */
export function factList() {
  const nums = (v) => (v == null ? [] : typeof v === 'number' ? [v] : typeof v === 'object' ? Object.values(v).flatMap(nums) : [])
  return Object.entries(FACTS).flatMap(([id, group]) =>
    Object.entries(group).map(([name, f]) => ({
      key: `${id}.${name}`, tex: f.tex, file: f.file || 'main.tex',
      numbers: [...nums(f.value), ...nums(f.gain)].map((n) => ({ n, text: AS_WORDS[n] || String(n) })),
    })))
}
