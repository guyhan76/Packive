'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Type, Square, Circle as CircleIcon, Image as ImageIcon,
  Palette, ChevronUp, ChevronDown, Trash2, Undo2, Redo2,
  Sparkles, FileText, ShieldCheck, Loader2, Plus, Copy,
  AlertTriangle, AlertCircle, Info, Lightbulb,
  AlignLeft, AlignCenter, AlignRight,
   
} from 'lucide-react'

// ============================================================
// Types
// ============================================================
interface DesignEditorProps {
  previewUrl: string
  boxType: string
  dimensions: { L: number; W: number; D: number }
  material: string
  templateId?: string
}

interface GeneratedDesign { url: string; prompt: string }
interface ExtractedColor { hex: string; name: string }
interface CopyData { headline: string; description: string; slogan: string; features: string[]; backPanel: string }
interface ReviewIssue { type: string; severity: 'critical' | 'warning' | 'info'; description: string; suggestion: string }
interface ReviewData { score: number; issues: ReviewIssue[]; summary: string; materialNotes?: string }

type ActiveTab = 'inspiration' | 'copy' | 'review'

const DIELINE_NAME = '__dieline_bg__'

const FONT_SIZE_MAP: Record<string, number> = {
  Headline: 24, Description: 14, Slogan: 18, Feature: 12, 'Back Panel': 10,
}

const CATEGORIES = ['Cosmetics', 'Food & Beverage', 'Electronics', 'Fashion', 'Health & Wellness', 'Home & Living', 'Pet Products', 'Other']
const TONES = ['Professional', 'Playful', 'Luxurious', 'Eco-friendly', 'Minimalist', 'Bold']

function getScoreGrade(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-600' }
  if (score >= 80) return { label: 'Good', color: 'text-green-500' }
  if (score >= 70) return { label: 'Needs Improvement', color: 'text-orange-500' }
  return { label: 'Review Required', color: 'text-red-500' }
}

// ============================================================
// Main Component
// ============================================================
export function DesignEditor({ previewUrl, boxType, dimensions, material, templateId }: DesignEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholderInputRef = useRef<HTMLInputElement>(null)
  const activePlaceholderRef = useRef<any>(null)

  const [activeTab, setActiveTab] = useState<ActiveTab>('inspiration')
  const [selectedColor, setSelectedColor] = useState('#2563EB')
  const [canvasReady, setCanvasReady] = useState(false)
  const [editHint, setEditHint] = useState<string | null>(templateId ? 'Click any highlighted element to edit. Double-click text to change content.' : null)
  const [templateName, setTemplateName] = useState<string | null>(null)

  // AI Inspiration state
  const [designPrompt, setDesignPrompt] = useState('')
  const [designLoading, setDesignLoading] = useState(false)
  const [generatedDesigns, setGeneratedDesigns] = useState<GeneratedDesign[]>([])
  const [designError, setDesignError] = useState('')
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [colorsLoading, setColorsLoading] = useState(false)

  // AI Copy state
  const [productName, setProductName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [audience, setAudience] = useState('General')
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState('Cosmetics')
  const [tone, setTone] = useState('Professional')
  const [copyLoading, setCopyLoading] = useState(false)
  const [copyData, setCopyData] = useState<CopyData | null>(null)
  const [copyError, setCopyError] = useState('')

  // AI Review state
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [reviewError, setReviewError] = useState('')

  // Placeholder image upload handler
  const handlePlaceholderUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const ph = activePlaceholderRef.current
    const c = fabricCanvasRef.current
    if (!file || !ph || !c) return
    const reader = new FileReader()
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return
      const fabric = await import('fabric')
      try {
        const img = await fabric.FabricImage.fromURL(reader.result, { crossOrigin: 'anonymous' })
        const phBounds = ph.getBoundingRect()
        const sc = Math.min(phBounds.width / (img.width || 1), phBounds.height / (img.height || 1))
        img.set({
          left: phBounds.left + phBounds.width / 2,
          top: phBounds.top + phBounds.height / 2,
          originX: 'center', originY: 'center',
          scaleX: sc, scaleY: sc,
        })
        // Remove placeholder rect and its label
        const allObjs = c.getObjects()
        const label = allObjs.find((o: any) => o.__isPlaceholderLabel && Math.abs(o.left - ph.left) < 5 && Math.abs(o.top - ph.top) < 5)
        c.remove(ph)
        if (label) c.remove(label)
        c.add(img)
        c.setActiveObject(img)
        c.renderAll()
        saveHistoryNow()
      } catch { /* failed */ }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  // ============================================================
  // Canvas Init
  // ============================================================
  useEffect(() => {
    let mounted = true
    let resizeHandler: (() => void) | null = null
    let keyHandler: ((e: KeyboardEvent) => void) | null = null

    async function initCanvas() {
      if (!canvasElRef.current || !wrapperRef.current || fabricCanvasRef.current) return
      const fabric = await import('fabric')
      if (!mounted) return

      const ww = wrapperRef.current.clientWidth
      const wh = wrapperRef.current.clientHeight
      const cw = Math.max(ww, 400)
      const ch = Math.max(wh, 400)

      const canvas = new fabric.Canvas(canvasElRef.current, {
        width: cw, height: ch, backgroundColor: '#f8f8f8', selection: true,
      })
      fabricCanvasRef.current = canvas

      let imgBounds = { x: 40, y: 40, width: cw - 80, height: ch - 80 }

      if (previewUrl) {
        try {
          const img = await fabric.FabricImage.fromURL(previewUrl, { crossOrigin: 'anonymous' })
          if (!mounted || !img.width || !img.height) throw new Error('no img')
          const pad = 80
          const sc = Math.min((cw - pad) / img.width, (ch - pad) / img.height)
          const scaledW = img.width * sc
          const scaledH = img.height * sc
          img.set({
            scaleX: sc, scaleY: sc, left: cw / 2, top: ch / 2,
            originX: 'center', originY: 'center', selectable: false, evented: false,
          })
          ;(img as any).__packive_name = DIELINE_NAME
          canvas.add(img)
          canvas.sendObjectToBack(img)
          imgBounds = { x: (cw - scaledW) / 2, y: (ch - scaledH) / 2, width: scaledW, height: scaledH }
        } catch { /* continue */ }
      }

      // Load template elements if templateId is provided
      if (templateId) {
        const { getTemplateById } = await import('@/lib/templates')
        const { calculatePanelBounds } = await import('@/lib/panel-mapper')
        const tpl = getTemplateById(templateId)
        if (tpl && mounted) {
          setTemplateName(tpl.name)
          const panelBounds = calculatePanelBounds(imgBounds, dimensions)

          for (const el of tpl.elements) {
            const pb = panelBounds[el.panel]
            if (!pb) continue
            const absX = pb.x + pb.width * el.relativeX
            const absY = pb.y + pb.height * el.relativeY
            const absW = pb.width * el.relativeWidth
            const absH = pb.height * el.relativeHeight

            if (el.type === 'rect') {
              const rect = new fabric.Rect({
                left: pb.x + pb.width * (el.relativeX - el.relativeWidth / 2) + absW / 2,
                top: absY,
                width: absW, height: absH,
                originX: 'center', originY: 'center',
                fill: el.fill === 'transparent' ? '' : el.fill,
                stroke: el.stroke || '',
                strokeWidth: el.strokeWidth || 0,
                opacity: el.opacity ?? 1,
                selectable: !el.locked,
                evented: !el.locked,
              })
              if (el.editHint) (rect as any).__editHint = el.editHint
              canvas.add(rect)
            } else if (el.type === 'circle') {
              const radius = Math.min(absW, absH) / 2
              const circle = new fabric.Circle({
                left: absX, top: absY,
                originX: 'center', originY: 'center',
                radius,
                fill: el.fill,
                opacity: el.opacity ?? 1,
                selectable: !el.locked,
                evented: !el.locked,
              })
              canvas.add(circle)
            } else if (el.type === 'text' && el.text) {
              const fs = el.fontSize || 12
              const tb = new fabric.Textbox(el.text, {
                left: absX, top: absY,
                originX: 'center', originY: 'center',
                width: absW,
                fontSize: fs,
                fontWeight: (el.fontWeight as any) || 'normal',
                fontFamily: el.fontFamily || 'sans-serif',
                fill: el.fill,
                textAlign: (el.textAlign as any) || 'center',
                editable: el.editable,
                selectable: el.editable,
                evented: el.editable,
              })
              if (el.editHint) (tb as any).__editHint = el.editHint
              canvas.add(tb)
            } else if (el.type === 'image-placeholder') {
              // Dashed rect + label
              const phRect = new fabric.Rect({
                left: absX, top: absY,
                originX: 'center', originY: 'center',
                width: absW, height: absH,
                fill: el.fill,
                stroke: '#AAAAAA',
                strokeWidth: 1,
                strokeDashArray: [4, 4],
                selectable: true,
                evented: true,
              })
              ;(phRect as any).__editHint = el.editHint || 'Click to upload image'
              ;(phRect as any).__isPlaceholder = true
              const phText = new fabric.Textbox(el.editHint || 'Drop image here', {
                left: absX, top: absY,
                originX: 'center', originY: 'center',
                width: absW * 0.9,
                fontSize: 9,
                fill: '#999999',
                textAlign: 'center',
                editable: false,
                selectable: false,
                evented: false,
              })
              ;(phText as any).__isPlaceholderLabel = true
              canvas.add(phRect)
              canvas.add(phText)
            }
          }

          // Keep dieline at back
          const bg = canvas.getObjects().find((o: any) => o.__packive_name === DIELINE_NAME)
          if (bg) canvas.sendObjectToBack(bg)

          // Selection handler for editHint
          canvas.on('selection:created', (e: any) => {
            const sel = e.selected?.[0]
            if (sel?.__editHint) setEditHint(sel.__editHint)
            if (sel?.__isPlaceholder) {
              activePlaceholderRef.current = sel
            }
          })
          canvas.on('selection:updated', (e: any) => {
            const sel = e.selected?.[0]
            if (sel?.__editHint) setEditHint(sel.__editHint)
            else setEditHint(null)
            if (sel?.__isPlaceholder) activePlaceholderRef.current = sel
            else activePlaceholderRef.current = null
          })
          canvas.on('selection:cleared', () => {
            setEditHint(null)
            activePlaceholderRef.current = null
          })
          canvas.on('mouse:dblclick', (e: any) => {
            if (e.target?.__isPlaceholder) {
              activePlaceholderRef.current = e.target
              placeholderInputRef.current?.click()
            }
          })
        }
      }

      saveHistoryNow(canvas)
      setCanvasReady(true)

      resizeHandler = () => {
        if (!wrapperRef.current || !fabricCanvasRef.current) return
        fabricCanvasRef.current.setDimensions({
          width: Math.max(wrapperRef.current.clientWidth, 400),
          height: Math.max(wrapperRef.current.clientHeight, 400),
        })
        fabricCanvasRef.current.renderAll()
      }
      window.addEventListener('resize', resizeHandler)

      keyHandler = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undoNow() }
        if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redoNow() }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const c = fabricCanvasRef.current
          if (!c) return
          const active = c.getActiveObject()
          if (active && !(active as any).isEditing) {
            c.remove(active); c.discardActiveObject(); c.renderAll(); saveHistoryNow(c)
          }
        }
      }
      document.addEventListener('keydown', keyHandler)
    }

    initCanvas()
    return () => {
      mounted = false
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      if (keyHandler) document.removeEventListener('keydown', keyHandler)
      if (fabricCanvasRef.current) { fabricCanvasRef.current.dispose(); fabricCanvasRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl])

  // ============================================================
  // History
  // ============================================================
  function saveHistoryNow(canvas?: any) {
    const c = canvas || fabricCanvasRef.current; if (!c) return
    const json = JSON.stringify(c.toJSON())
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(json)
    historyIndexRef.current = historyRef.current.length - 1
  }
  function undoNow() {
    if (historyIndexRef.current <= 0 || !fabricCanvasRef.current) return
    historyIndexRef.current--
    fabricCanvasRef.current.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => fabricCanvasRef.current?.renderAll())
  }
  function redoNow() {
    if (historyIndexRef.current >= historyRef.current.length - 1 || !fabricCanvasRef.current) return
    historyIndexRef.current++
    fabricCanvasRef.current.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => fabricCanvasRef.current?.renderAll())
  }
  const saveHistory = useCallback(() => saveHistoryNow(), [])
  const undo = useCallback(() => undoNow(), [])
  const redo = useCallback(() => redoNow(), [])

  // ============================================================
  // Add text to canvas (with configurable font size)
  // ============================================================
  const addTextToCanvas = useCallback(async (text: string, fontSize?: number) => {
    const c = fabricCanvasRef.current; if (!c) return
    const fabric = await import('fabric')
    const cw = c.getWidth();
    const ch = c.getHeight();
    const isLong = text.length > 100;
    const tbWidth = isLong
      ? cw * 0.9
      : Math.min(300, cw * 0.4);
    const fs = fontSize || 24;
    const tb = new fabric.Textbox(text, {
      left: cw / 2,
      top: 20,
      originX: 'center',
      originY: 'top',
      width: tbWidth,
      fontSize: fs,
      fontFamily: 'Inter, sans-serif',
      fill: '#000000',
      editable: true,
    })
    c.add(tb);
    c.renderAll();
    // Auto-shrink font size if text overflows canvas height
    let tries = 0;
    while (tb.getBoundingRect().height > ch - 40 && fs > 6 && tries < 20) {
      tb.set('fontSize', tb.fontSize! - 1);
      c.renderAll();
      tries++;
    }
    // Ensure text stays within canvas bounds
    const bounds = tb.getBoundingRect();
    if (bounds.top < 10) tb.set('top', 10);
    if (bounds.top + bounds.height > ch - 10) tb.set('top', Math.max(10, ch - bounds.height - 10));
    if (bounds.left < 10) tb.set('left', tbWidth / 2 + 10);
    c.setActiveObject(tb); c.renderAll(); saveHistory()
  }, [saveHistory])

  // Add default text (toolbar)
  const addText = useCallback(() => {
    addTextToCanvas('Double click to edit', 24)
  }, [addTextToCanvas])

  const addRect = useCallback(async () => {
    const c = fabricCanvasRef.current; if (!c) return
    const fabric = await import('fabric')
    const rect = new fabric.Rect({
      left: c.getWidth() / 2 - 50, top: c.getHeight() / 2 - 50,
      width: 100, height: 100, fill: selectedColor, opacity: 0.8, rx: 4, ry: 4,
    })
    c.add(rect); c.setActiveObject(rect); c.renderAll(); saveHistory()
  }, [selectedColor, saveHistory])

  const addCircle = useCallback(async () => {
    const c = fabricCanvasRef.current; if (!c) return
    const fabric = await import('fabric')
    const circle = new fabric.Circle({
      left: c.getWidth() / 2, top: c.getHeight() / 2,
      originX: 'center', originY: 'center', radius: 50,
      fill: selectedColor, opacity: 0.8,
    })
    c.add(circle); c.setActiveObject(circle); c.renderAll(); saveHistory()
  }, [selectedColor, saveHistory])

  const addImageFromUrl = useCallback(async (url: string) => {
    const c = fabricCanvasRef.current; if (!c) return
    const fabric = await import('fabric')
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      const maxDim = 300
      const scale = Math.min(maxDim / (img.width || maxDim), maxDim / (img.height || maxDim), 1)
      img.set({ left: c.getWidth() / 2, top: c.getHeight() / 2, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale })
      c.add(img); c.setActiveObject(img); c.renderAll(); saveHistory()
    } catch { /* failed */ }
  }, [saveHistory])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === 'string') addImageFromUrl(reader.result) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [addImageFromUrl])

  const bringForward = useCallback(() => {
    const c = fabricCanvasRef.current; if (!c) return
    const obj = c.getActiveObject(); if (obj) { c.bringObjectForward(obj); c.renderAll(); saveHistory() }
  }, [saveHistory])

  const sendBackward = useCallback(() => {
    const c = fabricCanvasRef.current; if (!c) return
    const obj = c.getActiveObject(); if (obj) { c.sendObjectBackwards(obj); c.renderAll(); saveHistory() }
  }, [saveHistory])

  const deleteSelected = useCallback(() => {
    const c = fabricCanvasRef.current; if (!c) return
    const obj = c.getActiveObject()
    if (obj) { c.remove(obj); c.discardActiveObject(); c.renderAll(); saveHistory() }
  }, [saveHistory])

  // ============================================================
  // AI Inspiration: Generate Design + Extract Colors
  // ============================================================
  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) return
    setDesignLoading(true); setDesignError(''); setExtractedColors([])
    try {
      const res = await fetch('/api/ai/generate-design', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: designPrompt, boxType, dimensions }),
      })
      const data = await res.json()
      if (data.success && data.imageUrl) {
        const newDesign = { url: data.imageUrl, prompt: designPrompt }
        setGeneratedDesigns(prev => [newDesign, ...prev].slice(0, 4))
        // Extract colors from the generated image
        extractColors(data.imageUrl)
      } else {
        setDesignError(data.error || 'Failed to generate design')
      }
    } catch { setDesignError('Network error. Please try again.') }
    finally { setDesignLoading(false) }
  }

  const extractColors = async (imageUrl: string) => {
    setColorsLoading(true)
    try {
      const res = await fetch('/api/ai/extract-colors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (data.success && data.colors) setExtractedColors(data.colors)
    } catch { /* ignore */ }
    finally { setColorsLoading(false) }
  }

  // ============================================================
  // AI Copywriter
  // ============================================================
  const handleGenerateCopy = async () => {
    if (!productName.trim() || !brandName.trim()) return
    setCopyLoading(true); setCopyError('')
    try {
      const res = await fetch('/api/ai/generate-copy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, brandName, targetAudience: audience, language, category, tone }),
      })
      const data = await res.json()
      if (data.success && data.data) setCopyData(data.data)
      else setCopyError(data.error || 'Failed to generate copy')
    } catch { setCopyError('Network error. Please try again.') }
    finally { setCopyLoading(false) }
  }

  const copyAllToClipboard = () => {
    if (!copyData) return
    const text = [
      `Headline: ${copyData.headline}`,
      `Description: ${copyData.description}`,
      `Slogan: ${copyData.slogan}`,
      `Features:\n${copyData.features.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}`,
      `Back Panel:\n${copyData.backPanel}`,
    ].join('\n\n')
    navigator.clipboard.writeText(text)
  }

  // ============================================================
  // AI Review
  // ============================================================
  const handleReviewDesign = async () => {
    const c = fabricCanvasRef.current; if (!c) return
    setReviewLoading(true); setReviewError(''); setReviewData(null)
    try {
      const dataUrl = c.toDataURL({ format: 'png', quality: 1.0, multiplier: 2 })
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      const res = await fetch('/api/ai/review-design', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, boxType, dimensions, material }),
      })
      const data = await res.json()
      if (data.success && data.data) setReviewData(data.data)
      else setReviewError(data.error || 'Failed to review design')
    } catch { setReviewError('Network error. Please try again.') }
    finally { setReviewLoading(false) }
  }

  // ============================================================
  // Color palette
  // ============================================================
  const paletteColors = ['#000000', '#ffffff', '#FF0000', '#00AA00', '#2563EB', '#7C3AED', '#F59E0B', '#EC4899', '#14B8A6', '#F97316']

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Package Design Editor</h1>
        {templateName && (<><div className="h-5 w-px bg-gray-200" /><span className="text-xs text-[#7C3AED] font-medium">Template: {templateName}</span></>)}
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-xs text-gray-500">
          {boxType.toUpperCase()} | {dimensions.L}x{dimensions.W}x{dimensions.D}mm | {material}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={undo} className="h-8 w-8 p-0" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={redo} className="h-8 w-8 p-0" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></Button>
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <Button size="sm" variant="outline" disabled className="text-xs opacity-50">Export (Coming Soon)</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOLBAR */}
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 shrink-0">
          <ToolBtn icon={<Type className="w-4 h-4" />} label="Text" onClick={addText} />
          <ToolBtn icon={<Square className="w-4 h-4" />} label="Rect" onClick={addRect} />
          <ToolBtn icon={<CircleIcon className="w-4 h-4" />} label="Circle" onClick={addCircle} />
          <ToolBtn icon={<ImageIcon className="w-4 h-4" />} label="Image" onClick={() => fileInputRef.current?.click()} />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <div className="w-8 h-px bg-gray-200 my-1" />
          <div className="relative group">
            <ToolBtn icon={<Palette className="w-4 h-4" />} label="Color" onClick={() => {}} style={{ color: selectedColor }} />
            <div className="absolute left-full top-0 ml-2 hidden group-hover:grid grid-cols-2 gap-1 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-50">
              {paletteColors.map(c => (
                <button key={c} className={`w-6 h-6 rounded border ${selectedColor === c ? 'ring-2 ring-[#2563EB] ring-offset-1' : 'border-gray-200'}`}
                  style={{ backgroundColor: c }} onClick={() => setSelectedColor(c)} />
              ))}
            </div>
          </div>
          <div className="w-8 h-px bg-gray-200 my-1" />
          <ToolBtn icon={<ChevronUp className="w-4 h-4" />} label="Forward" onClick={bringForward} />
          <ToolBtn icon={<ChevronDown className="w-4 h-4" />} label="Back" onClick={sendBackward} />
          <ToolBtn icon={<Trash2 className="w-4 h-4" />} label="Delete" onClick={deleteSelected} />
        </aside>

        {/* CENTER CANVAS */}
        <main className="flex-1 overflow-hidden bg-gray-200 flex flex-col">
          {/* Edit hint banner */}
          {editHint && (
            <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-800">{editHint}</span>
              <button onClick={() => setEditHint(null)} className="ml-auto text-amber-400 hover:text-amber-600 text-xs">Dismiss</button>
            </div>
          )}
          {/* Placeholder image upload (hidden) */}
          <input ref={placeholderInputRef} type="file" accept="image/*" className="hidden" onChange={handlePlaceholderUpload} />
          <div ref={wrapperRef} className="flex-1 w-full">
            <canvas ref={canvasElRef} />
          </div>
        </main>

        {/* RIGHT AI PANEL */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            {([
              { id: 'inspiration' as ActiveTab, icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Inspiration' },
              { id: 'copy' as ActiveTab, icon: <FileText className="w-3.5 h-3.5" />, label: 'Copy' },
              { id: 'review' as ActiveTab, icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Review' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id ? 'text-[#2563EB] border-b-2 border-[#2563EB]' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ===== TAB: AI INSPIRATION ===== */}
            {activeTab === 'inspiration' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Describe your packaging design concept</label>
                  <textarea value={designPrompt} onChange={e => setDesignPrompt(e.target.value)}
                    placeholder="e.g., Minimalist cosmetic box, pink and gold, luxury feel"
                    className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                </div>
                <Button onClick={handleGenerateDesign} disabled={designLoading || !designPrompt.trim()}
                  className="w-full bg-[#F59E0B] hover:bg-[#d97706] text-white font-semibold">
                  {designLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</>
                    : <><Sparkles className="w-4 h-4 mr-2" />Get AI Inspiration</>}
                </Button>
                {designError && <p className="text-xs text-red-500">{designError}</p>}

                {generatedDesigns.length > 0 && (
                  <div className="space-y-3">
                    {/* Latest inspiration */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Inspiration Reference</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={generatedDesigns[0].url} alt="AI Inspiration"
                        className="w-full rounded-lg border border-gray-200" />
                      <p className="text-xs text-gray-400 mt-2 italic">
                        Use this as visual inspiration. Create your actual design using the editor tools on the left.
                      </p>
                    </div>

                    {/* Extracted Color Palette */}
                    {colorsLoading && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Extracting colors...
                      </div>
                    )}
                    {extractedColors.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Color Palette</p>
                        <div className="flex gap-2">
                          {extractedColors.map((col, i) => (
                            <button key={i} onClick={() => setSelectedColor(col.hex)} title={`${col.name} — click to use`}
                              className={`flex flex-col items-center gap-1 group ${selectedColor === col.hex ? 'ring-2 ring-[#2563EB] ring-offset-1 rounded-lg' : ''}`}>
                              <div className="w-10 h-10 rounded-lg border border-gray-200 group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: col.hex }} />
                              <span className="text-[9px] text-gray-500 leading-none">{col.hex}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* History thumbnails */}
                    {generatedDesigns.length > 1 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Previous</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {generatedDesigns.slice(1).map((d, i) => (
                            <div key={i} className="cursor-pointer" onClick={() => {
                              setGeneratedDesigns(prev => {
                                const newList = [d, ...prev.filter(x => x.url !== d.url)].slice(0, 4)
                                return newList
                              })
                              extractColors(d.url)
                            }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={d.url} alt={d.prompt}
                                className="w-full aspect-square object-cover rounded border border-gray-200 hover:border-[#2563EB] transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ===== TAB: AI COPYWRITER ===== */}
            {activeTab === 'copy' && (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                    <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., Rose Glow Serum" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand Name *</label>
                    <Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g., Lumiere" className="h-9 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)}
                        className="w-full h-9 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tone</label>
                      <select value={tone} onChange={e => setTone(e.target.value)}
                        className="w-full h-9 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Audience</label>
                      <select value={audience} onChange={e => setAudience(e.target.value)}
                        className="w-full h-9 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        {['General', 'Young Adults', 'Premium', 'Kids', 'Health-conscious'].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)}
                        className="w-full h-9 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                        <option value="en">English</option>
                        <option value="ko">Korean</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Button onClick={handleGenerateCopy} disabled={copyLoading || !productName.trim() || !brandName.trim()}
                  className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-semibold">
                  {copyLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating copy...</>
                    : <><FileText className="w-4 h-4 mr-2" />Generate Copy</>}
                </Button>
                {copyError && <p className="text-xs text-red-500">{copyError}</p>}
                {copyData && (
                  <div className="space-y-3">
                    <CopyCard label="Headline" text={copyData.headline} fontSize={FONT_SIZE_MAP.Headline}
                      onAdd={() => addTextToCanvas(copyData.headline, FONT_SIZE_MAP.Headline)} />
                    <CopyCard label="Description" text={copyData.description} fontSize={FONT_SIZE_MAP.Description}
                      onAdd={() => addTextToCanvas(copyData.description, FONT_SIZE_MAP.Description)} />
                    <CopyCard label="Slogan" text={copyData.slogan} fontSize={FONT_SIZE_MAP.Slogan}
                      onAdd={() => addTextToCanvas(copyData.slogan, FONT_SIZE_MAP.Slogan)} />
                    {copyData.features?.map((f, i) => (
                      <CopyCard key={i} label={`Feature ${i + 1}`} text={f} fontSize={FONT_SIZE_MAP.Feature}
                        onAdd={() => addTextToCanvas(f, FONT_SIZE_MAP.Feature)} />
                    ))}
                    <CopyCard label="Back Panel" text={copyData.backPanel} fontSize={FONT_SIZE_MAP['Back Panel']}
                      onAdd={() => addTextToCanvas(copyData.backPanel, FONT_SIZE_MAP['Back Panel'])} />
                    <Button variant="outline" size="sm" onClick={copyAllToClipboard} className="w-full text-xs gap-1.5">
                      <Copy className="w-3.5 h-3.5" /> Copy All to Clipboard
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* ===== TAB: AI REVIEW ===== */}
            {activeTab === 'review' && (
              <>
                <Button onClick={handleReviewDesign} disabled={reviewLoading}
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold">
                  {reviewLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />AI is reviewing your design...</>
                    : <><ShieldCheck className="w-4 h-4 mr-2" />Review My Design</>}
                </Button>
                {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                {reviewData && (
                  <div className="space-y-4">
                    {/* Score Gauge + Grade */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                          <circle cx="48" cy="48" r="40"
                            stroke={reviewData.score >= 80 ? '#22c55e' : reviewData.score >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8" fill="none"
                            strokeDasharray={`${(reviewData.score / 100) * 251.2} 251.2`}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">{reviewData.score}</span>
                      </div>
                      <p className={`text-sm font-semibold mt-1 ${getScoreGrade(reviewData.score).color}`}>
                        {getScoreGrade(reviewData.score).label}
                      </p>
                      <p className="text-xs text-gray-400">Print Quality Score</p>
                    </div>

                    {/* Issues */}
                    {reviewData.issues?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Issues Found ({reviewData.issues.length})</p>
                        {reviewData.issues.map((issue, i) => (
                          <div key={i} className={`flex gap-2 p-2.5 rounded-lg text-xs ${
                            issue.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                            issue.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'}`}>
                            {issue.severity === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                            {issue.severity === 'warning' && <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
                            {issue.severity === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800">{issue.type}</p>
                              <p className="text-gray-600 mt-0.5">{issue.description}</p>
                              {issue.suggestion && <p className="text-gray-500 mt-1">{issue.suggestion}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Material Notes */}
                    {reviewData.materialNotes && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs font-medium text-amber-900 mb-1">Material-Specific Notes</p>
                        <p className="text-xs text-amber-800">{reviewData.materialNotes}</p>
                      </div>
                    )}

                    {/* Summary */}
                    {reviewData.summary && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Summary</p>
                        <p className="text-xs text-blue-800">{reviewData.summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================
function ToolBtn({ icon, label, onClick, style }: { icon: React.ReactNode; label: string; onClick: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} title={label} style={style}
      className="w-10 h-10 flex flex-col items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
      {icon}
      <span className="text-[9px] mt-0.5 leading-none">{label}</span>
    </button>
  )
}

function CopyCard({ label, text, fontSize, onAdd }: { label: string; text: string; fontSize: number; onAdd: () => void }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-[10px] text-gray-400">{fontSize}px</span>
      </div>
      <p className="text-sm text-gray-800 mb-2">{text}</p>
      <button onClick={onAdd}
        className="w-full text-xs text-[#2563EB] hover:text-[#1d4ed8] font-medium flex items-center justify-center gap-1 py-1.5 rounded-md hover:bg-[#2563EB]/5 transition-colors">
        <Plus className="w-3 h-3" /> Add to Canvas as Text
      </button>
    </div>
  )
}
