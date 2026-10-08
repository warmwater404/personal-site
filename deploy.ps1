<#
  一键部署脚本
  ---------------------------------------------------------------------------
  作用：把当前网站代码提交并推送到你的 GitHub 仓库，推送后 GitHub Actions
        会自动构建并发布到 GitHub Pages。

  用法（在项目根目录打开 PowerShell 后执行）：
      .\deploy.ps1
      或直接带仓库地址：
      .\deploy.ps1 -RepoUrl https://github.com/你的用户名/my-homepage.git

  可选参数：
      -SkipBuild   跳过构建验证（你已经手动跑过 npm.cmd run build 时用）
      -SkipPush    只准备本地提交，不推送

  如果提示「禁止运行脚本」，先执行一次：
      Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#>

param(
  [string]$RepoUrl,
  [switch]$SkipBuild,
  [switch]$SkipPush
)

# 注意：这里必须用 Continue，不能用 Stop。
# git 即使在成功时也会往 stderr 写内容（push 的传输进度、换行符提示等），
# 在 Stop 模式下 PowerShell 会把它们当成致命错误，直接中断整个脚本。
# 脚本对关键步骤都用 $LASTEXITCODE 做了显式判断，不依赖 Stop。
$ErrorActionPreference = "Continue"

# 让原生命令（git / npm）的非零退出码走 $LASTEXITCODE 判断，而不是直接抛异常
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$root = $PSScriptRoot
Set-Location $root

function Write-Step($text) { Write-Host "`n$text" -ForegroundColor Cyan }
function Write-Fail($text) { Write-Host $text -ForegroundColor Red }

# ---------------------------------------------------------------- 环境检查

# 查找 git：PATH → 常见安装位置 → GitHub Desktop 自带 → 其他程序附带的便携版
function Find-Git {
  $onPath = Get-Command git -ErrorAction SilentlyContinue
  if ($onPath) { return $onPath.Source }

  $candidates = @(
    "$env:ProgramFiles\Git\cmd\git.exe",
    "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
  )

  # GitHub Desktop 会自带一份 git，装了它就不必再单独装 Git
  $desktopRoot = Join-Path $env:LOCALAPPDATA "GitHubDesktop"
  if (Test-Path $desktopRoot) {
    Get-ChildItem $desktopRoot -Directory -Filter "app-*" -ErrorAction SilentlyContinue |
      ForEach-Object { $candidates += (Join-Path $_.FullName "resources\app\git\cmd\git.exe") }
  }

  # 其他程序附带的便携版 git（例如 VS Code / GitHub Copilot 扩展）
  Get-ChildItem $env:LOCALAPPDATA -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match 'git' } |
    ForEach-Object { $candidates += (Join-Path $_.FullName "cmd\git.exe") }

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) { return $candidate }
  }
  return $null
}

$gitExe = Find-Git

if (-not $gitExe) {
  Write-Fail "没有检测到 Git。"
  Write-Host "（已查找：系统 PATH、Git 常规安装目录、GitHub Desktop 自带、其他程序附带的便携版）" -ForegroundColor DarkGray
  Write-Host ""
  Write-Host "最省事的做法：安装 GitHub Desktop —— 它自带 Git，而且有图形界面。" -ForegroundColor Yellow
  Write-Host "  下载：https://desktop.github.com/"
  Write-Host ""
  Write-Host "或者只装 Git："
  Write-Host "  下载：https://git-scm.com/download/win"
  Write-Host ""
  Write-Host "安装完成后，重新打开一个 PowerShell 窗口，再运行本脚本。"
  exit 1
}

Write-Host "使用的 Git：$gitExe" -ForegroundColor DarkGray

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Fail "还没有安装依赖。"
  Write-Host "请先执行：npm.cmd install"
  exit 1
}

# ---------------------------------------------------------------- 仓库地址

if (-not $RepoUrl) {
  Write-Host "请粘贴你在 GitHub 上新建的仓库地址，例如："
  Write-Host "  https://github.com/你的用户名/my-homepage.git" -ForegroundColor DarkGray
  $RepoUrl = Read-Host "仓库地址"
}

$RepoUrl = "$RepoUrl".Trim()
if (-not $RepoUrl) {
  Write-Fail "没有填写仓库地址，已取消。"
  exit 1
}

# ---------------------------------------------------------------- 先验证构建

Write-Step "[1/4] 先验证能否构建…"
if ($SkipBuild) {
  Write-Host "已按参数要求跳过构建验证。" -ForegroundColor DarkGray
} else {
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    Write-Fail "构建失败。请先修好上面的报错，再重新运行部署。"
    exit 1
  }
  Write-Host "构建通过。" -ForegroundColor Green
}

# ---------------------------------------------------------------- 初始化与提交

Write-Step "[2/4] 准备本地提交…"
if (-not (Test-Path (Join-Path $root ".git"))) {
  & $gitExe init -b main 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    # 老版本 git 不支持 init -b，退回两步走
    & $gitExe init 2>&1 | Out-Null
    & $gitExe branch -M main 2>&1 | Out-Null
  }
  Write-Host "已初始化 Git 仓库（分支 main）"
}

# Git 要求提交时必须有身份，没配的话 commit 会直接报错，这里自动补上
$localName = & $gitExe config --local user.name 2>$null
$localMail = & $gitExe config --local user.email 2>$null
$globalName = & $gitExe config --global user.name 2>$null
$globalMail = & $gitExe config --global user.email 2>$null

$needName = (-not $localName) -and (-not $globalName)
$needMail = (-not $localMail) -and (-not $globalMail)

if ($needName -or $needMail) {
  $owner = $null
  if ($RepoUrl -match 'github\.com[:/]([^/]+)/') { $owner = $Matches[1] }

  if (-not $owner) {
    Write-Fail "Git 还没有配置提交身份，无法提交。请先执行下面两条命令再重试："
    Write-Host '  git config --global user.name "你的名字"'
    Write-Host '  git config --global user.email "你的邮箱"'
    exit 1
  }

  # 从仓库地址里取出用户名，只作用于这个项目，不改动你的全局配置
  if ($needName) { & $gitExe config --local user.name "$owner" 2>$null }
  if ($needMail) { & $gitExe config --local user.email "$owner@users.noreply.github.com" 2>$null }
  Write-Host "已自动补上提交身份：$owner（仅作用于本项目）" -ForegroundColor DarkGray
}

& $gitExe add .
$pending = & $gitExe status --porcelain
if ($pending) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  & $gitExe commit -m "更新个人主页（$stamp）" | Out-Null
  Write-Host "已提交本次改动"
} else {
  Write-Host "没有新的改动需要提交"
}

# ---------------------------------------------------------------- 关联远程

Write-Step "[3/4] 关联远程仓库并同步…"
# 用 git remote 列名字来探测：它不会因为「还没有 origin」而报错
$remoteAdded = $false
$remotes = @(& $gitExe remote 2>&1)
if ($remotes -contains "origin") {
  $existing = (& $gitExe remote get-url origin 2>&1 | Select-Object -First 1)
  if ("$existing".Trim() -ne $RepoUrl) {
    & $gitExe remote set-url origin $RepoUrl 2>&1 | Out-Null
    Write-Host "已更新远程地址为 $RepoUrl"
  } else {
    Write-Host "远程地址已正确配置"
  }
} else {
  & $gitExe remote add origin $RepoUrl 2>&1 | Out-Null
  $remoteAdded = $true
  Write-Host "已添加远程仓库 origin"
}

# 远端可能已经有你从「编辑模式」保存产生的提交。
# 不先同步就直接 push 会被拒绝（non-fast-forward），所以这里先合并远端改动。
& $gitExe ls-remote --exit-code --heads origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
  & $gitExe fetch origin main 2>&1 | Out-Null

  $behindRaw = (& $gitExe rev-list --count "HEAD..FETCH_HEAD" 2>&1 | Select-Object -First 1)
  $behindCount = 0
  if ("$behindRaw" -match '^\d+$') { $behindCount = [int]$behindRaw }

  if ($behindCount -gt 0) {
    Write-Host "远端有 $behindCount 个你本地没有的提交（通常来自网页上的编辑模式），正在合并…"
    & $gitExe pull --rebase origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Fail "自动合并失败：你本地改的内容和网页上改的内容撞车了。"
      Write-Host ""
      Write-Host "以网页上的内容为准来恢复（会丢弃本地这次提交）："
      Write-Host "  git rebase --abort"
      Write-Host "  git reset --hard origin/main"
      Write-Host ""
      Write-Host "执行完再把新文件（例如图片）放回对应目录，重新运行本脚本即可。"
      Write-Host "如果本地有不想丢的改动，先执行 git rebase --abort 然后手动处理。"
      exit 1
    }
    Write-Host "已合并远端改动。" -ForegroundColor Green
  } else {
    Write-Host "远端没有新提交。"
  }
} else {
  Write-Host "远端还是空仓库，无需合并。"
}

# ---------------------------------------------------------------- 推送

Write-Step "[4/4] 推送到 GitHub…"
if ($SkipPush) {
  Write-Host "已按参数要求跳过推送。本地仓库和提交都已准备好。" -ForegroundColor DarkGray
  exit 0
}

if ($remoteAdded) {
  Write-Host "第一次推送会弹出浏览器让你登录 GitHub，按提示确认即可。" -ForegroundColor DarkGray
}
& $gitExe push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Fail "推送失败。常见原因：仓库地址写错、账号没有权限、或者授权窗口没有完成登录。"
  exit 1
}

Write-Host "`n推送成功！" -ForegroundColor Green
Write-Host @"

接下来：
  · 打开仓库的 Actions 标签页，可以看到自动构建的进度
  · 约 1 分钟后访问 https://你的用户名.github.io/仓库名/

如果这次自动部署失败了，多半是因为仓库的 Pages 还没开启：
  仓库页面 → Settings → 左侧 Pages → Source 选「GitHub Actions」
  然后回到 Actions 标签页，选中最上面那次运行，点 Re-run jobs 重新跑一遍。

之后每次在网页上「保存并发布」，都会自动重新部署。
"@
