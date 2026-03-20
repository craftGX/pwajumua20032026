"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Entry = { date: string; count: number }; // date = "YYYY-MM-DD"

type FridayStat = {
  date: string; // "2026-03-20"
  label: string; // "20/03"
  count: number;
};

type ModalState =
  | { type: "none" }
  | { type: "delete"; friday: FridayStat }
  | { type: "edit"; friday: FridayStat; newValue: string };

export default function StatsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedFriday, setSelectedFriday] = useState<FridayStat | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]); // "YYYY-MM-DD"

  // Mois affiché (pour stats + calendrier)
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth()); // 0-11

  // 1) Charger les salawat depuis localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const data: Entry[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (!key.startsWith("salawat-")) continue;

      const dateKey = key.replace("salawat-", ""); // "YYYY-MM-DD"
      const raw = localStorage.getItem(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (!isNaN(count)) {
        data.push({ date: dateKey, count });
      }
    }

    data.sort((a, b) => (a.date < b.date ? -1 : 1));
    setEntries(data);
  }, []);

  // 2) Stats (mois sélectionné + vendredis)
  const { totalThisMonth, monthLabel, lastFiveFridays, fridaysCurrentMonth } = useMemo(() => {
    const monthLabel = formatMonthLabelFromYearMonth(viewYear, viewMonth);
    if (entries.length === 0) {
      return {
        totalThisMonth: 0,
        monthLabel,
        lastFiveFridays: [] as FridayStat[],
        fridaysCurrentMonth: [] as FridayStat[],
      };
    }

    const currentMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`; // "YYYY-MM"
    let totalMonth = 0;

    for (const e of entries) {
      if (e.date.slice(0, 7) === currentMonthKey) {
        totalMonth += e.count;
      }
    }

    const allFridays: FridayStat[] = entries
      .filter((e) => isFridayKey(e.date))
      .map((e) => ({
        date: e.date,
        label: formatDayLabelFromKey(e.date),
        count: e.count,
      }));

    const lastFive = [...allFridays]
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .slice(0, 5)
      .reverse();

    const fridaysCurrentMonth = allFridays.filter((f) => f.date.slice(0, 7) === currentMonthKey);

    return {
      totalThisMonth: totalMonth,
      monthLabel,
      lastFiveFridays: lastFive,
      fridaysCurrentMonth,
    };
  }, [entries, viewYear, viewMonth]);

  // 3) Calendrier du mois sélectionné (lundi -> dimanche)
  const calendarDays = useMemo(() => {
    const year = viewYear;
    const month = viewMonth;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // 0 = dimanche, 1 = lundi, ..., 6 = samedi (local)
    const rawWeekday = firstDayOfMonth.getDay();
    // On veut lundi = 0, ..., dimanche = 6
    const startWeekday = (rawWeekday + 6) % 7;

    const days: {
      dateKey: string; // "YYYY-MM-DD"
      day: number;
      isFriday: boolean;
      count: number;
    }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = toDateKey(d); // "YYYY-MM-DD"
      const weekday = d.getDay(); // 0..6 local
      const isFri = weekday === 5;
      const entry = entries.find((e) => e.date === dateKey);

      days.push({
        dateKey,
        day,
        isFriday: isFri,
        count: entry?.count || 0,
      });
    }

    return { startWeekday, days };
  }, [entries, viewYear, viewMonth]);

  // 4) Clic sur date du calendrier
  const handleSelectDate = (dateKey: string) => {
    if (!isFridayKey(dateKey)) {
      setSelectedFriday(null);
      setIsCalendarModalOpen(false);
      return;
    }
    const entry = entries.find((e) => e.date === dateKey);
    const stat: FridayStat = {
      date: dateKey,
      label: formatDayLabelFromKey(dateKey),
      count: entry?.count || 0,
    };
    setSelectedFriday(stat);
    setIsCalendarModalOpen(true);
  };

  const closeCalendarModal = () => setIsCalendarModalOpen(false);

  // 5) Modals édition / suppression (résumé du mois)
  const openEditModal = (friday: FridayStat) => {
    setModalState({ type: "edit", friday, newValue: String(friday.count) });
  };

  const openDeleteModal = (friday: FridayStat) => {
    setModalState({ type: "delete", friday });
  };

  const closeActionModal = () => setModalState({ type: "none" });

  const applyEdit = () => {
    if (modalState.type !== "edit") return;
    const { friday, newValue } = modalState;
    const parsed = parseInt(newValue, 10);
    if (isNaN(parsed) || parsed < 0) return;

    if (typeof window !== "undefined") {
      localStorage.setItem(`salawat-${friday.date}`, String(parsed));
    }
    setEntries((prev) => prev.map((e) => (e.date === friday.date ? { ...e, count: parsed } : e)));
    setModalState({ type: "none" });
  };

  const applyDelete = () => {
    if (modalState.type !== "delete") return;
    const { friday } = modalState;

    if (typeof window !== "undefined") {
      localStorage.removeItem(`salawat-${friday.date}`);
    }
    setEntries((prev) => prev.filter((e) => e.date !== friday.date));
    setModalState({ type: "none" });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 sm:p-10">
      {/* Sélecteur mois / année */}
      <div className="mx-auto mb-4 flex max-w-4xl flex-wrap items-center justify-center gap-3">
        <select
          value={viewMonth}
          onChange={(e) => setViewMonth(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value={0}>Janvier</option>
          <option value={1}>Février</option>
          <option value={2}>Mars</option>
          <option value={3}>Avril</option>
          <option value={4}>Mai</option>
          <option value={5}>Juin</option>
          <option value={6}>Juillet</option>
          <option value={7}>Août</option>
          <option value={8}>Septembre</option>
          <option value={9}>Octobre</option>
          <option value={10}>Novembre</option>
          <option value={11}>Décembre</option>
        </select>

        <input
          type="number"
          value={viewYear}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v) && v > 0) setViewYear(v);
          }}
          className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center text-3xl font-bold"
      >
        Statistiques Salawat
      </motion.h1>

      {/* Résumé du mois + vendredis (blocs logiques) */}
      <section className="mx-auto mb-8 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Résumé du mois ({monthLabel})</h2>
        <p className="text-sm text-slate-600">Total de salawat enregistrées ce mois-ci :</p>
        <p className="mt-2 text-3xl font-bold text-blue-600">
          {totalThisMonth.toLocaleString("fr-FR")}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Données depuis{" "}
          <code className="rounded bg-slate-100 px-1">localStorage (salawat-YYYY-MM-DD)</code>.
        </p>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Vendredis de ce mois (blocs logiques)
          </h3>
          {fridaysCurrentMonth.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun vendredi enregistré pour ce mois.</p>
          ) : (
            <ul className="space-y-2">
              {fridaysCurrentMonth.map((f) => (
                <li
                  key={f.date}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-800">Vendredi {f.label}</div>
                    <div className="text-xs text-slate-500">
                      Bloc logique = toutes les sessions de ce vendredi
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mr-3 font-semibold text-blue-600">
                      {f.count.toLocaleString("fr-FR")} salawat
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(f)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(f)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        {/* 5 derniers vendredis */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">5 derniers vendredis</h2>

          {lastFiveFridays.length === 0 ? (
            <p className="text-sm text-slate-500">
              Pas encore de données de vendredi enregistrées.
            </p>
          ) : (
            <ul className="space-y-2">
              {lastFiveFridays.map((f) => (
                <li
                  key={f.date}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2 text-sm"
                >
                  <span className="font-medium text-slate-700">{f.label}</span>
                  <span className="font-semibold text-blue-600">
                    {f.count.toLocaleString("fr-FR")} salawat
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Calendrier + modal récap */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Calendrier du mois (clique un vendredi)
          </h2>

          {/* Ligne des jours (lundi -> dimanche) */}
          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-slate-500">
            <span>Lu</span>
            <span>Ma</span>
            <span>Me</span>
            <span>Je</span>
            <span>Ve</span>
            <span>Sa</span>
            <span>Di</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: calendarDays.startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.days.map((d) => {
              const isFridayDay = d.isFriday;
              return (
                <button
                  key={d.dateKey}
                  type="button"
                  onClick={() => handleSelectDate(d.dateKey)}
                  className={[
                    "flex h-10 flex-col items-center justify-center rounded-md border text-[11px]",
                    isFridayDay
                      ? "cursor-pointer border-blue-400 bg-blue-50/80 text-blue-700 hover:bg-blue-100"
                      : "cursor-default border-slate-200 bg-slate-50 text-slate-700",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="font-medium">{d.day}</span>
                  {d.count > 0 && (
                    <span className="mt-0.5 text-[10px] text-blue-600">{d.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* MODAL RECAP VENDREDI (calendrier) */}
      {isCalendarModalOpen && selectedFriday && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Récap du vendredi {selectedFriday.label}
            </h3>

            <p className="text-sm text-slate-600">
              Nombre total de salawat enregistrées ce jour-là :
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-600">
              {selectedFriday.count.toLocaleString("fr-FR")}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeCalendarModal}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / DELETE */}
      {modalState.type === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Modifier le vendredi {modalState.friday.label}
            </h3>
            <p className="text-sm text-slate-600">
              Nouveau total de salawat pour ce vendredi (bloc logique) :
            </p>
            <input
              type="number"
              min={0}
              value={modalState.newValue}
              onChange={(e) =>
                setModalState((prev) =>
                  prev.type === "edit" ? { ...prev, newValue: e.target.value } : prev,
                )
              }
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeActionModal}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={applyEdit}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.type === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Supprimer ce vendredi ?</h3>
            <p className="text-sm text-slate-600">
              Tu vas supprimer le bloc logique du vendredi{" "}
              <span className="font-semibold">{modalState.friday.label}</span> (toutes les sessions
              de ce jour).
            </p>
            <p className="mt-3 text-sm text-red-600">Cette action ne peut pas être annulée.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeActionModal}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={applyDelete}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ===== Helpers dates SANS ISO ===== */

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isFridayKey(dateKey: string): boolean {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  return date.getDay() === 5;
}

function formatDayLabelFromKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatMonthLabelFromYearMonth(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}
