const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// FIX 1: auto-save 저장 시 안전선/가이드 오브젝트 제외
// autoSaveRef.current = setInterval 부분 찾기
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('autoSaveRef.current = setInterval') && lines[i].includes('toJSON')) {
    // 현재: c.toJSON([...]) 으로 전체 저장
    // 수정: 저장 전에 safe zone 오브젝트를 제거하고 저장 후 다시 추가
    lines[i] = lines[i].replace(
      "try { localStorage.setItem('panelEditor_autoSave_'+panelId, JSON.stringify(c.toJSON(",
      "try { const _safeObjs:any[]=[];c.getObjects().forEach((o:any)=>{if(o._isSafeZone||o._isGuideText||o._isSizeLabel){_safeObjs.push(o);c.remove(o);}}); localStorage.setItem('panelEditor_autoSave_'+panelId, JSON.stringify(c.toJSON("
    );
    lines[i] = lines[i].replace(
      "))); } catch {}",
      "))); _safeObjs.forEach(o=>c.add(o)); c.renderAll(); } catch {}"
    );
    console.log('FIX1: auto-save excludes safe zone at line', i + 1);
    break;
  }
}

// FIX 2: auto-save 복원 시 안전선 오브젝트 필터링 강화
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('storageKey') && lines[i+1]?.includes('try')) {
    // 복원 filter에서 _isSafeZone 제거 확인
    for (let j = i; j < i + 30; j++) {
      if (lines[j].includes('parsed.objects = parsed.objects.filter')) {
        // 이미 _isSafeZone 필터가 있는지 확인
        if (!lines[j+1]?.includes('_isSafeZone')) {
          // 다음 줄의 filter 시작에 추가
          for (let k = j; k < j + 10; k++) {
            if (lines[k].includes('_isSafeZone')) {
              console.log('FIX2: _isSafeZone filter already exists at line', k + 1);
              break;
            }
          }
        } else {
          console.log('FIX2: filter already has _isSafeZone');
        }
        break;
      }
    }
    break;
  }
}

// FIX 3: 현재 localStorage의 auto-save 데이터 초기화 코드 추가
// boot 함수 시작 부분에 안전선 정리 추가
// addSafeZone 호출 전에 기존 안전선 모두 제거 확인
// addSafeZone 내부에서 이미 제거하므로 OK

// FIX 4: 중복 addSafeZone 호출 정리
// 현재: 1166 (auto-save 복원 후), 1191 (savedJSON 복원 후), 1196 (둘 다 아닐 때)
// 이것은 정상 — 각 경로에서 1번씩만 호출됨

// FIX 5: localStorage 클리어 — 기존 잘못된 데이터 제거
// boot 시작 시 기존 데이터에서 safe zone 포함 여부 확인
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const storageKey = 'panelEditor_autoSave_'")) {
    // 바로 다음에 데이터 정리 코드 추가
    const indent = '      ';
    lines.splice(i + 1, 0,
      indent + '// Clean corrupted auto-save that might contain safe zone objects',
      indent + 'try { const _checkSave = localStorage.getItem(storageKey); if (_checkSave) { const _p = JSON.parse(_checkSave); if (_p?.objects) { const before = _p.objects.length; _p.objects = _p.objects.filter((o:any) => !o._isSafeZone && !o._isGuideText && !o._isSizeLabel && !(o.type==="rect" && o.stroke==="#93B5F7" && o.fill==="transparent") && !(o.type==="rect" && o.stroke==="#3B82F6" && o.fill==="transparent")); if (_p.objects.length !== before) { localStorage.setItem(storageKey, JSON.stringify(_p)); console.log("[CLEAN] Removed", before - _p.objects.length, "safe zone objects from auto-save"); } } } catch {}',
    );
    console.log('FIX5: Auto-save cleanup added at line', i + 2);
    break;
  }
}

const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
