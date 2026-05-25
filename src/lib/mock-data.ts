import { Conversation, ErrorLog, Learner, Message } from "@/lib/types";

export const kpis = [
  { label: "Total Registered Learners", value: "8,412", trend: "+8.4%" },
  { label: "Daily Active Learners", value: "2,198", trend: "+4.1%" },
  { label: "Weekly Active Learners", value: "5,902", trend: "+6.0%" },
  { label: "Total Questions Asked", value: "126,340", trend: "+12.8%" },
  { label: "Avg Questions / Learner", value: "15.0", trend: "+2.6%" },
  { label: "Onboarding Completion", value: "81.2%", trend: "+1.2%" },
  { label: "Current Active Streaks", value: "1,067", trend: "+7.3%" },
  { label: "Fallback / Error Rate", value: "3.9%", trend: "-0.8%" },
  { label: "Flagged Conversations", value: "73", trend: "-6.7%" }
];

export const dailyActivity = [
  { day: "Mon", learners: 1822, questions: 9075, retention: 72 },
  { day: "Tue", learners: 1920, questions: 9460, retention: 73 },
  { day: "Wed", learners: 2028, questions: 9831, retention: 74 },
  { day: "Thu", learners: 2090, questions: 10110, retention: 75 },
  { day: "Fri", learners: 2198, questions: 10673, retention: 76 },
  { day: "Sat", learners: 1675, questions: 7362, retention: 72 },
  { day: "Sun", learners: 1542, questions: 6884, retention: 70 }
];

export const subjectUsage = [
  { name: "English", value: 32 },
  { name: "Mathematics", value: 29 },
  { name: "Physical Sciences", value: 21 },
  { name: "Life Sciences", value: 16 },
  { name: "Accounting", value: 12 },
  { name: "Geography", value: 10 },
  { name: "History", value: 8 },
  { name: "Economics", value: 7 }
];

export const languageUsage = [
  { name: "English", value: 40 },
  { name: "isiZulu", value: 14 },
  { name: "isiXhosa", value: 11 },
  { name: "Afrikaans", value: 9 },
  { name: "Sesotho", value: 7 },
  { name: "Setswana", value: 6 },
  { name: "Sepedi", value: 4 },
  { name: "Xitsonga", value: 3 },
  { name: "Tshivenda", value: 2 },
  { name: "siSwati", value: 2 },
  { name: "isiNdebele", value: 1 },
  { name: "Swahili", value: 1 }
];

export const learners: Learner[] = [
  {
    id: "l1",
    name: "Ayanda Khumalo",
    grade: "Grade 10",
    school: "Soweto High School",
    curriculum: "CAPS",
    preferredLanguage: "isiZulu",
    subjects: ["Mathematics", "Physical Sciences"],
    totalQuestionsAsked: 412,
    buddyPoints: 1030,
    currentStreak: 15,
    lastActiveDate: "2026-05-06",
    status: "active"
  },
  {
    id: "l2",
    name: "Naledi Mokoena",
    grade: "Grade 8",
    school: "Pretoria Girls School",
    curriculum: "CAPS",
    preferredLanguage: "English",
    subjects: ["English", "History", "Geography"],
    totalQuestionsAsked: 177,
    buddyPoints: 652,
    currentStreak: 4,
    lastActiveDate: "2026-05-05",
    status: "needs support"
  },
  {
    id: "l3",
    name: "Liyema Jacobs",
    grade: "Grade 11",
    school: "Rondebosch Secondary",
    curriculum: "CAPS",
    preferredLanguage: "Afrikaans",
    subjects: ["Accounting", "Economics", "Mathematics"],
    totalQuestionsAsked: 364,
    buddyPoints: 910,
    currentStreak: 9,
    lastActiveDate: "2026-05-04",
    status: "needs support"
  },
  {
    id: "l4",
    name: "Thato Dlamini",
    grade: "Grade 6",
    school: "Ekurhuleni Primary",
    curriculum: "CAPS",
    preferredLanguage: "Setswana",
    subjects: ["Mathematics", "Natural Sciences"],
    totalQuestionsAsked: 89,
    buddyPoints: 340,
    currentStreak: 0,
    lastActiveDate: "2026-04-19",
    status: "inactive"
  }
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    learnerId: "l1",
    learnerName: "Ayanda Khumalo",
    subject: "Mathematics",
    language: "isiZulu",
    date: "2026-05-06",
    flagged: false,
    fallback: false,
    reviewed: true,
    snippet: "Ngicela usizo nge-quadratic equations."
  },
  {
    id: "c2",
    learnerId: "l2",
    learnerName: "Naledi Mokoena",
    subject: "English",
    language: "English",
    date: "2026-05-05",
    flagged: true,
    fallback: true,
    reviewed: false,
    snippet: "I keep getting confused by figurative language."
  },
  {
    id: "c3",
    learnerId: "l3",
    learnerName: "Liyema Jacobs",
    subject: "Accounting",
    language: "Afrikaans",
    date: "2026-05-04",
    flagged: true,
    fallback: false,
    reviewed: false,
    snippet: "Hoe werk debiteure in die grootboek?"
  }
];

export const messages: Message[] = [
  {
    id: "m1",
    conversationId: "c1",
    sender: "learner",
    content: "Ngicela usizo nge-quadratic equations.",
    timestamp: "14:01"
  },
  {
    id: "m2",
    conversationId: "c1",
    sender: "buddyai",
    content: "Sizoxazulula kancane kancane: ax^2 + bx + c = 0.",
    timestamp: "14:02",
    metadata: { topic: "Quadratics", difficulty: "Medium", confidence: 0.94 }
  },
  {
    id: "m3",
    conversationId: "c2",
    sender: "learner",
    content: "What does personification mean again?",
    timestamp: "18:20"
  },
  {
    id: "m4",
    conversationId: "c2",
    sender: "buddyai",
    content: "I am not fully sure. Let me give a generic explanation.",
    timestamp: "18:21",
    metadata: {
      topic: "Poetry",
      difficulty: "Easy",
      confidence: 0.52,
      usedFallback: true
    }
  },
  {
    id: "m5",
    conversationId: "c3",
    sender: "learner",
    content: "Hoe werk debiteure in die grootboek?",
    timestamp: "09:14"
  },
  {
    id: "m6",
    conversationId: "c3",
    sender: "buddyai",
    content:
      "Debiteure is 'n rekening wat wys hoeveel kliënte jou skuld. Dit verskyn aan die debietkant van die grootboek.",
    timestamp: "09:15",
    metadata: { topic: "Debtors", difficulty: "Medium", confidence: 0.88 }
  }
];

export const errorLogs: ErrorLog[] = [
  {
    id: "e1",
    conversationId: "c2",
    learner: "Naledi Mokoena",
    timestamp: "2026-05-05 18:21",
    errorType: "Fallback response",
    snippet: "Low confidence in figurative language answer",
    status: "new",
    assignedStaff: "Unassigned",
    internalNotes: "Review curriculum alignment."
  },
  {
    id: "e2",
    conversationId: "c3",
    learner: "Liyema Jacobs",
    timestamp: "2026-05-04 11:09",
    errorType: "Repeated learner confusion",
    snippet: "Debtors ledger flow repeatedly misunderstood",
    status: "in review",
    assignedStaff: "I. Rana",
    internalNotes: "Add simpler bilingual walkthrough."
  }
];

export type OverviewPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "3-months"
  | "1-year"
  | "all-time";

type OverviewKpi = {
  label: string;
  value: string;
  trend: string;
};

type OverviewPeriodData = {
  kpis: OverviewKpi[];
  activity: { day: string; learners: number; questions: number; retention: number }[];
};

const buildKpis = (values: string[], trends: string[]): OverviewKpi[] => [
  { label: "Total Registered Learners", value: values[0], trend: trends[0] },
  { label: "Daily Active Learners", value: values[1], trend: trends[1] },
  { label: "Weekly Active Learners", value: values[2], trend: trends[2] },
  { label: "Total Questions Asked", value: values[3], trend: trends[3] },
  { label: "Avg Questions / Learner", value: values[4], trend: trends[4] },
  { label: "Onboarding Completion", value: values[5], trend: trends[5] },
  { label: "Current Active Streaks", value: values[6], trend: trends[6] },
  { label: "Fallback / Error Rate", value: values[7], trend: trends[7] },
  { label: "Flagged Conversations", value: values[8], trend: trends[8] }
];

export const overviewByPeriod: Record<OverviewPeriod, OverviewPeriodData> = {
  daily: {
    // Intentionally lower, realistic one-day snapshot.
    kpis: buildKpis(
      ["8,412", "1,284", "4,932", "4,260", "3.3", "82.0%", "812", "3.7%", "12"],
      ["+0.1%", "+0.8%", "+0.3%", "+1.6%", "+0.2%", "+0.3%", "+0.4%", "-0.2%", "-1.1%"]
    ),
    activity: [
      { day: "00:00", learners: 84, questions: 210, retention: 72 },
      { day: "04:00", learners: 62, questions: 140, retention: 71 },
      { day: "08:00", learners: 244, questions: 650, retention: 74 },
      { day: "12:00", learners: 372, questions: 1210, retention: 76 },
      { day: "16:00", learners: 338, questions: 1160, retention: 75 },
      { day: "20:00", learners: 184, questions: 650, retention: 73 },
      { day: "23:00", learners: 91, questions: 240, retention: 72 }
    ]
  },
  weekly: {
    kpis,
    activity: dailyActivity
  },
  monthly: {
    kpis: buildKpis(
      ["8,412", "2,038", "5,940", "39,182", "14.7", "81.2%", "1,040", "3.9%", "53"],
      ["+1.9%", "+2.3%", "+3.2%", "+7.4%", "+1.5%", "+1.1%", "+3.1%", "-0.6%", "-4.8%"]
    ),
    activity: [
      { day: "W1", learners: 1898, questions: 36451, retention: 74 },
      { day: "W2", learners: 1963, questions: 37202, retention: 75 },
      { day: "W3", learners: 2015, questions: 38560, retention: 76 },
      { day: "W4", learners: 2038, questions: 39182, retention: 76 }
    ]
  },
  "3-months": {
    kpis: buildKpis(
      ["8,412", "1,944", "5,812", "112,420", "40.2", "79.8%", "987", "4.2%", "146"],
      ["+4.2%", "+4.4%", "+5.8%", "+9.1%", "+3.9%", "+2.4%", "+6.3%", "-1.0%", "-9.7%"]
    ),
    activity: [
      { day: "M1", learners: 1831, questions: 35420, retention: 73 },
      { day: "M2", learners: 1903, questions: 37680, retention: 74 },
      { day: "M3", learners: 1944, questions: 39320, retention: 75 }
    ]
  },
  "1-year": {
    kpis: buildKpis(
      ["8,412", "1,826", "5,677", "428,620", "154.0", "76.9%", "904", "4.6%", "602"],
      ["+12.0%", "+9.8%", "+11.5%", "+18.4%", "+8.7%", "+5.2%", "+12.9%", "-1.8%", "-14.6%"]
    ),
    activity: [
      { day: "Q1", learners: 1680, questions: 92144, retention: 69 },
      { day: "Q2", learners: 1755, questions: 101880, retention: 72 },
      { day: "Q3", learners: 1810, questions: 112176, retention: 74 },
      { day: "Q4", learners: 1826, questions: 122420, retention: 75 }
    ]
  },
  "all-time": {
    kpis: buildKpis(
      ["8,412", "2,198", "5,902", "126,340", "15.0", "81.2%", "1,067", "3.9%", "73"],
      ["+8.4%", "+4.1%", "+6.0%", "+12.8%", "+2.6%", "+1.2%", "+7.3%", "-0.8%", "-6.7%"]
    ),
    activity: dailyActivity
  }
};
