import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NO_INVENTION =
  "Use only the facts the user supplied. Never invent names, dates, numbers, commitments or details that are not present in the input. If something required is missing, leave it out or write 'not specified'. Write in professional workplace English.";

const emailInput = z.object({
  recipient: z.string().min(1),
  subject: z.string().default(""),
  keyPoints: z.string().min(1),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    const { generateText } = await import("./ai.server");
    const text = await generateText(
      `You write workplace emails. ${NO_INVENTION} Return only the email body text, starting with a greeting and ending with a sign-off. Do not add commentary, subject line or markdown.`,
      [
        `Tone: ${data.tone}`,
        `Recipient / context: ${data.recipient}`,
        data.subject ? `Subject: ${data.subject}` : "",
        `Key points to cover:\n${data.keyPoints}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
    return { email: text.trim() };
  });

const notesInput = z.object({ notes: z.string().min(1) });

export type MeetingSummary = {
  summary: string;
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
};

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => notesInput.parse(data))
  .handler(async ({ data }): Promise<MeetingSummary> => {
    const { generateText, extractJson } = await import("./ai.server");
    const raw = await generateText(
      `You summarize meeting notes. ${NO_INVENTION} Respond with JSON only, matching: {"summary": string, "decisions": string[], "actionItems": [{"task": string, "owner": string, "deadline": string}]}. Use "Not specified" for an unknown owner or deadline. Keep the summary to 3-5 sentences.`,
      `Meeting notes:\n\n${data.notes}`,
    );
    const parsed = extractJson(raw) as MeetingSummary;
    return {
      summary: String(parsed.summary ?? ""),
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions.map(String) : [],
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems.map((item) => ({
            task: String(item?.task ?? ""),
            owner: String(item?.owner ?? "Not specified"),
            deadline: String(item?.deadline ?? "Not specified"),
          }))
        : [],
    };
  });

const planInput = z.object({
  tasks: z.string().min(1),
  availability: z.string().min(1),
  horizon: z.enum(["Daily", "Weekly"]),
});

export type PlanBlock = { slot: string; task: string; priority: string; notes: string };
export type Plan = { blocks: PlanBlock[]; advice: string };

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planInput.parse(data))
  .handler(async ({ data }): Promise<Plan> => {
    const { generateText, extractJson } = await import("./ai.server");
    const raw = await generateText(
      `You build realistic work schedules. ${NO_INVENTION} Fit the work into the stated available time, order by priority, add short breaks where sensible, and do not overload the schedule. Respond with JSON only: {"blocks": [{"slot": string, "task": string, "priority": string, "notes": string}], "advice": string}. For a weekly plan use day names in "slot"; for a daily plan use time ranges.`,
      [
        `Schedule type: ${data.horizon}`,
        `Available time: ${data.availability}`,
        `Tasks and priorities:\n${data.tasks}`,
      ].join("\n\n"),
    );
    const parsed = extractJson(raw) as Plan;
    return {
      blocks: Array.isArray(parsed.blocks)
        ? parsed.blocks.map((b) => ({
            slot: String(b?.slot ?? ""),
            task: String(b?.task ?? ""),
            priority: String(b?.priority ?? ""),
            notes: String(b?.notes ?? ""),
          }))
        : [],
      advice: String(parsed.advice ?? ""),
    };
  });
