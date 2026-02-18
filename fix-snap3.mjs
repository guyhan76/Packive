import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(
  `const left = obj.left;
        const top = obj.top;
        const w = obj.getScaledWidth();
        const h = obj.getScaledHeight();
        const cx = left + w / 2;
        const cy = top + h / 2;`,
  `const bound = obj.getBoundingRect();
        const cx = bound.left + bound.width / 2;
        const cy = bound.top + bound.height / 2;`
);

code = code.replace(
  `obj.set('left', cw / 2 - w / 2);
          snappedV = true;`,
  `const bw = bound.width;
          obj.set('left', obj.left + (cw / 2 - cx));
          snappedV = true;`
);

code = code.replace(
  `obj.set('top', ch / 2 - h / 2);
          snappedH = true;`,
  `obj.set('top', obj.top + (ch / 2 - cy));
          snappedH = true;`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Fixed snap using getBoundingRect.');
