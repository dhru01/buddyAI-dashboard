import { BarChartCard } from "@/components/charts/chart-card";
import { Card } from "@/components/ui/card";

const onboardingFunnel = [
  { name: "Started", value: 8412 },
  { name: "Name", value: 8340 },
  { name: "Grade", value: 8130 },
  { name: "Curriculum", value: 7988 },
  { name: "School", value: 7824 },
  { name: "Language", value: 7602 },
  { name: "Subjects", value: 7311 },
  { name: "Consent", value: 6892 },
  { name: "Fully Onboarded", value: 6832 }
];

export default function OnboardingPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Onboarding Metrics</h2>
      <BarChartCard title="Onboarding Funnel" data={onboardingFunnel} />
      <Card className="space-y-1 text-sm">
        <p>Drop-off points: Consent and Subject selection.</p>
        <p>Completion rate by grade: Grade 4-7 strongest, Grade 10-12 needs support.</p>
        <p>Average onboarding time: 7m 48s.</p>
        <p>Learners stuck in onboarding: 371.</p>
      </Card>
    </div>
  );
}
