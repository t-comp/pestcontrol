// Types for puzzles. Field names match SPEC.md section 6 and the JSON files.

export type Track = "find_bug" | "optimize";

export type Language = "python";

export type Difficulty = "easy" | "medium";

// "multiple" is deferred per SPEC.md section 5.
export type BugCategory = "syntax" | "reference" | "logic";

export type BugSubtype =
  | "missing_colon_or_bracket"
  | "bad_indentation"
  | "wrong_variable"
  | "wrong_method_or_attribute"
  | "swapped_arguments"
  | "wrong_operator"
  | "off_by_one"
  | "wrong_boundary"
  | "inverted_condition"
  | "wrong_initial_value"
  | "wrong_loop_update"
  | "missing_or_early_return"
  | "unhandled_edge_case"
  | "shared_mutable_state"
  | "wrong_string_or_type_handling"
  | "wrong_order_of_operations";

export type LicenseStatus = "cleared" | "conditional" | "unknown" | "blocked";

export interface Puzzle {
  id: string;
  track: Track;
  language: Language;
  difficulty: Difficulty;
  category: BugCategory;
  subtype: BugSubtype;
  title: string;
  intent: string;
  code: string;
  bug_line: number; // 1-based line number in `code`
  reference_explanation: string;
  hints: [string, string];
  fixed_code: string;
  tests: string[]; // first 2 are visible, the rest are hidden
  source: string;
  source_url: string | null;
  license: string;
  license_status: LicenseStatus;
  commercial_ok: boolean;
  attribution_text: string;
  retrieved_at: string; // YYYY-MM-DD
  ai_style: boolean;
  verified: boolean;
}

// The only puzzle fields the puzzle page may render or send to the browser.
export type PuzzleView = Pick<Puzzle, "title" | "difficulty" | "intent" | "code">;
