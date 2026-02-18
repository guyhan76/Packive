'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, MousePointer } from 'lucide-react'

interface OverviewModeProps {
  previewUrl: string
  dimensions: { L: number; W: number; D: number }
  thumbnails: Record<string, string | null>
  designed: Record<string, boolean>
  onPanelClick: (panelId: string) => void
}

export function OverviewMode({ previewUrl, dimensions, thumbnails, designed, onPanelClick }: OverviewModeProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const { L, W } = dimensions
  const totalW = 15 + L + W + L + W
  const gfPct = (15 / totalW) * 100
  const lPct = (L / totalW) * 100
  const wPct = (W / totalW) * 100

  const panels = [
    { id: 'panel1', label: 'Left Side', sizeMm: `${L}mm`, star: false },
    { id: 'panel2', label: 'Front', sizeMm: `${W}mm`, star: true },
    { id: 'panel3', label: 'Right Side', sizeMm: `${L}mm`, star: false },
    { id: 'panel4', label: 'Back', sizeMm: `${W}mm`, star: false },
  ]
  const panelWidths = [lPct, wPct, lPct, wPct]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Dieline image with overlays */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 bg-gray-100 overflow-auto">
        <div className="relative inline-block">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Die-cut template"
              onLoad={() => setImgLoaded(true)}
              className="block max-w-full max-h-[65vh] object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          ) : (
            <div className="w-[600px] h-[350px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Generate a die-cut template first
            </div>
          )}

          {/* Panel overlays (positioned over image) */}
          {imgLoaded && panels.map((p, i) => {
            let left = gfPct + 1
            for (let j = 0; j < i; j++) left += panelWidths[j]

            const isDes = designed[p.id]
            const isHov = hovered === p.id
            const thumb = thumbnails[p.id]

            return (
              <button
                key={p.id}
                onClick={() => onPanelClick(p.id)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                className="absolute transition-all duration-150 cursor-pointer overflow-hidden"
                style={{
                  left: `${left}%`,
                  top: '28%',
                  width: `${panelWidths[i]}%`,
                  height: '44%',
                  backgroundColor: isHov ? 'rgba(37,99,235,0.2)' : isDes ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.05)',
                  border: isHov ? '2px solid #2563EB' : isDes ? '1.5px solid rgba(37,99,235,0.4)' : '1px dashed rgba(0,0,0,0.2)',
                  borderRadius: '2px',
                }}
              >
                {thumb && thumb.length > 20 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  {isDes ? (
                    <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center shadow">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <MousePointer className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-[10px] font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded shadow-sm">
                    {p.label} {p.star ? '★' : ''}
                  </span>
                  <span className="text-[9px] text-gray-500 bg-white/80 px-1 rounded">{p.sizeMm}</span>
                  {!isDes && <span className="text-[8px] text-blue-500 font-medium">Click to design</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom indicators */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {panels.map(p => {
            const isDes = designed[p.id]
            return (
              <button key={p.id} onClick={() => onPanelClick(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isDes ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {isDes ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 inline-block" />}
                {p.label} {p.star ? '★' : ''}
              </button>
            )
          })}
          <span className="ml-3 text-xs text-gray-400">{Object.values(designed).filter(Boolean).length}/4 panels</span>
        </div>
      </div>
    </div>
  )
}
