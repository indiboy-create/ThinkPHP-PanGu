# PanGu · ThinkPHP 工程矩阵

在线站点：**<https://indiboy-create.github.io/ThinkPHP-PanGu/>**

一个纯静态的项目介绍站，用于收录并介绍 [indiboy-create](https://github.com/indiboy-create) 的 ThinkPHP 生态项目：

- **think-* Composer 组件**：50 个面向 ThinkPHP 8 的能力包
- **LayuiAdmin-Iframe**：基于 Layui 的 iframe 后台前端模板
- **glide-server**：URL 参数驱动的独立缩略图服务
- **应用商店套件**：think-store、think-store-example、think-store-codeditor
- **think-static**：Composer 自动部署静态资源的插件
- **探索项目**：tpcms-sites 站群系统、xiaozhi-music MCP 音乐服务

站点产物不依赖 PHP、数据库或服务端渲染，最终输出为 `dist/` 下的静态文件，发布到 GitHub Pages。

## 工程化

工程结构参考 [LayuiAdmin-Iframe](https://github.com/indiboy-create/LayuiAdmin-Iframe)：

- **源码与产物分离**：`src/` 维护页面与资源，`dist/` 为构建产物
- **Vite 只做开发服务器**：Layui 依赖 `document.currentScript` 与 `layui.config({ base })`，不能走 Vite 打包
- **Node 构建脚本**：静态拷贝 `src → dist`，使用 Terser 压缩 JS、CleanCSS 压缩 CSS，第三方 Layui 原样保留
- **代码规范**：ESLint（flat config）+ Prettier，忽略 Layui 第三方目录
- **提交规范**：Husky + lint-staged + Commitlint（Conventional Commits）
- **自动部署**：GitHub Actions 执行 `npm ci → lint → build → check → Pages`

## 目录结构

```text
.
├─ .github/
│  └─ workflows/
│     ├─ deploy.yml           # 推送 main 或 v* 标签：安装、lint、构建、校验、部署 Pages
│     ├─ verify.yml           # Pull Request：安装、lint、构建、校验
│     └─ release.yml          # 推送 v* 标签：构建 dist、打包 zip、发布 Release 与 Packages
├─ .husky/
│  ├─ pre-commit             # lint-staged
│  └─ commit-msg             # commitlint
├─ scripts/
│  ├─ lib.mjs                # 加载 data.js、站点 URL 与 sitemap 工具
│  ├─ build.mjs              # 拷贝、压缩、生成 sitemap 与 .nojekyll
│  ├─ check.mjs              # 源码与产物校验
│  └─ generate-sitemap.mjs   # 仅生成 dist/sitemap.xml
├─ src/                      # 源码
│  ├─ index.html             # 首页
│  ├─ packages.html          # 组件矩阵（搜索、分类筛选、排序、分页）
│  ├─ package.html           # 组件详情（?name=think-jwt）
│  ├─ projects.html          # 项目列表
│  ├─ project.html           # 项目详情（?slug=think-store）
│  ├─ about.html             # 关于本站
│  ├─ 404.html               # 404 页面（自动适配子路径）
│  ├─ favicon.svg
│  ├─ robots.txt
│  ├─ component/
│  │  └─ layui/              # Layui 2.13.9 发布包（构建时原样保留）
│  └─ static/
│     ├─ css/site.css
│     ├─ js/data.js          # 组件、分类、项目数据
│     └─ js/site.js          # 渲染、筛选、分页、复制等交互
├─ dist/                     # 构建产物（不提交）
├─ .editorconfig
├─ .prettierrc.json
├─ .prettierignore
├─ .lintstagedrc.json
├─ eslint.config.js
├─ commitlint.config.js
├─ vite.config.js
├─ package.json
└─ package-lock.json
```

## 环境要求

- Node.js **>= 20**
- npm（仓库包含 `package-lock.json`，CI 使用 `npm ci`）

## 安装

```bash
npm install
```

`prepare` 会自动初始化 Husky Git 钩子。

## 本地开发

```bash
npm run dev
```

Vite 以 `src/` 为根目录，默认地址 `http://127.0.0.1:8080/`，修改 HTML/CSS/JS 后自动刷新。

## 构建与预览

```bash
npm run build     # src → dist：拷贝、压缩 JS/CSS、生成 sitemap.xml 与 .nojekyll
npm run preview   # 预览 dist 构建产物
```

构建规则：

- `src` 整体拷贝到 `dist`，每次构建前清空旧产物
- `component/layui/` 为第三方目录，不压缩、不修改
- 业务 JS 使用 Terser 压缩，CSS 使用 CleanCSS（level 2）
- 自动生成 `dist/sitemap.xml`（62 个地址）与 `dist/.nojekyll`

## 校验与规范

```bash
npm run lint      # ESLint
npm run lint:fix  # ESLint 自动修复
npm run format    # Prettier 格式化 src 下的 HTML/CSS/JS
npm run check     # 校验源码与 dist 产物
npm run sitemap   # 单独生成 dist/sitemap.xml
```

`npm run check` 依赖已构建的 `dist`，会检查：

- 组件、分类、项目的唯一性与关联关系
- 每个页面的标题、描述与 Layui / data.js / site.js 引用
- 所有站内链接与静态资源是否存在
- 组件与项目详情链接的参数是否真实存在
- 各页面 canonical 是否与 `data.site.url` 一致
- `dist/sitemap.xml` 是否覆盖全部页面、组件与项目
- `dist` 是否包含必要产物，业务 JS 是否已压缩

## 提交规范

提交信息遵循 Conventional Commits，提交时自动执行：

- `pre-commit`：lint-staged（Prettier 格式化 + ESLint 修复）
- `commit-msg`：commitlint 校验提交信息

常用格式：

```text
feat: 新增组件详情页
fix: 修正移动端导航
docs: 更新部署说明
style: 统一代码格式
refactor: 重构列表渲染
chore: 升级依赖
```

## 发布到 GitHub Pages

首次发布：

1. 打开仓库 **Settings → Pages**
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**
3. 推送 `main` 分支或 `v*` 标签，或在 Actions 中手动运行 **Deploy GitHub Pages**

工作流步骤：

```text
checkout → setup-node 22 → npm ci → npm run lint
        → npm run build → npm run check
        → configure-pages → upload-pages-artifact（dist）→ deploy-pages
```

发布完成后访问：<https://indiboy-create.github.io/ThinkPHP-PanGu/>

如果使用自定义域名，可在 **Settings → Pages → Custom domain** 中配置，GitHub 会生成 `CNAME`；同时更新 `src/static/js/data.js` 的 `site.url`、页面 canonical、`robots.txt` 与 sitemap 中的站点地址。

## 发布版本（Git Tag）

推送 `v*` 标签时会同时触发两套工作流：`Release Package` 重新构建 `dist`、打包 zip 并发布 GitHub Release 与 GitHub Packages；`Deploy GitHub Pages` 将该标签版本的 `dist` 发布到 Pages。

版本号必须与 `package.json` 保持一致，不一致时工作流会直接终止。推荐流程：

```bash
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore(release): v1.0.1"
git tag v1.0.1
git push origin main --follow-tags
```

> 不要直接使用 `npm version patch` 创建提交：它生成的提交信息是版本号，会被 commitlint 拒绝。

标签推送后工作流执行：

1. `npm ci`
2. `npm run lint`
3. 校验标签与 `package.json` 版本
4. `npm run build`（重新生成 `dist`）
5. `npm run check`
6. 将 `dist` 打包为 `pangu-v1.0.1.zip`，解压即站点根目录
7. 将 `dist` 发布到 GitHub Packages（npm 包 `@indiboy-create/thinkphp-pangu`）
8. 创建或更新对应 Release，上传 zip 附件并生成发布说明
9. 同时上传 Actions artifact `pangu-dist`

> `Deploy GitHub Pages` 与 `Release Package` 会并行触发。Pages 部署的是该标签指向的提交；之后推送 `main` 会重新部署最新提交并覆盖 Pages 内容。

### GitHub Packages

`package.json` 通过 `files` 仅发布 `dist`，包名为 `@indiboy-create/thinkphp-pangu`，registry 为 `https://npm.pkg.github.com/`。

安装前需配置 scope 并使用具备 `read:packages` 权限的 GitHub Token：

```bash
npm config set @indiboy-create:registry https://npm.pkg.github.com/
npm login --scope=@indiboy-create --auth-type=legacy --registry=https://npm.pkg.github.com
npm install @indiboy-create/thinkphp-pangu
```

GitHub Packages 不允许覆盖已发布版本，重新发布前需要提升 `package.json` 版本并重新打 tag。

## 子路径与 404

GitHub Pages 项目站点位于 `/ThinkPHP-PanGu/` 子路径：

- 页面链接与静态资源均使用相对路径，可直接在子路径下工作
- `404.html` 通过内联脚本计算仓库根路径，深层 404 时样式与链接仍然可用
- 本地 `file://` 或根路径预览时，404 页面回退到相对路径

若修改仓库名，需要同步以下位置：

1. `src/static/js/data.js` 中的 `site.url`
2. `src/404.html` 中的 `repo` 常量
3. `src/robots.txt` 中的 sitemap 地址
4. 各页面 `<link rel="canonical">`（`index.html`、`packages.html`、`package.html`、`projects.html`、`project.html`、`about.html`）

## 数据维护

所有内容集中在 `src/static/js/data.js`：

- `site`：站点名称、仓库地址、站点 URL、技术基线
- `groups`：能力分类（key、名称、图标、主题色、描述）
- `packages`：组件数据（包名、中文名、分类、简介、能力点、标签）
- `projects`：项目数据（slug、定位、特性、技术栈、安装命令、接口、关联组件）

新增组件时，`group` 必须对应 `groups` 中已有的 `key`；新增项目时，`slug` 需保持唯一。首页统计、分类数量、相关推荐均由数据自动计算。

修改数据后：

```bash
npm run build
npm run check
```

## 页面说明

| 页面 | 说明 |
| --- | --- |
| `index.html` | 首页：生态入口、应用商店发布链路、能力分类、精选组件、项目预览 |
| `packages.html` | 组件矩阵：关键词搜索、分类筛选、名称/分类排序、每页 12 条分页 |
| `package.html` | 组件详情：安装命令、核心能力、标签、同分类推荐、GitHub 链接 |
| `projects.html` | 项目列表：应用商店套件与独立项目分组 |
| `project.html` | 项目详情：定位、特性、安装启动、接口表、技术栈与相关项目 |
| `about.html` | 站点结构、整理原则与技术栈说明 |

## 说明

- 组件信息优先取自各仓库 README 与 `composer.json`，接口、配置项以源仓库为准。
- 只有名称、没有实质说明的仓库（如 think-auth、think-firewall 等）未收录为成熟组件，避免夸大能力。
- `think-sms` 的 Composer 包名为 `youvision/think-easysms`，页面中已显式标注。
- Layui 静态资源位于 `src/component/layui`，版本为 2.13.9，构建时原样复制到 `dist`。