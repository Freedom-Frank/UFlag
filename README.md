# UFlag

> 认识世界，从认识国旗开始

## 项目简介

UFlag 是一个专注于世界各国国旗学习的交互式网络应用程序。通过浏览、记忆训练和知识测试三大核心功能，帮助用户系统性地学习和记忆全球200多个国家和地区的国旗。

## 功能特性

### 🌍 浏览国家
- **多维度筛选**：支持按大洲、国旗特征（星星、十字、月牙等16种标签）筛选
- **智能搜索**：实时搜索国家名称（支持中英文）
- **灵活排序**：按国家名称、大洲或随机顺序浏览
- **详细信息**：查看国旗图片、国家基本信息及国旗设计元素

### 📚 记忆训练
- **科学算法**：基于间隔重复（Spaced Repetition）的记忆系统
- **自适应学习**：根据掌握程度调整复习频率
- **进度跟踪**：实时记录学习状态和熟悉度

### 🎯 知识测试
- **多种模式**：
  - 看国旗选国家
  - 看国家选国旗
  - 混合测验
- **即时反馈**：答题后立即显示正确答案和解析
- **成绩统计**：详细的测验结果分析

### 🌐 3D地球仪
- **交互式地球**：基于 Three.js 的3D地球仪渲染
- **星空背景**：15000个闪烁星星营造太空氛围
- **精确检测**：鼠标悬停和点击国家即可查看详情
- **流畅交互**：支持拖拽旋转、滚轮缩放、惯性旋转
- **自动旋转**：静止后自动旋转展示

### 📊 统计分析
- **学习进度**：可视化展示学习完成度
- **数据报告**：按大洲、组织等维度生成统计图表
- **历史记录**：保存学习历史和测验成绩

## 技术架构

### 前端技术
- **TypeScript 5.9+**：完整的类型安全和现代化开发体验
- **Vite 7.2**：快速的开发服务器和构建工具
- **Three.js 0.181**：3D图形渲染引擎
- **HTML5**：语义化标记结构
- **CSS3**：现代化样式设计，支持响应式布局

### 数据管理
- **JSON格式**：结构化存储国家信息
- **本地存储**：使用 LocalStorage 保存用户学习进度
- **多数据源**：支持联合国、G20、欧盟、非盟等多个国际组织数据
- **GeoJSON**：标准地理数据格式用于3D地球仪

### 工程化
- **模块化架构**：ES6 模块系统
- **代码规范**：ESLint + Prettier
- **Git 钩子**：Husky + lint-staged
- **类型检查**：完整的 TypeScript 类型定义

### 设计特点
- **移动优先**：适配各种屏幕尺寸
- **离线可用**：静态资源，无需服务器
- **性能优化**：图片懒加载、代码分割、客户端数据处理

## 项目结构

```
UFlag/
├── index.html                 # 入口着陆页
├── src/                       # 源代码目录
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts
│   ├── lib/                   # 核心库
│   │   ├── i18n-core.ts       # 国际化核心模块
│   │   ├── constants.ts       # 常量定义
│   │   ├── utils.ts           # 工具函数
│   │   ├── storage.ts         # 本地存储管理
│   │   ├── data-loader.ts     # 数据加载
│   │   └── state.ts           # 状态管理
│   ├── modules/               # 功能模块
│   │   ├── browse.ts          # 浏览功能
│   │   ├── quiz.ts            # 知识测验
│   │   ├── memory.ts          # 记忆训练
│   │   ├── stats.ts           # 统计分析
│   │   ├── country-detail.ts  # 国家详情
│   │   └── globe.ts           # 3D地球仪
│   ├── pages/                 # HTML 页面
│   │   └── homepage.html      # 主应用程序
│   ├── css/                   # 样式文件
│   │   └── styles.css         # 主样式表
│   ├── app.ts                 # 主应用协调器
│   ├── main.ts                # 主入口
│   └── index-entry.ts         # 首页入口
├── data/                      # 数据文件
│   ├── countries/             # 国家数据
│   │   ├── countries_un.json  # 联合国成员国
│   │   └── countries_and_oganizations.json
│   ├── i18n/                  # 国际化数据
│   │   └── i18n.json
│   └── lists/                 # 组织成员列表
│       ├── un_list.txt        # 联合国成员
│       ├── g20_list.txt       # G20成员
│       ├── eu_list.txt        # 欧盟成员
│       ├── au_list.txt        # 非盟成员
│       └── cn_diplomatic.txt  # 中国外交关系国家
├── assets/                    # 静态资源
│   ├── images/                # 图片资源
│   │   └── flags/             # 国旗图片 (200+ PNG)
│   └── geo/                   # 地理数据
│       ├── world_detailed.geojson
│       └── world_simple.geojson
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 构建配置
└── package.json               # 项目依赖配置
```

## 快速开始

### 在线访问
直接访问部署的网页版本（GitHub Pages / 其他托管平台）

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/UFlag.git
cd UFlag
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
在浏览器中打开：`http://localhost:8000/`

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

构建产物将输出到 `dist/` 目录，可直接部署到静态托管服务。

## 数据说明

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

### 支持的国旗特征标签
- **符号元素**：星星、十字、月牙、太阳
- **图案类型**：动物、植物、几何图形、复杂徽章
- **条纹样式**：水平条纹、垂直条纹、对角条纹
- **特殊设计**：联合杰克、北欧十字、纯色
- **区域特色**：泛非色彩、泛阿拉伯色彩

### 数据来源
- 联合国成员国名单（193个成员国）
- G20 成员国和地区
- 欧洲联盟成员国
- 非洲联盟成员国
- 其他国际组织成员数据

## 浏览器兼容性

- ✅ Chrome 90+（推荐，完整支持WebGL）
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer（不支持）

> **注意**：3D地球仪功能需要浏览器支持 WebGL

## 开发计划

- [x] TypeScript 完整迁移
- [x] 3D交互式地球仪
- [x] 多语言支持（中文、英文）
- [ ] 增加音频发音功能
- [ ] 实现社交分享功能
- [ ] 开发移动端原生应用
- [ ] 添加更多国际组织数据
- [ ] 添加单元测试覆盖

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加某个新特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢

- 国旗图片资源来自公开数据源
- 地理数据基于 GeoJSON 标准格式
- 感谢所有为本项目提供建议和反馈的用户

---

**如果觉得这个项目对你有帮助，请给个 ⭐ Star 支持一下！**
