'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface PanelPos {
  x: number; y: number; w: number; h: number;
}

interface FullNetEditorProps {
  L: number; W: number; D: number; T: number;
  tuckH: number; dustH: number; glueW: number;
  bottomH: number; bottomDustH: number;
  panels: Record<string, { designed: boolean; json: string | null; thumbnail: string | null }>;
  panelConfig: Record<string, { name: string; widthMM: number; heightMM: number; color: string; border: string }>;
  onBack: () => void;
  onSave: (panelId: string, json: string, thumbnail: string) => void;
}

export default function FullNetEditor({
  L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH,
  panels, panelConfig, onBack, onSave,
}: FullNetEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showBleed, setShowBleed] = useState(true);
  const [showFoldLines, setShowFoldLines] = useState(true);

  // 전개도 좌표 계산 (mm 단위)
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
  const BLEED = 3; // 3mm bleed

  const pos: Record<string, PanelPos> = {
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

  // mm → px 변환 (화면에 적절한 크기로)
  const SCALE = 2; // 1mm = 2px (기본, 줌으로 추가 조절)

  useEffect(() => {
    const el = canvasElRef.current;
    if (!el || fcRef.current) return;

    let cancelled = false;
    (async () => {
      const { Canvas, Rect, Line, Textbox, FabricText } = await import('fabric');
      if (cancelled) return;

      const cW = (totalW + BLEED * 2) * SCALE;
      const cH = (totalH + BLEED * 2) * SCALE;

      const canvas = new Canvas(el, {
        width: cW,
        height: cH,
        backgroundColor: '#e5e7eb',
        selection: true,
        preserveObjectStacking: true,
      });
      fcRef.current = canvas;

      // 블리드 영역 (연한 빨간색)
      if (showBleed) {
        const bleedRect = new Rect({
          left: 0, top: 0,
          width: cW, height: cH,
          fill: '#fff5f5',
          selectable: false, evented: false,
          _isGuide: true,
        } as any);
        canvas.add(bleedRect);
      }

      // 각 패널 영역 그리기
      Object.entries(pos).forEach(([pid, p]) => {
        if (p.w <= 0 || p.h <= 0) return;
        const pc = panelConfig[pid];
        if (!pc) return;

        const px = (p.x + BLEED) * SCALE;
        const py = (p.y + BLEED) * SCALE;
        const pw = p.w * SCALE;
        const ph = p.h * SCALE;

        // 패널 배경 (흰색)
        const bg = new Rect({
          left: px, top: py, width: pw, height: ph,
          fill: '#ffffff',
          stroke: '#cccccc', strokeWidth: 0.5,
          selectable: false, evented: false,
          _isGuide: true, _panelId: pid,
        } as any);
        canvas.add(bg);

        // 패널 이름 (연한 텍스트)
        const label = new FabricText(pc.name, {
          left: px + pw / 2, top: py + ph / 2,
          originX: 'center', originY: 'center',
          fontSize: Math.min(pw * 0.08, ph * 0.08, 14),
          fill: '#d1d5db',
          selectable: false, evented: false,
          _isGuide: true,
        } as any);
        canvas.add(label);
      });

      // 접힘선 (초록 점선)
      const foldLines: number[][] = [
        [frontX, bodyY, frontX + L, bodyY],
        [frontX + L, bodyY, frontX + L, bodyY + D],
        [leftX + W, bodyY, leftX + W, bodyY + D],
        [backX + L, bodyY, backX + L, bodyY + D],
        [frontX, bottomY, frontX + L, bottomY],
        [leftX, bottomY, leftX + W, bottomY],
        [backX, bottomY, backX + L, bottomY],
        [rightX, bottomY, rightX + W, bottomY],
        [frontX, topLidY, frontX + L, topLidY],
        [frontX, tuckY + tuckH, frontX + L, tuckY + tuckH],
        [leftX, bodyY, leftX + W, bodyY],
        [rightX, bodyY, rightX + W, bodyY],
        [glueW, bodyY, glueW, bodyY + D],
      ];

      foldLines.forEach(([x1, y1, x2, y2]) => {
        const line = new Line([
          (x1 + BLEED) * SCALE, (y1 + BLEED) * SCALE,
          (x2 + BLEED) * SCALE, (y2 + BLEED) * SCALE,
        ], {
          stroke: '#00AA00', strokeWidth: 0.8,
          strokeDashArray: [4, 2],
          selectable: false, evented: false,
          _isGuide: true,
        } as any);
        canvas.add(line);
      });

      // 칼선 (빨간 실선) - 전체 외곽
      const dieLines: number[][] = [
        // 상단 턱
        [frontX, tuckY, frontX + L, tuckY],
        [frontX, tuckY, frontX, tuckY + tuckH],
        [frontX + L, tuckY, frontX + L, tuckY + tuckH],
        // 상단 덮개
        [frontX, topLidY, frontX + L, topLidY],
        [frontX, topLidY, frontX, topLidY + W],
        [frontX + L, topLidY, frontX + L, topLidY + W],
        // 먼지 플랩 상단
        [leftX, bodyY - dustH, leftX + W, bodyY - dustH],
        [leftX, bodyY - dustH, leftX, bodyY],
        [leftX + W, bodyY - dustH, leftX + W, bodyY],
        [rightX, bodyY - dustH, rightX + W, bodyY - dustH],
        [rightX, bodyY - dustH, rightX, bodyY],
        [rightX + W, bodyY - dustH, rightX + W, bodyY],
        // 본체 외곽
        [0, bodyY, totalW, bodyY],
        [0, bodyY + D, totalW, bodyY + D],
        [0, bodyY, 0, bodyY + D],
        [totalW, bodyY, totalW, bodyY + D],
        // 하단 플랩
        [frontX, bottomY + bottomH, frontX + L, bottomY + bottomH],
        [frontX, bottomY, frontX, bottomY + bottomH],
        [frontX + L, bottomY, frontX + L, bottomY + bottomH],
        [backX, bottomY + bottomH, backX + L, bottomY + bottomH],
        [backX, bottomY, backX, bottomY + bottomH],
        [backX + L, bottomY, backX + L, bottomY + bottomH],
        // 먼지 플랩 하단
        [leftX, bottomY + bottomDustH, leftX + W, bottomY + bottomDustH],
        [leftX, bottomY, leftX, bottomY + bottomDustH],
        [leftX + W, bottomY, leftX + W, bottomY + bottomDustH],
        [rightX, bottomY + bottomDustH, rightX + W, bottomY + bottomDustH],
        [rightX, bottomY, rightX, bottomY + bottomDustH],
        [rightX + W, bottomY, rightX + W, bottomY + bottomDustH],
      ];

      dieLines.forEach(([x1, y1, x2, y2]) => {
        const line = new Line([
          (x1 + BLEED) * SCALE, (y1 + BLEED) * SCALE,
          (x2 + BLEED) * SCALE, (y2 + BLEED) * SCALE,
        ], {
          stroke: '#EF4444', strokeWidth: 0.6,
          selectable: false, evented: false,
          _isGuide: true,
        } as any);
        canvas.add(line);
      });

      // 기존 패널 디자인 로드
      for (const [pid, pnl] of Object.entries(panels)) {
        if (!pnl.json || !pos[pid]) continue;
        const p = pos[pid];
        try {
          const data = JSON.parse(pnl.json);
          if (!data.objects || data.objects.length === 0) continue;
          const px = (p.x + BLEED) * SCALE;
          const py = (p.y + BLEED) * SCALE;
          // 패널 썸네일을 이미지로 로드
          if (pnl.thumbnail) {
            const { FabricImage } = await import('fabric');
            const img = await FabricImage.fromURL(pnl.thumbnail);
            img.set({
              left: px, top: py,
              scaleX: (p.w * SCALE) / (img.width || 1),
              scaleY: (p.h * SCALE) / (img.height || 1),
              selectable: true,
              _panelId: pid,
            } as any);
            canvas.add(img);
          }
        } catch (e) { console.warn('Failed to load panel', pid, e); }
      }

      // 줌/패닝 설정
      canvas.on('mouse:wheel', (opt: any) => {
        const delta = opt.e.deltaY;
        let z = canvas.getZoom();
        z *= 0.999 ** delta;
        z = Math.max(0.1, Math.min(8, z));
        const point = { x: opt.e.offsetX, y: opt.e.offsetY };
canvas.zoomToPoint(point as any, z);

        setZoom(Math.round(z * 100));
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      let isPanning = false;
      let lastPosX = 0, lastPosY = 0;
      canvas.on('mouse:down', (opt: any) => {
        if (opt.e.altKey || opt.e.button === 1) {
          isPanning = true;
          lastPosX = opt.e.clientX;
          lastPosY = opt.e.clientY;
          canvas.selection = false;
        }
      });
      canvas.on('mouse:move', (opt: any) => {
        if (isPanning) {
          const vpt = canvas.viewportTransform!;
          vpt[4] += opt.e.clientX - lastPosX;
          vpt[5] += opt.e.clientY - lastPosY;
          lastPosX = opt.e.clientX;
          lastPosY = opt.e.clientY;
          canvas.requestRenderAll();
        }
      });
      canvas.on('mouse:up', () => {
        isPanning = false;
        canvas.selection = true;
      });

      // 초기 줌: 화면에 맞춤
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const fitZoom = Math.min(
          (wrapper.clientWidth - 40) / cW,
          (wrapper.clientHeight - 40) / cH
        );
        canvas.setZoom(fitZoom);
        setZoom(Math.round(fitZoom * 100));
        const vpt = canvas.viewportTransform!;
        vpt[4] = (wrapper.clientWidth - cW * fitZoom) / 2;
        vpt[5] = (wrapper.clientHeight - cH * fitZoom) / 2;
        canvas.requestRenderAll();
      }

      canvas.renderAll();
    })();

    return () => {
      cancelled = true;
      if (fcRef.current) { fcRef.current.dispose(); fcRef.current = null; }
    };
  }, []);

  // 도구 함수들
  const addText = useCallback(async () => {
    const cv = fcRef.current; if (!cv) return;
    const { Textbox } = await import('fabric');
    const vpt = cv.viewportTransform!;
    const centerX = (-vpt[4] + (wrapperRef.current?.clientWidth || 800) / 2) / cv.getZoom();
    const centerY = (-vpt[5] + (wrapperRef.current?.clientHeight || 600) / 2) / cv.getZoom();
    const t = new Textbox('Text', {
      left: centerX, top: centerY,
      originX: 'center', originY: 'center',
      fontSize: 20, fontFamily: 'Arial, sans-serif',
      fill: '#000000', width: 150,
    });
    cv.add(t); cv.setActiveObject(t); cv.renderAll();
  }, []);

  const addRect = useCallback(async () => {
    const cv = fcRef.current; if (!cv) return;
    const { Rect } = await import('fabric');
    const vpt = cv.viewportTransform!;
    const centerX = (-vpt[4] + (wrapperRef.current?.clientWidth || 800) / 2) / cv.getZoom();
    const centerY = (-vpt[5] + (wrapperRef.current?.clientHeight || 600) / 2) / cv.getZoom();
    const r = new Rect({
      left: centerX, top: centerY,
      originX: 'center', originY: 'center',
      width: 100, height: 80, fill: '#3B82F6',
      strokeWidth: 0,
    });
    cv.add(r); cv.setActiveObject(r); cv.renderAll();
  }, []);

  const addImage = useCallback(() => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async (e: any) => {
      const file = e.target.files?.[0]; if (!file) return;
      const cv = fcRef.current; if (!cv) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const { FabricImage } = await import('fabric');
        const img = await FabricImage.fromURL(reader.result as string);
        const vpt = cv.viewportTransform!;
        const centerX = (-vpt[4] + (wrapperRef.current?.clientWidth || 800) / 2) / cv.getZoom();
        const centerY = (-vpt[5] + (wrapperRef.current?.clientHeight || 600) / 2) / cv.getZoom();
        img.set({ left: centerX, top: centerY, originX: 'center', originY: 'center' });
        const maxDim = 200;
        if ((img.width || 0) > maxDim || (img.height || 0) > maxDim) {
          const s = maxDim / Math.max(img.width || 1, img.height || 1);
          img.scale(s);
        }
        cv.add(img); cv.setActiveObject(img); cv.renderAll();
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }, []);

  const fitToScreen = useCallback(() => {
    const cv = fcRef.current; if (!cv) return;
    const wrapper = wrapperRef.current; if (!wrapper) return;
    const cW = (totalW + BLEED * 2) * SCALE;
    const cH = (totalH + BLEED * 2) * SCALE;
    const fitZoom = Math.min(
      (wrapper.clientWidth - 40) / cW,
      (wrapper.clientHeight - 40) / cH
    );
    cv.setZoom(fitZoom);
    setZoom(Math.round(fitZoom * 100));
    const vpt = cv.viewportTransform!;
    vpt[4] = (wrapper.clientWidth - cW * fitZoom) / 2;
    vpt[5] = (wrapper.clientHeight - cH * fitZoom) / 2;
    cv.requestRenderAll();
  }, [totalW, totalH]);

  const setZoomLevel = useCallback((level: number) => {
    const cv = fcRef.current; if (!cv) return;
    const wrapper = wrapperRef.current; if (!wrapper) return;
    const z = level / 100;
    const cx = wrapper.clientWidth / 2;
    const cy = wrapper.clientHeight / 2;
    const vpt = cv.viewportTransform!;
    const beforeX = (cx - vpt[4]) / cv.getZoom();
    const beforeY = (cy - vpt[5]) / cv.getZoom();
    cv.setZoom(z);
    vpt[4] = cx - beforeX * z;
    vpt[5] = cy - beforeY * z;
    setZoom(level);
    cv.requestRenderAll();
  }, []);

  const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400];

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 상단 바 */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition">
            ← Back to Overview
          </button>
          <h1 className="text-sm font-bold text-white">Full Net Editor</h1>
          <span className="text-xs text-gray-400">{L}×{W}×{D}mm</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 줌 컨트롤 */}
          <button onClick={() => setZoomLevel(Math.max(10, zoom - 25))} className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm">−</button>
          <select value={ZOOM_PRESETS.includes(zoom) ? zoom : ''} onChange={e => {
            if (e.target.value === 'fit') fitToScreen();
            else setZoomLevel(Number(e.target.value));
          }} className="text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 w-20 text-center outline-none">
            {ZOOM_PRESETS.map(z => <option key={z} value={z}>{z}%</option>)}
            <option value="fit">Fit</option>
            {!ZOOM_PRESETS.includes(zoom) && <option value={zoom}>{zoom}%</option>}
          </select>
          <button onClick={() => setZoomLevel(Math.min(800, zoom + 25))} className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm">+</button>
          <span className="text-[10px] text-gray-500 ml-1">Scroll: zoom · Alt+drag: pan</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[10px] text-gray-400">
            <input type="checkbox" checked={showFoldLines} onChange={e => setShowFoldLines(e.target.checked)} className="w-3 h-3" />
            Fold
          </label>
          <label className="flex items-center gap-1 text-[10px] text-gray-400">
            <input type="checkbox" checked={showBleed} onChange={e => setShowBleed(e.target.checked)} className="w-3 h-3" />
            Bleed
          </label>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 도구 패널 */}
        <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 gap-1 shrink-0">
          <button onClick={() => setActiveTool('select')} title="Select (V)"
            className={"w-9 h-9 flex items-center justify-center rounded-lg text-sm transition " + (activeTool === 'select' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700')}>
            ↖
          </button>
          <button onClick={addText} title="Text (T)"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-700 text-sm transition">
            T
          </button>
          <button onClick={addRect} title="Rectangle"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-700 text-sm transition">
            ▢
          </button>
          <button onClick={addImage} title="Image"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-700 text-sm transition">
            🖼
          </button>
        </div>

        {/* 캔버스 영역 */}
        <div ref={wrapperRef} className="flex-1 overflow-hidden bg-gray-700 relative">
          <canvas ref={canvasElRef} />
          {/* 줌 표시 */}
          <div className="absolute bottom-3 right-3 bg-gray-800/80 text-gray-300 text-xs px-2 py-1 rounded">
            {zoom}%
          </div>
        </div>
      </div>
    </div>
  );
}
