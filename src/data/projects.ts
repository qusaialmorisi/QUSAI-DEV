import type { ProjectItem } from '../types';

export const PROJECTS: ProjectItem[] = [
  {
    id: 'mikronet',
    category: 'networking',
    image: '/src/assets/images/project_mikronet_visual_1794862949256.jpg',
    title: {
      en: 'MikroNet',
      ar: 'MikroNet',
    },
    subtitle: {
      en: 'ISP & MikroTik Network Management System',
      ar: 'نظام إدارة شبكات الإنترنت وموجهات MikroTik',
    },
    summary: {
      en: 'A management platform designed for network operators to organize subscriber accounts, Hotspot and PPPoE profiles, bandwidth plans, and voucher batches from a unified interface.',
      ar: 'منصة متكاملة لإدارة شبكات الإنترنت تتيح لمشغلي الشبكات تنظيم حسابات المشتركين، وإدارة باقات Hotspot و PPPoE، وتوزيع الكروت من واجهة موحدة.',
    },
    stack: ['PHP', 'Laravel', 'MySQL', 'RouterOS API', 'JavaScript'],
    projectUrl: null,
  },
  {
    id: 'well-manager',
    category: 'systems',
    image: '/src/assets/images/project_well_manager_visual_1794862948850.jpg',
    title: {
      en: 'Well Manager',
      ar: 'Well Manager',
    },
    subtitle: {
      en: 'Water Well Operations & Allocation System',
      ar: 'نظام إدارة تشغيل الآبار وتوزيع الحصص',
    },
    summary: {
      en: 'An operational tracking application built to manage well pumping schedules, beneficiary water-share allocations, maintenance records, and transparent financial accounting.',
      ar: 'تطبيق تشغيلي لإدارة جداول ضخ الآبار، وتوزيع حصص المستفيدين، وتوثيق سجلات الصيانة الدورية والحسابات المالية بدقة وشفافية.',
    },
    stack: ['Flutter', 'Dart', 'Firebase', 'MySQL', 'REST API'],
    projectUrl: null,
  },
  {
    id: 'hajezaty',
    category: 'web',
    image: '/src/assets/images/project_hajezaty_visual_1794862949780.jpg',
    title: {
      en: 'Hajezaty',
      ar: 'حجزاتي (Hajezaty)',
    },
    subtitle: {
      en: 'Bilingual Appointment & Booking Platform',
      ar: 'منصة حجوزات ومواعيد ثنائية اللغة',
    },
    summary: {
      en: 'A responsive reservation platform allowing service providers to publish available time slots, prevent conflicting bookings, and confirm appointments smoothly in Arabic and English.',
      ar: 'منصة ويب متجاوبة لإدارة الحجوزات تتيح لمقدمي الخدمات نشر المواعيد المتاحة، ومنع تعارض الحجوزات، وتأكيد الطلبات باللغتين العربية والإنجليزية.',
    },
    stack: ['React', 'JavaScript', 'PHP', 'Laravel', 'MySQL'],
    projectUrl: null,
  },
  {
    id: 'smart-exam-identity',
    category: 'systems',
    image: '/src/assets/images/project_smart_exam_visual_1794862950029.jpg',
    title: {
      en: 'Smart Exam Identity System',
      ar: 'نظام الهوية الامتحانية الذكي',
    },
    subtitle: {
      en: 'Student Verification & Exam Hall Management',
      ar: 'نظام التحقق من هوية الطلبة وإدارة القاعات الامتحانية',
    },
    summary: {
      en: 'An academic verification system that streamlines exam hall check-in, validates student admission credentials via digital identity records, and tracks hall attendance accurately.',
      ar: 'نظام تقني لتنظيم دخول القاعات الامتحانية والتحقق من هوية الطلبة عبر السجلات والبطاقات الرقمية، مع توثيق الحضور وتقليل الأخطاء اليدوية.',
    },
    stack: ['Python', 'React', 'JavaScript', 'MySQL', 'QR Verification'],
    projectUrl: null,
  },
];
