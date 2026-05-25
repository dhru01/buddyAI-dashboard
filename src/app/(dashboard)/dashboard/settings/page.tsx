import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">System Configuration</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          "Supported Languages",
          "Supported Subjects",
          "Grade List",
          "Curriculum Options",
          "Badge Rules",
          "Points Rules",
          "Streak Rules",
          "Fallback Threshold Settings",
          "Admin User Management (placeholder)"
        ].map((item) => (
          <Card key={item} className="space-y-2">
            <h3 className="font-semibold">{item}</h3>
            <Input placeholder={`Update ${item.toLowerCase()}...`} />
            <Button variant="outline">Save</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
