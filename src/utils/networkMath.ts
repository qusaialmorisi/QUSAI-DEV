export interface IPv4Details {
  ip: string;
  valid: boolean;
  octets: number[];
  octetBinary: string[];
  binaryDotted: string;
  binaryCompact: string;
  hexDotted: string;
  decimalInt: number;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
  scope: string;
  scopeKey: 'private' | 'loopback' | 'linkLocal' | 'cgnat' | 'multicast' | 'reserved' | 'public';
  reverseDns: string;
}

export interface SubnetMaskDetails {
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  binaryMask: string;
  hexMask: string;
  networkBits: number;
  hostBits: number;
  totalAddresses: number;
  usableHosts: number;
}

export interface SubnetDetails {
  inputIp: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  subnetMask: string;
  wildcardMask: string;
  binaryMask: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
  isPointToPoint: boolean;
  isHostRoute: boolean;
}

export interface SubnetSplitRow {
  index: number;
  network: string;
  cidr: number;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  usableHosts: number;
}

export interface IpRangeResult {
  valid: boolean;
  errorKey?: 'invalidIp' | 'inverted';
  startIp: string;
  endIp: string;
  startInt: number;
  endInt: number;
  totalAddresses: number;
  usableEstimate: number;
  cidrs: {
    cidrNotation: string;
    network: string;
    prefix: number;
    mask: string;
    size: number;
  }[];
}

export interface IpValidationResult {
  input: string;
  valid: boolean;
  version: 'IPv4' | 'IPv6' | 'Invalid';
  normalized: string;
  compressed?: string;
  scopeKey: string;
  notes: string;
}

export interface IPv6Details {
  input: string;
  valid: boolean;
  expanded: string;
  compressed: string;
  prefix64: string;
  interfaceId: string;
  solicitedNodeMulticast: string;
  reverseDns: string;
  binaryGroups: string[];
  scopeKey: string;
  scopeLabelEn: string;
  scopeLabelAr: string;
  embeddedIpv4: string | null;
}

export interface WellKnownPort {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  service: string;
  category: 'Web' | 'Remote & Shell' | 'Networking & ISP' | 'Database' | 'Security';
  descriptionEn: string;
  descriptionAr: string;
}

export function isValidIPv4(ip: string): boolean {
  const trimmed = ip.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
}

export function ipv4ToUint32(ip: string): number {
  const parts = ip.trim().split('.').map(Number);
  return (((parts[0] << 24) >>> 0) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function uint32ToIpv4(num: number): string {
  const n = num >>> 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

export function cidrToMaskUint32(cidr: number): number {
  if (cidr <= 0) return 0;
  if (cidr >= 32) return 0xffffffff >>> 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

export function isValidSubnetMask(mask: string): boolean {
  if (!isValidIPv4(mask)) return false;
  const val = ipv4ToUint32(mask);
  if (val === 0) return true;
  const inverted = (~val) >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

export function maskToCidr(mask: string): number | null {
  if (!isValidSubnetMask(mask)) return null;
  const val = ipv4ToUint32(mask);
  let bits = 0;
  let temp = val;
  while (temp !== 0) {
    bits += temp & 1;
    temp >>>= 1;
  }
  return bits;
}

export interface CidrParseResult {
  valid: boolean;
  value: number | null;
  errorKey?: 'empty' | 'invalidCidr';
}

export function parseCidrPrefix(raw: string): CidrParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, value: null, errorKey: 'empty' };
  }
  const normalized = trimmed.startsWith('/') ? trimmed.slice(1).trim() : trimmed;
  if (!/^\d{1,2}$/.test(normalized)) {
    return { valid: false, value: null, errorKey: 'invalidCidr' };
  }
  const num = Number(normalized);
  if (!Number.isInteger(num) || num < 0 || num > 32) {
    return { valid: false, value: null, errorKey: 'invalidCidr' };
  }
  return { valid: true, value: num };
}

export function getSubnetMaskDetails(cidr: number): SubnetMaskDetails | null {
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) return null;
  const maskInt = cidrToMaskUint32(cidr);
  const wildcardInt = (~maskInt) >>> 0;
  const subnetMask = uint32ToIpv4(maskInt);
  const wildcardMask = uint32ToIpv4(wildcardInt);
  const maskOctets = subnetMask.split('.').map(Number);
  const binaryMask = maskOctets.map((o) => o.toString(2).padStart(8, '0')).join('.');
  const hexMask = maskOctets.map((o) => o.toString(16).toUpperCase().padStart(2, '0')).join('.');
  const totalAddresses = Math.pow(2, 32 - cidr);
  const usableHosts = cidr === 32 ? 1 : cidr === 31 ? 2 : Math.max(0, totalAddresses - 2);

  return {
    cidr,
    subnetMask,
    wildcardMask,
    binaryMask,
    hexMask,
    networkBits: cidr,
    hostBits: 32 - cidr,
    totalAddresses,
    usableHosts,
  };
}

export function classifyIPv4(octets: number[]): {
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
  scopeKey: IPv4Details['scopeKey'];
  scope: string;
} {
  const [o1, o2] = octets;
  let ipClass: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
  if (o1 >= 0 && o1 <= 127) ipClass = 'A';
  else if (o1 <= 191) ipClass = 'B';
  else if (o1 <= 223) ipClass = 'C';
  else if (o1 <= 239) ipClass = 'D';
  else ipClass = 'E';

  if (o1 === 127) {
    return { ipClass, scopeKey: 'loopback', scope: 'Loopback (RFC 1122)' };
  }
  if (o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168)) {
    return { ipClass, scopeKey: 'private', scope: 'Private Network (RFC 1918)' };
  }
  if (o1 === 169 && o2 === 254) {
    return { ipClass, scopeKey: 'linkLocal', scope: 'Link-Local / APIPA (RFC 3927)' };
  }
  if (o1 === 100 && o2 >= 64 && o2 <= 127) {
    return { ipClass, scopeKey: 'cgnat', scope: 'Shared CGNAT Space (RFC 6598)' };
  }
  if (o1 >= 224 && o1 <= 239) {
    return { ipClass, scopeKey: 'multicast', scope: 'Multicast (RFC 5771)' };
  }
  if (o1 === 0 || o1 >= 240) {
    return { ipClass, scopeKey: 'reserved', scope: 'Reserved / Experimental' };
  }
  return { ipClass, scopeKey: 'public', scope: 'Public Routable Address' };
}

export function calculateIPv4Details(ip: string): IPv4Details | null {
  if (!isValidIPv4(ip)) return null;
  const trimmed = ip.trim();
  const octets = trimmed.split('.').map(Number);
  const octetBinary = octets.map((o) => o.toString(2).padStart(8, '0'));
  const hexParts = octets.map((o) => o.toString(16).toUpperCase().padStart(2, '0'));
  const { ipClass, scopeKey, scope } = classifyIPv4(octets);

  return {
    ip: trimmed,
    valid: true,
    octets,
    octetBinary,
    binaryDotted: octetBinary.join('.'),
    binaryCompact: octetBinary.join(''),
    hexDotted: hexParts.join(':'),
    decimalInt: ipv4ToUint32(trimmed),
    ipClass,
    scope,
    scopeKey,
    reverseDns: `${[...octets].reverse().join('.')}.in-addr.arpa`,
  };
}

export function calculateSubnet(ip: string, cidr: number): SubnetDetails | null {
  if (!isValidIPv4(ip) || cidr < 0 || cidr > 32 || !Number.isInteger(cidr)) {
    return null;
  }
  const ipInt = ipv4ToUint32(ip);
  const maskInt = cidrToMaskUint32(cidr);
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const totalAddresses = Math.pow(2, 32 - cidr);

  let usableHosts = Math.max(0, totalAddresses - 2);
  let firstHostInt = networkInt + 1;
  let lastHostInt = broadcastInt - 1;
  let isPointToPoint = false;
  let isHostRoute = false;

  if (cidr === 32) {
    usableHosts = 1;
    firstHostInt = networkInt;
    lastHostInt = networkInt;
    isHostRoute = true;
  } else if (cidr === 31) {
    usableHosts = 2;
    firstHostInt = networkInt;
    lastHostInt = broadcastInt;
    isPointToPoint = true;
  }

  const maskOctets = uint32ToIpv4(maskInt).split('.').map(Number);
  const binaryMask = maskOctets.map((o) => o.toString(2).padStart(8, '0')).join('.');
  const { ipClass } = classifyIPv4(ip.trim().split('.').map(Number));

  return {
    inputIp: ip.trim(),
    cidr,
    networkAddress: uint32ToIpv4(networkInt),
    broadcastAddress: uint32ToIpv4(broadcastInt),
    firstUsableHost: uint32ToIpv4(firstHostInt),
    lastUsableHost: uint32ToIpv4(lastHostInt),
    subnetMask: uint32ToIpv4(maskInt),
    wildcardMask: uint32ToIpv4(wildcardInt),
    binaryMask,
    totalAddresses,
    usableHosts,
    ipClass,
    isPointToPoint,
    isHostRoute,
  };
}

export function splitSubnet(
  baseIp: string,
  baseCidr: number,
  targetCidr: number,
  maxRows = 64
): SubnetSplitRow[] {
  if (!isValidIPv4(baseIp) || targetCidr <= baseCidr || targetCidr > 32) {
    return [];
  }
  const baseDetails = calculateSubnet(baseIp, baseCidr);
  if (!baseDetails) return [];

  const baseNetInt = ipv4ToUint32(baseDetails.networkAddress);
  const subnetCount = Math.pow(2, targetCidr - baseCidr);
  const blockSize = Math.pow(2, 32 - targetCidr);
  const count = Math.min(subnetCount, maxRows);
  const rows: SubnetSplitRow[] = [];

  for (let i = 0; i < count; i++) {
    const netInt = (baseNetInt + i * blockSize) >>> 0;
    const bcastInt = (netInt + blockSize - 1) >>> 0;
    const usable =
      targetCidr === 32 ? 1 : targetCidr === 31 ? 2 : Math.max(0, blockSize - 2);
    const first = targetCidr >= 31 ? netInt : (netInt + 1) >>> 0;
    const last = targetCidr >= 31 ? bcastInt : (bcastInt - 1) >>> 0;

    rows.push({
      index: i + 1,
      network: uint32ToIpv4(netInt),
      cidr: targetCidr,
      firstHost: uint32ToIpv4(first),
      lastHost: uint32ToIpv4(last),
      broadcast: uint32ToIpv4(bcastInt),
      usableHosts: usable,
    });
  }

  return rows;
}

export function calculateIpRange(startRaw: string, endRaw: string): IpRangeResult {
  const startIp = startRaw.trim();
  const endIp = endRaw.trim();

  if (!isValidIPv4(startIp) || !isValidIPv4(endIp)) {
    return {
      valid: false,
      errorKey: 'invalidIp',
      startIp,
      endIp,
      startInt: 0,
      endInt: 0,
      totalAddresses: 0,
      usableEstimate: 0,
      cidrs: [],
    };
  }

  const startInt = ipv4ToUint32(startIp);
  const endInt = ipv4ToUint32(endIp);

  if (endInt < startInt) {
    return {
      valid: false,
      errorKey: 'inverted',
      startIp,
      endIp,
      startInt,
      endInt,
      totalAddresses: 0,
      usableEstimate: 0,
      cidrs: [],
    };
  }

  const totalAddresses = endInt - startInt + 1;
  const usableEstimate = totalAddresses <= 2 ? totalAddresses : totalAddresses - 2;
  const cidrs: IpRangeResult['cidrs'] = [];

  let current = startInt;
  while (current <= endInt && cidrs.length < 128) {
    let maxSizeBits = 0;
    // Find largest power-of-2 block aligned to current
    while (maxSizeBits < 32) {
      const nextBits = maxSizeBits + 1;
      const alignmentMask = (1 << nextBits) - 1;
      if (nextBits > 31) break;
      if ((current & alignmentMask) !== 0) break;
      maxSizeBits = nextBits;
    }

    // Reduce block size until current + blockSize - 1 <= endInt
    while (maxSizeBits > 0) {
      const size = Math.pow(2, maxSizeBits);
      if (current + size - 1 <= endInt) break;
      maxSizeBits -= 1;
    }

    const size = Math.pow(2, maxSizeBits);
    const prefix = 32 - maxSizeBits;
    const network = uint32ToIpv4(current);
    const mask = uint32ToIpv4(cidrToMaskUint32(prefix));

    cidrs.push({
      cidrNotation: `${network}/${prefix}`,
      network,
      prefix,
      mask,
      size,
    });

    current += size;
  }

  return {
    valid: true,
    startIp,
    endIp,
    startInt,
    endInt,
    totalAddresses,
    usableEstimate,
    cidrs,
  };
}

export function expandIPv6(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase().split('/')[0];
  if (!trimmed || trimmed.includes(':::')) return null;

  const zoneSplit = trimmed.split('%');
  let addr = zoneSplit[0];

  if (addr.includes('.')) {
    const lastColon = addr.lastIndexOf(':');
    if (lastColon === -1) return null;
    const ipv4Tail = addr.slice(lastColon + 1);
    if (!isValidIPv4(ipv4Tail)) return null;
    const octets = ipv4Tail.split('.').map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    addr = `${addr.slice(0, lastColon)}:${high}:${low}`;
  }

  const doubleColonParts = addr.split('::');
  if (doubleColonParts.length > 2) return null;

  let groups: string[] = [];
  if (doubleColonParts.length === 2) {
    const left = doubleColonParts[0] ? doubleColonParts[0].split(':') : [];
    const right = doubleColonParts[1] ? doubleColonParts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 1) return null;
    groups = [...left, ...Array(missing).fill('0000'), ...right];
  } else {
    groups = addr.split(':');
    if (groups.length !== 8) return null;
  }

  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) {
    return null;
  }

  return groups.map((g) => g.padStart(4, '0')).join(':');
}

export function compressIPv6(expanded: string): string {
  const groups = expanded.split(':').map((g) => g.replace(/^0+/, '') || '0');
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) {
        curStart = i;
        curLen = 1;
      } else {
        curLen += 1;
      }
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen < 2) {
    return groups.join(':');
  }

  const left = groups.slice(0, bestStart).join(':');
  const right = groups.slice(bestStart + bestLen).join(':');
  if (!left && !right) return '::';
  if (!left) return `::${right}`;
  if (!right) return `${left}::`;
  return `${left}::${right}`;
}

export function getIPv6Details(raw: string): IPv6Details | null {
  const expanded = expandIPv6(raw);
  if (!expanded) return null;

  const compressed = compressIPv6(expanded);
  const groups = expanded.split(':');
  const prefix64 = `${groups.slice(0, 4).join(':')}::/64`;
  const interfaceId = groups.slice(4).join(':');

  const g6 = groups[6].slice(2);
  const g7 = groups[7];
  const solicitedNodeMulticast = `ff02::1:ff${g6}:${g7}`;

  const nibbles = groups.join('').split('').reverse().join('.');
  const reverseDns = `${nibbles}.ip6.arpa`;

  const binaryGroups = groups.map((g) =>
    parseInt(g, 16).toString(2).padStart(16, '0')
  );

  let scopeKey = 'global';
  let scopeLabelEn = 'Global Unicast Address (2000::/3)';
  let scopeLabelAr = 'عنوان أحادي عالمي (Global Unicast 2000::/3)';
  let embeddedIpv4: string | null = null;

  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') {
    scopeKey = 'loopback';
    scopeLabelEn = 'Loopback Address (::1/128)';
    scopeLabelAr = 'عنوان الاسترجاع المحلي (Loopback ::1/128)';
  } else if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') {
    scopeKey = 'unspecified';
    scopeLabelEn = 'Unspecified Address (::/128)';
    scopeLabelAr = 'عنوان غير محدد (Unspecified ::/128)';
  } else if (expanded.startsWith('0000:0000:0000:0000:0000:ffff:')) {
    scopeKey = 'ipv4mapped';
    scopeLabelEn = 'IPv4-Mapped IPv6 Address (::ffff:0:0/96)';
    scopeLabelAr = 'عنوان IPv6 مضمّن لـ IPv4 (::ffff:0:0/96)';
    const hi = parseInt(groups[6], 16);
    const lo = parseInt(groups[7], 16);
    embeddedIpv4 = `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
  } else if (expanded.startsWith('fe80:')) {
    scopeKey = 'linkLocal';
    scopeLabelEn = 'Link-Local Unicast (fe80::/10)';
    scopeLabelAr = 'عنوان محلي للوصلة (Link-Local fe80::/10)';
  } else if (expanded.startsWith('fc') || expanded.startsWith('fd')) {
    scopeKey = 'ula';
    scopeLabelEn = 'Unique Local Address (fc00::/7)';
    scopeLabelAr = 'عنوان محلي فريد (ULA fc00::/7)';
  } else if (expanded.startsWith('ff')) {
    scopeKey = 'multicast';
    scopeLabelEn = 'Multicast Address (ff00::/8)';
    scopeLabelAr = 'عنوان البث المتعدد (Multicast ff00::/8)';
  } else if (expanded.startsWith('2001:0db8:')) {
    scopeKey = 'documentation';
    scopeLabelEn = 'Documentation Prefix (2001:db8::/32)';
    scopeLabelAr = 'نطاق التوثيق القياسي (2001:db8::/32)';
  }

  return {
    input: raw.trim(),
    valid: true,
    expanded,
    compressed,
    prefix64,
    interfaceId,
    solicitedNodeMulticast,
    reverseDns,
    binaryGroups,
    scopeKey,
    scopeLabelEn,
    scopeLabelAr,
    embeddedIpv4,
  };
}

export function validateIpAddress(raw: string): IpValidationResult {
  const input = raw.trim();
  if (!input) {
    return {
      input,
      valid: false,
      version: 'Invalid',
      normalized: '',
      scopeKey: 'empty',
      notes: 'Enter an IPv4 or IPv6 address to validate.',
    };
  }

  if (isValidIPv4(input)) {
    const details = calculateIPv4Details(input)!;
    return {
      input,
      valid: true,
      version: 'IPv4',
      normalized: details.ip,
      scopeKey: details.scopeKey,
      notes: `Class ${details.ipClass} · ${details.scope}`,
    };
  }

  const ipv6 = getIPv6Details(input);
  if (ipv6) {
    return {
      input,
      valid: true,
      version: 'IPv6',
      normalized: ipv6.expanded,
      compressed: ipv6.compressed,
      scopeKey: ipv6.scopeKey,
      notes: ipv6.scopeLabelEn,
    };
  }

  return {
    input,
    valid: false,
    version: 'Invalid',
    normalized: '',
    scopeKey: 'invalid',
    notes: 'Not a valid IPv4 dotted-quad or IPv6 hexadecimal address.',
  };
}

export const WELL_KNOWN_PORTS: WellKnownPort[] = [
  {
    port: 22,
    protocol: 'TCP',
    service: 'SSH',
    category: 'Remote & Shell',
    descriptionEn: 'Encrypted remote shell, SFTP, and secure tunneling.',
    descriptionAr: 'اتصال طرفي مشفر وإدارة عن بُعد ونقل آمن للملفات.',
  },
  {
    port: 53,
    protocol: 'TCP/UDP',
    service: 'DNS',
    category: 'Networking & ISP',
    descriptionEn: 'Domain Name System resolution and zone transfers.',
    descriptionAr: 'نظام أسماء النطاقات لتحويل العناوين النصية إلى IP.',
  },
  {
    port: 67,
    protocol: 'UDP',
    service: 'DHCP Server',
    category: 'Networking & ISP',
    descriptionEn: 'Dynamic IP lease allocation from router/server to clients.',
    descriptionAr: 'توزيع عناوين IP تلقائياً للأجهزة داخل الشبكة.',
  },
  {
    port: 80,
    protocol: 'TCP',
    service: 'HTTP',
    category: 'Web',
    descriptionEn: 'Unencrypted Hypertext Transfer Protocol for web traffic.',
    descriptionAr: 'بروتوكول نقل النصوص التشعبية الأساسي للويب.',
  },
  {
    port: 179,
    protocol: 'TCP',
    service: 'BGP',
    category: 'Networking & ISP',
    descriptionEn: 'Border Gateway Protocol for autonomous system routing.',
    descriptionAr: 'بروتوكول التوجيه الحدودي بين الشبكات المستقلة ومزودي الخدمة.',
  },
  {
    port: 443,
    protocol: 'TCP',
    service: 'HTTPS',
    category: 'Security',
    descriptionEn: 'TLS-encrypted HTTP traffic for secure web applications & APIs.',
    descriptionAr: 'اتصال ويب مشفر عبر TLS لحماية البيانات وواجهات البرمجة.',
  },
  {
    port: 1812,
    protocol: 'UDP',
    service: 'RADIUS Auth',
    category: 'Networking & ISP',
    descriptionEn: 'Centralized subscriber authentication and authorization (AAA).',
    descriptionAr: 'مصادقة المشتركين وإدارة الصلاحيات في شبكات PPPoE و Hotspot.',
  },
  {
    port: 5432,
    protocol: 'TCP',
    service: 'PostgreSQL',
    category: 'Database',
    descriptionEn: 'Default TCP listener for PostgreSQL relational databases.',
    descriptionAr: 'المنفذ الافتراضي لقواعد بيانات PostgreSQL.',
  },
  {
    port: 8291,
    protocol: 'TCP',
    service: 'MikroTik Winbox',
    category: 'Networking & ISP',
    descriptionEn: 'Management GUI protocol for RouterOS devices.',
    descriptionAr: 'منفذ إدارة أجهزة MikroTik RouterOS عبر برنامج Winbox.',
  },
  {
    port: 8728,
    protocol: 'TCP',
    service: 'RouterOS API',
    category: 'Networking & ISP',
    descriptionEn: 'Programmatic control interface for MikroTik automation.',
    descriptionAr: 'واجهة البرمجة الآلية للتحكم في أجهزة MikroTik.',
  },
];
