import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Router,
  Network,
  Monitor,
  Server,
  Link2,
  Send,
  RotateCcw,
  Trash2,
  Power,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import type { Language } from '../../types';
import { getTranslations } from '../../i18n/translations';
import {
  findShortestNetworkPath,
  type DeviceType,
  type SimDevice,
  type SimLink,
} from '../../utils/experimentsLogic';

interface NetworkSimulatorProps {
  lang: Language;
}

const INITIAL_DEVICES: SimDevice[] = [
  { id: 'r1', name: 'Router-Core', type: 'router', ip: '192.168.1.1', x: 400, y: 80 },
  { id: 'sw1', name: 'Switch-LAN', type: 'switch', ip: '192.168.1.2', x: 400, y: 205 },
  { id: 'pc1', name: 'PC-01', type: 'computer', ip: '192.168.1.10', x: 185, y: 335 },
  { id: 'srv1', name: 'Server-Web', type: 'server', ip: '192.168.1.50', x: 615, y: 335 },
];

const INITIAL_LINKS: SimLink[] = [
  { id: 'l-r1-sw1', fromId: 'r1', toId: 'sw1', up: true },
  { id: 'l-sw1-pc1', fromId: 'sw1', toId: 'pc1', up: true },
  { id: 'l-sw1-srv1', fromId: 'sw1', toId: 'srv1', up: true },
];

interface PacketState {
  path: string[];
  x: number;
  y: number;
  activeHop: number;
}

function DeviceIcon({ type, className }: { type: DeviceType; className?: string }) {
  switch (type) {
    case 'router':
      return <Router className={className} />;
    case 'switch':
      return <Network className={className} />;
    case 'computer':
      return <Monitor className={className} />;
    case 'server':
      return <Server className={className} />;
  }
}

export function NetworkSimulator({ lang }: NetworkSimulatorProps) {
  const t = getTranslations(lang);
  const net = t.experiments.network;

  const [devices, setDevices] = useState<SimDevice[]>(INITIAL_DEVICES);
  const [links, setLinks] = useState<SimLink[]>(INITIAL_LINKS);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string>('pc1');
  const [targetId, setTargetId] = useState<string>('srv1');
  const [packet, setPacket] = useState<PacketState | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [routeLogs, setRouteLogs] = useState<
    { id: number; ok: boolean; text: string }[]
  >([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const dragMovedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const deviceMap = useMemo(() => {
    const map = new Map<string, SimDevice>();
    for (const d of devices) map.set(d.id, d);
    return map;
  }, [devices]);

  const peerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of devices) counts.set(d.id, 0);
    for (const l of links) {
      if (!l.up) continue;
      counts.set(l.fromId, (counts.get(l.fromId) ?? 0) + 1);
      counts.set(l.toId, (counts.get(l.toId) ?? 0) + 1);
    }
    return counts;
  }, [devices, links]);

  const activePathLinkSet = useMemo(() => {
    const set = new Set<string>();
    if (!packet) return set;
    for (let i = 0; i < packet.path.length - 1; i++) {
      const a = packet.path[i];
      const b = packet.path[i + 1];
      set.add(`${a}::${b}`);
      set.add(`${b}::${a}`);
    }
    return set;
  }, [packet]);

  const addDevice = (type: DeviceType) => {
    const sameTypeCount = devices.filter((d) => d.type === type).length + 1;
    const prefixMap: Record<DeviceType, { name: string; baseOctet: number }> = {
      router: { name: 'Router', baseOctet: 1 },
      switch: { name: 'Switch', baseOctet: 20 },
      computer: { name: 'PC', baseOctet: 10 },
      server: { name: 'Server', baseOctet: 50 },
    };
    const usedIps = new Set(devices.map((d) => d.ip));
    let hostOctet = prefixMap[type].baseOctet + sameTypeCount - 1;
    while (usedIps.has(`192.168.1.${hostOctet}`) && hostOctet < 254) {
      hostOctet++;
    }

    const offsetAngle = (devices.length * 1.1) % (Math.PI * 2);
    const x = Math.round(
      Math.max(85, Math.min(715, 400 + Math.cos(offsetAngle) * 180))
    );
    const y = Math.round(
      Math.max(70, Math.min(360, 210 + Math.sin(offsetAngle) * 125))
    );

    const newDevice: SimDevice = {
      id: `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      name: `${prefixMap[type].name}-0${sameTypeCount}`,
      type,
      ip: `192.168.1.${hostOctet}`,
      x,
      y,
    };
    setDevices((prev) => [...prev, newDevice]);
    setTargetId(newDevice.id);
  };

  const removeDevice = (id: string) => {
    if (isSending) return;
    setDevices((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (sourceId === id) setSourceId(next[0]?.id ?? '');
      if (targetId === id) setTargetId(next[next.length - 1]?.id ?? '');
      return next;
    });
    setLinks((prev) => prev.filter((l) => l.fromId !== id && l.toId !== id));
    if (connectSourceId === id) setConnectSourceId(null);
  };

  const handleDeviceClick = (deviceId: string) => {
    if (dragMovedRef.current) return;
    if (!connectMode) return;

    if (!connectSourceId) {
      setConnectSourceId(deviceId);
      return;
    }

    if (connectSourceId === deviceId) {
      setConnectSourceId(null);
      return;
    }

    const alreadyLinked = links.some(
      (l) =>
        (l.fromId === connectSourceId && l.toId === deviceId) ||
        (l.fromId === deviceId && l.toId === connectSourceId)
    );

    if (!alreadyLinked) {
      setLinks((prev) => [
        ...prev,
        {
          id: `link-${connectSourceId}-${deviceId}-${Date.now().toString(36)}`,
          fromId: connectSourceId,
          toId: deviceId,
          up: true,
        },
      ]);
    }
    setConnectSourceId(null);
  };

  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const x = ((clientX - rect.left) / rect.width) * 800;
    const y = ((clientY - rect.top) / rect.height) * 420;
    return {
      x: Math.max(60, Math.min(740, x)),
      y: Math.max(55, Math.min(365, y)),
    };
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const dragId = draggingIdRef.current;
    if (!dragId) return;
    const coords = toSvgCoords(e.clientX, e.clientY);
    if (!coords) return;
    dragMovedRef.current = true;
    setDevices((prev) =>
      prev.map((d) => (d.id === dragId ? { ...d, x: coords.x, y: coords.y } : d))
    );
  };

  const stopDragging = () => {
    draggingIdRef.current = null;
  };

  const handleReset = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsSending(false);
    setPacket(null);
    setConnectMode(false);
    setConnectSourceId(null);
    setDevices(INITIAL_DEVICES);
    setLinks(INITIAL_LINKS);
    setSourceId('pc1');
    setTargetId('srv1');
    setRouteLogs([]);
  };

  const handleSendPacket = () => {
    if (isSending) return;
    const src = deviceMap.get(sourceId);
    const dst = deviceMap.get(targetId);
    if (!src || !dst) return;

    if (src.id === dst.id) {
      setRouteLogs((prev) => [
        { id: Date.now(), ok: true, text: `${net.sameNodeMsg} (${src.name})` },
        ...prev.slice(0, 9),
      ]);
      return;
    }

    const path = findShortestNetworkPath(devices, links, src.id, dst.id);
    if (!path || path.length < 2) {
      setRouteLogs((prev) => [
        {
          id: Date.now(),
          ok: false,
          text: `${net.unreachableMsg} ${src.name} (${src.ip}) & ${dst.name} (${dst.ip}).`,
        },
        ...prev.slice(0, 9),
      ]);
      return;
    }

    const pathNames = path
      .map((id) => {
        const d = deviceMap.get(id);
        return d ? `${d.name} (${d.ip})` : id;
      })
      .join(' → ');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setPacket({ path, x: dst.x, y: dst.y, activeHop: path.length - 1 });
      setRouteLogs((prev) => [
        { id: Date.now(), ok: true, text: `${net.deliveredMsg} ${pathNames}` },
        ...prev.slice(0, 9),
      ]);
      setTimeout(() => setPacket(null), 900);
      return;
    }

    setIsSending(true);
    const hopDuration = 620;
    const totalHops = path.length - 1;
    let startTs: number | null = null;

    const animate = (timestamp: number) => {
      if (startTs === null) startTs = timestamp;
      const elapsed = timestamp - startTs;
      const currentHop = Math.min(totalHops - 1, Math.floor(elapsed / hopDuration));
      const hopProgress = Math.min(1, (elapsed - currentHop * hopDuration) / hopDuration);

      const fromNode = deviceMap.get(path[currentHop]);
      const toNode = deviceMap.get(path[currentHop + 1]);

      if (!fromNode || !toNode) {
        setIsSending(false);
        setPacket(null);
        return;
      }

      const x = fromNode.x + (toNode.x - fromNode.x) * hopProgress;
      const y = fromNode.y + (toNode.y - fromNode.y) * hopProgress;

      setPacket({ path, x, y, activeHop: currentHop });

      if (elapsed < totalHops * hopDuration) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSending(false);
        setPacket(null);
        setRouteLogs((prev) => [
          { id: Date.now(), ok: true, text: `${net.deliveredMsg} ${pathNames}` },
          ...prev.slice(0, 9),
        ]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-300">{net.addTitle}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => addDevice('router')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3 py-2 text-xs font-medium text-slate-100 hover:border-blue-500/50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-blue-400" />
                <span>{net.addRouter}</span>
              </button>
              <button
                type="button"
                onClick={() => addDevice('switch')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3 py-2 text-xs font-medium text-slate-100 hover:border-violet-500/50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-violet-400" />
                <span>{net.addSwitch}</span>
              </button>
              <button
                type="button"
                onClick={() => addDevice('computer')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3 py-2 text-xs font-medium text-slate-100 hover:border-sky-500/50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-sky-400" />
                <span>{net.addComputer}</span>
              </button>
              <button
                type="button"
                onClick={() => addDevice('server')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3 py-2 text-xs font-medium text-slate-100 hover:border-emerald-500/50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>{net.addServer}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={connectMode}
              onClick={() => {
                setConnectMode((prev) => !prev);
                setConnectSourceId(null);
              }}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                connectMode
                  ? 'border-blue-400 bg-blue-600 text-white'
                  : 'border-slate-400/20 bg-slate-900/75 text-slate-200 hover:border-blue-500/50'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>{net.connectMode}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-400/20 bg-slate-900/75 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-rose-400/40 hover:text-rose-200 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{net.resetBtn}</span>
            </button>
          </div>
        </div>

        {connectMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-500/35 bg-blue-950/30 px-4 py-2.5 text-xs text-blue-100">
            <span>
              {connectSourceId
                ? `${net.selectSecond} ${deviceMap.get(connectSourceId)?.name ?? ''}`
                : net.selectFirst}
            </span>
            <button
              type="button"
              onClick={() => {
                setConnectMode(false);
                setConnectSourceId(null);
              }}
              className="inline-flex items-center gap-1 font-semibold text-blue-300 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>{net.cancelConnect}</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Stage + Transmission Controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Topology Canvas */}
        <div className="glass-panel overflow-hidden rounded-2xl p-3 sm:p-4 lg:col-span-8">
          <div dir="ltr" className="relative rounded-xl border border-slate-400/15 bg-[#04060c]">
            <svg
              ref={svgRef}
              viewBox="0 0 800 420"
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={stopDragging}
              onPointerLeave={stopDragging}
              className="h-[320px] w-full select-none touch-none sm:h-[420px]"
              role="img"
              aria-label={net.devicesTableTitle}
            >
              <defs>
                <pattern
                  id="netGrid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="rgba(148,163,184,0.07)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="800" height="420" fill="url(#netGrid)" />

              {/* Visual Links */}
              {links.map((link) => {
                const a = deviceMap.get(link.fromId);
                const b = deviceMap.get(link.toId);
                if (!a || !b) return null;
                const onActivePath = activePathLinkSet.has(`${a.id}::${b.id}`);
                return (
                  <g key={link.id}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={
                        !link.up
                          ? '#f43f5e'
                          : onActivePath
                          ? '#38bdf8'
                          : 'rgba(96, 165, 250, 0.48)'
                      }
                      strokeWidth={onActivePath ? 4 : 2.5}
                      strokeDasharray={link.up ? undefined : '6 6'}
                    />
                  </g>
                );
              })}

              {/* Devices */}
              {devices.map((d) => {
                const peers = peerCounts.get(d.id) ?? 0;
                const isConnected = peers > 0;
                const isConnectOrigin = connectSourceId === d.id;
                const isSource = sourceId === d.id;
                const isTarget = targetId === d.id;
                const onPath = packet?.path.includes(d.id) ?? false;

                return (
                  <g
                    key={d.id}
                    transform={`translate(${d.x}, ${d.y})`}
                    onPointerDown={(e) => {
                      dragMovedRef.current = false;
                      draggingIdRef.current = d.id;
                      (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId);
                    }}
                    onClick={() => handleDeviceClick(d.id)}
                    className={connectMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}
                  >
                    <rect
                      x={-54}
                      y={-32}
                      width={108}
                      height={64}
                      rx={12}
                      fill={onPath ? '#0f2342' : '#0b101d'}
                      stroke={
                        isConnectOrigin
                          ? '#fbbf24'
                          : onPath
                          ? '#38bdf8'
                          : isSource || isTarget
                          ? '#8b5cf6'
                          : isConnected
                          ? 'rgba(59,130,246,0.55)'
                          : 'rgba(148,163,184,0.3)'
                      }
                      strokeWidth={isConnectOrigin || onPath ? 2.5 : 1.5}
                    />
                    <text
                      x={0}
                      y={-11}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11.5"
                      fontWeight="600"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {d.name}
                    </text>
                    <text
                      x={0}
                      y={6}
                      textAnchor="middle"
                      fill="#93c5fd"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {d.ip}
                    </text>
                    <text
                      x={0}
                      y={22}
                      textAnchor="middle"
                      fill={isConnected ? '#34d399' : '#fbbf24'}
                      fontSize="9.5"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {isConnected ? net.statusConnected : net.statusIsolated}
                    </text>
                  </g>
                );
              })}

              {/* Animated Packet */}
              {packet && (
                <g transform={`translate(${packet.x}, ${packet.y})`}>
                  <circle r={12} fill="rgba(56, 189, 248, 0.28)" />
                  <circle r={6} fill="#38bdf8" stroke="#ffffff" strokeWidth={2} />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Packet Transmission & Routing Log */}
        <div className="space-y-5 lg:col-span-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-white">
              {net.sendPacketTitle}
            </h3>

            <div>
              <label
                htmlFor="sim-source-select"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                {net.sourceLabel}
              </label>
              <select
                id="sim-source-select"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-3 py-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sim-target-select"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                {net.targetLabel}
              </label>
              <select
                id="sim-target-select"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-3 py-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={isSending || devices.length < 2}
              onClick={handleSendPacket}
              className="neon-action-btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? net.sendingBtn : net.sendBtn}</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5">
            <h3 className="font-display text-sm font-semibold text-white">
              {net.traceTitle}
            </h3>
            {routeLogs.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">{net.noTrace}</p>
            ) : (
              <div className="mt-3 max-h-[210px] space-y-2 overflow-y-auto">
                {routeLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs ${
                      entry.ok
                        ? 'border-emerald-500/30 bg-emerald-950/25 text-emerald-100'
                        : 'border-rose-500/35 bg-rose-950/30 text-rose-100'
                    }`}
                  >
                    {entry.ok ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                    )}
                    <span dir="ltr" className="font-mono leading-relaxed break-words">
                      {entry.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Devices Table & Links Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 lg:col-span-7 overflow-x-auto">
          <h3 className="mb-3 font-display text-sm font-semibold text-white">
            {net.devicesTableTitle}
          </h3>
          <table className="w-full min-w-[520px] border-collapse text-start text-xs">
            <thead>
              <tr className="border-b border-slate-400/15 text-slate-400">
                <th className="py-2 pe-3 text-start font-medium">{net.cols.name}</th>
                <th className="py-2 pe-3 text-start font-medium">{net.cols.type}</th>
                <th className="py-2 pe-3 text-start font-medium">{net.cols.ip}</th>
                <th className="py-2 pe-3 text-start font-medium">{net.cols.links}</th>
                <th className="py-2 pe-3 text-start font-medium">{net.cols.status}</th>
                <th className="py-2 text-end font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400/10 text-slate-200">
              {devices.map((d) => {
                const peers = peerCounts.get(d.id) ?? 0;
                const isConnected = peers > 0;
                return (
                  <tr key={d.id}>
                    <td className="py-2.5 pe-3 font-semibold text-white">
                      <span className="inline-flex items-center gap-2">
                        <DeviceIcon type={d.type} className="h-3.5 w-3.5 text-blue-400" />
                        <span>{d.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pe-3 text-slate-300">
                      {net.deviceTypes[d.type]}
                    </td>
                    <td dir="ltr" className="py-2.5 pe-3 font-mono text-blue-300 tabular-nums">
                      {d.ip}
                    </td>
                    <td className="py-2.5 pe-3 font-mono tabular-nums">{peers}</td>
                    <td className="py-2.5 pe-3">
                      <span className={isConnected ? 'text-emerald-300' : 'text-amber-300'}>
                        {isConnected ? net.statusConnected : net.statusIsolated}
                      </span>
                    </td>
                    <td className="py-2.5 text-end">
                      <button
                        type="button"
                        disabled={isSending || devices.length <= 2}
                        onClick={() => removeDevice(d.id)}
                        aria-label={`${net.removeDevice} ${d.name}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-300 disabled:opacity-35 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{net.removeDevice}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 lg:col-span-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-white">
            {net.linksTitle}
          </h3>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {links.map((link) => {
              const a = deviceMap.get(link.fromId);
              const b = deviceMap.get(link.toId);
              if (!a || !b) return null;
              return (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-400/15 bg-[#04060c] px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <span dir="ltr" className="font-mono font-medium text-slate-100">
                      {a.name} ↔ {b.name}
                    </span>
                    <span className="mx-2 text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className={link.up ? 'text-emerald-300' : 'text-rose-300'}>
                      {link.up ? net.statusLinkUp : net.statusLinkDown}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() =>
                        setLinks((prev) =>
                          prev.map((item) =>
                            item.id === link.id ? { ...item, up: !item.up } : item
                          )
                        )
                      }
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-slate-400/20 px-2.5 py-1 text-slate-200 hover:border-blue-500/40 cursor-pointer"
                    >
                      <Power className="h-3 w-3" />
                      <span>{link.up ? net.toggleLinkDown : net.toggleLinkUp}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() =>
                        setLinks((prev) => prev.filter((item) => item.id !== link.id))
                      }
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-slate-400/20 px-2 py-1 text-slate-400 hover:text-rose-300 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
