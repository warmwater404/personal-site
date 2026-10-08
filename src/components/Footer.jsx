import { useContent } from "../context/ContentContext";

/** 页脚，同时充当导航里的「联系」区块 */
export default function Footer() {
  const { doc } = useContent();

  const hero = doc.blocks.find((block) => block.type === "hero");
  const email = hero && hero.data ? hero.data.email : "";
  const socials = (hero && hero.data && Array.isArray(hero.data.socials) ? hero.data.socials : []).slice(
    0,
    3
  );

  const copyright = String(doc.site.copyright || "").replace(/\d{4}/, String(new Date().getFullYear()));

  return (
    <footer id="contact" className="footer">
      <div className="container footer__inner">
        <div>
          <h2 className="footer__title">想聊聊？</h2>
          <p className="footer__text">
            有新想法、合作机会，或者只是想打个招呼，都欢迎给我发邮件。
          </p>
        </div>

        <div className="footer__contact">
          {email ? (
            <a className="footer__email" href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}

          {socials.length > 0 ? (
            <div className="footer__socials">
              {socials.map((item, index) => {
                const isExternal = /^https?:\/\//.test(item.url || "");
                return (
                  <a
                    key={`${item.label}-${index}`}
                    className="footer__social"
                    href={item.url || "#"}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="container footer__bottom">
        <p>{copyright}</p>
        <p>{doc.site.footerText || ""}</p>
      </div>
    </footer>
  );
}
