import { KITS_READING as KITS_READING_FULL } from './kits-reading'
import { KITS_WRITING as KITS_WRITING_FULL } from './kits-writing'
// ============================================================
// مكتبة معايير برنامج صعوبات التعلم — المرحلة الابتدائية
// المصدر: الاختبارات التشخيصية لذوي صعوبات التعلم في مادتي
// اللغة العربية والرياضيات بالمرحلة الابتدائية، الإدارة العامة
// للتربية الخاصة والإدارة العامة للتقويم وجودة التعليم،
// وزارة التعليم، ١٤٣٧/١٤٣٨هـ. الترميز: الرقم الأول من اليمين
// للصف والثاني لرقم المعيار.
// ============================================================

export type SkillDomain = 'reading' | 'writing' | 'vocab' | 'listening'

export interface Criterion {
  /** مثل '1/1' — رقم المعيار ثم الصف */
  code: string
  grade: number
  num: number
  domain: SkillDomain
  text: string
  /** المحك الرسمي كما في كراسة المعلم */
  mastery?: string
  masteryNote?: string
}

export const DOMAIN_LABEL: Record<SkillDomain, string> = {
  reading: 'قراءة',
  writing: 'كتابة وإملاء',
  vocab: 'مفردات وفهم',
  listening: 'استماع',
}

export const DOMAIN_SHORT: Record<SkillDomain, string> = {
  reading: 'قراءة',
  writing: 'كتابة',
  vocab: 'فهم',
  listening: 'استماع',
}

export const CRITERIA: Criterion[] = [
  // ---------- الصف الأول ----------
  { code: '1/1', grade: 1, num: 1, domain: 'reading', text: 'قراءة الحروف الهجائية كاملة بأصواتها القصيرة والطويلة والساكنة.', mastery: '100%', masteryNote: 'قراءة الحروف الثمانية والعشرين كلها بصوت واضح' },
  { code: '2/1', grade: 1, num: 2, domain: 'writing', text: 'كتابة الحروف الهجائية كاملة بأشكالها المختلفة من الذاكرة البعيدة.', mastery: '100%' },
  { code: '3/1', grade: 1, num: 3, domain: 'reading', text: 'قراءة كلمات مع الحركة الطويلة والقصيرة.', mastery: '60%' },
  { code: '4/1', grade: 1, num: 4, domain: 'writing', text: 'كتابة كلمات مع الحركة الطويلة والقصيرة من الذاكرة القريبة.', mastery: '60%' },
  { code: '5/1', grade: 1, num: 5, domain: 'reading', text: 'قراءة كلمات فيها ظواهر لغوية (التاء المربوطة والمفتوحة والهاء).', mastery: '60%' },
  { code: '6/1', grade: 1, num: 6, domain: 'writing', text: 'كتابة كلمات فيها ظواهر لغوية (التاء المربوطة والمفتوحة والهاء) من الذاكرة القريبة.', mastery: '60%' },
  { code: '7/1', grade: 1, num: 7, domain: 'reading', text: 'قراءة كلمات فيها ظواهر لغوية (اللام الشمسية والقمرية والتضعيف).', mastery: '60%' },
  { code: '8/1', grade: 1, num: 8, domain: 'writing', text: 'كتابة كلمات فيها ظواهر لغوية (اللام الشمسية والقمرية والتضعيف) من الذاكرة القريبة.', mastery: '60%' },
  { code: '9/1', grade: 1, num: 9, domain: 'reading', text: 'قراءة كلمات فيها ظواهر لغوية (تنوين الفتح والضم والكسر).', mastery: '60%' },
  { code: '10/1', grade: 1, num: 10, domain: 'writing', text: 'كتابة كلمات فيها ظواهر لغوية (تنوين الفتح والضم والكسر) من الذاكرة القريبة.', mastery: '60%' },
  { code: '11/1', grade: 1, num: 11, domain: 'writing', text: 'كتابة جمل مكونة من كلمتين أو ثلاث كلمات من الذاكرة البعيدة.', mastery: '60%' },
  { code: '12/1', grade: 1, num: 12, domain: 'reading', text: 'تحليل الجمل إلى كلمات والكلمات إلى مقاطع والمقاطع إلى أصوات.', mastery: '60%' },
  { code: '13/1', grade: 1, num: 13, domain: 'reading', text: 'قراءة نص مشكول عدد كلماته (١٢) كلمة.', mastery: '60%', masteryNote: '٦٠٪ يعادل قراءة ٨ كلمات صحيحة من ١٢' },
  // ---------- الصف الثاني ----------
  { code: '1/2', grade: 2, num: 1, domain: 'reading', text: 'قراءة نص مشكول عدد كلماته (٤٠) كلمة.', mastery: '60%', masteryNote: '٦٠٪ يعادل قراءة ٢٤ كلمة صحيحة من ٤٠' },
  { code: '2/2', grade: 2, num: 2, domain: 'vocab', text: 'اكتشاف دلالات الكلمات الجديدة من خلال الترادف والتضاد.', mastery: '80%' },
  { code: '3/2', grade: 2, num: 3, domain: 'writing', text: 'نسخ نصوص قصيرة في حدود سطرين إلى ثلاثة أسطر.', mastery: '80%' },
  { code: '4/2', grade: 2, num: 4, domain: 'writing', text: 'كتابة نصوص قصيرة في حدود (١٠) كلمات من الذاكرة البعيدة.', mastery: '80%' },
  { code: '5/2', grade: 2, num: 5, domain: 'writing', text: 'ترتيب كلمات لبناء جملة مفيدة.', mastery: '80%' },
  { code: '6/2', grade: 2, num: 6, domain: 'reading', text: 'استنتاج المعنى العام لما يقرأ.', mastery: '80%' },
  // ---------- الصف الثالث ----------
  { code: '1/3', grade: 3, num: 1, domain: 'writing', text: 'رسم كلمات مهموزة في (أولها ووسطها وآخرها).', mastery: '80%' },
  { code: '2/3', grade: 3, num: 2, domain: 'reading', text: 'قراءة نص مشكول عدد كلماته (١١٠) كلمة مع مراعاة صحة الوقف وسلامة الوصل.', mastery: '80%' },
  { code: '3/3', grade: 3, num: 3, domain: 'writing', text: 'كتابة نصوص قصيرة في حدود (١٢) كلمة من الذاكرة البعيدة.', mastery: '80%' },
  { code: '4/3', grade: 3, num: 4, domain: 'writing', text: 'ترتيب جمل قصيرة لبناء نص مترابط.', mastery: '80%' },
  { code: '5/3', grade: 3, num: 5, domain: 'listening', text: 'عرض أفكار النص الذي استمع إليه.', mastery: '80%' },
  // ---------- الصف الرابع ----------
  { code: '1/4', grade: 4, num: 1, domain: 'reading', text: 'قراءة النصوص قراءة جهرية متسمة بجودة الأداء وسلامة النطق وتلوين الصوت تبعًا لأساليب المقروء.', mastery: '80%' },
  { code: '2/4', grade: 4, num: 2, domain: 'writing', text: 'توظيف علامات الترقيم (النقطة والنقطتين والفاصلة وعلامة التعجب وعلامة الاستفهام).', mastery: '80%' },
  { code: '3/4', grade: 4, num: 3, domain: 'writing', text: 'كتابة كلمات حذفت الألف من وسطها.', mastery: '80%' },
  { code: '4/4', grade: 4, num: 4, domain: 'writing', text: 'دخول اللام المكسورة على الكلمات المبدوءة بأل.', mastery: '80%' },
  { code: '5/4', grade: 4, num: 5, domain: 'writing', text: 'كتابة كلمات مختومة بالتاء المربوطة والتاء المبسوطة.', mastery: '80%' },
  { code: '6/4', grade: 4, num: 6, domain: 'writing', text: 'كتابة الكلمات المسبوقة بأل والمسبوقة بالباء والكاف والفاء.', mastery: '80%' },
  { code: '7/4', grade: 4, num: 7, domain: 'writing', text: 'كتابة الألف اللينة في آخر الحروف والأسماء والأفعال.', mastery: '80%' },
  // ---------- الصف الخامس ----------
  { code: '1/5', grade: 5, num: 1, domain: 'reading', text: 'قراءة نصوص مع مراعاة صحة الوقف وسلامة الوصل وتمثيل المعنى.', mastery: '80%' },
  { code: '2/5', grade: 5, num: 2, domain: 'reading', text: 'الإجابة عن أسئلة تفصيلية حول نصوص من الكتاب المقرر.', mastery: '80%' },
  { code: '3/5', grade: 5, num: 3, domain: 'vocab', text: 'اكتشاف معاني الكلمات الجديدة من خلال الترادف والتضاد والسياق.', mastery: '80%' },
  { code: '4/5', grade: 5, num: 4, domain: 'writing', text: 'كتابة كلمات تحتوي على الهمزة المتوسطة على الألف.', mastery: '80%' },
  { code: '5/5', grade: 5, num: 5, domain: 'writing', text: 'كتابة كلمات تحتوي على الهمزة المتوسطة على الواو.', mastery: '80%' },
  { code: '6/5', grade: 5, num: 6, domain: 'writing', text: 'كتابة كلمات تحتوي على الهمزة الممدودة في أول الكلمة ووسطها.', mastery: '80%' },
  // ---------- الصف السادس ----------
  { code: '1/6', grade: 6, num: 1, domain: 'reading', text: 'قراءة نصوص المقرر قراءة صامتة في الزمن المحدد مع الفهم والاستيعاب.', mastery: '80%' },
  { code: '2/6', grade: 6, num: 2, domain: 'writing', text: 'كتابة كلمات بها همزة الوصل وهمزة القطع وهمزة ابن.', mastery: '80%' },
  { code: '3/6', grade: 6, num: 3, domain: 'reading', text: 'قراءة نصوص مع مراعاة صحة الوقف وسلامة الوصل وتمثيل المعنى.', mastery: '80%' },
  { code: '4/6', grade: 6, num: 4, domain: 'writing', text: 'كتابة كلمات بها همزة متوسطة بأشكالها.', mastery: '80%' },
  { code: '5/6', grade: 6, num: 5, domain: 'writing', text: 'كتابة كلمات بها همزة متطرفة بأشكالها.', mastery: '80%' },
  { code: '6/6', grade: 6, num: 6, domain: 'writing', text: 'كتابة الألف اللينة في (الأسماء والأفعال والحروف).', mastery: '80%' },
  { code: '7/6', grade: 6, num: 7, domain: 'writing', text: 'كتابة أسماء مقصورة ومنقوصة وممدودة منونة.', mastery: '80%' },
]

export const criterionByCode = (code: string): Criterion | undefined =>
  CRITERIA.find((c) => c.code === code)

export const GRADE_LABEL: Record<number, string> = {
  1: 'الصف الأول',
  2: 'الصف الثاني',
  3: 'الصف الثالث',
  4: 'الصف الرابع',
  5: 'الصف الخامس',
  6: 'الصف السادس',
}

// ============================================================
// عدّة التدريس: عرض تقديمي + أنشطة تفاعلية + تقويم ختامي
// (كل معايير القراءة والفهم جاهزة في kits-reading.ts)
// ============================================================


export type Slide =
  | { kind: 'intro'; phase: string; title: string; body: string; prompt?: string }
  | { kind: 'passage'; phase: string; title: string; text: string; note?: string }
  | { kind: 'letters'; phase: string; title: string; note?: string; groups: { label: string; items: string[] }[] }
  | { kind: 'compare'; phase: string; title: string; rows: { a: string; b: string; label?: string }[]; note?: string }
  | { kind: 'quiz'; phase: string; title: string; question: string; options: string[]; answer: number; hint?: string; passage?: string }
  | { kind: 'wrap'; phase: string; title: string; body: string; next?: string }

export interface QuizItem {
  prompt: string
  passage?: string
  options: string[]
  answer: number
  hint?: string
}

export interface KitActivity {
  id: string
  title: string
  blurb: string
  items: QuizItem[]
}

export type Assessment =
  | { mode: 'mcq'; title: string; items: QuizItem[]; passPct: number }
  | { mode: 'tally'; title: string; passage: string; passPct: number; note?: string }

export interface SkillKit {
  code: string
  slides: Slide[]
  activities: KitActivity[]
  assessment: Assessment
}

export { KITS_READING } from './kits-reading'
export { KITS_WRITING } from './kits-writing'
export const KITS: Record<string, SkillKit> = { ...KITS_READING_FULL, ...KITS_WRITING_FULL }

export const KIT_CODES = Object.keys(KITS)
