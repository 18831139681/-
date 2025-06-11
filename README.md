Vue3电商平台

基于Vue3 + Vite + Element Plus的电商平台前端项目

技术栈
- 核心框架：Vue 3 (Composition API)
- 构建工具：Vite
- 状态管理：Pinia
- 路由管理：Vue Router
- UI组件库：Element Plus
- HTTP请求：Axios
- 模拟数据：Mock.js

1. 功能模块
- 用户系统
  - 登录/注册
  - 个人中心
- 商品系统
  - 商品分类
  - 商品列表
  - 商品详情
  - 商品搜索
- 购物车系统
  - 添加商品
  - 修改数量
  - 删除商品
  - 结算
- 订单系统
  - 订单列表
  - 订单详情
  - 订单状态跟踪


2. 项目结构
```
src/
├── api/            # 接口封装
├── assets/         # 静态资源
├── components/     # 通用组件
├── mock/           # 模拟数据
├── router/         # 路由配置
├── stores/         # Pinia状态管理
├── utils/          # 工具函数
└── views/          # 页面组件
```


3. 开发指南
### 3.1 安装使用到的依赖
```bash
# Vue Router
npm install vue-router@^4.5.1

# Pinia
npm install pinia@^3.0.3

# Element Plus
npm install element-plus@^2.9.11

# Element Plus图标
npm install @element-plus/icons-vue@^2.3.1

# Axios
npm install axios@^1.9.0

# Mock.js
npm install mockjs@^1.1.0

# js-cookie
npm install js-cookie@^3.0.5

# NProgress
npm install nprogress@^0.2.0

# Vue插件
npm install @vitejs/plugin-vue@^5.2.2 --save-dev

# 高德地图控件
npm install @amap/amap-jsapi-loader --save
```

### 3.2 启动开发服务器
```bash
npm run dev
```

### 3.3 构建生产版本
```bash
npm run build
```

### 3.4 预览生产版本
```bash
npm run preview
```

### 测试账号
- 用户名：admin
- 密码：123456

### 注
由于图片从CDN获取，可能加载缓慢