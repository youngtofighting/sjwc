# 玄机问策

一个可部署到 GitHub Pages 的纯静态中文命理与卜筮工具。

所有排盘与起卦计算都在浏览器中完成：没有 API 路由、没有服务端、没有环境变量，也不会上传出生资料或问题内容。静态版不提供 AI 解读。

## 本地运行

需要 Node.js 20+：

```bash
npm ci
npm run dev
```

打开 `http://localhost:3000`。

## 部署到 GitHub Pages

1. 将此目录推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages** 中，将 Source 设为 **GitHub Actions**。
3. 每次推送到 `main` 都会通过 `.github/workflows/deploy-pages.yml` 自动构建并发布。

工作流会自动识别两种地址：普通项目仓库发布到 `https://<用户名>.github.io/<仓库名>/`；若仓库名为 `<用户名>.github.io`，则发布到域名根路径。

## 检查与构建

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

构建后的可部署文件在 `out/`，由 GitHub Actions 自动上传。`public/.nojekyll` 会防止 GitHub Pages 对 Next.js 的 `_next` 静态资源进行 Jekyll 处理。

## 使用边界

本工具用于传统文化体验与自我反思，不构成医疗、法律、投资、心理或人身安全方面的专业意见。
# sjwc
