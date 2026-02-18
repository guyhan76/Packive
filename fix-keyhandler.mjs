import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");
let changes = 0;

// 1. Find "const keyHandler = (e:" and make it async
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const keyHandler = (e:") && !lines[i].includes("async")) {
    lines[i] = lines[i].replace("const keyHandler = (e:", "const keyHandler = async (e:");
    changes++;
    console.log("1. Made keyHandler async at line " + (i+1));
    break;
  }
}

// 2. Remove the extra closing brace after Ctrl+D block
// Find the pattern: }  }  }  };  (4 closing braces before window.addEventListener)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("window.addEventListener('keydown', keyHandler)")) {
    // Go backwards to find the extra }
    // Expected: line i-1 = "};", line i-2 = "}", but there's an extra "}"
    let j = i - 1;
    while (j > 0 && lines[j].trim() === '') j--;
    // j should be "      };" 
    if (lines[j].trim() === '};') {
      let k = j - 1;
      while (k > 0 && lines[k].trim() === '') k--;
      // k should be extra "        }"
      if (lines[k].trim() === '}') {
        // Check one more up
        let m = k - 1;
        while (m > 0 && lines[m].trim() === '') m--;
        if (lines[m].trim() === '}') {
          // This is the extra brace - remove line k
          lines.splice(k, 1);
          changes++;
          console.log("2. Removed extra } at line " + (k+1));
        }
      }
    }
    break;
  }
}

// 3. Fix addEventListener type: async handler needs casting
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("window.addEventListener('keydown', keyHandler)")) {
    lines[i] = lines[i].replace(
      "window.addEventListener('keydown', keyHandler)",
      "window.addEventListener('keydown', keyHandler as EventListener)"
    );
    changes++;
    console.log("3. Added EventListener cast at line " + (i+1));
    break;
  }
}

// 4. Fix removeEventListener too
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("window.removeEventListener('keydown', keyHandler)") && !lines[i].includes("as EventListener")) {
    lines[i] = lines[i].replace(
      "window.removeEventListener('keydown', keyHandler)",
      "window.removeEventListener('keydown', keyHandler as EventListener)"
    );
    changes++;
    console.log("4. Added EventListener cast to removeEventListener at line " + (i+1));
    break;
  }
}

writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Changes: " + changes);
