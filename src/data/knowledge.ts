import type { KnowledgeArticle } from '../types';

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'cidr-subnetting-guide',
    category: 'networking',
    level: { en: 'Networking · Core', ar: 'الشبكات · أساسي' },
    title: {
      en: 'IPv4 CIDR Subnetting & Bitmask Arithmetic',
      ar: 'تقسيم شبكات IPv4 بنظام CIDR وحسابات الأقنعة الثنائية',
    },
    summary: {
      en: 'Understand how prefix lengths (/24, /26, /30) partition the 32-bit IPv4 space into network, host, and broadcast boundaries.',
      ar: 'افهم كيف تقسم البادئات (/24، /26، /30) فضاء العناوين ذي 32 بت إلى عنوان الشبكة ونطاق الأجهزة وعنوان البث.',
    },
    sections: [
      {
        heading: { en: '1. Network vs. Host Bits', ar: '1. بتات الشبكة مقابل بتات المضيف' },
        body: {
          en: 'An IPv4 address has 32 bits. A /N CIDR prefix locks the first N bits as the network identifier and leaves (32 - N) bits for hosts, yielding 2^(32 - N) total addresses and 2^(32 - N) - 2 usable hosts (excluding /31 point-to-point links and /32 host routes).',
          ar: 'يتكون عنوان IPv4 من 32 بت. البادئة /N تثبت أول N بت لتعريف الشبكة وتترك (32 - N) بت للأجهزة، مما يمنح 2^(32 - N) عنواناً إجمالياً و 2^(32 - N) - 2 مضيفاً متاحاً.',
        },
      },
      {
        heading: { en: '2. Bitwise AND & OR Formula', ar: '2. معادلات AND و OR الثنائية' },
        body: {
          en: 'Network Address = IP & SubnetMask. Wildcard Mask = ~SubnetMask. Broadcast Address = Network Address | Wildcard Mask.',
          ar: 'عنوان الشبكة = العنوان AND القناع. قناع Wildcard = عكس القناع. عنوان البث = عنوان الشبكة OR قناع Wildcard.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · TypeScript Bitwise Subnetting', ar: 'مثال تعليمي · حساب الشبكة بالعمليات الثنائية' },
    codeLang: 'ts',
    code: `function computeNetworkBounds(ipInt: number, cidr: number) {
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  return { mask, wildcard, network, broadcast };
}`,
  },
  {
    id: 'mikrotik-pppoe-architecture',
    category: 'networking',
    level: { en: 'Networking · ISP Operations', ar: 'الشبكات · تشغيل مزودي الخدمة' },
    title: {
      en: 'PPPoE & RADIUS Authentication Flow in ISP Networks',
      ar: 'آلية مصادقة PPPoE و RADIUS في شبكات مزودي الخدمة',
    },
    summary: {
      en: 'How MikroTik access concentrators authenticate subscribers against a centralized RADIUS server and enforce dynamic rate limits.',
      ar: 'كيف تتواصل موجهات MikroTik مع خادم RADIUS المركزي للتحقق من المشتركين وتطبيق باقات السرعة ديناميكياً.',
    },
    sections: [
      {
        heading: { en: '1. Discovery & Session Stage', ar: '1. مرحلة الاكتشاف وتأسيس الجلسة' },
        body: {
          en: 'The client broadcasts PADI over Layer 2 Ethernet; the NAS replies with PADO, followed by PADR/PADS to assign a unique Session ID without requiring an IP address first.',
          ar: 'يرسل جهاز المشترك طلب PADI على الطبقة الثانية، ويرد الموجه بـ PADO ثم تكتمل الجلسة عبر PADR و PADS لتخصيص معرّف جلسة قبل منح عنوان IP.',
        },
      },
      {
        heading: { en: '2. RADIUS Access-Request & Attributes', ar: '2. طلب RADIUS وسمات السرعة' },
        body: {
          en: 'The router forwards credentials to UDP/1812. On success, RADIUS returns Access-Accept carrying Framed-IP-Address and Mikrotik-Rate-Limit attributes.',
          ar: 'يرسل الموجه بيانات الدخول إلى المنفذ UDP/1812، وعند القبول يعيد RADIUS سمات مثل عنوان IP المخصص وحد السرعة Mikrotik-Rate-Limit.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · RouterOS CLI Concept', ar: 'مثال تعليمي · إعداد مفهوم PPPoE و RADIUS' },
    codeLang: 'rsc',
    code: `/radius add service=ppp address=10.10.0.5 secret=RADIUS_SECRET_KEY
/ppp aaa set use-radius=yes accounting=yes interim-update=5m
/interface pppoe-server server add interface=bridge-clients service-name=isp-pppoe disabled=no`,
  },
  {
    id: 'python-async-api',
    category: 'python',
    level: { en: 'Python Guide', ar: 'دليل Python' },
    title: {
      en: 'Structured Async Concurrency with Python asyncio',
      ar: 'البرمجة غير المتزامنة المنظمة في Python عبر asyncio',
    },
    summary: {
      en: 'Use TaskGroup and semaphores in modern Python to bound concurrent network checks and handle timeouts cleanly.',
      ar: 'استخدام TaskGroup و Semaphore في Python الحديثة لتحديد عدد المهام المتزامنة ومعالجة المهلات الزمنية بأمان.',
    },
    sections: [
      {
        heading: { en: '1. Bounded Concurrency', ar: '1. تقييد التزامن' },
        body: {
          en: 'Launching thousands of unthrottled coroutines can exhaust file descriptors. Pairing asyncio.Semaphore with asyncio.timeout keeps network probes predictable.',
          ar: 'إطلاق آلاف المهام دفعة واحدة قد يستنزف الموارد؛ استخدام Semaphore مع مهلة زمنية يحافظ على استقرار الأداء.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · Python 3.11+ asyncio', ar: 'مثال تعليمي · Python asyncio' },
    codeLang: 'python',
    code: `import asyncio

async def check_host(sem: asyncio.Semaphore, host: str) -> tuple[str, bool]:
    async with sem:
        try:
            async with asyncio.timeout(2.0):
                reader, writer = await asyncio.open_connection(host, 443)
                writer.close()
                await writer.wait_closed()
                return host, True
        except OSError:
            return host, False`,
  },
  {
    id: 'flutter-state-architecture',
    category: 'flutter',
    level: { en: 'Flutter Guide', ar: 'دليل Flutter' },
    title: {
      en: 'Clean Feature-First Architecture & State Management in Flutter',
      ar: 'هيكلة التطبيقات النظيفة وإدارة الحالة في Flutter',
    },
    summary: {
      en: 'Separate immutable UI state, repository contracts, and network clients to keep bilingual Flutter apps testable.',
      ar: 'فصل حالة الواجهة عن طبقة البيانات والمستودعات للحفاظ على قابلية الاختبار وسهولة الصيانة في تطبيقات Flutter.',
    },
    sections: [
      {
        heading: { en: '1. Immutable State Models', ar: '1. نماذج الحالة غير القابلة للتعديل' },
        body: {
          en: 'Represent loading, loaded, and failure states explicitly with sealed classes in Dart 3 so widgets handle every branch exhaustively.',
          ar: 'تمثيل حالات التحميل والنجاح والخطأ بشكل صريح عبر sealed classes في Dart 3 لضمان معالجة جميع الحالات في الواجهة.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · Dart 3 Sealed State', ar: 'مثال تعليمي · Dart 3 Sealed State' },
    codeLang: 'dart',
    code: `sealed class BookingState {}

class BookingLoading extends BookingState {}

class BookingLoaded extends BookingState {
  final List<String> slots;
  BookingLoaded(this.slots);
}

class BookingError extends BookingState {
  final String message;
  BookingError(this.message);
}`,
  },
  {
    id: 'react-typescript-patterns',
    category: 'react',
    level: { en: 'React + TypeScript Guide', ar: 'دليل React و TypeScript' },
    title: {
      en: 'Abort-Safe Data Fetching & Discriminated Unions in React',
      ar: 'جلب البيانات الآمن مع AbortController في React و TypeScript',
    },
    summary: {
      en: 'Prevent stale responses from overwriting newer UI state when query parameters change rapidly.',
      ar: 'منع استجابات الشبكة المتأخرة من استبدال الحالة الأحدث عند تغيّر مدخلات البحث بسرعة.',
    },
    sections: [
      {
        heading: { en: '1. Cleanup with AbortController', ar: '1. التنظيف عبر AbortController' },
        body: {
          en: 'Always return a cleanup callback from useEffect that aborts in-flight fetch requests when dependencies update or the component unmounts.',
          ar: 'احرص دائماً على إرجاع دالة تنظيف داخل useEffect لإلغاء الطلب السابق فور تغير الاعتماديات أو إزالة المكوّن.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · React TypeScript Hook', ar: 'مثال تعليمي · React TypeScript' },
    codeLang: 'tsx',
    code: `useEffect(() => {
  const controller = new AbortController();
  setLoading(true);
  fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setResults(data))
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err.message);
    })
    .finally(() => setLoading(false));

  return () => controller.abort();
}, [query]);`,
  },
  {
    id: 'php-pdo-prepared',
    category: 'php',
    level: { en: 'PHP 8 Guide', ar: 'دليل PHP 8' },
    title: {
      en: 'Secure Database Transactions & Prepared Statements in PHP 8',
      ar: 'المعاملات الآمنة والاستعلامات المحضّرة (PDO) في PHP 8',
    },
    summary: {
      en: 'Protect relational queries against SQL injection and enforce atomic multi-step updates with PDO transactions.',
      ar: 'حماية استعلامات قواعد البيانات من حقن SQL وضمان تكامل العمليات المتعددة عبر معاملات PDO.',
    },
    sections: [
      {
        heading: { en: '1. Disable Emulated Prepares', ar: '1. تعطيل المحاكاة الوهمية للاستعلامات' },
        body: {
          en: 'Configure PDO::ATTR_EMULATE_PREPARES => false and PDO::ERRMODE_EXCEPTION so native database parameter binding is always enforced.',
          ar: 'تفعيل الاستثناءات وتعطيل المحاكاة في PDO يضمن ربط المعاملات أصلياً داخل محرك قاعدة البيانات.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · PHP 8 PDO Transaction', ar: 'مثال تعليمي · PHP 8 PDO' },
    codeLang: 'php',
    code: `<?php
$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare('INSERT INTO bookings (slot_id, client_email) VALUES (:slot, :email)');
    $stmt->execute(['slot' => $slotId, 'email' => $email]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}`,
  },
  {
    id: 'clean-api-contracts',
    category: 'programming',
    level: { en: 'Programming · Architecture', ar: 'البرمجة · معمارية البرمجيات' },
    title: {
      en: 'Designing Deterministic API Error Contracts',
      ar: 'تصميم عقود الأخطاء القياسية لواجهات البرمجة (APIs)',
    },
    summary: {
      en: 'Consistent error codes, HTTP status mapping, and client-safe messages improve debugging across frontend and backend teams.',
      ar: 'توحيد رموز الأخطاء وحالات HTTP يسهل تشخيص المشاكل بين الواجهة الأمامية والخادم.',
    },
    sections: [
      {
        heading: { en: '1. Never Swallow Upstream Failures', ar: '1. عدم إخفاء أخطاء الخادم' },
        body: {
          en: 'Return structured JSON payloads containing a stable errorCode, human-readable message, and never leak internal stack traces or secrets.',
          ar: 'أعد استجابة JSON واضحة تحتوي على رمز الخطأ ورسالة مفهومة للمستخدم دون كشف المفاتيح أو تفاصيل النظام الداخلية.',
        },
      },
    ],
    codeLabel: { en: 'Sample Educational Example · Express Error Envelope', ar: 'مثال تعليمي · Express API Contract' },
    codeLang: 'ts',
    code: `export interface ApiErrorEnvelope {
  ok: false;
  errorCode: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UPSTREAM_UNAVAILABLE';
  message: string;
}`,
  },
];
