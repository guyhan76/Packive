'use client';

/**
 * PACKIVE – Advanced 3D Box Preview Engine
 * =========================================
 * React Three Fiber 기반의 FEFCO 0215 패널 접기(Folding) 3D 프리뷰
 *
 * 핵심 설계:
 * 1. 모든 13개 패널을 개별 PlaneGeometry mesh로 구성
 * 2. 각 패널은 힌지(Hinge) 포인트 기반으로 부모 패널에 연결
 * 3. foldProgress (0 = 전개도, 1 = 완전 접힘) 슬라이더로 애니메이션
 * 4. 각 패널의 Fabric.js 캔버스 텍스처를 THREE.Texture로 실시간 매핑
 *
 * 패널 계층 구조 (FEFCO 0215):
 *   Front (기준면)
 *   ├── Left  (Front 오른쪽 엣지에서 -90° 접힘)
 *   │   └── GlueFlap (Left 오른쪽 엣지에서 이어짐, 실제로는 Back에 붙음)
 *   ├── Back  (Left 오른쪽 엣지에서 -90° 접힘)  -- 실제로는 Front→Left→Back
 *   │   └── Right (Back 오른쪽 엣지에서 -90° 접힘)
 *   ├── TopLid (Front 상단 엣지에서 -90° 접힘)
 *   │   └── TopTuck (TopLid 뒤쪽 엣지에서 접힘)
 *   ├── TopDustL (Left 상단 엣지에서 접힘)
 *   ├── TopDustR (Right 상단 엣지에서 접힘)
 *   ├── BottomFlapFront (Front 하단 엣지에서 접힘)
 *   ├── BottomFlapBack  (Back 하단 엣지에서 접힘)
 *   ├── BottomDustL     (Left 하단 엣지에서 접힘)
 *   └── BottomDustR     (Right 하단 엣지에서 접힘)
 */

import React, {
  useRef, useMemo, useEffect, useState, useCallback, Suspense,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useI18n } from '@/components/i18n-context';

/* ===================================================================
   Types
   =================================================================== */

interface PanelData {
  json: string | null;
  thumbnail: string | null;
  designed: boolean;
}

type PanelId =
  | 'front' | 'left' | 'back' | 'right'
  | 'topLid' | 'topTuck' | 'topDustL' | 'topDustR'
  | 'bottomFlapFront' | 'bottomFlapBack'
  | 'bottomDustL' | 'bottomDustR'
  | 'glueFlap';

interface Box3DAdvancedProps {
  L: number;           // Length (mm)
  W: number;           // Width (mm)
  D: number;           // Depth (mm)
  T: number;           // Paper thickness (mm)
  tuckH: number;       // Tuck flap height (mm)
  dustH: number;       // Dust flap height (mm)
  glueW: number;       // Glue flap width (mm)
  bottomH: number;     // Bottom flap height (mm)
  bottomDustH: number; // Bottom dust flap height (mm)
  panels: Record<string, PanelData>;
  foldProgress?: number; // 0 = flat, 1 = fully folded
  onFoldChange?: (progress: number) => void;
}

/* ===================================================================
   Constants
   =================================================================== */

const SCALE = 0.01; // mm → three.js units

// Material colors (kraft paper 느낌)
const BASE_COLOR = '#F5EFE6';
const PANEL_COLORS: Partial<Record<PanelId, string>> = {
  front: '#F5EFE6',
  back: '#EDE7D9',
  left: '#E8E0D0',
  right: '#F0E9DC',
  topLid: '#F7F1E8',
  topTuck: '#F0EAD6',
  topDustL: '#EBE4D4',
  topDustR: '#EBE4D4',
  bottomFlapFront: '#E3DACA',
  bottomFlapBack: '#E3DACA',
  bottomDustL: '#E0D9C7',
  bottomDustR: '#E0D9C7',
  glueFlap: '#DDD6C4',
};

/* ===================================================================
   Utility: Lerp angle
   =================================================================== */

function lerpAngle(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ===================================================================
   Single Panel Mesh
   - PlaneGeometry (width × height)
   - 텍스처 또는 단색 material
   - 엣지 라인 표시
   =================================================================== */

interface PanelMeshProps {
  width: number;    // mm
  height: number;   // mm
  panelId: PanelId;
  texture?: THREE.Texture | null;
  color: string;
  opacity?: number;
}

function PanelMesh({ width, height, panelId, texture, color, opacity = 1.0 }: PanelMeshProps) {
  const w = width * SCALE;
  const h = height * SCALE;

  const material = useMemo(() => {
    if (texture) {
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0.02,
        side: THREE.DoubleSide,
        transparent: opacity < 1,
        opacity,
      });
    }
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.02,
      side: THREE.DoubleSide,
      transparent: opacity < 1,
      opacity,
    });
  }, [texture, color, opacity]);

  const edges = useMemo(() => {
    const geo = new THREE.PlaneGeometry(w, h);
    return new THREE.EdgesGeometry(geo);
  }, [w, h]);

  return (
    <group>
      <mesh material={material} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* 패널 엣지 라인 (접힘선 시각화) */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#C0B8A8" linewidth={1} transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

/* ===================================================================
   Hinge Joint Component
   - 힌지 포인트에서 회전하는 래퍼
   - pivotOffset: 부모 패널의 어느 지점에서 접히는지 (로컬 좌표)
   - foldAxis: 접히는 축 (x, y, z)
   - foldAngle: 접힌 각도 (라디안)
   =================================================================== */

interface HingeJointProps {
  pivotOffset: [number, number, number]; // 부모 로컬 좌표에서 힌지 위치
  foldAxis: 'x' | 'y' | 'z';
  foldAngle: number; // current angle (radians), controlled by foldProgress
  children: React.ReactNode;
}

function HingeJoint({ pivotOffset, foldAxis, foldAngle, children }: HingeJointProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    // 힌지 위치로 이동 → 회전 → 자식은 원점 기준 배치됨
    groupRef.current.position.set(...pivotOffset);
    const rot = groupRef.current.rotation;
    if (foldAxis === 'x') rot.set(foldAngle, 0, 0);
    else if (foldAxis === 'y') rot.set(0, foldAngle, 0);
    else rot.set(0, 0, foldAngle);
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

/* ===================================================================
   FEFCO 0215 Box Assembly
   - 모든 패널을 힌지 계층구조로 조립
   - foldProgress로 전개도 ↔ 완성 박스 전환
   =================================================================== */

interface BoxAssemblyProps {
  L: number; W: number; D: number; T: number;
  tuckH: number; dustH: number; glueW: number;
  bottomH: number; bottomDustH: number;
  textures: Partial<Record<PanelId, THREE.Texture>>;
  foldProgress: number;
}

function BoxAssembly({
  L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH,
  textures, foldProgress,
}: BoxAssemblyProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // 스케일된 치수
  const sL = L * SCALE;
  const sW = W * SCALE;
  const sD = D * SCALE;
  const sT = T * SCALE;
  const sTuck = tuckH * SCALE;
  const sDust = dustH * SCALE;
  const sGlue = glueW * SCALE;
  const sBottom = bottomH * SCALE;
  const sBottomDust = bottomDustH * SCALE;

  // 접기 각도: foldProgress 0→1 에 따라 0→-π/2
  const foldAngle90 = lerpAngle(0, -Math.PI / 2, foldProgress);
  const foldAngle90Pos = lerpAngle(0, Math.PI / 2, foldProgress); // 반대 방향

  // 전체 박스를 중앙에 위치시키기 위한 오프셋 (접혀있을 때)
  const centerOffsetY = foldProgress > 0.5 ? lerpAngle(0, sD / 2, (foldProgress - 0.5) * 2) : 0;

  return (
    <group ref={groupRef} position={[0, centerOffsetY, 0]}>
      {/* ====================================
          FRONT Panel (기준면, 원점 기준)
          - PlaneGeometry: L × D
          - XY 평면에 놓임 (z = 0)
          ==================================== */}
      <group position={[0, 0, 0]}>
        <PanelMesh
          width={L} height={D}
          panelId="front"
          texture={textures.front}
          color={PANEL_COLORS.front || BASE_COLOR}
        />

        {/* ====================================
            LEFT Panel
            - Front의 왼쪽 엣지(-sL/2, 0, 0)에서 Y축 기준 접힘
            ==================================== */}
        <HingeJoint
          pivotOffset={[-sL / 2, 0, 0]}
          foldAxis="y"
          foldAngle={-foldAngle90Pos}
        >
          <group position={[-sW / 2, 0, 0]}>
            <PanelMesh
              width={W} height={D}
              panelId="left"
              texture={textures.left}
              color={PANEL_COLORS.left || BASE_COLOR}
            />

            {/* GLUE FLAP - Left의 왼쪽에서 접힘 */}
            <HingeJoint
              pivotOffset={[-sW / 2, 0, 0]}
              foldAxis="y"
              foldAngle={-foldAngle90Pos}
            >
              <group position={[-sGlue / 2, 0, 0]}>
                <PanelMesh
                  width={glueW} height={D}
                  panelId="glueFlap"
                  texture={textures.glueFlap}
                  color={PANEL_COLORS.glueFlap || BASE_COLOR}
                  opacity={0.8}
                />
              </group>
            </HingeJoint>

            {/* TOP DUST FLAP Left - Left 상단에서 접힘 */}
            <HingeJoint
              pivotOffset={[0, sD / 2, 0]}
              foldAxis="x"
              foldAngle={foldAngle90}
            >
              <group position={[0, sDust / 2, 0]}>
                <PanelMesh
                  width={W} height={dustH}
                  panelId="topDustL"
                  texture={textures.topDustL}
                  color={PANEL_COLORS.topDustL || BASE_COLOR}
                />
              </group>
            </HingeJoint>

            {/* BOTTOM DUST FLAP Left - Left 하단에서 접힘 */}
            <HingeJoint
              pivotOffset={[0, -sD / 2, 0]}
              foldAxis="x"
              foldAngle={-foldAngle90}
            >
              <group position={[0, -sBottomDust / 2, 0]}>
                <PanelMesh
                  width={W} height={bottomDustH}
                  panelId="bottomDustL"
                  texture={textures.bottomDustL}
                  color={PANEL_COLORS.bottomDustL || BASE_COLOR}
                />
              </group>
            </HingeJoint>
          </group>
        </HingeJoint>

        {/* ====================================
            RIGHT Panel (→ Back → Right 순서)
            - Front의 오른쪽 엣지(+sL/2, 0, 0)에서 Y축 기준 접힘
            ==================================== */}
        <HingeJoint
          pivotOffset={[sL / 2, 0, 0]}
          foldAxis="y"
          foldAngle={foldAngle90Pos}
        >
          <group position={[sW / 2, 0, 0]}>
            <PanelMesh
              width={W} height={D}
              panelId="right"
              texture={textures.right}
              color={PANEL_COLORS.right || BASE_COLOR}
            />

            {/* BACK - Right의 오른쪽에서 접힘 */}
            <HingeJoint
              pivotOffset={[sW / 2, 0, 0]}
              foldAxis="y"
              foldAngle={foldAngle90Pos}
            >
              <group position={[sL / 2, 0, 0]}>
                <PanelMesh
                  width={L} height={D}
                  panelId="back"
                  texture={textures.back}
                  color={PANEL_COLORS.back || BASE_COLOR}
                />

                {/* BOTTOM FLAP Back */}
                <HingeJoint
                  pivotOffset={[0, -sD / 2, 0]}
                  foldAxis="x"
                  foldAngle={-foldAngle90}
                >
                  <group position={[0, -sBottom / 2, 0]}>
                    <PanelMesh
                      width={L} height={bottomH}
                      panelId="bottomFlapBack"
                      texture={textures.bottomFlapBack}
                      color={PANEL_COLORS.bottomFlapBack || BASE_COLOR}
                    />
                  </group>
                </HingeJoint>
              </group>
            </HingeJoint>

            {/* TOP DUST FLAP Right - Right 상단에서 접힘 */}
            <HingeJoint
              pivotOffset={[0, sD / 2, 0]}
              foldAxis="x"
              foldAngle={foldAngle90}
            >
              <group position={[0, sDust / 2, 0]}>
                <PanelMesh
                  width={W} height={dustH}
                  panelId="topDustR"
                  texture={textures.topDustR}
                  color={PANEL_COLORS.topDustR || BASE_COLOR}
                />
              </group>
            </HingeJoint>

            {/* BOTTOM DUST FLAP Right - Right 하단에서 접힘 */}
            <HingeJoint
              pivotOffset={[0, -sD / 2, 0]}
              foldAxis="x"
              foldAngle={-foldAngle90}
            >
              <group position={[0, -sBottomDust / 2, 0]}>
                <PanelMesh
                  width={W} height={bottomDustH}
                  panelId="bottomDustR"
                  texture={textures.bottomDustR}
                  color={PANEL_COLORS.bottomDustR || BASE_COLOR}
                />
              </group>
            </HingeJoint>
          </group>
        </HingeJoint>

        {/* ====================================
            TOP LID - Front 상단에서 접힘
            ==================================== */}
        <HingeJoint
          pivotOffset={[0, sD / 2, 0]}
          foldAxis="x"
          foldAngle={foldAngle90}
        >
          <group position={[0, sW / 2, 0]}>
            <PanelMesh
              width={L} height={W}
              panelId="topLid"
              texture={textures.topLid}
              color={PANEL_COLORS.topLid || BASE_COLOR}
            />

            {/* TOP TUCK - TopLid 뒤쪽에서 접힘 */}
            <HingeJoint
              pivotOffset={[0, sW / 2, 0]}
              foldAxis="x"
              foldAngle={foldAngle90}
            >
              <group position={[0, sTuck / 2, 0]}>
                <PanelMesh
                  width={L} height={tuckH}
                  panelId="topTuck"
                  texture={textures.topTuck}
                  color={PANEL_COLORS.topTuck || BASE_COLOR}
                />
              </group>
            </HingeJoint>
          </group>
        </HingeJoint>

        {/* ====================================
            BOTTOM FLAP FRONT - Front 하단에서 접힘
            ==================================== */}
        <HingeJoint
          pivotOffset={[0, -sD / 2, 0]}
          foldAxis="x"
          foldAngle={-foldAngle90}
        >
          <group position={[0, -sBottom / 2, 0]}>
            <PanelMesh
              width={L} height={bottomH}
              panelId="bottomFlapFront"
              texture={textures.bottomFlapFront}
              color={PANEL_COLORS.bottomFlapFront || BASE_COLOR}
            />
          </group>
        </HingeJoint>
      </group>
    </group>
  );
}

/* ===================================================================
   Scene
   =================================================================== */

interface SceneProps extends BoxAssemblyProps {
  autoRotate: boolean;
}

function Scene({ autoRotate, ...assemblyProps }: SceneProps) {
  const maxDim = Math.max(assemblyProps.L, assemblyProps.W, assemblyProps.D) * SCALE;
  const camDist = maxDim * 3.5;
  const controlsRef = useRef<any>(null);

  // 전개도일 때(foldProgress < 0.2) 카메라를 위에서 보도록 조정
  const { camera } = useThree();
  useEffect(() => {
    const isFlatView = assemblyProps.foldProgress < 0.15;
    if (isFlatView) {
      camera.position.set(0, camDist * 1.5, camDist * 0.3);
    } else {
      camera.position.set(camDist * 0.8, camDist * 0.6, camDist * 0.8);
    }
    camera.lookAt(0, 0, 0);
  }, [assemblyProps.foldProgress < 0.15]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />
      <directionalLight position={[0, -2, 5]} intensity={0.15} />

      {/* Box Assembly */}
      <BoxAssembly {...assemblyProps} />

      {/* Contact Shadows (바닥 그림자) */}
      <ContactShadows
        position={[0, -(assemblyProps.D * SCALE) / 2 - 0.02, 0]}
        opacity={0.25}
        scale={maxDim * 6}
        blur={2}
        far={maxDim * 4}
      />

      {/* Grid helper (전개도 모드에서만 표시) */}
      {assemblyProps.foldProgress < 0.3 && (
        <gridHelper
          args={[maxDim * 8, 20, '#E5E7EB', '#F3F4F6']}
          position={[0, -0.001, 0]}
          rotation={[0, 0, 0]}
        />
      )}

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={camDist * 0.3}
        maxDistance={camDist * 3}
        autoRotate={autoRotate && assemblyProps.foldProgress > 0.8}
        autoRotateSpeed={1.5}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI * 0.85}
      />

      {/* Environment */}
      <Environment preset="studio" />
    </>
  );
}

/* ===================================================================
   Texture Loader Hook
   =================================================================== */

function useTextureLoader(
  panels: Record<string, PanelData>,
  panelIds: PanelId[]
): Partial<Record<PanelId, THREE.Texture>> {
  const [textures, setTextures] = useState<Partial<Record<PanelId, THREE.Texture>>>({});
  const loaderRef = useRef(new THREE.TextureLoader());

  // 패널 thumbnail 변경 시 텍스처 업데이트
  const thumbnailKeys = panelIds.map(id => panels[id]?.thumbnail || '').join('|');

  useEffect(() => {
    let cancelled = false;
    const newTextures: Partial<Record<PanelId, THREE.Texture>> = {};
    let pending = 0;

    panelIds.forEach(id => {
      const panel = panels[id];
      if (panel?.thumbnail && panel.thumbnail.length > 10) {
        pending++;
        loaderRef.current.load(
          panel.thumbnail,
          (tex) => {
            if (cancelled) return;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            newTextures[id] = tex;
            pending--;
            if (pending === 0) {
              setTextures(prev => ({ ...prev, ...newTextures }));
            }
          },
          undefined,
          () => {
            pending--;
            if (!cancelled && pending === 0) {
              setTextures(prev => ({ ...prev, ...newTextures }));
            }
          }
        );
      }
    });

    if (pending === 0) {
      // 텍스처 없는 경우 이전 것 유지 or 비우기
    }

    return () => { cancelled = true; };
  }, [thumbnailKeys]);

  return textures;
}

/* ===================================================================
   Main Export Component
   =================================================================== */

const ALL_PANEL_IDS: PanelId[] = [
  'front', 'left', 'back', 'right',
  'topLid', 'topTuck', 'topDustL', 'topDustR',
  'bottomFlapFront', 'bottomFlapBack',
  'bottomDustL', 'bottomDustR',
  'glueFlap',
];

export default function Box3DPreviewAdvanced({
  L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH,
  panels,
  foldProgress: externalFold,
  onFoldChange,
}: Box3DAdvancedProps) {
  const { t } = useI18n();
  const [internalFold, setInternalFold] = useState(1.0); // 기본: 완전 접힘
  const [autoRotate, setAutoRotate] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const animFrameRef = useRef<number>(0);

  const foldProgress = externalFold !== undefined ? externalFold : internalFold;

  const textures = useTextureLoader(panels, ALL_PANEL_IDS);

  // 카메라 계산
  const maxDim = Math.max(L, W, D) * SCALE;
  const camDist = maxDim * 3.5;

  // 디자인 완료된 패널 수
  const designedCount = ALL_PANEL_IDS.filter(id => panels[id]?.designed).length;
  const bodyDesignedCount = (['front', 'back', 'left', 'right'] as PanelId[])
    .filter(id => panels[id]?.designed).length;

  // 접기 슬라이더 핸들러
  const handleFoldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setInternalFold(v);
    onFoldChange?.(v);
  }, [onFoldChange]);

  // 접기 애니메이션 (프리셋 버튼)
  const animateFold = useCallback((target: number, duration = 1200) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const start = foldProgress;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeInOutCubic
      const ease = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const current = start + (target - start) * ease;
      setInternalFold(current);
      onFoldChange?.(current);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [foldProgress, isAnimating, onFoldChange]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      style={{ height: '480px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t('3d.title')}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
            {bodyDesignedCount}/4 {t('3d.faces')}
          </span>
          {designedCount > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">
              +{designedCount - 4} extra
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
              autoRotate
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {autoRotate ? '🔄 Auto' : '⏸ Manual'}
          </button>
          <p className="text-[10px] text-gray-400">{t('3d.hint')}</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                {t('3d.loading')}
              </div>
            </div>
          }
        >
          <Canvas
            shadows
            gl={{
              preserveDrawingBuffer: true,
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
            camera={{
              position: [camDist * 0.8, camDist * 0.6, camDist * 0.8],
              fov: 40,
              near: 0.01,
              far: 100,
            }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <Scene
              L={L} W={W} D={D} T={T}
              tuckH={tuckH} dustH={dustH} glueW={glueW}
              bottomH={bottomH} bottomDustH={bottomDustH}
              textures={textures}
              foldProgress={foldProgress}
              autoRotate={autoRotate}
            />
          </Canvas>
        </Suspense>

        {/* Fold Progress Overlay Label */}
        <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/50 text-white backdrop-blur-sm">
          {foldProgress < 0.1
            ? '📄 Flat (Dieline)'
            : foldProgress < 0.5
            ? '📐 Partially Folded'
            : foldProgress < 0.95
            ? '📦 Almost Done'
            : '✅ Complete Box'}
        </div>
      </div>

      {/* Fold Control Bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* 프리셋 버튼 */}
          <div className="flex gap-1">
            <button
              onClick={() => animateFold(0)}
              disabled={isAnimating}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                foldProgress < 0.05
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Flat dieline view"
            >
              📄 Flat
            </button>
            <button
              onClick={() => animateFold(0.5)}
              disabled={isAnimating}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                foldProgress > 0.4 && foldProgress < 0.6
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Half folded"
            >
              📐 Half
            </button>
            <button
              onClick={() => animateFold(1.0)}
              disabled={isAnimating}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                foldProgress > 0.95
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Complete box"
            >
              📦 Box
            </button>
          </div>

          {/* 슬라이더 */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-6 text-right">
              {Math.round(foldProgress * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={foldProgress}
              onChange={handleFoldChange}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{
                background: `linear-gradient(to right, #2563EB ${foldProgress * 100}%, #E5E7EB ${foldProgress * 100}%)`,
              }}
            />
          </div>

          {/* 치수 표시 */}
          <div className="text-[10px] text-gray-400 whitespace-nowrap">
            {L}×{W}×{D}mm
          </div>
        </div>
      </div>
    </div>
  );
}
