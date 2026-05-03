<p align="center">
  <img src="assets/taxonomy.png" alt="SLM-as-a-Judge Taxonomy" width="95%">
</p>

<h1 align="center">📐 Awesome SLM-as-a-Judge</h1>

<p align="center">
  <a href="#citation"><img src="https://img.shields.io/badge/arXiv-Coming%20Soon-red?logo=arxiv" alt="arXiv"></a>
  <a href="https://github.com/anishh15/Awesome-SLM-as-a-Judge"><img src="https://img.shields.io/badge/GitHub-Repository-blue?logo=github" alt="GitHub"></a>
  <img src="https://img.shields.io/github/last-commit/anishh15/Awesome-SLM-as-a-Judge" alt="Last Commit">
  <img src="https://img.shields.io/github/stars/anishh15/Awesome-SLM-as-a-Judge?style=social" alt="Stars">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"></a>
</p>

<p align="center">
  <em>A curated collection of papers, benchmarks, datasets, and resources for the <strong>SLM-as-a-Judge</strong> paradigm — where Small Language Models serve as automated evaluators.</em>
</p>

---

> 🔥🔥 **Survey Paper**: *Small Language Models as Judges: A Survey* — arXiv coming soon.

---

## 🔥 Latest Papers

|  Title  |   Venue  |   Date   |   Code   |
|:--------|:--------:|:--------:|:--------:|
| ![Star](https://img.shields.io/github/stars/ctrl-gaurav/effGen.svg?style=social&label=Star) <br> [**EffGen: Enabling Small Language Models as Capable Autonomous Agents**](https://arxiv.org/abs/2602.00887) <br> | ArXiv | 2026-02 | [Github](https://github.com/ctrl-gaurav/effGen) |
| [**The Persona Paradox: Medical Personas as Behavioral Priors in Clinical Language Models**](https://arxiv.org/abs/2601.05376) <br> | ArXiv | 2026-01 | - |
| [**Rethinking LLM-as-a-Judge: Representation-as-a-Judge with SLMs via Semantic Capacity Asymmetry**](https://arxiv.org/abs/2601.22588) <br> | ArXiv | 2026-01 | - |
| [**Efficient LLM Safety Evaluation through Multi-Agent Debate**](https://arxiv.org/abs/2511.06396) <br> | ArXiv | 2025-11 | - |
| [**Multi-Agent Debate for LLM Judges with Adaptive Stability Detection**](https://arxiv.org/abs/2510.12697) <br> | NeurIPS | 2025-10 | - |
| ![Star](https://img.shields.io/github/stars/ctrl-gaurav/BeyondBench.svg?style=social&label=Star) <br> [**BeyondBench: Contamination-Resistant Evaluation of Reasoning in Language Models**](https://arxiv.org/abs/2509.24210) <br> | ICLR | 2025-09 | [Github](https://github.com/ctrl-gaurav/BeyondBench) |
| [**"Talk Isn't Always Cheap": Understanding Failure Modes in Multi-Agent Debate**](https://arxiv.org/abs/2509.05396) <br> | ArXiv | 2025-09 | - |
| [**OptimalThinkingBench: Evaluating Over and Underthinking in LLMs**](https://arxiv.org/abs/2508.13141) <br> | ArXiv | 2025-08 | - |
| ![Star](https://img.shields.io/github/stars/open-compass/CompassJudger.svg?style=social&label=Star) <br> [**CompassJudger-2: Towards Generalist Judge Model via Verifiable Rewards**](https://arxiv.org/abs/2507.09104) <br> | ArXiv | 2025-07 | [Github](https://github.com/open-compass/CompassJudger) |
| [**The Illusion of Thinking: Understanding Strengths and Limitations of Reasoning Models**](https://arxiv.org/abs/2506.06941) <br> | NeurIPS | 2025-06 | - |

---

## 📰 Updates

- 🔥 **[2026/05]** — Repository launched as companion to our EMNLP 2026 survey submission.

---

## 🌳 Table of Contents

- [Latest Papers](#-latest-papers)
- [Updates](#-updates)
- [About This Repository](#-about-this-repository)
- [Overview](#-overview)
- [Paper List](#-paper-list)
  - [1. Foundational LLM-as-a-Judge Work](#1-foundational-llm-as-a-judge-work)
  - [2. SLM-as-a-Judge Surveys & Definitions](#2-slm-as-a-judge-surveys--definitions)
  - [3. Specialized & Fine-Tuned Judge Models](#3-specialized--fine-tuned-judge-models)
  - [4. Token Budget, Reasoning Efficiency & Overthinking](#4-token-budget-reasoning-efficiency--overthinking)
  - [5. Ensemble & Panel-Based Methods](#5-ensemble--panel-based-methods)
  - [6. Multi-Agent Debate & Deliberation](#6-multi-agent-debate--deliberation)
  - [7. Persona Effects & Prompt Sensitivity](#7-persona-effects--prompt-sensitivity)
  - [8. Output Optimization & Post-Processing](#8-output-optimization--post-processing)
  - [9. Judge Biases & Preference Leakage](#9-judge-biases--preference-leakage)
  - [10. Adversarial Robustness](#10-adversarial-robustness)
  - [11. Multilingual Evaluation](#11-multilingual-evaluation)
  - [12. Self-Evolving & Self-Improving Judges](#12-self-evolving--self-improving-judges)
  - [13. Alignment, RLHF & Training Methods](#13-alignment-rlhf--training-methods)
  - [14. Reasoning & Chain-of-Thought](#14-reasoning--chain-of-thought)
  - [15. Model Papers](#15-model-papers)
- [Benchmarks & Datasets](#-benchmarks--datasets)
- [Related Surveys](#-related-surveys)
- [Citation](#-citation)
- [Contributing](#-contributing)

---

## 🌟 About This Repository

This repository accompanies our survey paper **"Small Language Models as Judges: A Survey"**, which provides the first comprehensive review of the emerging paradigm where **Small Language Models (SLMs)**—operationally defined as models with **≤14B parameters** that can run on a single consumer GPU—serve as automated evaluators.

We organize the rapidly expanding literature around a structured taxonomy spanning five key dimensions:

1. **Background & Motivation** — Why SLM judges, formal definitions, and evaluation formalism
2. **Individual SLM Judging** — Specialized judges, token budgets, capability thresholds, overthinking, biases, and thinking modes
3. **Multi-Agent Strategies** — Ensembles, debate, output optimization, and persona robustness
4. **Benchmarks & Metrics** — Meta-evaluation infrastructure, adversarial robustness
5. **Challenges & Future Directions** — Eight open research problems

We will continuously update this repository with the latest papers and resources. If you find this helpful, please ⭐ star the repo!

> 📬 **Missing a paper?** Feel free to [open an issue](https://github.com/anishh15/Awesome-SLM-as-a-Judge/issues) or submit a pull request.

---

## 📊 Overview

<p align="center">
  <img src="assets/taxonomy.png" alt="SLM-as-a-Judge Taxonomy" width="95%">
</p>

> *Figure: Taxonomy of the SLM-as-a-Judge survey, organized around five key dimensions: background and motivation, individual SLM judging, multi-agent strategies, benchmarks and metrics, and challenges and future directions.*

---

## 📑 Paper List

### 1. Foundational LLM-as-a-Judge Work

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena**](https://arxiv.org/abs/2306.05685) | NeurIPS | 2023 | [[pdf]](https://arxiv.org/abs/2306.05685) |
| ![Star](https://img.shields.io/github/stars/baaivision/JudgeLM.svg?style=social&label=Star) <br> [**JudgeLM: Fine-tuned Large Language Models are Scalable Judges**](https://arxiv.org/abs/2310.17631) | ICLR | 2025 | [[pdf]](https://arxiv.org/abs/2310.17631) [[code]](https://github.com/baaivision/JudgeLM) |
| ![Star](https://img.shields.io/github/stars/prometheus-eval/prometheus.svg?style=social&label=Star) <br> [**Prometheus: Inducing Fine-grained Evaluation Capability in Language Models**](https://arxiv.org/abs/2310.08491) | ICLR | 2024 | [[pdf]](https://arxiv.org/abs/2310.08491) [[code]](https://github.com/prometheus-eval/prometheus) |
| [**Prometheus 2: An Open Source Language Model Specialized in Evaluating Other Language Models**](https://arxiv.org/abs/2405.01535) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2405.01535) |
| ![Star](https://img.shields.io/github/stars/WeOpenML/PandaLM.svg?style=social&label=Star) <br> [**PandaLM: An Automatic Evaluation Benchmark for LLM Instruction Tuning**](https://arxiv.org/abs/2306.05087) | ICLR | 2024 | [[pdf]](https://arxiv.org/abs/2306.05087) [[code]](https://github.com/WeOpenML/PandaLM) |
| ![Star](https://img.shields.io/github/stars/GAIR-NLP/auto-j.svg?style=social&label=Star) <br> [**Auto-J: Generative Judge for Evaluating Alignment**](https://arxiv.org/abs/2310.05470) | ICLR | 2024 | [[pdf]](https://arxiv.org/abs/2310.05470) [[code]](https://github.com/GAIR-NLP/auto-j) |
| [**Humans or LLMs as the Judge? A Study on Judgement Biases**](https://arxiv.org/abs/2402.10669) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2402.10669) |
| [**Limitations of the LLM-as-a-Judge Approach for Evaluating LLM Outputs in Expert Knowledge Tasks**](https://arxiv.org/abs/2410.20266) | IUI | 2025 | [[pdf]](https://arxiv.org/abs/2410.20266) |
| [**Who Validates the Validators? Aligning LLM-Assisted Evaluation with Human Preferences**](https://arxiv.org/abs/2404.12272) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2404.12272) |

---

### 2. SLM-as-a-Judge Surveys & Definitions

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Small Language Models: Survey, Measurements, and Insights**](https://arxiv.org/abs/2409.15790) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2409.15790) |
| [**ThinkSLM: Towards Reasoning in Small Language Models**](https://arxiv.org/abs/2502.11569) | EMNLP | 2025 | [[pdf]](https://arxiv.org/abs/2502.11569) [[leaderboard]](https://ctrl-gaurav.github.io/thinkslm.github.io/) |
| ![Star](https://img.shields.io/github/stars/ctrl-gaurav/BeyondBench.svg?style=social&label=Star) <br> [**BeyondBench: Contamination-Resistant Evaluation of Reasoning in Language Models**](https://arxiv.org/abs/2509.24210) | ICLR | 2026 | [[pdf]](https://arxiv.org/abs/2509.24210) [[code]](https://github.com/ctrl-gaurav/BeyondBench) [[leaderboard]](https://ctrl-gaurav.github.io/BeyondBench/) |
| ![Star](https://img.shields.io/github/stars/ctrl-gaurav/effGen.svg?style=social&label=Star) <br> [**EffGen: Enabling Small Language Models as Capable Autonomous Agents**](https://arxiv.org/abs/2602.00887) | ArXiv | 2026 | [[pdf]](https://arxiv.org/abs/2602.00887) [[code]](https://github.com/ctrl-gaurav/effGen) |

---

### 3. Specialized & Fine-Tuned Judge Models

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**GLIDER: Grading LLM Interactions and Decisions using Explainable Ranking**](https://arxiv.org/abs/2412.14140) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2412.14140) [[model]](https://huggingface.co/PatronusAI/glider) |
| [**J1: Incentivizing Thinking in LLM-as-a-Judge via Reinforcement Learning**](https://arxiv.org/abs/2505.10320) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2505.10320) |
| ![Star](https://img.shields.io/github/stars/NuoJohnChen/JudgeLRM.svg?style=social&label=Star) <br> [**JudgeLRM: Large Reasoning Models as a Judge**](https://arxiv.org/abs/2504.00050) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2504.00050) [[code]](https://github.com/NuoJohnChen/JudgeLRM) |
| ![Star](https://img.shields.io/github/stars/open-compass/CompassJudger.svg?style=social&label=Star) <br> [**CompassJudger-2: Towards Generalist Judge Model via Verifiable Rewards**](https://arxiv.org/abs/2507.09104) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2507.09104) [[code]](https://github.com/open-compass/CompassJudger) |
| [**J4R: Learning to Judge with Equivalent Initial State Group Relative Policy Optimization**](https://arxiv.org/abs/2505.13346) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2505.13346) |
| [**Skywork-Critic: An Open-Source Critic Model for LLM Preference Evaluation**](https://huggingface.co/Skywork/Skywork-Critic-Llama-3.1-8B) | — | 2024 | [[model]](https://huggingface.co/Skywork/Skywork-Critic-Llama-3.1-8B) |
| [**Skywork-Reward: Bag of Tricks for Reward Modeling in LLMs**](https://arxiv.org/abs/2410.18451) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2410.18451) |
| [**FLAMe: Foundational Large Autorater Models**](https://arxiv.org/abs/2407.10817) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2407.10817) |
| [**TIGERScore: Towards Building Explainable Metric for All Text Generation Tasks**](https://arxiv.org/abs/2310.00752) | TACL | 2024 | [[pdf]](https://arxiv.org/abs/2310.00752) |
| [**Themis: A Reference-free NLG Evaluation Language Model**](https://arxiv.org/abs/2406.18365) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2406.18365) |
| [**Rethinking LLM-as-a-Judge: Representation-as-a-Judge with SLMs via Semantic Capacity Asymmetry**](https://arxiv.org/abs/2601.22588) | ArXiv | 2026 | [[pdf]](https://arxiv.org/abs/2601.22588) |
| [**Explicit Reasoning Makes Better Judges: A Systematic Study on Accuracy, Efficiency, and Robustness**](https://arxiv.org/abs/2509.13332) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2509.13332) |
| [**SelFee: Iterative Self-Revising LLM Empowered by Self-Feedback Generation**](https://arxiv.org/abs/2305.01919) | ArXiv | 2023 | [[pdf]](https://arxiv.org/abs/2305.01919) |
| [**Shepherd: A Critic for Language Model Generation**](https://arxiv.org/abs/2308.04592) | ArXiv | 2023 | [[pdf]](https://arxiv.org/abs/2308.04592) |

---

### 4. Token Budget, Reasoning Efficiency & Overthinking

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Token-Budget-Aware LLM Reasoning**](https://arxiv.org/abs/2412.18547) | ACL Findings | 2025 | [[pdf]](https://arxiv.org/abs/2412.18547) |
| [**Reasoning in Token Economies: Budget-Aware Evaluation of LLM Reasoning Strategies**](https://arxiv.org/abs/2406.06461) | EMNLP | 2024 | [[pdf]](https://arxiv.org/abs/2406.06461) |
| [**Stop Overthinking: A Survey on Efficient Reasoning for Large Language Models**](https://arxiv.org/abs/2503.16419) | TMLR | 2025 | [[pdf]](https://arxiv.org/abs/2503.16419) |
| [**Do LLMs Overthink Basic Math Reasoning? Benchmarking Accuracy-Efficiency Tradeoff**](https://arxiv.org/abs/2507.04023) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2507.04023) |
| [**Reasoning Models Can Be Effective Without Thinking**](https://arxiv.org/abs/2504.09858) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2504.09858) |
| [**The Illusion of Thinking: Understanding Strengths and Limitations of Reasoning Models**](https://arxiv.org/abs/2506.06941) | NeurIPS | 2025 | [[pdf]](https://arxiv.org/abs/2506.06941) |
| [**Does Thinking More Always Help? Mirage of Test-Time Scaling in Reasoning Models**](https://arxiv.org/abs/2506.04210) | NeurIPS | 2025 | [[pdf]](https://arxiv.org/abs/2506.04210) |
| [**OptimalThinkingBench: Evaluating Over and Underthinking in LLMs**](https://arxiv.org/abs/2508.13141) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2508.13141) |

---

### 5. Ensemble & Panel-Based Methods

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Replacing Judges with Juries: Evaluating LLM Generations with a Panel of Diverse Models (PoLL)**](https://arxiv.org/abs/2404.18796) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2404.18796) |
| [**Self-Consistency Improves Chain of Thought Reasoning in Language Models**](https://arxiv.org/abs/2203.11171) | ICLR | 2023 | [[pdf]](https://arxiv.org/abs/2203.11171) |
| [**Large Language Monkeys: Scaling Inference Compute with Repeated Sampling**](https://arxiv.org/abs/2407.21787) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2407.21787) |
| [**COSMosFL: Ensemble of Small Language Models for Fault Localisation**](https://arxiv.org/abs/2502.02908) | LLM4Code | 2025 | [[pdf]](https://arxiv.org/abs/2502.02908) |
| [**Crowd-based Comparative Evaluation: An Efficient Framework for LLM-as-a-Judge**](https://arxiv.org/abs/2502.09556) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2502.09556) |
| [**TrustJudge: Towards Trustworthy LLM-as-a-Judge**](https://arxiv.org/abs/2501.10834) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2501.10834) |

---

### 6. Multi-Agent Debate & Deliberation

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Improving Factuality and Reasoning in Language Models through Multiagent Debate**](https://arxiv.org/abs/2305.14325) | ICML | 2024 | [[pdf]](https://arxiv.org/abs/2305.14325) |
| [**Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate**](https://arxiv.org/abs/2305.19118) | ACL | 2024 | [[pdf]](https://arxiv.org/abs/2305.19118) |
| [**DEBATE, TRAIN, EVOLVE: Self-Evolution of Language Model Reasoning**](https://arxiv.org/abs/2505.15734) | EMNLP | 2025 | [[pdf]](https://arxiv.org/abs/2505.15734) |
| [**Multi-Agent Debate for LLM Judges with Adaptive Stability Detection**](https://arxiv.org/abs/2510.12697) | NeurIPS | 2025 | [[pdf]](https://arxiv.org/abs/2510.12697) |
| [**Efficient LLM Safety Evaluation through Multi-Agent Debate**](https://arxiv.org/abs/2511.06396) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2511.06396) |
| [**"Talk Isn't Always Cheap": Understanding Failure Modes in Multi-Agent Debate**](https://arxiv.org/abs/2509.05396) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2509.05396) |
| [**Stop Overvaluing Multi-Agent Debate: We Must Rethink Evaluation and Embrace Model Heterogeneity**](https://arxiv.org/abs/2502.08788) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2502.08788) |

---

### 7. Persona Effects & Prompt Sensitivity

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Two Tales of Persona in LLMs: A Survey of Role-Playing and Personalization**](https://arxiv.org/abs/2406.01171) | EMNLP Findings | 2024 | [[pdf]](https://arxiv.org/abs/2406.01171) |
| [**In-Context Impersonation Reveals Large Language Models' Strengths and Biases**](https://arxiv.org/abs/2305.14930) | NeurIPS | 2024 | [[pdf]](https://arxiv.org/abs/2305.14930) |
| [**The Persona Paradox: Medical Personas as Behavioral Priors in Clinical Language Models**](https://arxiv.org/abs/2601.05376) | ArXiv | 2026 | [[pdf]](https://arxiv.org/abs/2601.05376) |
| ![Star](https://img.shields.io/github/stars/SALT-NLP/SynthesizeMe.svg?style=social&label=Star) <br> [**SynthesizeMe! Inducing Persona-Guided Prompts for Personalized Reward Models**](https://arxiv.org/abs/2506.05598) | ACL | 2025 | [[pdf]](https://arxiv.org/abs/2506.05598) [[code]](https://github.com/SALT-NLP/SynthesizeMe) |

---

### 8. Output Optimization & Post-Processing

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Trust or Escalate: LLM Judges with Provable Guarantees for Human Agreement**](https://arxiv.org/abs/2407.18370) | ICLR | 2025 | [[pdf]](https://arxiv.org/abs/2407.18370) |
| [**Generation Meets Verification: Accelerating LLM Inference with Smart Parallel Auto-Correct Decoding**](https://arxiv.org/abs/2402.11809) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2402.11809) |

### 9. Judge Biases & Preference Leakage

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Preference Leakage: A Contamination Problem in LLM-as-a-Judge**](https://arxiv.org/abs/2412.19498) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2412.19498) |

---

### 10. Adversarial Robustness

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| ![Star](https://img.shields.io/github/stars/sail-sg/Cheating-LLM-Benchmarks.svg?style=social&label=Star) <br> [**Cheating Automatic LLM Benchmarks: Null Models Achieve High Win Rates**](https://arxiv.org/abs/2410.07137) | ICLR (Oral) | 2025 | [[pdf]](https://arxiv.org/abs/2410.07137) [[code]](https://github.com/sail-sg/Cheating-LLM-Benchmarks) |

---

### 11. Multilingual Evaluation

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**M-Prometheus: A Suite of Open Multilingual LLM Judges**](https://arxiv.org/abs/2504.04953) | COLM | 2025 | [[pdf]](https://arxiv.org/abs/2504.04953) |

---

### 12. Self-Evolving & Self-Improving Judges

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Self-Taught Evaluators**](https://arxiv.org/abs/2408.02666) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2408.02666) |
| [**DEBATE, TRAIN, EVOLVE: Self-Evolution of Language Model Reasoning**](https://arxiv.org/abs/2505.15734) | EMNLP | 2025 | [[pdf]](https://arxiv.org/abs/2505.15734) |
| [**Weak-to-Strong Generalization: Eliciting Strong Capabilities With Weak Supervision**](https://arxiv.org/abs/2312.09390) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2312.09390) |
| [**TrueTeacher: Learning Factual Consistency Evaluation with Large Language Models**](https://arxiv.org/abs/2305.11171) | ArXiv | 2023 | [[pdf]](https://arxiv.org/abs/2305.11171) |

---

### 13. Alignment, RLHF & Training Methods

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Training Language Models to Follow Instructions with Human Feedback**](https://arxiv.org/abs/2203.02155) | NeurIPS | 2022 | [[pdf]](https://arxiv.org/abs/2203.02155) |
| [**Constitutional AI: Harmlessness from AI Feedback**](https://arxiv.org/abs/2212.08073) | ArXiv | 2022 | [[pdf]](https://arxiv.org/abs/2212.08073) |
| [**Direct Preference Optimization: Your Language Model is Secretly a Reward Model**](https://arxiv.org/abs/2305.18290) | NeurIPS | 2023 | [[pdf]](https://arxiv.org/abs/2305.18290) |
| [**Let's Verify Step by Step**](https://arxiv.org/abs/2305.20050) | ICLR | 2024 | [[pdf]](https://arxiv.org/abs/2305.20050) |

---

### 14. Reasoning & Chain-of-Thought

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**Chain-of-Thought Prompting Elicits Reasoning in Large Language Models**](https://arxiv.org/abs/2201.11903) | NeurIPS | 2022 | [[pdf]](https://arxiv.org/abs/2201.11903) |
| [**Large Language Models are Zero-Shot Reasoners**](https://arxiv.org/abs/2205.11916) | NeurIPS | 2022 | [[pdf]](https://arxiv.org/abs/2205.11916) |
| ![Star](https://img.shields.io/github/stars/deepseek-ai/DeepSeek-R1.svg?style=social&label=Star) <br> [**DeepSeek-R1: Incentivizing Reasoning Capability via Reinforcement Learning**](https://arxiv.org/abs/2501.12948) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2501.12948) [[code]](https://github.com/deepseek-ai/DeepSeek-R1) |
| [**Learning to Reason with LLMs**](https://openai.com/index/learning-to-reason-with-llms/) | OpenAI Blog | 2024 | [[link]](https://openai.com/index/learning-to-reason-with-llms/) |

---

### 15. Model Papers

|  Title  |   Venue  |   Year   |   Links   |
|:--------|:--------:|:--------:|:---------:|
| [**GPT-4 Technical Report**](https://arxiv.org/abs/2303.08774) | ArXiv | 2023 | [[pdf]](https://arxiv.org/abs/2303.08774) |
| [**Qwen2.5 Technical Report**](https://arxiv.org/abs/2412.15115) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2412.15115) |
| [**Qwen3 Technical Report**](https://arxiv.org/abs/2505.09388) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2505.09388) |
| [**The Llama 3 Herd of Models**](https://arxiv.org/abs/2407.21783) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2407.21783) |
| [**Phi-4 Technical Report**](https://arxiv.org/abs/2412.08905) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2412.08905) |
| [**Phi-4-Mini Technical Report**](https://arxiv.org/abs/2503.01743) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2503.01743) |
| [**Phi-4-Reasoning Technical Report**](https://arxiv.org/abs/2504.21318) | ArXiv | 2025 | [[pdf]](https://arxiv.org/abs/2504.21318) |
| [**Gemma: Open Models Based on Gemini Research and Technology**](https://arxiv.org/abs/2403.08295) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2403.08295) |
| [**Gemma 2: Improving Open Language Models at a Practical Size**](https://arxiv.org/abs/2408.00118) | ArXiv | 2024 | [[pdf]](https://arxiv.org/abs/2408.00118) |

---

## 📦 Benchmarks & Datasets

### Meta-Evaluation Benchmarks

| Benchmark | Description | Paper |
|-----------|-------------|-------|
| **MT-Bench** | 80 multi-turn questions, 8 categories, pairwise + single-scoring | [Zheng et al., 2023](https://arxiv.org/abs/2306.05685) |
| **Arena-Hard-Auto** | 500 difficult open-ended prompts, 89.1% confidence agreement with Chatbot Arena | [Li et al., 2024](https://arxiv.org/abs/2406.11939) |
| **JudgeBench** | 350 challenging response pairs across knowledge, reasoning, math, coding | [Tan et al., 2025](https://arxiv.org/abs/2410.12784) |
| **RewardBench** | Evaluation of reward models across chat, safety, reasoning | [Lambert et al., 2024](https://arxiv.org/abs/2403.13787) |
| **JudgeBoard** | Benchmarking small language models for reasoning evaluation | [Bi et al., 2025](https://arxiv.org/abs/2511.15958) |
| **CodeJudgeBench** | Benchmarking LLM-as-a-Judge for coding tasks | [Jiang et al., 2025](https://arxiv.org/abs/2507.10535) |
| **ContextualJudgeBench** | Evaluating judges in contextual settings | [Xu et al., 2025](https://arxiv.org/abs/2503.15620) |

### Reasoning & Math Benchmarks (Used as Evaluation Substrates)

| Benchmark | Description | Paper |
|-----------|-------------|-------|
| **GSM8K** | 8.5K grade-school math word problems | [Cobbe et al., 2021](https://arxiv.org/abs/2110.14168) |
| **MATH** | 12.5K competition-level math problems across 7 topics | [Hendrycks et al., 2021](https://arxiv.org/abs/2103.03874) |
| **ARC** | 7.7K multiple-choice science questions for the AI2 Reasoning Challenge | [Clark et al., 2018](https://arxiv.org/abs/1803.05457) |
| **GSM-Plus** | Robustness evaluation of LLMs as mathematical problem solvers | [Li et al., 2024](https://arxiv.org/abs/2402.19255) |
| **MMLU** | Massive Multitask Language Understanding benchmark | [Hendrycks et al., 2021](https://arxiv.org/abs/2009.03300) |

---

## 📚 Related Surveys

| Survey | Focus | Year | Links |
|--------|-------|------|-------|
| [**A Survey on LLM-as-a-Judge**](https://arxiv.org/abs/2411.15594) | Formal definitions, reliability, bias in LLM-based evaluation | 2024 | [[pdf]](https://arxiv.org/abs/2411.15594) |
| [**From Generation to Judgment: Opportunities and Challenges of LLM-as-a-Judge**](https://arxiv.org/abs/2411.16594) | Transition from generation to judgment | 2024 | [[pdf]](https://arxiv.org/abs/2411.16594) |
| ![Star](https://img.shields.io/github/stars/CSHaitao/Awesome-LLMs-as-Judges.svg?style=social&label=Star) <br> [**LLMs-as-Judges: A Comprehensive Survey on LLM-based Evaluation Methods**](https://arxiv.org/abs/2412.05579) | Comprehensive review of LLM evaluation methods | 2024 | [[pdf]](https://arxiv.org/abs/2412.05579) [[repo]](https://github.com/CSHaitao/Awesome-LLMs-as-Judges) |
| ![Star](https://img.shields.io/github/stars/AIoT-MLSys-Lab/Efficient-LLMs-Survey.svg?style=social&label=Star) <br> [**Efficient Large Language Models: A Survey**](https://arxiv.org/abs/2312.03863) | Efficiency techniques for large models | 2024 | [[pdf]](https://arxiv.org/abs/2312.03863) [[repo]](https://github.com/AIoT-MLSys-Lab/Efficient-LLMs-Survey) |
| [**Small Language Models: Survey, Measurements, and Insights**](https://arxiv.org/abs/2409.15790) | SLM architectures and deployment | 2024 | [[pdf]](https://arxiv.org/abs/2409.15790) |
| [**Stop Overthinking: A Survey on Efficient Reasoning for LLMs**](https://arxiv.org/abs/2503.16419) | Efficient reasoning and overthinking phenomenon | 2025 | [[pdf]](https://arxiv.org/abs/2503.16419) |

---

## 📖 Citation

If you find this survey and repository useful for your research, please cite our paper:

```bibtex
@article{laddha2025slmasjudgesurvey,
  title={Small Language Models as Judges: A Survey},
  author={Laddha, Anish and Pradhan, Nitesh and Srivastava, Gaurav},
  journal={ArXiv},
  year={2025}
}
```

---

## 🤝 Contributing

We welcome contributions from the community! If you'd like to add a paper, fix a link, or suggest improvements:

1. **Open an Issue**: Describe the paper or resource you'd like to add at [github.com/anishh15/Awesome-SLM-as-a-Judge/issues](https://github.com/anishh15/Awesome-SLM-as-a-Judge/issues).
2. **Submit a Pull Request**: Use the following format for new paper entries:

```markdown
| ![Star](https://img.shields.io/github/stars/ORG/REPO.svg?style=social&label=Star) <br> [**Paper Title**](arxiv_link) | Venue | Year | [[pdf]](link) [[code]](link) |
```

Please make sure to include:
- ✅ Correct arXiv or venue link
- ✅ Code/model links if available
- ✅ Correct categorization within our taxonomy

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <em>If you find this repository helpful, please consider giving it a ⭐!</em>
</p>

