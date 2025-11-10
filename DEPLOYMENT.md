# FlagStar 部署指南

本指南介绍如何将 FlagStar（国旗之星）项目部署到 Cloudflare Pages。

**开发团队**: UFlag team

## 前提条件

- GitHub 账号
- Cloudflare 账号（免费）
- 已将项目推送到 GitHub 仓库

## 部署到 Cloudflare Pages

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **登录 Cloudflare**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 登录你的账号

2. **创建 Pages 项目**
   - 在左侧菜单选择 "Workers & Pages"
   - 点击 "Create application" → "Pages" → "Connect to Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问你的 GitHub
   - 选择 FlagStar 仓库

4. **配置构建设置**
   ```
   项目名称: uflag（或自定义）
   生产分支: main
   框架预设: None（或 Vite）

   构建配置:
   - 构建命令: npm run build
   - 构建输出目录: dist
   - 根目录: /（保持默认）

   环境变量:
   - NODE_VERSION: 20
   ```

5. **开始部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（通常 2-5 分钟）

6. **访问网站**
   - 部署完成后会得到一个 `*.pages.dev` 域名
   - 例如：`https://uflag.pages.dev` 或 `https://flaglore.pages.dev`

### 方法二：使用 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署项目**
   ```bash
   # 构建项目
   npm run build

   # 部署到 Cloudflare Pages
   wrangler pages deploy dist --project-name=uflag
   ```

## 自动部署

连接 GitHub 后，Cloudflare Pages 会自动监听仓库变化：

- **推送到 main 分支** → 自动部署到生产环境
- **创建 Pull Request** → 自动创建预览环境
- **合并 PR** → 自动部署到生产环境

## 自定义域名

1. 在 Cloudflare Pages 项目设置中选择 "Custom domains"
2. 添加你的域名（需要域名已在 Cloudflare 管理 DNS）
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动配置完成

## 项目结构说明

构建后的 `dist` 目录结构：

```
dist/
├── index.html           # 欢迎页面（入口）
├── homepage.html        # 主应用页面
├── _redirects          # Cloudflare Pages 重定向规则
├── assets/             # 打包后的资源
│   ├── *.js            # JavaScript 文件
│   ├── *.css           # 样式文件
│   ├── images/         # 国旗图片
│   └── geo/            # 地理数据
└── data/               # JSON 数据文件
    ├── countries/      # 国家数据
    ├── i18n/          # 国际化文件
    └── lists/         # 国家列表
```

## 环境变量

当前项目不需要配置额外的环境变量。如需添加：

1. 在 Cloudflare Pages 项目设置中选择 "Settings" → "Environment variables"
2. 添加变量名和值
3. 选择适用环境（Production / Preview）
4. 保存并重新部署

## 性能优化建议

1. **启用自动压缩**（Cloudflare 默认启用）
   - Brotli 压缩
   - Gzip 压缩

2. **配置缓存规则**
   - 静态资源（图片、JSON）自动缓存
   - HTML 文件不缓存，确保内容更新

3. **使用 Cloudflare CDN**
   - 全球 300+ 节点自动加速
   - 自动优化图片加载

## 故障排查

### 构建失败

- 检查 Node.js 版本是否为 20
- 确保所有依赖已正确安装
- 查看构建日志了解具体错误

### 页面 404 错误

- 确保 `_redirects` 文件已正确复制到 dist 目录
- 检查 `public/_redirects` 文件内容

### 资源加载失败

- 检查 `vite.config.ts` 中的 `base` 配置为 `'./'`
- 确认静态资源已正确复制到 dist 目录

### 路径问题

- 确保所有路径使用相对路径
- 检查 `index.html` 中的跳转路径是否正确

## 本地预览

构建后本地预览：

```bash
# 方法一：使用 Vite 预览
npm run preview

# 方法二：使用 Wrangler 本地开发
wrangler pages dev dist

# 方法三：使用简单的 HTTP 服务器
npx http-server dist -p 8080
```

## 持续集成

项目已配置 Husky 和 lint-staged，每次提交会自动：

- 运行 ESLint 检查
- 格式化代码
- 运行 TypeScript 类型检查

确保提交前代码质量。

## 监控和分析

Cloudflare Pages 提供：

- 实时访问统计
- 构建历史记录
- 部署日志
- Web Analytics（可选）

在项目 Dashboard 中查看这些信息。

## 回滚版本

如果新版本出现问题：

1. 在 Cloudflare Pages 项目中选择 "Deployments"
2. 找到之前的稳定版本
3. 点击 "..." → "Rollback to this deployment"
4. 确认回滚

## 支持

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Vite 文档](https://vitejs.dev/)
- [项目 Issues](https://github.com/Freedom-Frank/FlagStar/issues)
