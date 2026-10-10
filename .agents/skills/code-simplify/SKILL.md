---
name: code-simplify
description: "Simplify a specified diff or recently changed code while preserving behavior. Codex alias for Addy Osmani code-simplify; use for unnecessary complexity and redundant abstractions."
---

# Code Simplify

Invoke as `$code-simplify`. Read [the command](../../commands/code-simplify.toml), [code simplification](../code-simplification/SKILL.md), and [Karpathy-inspired guidelines](../karpathy-guidelines/SKILL.md).

Keep scope tied to the request. Preserve outputs, side effects, errors, access checks, and UI/domain/data layer boundaries. Reuse existing domain services before extracting utilities. A one-use operation does not justify a generic utility layer. If a redundant 200-line abstraction can be replaced by a direct 50-line implementation with the same behavior, choose the direct implementation. Run relevant behavior tests before and after meaningful simplification. Remove only unused code introduced by this change.
