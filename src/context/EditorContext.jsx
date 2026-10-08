import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* ============================================================================
 *  编辑器界面状态
 *  ---------------------------------------------------------------------------
 *  只放「界面开关」，不放内容本身。内容在 ContentContext 里。
 * ==========================================================================*/

export const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const [editing, setEditing] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const stopEditing = useCallback(() => {
    setEditing(false);
    setActiveBlockId(null);
  }, []);

  const value = useMemo(
    () => ({
      editing,
      setEditing,
      stopEditing,
      activeBlockId,
      setActiveBlockId,
      loginOpen,
      setLoginOpen,
    }),
    [editing, stopEditing, activeBlockId, loginOpen]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor 必须在 <EditorProvider> 内部使用");
  return context;
}
