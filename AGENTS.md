# Project workflow

## Skills first

Before starting work, read the applicable `SKILL.md` files in `.agents/skills`.
Read and follow any additional `AGENTS.md` instructions in the directories being changed.

## Automatic commits

The user authorizes local commits after each completed, verified change. Do not
ask for commit confirmation each time. This applies to future tasks in this repository
unless the user explicitly asks to leave a change uncommitted.

- Keep each commit focused on one logical change.
- Inspect the working tree before editing. Preserve unrelated existing changes
  and stage only the files or hunks belonging to the completed change.
- Run the relevant checks before committing. For `WBA` application changes, run
  `npm test`, `npm run lint`, and `npm run build` from `WBA`. For backend changes,
  follow `Backend/AGENTS.md` and run the tests covering the affected behavior.
  For instructions or documentation alone, review the content and run
  `git diff --cached --check` after staging.
- Review the staged diff. Exclude secrets, environment files, dependencies,
  generated build output, and unrelated changes.
- Use a descriptive message with a conventional type such as `feat:`, `fix:`,
  `docs:`, or `chore:`.
- If required checks fail or cannot run, leave the affected change uncommitted
  and explain the blocker. Do not bypass hooks or weaken checks to commit.
- Commit on the current branch. Do not push, merge, deploy, amend existing
  commits, or rewrite history unless the user separately requests it.
- Verify the resulting commit and working-tree status, then report the short
  commit hash and the checks performed.
