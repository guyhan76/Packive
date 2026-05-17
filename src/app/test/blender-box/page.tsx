"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";

const FOLD_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const;
const PREFETCH_PARALLEL = 3; // 동시 Blender 요청 수 (서버 CPU 부하 vs 속도 트레이드)

function PackiveBoxModel({ autoRotate, rotateSpeed, url }: { autoRotate: boolean; rotateSpeed: number; url: string }) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(url);
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotateSpeed * 0.5;
    }
  });
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function PackiveBox({ autoRotate, rotateSpeed, url }: { autoRotate: boolean; rotateSpeed: number; url: string }) {
  // key={url} → URL 변경 시 모델 재로드
  return <PackiveBoxModel key={url} autoRotate={autoRotate} rotateSpeed={rotateSpeed} url={url} />;
}

function BlenderBoxTestInner() {
  const search = useSearchParams();
  const designHash = search?.get("design") || null;
  const initialGlb = search?.get("glb") || null;
  const dimsLabel = search?.get("label") || null;
  const variant = search?.get("variant") || "fefco0201";

  const isDesignMode = !!designHash;

  const [autoRotate, setAutoRotate] = useState(false);
  const [rotateSpeed, setRotateSpeed] = useState(0.5);
  const [foldAngle, setFoldAngle] = useState(20);
  const [designGlbsByFold, setDesignGlbsByFold] = useState<Record<number, string>>(initialGlb ? { 20: initialGlb } : {});
  const [refoldError, setRefoldError] = useState<string | null>(null);
  const [prefetching, setPrefetching] = useState(false);
  const [prefetchProgress, setPrefetchProgress] = useState({ done: 0, total: 0 });

  // ★ Mount 시 백그라운드 prefetch — fold 0~90 모든 변형을 PREFETCH_PARALLEL개씩 병렬 처리
  // 사용자가 박스 보는 동안 미리 캐시 → 슬라이더 즉각 반응
  // 가운데(fold 20)에서 가까운 fold부터 우선순위
  useEffect(() => {
    if (!isDesignMode || !designHash) return;
    const missingFolds = FOLD_STEPS.filter(f => !designGlbsByFold[f]);
    if (missingFolds.length === 0) return;
    const sortedByDistance = [...missingFolds].sort((a, b) => Math.abs(a - 20) - Math.abs(b - 20));
    setPrefetching(true);
    setPrefetchProgress({ done: 0, total: sortedByDistance.length });
    console.log("[prefetch] starting parallel prefetch for", sortedByDistance.length, "folds, parallelism=", PREFETCH_PARALLEL);

    let cancelled = false;
    const queue = [...sortedByDistance];
    let doneCount = 0;

    const worker = async (workerIdx: number) => {
      while (queue.length > 0 && !cancelled) {
        const f = queue.shift();
        if (f === undefined) break;
        const t0 = performance.now();
        try {
          console.log(`[prefetch][w${workerIdx}] fold=${f} requesting...`);
          const res = await fetch("/api/generate-3d-mockup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ designHash, foldAngle: f, variant, outerGap: 2 }),
          });
          if (cancelled) return;
          const data = await res.json();
          if (res.ok && data.glbUrl) {
            try { useGLTF.preload(data.glbUrl); } catch {}
            setDesignGlbsByFold(prev => ({ ...prev, [f]: data.glbUrl }));
            console.log(`[prefetch][w${workerIdx}] fold=${f} done in ${((performance.now()-t0)/1000).toFixed(1)}s ${data.cached ? "(cached)" : "(rendered)"}`);
          } else {
            console.warn(`[prefetch][w${workerIdx}] fold=${f} failed:`, data?.error);
            if (!refoldError) setRefoldError(data?.error || `HTTP ${res.status}`);
          }
        } catch (e: any) {
          console.warn(`[prefetch][w${workerIdx}] fold=${f} error:`, e);
        }
        doneCount++;
        if (!cancelled) setPrefetchProgress({ done: doneCount, total: sortedByDistance.length });
      }
    };

    (async () => {
      const workers = Array.from({ length: PREFETCH_PARALLEL }, (_, i) => worker(i));
      await Promise.all(workers);
      if (!cancelled) {
        setPrefetching(false);
        console.log("[prefetch] all folds ready");
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designHash, isDesignMode]);

  // URL 결정:
  // 1순위: 현재 fold 캐시
  // 2순위: 가장 가까운 캐시된 fold (사용자 디자인 유지)
  // 3순위: 디자인 모드 아니면 sample fefco GLB
  const designGlbForCurrent = designGlbsByFold[foldAngle];
  const closestDesignGlb = (() => {
    if (!isDesignMode) return null;
    if (designGlbForCurrent) return designGlbForCurrent;
    const folds = Object.keys(designGlbsByFold).map(Number);
    if (folds.length === 0) return null;
    const closest = folds.reduce((p, c) => Math.abs(c - foldAngle) < Math.abs(p - foldAngle) ? c : p);
    return designGlbsByFold[closest];
  })();
  const url = isDesignMode
    ? (closestDesignGlb || `/models/packive-box-fold${String(foldAngle).padStart(2, "0")}.glb`)
    : `/models/packive-box-fold${String(foldAngle).padStart(2, "0")}.glb`;

  const cachedFoldCount = Object.keys(designGlbsByFold).length;
  const showingExactFold = !!designGlbForCurrent;

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-neutral-50 to-neutral-200">
      {/* 백그라운드 prefetch 진행 banner — 우상단, 사용자가 슬라이더 부드러워질 때까지 명확히 인지 */}
      {isDesignMode && prefetching && prefetchProgress.total > 0 && (
        <div className="absolute top-20 right-4 z-20 bg-white border border-violet-200 rounded-lg shadow-md px-4 py-2.5 flex items-center gap-3 min-w-[300px]">
          <svg className="animate-spin h-4 w-4 text-violet-600 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M12 2 a 10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-violet-900">Pre-rendering fold variants ({PREFETCH_PARALLEL}× parallel)</div>
            <div className="text-[10px] text-violet-600">
              {prefetchProgress.done} / {prefetchProgress.total} ready · slider becomes smooth once done
            </div>
            <div className="mt-1 h-1 bg-violet-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${(prefetchProgress.done / Math.max(1, prefetchProgress.total)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {refoldError && (
        <div className="absolute top-36 right-4 z-20 bg-red-50 border border-red-300 rounded-lg shadow px-3 py-2 max-w-[320px] flex items-start gap-2">
          <span className="text-red-600 shrink-0">⚠</span>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-red-900">3D rendering failed</div>
            <div className="text-[10px] text-red-700 break-words">{refoldError}</div>
          </div>
          <button onClick={() => setRefoldError(null)} className="text-red-500 hover:text-red-700 text-sm leading-none">×</button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur rounded-lg px-3 py-2 text-xs shadow flex items-center gap-3">
        <div className="flex items-center gap-2 border-r pr-3 border-gray-200">
          {isDesignMode && (
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">
              📦 Custom Design{dimsLabel ? ` · ${dimsLabel}` : ""}
            </span>
          )}
          <label className="flex items-center gap-2 text-[10px] text-neutral-500 ml-1">
            <span className="font-medium text-neutral-700">Fold</span>
            <input
              type="range"
              min={0}
              max={90}
              step={10}
              value={foldAngle}
              onChange={e => setFoldAngle(parseInt(e.target.value))}
              className="w-32 accent-violet-600"
            />
            <span className={`w-9 text-right tabular-nums font-bold ${showingExactFold ? "text-emerald-600" : "text-amber-600"}`}>{foldAngle}°</span>
            {isDesignMode && (
              <span className="text-[9px] text-neutral-400 ml-1" title="cached fold variants">
                {cachedFoldCount}/10
              </span>
            )}
          </label>
        </div>
        <button
          onClick={() => setAutoRotate(v => !v)}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${autoRotate ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {autoRotate ? "⏸ Stop Rotate" : "▶ Auto Rotate"}
        </button>
        {autoRotate && (
          <label className="flex items-center gap-1 text-[10px] text-neutral-500">
            speed
            <input
              type="range"
              min={0.5}
              max={6}
              step={0.5}
              value={rotateSpeed}
              onChange={e => setRotateSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="w-6 text-right tabular-nums">{rotateSpeed.toFixed(1)}</span>
          </label>
        )}
      </div>

      {/* 컨트롤 안내 (우하단) */}
      <div className="absolute bottom-3 right-4 z-10 text-[10px] text-neutral-400 bg-white/70 backdrop-blur rounded px-2 py-1 shadow-sm">
        Left drag: rotate · Right drag: pan · Scroll: zoom
      </div>

      <Canvas
        shadows={false}
        camera={{ position: [0.55, 0.4, 0.55], fov: 38 }}
        gl={{
          antialias: true,
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.5} />
          <hemisphereLight color={0xffffff} groundColor={0xffffff} intensity={0.35} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[3, 4, 2]} intensity={1.7} />
          <directionalLight position={[-3, 2, -1]} intensity={0.3} />
          <PackiveBox autoRotate={autoRotate} rotateSpeed={rotateSpeed} url={url} />
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.3}
            scale={2}
            blur={2.8}
            far={1}
          />
        </Suspense>
        {/* 우클릭 드래그로 박스 이동, 좌클릭 회전, 스크롤 줌 */}
        <OrbitControls
          target={[0, 0.125, 0]}
          enableDamping
          enablePan={true}
          panSpeed={1.0}
          minDistance={0.2}
          maxDistance={3.0}
        />
      </Canvas>
    </div>
  );
}

export default function BlenderBoxTestPage() {
  return (
    <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
      <BlenderBoxTestInner />
    </Suspense>
  );
}

// 사전 생성된 generic FEFCO 0201 박스 (디자인 없는 버전, fallback)
FOLD_STEPS.forEach(a => useGLTF.preload(`/models/packive-box-fold${String(a).padStart(2, "0")}.glb`));
