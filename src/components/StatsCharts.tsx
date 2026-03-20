"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalawatEntry {
  id: string;
  count: number;
  isFriday: boolean;
  date: string;
}

// Adapté/à adapter selon ta lib db
async function getAllSalawat(): Promise<SalawatEntry[]> {
  return [];
}

export default function StatsCharts() {
  const [data, setData] = useState<SalawatEntry[]>([]);

  useEffect(() => {
    getAllSalawat().then(setData);
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
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-8 p-8">
      <div className="rounded-3xl border border-blue-500/30 bg-white/80 p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">Récap Mois</h2>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
      <div className="rounded-3xl border border-blue-500/30 bg-white/80 p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">Comparatif 5 Vendredis</h2>
        <Bar data={fridayCompareData} options={{ responsive: true }} />
      </div>
    </div>
  );
}
