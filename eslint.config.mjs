import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
const compat = new FlatCompat({ baseDirectory: path.dirname(new URL(import.meta.url).pathname) });
const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "coverage/**", "playwright-report/**", "test-results/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { rules: { "@next/next/no-img-element": "off" } },
];

export default config;
