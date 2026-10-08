import { useEffect } from "react";
import BlockRenderer, { BlockContent } from "./components/BlockRenderer";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider, useContent } from "./context/ContentContext";
import { EditorProvider, useEditor } from "./context/EditorContext";
import BlockFrame from "./editor/BlockFrame";
import EditorLayer from "./editor/EditorLayer";

/** 页面主体：按内容里的区块列表顺序渲染 */
function Site() {
  const { doc, loading, loadError } = useContent();
  const { editing } = useEditor();

  useEffect(() => {
    if (doc && doc.site && doc.site.title) document.title = doc.site.title;
  }, [doc]);

  if (loading) {
    return <div className="boot">正在加载内容…</div>;
  }

  if (!doc) {
    return <div className="boot">内容加载失败，请检查 public/content.json 是否存在。</div>;
  }

  return (
    <>
      <NavBar />

      <main>
        {doc.blocks.map((block) =>
          editing ? (
            <BlockFrame key={block.id} block={block}>
              <BlockContent block={block} />
            </BlockFrame>
          ) : block.visible ? (
            <BlockRenderer key={block.id} block={block} />
          ) : null
        )}

        {doc.blocks.length === 0 ? (
          <div className="container empty-state">
            <p>还没有任何区块。登录后点右下角「编辑网站」开始搭建。</p>
          </div>
        ) : null}
      </main>

      <Footer />

      {loadError ? <p className="boot__note">{loadError}</p> : null}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <EditorProvider>
          <Site />
          <EditorLayer />
        </EditorProvider>
      </ContentProvider>
    </AuthProvider>
  );
}
