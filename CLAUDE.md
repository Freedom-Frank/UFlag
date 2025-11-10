# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 语言设置

**重要**: 请使用中文进行所有回答和交流，包括代码注释、文档和用户交互。

## 项目概览

**UFlag** 是一个用于学习和识别世界各国国旗的教育性网络应用程序。它为200多个国家和地区提供浏览、记忆训练和知识测试功能。

## 开发环境

### 技术栈
- **前端**: HTML5, CSS3, 原生JavaScript (ES6+)
- **数据**: JSON格式的国家信息
- **资源**: PNG格式国旗图片
- **架构**: 静态客户端应用程序（无服务器依赖）

### 本地开发
1. 直接在浏览器中打开 `index.html`
2. 无需构建工具或依赖安装
3. 在现代浏览器中进行测试

### 关键文件
- `index.html` - 项目介绍着陆页（根目录）
- `src/pages/homepage.html` - 主应用程序界面
- `src/js/script.js` - 核心应用程序逻辑（约270KB）
- `src/css/styles.css` - 主要样式表，包含CSS变量和响应式设计
- `data/countries/countries_un.json` - 联合国成员国数据（200+条目）

## 项目结构

```
UFlag/
├── index.html                 # 入口着陆页
├── src/                       # 源代码目录
│   ├── pages/                 # HTML 页面
│   │   └── homepage.html      # 主应用程序
│   ├── js/                    # JavaScript 文件
│   │   ├── script.js          # 核心应用逻辑
│   │   └── i18n-core.js       # 国际化核心模块
│   └── css/                   # 样式文件
│       └── styles.css         # 主样式表
├── data/                      # 数据文件
│   ├── countries/             # 国家数据
│   │   ├── countries_un.json  # 联合国成员国
│   │   ├── countries_and_oganizations.json  # 国家和组织
│   │   └── countries.json     # 完整国家数据（如果存在）
│   ├── i18n/                  # 国际化数据
│   │   └── i18n.json          # 翻译数据
│   └── lists/                 # 组织成员列表
│       ├── un_list.txt        # 联合国成员
│       ├── g20_list.txt       # G20成员
│       ├── eu_list.txt        # 欧盟成员
│       ├── au_list.txt        # 非盟成员
│       └── cn_diplomatic.txt  # 中国外交关系国家
└── assets/                    # 静态资源
    ├── images/                # 图片资源
    │   ├── flags/             # 国旗图片（200+ PNG文件）
    │   └── ASIASIM.png        # 赞助商标志
    └── geo/                   # 地理数据
        ├── world_detailed.geojson  # 详细世界地图
        └── world_simple.geojson    # 简化世界地图
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

### 静态托管
- 部署到GitHub Pages、Netlify或类似平台
- 无需服务器端渲染
- 推荐使用HTTPS

### 文件结构注意事项
- 所有引用使用相对路径
- 国旗图片从 `assets/images/flags/` 目录加载
- JSON 数据文件在 `data/` 目录下按类型分类
- 源代码文件在 `src/` 目录下按类型组织

## 开发说明

### 代码风格
- 使用ES6+功能的原生JavaScript
- 语义化HTML5结构
- CSS3自定义属性
- script.js中的模块化函数组织

### 浏览器兼容性
- 仅支持现代浏览器（不支持IE）
- 移动浏览器优化
- 触摸手势支持

### 性能
- 客户端数据处理
- 图片延迟加载
- 本地存储用户偏好设置

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