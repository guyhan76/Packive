'use client';

import { useState, useMemo } from 'react';

export default function TestConvertPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const start = Date.now();
    try {
      const res = await fetch('/api/convert-file', {
        method: 'POST',
        body: formData,
      });
      setElapsed(Date.now() - start);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setElapsed(Date.now() - start);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SVG width/height 제거하고 viewBox만 남겨서 CSS 크기 제어 가능하게
  const cleanSvg = useMemo(() => {
    if (!result?.svg) return '';
    let svg = result.svg;
    // viewBox가 없으면 추가
    if (!/viewBox/.test(svg)) {
      const w = result.width || 800;
      const h = result.height || 600;
      svg = svg.replace(/<svg/, `<svg viewBox="0 0 ${w} ${h}"`);
    }
    // width/height 속성 제거 (viewBox로 대체)
    svg = svg.replace(/<svg([^>]*)>/, (match: string, attrs: string) => {
      const cleaned = attrs
        .replace(/\s+width="[^"]*"/g, '')
        .replace(/\s+height="[^"]*"/g, '');
      return `<svg${cleaned} width="100%" height="100%">`;
    });
    return svg;
  }, [result]);

  const MAX_W = 960;
  const MAX_H = 700;
  const aspect = result ? (result.width || 1) / (result.height || 1) : 1;
  let previewW = MAX_W;
  let previewH = Math.round(MAX_W / aspect);
  if (previewH > MAX_H) {
    previewH = MAX_H;
    previewW = Math.round(MAX_H * aspect);
  }
  const scale = result ? Math.round(previewW / (result.width || 1) * 100) : 100;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>EPS/AI/PDF to SVG Converter Test</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="file" accept=".eps,.ai,.pdf" onChange={handleUpload} disabled={loading} />
        {loading && <span style={{ marginLeft: 12, color: '#666' }}>Converting... (large PDFs may take 60-90s)</span>}
      </div>

      {error && (
        <div style={{ background: '#fee', border: '1px solid #c00', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}

      {result && (
        <>
          <div style={{ background: '#efe', border: '1px solid #0a0', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
            <div><strong>SUCCESS</strong> ({(elapsed / 1000).toFixed(1)}s)</div>
            <div>File: {result.filename}</div>
            <div>Steps: {result.steps?.join(' -> ')}</div>
            <div>Original: {(result.originalSize / 1024).toFixed(0)} KB | SVG: {(result.svgSize / 1024).toFixed(0)} KB</div>
            <div>Dimensions: {result.width} x {result.height}px</div>
            {result.viewBox && <div>ViewBox: {result.viewBox}</div>}
            <div>Preview: {previewW} x {previewH}px (scale {scale}%)</div>
          </div>

          <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>Converted SVG Preview (fit to screen):</div>
          <div
            style={{
              width: previewW,
              height: previewH,
              border: '2px solid #333',
              background: '#fff',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Original: {result.width} x {result.height}px | Preview: {previewW} x {previewH}px | Scale: {scale}%
          </div>
        </>
      )}
    </div>
  );
}
