function splitSchoolName(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return ["", ""];
  if (words.length === 1) {
    const w = words[0]!;
    if (w.length <= 8) return [w, ""];
    const mid = Math.ceil(w.length / 2);
    return [w.slice(0, mid), w.slice(mid)];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/** Renders a school name on up to two lines (balanced split on word boundaries). */
export function SchoolTwoLine({ name }: { name: string }) {
  const [line1, line2] = splitSchoolName(name);
  return (
    <span className="inline-block max-w-[11rem] text-center text-sm leading-snug">
      {line1}
      {line2 ? (
        <>
          <br />
          {line2}
        </>
      ) : null}
    </span>
  );
}
