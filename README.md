# AI Workplace Companion

Build a modern responsive SaaS web app called AI Workplace Productivity Assistant.

Create a clean professional dashboard using light grey, dark grey, white, and subtle accent colors. No backend, database, authentication, or external storage. Keep all data in local browser state.

Core features

Smart Email Generator

Inputs: recipient/context, subject, key points, and tone.

Tone options: Formal, Friendly, Persuasive.

Generate an AI-written professional email based on the user's inputs.

Output must be editable with Copy and Regenerate buttons.

Meeting Notes Summarizer

Large text input for meeting notes.

AI generates: Summary, Key Decisions, Action Items, Responsible Person, and Deadlines.

Make the generated results editable and copyable.

AI Task Planner

User enters tasks, priorities, and available time.

Generate a realistic daily or weekly schedule.

Organize tasks by priority and time.

Make the schedule editable.

UI

Responsive sidebar navigation: Dashboard, Email Generator, Meeting Summarizer, Task Planner.

Modern dashboard homepage with cards for the three tools.

Clean typography, rounded cards, subtle borders, minimal shadows.

Mobile-friendly responsive layout.

Include loading states and useful empty states.

AI behavior

Use structured AI prompts so outputs are specific to the user's information rather than generic templates. The AI should understand context, produce professional workplace-quality results, and avoid inventing information. Allow users to edit every generated output.

Responsible AI

Add a small disclaimer: "AI-generated content may contain errors. Review and verify important information before using or sharing it."

Keep the application frontend-only and simple. Do not add unnecessary features or backend infrastructure.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b956bc81-c752-4233-ac8c-3b69ae917f9d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
