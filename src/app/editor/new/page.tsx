'use client'

import { useState } from 'react'
import { useI18n, LanguageSelector } from '@/components/i18n-context'
import { BoxTypeSelector } from '@/components/editor/box-type-selector'
import { DimensionForm } from '@/components/editor/dimension-form'
import { DiecutCanvas } from '@/components/editor/diecut-canvas'
import { getDielinePreviewUrl, mmToPoints } from '@/lib/dieline-api'
import type { MaterialSpec } from '@/lib/diecut-engines/materials'
import { ArrowLeft, Paintbrush } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// FEFCO code mapping for Boxshot API
const FEFCO_API_MAP: Record<string, string> = {
  'fefco-0215': 'fefco-0215',
  'fefco-0201': 'fefco-0201',
  'fefco-0427': 'fefco-0427',
  'fefco-0301': 'fefco-0300',
  'ecma-a20': 'ecma-a0010',
}

export default function EditorNewPage() {
  const { t } = useI18n()
  const [selectedBoxType, setSelectedBoxType] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number; depth: number } | undefined>()
  const [materialId, setMaterialId] = useState<string>('white-350')

  const handleGenerate = (length: number, width: number, depth: number, material: MaterialSpec) => {
    if (!selectedBoxType) return

    setIsLoading(true)

    const apiId = FEFCO_API_MAP[selectedBoxType]
    if (!apiId) {
      setIsLoading(false)
      return
    }

    const params: Record<string, string | number> = {
      'Height': mmToPoints(depth),
      'Width': mmToPoints(length),
      'Depth': mmToPoints(width),
      'Paper Thickness': mmToPoints(material.paperThickness),
      'Tuck Flap': mmToPoints(material.tuckLength),
      'Glue Flap': mmToPoints(material.glueFlap),
      'Snap Lock Length': 0,
      'Top Panel': 'Auto',
    }

    const url = getDielinePreviewUrl(apiId, params)
    setPreviewUrl(url)
    setDimensions({ width: length, height: width, depth })
    setMaterialId(material.id)
    setIsLoading(false)
  }

  // Build design editor URL
  const getDesignUrl = () => {
    if (!previewUrl || !dimensions || !selectedBoxType) return '#'
    const params = new URLSearchParams({
      boxType: selectedBoxType,
      L: String(dimensions.width),
      W: String(dimensions.height),
      D: String(dimensions.depth),
      material: materialId,
      previewUrl: previewUrl,
    })
    return `/editor/design?${params.toString()}`
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-4">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t("new.back")}</span>
        </Link>
        <div className="h-6 w-px bg-gray-200" />
        <h1 className="text-sm font-semibold text-gray-900">
          {t("new.title")}
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">{t("new.powered")}</span>
          <LanguageSelector />
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-80 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-6">
          <BoxTypeSelector
            selectedType={selectedBoxType}
            onSelect={setSelectedBoxType}
          />
          {selectedBoxType && (
            <DimensionForm
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          )}

          {/* {t("new.startDesigning")} button */}
          {previewUrl && (
            <div className="pt-2 border-t border-gray-100">
              <Button
                asChild
                className="w-full h-11 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-semibold rounded-xl gap-2"
              >
                <Link href={getDesignUrl()}>
                  <Paintbrush className="w-4 h-4" />
                  {t("new.startDesigning")}
                </Link>
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                {t("new.designDesc")}
              </p>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <main className="flex-1 p-4">
          <DiecutCanvas
            previewUrl={previewUrl}
            isLoading={isLoading}
            dimensions={dimensions}
          />
        </main>
      </div>
    </div>
  )
}
