import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarRange, Plus, Trash2 } from "lucide-react";
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
  Select,
  Textarea,
} from "@/components/ui-kit";
import { generatePlan, type Plan } from "@/lib/assistant.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Workplace Assistant" },
      {
        name: "description",
        content: "Turn your tasks, priorities and available time into a realistic schedule.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Turn your tasks, priorities and available time into a realistic schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

function planToText(plan: Plan) {
  return [
    ...plan.blocks.map((b) =>
      `${b.slot} — ${b.task} (${b.priority})${b.notes ? ` — ${b.notes}` : ""}`,
    ),
    plan.advice ? `\nNote: ${plan.advice}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function PlannerPage() {
  const run = useServerFn(generatePlan);
  const [tasks, setTasks] = useState("");
  const [availability, setAvailability] = useState("");
  const [horizon, setHorizon] = useState("Daily");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!tasks.trim() || !availability.trim()) {
      setError("Add your tasks and how much time you have available.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setPlan(
        await run({ data: { tasks, availability, horizon: horizon as "Daily" | "Weekly" } }),
      );
    } catch {
      setError("The schedule could not be generated right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const patchBlock = (i: number, patch: Partial<Plan["blocks"][number]>) =>
    setPlan((prev) =>
      prev ? { ...prev, blocks: prev.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)) } : prev,
    );

  return (
    <AppShell
      title="AI Task Planner"
      description="Build a realistic schedule around your priorities and available time."
    >
      <Card>
        <SectionTitle hint="List one task per line, with a priority such as High, Medium or Low.">
          Your tasks
        </SectionTitle>
        <div className="grid gap-4">
          <Field label="Tasks and priorities">
            <Textarea
              rows={7}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"Finish Q3 budget draft — High — 3h\nReview two design PRs — Medium — 1h\nUpdate onboarding doc — Low — 45m"}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Available time">
              <Input
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. 09:00–16:00, meetings 11:00–12:00"
              />
            </Field>
            <Field label="Schedule type">
              <Select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option>Daily</option>
                <option>Weekly</option>
              </Select>
            </Field>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={submit} loading={loading}>
            {plan ? "Rebuild schedule" : "Generate schedule"}
          </Button>
        </div>
        {error && <div className="mt-3"><ErrorNote message={error} /></div>}
      </Card>

      {loading ? (
        <LoadingState label="Planning your time…" />
      ) : plan ? (
        <Card>
          <SectionTitle hint="Every row is editable.">
            {horizon === "Weekly" ? "Weekly schedule" : "Daily schedule"}
          </SectionTitle>
          <div className="space-y-3">
            {plan.blocks.map((block, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_2fr_1fr_auto]"
              >
                <Field label="When">
                  <Input value={block.slot} onChange={(e) => patchBlock(i, { slot: e.target.value })} />
                </Field>
                <Field label="Task">
                  <Input value={block.task} onChange={(e) => patchBlock(i, { task: e.target.value })} />
                </Field>
                <Field label="Priority">
                  <Input
                    value={block.priority}
                    onChange={(e) => patchBlock(i, { priority: e.target.value })}
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    aria-label="Remove block"
                    onClick={() =>
                      setPlan((prev) =>
                        prev ? { ...prev, blocks: prev.blocks.filter((_, j) => j !== i) } : prev,
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {block.notes && (
                  <div className="sm:col-span-4">
                    <Field label="Notes">
                      <Input
                        value={block.notes}
                        onChange={(e) => patchBlock(i, { notes: e.target.value })}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ))}
          </div>
          {plan.advice && (
            <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {plan.advice}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                setPlan((prev) =>
                  prev
                    ? { ...prev, blocks: [...prev.blocks, { slot: "", task: "", priority: "", notes: "" }] }
                    : prev,
                )
              }
            >
              <Plus className="size-4" /> Add block
            </Button>
            <CopyButton value={planToText(plan)} label="Copy schedule" />
          </div>
          <div className="mt-3">
            <Disclaimer />
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<CalendarRange className="size-4" />}
          title="No schedule yet"
          body="Add your tasks and available time above to generate a realistic plan."
        />
      )}
    </AppShell>
  );
}
