/** BuddyAI dashboard brand tokens (see tailwind.config.ts). */
export const BUDDY_BRAND = {
  background: "#fffefb",
  foreground: "#141414",
  primary: "#f7b500",
  accent: "#ffcf4d",
  muted: "#f7f7f5",
  border: "#ece8dd",
  secondary: "#141414"
} as const;

/** RGB tuples for jsPDF (no # prefix). */
export const BUDDY_BRAND_RGB = {
  background: [255, 254, 251] as const,
  foreground: [20, 20, 20] as const,
  primary: [247, 181, 0] as const,
  accent: [255, 207, 77] as const,
  muted: [247, 247, 245] as const,
  border: [236, 232, 221] as const,
  label: [70, 70, 70] as const,
  mutedText: [100, 95, 85] as const,
  sectionTint: [255, 248, 230] as const,
  needsSupport: [180, 83, 9] as const,
  active: [22, 120, 70] as const
};
