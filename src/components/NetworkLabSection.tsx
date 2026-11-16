import { useMemo, useState } from 'react';
import {
  Network,
  Calculator,
  ShieldCheck,
  Radio,
  Globe2,
  SlidersHorizontal,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  Search,
  Info,
} from 'lucide-react';
import type { Language } from '../types';
import { getTranslations } from '../i18n/translations';
import {
  WELL_KNOWN_PORTS,
  calculateIPv4Details,
  calculateIpRange,
  calculateSubnet,
  cidrToMaskUint32,
  getIPv6Details,
  getSubnetMaskDetails,
  isValidIPv4,
  maskToCidr,
  parseCidrPrefix,
  splitSubnet,
  uint32ToIpv4,
  validateIpAddress,
} from '../utils/networkMath';

interface NetworkLabSectionProps {
  lang: Language;
}

type NetworkTab = 'cidr' | 'ipv4' | 'mask' | 'range' | 'validator' | 'ipv6' | 'demos';

const COMMON_CIDRS = [8, 16, 20, 22, 24, 25, 26, 27, 28, 29, 30, 32];

function ExplanationBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-blue-500/25 bg-blue-950/20 p-4 text-xs leading-relaxed text-blue-100">
      <div className="mb-1 flex items-center gap-2 font-semibold text-blue-300">
        <Info className="h-4 w-4 shrink-0" />
        <span>{title}</span>
      </div>
      <p className="text-slate-300">{body}</p>
    </div>
  );
}

export function NetworkLabSection({ lang }: NetworkLabSectionProps) {
  const t = getTranslations(lang);
  const [activeTab, setActiveTab] = useState<NetworkTab>('cidr');

  // 1. IPv4 & Binary Calculator state
  const [ipv4Input, setIpv4Input] = useState('192.168.10.42');
  const ipv4Result = useMemo(() => calculateIPv4Details(ipv4Input), [ipv4Input]);

  // 2. CIDR & Mask Converter state
  const [maskCalcCidr, setMaskCalcCidr] = useState(24);
  const [maskCalcText, setMaskCalcText] = useState('255.255.255.0');
  const maskCalcDetails = useMemo(() => getSubnetMaskDetails(maskCalcCidr), [maskCalcCidr]);
  const maskCalcValid = useMemo(() => maskToCidr(maskCalcText) !== null, [maskCalcText]);

  // 3. Subnet Calculator state
  const [subIp, setSubIp] = useState('10.20.40.15');
  const [subCidr, setSubCidr] = useState(24);
  const [subCidrText, setSubCidrText] = useState('24');
  const [subMaskInput, setSubMaskInput] = useState('255.255.255.0');
  const [splitTargetCidr, setSplitTargetCidr] = useState<number>(0);

  const subCidrValidation = useMemo(() => parseCidrPrefix(subCidrText), [subCidrText]);
  const cidrMaskValid = useMemo(() => maskToCidr(subMaskInput) !== null, [subMaskInput]);
  const subnetResult = useMemo(() => {
    if (!subCidrValidation.valid || !cidrMaskValid) return null;
    return calculateSubnet(subIp, subCidr);
  }, [subIp, subCidr, subCidrValidation.valid, cidrMaskValid]);

  const splitRows = useMemo(() => {
    if (!subnetResult || splitTargetCidr <= subCidr) return [];
    return splitSubnet(subnetResult.networkAddress, subCidr, splitTargetCidr, 64);
  }, [subnetResult, subCidr, splitTargetCidr]);

  const totalSplitCount =
    subnetResult && splitTargetCidr > subCidr ? Math.pow(2, splitTargetCidr - subCidr) : 0;

  // 4. IP Range Calculator state
  const [rangeStart, setRangeStart] = useState('192.168.10.0');
  const [rangeEnd, setRangeEnd] = useState('192.168.10.191');
  const rangeResult = useMemo(
    () => calculateIpRange(rangeStart, rangeEnd),
    [rangeStart, rangeEnd]
  );

  // 5. IP Validator state
  const [valInput, setValInput] = useState('2001:db8:85a3::8a2e:370:7334');
  const valResult = useMemo(() => validateIpAddress(valInput), [valInput]);

  // 6. IPv6 Inspector state
  const [ipv6Input, setIpv6Input] = useState('2001:db8:85a3::8a2e:370:7334');
  const ipv6Result = useMemo(() => getIPv6Details(ipv6Input), [ipv6Input]);

  // 7. Demos state
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [portQuery, setPortQuery] = useState('');

  const handshakeSteps = useMemo(
    () =>
      lang === 'ar'
        ? [
            {
              title: '1. SYN (العميل ← الخادم)',
              packet: 'Flags: [SYN] · Seq = 1000 · Win = 65535',
              detail: 'يرسل العميل حزمة مزامنة (SYN) تحمل رقم تسلسل مبدئي لبدء الجلسة.',
            },
            {
              title: '2. SYN-ACK (الخادم ← العميل)',
              packet: 'Flags: [SYN, ACK] · Seq = 5000 · Ack = 1001',
              detail: 'يستجيب الخادم بتأكيد استلام تسلسل العميل ويرسل رقم تسلسله الخاص.',
            },
            {
              title: '3. ACK (العميل ← الخادم)',
              packet: 'Flags: [ACK] · Seq = 1001 · Ack = 5001',
              detail: 'يؤكد العميل استلام تسلسل الخادم وتصبح قناة TCP الثنائية جاهزة لنقل البيانات.',
            },
            {
              title: '4. ESTABLISHED (جلسة نشطة)',
              packet: 'State: ESTABLISHED · Full-Duplex Stream Active',
              detail: 'تم إتمام المصافحة الثلاثية؛ تبدأ تطبيقات مثل HTTP/HTTPS أو SSH بتبادل البيانات.',
            },
          ]
        : [
            {
              title: '1. SYN (Client → Server)',
              packet: 'Flags: [SYN] · Seq = 1000 · Win = 65535',
              detail: 'Client initiates connection with an Initial Sequence Number (ISN) and window size.',
            },
            {
              title: '2. SYN-ACK (Server → Client)',
              packet: 'Flags: [SYN, ACK] · Seq = 5000 · Ack = 1001',
              detail: 'Server acknowledges client ISN + 1 and supplies its own sequence number.',
            },
            {
              title: '3. ACK (Client → Server)',
              packet: 'Flags: [ACK] · Seq = 1001 · Ack = 5001',
              detail: 'Client acknowledges server ISN + 1, completing sequence synchronization.',
            },
            {
              title: '4. ESTABLISHED (Session Ready)',
              packet: 'State: ESTABLISHED · Full-Duplex Stream Active',
              detail: 'The 3-way handshake is complete; application protocols (HTTPS, SSH, API) can transmit data.',
            },
          ],
    [lang]
  );

  const filteredPorts = useMemo(() => {
    const q = portQuery.trim().toLowerCase();
    if (!q) return WELL_KNOWN_PORTS;
    return WELL_KNOWN_PORTS.filter(
      (item) =>
        String(item.port).includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.protocol.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        item.descriptionAr.toLowerCase().includes(q)
    );
  }, [portQuery]);

  const handleCidrChange = (nextCidr: number) => {
    setSubCidr(nextCidr);
    setSubCidrText(String(nextCidr));
    setSubMaskInput(uint32ToIpv4(cidrToMaskUint32(nextCidr)));
    if (splitTargetCidr <= nextCidr) {
      setSplitTargetCidr(0);
    }
  };

  const handleManualCidrChange = (raw: string) => {
    setSubCidrText(raw);
    const parsed = parseCidrPrefix(raw);
    if (parsed.valid && parsed.value !== null) {
      setSubCidr(parsed.value);
      setSubMaskInput(uint32ToIpv4(cidrToMaskUint32(parsed.value)));
      if (splitTargetCidr <= parsed.value) {
        setSplitTargetCidr(0);
      }
    }
  };

  const handleMaskChange = (nextMask: string) => {
    setSubMaskInput(nextMask);
    const derived = maskToCidr(nextMask);
    if (derived !== null) {
      setSubCidr(derived);
      setSubCidrText(String(derived));
      if (splitTargetCidr <= derived) {
        setSplitTargetCidr(0);
      }
    }
  };

  const tabs: { id: NetworkTab; label: string; Icon: typeof Network }[] = [
    { id: 'cidr', label: t.networkLab.tabs.cidr, Icon: Calculator },
    { id: 'mask', label: t.networkLab.tabs.mask, Icon: SlidersHorizontal },
    { id: 'ipv4', label: t.networkLab.tabs.ipv4, Icon: Network },
    { id: 'range', label: t.networkLab.tabs.range, Icon: ArrowLeftRight },
    { id: 'validator', label: t.networkLab.tabs.validator, Icon: ShieldCheck },
    { id: 'ipv6', label: t.networkLab.tabs.ipv6, Icon: Globe2 },
    { id: 'demos', label: t.networkLab.tabs.demos, Icon: Radio },
  ];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {t.networkLab.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {t.networkLab.subheading}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.networkLab.heading}
          className="grid grid-cols-2 gap-1 rounded-xl border border-slate-400/20 bg-[#0b0e17] p-1 sm:flex sm:flex-wrap sm:w-fit"
        >
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. IPv4 Subnet Calculator */}
      {activeTab === 'cidr' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="net-sub-ip" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.networkLab.cidr.ipLabel}
                </label>
                <input
                  id="net-sub-ip"
                  dir="ltr"
                  type="text"
                  value={subIp}
                  onChange={(e) => setSubIp(e.target.value)}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-3.5 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
                />
                {!subIp.trim() ? (
                  <p role="alert" className="mt-1 text-xs text-rose-300">{t.networkLab.cidr.emptyIp}</p>
                ) : !isValidIPv4(subIp) ? (
                  <p role="alert" className="mt-1 text-xs text-rose-300">{t.networkLab.cidr.invalidIp}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="net-sub-cidr-select" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.networkLab.cidr.cidrLabel} (/{subCidr})
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="net-sub-cidr-select"
                    dir="ltr"
                    value={subCidr}
                    onChange={(e) => handleCidrChange(Number(e.target.value))}
                    className="min-w-0 flex-1 rounded-xl border border-slate-400/20 bg-[#04060c] px-3 py-2.5 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {Array.from({ length: 33 }, (_, i) => (
                      <option key={i} value={i}>
                        /{i} — {uint32ToIpv4(cidrToMaskUint32(i))}
                      </option>
                    ))}
                  </select>
                  <input
                    dir="ltr"
                    type="text"
                    aria-label={t.networkLab.cidr.manualCidrLabel}
                    value={subCidrText}
                    onChange={(e) => handleManualCidrChange(e.target.value)}
                    placeholder="24"
                    className="w-16 shrink-0 rounded-xl border border-slate-400/20 bg-[#04060c] px-2.5 py-2.5 text-center font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {!subCidrValidation.valid && (
                  <p role="alert" className="mt-1 text-xs text-rose-300">
                    {subCidrValidation.errorKey === 'empty'
                      ? t.networkLab.cidr.emptyCidr
                      : t.networkLab.cidr.invalidCidr}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="net-sub-mask" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.networkLab.cidr.maskLabel}
                </label>
                <input
                  id="net-sub-mask"
                  dir="ltr"
                  type="text"
                  value={subMaskInput}
                  onChange={(e) => handleMaskChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-3.5 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
                />
                {!subMaskInput.trim() ? (
                  <p role="alert" className="mt-1 text-xs text-rose-300">{t.networkLab.mask.emptyError}</p>
                ) : !cidrMaskValid ? (
                  <p role="alert" className="mt-1 text-xs text-rose-300">{t.networkLab.cidr.invalidMask}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.networkLab.cidr.splitLabel}
                </label>
                <select
                  dir="ltr"
                  value={splitTargetCidr}
                  onChange={(e) => setSplitTargetCidr(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={0}>{t.networkLab.cidr.noSplit}</option>
                  {Array.from({ length: Math.max(0, 32 - subCidr) }, (_, idx) => {
                    const target = subCidr + idx + 1;
                    return (
                      <option key={target} value={target}>
                        /{target} ({Math.pow(2, target - subCidr)} subnets)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {subnetResult && (
              <div className="grid grid-cols-1 gap-3 border-t border-slate-400/15 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: t.networkLab.cidr.results.network, value: `${subnetResult.networkAddress}/${subnetResult.cidr}` },
                  { label: t.networkLab.cidr.results.broadcast, value: subnetResult.broadcastAddress },
                  { label: t.networkLab.cidr.results.firstHost, value: subnetResult.firstUsableHost },
                  { label: t.networkLab.cidr.results.lastHost, value: subnetResult.lastUsableHost },
                  { label: t.networkLab.cidr.results.usableHosts, value: subnetResult.usableHosts.toLocaleString() },
                  { label: t.networkLab.cidr.results.totalAddresses, value: subnetResult.totalAddresses.toLocaleString() },
                  { label: t.networkLab.cidr.results.mask, value: subnetResult.subnetMask },
                  { label: t.networkLab.cidr.results.wildcard, value: subnetResult.wildcardMask },
                  { label: t.networkLab.cidr.results.binaryMask, value: subnetResult.binaryMask },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5"
                  >
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div dir="ltr" className="mt-1 font-mono text-sm font-semibold text-blue-200 tabular-nums break-all">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {subnetResult && (subnetResult.isPointToPoint || subnetResult.isHostRoute) && (
              <p className="text-xs text-amber-300">
                {t.networkLab.cidr.results.specialNote}:{' '}
                {subnetResult.isPointToPoint
                  ? 'RFC 3021 /31 point-to-point link provides 2 usable host addresses with no dedicated broadcast.'
                  : '/32 represents a single host route.'}
              </p>
            )}

            <ExplanationBox
              title={t.networkLab.explainTitle}
              body={t.networkLab.cidr.explainBody}
            />
          </div>

          {splitRows.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-white">
                  {t.networkLab.cidr.splitTable.title} (/{splitTargetCidr})
                </h2>
                <span className="text-xs text-slate-400 tabular-nums">
                  {t.networkLab.cidr.splitTable.showingFirst} {splitRows.length}{' '}
                  {t.networkLab.cidr.splitTable.of} {totalSplitCount.toLocaleString()}{' '}
                  {t.networkLab.cidr.splitTable.subnets}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-start text-xs">
                  <thead>
                    <tr className="border-b border-slate-400/20 text-slate-400">
                      <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.cidr.splitTable.idx}</th>
                      <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.cidr.splitTable.net}</th>
                      <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.cidr.splitTable.range}</th>
                      <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.cidr.splitTable.bcast}</th>
                      <th className="py-2.5 text-end font-medium">{t.networkLab.cidr.splitTable.hosts}</th>
                    </tr>
                  </thead>
                  <tbody dir="ltr" className="divide-y divide-slate-400/10 font-mono tabular-nums text-slate-200">
                    {splitRows.map((row) => (
                      <tr key={row.index} className="hover:bg-slate-800/30">
                        <td className="py-2.5 pe-4 text-slate-400">{row.index}</td>
                        <td className="py-2.5 pe-4 text-blue-300">
                          {row.network}/{row.cidr}
                        </td>
                        <td className="py-2.5 pe-4">
                          {row.firstHost} – {row.lastHost}
                        </td>
                        <td className="py-2.5 pe-4 text-slate-300">{row.broadcast}</td>
                        <td className="py-2.5 text-end">{row.usableHosts.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CIDR Conversion & Subnet Mask Calculator */}
      {activeTab === 'mask' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.networkLab.mask.cidrLabel} (/{maskCalcCidr})
                </label>
                <div className="flex items-center gap-4">
                  <input
                    dir="ltr"
                    type="range"
                    min={0}
                    max={32}
                    value={maskCalcCidr}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setMaskCalcCidr(next);
                      setMaskCalcText(uint32ToIpv4(cidrToMaskUint32(next)));
                    }}
                    className="h-2 flex-1 cursor-pointer accent-blue-500"
                  />
                  <span dir="ltr" className="w-12 font-mono text-sm font-bold text-blue-300 tabular-nums text-end">
                    /{maskCalcCidr}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="net-mask-input" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.networkLab.mask.maskInputLabel}
                </label>
                <input
                  id="net-mask-input"
                  dir="ltr"
                  type="text"
                  value={maskCalcText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaskCalcText(val);
                    const c = maskToCidr(val);
                    if (c !== null) setMaskCalcCidr(c);
                  }}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
                />
                {!maskCalcText.trim() ? (
                  <p role="alert" className="mt-1 text-xs text-rose-300">{t.networkLab.mask.emptyError}</p>
                ) : !maskCalcValid ? (
                  <p role="alert" className="mt-1 text-xs text-rose-300">{t.networkLab.mask.invalidMask}</p>
                ) : null}
              </div>
            </div>

            {maskCalcDetails && (
              <>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-400/15 pt-5 sm:grid-cols-4">
                  {[
                    { label: t.networkLab.mask.fields.cidr, value: `/${maskCalcDetails.cidr}` },
                    { label: t.networkLab.mask.fields.subnetMask, value: maskCalcDetails.subnetMask },
                    { label: t.networkLab.mask.fields.wildcardMask, value: maskCalcDetails.wildcardMask },
                    { label: t.networkLab.mask.fields.hexMask, value: maskCalcDetails.hexMask },
                    { label: t.networkLab.mask.fields.networkBits, value: String(maskCalcDetails.networkBits) },
                    { label: t.networkLab.mask.fields.hostBits, value: String(maskCalcDetails.hostBits) },
                    { label: t.networkLab.mask.fields.totalAddresses, value: maskCalcDetails.totalAddresses.toLocaleString() },
                    { label: t.networkLab.mask.fields.usableHosts, value: maskCalcDetails.usableHosts.toLocaleString() },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5"
                    >
                      <div className="text-xs text-slate-400">{item.label}</div>
                      <div dir="ltr" className="mt-1 font-mono text-sm font-semibold text-blue-200 tabular-nums break-all">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-400/15 pt-5">
                  <div className="mb-3 text-xs font-semibold text-slate-300">
                    {t.networkLab.mask.bitMapTitle}
                  </div>
                  <div dir="ltr" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {maskCalcDetails.binaryMask.split('.').map((octetBits, oIdx) => (
                      <div
                        key={oIdx}
                        className="rounded-xl border border-slate-400/15 bg-[#04060c] p-2.5 text-center"
                      >
                        <div className="font-mono text-xs text-slate-200 tabular-nums">
                          {octetBits}
                        </div>
                        <div className="mt-1 font-mono text-[10px] tracking-widest">
                          {Array.from(octetBits).map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className={b === '1' ? 'text-blue-400' : 'text-violet-400'}
                            >
                              {b === '1' ? 'N' : 'H'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <ExplanationBox
              title={t.networkLab.explainTitle}
              body={t.networkLab.mask.explainBody}
            />
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              {t.networkLab.mask.commonTitle}
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-400/20 text-slate-400">
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.mask.fields.cidr}</th>
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.mask.fields.subnetMask}</th>
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.mask.fields.wildcardMask}</th>
                    <th className="py-2.5 text-end font-medium">{t.networkLab.mask.fields.usableHosts}</th>
                  </tr>
                </thead>
                <tbody dir="ltr" className="divide-y divide-slate-400/10 font-mono tabular-nums text-slate-200">
                  {COMMON_CIDRS.map((c) => {
                    const row = getSubnetMaskDetails(c)!;
                    return (
                      <tr
                        key={c}
                        onClick={() => {
                          setMaskCalcCidr(c);
                          setMaskCalcText(row.subnetMask);
                        }}
                        className={`cursor-pointer transition-colors hover:bg-blue-500/10 ${
                          maskCalcCidr === c ? 'bg-blue-950/35' : ''
                        }`}
                      >
                        <td className="py-2.5 pe-4 font-semibold text-blue-300">/{row.cidr}</td>
                        <td className="py-2.5 pe-4">{row.subnetMask}</td>
                        <td className="py-2.5 pe-4 text-slate-400">{row.wildcardMask}</td>
                        <td className="py-2.5 text-end">{row.usableHosts.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. IPv4 & Binary Representation */}
      {activeTab === 'ipv4' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 max-w-md">
              <label htmlFor="net-ipv4-input" className="mb-1.5 block text-xs font-semibold text-slate-300">
                {t.networkLab.ipv4.inputLabel}
              </label>
              <input
                id="net-ipv4-input"
                dir="ltr"
                type="text"
                value={ipv4Input}
                onChange={(e) => setIpv4Input(e.target.value)}
                placeholder="192.168.10.42"
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">{t.networkLab.ipv4.presets}:</span>
              {['192.168.1.1', '10.0.0.254', '100.64.12.8', '8.8.8.8', '127.0.0.1'].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => setIpv4Input(ip)}
                  dir="ltr"
                  className="min-h-[36px] rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-blue-500/40 cursor-pointer"
                >
                  {ip}
                </button>
              ))}
            </div>
          </div>

          {!ipv4Result ? (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/25 p-4 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                {!ipv4Input.trim() ? t.networkLab.ipv4.emptyError : t.networkLab.ipv4.invalid}
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 border-t border-slate-400/15 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: t.networkLab.ipv4.fields.normalized, value: ipv4Result.ip },
                  { label: t.networkLab.ipv4.fields.ipClass, value: `Class ${ipv4Result.ipClass}` },
                  { label: t.networkLab.ipv4.fields.scope, value: ipv4Result.scope },
                  { label: t.networkLab.ipv4.fields.binary, value: ipv4Result.binaryDotted },
                  { label: t.networkLab.ipv4.fields.hex, value: ipv4Result.hexDotted },
                  { label: t.networkLab.ipv4.fields.decimalInt, value: String(ipv4Result.decimalInt) },
                  { label: t.networkLab.ipv4.fields.reverseDns, value: ipv4Result.reverseDns },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4"
                  >
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div dir="ltr" className="mt-1.5 font-mono text-sm font-semibold text-blue-200 tabular-nums break-all">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-400/15 pt-5">
                <h2 className="mb-3 text-xs font-semibold text-slate-300">
                  {t.networkLab.ipv4.octetsTitle}
                </h2>
                <div dir="ltr" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ipv4Result.octets.map((octet, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5 text-center"
                    >
                      <div className="text-[11px] text-slate-400">
                        {t.networkLab.ipv4.octetLabel} {idx + 1}
                      </div>
                      <div className="mt-1 font-mono text-lg font-bold text-white tabular-nums">
                        {octet}
                      </div>
                      <div className="mt-1 font-mono text-xs text-violet-300 tabular-nums">
                        {ipv4Result.octetBinary[idx]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ExplanationBox
                title={t.networkLab.explainTitle}
                body={t.networkLab.ipv4.explainBody}
              />
            </>
          )}
        </div>
      )}

      {/* 4. IP Range Calculator */}
      {activeTab === 'range' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {t.networkLab.range.startLabel}
              </label>
              <input
                dir="ltr"
                type="text"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {t.networkLab.range.endLabel}
              </label>
              <input
                dir="ltr"
                type="text"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">{t.networkLab.range.presetsLabel}:</span>
            {[
              { s: '192.168.10.0', e: '192.168.10.191' },
              { s: '10.0.0.10', e: '10.0.0.75' },
              { s: '172.16.0.0', e: '172.16.3.255' },
            ].map((preset) => (
              <button
                key={`${preset.s}-${preset.e}`}
                type="button"
                dir="ltr"
                onClick={() => {
                  setRangeStart(preset.s);
                  setRangeEnd(preset.e);
                }}
                className="min-h-[36px] rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-blue-500/40 cursor-pointer"
              >
                {preset.s} – {preset.e}
              </button>
            ))}
          </div>

          {!rangeResult.valid ? (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/25 p-4 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                {!rangeStart.trim() || !rangeEnd.trim()
                  ? t.networkLab.range.emptyIp
                  : rangeResult.errorKey === 'inverted'
                    ? t.networkLab.range.invertedError
                    : t.networkLab.range.invalidIp}
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 border-t border-slate-400/15 pt-5 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4">
                  <div className="text-xs text-slate-400">{t.networkLab.range.totalAddresses}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-blue-200 tabular-nums">
                    {rangeResult.totalAddresses.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4">
                  <div className="text-xs text-slate-400">{t.networkLab.range.usableEstimate}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-white tabular-nums">
                    {rangeResult.usableEstimate.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4">
                  <div className="text-xs text-slate-400">{t.networkLab.range.cidrCount}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-violet-300 tabular-nums">
                    {rangeResult.cidrs.length}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-3 font-display text-base font-semibold text-white">
                  {t.networkLab.range.cidrsTitle}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] border-collapse text-start text-xs">
                    <thead>
                      <tr className="border-b border-slate-400/20 text-slate-400">
                        <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.range.cols.cidr}</th>
                        <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.range.cols.mask}</th>
                        <th className="py-2.5 text-end font-medium">{t.networkLab.range.cols.size}</th>
                      </tr>
                    </thead>
                    <tbody dir="ltr" className="divide-y divide-slate-400/10 font-mono tabular-nums text-slate-200">
                      {rangeResult.cidrs.map((blk) => (
                        <tr key={blk.cidrNotation} className="hover:bg-slate-800/30">
                          <td className="py-2.5 pe-4 font-semibold text-blue-300">{blk.cidrNotation}</td>
                          <td className="py-2.5 pe-4">{blk.mask}</td>
                          <td className="py-2.5 text-end">{blk.size.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <ExplanationBox
                title={t.networkLab.explainTitle}
                body={t.networkLab.range.explainBody}
              />
            </>
          )}
        </div>
      )}

      {/* 5. IP Address Validator */}
      {activeTab === 'validator' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 max-w-xl">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {t.networkLab.validator.inputLabel}
              </label>
              <input
                dir="ltr"
                type="text"
                value={valInput}
                onChange={(e) => setValInput(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">{t.networkLab.validator.samplesLabel}:</span>
              {['172.16.40.1', '2001:db8::1', 'fe80::1ff:fe23:4567:890a', '::1', '256.10.0.1'].map(
                (sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setValInput(sample)}
                    dir="ltr"
                    className="min-h-[36px] rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-blue-500/40 cursor-pointer"
                  >
                    {sample}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4 sm:p-5 space-y-4">
            <div
              role={!valResult.valid ? 'alert' : undefined}
              className="flex items-center gap-2 text-sm font-semibold"
            >
              {valResult.valid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-emerald-300">{t.networkLab.validator.validBadge}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  <span className="text-rose-300">
                    {valResult.scopeKey === 'empty'
                      ? t.networkLab.validator.emptyError
                      : t.networkLab.validator.invalidBadge}
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-400/10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs text-slate-400">{t.networkLab.validator.version}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-white">
                  {valResult.version}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">{t.networkLab.validator.normalized}</div>
                <div dir="ltr" className="mt-1 font-mono text-xs text-blue-200 break-all">
                  {valResult.normalized || '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">{t.networkLab.validator.compressed}</div>
                <div dir="ltr" className="mt-1 font-mono text-xs text-violet-200 break-all">
                  {valResult.compressed || valResult.normalized || '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">{t.networkLab.validator.classification}</div>
                <div className="mt-1 text-xs text-slate-200">{valResult.notes}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. IPv6 Inspector */}
      {activeTab === 'ipv6' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 max-w-xl">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {t.networkLab.ipv6.inputLabel}
              </label>
              <input
                dir="ltr"
                type="text"
                value={ipv6Input}
                onChange={(e) => setIpv6Input(e.target.value)}
                placeholder="2001:db8:85a3::8a2e:370:7334"
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 font-mono text-base text-white focus:border-blue-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">{t.networkLab.ipv6.presets}:</span>
              {[
                '2001:db8:85a3::8a2e:370:7334',
                'fe80::1ff:fe23:4567:890a',
                'fd12:3456:789a:1::1',
                '::ffff:192.0.2.128',
                '::1',
              ].map((addr) => (
                <button
                  key={addr}
                  type="button"
                  onClick={() => setIpv6Input(addr)}
                  dir="ltr"
                  className="min-h-[36px] rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-blue-500/40 cursor-pointer"
                >
                  {addr}
                </button>
              ))}
            </div>
          </div>

          {!ipv6Result ? (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/25 p-4 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                {!ipv6Input.trim() ? t.networkLab.ipv6.emptyError : t.networkLab.ipv6.invalid}
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 border-t border-slate-400/15 pt-6 sm:grid-cols-2">
                {[
                  { label: t.networkLab.ipv6.fields.expanded, value: ipv6Result.expanded },
                  { label: t.networkLab.ipv6.fields.compressed, value: ipv6Result.compressed },
                  {
                    label: t.networkLab.ipv6.fields.scope,
                    value: lang === 'ar' ? ipv6Result.scopeLabelAr : ipv6Result.scopeLabelEn,
                  },
                  { label: t.networkLab.ipv6.fields.prefix64, value: ipv6Result.prefix64 },
                  { label: t.networkLab.ipv6.fields.interfaceId, value: ipv6Result.interfaceId },
                  { label: t.networkLab.ipv6.fields.solicitedNode, value: ipv6Result.solicitedNodeMulticast },
                  { label: t.networkLab.ipv6.fields.reverseDns, value: ipv6Result.reverseDns },
                  ...(ipv6Result.embeddedIpv4
                    ? [{ label: t.networkLab.ipv6.fields.embeddedIpv4, value: ipv6Result.embeddedIpv4 }]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5"
                  >
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div dir="ltr" className="mt-1 font-mono text-xs font-semibold text-blue-200 tabular-nums break-all">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-400/15 pt-5">
                <h2 className="mb-3 text-xs font-semibold text-slate-300">
                  {t.networkLab.ipv6.hextetTitle}
                </h2>
                <div dir="ltr" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {ipv6Result.expanded.split(':').map((hex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3 text-center"
                    >
                      <div className="font-mono text-sm font-bold text-white">{hex}</div>
                      <div className="mt-1 font-mono text-[11px] text-violet-300 tabular-nums">
                        {ipv6Result.binaryGroups[idx]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ExplanationBox
                title={t.networkLab.explainTitle}
                body={t.networkLab.ipv6.explainBody}
              />
            </>
          )}
        </div>
      )}

      {/* 7. Protocol Demos & Port Reference */}
      {activeTab === 'demos' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">
                  {t.networkLab.demos.handshakeTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {t.networkLab.demos.handshakeDesc}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setHandshakeStep((prev) => (prev + 1) % handshakeSteps.length)
                  }
                  className="neon-action-btn min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.networkLab.demos.nextStep}
                </button>
                <button
                  type="button"
                  onClick={() => setHandshakeStep(0)}
                  className="min-h-[40px] rounded-lg border border-slate-400/20 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.networkLab.demos.resetSteps}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {handshakeSteps.map((st, idx) => {
                const isActive = idx === handshakeStep;
                const isDone = idx < handshakeStep;
                return (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() => setHandshakeStep(idx)}
                    className={`rounded-xl border p-4 text-start transition-colors cursor-pointer ${
                      isActive
                        ? 'border-blue-500/70 bg-blue-950/35'
                        : isDone
                          ? 'border-violet-500/30 bg-slate-900/60'
                          : 'border-slate-400/15 bg-[#04060c] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="text-xs font-semibold text-blue-300">{st.title}</div>
                    <div dir="ltr" className="mt-2 font-mono text-[11px] text-violet-200">
                      {st.packet}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{st.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-xl font-semibold text-white">
                {t.networkLab.demos.portsTitle}
              </h2>
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={portQuery}
                  onChange={(e) => setPortQuery(e.target.value)}
                  placeholder={t.networkLab.demos.portsSearchPlaceholder}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] py-2 ps-9 pe-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none sm:text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-400/20 text-slate-400">
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.demos.portCols.port}</th>
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.demos.portCols.proto}</th>
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.demos.portCols.service}</th>
                    <th className="py-2.5 pe-4 text-start font-medium">{t.networkLab.demos.portCols.category}</th>
                    <th className="py-2.5 text-start font-medium">{t.networkLab.demos.portCols.desc}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400/10 text-slate-200">
                  {filteredPorts.map((row) => (
                    <tr key={`${row.port}-${row.service}`} className="hover:bg-slate-800/30">
                      <td className="py-3 pe-4 font-mono font-semibold text-blue-300 tabular-nums">
                        {row.port}
                      </td>
                      <td className="py-3 pe-4 font-mono text-slate-300">{row.protocol}</td>
                      <td className="py-3 pe-4 font-semibold text-white">{row.service}</td>
                      <td className="py-3 pe-4 text-slate-400">{row.category}</td>
                      <td className="py-3 text-slate-300">
                        {lang === 'ar' ? row.descriptionAr : row.descriptionEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
