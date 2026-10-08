import { useEffect, useMemo, useState } from "react";
import { buildNavItems } from "../content/schemas";
import { useContent } from "../context/ContentContext";

/** 顶部吸顶导航：条目由页面上的区块自动生成 */
export default function NavBar() {
  const { doc } = useContent();
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const items = useMemo(() => (doc ? buildNavItems(doc.blocks) : []), [doc]);

  const brand = useMemo(() => {
    if (!doc) return "";
    const hero = doc.blocks.find((block) => block.type === "hero");
    return (hero && hero.data && hero.data.name) || doc.site.title || "个人主页";
  }, [doc]);

  // 滚动时给导航栏加一层底色
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 高亮当前可见的区块
  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element) => element !== null);

    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const handleNavigate = (event, id) => {
    event.preventDefault();
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  if (items.length === 0) return null;

  return (
    <header className={scrolled ? "navbar navbar--scrolled" : "navbar"}>
      <div className="container navbar__inner">
        <a
          className="navbar__brand"
          href={`#${items[0].id}`}
          onClick={(event) => handleNavigate(event, items[0].id)}
        >
          {brand}
        </a>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="展开导航菜单"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <nav className={menuOpen ? "navbar__nav navbar__nav--open" : "navbar__nav"}>
          {items.map((item) => (
            <a
              key={item.id}
              className={
                active === item.id ? "navbar__link navbar__link--active" : "navbar__link"
              }
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              onClick={(event) => handleNavigate(event, item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
