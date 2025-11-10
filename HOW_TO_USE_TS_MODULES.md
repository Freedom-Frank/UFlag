# 如何使用 TypeScript 模块

本文档说明如何在 FlagStar（国旗之星）项目中使用已迁移的 TypeScript 模块。

**开发团队**: UFlag team

## 项目结构

```
src/
├── types/
│   └── index.ts           # 类型定义
├── lib/
│   ├── i18n-core.ts       # 国际化核心
│   ├── constants.ts       # 常量定义
│   ├── utils.ts           # 工具函数
│   ├── storage.ts         # 本地存储
│   └── data-loader.ts     # 数据加载
└── js/
    └── script.js          # 主应用逻辑（待迁移）
```

## 使用示例

### 1. 类型定义

```typescript
import type { Country, Language, QuizStats } from './types';

// 使用国家类型
const country: Country = {
  code: 'cn',
  nameCN: '中国',
  nameEN: 'China',
  continent: '亚洲',
  styles: ['星星', '复杂徽章'],
};

// 使用语言类型
const currentLang: Language = 'zh';

// 使用测验统计类型
const stats: QuizStats = {
  totalTests: 10,
  totalQuestions: 100,
  correctAnswers: 85,
  accuracy: 85,
  averageTime: 120,
  bestScore: 95,
};
```

### 2. 国际化模块

```typescript
import { i18n, t } from './lib/i18n-core';

// 初始化翻译数据
i18n.setTranslations({
  zh: {
    welcome: '欢迎',
    hello: '你好，{name}',
  },
  en: {
    welcome: 'Welcome',
    hello: 'Hello, {name}',
  },
});

// 基本翻译
const welcome = t('welcome'); // "欢迎"

// 带参数的翻译
const greeting = t('hello', { name: '张三' }); // "你好，张三"

// 切换语言
i18n.setLanguage('en');

// 订阅语言变化
const unsubscribe = i18n.subscribe((lang) => {
  console.log('Language changed to:', lang);
});

// 获取本地化的国家名称
const countryName = i18n.getCountryName(country); // "中国" 或 "China"

// 更新 DOM
i18n.updateDOM();
```

### 3. 常量模块

```typescript
import { DATA_SOURCES, STYLES_LIST, DEFAULT_SORT_METHOD } from './lib/constants';

// 使用数据源配置
const unCountries = DATA_SOURCES.un.countries;
console.log(`UN has ${unCountries.length} member countries`);

// 使用样式列表
STYLES_LIST.forEach((style) => {
  console.log(style);
});

// 使用默认配置
const sortMethod = DEFAULT_SORT_METHOD; // "name"
```

### 4. 工具函数模块

```typescript
import {
  formatTime,
  shuffleArray,
  getRandomElements,
  sortCountriesByName,
  calculateAccuracy,
  debounce,
} from './lib/utils';

// 格式化时间
const time = formatTime(125); // "02:05"

// 打乱数组
const shuffled = shuffleArray([1, 2, 3, 4, 5]);

// 随机获取元素
const random = getRandomElements(countries, 10);

// 排序国家
const sorted = sortCountriesByName(countries, true);

// 计算准确率
const accuracy = calculateAccuracy(85, 100); // 85

// 防抖搜索
const debouncedSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);
```

### 5. 本地存储模块

```typescript
import {
  getStats,
  saveStats,
  getLearningProgress,
  markCountryLearned,
  getPreferredLanguage,
  exportAllData,
} from './lib/storage';

// 获取测验统计
const stats = getStats();
console.log(`Total tests: ${stats.totalTests}`);

// 保存统计
saveStats({
  ...stats,
  totalTests: stats.totalTests + 1,
});

// 获取学习进度
const progress = getLearningProgress();

// 标记国家为已学习
markCountryLearned('cn');

// 获取首选语言
const lang = getPreferredLanguage(); // "zh" 或 "en"

// 导出所有数据（备份）
const backup = exportAllData();
console.log('Backup data:', backup);
```

### 6. 数据加载模块

```typescript
import {
  loadCountries,
  loadTranslations,
  preloadFlags,
  getFlagImageUrl,
  loadGeoJSON,
} from './lib/data-loader';

// 加载国家数据
const countries = await loadCountries();
console.log(`Loaded ${countries.length} countries`);

// 加载翻译数据
const translations = await loadTranslations();
i18n.setTranslations(translations);

// 预加载国旗图片
const codes = countries.map((c) => c.code);
await preloadFlags(codes);

// 获取国旗图片 URL
const flagUrl = getFlagImageUrl('cn'); // "../../assets/images/flags/cn.png"

// 加载 GeoJSON 数据
const geoData = await loadGeoJSON('world_simple.geojson');
```

## 在现有 JS 代码中使用

虽然新模块是 TypeScript 编写的，但它们会被编译为 JavaScript，可以在现有的 `script.js` 中使用。

### 方式 1：通过全局对象（向后兼容）

```javascript
// i18n 已自动导出到全局
window.i18n.setLanguage('en');
window.t('welcome');

// filteredCountries 等全局变量仍然可用
window.filteredCountries = countries;
```

### 方式 2：ES6 导入（推荐）

将 `script.js` 转换为 `script.ts` 后：

```typescript
import { i18n, t } from './lib/i18n-core';
import { DATA_SOURCES } from './lib/constants';
import { loadCountries } from './lib/data-loader';
import { getStats, saveStats } from './lib/storage';

// 使用导入的模块
async function initApp() {
  const countries = await loadCountries();
  const translations = await loadTranslations();

  i18n.setTranslations(translations);
  i18n.updateDOM();

  renderCountries(countries);
}
```

## 渐进式迁移策略

### 阶段 1：使用新模块（当前）

- ✅ 新的 TS 模块已经可用
- ✅ 在新代码中使用导入
- ⚠️ 旧的 `script.js` 保持不变

### 阶段 2：拆分 script.js

建议按以下顺序拆分：

```typescript
// 1. 创建状态管理模块
src/lib/state.ts

// 2. 创建浏览功能模块
src/modules/browse.ts

// 3. 创建记忆训练模块
src/modules/memory.ts

// 4. 创建测验模块
src/modules/quiz.ts

// 5. 创建 3D 地球仪模块
src/modules/globe.ts

// 6. 创建统计模块
src/modules/stats.ts

// 7. 创建主应用协调器
src/app.ts
```

### 阶段 3：完全迁移

- 删除 `script.js`
- 所有功能都使用 TS 模块
- 移除全局变量依赖
- 使用现代模块化架构

## 最佳实践

### 1. 类型安全

```typescript
// ❌ 不好
function renderCountry(country: any) {
  // ...
}

// ✅ 好
function renderCountry(country: Country) {
  // TypeScript 会提供类型检查和自动补全
}
```

### 2. 导入路径别名

```typescript
// ❌ 相对路径
import { Country } from '../../../types';

// ✅ 使用别名
import { Country } from '@/types';
```

### 3. 错误处理

```typescript
// ✅ 始终处理异步错误
try {
  const countries = await loadCountries();
  // 处理数据
} catch (error) {
  console.error('Failed to load countries:', error);
  // 显示错误提示
}
```

### 4. 类型导入

```typescript
// ✅ 使用 type-only 导入
import type { Country, Language } from '@/types';
import { loadCountries } from '@/lib/data-loader';
```

## 开发工具支持

### VS Code

安装推荐的扩展：
- ESLint
- Prettier
- TypeScript Vue Plugin

### 自动补全

TypeScript 提供完整的自动补全和类型提示：

```typescript
const country: Country = {
  // 输入 country. 会自动提示所有属性
  code: 'cn',
  nameCN: '中国',
  // ...
};
```

### 重构支持

使用 F2 重命名符号，TypeScript 会自动更新所有引用。

## 故障排查

### 构建错误

```bash
# 检查 TypeScript 错误
npm run lint

# 重新构建
npm run build
```

### 模块未找到

```typescript
// 检查路径别名配置 (tsconfig.json)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 类型错误

```bash
# 使用 @ts-ignore 临时禁用（不推荐）
// @ts-ignore
const value = anyValue;

# 或者添加适当的类型注解
const value: any = anyValue;
```

## 参考资料

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite TypeScript 指南](https://vitejs.dev/guide/features.html#typescript)
- [TS_MIGRATION.md](./TS_MIGRATION.md) - 详细的迁移进度
- [ENGINEERING.md](./ENGINEERING.md) - 工程化配置说明
