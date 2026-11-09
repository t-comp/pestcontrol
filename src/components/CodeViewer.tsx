"use client";

import Editor, { loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useSyncExternalStore } from "react";
import type { PuzzleView } from "@/lib/puzzles/types";

const MONACO_VERSION = "0.55.1"; // must match monaco-editor in package.json

loader.config({
  paths: {
    vs: `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`,
  },
});

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  lineNumbers: "on",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function CodeViewer({ code }: { code: PuzzleView["code"] }) {
  const prefersDark = usePrefersDark();
  return (
    <Editor
      height="20rem"
      language="python"
      value={code}
      theme={prefersDark ? "vs-dark" : "vs"}
      options={EDITOR_OPTIONS}
      loading="Loading editor..."
    />
  );
}
