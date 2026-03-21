# 国内上线部署（推荐）

本项目是前后端分离：

- `frontend/`：Vite 构建的静态站点
- `backend/`：Node/Express API

为了在国内市场稳定访问，推荐使用阿里云/腾讯云/华为云（ECS + 负载均衡/HTTPS），并完成 ICP 备案后绑定域名。

## 方案 A：最省心（Docker 一键）

### 1) 准备服务器

- 购买国内云服务器（建议 2C/4G 起）
- 安装 Docker + Docker Compose
- 若使用域名对外提供服务：需先 ICP 备案

### 2) 准备环境变量

在服务器目录创建 `.env`（与 `docker-compose.yml` 同级），填入（参考项目根目录的 `.env.example`）：

```env
DATABASE_URL=
DATABASE_SSL=true
DATABASE_POOL_MAX=10

VOLC_API_KEY=
VOLC_API_SECRET=
VOLC_MODEL=

ALIYUN_SMS_ACCESS_KEY_ID=
ALIYUN_SMS_ACCESS_KEY_SECRET=
ALIYUN_SMS_SIGN_NAME=
ALIYUN_SMS_TEMPLATE_CODE=
```

#### `DATABASE_URL` 示例（阿里云 RDS PostgreSQL）

```env
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@RDS内网地址:5432/DB_NAME?sslmode=require
```

注意：如果密码包含 `@`、`:`、`/`、`&` 等特殊字符，必须做 URL 编码，否则会导致数据库认证失败。更省事的做法是把数据库密码改为仅字母数字。

### 3) 启动

```bash
docker compose up -d --build
```

### 4) 访问

- 前端：`http://服务器IP:8080/`
- 后端：`http://服务器IP:3001/api/health`（如你有健康检查路由，可自行添加）

## 方案 B：生产级（推荐）

### 1) Nginx/SLB + HTTPS

- 前端静态站建议走 Nginx
- 后端 API 建议走同一域名下 `/api` 反代到后端容器/进程
- 配置 HTTPS（阿里云/腾讯云证书）

### 2) 国内合规

- 域名 ICP 备案（网站/小程序）
- 若涉及短信/实名：按供应商要求完成资质

## 注意事项

- 不要把密钥写入 Git 仓库；只放到服务器环境变量/密钥管理
- 建议开启日志与监控（Nginx access/error log、容器日志）
- 如要提升稳定性：把数据库连接池、超时、AI 服务的超时/重试参数配置成环境变量
