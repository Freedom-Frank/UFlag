import { defineConfig } from 'vitest/config';
import path from 'path';
import { cpSync } from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        const fs = require('fs');

        // 复制 data 目录到 dist
        cpSync('data', 'dist/data', { recursive: true, force: true });
        // 复制 assets 目录到 dist（但排除已经被 Vite 处理的文件）
        cpSync('assets/images', 'dist/assets/images', { recursive: true, force: true });
        cpSync('assets/geo', 'dist/assets/geo', { recursive: true, force: true });
        console.log('✅ 静态资源已复制到 dist 目录');

        // 移动 homepage.html 到 dist 根目录并修正路径
        const homepageSrc = 'dist/src/pages/homepage.html';
        const homepageDest = 'dist/homepage.html';

        if (fs.existsSync(homepageSrc)) {
          let content = fs.readFileSync(homepageSrc, 'utf-8');
          // 修正资源路径：从 ../../assets/ 改为 ./assets/
          content = content.replace(/\.\.\/\.\.\/assets\//g, './assets/');
          fs.writeFileSync(homepageDest, content);
          console.log('✅ homepage.html 已移动到 dist 根目录并修正路径');

          // 删除旧的目录结构
          try {
            fs.rmSync('dist/src', { recursive: true, force: true });
            console.log('✅ 已清理临时目录');
          } catch (e: unknown) {
            const error = e as Error;
            console.log('⚠️  清理临时目录失败:', error.message || e);
          }
        }
      }
    }
  ],
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
