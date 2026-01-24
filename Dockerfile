# ========== 第一阶段：构建 ==========
# 使用 Node.js 22 Alpine 版本（与本地开发版本一致）
# AS builder 给这个阶段命名，后面可以引用
FROM node:22-alpine AS builder

WORKDIR /app

# 先复制 package.json 和 package-lock.json
# 利用缓存机制，依赖没变就不重新安装
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建参数：API 地址
# ARG 是构建时参数，可以通过 --build-arg 传入
# 默认值是 http://localhost:8000
ARG API_BASE_URL=http://localhost:8000

# 替换代码中的 API 地址
# sed -i: 直接修改文件
# s|old|new|g: 全局替换
RUN sed -i "s|http://localhost:8000|${API_BASE_URL}|g" src/api/urls.ts

# 执行构建，生成 dist 目录
RUN npm run build

# ========== 第二阶段：运行 ==========
# 使用 nginx 作为 Web 服务器
# 多阶段构建的好处：最终镜像只包含运行所需的文件，不包含 node_modules
FROM nginx:alpine

# 从构建阶段复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 启动 Nginx
# daemon off: 前台运行，Docker 需要前台进程来保持容器运行
CMD ["nginx", "-g", "daemon off;"]
