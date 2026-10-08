/* ============================================================================
 *  内容文档的规范化与比较
 *  ---------------------------------------------------------------------------
 *  content.json 是用户可以通过编辑模式随意改动的文件，也可能是手工编辑过的。
 *  这里负责把外部读到的数据补全成内部结构，避免缺字段导致渲染报错。
 * ==========================================================================*/

import { DEFAULT_CONTENT } from "./defaultContent.js";

export function cloneDocument(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeDocument(raw) {
  const source = raw && typeof raw === "object" ? raw : {};

  const site = { ...DEFAULT_CONTENT.site, ...(source.site || {}) };

  const blocks = Array.isArray(source.blocks)
    ? source.blocks
        .filter((block) => block && block.type)
        .map((block, index) => ({
          id: block.id || `blk_loaded_${index}`,
          type: block.type,
          visible: block.visible !== false,
          showInNav: block.showInNav !== false,
          navLabel: block.navLabel || "",
          data: block.data && typeof block.data === "object" ? block.data : {},
        }))
    : cloneDocument(DEFAULT_CONTENT.blocks);

  return { version: source.version || 1, site, blocks };
}

/** 有没有未保存的修改 */
export function isDocumentDirty(doc, savedDoc) {
  if (!doc || !savedDoc) return false;
  return JSON.stringify(doc) !== JSON.stringify(savedDoc);
}
