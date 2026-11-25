type Props = { data: Record<string, unknown> | Array<Record<string, unknown> | null> | null };

/** Renders schema.org JSON-LD. Escapes `<` so content can't break out of the script tag. */
export function JsonLd({ data }: Props) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!list.length) return null;
  return (
    <>
      {list.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
