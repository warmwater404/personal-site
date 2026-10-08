/* ============================================================================
 *  内容读写层
 *  ---------------------------------------------------------------------------
 *  读取：从网站根目录拉取 content.json（这个文件由编辑模式负责更新）
 *  写入：调用 GitHub Contents API，把内容提交到仓库
 * ==========================================================================*/

import { resolveRepoConfig } from "../config.js";

const CONTENT_URL = `${import.meta.env.BASE_URL}content.json`;
const API_ROOT = "https://api.github.com";

/* ------------------------------------------------------------------ 读取内容 */

export async function fetchContentJson() {
  // 加时间戳绕过 CDN 缓存，保证编辑后刷新能立刻看到最新内容
  const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/* ------------------------------------------------------------------ 鉴权相关 */

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** 校验令牌是否有效，并返回账号信息 */
export async function verifyToken(token) {
  let response;
  try {
    response = await fetch(`${API_ROOT}/user`, { headers: authHeaders(token) });
  } catch {
    throw new Error("无法连接 GitHub，请检查网络连接");
  }

  if (response.status === 401) throw new Error("令牌无效或已过期，请重新生成");
  if (response.status === 403) throw new Error("令牌被拒绝：权限不足或触发了访问频率限制");
  if (!response.ok) throw new Error(`GitHub 返回了 ${response.status}`);

  const user = await response.json();
  return { login: user.login, name: user.name, avatarUrl: user.avatar_url };
}

/* ------------------------------------------------------------------ 写回内容 */

function encodePath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function contentsUrl(owner, repo, path, branch) {
  const base = `${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePath(path)}`;
  return branch ? `${base}?ref=${encodeURIComponent(branch)}` : base;
}

async function describeError(response) {
  let detail = "";
  try {
    const data = await response.json();
    if (data && data.message) detail = data.message;
  } catch {
    /* 响应体不是 JSON，忽略 */
  }
  return `GitHub 返回 ${response.status}${detail ? `：${detail}` : ""}`;
}

/** 取文件的当前 sha（不存在则返回 null） */
async function getFileSha({ token, owner, repo, branch, path }) {
  const response = await fetch(contentsUrl(owner, repo, path, branch), {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await describeError(response));

  const data = await response.json();
  return data.sha || null;
}

/** 把 UTF-8 字符串安全地转成 base64（btoa 不能直接处理中文） */
function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * 把整份内容提交到 GitHub。
 * 仓库里已存在该文件就更新，不存在就新建。
 */
export async function commitContent(content, { token, message }) {
  const config = resolveRepoConfig();
  const { owner, repo, branch, contentPath } = config;

  if (!owner || !repo) {
    throw new Error("还没有配置 GitHub 仓库，请先在「仓库设置」里填写 owner 和 repo");
  }

  const sha = await getFileSha({ token, owner, repo, branch, path: contentPath });

  const body = {
    message,
    content: toBase64(`${JSON.stringify(content, null, 2)}\n`),
    branch,
  };
  if (sha) body.sha = sha;

  const response = await fetch(contentsUrl(owner, repo, contentPath, null), {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await describeError(response));
  return response.json();
}
