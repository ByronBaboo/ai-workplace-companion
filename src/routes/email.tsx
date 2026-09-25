import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, RefreshCw } from "lucide-react";
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
import { generateEmail } from "@/lib/assistant.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | AI Workplace Assistant" },
      {
        name: "description",
        content: "Write professional workplace emails from key points in a chosen tone.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Write professional workplace emails from key points in a chosen tone.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Formal");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!recipient.trim() || !keyPoints.trim()) {
      setError("Add the recipient/context and at least one key point.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await run({
        data: { recipient, subject, keyPoints, tone: tone as "Formal" | "Friendly" | "Persuasive" },
      });
      setEmail(result.email);
    } catch {
      setError("The email could not be generated right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Smart Email Generator"
      description="Give the context and key points — get a ready-to-send draft."
    >
      <Card>
        <SectionTitle hint="Only the details you provide are used. Nothing is invented.">
          Email details
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recipient / context">
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Priya, our supplier account manager"
            />
          </Field>
          <Field label="Subject (optional)">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Delivery delay for order 4412"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Key points" hint="One point per line works best.">
              <Textarea
                rows={6}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder={"Order 4412 is two weeks late\nNeed a firm delivery date by Friday\nAsk about partial shipment"}
              />
            </Field>
          </div>
          <Field label="Tone">
            <Select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Formal</option>
              <option>Friendly</option>
              <option>Persuasive</option>
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={submit} loading={loading}>
            {email ? "Generate again" : "Generate email"}
          </Button>
          {email && !loading && (
            <Button variant="outline" onClick={submit}>
              <RefreshCw className="size-4" /> Regenerate
            </Button>
          )}
        </div>
        {error && <div className="mt-3">
          <ErrorNote message={error} />
        </div>}
      </Card>

      {loading ? (
        <LoadingState label="Writing your email…" />
      ) : email ? (
        <Card>
          <SectionTitle hint="Edit freely before sending.">Draft email</SectionTitle>
          <Textarea rows={14} value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CopyButton value={email} label="Copy email" />
            <Button variant="ghost" onClick={submit}>
              <RefreshCw className="size-4" /> Regenerate
            </Button>
          </div>
          <div className="mt-3">
            <Disclaimer />
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Mail className="size-4" />}
          title="No draft yet"
          body="Fill in the context and key points above, then generate your email."
        />
      )}
    </AppShell>
  );
}
