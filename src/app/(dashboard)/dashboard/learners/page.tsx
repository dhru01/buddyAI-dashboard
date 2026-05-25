"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LearnerAvatar } from "@/components/learners/learner-avatar";
import { SchoolTwoLine } from "@/components/learners/school-two-line";
import { DataTable } from "@/components/tables/data-table";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatLastActiveDisplay } from "@/lib/date-display";
import { formatGradeNumber } from "@/lib/grade-display";
import { abbreviateSubject, formatSubjectsAbbreviated } from "@/lib/subject-abbrev";
import { useLearners } from "@/context/learners-store";
import type { Learner } from "@/lib/types";

function includesInsensitive(haystack: string, needle: string): boolean {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return haystack.toLowerCase().includes(n);
}

function matchesGrade(learner: Learner, query: string): boolean {
  const n = query.trim().toLowerCase();
  if (!n) return true;
  return (
    formatGradeNumber(learner.grade).toLowerCase().includes(n) ||
    learner.grade.toLowerCase().includes(n)
  );
}

function matchesSubject(learner: Learner, query: string): boolean {
  const n = query.trim().toLowerCase();
  if (!n) return true;
  const abbrevLine = formatSubjectsAbbreviated(learner.subjects).toLowerCase();
  if (abbrevLine.includes(n)) return true;
  for (const s of learner.subjects) {
    if (s.toLowerCase().includes(n)) return true;
    if (abbreviateSubject(s).toLowerCase().includes(n)) return true;
  }
  return false;
}

export default function LearnersPage() {
  const { learners } = useLearners();
  const [nameQuery, setNameQuery] = useState("");
  const [gradeQuery, setGradeQuery] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");

  const filteredLearners = useMemo(
    () =>
      learners.filter((l) => {
        if (!includesInsensitive(l.name, nameQuery)) return false;
        if (!matchesGrade(l, gradeQuery)) return false;
        if (!includesInsensitive(l.school, schoolQuery)) return false;
        if (!includesInsensitive(l.preferredLanguage, languageQuery)) return false;
        if (!matchesSubject(l, subjectQuery)) return false;
        if (!includesInsensitive(l.status, statusQuery)) return false;
        return true;
      }),
    [learners, nameQuery, gradeQuery, schoolQuery, languageQuery, subjectQuery, statusQuery]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Learner Directory</h2>
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Input
          aria-label="Search by learner name"
          placeholder="Search learner..."
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
        />
        <Input
          aria-label="Filter by grade"
          placeholder="Filter by grade"
          value={gradeQuery}
          onChange={(e) => setGradeQuery(e.target.value)}
        />
        <Input
          aria-label="Filter by school"
          placeholder="Filter by school"
          value={schoolQuery}
          onChange={(e) => setSchoolQuery(e.target.value)}
        />
        <Input
          aria-label="Filter by language"
          placeholder="Filter by language"
          value={languageQuery}
          onChange={(e) => setLanguageQuery(e.target.value)}
        />
        <Input
          aria-label="Filter by subjects"
          placeholder="Filter by subjects"
          value={subjectQuery}
          onChange={(e) => setSubjectQuery(e.target.value)}
        />
        <Input
          aria-label="Filter by status"
          placeholder="Filter by status"
          value={statusQuery}
          onChange={(e) => setStatusQuery(e.target.value)}
        />
      </div>

      <DataTable
        title="Learners"
        centerAllColumns
        headers={[
          "Profile",
          "Learner name",
          "Grade",
          "School",
          "Curriculum",
          "Language",
          "Subjects",
          "Questions",
          "Buddy Points",
          "Streak",
          "Last Active",
          "Status"
        ]}
        rows={filteredLearners.map((l) => [
          <LearnerAvatar key={`${l.id}-avatar`} name={l.name} learnerId={l.id} avatarUrl={l.avatarUrl} />,
          <Link
            className="inline-block font-medium underline"
            href={`/dashboard/learners/${l.id}`}
            key={l.id}
          >
            {l.name}
          </Link>,
          formatGradeNumber(l.grade),
          <SchoolTwoLine key={`${l.id}-school`} name={l.school} />,
          l.curriculum,
          l.preferredLanguage,
          formatSubjectsAbbreviated(l.subjects),
          l.totalQuestionsAsked,
          l.buddyPoints,
          l.currentStreak,
          formatLastActiveDisplay(l.lastActiveDate),
          <StatusBadge key={`${l.id}-status`} status={l.status} />
        ])}
      />
    </div>
  );
}
