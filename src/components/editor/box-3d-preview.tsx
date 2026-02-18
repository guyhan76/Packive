'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { useI18n } from "@/components/i18n-context";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Box3DPreviewProps {
  L: number;
  W: number;
  D: number;
  panels: Record<string, { json: string | null; thumbnail: string | null; designed: boolean }>;
}

const FACE_COLORS: Record<string, string> = {
  front:           '#F5EFE6',
  back:            '#EDE7D9',
  left:            '#E8E0D0',
  right:           '#F0E9DC',
  topLid:          '#F7F1E8',
  bottomFlapFront: '#E3DACA',
};

const FACE_KEYS = ['front', 'back', 'left', 'right', 'topLid', 'bottomFlapFront'] as const;

function BoxMesh({ L, W, D, panels }: Box3DPreviewProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [loadedTextures, setLoadedTextures] = useState<Record<string, THREE.Texture>>({});

  const scale = 0.01;
  const w = L * scale;
  const h = D * scale;
  const d = W * scale;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    const newTextures: Record<string, THREE.Texture> = {};
    let pending = 0;

    FACE_KEYS.forEach(face => {
      const panel = panels[face];
      if (panel?.thumbnail && typeof panel.thumbnail === 'string' && panel.thumbnail.length > 0) {
        pending++;
        loader.load(
          panel.thumbnail,
          (tex) => {
            if (cancelled) return;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            newTextures[face] = tex;
            pending--;
            if (pending === 0) setLoadedTextures(prev => ({ ...prev, ...newTextures }));
          },
          undefined,
          () => {
            pending--;
            if (!cancelled && pending === 0) setLoadedTextures(prev => ({ ...prev, ...newTextures }));
          }
        );
      }
    });

    if (pending === 0) setLoadedTextures({});
    return () => { cancelled = true; };
  }, [
    ...FACE_KEYS.map(f => panels[f]?.thumbnail ?? ''),
    ...FACE_KEYS.map(f => panels[f]?.designed ?? false),
  ]);

  const materials = useMemo(() => {
    const makeMat = (face: string) => {
      const tex = loadedTextures[face];
      if (tex) {
        return new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.45,
          metalness: 0.05,
        });
      }
      return new THREE.MeshStandardMaterial({
        color: FACE_COLORS[face] || '#F5EFE6',
        roughness: 0.55,
        metalness: 0.05,
      });
    };

    return [
      makeMat('right'),           // +x
      makeMat('left'),            // -x
      makeMat('topLid'),          // +y
      makeMat('bottomFlapFront'), // -y
      makeMat('front'),           // +z
      makeMat('back'),            // -z
    ];
  }, [loadedTextures]);

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[w, h, d]} />
      </mesh>

      {/* 엣지 라인 */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color="#CCCCCC" linewidth={1} />
      </lineSegments>
    </group>
  );
}

function Scene({ L, W, D, panels }: Box3DPreviewProps) {
  const maxDim = Math.max(L, W, D) * 0.01;
  const camDist = maxDim * 2.8;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />

      <BoxMesh L={L} W={W} D={D} panels={panels} />

      {/* 바닥 그림자 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -(D * 0.01) / 2 - 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[maxDim * 3, maxDim * 3]} />
        <shadowMaterial opacity={0.08} />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={camDist * 0.4}
        maxDistance={camDist * 2}
        autoRotate={false}
        target={[0, 0, 0]}
      />
      <Environment preset="studio" />
    </>
  );
}

export default function Box3DPreview({ L, W, D, panels }: Box3DPreviewProps) {
  const { t } = useI18n();
  const maxDim = Math.max(L, W, D) * 0.01;
  const camDist = maxDim * 2.8;
  const designedCount = FACE_KEYS.filter(f => panels[f]?.designed).length;

  return (
    <div
      className="w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border shadow-sm overflow-hidden"
      style={{ height: '380px' }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("3d.title")}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
            {designedCount}/6 {t("3d.faces")}
          </span>
        </div>
        <p className="text-[10px] text-gray-400">{t("3d.hint")}</p>
      </div>
      <Suspense
        fallback={
          <div className="w-full h-[340px] flex items-center justify-center text-gray-400 text-sm">
            {t("3d.loading")}
          </div>
        }
      >
        <Canvas
  shadows
  gl={{ preserveDrawingBuffer: true }}
  camera={{
    position: [camDist * 0.7, camDist * 0.5, camDist * 0.7],
    fov: 45,
  }}
  style={{ height: "340px", background: "transparent" }}
>

          <Scene L={L} W={W} D={D} panels={panels} />
        </Canvas>
      </Suspense>
    </div>
  );
}
