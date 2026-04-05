#!/usr/bin/env node
/**
 * PACKIVE Patch Script - Apply 3D Mockup Fix + JSON Load Fix
 * 
 * 사용법 (프로젝트 루트에서):
 *   node patches/apply-fixes.js
 * 
 * 수정 사항:
 * 1. src/components/editor/box-3d-preview-advanced.tsx (새 파일 생성)
 * 2. src/app/editor/design/page.tsx (import 추가 + 렌더링 교체)
 * 3. src/components/editor/panel-editor.tsx (handleSaveDesign/handleLoadDesign 수정)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function log(msg) { console.log(`[PATCH] ${msg}`); }
function error(msg) { console.error(`[ERROR] ${msg}`); process.exit(1); }

// ─────────────────────────────────────────────
// PATCH 1: design/page.tsx - Import & Render
// ─────────────────────────────────────────────
function patchDesignPage() {
  const filePath = path.join(ROOT, 'src/app/editor/design/page.tsx');
  let src = fs.readFileSync(filePath, 'utf-8');
  
  // 1a. Add Box3DPreviewAdvanced import (after Box3DPreview import block)
  if (src.includes('box-3d-preview-advanced')) {
    log('design/page.tsx: Box3DPreviewAdvanced import already exists, skipping import patch');
  } else {
    const importMarker = `const Box3DPreview = dynamic(\n  () => import("@/components/editor/box-3d-preview"),\n  {\n    ssr: false,\n    loading: () => (\n      <div className="w-full h-[350px] bg-gray-50 rounded-xl border flex items-center justify-center text-gray-400 text-sm">\n        Loading 3D...\n      </div>\n    ),\n  }\n);`;
    
    const advancedImport = `const Box3DPreviewAdvanced = dynamic(
  () => import("@/components/editor/box-3d-preview-advanced"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] bg-gray-50 rounded-xl border flex items-center justify-center text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Loading Advanced 3D Preview...
        </div>
      </div>
    ),
  }
);`;

    if (src.includes(importMarker)) {
      src = src.replace(importMarker, importMarker + '\n\n' + advancedImport);
      log('design/page.tsx: Added Box3DPreviewAdvanced import');
    } else {
      // Fallback: insert after the Box3DPreview closing );
      const regex = /const Box3DPreview = dynamic\([^)]*\)[\s\S]*?^\);/m;
      const match = src.match(regex);
      if (match) {
        src = src.replace(match[0], match[0] + '\n\n' + advancedImport);
        log('design/page.tsx: Added Box3DPreviewAdvanced import (regex fallback)');
      } else {
        log('WARNING: Could not find Box3DPreview import block. Please add manually.');
      }
    }
  }
  
  // 1b. Replace <Box3DPreview ... /> with <Box3DPreviewAdvanced ... />
  const oldRender = '<Box3DPreview L={L} W={W} D={D} panels={panels} />';
  const newRender = `<Box3DPreviewAdvanced
              L={L} W={W} D={D} T={T}
              tuckH={tuckH} dustH={dustH} glueW={glueW}
              bottomH={bottomH} bottomDustH={bottomDustH}
              panels={panels}
            />`;
  
  if (src.includes(oldRender)) {
    src = src.replace(oldRender, newRender);
    log('design/page.tsx: Replaced Box3DPreview render with Box3DPreviewAdvanced');
  } else if (src.includes('Box3DPreviewAdvanced')) {
    log('design/page.tsx: Box3DPreviewAdvanced render already exists');
  } else {
    log('WARNING: Could not find Box3DPreview render. Please replace manually.');
  }
  
  fs.writeFileSync(filePath, src, 'utf-8');
  log('design/page.tsx: SAVED');
}

// ─────────────────────────────────────────────
// PATCH 2: panel-editor.tsx - Save/Load fix
// ─────────────────────────────────────────────
function patchPanelEditor() {
  const filePath = path.join(ROOT, 'src/components/editor/panel-editor.tsx');
  let src = fs.readFileSync(filePath, 'utf-8');
  
  // 2a. Fix handleSaveDesign
  const oldSave = `    const handleSaveDesign = useCallback(async () => {
      const c=fcRef.current; if(!c) return;
      const json=c.toJSON(["_isBgImage","_isSafeZone","_isGuideLine","_isGuideText","_isSizeLabel","_isBgPattern","selectable","evented","name"]);
      const b=new Blob([JSON.stringify(json,null,2)],{type:"application/json"});`;
  
  const newSave = `    const handleSaveDesign = useCallback(async () => {
      const c=fcRef.current; if(!c) return;
      // [FIX] 가이드/세이프존 오브젝트를 일시 제거 후 저장 (사용자 디자인만 저장)
      const _saveGuides: any[] = [];
      c.getObjects().slice().forEach((o: any) => {
        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {
          _saveGuides.push(o); c.remove(o);
        }
      });
      const json=c.toJSON(["_isBgImage","selectable","evented","name"]);
      // 가이드 오브젝트 복원
      _saveGuides.forEach(g => c.add(g));
      c.renderAll();
      const b=new Blob([JSON.stringify(json,null,2)],{type:"application/json"});`;
  
  if (src.includes(oldSave)) {
    src = src.replace(oldSave, newSave);
    log('panel-editor.tsx: Fixed handleSaveDesign');
  } else {
    log('WARNING: handleSaveDesign pattern not found. May already be patched or different.');
  }
  
  // 2b. Fix handleLoadDesign
  const oldLoad = `  const handleLoadDesign = useCallback(() => {
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
    inp.onchange = async (e:any) => { const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=async()=>{ try { const json=JSON.parse(reader.result as string); const c=fcRef.current; if(!c) return; await c.loadFromJSON(json); c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.renderAll(); refreshLayers(); pushHistory(); } catch{alert('Load failed')} }; reader.readAsText(file); };
    inp.click();
  }, [refreshLayers]);`;
  
  const newLoad = `  const handleLoadDesign = useCallback(() => {
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
    inp.onchange = async (e:any) => {
      const file=e.target.files?.[0]; if(!file) return;
      const reader=new FileReader();
      reader.onload=async()=>{
        try {
          const json=JSON.parse(reader.result as string);
          const c=fcRef.current; if(!c) return;
          // [FIX] JSON 로드 전: 가이드/세이프존/칼선 오브젝트 필터링
          if (json && json.objects) {
            json.objects = json.objects.filter((obj: any) => {
              if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel || obj._isBgPattern) return false;
              if (obj.selectable === false && obj.evented === false && !obj._isBgImage && obj.name !== '__bgImage__') return false;
              if (obj.type === 'image' && obj.src && (obj.src.startsWith('blob:') || obj.src.startsWith('object:'))) return false;
              return true;
            });
          }
          await c.loadFromJSON(json);
          // [FIX] 로드 후: 배경 이미지는 잠금, 나머지 사용자 오브젝트는 편집 가능 상태로 복원
          c.getObjects().forEach((o: any) => {
            if (o.name === '__bgImage__' || o._isBgImage) {
              o._isBgImage = true;
              o.set({ selectable: false, evented: false });
            } else {
              if (o.selectable === false && !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel) {
                o.set({ selectable: true, evented: true });
              }
            }
          });
          c.getObjects().slice().forEach((o: any) => {
            if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) c.remove(o);
          });
          c.renderAll();
          refreshLayers();
          pushHistory();
        } catch { alert('Load failed'); }
      };
      reader.readAsText(file);
    };
    inp.click();
  }, [refreshLayers]);`;
  
  if (src.includes(oldLoad)) {
    src = src.replace(oldLoad, newLoad);
    log('panel-editor.tsx: Fixed handleLoadDesign');
  } else {
    log('WARNING: handleLoadDesign pattern not found. May already be patched or different.');
  }
  
  fs.writeFileSync(filePath, src, 'utf-8');
  log('panel-editor.tsx: SAVED');
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
log('========================================');
log('PACKIVE Patch: 3D Mockup Fix + JSON Load Fix');
log('========================================');

// Check we're in the right directory
if (!fs.existsSync(path.join(ROOT, 'src/app/editor/design/page.tsx'))) {
  error('Cannot find src/app/editor/design/page.tsx. Run this from project root.');
}

// Step 1: box-3d-preview-advanced.tsx is already pushed to GitHub
// Just check if it exists, if not tell user to copy it
const advancedPath = path.join(ROOT, 'src/components/editor/box-3d-preview-advanced.tsx');
if (!fs.existsSync(advancedPath)) {
  log('box-3d-preview-advanced.tsx not found locally.');
  log('Fetching from main branch...');
  const { execSync } = require('child_process');
  try {
    execSync('git show origin/main:src/components/editor/box-3d-preview-advanced.tsx > "' + advancedPath + '"', { cwd: ROOT, stdio: 'pipe' });
    log('box-3d-preview-advanced.tsx: Created from origin/main');
  } catch (e) {
    log('Could not fetch from git. Please copy the file manually from origin/main.');
  }
} else {
  log('box-3d-preview-advanced.tsx: Already exists');
}

// Step 2: Patch design/page.tsx
patchDesignPage();

// Step 3: Patch panel-editor.tsx
patchPanelEditor();

log('');
log('========================================');
log('PATCH COMPLETE!');
log('========================================');
log('');
log('Next steps:');
log('  1. npm run dev  (to verify changes)');
log('  2. Test 3D Mockup: Design a panel -> Click "Box" -> Check print side faces outward');
log('  3. Test JSON Load: Save design -> Load it -> Verify objects are editable');
log('  4. git add -A && git commit -m "fix: apply 3D folding + JSON load patches"');
