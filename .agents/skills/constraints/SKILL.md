---
name: constraints
description: "Define or check mechanical project quality bounds, guard against weakened tests or thresholds, and ratchet measured budgets. Codex alias for Addy Osmani constraints."
---

# Constraints

Invoke as `$constraints`, with `check`, `guard`, or `ratchet` when appropriate. Read [the command](../../commands/constraints.toml) and [constraint-driven development](../constraint-driven-development/SKILL.md).

Read existing constraints first. User-supplied thresholds are already requirements; do not re-ask for them. Use [the local quality profile](../system-performance-and-quality/SKILL.md) for the requested performance and architecture bounds.

Skill installation alone does not install CI gates. When asked to configure enforcement, record each exact tool, command, conditions, failure behavior, and justified budget. Run the checks. Report unavailable tools or unmeasured values honestly. Never weaken assertions, tests, thresholds, or domain boundaries to obtain a passing result.
