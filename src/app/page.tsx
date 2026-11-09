import Link from "next/link";
import { listPuzzles } from "@/lib/puzzles";
import styles from "./page.module.css";

// Temporary dev entry point until feature 10.
export default function Home() {
  return (
    <main className={styles.main}>
      <h1>pestcontrol</h1>
      <ul className={styles.list}>
        {listPuzzles().map((p) => (
          <li key={p.id}>
            <Link href={`/puzzles/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
