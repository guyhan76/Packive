'use client'

import { useI18n } from '@/components/i18n-context'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MATERIALS } from '@/lib/diecut-engines/materials'
import type { MaterialSpec } from '@/lib/diecut-engines/materials'
import { Ruler, RotateCcw } from 'lucide-react'

interface DimensionFormProps {
  onGenerate: (length: number, width: number, depth: number, material: MaterialSpec) => void
  isLoading: boolean
}

export function DimensionForm({ onGenerate, isLoading }: DimensionFormProps) {
  const { t } = useI18n()
  const [length, setLength] = useState<string>('120')
  const [width, setWidth] = useState<string>('60')
  const [depth, setDepth] = useState<string>('160')
  const [materialId, setMaterialId] = useState<string>('white-350')

  const selectedMaterial = MATERIALS.find(m => m.id === materialId) || MATERIALS[0]

  const handleGenerate = () => {
    const l = parseFloat(length)
    const w = parseFloat(width)
    const d = parseFloat(depth)
    if (l > 0 && w > 0 && d > 0) {
      onGenerate(l, w, d, selectedMaterial)
    }
  }

  const handleReset = () => {
    setLength('120')
    setWidth('60')
    setDepth('160')
    setMaterialId('white-350')
  }

  const whiteCards = MATERIALS.filter(m => m.category === 'white-cardboard')
  const kraftCards = MATERIALS.filter(m => m.category === 'kraft-paperboard')
  const singleFlute = MATERIALS.filter(m => m.category === 'single-flute')
  const doubleFlute = MATERIALS.filter(m => m.category === 'double-flute')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-[#2563EB]" />
        {t("new.setDimensions")}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t("new.length")}</label>
          <Input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="120" min="10" max="2000" className="h-10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t("new.width")}</label>
          <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="60" min="10" max="2000" className="h-10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t("new.depth")}</label>
          <Input type="number" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="160" min="10" max="1000" className="h-10" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t("new.material")}</label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          >
            <optgroup label={t("new.whiteCardboard")}>
              {whiteCards.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
            <optgroup label={t("new.kraftPaperboard")}>
              {kraftCards.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
            <optgroup label={t("new.singleFlute")}>
              {singleFlute.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
            <optgroup label={t("new.doubleFlute")}>
              {doubleFlute.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>{t("new.paperThickness")}</span>
            <span className="font-medium text-gray-700">{selectedMaterial.paperThickness} mm</span>
          </div>
          <div className="flex justify-between">
            <span>{t("new.glueFlap")}</span>
            <span className="font-medium text-gray-700">{selectedMaterial.glueFlap} mm</span>
          </div>
          <div className="flex justify-between">
            <span>{t("new.tuckLength")}</span>
            <span className="font-medium text-gray-700">{selectedMaterial.tuckLength} mm</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex-1 h-11 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl"
        >
          {isLoading ? t('new.generating') : t('new.generateDieCut')}
        </Button>
        <Button onClick={handleReset} variant="outline" className="h-11 px-3 rounded-xl">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
