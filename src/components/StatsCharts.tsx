"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalawatEntry {
  id: string;
  count: number;
  isFriday: boolean;
  date: string;
}

async function getAllSalawat(): Promise<SalawatEntry[]> {
  return [];
}

const cardAnim = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 700,
    easing: "easeOutQuart",
  },
  plugins: {
    legend: {
      labels: {
        boxWidth: 12,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        autoSkip: true,
      },
    },
  },
};

export default function StatsCharts() {
  const [data, setData] = useState<SalawatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSalawat().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const lastFridays = data
    .filter((d) => d.isFriday)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .reverse();

  const monthlyRecap = data.reduce(
    (acc, d) => {
      const month = new Date(d.date).toLocaleDateString("fr", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + d.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = {
    labels: Object.keys(monthlyRecap),
    datasets: [
      {
        label: "Salawat Mois",
        data: Object.values(monthlyRecap),
        backgroundColor: "#2AA9FF",
        borderRadius: 10,
        barThickness: 28,
      },
    ],
  };

  const fridayCompareData = {
    labels: lastFridays.map((d) =>
      new Date(d.date).toLocaleDateString("fr", {
        day: "numeric",
        month: "short",
      }),
    ),
    datasets: [
      {
        label: "5 derniers Vendredis",
        data: lastFridays.map((d) => d.count),
        backgroundColor: "#7AD7FF",
        borderRadius: 10,
        barThickness: 28,
      },
    ],
  };

  const btnBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none whitespace-nowrap";

  const btnPrimary =
    "bg-blue-600 text-white shadow-sm hover:bg-blue-500 hover:scale-[1.03] hover:shadow-md";

  const btnDanger =
    "bg-rose-600 text-white shadow-sm hover:bg-rose-500 hover:scale-[1.03] hover:shadow-md";

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={cardAnim}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-3xl border border-blue-500/20 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Récap Mois</h2>
          <button className={`${btnBase} ${btnPrimary}`}>Ajouter</button>
        </div>

        {loading ? (
          <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-100 sm:h-80" />
        ) : Object.keys(monthlyRecap).length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 sm:h-80">
            Aucune donnée disponible pour le moment.
          </div>
        ) : (
          <div className="h-72 w-full overflow-hidden sm:h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button className={`${btnBase} ${btnPrimary}`}>Modifier</button>
          <button className={`${btnBase} ${btnDanger}`}>Supprimer</button>
        </div>
      </motion.div>

      <motion.div
        variants={cardAnim}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.35, delay: 0.08 }}
        className="overflow-hidden rounded-3xl border border-blue-500/20 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Comparatif 5 Vendredis</h2>
          <button className={`${btnBase} ${btnPrimary}`}>Filtrer</button>
        </div>

        {loading ? (
          <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-100 sm:h-80" />
        ) : lastFridays.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 sm:h-80">
            Aucun vendredi enregistré.
          </div>
        ) : (
          <div className="h-72 w-full overflow-hidden sm:h-80">
            <Bar data={fridayCompareData} options={chartOptions} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button className={`${btnBase} ${btnPrimary}`}>Exporter</button>
          <button className={`${btnBase} ${btnDanger}`}>Supprimer</button>
        </div>
      </motion.div>
    </div>
  );
}
