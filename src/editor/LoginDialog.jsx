import { useEffect, useState } from "react";
import {
  clearRepoOverride,
  isRepoConfigured,
  resolveRepoConfig,
  writeRepoOverride,
} from "../config";
import { useAuth } from "../context/AuthContext";

const TOKEN_PAGE = "https://github.com/settings/personal-access-tokens/new";

/** 登录对话框：粘贴 GitHub 访问令牌 + 仓库设置 */
export default function LoginDialog({ onClose }) {
  const { login, logout, status, error, user, isLoggedIn, setError } = useAuth();

  const [token, setToken] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [showRepo, setShowRepo] = useState(false);
  const [repo, setRepo] = useState(() => resolveRepoConfig());
  const [repoNote, setRepoNote] = useState("");

  // 登录成功后自动关闭对话框
  useEffect(() => {
    if (attempted && isLoggedIn) onClose();
  }, [attempted, isLoggedIn, onClose]);

  const handleLogin = () => {
    setError("");
    setAttempted(true);
    login(token);
  };

  const handleSaveRepo = () => {
    writeRepoOverride({
      owner: repo.owner.trim(),
      repo: repo.repo.trim(),
      branch: (repo.branch || "main").trim(),
      contentPath: (repo.contentPath || "public/content.json").trim(),
    });
    setRepoNote("已保存到当前浏览器");
  };

  const handleResetRepo = () => {
    clearRepoOverride();
    setRepo(resolveRepoConfig());
    setRepoNote("已恢复为自动推断");
  };

  const repoReady = isRepoConfigured(repo);

  return (
    <div className="dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="登录以编辑网站"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dialog__head">
          <h2 className="dialog__title">{isLoggedIn ? "已登录" : "登录以编辑网站"}</h2>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <div className="dialog__body">
          {isLoggedIn ? (
            <div className="account">
              {user && user.avatarUrl ? (
                <img className="account__avatar" src={user.avatarUrl} alt="" width="40" height="40" />
              ) : null}
              <div className="account__info">
                <p className="account__name">{user ? user.login : ""}</p>
                <p className="account__hint">令牌已保存在这台浏览器中</p>
              </div>
              <button
                type="button"
                className="mini-btn mini-btn--danger"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                退出登录
              </button>
            </div>
          ) : (
            <>
              <p className="dialog__text">
                网站是纯静态的，没有服务器，所以用 <strong>GitHub 访问令牌</strong>
                作为凭证。令牌只保存在你这台浏览器的本地存储里，只会发往 api.github.com。
              </p>

              <ol className="steps">
                <li>
                  打开{" "}
                  <a href={TOKEN_PAGE} target="_blank" rel="noreferrer">
                    GitHub 令牌创建页
                  </a>
                </li>
                <li>
                  <strong>Repository access</strong> 选 <em>Only select repositories</em>，
                  只勾选你存放网页的这个仓库
                </li>
                <li>
                  <strong>Permissions</strong> → 展开 <em>Repository permissions</em> → 找到{" "}
                  <strong>Contents</strong> → 设为 <em>Read and write</em>
                </li>
                <li>点最下方 Generate token，复制生成的令牌（只显示一次）</li>
              </ol>

              <div className="field">
                <label className="field__label" htmlFor="token-input">
                  访问令牌
                </label>
                <input
                  id="token-input"
                  className="field__input"
                  type="password"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="github_pat_..."
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleLogin();
                  }}
                />
                {error ? <p className="field__error">{error}</p> : null}
              </div>

              <div className="dialog__actions">
                <button type="button" className="mini-btn" onClick={onClose}>
                  取消
                </button>
                <button
                  type="button"
                  className="mini-btn mini-btn--primary"
                  disabled={status === "checking" || token.trim().length === 0}
                  onClick={handleLogin}
                >
                  {status === "checking" ? "正在验证…" : "登录"}
                </button>
              </div>
            </>
          )}

          <hr className="drawer__divider" />

          <button
            type="button"
            className="link-toggle"
            onClick={() => setShowRepo((open) => !open)}
          >
            {showRepo ? "▾" : "▸"} 仓库设置（内容提交到哪里）
          </button>

          {showRepo ? (
            <div className="repo-panel">
              <p className="field__hint">
                部署在 GitHub Pages 上时会自动推断，一般不用改。本地开发时需要手动填写。
              </p>
              <div className="repo-grid">
                <div className="field">
                  <label className="field__label" htmlFor="repo-owner">
                    GitHub 用户名
                  </label>
                  <input
                    id="repo-owner"
                    className="field__input"
                    type="text"
                    value={repo.owner || ""}
                    onChange={(event) => setRepo({ ...repo, owner: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="repo-name">
                    仓库名
                  </label>
                  <input
                    id="repo-name"
                    className="field__input"
                    type="text"
                    value={repo.repo || ""}
                    onChange={(event) => setRepo({ ...repo, repo: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="repo-branch">
                    分支
                  </label>
                  <input
                    id="repo-branch"
                    className="field__input"
                    type="text"
                    value={repo.branch || ""}
                    onChange={(event) => setRepo({ ...repo, branch: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="repo-path">
                    内容文件路径
                  </label>
                  <input
                    id="repo-path"
                    className="field__input"
                    type="text"
                    value={repo.contentPath || ""}
                    onChange={(event) => setRepo({ ...repo, contentPath: event.target.value })}
                  />
                </div>
              </div>

              <p className={repoReady ? "repo-status repo-status--ok" : "repo-status"}>
                {repoReady
                  ? `将提交到 ${repo.owner}/${repo.repo} 的 ${repo.branch}/${repo.contentPath}`
                  : "还没有配置仓库，保存时会失败"}
              </p>

              {repoNote ? <p className="field__hint">{repoNote}</p> : null}

              <div className="dialog__actions">
                <button type="button" className="mini-btn" onClick={handleResetRepo}>
                  恢复自动推断
                </button>
                <button type="button" className="mini-btn mini-btn--primary" onClick={handleSaveRepo}>
                  保存设置
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
