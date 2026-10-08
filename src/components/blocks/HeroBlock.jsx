import { resolveAsset } from "../../utils/assetUrl";

/** 首屏区块：头像 + 姓名 + 一句话简介 + 按钮 */
export default function HeroBlock({ data }) {
  const socials = Array.isArray(data.socials) ? data.socials : [];

  return (
    <section className="section hero">
      <div className="container hero__inner">
        {data.avatar ? (
          <img
            className="hero__avatar"
            src={resolveAsset(data.avatar)}
            alt={`${data.name || ""} 的头像`}
            width="180"
            height="180"
          />
        ) : null}

        {data.eyebrow ? <p className="hero__eyebrow">{data.eyebrow}</p> : null}
        {data.name ? <h1 className="hero__name">{data.name}</h1> : null}
        {data.headline ? <p className="hero__headline">{data.headline}</p> : null}
        {data.subheadline ? <p className="hero__sub">{data.subheadline}</p> : null}

        {socials.length > 0 ? (
          <div className="hero__actions">
            {socials.map((item, index) => {
              const isExternal = /^https?:\/\//.test(item.url || "");
              return (
                <a
                  key={`${item.label}-${index}`}
                  className={index === 0 ? "btn btn--primary" : "btn btn--ghost"}
                  href={item.url || "#"}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  {item.label || "链接"}
                </a>
              );
            })}
          </div>
        ) : null}

        {data.location ? <p className="hero__meta">{data.location}</p> : null}
      </div>
    </section>
  );
}
