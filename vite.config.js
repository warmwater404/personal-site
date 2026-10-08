import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 用相对路径打包。这样无论部署在
  //   https://你的用户名.github.io/          （根目录）
  // 还是
  //   https://你的用户名.github.io/仓库名/    （子目录）
  // 静态资源都能正常加载，不需要改配置。
  base: "./",

  server: {
    port: 5173,
    open: true, // 启动后自动打开浏览器
  },
});
