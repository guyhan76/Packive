"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";

interface PanelData { json: string | null; thumbnail: string | null; designed: boolean; }
interface PanelConfig { name: string; widthMM: number; heightMM: number; guide: string; color: string; border: string; icon: string; group: "body"|"top"|"bottom"|"glue"; }
type PanelId = "front"|"left"|"back"|"right"|"topLid"|"topTuck"|"topDustL"|"topDustR"|"bottomFlapFront"|"bottomFlapBack"|"bottomDustL"|"bottomDustR"|"glueFlap";

interface Props {
  L: number; W: number; D: number; T: number;
  tuckH: number; dustH: number; glueW: number;
  bottomH: number; bottomDustH: number;
  panels: Record<string, PanelData>;
  panelConfig: Record<string, PanelConfig>;
  onSave: (panelId: string, json: string, thumbnail: string) => void;
  onBack: () => void;
  onEditPanel: (pid: PanelId) => void;
}

export default function FullNetEditor({
  L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH,
  panels, panelConfig, onSave, onBack, onEditPanel
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const frontX = glueW + T;
  const leftX = frontX + L + T;
  const backX = leftX + W + T;
  const rightX = backX + L + T;
  const totalW = rightX + W;
  const tuckY = 0;
  const topLidY = tuckH + T;
  const bodyY = topLidY + W;
  const bottomY = bodyY + D + T;
  const totalH = bottomY + Math.max(bottomH, bottomDustH);
  const tuckInset = Math.min(tuckH * 0.35, L * 0.12);
  const tuckNotch = tuckH * 0.18;
  const dustTaper = Math.min(dustH * 0.4, 6);
  const dustRad = Math.min(dustH * 0.35, 5);
  const glueTaper = Math.min(glueW * 0.3, D * 0.12);
  const bottomTaper = Math.min(bottomH * 0.25, 5);
  const bottomDustTaper = Math.min(bottomDustH * 0.4, 6);

  function pp(pid: string, p: { x: number; y: number; w: number; h: number }): string {
    const x = p.x, y = p.y, w = p.w, h = p.h;
    switch (pid) {
      case "topTuck": return `M ${x+tuckNotch} ${y+h} L ${x} ${y+h-tuckNotch} L ${x+tuckInset} ${y} Q ${x+w/2} ${y-h*0.08} ${x+w-tuckInset} ${y} L ${x+w} ${y+h-tuckNotch} L ${x+w-tuckNotch} ${y+h} Z`;
      case "topDustL": case "topDustR": return `M ${x} ${y+h} L ${x} ${y+dustTaper} Q ${x} ${y} ${x+dustRad} ${y} L ${x+w-dustRad} ${y} Q ${x+w} ${y} ${x+w} ${y+dustTaper} L ${x+w} ${y+h} Z`;
      case "glueFlap": return `M ${x+w} ${y} L ${x} ${y+glueTaper} L ${x} ${y+h-glueTaper} L ${x+w} ${y+h} Z`;
      case "bottomFlapFront": case "bottomFlapBack": return `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h-bottomTaper} L ${x+w-bottomTaper} ${y+h} L ${x+bottomTaper} ${y+h} L ${x} ${y+h-bottomTaper} Z`;
      case "bottomDustL": case "bottomDustR": { const r5 = Math.min(bottomDustTaper * 0.8, 4); return `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h-bottomDustTaper} Q ${x+w} ${y+h} ${x+w-r5} ${y+h} L ${x+r5} ${y+h} Q ${x} ${y+h} ${x} ${y+h-bottomDustTaper} Z`; }
      default: return `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z`;
    }
  }

  const pos: Record<string, { x: number; y: number; w: number; h: number }> = {
    topTuck: { x: frontX, y: tuckY, w: L, h: tuckH },
    topLid: { x: frontX, y: topLidY, w: L, h: W },
    topDustL: { x: leftX, y: bodyY - dustH, w: W, h: dustH },
    topDustR: { x: rightX, y: bodyY - dustH, w: W, h: dustH },
    glueFlap: { x: 0, y: bodyY, w: glueW, h: D },
    front: { x: frontX, y: bodyY, w: L, h: D },
    left: { x: leftX, y: bodyY, w: W, h: D },
    back: { x: backX, y: bodyY, w: L, h: D },
    right: { x: rightX, y: bodyY, w: W, h: D },
    bottomFlapFront: { x: frontX, y: bottomY, w: L, h: bottomH },
    bottomDustL: { x: leftX, y: bottomY, w: W, h: bottomDustH },
    bottomFlapBack: { x: backX, y: bottomY, w: L, h: bottomH },
    bottomDustR: { x: rightX, y: bottomY, w: W, h: bottomDustH },
  };

  const pad = 8;
  const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400, 600];

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -15 : 15;
    setZoom(prev => Math.max(10, Math.min(800, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const fitToScreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const cw = c.clientWidth - 20;
    const ch = c.clientHeight - 20;
    const fit = Math.floor(Math.min(cw / (totalW + pad * 2), ch / (totalH + pad * 2)) * 100);
    setZoom(Math.max(10, Math.min(800, fit)));
    setPan({ x: 0, y: 0 });
  }, [totalW, totalH]);

  useEffect(() => { fitToScreen(); }, [fitToScreen]);

  const handlePanelClick = useCallback((pid: string) => {
    setActivePanel(pid);
  }, []);

  const handlePanelDblClick = useCallback((pid: string) => {
    onEditPanel(pid as PanelId);
  }, [onEditPanel]);

  const foldLines = [
    [frontX, bodyY, frontX + L, bodyY], [frontX + L, bodyY, frontX + L, bodyY + D],
    [leftX + W, bodyY, leftX + W, bodyY + D], [backX + L, bodyY, backX + L, bodyY + D],
    [frontX, bottomY, frontX + L, bottomY], [leftX, bottomY, leftX + W, bottomY],
    [backX, bottomY, backX + L, bottomY], [rightX, bottomY, rightX + W, bottomY],
    [frontX, topLidY, frontX + L, topLidY], [frontX, tuckY + tuckH, frontX + L, tuckY + tuckH],
    [leftX, bodyY, leftX + W, bodyY], [rightX, bodyY, rightX + W, bodyY],
    [glueW, bodyY, glueW, bodyY + D],
  ];

  const activeCfg = activePanel ? panelConfig[activePanel] : null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition">Back</button>
          <span className="font-bold text-base">Full Net Editor</span>
          <span className="text-xs text-gray-400">L{L} x W{W} x D{D}mm</span>
        </div>
        <div className="flex items-center gap-3">
          {activePanel && activeCfg && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: activeCfg.color, color: activeCfg.border }}>{activeCfg.name}</span>
              <button onClick={() => onEditPanel(activePanel as PanelId)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Edit Panel</button>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(10, z - 25))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 text-sm font-bold">-</button>
            <select value={ZOOM_PRESETS.includes(zoom) ? zoom : ""} onChange={e => e.target.value === "fit" ? fitToScreen() : setZoom(Number(e.target.value))}
              className="text-xs bg-white border rounded px-1 py-0.5 w-16 text-center">
              {ZOOM_PRESETS.map(z => <option key={z} value={z}>{z}%</option>)}
              <option value="fit">Fit</option>
              {!ZOOM_PRESETS.includes(zoom) && <option value={zoom}>{zoom}%</option>}
            </select>
            <button onClick={() => setZoom(z => Math.min(800, z + 25))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 text-sm font-bold">+</button>
          </div>
          <button onClick={fitToScreen} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Fit</button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-3 px-4 py-1 bg-white border-b text-[11px] text-gray-400">
        <span>Scroll: Zoom</span><span className="text-gray-300">|</span>
        <span>Alt+Drag: Pan</span><span className="text-gray-300">|</span>
        <span>Double-click: Edit panel</span><span className="text-gray-300">|</span>
        <span>Click: Select</span>
        {activePanel && activeCfg && <><span className="text-gray-300">|</span><span className="text-blue-600 font-semibold">Selected: {activeCfg.name}</span></>}
      </div>

      {/* Canvas */}
      <div ref={containerRef}
        className="flex-1 overflow-hidden relative bg-white"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.15s ease",
          }}>
            <svg viewBox={`${-pad} ${-pad} ${totalW + pad * 2} ${totalH + pad * 2}`}
              width={totalW + pad * 2} height={totalH + pad * 2}>
              <defs>
                {Object.entries(pos).map(([pid, p]) => {
                  if (p.w <= 0 || p.h <= 0) return null;
                  return <clipPath key={"clip-" + pid} id={"fne-clip-" + pid}><path d={pp(pid, p)} /></clipPath>;
                })}
              </defs>
              <rect x={-pad} y={-pad} width={totalW + pad * 2} height={totalH + pad * 2} fill="#ffffff" rx={1} />

              {/* Fold lines */}
              {foldLines.map((ln, i) => (
                <line key={"fl" + i} x1={ln[0]} y1={ln[1]} x2={ln[2]} y2={ln[3]} stroke="#00AA00" strokeWidth={0.3} strokeDasharray="2 1" />
              ))}

              {/* Panels */}
              {Object.entries(pos).map(([pid, p]) => {
                const pc = panelConfig[pid as PanelId];
                const d = panels[pid];
                if (!pc || p.w <= 0 || p.h <= 0) return null;
                const isHovered = hoveredPanel === pid;
                const isActive = activePanel === pid;
                return (
                  <g key={pid} className="cursor-pointer"
                    onClick={() => handlePanelClick(pid)}
                    onDoubleClick={() => handlePanelDblClick(pid)}
                    onMouseEnter={() => setHoveredPanel(pid)}
                    onMouseLeave={() => setHoveredPanel(null)}>
                    <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="transparent" />
                    <path d={pp(pid, p)}
                      fill={d?.designed ? "#FAFAFA" : pc.color}
                      fillOpacity={1}
                      stroke={isActive ? "#2563EB" : isHovered ? "#3B82F6" : d?.designed ? "#22C55E" : pc.border}
                      strokeWidth={isActive ? 2 : isHovered ? 1.5 : d?.designed ? 0.8 : 0.5}
                      style={{ transition: "stroke 0.15s, stroke-width 0.15s", pointerEvents: "all" }} />
                    {d?.thumbnail && (
                      <image href={d.thumbnail} x={p.x} y={p.y} width={p.w} height={p.h} preserveAspectRatio="none" clipPath={"url(#fne-clip-" + pid + ")"} />
                    )}
                    {!d?.thumbnail && p.w > 10 && p.h > 6 && (
                      <text x={p.x + p.w / 2} y={p.y + p.h / 2} textAnchor="middle" dominantBaseline="middle"
                        fontSize={Math.max(Math.min(p.w * 0.06, p.h * 0.08, 6), 2)}
                        fill={isActive ? "#2563EB" : isHovered ? "#3B82F6" : "#9CA3AF"}
                        className="pointer-events-none select-none">{pc.name}</text>
                    )}
                    {d?.designed && p.w > 6 && (
                      <>
                        <circle cx={p.x + p.w - 3} cy={p.y + 3} r={2} fill="#22C55E" />
                        <text x={p.x + p.w - 3} y={p.y + 3} textAnchor="middle" dominantBaseline="central" fontSize={2} fill="white" fontWeight="bold" className="pointer-events-none">✓</text>
                      </>
                    )}
                    {(isHovered || isActive) && (
                      <>
                        <rect x={p.x + p.w / 2 - 22} y={p.y - 9} width={44} height={7} rx={1} fill={isActive ? "rgba(37,99,235,0.9)" : "rgba(0,0,0,0.75)"} />
                        <text x={p.x + p.w / 2} y={p.y - 5.5} textAnchor="middle" dominantBaseline="middle"
                          fontSize={3.5} fill="white" className="pointer-events-none select-none">{pc.name}</text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">{zoom}%</div>
      </div>
    </div>
  );
}
