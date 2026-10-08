import { getBlockMeta } from "../content/schemas";

/** 只负责渲染区块内容，外层的定位锚点由调用方决定 */
export function BlockContent({ block }) {
  const meta = getBlockMeta(block.type);
  const Component = meta.Component;

  if (!Component) {
    return (
      <section className="section">
        <div className="container">
          <p className="section__empty">未知的区块类型：{block.type}</p>
        </div>
      </section>
    );
  }

  return <Component data={block.data} />;
}

/** 浏览态下的区块：外面带一个用于锚点跳转的 id */
export default function BlockRenderer({ block }) {
  return (
    <div id={block.id} className="block">
      <BlockContent block={block} />
    </div>
  );
}
