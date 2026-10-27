#!/bin/zsh
# 推送到 GitHub Pages：地址固定 https://elvaliusz0402-tech.github.io/pocket-english/
# 用法：在项目目录下执行  zsh scripts/publish.sh ["提交说明"]
set -e

cd "$(dirname "$0")/.."
REPO_HTTPS="https://github.com/elvaliusz0402-tech/pocket-english.git"
TOKEN_FILE="$HOME/.workbuddy/secrets/github_token"

if [ ! -s "$TOKEN_FILE" ]; then
  echo "❌ 找不到发布凭据：$TOKEN_FILE"
  echo "   请到 https://github.com/settings/tokens/new 生成一个勾选 repo 的 Classic Token，"
  echo "   然后执行： mkdir -p ~/.workbuddy/secrets && printf '%s' '你的Token' > $TOKEN_FILE && chmod 600 $TOKEN_FILE"
  exit 1
fi
chmod 600 "$TOKEN_FILE" 2>/dev/null || true

# askpass：让 git 从文件读取凭据，避免 Token 出现在进程参数或 git 配置里
ASKPASS=$(mktemp /tmp/gh_askpass.XXXXXX)
cat > "$ASKPASS" <<EOF
#!/bin/sh
case "\$1" in
  *Username*) echo "x-access-token" ;;
  *) cat "$TOKEN_FILE" ;;
esac
EOF
chmod 700 "$ASKPASS"
trap 'rm -f "$ASKPASS"' EXIT

if [ ! -d .git ]; then
  git init -b main -q
  git config user.name "WorkBuddy"
  git config user.email "noreply@workbuddy.cn"
fi
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_HTTPS"

if [ -z "$(git status --porcelain)" ]; then
  echo "● 没有变更，无需推送"
  exit 0
fi

MSG="${1:-chore: 更新 $(date '+%Y-%m-%d %H:%M')}"
git add -A
git commit -q -m "$MSG"
GIT_ASKPASS="$ASKPASS" GIT_TERMINAL_PROMPT=0 git push -u origin main

echo "✅ 已推送。约 1 分钟后生效：https://elvaliusz0402-tech.github.io/pocket-english/"
