export type ProofState = 'none' | 'checking' | 'rejected' | 'submitted' | 'verified'

/* What kind of entry this is decides which proof the agent asks for. */
export type EntryKind = 'corporate internship' | 'research internship' | 'position of responsibility' | 'project'

export interface Entry {
  id: string
  title: string
  kind: EntryKind
  description: string
  link: string
  /** YYYY-MM */
  start?: string
  /** YYYY-MM, or undefined while ongoing ("Present") */
  end?: string
  /** none → nothing uploaded · checking → agent reading the newest file · rejected → agent wants other proof ·
      submitted → sent to the coordinator · verified → coordinator accepted the proof */
  proof: ProofState
  /** The file the agent checked last (shown in the agent card) */
  proofFile?: string
  /** Every proof document attached to this pointer */
  proofFiles?: string[]
  /** Placement coordinator's review of this pointer (staff portal: Approve / Feedback) */
  review?: ReviewState
  /** Conversation about this pointer, oldest first */
  feedback?: FeedbackMsg[]
  /** When the student last appealed the coordinator's call (ms) */
  appealAt?: number
}

/** in-review → waiting for the coordinator; changes → coordinator sent feedback; approved → done */
export type ReviewState = 'in-review' | 'changes' | 'approved'

export interface FeedbackMsg {
  id: string
  from: 'coordinator' | 'student' | 'system'
  text: string
  /** ms since epoch */
  at: number
  /** The proof document a coordinator note is about */
  file?: string
  /** A student message that disputes the coordinator's call */
  kind?: 'appeal'
  /** Documents the student attached to this message */
  attachments?: string[]
}

export const reviewLabel: Record<ReviewState, string> = {
  'in-review': 'In review',
  changes: 'Needs work',
  approved: 'Approved',
}

export interface Section {
  id: string
  name: string
  entries: Entry[]
}

export const requiredProof: Record<EntryKind, { label: string; keywords: string[] }[]> = {
  'corporate internship': [
    { label: 'offer letter', keywords: ['offer'] },
    { label: 'acceptance mail', keywords: ['accept', 'mail', 'email'] },
    { label: 'certificate', keywords: ['certificate', 'cert', 'completion'] },
  ],
  'research internship': [
    { label: 'offer letter', keywords: ['offer'] },
    { label: 'certificate', keywords: ['certificate', 'cert', 'completion'] },
    { label: 'letter of recommendation', keywords: ['lor', 'recommendation'] },
  ],
  'position of responsibility': [
    { label: 'appointment letter', keywords: ['appointment', 'letter'] },
    { label: 'certificate', keywords: ['certificate', 'cert'] },
    { label: 'mail from faculty advisor', keywords: ['mail', 'faculty', 'advisor'] },
  ],
  project: [
    { label: 'GitHub repository', keywords: ['github', 'repo'] },
    { label: 'project report', keywords: ['report'] },
    { label: 'demo recording', keywords: ['demo', 'video', 'recording'] },
  ],
}

/* Prototype "agent": a proof passes if the file name looks like one of the required documents.
   Swap for a real document check when there's a backend. */
export function checkProof(kind: EntryKind, fileName: string): boolean {
  const name = fileName.toLowerCase()
  return requiredProof[kind].some((r) => r.keywords.some((k) => name.includes(k)))
}

/* ---------------- Visual resume style (Figma 350:18291) ---------------- */

export type TextRole = 'intro' | 'heading' | 'subheading' | 'body' | 'date'
export const textRoles: { id: TextRole; label: string }[] = [
  { id: 'intro', label: 'Intro' },
  { id: 'heading', label: 'Heading' },
  { id: 'subheading', label: 'Subheading' },
  { id: 'body', label: 'Body' },
  { id: 'date', label: 'Date' },
]
/** Colours a text role can take (the dots in the Font panel) */
export const textColors = ['#5084a4', '#85bfce', '#636363', '#8ea1ac', '#4a4a4a']

export interface TextStyle {
  size: number
  bold: boolean
  italic: boolean
  color: number // index into textColors
}

export type Template = 'main-left' | 'main-right' | 'single' | 'custom'

/** A box drawn on the page in the custom layout. Coordinates are page px (A4 = 595 × 842). */
export interface Block {
  id: string
  x: number
  y: number
  w: number
  h: number
  /** 'intro' | 'summary' | 'skills' | 'education' | 'text' | a section id */
  content: string
  /** Free text, when content === 'text' */
  text?: string
}

export const PAGE_W = 595
export const PAGE_H = 842

export interface ResumeStyle {
  font: number // index into fonts
  accent: number // index into accent swatches
  margin: number // px
  template: Template
  text: Record<TextRole, TextStyle>
  /** Section ids in print order (content sections + 'skills' + 'education') */
  order: string[]
  hidden: string[]
  /** Boxes for the custom template */
  blocks?: Block[]
}

export const fonts = [
  { label: 'DM Sans', css: "'DM Sans', sans-serif" },
  { label: 'Inter', css: "'Inter', sans-serif" },
  { label: 'Serif', css: "Georgia, 'Times New Roman', serif" },
]

/** Global Colour dots → print-safe ink for rules, links and the header bar */
export const accents = [
  { swatch: '#85bfce', ink: '#2f8fa6' },
  { swatch: '#5084a4', ink: '#3a6f91' },
  { swatch: '#4a4a4a', ink: '#4a4a4a' },
  { swatch: '#636363', ink: '#636363' },
  { swatch: '#d9d9d9', ink: '#8a8a8a' },
]

export const fixedSections = [
  { id: 'skills', name: 'Skills' },
  { id: 'education', name: 'Education' },
]

/* Defaults copied from the Font panel in Figma */
export const defaultStyle: ResumeStyle = {
  font: 0,
  accent: 1,
  margin: 24,
  template: 'single',
  text: {
    intro: { size: 16, bold: false, italic: false, color: 0 },
    heading: { size: 16, bold: true, italic: false, color: 1 },
    subheading: { size: 12, bold: true, italic: false, color: 1 },
    body: { size: 10, bold: false, italic: false, color: 2 },
    date: { size: 10, bold: true, italic: false, color: 3 },
  },
  order: ['work', 'pors', 'projects', 'education', 'skills'],
  hidden: [],
}

export interface SavedResume {
  id: string
  name: string
  style: ResumeStyle
  sections: Section[]
  savedAt: number
}

const MONTHS =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmtMonth = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

/** "Jun 2025 – Aug 2025", "Jun 2025 – Present", or '' when no start date */
export function formatRange(start?: string, end?: string) {
  if (!start) return ''
  return `${fmtMonth(start)} – ${end ? fmtMonth(end) : 'Present'}`
}

const rawSections: Section[] = [
  {
    id: 'work',
    name: 'Work Experience',
    entries: [
      { id: 'w1', title: 'Microsoft', kind: 'corporate internship', description: 'Did task , a , b and c with so and so teams to gather and impleaent data finding from xyz.', link: 'xzy.microsoft.com', start: '2025-05', end: '2025-07', proof: 'submitted', proofFiles: ['offer_letter.pdf', 'completion_certificate.pdf'] },
      { id: 'w2', title: 'Google', kind: 'corporate internship', description: 'Collaborated with multiple departments to streamline the data collection process and enhance reporting efficiency.', link: 'abc.google.com', start: '2024-12', end: '2025-02', proof: 'none' },
      { id: 'w3', title: 'Amazon', kind: 'corporate internship', description: 'Engaged with cross-functional teams to analyze customer feedback and improve service delivery based on insights gained from the data.', link: 'feedback.amazon.com', start: '2024-05', end: '2024-07', proof: 'none' },
    ],
  },
  {
    id: 'pors',
    name: 'PORs',
    entries: [
      { id: 'p1', title: 'Placement Committee', kind: 'position of responsibility', description: 'Student coordinator — managed outreach to 40+ companies and scheduled interview slots for 600 students.', link: 'placements.college.edu', start: '2025-08', proof: 'none' },
      { id: 'p2', title: 'Design Club', kind: 'position of responsibility', description: 'Lead — ran weekly critique sessions and organised the annual design sprint with 120 participants.', link: 'designclub.college.edu', start: '2024-08', end: '2025-05', proof: 'verified', proofFiles: ['appointment_letter.pdf'] },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    entries: [
      { id: 'r1', title: 'Placement Portal', kind: 'project', description: 'Built a mobile-first placement portal for students with job search, applications and resume verification.', link: 'github.com/srishti/portal', start: '2026-01', end: '2026-04', proof: 'none' },
    ],
  },
]

/* Sample coordinator review (staff portal → Resume verification). Messages are examples.
   Nothing is reviewed when the prototype opens — pointers are only Uploaded / Not uploaded.
   1–2 minutes in, this review "arrives" as a notification (see App.tsx → applyFeedback). */
type Review = Pick<Entry, 'review'> & { notes?: { text: string; file?: string }[]; proof?: Entry['proof'] }
const seedReviews: Record<string, Review> = {
  w1: { review: 'changes', notes: [{ file: 'offer_letter.pdf', text: 'The letter doesn’t show your dates – add the completion certificate.' }] },
  w2: { review: 'changes', notes: [{ text: 'Add a number that shows impact, e.g. how much faster reporting got. Also upload the offer letter as proof.' }] },
  p1: { review: 'changes', notes: [{ text: 'Use your role title exactly as it appears on the appointment letter.' }] },
  p2: { review: 'approved', proof: 'verified' },
}

/** Before review: uploaded proof is just "Uploaded" (no verified state yet). */
export const initialSections: Section[] = rawSections.map((s) => ({
  ...s,
  entries: s.entries.map((e) => ({ ...e, proof: e.proof === 'verified' ? 'submitted' : e.proof })),
}))

/** The coordinator's review lands on the current draft (keeps the student's own edits and files). */
export function applyFeedback(sections: Section[], now = Date.now()): Section[] {
  return sections.map((s) => ({
    ...s,
    entries: s.entries.map((e) => {
      const r = seedReviews[e.id]
      if (!r) return e
      const notes: FeedbackMsg[] = (r.notes ?? []).map((n, i) => ({ id: `fb-${e.id}-${i}`, from: 'coordinator', text: n.text, file: n.file, at: now }))
      return { ...e, review: r.review, proof: r.proof ?? e.proof, feedback: [...(e.feedback ?? []), ...notes] }
    }),
  }))
}

/** What the notification says: how many pointers need work / were approved */
export const feedbackSummary = {
  changes: Object.values(seedReviews).filter((r) => r.review === 'changes').length,
  approved: Object.values(seedReviews).filter((r) => r.review === 'approved').length,
}

/** Files attached to a pointer (older saves only have `proofFile`). */
export const proofFilesOf = (e: Entry) => e.proofFiles ?? (e.proofFile && e.proof !== 'none' ? [e.proofFile] : [])

/** "offer_letter.pdf" → "PDF | OFFER LETTER" */
export function proofLabel(file: string) {
  const dot = file.lastIndexOf('.')
  const ext = dot > 0 ? file.slice(dot + 1).toUpperCase() : 'FILE'
  const name = (dot > 0 ? file.slice(0, dot) : file).replace(/[_\-.]+/g, ' ').trim().toUpperCase()
  return `${ext} | ${name}`
}

/** Proof files the coordinator's open notes point at */
export const flaggedFiles = (e: Entry) => [...new Set(openRequests(e.feedback).flatMap((m) => (m.file ? [m.file] : [])))]

/** Coordinator messages since the student last resubmitted: what still needs doing. */
export function openRequests(msgs: FeedbackMsg[] = []) {
  const lastResubmit = msgs.map((m) => m.from).lastIndexOf('system')
  return msgs.slice(lastResubmit + 1).filter((m) => m.from === 'coordinator')
}

/** "20 Nov", or "20 Nov, 3:30 pm" when `withTime` */
export function formatMsgTime(at: number, withTime = false) {
  const d = new Date(at)
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return withTime ? `${date}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : date
}

/* The three resumes the Jobs "Select Resume" sheet shows in Figma (319:16728) */
export const seedSaved: SavedResume[] = (
  [
    ['Resume 1', 'single'],
    ['Resume 2', 'main-left'],
    ['Resume 3', 'main-right'],
  ] as const
).map(([name, template], i) => ({
  id: `saved-${i + 1}`,
  name,
  style: { ...defaultStyle, template },
  sections: initialSections,
  savedAt: 0,
}))
