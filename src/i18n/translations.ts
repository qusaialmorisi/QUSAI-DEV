import type { Language, SkillItem } from '../types';

export const SKILLS: SkillItem[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    category: { en: 'Mobile UI', ar: 'تطبيقات الجوال' },
    summary: {
      en: 'Cross-platform Android & iOS interfaces with clean state management.',
      ar: 'بناء واجهات تطبيقات الهواتف لنظامي أندرويد و iOS.',
    },
  },
  {
    id: 'dart',
    name: 'Dart',
    category: { en: 'Language', ar: 'لغة برمجة' },
    summary: {
      en: 'Strongly typed application logic and asynchronous data flows.',
      ar: 'تطوير منطق التطبيقات المتين والبرمجة غير المتزامنة.',
    },
  },
  {
    id: 'python',
    name: 'Python',
    category: { en: 'Backend & Automation', ar: 'الخلفية والأتمتة' },
    summary: {
      en: 'Scripting, data processing, automation, and backend services.',
      ar: 'تطوير السكربتات، معالجة البيانات، والأتمتة البرمجية.',
    },
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: { en: 'Web Core', ar: 'أساس الويب' },
    summary: {
      en: 'Interactive client experiences and modern ES2022+ logic.',
      ar: 'بناء تجارب الويب التفاعلية ومنطق الواجهات الحديثة.',
    },
  },
  {
    id: 'react',
    name: 'React',
    category: { en: 'Frontend Framework', ar: 'واجهات المستخدم' },
    summary: {
      en: 'Component-driven web applications with responsive RTL/LTR UI.',
      ar: 'تطوير تطبيقات الويب التفاعلية بمكونات مرنة ودعم RTL/LTR.',
    },
  },
  {
    id: 'php',
    name: 'PHP',
    category: { en: 'Server-Side', ar: 'تطوير الخادم' },
    summary: {
      en: 'Reliable web backends, authentication, and server integrations.',
      ar: 'بناء خدمات الخادم والمصادقة والتكامل مع قواعد البيانات.',
    },
  },
  {
    id: 'laravel',
    name: 'Laravel',
    category: { en: 'Backend Framework', ar: 'إطار عمل خلفي' },
    summary: {
      en: 'REST APIs, Eloquent ORM, migrations, and structured MVC systems.',
      ar: 'تطوير واجهات REST API وأنظمة MVC المنظمة.',
    },
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: { en: 'Relational Database', ar: 'قواعد البيانات' },
    summary: {
      en: 'Schema modeling, indexing, and transactional SQL queries.',
      ar: 'تصميم الجداول والعلاقات والاستعلامات الموثوقة.',
    },
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: { en: 'Cloud Platform', ar: 'منصة سحابية' },
    summary: {
      en: 'Real-time databases, authentication, and mobile cloud sync.',
      ar: 'المصادقة السحابية وقواعد البيانات الفورية للتطبيقات.',
    },
  },
  {
    id: 'networking',
    name: 'Networking',
    category: { en: 'Infrastructure', ar: 'الشبكات والأنظمة' },
    summary: {
      en: 'IPv4/CIDR, MikroTik RouterOS, PPPoE, Hotspot, and diagnostics.',
      ar: 'إعداد الشبكات، MikroTik RouterOS، وأنظمة المشتركين.',
    },
  },
];

export const TRANSLATIONS = {
  en: {
    brand: 'QUSAI.DEV',
    creator: 'Qusai Omar Mohammed Ali',
    roleTitle: 'Programmer & Software Developer',
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      aiAssistant: 'AI Assistant',
      contact: 'Contact',
      switchLang: 'العربية',
      skipToContent: 'Skip to main content',
    },
    home: {
      greeting: 'Qusai Omar Mohammed Ali',
      role: 'Programmer & Software Developer',
      headline: 'Designing Practical Software, Web Platforms, and Connected Systems.',
      intro:
        'I am a Computer Science student and software developer focused on building clean web applications, cross-platform mobile apps, and reliable management systems.',
      exploreProjectsBtn: 'Explore My Projects',
      contactMeBtn: 'Contact Me',
      visualAlt: 'QUSAI.DEV developer portfolio core artwork',
      visualCaption: 'Qusai Omar Mohammed Ali · Programmer & Software Developer',
      highlightsTitle: 'Portfolio Overview',
      highlights: [
        {
          section: 'about' as const,
          title: 'About Me & Technical Stack',
          desc: 'Computer Science student working across Flutter, Dart, Python, JavaScript, React, PHP, Laravel, MySQL, Firebase, and Networking.',
          cta: 'View Skills',
        },
        {
          section: 'projects' as const,
          title: 'Selected Projects',
          desc: 'Real-world systems including MikroNet, Well Manager, Hajezaty, and the Smart Exam Identity System.',
          cta: 'Browse Projects',
        },
        {
          section: 'ai-assistant' as const,
          title: 'Conversational AI Assistant',
          desc: 'Chat directly with a bilingual Gemini-powered assistant for programming help and technical questions.',
          cta: 'Open AI Chat',
        },
      ],
    },
    about: {
      heading: 'About Me',
      subheading:
        'Computer Science student and software developer building reliable applications across mobile, web, backend, and networking.',
      introTitle: 'Background',
      introBody:
        'I enjoy turning real operational needs into clean, maintainable software—whether designing cross-platform mobile experiences in Flutter, crafting responsive web interfaces in React, building structured APIs with Laravel and Python, or integrating network automation systems.',
      highlights: [
        {
          title: 'Mobile & Frontend',
          desc: 'Building responsive bilingual apps with Flutter, Dart, React, and modern JavaScript.',
        },
        {
          title: 'Backend & Databases',
          desc: 'Structuring secure APIs and schemas with PHP, Laravel, Python, MySQL, and Firebase.',
        },
        {
          title: 'Networking Systems',
          desc: 'Designing practical tools for ISP administration, RouterOS workflows, and connectivity.',
        },
      ],
      skillsHeading: 'Core Technologies & Skills',
    },
    projects: {
      heading: 'My Projects',
      subheading:
        'A focused selection of software systems and applications I have built across networking, operations, scheduling, and academic workflows.',
      filters: {
        all: 'All',
        networking: 'Networking',
        systems: 'Systems',
        web: 'Web',
      },
      visitLink: 'View Project',
      linkUnavailable: 'Private / Offline Showcase',
    },
    aiAssistant: {
      heading: 'AI Assistant',
      subheading:
        'Ask programming questions, explore software concepts, or get help in English or Arabic.',
      liveReady: 'Connected to Gemini AI',
      liveUnavailable: 'Live Gemini API key is not configured on the server',
      liveUnavailableHint:
        'Configure GEMINI_API_KEY in server environment variables to enable live responses.',
      clearChat: 'Clear Conversation',
      emptyTitle: 'Start a conversation',
      emptyDesc:
        'Ask a programming question, request a code explanation, or choose a starter prompt below.',
      promptPlaceholder: 'Ask anything about programming, software design, or tech...',
      send: 'Send',
      sending: 'Thinking...',
      retry: 'Retry',
      copyCode: 'Copy',
      copied: 'Copied',
      userLabel: 'You',
      assistantLabel: 'AI Assistant',
      errorPrefix: 'Error',
      suggestionsTitle: 'Suggested Questions',
      suggestions: [
        'Explain how Laravel Eloquent prevents SQL injection and N+1 queries.',
        'How does Flutter manage state cleanly between screens?',
        'What is the difference between PPPoE and Hotspot authentication in MikroTik?',
        'Compare MySQL indexing strategies for high-read tables.',
      ],
    },
    contact: {
      heading: 'Contact',
      subheading:
        'Have a project idea, collaboration inquiry, or question? Reach out directly via email, WhatsApp, or the form below.',
      directTitle: 'Direct Contact',
      directNote:
        'Prefer instant messaging or email? Use either button below to start a conversation right away.',
      actionsTitle: 'Direct Channels',
      emailMeBtn: 'Email Me',
      whatsappMeBtn: 'WhatsApp Me',
      channels: [
        { label: 'Developer', value: 'Qusai Omar Mohammed Ali', ltr: false },
        { label: 'Email', value: 'hackone465@gmail.com', ltr: true },
        { label: 'WhatsApp', value: '+967772350689', ltr: true },
      ],
      form: {
        nameLabel: 'Full Name',
        namePlaceholder: 'Your name',
        emailLabel: 'Email Address',
        emailPlaceholder: 'you@example.com',
        subjectLabel: 'Subject',
        subjectPlaceholder: 'Project inquiry or message',
        messageLabel: 'Message',
        messagePlaceholder: 'Tell me about your project or question...',
        submitBtn: 'Send Message',
        submittingBtn: 'Sending...',
        successTitle: 'Message Sent',
        successNote: 'Your inquiry has been recorded. Reference ID:',
        sendAnother: 'Send Another Message',
        errors: {
          nameRequired: 'Please enter your full name (at least 2 characters).',
          emailInvalid: 'Please enter a valid email address.',
          subjectRequired: 'Please enter a subject (at least 2 characters).',
          messageMinLength: 'Message must be at least 10 characters long.',
        },
      },
    },
    notFound: {
      code: '404',
      title: 'Page Not Found',
      description: 'The requested page could not be found on QUSAI.DEV.',
      homeBtn: 'Return Home',
    },
    footer: {
      rights: 'QUSAI.DEV — Qusai Omar Mohammed Ali.',
      emailMeBtn: 'Email Me',
      whatsappMeBtn: 'WhatsApp Me',
    },
    toast: {
      copied: 'Copied to clipboard',
      cleared: 'Conversation cleared',
    },
  },
  ar: {
    brand: 'QUSAI.DEV',
    creator: 'قصي عمر محمد علي',
    roleTitle: 'مبرمج ومطور برمجيات',
    nav: {
      home: 'الرئيسية',
      about: 'نبذة عني',
      projects: 'مشاريعي',
      aiAssistant: 'المساعد الذكي',
      contact: 'تواصل معي',
      switchLang: 'English',
      skipToContent: 'تخطي إلى المحتوى الرئيسي',
    },
    home: {
      greeting: 'قصي عمر محمد علي',
      role: 'مبرمج ومطور برمجيات',
      headline: 'تطوير برمجيات عملية، منصات ويب حديثة، وأنظمة مترابطة.',
      intro:
        'طالب علوم حاسوب ومطور برمجيات أعمل على بناء تطبيقات ويب متجاوبة، تطبيقات جوال متعددة المنصات، وأنظمة إدارة موثوقة.',
      exploreProjectsBtn: 'استكشف مشاريعي',
      contactMeBtn: 'تواصل معي',
      visualAlt: 'تصميم تعريفي لمنصة قصي عمر محمد علي',
      visualCaption: 'قصي عمر محمد علي · مبرمج ومطور برمجيات',
      highlightsTitle: 'أقسام الموقع',
      highlights: [
        {
          section: 'about' as const,
          title: 'نبذة عني والمهارات',
          desc: 'طالب علوم حاسوب ومطور يعمل بتقنيات Flutter و Dart و Python و JavaScript و React و PHP و Laravel و MySQL و Firebase والشبكات.',
          cta: 'عرض المهارات',
        },
        {
          section: 'projects' as const,
          title: 'أبرز المشاريع',
          desc: 'أنظمة وتطبيقات واقعية تشمل MikroNet و Well Manager و حجزاتي ونظام الهوية الامتحانية الذكي.',
          cta: 'تصفح المشاريع',
        },
        {
          section: 'ai-assistant' as const,
          title: 'المساعد الذكي',
          desc: 'محادثة تفاعلية باللغتين العربية والإنجليزية للإجابة على الأسئلة البرمجية والتقنية عبر Gemini.',
          cta: 'بدء المحادثة',
        },
      ],
    },
    about: {
      heading: 'نبذة عني',
      subheading:
        'طالب علوم حاسوب ومطور برمجيات أبني تطبيقات عملية تجمع بين الويب، الجوال، الخوادم، وأنظمة الشبكات.',
      introTitle: 'الخلفية التقنية',
      introBody:
        'أهتم بتحويل الاحتياجات التشغيلية إلى برمجيات واضحة وسهلة الصيانة؛ سواء عبر تطوير تطبيقات الجوال باستخدام Flutter و Dart، أو بناء واجهات الويب التفاعلية بـ React، أو برمجة الخوادم وقواعد البيانات بـ Laravel و Python و MySQL و Firebase، إلى جانب أنظمة الشبكات.',
      highlights: [
        {
          title: 'تطبيقات الجوال والواجهات',
          desc: 'بناء واجهات متجاوبة باللغتين العربية والإنجليزية عبر Flutter و Dart و React و JavaScript.',
        },
        {
          title: 'الخوادم وقواعد البيانات',
          desc: 'تصميم واجهات API وقواعد بيانات منظمة باستخدام PHP و Laravel و Python و MySQL و Firebase.',
        },
        {
          title: 'الشبكات والأنظمة',
          desc: 'تطوير حلول عملية لإدارة شبكات الإنترنت وخدمات MikroTik RouterOS.',
        },
      ],
      skillsHeading: 'المهارات والتقنيات',
    },
    projects: {
      heading: 'مشاريعي',
      subheading:
        'مجموعة مختارة من الأنظمة والتطبيقات البرمجية التي عملت على تطويرها في مجالات الشبكات، الإدارة، الحجوزات، والتعليم.',
      filters: {
        all: 'الكل',
        networking: 'الشبكات',
        systems: 'الأنظمة',
        web: 'الويب',
      },
      visitLink: 'عرض المشروع',
      linkUnavailable: 'عرض تعريفي داخل المعرض',
    },
    aiAssistant: {
      heading: 'المساعد الذكي',
      subheading:
        'اسأل أي سؤال برمجي أو تقني واحصل على إجابات واضحة باللغتين العربية والإنجليزية.',
      liveReady: 'متصل بخدمة Gemini AI',
      liveUnavailable: 'مفتاح GEMINI_API_KEY غير مهيأ على الخادم',
      liveUnavailableHint:
        'يرجى ضبط متغير GEMINI_API_KEY في إعدادات الخادم لتفعيل الردود الحية.',
      clearChat: 'مسح المحادثة',
      emptyTitle: 'ابدأ المحادثة',
      emptyDesc:
        'اطرح سؤالاً برمجياً، اطلب شرحاً لمفهوم تقني، أو اختر أحد الأسئلة المقترحة أدناه.',
      promptPlaceholder: 'اكتب سؤالك البرمجي أو التقني هنا...',
      send: 'إرسال',
      sending: 'جاري التفكير...',
      retry: 'إعادة المحاولة',
      copyCode: 'نسخ',
      copied: 'تم النسخ',
      userLabel: 'أنت',
      assistantLabel: 'المساعد الذكي',
      errorPrefix: 'خطأ',
      suggestionsTitle: 'أسئلة مقترحة',
      suggestions: [
        'كيف يمنع Laravel Eloquent ثغرات SQL Injection ومشكلة N+1؟',
        'ما أفضل طريقة لإدارة الحالة (State Management) في Flutter؟',
        'ما الفرق بين PPPoE و Hotspot في إدارة شبكات MikroTik؟',
        'اشرح فائدة الفهارس (Indexes) في تسريع استعلامات MySQL.',
      ],
    },
    contact: {
      heading: 'تواصل معي',
      subheading:
        'هل لديك فكرة مشروع أو استفسار تقني؟ يمكنك التواصل معي مباشرة عبر البريد الإلكتروني أو واتساب أو النموذج التالي.',
      directTitle: 'قنوات التواصل المباشر',
      directNote:
        'يفضّل التواصل السريع؟ استخدم أياً من الزرين أدناه لفتح البريد الإلكتروني أو بدء محادثة واتساب مباشرة.',
      actionsTitle: 'تواصل فوري',
      emailMeBtn: 'راسلني عبر البريد',
      whatsappMeBtn: 'تواصل عبر واتساب',
      channels: [
        { label: 'المطور', value: 'قصي عمر محمد علي', ltr: false },
        { label: 'البريد الإلكتروني', value: 'hackone465@gmail.com', ltr: true },
        { label: 'واتساب', value: '+967772350689', ltr: true },
      ],
      form: {
        nameLabel: 'الاسم الكامل',
        namePlaceholder: 'اكتب اسمك',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: 'you@example.com',
        subjectLabel: 'الموضوع',
        subjectPlaceholder: 'عنوان الرسالة أو المشروع',
        messageLabel: 'الرسالة',
        messagePlaceholder: 'اكتب تفاصيل مشروعك أو استفسارك هنا...',
        submitBtn: 'إرسال الرسالة',
        submittingBtn: 'جاري الإرسال...',
        successTitle: 'تم إرسال الرسالة',
        successNote: 'تم تسجيل رسالتك بنجاح. الرقم المرجعي:',
        sendAnother: 'إرسال رسالة أخرى',
        errors: {
          nameRequired: 'يرجى إدخال الاسم الكامل (حرفين على الأقل).',
          emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح.',
          subjectRequired: 'يرجى إدخال موضوع الرسالة (حرفين على الأقل).',
          messageMinLength: 'يجب أن تتكون الرسالة من 10 أحرف على الأقل.',
        },
      },
    },
    notFound: {
      code: '404',
      title: 'الصفحة غير موجودة',
      description: 'الصفحة المطلوبة غير متوفرة على موقع QUSAI.DEV.',
      homeBtn: 'العودة للرئيسية',
    },
    footer: {
      rights: 'QUSAI.DEV — قصي عمر محمد علي.',
      emailMeBtn: 'راسلني عبر البريد',
      whatsappMeBtn: 'تواصل عبر واتساب',
    },
    toast: {
      copied: 'تم النسخ إلى الحافظة',
      cleared: 'تم مسح المحادثة',
    },
  },
} as const;

export function getTranslations(lang: Language) {
  return TRANSLATIONS[lang];
}
