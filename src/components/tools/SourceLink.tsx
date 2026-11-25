import { cn } from "@/lib/cn";

export type SourceItem = { title: string; url: string | null };

/** Official source: a link that opens in a new tab, or plain text when there's no URL. */
export function SourceLink({ source, className }: { source: SourceItem; className?: string }) {
  return (
    <span className={cn("text-[13px] leading-[1.5] text-muted", className)}>
      Source:{" "}
      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-copy underline underline-offset-2 hover:text-ink">
          {source.title}
          <span className="sr-only-label"> (opens in a new tab)</span>
        </a>
      ) : (
        <span className="font-semibold text-ink-copy">{source.title}</span>
      )}
    </span>
  );
}

/** A list of sources (e.g. for a page footer). */
export function SourceList({ sources, className }: { sources: SourceItem[]; className?: string }) {
  return (
    <ul className={cn("m-0 grid list-none gap-1.5 p-0", className)}>
      {sources.map((s) => (
        <li key={`${s.title}-${s.url}`}>
          <SourceLink source={s} />
        </li>
      ))}
    </ul>
  );
}
