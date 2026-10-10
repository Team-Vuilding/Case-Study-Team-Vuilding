---
name: system-performance-and-quality
description: "Apply the requested production quality profile to web changes and PR preparation: reproducible throttled measurements, asset and CLS budgets, mutation latency, surgical architecture, and test-driven acceptance criteria."
---

# System Performance and Quality

Use for performance work, production readiness, and PR validation. This is a locally authored user policy profile, not an upstream Addy Osmani or Karpathy document.

## Validation contract

- Before implementation, define observable acceptance criteria and identify relevant tests. For behavior fixes, reproduce the failure with a test before fixing it when feasible. Use browser acceptance checks for UI-only changes rather than tests that mirror markup.
- Before any PR submission, run relevant behavior tests and affected lint/build checks. Include actual results and disclose unavailable checks. A checklist is not evidence of passing tests.
- Preserve scope, conventions, and layered UI/domain/data boundaries. Keep database mutations in existing backend domain paths. Avoid single-use generic frameworks and redundant 200-line utility abstractions.
- Do not skip tests, remove assertions, suppress failures, or lower budgets to get to green. Read [constraints](../constraint-driven-development/SKILL.md) for mechanical enforcement and [Karpathy-inspired guidance](../karpathy-guidelines/SKILL.md) for surgical diff loops.

## Performance budgets

- Read [performance optimization](../performance-optimization/SKILL.md). Measure a production build under explicit CPU and network throttling. Default diagnostic profile: 4x CPU slowdown, Slow 4G, fixed mobile viewport, cold cache. Record tool settings, hardware, URL, data, sample count, and before/after results; compare like with like.
- Start with upstream asset bounds: initial JavaScript below 200 KB gzip, CSS below 50 KB gzip, above-the-fold images below 200 KB each. Report actual baselines and justified exceptions; avoid unrelated rewrites merely to meet a budget.
- Reserve image space using intrinsic width/height or aspect ratio. Verify loading and slow-network states. Target CLS at or below 0.1, LCP at or below 2.5 seconds, INP at or below 200 ms. Synthetic results are not field percentiles.
- User-requested server mutation budget: p95 below 500 ms with representative authenticated payloads, database state, and documented concurrency. Measure server processing separately from end-to-end network time. A single request or timing only part of a mutation does not prove compliance.
- Make small changes, remeasure the actual bottleneck, and retain improvements supported by evidence. Mark unavailable measurements as not measured.

## Frontend engineering profile

For UI work, read [frontend engineering](../frontend-ui-engineering/SKILL.md) and the particular polish skill needed. Use fluid typography with bounded `clamp()` scales that remain readable under zoom, shared semantic tokens, and responsive layouts.

When Tailwind is the chosen stack, use a strict shared configuration for type, spacing, breakpoints, z-index, and colors; avoid arbitrary-value proliferation and parallel themes. Preserve the chosen stack: installing this skill does not authorize replacing existing CSS with Tailwind or adding dependencies.

Micro-animations use only transform and opacity, respect reduced motion, and provide short feedback. Add motion only for a requested interaction. Read [baseline UI](../baseline-ui/SKILL.md) while preserving the existing design system.
