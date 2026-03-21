# 解梦APP - 梦境解析与心理探索

一款基于中西方权威梦境理论的Web应用，帮助用户探索梦境背后的心理意义。

## 功能特点

- **专业解析**：融合弗洛伊德、荣格心理学与中国传统解梦理论
- **语音输入**：支持语音描述梦境，自动转文字进行解析
- **梦境日记**：记录所有梦境，追踪情绪变化与主题趋势
- **心理画像**：基于梦境历史生成个人心理画像分析
- **响应式设计**：完美适配手机和电脑

## 技术栈

### 前端

- React 18 + TypeScript
- TailwindCSS
- Framer Motion
- Zustand (状态管理)
- Recharts (图表)

### 后端

- Node.js + Express
- MongoDB + Mongoose
- OpenAI API (支持兼容API)

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6.0+

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置环境变量

复制后端环境变量模板：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/dreamapp
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
```

### 启动服务

```bash
# 启动MongoDB（如果未运行）
mongod

# 启动后端服务
cd backend
npm run dev

# 新终端启动前端服务
cd frontend
npm run dev
```

访问 <http://localhost:3000> 开始使用。

## 项目结构

```
Dream/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── services/        # 服务层
│   │   ├── types/           # 类型定义
│   │   └── index.ts         # 入口文件
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── store/           # 状态管理
│   │   ├── types/           # 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## API 接口

### 用户相关

- `POST /api/users` - 创建/更新用户
- `GET /api/users/:userId` - 获取用户信息

### 梦境相关

- `POST /api/dreams` - 创建梦境并解析
- `GET /api/dreams/:userId` - 获取梦境列表
- `GET /api/dream/detail/:dreamId` - 获取梦境详情
- `DELETE /api/dreams/:dreamId` - 删除梦境

### 画像相关

- `GET /api/profile/:userId` - 获取用户画像
- `POST /api/profile/:userId/refresh` - 刷新用户画像
- `GET /api/profile/:userId/trends` - 获取情绪趋势

## 解析理论来源

### 西方心理学经典

- 弗洛伊德《梦的解析》
- 荣格分析心理学
- 现代心理学研究

### 中国文化经典

- 《周公解梦》
- 《周礼》六梦分类
- 道家梦论

## 隐私保护

- 梦境数据严格加密存储
- 用户信息仅用于解析
- 支持删除所有个人数据

## 许可证

MIT License
