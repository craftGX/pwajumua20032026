import { openDB } from "idb";

interface SalawatEntry {
  id: string;
  date: string; // ISO
  count: number;
  isFriday: boolean;
}

export const dbPromise = openDB("salawatDB", 1, {
  upgrade(db) {
    const store = db.createObjectStore("salawat", { keyPath: "id" });
    store.index("date");
  },
});

export async function getSalawat(date: string): Promise<SalawatEntry | undefined> {
  const db = await dbPromise;
  return db.get("salawat", date);
}

export async function addSalawat(entry: SalawatEntry) {
  const db = await dbPromise;
  await db.put("salawat", entry);
}

export async function getAllSalawat(): Promise<SalawatEntry[]> {
  const db = await dbPromise;
  return db.getAll("salawat");
}

export async function incrementSalawat(date: string) {
  const existing = await getSalawat(date);
  const newCount = (existing?.count || 0) + 1;
  const entry: SalawatEntry = {
    id: date,
    date,
    count: newCount,
    isFriday: new Date(date).getDay() === 5,
  };
  await addSalawat(entry);
  return newCount;
}
