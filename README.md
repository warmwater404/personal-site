# 个人主页（可在线编辑）

一个用 **Vite + React** 构建的单页个人网站，包含个人介绍、作品集、常用链接收藏夹。

最大的特点：**登录后可以在网页上直接编辑**——以卡片形式增删、排序、修改每一个区块和区块里的每一条内容，保存后自动提交到 GitHub 仓库并重新部署上线。

---

## 它是怎么工作的

```
你在网页上编辑
      ↓  点「保存并发布」
调用 GitHub API 把内容提交到 public/content.json
      ↓  GitHub Actions 自动触发
重新构建并部署到 GitHub Pages
      ↓  约 1 分钟后
线上所有人看到更新后的页面
```

页面本身不"写死"任何内容，而是启动时去读 **`public/content.json`**，按里面的 `blocks` 数组顺序渲染。所以：

- 想改内容 → 用网页上的编辑模式（推荐）
- 想改样式/结构 → 改代码

---

## 目录结构

```
个人网页/
├─ index.html                  # 页面外壳
├─ package.json
├─ vite.config.js
├─ deploy.cmd                  # ★ 一键部署（推荐运行这个，双击也行）
├─ deploy.ps1                  #   部署脚本本体，由 deploy.cmd 调起
├─ .github/workflows/deploy.yml # 推送到 main 后自动部署
├─ public/
│  ├─ content.json             # ★ 网站内容（由编辑模式自动更新）
│  └─ avatar.svg               # 占位头像
└─ src/
   ├─ App.jsx                  # 组装：导航 + 区块列表 + 页脚 + 编辑浮层
   ├─ config.js                # GitHub 仓库设置（一般不用改）
   ├─ styles.css               # 网站样式（主题色在顶部 --accent）
   ├─ content/
   │  ├─ schemas.js            # ★ 定义「有哪些区块类型、每种有哪些字段」
   │  ├─ contentApi.js         # 读取内容 / 提交到 GitHub
   │  ├─ blockOps.js           # 区块的增删改排序（纯函数，与界面无关）
   │  ├─ document.js           # 内容规范化与「是否有未保存修改」的判断
   │  └─ defaultContent.js     # 兜底内容（拉不到 content.json 时才用）
   ├─ context/                 # 登录态、内容态、编辑器状态
   ├─ components/
   │  ├─ NavBar.jsx            # 顶部导航（条目由区块自动生成）
   │  ├─ Footer.jsx
   │  ├─ BlockRenderer.jsx
   │  └─ blocks/               # 5 种区块的渲染组件
   └─ editor/                  # 编辑模式的全部界面
      ├─ EditorLayer.jsx       # 浮层入口、底部操作栏
      ├─ BlockFrame.jsx        # 编辑态下的区块卡片外壳
      ├─ BlockDrawer.jsx       # 右侧编辑抽屉
      ├─ FieldControl.jsx      # 根据字段定义自动生成表单
      ├─ LoginDialog.jsx       # 登录与仓库设置
      └─ editor.css
```

---

## 一、首次运行

在项目根目录打开 PowerShell：

```powershell
cd C:\Users\w2388\Desktop\个人网页

npm.cmd install      # 第一次要等一两分钟
npm.cmd run dev      # 启动，会自动打开浏览器
```

> **为什么写 `npm.cmd`？** 你的 PowerShell 执行策略是默认的 `Restricted`，直接输 `npm` 会报「禁止运行脚本」。
> 想一劳永逸：先执行一次 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`。

日常只需要 `npm.cmd run dev`，改完代码保存浏览器会自动刷新。按 `Ctrl + C` 停止。

---

## 二、编辑网站（核心功能）

### 第 1 步：创建 GitHub 访问令牌

网站是纯静态的，没有服务器，所以用 **令牌** 作为登录凭证。只需做一次：

1. 打开 <https://github.com/settings/personal-access-tokens/new>
2. **Token name** 随便填，比如 `我的个人主页`
3. **Expiration** 选一个有效期（到期后需要重新生成）
4. **Repository access** 选 `Only select repositories`，**只勾选你存放网页的那一个仓库**
5. **Permissions** → 展开 `Repository permissions` → 找到 **Contents** → 设为 **Read and write**
6. 点底部 `Generate token`，**复制生成的令牌**（只显示这一次）

> 这个令牌只能改你选中的那一个仓库的内容，权限范围最小化。

### 第 2 步：登录并编辑

1. 打开网站，点右下角 **「编辑网站」**
2. 粘贴令牌，点「登录」
3. 登录成功后自动进入编辑模式，页面变成这样：

```
┌─ 🏠 首屏介绍          ↑ ↓ 隐藏 编辑内容 删除 ─┐
│                                              │
│         （这个区块的真实样子）                │
│                                              │
└──────────────────────────────────────────────┘
┌─ 👤 关于我            ↑ ↓ 隐藏 编辑内容 删除 ─┐
...
```

4. **底部操作栏**：`＋ 首屏介绍` `＋ 关于我` `＋ 作品集` `＋ 收藏夹` `＋ 自由文字` 用来添加新区块，右侧是「放弃修改 / 保存并发布 / 退出」
5. 点区块上的 **「编辑内容」**，右侧滑出抽屉，里面是这块的全部字段

### 能做什么

| 操作 | 怎么做 |
|---|---|
| 增加区块 | 底部操作栏点 `＋ 区块名` |
| 删除区块 | 区块右上角「删除」 |
| 调整区块顺序 | 区块右上角 `↑` `↓` |
| 临时隐藏区块 | 区块右上角「隐藏」（内容保留，只是访客看不到） |
| 改区块里的文字 | 「编辑内容」→ 在抽屉里改 |
| 增加作品卡片 / 经历条目 / 链接 | 抽屉里对应栏目右上角「＋ 添加」 |
| 调整条目顺序、删除条目 | 每个条目卡片右上角的 `↑` `↓` 「删除」 |
| 改导航栏上的名字 | 抽屉最上方的「导航栏里显示的名称」 |

### 第 3 步：保存

点底部 **「保存并发布」**，会提交到你的 GitHub 仓库。

- 提交成功后提示「已提交到 GitHub」
- **约 1 分钟后** GitHub Actions 完成构建，线上页面才真正更新
- 期间刷新你自己的浏览器会看到旧内容——这是正常的

改到一半不想改了，点「放弃修改」会还原到上次保存的状态。

---

## 三、部署到 GitHub Pages

### 前置

1. **装一个能提交代码的工具**（二选一）：
   - **GitHub Desktop**：<https://desktop.github.com/> —— 推荐，自带 Git 且有图形界面
   - 或者只装 **Git**：<https://git-scm.com/download/win>（一路默认下一步）

   > `deploy.ps1` 会自动去找 Git：系统 PATH、Git 常规安装目录、GitHub Desktop 自带的那份，
   > 以及其他软件附带的便携版（例如 VS Code / GitHub Copilot 扩展）。
   > 找到之后它还会自动补上提交身份，不需要你手动配环境变量或 `git config`。

2. **注册 GitHub 账号**：<https://github.com/signup>

3. **新建一个空仓库**：打开 <https://github.com/new>

   | 选项 | 怎么填 |
   |---|---|
   | Repository name | 随便起，例如 `my-homepage` |
   | 公开 / 私有 | **必须选 Public** —— 免费账号的 GitHub Pages 只支持公开仓库 |
   | Add a README file | **不要勾选** |
   | Add .gitignore / license | **都不要选** |

   点 `Create repository`，然后复制页面上的仓库地址，形如
   `https://github.com/你的用户名/my-homepage.git`

4. **先开启 Pages**：进入仓库 → `Settings` → 左侧 `Pages` → 把 `Source` 选成 **GitHub Actions**

   > **顺序很重要：先开 Pages，再推送代码。**
   > 否则第一次自动部署会因为拿不到 Pages 配置而失败。
   > 万一已经失败了也不要紧——去仓库的 `Actions` 标签页，选中最上面那次运行，
   > 点 `Re-run jobs` 就会重新跑一遍（我特意加了手动触发支持）。

### 方式一：运行一键脚本（推荐）

在项目根目录执行：

```powershell
.\deploy.cmd
```

> **为什么用 `.cmd` 而不是 `.ps1`？**
> Windows 默认禁止运行未签名的 PowerShell 脚本（报「禁止运行脚本 / 未对文件进行数字签名」）。
> `deploy.cmd` 会用 `-ExecutionPolicy Bypass` 调起 `deploy.ps1`，绕开这个限制，
> 不需要修改你系统的安全设置。也可以直接双击 `deploy.cmd`。

脚本会依次做四件事：**验证构建 → 本地提交 → 关联远程仓库（含同步远端）→ 推送**。
中途会让你粘贴仓库地址，例如 `https://github.com/你的用户名/my-homepage.git`。

如果你更想直接跑 PowerShell 脚本，也可以：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

或者一次性解除限制（这会修改你系统的设置，所以不是首选）：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

> 推送时会弹出浏览器让你登录 GitHub（你机器上的凭据管理器已经配好了），点授权即可。
>
> 推送成功后，仓库的 `Actions` 标签页会自动跑一次构建。约 1 分钟后，
> 访问 `https://你的用户名.github.io/仓库名/` 就能看到网站了。

### 方式二：手动执行

1. **本地确认能构建**：

   ```powershell
   npm.cmd run build     # 成功后会生成 dist/ 目录
   npm.cmd run preview   # 预览构建结果
   ```

2. **在 GitHub 新建仓库**（例如 `my-homepage`），选 **Public**，不要勾选 "Add a README file"。

3. **先开启 Pages**：仓库 → `Settings` → 左侧 `Pages` → `Source` 选 **GitHub Actions**
   （不要选 "Deploy from a branch"）。**先开 Pages，再推送代码**，否则第一次部署会失败。

4. **推送代码**（把地址换成你自己的仓库）：

   ```powershell
   git init -b main
   git add .
   git commit -m "初始化个人主页"
   git remote add origin https://github.com/你的用户名/my-homepage.git
   git push -u origin main
   ```

   > 第一次推送会弹出浏览器让你授权登录 GitHub，按提示确认即可。
   > 如果 git 提示要先配置提交身份，执行下面两条后重试：
   > `git config --global user.name "你的名字"`
   > `git config --global user.email "你的邮箱"`

5. 仓库自带的 `.github/workflows/deploy.yml` 会自动构建部署，进度在 `Actions` 标签页看。

6. 一两分钟后访问 `https://你的用户名.github.io/my-homepage/`

之后每次在网页上「保存并发布」，都会自动重新部署。

---

## 四、几个需要知道的限制

**1. 换图片要手动传**
编辑模式只能改文字和链接，不能上传图片。想换头像：
- 在 GitHub 仓库页面进入 `public/` 目录 → `Add file` → `Upload files` → 拖入图片 → 提交
- 然后在编辑模式里把「头像地址」改成 `./图片文件名.jpg`
- 也可以直接填一个完整网址（例如你放在图床上的图片）

**2. 令牌保存在浏览器里**
为了不用每次登录，令牌存在这台浏览器的 localStorage。在公用电脑上用完请点「退出登录」。
令牌只发往 `api.github.com`，不会发到别处。

**3. 「登录」不是安全屏障**
网站是静态的，登录界面本身挡不住谁——真正的屏障是你手里的令牌。没有令牌的人点「编辑网站」也改不了任何东西。

**4. 本地开发时需要手填仓库**
自动推断只对 GitHub Pages 的网址有效。在 `localhost` 上编辑时，点开「仓库设置」，手填 GitHub 用户名和仓库名，保存后再编辑。

---

## 五、常用命令

| 命令 | 作用 |
|---|---|
| `npm.cmd run dev` | 启动开发服务器（日常用） |
| `npm.cmd run build` | 打包到 `dist/` |
| `npm.cmd run preview` | 预览打包结果 |

---

## 六、遇到问题

**页面显示「正在加载内容…」一直不消失**
`public/content.json` 不存在或格式坏了。用编辑器打开它检查 JSON 语法（常见是多了个逗号）。

**点「保存并发布」报错**
- `令牌无效或已过期` → 重新生成令牌
- `还没有配置 GitHub 仓库` → 点「编辑网站」→ 展开「仓库设置」手填
- `GitHub 返回 404` → 用户名或仓库名写错了
- `GitHub 返回 403` → 令牌没有 `Contents: Read and write` 权限

**保存成功但线上没变化**
GitHub Actions 需要约 1 分钟。去仓库的 `Actions` 标签页确认工作流是否成功。另外浏览器缓存可能要强制刷新（`Ctrl + F5`）。

**改了代码浏览器没反应**
确认终端里的 `npm run dev` 还在运行。

**推送 GitHub 时要求输入密码**
GitHub 已不支持密码推送。用 [GitHub Desktop](https://desktop.github.com/) 图形客户端提交推送更省事。

**运行 `.\deploy.ps1` 提示「禁止运行脚本」**
这是 PowerShell 的默认安全策略（`Restricted`），不是脚本有问题。执行一次即可解除：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**终端里 `npm` 报「禁止运行脚本」**
同上，或者干脆写成 `npm.cmd`，效果一样。

---

## 七、想扩展：加一种新的区块类型

1. 在 `src/components/blocks/` 新建一个组件，接收 `data` 属性
2. 在 `src/content/schemas.js` 的 `BLOCK_TYPES` 里加一项，声明 `label` / `blank` / `fields` / `Component`
3. 把类型名加进同文件的 `BLOCK_TYPE_ORDER`

编辑表单会根据 `fields` 自动生成，不需要额外写界面代码。
