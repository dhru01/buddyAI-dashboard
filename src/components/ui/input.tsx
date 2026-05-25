import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary",
        props.className
      )}
    />
  );
}
