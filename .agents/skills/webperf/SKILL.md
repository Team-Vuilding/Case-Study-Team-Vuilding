---
name: webperf
description: "Audit browser-facing web performance using Addy Osmani workflows. Use for Core Web Vitals, asset budgets, CPU or network throttling, and measured regressions."
---

# Web Performance

Codex alias for `/webperf`; invoke as `$webperf`.
Read [the upstream command](../../commands/webperf.toml), [the auditor](../../agents/web-performance-auditor.md), and [performance optimization](../performance-optimization/SKILL.md). Load [the checklist](../../references/performance-checklist.md) only for checks in scope.

A persona file does not register a new tool. Follow the current harness's delegation rules; perform the audit directly when delegation is unavailable or unauthorized. Report source-only findings as potential impact. Never invent Lighthouse, CrUX, latency, or bundle measurements. Apply [the local quality profile](../system-performance-and-quality/SKILL.md) for requested budgets.
