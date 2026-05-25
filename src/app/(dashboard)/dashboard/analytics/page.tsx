import { Card } from "@/components/ui/card";
import { formatLastActiveDisplay } from "@/lib/date-display";
import { dailyActivity, learners } from "@/lib/mock-data";
import { LineChartCard } from "@/components/charts/chart-card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Engagement Analytics</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          "Daily Active Learners: 2,198",
          "Weekly Active Learners: 5,902",
          "Monthly Active Learners: 7,614",
          "Avg Session Length: 12m 32s",
          "Returning Learner Rate: 76%"
        ].map((text) => (
          <Card key={text}>{text}</Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard title="Retention Trend" data={dailyActivity} dataKey="retention" />
        <LineChartCard
          title="Questions Volume"
          data={dailyActivity}
          dataKey="questions"
        />
      </div>
      <Card>
        <h3 className="mb-2 font-semibold">Learners at Risk</h3>
        {learners
          .filter((l) => l.status !== "active")
          .map((l) => (
            <p key={l.id} className="text-sm">
              {l.name} - {l.status} - Last active {formatLastActiveDisplay(l.lastActiveDate)}
            </p>
          ))}
      </Card>
    </div>
  );
}
