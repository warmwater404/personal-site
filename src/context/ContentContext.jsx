import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  appendBlock,
  moveBlockById,
  patchBlock,
  patchBlockData,
  removeBlockById,
  toggleBlockVisible,
} from "../content/blockOps";
import { commitContent, fetchContentJson } from "../content/contentApi";
import { DEFAULT_CONTENT } from "../content/defaultContent";
import { cloneDocument, isDocumentDirty, normalizeDocument } from "../content/document";
import { createBlock } from "../content/schemas";
import { useAuth } from "./AuthContext";

/* ============================================================================
 *  内容状态
 *  ---------------------------------------------------------------------------
 *  doc      —— 当前正在编辑的工作副本（页面上显示的就是它）
 *  savedDoc —— 最后一次成功加载 / 保存的副本，用来判断「有没有未保存的修改」
 *  具体的增删改逻辑在 content/blockOps.js，这里只负责调度与持久化。
 * ==========================================================================*/

export const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const { token } = useAuth();

  const [doc, setDoc] = useState(null);
  const [savedDoc, setSavedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null); // { type, text }

  /* ------------------------------------------------------------ 初次加载 */
  useEffect(() => {
    let cancelled = false;

    fetchContentJson()
      .then((data) => {
        if (cancelled) return;
        const next = normalizeDocument(data);
        setDoc(next);
        setSavedDoc(next);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = normalizeDocument(DEFAULT_CONTENT);
        setDoc(fallback);
        setSavedDoc(fallback);
        setLoadError("没有读到 content.json，现在显示的是内置默认内容。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(() => isDocumentDirty(doc, savedDoc), [doc, savedDoc]);

  /* ---------------------------------------------- 有未保存修改时离开提醒 */
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* -------------------------------------------------------------- 写操作 */
  const mutateBlocks = useCallback((transform) => {
    setDoc((current) => (current ? { ...current, blocks: transform(current.blocks) } : current));
  }, []);

  const updateSite = useCallback((patch) => {
    setDoc((current) => (current ? { ...current, site: { ...current.site, ...patch } } : current));
  }, []);

  const updateBlock = useCallback(
    (id, patch) => mutateBlocks((blocks) => patchBlock(blocks, id, patch)),
    [mutateBlocks]
  );

  const updateBlockData = useCallback(
    (id, patch) => mutateBlocks((blocks) => patchBlockData(blocks, id, patch)),
    [mutateBlocks]
  );

  const toggleVisible = useCallback(
    (id) => mutateBlocks((blocks) => toggleBlockVisible(blocks, id)),
    [mutateBlocks]
  );

  const moveBlock = useCallback(
    (id, delta) => mutateBlocks((blocks) => moveBlockById(blocks, id, delta)),
    [mutateBlocks]
  );

  const removeBlock = useCallback(
    (id) => mutateBlocks((blocks) => removeBlockById(blocks, id)),
    [mutateBlocks]
  );

  const addBlock = useCallback(
    (type) => {
      const block = createBlock(type);
      mutateBlocks((blocks) => appendBlock(blocks, block));
      return block;
    },
    [mutateBlocks]
  );

  /* -------------------------------------------------------- 放弃 / 保存 */
  const discard = useCallback(() => {
    setDoc((current) => (savedDoc ? cloneDocument(savedDoc) : current));
    setSaveMessage({ type: "info", text: "已放弃未保存的修改" });
  }, [savedDoc]);

  const savingRef = useRef(false);

  const save = useCallback(async () => {
    if (!doc || savingRef.current) return;
    if (!token) {
      setSaveMessage({ type: "error", text: "请先登录后再保存" });
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveMessage({ type: "info", text: "正在提交到 GitHub…" });

    try {
      const stamp = new Date().toLocaleString("zh-CN", { hour12: false });
      await commitContent(doc, { token, message: `更新网站内容（${stamp}）` });
      setSavedDoc(cloneDocument(doc));
      setSaveMessage({
        type: "ok",
        text: "已提交到 GitHub。约 1 分钟后自动重新部署，线上即会更新。",
      });
    } catch (error) {
      setSaveMessage({ type: "error", text: error.message || "保存失败" });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [doc, token]);

  const value = useMemo(
    () => ({
      doc,
      loading,
      loadError,
      dirty,
      saving,
      saveMessage,
      setSaveMessage,
      updateSite,
      updateBlock,
      updateBlockData,
      toggleVisible,
      moveBlock,
      removeBlock,
      addBlock,
      discard,
      save,
    }),
    [
      doc,
      loading,
      loadError,
      dirty,
      saving,
      saveMessage,
      updateSite,
      updateBlock,
      updateBlockData,
      toggleVisible,
      moveBlock,
      removeBlock,
      addBlock,
      discard,
      save,
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent 必须在 <ContentProvider> 内部使用");
  return context;
}
