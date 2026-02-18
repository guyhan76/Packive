import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Fix: add "relative" to the wrapper div
code = code.replace(
  'ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5"',
  'ref={wrapperRef} className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-hidden p-5 relative"'
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Added relative to wrapper div.');
