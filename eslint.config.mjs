import { defineConfig, globalIgnores } from "eslint/config";

// Minimal flat config — eslint-config-next 15.x는 ESLint 9 + @rushstack/eslint-patch 호환 문제가 있어
// 활성화하면 IDE에 false positive가 대량 발생. TS 타입 검사는 tsc로 별도 수행하므로 lint는
// globalIgnores만 두고 비활성화 상태로 유지한다.
// 향후 eslint-config-next가 ESLint 9에 정식 대응하면 FlatCompat으로 복구 가능.
const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "backups/**",
    "_archive/**",
    "scripts/**",
    "lib/blender_mockup.py",
    "public/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
