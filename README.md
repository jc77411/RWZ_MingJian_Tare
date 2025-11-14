# 明鉴 人物志（RWZ_MingJian）

明朝哪些人儿 · 初版框架，用 React + Vite 搭配 Express，基于数据种子 `data/seed.json` 提供 Era/Person/Event 的查询接口与前端展示。内容仍在持续丰富中。

## 项目概览
- 前端：React + Vite（生产构建输出到 `dist/`）
- 后端：Express（监听 `PORT=3001`，提供 `/api/...`）
- 数据：`data/seed.json`（包含朝代、人物、事件）
- 典型交互：`src/components/TimelineNav.jsx` 发起 `fetch("/api/eras")` 获取时间线数据

## 目录结构
- `server.js` 后端服务与 API 路由（端口 `3001`）
- `vite.config.js` 前端开发代理（仅开发模式生效，生产用 Nginx 反代）
- `src/` React 应用（`App.jsx`、组件与页面）
- `data/seed.json` 数据种子
- `package.json` 项目脚本与依赖
- `dist/` 生产构建输出（构建后生成）

## 快速开始（本地开发）
1. 安装 Node（推荐 `>= 20.19.0`）
2. 安装依赖（推荐使用 pnpm）
   - 启用 pnpm：`corepack enable && corepack prepare pnpm@latest --activate`
   - 安装依赖：`pnpm install`（有锁文件时用 `--frozen-lockfile`）
3. 启动后端（终端 A）
   - `PORT=3001 pnpm start` 或 `node server.js`
4. 启动前端（终端 B）
   - `pnpm dev`（默认 `http://localhost:5173`，代理 `/api` 到 `http://localhost:3001`）
5. 生产构建
   - `pnpm build`（输出到 `dist/`）

建议在 `package.json` 添加如下脚本：
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173",
    "start": "node server.js"
  }
}
```

## 生产部署（宝塔面板 SOP）
### 1) 环境准备
- 安装 Node（面板插件或 nvm），版本 `>= 20.19.0`
- 安装 pnpm：`corepack enable && corepack prepare pnpm@latest --activate` 或 `npm i -g pnpm`
- 验证：`node -v`、`npm -v`、`pnpm -v`

### 2) 上传与依赖安装
- 上传代码到 `/www/wwwroot/<YourSite>`
- 面板或 SSH：
  - `cd /www/wwwroot/<YourSite>`
  - `pnpm install`（有锁用 `--frozen-lockfile`）
  - `pnpm build`（生成 `dist/`）

### 3) 后端常驻（PM2/Node 项目管理器）
- 添加项目：
  - 根目录：`/www/wwwroot/<YourSite>`
  - 启动命令：`pnpm start`
  - 环境变量：`NODE_ENV=production`，`PORT=3001`
  - 选择合适 Node 版本（如 20）
- 验证接口：`curl http://127.0.0.1:3001/api/eras`

### 4) 前端静态与反向代理（Nginx）
- 网站目录指向：`/www/wwwroot/<YourSite>/dist`
- 站点配置（核心片段）：
```nginx
server {
    listen 80;
    server_name <your-domain>;

    root /www/wwwroot/<YourSite>/dist;
    index index.html;

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
- 重载：`nginx -t && nginx -s reload`

### 5) 域名与 HTTPS
- DNS A 记录：将 `<your-domain>` 指向你的服务器公网 IP（仅保留一个正确 IP）
- 防火墙与安全组开放：`80/TCP`、`443/TCP`
- 面板 `网站 → SSL` 申请并启用证书（如需 HTTPS）

### 6) 验证
- 本机强制命中：`curl -I http://127.0.0.1 -H 'Host: <your-domain>'`
- 接口反代：`curl http://127.0.0.1/api/eras -H 'Host: <your-domain>'`
- 外网测试：`curl http://<your-domain>/` 与 `curl http://<your-domain>/api/eras`

## 常见问题与解决
- 启动跑到 `npm test` 报错
  - 原因：无 `start` 脚本
  - 解决：在 `package.json` 添加 `start: node server.js`，面板使用该命令
- `pnpm: command not found`
  - 解决：`corepack enable && corepack prepare pnpm@latest --activate` 或 `npm i -g pnpm`
- `EBADENGINE`（Node 版本不满足）
  - 解决：升级到 `>= 20.19.0`，重新安装依赖再构建
- `Cannot GET /`
  - 原因：将整站代理到后端；Express 仅提供 `/api/...`
  - 解决：Nginx 托管 `dist/`，仅对 `/api` 反代；其余走 `try_files` 回退
- 外网 404 / NXDOMAIN
  - 原因：域名未解析或解析到多台 IP（另一台未配置）
  - 解决：添加正确 A 记录，仅保留一条；或保证所有 IP 的站点配置一致


## 后续规划
- 丰富 `data/seed.json` 的人物/事件数据
- 增加搜索、筛选与分页
- 增加前端样式与移动端优化
- 引入更完整的错误处理与日志
