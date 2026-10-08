/** 关于我区块：自我介绍段落 + 技能标签 + 经历时间线 */
export default function AboutBlock({ data }) {
  const paragraphs = Array.isArray(data.paragraphs) ? data.paragraphs : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];

  return (
    <section className="section">
      <div className="container">
        <header className="section__head">
          {data.eyebrow ? <p className="section__eyebrow">{data.eyebrow}</p> : null}
          {data.title ? <h2 className="section__title">{data.title}</h2> : null}
        </header>

        <div className="about">
          <div className="about__column">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="about__paragraph">
                {paragraph}
              </p>
            ))}

            {skills.length > 0 ? (
              <>
                <h3 className="about__subtitle">{data.skillsTitle || "技能"}</h3>
                <ul className="tags">
                  {skills.map((skill, index) => (
                    <li key={`${skill}-${index}`} className="tag">
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div className="about__column">
            {timeline.length > 0 ? (
              <>
                <h3 className="about__subtitle">{data.timelineTitle || "经历"}</h3>
                <ol className="timeline">
                  {timeline.map((entry, index) => (
                    <li key={index} className="timeline__item">
                      {entry.period ? <p className="timeline__period">{entry.period}</p> : null}
                      {entry.title ? <p className="timeline__title">{entry.title}</p> : null}
                      {entry.org ? <p className="timeline__org">{entry.org}</p> : null}
                      {entry.desc ? <p className="timeline__desc">{entry.desc}</p> : null}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
