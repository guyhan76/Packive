"use client";
import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const UnifiedEditor = dynamic(
  () => import("@/components/editor/unified-editor"),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-screen text-gray-400">Loading Unified Editor...</div> }
);

function Inner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // If no boxType param, enter blank canvas mode
  const hasBoxType = searchParams.has("boxType");
  const L = Number(searchParams.get("L")) || (hasBoxType ? 120 : 0);
  const W = Number(searchParams.get("W")) || (hasBoxType ? 60 : 0);
  const D = Number(searchParams.get("D")) || (hasBoxType ? 160 : 0);
  const material = searchParams.get("material") || "white-350";
  const boxType = searchParams.get("boxType") || "";

  return (
    <UnifiedEditor
      L={L} W={W} D={D}
      material={material}
      boxType={boxType}
      onBack={() => router.push("/editor/new")}
    />
  );
}

export default function UnifiedEditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>}>
      <Inner />
    </Suspense>
  );
}
