import { getBlockMeta } from "../content/schemas";
import { useContent } from "../context/ContentContext";
import { useEditor } from "../context/EditorContext";
import FieldControl from "./FieldControl";

/** 右侧抽屉：编辑当前选中区块的全部字段 */
export default function BlockDrawer() {
  const { doc, updateBlock, updateBlockData } = useContent();
  const { activeBlockId, setActiveBlockId } = useEditor();

  if (!doc || !activeBlockId) return null;

  const block = doc.blocks.find((item) => item.id === activeBlockId);
  if (!block) return null;

  const meta = getBlockMeta(block.type);
  const close = () => setActiveBlockId(null);

  return (
    <>
      <div className="drawer-backdrop" onClick={close} role="presentation" />

      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`编辑${meta.label}`}>
        <header className="drawer__head">
          <div>
            <p className="drawer__eyebrow">正在编辑</p>
            <h2 className="drawer__title">
              <span aria-hidden="true">{meta.icon}</span> {meta.label}
            </h2>
          </div>
          <button type="button" className="drawer__close" onClick={close} aria-label="关闭编辑面板">
            ✕
          </button>
        </header>

        <div className="drawer__body">
          <div className="field">
            <label className="field__label" htmlFor="block-nav-label">
              导航栏里显示的名称
            </label>
            <input
              id="block-nav-label"
              className="field__input"
              type="text"
              placeholder={meta.defaultNavLabel}
              value={block.navLabel || ""}
              onChange={(event) => updateBlock(block.id, { navLabel: event.target.value })}
            />
            <p className="field__hint">留空则使用默认名称「{meta.defaultNavLabel}」</p>
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={block.showInNav !== false}
              onChange={(event) => updateBlock(block.id, { showInNav: event.target.checked })}
            />
            <span>在顶部导航栏里显示这个区块</span>
          </label>

          <hr className="drawer__divider" />

          {meta.fields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={block.data[field.key]}
              onChange={(next) => updateBlockData(block.id, { [field.key]: next })}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
