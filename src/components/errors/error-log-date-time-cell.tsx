import { parseErrorLogDateTimeParts } from "@/lib/date-display";

export function ErrorLogDateTimeCell({ timestamp }: { timestamp: string }) {
  const { date, time } = parseErrorLogDateTimeParts(timestamp);

  return (
    <div className="flex flex-col items-center text-center leading-snug">
      <span className="whitespace-nowrap">{date}</span>
      {time ? <span className="whitespace-nowrap text-foreground/80">{time}</span> : null}
    </div>
  );
}
