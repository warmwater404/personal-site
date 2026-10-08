/** 收藏夹区块：按分组排列的常用链接 */
export default function LinksBlock({ data }) {
  const groups = Array.isArray(data.groups) ? data.groups : [];

  return (
    <section className="section">
      <div className="container">
        <header className="section__head">
          {data.eyebrow ? <p className="section__eyebrow">{data.eyebrow}</p> : null}
          {data.title ? <h2 className="section__title">{data.title}</h2> : null}
        </header>

        {groups.length === 0 ? (
          <p className="section__empty">还没有链接。进入编辑模式后可以添加。</p>
        ) : (
          <div className="groups">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="group">
                <h3 className="group__title">{group.title || "未命名分组"}</h3>
                <ul className="group__list">
                  {(Array.isArray(group.items) ? group.items : []).map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a
                        className="link-item"
                        href={item.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="link-item__label">{item.label || "未命名"}</span>
                        {item.desc ? <span className="link-item__desc">{item.desc}</span> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
