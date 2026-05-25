"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChartCard, LineChartCard, PieChartCard } from "@/components/charts/chart-card";
import {
  languageUsage,
  overviewByPeriod,
  OverviewPeriod,
  subjectUsage
} from "@/lib/mock-data";

export default function OverviewPage() {
  const [period, setPeriod] = useState<OverviewPeriod>("daily");
  const periodData = useMemo(() => overviewByPeriod[period], [period]);

  const trendColor = (trend: string) => {
    if (trend.startsWith("+")) return "text-green-600";
    if (trend.startsWith("-")) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-sm text-foreground/65">
            Real-time monitoring for Buddy Learning learners and AI tutor performance.
          </p>
        </div>
        <select
          aria-label="Select stats time period"
          className="h-10 min-w-48 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
          value={period}
          onChange={(e) => setPeriod(e.target.value as OverviewPeriod)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="3-months">3 months</option>
          <option value="1-year">1 year</option>
          <option value="all-time">All time</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {periodData.kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-sm text-foreground/60">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
            <p className={`mt-1 text-xs font-medium ${trendColor(kpi.trend)}`}>
              {kpi.trend} vs last period
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard
          title="Daily Active Learners Over Time"
          data={periodData.activity}
          dataKey="learners"
        />
        <LineChartCard
          title="Question Volume Over Time"
          data={periodData.activity}
          dataKey="questions"
        />
        <BarChartCard title="Subject Usage Breakdown" data={subjectUsage} />
        <PieChartCard title="Language Usage Breakdown" data={languageUsage} />
      </div>
    </div>
  );
}
