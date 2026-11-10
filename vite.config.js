import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// 本站为 Layui 经典多页静态站点（非 ESM 模块体系），
// Vite 仅作为开发服务器提供实时刷新，构建交由 scripts/build.mjs 完成静态拷贝与压缩。
export default defineConfig({
  root: 'src',
  base: './',
  server: {
    port: 8080,
    open: false,
  },
  build: {
    // 与构建脚本输出目录保持一致，供 `vite preview` 预览
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: false,
  },
});
