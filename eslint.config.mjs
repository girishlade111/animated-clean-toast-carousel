// Flat config for Next.js 15: eslint-config-next@15 ships eslintrc-style
// configs, so wrap them with FlatCompat (official Next.js 15 pattern).
import { FlatCompat } from "@eslint/eslintrc"
import { defineConfig, globalIgnores } from "eslint/config"

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Next.js build output + generated files
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])
