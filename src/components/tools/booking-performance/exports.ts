import { money } from "@/lib/tools/format";
import { newPdf, PDF_CORAL as CORAL, PDF_INK as INK, PDF_MUTED as MUTED, safePdfText as safe } from "@/lib/tools/pdf";
import { adrText, pct1, revparBreakdown, signedMoney, signedPct, signedPts, summarySentence, type BookingResult, type Comparison, type Insight, type Kpis } from "@/lib/tools/booking-performance";

/** The PDF report, made on the visitor's device: KPIs, comparison, charts (as bars) and insights. */
export async function downloadPerfPdf(o: { title: string; k: Kpis; before: Kpis | null; cmp: Comparison | null; months: { label: string; k: Kpis | null }[]; bookings: BookingResult | null; insights: Insight[]; disclaimer: string; fileName: string; date: string }) {
  const doc = await newPdf();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 46;
  let y = M;
  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (t: string, size: number, opt: { bold?: boolean; color?: [number, number, number] } = {}) => {
    doc.setFont("helvetica", opt.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opt.color ?? INK));
    for (const line of doc.splitTextToSize(safe(t), W - M * 2)) {
      ensure(size + 4);
      doc.text(line, M, y + size);
      y += size + 4;
    }
  };
  const heading = (t: string) => {
    y += 10;
    ensure(40);
    text(t, 14, { bold: true });
  };
  const bar = (label: string, frac: number, value: string) => {
    ensure(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(safe(label), M, y + 10);
    const w = Math.max(2, Math.min(1, frac) * (W - M * 2 - 200));
    doc.setFillColor(...INK);
    doc.rect(M + 110, y + 2, w, 10, "F");
    doc.text(safe(value), M + 116 + w, y + 10);
    y += 16;
  };
  const { k } = o;
  text("VA for BnB", 10, { bold: true, color: CORAL });
  text("Booking performance report", 22, { bold: true });
  text(`${o.title} · ${o.date}`, 10, { color: MUTED });
  y += 8;
  text(`Occupancy ${pct1(k.occupancy)} · ADR ${adrText(k)} · RevPAR ${money(k.revpar)}`, 16, { bold: true });
  text(summarySentence(k), 11);
  const extra = [k.netRevpar !== null ? `Net RevPAR ${money(k.netRevpar)}` : "", k.trevpar !== null ? `TRevPAR ${money(k.trevpar)}` : "", k.alos !== null ? `Avg stay ${k.alos.toFixed(1)} nights` : ""].filter(Boolean);
  if (extra.length) text(extra.join(" · "), 10, { color: MUTED });
  if (o.before && o.cmp) {
    heading("Compared with last year");
    text(`Occupancy ${signedPts(o.cmp.occPoints)} · ADR ${o.cmp.adr ? `${signedMoney(o.cmp.adr.abs)} (${signedPct(o.cmp.adr.pct)})` : "–"} · RevPAR ${signedMoney(o.cmp.revpar.abs)} (${signedPct(o.cmp.revpar.pct)})`, 10.5);
    const br = revparBreakdown(k, o.before);
    text(`Occupancy effect ${signedMoney(br.occEffect)} · Price effect ${signedMoney(br.priceEffect)} · Total ${signedMoney(br.total)}`, 10.5);
  }
  if (o.months.some((m) => m.k)) {
    heading("Occupancy by month");
    for (const m of o.months) if (m.k) bar(m.label, m.k.occupancy, `${pct1(m.k.occupancy)} · ADR ${adrText(m.k)} · RevPAR ${money(m.k.revpar)}`);
  }
  if (o.bookings) {
    heading("Weekends vs weekdays");
    bar("Weekends", o.bookings.weekend.occupancy, `${pct1(o.bookings.weekend.occupancy)} · ADR ${o.bookings.weekend.adr === null ? "–" : money(o.bookings.weekend.adr)}`);
    bar("Weekdays", o.bookings.weekday.occupancy, `${pct1(o.bookings.weekday.occupancy)} · ADR ${o.bookings.weekday.adr === null ? "–" : money(o.bookings.weekday.adr)}`);
    if (o.bookings.gaps.count) text(`Gap nights: ${o.bookings.gaps.count} gaps, ${o.bookings.gaps.nights} nights.`, 10);
  }
  if (o.insights.length) {
    heading("Insights");
    for (const i of o.insights) text(`- ${i.text}`, 10);
  }
  y += 12;
  text(o.disclaimer, 9, { color: MUTED });
  doc.save(o.fileName);
}
