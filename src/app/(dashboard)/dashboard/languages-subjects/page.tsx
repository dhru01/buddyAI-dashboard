import { BarChartCard, PieChartCard } from "@/components/charts/chart-card";
import { Card } from "@/components/ui/card";
import { languageUsage, subjectUsage } from "@/lib/mock-data";

export default function LanguagesSubjectsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Language & Subject Breakdown</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard title="Questions by Subject" data={subjectUsage} />
        <PieChartCard title="Questions by Language" data={languageUsage} />
      </div>
      <Card>
        <h3 className="mb-2 font-semibold">Difficulty & Struggle Topics</h3>
        <p className="text-sm">Most struggle topics: Fractions, Debtors ledger, Essay thesis.</p>
        <p className="text-sm">Language-specific fallback rate: isiXhosa 4.8%, Setswana 4.1%.</p>
      </Card>
    </div>
  );
}
