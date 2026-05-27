import { Check } from "lucide-react";
import { getPasswordDisplayRuleStates } from "@/lib/password-validation";
import { cn } from "@/lib/utils";

type PasswordRequirementsHintProps = {
  password: string;
  id?: string;
  className?: string;
};

export function PasswordRequirementsHint({
  password,
  id,
  className
}: PasswordRequirementsHintProps) {
  const rules = getPasswordDisplayRuleStates(password);

  return (
    <div id={id} className={className}>
      <p className="text-xs text-foreground/60">Your password must include:</p>
      <ul className="mt-1.5 space-y-1">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              "flex items-start gap-2 text-xs transition-colors",
              rule.met ? "text-emerald-600" : "text-red-600"
            )}
          >
            <Check
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0",
                rule.met ? "opacity-100" : "opacity-0"
              )}
              aria-hidden
            />
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
