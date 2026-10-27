#!/bin/zsh
# 一键：启动本地服务 + 打开 Cloudflare 临时隧道，把生成的 HTTPS 链接给手机用
# 用法：zsh scripts/share.sh   （保持终端开着，Ctrl+C 退出时隧道关闭）
set -e
cd "$(dirname "$0")/.."
PORT=8799

# 1) 本地静态服务（已在跑就复用）
if ! curl -s -o /dev/null "http://127.0.0.1:$PORT/index.html"; then
  nohup python3 -m http.server $PORT --bind 127.0.0.1 > /tmp/pocket-english-server.log 2>&1 &
  sleep 1
  echo "✓ 本地服务 http://localhost:$PORT"
else
  echo "✓ 本地服务已在运行"
fi

# 2) 隧道二进制（存放在 ~/.workbuddy/bin，不随项目部署上传）
BIN="$HOME/.workbuddy/bin/cloudflared"
if [ ! -x "$BIN" ]; then
  mkdir -p "$(dirname "$BIN")" /tmp/cf-dl
  ARCH=$(uname -m)
  case "$ARCH" in
    arm64) CF="cloudflared-darwin-arm64.tgz" ;;
    x86_64) CF="cloudflared-darwin-amd64.tgz" ;;
    *) echo "仅支持 macOS"; exit 1 ;;
  esac
  curl -sL -o /tmp/cf-dl/cf.tgz "https://github.com/cloudflare/cloudflared/releases/latest/download/$CF"
  tar xzf /tmp/cf-dl/cf.tgz -C /tmp/cf-dl && mv /tmp/cf-dl/cloudflared "$BIN"
fi

# 3) 起隧道并打印地址
echo "正在建立公网 HTTPS 隧道…"
URL=$("$BIN" tunnel --url "http://127.0.0.1:$PORT" --no-autoupdate 2>&1 >/dev/null | tee /tmp/cf-tunnel.log & sleep 6; grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-tunnel.log | head -1)
echo ""
echo "================================================"
echo "  手机打开这个地址（Safari / Chrome）："
echo "  $URL"
echo "  iPhone：分享 → 添加到主屏幕"
echo "  Android：菜单 → 添加到主屏幕"
echo "  注意：Mac 合盖或退出本脚本后隧道失效；"
echo "  安装后应用已离线缓存，仍可正常使用。"
echo "================================================"
wait
