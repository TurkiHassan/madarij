import type { ActivityDef, ActivityResult, Goal, Passage, Probe, Student } from '../types'

export const PROBE_DATES = [
  '2026-09-30',
  '2026-10-07',
  '2026-10-14',
  '2026-10-21',
  '2026-10-28',
  '2026-11-04',
  '2026-11-11',
  '2026-11-18',
]

export const TODAY = '2026-11-21'

export const PASSAGES: Passage[] = [
  {
    id: 'ant',
    title: 'النملة الصغيرة',
    words: 57,
    text: 'خرجتِ النَّملةُ الصَّغيرةُ من بيتِها في صباحٍ مُشْمِسٍ. رَأتْ حَبَّةَ قَمْحٍ كبيرةً على الأرضِ، فحاولتْ أنْ تَحْمِلَها وَحْدَها. لكنَّ الحَبَّةَ كانتْ ثقيلةً. ذهبتِ النَّملةُ إلى صديقاتِها، فَسَاعَدْنَها في حَمْلِ الحَبَّةِ إلى البيتِ. فَرِحَتِ النَّملةُ، وَعَلِمَتْ أنَّ التَّعاونَ يُسَهِّلُ العَمَلَ الصَّعبَ.',
  },
  {
    id: 'souq',
    title: 'السوق القديم',
    words: 58,
    text: 'في يَوْمِ الخَميسِ ذَهَبَ سَعيدٌ معَ وَالِدِهِ إلى السُّوقِ القديمِ. رَأى أَكْوَابًا مَنْقوشةً، وسَجَّادًا مُلوَّنًا، وبائعينَ يُنادونَ على سِلَعِهِم. اشتَرى وَالِدُهُ كِيلو مِنَ التَّمْرِ، واشتَرى سَعيدٌ دَفْتَرًا صَغيرًا. وفي الطَّريقِ إلى البيتِ، قالَ سَعيدٌ: «أَحَبُّ هَذا السُّوقَ لأنَّ فيهِ رائحةَ الماضي».',
  },
  {
    id: 'water',
    title: 'الماء سرّ الحياة',
    words: 62,
    text: 'الماءُ نِعْمَةٌ كبيرةٌ لا نَستَطيعُ العَيشَ بِدونِها. يَشرَبُ الإنسانُ الماءَ، وتَشرَبُ الحَيواناتُ، وتَحْتاجُهُ النَّباتاتُ لِتَنْمُوَ. في بِلادِنا مَصادرُ ماءٍ قَليلةٌ، لِذَلِكَ عَلَيْنا أنْ نُحافِظَ عَلَيْهِ. إغلاقُ الصُّنبورِ عِنْدَ عَدَمِ الحاجةِ، وإصلاحُ التَّسْريبِ، ورَيُّ النَّباتاتِ في الصَّباحِ، كُلُّها خُطواتٌ صَغيرةٌ تَصْنَعُ فَرْقًا كَبيرًا.',
  },
]

function makeProbes(
  key: string,
  values: number[],
  accuracies: number[],
  passages: string[],
  notes: (string | undefined)[] = [],
): Probe[] {
  return values.map((value, i) => ({
    id: `${key}-p${i + 1}`,
    date: PROBE_DATES[i],
    value,
    accuracy: accuracies[i],
    errors: Math.max(1, Math.round(value * (1 - accuracies[i] / 100))),
    passage: passages[i % passages.length],
    note: notes[i],
  }))
}

const goal = (g: Goal): Goal => g

export const STUDENTS: Student[] = [
  {
    id: 'abdullah',
    name: 'عبدالله الحربي',
    grade: 'الثالث الابتدائي',
    classroom: 'الصف الثالث — أ',
    color: '#2C6FA8',
    interest: 'الصقور والخرائط',
    note: 'يتحسن عندما يقرأ بصوت مسموع، ويحتاج إلى تقليل المشتتات في أول خمس دقائق.',
    supports: ['وقت إضافي 50%', 'قراءة التعليقات بصوت عالٍ', 'تكبير الخط'],
    goals: [
      goal({
        id: 'abdullah-g1',
        domain: 'fluency',
        title: 'الطلاقة القرائية',
        statement:
          'أن يقرأ عبدالله نصًا قصيرًا مناسبًا لمستواه بمعدل 45 كلمة صحيحة في الدقيقة، بدقة 95%، في ثلاث محاولات متتالية خلال ستة أسابيع.',
        baseline: 22,
        target: 45,
        unit: 'كلمة صحيحة/دقيقة',
        due: '2026-12-24',
        status: 'active',
        strategies: ['قراءة متكررة لنص مألوف', 'متابعة المؤشر بالإصبع', 'قراءة زوجية مع المعلم'],
        supports: ['نص بخط كبير', 'بدون مؤقت مرئي'],
      }),
      goal({
        id: 'abdullah-g2',
        skillCode: '6/2',
        domain: 'comprehension',
        title: 'الفكرة الرئيسة',
        statement: 'أن يستخرج الفكرة الرئيسة من نص معلوماتي من ثلاثة أسطر في 4 من 5 نصوص.',
        baseline: 40,
        target: 80,
        unit: 'نسبة الإتقان',
        due: '2026-12-18',
        status: 'active',
        strategies: ['سؤال قبل القراءة', 'تحديد الجملة المفتاحية', 'تلخيص بجملة واحدة'],
        supports: ['خيارات مصورة', 'وقت إضافي'],
      }),
    ],
    probes: makeProbes(
      'abdullah',
      [22, 24, 23, 27, 29, 28, 33, 36],
      [89, 91, 90, 93, 94, 92, 95, 96],
      ['النملة الصغيرة', 'السوق القديم', 'الماء سرّ الحياة'],
      [undefined, undefined, 'توقف عند كلمة غير مألوفة، احتاج تلميحًا.', undefined, undefined, 'يوم عودة من إجازة قصيرة.'],
    ),
    results: [
      { id: 'r1', date: '2026-11-16', activityId: 'comp-mainidea', score: 4, total: 6, duration: 5 },
    ],
  },
  {
    id: 'noura',
    name: 'نورة القحطاني',
    grade: 'الثاني الابتدائي',
    classroom: 'الصف الثاني — ب',
    color: '#E48164',
    interest: 'القطط والرسم',
    note: 'تخلط بين التاء المربوطة والهاء عند الوقف. تحتاج إلى تدريب قصير ومتكرر بدل الجلسة الطويلة.',
    supports: ['قراءة صوتية للتعليمات', 'بطاقات حروف ملموسة'],
    goals: [
      goal({
        id: 'noura-g1',
        domain: 'fluency',
        title: 'الطلاقة القرائية',
        statement:
          'أن تقرأ نورة نصًا قصيرًا مناسبًا لمستواها بمعدل 30 كلمة صحيحة في الدقيقة، بدقة 92%، خلال خمسة أسابيع.',
        baseline: 12,
        target: 30,
        unit: 'كلمة صحيحة/دقيقة',
        due: '2026-12-11',
        status: 'active',
        strategies: ['قراءة جمل قصيرة متكررة', 'نموذج قراءة من المعلم', 'تشجيع فوري'],
        supports: ['نص مشكول', 'وقت إضافي'],
      }),
      goal({
        id: 'noura-g2',
        skillCode: '5/1',
        domain: 'letters',
        title: 'التاء المربوطة والهاء',
        statement: 'أن تميّز بين التاء المربوطة والهاء في نهاية الكلمة في 8 من 10 كلمات.',
        baseline: 50,
        target: 80,
        unit: 'نسبة الإتقان',
        due: '2026-12-04',
        status: 'active',
        strategies: ['مقارنة زوجين من الكلمات', 'لعبة تصنيف', 'تكرار spaced'],
        supports: ['بطاقات ملونة', 'قراءة الكلمة بصوت عالٍ'],
      }),
    ],
    probes: makeProbes(
      'noura',
      [12, 13, 14, 13, 17, 19, 21, 24],
      [86, 88, 89, 87, 91, 92, 93, 94],
      ['النملة الصغيرة', 'السوق القديم'],
    ),
    results: [
      { id: 'r2', date: '2026-11-11', activityId: 'letters-ta', score: 4, total: 6, duration: 4 },
      { id: 'r3', date: '2026-11-18', activityId: 'letters-ta', score: 5, total: 6, duration: 4 },
    ],
  },
  {
    id: 'salman',
    name: 'سلمان العتيبي',
    grade: 'الرابع الابتدائي',
    classroom: 'الصف الرابع — أ',
    color: '#5E7047',
    interest: 'الفضاء والنجوم',
    note: 'يقرأ بسرعة مناسبة لكنه يخسر المعنى عند الاستنتاج. يحتاج إلى التوقف عند نهاية كل فقرة.',
    supports: ['وقت إضافي', 'السماح بالإجابة الشفهية'],
    goals: [
      goal({
        id: 'salman-g1',
        domain: 'fluency',
        title: 'الطلاقة القرائية',
        statement:
          'أن يقرأ سلمان نصًا معلوماتيًا بمعدل 65 كلمة صحيحة في الدقيقة، بدقة 96%، خلال ستة أسابيع.',
        baseline: 46,
        target: 65,
        unit: 'كلمة صحيحة/دقيقة',
        due: '2026-12-24',
        status: 'active',
        strategies: ['نصوص متدرجة الطول', 'تتبع الأخطاء أسبوعيًا'],
        supports: ['نص مطبوع بخط واضح'],
      }),
      goal({
        id: 'salman-g2',
        skillCode: '6/2',
        domain: 'comprehension',
        title: 'الاستنتاج من النص',
        statement: 'أن يجيب عن ثلاثة أسئلة استنتاجية من نص قصير بدقة 80%.',
        baseline: 50,
        target: 80,
        unit: 'نسبة الإتقان',
        due: '2026-12-18',
        status: 'active',
        strategies: ['أسئلة لماذا وكيف', 'ربط النص بالخبرة السابقة'],
        supports: ['خيارات أقل', 'وقت إضافي'],
      }),
    ],
    probes: makeProbes(
      'salman',
      [46, 48, 47, 52, 55, 54, 58, 61],
      [93, 94, 93, 95, 96, 95, 96, 97],
      ['الماء سرّ الحياة', 'السوق القديم'],
    ),
    results: [
      { id: 'r4', date: '2026-10-29', activityId: 'comp-mainidea', score: 4, total: 6, duration: 6 },
      { id: 'r5', date: '2026-11-17', activityId: 'comp-mainidea', score: 5, total: 6, duration: 5 },
    ],
  },
  {
    id: 'reem',
    name: 'ريم الشمري',
    grade: 'الثالث الابتدائي',
    classroom: 'الصف الثالث — ب',
    color: '#C96F52',
    interest: 'الطبخ والحدائق',
    note: 'تتجاوز الحركات عند القراءة السريعة. القراءة البطيئة مع التشكيل تحسّن دقتها.',
    supports: ['نص مشكول بالكامل', 'تكبير الخط'],
    goals: [
      goal({
        id: 'reem-g1',
        domain: 'fluency',
        title: 'الطلاقة القرائية',
        statement:
          'أن تقرأ ريم نصًا قصيرًا بمعدل 40 كلمة صحيحة في الدقيقة، بدقة 95%، خلال ستة أسابيع.',
        baseline: 24,
        target: 40,
        unit: 'كلمة صحيحة/دقيقة',
        due: '2026-12-24',
        status: 'active',
        strategies: ['قراءة مسجلة ثم الاستماع', 'تحديد الكلمات الصعبة قبل القراءة'],
        supports: ['وقت إضافي', 'بدون قراءة أمام الصف'],
      }),
      goal({
        id: 'reem-g2',
        skillCode: '3/1',
        domain: 'spelling',
        title: 'الحركات والتشكيل',
        statement: 'أن تقرأ الكلمات المشكولة قراءة صحيحة مع مراعاة الحركات في 9 من 10 كلمات.',
        baseline: 60,
        target: 90,
        unit: 'نسبة الإتقان',
        due: '2026-12-11',
        status: 'active',
        strategies: ['تدريب الحركات الثلاث', 'مطابقة الكلمة بالصورة'],
        supports: ['بطاقات ملونة'],
      }),
    ],
    probes: makeProbes(
      'reem',
      [24, 26, 25, 29, 31, 30, 34, 37],
      [88, 90, 89, 92, 93, 91, 94, 95],
      ['السوق القديم', 'النملة الصغيرة'],
    ),
    results: [
      { id: 'r6', date: '2026-11-19', activityId: 'spelling-harakat', score: 4, total: 5, duration: 3 },
    ],
  },
  {
    id: 'faisal',
    name: 'فيصل الدوسري',
    grade: 'الثاني الابتدائي',
    classroom: 'الصف الثاني — أ',
    color: '#A75D45',
    interest: 'السيارات والقطارات',
    note: 'يقلب الحروف المتشابهة عند الكتابة. يحتاج إلى وقت قصير جدًا كل يوم بدل حصة واحدة.',
    supports: ['بطاقات حروف', 'وقت إضافي', 'السماح بالإجابة الشفهية'],
    goals: [
      goal({
        id: 'faisal-g1',
        domain: 'fluency',
        title: 'الطلاقة القرائية',
        statement:
          'أن يقرأ فيصل نصًا قصيرًا بمعدل 32 كلمة صحيحة في الدقيقة، بدقة 92%، خلال ستة أسابيع.',
        baseline: 15,
        target: 32,
        unit: 'كلمة صحيحة/دقيقة',
        due: '2026-12-24',
        status: 'active',
        strategies: ['قراءة كلمات مفردة ثم جمل', 'تكرار يومي قصير'],
        supports: ['نص مشكول', 'بدون مؤقت مرئي'],
      }),
      goal({
        id: 'faisal-g2',
        skillCode: '1/1',
        domain: 'letters',
        title: 'الحروف المتشابهة',
        statement: 'أن يفرّق بين الحروف المتشابهة (ب، ت، ث) في مواضع الكلمة المختلفة في 9 من 10 محاولات.',
        baseline: 40,
        target: 90,
        unit: 'نسبة الإتقان',
        due: '2026-12-18',
        status: 'active',
        strategies: ['تشكيل الحرف بالصلصال', 'تمييز سمعي وبصري', 'لعبة تصنيف'],
        supports: ['بطاقات ملموسة'],
      }),
    ],
    probes: makeProbes(
      'faisal',
      [15, 16, 17, 19, 21, 20, 23, 22],
      [84, 86, 85, 89, 90, 88, 91, 92],
      ['النملة الصغيرة', 'السوق القديم'],
    ),
    results: [
      { id: 'r7', date: '2026-11-18', activityId: 'letters-lookalike', score: 4, total: 6, duration: 4 },
    ],
  },
  {
    id: 'jawaher',
    name: 'جواهر العنزي',
    grade: 'الرابع الابتدائي',
    classroom: 'الصف الرابع — ب',
    color: '#7C8870',
    interest: 'البحر والرحلات',
    note: 'قارئة جيدة، لكنها تتوقف عند المفردات الجديدة وتفقد بقية الجملة.',
    supports: ['معجم مصور', 'وقت إضافي'],
    goals: [
      goal({
        id: 'jawaher-g1',
        domain: 'fluency',
        title: 'الطلاقة القرائية',
        statement:
          'أن تقرأ جواهر نصًا معلوماتيًا بمعدل 72 كلمة صحيحة في الدقيقة، بدقة 96%، خلال ستة أسابيع.',
        baseline: 52,
        target: 72,
        unit: 'كلمة صحيحة/دقيقة',
        due: '2026-12-24',
        status: 'active',
        strategies: ['نصوص أطول تدريجيًا', 'تحديد المفردات قبل القراءة'],
        supports: ['معجم مصور'],
      }),
      goal({
        id: 'jawaher-g2',
        skillCode: '2/5',
        domain: 'comprehension',
        title: 'الفكرة الرئيسة',
        statement: 'أن تحدد الفكرة الرئيسة لنص من فقرتين في 4 من 5 نصوص.',
        baseline: 50,
        target: 85,
        unit: 'نسبة الإتقان',
        due: '2026-12-11',
        status: 'active',
        strategies: ['تلخيص كل فقرة بجملة', 'تحديد الجملة المفتاحية'],
        supports: ['وقت إضافي'],
      }),
    ],
    probes: makeProbes(
      'jawaher',
      [52, 55, 54, 58, 60, 59, 63, 66],
      [94, 95, 94, 96, 96, 95, 97, 97],
      ['الماء سرّ الحياة', 'السوق القديم'],
    ),
    results: [
      { id: 'r8', date: '2026-11-15', activityId: 'comp-mainidea', score: 5, total: 6, duration: 5 },
    ],
  },
]

export const ACTIVITIES: ActivityDef[] = [
  {
    id: 'letters-ta',
    title: 'التاء المربوطة أم الهاء؟',
    domain: 'letters',
    skillCode: '5/1',
    blurb: 'ست كلمات قصيرة؛ يختار الطالب نهاية الكلمة الصحيحة. بلا مؤقت، مع تلميح عند الحاجة.',
    minutes: 4,
    items: [
      {
        prompt: 'كلمة (مَدْرَسَة) تنتهي بـ:',
        options: ['تاء مربوطة (ة)', 'هاء (ه)', 'تاء مفتوحة (ت)'],
        answer: 0,
        hint: 'قول الكلمة عند الوقف: مدرسه، ثم ننظر إلى رسم الحرف.',
      },
      {
        prompt: 'كلمة (كِتَابُهُ) تنتهي بـ:',
        options: ['هاء (ه)', 'تاء مربوطة (ة)', 'تاء مفتوحة (ت)'],
        answer: 0,
      },
      {
        prompt: 'أي كلمة تنتهي بتاء مربوطة؟',
        options: ['حَدِيقَة', 'وَجْه', 'بِنْت'],
        answer: 0,
      },
      {
        prompt: 'أي كلمة تنتهي بهاء؟',
        options: ['شَجَرَة', 'فَمُهُ', 'مَعْلُومَات'],
        answer: 1,
      },
      {
        prompt: 'أكمل: ذَهَبَتْ فَاطِمَـ...',
        options: ['ة', 'ه', 'ت'],
        answer: 0,
      },
      {
        prompt: 'أكمل: رَأَيْتُ وَجْـ...',
        options: ['ه', 'ة', 'ت'],
        answer: 0,
      },
    ],
  },
  {
    id: 'letters-lookalike',
    title: 'ب، ت، ث',
    domain: 'letters',
    skillCode: '1/1',
    blurb: 'تمييز الحروف المتشابهة في أول الكلمة ووسطها. مناسب للصف الثاني والثالث.',
    minutes: 4,
    items: [
      {
        prompt: 'أي كلمة تبدأ بحرف (ث)؟',
        options: ['تَمْر', 'ثَلْج', 'بَيْت'],
        answer: 1,
        hint: 'الثاء لها ثلاث نقاط فوقها.',
      },
      {
        prompt: 'أي كلمة فيها حرف (ب)؟',
        options: ['كِتَاب', 'تُفَّاح', 'ثَوْب'],
        answer: 0,
      },
      {
        prompt: 'أكمل: ...َلْج (الماء المتجمد)',
        options: ['ث', 'ت', 'ب'],
        answer: 0,
      },
      {
        prompt: 'أكمل: ...َيْت (المكان الذي نسكنه)',
        options: ['ب', 'ت', 'ث'],
        answer: 0,
      },
      {
        prompt: 'أي كلمة تبدأ بحرف (ت)؟',
        options: ['ثَوْب', 'تُفَّاحَة', 'بَاب'],
        answer: 1,
      },
      {
        prompt: 'أي كلمة تختلف في أول حرف عن كلمة (بَحْر)؟',
        options: ['بَاب', 'بَقَرَة', 'تَمْر'],
        answer: 2,
      },
    ],
  },
  {
    id: 'comp-mainidea',
    title: 'الفكرة الرئيسة',
    domain: 'comprehension',
    skillCode: '6/2',
    blurb: 'نصان قصيران، وسؤالان لكل نص. نقيس الفهم لا سرعة القراءة.',
    minutes: 5,
    items: [
      {
        passage:
          'النَّحْلَةُ تَطيرُ مِنْ زَهْرَةٍ إلى زَهْرَةٍ، وتَجْمَعُ الرَّحِيقَ، ثُمَّ تَصْنَعُ العَسَلَ في خَلِيَّتِها. العَسَلُ غِذاءٌ مُفيدٌ، وفيهِ شِفاءٌ للنَّاسِ.',
        prompt: 'ما الفكرة الرئيسة للنص؟',
        options: ['رحلة النحلة بين الأزهار', 'النحلة تصنع غذاءً مفيدًا', 'ألوان الأزهار'],
        answer: 1,
      },
      {
        passage:
          'النَّحْلَةُ تَطيرُ مِنْ زَهْرَةٍ إلى زَهْرَةٍ، وتَجْمَعُ الرَّحِيقَ، ثُمَّ تَصْنَعُ العَسَلَ في خَلِيَّتِها. العَسَلُ غِذاءٌ مُفيدٌ، وفيهِ شِفاءٌ للنَّاسِ.',
        prompt: 'ماذا تجمع النحلة؟',
        options: ['الرحيق', 'الماء', 'الورق'],
        answer: 0,
      },
      {
        passage:
          'المكتبةُ مكانٌ هادئٌ، فيه كُتُبٌ كثيرةٌ عن العلومِ والقصصِ. يَذهبُ إليها الطلابُ ليقرؤوا ويستعيروا الكتبَ. المحافظةُ على الهدوءِ تُساعدُ الجميعَ على التركيزِ.',
        prompt: 'لماذا يجب أن نلتزم الهدوء في المكتبة؟',
        options: ['لنسمع الموسيقى', 'ليتمكن الجميع من التركيز', 'لنلعب'],
        answer: 1,
      },
      {
        passage:
          'المكتبةُ مكانٌ هادئٌ، فيه كُتُبٌ كثيرةٌ عن العلومِ والقصصِ. يَذهبُ إليها الطلابُ ليقرؤوا ويستعيروا الكتبَ. المحافظةُ على الهدوءِ تُساعدُ الجميعَ على التركيزِ.',
        prompt: 'ماذا يفعل الطلاب في المكتبة؟',
        options: ['يقرؤون ويستعيرون الكتب', 'يشترون الطعام', 'يرسمون على الجدران'],
        answer: 0,
      },
    ],
  },
  {
    id: 'spelling-harakat',
    title: 'الحركات الثلاث',
    domain: 'spelling',
    skillCode: '3/1',
    blurb: 'خمس كلمات لفحص الفتحة والضمة والكسرة والتنوين. يستخدم مع الطالب نص مشكول.',
    minutes: 3,
    items: [
      {
        prompt: 'اختر الحركة الصحيحة: (كِتَاب) تُقرأ ب:',
        options: ['كسرة على الكاف', 'فتحة على الكاف', 'ضمة على الكاف'],
        answer: 0,
      },
      {
        prompt: 'ما الحركة على أول حرف في (قَلَم)؟',
        options: ['فتحة', 'ضمة', 'كسرة'],
        answer: 0,
      },
      {
        prompt: 'أي كلمة تنتهي بتنوين الفتح؟',
        options: ['كِتَابًا', 'كِتَابٌ', 'كِتَابٍ'],
        answer: 0,
      },
      {
        prompt: 'أكمل: ذَهَبَ الطَّالِبُ ... المَدْرَسَةِ',
        options: ['إلى', 'على', 'في'],
        answer: 0,
      },
      {
        prompt: 'أي كلمة فيها مد بالألف؟',
        options: ['بَاب', 'بَيْت', 'قَلَم'],
        answer: 0,
      },
    ],
  },
]

export const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]))

export const ACTIVITY_DOMAIN: Record<string, string> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a.domain]),
)

export function latestProbe(student: Student): Probe | undefined {
  return [...student.probes].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
}

export function previousProbe(student: Student): Probe | undefined {
  return [...student.probes].sort((a, b) => a.date.localeCompare(b.date)).at(-2)
}

export function primaryGoal(student: Student): Goal {
  return student.goals[0]
}

export function goalMastery(student: Student, g: Goal): number | null {
  if (g.domain === 'fluency') {
    const p = latestProbe(student)
    if (!p) return null
    return Math.max(0, Math.min(1, (p.value - g.baseline) / (g.target - g.baseline)))
  }
  const items = student.results.filter((r) => ACTIVITY_DOMAIN[r.activityId] === g.domain)
  if (!items.length) return null
  return items.reduce((sum, r) => sum + r.score / r.total, 0) / items.length
}

export function practiceResults(student: Student, g: Goal): ActivityResult[] {
  return student.results.filter((r) => ACTIVITY_DOMAIN[r.activityId] === g.domain)
}
