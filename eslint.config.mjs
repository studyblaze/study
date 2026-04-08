import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}", "components/**/*.{ts,tsx,js,jsx}", "lib/**/*.{ts,tsx,js,jsx}", "hooks/**/*.{ts,tsx,js,jsx}"],
    rules: {}
  },
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "android/**",
    "ios/**",
    "node_modules/**",
    "*.log",
    "*.js",
    "*.mjs",
    "public/_next/**",
  ]),
]);

export default eslintConfig;
