import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, CalendarRange, ArrowRight, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, summarize meeting notes and plan your tasks with an AI workplace assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meeting notes and plan your tasks with an AI workplace assistant.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    body: "Turn a few key points into a polished email in a formal, friendly or persuasive tone.",
  },
  {
    to: "/summarizer",
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    body: "Get a summary, key decisions and action items with owners and deadlines.",
  },
  {
    to: "/planner",
    icon: CalendarRange,
    title: "AI Task Planner",
    body: "Build a realistic daily or weekly schedule from your tasks, priorities and free time.",
  },
] as const;

function Dashboard() {
  return (
    <AppShell
      title="Dashboard"
      description="Three AI tools for everyday workplace writing and planning."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="group">
            <Card className="flex h-full flex-col transition-colors group-hover:border-ring/50">
              <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <tool.icon className="size-4" />
              </span>
              <h2 className="text-sm font-semibold text-foreground">{tool.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                Open tool <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Responsible use</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Everything you type stays in this browser session — nothing is saved. AI-generated
            content may contain errors. Review and verify important information before using or
            sharing it.
          </p>
        </div>
      </Card>
    </AppShell>
  );
}
