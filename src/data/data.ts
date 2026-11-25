import bcgLogo from '../assets/images/logo-bcg.png'

export type AppStatus = 'shortlisted' | 'reject' | 'pending'

export interface Application {
  id: string
  company: string
  category: string
  applicants: number
  date: string
  status: AppStatus
}

/* Home → "Companies applied" (Figma 413:6372). Figma shows every row as pending;
   statuses are varied here so the filter chips do something. */
export const applications: Application[] = [
  { id: 'a1', company: 'Meta', category: 'Development', applicants: 56, date: '1/12/2026', status: 'pending' },
  { id: 'a2', company: 'Dre Studio', category: 'Design', applicants: 16, date: '1/12/2026', status: 'shortlisted' },
  { id: 'a3', company: 'Google', category: 'Development', applicants: 56, date: '1/12/2026', status: 'pending' },
  { id: 'a4', company: 'Groww', category: 'Consult', applicants: 53, date: '1/12/2026', status: 'reject' },
  { id: 'a5', company: 'Microsoft', category: 'Development', applicants: 58, date: '1/12/2026', status: 'shortlisted' },
]

export const categories = ['Consulting', 'Design', 'Development', 'Software', 'Quant'] as const
export type Category = (typeof categories)[number]

export interface Job {
  id: string
  companyId: string
  role: string
  category: Category
  dates: string
  summary: string
  stipend: string
  eligible: boolean
}

export interface Company {
  id: string
  name: string
  logo?: string
  summary: string
  about: string[]
  hires: { year: number; count: number }[]
  divisions: { name: string; value: string; pct: number }[]
  alumni: string[]
}

const BCG_ABOUT = [
  "At BCG, you'll work with leaders across industries to tackle their toughest problems and shape lasting impact.",
  'We invest in your growth, wellbeing, and future—empowering you to thrive as your whole self and define success on your own terms.',
]

const ALUM_QUOTE =
  '“Learning to deal with ambiguity and taking it in stride cannot be underestimated. This has served me well professionally as there are so many times when a problem is messy and nebulous and being able to guide the group to a framing and path forward is massively valuable.”'

const defaultStats = {
  hires: [
    { year: 2019, count: 18 },
    { year: 2020, count: 22 },
    { year: 2021, count: 31 },
    { year: 2022, count: 28 },
    { year: 2023, count: 14 },
    { year: 2024, count: 20 },
  ],
  divisions: [
    { name: 'Development', value: '6', pct: 34 },
    { name: 'Software', value: '4', pct: 22 },
    { name: 'Design', value: '3', pct: 18 },
    { name: 'Sales & Marketing', value: '3.0K', pct: 15 },
    { name: 'Corporate Functions', value: '2.1K', pct: 11 },
  ],
  alumni: [ALUM_QUOTE, ALUM_QUOTE],
}

export const companies: Company[] = [
  { id: 'bcg', name: 'Boston consulting group', logo: bcgLogo, summary: 'Job description and stuff about the company and expectations', about: BCG_ABOUT, ...defaultStats },
  { id: 'mck', name: 'McKinsey & Company', summary: 'Seeking talented individuals for strategic consulting roles.', about: BCG_ABOUT, ...defaultStats },
  { id: 'deloitte', name: 'Deloitte', summary: 'Opportunities for innovative minds in consulting and advisory services.', about: BCG_ABOUT, ...defaultStats },
  { id: 'accenture', name: 'Accenture', summary: 'Join our team in delivering cutting-edge technology solutions.', about: BCG_ABOUT, ...defaultStats },
  { id: 'pwc', name: 'PwC', summary: 'Looking for dynamic professionals to enhance our consulting practice.', about: BCG_ABOUT, ...defaultStats },
  { id: 'google', name: 'Google', summary: 'Build products used by billions across search, cloud and devices.', about: BCG_ABOUT, ...defaultStats },
  { id: 'figma', name: 'Figma', summary: 'Shape the tools designers and developers use every day.', about: BCG_ABOUT, ...defaultStats },
  { id: 'jane', name: 'Jane Street', summary: 'Trade, research and build systems in global financial markets.', about: BCG_ABOUT, ...defaultStats },
]

export const jobs: Job[] = [
  // Jobs page list (319:16582) — one consulting role per firm
  { id: 'bcg-c', companyId: 'bcg', role: 'Associate', category: 'Consulting', dates: '12 Jun – 16 Jun 2026', summary: 'Job description and stuff about the company and expectations', stipend: '2,00,000 INR', eligible: true },
  { id: 'mck-c', companyId: 'mck', role: 'Business Analyst', category: 'Consulting', dates: '20 Jun – 24 Jun 2026', summary: 'Seeking talented individuals for strategic consulting roles.', stipend: '2,50,000 INR', eligible: true },
  { id: 'del-c', companyId: 'deloitte', role: 'Analyst', category: 'Consulting', dates: '26 Jun – 30 Jun 2026', summary: 'Opportunities for innovative minds in consulting and advisory services.', stipend: '2,20,000 INR', eligible: true },
  { id: 'acc-c', companyId: 'accenture', role: 'Technology Consultant', category: 'Consulting', dates: '01 Jul – 05 Jul 2026', summary: 'Join our team in delivering cutting-edge technology solutions.', stipend: '2,40,000 INR', eligible: true },
  { id: 'pwc-c', companyId: 'pwc', role: 'Advisory Associate', category: 'Consulting', dates: '06 Jul – 10 Jul 2026', summary: 'Looking for dynamic professionals to enhance our consulting practice.', stipend: '2,30,000 INR', eligible: true },
  // BCG company page (319:16787)
  { id: 'bcg-dev', companyId: 'bcg', role: 'Product Manager', category: 'Development', dates: '12 Jun – 16 Jun 2026', summary: 'Job description and stuff about the company and expectations', stipend: '2,00,000 INR', eligible: true },
  { id: 'bcg-des', companyId: 'bcg', role: 'Product Designer', category: 'Design', dates: '12 Jun – 16 Jun 2026', summary: 'Job description and stuff about the company and expectations', stipend: '2,00,000 INR', eligible: false },
  { id: 'bcg-sw', companyId: 'bcg', role: 'Software Engineer', category: 'Software', dates: '12 Jun – 16 Jun 2026', summary: 'Job description and stuff about the company and expectations', stipend: '2,00,000 INR', eligible: true },
  // Extra roles so the other chips have results (not in Figma)
  { id: 'goo-sw', companyId: 'google', role: 'Software Engineer', category: 'Software', dates: '14 Jul – 18 Jul 2026', summary: 'Build products used by billions across search, cloud and devices.', stipend: '3,00,000 INR', eligible: true },
  { id: 'fig-des', companyId: 'figma', role: 'Product Designer', category: 'Design', dates: '20 Jul – 24 Jul 2026', summary: 'Shape the tools designers and developers use every day.', stipend: '2,60,000 INR', eligible: true },
  { id: 'js-q', companyId: 'jane', role: 'Quant Trader', category: 'Quant', dates: '27 Jul – 31 Jul 2026', summary: 'Trade, research and build systems in global financial markets.', stipend: '4,00,000 INR', eligible: true },
]

export const companyById = (id: string) => companies.find((c) => c.id === id)!
export const jobById = (id: string) => jobs.find((j) => j.id === id)!
