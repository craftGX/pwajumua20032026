import Link from "next/link";
import Counter from "@/components/Counter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-slate-900 p-6">
      <Counter />

      <Link
        href="/stats"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Voir les stats du vendredi
      </Link>
    </main>
  );
}
