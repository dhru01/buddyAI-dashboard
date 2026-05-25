/**
 * Buddy badge progression — highest tier where the learner has at least the listed Buddy Points.
 */
export const BUDDY_BADGE_TIERS = [
  { minPoints: 0, label: "Beginner" },
  { minPoints: 100, label: "Explorer" },
  { minPoints: 250, label: "Learner" },
  { minPoints: 500, label: "Scholar" },
  { minPoints: 1000, label: "Thinker" },
  { minPoints: 1750, label: "Achiever" },
  { minPoints: 2500, label: "High Performer" },
  { minPoints: 4000, label: "Champion" },
  { minPoints: 6000, label: "Elite" },
  { minPoints: 8500, label: "Mastermind" },
  { minPoints: 12000, label: "Genius" },
  { minPoints: 20000, label: "Legend" }
] as const;

/** Badge label for the learner’s current total Buddy Points. */
export function getBuddyTierLabel(totalPoints: number): string {
  const p = Number.isFinite(totalPoints) ? Math.max(0, Math.floor(totalPoints)) : 0;
  let label: string = BUDDY_BADGE_TIERS[0].label;
  for (const tier of BUDDY_BADGE_TIERS) {
    if (p >= tier.minPoints) label = tier.label;
  }
  return label;
}
