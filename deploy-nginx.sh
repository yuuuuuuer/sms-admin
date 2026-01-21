#!/bin/bash

# Nginx 配置生成脚本
# 读取 .env.production 生成 nginx 配置

set -e

# 后端目标地址（可修改）
BACKEND_TARGET="http://localhost:5000"

# 检查文件
if [ ! -f ".env.production" ]; then
    echo "错误: .env.production 文件不存在"
    exit 1
fi

# 读取配置
VITE_BASE_URL=$(grep "^VITE_BASE_URL" .env.production | sed 's/VITE_BASE_URL[[:space:]]*=[[:space:]]*//' | tr -d ' ')
VITE_PUBLIC_PATH=$(grep "^VITE_PUBLIC_PATH" .env.production | sed 's/VITE_PUBLIC_PATH[[:space:]]*=[[:space:]]*//' | tr -d ' ')

if [ -z "$VITE_BASE_URL" ] || [ -z "$VITE_PUBLIC_PATH" ]; then
    echo "错误: 无法读取配置参数"
    exit 1
fi

echo "VITE_BASE_URL: $VITE_BASE_URL"
echo "VITE_PUBLIC_PATH: $VITE_PUBLIC_PATH"
echo "后端地址: $BACKEND_TARGET"

# 生成配置文件
cat > "nginx.conf" << EOF
# 静态资源路径
location $VITE_PUBLIC_PATH {
    alias $(pwd)/dist/;
    try_files \$uri \$uri/ /index.html;
}

# API 代理转发
location $VITE_BASE_URL {
    proxy_pass $BACKEND_TARGET;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
}
EOF

echo "✓ 配置已生成到 nginx.conf"
cat nginx.conf
