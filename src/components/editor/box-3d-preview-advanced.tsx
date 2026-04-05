'use client';

/**
 * PACKIVE – Advanced 3D Box Preview Engine (v3 – Correct Folding & Texture)
 * =========================================================================
 * React Three Fiber 기반의 FEFCO 0215 패널 접기(Folding) 3D 프리뷰
 *
 * *** 핵심 원리 ***
 * 칼선전개도는 "인쇄면이 위(+Z 방향)를 향한 상태"로 펼쳐져 있다.
 * 박스를 조립할 때, 모든 패널은 전개도 기준으로 "아래(-Z 방향)로" 접힌다.
 * 즉, 접기 후 인쇄면이 박스 바깥을 향하게 된다.
 *
 * *** 전개도 배열 순서 (FEFCO 0215 – full-net-editor.tsx 기준) ***
 *
 *                   TopTuck (L × tuckH)
 *                   TopLid  (L × W)
 *       TopDustL(W×dustH)      TopDustR(W×dustH)
 *  GlueFlap | Front(L×D) | Left(W×D) | Back(L×D) | Right(W×D)
 *       BotDustL(W×dH)      BotDustR(W×dH)
 *       BotFlapFr(L×bH) BotFlapBk(L×bH)
 *
 * 접기 계층 (Front 기준):
 *   Front (기준면, XY 평면, 인쇄면 = +Z)
 *   ├── Left   (Front 오른쪽 엣지에서 Y축 기준 +90° 접힘)
 *   │   └── Back (Left 오른쪽 엣지에서 +90° → 뒤쪽)
 *   │       └── Right (Back 오른쪽 엣지에서 +90° → 왼쪽 원위치로)
 *   │           └── TopDustR, BottomDustR (Right 상/하단)
 *   │       └── BottomFlapBack (Back 하단)
 *   │   └── TopDustL, BottomDustL (Left 상/하단)
 *   ├── GlueFlap (Front 왼쪽 엣지에서 Y축 기준 -90° 접힘)
 *   ├── TopLid   (Front 상단 엣지에서 X축 기준 접힘)
 *   │   └── TopTuck (TopLid 끝에서 접힘)
 *   └── BottomFlapFront (Front 하단 엣지에서 접힘)
 */

import React, {
  useRef, useMemo, useEffect, useState, useCallback, Suspense,
} from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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
  L: number;
  W: number;
  D: number;
  T: number;
  tuckH: number;
  dustH: number;
  glueW: number;
  bottomH: number;
  bottomDustH: number;
  panels: Record<string, PanelData>;
  foldProgress?: number;
  onFoldChange?: (progress: number) => void;
}

/* ===================================================================
   Constants
   =================================================================== */

const SCALE = 0.01;

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
   Utility
   =================================================================== */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ===================================================================
   Single Panel Mesh
   
   PlaneGeometry는 XY 평면에 생성됨 (법선이 +Z).
   인쇄면 = +Z 방향 (front face).
   
   flipU: 텍스처 U를 수평 반전 (좌우 반전)
   flipV: 텍스처 V를 수직 반전 (상하 반전)
   
   전개도에서 패널이 접힐 때, 인쇄면이 항상 바깥쪽을 향하도록
   각 패널의 UV를 적절히 조정해야 한다.
   =================================================================== */

interface PanelMeshProps {
  width: number;
  height: number;
  panelId: PanelId;
  texture?: THREE.Texture | null;
  color: string;
  opacity?: number;
  flipU?: boolean;
  flipV?: boolean;
}

function PanelMesh({ width, height, panelId, texture, color, opacity = 1.0, flipU = false, flipV = false }: PanelMeshProps) {
  const w = width * SCALE;
  const h = height * SCALE;

  // 커스텀 PlaneGeometry with UV flip 지원
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(w, h);
    if (flipU || flipV) {
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        if (flipU) uv.setX(i, 1.0 - uv.getX(i));
        if (flipV) uv.setY(i, 1.0 - uv.getY(i));
      }
      uv.needsUpdate = true;
    }
    return geo;
  }, [w, h, flipU, flipV]);

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
    return new THREE.EdgesGeometry(geometry);
  }, [geometry]);

  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#C0B8A8" linewidth={1} transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

/* ===================================================================
   FEFCO 0215 Box Assembly – CORRECTED FOLDING (v3)
   
   전개도 배열 (인쇄면이 위를 향함, XY 평면에 놓임):
   
   GlueFlap | Front(L) | Left(W) | Back(L) | Right(W)
                                    
   접기 방향 핵심:
   - 전개도에서 우측으로 이어지는 패널은 Y축 기준 +90° 접힘 (아래로)
   - 전개도에서 좌측으로 이어지는 패널은 Y축 기준 -90° 접힘
   - 상단 플랩: X축 기준으로 뒤쪽(-Z)으로 접힘
   - 하단 플랩: X축 기준으로 뒤쪽(-Z)으로 접힘
   
   텍스처 UV 보정:
   - Front: 기준면, 변환 없음
   - Left: Y축으로 90° 회전 후 인쇄면이 바깥(+X)을 향함 → flipU 필요
   - Back: 180° 회전으로 인쇄면이 -Z를 향함 → flipU 필요
   - Right: 270° 회전 → flipU 필요
   - 플랩들: 접힘 후 올바른 방향 유지를 위해 필요 시 flip
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

  // Scaled dimensions
  const sL = L * SCALE;
  const sW = W * SCALE;
  const sD = D * SCALE;
  const sTuck = tuckH * SCALE;
  const sDust = dustH * SCALE;
  const sGlue = glueW * SCALE;
  const sBottom = bottomH * SCALE;
  const sBottomDust = bottomDustH * SCALE;

  // 접기 각도 계산
  // 측면 패널: Y축 기준 +π/2 (전개도에서 아래쪽으로 접힘)
  const fold90 = lerp(0, Math.PI / 2, foldProgress);
  // 측면 패널: Y축 기준 -π/2 (왼쪽 접힘 – GlueFlap)
  const foldNeg90 = lerp(0, -Math.PI / 2, foldProgress);
  // 상단 플랩: X축 기준, 뒤쪽(-Z)으로 접힘 = 양의 X축 회전
  const foldTopFlap = lerp(0, Math.PI / 2, foldProgress);
  // 하단 플랩: X축 기준, 뒤쪽(-Z)으로 접힘 = 음의 X축 회전
  const foldBottomFlap = lerp(0, -Math.PI / 2, foldProgress);
  // TopTuck: TopLid에서 한번 더 접힘 (박스 안쪽으로)
  const foldTuck = lerp(0, Math.PI / 2, foldProgress);

  // 접힘 시 전체 박스 중앙 보정
  const centerOffsetZ = lerp(0, -sW * 0.5, foldProgress);

  return (
    <group ref={groupRef} position={[0, 0, centerOffsetZ]}>
      {/* ============================================================
          FRONT Panel (기준면)
          - 위치: 원점, XY 평면
          - 인쇄면: +Z 방향
          - UV: 변환 없음 (전개도 그대로)
          ============================================================ */}
      <group>
        <PanelMesh
          width={L} height={D}
          panelId="front"
          texture={textures.front}
          color={PANEL_COLORS.front || BASE_COLOR}
        />

        {/* ============================================================
            LEFT Panel (전개도에서 Front 오른쪽에 위치)
            - Hinge: Front 오른쪽 엣지 (+sL/2, 0, 0)
            - 회전: Y축 기준 +90° (전개도 아래쪽으로 접힘)
            - 결과: Left의 인쇄면이 +X 방향 (외부)
            - UV: flipU=true (회전 후 텍스처 좌우 보정)
            ============================================================ */}
        <group position={[sL / 2, 0, 0]}>
          <group rotation={[0, fold90, 0]}>
            <group position={[sW / 2, 0, 0]}>
              <PanelMesh
                width={W} height={D}
                panelId="left"
                texture={textures.left}
                color={PANEL_COLORS.left || BASE_COLOR}
                flipU={true}
              />

              {/* ============================================================
                  BACK Panel (전개도에서 Left 오른쪽)
                  - Hinge: Left 오른쪽 엣지
                  - 추가 Y축 +90° → 총 180°
                  - 결과: Back 인쇄면이 -Z 방향 (뒤쪽 외부)
                  - UV: 변환 없음 (180° 회전 = flipU+flipV = 원래와 동일 방향)
                  ============================================================ */}
              <group position={[sW / 2, 0, 0]}>
                <group rotation={[0, fold90, 0]}>
                  <group position={[sL / 2, 0, 0]}>
                    <PanelMesh
                      width={L} height={D}
                      panelId="back"
                      texture={textures.back}
                      color={PANEL_COLORS.back || BASE_COLOR}
                    />

                    {/* ============================================================
                        RIGHT Panel (전개도에서 Back 오른쪽)
                        - Hinge: Back 오른쪽 엣지
                        - 추가 Y축 +90° → 총 270°
                        - 결과: Right 인쇄면이 -X 방향 (외부)
                        - UV: flipU=true
                        ============================================================ */}
                    <group position={[sL / 2, 0, 0]}>
                      <group rotation={[0, fold90, 0]}>
                        <group position={[sW / 2, 0, 0]}>
                          <PanelMesh
                            width={W} height={D}
                            panelId="right"
                            texture={textures.right}
                            color={PANEL_COLORS.right || BASE_COLOR}
                            flipU={true}
                          />

                          {/* TOP DUST FLAP Right (Right 패널 상단) */}
                          <group position={[0, sD / 2, 0]}>
                            <group rotation={[foldTopFlap, 0, 0]}>
                              <group position={[0, sDust / 2, 0]}>
                                <PanelMesh
                                  width={W} height={dustH}
                                  panelId="topDustR"
                                  texture={textures.topDustR}
                                  color={PANEL_COLORS.topDustR || BASE_COLOR}
                                  flipU={true}
                                />
                              </group>
                            </group>
                          </group>

                          {/* BOTTOM DUST FLAP Right (Right 패널 하단) */}
                          <group position={[0, -sD / 2, 0]}>
                            <group rotation={[foldBottomFlap, 0, 0]}>
                              <group position={[0, -sBottomDust / 2, 0]}>
                                <PanelMesh
                                  width={W} height={bottomDustH}
                                  panelId="bottomDustR"
                                  texture={textures.bottomDustR}
                                  color={PANEL_COLORS.bottomDustR || BASE_COLOR}
                                  flipU={true}
                                />
                              </group>
                            </group>
                          </group>
                        </group>
                      </group>
                    </group>

                    {/* BOTTOM FLAP Back (Back 패널 하단) */}
                    <group position={[0, -sD / 2, 0]}>
                      <group rotation={[foldBottomFlap, 0, 0]}>
                        <group position={[0, -sBottom / 2, 0]}>
                          <PanelMesh
                            width={L} height={bottomH}
                            panelId="bottomFlapBack"
                            texture={textures.bottomFlapBack}
                            color={PANEL_COLORS.bottomFlapBack || BASE_COLOR}
                          />
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>

              {/* TOP DUST FLAP Left (Left 패널 상단) */}
              <group position={[0, sD / 2, 0]}>
                <group rotation={[foldTopFlap, 0, 0]}>
                  <group position={[0, sDust / 2, 0]}>
                    <PanelMesh
                      width={W} height={dustH}
                      panelId="topDustL"
                      texture={textures.topDustL}
                      color={PANEL_COLORS.topDustL || BASE_COLOR}
                      flipU={true}
                    />
                  </group>
                </group>
              </group>

              {/* BOTTOM DUST FLAP Left (Left 패널 하단) */}
              <group position={[0, -sD / 2, 0]}>
                <group rotation={[foldBottomFlap, 0, 0]}>
                  <group position={[0, -sBottomDust / 2, 0]}>
                    <PanelMesh
                      width={W} height={bottomDustH}
                      panelId="bottomDustL"
                      texture={textures.bottomDustL}
                      color={PANEL_COLORS.bottomDustL || BASE_COLOR}
                      flipU={true}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* ============================================================
            GLUE FLAP (전개도에서 Front 왼쪽에 위치)
            - Hinge: Front 왼쪽 엣지 (-sL/2, 0, 0)
            - 회전: Y축 기준 -90° (왼쪽으로 접힘)
            - 결과: GlueFlap이 Right 패널 안쪽에 붙음
            ============================================================ */}
        <group position={[-sL / 2, 0, 0]}>
          <group rotation={[0, foldNeg90, 0]}>
            <group position={[-sGlue / 2, 0, 0]}>
              <PanelMesh
                width={glueW} height={D}
                panelId="glueFlap"
                texture={textures.glueFlap}
                color={PANEL_COLORS.glueFlap || BASE_COLOR}
                opacity={0.7}
                flipU={true}
              />
            </group>
          </group>
        </group>

        {/* ============================================================
            TOP LID (뚜껑)
            - Hinge: Front 상단 엣지 (0, +sD/2, 0)
            - 회전: X축 기준 +90° (뒤쪽으로 접힘, 인쇄면이 위를 향함)
            - 결과: TopLid가 박스 상단을 닫음
            ============================================================ */}
        <group position={[0, sD / 2, 0]}>
          <group rotation={[foldTopFlap, 0, 0]}>
            <group position={[0, sW / 2, 0]}>
              <PanelMesh
                width={L} height={W}
                panelId="topLid"
                texture={textures.topLid}
                color={PANEL_COLORS.topLid || BASE_COLOR}
              />

              {/* TOP TUCK (TopLid 끝에서 박스 안쪽으로 접힘) */}
              <group position={[0, sW / 2, 0]}>
                <group rotation={[foldTuck, 0, 0]}>
                  <group position={[0, sTuck / 2, 0]}>
                    <PanelMesh
                      width={L} height={tuckH}
                      panelId="topTuck"
                      texture={textures.topTuck}
                      color={PANEL_COLORS.topTuck || BASE_COLOR}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* ============================================================
            BOTTOM FLAP FRONT
            - Hinge: Front 하단 엣지 (0, -sD/2, 0)
            - 회전: X축 기준 -90° (뒤쪽으로 접힘)
            ============================================================ */}
        <group position={[0, -sD / 2, 0]}>
          <group rotation={[foldBottomFlap, 0, 0]}>
            <group position={[0, -sBottom / 2, 0]}>
              <PanelMesh
                width={L} height={bottomH}
                panelId="bottomFlapFront"
                texture={textures.bottomFlapFront}
                color={PANEL_COLORS.bottomFlapFront || BASE_COLOR}
              />
            </group>
          </group>
        </group>
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
  const totalFlatW = (assemblyProps.glueW + assemblyProps.L + assemblyProps.W + assemblyProps.L + assemblyProps.W) * SCALE;
  const camDist = Math.max(maxDim * 3.5, totalFlatW * 1.2);
  const controlsRef = useRef<any>(null);

  const { camera } = useThree();
  const prevFlat = useRef(assemblyProps.foldProgress < 0.15);

  useEffect(() => {
    const isFlatView = assemblyProps.foldProgress < 0.15;
    if (isFlatView !== prevFlat.current) {
      prevFlat.current = isFlatView;
      if (isFlatView) {
        // 전개도 뷰: 위에서 바라봄
        camera.position.set(totalFlatW * 0.3, camDist * 2, camDist * 0.3);
      } else {
        // 박스 뷰: 대각선에서 바라봄
        camera.position.set(camDist * 0.8, camDist * 0.6, camDist * 0.8);
      }
      camera.lookAt(0, 0, 0);
    }
  }, [assemblyProps.foldProgress, camDist, camera, totalFlatW]);

  return (
    <>
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

      <BoxAssembly {...assemblyProps} />

      <ContactShadows
        position={[0, -(assemblyProps.D * SCALE) / 2 - 0.02, 0]}
        opacity={0.25}
        scale={Math.max(maxDim, totalFlatW) * 6}
        blur={2}
        far={Math.max(maxDim, totalFlatW) * 4}
      />

      {assemblyProps.foldProgress < 0.3 && (
        <gridHelper
          args={[Math.max(maxDim, totalFlatW) * 10, 20, '#E5E7EB', '#F3F4F6']}
          position={[0, -0.001, 0]}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={camDist * 0.2}
        maxDistance={camDist * 4}
        autoRotate={autoRotate && assemblyProps.foldProgress > 0.8}
        autoRotateSpeed={1.5}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI * 0.85}
      />

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
  const [internalFold, setInternalFold] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const animFrameRef = useRef<number>(0);

  const foldProgress = externalFold !== undefined ? externalFold : internalFold;
  const textures = useTextureLoader(panels, ALL_PANEL_IDS);

  const maxDim = Math.max(L, W, D) * SCALE;
  const totalFlatW = (glueW + L + W + L + W) * SCALE;
  const camDist = Math.max(maxDim * 3.5, totalFlatW * 1.2);

  const designedCount = ALL_PANEL_IDS.filter(id => panels[id]?.designed).length;
  const bodyDesignedCount = (['front', 'back', 'left', 'right'] as PanelId[])
    .filter(id => panels[id]?.designed).length;

  const handleFoldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setInternalFold(v);
    onFoldChange?.(v);
  }, [onFoldChange]);

  const animateFold = useCallback((target: number, duration = 1200) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const start = foldProgress;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
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
      style={{ height: '480px', position: 'relative', zIndex: 0 }}
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
              autoRotate ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
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
            style={{ width: '100%', height: '100%', background: 'transparent', pointerEvents: 'auto' }}
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

        {/* Fold Progress Overlay – pointer-events:none so it doesn't block 3D interaction */}
        <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/50 text-white backdrop-blur-sm pointer-events-none">
          {foldProgress < 0.1 ? '📄 Flat (Dieline)'
            : foldProgress < 0.5 ? '📐 Partially Folded'
            : foldProgress < 0.95 ? '📦 Almost Done'
            : '✅ Complete Box'}
        </div>
      </div>

      {/* Fold Control Bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => animateFold(0)} disabled={isAnimating}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                foldProgress < 0.05 ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`} title="Flat dieline view">
              📄 Flat
            </button>
            <button onClick={() => animateFold(0.5)} disabled={isAnimating}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                foldProgress > 0.4 && foldProgress < 0.6 ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`} title="Half folded">
              📐 Half
            </button>
            <button onClick={() => animateFold(1.0)} disabled={isAnimating}
              className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                foldProgress > 0.95 ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`} title="Complete box">
              📦 Box
            </button>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-6 text-right">
              {Math.round(foldProgress * 100)}%
            </span>
            <input
              type="range" min={0} max={1} step={0.01}
              value={foldProgress} onChange={handleFoldChange}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{ background: `linear-gradient(to right, #2563EB ${foldProgress * 100}%, #E5E7EB ${foldProgress * 100}%)` }}
            />
          </div>

          <div className="text-[10px] text-gray-400 whitespace-nowrap">
            {L}×{W}×{D}mm
          </div>
        </div>
      </div>
    </div>
  );
}
