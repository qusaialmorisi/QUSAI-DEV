import type {
  ChallengeDifficulty,
  Language,
  ProgrammingChallengeLang,
} from '../types';
import type { PythonTestCase } from '../utils/pythonEvaluator';

export interface JsTestCase {
  id: string;
  label: string;
  args: unknown[];
  expected: unknown;
}

export interface HtmlCssAssertion {
  id: string;
  labelEn: string;
  labelAr: string;
  selector: string;
  check: 'exists' | 'minCount' | 'styleEquals' | 'styleIncludes' | 'minPx' | 'hasAttr';
  prop?: string;
  expected?: string | number;
}

export interface ProgrammingChallenge {
  id: string;
  kind: 'programming';
  language: ProgrammingChallengeLang;
  difficulty: ChallengeDifficulty;
  title: Record<Language, string>;
  description: Record<Language, string>;
  examples: { input: string; output: string }[];
  hints: Record<Language, string[]>;
  explanation: Record<Language, string>;
  stepByStep: Record<Language, string[]>;
  functionName?: string; // Python & JS
  starterCode?: string; // Python & JS
  solutionCode?: string; // Python & JS
  starterHtml?: string; // HTML/CSS
  starterCss?: string; // HTML/CSS
  solutionHtml?: string; // HTML/CSS
  solutionCss?: string; // HTML/CSS
  pythonTests?: PythonTestCase[];
  jsTests?: JsTestCase[];
  domAssertions?: HtmlCssAssertion[];
}

export interface NetworkingFieldSpec {
  id: string;
  label: Record<Language, string>;
  placeholder: string;
  type: 'ipv4' | 'cidr' | 'integer' | 'binary32' | 'choice';
  expected: string;
  choices?: { value: string; label: Record<Language, string> }[];
}

export interface NetworkingChallenge {
  id: string;
  kind: 'networking';
  topic: 'subnetting' | 'cidr' | 'addresses' | 'binary' | 'troubleshooting';
  difficulty: ChallengeDifficulty;
  title: Record<Language, string>;
  description: Record<Language, string>;
  scenarioDetails?: Record<Language, string>;
  hints: Record<Language, string[]>;
  explanation: Record<Language, string>;
  stepByStep: Record<Language, string[]>;
  fields: NetworkingFieldSpec[];
}

export type DeveloperChallenge = ProgrammingChallenge | NetworkingChallenge;

export const PROGRAMMING_CHALLENGES: ProgrammingChallenge[] = [
  // 1. Python Beginner 1
  {
    id: 'py-sum-even',
    kind: 'programming',
    language: 'python',
    difficulty: 'beginner',
    title: {
      en: 'Sum of Even Numbers',
      ar: 'مجموع الأعداد الزوجية',
    },
    description: {
      en: 'Write a Python function sum_even(nums) that returns the sum of all even integers in the list nums.',
      ar: 'اكتب دالة بايثون باسم sum_even(nums) تُرجع مجموع جميع الأعداد الزوجية في القائمة nums.',
    },
    examples: [
      { input: 'sum_even([1, 2, 3, 4, 6])', output: '12' },
      { input: 'sum_even([1, 3, 5])', output: '0' },
    ],
    hints: {
      en: [
        'Use the modulo operator x % 2 == 0 to test whether an integer is even.',
        'Accumulate matching values into a total variable or use a list comprehension with sum().',
      ],
      ar: [
        'استخدم معامل باقي القسمة x % 2 == 0 للتحقق من كون العدد زوجياً.',
        'اجمع القيم الزوجية في متغير أو استخدم sum() مع List Comprehension.',
      ],
    },
    explanation: {
      en: 'Every even integer has remainder 0 when divided by 2 (x % 2 == 0). Filtering only even integers and summing them produces the exact total.',
      ar: 'كل عدد زوجي يكون باقي قسمته على 2 مساوياً للصفر (x % 2 == 0). عند تصفية العناصر الزوجية وجمعها نحصل على الناتج الصحيح.',
    },
    stepByStep: {
      en: [
        'Initialize total = 0.',
        'Loop through each number n in nums.',
        'Check if n % 2 == 0; if true, add n to total.',
        'Return total after the loop finishes.',
      ],
      ar: [
        'تهيئة المتغير total = 0.',
        'المرور على كل رقم n داخل القائمة nums.',
        'التحقق إذا كان n % 2 == 0، وعند تحققه نضيف n إلى total.',
        'إرجاع total بعد انتهاء الحلقة.',
      ],
    },
    functionName: 'sum_even',
    starterCode: `def sum_even(nums):
    # Return the sum of even numbers in nums
    total = 0
    return total`,
    solutionCode: `def sum_even(nums):
    return sum([x for x in nums if x % 2 == 0])`,
    pythonTests: [
      { id: 't1', label: 'Mixed list', args: [[1, 2, 3, 4, 6]], expected: 12 },
      { id: 't2', label: 'All odd', args: [[1, 3, 5, 7]], expected: 0 },
      { id: 't3', label: 'Negatives & zero', args: [[-4, -1, 0, 2, 5]], expected: -2 },
      { id: 't4', label: 'Empty list', args: [[]], expected: 0 },
    ],
  },

  // 2. Python Beginner 2
  {
    id: 'py-palindrome',
    kind: 'programming',
    language: 'python',
    difficulty: 'beginner',
    title: {
      en: 'Alphanumeric Palindrome Check',
      ar: 'فحص التناظر (Palindrome)',
    },
    description: {
      en: 'Write a function is_palindrome(text) that returns True if text reads the same forward and backward when ignoring spaces, punctuation, and letter casing.',
      ar: 'اكتب دالة is_palindrome(text) تُرجع True إذا كان النص يُقرأ بنفس الشكل من اليمين واليسار بعد تجاهل المسافات وعلامات الترقيم وحالة الأحرف.',
    },
    examples: [
      { input: 'is_palindrome("Race car!")', output: 'True' },
      { input: 'is_palindrome("QusaiDev")', output: 'False' },
    ],
    hints: {
      en: [
        'Filter characters using ch.isalnum() and convert to lowercase with ch.lower().',
        'Compare the cleaned string against its reverse using slicing: cleaned[::-1].',
      ],
      ar: [
        'رشّح الأحرف والأرقام باستخدام ch.isalnum() وحوّلها لأحرف صغيرة عبر ch.lower().',
        'قارن النص المنظف مع معكوسه باستخدام التقطيع: cleaned[::-1].',
      ],
    },
    explanation: {
      en: 'Normalizing the string to lowercase alphanumeric characters removes formatting noise so palindrome symmetry can be checked directly against its reversed copy.',
      ar: 'توحيد النص بإبقاء الأحرف والأرقام الصغيرة فقط يزيل المسافات والرموز لتتم مقارنة التناظر مباشرة مع معكوس النص.',
    },
    stepByStep: {
      en: [
        'Build a list of lowercase characters where ch.isalnum() is True.',
        'Join them into a normalized string cleaned.',
        'Return cleaned == cleaned[::-1].',
      ],
      ar: [
        'تكوين قائمة بالأحرف والأرقام الصغيرة التي تحقق ch.isalnum().',
        'دمجها في نص واحد cleaned.',
        'إرجاع نتيجة المقارنة cleaned == cleaned[::-1].',
      ],
    },
    functionName: 'is_palindrome',
    starterCode: `def is_palindrome(text):
    # Ignore non-alphanumeric characters and case
    return False`,
    solutionCode: `def is_palindrome(text):
    cleaned = "".join([c.lower() for c in text if c.isalnum()])
    return cleaned == cleaned[::-1]`,
    pythonTests: [
      { id: 't1', label: 'Phrase with punctuation', args: ['A man, a plan, a canal: Panama'], expected: true },
      { id: 't2', label: 'Mixed case', args: ['RaceCar'], expected: true },
      { id: 't3', label: 'Non-palindrome', args: ['QusaiDev'], expected: false },
      { id: 't4', label: 'Empty string', args: ['   '], expected: true },
    ],
  },

  // 3. Python Intermediate 1
  {
    id: 'py-char-freq',
    kind: 'programming',
    language: 'python',
    difficulty: 'intermediate',
    title: {
      en: 'Character Frequency Map',
      ar: 'خريطة تكرار الأحرف',
    },
    description: {
      en: 'Write char_frequency(text) that returns a dictionary counting each lowercase character in text, excluding space characters (" ").',
      ar: 'اكتب دالة char_frequency(text) تُرجع قاموساً (dict) يحسب تكرار كل حرف بحالة صغيرة في النص مع استثناء المسافات (" ").',
    },
    examples: [
      { input: 'char_frequency("Hi hi")', output: '{"h": 2, "i": 2}' },
      { input: 'char_frequency("ab a")', output: '{"a": 2, "b": 1}' },
    ],
    hints: {
      en: [
        'Initialize an empty dictionary counts = {}.',
        'Skip characters equal to " ", lowercase each remaining character, and use counts.get(ch, 0) + 1.',
      ],
      ar: [
        'ابدأ بقاموس فارغ counts = {}.',
        'تجاهل المسافة " " وحوّل كل حرف إلى lowercase ثم حدّث القاموس عبر counts.get(ch, 0) + 1.',
      ],
    },
    explanation: {
      en: 'A dictionary provides O(1) average lookup and update per character, resulting in O(n) total time complexity.',
      ar: 'يوفر القاموس (Dictionary) وصولاً وتحديثاً سريعاً بمتوسط O(1) لكل حرف، مما يعطي تعقيداً زمنياً إجمالياً O(n).',
    },
    stepByStep: {
      en: [
        'Create counts = {}.',
        'Iterate over ch in text.lower().',
        'If ch != " ", set counts[ch] = counts.get(ch, 0) + 1.',
        'Return counts.',
      ],
      ar: [
        'إنشاء قاموس counts = {}.',
        'الدوران على كل حرف ch داخل text.lower().',
        'إذا لم يكن الحرف مسافة، نحدث counts[ch] = counts.get(ch, 0) + 1.',
        'إرجاع القاموس counts.',
      ],
    },
    functionName: 'char_frequency',
    starterCode: `def char_frequency(text):
    counts = {}
    return counts`,
    solutionCode: `def char_frequency(text):
    counts = {}
    for ch in text.lower():
        if ch != " ":
            counts[ch] = counts.get(ch, 0) + 1
    return counts`,
    pythonTests: [
      { id: 't1', label: 'Case-insensitive words', args: ['Hi hi'], expected: { h: 2, i: 2 } },
      { id: 't2', label: 'Simple string', args: ['ab a'], expected: { a: 2, b: 1 } },
      { id: 't3', label: 'Spaces only', args: ['   '], expected: {} },
    ],
  },

  // 4. Python Intermediate 2
  {
    id: 'py-two-sum',
    kind: 'programming',
    language: 'python',
    difficulty: 'intermediate',
    title: {
      en: 'Two Sum Indices',
      ar: 'مؤشرا المجموع الثنائي (Two Sum)',
    },
    description: {
      en: 'Given a list of integers nums and an integer target, write two_sum(nums, target) returning a list [i, j] (i < j) of indices whose values add up to target.',
      ar: 'اكتب دالة two_sum(nums, target) تُرجع قائمة [i, j] لمؤشري عنصرين مختلفين (i < j) مجموعهما يساوي target.',
    },
    examples: [
      { input: 'two_sum([2, 7, 11, 15], 9)', output: '[0, 1]' },
      { input: 'two_sum([3, 2, 4], 6)', output: '[1, 2]' },
    ],
    hints: {
      en: [
        'Store each visited number and its index in a dictionary seen = {}.',
        'For each index i and value n, compute need = target - n and check if need is in seen.',
      ],
      ar: [
        'خزّن كل رقم تمت زيارته مع مؤشره داخل قاموس seen = {}.',
        'لكل عنصر n في المؤشر i، احسب need = target - n وتحقق من وجوده داخل seen.',
      ],
    },
    explanation: {
      en: 'Instead of O(n²) nested loops, a hash map stores seen numbers so each complement check runs in O(1) time.',
      ar: 'بدلاً من حلقتين متداخلتين بتعقيد O(n²)، يحفظ القاموس العناصر السابقة لتتحقق من المكمل في زمن O(1).',
    },
    stepByStep: {
      en: [
        'Create seen = {}.',
        'Loop with for i, n in enumerate(nums).',
        'Compute diff = target - n. If diff in seen, return [seen[diff], i].',
        'Otherwise set seen[n] = i.',
      ],
      ar: [
        'إنشاء القاموس seen = {}.',
        'الدوران باستخدام for i, n in enumerate(nums).',
        'حساب diff = target - n، وإذا وُجد في seen نُرجع [seen[diff], i].',
        'وإلا نخزّن seen[n] = i.',
      ],
    },
    functionName: 'two_sum',
    starterCode: `def two_sum(nums, target):
    seen = {}
    return []`,
    solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
    pythonTests: [
      { id: 't1', label: 'First pair', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { id: 't2', label: 'Later pair', args: [[3, 2, 4], 6], expected: [1, 2] },
      { id: 't3', label: 'Duplicate values', args: [[3, 3], 6], expected: [0, 1] },
      { id: 't4', label: 'Negatives', args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
    ],
  },

  // 5. Python Advanced 1
  {
    id: 'py-valid-brackets',
    kind: 'programming',
    language: 'python',
    difficulty: 'advanced',
    title: {
      en: 'Balanced Brackets Validator',
      ar: 'التحقق من توازن الأقواس (Stack)',
    },
    description: {
      en: 'Write is_valid_brackets(s) to verify that brackets (), {}, and [] are properly matched and nested in order.',
      ar: 'اكتب دالة is_valid_brackets(s) للتحقق من أن جميع الأقواس () و {} و [] مغلقة بالترتيب الصحيح.',
    },
    examples: [
      { input: 'is_valid_brackets("({[]})")', output: 'True' },
      { input: 'is_valid_brackets("([)]")', output: 'False' },
    ],
    hints: {
      en: [
        'Use a list as a LIFO stack and a dictionary mapping each closing bracket to its opening bracket.',
        'When encountering a closing bracket, ensure stack is non-empty and stack.pop() matches.',
      ],
      ar: [
        'استخدم قائمة كمكدس (Stack) مع قاموس يربط كل قوس إغلاق بقوس الفتح المقابل له.',
        'عند مصادفة قوس إغلاق، تأكد أن المكدس غير فارغ وأن القيمة المسحوبة stack.pop() تطابق الفتح.',
      ],
    },
    explanation: {
      en: 'A stack enforces Last-In-First-Out order, guaranteeing that the most recently opened bracket is closed first.',
      ar: 'يفرض المكدس (LIFO) إغلاق آخر قوس تم فتحه أولاً، مما يضمن صحة التداخل بين الأقواس.',
    },
    stepByStep: {
      en: [
        'Create pairs = {")": "(", "}": "{", "]": "["} and stack = [].',
        'For each char ch in s: if ch in pairs, verify stack is non-empty and stack.pop() == pairs[ch].',
        'Otherwise append opening bracket to stack.',
        'After the loop, return len(stack) == 0.',
      ],
      ar: [
        'تعريف pairs = {")": "(", "}": "{", "]": "["} ومكدس stack = [].',
        'لكل رمز ch: إذا كان في pairs نتحقق من أن stack غير فارغ وأن stack.pop() == pairs[ch].',
        'وإلا نضيف قوس الفتح إلى stack.',
        'بعد انتهاء السلسلة نُرجع len(stack) == 0.',
      ],
    },
    functionName: 'is_valid_brackets',
    starterCode: `def is_valid_brackets(s):
    stack = []
    return False`,
    solutionCode: `def is_valid_brackets(s):
    pairs = {")": "(", "}": "{", "]": "["}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return len(stack) == 0`,
    pythonTests: [
      { id: 't1', label: 'Nested brackets', args: ['({[]})'], expected: true },
      { id: 't2', label: 'Sequential valid', args: ['()[]{}'], expected: true },
      { id: 't3', label: 'Interleaved invalid', args: ['([)]'], expected: false },
      { id: 't4', label: 'Unclosed opening', args: ['((('], expected: false },
      { id: 't5', label: 'Leading closing', args: [']'], expected: false },
    ],
  },

  // 6. Python Advanced 2
  {
    id: 'py-longest-unique',
    kind: 'programming',
    language: 'python',
    difficulty: 'advanced',
    title: {
      en: 'Longest Substring Without Repeats',
      ar: 'أطول سلسلة فرعية بدون تكرار',
    },
    description: {
      en: 'Write longest_unique_len(s) using a sliding window to return the length of the longest contiguous substring with no repeated characters.',
      ar: 'اكتب دالة longest_unique_len(s) لإرجاع طول أطول سلسلة نصية فرعية متصلة دون تكرار أي حرف.',
    },
    examples: [
      { input: 'longest_unique_len("abcabcbb")', output: '3' },
      { input: 'longest_unique_len("pwwkew")', output: '3' },
    ],
    hints: {
      en: [
        'Track the last seen index of every character in a dictionary last_seen = {}.',
        'Advance the window start pointer left = max(left, last_seen[ch] + 1) whenever ch was seen inside the current window.',
      ],
      ar: [
        'احفظ آخر فهرس ظهر فيه كل حرف داخل قاموس last_seen = {}.',
        'حرّك مؤشر البداية left = max(left, last_seen[ch] + 1) عندما يكون الحرف قد ظهر مسبقاً.',
      ],
    },
    explanation: {
      en: 'Sliding window + last-seen index map jumps the left boundary forward cleanly in O(n) single-pass time.',
      ar: 'تسمح تقنية النافذة المنزلقة مع خريطة آخر ظهور بتحريك البداية في مرور واحد O(n).',
    },
    stepByStep: {
      en: [
        'Initialize last_seen = {}, left = 0, and best = 0.',
        'Iterate with right, ch in enumerate(s).',
        'If ch in last_seen and last_seen[ch] >= left, set left = last_seen[ch] + 1.',
        'Update last_seen[ch] = right and best = max(best, right - left + 1).',
      ],
      ar: [
        'تهيئة last_seen = {} و left = 0 و best = 0.',
        'الدوران على right, ch في enumerate(s).',
        'إذا كان الحرف في last_seen ومؤشره >= left، نجعل left = last_seen[ch] + 1.',
        'تحديث last_seen[ch] = right وأخذ القيمة القصوى best = max(best, right - left + 1).',
      ],
    },
    functionName: 'longest_unique_len',
    starterCode: `def longest_unique_len(s):
    left = 0
    best = 0
    return best`,
    solutionCode: `def longest_unique_len(s):
    last_seen = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        if right - left + 1 > best:
            best = right - left + 1
    return best`,
    pythonTests: [
      { id: 't1', label: 'Repeated cycle', args: ['abcabcbb'], expected: 3 },
      { id: 't2', label: 'All identical', args: ['bbbb'], expected: 1 },
      { id: 't3', label: 'Middle overlap', args: ['pwwkew'], expected: 3 },
      { id: 't4', label: 'Empty string', args: [''], expected: 0 },
    ],
  },

  // 7. JavaScript Beginner
  {
    id: 'js-chunk-array',
    kind: 'programming',
    language: 'javascript',
    difficulty: 'beginner',
    title: {
      en: 'Chunk Array into Groups',
      ar: 'تقسيم المصفوفة إلى مجموعات',
    },
    description: {
      en: 'Write a JavaScript function chunkArray(arr, size) that splits arr into sub-arrays of length size.',
      ar: 'اكتب دالة JavaScript باسم chunkArray(arr, size) تقسّم المصفوفة arr إلى مصفوفات فرعية بطول size.',
    },
    examples: [
      { input: 'chunkArray([1, 2, 3, 4, 5], 2)', output: '[[1, 2], [3, 4], [5]]' },
      { input: 'chunkArray([], 3)', output: '[]' },
    ],
    hints: {
      en: [
        'Iterate with index i advancing by size (i += size).',
        'Use arr.slice(i, i + size) on each step.',
      ],
      ar: [
        'استخدم حلقة تتقدم بمقدار size في كل دورة (i += size).',
        'استخرج كل قطعة باستخدام arr.slice(i, i + size).',
      ],
    },
    explanation: {
      en: 'Stepping by chunk size with Array.prototype.slice creates balanced groups and naturally handles a shorter trailing chunk.',
      ar: 'التقدم بمقدار size مع دالة slice يقطع المصفوفة بدقة دون الحاجة لحساب خاص للجزء الأخير الأصغر.',
    },
    stepByStep: {
      en: [
        'Guard against size <= 0 by returning [].',
        'Initialize result = [].',
        'Loop for (let i = 0; i < arr.length; i += size) and push arr.slice(i, i + size).',
        'Return result.',
      ],
      ar: [
        'في حال size <= 0 نُرجع [].',
        'تعريف result = [].',
        'حلقة for (let i = 0; i < arr.length; i += size) وإضافة arr.slice(i, i + size).',
        'إرجاع result.',
      ],
    },
    functionName: 'chunkArray',
    starterCode: `function chunkArray(arr, size) {
  const result = [];
  return result;
}`,
    solutionCode: `function chunkArray(arr, size) {
  if (size <= 0) return [];
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}`,
    jsTests: [
      { id: 't1', label: 'Uneven split', args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] },
      { id: 't2', label: 'Exact split', args: [['a', 'b', 'c', 'd'], 2], expected: [['a', 'b'], ['c', 'd']] },
      { id: 't3', label: 'Empty input', args: [[], 3], expected: [] },
    ],
  },

  // 8. JavaScript Intermediate
  {
    id: 'js-group-by',
    kind: 'programming',
    language: 'javascript',
    difficulty: 'intermediate',
    title: {
      en: 'Group Objects by Key',
      ar: 'تجميع الكائنات حسب مفتاح',
    },
    description: {
      en: 'Write groupByKey(items, key) that groups an array of objects into a dictionary object keyed by String(item[key]).',
      ar: 'اكتب دالة groupByKey(items, key) تجمع مصفوفة من الكائنات في كائن واحد مفاتيحه هي قيم item[key].',
    },
    examples: [
      {
        input: 'groupByKey([{role:"dev", name:"Ali"}, {role:"net", name:"Omar"}], "role")',
        output: '{"dev":[{"role":"dev","name":"Ali"}],"net":[{"role":"net","name":"Omar"}]}',
      },
    ],
    hints: {
      en: [
        'Use a loop or reduce to accumulate buckets inside an empty object {}.',
        'Initialize acc[groupKey] = [] if it does not exist yet before pushing the item.',
      ],
      ar: [
        'استخدم حلقة أو reduce لبناء المجموعات داخل كائن فارغ {}.',
        'تأكد من إنشاء مصفوفة acc[groupKey] = [] عند عدم وجودها قبل إضافة العنصر.',
      ],
    },
    explanation: {
      en: 'Grouping records by a shared property in a single O(n) pass avoids repeatedly filtering the array per category.',
      ar: 'تجميع العناصر في مرور واحد O(n) يغني عن إعادة تصفية المصفوفة لكل فئة على حدة.',
    },
    stepByStep: {
      en: [
        'Create grouped = {}.',
        'Loop through each item of items.',
        'Read k = String(item[key]). If !grouped[k], set grouped[k] = [].',
        'Push item to grouped[k] and return grouped.',
      ],
      ar: [
        'إنشاء الكائن grouped = {}.',
        'المرور على كل عنصر في items.',
        'قراءة k = String(item[key])، وإنشاء مصفوفة عند عدم وجودها.',
        'إضافة العنصر إلى grouped[k] وإرجاع الكائن النهائي.',
      ],
    },
    functionName: 'groupByKey',
    starterCode: `function groupByKey(items, key) {
  const grouped = {};
  return grouped;
}`,
    solutionCode: `function groupByKey(items, key) {
  const grouped = {};
  for (const item of items) {
    const k = String(item[key]);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(item);
  }
  return grouped;
}`,
    jsTests: [
      {
        id: 't1',
        label: 'Group by role',
        args: [
          [
            { role: 'dev', name: 'Ali' },
            { role: 'net', name: 'Omar' },
            { role: 'dev', name: 'Zaid' },
          ],
          'role',
        ],
        expected: {
          dev: [
            { role: 'dev', name: 'Ali' },
            { role: 'dev', name: 'Zaid' },
          ],
          net: [{ role: 'net', name: 'Omar' }],
        },
      },
      { id: 't2', label: 'Empty list', args: [[], 'role'], expected: {} },
    ],
  },

  // 9. JavaScript Advanced
  {
    id: 'js-binary-search',
    kind: 'programming',
    language: 'javascript',
    difficulty: 'advanced',
    title: {
      en: 'Binary Search Target Index',
      ar: 'البحث الثنائي (Binary Search)',
    },
    description: {
      en: 'Write binarySearch(nums, target) that returns the index of target in a sorted ascending array nums, or -1 if absent.',
      ar: 'اكتب دالة binarySearch(nums, target) تُرجع فهرس target في مصفوفة مرتبة تصاعدياً أو -1 إذا لم يكن موجوداً.',
    },
    examples: [
      { input: 'binarySearch([2, 5, 8, 12, 16, 23], 12)', output: '3' },
      { input: 'binarySearch([2, 5, 8], 7)', output: '-1' },
    ],
    hints: {
      en: [
        'Maintain left = 0 and right = nums.length - 1.',
        'Compute mid = Math.floor((left + right) / 2) and halve the search interval on each comparison.',
      ],
      ar: [
        'حدّد المؤشرين left = 0 و right = nums.length - 1.',
        'احسب المنتصف mid = Math.floor((left + right) / 2) وقلّص نطاق البحث إلى النصف في كل خطوة.',
      ],
    },
    explanation: {
      en: 'Binary search discards half the remaining search space every iteration, achieving O(log n) lookup time.',
      ar: 'يستبعد البحث الثنائي نصف المساحة المتبقية في كل خطوة ليصل إلى زمن بحث O(log n).',
    },
    stepByStep: {
      en: [
        'Set left = 0, right = nums.length - 1.',
        'While left <= right, compute mid = Math.floor((left + right) / 2).',
        'If nums[mid] === target return mid; if nums[mid] < target set left = mid + 1; else right = mid - 1.',
        'Return -1 if the loop ends without finding target.',
      ],
      ar: [
        'تعيين left = 0 و right = nums.length - 1.',
        'طالما left <= right احسب mid = Math.floor((left + right) / 2).',
        'إذا تطابق العنصر أرجع mid؛ وإلا حرّك left أو right حسب المقارنة.',
        'إرجاع -1 إذا انتهى البحث دون نتيجة.',
      ],
    },
    functionName: 'binarySearch',
    starterCode: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  return -1;
}`,
    solutionCode: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    jsTests: [
      { id: 't1', label: 'Middle match', args: [[2, 5, 8, 12, 16, 23], 12], expected: 3 },
      { id: 't2', label: 'First element', args: [[10, 20, 30], 10], expected: 0 },
      { id: 't3', label: 'Missing value', args: [[2, 5, 8, 12], 7], expected: -1 },
      { id: 't4', label: 'Empty array', args: [[], 5], expected: -1 },
    ],
  },

  // 10. HTML & CSS Beginner
  {
    id: 'web-flex-navbar',
    kind: 'programming',
    language: 'html-css',
    difficulty: 'beginner',
    title: {
      en: 'Semantic Flexbox Header',
      ar: 'شريط تنقل مرن (Flexbox Header)',
    },
    description: {
      en: 'Create a semantic <nav class="navbar"> using CSS display: flex and justify-content: space-between containing at least 3 <a> navigation links.',
      ar: 'أنشئ عنصر <nav class="navbar"> يستخدم display: flex و justify-content: space-between ويحتوي على 3 روابط <a> على الأقل.',
    },
    examples: [
      { input: '<nav class="navbar"> with 3 <a> links', output: 'Computed display: flex' },
    ],
    hints: {
      en: [
        'Use <nav class="navbar"> with <a> tags inside.',
        'Set display: flex; justify-content: space-between; align-items: center; in CSS.',
      ],
      ar: [
        'استخدم وسم <nav class="navbar"> وضع بداخله روابط <a>.',
        'أضف في CSS الخصائص display: flex; justify-content: space-between; align-items: center;.',
      ],
    },
    explanation: {
      en: 'Semantic <nav> tags improve screen-reader landmark navigation while Flexbox aligns links horizontally with consistent spacing.',
      ar: 'استخدام وسم <nav> الدلالي يدعم قارئات الشاشة، بينما ينظم Flexbox الروابط أفقياً بمرونة.',
    },
    stepByStep: {
      en: [
        'Add <nav class="navbar"> containing 3 <a> links.',
        'Style .navbar with display: flex and justify-content: space-between.',
        'Add padding and color contrast for readability.',
      ],
      ar: [
        'إضافة <nav class="navbar"> وبداخله 3 روابط <a>.',
        'تنسيق .navbar باستخدام display: flex و justify-content: space-between.',
        'ضبط المسافات والتباين اللوني للوضوح.',
      ],
    },
    starterHtml: `<nav class="navbar">
  <a href="#home">QUSAI.DEV</a>
  <a href="#labs">Labs</a>
</nav>`,
    starterCss: `.navbar {
  background: #0f172a;
  padding: 12px 16px;
}
.navbar a {
  color: #e2e8f0;
  text-decoration: none;
}`,
    solutionHtml: `<nav class="navbar">
  <a href="#home">QUSAI.DEV</a>
  <a href="#labs">Labs</a>
  <a href="#contact">Contact</a>
</nav>`,
    solutionCss: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  padding: 12px 20px;
  border-radius: 10px;
}
.navbar a {
  color: #e2e8f0;
  text-decoration: none;
  font-family: system-ui, sans-serif;
  font-weight: 600;
}`,
    domAssertions: [
      {
        id: 'c1',
        labelEn: '<nav class="navbar"> exists',
        labelAr: 'وجود عنصر <nav class="navbar">',
        selector: 'nav.navbar',
        check: 'exists',
      },
      {
        id: 'c2',
        labelEn: 'At least 3 <a> links inside nav',
        labelAr: 'وجود 3 روابط <a> على الأقل داخل nav',
        selector: 'nav.navbar a',
        check: 'minCount',
        expected: 3,
      },
      {
        id: 'c3',
        labelEn: 'Computed display is flex',
        labelAr: 'خاصية display المحسوبة هي flex',
        selector: 'nav.navbar',
        check: 'styleEquals',
        prop: 'display',
        expected: 'flex',
      },
      {
        id: 'c4',
        labelEn: 'justify-content is space-between',
        labelAr: 'خاصية justify-content هي space-between',
        selector: 'nav.navbar',
        check: 'styleEquals',
        prop: 'justifyContent',
        expected: 'space-between',
      },
    ],
  },

  // 11. HTML & CSS Intermediate
  {
    id: 'web-grid-cards',
    kind: 'programming',
    language: 'html-css',
    difficulty: 'intermediate',
    title: {
      en: 'CSS Grid Card Deck',
      ar: 'شبكة بطاقات CSS Grid',
    },
    description: {
      en: 'Build a .deck container using display: grid with gap >= 12px and 4 .card children having border-radius >= 8px.',
      ar: 'أنشئ حاوية .deck تستخدم display: grid مع مسافة gap >= 12px وتحتوي على 4 بطاقات .card باستدارة حواف border-radius >= 8px.',
    },
    examples: [
      { input: '<div class="deck"> + 4 <article class="card">', output: 'Grid layout + rounded cards' },
    ],
    hints: {
      en: [
        'Use display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; on .deck.',
        'Include 4 elements with class="card" and border-radius: 12px.',
      ],
      ar: [
        'استخدم display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; على .deck.',
        'أضف 4 عناصر بصنف card مع border-radius: 12px.',
      ],
    },
    explanation: {
      en: 'CSS Grid coordinates two-dimensional columns and rows cleanly with consistent gap spacing.',
      ar: 'تتيح شبكة CSS Grid توزيع البطاقات في أعمدة وصفوف متناسقة مع مسافات ثابتة.',
    },
    stepByStep: {
      en: [
        'Place 4 .card elements inside <section class="deck">.',
        'Apply display: grid and gap: 16px to .deck.',
        'Give .card elements padding and border-radius: 12px.',
      ],
      ar: [
        'وضع 4 عناصر .card داخل <section class="deck">.',
        'تطبيق display: grid و gap: 16px على .deck.',
        'إعطاء .card حشوة داخلية و border-radius: 12px.',
      ],
    },
    starterHtml: `<section class="deck">
  <article class="card">Node 1</article>
  <article class="card">Node 2</article>
</section>`,
    starterCss: `.deck {
  padding: 12px;
}
.card {
  background: #0f172a;
  color: #f8fafc;
  padding: 16px;
}`,
    solutionHtml: `<section class="deck">
  <article class="card">Node 1</article>
  <article class="card">Node 2</article>
  <article class="card">Node 3</article>
  <article class="card">Node 4</article>
</section>`,
    solutionCss: `.deck {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 12px;
  font-family: system-ui, sans-serif;
}
.card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  color: #f8fafc;
  padding: 16px;
}`,
    domAssertions: [
      {
        id: 'c1',
        labelEn: '.deck uses display: grid',
        labelAr: 'الحاوية .deck تستخدم display: grid',
        selector: '.deck',
        check: 'styleEquals',
        prop: 'display',
        expected: 'grid',
      },
      {
        id: 'c2',
        labelEn: 'At least 4 .card elements',
        labelAr: 'وجود 4 بطاقات .card على الأقل',
        selector: '.deck .card',
        check: 'minCount',
        expected: 4,
      },
      {
        id: 'c3',
        labelEn: '.deck gap >= 12px',
        labelAr: 'مسافة gap في .deck لا تقل عن 12px',
        selector: '.deck',
        check: 'minPx',
        prop: 'rowGap',
        expected: 12,
      },
      {
        id: 'c4',
        labelEn: '.card border-radius >= 8px',
        labelAr: 'استدارة حواف .card لا تقل عن 8px',
        selector: '.deck .card',
        check: 'minPx',
        prop: 'borderTopLeftRadius',
        expected: 8,
      },
    ],
  },

  // 12. HTML & CSS Advanced
  {
    id: 'web-neon-button',
    kind: 'programming',
    language: 'html-css',
    difficulty: 'advanced',
    title: {
      en: 'Accessible Gradient Action Button',
      ar: 'زر تدرج لوني متوافق مع الوصولية',
    },
    description: {
      en: 'Build a <button class="neon-btn"> with an aria-label attribute, border-radius >= 10px, paddingLeft >= 16px, and a CSS gradient background-image.',
      ar: 'أنشئ زر <button class="neon-btn"> يحمل سمة aria-label، مع border-radius >= 10px، وحشوة أفقية paddingLeft >= 16px، وخلفية متدرجة background-image.',
    },
    examples: [
      { input: '<button class="neon-btn" aria-label="Launch">Launch</button>', output: 'Gradient + accessible label' },
    ],
    hints: {
      en: [
        'Add aria-label="..." to the <button class="neon-btn"> element.',
        'Use background: linear-gradient(135deg, #2563eb, #7c3aed); and padding: 12px 24px;.',
      ],
      ar: [
        'أضف السمة aria-label="..." لعنصر <button class="neon-btn">.',
        'استخدم background: linear-gradient(135deg, #2563eb, #7c3aed); و padding: 12px 24px;.',
      ],
    },
    explanation: {
      en: 'Computed background-image captures linear-gradient declarations reliably while aria-label guarantees clear accessible naming.',
      ar: 'يتم التحقق من التدرج اللوني عبر background-image المحسوبة مع ضمان وضوح الوصف لقارئات الشاشة عبر aria-label.',
    },
    stepByStep: {
      en: [
        'Create <button class="neon-btn" aria-label="Launch platform">Launch</button>.',
        'Apply linear-gradient background, white color, padding: 12px 24px, and border-radius: 12px.',
      ],
      ar: [
        'إنشاء <button class="neon-btn" aria-label="Launch platform">Launch</button>.',
        'تطبيق تدرج linear-gradient وحشوة 12px 24px واستدارة 12px.',
      ],
    },
    starterHtml: `<button class="neon-btn">Launch</button>`,
    starterCss: `.neon-btn {
  background: #2563eb;
  color: #ffffff;
  border: 0;
  padding: 8px 10px;
}`,
    solutionHtml: `<button class="neon-btn" aria-label="Launch module">Launch</button>`,
    solutionCss: `.neon-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  border: 0;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
}`,
    domAssertions: [
      {
        id: 'c1',
        labelEn: 'button.neon-btn has aria-label',
        labelAr: 'الزر يحتوي على سمة aria-label',
        selector: 'button.neon-btn',
        check: 'hasAttr',
        prop: 'aria-label',
      },
      {
        id: 'c2',
        labelEn: 'Gradient background-image applied',
        labelAr: 'تطبيق تدرج لوني في الخلفية',
        selector: 'button.neon-btn',
        check: 'styleIncludes',
        prop: 'backgroundImage',
        expected: 'gradient',
      },
      {
        id: 'c3',
        labelEn: 'border-radius >= 10px',
        labelAr: 'استدارة الحواف >= 10px',
        selector: 'button.neon-btn',
        check: 'minPx',
        prop: 'borderTopLeftRadius',
        expected: 10,
      },
      {
        id: 'c4',
        labelEn: 'padding-left >= 16px',
        labelAr: 'الحشوة اليسرى >= 16px',
        selector: 'button.neon-btn',
        check: 'minPx',
        prop: 'paddingLeft',
        expected: 16,
      },
    ],
  },
];

export const NETWORKING_CHALLENGES: NetworkingChallenge[] = [
  // 1. IPv4 Subnetting
  {
    id: 'net-usable-26',
    kind: 'networking',
    topic: 'subnetting',
    difficulty: 'beginner',
    title: {
      en: 'Usable Hosts in a /26 Subnet',
      ar: 'عدد الأجهزة المتاحة في شبكة /26',
    },
    description: {
      en: 'Calculate the exact number of usable host IPv4 addresses available in a /26 subnet, and determine its subnet mask.',
      ar: 'احسب العدد الدقيق لعناوين الأجهزة المتاحة للاستخدام في شبكة /26، وحدد قناع الشبكة الخاص بها.',
    },
    hints: {
      en: [
        'Host bits = 32 - 26 = 6 bits.',
        'Usable hosts = 2^6 - 2 (subtracting network and broadcast addresses).',
      ],
      ar: [
        'عدد بتات المضيف = 32 - 26 = 6 بت.',
        'الأجهزة المتاحة = 2^6 - 2 (بعد استثناء عنوان الشبكة وعنوان البث).',
      ],
    },
    explanation: {
      en: 'A /26 mask uses 26 network bits and 6 host bits. 2^6 = 64 total addresses minus 2 reserved addresses (network + broadcast) equals 62 usable hosts, and the last octet is 192 (128 + 64).',
      ar: 'البادئة /26 تترك 6 بتات للأجهزة. 2^6 = 64 عنواناً إجمالياً، نطرح منها عنوان الشبكة وعنوان البث ليتبقى 62 جهازاً متاحاً، وقناع الشبكة هو 255.255.255.192.',
    },
    stepByStep: {
      en: [
        'Compute host bits: 32 - 26 = 6.',
        'Compute total addresses: 2^6 = 64.',
        'Subtract network and broadcast: 64 - 2 = 62 usable hosts.',
        'Sum top 2 bits of the 4th octet: 128 + 64 = 192 -> 255.255.255.192.',
      ],
      ar: [
        'حساب بتات المضيف: 32 - 26 = 6.',
        'حساب إجمالي العناوين: 2^6 = 64.',
        'طرح عنوان الشبكة والبث: 64 - 2 = 62 جهازاً متاحاً.',
        'جمع أعلى بتين في الثمانية الرابعة: 128 + 64 = 192 أي 255.255.255.192.',
      ],
    },
    fields: [
      {
        id: 'hosts',
        label: { en: 'Usable Host Count', ar: 'عدد الأجهزة المتاحة' },
        placeholder: '62',
        type: 'integer',
        expected: '62',
      },
      {
        id: 'mask',
        label: { en: 'Subnet Mask', ar: 'قناع الشبكة' },
        placeholder: '255.255.255.192',
        type: 'ipv4',
        expected: '255.255.255.192',
      },
    ],
  },

  // 2. CIDR Calculation
  {
    id: 'net-mask-to-cidr',
    kind: 'networking',
    topic: 'cidr',
    difficulty: 'beginner',
    title: {
      en: 'Convert Subnet Mask 255.255.248.0 to CIDR',
      ar: 'تحويل القناع 255.255.248.0 إلى CIDR',
    },
    description: {
      en: 'Convert the subnet mask 255.255.248.0 into its CIDR prefix length and identify the block increment in the 3rd octet.',
      ar: 'حوّل قناع الشبكة 255.255.248.0 إلى بادئة CIDR وحدد مقدار القفزة (Block Size) في الثمانية الثالثة.',
    },
    hints: {
      en: [
        '255 + 255 gives 16 network bits in the first two octets.',
        '248 in binary is 11111000 (5 network bits), and block size is 256 - 248.',
      ],
      ar: [
        'الثمانيتان الأولى والثانية (255.255) تساويان 16 بت.',
        'القيمة 248 بالنظام الثنائي هي 11111000 (5 بتات)، ومقدار القفزة هو 256 - 248.',
      ],
    },
    explanation: {
      en: '16 + 5 = 21 leading 1-bits (/21), leaving an increment of 256 - 248 = 8 in the 3rd octet.',
      ar: '16 + 5 = 21 بت شبكة (/21)، وتكون القفزة في الثمانية الثالثة 256 - 248 = 8.',
    },
    stepByStep: {
      en: [
        'Octet 1 (255) = 8 bits, Octet 2 (255) = 8 bits -> 16 bits.',
        'Octet 3 (248) = 128+64+32+16+8 = 5 bits -> 16 + 5 = /21.',
        'Third-octet block increment = 256 - 248 = 8.',
      ],
      ar: [
        'الثمانية 1 و 2 تساويان 8 + 8 = 16 بت.',
        'الثمانية 3 (248) = 5 بتات إضافية، ليصبح المجموع /21.',
        'مقدار القفزة في الثمانية الثالثة = 256 - 248 = 8.',
      ],
    },
    fields: [
      {
        id: 'cidr',
        label: { en: 'CIDR Prefix (e.g. /21)', ar: 'بادئة CIDR (مثال /21)' },
        placeholder: '/21',
        type: 'cidr',
        expected: '21',
      },
      {
        id: 'increment',
        label: { en: '3rd Octet Block Increment', ar: 'مقدار القفزة في الثمانية الثالثة' },
        placeholder: '8',
        type: 'integer',
        expected: '8',
      },
    ],
  },

  // 3. Network & Broadcast Address
  {
    id: 'net-bcast-27',
    kind: 'networking',
    topic: 'addresses',
    difficulty: 'intermediate',
    title: {
      en: 'Network & Broadcast for 172.16.45.130/27',
      ar: 'عنوان الشبكة والبث للعنوان 172.16.45.130/27',
    },
    description: {
      en: 'Given IPv4 host 172.16.45.130/27, calculate both its Network Address and Broadcast Address.',
      ar: 'بالنسبة للعنوان 172.16.45.130/27، احسب كل من عنوان الشبكة (Network Address) وعنوان البث (Broadcast Address).',
    },
    hints: {
      en: [
        'A /27 mask is 255.255.255.224, so the 4th-octet block size is 256 - 224 = 32.',
        'List multiples of 32: 0, 32, 64, 96, 128, 160... Which block contains 130?',
      ],
      ar: [
        'قناع /27 هو 255.255.255.224 ومقدار القفزة في الثمانية الرابعة هو 32.',
        'مضاعفات 32 هي 0، 32، 64، 96، 128، 160... أي كتلة تحتوي الرقم 130؟',
      ],
    },
    explanation: {
      en: '130 falls between 128 and 159 (next network starts at 160). Therefore Network = 172.16.45.128 and Broadcast = 172.16.45.159.',
      ar: 'يقع الرقم 130 ضمن النطاق 128–159 (الشبكة التالية تبدأ عند 160). إذن عنوان الشبكة هو 172.16.45.128 وعنوان البث هو 172.16.45.159.',
    },
    stepByStep: {
      en: [
        'Identify block size for /27: 2^(32-27) = 32.',
        'Find largest multiple of 32 <= 130 -> 128 (Network = 172.16.45.128).',
        'Next subnet starts at 128 + 32 = 160.',
        'Broadcast is one address before next subnet: 172.16.45.159.',
      ],
      ar: [
        'حجم الكتلة للبادئة /27 يساوي 2^(32-27) = 32.',
        'أكبر مضاعف للعدد 32 لا يتجاوز 130 هو 128 (عنوان الشبكة = 172.16.45.128).',
        'الشبكة التالية تبدأ عند 128 + 32 = 160.',
        'عنوان البث يسبق الشبكة التالية برقم واحد: 172.16.45.159.',
      ],
    },
    fields: [
      {
        id: 'network',
        label: { en: 'Network Address', ar: 'عنوان الشبكة' },
        placeholder: '172.16.45.128',
        type: 'ipv4',
        expected: '172.16.45.128',
      },
      {
        id: 'broadcast',
        label: { en: 'Broadcast Address', ar: 'عنوان البث' },
        placeholder: '172.16.45.159',
        type: 'ipv4',
        expected: '172.16.45.159',
      },
    ],
  },

  // 4. Binary Conversion
  {
    id: 'net-ipv4-binary',
    kind: 'networking',
    topic: 'binary',
    difficulty: 'beginner',
    title: {
      en: 'IPv4 to Dotted 8-Bit Binary Conversion',
      ar: 'تحويل عنوان IPv4 إلى التمثيل الثنائي',
    },
    description: {
      en: 'Convert the IPv4 address 192.168.10.25 into four dot-separated 8-bit binary octets.',
      ar: 'حوّل عنوان IPv4 التالي 192.168.10.25 إلى أربع ثمانيات ثنائية (8 بت لكل جزء) مفصولة بنقاط.',
    },
    hints: {
      en: [
        '192 = 128 + 64 -> 11000000; 168 = 128 + 32 + 8 -> 10101000.',
        '10 = 8 + 2 -> 00001010; 25 = 16 + 8 + 1 -> 00011001.',
      ],
      ar: [
        '192 = 128 + 64 تعني 11000000، و 168 = 128 + 32 + 8 تعني 10101000.',
        '10 = 8 + 2 تعني 00001010، و 25 = 16 + 8 + 1 تعني 00011001.',
      ],
    },
    explanation: {
      en: 'Each octet converts independently using place values [128, 64, 32, 16, 8, 4, 2, 1] padded to 8 bits.',
      ar: 'يُحول كل جزء بشكل مستقل باستخدام أوزان البتات [128, 64, 32, 16, 8, 4, 2, 1] مع إكمال الصفر على اليسار ليصبح طول كل مقطع 8 بت.',
    },
    stepByStep: {
      en: [
        '192 = 128 + 64 -> 11000000.',
        '168 = 128 + 32 + 8 -> 10101000.',
        '10 = 8 + 2 -> 00001010.',
        '25 = 16 + 8 + 1 -> 00011001.',
      ],
      ar: [
        '192 = 128 + 64 → 11000000.',
        '168 = 128 + 32 + 8 → 10101000.',
        '10 = 8 + 2 → 00001010.',
        '25 = 16 + 8 + 1 → 00011001.',
      ],
    },
    fields: [
      {
        id: 'binary',
        label: { en: '32-bit Dotted Binary', ar: 'التمثيل الثنائي المفصول بنقاط' },
        placeholder: '11000000.10101000.00001010.00011001',
        type: 'binary32',
        expected: '11000000.10101000.00001010.00011001',
      },
    ],
  },

  // 5. IP Troubleshooting Scenario 1
  {
    id: 'net-troubleshoot-gateway',
    kind: 'networking',
    topic: 'troubleshooting',
    difficulty: 'intermediate',
    title: {
      en: 'Troubleshooting Unreachable Default Gateway',
      ar: 'تشخيص تعذر الوصول إلى البوابة الافتراضية',
    },
    description: {
      en: 'A workstation is configured with IP 192.168.10.66, subnet mask 255.255.255.192 (/26), and gateway 192.168.10.62, and cannot reach the router. Diagnose the subnet mismatch.',
      ar: 'حاسوب مهيأ بالعنوان 192.168.10.66 وقناع 255.255.255.192 (/26) والبوابة 192.168.10.62 ولا يستطيع الوصول للموجه. شخص الخطأ وحدد عنوان الشبكة الصحيح للحاسوب.',
    },
    scenarioDetails: {
      en: 'Host: 192.168.10.66/26 · Configured Gateway: 192.168.10.62 · Observed Symptom: ARP/ICMP timeout to gateway.',
      ar: 'الجهاز: 192.168.10.66/26 · البوابة المضبوطة: 192.168.10.62 · الأعراض: فشل ARP/Ping مع البوابة.',
    },
    hints: {
      en: [
        'For /26, block size is 64 (0–63, 64–127, 128–191...).',
        'Check which /26 subnet contains .62 versus .66.',
      ],
      ar: [
        'حجم الكتلة للبادئة /26 هو 64 (0–63، 64–127، 128–191...).',
        'تحقق من أي شبكة فرعية تحتوي .62 وأيها تحتوي .66.',
      ],
    },
    explanation: {
      en: '192.168.10.62 belongs to 192.168.10.0/26 (.0–.63), whereas 192.168.10.66 belongs to 192.168.10.64/26 (.64–.127). Host and gateway are in separate /26 subnets.',
      ar: 'العنوان 192.168.10.62 يقع ضمن شبكة 192.168.10.0/26، بينما 192.168.10.66 يقع ضمن شبكة 192.168.10.64/26، وبالتالي الجهاز والبوابة في شبكتين مختلفتين.',
    },
    stepByStep: {
      en: [
        '/26 creates blocks of 64 addresses: 0–63 and 64–127.',
        'Gateway .62 lies in 192.168.10.0/26 (where .62 is the last usable host).',
        'Workstation .66 lies in 192.168.10.64/26 (usable .65–.126).',
        'Fix: either move the host into 192.168.10.0/26 or assign a gateway inside 192.168.10.64/26 (e.g. .65).',
      ],
      ar: [
        'تقسيم /26 ينتج كتلاً بحجم 64: 0–63 و 64–127.',
        'البوابة .62 تقع في الشبكة الأولى 192.168.10.0/26.',
        'الحاسوب .66 يقع في الشبكة الثانية 192.168.10.64/26.',
        'الحل: توحيد الشبكة الفرعية للحاسوب والبوابة ضمن نفس كتلة /26.',
      ],
    },
    fields: [
      {
        id: 'cause',
        label: { en: 'Root Cause', ar: 'السبب الجذري للمشكلة' },
        placeholder: '',
        type: 'choice',
        expected: 'different-subnets',
        choices: [
          {
            value: 'different-subnets',
            label: {
              en: 'Host (.66) and gateway (.62) are in different /26 subnets',
              ar: 'الحاسوب (.66) والبوابة (.62) في شبكتي /26 مختلفتين',
            },
          },
          {
            value: 'loopback-conflict',
            label: {
              en: '192.168.10.66 is a reserved loopback address',
              ar: 'العنوان 192.168.10.66 محجوز للـ Loopback',
            },
          },
          {
            value: 'class-a-mismatch',
            label: {
              en: 'Private 192.168.x.x addresses cannot use /26 masks',
              ar: 'عناوين 192.168.x.x لا تدعم قناع /26',
            },
          },
        ],
      },
      {
        id: 'hostNet',
        label: { en: 'Workstation Network Address', ar: 'عنوان شبكة الحاسوب الصحيح' },
        placeholder: '192.168.10.64',
        type: 'ipv4',
        expected: '192.168.10.64',
      },
    ],
  },

  // 6. IP Troubleshooting Scenario 2
  {
    id: 'net-troubleshoot-bcast',
    kind: 'networking',
    topic: 'troubleshooting',
    difficulty: 'advanced',
    title: {
      en: 'Diagnose Invalid /25 Server Interface IP',
      ar: 'تشخيص عنوان خادم غير صالح في شبكة /25',
    },
    description: {
      en: 'An engineer tries assigning 10.20.30.127/25 to a server NIC and traffic fails. Identify why .127 cannot be a host IP and enter the maximum usable host IP for 10.20.30.0/25.',
      ar: 'حاول مهندس تعيين العنوان 10.20.30.127/25 لبطاقة شبكة خادم ففشل الاتصال. حدد سبب عدم صلاحية .127 كمضيف وأدخل آخر عنوان مضيف متاح في شبكة 10.20.30.0/25.',
    },
    hints: {
      en: [
        'A /25 mask (255.255.255.128) splits a /24 into two halves: 0–127 and 128–255.',
        'What role does the highest address (.127) play in 10.20.30.0/25?',
      ],
      ar: [
        'القناع /25 (255.255.255.128) يقسم النطاق إلى نصفين: 0–127 و 128–255.',
        'ما وظيفة أعلى عنوان (.127) في الشبكة 10.20.30.0/25؟',
      ],
    },
    explanation: {
      en: '10.20.30.127 is the directed broadcast address of 10.20.30.0/25. Valid usable hosts run strictly from 10.20.30.1 to 10.20.30.126.',
      ar: 'العنوان 10.20.30.127 هو عنوان البث (Broadcast) لشبكة 10.20.30.0/25، وآخر مضيف متاح للاستخدام هو 10.20.30.126.',
    },
    stepByStep: {
      en: [
        '/25 gives 128 total addresses per subnet: first subnet spans .0 to .127.',
        '.0 is the Network Address; .127 is the Broadcast Address.',
        'Usable host range is 10.20.30.1 through 10.20.30.126.',
      ],
      ar: [
        'البادئة /25 تعطي 128 عنواناً: الشبكة الأولى تمتد من .0 إلى .127.',
        'العنوان .0 هو عنوان الشبكة و .127 هو عنوان البث.',
        'نطاق الأجهزة المتاحة يمتد من 10.20.30.1 حتى 10.20.30.126.',
      ],
    },
    fields: [
      {
        id: 'reason',
        label: { en: 'Diagnosis', ar: 'التشخيص الصحيح' },
        placeholder: '',
        type: 'choice',
        expected: 'broadcast-ip',
        choices: [
          {
            value: 'broadcast-ip',
            label: {
              en: '10.20.30.127 is the /25 Broadcast Address',
              ar: 'العنوان 10.20.30.127 هو عنوان البث لشبكة /25',
            },
          },
          {
            value: 'network-ip',
            label: {
              en: '10.20.30.127 is the /25 Network Address',
              ar: 'العنوان 10.20.30.127 هو عنوان الشبكة',
            },
          },
          {
            value: 'multicast-ip',
            label: {
              en: '10.20.30.127 is a Class D multicast address',
              ar: 'العنوان من الفئة D للبث المتعدد',
            },
          },
        ],
      },
      {
        id: 'lastHost',
        label: { en: 'Last Usable Host in 10.20.30.0/25', ar: 'آخر مضيف متاح في 10.20.30.0/25' },
        placeholder: '10.20.30.126',
        type: 'ipv4',
        expected: '10.20.30.126',
      },
    ],
  },
];

export const ALL_CHALLENGES: DeveloperChallenge[] = [
  ...PROGRAMMING_CHALLENGES,
  ...NETWORKING_CHALLENGES,
];

export function getDailyChallenge(date = new Date()): DeveloperChallenge {
  const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ALL_CHALLENGES[hash % ALL_CHALLENGES.length];
}
