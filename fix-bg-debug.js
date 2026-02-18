const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Add debug logs to trace the restore path and _isBgImage status

// 1. In onSave - log what JSON is being saved
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onSave(panelId, json, thumb)')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i, 0,
      `${indent}const _dbg = JSON.parse(json);`,
      `${indent}console.log('[SAVE] panelId:', panelId, 'objects:', _dbg.objects?.length, 'bgImages:', _dbg.objects?.filter((o:any)=>o._isBgImage).length, 'selFalse:', _dbg.objects?.filter((o:any)=>o.selectable===false).length);`
    );
    changes++;
    console.log('[debug] Added save log at line ' + (i+1));
    break;
  }
}

// 2. In savedJSON restore - log before and after
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'if (savedJSON) {') {
    const indent = lines[i].match(/^(\s*)/)[1] + '  ';
    lines.splice(i+1, 0,
      `${indent}console.log('[RESTORE] Using savedJSON path');`
    );
    changes++;
    console.log('[debug] Added savedJSON restore log');
    break;
  }
}

// 3. In auto-save restore - log
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('await canvas.loadFromJSON(parsed)') && !lines[i].includes('_parsedSaved')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i, 0,
      `${indent}console.log('[RESTORE] Using auto-save path, objects:', parsed.objects?.length, 'bgImages:', parsed.objects?.filter((o:any)=>o._isBgImage).length);`
    );
    changes++;
    console.log('[debug] Added auto-save restore log');
    break;
  }
}

// 4. After loadFromJSON in savedJSON path - log objects on canvas
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('await canvas.loadFromJSON(_parsedSaved)')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i+1, 0,
      `${indent}console.log('[RESTORE-SAVED] After loadFromJSON, canvas objects:', canvas.getObjects().length, 'bgImages:', canvas.getObjects().filter((o:any)=>o._isBgImage).length);`
    );
    changes++;
    console.log('[debug] Added post-loadFromJSON log');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
