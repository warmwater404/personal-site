/* ============================================================================
 *  GitHub 仓库配置
 *  ---------------------------------------------------------------------------
 *  这是「编辑模式」把内容提交到哪个仓库的设置。
 *
 *  一般情况你不需要改这个文件：如果网站部署在 GitHub Pages 上，
 *  程序会自动从网址推断出 owner 和 repo。
 *  只有在「本地开发」时推断不出来，才需要在下面的 GITHUB_CONFIG 里手填，
 *  或者登录后在「仓库设置」里填写（会记在浏览器里，优先级最高）。
 * ==========================================================================*/

const REPO_STORAGE_KEY = "personal-site.github.repo";

/* 只在需要时填写。留空则由自动推断或登录面板里的设置决定。 */
export const GITHUB_CONFIG = {
  owner: "", // 你的 GitHub 用户名，例如 "zhangsan"
  repo: "", // 仓库名，例如 "my-homepage"
  branch: "main",
  contentPath: "public/content.json", // 内容文件在仓库里的路径，一般不用改
};

const FALLBACK = {
  branch: "main",
  contentPath: "public/content.json",
};

/** 从当前网址推断 owner / repo（只在 GitHub Pages 上有效） */
export function detectRepoFromLocation() {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const suffix = ".github.io";
  if (!host.endsWith(suffix)) return null;

  const owner = host.slice(0, -suffix.length);
  const segments = window.location.pathname.split("/").filter(Boolean);
  // 用户主页仓库（username.github.io）时路径里没有仓库名
  const repo = segments.length > 0 ? segments[0] : host;

  return { owner, repo, branch: "main", contentPath: "public/content.json" };
}

/** 读取浏览器里保存的仓库设置 */
export function readRepoOverride() {
  try {
    const raw = window.localStorage.getItem(REPO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** 保存仓库设置到浏览器 */
export function writeRepoOverride(value) {
  window.localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(value));
}

export function clearRepoOverride() {
  window.localStorage.removeItem(REPO_STORAGE_KEY);
}

/** 只保留真正填了值的字段，避免空的默认值把其他来源覆盖掉 */
function nonEmpty(source) {
  const out = {};
  Object.entries(source || {}).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) out[key] = value;
  });
  return out;
}

/** 合并优先级：浏览器设置 > 网址自动推断 > 本文件配置 > 内置默认 */
export function resolveRepoConfig() {
  const detected = detectRepoFromLocation();
  const override = readRepoOverride();

  return {
    owner: "",
    repo: "",
    ...FALLBACK,
    ...nonEmpty(GITHUB_CONFIG),
    ...nonEmpty(detected),
    ...nonEmpty(override),
  };
}

export function isRepoConfigured(config) {
  return Boolean(config && config.owner && config.repo);
}
