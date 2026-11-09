import { notFound } from "next/navigation";
import { getPuzzle, listPuzzles, tierLabel, toPuzzleView } from "@/lib/puzzles";
import CodeViewer from "@/components/CodeViewer";
import styles from "./page.module.css";

// dynamicParams is not allowed with cacheComponents. This makes unknown ids wait
// for a static result, so notFound() below returns a real 404 status.
export const ensureStatic = "navigation";

// Reading params outside Suspense is intentional: it lets notFound() return a 404 status.
// That read trips two dev-only checks: the "URL data outside of Suspense" insight and the
// Cache Components static-shell check ("did not produce a static shell"). instant = false
// turns both off for this route. It does not change the build or ensureStatic.
export const instant = false;

export function generateStaticParams() {
  return listPuzzles().map((p) => ({ id: p.id }));
}

export default async function PuzzlePage(props: PageProps<"/puzzles/[id]">) {
  const { id } = await props.params;
  const puzzle = getPuzzle(id);
  if (!puzzle) notFound();
  const view = toPuzzleView(puzzle);

  return (
    <main className={styles.main}>
      <h1>{view.title}</h1>
      <p>Tier: {tierLabel(view.difficulty)}</p>
      <p>{view.intent}</p>
      <div className={styles.editor}>
        <CodeViewer code={view.code} />
      </div>
    </main>
  );
}
