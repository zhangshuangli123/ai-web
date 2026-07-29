# zhangshuangli123.github.io

Shuangli 的个人 portfolio 网站源码。

- 技术栈：Vite + React 19
- 部署：GitHub Pages（推送到 `main` 分支自动发布）
- 主色：Klein Blue `#002FA7` · 米白 `#F5F5F5` · 衬线体 Cormorant Garamond

## 本地开发

```bash
NODE_ENV=development npm install --include=dev
npm run dev        # 本地预览 http://localhost:5173
npm run build      # 打包到 dist/
npm run preview    # 本地预览生产包
```

> 注意：如果你的 npm 环境有 `omit=dev` 或 `NODE_ENV=production`，
> 必须显式带上 `NODE_ENV=development` + `--include=dev`，否则 vite 装不上。

## 部署

推送到 `main` 分支即可，GitHub Actions 会自动构建并发布到 Pages。
首次使用需要在 GitHub 仓库设置里：
Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。

## 目录结构

```
src/
  components/    # 各板块组件（Hero / About / Experience / Projects / Photography / Contact / Footer / Nav）
  hooks/         # useFadeIn 滚动淡入
  styles/        # global.css / App.css
public/
  favicon.svg    # 站点图标
```

## 内容更新

- 文案：直接改各 `*.jsx` 里的中文占位
- 照片：放到 `public/photos/`，把 `Photography.jsx` 里的色块换成 `<img src="/photos/xxx.jpg">`
- 项目：编辑 `Projects.jsx` 里的 `projects` 数组
- 时间线：编辑 `Experience.jsx` 里的 `timeline` 数组
