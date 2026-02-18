'use client'

import { useState } from 'react'
import { Package, Loader2 } from 'lucide-react'

interface DiecutCanvasProps {
  previewUrl: string | null
  isLoading: boolean
  dimensions?: { width: number; height: number; depth: number }
}

export function DiecutCanvas({ previewUrl, isLoading, dimensions }: DiecutCanvasProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative flex-1 bg-[#1a1a2e] rounded-xl border border-gray-700 overflow-hidden">
      <div className="w-full h-full min-h-[500px] flex items-center justify-center p-8">
        {isLoading ? (
          <div className="text-center text-gray-400">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
            <p className="text-sm">Generating die-cut template...</p>
          </div>
        ) : previewUrl && !imgError ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="FEFCO Die-Cut Template"
                className="max-w-full max-h-full object-contain"
                onError={() => setImgError(true)}
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            {dimensions && (
              <div className="mt-4 flex justify-between items-center px-2">
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0 border-t-2 border-red-500 inline-block"></span>
                    Cut Line
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: '#00AA00' }}></span>
                    Fold Line
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  L:{dimensions.width} x W:{dimensions.height} x D:{dimensions.depth} mm
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-400">Select a box type and enter dimensions</p>
            <p className="text-sm mt-1 text-gray-600">Die-cut template will appear here</p>
            {imgError && (
              <p className="text-sm mt-3 text-red-400">Failed to load preview. Please try different dimensions.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
