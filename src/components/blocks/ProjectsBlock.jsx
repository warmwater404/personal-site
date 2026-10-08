/** 作品集区块：卡片网格 */
export default function ProjectsBlock({ data }) {
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className="section">
      <div className="container">
        <header className="section__head">
          {data.eyebrow ? <p className="section__eyebrow">{data.eyebrow}</p> : null}
          {data.title ? <h2 className="section__title">{data.title}</h2> : null}
        </header>

        {items.length === 0 ? (
          <p className="section__empty">还没有作品。进入编辑模式后可以添加。</p>
        ) : (
          <div className="cards">
            {items.map((project, index) => (
              <article key={index} className="card">
                <div className="card__top">
                  <h3 className="card__title">{project.title || "未命名项目"}</h3>
                  {project.year ? <span className="card__year">{project.year}</span> : null}
                </div>

                {project.summary ? <p className="card__summary">{project.summary}</p> : null}

                {Array.isArray(project.tags) && project.tags.length > 0 ? (
                  <ul className="tags tags--small">
                    {project.tags.map((tag, tagIndex) => (
                      <li key={`${tag}-${tagIndex}`} className="tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {project.url ? (
                  <a
                    className="card__link"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看项目 →
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
