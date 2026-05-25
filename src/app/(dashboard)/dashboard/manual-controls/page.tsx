"use client";

import { FormEvent, useMemo, useState } from "react";
import { StaffControls } from "@/components/manual-controls/staff-controls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLearners } from "@/context/learners-store";
import { sendManualMessage } from "@/lib/manual-message";
import { toast } from "sonner";

export default function ManualControlsPage() {
  const { learners } = useLearners();
  const [selectedLearnerId, setSelectedLearnerId] = useState(() => learners[0]?.id ?? "");
  const [message, setMessage] = useState("");

  const selectedLearner = useMemo(
    () => learners.find((l) => l.id === selectedLearnerId),
    [learners, selectedLearnerId]
  );

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLearnerId) {
      toast.error("Select a learner first.");
      return;
    }
    await sendManualMessage({ learnerId: selectedLearnerId, message });
    toast.success("Manual message placeholder queued.");
    setMessage("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Manual Controls</h2>
      <StaffControls
        selectedLearnerId={selectedLearnerId}
        onSelectLearner={setSelectedLearnerId}
      />
      <Card>
        <h3 className="mb-3 font-semibold">Manual Message Placeholder</h3>
        <form onSubmit={onSend} className="grid gap-3 md:grid-cols-3">
          <Input
            value={selectedLearner?.name ?? ""}
            readOnly
            placeholder="Select a learner"
            aria-label="Selected learner"
          />
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to learner"
            className="md:col-span-2"
          />
          <Button type="submit" className="md:col-span-3">
            Send Message
          </Button>
        </form>
      </Card>
    </div>
  );
}
