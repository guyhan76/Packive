const fs=require("fs");
const code=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8");
// Check first template for thumbnail/preview fields
const match=code.match(/id:\s*["']minimal-dark[\s\S]{0,500}/);
if(match) console.log("FIRST TEMPLATE:\n"+match[0].substring(0,500));
// Check DesignTemplate interface
const iface=code.match(/interface DesignTemplate[\s\S]{0,300}/);
if(iface) console.log("\nINTERFACE:\n"+iface[0].substring(0,300));
