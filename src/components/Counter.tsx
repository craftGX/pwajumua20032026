"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Repeat2 } from "lucide-react";

const SALAWAT_FORMULES = [
  // Formule courte générale (Coran 33:56 comme base)[web:102]
  "اللهم صلِّ على محمدٍ وعلى آل محمدٍ",

  // Formule spécifique rapportée : “Ton serviteur, Ton Prophète et Ton Messager, le Prophète illettré”[web:108][web:105]
  "اللهم صلِّ على محمدٍ عبدِك ورسولِك ونبيِّك الأمي",

  // Salât Ibrâhîmiyya complète, rapportée dans le hadith authentique (al-Boukhari, Mouslim)[web:106][web:109]
  "اللهم صلِّ على محمدٍ وعلى آل محمدٍ كما صلَّيتَ على إبراهيمَ وعلى آل إبراهيمَ إنك حميدٌ مجيد، اللهم بارِك على محمدٍ وعلى آل محمدٍ كما باركتَ على إبراهيمَ وعلى آل إبراهيمَ إنك حميدٌ مجيد",
];

export default function Counter() {
  const [count, setCount] = useState(0);
  const [formuleIndex, setFormuleIndex] = useState(0);
  const [today] = useState(() => new Date().toISOString().split("T")[0]);
  const isFriday = new Date().getDay() === 5;

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`salawat-${today}`) : null;
    if (saved) setCount(parseInt(saved, 10));
  }, [today]);

  const handleIncrement = () => {
    setCount((c) => {
      const n = c + 1;
      if (typeof window !== "undefined") {
        localStorage.setItem(`salawat-${today}`, String(n));
      }
      return n;
    });
  };

  const handleNextFormule = () => {
    setFormuleIndex((i) => (i + 1) % SALAWAT_FORMULES.length);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-5xl">ﷺ</div>
        <p className="mt-2 text-sm text-slate-500">Compteur de salawat (spécial vendredi)</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={formuleIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="max-w-md rounded-2xl bg-slate-50 p-4 text-center text-slate-800 ring-1 ring-slate-200"
        >
          {SALAWAT_FORMULES[formuleIndex]}
        </motion.div>
      </AnimatePresence>

      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-5xl font-bold tracking-tight text-blue-600"
      >
        {count.toLocaleString("fr-FR")}
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleIncrement}
          className="flex items-center justify-center gap-2 rounded-full bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
          +1 salawat
        </button>

        <button
          onClick={handleNextFormule}
          className="flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Repeat2 className="h-4 w-4" />
          Changer de formule
        </button>
      </div>

      {isFriday && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
        >
          Aujourd&apos;hui c&apos;est vendredi : multiplie les salawat, surtout entre Asr et
          Maghreb.
        </motion.div>
      )}
    </div>
  );
}
