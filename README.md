# Student Placement Portal

A phone-first placement portal for students, with three pages:

- **Home** – applied jobs, quick links and application stats.
- **Jobs** – search and filter roles, browse companies, view job details and apply with a saved resume.
- **Resume** – build resume pointers, attach proof (an agent checks that the right document was uploaded), see coordinator feedback, re-upload or appeal, and design the resume visually (fonts, colours, margins, templates and a custom box layout). Multiple named resumes can be saved.

There is also a splash screen and a phone / laptop toggle (shown on screens wider than 600px).

> All companies, jobs, applications and feedback are sample data for demonstration. Nothing is sent to a server; saved resumes stay in your browser's local storage.

## Try it

**Live demo:** https://manasimadan7.github.io/student-portal/

Run it locally (Node 18+):

```bash
npm install
npm run dev
```

Then open http://localhost:5174.

## Tech

Vite + React 18 + TypeScript, plain CSS with design tokens (`src/styles/tokens.css`). The design spec lives in [`docs/STUDENT_DESIGN_SYSTEM.md`](docs/STUDENT_DESIGN_SYSTEM.md).

## Feedback

Found a bug or have an idea? Open an [issue](../../issues) – screenshots welcome.
