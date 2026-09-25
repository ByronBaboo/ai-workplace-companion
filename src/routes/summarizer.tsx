import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell, Disclaimer } from "@/components/app-shell";
import {
  Button,
  Card,
  CopyButton,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  LoadingState,
  SectionTitle,
  Textarea,
} from "@/components/ui-kit";
import { summarizeMeeting, type MeetingSummary } from "@/lib/assistant.functions";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | AI Workplace Assistant" },
      {
        name: "description",
        content: "Turn raw meeting notes into a summary, decisions and action items with owners.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into a summary, decisions and action items with owners.",
      },
    ],
  }),
  component: SummarizerPage,
});

function toPlainText(result: MeetingSummary) {
  return [
    "SUMMARY",
    result.summary,
    "",
    "KEY DECISIONS",
    ...result.decisions.map((d) => `- ${d}`),
    "",
    "ACTION ITEMS",
    ...result.actionItems.map((a) => `- ${a.task} | Owner: ${a.owner} | Deadline: ${a.deadline}`),
  ].join("\n");
}

function SummarizerPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!notes.trim()) {
      setError("Paste your meeting notes first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setResult(await run({ data: { notes } }));
    } catch {
      setError("The summary could not be generated right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (patch: Partial<MeetingSummary>) =>
    setResult((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Paste your notes and get a structured, editable recap."
    >
      <Card>
        <SectionTitle hint="Raw notes, transcript fragments or bullet points all work.">
          Meeting notes
        </SectionTitle>
        <Textarea
          rows={12}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your meeting notes here…"
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={submit} loading={loading}>
            {result ? "Summarize again" : "Summarize notes"}
          </Button>
          {notes && (
            <Button variant="ghost" onClick={() => { setNotes(""); setResult(null); }}>
              Clear
            </Button>
          )}
        </div>
        {error && <div className="mt-3"><ErrorNote message={error} /></div>}
      </Card>

      {loading ? (
        <LoadingState label="Reading your notes…" />
      ) : result ? (
        <>
          <Card>
            <SectionTitle>Summary</SectionTitle>
            <Textarea
              rows={5}
              value={result.summary}
              onChange={(e) => update({ summary: e.target.value })}
            />
          </Card>

          <Card>
            <SectionTitle>Key decisions</SectionTitle>
            <div className="space-y-2">
              {result.decisions.length === 0 && (
                <p className="text-xs text-muted-foreground">No decisions were stated in the notes.</p>
              )}
              {result.decisions.map((decision, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={decision}
                    onChange={(e) =>
                      update({
                        decisions: result.decisions.map((d, j) => (j === i ? e.target.value : d)),
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    aria-label="Remove decision"
                    onClick={() => update({ decisions: result.decisions.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => update({ decisions: [...result.decisions, ""] })}
            >
              <Plus className="size-4" /> Add decision
            </Button>
          </Card>

          <Card>
            <SectionTitle hint="Edit any task, owner or deadline.">Action items</SectionTitle>
            <div className="space-y-3">
              {result.actionItems.length === 0 && (
                <p className="text-xs text-muted-foreground">No action items were found.</p>
              )}
              {result.actionItems.map((item, i) => {
                const patchItem = (patch: Partial<typeof item>) =>
                  update({
                    actionItems: result.actionItems.map((a, j) => (j === i ? { ...a, ...patch } : a)),
                  });
                return (
                  <div
                    key={i}
                    className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
                  >
                    <Field label="Task">
                      <Input value={item.task} onChange={(e) => patchItem({ task: e.target.value })} />
                    </Field>
                    <Field label="Responsible">
                      <Input value={item.owner} onChange={(e) => patchItem({ owner: e.target.value })} />
                    </Field>
                    <Field label="Deadline">
                      <Input
                        value={item.deadline}
                        onChange={(e) => patchItem({ deadline: e.target.value })}
                      />
                    </Field>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        aria-label="Remove action item"
                        onClick={() =>
                          update({ actionItems: result.actionItems.filter((_, j) => j !== i) })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                onClick={() =>
                  update({
                    actionItems: [
                      ...result.actionItems,
                      { task: "", owner: "Not specified", deadline: "Not specified" },
                    ],
                  })
                }
              >
                <Plus className="size-4" /> Add action item
              </Button>
              <CopyButton value={toPlainText(result)} label="Copy full recap" />
            </div>
            <div className="mt-3">
              <Disclaimer />
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<NotebookPen className="size-4" />}
          title="No summary yet"
          body="Paste your meeting notes above to get a summary, decisions and action items."
        />
      )}
    </AppShell>
  );
}
