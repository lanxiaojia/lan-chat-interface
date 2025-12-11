/** @type {import('tailwindcss').Config} */
module.exports = {
  // 扫描你的组件文件，路径根据实际情况调整
  content: ["./src/**/*.{ts,tsx}"],

  // 🟢 1. 添加前缀，防止类名冲突
  // 例如：原来的 'text-red-500' 现在变成 'lan-text-red-500'
  prefix: "lan-",

  theme: {
    extend: {},
  },

  // 🟢 2. 禁用 Preflight (基础样式重置)
  // 这非常重要！否则引入你的 CSS 时，会重置使用者项目的全局样式（如 h1, button, img 等），导致样式崩坏。
  corePlugins: {
    preflight: false,
  },

  plugins: [require("@tailwindcss/typography")],
};
