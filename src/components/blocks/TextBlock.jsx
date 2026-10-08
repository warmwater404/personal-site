/** 自由文字区块：想放什么说明就放什么 */
export default function TextBlock({ data }) {
  const paragraphs = String(data.body || "")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return (
    <section className="section">
      <div className="container container--narrow">
        <header className="section__head">
          {data.eyebrow ? <p className="section__eyebrow">{data.eyebrow}</p> : null}
          {data.title ? <h2 className="section__title">{data.title}</h2> : null}
        </header>

        {paragraphs.length === 0 ? (
          <p className="section__empty">这个区块还没有内容。</p>
        ) : (
          <div className="prose">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
