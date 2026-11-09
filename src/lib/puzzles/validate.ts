import type { Puzzle } from "./types";

const TRACKS = ["find_bug", "optimize"];
const LANGUAGES = ["python"];
const DIFFICULTIES = ["easy", "medium"];
const CATEGORIES = ["syntax", "reference", "logic"];
const SUBTYPES = [
  "missing_colon_or_bracket",
  "bad_indentation",
  "wrong_variable",
  "wrong_method_or_attribute",
  "swapped_arguments",
  "wrong_operator",
  "off_by_one",
  "wrong_boundary",
  "inverted_condition",
  "wrong_initial_value",
  "wrong_loop_update",
  "missing_or_early_return",
  "unhandled_edge_case",
  "shared_mutable_state",
  "wrong_string_or_type_handling",
  "wrong_order_of_operations",
];
const LICENSE_STATUSES = ["cleared", "conditional", "unknown", "blocked"];

// Checks that raw JSON has every Puzzle field with the right type and value.
// Throws an Error naming the puzzle id and the bad field. Returns it as a Puzzle.
export function validatePuzzle(raw: unknown): Puzzle {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Puzzle (unknown id): must be an object");
  }
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === "string" && obj.id ? obj.id : "unknown id";

  const fail = (field: string, problem: string): never => {
    throw new Error(`Puzzle ${id}: field "${field}" ${problem}`);
  };

  const str = (field: string, nonEmpty: boolean): string => {
    const v = obj[field];
    if (typeof v !== "string") return fail(field, "must be a string");
    if (nonEmpty && v.trim() === "") return fail(field, "must not be empty");
    return v;
  };

  const bool = (field: string): boolean => {
    const v = obj[field];
    if (typeof v !== "boolean") return fail(field, "must be a boolean");
    return v;
  };

  const oneOf = (field: string, allowed: string[]): void => {
    const v = obj[field];
    if (typeof v !== "string" || !allowed.includes(v)) {
      fail(field, `must be one of: ${allowed.join(", ")}`);
    }
  };

  const strArray = (field: string): string[] => {
    const v = obj[field];
    if (!Array.isArray(v)) return fail(field, "must be an array");
    for (const item of v) {
      if (typeof item !== "string" || item.trim() === "") {
        return fail(field, "must contain only non-empty strings");
      }
    }
    return v as string[];
  };

  str("id", true);
  oneOf("track", TRACKS);
  oneOf("language", LANGUAGES);
  oneOf("difficulty", DIFFICULTIES);
  oneOf("category", CATEGORIES);
  oneOf("subtype", SUBTYPES);
  str("title", true);
  str("intent", true);
  const code = str("code", true);
  str("reference_explanation", true);
  str("fixed_code", true);

  const hints = strArray("hints");
  if (hints.length !== 2) fail("hints", "must have exactly 2 items");

  const tests = strArray("tests");
  if (tests.length < 2) fail("tests", "must have at least 2 items");

  const bugLine = obj.bug_line;
  const lineCount = code.split("\n").length;
  if (
    typeof bugLine !== "number" ||
    !Number.isInteger(bugLine) ||
    bugLine < 1 ||
    bugLine > lineCount
  ) {
    fail("bug_line", `must be an integer from 1 to ${lineCount}`);
  }

  str("source", true);
  if (obj.source_url !== null && typeof obj.source_url !== "string") {
    fail("source_url", "must be a string or null");
  }
  str("license", true);
  oneOf("license_status", LICENSE_STATUSES);
  bool("commercial_ok");
  str("attribution_text", true);

  const retrievedAt = str("retrieved_at", false);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(retrievedAt)) {
    fail("retrieved_at", "must look like YYYY-MM-DD");
  }

  bool("ai_style");
  bool("verified");

  return obj as unknown as Puzzle;
}
