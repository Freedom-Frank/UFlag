import { defineConfig } from 'vitest/config';
import path from 'path';
import { cpSync, existsSync, readFileSync, writeFileSync, rmSync } from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'build-optimization',
      closeBundle() {
        console.log('📦 开始处理静态资源...');

        // 1. 复制静态数据和资源
        cpSync('data', 'dist/data', { recursive: true, force: true });
        cpSync('assets/images', 'dist/assets/images', { recursive: true, force: true });
        cpSync('assets/geo', 'dist/assets/geo', { recursive: true, force: true });
        console.log('✅ 静态资源已复制');

        // 2. 处理 homepage.html
        const homepageSrc = 'dist/src/pages/homepage.html';
        const homepageDest = 'dist/homepage.html';

        if (existsSync(homepageSrc)) {
          let content = readFileSync(homepageSrc, 'utf-8');
          content = content.replace(/\.\.\/\.\.\/assets\//g, './assets/');
          writeFileSync(homepageDest, content);
          console.log('✅ homepage.html 已处理');
        }

        // 3. 修正 index.html 路径
        const indexPath = 'dist/index.html';
        if (existsSync(indexPath)) {
          let indexContent = readFileSync(indexPath, 'utf-8');
          indexContent = indexContent.replace(
            /['"]src\/pages\/homepage\.html['"]/g,
            "'./homepage.html'"
          );
          writeFileSync(indexPath, indexContent);
          console.log('✅ index.html 路径已修正');
        }

        // 4. 清理临时目录
        try {
          if (existsSync('dist/src')) {
            rmSync('dist/src', { recursive: true, force: true });
            console.log('✅ 临时目录已清理');
          }
        } catch (e: unknown) {
          const error = e as Error;
          console.warn('⚠️ 清理临时目录失败:', error.message);
        }

        console.log('🎉 构建完成！');
      },
    },
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

  // 开发服务器
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
    emptyOutDir: true,
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

  // 基础路径（相对路径，适配 Cloudflare Pages）
  base: './',

  // 公共资源目录（_redirects 会自动复制）
  publicDir: 'public',

  // 静态资源处理
  assetsInclude: ['**/*.geojson'],
});
