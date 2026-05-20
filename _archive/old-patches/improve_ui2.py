with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find start (L2469) and end (L2549) - the IIFE block
start_idx = None
end_idx = None
for i in range(len(lines)):
    if '{(() => {' in lines[i] and 'Template grid' in lines[i-2]:
        start_idx = i
    if start_idx and '})()}' in lines[i] and i > start_idx:
        end_idx = i
        break

print(f'Replacing L{start_idx+1} to L{end_idx+1}')

indent = '                    '
i2 = '                      '
i3 = '                        '
i4 = '                          '
i5 = '                            '
i6 = '                              '

new_block = f'''{indent}{{(() => {{
{i2}const templates = getTemplatesByCategory(boxCategoryFilter);
{i2}if (templates.length === 0) {{
{i3}return (
{i4}<div className="text-center py-16 text-gray-400">
{i5}<div className="text-4xl mb-3 opacity-30">{chr(128230)}</div>
{i5}<p className="text-sm font-medium">No templates yet</p>
{i5}<p className="text-xs mt-1 text-gray-300">Coming soon</p>
{i4}</div>
{i3});
{i2}}}
{i2}const fefcoItems = templates.filter(t => {{ const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'FEFCO'; }});
{i2}const ecmaItems = templates.filter(t => {{ const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'ECMA'; }});

{i2}const groupBySeries = (items: typeof templates, standard: string) => {{
{i3}const groups: Record<string, typeof templates> = {{}};
{i3}items.forEach(t => {{
{i4}let series = '';
{i4}if (standard === 'FEFCO') {{
{i5}const m = t.code.match(/FEFCO\\s*(\\d{{2}})/);
{i5}series = m ? m[1] + '00' : 'Other';
{i4}}} else {{
{i5}const m = t.code.match(/ECMA\\s*([A-Z])\\d/);
{i5}series = m ? m[1] : 'Other';
{i4}}}
{i4}if (!groups[series]) groups[series] = [];
{i4}groups[series].push(t);
{i3}}});
{i3}return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
{i2}}};

{i2}const seriesLabel: Record<string, string> = {{
{i3}'0200': 'Slotted-type Boxes',
{i3}'0300': 'Telescope-style Boxes',
{i3}'0400': 'Folder & Tray-type',
{i3}'0500': 'Slide-type Boxes',
{i3}'0600': 'Rigid Boxes',
{i3}'0700': 'Ready-glued Boxes',
{i3}'A': 'Cartons (Rectangular)',
{i3}'B': 'Trays & Lids',
{i2}}};

{i2}const renderCard = (t: DielineTemplate) => (
{i3}<button key={{t.id}} onClick={{() => {{
{i4}setSelectedBoxCode(t.code);
{i4}setSelectedBoxName(t.name);
{i4}setIsEcma(t.code.startsWith('ECMA'));
{i4}if (t.code.startsWith('ECMA')) {{ setThickness(0.4); }} else {{ setThickness(FLUTE_MAP[fluteType]?.thickness ?? 4.0); }}
{i4}setShowDimModal(true);
{i4}setShowDielinePanel(false);
{i3}}}}}
{i3}className="group relative flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-b hover:from-blue-50/40 hover:to-white cursor-pointer"
{i3}title={{`${{t.name}} - ${{t.code}}`}}
{i3}>
{i4}{{t.supports3d && (
{i5}<span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-md shadow-sm leading-none">3D</span>
{i4})}}
{i4}<div className="absolute top-1.5 left-1.5 flex gap-[2px]">
{i5}{{Array.from({{ length: 5 }}).map((_, i) => (
{i6}<div key={{i}} className={{`w-[4px] h-[4px] rounded-full ${{i < t.popularity ? 'bg-amber-400' : 'bg-gray-200'}}`}} />
{i5}))}}
{i4}</div>
{i4}{{/* 3D + SVG preview */}}
{i4}<div className="w-full aspect-[4/3] flex items-center justify-center mb-3 rounded-lg bg-gray-50/50 group-hover:bg-white transition-colors overflow-hidden">
{i5}{{t.box3dPath ? (
{i6}<img src={{t.box3dPath}} alt={{t.name}} className="w-[92%] h-[92%] object-contain drop-shadow-sm" onError={{(e) => {{ (e.target as HTMLImageElement).style.display = 'none'; const next = (e.target as HTMLImageElement).nextElementSibling; if(next) (next as HTMLElement).style.display = 'flex'; }}}} />
{i5}) : null}}
{i5}{{t.svgPath ? (
{i6}<img src={{t.svgPath}} alt={{t.name}} style={{{{display: t.box3dPath ? "none" : undefined}}}} className="w-[90%] h-[90%] object-contain" onError={{(e) => {{ (e.target as HTMLImageElement).style.display = 'none'; const sib = (e.target as HTMLImageElement).nextElementSibling; if(sib) (sib as HTMLElement).style.display = 'flex'; }}}} />
{i5}) : null}}
{i5}<div className={{`flex items-center justify-center w-full h-full ${{(t.svgPath || t.box3dPath) ? 'hidden' : ''}}`}} dangerouslySetInnerHTML={{{{ __html: t.iconSvg }}}} />
{i4}</div>
{i4}<div className="w-full text-center space-y-0.5 mt-1">
{i5}<div className="text-[12px] font-bold text-gray-800 group-hover:text-blue-700 leading-snug line-clamp-2 px-0.5">{{t.name}}</div>
{i5}<div className="text-[10px] text-gray-400 font-mono">{{t.code}}</div>
{i5}{{t.description && <div className="text-[9px] text-gray-400 leading-snug line-clamp-2 px-0.5 mt-0.5">{{t.description}}</div>}}
{i4}</div>
{i3}</button>
{i2});

{i2}const renderGroup = (items: typeof templates, standard: string, color: string) => {{
{i3}const groups = groupBySeries(items, standard);
{i3}return groups.map(([series, tpls]) => (
{i4}<div key={{series}} className="mb-6">
{i5}<div className="flex items-center gap-2 mb-3">
{i6}<div className={{`h-px flex-1 bg-gradient-to-r from-transparent ${{color === 'blue' ? 'via-blue-200' : 'via-emerald-200'}} to-transparent`}}></div>
{i6}<span className={{`text-[10px] font-bold ${{color === 'blue' ? 'text-blue-500' : 'text-emerald-500'}} uppercase tracking-wider`}}>{{standard}} {{series}}</span>
{i6}<span className="text-[9px] text-gray-400 font-medium">{{seriesLabel[series] || ''}}</span>
{i6}<div className={{`h-px flex-1 bg-gradient-to-r from-transparent ${{color === 'blue' ? 'via-blue-200' : 'via-emerald-200'}} to-transparent`}}></div>
{i5}</div>
{i5}<div className="grid grid-cols-2 gap-3">{{tpls.map(renderCard)}}</div>
{i4}</div>
{i3}));
{i2}}};

{i2}return (
{i3}<div className="space-y-2">
{i4}{{fefcoItems.length > 0 && renderGroup(fefcoItems, 'FEFCO', 'blue')}}
{i4}{{ecmaItems.length > 0 && renderGroup(ecmaItems, 'ECMA', 'emerald')}}
{i4}<div className="text-center py-3 text-[9px] text-gray-300">
{i5}{{templates.length}} box types available
{i4}</div>
{i3}</div>
{i2});
{indent}}})()}}
'''

new_lines = [l + '\n' for l in new_block.split('\n')]

lines[start_idx:end_idx+1] = new_lines

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'Old lines: {end_idx - start_idx + 1}')
print(f'New lines: {len(new_lines)}')

# Verify
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
print(f'groupBySeries: {("groupBySeries" in src)}')
print(f'seriesLabel: {("seriesLabel" in src)}')
print(f'renderGroup: {("renderGroup" in src)}')
print(f'line-clamp-2: {src.count("line-clamp-2")}')
print(f'aspect-[4/3]: {("aspect-[4/3]" in src)}')
