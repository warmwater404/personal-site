import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { verifyToken } from "../content/contentApi";

/* ============================================================================
 *  登录状态
 *  ---------------------------------------------------------------------------
 *  使用 GitHub 访问令牌（Personal Access Token）作为凭证。
 *  令牌只保存在你自己浏览器的 localStorage 里，不会发往除 api.github.com 之外的任何地方。
 * ==========================================================================*/

const TOKEN_KEY = "personal-site.github.token";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  });
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | checking | ok | error
  const [error, setError] = useState("");

  // 令牌变化时向 GitHub 校验一次，拿到账号信息
  useEffect(() => {
    if (!token) {
      setUser(null);
      setStatus("idle");
      return undefined;
    }

    let cancelled = false;
    setStatus("checking");
    setError("");

    verifyToken(token)
      .then((account) => {
        if (cancelled) return;
        setUser(account);
        setStatus("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        setUser(null);
        setError(err.message || "登录失败");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      setError("请先粘贴访问令牌");
      return;
    }
    try {
      window.localStorage.setItem(TOKEN_KEY, trimmed);
    } catch {
      /* 隐私模式下可能写入失败，忽略 */
    }
    setToken(trimmed);
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* 忽略 */
    }
    setToken("");
    setUser(null);
    setStatus("idle");
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      error,
      setError,
      login,
      logout,
      isLoggedIn: status === "ok" && Boolean(user),
    }),
    [token, user, status, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  return context;
}
