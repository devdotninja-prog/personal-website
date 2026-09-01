---
name: jublia-py-reviewer
description: >
  Perform senior-level Python code reviews with detailed findings and actionable recommendations.
  Use this skill when the user requests any of: a code review of Python changes, a comparison of
  the current branch against a base branch (e.g. develop, main), reviewing a pull request,
  checking Python code quality, analyzing a diff, or asking "what do you think of this code/PR."
  Covers correctness, security, performance, architecture, testing, and idiomatic Python.
metadata:
  version: "1.1.0"
---

# Jublia Senior Python Code Reviewer

Structured workflow for in-depth review of Python code changes. Compares the current branch against a base branch (default: `develop`), gathers context, and delivers prioritized findings.

## Review Principles

Focus on these areas, in priority order:

1. **Correctness** â€” Logical errors, unhandled exceptions, edge cases, data integrity
2. **Security** â€” Injection, secrets exposure, insecure deserialization, input validation
3. **Architecture** â€” Separation of concerns, layering, module boundaries, API design
4. **Performance** â€” Data structure choice, N+1 queries, unnecessary I/O, memory usage
5. **Idiomatic Python** â€” PEP 8, type hints, comprehensions, context managers, error handling
6. **Readability** â€” Naming, function length, DRY, documentation

## Severity Levels

Classify every finding with one of these severities:

| Severity | Meaning | Action |
|:---|:---|:---|
| **Blocker** | Bugs, security vulnerabilities, data loss risk, broken behavior | Must fix before merge |
| **Warning** | Anti-patterns, missing tests, performance risks, maintainability debt | Should fix, or justify deferral |
| **Suggestion** | Style preferences, minor readability improvements, nice-to-haves | Optional, author's discretion |

## Review Scope

The default mode is a **full PR review** (all changed files). Adjust scope when:

- **User specifies files** (e.g., "just review `src/api.py`"): Only review the named files. Skip Steps 0-2 and generate findings only for the requested files. Still read surrounding context (Step 5) and produce the full report format.
- **User provides a code snippet** (not a git diff): Review the snippet directly. Skip Steps 0-3. Apply the same principles and output format, using "snippet" as the file name.
- **Context window pressure on large PRs**: If the diff is too large to fit in context, inform the user and offer to review in batches (e.g., "I'll review the 8 source files first, then tests in a follow-up"). Complete one batch fully before starting the next.

## Branch Selection

- If the user names a review branch (for example, `feature/jublia-ai-personality`), use that branch as the review branch.
- If the user does not name a branch, use the currently checked-out branch.
- Remote is always `origin`.

## Workflow

### Step 0: Resolve and Sync Branches

Before any review work, resolve branch context and update both base and review branches from `origin`.

1. Resolve review branch:
   - If user provided a branch name, set that as `<review-branch>`.
   - Otherwise set `<review-branch>` to the current branch.

```bash
REVIEW_BRANCH="<user-provided-branch-or-current>"
git fetch origin
```

2. Resolve base branch:
   - Default base is `develop`.
   - If `develop` does not exist locally/remotely, fallback to `main`.
   - If neither exists, stop and ask the user which base to use.

3. Sync base branch:

```bash
git checkout develop && git pull --rebase origin develop
```

Fallback when `develop` is unavailable:

```bash
git checkout main && git pull --rebase origin main
```

4. Switch back to review branch and sync it:

```bash
git checkout "${REVIEW_BRANCH}"
git pull --rebase origin "${REVIEW_BRANCH}"
```

5. Inform the user before each branch switch and update action.

Failure handling:
- If checkout fails, if branch does not exist on `origin`, or if `git pull --rebase` conflicts, stop the review workflow.
- Report the exact failed command and brief manual resolution guidance.
- Do not continue review with stale or partially rebased state.

### Step 1: Validate Base Branch

```bash
git rev-parse --verify develop 2>/dev/null
```

- Default base is `develop`. Use user-specified branch if provided.
- If `develop` does not exist, try `main`. If neither exists, ask the user.
- Report which base branch is being used and confirm it was synced from `origin`.

### Step 2: Generate the Diff

```bash
git diff <base-branch>...HEAD
```

- `HEAD` must be the synced review branch from Step 0.

**Skip these files** â€” do not review, only mention them in File Overview as "Skipped (auto-generated)":
- `*_pb2.py`, `*_pb2_grpc.py` (protobuf)
- `*/migrations/0*.py` (Django/Alembic migrations)
- `vendor/`, `third_party/`
- `*.pyc`, `__pycache__/`
- Lock files: `poetry.lock`, `Pipfile.lock`, `package-lock.json`
- Auto-generated files with `# AUTO-GENERATED` or `# DO NOT EDIT` headers

**Large diff strategy** â€” If the diff exceeds ~1500 lines:
- Split by file: review each changed file individually.
- Prioritize: source code first, then tests, then config/migrations last.
- Summarize low-risk files briefly rather than line-by-line.

### Step 3: Detect Project Stack

Before reading standards, identify the frameworks in use:

```bash
# Check dependency files for framework indicators
grep -iE "django|fastapi|flask|sqlalchemy|celery|asyncio|aiohttp" requirements*.txt pyproject.toml setup.py setup.cfg 2>/dev/null
```

Also scan the diff and changed files for framework imports. Record which frameworks are detected and focus on the corresponding sections of `python_standards.md` during review:
- Django found â†’ focus on sections V (Django) and VII (SQLAlchemy/ORM)
- FastAPI found â†’ focus on sections VI (FastAPI), IV (Async), and VII (SQLAlchemy/ORM)
- asyncio/aiohttp found â†’ focus on section IV (Async/Concurrency)
- No framework detected â†’ skip framework-specific sections entirely

### Step 4: Read Reference Standards

Read `references/python_standards.md` before analyzing. Focus on the sections relevant to the detected project stack (Step 3). Skip framework sections that don't apply.

### Step 5: Gather Context

For each non-trivial finding, before reporting it:
- Read the **full file** (not just the diff hunk) to understand surrounding logic.
- Check **callers and imports** â€” does the change break or affect other modules?
- Check **related tests** â€” does a corresponding test file exist? Is it updated?
- Check **existing project patterns** â€” does the codebase already use a convention that the new code should follow?

For **deleted code** (removed files, functions, or classes):
- Search for imports or references to the removed code across the codebase.
- Check for orphaned tests or config entries that reference deleted code.
- Flag broken references as a **Warning**.

Do not flag style issues that contradict the project's established patterns.

### Step 6: Analyze and Classify

For **newly added files**, additionally check:
- Missing module-level docstring explaining the file's purpose.
- New package directory missing `__init__.py`.
- Whether the file duplicates functionality that already exists elsewhere in the codebase.

For each finding, capture:
- **Severity**: Blocker / Warning / Suggestion
- **Type**: Correctness, Security, Architecture, Performance, Python, Readability
- **File:Line**: Exact location
- **Description**: What the issue is
- **Recommendation**: Concrete fix
- **Suggested fix**: A before/after code block showing the exact change. Required for Blockers and Warnings. Optional for Suggestions.

### Step 7: Score the Changes

Assign a **Merge Readiness Score** from 1 to 10 based on the overall quality of the changes:

| Score | Label | Meaning |
|:---|:---|:---|
| 9-10 | Excellent | Clean, well-tested, no issues. Merge immediately. |
| 7-8 | Good | Minor suggestions only, no blockers or warnings. Safe to merge. |
| 5-6 | Needs Work | Has warnings or minor gaps (missing tests, small anti-patterns). Fix before merge. |
| 3-4 | Significant Issues | Multiple warnings or architectural concerns. Requires rework. |
| 1-2 | Do Not Merge | Blockers present â€” bugs, security vulnerabilities, or broken behavior. |

Scoring rules:
- Any **Blocker** caps the score at 2.
- 3+ **Warnings** caps the score at 5.
- 1-2 **Warnings** with no blockers caps the score at 7.
- Only **Suggestions** or no findings allows 8-10.
- Adjust within the range based on severity, scope of changes, and test coverage.

### Step 8: Produce the Report

Use the output structure below.

## Output Structure

```
# Code Review Report

## Summary

- **Merge Readiness Score**: <score>/10 â€” <label>
- **Review branch**: <branch name>
- **Base branch**: <branch name>
- **Sync status**: synced / failed (<reason>)
- **Files reviewed**: <count>
- **Blockers**: <count> | **Warnings**: <count> | **Suggestions**: <count>
- **Overall assessment**: <1-2 sentence summary>
- **Recommended next steps**: <actionable instruction>

---

## File Overview

| File | Status | Findings |
|:---|:---|:---|
| `src/api.py` | Needs work | 1 blocker, 1 warning |
| `src/models.py` | Clean | â€” |
| `utils/helpers.py` (new) | Minor | 2 suggestions |

---

## Findings

### Blockers

(If none, write "None.")

**[Severity] [Type]** `file.py:42`
Description of the issue.
**Recommendation:** Concrete fix.
**Suggested fix:**
 ```python
 # Before
 data = pickle.loads(user_input)

 # After
 data = json.loads(user_input)
 ```

### Warnings

...same format (suggested fix required)...

### Suggestions

...same format (suggested fix optional)...

---

## Good Practices Observed

- `file.py:10` â€” Brief note on what was done well and why it matters.

---

## Risk Assessment

- **Risk level**: Low / Medium / High
- **Reasoning**: <1-2 sentences explaining why, based on what areas of the
  codebase are touched â€” e.g., payment logic, auth, data models, public API
  surface vs. internal utilities, logging, formatting>

## Technical Summary

1-2 paragraphs on the most significant patterns, architectural implications,
and the "why" behind the top recommendations.
```

**Format notes:**
- Group findings by severity, not by file.
- For 5+ findings in a severity group, use a summary table with columns: Severity, Type, File:Line, Description, Recommendation. Add suggested fix code blocks below the table for each row.
- For fewer findings, use the prose format shown above.
- **Suggested fix** (before/after code block) is **required** for Blockers and Warnings, **optional** for Suggestions.
- Mark new files with `(new)` and deleted files with `(deleted)` in the File Overview table.

## Bundled Resources

- `references/python_standards.md` â€” Checklist of non-obvious Python pitfalls, framework-specific patterns (Django, FastAPI, SQLAlchemy, asyncio), and security anti-patterns. **Read in Step 4, focus on sections matching the detected stack from Step 3.**
