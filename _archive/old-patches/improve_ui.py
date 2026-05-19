with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()

# === L2469~2548 전체 교체 ===
old_block = """                    {(() => {
                      const templates = getTemplatesByCategory(boxCategoryFilter);
                      if (templates.length === 0) {
                        return (
                          <div className="text-center py-16 text-gray-400">
                            <div className="text-4xl mb-3 opacity-30">\U0001f4e6</div>
                            <p className="text-sm font-medium">No templates yet</p>
                            <p className="text-xs mt-1 text-gray-300">Coming soon</p>
                          </div>
                        );
                      }
                      const fefcoItems = templates.filter(t => { const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'FEFCO'; });
                      const ecmaItems = templates.filter(t => { const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'ECMA'; });

                      const renderCard = (t: DielineTemplate) => (
                        <button key={t.id} onClick={() => {
                          setSelectedBoxCode(t.code);
                      setSelectedBoxName(t.name);
                      setIsEcma(t.code.startsWith('ECMA'));
                      if (t.code.startsWith('ECMA')) { setThickness(0.4); } else { setThickness(FLUTE_MAP[fluteType]?.thickness ?? 4.0); }
                          setShowDimModal(true);
                          setShowDielinePanel(false);
                        }}
                        className="group relative flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-b hover:f"""

# 찾기 어려우니 라인 단위로 교체
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# L2469(idx 2468) ~ L2548(idx 2547) 교체
new_block = '''                    {(() => {
                      const templates = getTemplatesByCategory(boxCategoryFilter);
                      if (templates.length === 0) {
                        return (
                          <div className="text-center py-16 text-gray-400">
                            <div className="text-4xl mb-3 opacity-30">\U0001f4e6</div>
                            <p className="text-sm font-medium">No templates yet</p>
                            <p className="text-xs mt-1 text-gray-300">Coming soon</p>
                          </div>
                        );
                      }
                      const fefcoItems = templates.filter(t => { const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'FEFCO'; });
                      const ecmaItems = templates.filter(t => { const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'ECMA'; });

                      /* Group FEFCO by series (02xx, 03xx, ...) */
                      const groupBySeries = (items: DielineTemplate[], standard: string) => {
                        const groups: Record<string, DielineTemplate[]> = {};
                        items.forEach(t => {
                          let series = '';
                          if (standard === 'FEFCO') {
                            const m = t.code.match(/FEFCO\\s*(\\d{2})/);
                            series = m ? m[1] + '00' : 'Other';
                          } else {
                            const m = t.code.match(/ECMA\\s*([A-Z]\\d+)/);
                            series = m ? m[1] : 'Other';
                          }
                          if (!groups[series]) groups[series] = [];
                          groups[series].push(t);
                        });
                        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
                      };

                      const seriesLabel: Record<string, string> = {
                        '0200': 'Slotted Boxes', '0300': 'Telescope Boxes', '0400': 'Folder & Tray',
                        '0500': 'Slide Boxes', '0600': 'Rigid Boxes', '0700': 'Ready-Glued',
                        'A10': 'Seal End', 'A20': 'Tuck End', 'A55': 'Snap Lock', 'B10': 'Tray + Lid', 'B20': 'Hinged Tray'
                      };

                      const renderCard = (t: DielineTemplate) => (
                        <button key={t.id} onClick={() => {
                          setSelectedBoxCode(t.code);
                          setSelectedBoxName(t.name);
                          setIsEcma(t.code.startsWith('ECMA'));
                          if (t.code.startsWith('ECMA')) { setThickness(0.4); } else { setThickness(FLUTE_MAP[fluteType]?.thickness ?? 4.0); }
                          setShowDimModal(true);
                          setShowDielinePanel(false);
                        }}
                        className="group relative flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-b hover:from-blue-50/40 hover:to-white cursor-pointer"
                        title={${t.name}\\n\\n}
                        >
                          {t.supports3d && (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-md shadow-sm leading-none">3D</span>
                          )}
                          <div className="absolute top-2 left-2 flex gap-[2px]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={w-[4px] h-[4px] rounded-full } />
                            ))}
                          </div>
                          {/* 3D + SVG preview */}
                          <div className="w-full aspect-[4/3] flex items-center justify-center mb-3 rounded-lg bg-gray-50/50 group-hover:bg-white transition-colors overflow-hidden">
                            {t.box3dPath ? (
                              <img src={t.box3dPath} alt={t.name} className="w-[92%] h-[92%] object-contain drop-shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const next = (e.target as HTMLImageElement).nextElementSibling; if(next) (next as HTMLElement).style.display = 'flex'; }} />
                            ) : null}
                            {t.svgPath ? (
                              <img src={t.svgPath} alt={t.name} style={{"display": t.box3dPath ? "none" : undefined}} className="w-[90%] h-[90%] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const sib = (e.target as HTMLImageElement).nextElementSibling; if(sib) (sib as HTMLElement).style.display = 'flex'; }} />
                            ) : null}
                            <div className={lex items-center justify-center w-full h-full } dangerouslySetInnerHTML={{ __html: t.iconSvg }} />
                          </div>
                          <div className="w-full text-center space-y-0.5">
                            <div className="text-[12px] font-bold text-gray-800 group-hover:text-blue-700 leading-snug line-clamp-2 px-0.5">{t.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{t.code}</div>
                            {t.description && <div className="text-[9px] text-gray-400 leading-snug line-clamp-2 px-0.5">{t.description}</div>}
                          </div>
                        </button>
                      );

                      const renderGroup = (items: DielineTemplate[], standard: string, color: string) => {
                        const groups = groupBySeries(items, standard);
                        return groups.map(([series, tpls]) => (
                          <div key={series} className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className={h-px flex-1 bg-gradient-to-r from-transparent via-#FF0000-200 to-transparent}></div>
                              <span className={	ext-[10px] font-bold text-#FF0000-500 uppercase tracking-wider}>{standard} {series}</span>
                              <span className="text-[9px] text-gray-300 font-medium">{seriesLabel[series] || ''}</span>
                              <div className={h-px flex-1 bg-gradient-to-r from-transparent via-#FF0000-200 to-transparent}></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">{tpls.map(renderCard)}</div>
                          </div>
                        ));
                      };

                      return (
                        <div className="space-y-2">
                          {fefcoItems.length > 0 && renderGroup(fefcoItems, 'FEFCO', 'blue')}
                          {ecmaItems.length > 0 && renderGroup(ecmaItems, 'ECMA', 'pink')}
                        </div>
                      );
                    })()}
'''

# 교체
new_lines = lines[:2468] + [new_block + '\\n'] + lines[2548:]

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Replaced L2469-L2548 with improved UI')
print(f'Old lines: 80, New block inserted')

# 검증
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    v = f.read()
print(f'groupBySeries: {"groupBySeries" in v}')
print(f'seriesLabel: {"seriesLabel" in v}')
print(f'line-clamp-2: {v.count("line-clamp-2")}')
print(f'aspect-[4/3]: {"aspect-[4/3]" in v}')
print(f'renderGroup: {"renderGroup" in v}')
