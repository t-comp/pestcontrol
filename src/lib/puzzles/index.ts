import type { Difficulty, Puzzle, PuzzleView } from "./types";
import { validatePuzzle } from "./validate";

// To add a puzzle: add one import line and one entry in `rawPuzzles`.
import py0001 from "../../../content/puzzles/py-0001.json";

const rawPuzzles: unknown[] = [py0001];

function loadPuzzles(): Puzzle[] {
  const puzzles = rawPuzzles.map(validatePuzzle);
  const seen = new Set<string>();
  for (const p of puzzles) {
    if (seen.has(p.id)) throw new Error(`Duplicate puzzle id: ${p.id}`);
    seen.add(p.id);
  }
  return puzzles.sort((a, b) => a.id.localeCompare(b.id));
}

const puzzles = loadPuzzles();

export function listPuzzles(): Puzzle[] {
  return puzzles;
}

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}

// The first 2 tests are shown to the player.
export function visibleTests(p: Puzzle): string[] {
  return p.tests.slice(0, 2);
}

// The rest run only when the player submits.
export function hiddenTests(p: Puzzle): string[] {
  return p.tests.slice(2);
}

// Copies the 4 fields explicitly (no spread) so new Puzzle fields cannot leak to the browser.
export function toPuzzleView(p: Puzzle): PuzzleView {
  return {
    title: p.title,
    difficulty: p.difficulty,
    intent: p.intent,
    code: p.code,
  };
}

const TIER_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
};

export function tierLabel(d: Difficulty): string {
  return TIER_LABELS[d];
}
