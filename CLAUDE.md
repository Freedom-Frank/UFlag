# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 语言设置

**重要**: 请使用中文进行所有回答和交流，包括代码注释、文档和用户交互。

## 项目概览

**FlagStar（国旗之星）** 是一个用于学习和识别世界各国国旗的教育性网络应用程序。它为200多个国家和地区提供浏览、记忆训练和知识测试功能。

**开发团队**: UFlag team

## 开发环境

### 技术栈
- **前端**: HTML5, CSS3, TypeScript
- **构建工具**: Vite 7.x
- **3D 渲染**: Three.js（用于地球仪功能）
- **数据**: JSON格式的国家信息
- **资源**: PNG格式国旗图片、GeoJSON地理数据
- **架构**: 静态客户端应用程序（无服务器依赖）
- **部署**: Cloudflare Pages

### 本地开发
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:8000

# 4. 生产构建
npm run build

# 5. 预览构建产物
npm run preview
```

### 关键文件
- `index.html` - 项目介绍着陆页（根目录）
- `src/pages/homepage.html` - 主应用程序界面
- `src/app.ts` - 应用程序主入口和路由
- `src/main.ts` - 主应用逻辑入口
- `src/modules/*.ts` - 功能模块（browse, memory, quiz, globe, stats, country-detail）
- `src/lib/*.ts` - 工具库（i18n, storage, utils, data-loader）
- `src/css/styles.css` - 主要样式表
- `data/countries/countries_un.json` - 联合国成员国数据（200+条目）
- `vite.config.ts` - Vite 构建配置
- `wrangler.toml` - Cloudflare Pages 配置

## 项目结构

```
FlagStar/
├── index.html                 # 入口着陆页
├── package.json               # 项目依赖和脚本
├── vite.config.ts             # Vite 构建配置
├── wrangler.toml              # Cloudflare Pages 配置
├── tsconfig.json              # TypeScript 配置
├── src/                       # 源代码目录（TypeScript）
│   ├── pages/                 # HTML 页面
│   │   └── homepage.html      # 主应用程序
│   ├── app.ts                 # 应用主入口和路由管理
│   ├── main.ts                # 主应用逻辑入口
│   ├── index-entry.ts         # 入口页面脚本
│   ├── modules/               # 功能模块
│   │   ├── browse.ts          # 国旗浏览模块
│   │   ├── memory.ts          # 记忆训练模块
│   │   ├── quiz.ts            # 知识测试模块
│   │   ├── globe.ts           # 3D 地球仪模块
│   │   ├── stats.ts           # 统计分析模块
│   │   └── country-detail.ts  # 国家详情模块
│   ├── lib/                   # 工具库
│   │   ├── i18n-core.ts       # 国际化核心
│   │   ├── storage.ts         # 本地存储
│   │   ├── utils.ts           # 工具函数
│   │   ├── data-loader.ts     # 数据加载
│   │   ├── state.ts           # 状态管理
│   │   └── constants.ts       # 常量定义
│   ├── types/                 # TypeScript 类型定义
│   │   ├── country.ts         # 国家数据类型
│   │   ├── memory.ts          # 记忆训练类型
│   │   └── quiz.ts            # 测验类型
│   └── css/                   # 样式文件
│       └── styles.css         # 主样式表
├── data/                      # 数据文件
│   ├── countries/             # 国家数据
│   │   ├── countries_un.json  # 联合国成员国
│   │   ├── countries_and_oganizations.json  # 国家和组织
│   │   └── countries.json     # 完整国家数据
│   ├── i18n/                  # 国际化数据
│   │   └── i18n.json          # 翻译数据
│   └── lists/                 # 组织成员列表
│       ├── un_list.txt        # 联合国成员
│       ├── g20_list.txt       # G20成员
│       ├── eu_list.txt        # 欧盟成员
│       ├── au_list.txt        # 非盟成员
│       └── cn_diplomatic.txt  # 中国外交关系国家
├── assets/                    # 静态资源
│   ├── images/                # 图片资源
│   │   ├── flags/             # 国旗图片（200+ PNG文件）
│   │   └── ASIASIM.png        # 赞助商标志
│   └── geo/                   # 地理数据
│       ├── world_detailed.geojson  # 详细世界地图
│       └── world_simple.geojson    # 简化世界地图
├── public/                    # 公共资源（自动复制到 dist）
│   └── _redirects             # Cloudflare Pages 路由重定向
└── docs/                      # 项目文档
    └── MODULE_ISOLATION.md    # 模块独立性工程化文档
```

## 数据结构

### 国家数据格式
```json
{
  "code": "cn",
  "nameCN": "中国",
  "nameEN": "China",
  "continent": "亚洲",
  "styles": ["星星", "复杂徽章"]
}
```

### 数据源
- **un**: 联合国193个成员国
- **g20**: G20成员（19个国家 + 2个区域组织）
- **euu**: 欧洲联盟
- **auu**: 非洲联盟
- **china_diplomatic**: 与中华人民共和国有外交关系的国家
- **asiasim**: 亚洲仿真联盟

### 国旗特征
16种特征标签：星星, 十字, 月牙, 太阳, 动物, 植物, 几何图形, 水平条纹, 垂直条纹, 对角条纹, 联合杰克, 泛非色彩, 泛阿拉伯色彩, 北欧十字, 纯色, 复杂徽章

## 核心功能

### 主应用程序模块 (homepage.html)
1. **浏览国家** - 带搜索和筛选功能的国旗浏览
2. **记忆训练** - 间隔重复学习系统
3. **知识测试** - 多种测验模式和评分机制
4. **统计分析** - 学习进度跟踪

### 关键JavaScript功能
- 多个国际组织的数据源管理
- 实时国家名称搜索
- 按大洲和国旗特征筛选
- 按名称、大洲或随机排序
- 间隔重复算法的记忆训练
- 多种模式的测验系统
- 进度跟踪和分析功能

## 设计系统

### CSS变量
- 配色方案：蓝色和金色（国际组织风格）
- 移动优先设计的响应式断点
- 动画和过渡效果
- 无障碍考虑

### 响应式设计
- 移动端优化，支持触摸操作
- 桌面端适当缩放布局
- 键盘导航支持

## 部署

### Cloudflare Pages（当前方式）

**生产环境**: https://flagstar-16a.pages.dev

**配置**：
- 构建命令: `npm run build`
- 输出目录: `dist`
- Node 版本: `20`
- 框架预设: None（手动配置）

**自动部署**：
- 推送到 `main` 分支自动触发部署
- 每次部署约 2-5 分钟
- 支持预览部署（PR 分支）

**本地测试部署产物**：
```bash
npm run build
npm run preview
```

### 构建流程

Vite 构建后自动执行以下优化：
1. 复制静态资源（data, assets）到 dist
2. 处理 homepage.html 并移到 dist 根目录
3. 修正所有资源路径为相对路径
4. 复制 public/_redirects 用于 SPA 路由
5. 清理临时目录

### 文件结构注意事项
- 所有引用使用相对路径（`./`）
- 国旗图片从 `assets/images/flags/` 目录加载
- JSON 数据文件在 `data/` 目录下按类型分类
- TypeScript 源代码在 `src/` 目录下按模块组织
- GeoJSON 文件在 `assets/geo/` 目录

## 开发说明

### 代码风格
- **TypeScript**: 使用严格模式，定义完整的类型
- **模块化**: 每个功能模块独立，避免相互依赖
- **ES6+**: 使用现代 JavaScript 特性（async/await, 解构等）
- **语义化HTML**: 使用 HTML5 语义标签
- **CSS变量**: 使用 CSS 自定义属性统一样式

### 浏览器兼容性
- 仅支持现代浏览器（不支持 IE）
- 移动浏览器优化
- 触摸手势支持
- 推荐浏览器：Chrome, Firefox, Safari, Edge（Chromium）

### 性能
- 客户端数据处理
- Vite 代码分割和懒加载
- 图片按需加载
- 本地存储用户偏好设置
- 构建产物自动压缩和优化

## 模块独立性与隔离（重要！）

**必读文档**: [`docs/MODULE_ISOLATION.md`](docs/MODULE_ISOLATION.md)

### 核心要求

在开发或修改任何模块时，**必须遵循**以下原则：

#### 1. 防止重复初始化
```typescript
// ✅ 每个模块都必须有初始化标志
let moduleInitialized = false;

export function initModule(): void {
  if (moduleInitialized) return;

  // 绑定事件监听器...

  moduleInitialized = true;
}
```

#### 2. 实现清理方法
如果模块会创建动态元素（弹窗、消息、页面等），**必须**实现 `cleanup()` 方法：

```typescript
cleanup(): void {
  // 清理所有动态创建的元素
  const popup = document.querySelector('.my-popup');
  if (popup) popup.remove();

  // 隐藏动态页面
  const dynamicSection = document.getElementById('dynamic-section');
  if (dynamicSection) dynamicSection.style.display = 'none';
}
```

#### 3. 在 App 中注册清理
在 `src/app.ts` 的 `onSectionHide()` 方法中调用模块的清理方法：

```typescript
private onSectionHide(section: Section): void {
  switch (section) {
    case 'my-module':
      myModule.cleanup();
      break;
  }
}
```

### 检查清单（新建/修改模块时）

- [ ] 添加初始化标志，防止重复初始化
- [ ] 事件监听器只在 `initModule()` 中绑定一次
- [ ] 动态元素优先在模块 section 内创建
- [ ] 如果添加到 `document.body` 或 `.content`，必须实现 `cleanup()`
- [ ] 在 `app.ts` 中注册清理方法
- [ ] 测试模块切换，确保无残留内容

### 常见问题

**问题**：模块切换后，上一个模块内容仍然显示
**原因**：动态元素未清理
**解决**：参考 [`docs/MODULE_ISOLATION.md`](docs/MODULE_ISOLATION.md) 的"常见问题排查"章节

### 相关提交记录

- `a54ff93` - 确保各模块相互独立，防止干扰
- `60e1a8a` - 修复模块切换后上一个模块仍显示的问题
- `9e9959b` - 修复记忆训练的学习页面出现在其他模块下方的问题

---

## Git 提交规范

### 核心原则：无 AI 痕迹

**所有 Git 提交必须保持自然、专业，不包含任何 AI 工具标识**

❌ **禁止出现**：
- AI 工具的签名或标识
- "Generated with ..." 声明
- "Co-Authored-By: Claude/AI" 署名
- 机器人 emoji 或其他 AI 标识

✅ **正确做法**：
- 提交信息简洁、清晰、专业
- 使用 Conventional Commits 格式
- 提交看起来像人类开发者写的

### 提交格式

```
<类型>: <简短描述>

<详细说明（可选）>
```

**类型列表**：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 测试相关
- `chore` - 构建/工具链
- `build` - 构建系统
- `ci` - CI/CD 配置

### 提交示例

```bash
# Bug 修复
git commit -m "fix: 修复首页跳转路径问题

将跳转路径从 'src/pages/homepage.html' 改为 './homepage.html'
修复部署后点击按钮无法跳转的问题"

# 新功能
git commit -m "feat: 添加 3D 地球仪功能

- 集成 Three.js 库
- 加载 GeoJSON 世界地图数据
- 支持鼠标交互和国家高亮"

# 配置更新
git commit -m "chore: 更新 Cloudflare Pages 配置

- Node 版本从 18 升级到 20
- 添加 pages_build_output_dir 配置"
```

### 文件提交策略

**永远不提交**：
- `.claude/settings.local.json` - 本地设置
- `*_GUIDE.md` - 个人指南文档
- `dist/` - 构建产物
- `node_modules/` - 依赖

**必须提交**：
- 源代码（`src/**/*.ts`）
- 配置文件（`package.json`, `vite.config.ts`, `wrangler.toml`）
- 数据文件（`data/**/*`）
- 静态资源（`assets/**/*`, `public/**/*`）
- 文档（`README.md`, `CLAUDE.md`, `docs/**/*`）

### 提交流程

```bash
# 1. 检查状态
git status

# 2. 查看变更
git diff

# 3. 逐个添加文件（推荐）
git add <文件1> <文件2> <文件3>

# 4. 确认暂存区
git status
git diff --cached

# 5. 提交（无 AI 痕迹）
git commit -m "类型: 描述"

# 6. 推送
git push origin main
```

**详细指南**: 参考个人指南文档 `GIT_COMMIT_GUIDE.md`（不在版本控制中）

---

## 相关文档

### 项目文档
- `README.md` - 项目介绍（如果存在）
- `CLAUDE.md` - 本文档，Claude Code 项目指南
- `docs/MODULE_ISOLATION.md` - 模块独立性工程化文档

### 个人指南（不在版本控制中）
- `GIT_COMMIT_GUIDE.md` - Git 提交详细策略
- `DEPLOYMENT_GUIDE.md` - Cloudflare Pages 部署指南
- `CLAUDE_MAINTENANCE_GUIDE.md` - CLAUDE.md 维护策略

### 配置文件
- `.claude/git-commit-rules.md` - Git 提交规则（供 Claude Code 参考）
- `.claude/settings.local.json` - Claude Code 本地设置（不提交）

---

**文档版本**: 2.0
**最后更新**: 2025-11-19
**更新内容**: 反映 TypeScript 迁移、Vite 构建、Cloudflare Pages 部署