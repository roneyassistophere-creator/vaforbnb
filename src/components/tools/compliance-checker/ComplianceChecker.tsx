"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { checkerCopy as C, exampleAnswers, ruleTools, storageKey, toolSlug } from "@/content/tools/complianceChecker";
import { isToolLive, toolBySlug } from "@/content/tools/catalog";
import { track } from "@/lib/analytics";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import {
  checklistText,
  emptyAnswers,
  evaluate,
  formatDate,
  groupOrder,
  labelFor,
  optionsFor,
  partialCounts,
  questions,
  questionSequence,
  sanitizeAnswers,
  setSingle,
  summaryLine,
  toggleExtra,
  toggleOwnership,
  type Answers,
  type ComplianceRule,
  type Extra,
  type Figures,
  type Ownership,
  type QuestionKey,
  type ValidationErrors,
} from "@/lib/tools/compliance";
import { Logo } from "@/components/ui/Logo";
import { Chip } from "../Badges";
import { ChoiceQuestion } from "../ChoiceQuestion";
import { CopyButton } from "../CopyButton";
import { LeadPdfModal } from "../LeadPdfModal";
import { ProgressBar } from "../ProgressBar";
import { ResultGroup, ResultPanel } from "../ResultPanel";
import { RuleCard } from "../RuleCard";
import { groupMeta } from "../styles";
import { TallyCard } from "../TallyCard";
import { downloadChecklistPdf } from "./pdf";
import { useComplianceResult } from "./ResultContext";

type View = "questions" | "results";
type Saved = { answers: Answers; step: QuestionKey; view: View };

type Props = {
  rules: ComplianceRule[];
  figures: Figures;
  /** YYYY-MM-DD in Europe/London, from the server. */
  today: string;
};

const MULTI: QuestionKey[] = ["ownership", "extras"];

export function ComplianceChecker({ rules, figures, today }: Props) {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState<QuestionKey>("nation");
  const [view, setView] = useState<View>("questions");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [focus, setFocus] = useState<"none" | "question" | "results">("none");
  const [pdfOpen, setPdfOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const opened = useRef(false);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const { setShown } = useComplianceResult();

  const rulesChecked = typeof figures.rulesLastChecked?.value === "string" ? figures.rulesLastChecked.value : null;

  /* ---- Saved answers (this device only) ---- */
  useEffect(() => {
    const saved = deviceStorage.read<Saved>(storageKey);
    if (!opened.current) track("tool_opened", toolSlug);
    opened.current = true;
    // Restoring once from storage after hydration (the server render has no storage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    if (!saved) return;
    const a = sanitizeAnswers(saved.answers);
    const seq = questionSequence(a);
    const s = seq.includes(saved.step) ? saved.step : seq[0];
    const showResults = saved.view === "results" && evaluate(a, rules, figures, today).ok;
    setAnswers(a);
    setStep(s);
    setView(showResults ? "results" : "questions");
  }, [rules, figures, today]);

  // Save only after the saved answers have been restored (`ready`), so the
  // empty first render can never overwrite them.
  useEffect(() => {
    if (ready) deviceStorage.write(storageKey, { answers, step, view } satisfies Saved);
  }, [ready, answers, step, view]);

  /* ---- Derived ---- */
  const seq = questionSequence(answers);
  const index = Math.max(0, seq.indexOf(step));
  const key = seq[index];
  const isLast = index === seq.length - 1;

  const outcome = useMemo(() => (view === "results" ? evaluate(answers, rules, figures, today) : null), [view, answers, rules, figures, today]);
  const result = outcome?.ok ? outcome.result : null;
  const counts = useMemo(() => partialCounts(answers, rules, figures, today), [answers, rules, figures, today]);

  useEffect(() => {
    setShown(result ? { result, answers } : null);
  }, [result, answers, setShown]);

  useEffect(() => {
    if (focus === "results") resultsHeading.current?.focus();
  }, [focus, view]);

  /* ---- Navigation ---- */
  const goTo = useCallback((k: QuestionKey) => {
    setStep(k);
    setFocus("question");
  }, []);

  const finish = useCallback(
    (a: Answers) => {
      const o = evaluate(a, rules, figures, today);
      if (!o.ok) {
        setErrors(o.errors);
        const firstBad = questionSequence(a).find((k) => k in o.errors);
        setView("questions");
        if (firstBad) goTo(firstBad);
        return;
      }
      setErrors({});
      setView("results");
      setFocus("results");
      track("tool_result_shown", toolSlug);
    },
    [rules, figures, today, goTo],
  );

  const advanceFrom = (k: QuestionKey, a: Answers) => {
    const s = questionSequence(a);
    const i = s.indexOf(k);
    if (i < s.length - 1) goTo(s[i + 1]);
    else finish(a);
  };

  const onNext = (e?: FormEvent) => {
    e?.preventDefault();
    if (key === "ownership" && answers.ownership.length === 0) {
      setErrors({ ...errors, ownership: "Tick at least one option." });
      return;
    }
    const single = !MULTI.includes(key);
    if (single && !answers[key as keyof Answers]) {
      setErrors({ ...errors, [key]: "Choose an answer to continue." });
      return;
    }
    advanceFrom(key, answers);
  };

  const onBack = () => index > 0 && goTo(seq[index - 1]);

  const onChange = (value: string, checked: boolean) => {
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (key === "ownership") setAnswers((a) => toggleOwnership(a, value as Ownership, checked));
    else if (key === "extras") setAnswers((a) => toggleExtra(a, value as Extra, checked));
    else setAnswers((a) => setSingle(a, key as "nation", value));
  };

  const onPicked = (value: string) => advanceFrom(key, setSingle(answers, key as "nation", value));

  const tryExample = () => {
    setAnswers(exampleAnswers);
    setStep(questionSequence(exampleAnswers).at(-1)!);
    finish(exampleAnswers);
  };

  const edit = () => {
    setView("questions");
    goTo("nation");
  };

  const restart = () => {
    deviceStorage.remove(storageKey);
    setAnswers(emptyAnswers());
    setErrors({});
    setView("questions");
    goTo("nation");
  };

  /* ---- Display helpers ---- */
  const answerValue = (k: QuestionKey, a = answers): string | null => {
    const v = a[k as keyof Answers];
    if (Array.isArray(v)) return v.length ? v.map((x) => labelFor(k, x, a)).join(", ") : null;
    return v ? labelFor(k, v, a) : null;
  };
  const answerRows = seq
    .map((k) => ({ label: questions[k].short, value: answerValue(k) }))
    .filter((r): r is { label: string; value: string } => !!r.value);

  const dateLabel = `Created ${formatDate(today)}${rulesChecked ? ` · Rules last checked ${formatDate(rulesChecked)}` : ""}`;
  const disclaimer = "General information, not legal advice. Check each rule with its official source.";

  const privacy = (
    <p className="m-0 text-[13px] leading-[1.6] text-mist">
      {C.privacy}{" "}
      <button type="button" onClick={restart} className="cursor-pointer border-none bg-transparent p-0 font-bold text-white underline underline-offset-2">
        {C.clear}
      </button>
    </p>
  );

  /* ---- Results ---- */
  if (view === "results" && result) {
    return (
      <div data-tool={toolSlug} data-ready={ready || undefined}>
        <ResultPanel
          ref={resultsHeading}
          heading={C.resultsHeading}
          summary={summaryLine(result)}
          printHeader={
            <div className="flex items-center justify-between border-b border-line pb-3">
              <Logo />
              <span className="text-xs text-muted">{dateLabel}</span>
            </div>
          }
        >
          <div className="mt-5 rounded-[14px] bg-sand px-4 py-3.5 text-sm leading-[1.6]" data-print-hide>
            <span className="font-extrabold">{C.yourAnswers}: </span>
            {seq
              .map((k) => {
                const v = answerValue(k);
                // Yes/no answers need their question to make sense ("Gas: Yes").
                return v && (k === "mainHome" || k === "gas") ? `${questions[k].short}: ${v}` : v;
              })
              .filter(Boolean)
              .join(" · ")}{" "}
            <button type="button" onClick={edit} className="inline-flex min-h-11 cursor-pointer items-center border-none bg-transparent p-0 font-bold text-brand underline underline-offset-2">
              {C.edit}
            </button>
          </div>

          {result.gasNotSure && (
            <p className="m-0 mt-3 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold text-amber" role="note">
              {C.gasNote}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {groupOrder.map((g) => {
              const n = result.groups[g].length;
              return n ? <Chip key={g} tone={groupMeta[g]} count={n} label={groupMeta[g].label} /> : null;
            })}
          </div>

          {groupOrder.map((g) => (
            <ResultGroup key={g} group={g} count={result.groups[g].length}>
              {result.groups[g].map((r) => (
                <RuleCard
                  key={r.ruleId}
                  stepsLabel={C.stepsLabel}
                  rule={{
                    id: r.ruleId,
                    title: r.title,
                    status: r.status,
                    summary: r.summary,
                    steps: r.whatToDo,
                    source: r.source,
                    detailsHref: `${routes.ukRules}#${r.rulesHubAnchor}`,
                    detailsLabel: C.detailsLabel,
                    action: ruleTools[r.ruleId] && isToolLive(ruleTools[r.ruleId].slug) ? { label: ruleTools[r.ruleId].label, href: toolBySlug(ruleTools[r.ruleId].slug)!.href! + toolQuery(ruleTools[r.ruleId].query, answers.area) } : undefined,
                  }}
                />
              ))}
            </ResultGroup>
          ))}

          <p className="m-0 mt-6 hidden text-xs text-muted print:block">{disclaimer}</p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5 border-t border-line pt-6" data-print-hide>
            <CopyButton
              label={C.actions.copy}
              copiedLabel={C.actions.copied}
              getText={() => checklistText(result, { siteUrl: brand.siteUrl, rulesHubPath: routes.ukRules, heading: C.resultsHeading, dateLabel })}
            />
            <button type="button" onClick={() => window.print()} className="btn btn-outline">
              {C.actions.print}
            </button>
            <button type="button" onClick={() => setPdfOpen(true)} className="btn btn-coral">
              {C.actions.pdf}
            </button>
            <button type="button" onClick={restart} className="btn btn-outline ml-auto max-sm:ml-0">
              {C.actions.restart}
            </button>
          </div>
          <p className="m-0 mt-4 text-[13px] text-muted" data-print-hide>
            {C.privacy}{" "}
            <button type="button" onClick={restart} className="cursor-pointer border-none bg-transparent p-0 font-bold text-ink underline underline-offset-2">
              {C.clear}
            </button>
          </p>
        </ResultPanel>

        <LeadPdfModal
          open={pdfOpen}
          onClose={() => setPdfOpen(false)}
          toolSlug={toolSlug}
          copy={C.pdfModal}
          makePdf={() =>
            downloadChecklistPdf(result, {
              brandName: brand.name,
              heading: C.resultsHeading,
              createdLabel: `Created ${formatDate(today)}`,
              rulesCheckedLabel: rulesChecked ? `Rules last checked ${formatDate(rulesChecked)}` : "",
              siteUrl: brand.siteUrl,
              rulesHubPath: routes.ukRules,
              disclaimer,
              fileName: "uk-short-let-checklist.pdf",
            })
          }
        />
      </div>
    );
  }

  /* ---- Questions + live tally ---- */
  const q = questions[key];
  const value = answers[key as keyof Answers] as string | string[] | undefined;

  return (
    <div data-tool={toolSlug} data-ready={ready || undefined} className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:items-start">
      <form onSubmit={onNext} className="rounded-[20px] border border-line bg-white p-5 md:p-8" aria-label="UK short-let compliance checker">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-[200px] flex-1">
            <ProgressBar current={index + 1} total={seq.length} />
          </div>
          <button type="button" onClick={tryExample} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
            {C.tryExample}
          </button>
        </div>

        <ChoiceQuestion
          key={key}
          name={key}
          legend={q.title}
          hint={q.hint}
          multi={q.multi}
          options={optionsFor(key, answers)}
          value={value}
          onChange={onChange}
          onPicked={onPicked}
          autoFocus={focus === "question"}
          error={errors[key as keyof Answers]}
        >
          {key === "gas" && answers.gas === "not-sure" && (
            <p className="m-0 mt-3 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold text-amber" role="note">
              {C.gasNote}
            </p>
          )}
        </ChoiceQuestion>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} disabled={index === 0} className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-40">
            {C.back}
          </button>
          <button type="submit" className="btn btn-ink">
            {isLast ? C.seeResults : C.next}
          </button>
        </div>
      </form>

      <TallyCard
        className="md:sticky md:top-6"
        title={C.tallyTitle}
        emptyText={C.tallyEmpty}
        rows={groupOrder.map((g) => ({
          label: groupMeta[g].label,
          dot: groupMeta[g].dot,
          count: counts ? { "must-do": counts.mustDo, "coming-soon": counts.comingSoon, "check-contract": counts.checkContract }[g] : null,
        }))}
        answers={answerRows}
        footer={privacy}
      />
    </div>
  );
}

/** "?area={area}" → "?area=edinburgh"; dropped if the host hasn't picked an area. */
function toolQuery(query: string | undefined, area: string | null | undefined): string {
  if (!query) return "";
  if (!query.includes("{area}")) return query;
  return area ? query.replace("{area}", encodeURIComponent(area)) : "";
}
