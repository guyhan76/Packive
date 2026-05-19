const fs=require("fs"),path=require("path");
const DIR=path.join(__dirname,"public","dielines","previews");
const ALL=[
{id:"fefco-0201",m:"fefco_0201",L:300,W:200,D:250,Th:3},
{id:"fefco-0203",m:"fefco_0203",L:300,W:200,D:250,Th:3},
{id:"fefco-0210",m:"fefco_0210",L:300,W:200,D:250,Th:3},
{id:"fefco-0215",m:"fefco_0215",L:300,W:200,D:250,Th:3},
{id:"fefco-0216",m:"fefco_0216",L:300,W:200,D:250,Th:3},
{id:"fefco-0217",m:"fefco_0217",L:300,W:200,D:250,Th:3},
{id:"fefco-0225",m:"fefco_0225",L:300,W:200,D:250,Th:3},
{id:"fefco-0301",m:"fefco_0301",L:300,W:200,D:100,Th:3},
{id:"fefco-0304",m:"fefco_0304",L:300,W:200,D:100,Th:3},
{id:"fefco-0310",m:"fefco_0310",L:300,W:200,D:100,Th:3,H:50},
{id:"fefco-0401",m:"fefco_0401",L:300,W:200,D:100,Th:3,ng:1},
{id:"fefco-0409",m:"fefco_0409",L:300,W:200,D:100,Th:3,ng:1},
{id:"fefco-0421",m:"fefco_0421",L:300,W:200,D:100,Th:3,ng:1},
{id:"fefco-0427",m:"fefco_0427",L:300,W:200,D:100,Th:3,ng:1},
{id:"fefco-0501",m:"fefco_0501",L:300,W:200,D:100,Th:3},
{id:"fefco-0503",m:"fefco_0503",L:300,W:200,D:100,Th:3},
{id:"fefco-0711",m:"fefco_0711",L:300,W:200,D:250,Th:3},
{id:"fefco-0713",m:"fefco_0713",L:300,W:200,D:250,Th:3},
{id:"ecma-a20-straight",m:"A20_20_03_03",L:80,W:40,D:120,Th:0.5},
{id:"ecma-a20-reverse",m:"A20_20_03_01",L:80,W:40,D:120,Th:0.5},
{id:"ecma-a10-seal",m:"A10_10_03_03",L:80,W:40,D:120,Th:0.5},
{id:"ecma-a55-snaplock",m:"A55_20_01_03",L:80,W:40,D:120,Th:0.5},
{id:"ecma-a55-hanger",m:"A55_21_01_03",L:80,W:40,D:120,Th:0.5},
{id:"ecma-b10-tray",m:"B10_02_00_00_Lid",L:200,W:150,D:40,Th:0.5,H:20,ng:1,ex:{Lid:"B10_02_00_00_A"}},
{id:"ecma-b20-hinged",m:"B20_01_00_00_Lid",L:200,W:150,D:40,Th:0.5,H:20,ng:1,ex:{Lid:"B20_02_00_00_A"}}
];
async function gen(t){
const f=path.join(DIR,t.id+".svg");
const o={DimensionType:"In",KnifeInfo:false,Sizes:false};
if(!t.ng)o.GlueZone=false;
if(t.ex)Object.assign(o,t.ex);
const b={modelName:t.m,epmModel:t.m,length:t.L,width:t.W,depth:t.D,thickness:t.Th,units:"mm",options:o};
if(t.H)b.height=t.H;
console.log("[GEN]",t.id);
for(let a=1;a<=3;a++){try{
const r=await fetch("http://localhost:3000/api/dieline",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
if(!r.ok){const e=await r.text();console.log("  [FAIL]",a,r.status,e.substring(0,120));if(a<3){await new Promise(r=>setTimeout(r,3000));continue;}return 0;}
const raw=await r.text();
let svg=raw;
if(raw.startsWith("{")){try{const j=JSON.parse(raw);svg=j.svg||raw;}catch(e){}}
if(!svg.includes("<svg")){console.log("  [FAIL] not svg");if(a<3)continue;return 0;}
// Remove dimensions group if present
svg=svg.replace(/<g\s+id="dimensions">[\s\S]*?<\/g>/g,"");
// Remove any remaining <text> elements
svg=svg.replace(/<text[\s\S]*?<\/text>/g,"");
fs.writeFileSync(f,svg,"utf8");
const kb=(fs.statSync(f).size/1024).toFixed(1);
console.log("  [OK]",kb+"KB");return 1;
}catch(e){console.log("  [ERR]",a,e.message);if(a<3){await new Promise(r=>setTimeout(r,3000));continue;}return 0;}}return 0;}
async function main(){
if(!fs.existsSync(DIR))fs.mkdirSync(DIR,{recursive:true});
let ok=0,fail=0;
for(const t of ALL){const r=await gen(t);if(r)ok++;else fail++;await new Promise(r=>setTimeout(r,2000));}
console.log("\nDONE ok="+ok+" fail="+fail+" cost=~$"+(ok*0.47).toFixed(2));}
main();