# UFlag 工程化配置说明

## 概述

UFlag 项目已完成现代化工程化改造，使用以下技术栈：

- **构建工具**: Vite 7.2.0
- **语言**: TypeScript 5.9.3
- **代码规范**: ESLint + Prettier
- **Git 钩子**: Husky + lint-staged
- **测试框架**: Vitest + jsdom

## 项目结构

```
UFlag/
├── src/                          # 源代码目录
│   ├── js/                       # JavaScript 文件（待迁移）
│   │   ├── i18n-core.js         # 国际化核心模块
│   │   └── script.js            # 主应用逻辑
│   ├── css/                      # 样式文件
│   │   └── styles.css           # 主样式表
│   ├── pages/                    # HTML 页面
│   │   └── homepage.html        # 主应用页面
│   ├── test/                     # 测试文件
│   │   ├── setup.ts             # 测试环境配置
│   │   └── example.test.ts      # 示例测试
│   ├── main.ts                   # 主应用入口
│   ├── index-entry.ts            # 首页入口
│   └── vite-env.d.ts            # Vite 类型声明
├── data/                         # 数据文件
│   ├── countries/               # 国家数据
│   ├── i18n/                    # 国际化翻译
│   └── lists/                   # 组织成员列表
├── assets/                       # 静态资源
│   ├── images/                  # 图片资源
│   └── geo/                     # 地理数据
├── dist/                         # 构建输出（自动生成）
├── node_modules/                 # 依赖包（自动生成）
├── index.html                    # 首页入口
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── .eslintrc.cjs                # ESLint 配置
├── .prettierrc.json             # Prettier 配置
├── package.json                 # 项目配置
└── .gitignore                   # Git 忽略文件
```

## 可用命令

### 开发相关

```bash
# 启动开发服务器（支持热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码质量

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format
```

### 测试相关

```bash
# 运行测试
npm test

# 运行测试（带 UI 界面）
npm run test:ui
```

## 开发流程

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:8000` 启动，支持：
- 热模块替换（HMR）
- 自动刷新
- 源码映射

### 3. 代码规范

项目配置了自动化代码规范检查：

- **提交前检查**: 使用 Husky + lint-staged，在 git commit 时自动运行 ESLint 和 Prettier
- **代码格式化**: 使用 Prettier 统一代码风格
- **代码质量**: 使用 ESLint 检查潜在问题

### 4. 构建部署

```bash
# 构建生产版本
npm run build

# 构建输出在 dist/ 目录
# 可以直接部署到静态托管服务（如 GitHub Pages、Netlify 等）
```

## TypeScript 配置

### 路径别名

项目配置了以下路径别名，可以简化导入：

```typescript
import something from '@/components/Something'; // 对应 src/
import data from '@data/countries/countries.json'; // 对应 data/
import image from '@assets/images/logo.png'; // 对应 assets/
```

### 严格模式

TypeScript 启用了严格模式，包括：
- `strict: true` - 所有严格类型检查
- `noUnusedLocals: true` - 禁止未使用的局部变量
- `noUnusedParameters: true` - 禁止未使用的参数
- `noFallthroughCasesInSwitch: true` - 禁止 switch 穿透

## ESLint 和 Prettier 配置

### ESLint 规则

- 基于 `eslint:recommended` 和 `@typescript-eslint/recommended`
- 集成 Prettier，避免格式化冲突
- 警告而非错误：`@typescript-eslint/no-explicit-any`、`no-console`

### Prettier 配置

- 使用单引号
- 使用分号
- 2 空格缩进
- 行宽限制 100 字符
- 尾随逗号（ES5 风格）

## Git 工作流

### 提交前自动检查

配置了 Husky pre-commit 钩子，在提交时自动：

1. 对暂存的 `.ts`、`.tsx` 文件运行 ESLint 和 Prettier
2. 对暂存的 `.css`、`.html`、`.json` 文件运行 Prettier
3. 如果检查失败，提交将被阻止

### 绕过检查（不推荐）

如果确实需要跳过检查：

```bash
git commit --no-verify -m "message"
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并查看覆盖率
npm test -- --coverage

# 使用 UI 界面运行测试
npm run test:ui
```

### 编写测试

测试文件应放在 `src/test/` 目录下，命名为 `*.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';

describe('功能模块', () => {
  it('应该正确工作', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## 下一步计划

### JavaScript 到 TypeScript 迁移

目前项目中的核心逻辑文件（`script.js`、`i18n-core.js`）仍使用 JavaScript。建议渐进式迁移：

1. **创建类型定义文件** - 为现有 JS 文件创建 `.d.ts` 类型声明
2. **模块化拆分** - 将大文件拆分为更小的模块
3. **逐步迁移** - 一个模块一个模块地转换为 TypeScript
4. **添加单元测试** - 为迁移的模块添加测试覆盖

### 建议的迁移顺序

1. `i18n-core.js` → `i18n-core.ts` （较小，独立）
2. `script.js` → 拆分为多个模块：
   - `types.ts` - 类型定义
   - `constants.ts` - 常量
   - `utils.ts` - 工具函数
   - `api.ts` - 数据加载
   - `ui.ts` - UI 相关
   - `app.ts` - 主应用逻辑

## 常见问题

### Q: 为什么开发服务器启动很慢？

A: 首次启动需要安装依赖和预构建，后续启动会很快。

### Q: 如何添加新的依赖？

A: 使用 `npm install <package-name>` 安装依赖。开发依赖使用 `-D` 参数。

### Q: 构建后的文件可以直接部署吗？

A: 是的，`dist/` 目录包含所有静态文件，可以直接部署到任何静态托管服务。

### Q: 如何禁用 ESLint 某个规则？

A: 在 `.eslintrc.cjs` 中修改 `rules` 配置，或在代码中使用注释：

```typescript
// eslint-disable-next-line rule-name
const something = ...;
```

## 参考资料

- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vitest 官方文档](https://vitest.dev/)
- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
