"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

export function LineChartCard({
  title,
  data,
  dataKey
}: {
  title: string;
  data: Record<string, string | number>[];
  dataKey: string;
}) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#f7b500" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function BarChartCard({
  title,
  data
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  const abbreviation = (name: string) => name.slice(0, 3);

  const CustomBarTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: ReadonlyArray<{ value?: number | string }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-md border border-border bg-card p-3 text-sm shadow-soft">
        <p className="font-medium">{label}</p>
        <p className="text-primary">Learners: {payload[0]?.value}</p>
      </div>
    );
  };

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              tickMargin={10}
              tickFormatter={(value: string) => abbreviation(value)}
            />
            <YAxis
              label={{
                value: "Learners",
                angle: -90,
                position: "insideLeft",
                dx: -4,
                dy: 48
              }}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="value" fill="#f7b500" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function PieChartCard({
  title,
  data
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  const colors = [
    "#f7b500",
    "#ffbf1f",
    "#ffcf4d",
    "#ffd766",
    "#ffe08a",
    "#111111",
    "#3c3f45",
    "#565b61",
    "#737982",
    "#969ca3",
    "#bcc1c7",
    "#e2e5e9"
  ];
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-64 overflow-hidden">
        <div className="grid h-full w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-4 md:gap-2.5">
        {data.map((item, index) => {
          const percentage = total ? ((item.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div
              key={item.name}
              className="flex h-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs font-semibold text-foreground">{item.name}</span>
              </div>
              <div className="text-right leading-tight">
                <p className="text-[11px] font-bold text-foreground">{percentage}%</p>
                <p className="text-[11px] text-gray-400">{item.value} learners</p>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </Card>
  );
}
