import type { ProjectItem } from '../types';

export const PROJECTS: ProjectItem[] = [
  {
    id: 'mikronet',
    category: 'networking',
    image: '/src/assets/images/project_mikronet_visual_1794862949256.jpg',
    statusLabel: {
      en: 'Portfolio Demonstration · Concept Artwork (Production Screenshots Pending)',
      ar: 'عرض تعريفي للمشروع · تصور بصري (بانتظار لقطات الشاشة الحقيقية)',
    },
    title: {
      en: 'MikroNet',
      ar: 'MikroNet — نظام إدارة الشبكات',
    },
    subtitle: {
      en: 'ISP & RouterOS Network Operations Platform',
      ar: 'منصة متكاملة لإدارة شبكات الإنترنت وموجهات MikroTik',
    },
    summary: {
      en: 'An engineering platform built for local ISP operators and network administrators to organize subscriber profiles, MikroTik hotspot/PPPoE workflows, bandwidth plans, and voucher distribution from a unified control interface.',
      ar: 'منصة هندسية مصممة لمشغلي الشبكات ومديري الأنظمة لتنظيم حسابات المشتركين، وإدارة جلسات Hotspot و PPPoE على أجهزة MikroTik، وخطط السرعات وتوزيع الكروت من واجهة موحدة.',
    },
    features: {
      en: [
        'Unified PPPoE and Hotspot subscriber management across multiple RouterOS nodes',
        'Batch hotspot voucher generation with printable export layouts and expiry rules',
        'Reseller sub-accounts with scoped quota limits and billing cycle tracking',
        'Active session inspection with disconnect/profile-switch actions',
      ],
      ar: [
        'إدارة موحدة لمشتركي PPPoE و Hotspot عبر عدة موجهات RouterOS',
        'توليد دفعات كروت Hotspot مع قوالب طباعة وقواعد انتهاء صلاحية',
        'حسابات وكلاء فرعية بحدود رصيد وصلاحيات معزولة وتتبع للفواتير',
        'فحص الجلسات النشطة مع إمكانية فصل الجلسة أو تغيير الباقة',
      ],
    },
    architecture: {
      en: [
        'RouterOS API integration layer for session inspection and profile provisioning',
        'Role-based operator workflow separating network admins, resellers, and accounting',
        'Structured billing periods and automated subscriber expiry enforcement',
      ],
      ar: [
        'طبقة تكامل مباشرة مع MikroTik RouterOS API لمراقبة الجلسات وتهيئة الباقات',
        'نظام صلاحيات متعدد الأدوار يفصل بين مدير الشبكة والوكلاء والمحاسبة',
        'إدارة دورية للاشتراكات مع تتبع واضح لحالة انتهاء الصلاحية والرصيد',
      ],
    },
    challenges: [
      {
        challenge: {
          en: 'Handling transient RouterOS socket disconnects when updating dozens of subscriber queues.',
          ar: 'معالجة انقطاعات اتصال RouterOS اللحظية أثناء تحديث عشرات القيود والجلسات.',
        },
        solution: {
          en: 'Implemented an idempotent command queue with connection pooling and deterministic retry backoff so router state and database records remain synchronized.',
          ar: 'بناء طابور أوامر متكرر بأمان (Idempotent) مع تجميع الاتصالات وإعادة المحاولة المتدرجة لضمان تطابق حالة الموجه مع قاعدة البيانات.',
        },
      },
      {
        challenge: {
          en: 'Preventing unauthorized privilege escalation between network administrators and sales resellers.',
          ar: 'منع تداخل الصلاحيات بين مدير الشبكة الرئيسي وموزعي الكروت والوكلاء.',
        },
        solution: {
          en: 'Enforced server-side RBAC middleware scoped by router group and tenant ledger on every API route.',
          ar: 'فرض طبقة صلاحيات (RBAC) على مستوى الخادم مربوطة بمجموعة الموجهات وسجل كل وكيل.',
        },
      },
    ],
    capabilities: {
      en: ['Subscriber Lifecycle', 'RouterOS Automation', 'Voucher Batching', 'Bandwidth Profiles'],
      ar: ['إدارة المشتركين', 'أتمتة RouterOS', 'توليد الكروت', 'باقات السرعة'],
    },
    stack: ['TypeScript', 'React', 'Node.js', 'RouterOS API', 'PostgreSQL'],
    demoUrl: null,
    sourceUrl: null,
  },
  {
    id: 'well-manager',
    category: 'systems',
    image: '/src/assets/images/project_well_manager_visual_1794862948850.jpg',
    statusLabel: {
      en: 'Portfolio Demonstration · Concept Artwork (Production Screenshots Pending)',
      ar: 'عرض تعريفي للمشروع · تصور بصري (بانتظار لقطات الشاشة الحقيقية)',
    },
    title: {
      en: 'Well Manager',
      ar: 'Well Manager — إدارة الآبار والموارد',
    },
    subtitle: {
      en: 'Water Well Operations & Distribution Management System',
      ar: 'نظام رقمي لإدارة تشغيل الآبار وتوزيع الموارد المائية',
    },
    summary: {
      en: 'A dedicated operational management system designed to track water well pumping schedules, beneficiary allocations, maintenance logs, and financial accounting with clarity and accountability.',
      ar: 'نظام تشغيلي متخصص لتوثيق وإدارة جداول ضخ الآبار، وتوزيع الحصص للمستفيدين، وسجلات الصيانة الدورية والحسابات المالية بدقة وموثوقية.',
    },
    features: {
      en: [
        'Shift-based pumping logs recording start/stop times, meter readings, and energy usage',
        'Fair beneficiary water-share distribution ledger with historical statements',
        'Preventive maintenance tracker for pumps, generators, and pipeline components',
        'Transparent expense vs. collection balance sheets for stakeholders',
      ],
      ar: [
        'سجل ورديات الضخ لتوثيق أوقات التشغيل وقراءات العدادات واستهلاك الوقود أو الطاقة',
        'دفتر توزيع حصص المستفيدين مع كشوفات حساب تاريخية دقيقة',
        'متابعة الصيانة الدورية والطارئة للمضخات والمولدات وشبكات الأنابيب',
        'تقارير مالية واضحة للمصروفات والتحصيلات أمام الشركاء والمستفيدين',
      ],
    },
    architecture: {
      en: [
        'Structured ledger recording pumping hours, fuel/power consumption, and flow cycles',
        'Beneficiary share calculation and transparent billing statements',
        'Equipment maintenance tracking with scheduled inspection logs',
      ],
      ar: [
        'سجل تشغيلي منظم لتوثيق ساعات الضخ واستهلاك الطاقة ودورات التشغيل',
        'احتساب دقيق لحصص المستفيدين وإصدار كشوفات مالية واضحة',
        'توثيق أعمال الصيانة الوقائية وحالة المضخات والمعدات',
      ],
    },
    challenges: [
      {
        challenge: {
          en: 'Reconciling shared pumping costs fairly when operating hours vary across seasonal schedules.',
          ar: 'احتساب تكاليف الضخ المشتركة بعدالة عند تغير ساعات التشغيل والمواسم.',
        },
        solution: {
          en: 'Built an immutable cycle-based ledger where each pumping session ties directly to verified meter deltas and per-share cost formulas.',
          ar: 'تصميم دفتر قيود غير قابل للتعديل يربط كل جلسة ضخ بقراءة العداد الفعلية ومعادلة توزيع الحصص.',
        },
      },
    ],
    capabilities: {
      en: ['Pumping Schedules', 'Share Allocation', 'Maintenance Logs', 'Operational Ledger'],
      ar: ['جداول التشغيل', 'توزيع الحصص', 'سجلات الصيانة', 'الحسابات التشغيلية'],
    },
    stack: ['TypeScript', 'React', 'Express', 'SQLite / SQL', 'Tailwind CSS'],
    demoUrl: null,
    sourceUrl: null,
  },
  {
    id: 'hajezaty',
    category: 'web',
    image: '/src/assets/images/project_hajezaty_visual_1794862949780.jpg',
    statusLabel: {
      en: 'Portfolio Demonstration · Concept Artwork (Production Screenshots Pending)',
      ar: 'عرض تعريفي للمشروع · تصور بصري (بانتظار لقطات الشاشة الحقيقية)',
    },
    title: {
      en: 'Hajezaty',
      ar: 'حجزاتي — منصة الحجوزات الذكية',
    },
    subtitle: {
      en: 'Bilingual Reservation & Appointment Scheduling Platform',
      ar: 'منصة رقمية ثنائية اللغة لإدارة الحجوزات والمواعيد',
    },
    summary: {
      en: 'A modern booking and scheduling web platform enabling service providers to publish time slots, prevent double-bookings, manage customer confirmations, and operate cleanly in Arabic RTL and English LTR.',
      ar: 'منصة حجز ومواعيد حديثة تتيح لمقدمي الخدمات نشر الفترات المتاحة ومنع تعارض الحجوزات وإدارة تأكيدات العملاء بواجهة عربية وإنجليزية متكاملة.',
    },
    features: {
      en: [
        'Dynamic availability slot generator respecting provider breaks and working days',
        'Customer booking flow with instant slot locking and status tracking',
        'Provider management console for approvals, rescheduling, and service durations',
        'Native Arabic RTL and English LTR mobile-first responsive layout',
      ],
      ar: [
        'مولّد مواعيد ديناميكي يراعي أيام العمل وفترات الاستراحة لكل مزود خدمة',
        'تجربة حجز سريعة للعميل مع حجز فوري للفترة وتتبع حالة الطلب',
        'لوحة تحكم لمقدم الخدمة لاعتماد الحجوزات أو إعادة جدولتها',
        'تصميم متجاوب للهواتف يدعم العربية RTL والإنجليزية LTR بشكل كامل',
      ],
    },
    architecture: {
      en: [
        'Conflict-free time-slot availability engine with timezone-aware boundaries',
        'Provider dashboard for service catalog, working hours, and booking state transitions',
        'Responsive bilingual booking flow built for mobile-first customer access',
      ],
      ar: [
        'محرك مواعيد يمنع تداخل الفترات الزمنية ويراعي أوقات العمل الرسمية',
        'لوحة تحكم لمقدم الخدمة لإدارة الخدمات وساعات العمل وحالات الحجز',
        'تجربة حجز سريعة ومتجاوبة على الهواتف باللغتين العربية والإنجليزية',
      ],
    },
    challenges: [
      {
        challenge: {
          en: 'Eliminating race conditions when two users attempt to reserve the same time slot simultaneously.',
          ar: 'منع تعارض الحجوزات عند محاولة مستخدمين حجز نفس الفترة الزمنية في اللحظة نفسها.',
        },
        solution: {
          en: 'Used transactional slot-overlap checks paired with unique time-window constraints at the database layer.',
          ar: 'تطبيق فحص تعارض الفترات داخل معاملة قاعدة بيانات ذرية مع قيود تمنع التكرار.',
        },
      },
    ],
    capabilities: {
      en: ['Slot Availability', 'Conflict Prevention', 'Provider Console', 'RTL-First UX'],
      ar: ['إدارة الفترات', 'منع التعارض', 'لوحة المزود', 'واجهة RTL متكاملة'],
    },
    stack: ['React', 'TypeScript', 'Node.js', 'REST API', 'Tailwind CSS'],
    demoUrl: null,
    sourceUrl: null,
  },
  {
    id: 'smart-exam-identity',
    category: 'systems',
    image: '/src/assets/images/project_smart_exam_visual_1794862950029.jpg',
    statusLabel: {
      en: 'Portfolio Demonstration · Concept Artwork (Production Screenshots Pending)',
      ar: 'عرض تعريفي للمشروع · تصور بصري (بانتظار لقطات الشاشة الحقيقية)',
    },
    title: {
      en: 'Smart Exam Identity System',
      ar: 'نظام الهوية الامتحانية الذكي',
    },
    subtitle: {
      en: 'Academic Candidate Verification & Exam Hall Integrity System',
      ar: 'نظام ذكي للتحقق من هوية الطلبة وإدارة لجان الامتحانات',
    },
    summary: {
      en: 'An academic verification system engineered to streamline exam hall check-in, validate student identity credentials via structured QR/digital records, and eliminate manual attendance discrepancies.',
      ar: 'نظام تقني مخصص لتنظيم دخول قاعات الامتحانات، والتحقق من هوية الطلبة عبر البطاقات الرقمية ورموز QR الموثقة، والحد من أخطاء التحضير اليدوي.',
    },
    features: {
      en: [
        'Digital exam admission passes encoding candidate ID, hall number, and seat assignment',
        'Fast proctor verification screen returning instant match/mismatch feedback',
        'Real-time hall attendance tracking and exception logging',
        'Structured end-of-session audit exports for academic committees',
      ],
      ar: [
        'بطاقات دخول امتحانية رقمية تتضمن رقم الطالب والقاعة والمقعد المخصص',
        'شاشة فحص سريعة للمراقب تتحقق فورياً من صحة الهوية وتطابق القاعة',
        'متابعة مباشرة لحضور اللجان وتسجيل الملاحظات والاستثناءات',
        'تقارير تدقيق منظمة للجان الامتحانية فور انتهاء الجلسة',
      ],
    },
    architecture: {
      en: [
        'Signed digital identity tokens linking student records to assigned exam halls and seats',
        'Fast proctor check-in workflow with instant verification feedback and audit trail',
        'Structured exam session reports detailing attendance and verification events',
      ],
      ar: [
        'رموز تحقق رقمية موثقة تربط بيانات الطالب بالقاعة والمقعد المخصص',
        'واجهة سريعة للمراقبين للتحقق الفوري وتسجيل الحضور مع سجل تدقيق كامل',
        'تقارير منظمة لكل جلسة امتحانية توثق حالات الحضور والتحقق',
      ],
    },
    challenges: [
      {
        challenge: {
          en: 'Ensuring QR exam cards cannot be forged or swapped between candidates during peak hall entry.',
          ar: 'ضمان عدم إمكانية تزوير بطاقات QR أو تبديلها بين الطلبة أثناء ذروة الدخول.',
        },
        solution: {
          en: 'Signed payload tokens cryptographically on the server and cross-checked seat/hall bindings plus candidate profile metadata on scan.',
          ar: 'توقيع بيانات البطاقة رقمياً على الخادم ومطابقة القاعة والمقعد وبيانات الطالب عند كل عملية مسح.',
        },
      },
    ],
    capabilities: {
      en: ['QR Credential Check', 'Hall Assignment', 'Proctor Console', 'Audit Records'],
      ar: ['التحقق عبر QR', 'توزيع القاعات', 'واجهة المراقب', 'سجلات التدقيق'],
    },
    stack: ['TypeScript', 'React', 'Web Crypto / QR', 'Express', 'PostgreSQL'],
    demoUrl: null,
    sourceUrl: null,
  },
];
