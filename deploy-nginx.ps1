# Nginx 配置生成脚本
# 读取 .env.production 生成 nginx 配置

# 后端目标地址（可修改）
$BACKEND_TARGET = "localhost:5000"

# 检查文件
if (-not (Test-Path ".env.production")) {
    Write-Host "错误: .env.production 文件不存在" -ForegroundColor Red
    exit 1
}

# 读取配置
$envContent = Get-Content ".env.production" -Raw
$baseUrlMatch = [regex]::Match($envContent, "VITE_BASE_URL\s*=\s*(.+)")
$publicPathMatch = [regex]::Match($envContent, "VITE_PUBLIC_PATH\s*=\s*(.+)")

if (-not $baseUrlMatch.Success -or -not $publicPathMatch.Success) {
    Write-Host "错误: 无法读取配置参数" -ForegroundColor Red
    exit 1
}

$VITE_BASE_URL = $baseUrlMatch.Groups[1].Value.Trim()
$VITE_PUBLIC_PATH = $publicPathMatch.Groups[1].Value.Trim()
$currentPath = (Get-Location).Path.Replace('\', '/')

Write-Host "VITE_BASE_URL: $VITE_BASE_URL" -ForegroundColor Yellow
Write-Host "VITE_PUBLIC_PATH: $VITE_PUBLIC_PATH" -ForegroundColor Yellow
Write-Host "后端地址: $BACKEND_TARGET" -ForegroundColor Yellow

# 生成配置文件
$nginxConfig = @"
# 静态资源路径
location $VITE_PUBLIC_PATH {
    alias $currentPath/dist/;
    try_files `$uri `$uri/ /index.html;
}

# API 代理转发
location $VITE_BASE_URL {
    proxy_pass http://$BACKEND_TARGET;
    proxy_set_header Host `$host;
    proxy_set_header X-Real-IP `$remote_addr;
    proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
}
"@

$nginxConfig | Out-File -FilePath "nginx.conf" -Encoding UTF8

Write-Host "`n✓ 配置已生成到 nginx.conf" -ForegroundColor Green
Get-Content "nginx.conf"
