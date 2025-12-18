# Nakiri Monitor 部署指南

这里提供两种部署方案，推荐使用 方案 2（在服务器上编译），更方便后续维护。

### 方案 1: 本地编译 (传统方式)

适合服务器性能极弱，无法运行构建命令的情况。

本地运行 npm run build。

只上传 dist/ 文件夹和后端文件 (server.js, scraper.js 等)。

服务器运行 npm install --production。

### 方案 2: 服务器端编译 (推荐 ✅)

适合大多数情况，直接上传源码，服务器自动构建。

# 1. 文件上传

请排除 node_modules 和 dist 文件夹，上传项目根目录下所有其他文件到服务器：

需要上传的文件清单 (示例):

📁 src/ (所有前端源码)

📁 public/ (图标等)

📄 index.html

📄 package.json

📄 vite.config.js

📄 tailwind.config.js

📄 postcss.config.js

📄 server.js

📄 scraper.js

📄 database.js

⚠️ 警告:

不上传 node_modules 文件夹（文件太多传不完）。

# 2. 服务器端操作

SSH 登录服务器，执行以下命令：

## 1. 克隆并进入项目目录
```
git clone https://github.com/Polaris-Leo/Nakiri-Electricity-Monitor.git
cd Nakiri-Electricity-Monitor
```
## 2. 安装所有依赖 (包括构建工具)
### 注意：这里不要加 --production，因为我们需要 vite 来构建
```
npm install
```
## 3. 执行构建命令
### 这会在服务器上生成 dist 文件夹
```
npm run build
```
## 4. 启动/重启服务
### 确保你已经安装了 pm2 (sudo npm install -g pm2)
```
pm2 start npm --name nakiri-monitor -- run start
```
### 后续可通过下面的命令重启:
```
pm2 restart nakiri-monitor
```

# 3. 后续更新流程

以后你修改了代码，只需要：

同步修改过的源码文件到服务器。

在服务器执行：
```
npm run build
pm2 reload nakiri-monitor
```

故障排查

报错 vite: command not found:
请确保你运行的是 npm install 而不是 npm install --production。我们需要 devDependencies 里的 vite。

报错 Permission denied:
检查上传的脚本是否有执行权限，或者尝试用 sudo (一般不需要)。
