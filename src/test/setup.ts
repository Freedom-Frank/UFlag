// Vitest 测试环境设置
import { afterEach } from 'vitest';

// 每次测试后清理
afterEach(() => {
  // 清理 DOM 等操作
  document.body.innerHTML = '';
});

// 扩展 expect 匹配器（如果需要）
// expect.extend({});
