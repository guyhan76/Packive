const fs = require("fs");
const file = "src/app/editor/design/page.tsx";
let code = fs.readFileSync(file, "utf8");
code = code.replace(
  "import React, { useState, useCallback, useMemo, Suspense }",
  "import React, { useState, useCallback, useMemo, useEffect, Suspense }"
);
console.log("useEffect added to imports");
fs.writeFileSync(file, code, "utf8");
