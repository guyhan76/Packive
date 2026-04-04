'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ───── types ───── */
export interface FaceTexture {
  face: string;
  dataUrl: string | null;
}

type BoxMaterial = 'white' | 'kraft';

interface MockupModalProps {
  open: boolean;
  onClose: () => void;
  faceTextures: FaceTexture[];
  L: number;
  W: number;
  D: number;
}

/* ───── constants ───── */
const FACE_ORDER = ['right', 'left', 'top', 'bottom', 'front', 'back'];

const MAT_PRESETS: Record<BoxMaterial, { color: string; roughness: number; metalness: number }> = {
  white: { color: '#FFFFFF', roughness: 0.4, metalness: 0.0 },
  kraft: { color: '#C4A56A', roughness: 0.75, metalness: 0.0 },
};

/* ───── BoxMesh ───── */
function BoxMesh({
  L, W, D, faceTextures, material
}: {
  L: number; W: number; D: number;
  faceTextures: FaceTexture[];
  material: BoxMaterial;
}) {
  const scale = 0.01;
  const w = L * scale;
  const h = D * scale;
  const d = W * scale;

  const [texMap, setTexMap] = useState<Map<string, THREE.Texture>>(new Map());

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const newMap = new Map<string, THREE.Texture>();
    let loaded = 0;
    const validFaces = faceTextures.filter(f => f.dataUrl);
    const total = validFaces.length;
    if (total === 0) { setTexMap(new Map()); return; }

    validFaces.forEach(ft => {
      if (!ft.dataUrl) return;
      loader.load(ft.dataUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 8;
        tex.generateMipmaps = true;
        tex.needsUpdate = true;
        newMap.set(ft.face, tex);
        loaded++;
        if (loaded === total) setTexMap(new Map(newMap));
      });
    });
  }, [faceTextures]);

   const materials = useMemo(() => {
    const ms = MAT_PRESETS[material];
    const isKraft = material === 'kraft';

    return FACE_ORDER.map(face => {
      const faceTex = texMap.get(face);
      if (faceTex) {
        if (isKraft) {
          // Kraft + 텍스처: 크라프트 갈색 위에 텍스처를 곱하기 블렌딩
          // Canvas로 갈색 틴트 합성
          const canvas = document.createElement('canvas');
          const img = faceTex.image as HTMLImageElement | HTMLCanvasElement;
          canvas.width = img.width || 512;
          canvas.height = img.height || 512;
          const ctx = canvas.getContext('2d')!;
          // 1) 크라프트 갈색 배경
          ctx.fillStyle = '#C4A56A';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // 2) 텍스처를 multiply로 합성
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // 3) 텍스처의 디테일 보존
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const blended = new THREE.CanvasTexture(canvas);
          blended.colorSpace = THREE.SRGBColorSpace;
          blended.needsUpdate = true;
          const mat = new THREE.MeshBasicMaterial({ map: blended });
          mat.toneMapped = false;
          return mat;
        } else {
          // White + 텍스처: 원본 그대로
          const mat = new THREE.MeshBasicMaterial({ map: faceTex });
          mat.toneMapped = false;
          return mat;
        }
      }
      // 빈 면: 재질색
      const mat2 = new THREE.MeshBasicMaterial({ color: ms.color });
      mat2.toneMapped = false;
      return mat2;
    });
  }, [texMap, material]);


  const geometry = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);

  return (
    <group>
      <mesh castShadow receiveShadow geometry={geometry} material={materials} />
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial
          color={material === 'kraft' ? '#A08050' : '#CCCCCC'}
          linewidth={1}
          transparent
          opacity={0.5}
        />
      </lineSegments>
    </group>
  );
}

/* ───── Canvas capture ───── */
function CanvasCapture({ onCapture }: { onCapture: (fn: () => string | null) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onCapture(() => {
      try { return gl.domElement.toDataURL('image/png'); }
      catch { return null; }
    });
  }, [gl, onCapture]);
  return null;
}

/* ───── Main Modal ───── */
export default function Box3DMockupModal({ open, onClose, faceTextures, L, W, D }: MockupModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<(() => string | null) | null>(null);
  const [boxMaterial, setBoxMaterial] = useState<BoxMaterial>('white');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Canvas 마운트 딜레이 — Context Lost 방지
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [open]);

  const onCapture = useCallback((fn: () => string | null) => {
    captureRef.current = fn;
  }, []);

  if (!open) return null;

  const maxDim = Math.max(L, W, D) * 0.01;
  const camDist = maxDim * 2.8;

  const handleDownload = () => {
    if (aiImage) {
      const a = document.createElement('a');
      a.href = aiImage;
      a.download = `packive-ai-mockup-${L}x${W}x${D}.png`;
      a.click();
      return;
    }
    const el = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!el) return;
    const a = document.createElement('a');
    a.href = el.toDataURL('image/png');
    a.download = `packive-3d-mockup-${L}x${W}x${D}.png`;
    a.click();
  };

  const handleAIEnhance = async () => {
    const dataUrl = captureRef.current?.();
    if (!dataUrl) { alert('Cannot capture 3D render'); return; }
    setAiLoading(true);
    setAiImage(null);
    try {
      const res = await fetch('/api/ai-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          L, W, D,
          boxType: 'FEFCO 0201',
          mode: 'enhance',
          material: boxMaterial,
        }),
      });
      const data = await res.json();
      if (data.image) setAiImage(data.image);
      else alert('AI enhance failed: ' + (data.error || 'Unknown'));
    } catch (err: any) {
      alert('AI enhance error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-w-[92vw] overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-800">3D Mockup Preview</h2>
            <p className="text-[10px] text-gray-400">{L} x {W} x {D} mm</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => { setBoxMaterial('white');}}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                  boxMaterial === 'white' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white border border-gray-300 mr-1 align-middle" />
                White
              </button>
              <button
                onClick={() => { setBoxMaterial('kraft');}}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                  boxMaterial === 'kraft' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: '#C4A66A' }} />
                Kraft
              </button>
            </div>

            <button onClick={handleAIEnhance} disabled={aiLoading}
              className="px-3 py-1.5 text-[11px] font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">
              {aiLoading ? 'Enhancing...' : 'AI Enhance'}
            </button>
            <button onClick={handleDownload}
              className="px-3 py-1.5 text-[11px] font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Download PNG
            </button>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg">
              X
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div ref={canvasRef} className="relative bg-gradient-to-b from-gray-100 to-gray-200" style={{ height: '520px' }}>

          {aiImage && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
              <img src={aiImage} alt="AI Enhanced Mockup" className="max-w-full max-h-full object-contain" />
              <button onClick={() => setAiImage(null)}
                className="absolute top-3 right-3 px-2 py-1 text-[10px] bg-white/80 rounded-lg hover:bg-white shadow transition">
                Back to 3D
              </button>
            </div>
          )}

          {mounted ? (
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading 3D...</div>}>
              <Canvas
                shadows
                gl={{
                  preserveDrawingBuffer: true,
                  antialias: true,
                  toneMapping: THREE.NoToneMapping,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}
                camera={{
                  position: [camDist * 0.7, camDist * 0.5, camDist * 0.7],
                  fov: 40,
                  near: 0.01,
                  far: 100,
                }}
                style={{ height: '520px', background: 'transparent' }}
                onCreated={({ gl }) => {
                  gl.setClearColor(0x000000, 0);
                }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight
                  position={[4, 6, 5]}
                  intensity={0.7}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-bias={-0.0002}
                />
                <directionalLight position={[-3, 3, -4]} intensity={0.3} />

                <BoxMesh L={L} W={W} D={D} faceTextures={faceTextures} material={boxMaterial} />

                <ContactShadows
                  position={[0, -(D * 0.01) / 2 - 0.002, 0]}
                  opacity={0.3}
                  scale={maxDim * 4}
                  blur={2.5}
                  far={maxDim * 2}
                />

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={camDist * 0.4}
                  maxDistance={camDist * 2}
                  autoRotate={false}
                  target={[0, 0, 0]}
                  enableDamping
                  dampingFactor={0.08}
                />

                <Environment preset="studio" />
                <CanvasCapture onCapture={onCapture} />
              </Canvas>
            </Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading 3D...</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[9px] text-gray-400">
            Material: {boxMaterial === 'white' ? 'White Coated Cardboard' : 'Brown Kraft Cardboard'}
          </p>
          <p className="text-[9px] text-gray-400">
            Drag to rotate | Scroll to zoom{aiImage ? ' | AI Enhanced' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
