import { getBlockMeta } from "../content/schemas";
import { useContent } from "../context/ContentContext";
import { useEditor } from "../context/EditorContext";

/**
 * 编辑模式下每个区块外面套的「卡片」外壳：
 * 顶部是操作条（排序 / 隐藏 / 编辑 / 删除），下面是这个区块的真实渲染结果。
 */
export default function BlockFrame({ block, children }) {
  const { doc, moveBlock, removeBlock, toggleVisible } = useContent();
  const { setActiveBlockId } = useEditor();
  const meta = getBlockMeta(block.type);

  const index = doc.blocks.findIndex((item) => item.id === block.id);
  const isFirst = index <= 0;
  const isLast = index === doc.blocks.length - 1;

  const handleRemove = () => {
    if (window.confirm(`确定删除「${meta.label}」这个区块吗？删除后需要保存才会生效。`)) {
      removeBlock(block.id);
    }
  };

  const frameClass = block.visible ? "block edframe" : "block edframe edframe--hidden";

  return (
    <div id={block.id} className={frameClass}>
      <div className="edframe__bar">
        <span className="edframe__name">
          <span className="edframe__icon" aria-hidden="true">
            {meta.icon}
          </span>
          {meta.label}
          {block.visible ? null : <span className="edframe__tag">已隐藏</span>}
        </span>

        <span className="edframe__actions">
          <button
            type="button"
            className="mini-btn"
            title="上移"
            disabled={isFirst}
            onClick={() => moveBlock(block.id, -1)}
          >
            ↑
          </button>
          <button
            type="button"
            className="mini-btn"
            title="下移"
            disabled={isLast}
            onClick={() => moveBlock(block.id, 1)}
          >
            ↓
          </button>
          <button type="button" className="mini-btn" onClick={() => toggleVisible(block.id)}>
            {block.visible ? "隐藏" : "显示"}
          </button>
          <button
            type="button"
            className="mini-btn mini-btn--primary"
            onClick={() => setActiveBlockId(block.id)}
          >
            编辑内容
          </button>
          <button type="button" className="mini-btn mini-btn--danger" onClick={handleRemove}>
            删除
          </button>
        </span>
      </div>

      <div className="edframe__preview">{children}</div>
    </div>
  );
}
