# 财升宝 APP 智能化升级 Demo

基于 Next.js 16 的可交互产品原型，包含发现、看盘、选股、经典版联动、全局搜索、AI 解读、自选同步等演示流程。

## 本地运行

环境要求：Node.js `>=20.9.0`，推荐使用项目 `.nvmrc` 指定的 Node.js 22。

```bash
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 质量检查

```bash
npm run lint
npm test
```

`npm test` 会先执行 Next.js 生产构建，再运行原型关键交互检查。

## 部署到 Vercel

项目采用标准 Next.js App Router，无必填环境变量，可直接部署：

1. 将本目录提交到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 中选择 `Add New > Project` 并导入仓库。
3. Framework Preset 保持 `Next.js`，Root Directory 选择本目录。
4. 不需要修改 Build Command、Output Directory 或添加环境变量，直接点击 Deploy。

也可以安装 Vercel CLI 后从本目录部署：

```bash
npx vercel
```

## 项目结构

- `app/page.tsx`：页面、状态与交互逻辑。
- `app/globals.css`：原型全部视觉样式。
- `app/api/recommendations/route.ts`：发现页 Banner 推荐演示接口。
- `public/`：原型图片资源。
- `tests/rendered-html.test.mjs`：构建与关键交互回归检查。
- `vercel.json`：明确声明 Vercel 使用 Next.js 框架。

## 数据说明

当前为演示原型，行情、资讯和 AI 回答均为示例数据。自选股状态保存在浏览器 `localStorage`，不依赖数据库或外部服务。
