export type Domain = 'fluency' | 'comprehension' | 'letters' | 'spelling' | 'vocab'

export type GoalStatus = 'active' | 'achieved' | 'review'

export interface Goal {
  id: string
  domain: Domain
  title: string
  statement: string
  baseline: number
  target: number
  unit: string
  due: string
  status: GoalStatus
  strategies: string[]
  supports: string[]
  /** رمز المعيار الرسمي مثل '5/1' إن رُبط الهدف بمعيار من مكتبة المعايير */
  skillCode?: string
}

export interface Probe {
  id: string
  date: string
  value: number
  errors: number
  accuracy: number
  passage: string
  note?: string
}

export interface ActivityResult {
  id: string
  date: string
  activityId: string
  score: number
  total: number
  duration: number
  kind?: 'نشاط' | 'تقويم ختامي'
  skillCode?: string
}

export interface Student {
  id: string
  name: string
  grade: string
  classroom: string
  color: string
  interest: string
  note: string
  supports: string[]
  goals: Goal[]
  probes: Probe[]
  results: ActivityResult[]
}

export interface FeedbackItem {
  id: string
  createdAt: string
  screen: string
  mood: 'clear' | 'confused' | 'problem' | 'idea'
  note: string
  name: string
}

export interface AppState {
  version: number
  students: Student[]
  feedback: FeedbackItem[]
  fontScale: number
}

export interface Passage {
  id: string
  title: string
  text: string
  words: number
}

export interface ActivityItem {
  prompt: string
  passage?: string
  options: string[]
  answer: number
  hint?: string
}

export interface ActivityDef {
  id: string
  title: string
  domain: Domain
  blurb: string
  minutes: number
  items: ActivityItem[]
  skillCode?: string
}

export const DOMAIN_LABEL: Record<Domain, string> = {
  fluency: 'الطلاقة القرائية',
  comprehension: 'الفهم القرائي',
  letters: 'الحروف والتاء المربوطة',
  spelling: 'التهجئة والحركات',
  vocab: 'المفردات',
}

export const DOMAIN_SHORT: Record<Domain, string> = {
  fluency: 'طلاقة',
  comprehension: 'فهم',
  letters: 'حروف',
  spelling: 'تهجئة',
  vocab: 'مفردات',
}
