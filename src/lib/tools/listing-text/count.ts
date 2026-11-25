/**
 * Character counting shared by the AI-readiness scorer and the title checker.
 *
 * "graphemes" counts characters as people see them: an emoji (even one made
 * of several code points, like a flag or 👍🏽), or an accented letter typed as
 * two code points, counts as 1. "codepoints" counts Unicode code points.
 */
export type CountMethod = "graphemes" | "codepoints";

let segmenter: Intl.Segmenter | null | undefined;
const getSegmenter = () => (segmenter === undefined ? (segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("en", { granularity: "grapheme" }) : null) : segmenter);

/** Each visible character with its position in the string. */
export function graphemes(text: string): { text: string; index: number }[] {
  const s = getSegmenter();
  if (s) return [...s.segment(text)].map((g) => ({ text: g.segment, index: g.index }));
  const out: { text: string; index: number }[] = [];
  let i = 0;
  for (const ch of text) {
    out.push({ text: ch, index: i });
    i += ch.length;
  }
  return out;
}

export function countChars(text: string, method: CountMethod = "graphemes"): number {
  return method === "codepoints" ? [...text].length : graphemes(text).length;
}
