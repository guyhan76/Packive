// update-svg-paths.js
// Run AFTER batch-generate-previews.js
// Updates svgPath in dieline-templates.ts

const fs = require('fs');
const path = require('path');

const TEMPLATE_FILE = path.join(__dirname, 'src', 'lib', 'dieline-templates.ts');
const PREVIEW_DIR = path.join(__dirname, 'public', 'dielines', 'previews');

let content = fs.readFileSync(TEMPLATE_FILE, 'utf8');
let updateCount = 0;

// Update from generated preview files
if (fs.existsSync(PREVIEW_DIR)) {
  const files = fs.readdirSync(PREVIEW_DIR).filter(f => f.endsWith('.svg'));
  console.log(`Found ${files.length} preview SVGs in ${PREVIEW_DIR}\n`);
  
  files.forEach(f => {
    const id = f.replace('.svg', '');
    const svgPath = `/dielines/previews/${f}`;
    
    // Replace svgPath: '' with svgPath: '/dielines/previews/xxx.svg'
    const regex = new RegExp(`(id: '${id}'[\\s\\S]*?svgPath: ')[^']*(')`);
    if (regex.test(content)) {
      content = content.replace(regex, `$1${svgPath}$2`);
      updateCount++;
      console.log(`  [OK] ${id} -> ${svgPath}`);
    } else {
      console.log(`  [SKIP] ${id} - no svgPath field found`);
    }
  });
}

fs.writeFileSync(TEMPLATE_FILE, content, 'utf8');
console.log(`\nDone: ${updateCount} svgPath entries updated`);
