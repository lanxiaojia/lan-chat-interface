import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // 同时输出 CommonJS 和 ES Module
  dts: true, // 生成 .d.ts 类型声明文件
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"], // 不要把 React 打包进去
  banner: {
    js: '"use client";',
  },
});
