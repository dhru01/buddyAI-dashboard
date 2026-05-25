"use client";

import { notFound, useParams } from "next/navigation";
import { useLearners } from "@/context/learners-store";
import { LearnerProfileClient } from "./learner-profile-client";

export default function LearnerProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { learners } = useLearners();
  const learner = learners.find((item) => item.id === id);
  if (!learner) notFound();

  return <LearnerProfileClient learner={learner} />;
}
