const fs=require("fs"),path=require("path");
const DIR=path.join(__dirname,"public","dielines","previews");
const T=[
{id:"ecma-b10-tray",m:"B10_02_00_00_Lid",L:200,W:150,D:40,H:20,Th:0.5,ex:{Lid:"B10_02_00_00_A"}},
{id:"ecma-b20-hinged",m:"B20_01_00_00_Lid",L:200,W:150,D:40,H:20,Th:0.5,ex:{Lid:"B20_02_00_00_A"}}
];
async function gen(t){
const f=path.join(DIR,t.id+".svg");
const o={DimensionType:"In",KnifeInfo:false,Sizes:false};
if(t.ex)Object.assign(o,t.ex);
const b={modelName:t.m,epmModel:t.m,length:t.L,width:t.W,depth:t.D,height:t.H,thickness:t.Th,units:"mm",options:o};
console.log("[GEN]",t.id);
try{
const r=await fetch("http://localhost:3000/api/dieline",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
if(!r.ok){console.log("  [FAIL]",r.status,await r.text());return;}
const s=await r.text();
fs.writeFileSync(f,s,"utf8");
console.log("  [OK]",(fs.statSync(f).size/1024).toFixed(1)+"KB");
}catch(e){console.log("  [ERR]",e.message);}}
async function main(){for(const t of T){await gen(t);await new Promise(r=>setTimeout(r,2000));}console.log("DONE");}
main();