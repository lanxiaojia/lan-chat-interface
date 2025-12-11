import { defineConfig } from "tsup";

export default defineConfig({
  // 🟢 1. 修改入口：改为数组，显式包含 types.ts
  entry: ["src/index.ts", "src/types.ts"],

  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],

  // 🟢 2. Banner 配置：虽然 types.js 也会带上 use client，但因为它是纯类型文件，
  // 编译出的 JS 基本是空的，所以带上也不影响使用，这样配置最简单。
  banner: {
    js: '"use client";',
  },
});
