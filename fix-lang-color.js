const fs=require("fs");
const file="src/components/i18n-context.tsx";
let code=fs.readFileSync(file,"utf8");
code=code.replace("text-gray-700 cursor-pointer","text-black cursor-pointer");
console.log("Language selector text color changed to black");
fs.writeFileSync(file,code,"utf8");
