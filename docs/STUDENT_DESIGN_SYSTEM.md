# Student Placement Portal — Design System (mobile)

Source: Figma **P1| PORTAL** (`JX0xyh7Vgm576SWqoAho6E`), section `319:16184` "design system".
Separate from the staff portal in `app/` (purple desktop UI documented in `DESIGN_SYSTEM.md`).

Pages: **Home**, **Jobs**, **Resume** (phone-first).

## Colour tokens
| Figma variable | Hex | Use |
|---|---|---|
| `Student/ primary / Light` | `#5084A4` | Primary (light). At 80% (`rgba(80,132,164,.8)`) → button fill, card stroke, Proof pill |
| `Student/ primary/ dark` | `#3A6F91` | Nav bar, active nav ring + active icon/label |
| `secondary/ dark` | `#85BFCE` | Secondary |
| `secondary/ light` | `#BBDBE3` | Secondary light |
| `tertiary/ dark` | `#8EA1AC` | Tertiary / muted |
| `tertiary/ light` | `#D6D7D9` | Tertiary light / dividers |
| `Primary CTA Text` | `#FFFFFF` | Text on primary buttons |
| `color/neutral/0-255-255-255` | `#FFFFFF` | Surface, active nav circle |

Raw (not variables): body text `#000`, muted text `rgba(0,0,0,.65)`, input border `#BBB`.

## Typography
- **Inter**: nav labels 11.83 / 500; card text 16 / 400.
- **DM Sans**: button label 16 / 500, line-height 1.3, `opsz 14`.
> Two families, as in Figma. Worth deciding on one later.

## Components

### Bottom navigation (`319:16421`, variants Default=Home / Variant2=Jobs / Variant3=Resume)
- Bar 403 × 78.2, fill `#3A6F91`, radius 54.6 (full pill), floating.
- Items: Home, Jobs, Resume. Icon 27.3px (stroke), label Inter Medium 11.83 below.
- Inactive: white icon and white label.
- Active: white circle 81px with a 5.46px `#3A6F91` ring, raised 10.9px above the bar's top edge. Icon and label become `#3A6F91`.
- Icons: `design-system/icons/{home,jobs,resume}-{active,light}.svg` (exported from Figma).
- The desktop/tablet variant is a vertical rail, 123px wide (`188:1585`), with the same active-circle treatment.

### Pages built (code in `student-app/`, run on port 5174)
| Screen | Figma | Code |
|---|---|---|
| Home / Student dashboard | `319:16543` | `pages/Home.tsx` |
| Jobs list (+ search, not in Figma) | `319:16582` | `pages/Jobs.tsx` → `JobList` |
| Company · Jobs tab | `319:16787` | `CompanyView` |
| Company · Job detail | `319:16696` | `JobDetail` |
| Select Resume sheet | `319:16728` | `ResumeSheet` |
| Company · Stats tab | `319:16841` | `Stats` |
| Resume · pointer view (desktop design, adapted) | `366:20296` | `pages/Resume.tsx` → `EntryList` |
| Resume · visual view (desktop design, adapted) | `469:3915` | `VisualResume` |
| Resume · proof agent | `468:3837` | `AgentCard` |

Resume on mobile:
- Desktop 2-column card grid becomes one column. Section tabs scroll sideways; the active one is a `new-teal` `#43aec4` pill.
- The visual view's side panel (Font / Colour / Margin / Layout / Print / Saved Resume) becomes a toolbar that scrolls sideways above the preview. The preview is an A4 page built in HTML from the entries (not the template PNG), scaled to the screen width. Tap it to zoom to full size.
- Proof states: none (outline `#636363`), checking (spinner), rejected (red outline + agent card), submitted anyway (filled primary light), verified (filled secondary dark + check).
- The agent card opens right under the card it's about. For now the "agent" is a stand-in: it only checks the file name for the required documents (`data/resume.ts` → `checkProof`). Required proofs are listed for each type: corporate internship, research internship, POR, project.
- New pointer form keeps the card anatomy: grey `.03` card with white unstroked fields (r12 for text, r30 pills like the visual-view tool chips). Focus shows a soft lift shadow, not a stroke. Type select, From/To month pickers plus a "Present" chip; an end date before the start date blocks Save. Cancel is a text button and Save is the primary filled pill.
- Pointers carry `start`/`end` (YYYY-MM). They're shown on the card ("May 2025 – Jul 2025") and in the resume preview.

### Resume style controls (`350:18291`) — `components/VisualResume.tsx`
- White pills on a `.03` panel: Font ▾, Colour (5 dots → accent for the header bar, rules and links), Margin with ▲/▼ (4px steps, 0–48px), Layout ▾ + Print.
- **Customize → custom layout**: switches the page to free-form boxes on a 4px grid.
  - It starts from a layout like the current one: intro and summary on top, sections on the left, Skills/Education on the right.
  - Drag on an empty part of the page to draw a box. Drag a box to move it; drag its corner handle to resize.
  - The Layout panel sets what the selected box shows (Text, Intro, Summary or any section), its text, and its exact X/Y/W/H. You can also delete it, add a box, or reset the layout.
  - Keyboard: arrow keys nudge the selected box (Shift = 16px); Delete removes it.
  - **Done** leaves edit mode and keeps the custom layout. Picking a template switches back, and the boxes are kept.
  - Boxes are stored with the style, so they're included in saved resumes.
- The page zoom moved from tapping the page to a "Zoom page" link, so taps on the page can be used for editing.
- **Font panel** (`350:18314`): font family select, then a row for each of Intro / Heading / Subheading / Body / Date with size, **B**, *I* and a colour dot (tap to cycle). Defaults come from Figma (16/16/12/10/10). Intro sets the name at 1.5× its size.
- **Layout panel** (`411:6185`): 3 templates (two columns with main left, two columns with main right, single column). Customize shows a Hide/Show for each section. Section order rows can be dragged or moved with ↑/↓.
- In two-column templates, Skills and Education go in the narrow column.
- Phone: the pills wrap and an open panel takes a full row. Laptop: a 215px column beside the page; panels are 193px, as in Figma.

### Saved resumes
- The "Saved Resume" pill (`469:3962`) moved into the top bar as **Save resume** (icon-only on phone). It asks for a name; the default is "Resume N", or the current save's name. Saving with an existing name updates that save.
- Saved resumes appear as chips right after the Save button, newest first. Tapping one loads its content and style.
  - Laptop: one line with the title, then Save and the chips left-aligned beside it, then the view toggle at the far right.
  - Phone: title + toggle on the first line, Save + chips (which scroll sideways) underneath.
- The same list feeds the Jobs **Select Resume** sheet. It starts with Resume 1–3 so it matches `319:16728`.
- Saves are kept in this browser's localStorage (`pp-student-saved-resumes-v1`) until there's a backend.

### Home layout + stats (no Figma — built from existing components)
- Laptop: quick links (Blog, Calendar) in a 240px left column, applied jobs in 2 columns on the right, and stats across the full width below.
- Phone: applied → quick links → stats, stacked.
- Stats use the company Stats tab's look (`319:16841`): `secondary-light` bars on a `tertiary-light` track, values in `primary-dark`. Status colours only appear with text labels.
  - Headline tiles: Applied, Shortlist rate (shortlisted ÷ decided), Open roles.
  - Application status: one segmented bar plus a legend with counts.
  - Applications by category: horizontal bars.
  - Applicants per role: columns.
  - All computed from the sample data in `data/data.ts`.

### Pointer feedback (no Figma — student side of the staff portal's Approve / Feedback flow)
- Each pointer carries `review` (`in-review` / `changes` / `approved`) and a `feedback` thread (coordinator, student and system messages).
- **Feedback icon** in the Resume top bar: a round chat button (40px phone / 63px laptop), with an amber badge counting pointers that need changes.
  - Tapping it opens a **Feedback list**: every pointer with coordinator feedback, the ones needing changes first.
  - Each item shows the pointer, its status, the coordinator's open request and which section and date it's from.
  - Tapping an item switches tab, opens that pointer's thread and highlights the card.
  - On phone the list drops down across the full header width.
- **Tab dot** (amber) marks sections with pointers that need changes.
- **Minimal card** (from the user's mock):
  - Title on the left, dates on the right.
  - A small status word under the title, only for Needs changes or Approved.
  - Description, then the link field across the full width.
  - Then the **proof row**:
    - One chip per document, "PDF | OFFER LETTER" with a grey ✕ block (white, 1px `tertiary-light` border, r10).
    - A dashed **+** to attach another document; it reads "+ Add proof" when there are none.
    - The proof state as text: Checking / Needs other proof (red) / ✓ Submitted / ✓ Verified (green).
    - The feedback and edit icons at the far right.
  - Proof flow: each new file is checked by the agent. A pass makes the state **Submitted** (sent to the coordinator). A fail flags that chip in red and opens the agent card, where **Reupload** replaces the flagged file. ✕ removes a file. **Verified** is set only when the coordinator accepts the proof.
- **Compact by default** (latest): every pointer is a short summary, about 130–150px tall.
  - Title with the Needs work / Approved pill, and dates.
  - Description clamped to 2 lines.
  - One grey line: ✉ link · "2 files · ✓ Submitted" (or "No proof yet"), then edit ✎ and a ⌄ chevron, which gets an amber dot when the pointer needs work.
  - Tap the summary or the chevron to expand. The expanded part (under a hairline) holds the proof chips and +, and the conversation: the needs-work thread with Re-upload / Appeal, or the read-only thread with Reply.
  - Opening a pointer from the feedback list expands it.
  - Laptop cards drop the 257px desktop height; the + tile is 140px on laptop and 88px on phone.
- **Feedback arrives as a notification (latest)**:
  - When the prototype opens nothing has been reviewed. Each pointer shows only **✓ Uploaded** or **Not uploaded** (no pills, no Feedback toggle, no badge).
  - 75 s after the splash, a notification slides in at the top of the app: "Your coordinator reviewed your resume · 3 pointers need work · 1 approved", with **View** and ✕. It leaves by itself after 12 s. View goes to Resume and opens the feedback list.
  - The review then lands on the draft and on saved resumes: Microsoft, Google and Placement Committee need work, and Design Club is approved (proof becomes Verified). The student's own edits and files are kept.
  - `?feedbackIn=5` in the URL makes it arrive after 5 s, for demos. Saved resumes moved to the localStorage key `pp-student-saved-resumes-v2`.
- **Pointer card (user mock, latest)**: the original card (laptop 257px min, padding 37/34) with the full description.
  - Header: title (+ Needs work / Approved pill after review) on the left; dates, the feedback icon (after review) and a faint edit ✎ on the right.
  - **No proof**: link field and the original outlined **↑ Proof** button (`#636363` outline, r70) on one row.
  - **Proof uploaded**: link field across the card, then one row of file chips (PDF | NAME with grey ✕), a dashed **+**, and **✓ Submitted**.
- **Card actions (supersedes the notes below where they differ)**:
  - Proof chips stay visible on every card, followed by the original **Proof** button (pill r70, 32h, `rgba(80,132,164,.8)`, white upload icon + "Proof"). On a needs-work pointer with one flagged file, Proof replaces that file (tooltip "Replace PDF | …"); otherwise it adds a document.
  - Feedback is hidden behind a small **Feedback** toggle on the link line (amber text + dot when the pointer needs work). Approved pointers show no coordinator comments and no toggle, and are left out of the top feedback list.
  - Reply is gone (it duplicated Appeal). The only response inside the feedback panel is the **Appeal** pill.
- **Needs-work card** (user mock, 2nd — now shown when expanded):
  - Amber 1.5px border (`#F0B64A`) and a **Needs work** pill beside the title (approved pointers get a green **Approved** pill). A small edit pencil sits after the date.
  - The proof file the coordinator commented on gets an amber outline. The proof row keeps its normal state (e.g. ✓ Submitted).
  - Under the conversation are **two separate options**, side by side (stacked below 360px):
    - **↑ Re-upload** (amber outline): "Replace PDF | OFFER LETTER with a new document". It replaces the flagged file. When the agent passes it, the pointer goes back to **In review** and a note is added to the thread.
    - **Appeal** (primary-light outline): "Your proof is right? Ask for a re-check". It opens an appeal form in place of the two options, with a reason, "Attach supporting file", and Cancel / **Send appeal** (disabled until there's a reason). After sending, the button reads "Appeal again".
  - The conversation is always shown on the card:
    - Coordinator notes: white, with a 3px amber left edge. "Coordinator · on PDF | OFFER LETTER" names the file the note is about.
    - A divider, then your messages as right-aligned bordered bubbles ("You" or "You · appeal") with any attached documents as chips.
    - System notes centred in grey.
    - After an appeal: "Appeal sent · the coordinator re-checks within 24 h".
  - Reply box: a plain pill input and an outlined **Reply**, for questions. Appeals and re-uploads go through their own options.
- Review label for `changes` is now **Needs work** everywhere (badge, list, pill).
- **Thread** (pointers in review or approved, opened from the icon): the reply box is hidden. Actions are **Reply** (opens the box, which closes again after sending or on ✕/Esc), **Reupload proof** (attaches a new document), and **Edit and resubmit** when changes are needed.
- **Thread**: coordinator bubbles on the left, the student's on the right, system notes centred. A reply field with a send button sits at the bottom. When changes are needed there's also "Edit pointer and resubmit".
- **Edit**: unstroked white fields (same as the new-pointer form). The coordinator's open requests are listed while you edit.
  - Saving a change to an approved or needs-changes pointer sends it back to **In review** and adds a system note to the thread.
  - New pointers start **In review**.
- Status text colours: Needs changes = darker amber `#A87400`, In review = grey `#6F828D`, Approved = green. Always a word, never colour alone.
- Sample feedback lives in `data/resume.ts` (`seedReviews`). There's no backend yet, so coordinator replies don't arrive live.

### Splash screen (`474:4030`) — `components/Splash.tsx`, `SplashMark.tsx`
- The mark is inline SVG, so the **flower** (4 lobes with the diamond cut-out, pivot 551.4/482.5) and the **hexagon star** (pivot 547.2/483.6) animate separately.
- Timeline (~3s):
  1. The mark zooms in from 35% (0.9s).
  2. The flower spins 360° clockwise while the star spins 360° counter-clockwise (2.6s, ease-in-out).
  3. "Placement Portal" fades up underneath.
  4. At 2.3s the mark zooms 9× through the screen as the splash fades to the app.
- Tap anywhere to skip. Reduced-motion users get a short static splash.
- Background: radial white → `#F4EBFB` → `secondary-light`. Shown on every app load, inside the phone frame or across the whole laptop view.
- The wordmark isn't in the Figma frame; it was added under the mark.

### Phone / Laptop preview toggle
- The pill at the bottom right switches the device (saved in localStorage `pp-student-device`). It's hidden below 600px wide, where the app is always phone view.
- **Phone**: bottom pill nav. On screens ≥600px wide it renders in a 440 × 904 device frame.
- **Laptop**: 123px side rail (`188:1585`, active item = 109px white circle with a 10px ring, items every 114px from y = 140). Content starts 61px after the rail.
  - Resume follows the desktop frames: 32px title, 24px tabs, 2-column card grid, and the visual view as pointers + preview side by side at 501 : 904.
  - Home and Jobs have no desktop designs, so they reuse the phone components in wider grids.
- The FAB (82px add circle) from the visual view isn't used on mobile because it would collide with the bottom nav. Adding happens from the + tile in the pointer view.

Flow: Jobs list → card opens company, SIGN opens that job → job SIGN opens the resume sheet → pick a resume → Apply (toast; button becomes APPLIED).

Deviations / additions:
- **Search bar** on Jobs (requested): 44h, r10, `tertiary/light` stroke like the PDF field; matches company, role, description, category; works with the category chip (tap active chip to clear).
- Home statuses are varied (Figma has all pending) so the filter chips do something.
- Company About tab has no design, so it uses the job detail paragraph style.
- "Not eligible" job: card looks as designed; on the detail page SIGN is disabled with a note.
- Resume thumbnails are drawn as grey lines (Figma uses the "Flow Block" placeholder font); selected one gets a primary outline (not in Figma). Apply stays disabled until one is picked.
- Stats uses DM Sans throughout (Figma mixes in Arimo).
- Logos: only BCG has an image; other companies show initials on the same grey circle.

### Primary button "Apply" (`319:16361`)
- 152 × 43, radius 8, fill `rgba(80,132,164,.8)`, label DM Sans Medium 16, white, centred.
- Variant2 looks the same in Figma. Treat it as pressed/hover until it has a design.

### Experience / resume point card (`319:16345`)
- Radius 20, 1px stroke `rgba(80,132,164,.8)`, white, padding 40 (desktop size; reduce on phone).
- Title (company) Inter 16. Description Inter 16, black.
- Footer row:
  - **Link field**: pill (r132), 1px `#BBB` stroke, px10 py5, mail icon 20px + text `rgba(0,0,0,.65)`.
  - **Proof button**: pill (r70), 32h, fill `rgba(80,132,164,.8)`, upload icon 20px + "Proof" white Inter 16, gap 10.
