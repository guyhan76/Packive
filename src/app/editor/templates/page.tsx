'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Crown, Paintbrush } from 'lucide-react'
import { TEMPLATE_CATEGORIES, DESIGN_TEMPLATES, getTemplatesByCategory } from '@/lib/templates'
import type { DesignTemplate } from '@/lib/templates'

function TemplatesInner() {
  const searchParams = useSearchParams()
  const boxType = searchParams.get('boxType') || 'fefco-0215'
  const L = searchParams.get('L') || '120'
  const W = searchParams.get('W') || '60'
  const D = searchParams.get('D') || '160'
  const mat = searchParams.get('material') || 'white-350'
  const previewUrl = searchParams.get('previewUrl') || ''

  const [activeCategory, setActiveCategory] = useState('all')
  const templates = getTemplatesByCategory(activeCategory)

  const buildEditorUrl = (templateId?: string) => {
    const p = new URLSearchParams({ boxType, L, W, D, material: mat, previewUrl })
    if (templateId) p.set('templateId', templateId)
    return `/editor/design?${p.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Choose a Design Template</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {boxType.toUpperCase()} | {L}x{W}x{D}mm | {mat}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/editor/new`}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Die-Cut
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-500">
              <Link href={buildEditorUrl()}>
                <Paintbrush className="w-4 h-4 mr-1" /> Start from Scratch
              </Link>
            </Button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <span className="mr-1">{cat.icon}</span>{cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Template Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <TemplateCard key={t.id} template={t} href={buildEditorUrl(t.id)} />
          ))}
        </div>
        {templates.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No templates in this category yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function TemplateCard({ template, href }: { template: DesignTemplate; href: string }) {
  const bgElement = template.elements.find(e => e.panel === 'panel2' && e.type === 'rect' && e.locked)
  const bgColor = bgElement?.fill || '#f5f5f5'
  const titleElement = template.elements.find(e => e.panel === 'panel2' && e.type === 'text' && e.editable && e.fontSize && e.fontSize >= 18)
  const titleColor = titleElement?.fill || '#333'

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#2563EB]/40 transition-all duration-200">
        {/* Preview */}
        <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: bgColor }}>
          {/* Simulate template layout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-2">
            {titleElement && (
              <span style={{ color: titleColor, fontFamily: titleElement.fontFamily, fontWeight: titleElement.fontWeight as any }}
                className="text-lg tracking-wide">{titleElement.text}</span>
            )}
            <div className="w-16 h-12 rounded border-2 border-dashed opacity-30" style={{ borderColor: titleColor }} />
            <span style={{ color: titleColor }} className="text-xs opacity-50">
              {template.subcategory}
            </span>
          </div>
          {/* Color swatches */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {template.colors.slice(0, 5).map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          {/* Premium badge */}
          {template.isPremium && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              <Crown className="w-3 h-3" /> PRO
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#2563EB]/0 group-hover:bg-[#2563EB]/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white text-[#2563EB] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-1">
              Use Template <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              template.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>{template.isPremium ? 'Pro' : 'Free'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{template.subcategory}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{template.description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-400">Loading templates...</p></div>}>
      <TemplatesInner />
    </Suspense>
  )
}
