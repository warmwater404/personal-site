import { useCallback, useEffect } from "react";
import { BLOCK_TYPES, BLOCK_TYPE_ORDER } from "../content/schemas";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../context/ContentContext";
import { useEditor } from "../context/EditorContext";
import BlockDrawer from "./BlockDrawer";
import LoginDialog from "./LoginDialog";

/** 编辑模式的所有浮层：入口按钮、底部操作栏、右侧抽屉、登录对话框 */
export default function EditorLayer() {
  const { isLoggedIn, status } = useAuth();
  const { doc, dirty, saving, saveMessage, save, discard, addBlock } = useContent();
  const { editing, setEditing, stopEditing, loginOpen, setLoginOpen, setActiveBlockId } =
    useEditor();

  const closeLogin = useCallback(() => setLoginOpen(false), [setLoginOpen]);

  // 令牌失效时自动退出编辑模式
  useEffect(() => {
    if (!isLoggedIn && editing) stopEditing();
  }, [isLoggedIn, editing, stopEditing]);

  // 编辑模式下给页面底部留出空间，避免内容被操作栏挡住
  useEffect(() => {
    document.body.classList.toggle("is-editing", editing);
    return () => document.body.classList.remove("is-editing");
  }, [editing]);

  if (!doc) return null;

  const handleEntry = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    setEditing(!editing);
  };

  return (
    <>
      <button
        type="button"
        className={editing ? "edit-fab edit-fab--on" : "edit-fab"}
        onClick={handleEntry}
        title={isLoggedIn ? "切换编辑模式" : "登录后可以编辑网站"}
      >
        {status === "checking" ? "验证中…" : editing ? "退出编辑" : "编辑网站"}
      </button>

      {editing ? (
        <div className="editbar">
          <div className="editbar__inner">
            <span className="editbar__badge">编辑模式</span>

            <span className="editbar__add">
              <span className="editbar__add-label">添加区块</span>
              {BLOCK_TYPE_ORDER.map((type) => {
                const meta = BLOCK_TYPES[type];
                const taken = meta.singleton && doc.blocks.some((block) => block.type === type);
                return (
                  <button
                    key={type}
                    type="button"
                    className="mini-btn"
                    disabled={taken}
                    title={taken ? "这个区块只能有一个" : `添加${meta.label}`}
                    onClick={() => {
                      const block = addBlock(type);
                      setActiveBlockId(block.id);
                    }}
                  >
                    ＋ {meta.label}
                  </button>
                );
              })}
            </span>

            <span className="editbar__status">
              {saveMessage ? (
                <span className={`editbar__msg editbar__msg--${saveMessage.type}`}>
                  {saveMessage.text}
                </span>
              ) : dirty ? (
                <span className="editbar__msg editbar__msg--warn">有未保存的修改</span>
              ) : (
                <span className="editbar__msg">已与仓库同步</span>
              )}
            </span>

            <span className="editbar__actions">
              <button
                type="button"
                className="mini-btn"
                onClick={discard}
                disabled={!dirty || saving}
              >
                放弃修改
              </button>
              <button
                type="button"
                className="mini-btn mini-btn--primary"
                onClick={save}
                disabled={!dirty || saving}
              >
                {saving ? "提交中…" : "保存并发布"}
              </button>
              <button type="button" className="mini-btn" onClick={stopEditing}>
                退出
              </button>
            </span>
          </div>
        </div>
      ) : null}

      <BlockDrawer />

      {loginOpen ? <LoginDialog onClose={closeLogin} /> : null}
    </>
  );
}
