import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  learnerId: string;
  avatarUrl?: string;
  className?: string;
  /** Display size in CSS pixels (width & height). Default 40 for tables. */
  size?: number;
};

/** Shared prompt keeps faces consistent and appropriate for learner/admin demo data. POPIA note: synthetic faces only until real guardian-consented uploads exist. */
const DEMO_PORTRAIT_PROMPT =
  "Photorealistic headshot portrait, one teenage learner, natural lighting, neutral background, shoulders up, respectful school photo style, DSLR, sharp eyes, realistic skin texture";

function demoAiPortraitUrl(learnerId: string, displaySize: number): string {
  const prompt = encodeURIComponent(DEMO_PORTRAIT_PROMPT);
  const seed = encodeURIComponent(learnerId);
  const px = Math.min(512, Math.max(256, displaySize * 2));
  return `https://image.pollinations.ai/prompt/${prompt}?width=${px}&height=${px}&seed=${seed}&nologo=true`;
}

export function LearnerAvatar({ name, learnerId, avatarUrl, className, size = 40 }: Props) {
  const src = avatarUrl ?? demoAiPortraitUrl(learnerId, size);
  const useUnoptimized = Boolean(avatarUrl) || src.includes("pollinations.ai");
  const isLarge = size >= 96;

  return (
    <div className={cn("flex justify-center", className)}>
      <Image
        src={src}
        alt={isLarge ? `${name} — profile photo` : ""}
        aria-hidden={!isLarge}
        width={size}
        height={size}
        unoptimized={useUnoptimized}
        className={cn(
          "border border-border object-cover object-top shadow-sm",
          isLarge ? "rounded-2xl shadow-soft" : "rounded-full"
        )}
      />
      {!isLarge ? <span className="sr-only">{name}</span> : null}
    </div>
  );
}
