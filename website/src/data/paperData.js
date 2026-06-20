/* ═══════════════════════════════════════════════════════════════
   All data sourced from the survey paper "Small Language Models
   as Judges: A Survey", verified against main.tex + Appendices A–K
   ═══════════════════════════════════════════════════════════════ */

export const paperMeta = {
  title: 'Small Language Models as Judges',
  subtitle: 'A Survey',
  authors: [
    { name: 'Anish Laddha', affiliation: 'LNMIIT Jaipur' },
    { name: 'Nitesh Pradhan', affiliation: 'LNMIIT Jaipur' },
    { name: 'Gaurav Srivastava', affiliation: 'Virginia Tech' },
  ],
  repo: 'https://github.com/anishh15/Awesome-SLM-as-a-Judge',
  paperCount: '60+',
  systemCount: '15+',
  familyCount: 5,
  benchmarkCount: 10,
  paramThreshold: '≤14B',
}

export const heroStats = [
  { value: 60, suffix: '+', label: 'Papers Surveyed' },
  { value: 15, suffix: '+', label: 'Judge Systems' },
  { value: 5, suffix: '', label: 'Model Families' },
  { value: 10, suffix: '', label: 'Benchmarks' },
  { value: 14, suffix: 'B', label: 'Max Params', prefix: '≤' },
]

export const typingPhrases = [
  'Can Small Language Models Judge?',
  'Training > Scale: 3.8B beats GPT-4o',
  '60+ Papers · 15+ Systems · 5 Families',
  'Ensemble of 3 SLMs > Single GPT-4',
  'Reliability Tracks Verifiability',
]

/* ── Motivations (§2) ─────────────────────────────────────────── */

export const motivations = [
  {
    icon: 'DollarSign',
    title: 'Cost',
    description: 'API expenditure scales linearly with evaluation volume. Continuous RLHF loops with proprietary judges are financially untenable.',
    stat: 'PoLL: >7× lower cost than GPT-4',
  },
  {
    icon: 'Shield',
    title: 'Privacy',
    description: 'Sending sensitive data to cloud APIs creates exposure risks. Local SLM judges keep evaluation data on-premise.',
    stat: '24GB VRAM: single consumer GPU',
  },
  {
    icon: 'RefreshCw',
    title: 'Reproducibility',
    description: 'Proprietary model versions drift silently. Open-weight SLMs provide frozen, auditable checkpoints.',
    stat: 'Fixed weights = fixed evaluation',
  },
  {
    icon: 'Zap',
    title: 'Latency',
    description: 'Cloud round-trips prevent real-time feedback loops. Local SLMs enable online evaluation during training.',
    stat: 'Real-time training feedback',
  },
]

/* ── Five Key Insights (I1–I5) ────────────────────────────────── */

export const insights = [
  {
    id: 'I1',
    title: 'Evaluation-specific training outperforms raw scale',
    subtitle: 'Training > Scale',
    evidence: [
      'GLIDER (3.8B) outperforms GPT-4o on FLASK',
      'Selene Mini (8B) outperforms GPT-4o-mini across 11 OOD benchmarks',
      'Prometheus 2 (7B) achieves GPT-4-level correlation',
      'JudgeLRM-3B surpasses GPT-4; JudgeLRM-7B outperforms DeepSeek-R1 by 2.79% F1',
    ],
    explanation: 'Judging is discriminative (pattern-matching against criteria), not generative. The operative boundary is training data composition, not parameter count.',
    figure: 'panel_scale.svg',
  },
  {
    id: 'I2',
    title: 'Reasoning tokens help only when they surface new discriminative signals',
    subtitle: 'Reasoning Sweet Spot',
    evidence: [
      'Accuracy follows a non-monotone curve as a function of CoT length',
      'Sweet spot scales inversely with model capability and directly with task complexity',
      'Overthinking degrades SLM judges more severely due to weaker error-correction',
      'Budget-aware reasoning can reduce cost by 40–60% without accuracy loss',
    ],
    explanation: 'More thinking tokens are not always better. There is a task-specific sweet spot beyond which additional reasoning introduces errors.',
    figure: 'panel_reasoning.svg',
  },
  {
    id: 'I3',
    title: 'Cross-family jury diversity decorrelates errors',
    subtitle: 'Cheap Diversity',
    evidence: [
      'PoLL: heterogeneous panel of 3 diverse models outperforms single GPT-4 at >7× lower cost',
      'COSMosFL: cross-family SLM ensembles for code fault localization',
      'JudgeBoard MAJ: multi-agent judging matches standalone LLM judges on MATH',
    ],
    explanation: 'Family diversity matters more than stochastic diversity. Build 3-model juries from distinct families (e.g., Phi-4-mini + LLaMA-3-8B + Qwen3-4B).',
    figure: 'panel_ensemble.svg',
  },
  {
    id: 'I4',
    title: 'Debate value is bounded by information novelty',
    subtitle: 'Debate ≤ Info Novelty',
    evidence: [
      'Debate helps when agents contribute genuinely different evidence',
      'Degrades in shared-context settings (sycophantic conformity)',
      '~37% of multi-agent failures are Inter-Agent Misalignment (MAST taxonomy)',
      'Role-constrained adversarial debate improves safety evaluation by +12% accuracy',
    ],
    explanation: 'Adding more debate rounds does not help if agents share the same context and knowledge. Novelty, not duration, drives improvement.',
    figure: null,
  },
  {
    id: 'I5',
    title: 'SLM judge reliability follows the verifiability gradient',
    subtitle: 'Verifiability Gradient',
    evidence: [
      'SLMs approach LLM-judge quality in high-verifiability domains (math, code)',
      'Performance degrades in subjective domains (creative writing, medical, legal)',
      'Tools/executors allow small models to match LLM judge performance on verifiable tasks',
    ],
    explanation: 'The more objectively verifiable a task is, the better SLMs perform as judges. Subjective evaluation remains a fundamental challenge.',
    figure: 'panel_verifiability.svg',
  },
]

/* ── Training Paradigms (§3.1) ────────────────────────────────── */

export const trainingParadigms = [
  {
    name: 'Off-the-shelf Prompting',
    signal: 'Prompt only',
    systems: 'Qwen3 (0.6–4B)',
    insight: '~10% gain from thinking mode',
    supervision: 'None',
  },
  {
    name: 'SFT (Distillation)',
    signal: 'Teacher verdicts',
    systems: 'JudgeLM, PandaLM',
    insight: 'Swap augmentation for position bias',
    supervision: 'High',
  },
  {
    name: 'SFT (Rubric)',
    signal: 'Human + synthetic rubrics',
    systems: 'Prometheus 2, GLIDER',
    insight: 'Rubric-conditioned scoring',
    supervision: 'Medium',
  },
  {
    name: 'SFT (Self)',
    signal: 'Self-generated labels',
    systems: 'Self-Taught Evaluators',
    insight: 'No human labels needed',
    supervision: 'Low',
  },
  {
    name: 'RL (GRPO)',
    signal: 'Verifiable rewards',
    systems: 'J1, JudgeLRM',
    insight: 'Consistency reward for position bias',
    supervision: 'Low',
  },
  {
    name: 'Representation Probing',
    signal: 'Hidden states',
    systems: 'INSPECTOR (1.7B frozen)',
    insight: 'No generation needed',
    supervision: 'Minimal',
  },
]

/* ── Judge Systems (§3 + Appendix C) ──────────────────────────── */

export const judgeSystems = [
  { name: 'GLIDER', base: 'Phi-3.5-mini', size: '3.8B', train: 'SFT', result: 'Beats GPT-4o on FLASK' },
  { name: 'Prometheus 2', base: 'Mistral-7B', size: '7B', train: 'SFT+Merge', result: 'GPT-4-level correlation' },
  { name: 'JudgeLM', base: 'Vicuna', size: '7B–33B', train: 'SFT', result: '>90% agreement with GPT-4' },
  { name: 'Selene Mini', base: 'LLaMA-3.1-8B', size: '8B', train: 'SFT+DPO', result: 'Beats GPT-4o-mini; top 8B RewardBench' },
  { name: 'J1', base: 'LLaMA-3.1/Qwen3', size: '8B–70B', train: 'GRPO', result: 'SOTA 8B on JudgeBench/RewardBench' },
  { name: 'JudgeLRM', base: 'LLaMA/Qwen', size: '3B–14B', train: 'GRPO', result: '3B > GPT-4; 7B > DeepSeek-R1' },
  { name: 'Auto-J', base: 'LLaMA-2-13B', size: '13B', train: 'SFT', result: '58 real-world scenarios' },
  { name: 'INSPECTOR', base: 'Frozen SLM', size: '1.7B', train: 'Probe', result: 'Beats prompted SLM at equal size' },
  { name: 'FLAMe', base: 'PaLM-2', size: '24B†', train: 'SFT-Human', result: '87.8% RewardBench; low bias' },
  { name: 'M-Prometheus', base: 'Qwen2.5', size: '3B–14B', train: 'SFT', result: 'SOTA open on M-RewardBench (20+ langs)' },
]

/* ── Model Families (Appendix B) ──────────────────────────────── */

export const modelFamilies = [
  {
    name: 'Phi-4',
    sizes: '3.8B, 14B',
    strength: 'Reasoning',
    feature: '"Textbook-grade" synthetic data; GLIDER\'s base model',
    color: '#f59e0b',
  },
  {
    name: 'Gemma 3',
    sizes: '4B–27B',
    strength: 'Multimodal',
    feature: 'Alternating local-global attention; multimodal evaluation',
    color: '#3b82f6',
  },
  {
    name: 'Qwen 3',
    sizes: '0.6B–32B',
    strength: 'Dual-mode',
    feature: 'Native thinking/non-thinking modes; 119 languages',
    color: '#8b5cf6',
  },
  {
    name: 'LLaMA 3',
    sizes: '1B–70B',
    strength: 'Ecosystem',
    feature: 'Most widely deployed backbone; J1\'s and JudgeLRM\'s base',
    color: '#22c55e',
  },
  {
    name: 'R1-Distill',
    sizes: '1.5B–70B',
    strength: 'STEM',
    feature: 'Always-thinking; reasoning-trace distillation from DeepSeek-R1',
    color: '#ef4444',
  },
]

/* ── Multi-Agent Strategies (§4) ──────────────────────────────── */

export const strategies = [
  {
    name: 'Ensemble / Jury',
    description: 'Multiple diverse judges vote on each evaluation independently. Cross-family panels decorrelate errors through architectural independence.',
    systems: ['PoLL', 'COSMosFL', 'JudgeBoard MAJ'],
    keyFinding: 'Panel of 3 diverse SLMs outperforms single GPT-4 at >7× lower cost',
    aggregation: 'Majority vote, weighted vote, score averaging, confidence-weighted aggregation (CWA)',
    icon: 'Users',
  },
  {
    name: 'Multi-Agent Debate',
    description: 'Agents exchange arguments across rounds to refine evaluations. Value bounded by information novelty, not round count.',
    systems: ['MAST taxonomy', 'Role-constrained debate'],
    keyFinding: '~37% of failures are Inter-Agent Misalignment; debate sycophancy risk in SLMs',
    aggregation: 'Final consensus after debate rounds',
    icon: 'MessageSquare',
  },
  {
    name: 'Cascaded / Speculative',
    description: 'Route to small SLM judge first, escalate uncertain cases to larger model. Most evaluations (~60–80%) are easy.',
    systems: ['Speculative judging'],
    keyFinding: 'Small judge proposes, large judge verifies only on disagreement, yielding substantial cost savings',
    aggregation: 'Confidence-based routing',
    icon: 'GitBranch',
  },
]

/* ── Bias Taxonomy (§5.1) ─────────────────────────────────────── */

export const biases = [
  { name: 'Position', definition: 'Favors responses by presentational order', slmVsLlm: 'stronger', note: 'Stronger in SLMs' },
  { name: 'Verbosity', definition: 'Rewards longer responses regardless of quality', slmVsLlm: 'stronger', note: 'Stronger in SLMs' },
  { name: 'Self-preference', definition: 'Favors outputs from own model family', slmVsLlm: 'weaker', note: 'Weaker in SLMs (sole exception)' },
  { name: 'Preference Leakage', definition: 'Favors models with shared training data lineage', slmVsLlm: 'comparable', note: 'Data-lineage dependent' },
  { name: 'Sycophancy', definition: 'Aligns with expressed user expectations', slmVsLlm: 'stronger', note: 'Stronger in SLMs' },
  { name: 'Balance Penalty', definition: 'Penalizes nuanced/hedged responses', slmVsLlm: 'stronger', note: 'Stronger in SLMs' },
]

/* ── Verifiability Gradient (Appendix I) ──────────────────────── */

export const verifiabilityTiers = [
  {
    level: 'Fully Verifiable',
    examples: 'Code pass/fail, math answer equivalence',
    strategy: 'SLM + tool/verifier',
    confidence: 'High',
    tier: 'high',
  },
  {
    level: 'Mostly Verifiable',
    examples: 'Code quality, factual QA',
    strategy: 'Thinking SLM / ensemble',
    confidence: 'Good',
    tier: 'good',
  },
  {
    level: 'Partially Verifiable',
    examples: 'Safety evaluation, multilingual quality',
    strategy: 'Debate (role-constrained) / native-trained',
    confidence: 'Moderate',
    tier: 'moderate',
  },
  {
    level: 'Subjective',
    examples: 'Creative writing, medical, legal judgment',
    strategy: 'Ensemble + human-in-the-loop',
    confidence: 'Requires Human',
    tier: 'low',
  },
]

/* ── Benchmarks (Appendix H) ──────────────────────────────────── */

export const benchmarks = [
  { name: 'MT-Bench', venue: "NeurIPS'23", metric: 'Likert correlation', strength: 'Multi-turn; established paradigm' },
  { name: 'JudgeBench', venue: "ICLR'25", metric: 'PC accuracy', strength: 'Objective correctness; hardest benchmark' },
  { name: 'RewardBench', venue: '2024', metric: 'Category accuracy', strength: '4 dimensions; RLHF-focused' },
  { name: 'JudgeBoard', venue: '2025', metric: 'Elo + accuracy', strength: 'SLM-specific evaluation' },
  { name: 'CodeJudgeBench', venue: '2025', metric: 'Execution-grounded', strength: 'Code domain verification' },
  { name: 'M-RewardBench', venue: '2025', metric: 'Multilingual accuracy', strength: '20+ languages' },
]

/* ── Challenges (§6, C1–C6) ───────────────────────────────────── */

export const challenges = [
  { id: 'C1', name: 'Adaptive inference-time compute', status: 'Cascaded evaluation exists; reliable confidence estimation is open' },
  { id: 'C2', name: 'Judge calibration without human labels', status: 'Conformal prediction & TrustJudge exist; general frameworks undeveloped' },
  { id: 'C3', name: 'Domain generalization beyond math & code', status: 'Clinical, legal, scientific peer review largely unaddressed' },
  { id: 'C4', name: 'Resistance to reward hacking', status: "SLM judges' weaker instruction following is far less studied" },
  { id: 'C5', name: 'Standardized meta-evaluation protocols', status: 'No single benchmark spans all critical dimensions' },
  { id: 'C6', name: 'Representation-based evaluation', status: 'INSPECTOR shows promise; scaling to open-ended evaluation is open' },
]

/* ── Future Directions (Appendix K) ───────────────────────────── */

export const futureDirections = [
  { id: 1, name: 'Representation-based evaluation', horizon: 'Near', intervention: 'Probe atlas across layers' },
  { id: 2, name: 'Adaptive inference-time compute', horizon: 'Near', intervention: 'Difficulty prediction for budget allocation' },
  { id: 3, name: 'Calibrated uncertainty', horizon: 'Near', intervention: 'Conformal prediction for confidence scores' },
  { id: 4, name: 'Scalable oversight (W2SG)', horizon: 'Medium', intervention: 'Weak-to-strong generalization × verifiability' },
  { id: 5, name: 'Agentic & multi-step evaluation', horizon: 'Medium', intervention: 'Process reward models → trajectory evaluation' },
  { id: 6, name: 'Multilingual & cross-cultural', horizon: 'Medium', intervention: 'Native training data + cross-lingual verification' },
  { id: 7, name: 'Continual learning / judge maintenance', horizon: 'Medium', intervention: 'Drift monitoring and model refreshing' },
  { id: 8, name: 'Standardized meta-evaluation protocols', horizon: 'Near', intervention: 'Minimum reporting standard for judge papers' },
  { id: 9, name: 'Training methodology comparison', horizon: 'Near', intervention: 'Factorial study across paradigms' },
  { id: 10, name: 'Societal implications & monoculture risk', horizon: 'Long', intervention: 'Diversity audits for judge ecosystems' },
]

export const citation = `@article{laddha2026slmjudge,
  title   = {Small Language Models as Judges: A Survey},
  author  = {Anish Laddha and Nitesh Pradhan and Gaurav Srivastava},
  year    = {2026},
  url     = {https://github.com/anishh15/Awesome-SLM-as-a-Judge}
}`
