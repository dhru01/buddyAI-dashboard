export const ISSUE_QUEUE_STAFF = ["D. Mistry", "I. Rana", "T. Mabuba"] as const;

export type IssueQueueStaffName = (typeof ISSUE_QUEUE_STAFF)[number];

export const UNASSIGNED_STAFF = "Unassigned";

export function isIssueQueueStaffName(value: string): value is IssueQueueStaffName {
  return (ISSUE_QUEUE_STAFF as readonly string[]).includes(value);
}
