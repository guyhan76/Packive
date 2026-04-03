'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

export interface FaceTexture {
  face: string;
  dataUrl: string | null;
}

interface MockupModalProps {
  open: boolean;
  onClose: () => void;
  faceTextures: FaceTexture[];
  L: number;
  W: number;
  D: number;
}

const FACE_ORDER = ['right', 'left', 'top', 'bottom', 'front', 'back'];
const FACE_COLORS: Record<string, string> = {
  right: '#F0E9DC', left: '#E8E0D0', top: '#F7F1E8',
  bottom: '#E3DACA', front: '#F5EFE6', back: '#EDE7D9',
};

function BoxMesh({ L, W, D, faceTextures }: { L: number; W: number; D: number; faceTextures: FaceTexture[] }) {
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
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        newMap.set(ft.face, tex);
        loaded++;
        if (loaded === total) setTexMap(new Map(newMap));
      });
    });
  }, [faceTextures]);

  const materials = useMemo(() => {
    const base = { roughness: 0.55, metalness: 0.05 };
    const makeMat = (face: string) => {
      const faceTex = texMap.get(face);
      if (faceTex) {
        return new THREE.MeshStandardMaterial({ map: faceTex, ...base });
      }
      return new THREE.MeshStandardMaterial({ color: FACE_COLORS[face] || '#EEE', ...base });
    };
    return FACE_ORDER.map(f => makeMat(f));
  }, [texMap]);

  return (
    <group>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color="#CCCCCC" linewidth={1} />
      </lineSegments>
    </group>
  );
}

export default function Box3DMockupModal({ open, onClose, faceTextures, L, W, D }: MockupModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  if (!open) return null;

  const maxDim = Math.max(L, W, D) * 0.01;
  const camDist = maxDim * 2.8;

  const handleDownload = () => {
    const el = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!el) return;
    const a = document.createElement('a');
    a.href = el.toDataURL('image/png');
    a.download = `packive-3d-mockup-${L}x${W}x${D}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-w-[90vw] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-800">3D Mockup Preview</h2>
            <p className="text-[10px] text-gray-400">{L} x {W} x {D} mm</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="px-3 py-1.5 text-[11px] font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Download PNG
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg">
              X
            </button>
          </div>
        </div>
        <div ref={canvasRef} className="bg-gradient-to-b from-gray-50 to-gray-100" style={{ height: '480px' }}>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading 3D...</div>}>
            <Canvas
              shadows
              gl={{ preserveDrawingBuffer: true, antialias: true }}
              camera={{ position: [camDist * 0.7, camDist * 0.5, camDist * 0.7], fov: 45 }}
              style={{ height: '480px', background: 'transparent' }}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow />
              <directionalLight position={[-3, 4, -3]} intensity={0.3} />
              <BoxMesh L={L} W={W} D={D} faceTextures={faceTextures} />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(D * 0.01) / 2 - 0.01, 0]} receiveShadow>
                <planeGeometry args={[maxDim * 3, maxDim * 3]} />
                <shadowMaterial opacity={0.08} />
              </mesh>
              <OrbitControls enablePan={false} enableZoom={true} minDistance={camDist * 0.4} maxDistance={camDist * 2} autoRotate={false} target={[0, 0, 0]} />
              <Environment preset="studio" />
            </Canvas>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
