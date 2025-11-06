import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // 测试配置
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },

  // 开发服务器配置
  server: {
    port: 8000,
    open: true,
    cors: true,
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 多页面应用配置
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'src/pages/homepage.html'),
      },
    },
  },

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets'),
      '@data': path.resolve(__dirname, './data'),
    },
  },

  // 公共基础路径
  base: './',

  // 静态资源处理
  assetsInclude: ['**/*.geojson'],
});
