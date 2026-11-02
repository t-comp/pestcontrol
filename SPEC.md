# pestcontrol: Product Spec (v1)

Status: v1 spec, built from owner decisions. Items under "Open questions" are not decided yet.
Version note: this replaces the earlier draft. Anything marked [SUGGESTED] was proposed by Claude and accepted by the owner as a default, not independently verified.

## 1. Overview

pestcontrol is a free, public, non-commercial web game where players find and fix bugs in short Python snippets. It is practice for "debug this code" interview rounds, with scoring, streaks, hints, and difficulty tiers.

- Audience: the public (people learning to code, people preparing for interviews).
- Cost: near zero. No paid tier planned for now.
- Players need no account. Progress is saved in the browser.

## 2. v1 scope

In v1:
- Python puzzles only
- Easy and Medium tiers only
- One bug per puzzle, in a single function or short single-file snippet
- Anonymous play, progress saved in the browser (localStorage)
- At least 40 puzzles at launch (20 Easy, 20 Medium), more if the owner can review them (suggested 40 to 60)

Deferred (not in v1, do not build unless asked):
- Java (needs a server-side sandbox to run player code)
- Hard tier, puzzles with more than one bug, larger programs, multi-file codebases
- Accounts, cross-device saving, forum, user-submitted bugs, leaderboards
- AI grading of written explanations
- Choose-your-own-puzzle browsing by category (v1 gives random puzzles)
- Real bugs from repos such as QuixBugs and BugsInPy (pending license checks, see section 8)
- The "make this code more efficient" track (see section 11)
- Timed mode (a time limit per round, or points for speed)
- Advanced scoring: difficulty multiplier (Easy 1.0, Medium 1.5, Hard 2.0), streak bonus (+10% per level, capped at +50%), and the order they apply in

## 3. Core loop: one round

Each puzzle shows a code snippet with one bug, plus a short description of what the code is supposed to do (the intent). The round is one screen with independent panels. The player may complete any subset of panels, in any order. Points are kept for each panel completed.

Panels:
1. Find the line (100 points): click the line believed to contain the bug.
   - A wrong click reveals the correct line, earns 0 for this panel, and resets the streak. The player can still do the other panels.
2. Name the bug (50 points): choose the bug type from a dropdown (category and subtype, see section 5).
3. Explain it (0 points in v1): free-text box. After submitting, the puzzle's reference explanation is shown so the player can compare. The text is stored so a grader can be added later. Up to 150 points are reserved for a future grader.
4. Fix it (400 points): edit the code in the browser editor and run tests. Full points only if all tests pass.

Combo bonus: +100 if the player completes find, name, and fix correctly in the same round.

Maximum score per round before hints: 650 (100 + 50 + 400 + 100 combo).

Scoring rules (v1, basic):
- Score per round is the sum of the panel points plus the combo bonus, minus hint costs. Easy and Medium score the same.
- Hints: 2 per puzzle. Hint 1 costs 25 points, hint 2 costs 50 points, deducted from that puzzle's score, never below zero.
- Streak and accuracy are shown as stats but do not change the score. Streak: consecutive rounds where the find-the-line click was correct on the first click. Accuracy: percentage of rounds where the first click was correct.

Fix panel details:
- Unlimited test runs.
- 2 example tests are visible. The rest are hidden. After a run, the player sees only "hidden tests: X of Y passed", with no failure details.
- Each test run has a 10 second time limit. If it runs longer, it is stopped and the player sees "timed out".

Round timer: show a stopwatch of elapsed time for each round. There is no time limit and time does not affect the score. Save the completion time with the player's progress in localStorage. In v1 this data stays in the player's browser.

How puzzles are served in v1:
- The player picks a tier and gets a random puzzle they have not seen (tracked in the browser).
- When a tier is finished, show a completion message. Replays are allowed but do not extend the streak.

## 4. Difficulty

Difficulty is based on bug category and how far the player must trace the code to see why it is wrong.
- Easy: the bug is visible on its own line when read with the intent description. Plain mistakes such as wrong operator, wrong variable, simple boundary.
- Medium: the bug needs tracing through a loop or state, such as wrong initialization, wrong update, edge cases, shared mutable state.
- Intent text is shown on every puzzle. Easy gets one sentence plus an example input and output. Medium gets a short paragraph.

Reference: DebugBench reported that syntax and reference errors are generally easier than logic errors, which supports this rule.

## 5. Bug taxonomy (two levels)

Categories come from DebugBench (Syntax, Reference, Logic, Multiple). The subtypes below are a draft by Claude, not taken from a source. "Multiple" waits for multi-bug puzzles later.

- Syntax (use about 2 puzzles total as a gentle intro, because Python error messages point at the line): missing colon or bracket, bad indentation
- Reference: wrong variable, wrong method or attribute name, swapped arguments
- Logic: wrong operator, off-by-one, wrong boundary (< vs <=), inverted condition, wrong initial value, wrong loop update, missing or early return, unhandled edge case (empty, None, zero), shared mutable state, wrong string or type handling, wrong order of operations

Additional tag: `ai_style` (true or false) marks bugs typical of AI-written code. The list of AI-style bug types is not defined yet (see Open questions).

## 6. Puzzle data model

One JSON record per puzzle, stored in the project as files behind a small data-access layer, so storage can move to a database later without changing the UI.

Fields:
- id (stable, never reused)
- track (`find_bug` now, `optimize` reserved for later)
- language (`python`)
- difficulty (`easy`, `medium`)
- category, subtype
- title
- intent (what the code is supposed to do, plus an example input and output)
- code (buggy snippet)
- bug_line (line number)
- reference_explanation
- hints (2 items)
- fixed_code (reference fix)
- tests (Python assert snippets, first 2 are visible, rest hidden)
- source (`original`, `humaneval`, `mbpp`, `exercism`, `llm_injected`, and so on)
- source_url
- license
- license_status (`cleared`, `conditional`, `unknown`, `blocked`)
- commercial_ok (true or false)
- attribution_text (what must be shown to players)
- retrieved_at
- ai_style
- verified (true only after section 7 passes)

## 7. Puzzle creation and verification

Creating a puzzle from a source problem:
1. Start from a correct solution with tests, from a source with a clear license (section 8) or an original problem.
2. Inject one bug of a chosen category and subtype. The bug can be written by hand or by an LLM in a Claude Code session.
3. Write the intent text, 2 hints, and the reference explanation.

Required before a puzzle enters the public build (all must be true):
- Exactly one line differs between the buggy code and the original.
- At least one test fails on the buggy version.
- All tests pass on the original.
- A human spot-check confirms the bug matches its tagged category and subtype.

Only `verified: true` puzzles are included in the build. A script runs these checks locally with normal Python. A browser smoke test is added later, because Pyodide behavior has not been checked against local Python.

Batches: puzzles are generated in batches by the owner in Claude Code sessions, with no automated paid API calls for now. After launch, the verification script gates each new batch automatically and the owner spot-checks a random 20 percent. Before launch, the owner reviews every puzzle.

## 8. Content sources and licensing

Staging and public are separate:
- Staging database (private): everything collected, fully tagged, never shown to players.
- Public build: only puzzles whose license_status is `cleared`, or `conditional` with the conditions met.

Source status (license information below comes from dataset cards and repo READMEs read secondhand, so verify each source's LICENSE file before ingesting):
- HumanEval: dataset card lists MIT. Cleared after verification.
- MBPP: dataset card lists CC BY 4.0, which requires attribution. Cleared after verification, with attribution.
- Exercism Python track: repo README states MIT. Cleared after verification. Not checked whether individual exercises borrow from other sources.
- GeeksforGeeks: states it owns its content and allows personal or non-commercial use with attribution. Conditional. The live terms have not been read, and whether automated collection is allowed has not been checked.
- LeetCode: terms treat questions and solutions as LeetCode's property. Blocked. Do not copy its problems, tests, or solutions, and do not scrape it.
- CodingBat: one third-party page labels it CC BY-NC-ND, which would not allow modified versions. Unverified on its own site. Treat as unknown, do not use.
- QuixBugs and BugsInPy: license status not confirmed. BugsInPy bugs come from 17 open-source projects, each with its own license. Unknown until checked.
- Original problems and LLM-written problems: allowed. Do not copy problem text from the sources above.

Attribution display: each puzzle shows a small "Source" line after the round, and a credits page lists every source and its license.

If the project ever becomes commercial (ads, payments, company use), remove every puzzle where commercial_ok is false.

## 9. Technical approach

- Language: TypeScript
- App: Next.js
- Editor: Monaco
- Running Python: Pyodide in a Web Worker, 10 second limit per test run, so nothing from players runs on our servers
- Progress saving: browser localStorage
- Hosting: [SUGGESTED] Vercel. Free-tier limits have not been checked.
- Database and login (Supabase): deferred until accounts or a forum are added

Known trade-off: tests run in the browser, so a determined player can read the hidden tests and cheat. This is acceptable for practice, but must be revisited before any leaderboard, likely by moving test execution to a server-side sandbox.

## 10. Later tracks and features

- Explanation grading: an LLM grader returning none, related, or correct, using a stored per-puzzle rubric, treating player text as data, and rate limited. Costs and abuse risks have not been priced.
- Java: needs a server-side sandbox.
- Hard tier and multi-bug puzzles: show the player how many bugs exist, award find and bug-type points per bug, require all tests to pass for the fix, allow bugs plus one spare click, then reveal the rest with no points.
- Larger single-file programs, then multi-file codebases, with an overview of the program's purpose.
- Browse and choose puzzles by category and difficulty and points by difficulty.
- User-submitted bugs and a forum.
- Real bugs from repos, after license checks.

## 11. Efficiency track (later)

A separate track where the player makes working code more efficient. The `track` field is in the data model now. Everything else is deferred. Judging efficiency would need a different scoring method, and timing code in a browser can be noisy, which has not been tested.

## 12. Open questions

1. Scoring order: deferred with advanced scoring (section 2).
2. Can the bug-type dropdown be retried? Suggested: one attempt.
3. Timer: decided. Untimed stopwatch in v1 (section 3). Timed mode deferred.
4. Is the name "pestcontrol" available, including a domain? Not checked.
5. Read the live GeeksforGeeks terms and confirm whether automated collection is allowed.
6. Verify licenses for HumanEval, MBPP, and Exercism directly, and check QuixBugs and each BugsInPy project.
7. Define the `ai_style` bug types. Plan: read the taxonomy paper on bugs in LLM-generated code (arXiv 2407.06153) and propose a list for approval.
8. How many puzzles per subtype in the first 40.
9. Confirm hosting after checking free-tier limits.

## 13. Build order (v1)

Build one feature at a time. Each feature ends with something that runs and is checked before the next starts. The order puts the riskiest part (running Python in the browser with Pyodide) early, so problems show up before the other panels depend on it.

Foundation:
1. Puzzle data: puzzle type (section 6), data-access layer, one dev puzzle in JSON.
2. Puzzle page: show intent and buggy code in the Monaco editor.
3. Test runner for the app, and project commands written into CLAUDE.md.

Core round (section 3):
4. Run Python: Pyodide in a Web Worker, 10 second limit per test run.
5. Fix it panel: run visible and hidden tests, show "hidden tests: X of Y passed". First playable version.
6. Find the line panel.
7. Name the bug panel (needs open question 2).
8. Explain it panel.
9. Scoring (basic, section 3): panel points, combo, hint costs, streak and accuracy stats.

Game flow:
10. Progress in localStorage, random unseen puzzle per tier, tier-complete message.

Content and launch:
11. Verification script (section 7). Needs Python installed locally.
12. Source line after each round and a credits page (section 8).
13. Public build filter: only verified puzzles that are cleared, or conditional with conditions met.
14. Puzzle batches up to 40 (section 2). Needs a license decision for original puzzles.
15. Deploy (needs open question 9).

This order was proposed by Claude and chosen by the owner on 2026-11-02. It can change. Update this section when it does.