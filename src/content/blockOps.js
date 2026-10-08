/* ============================================================================
 *  区块列表的纯函数操作
 *  ---------------------------------------------------------------------------
 *  全部不改原数组，返回新数组，方便 React 判断引用变化。
 *  抽成纯函数的目的：脱离界面单独测试，改动时有回归保护。
 * ==========================================================================*/

/** 把某个区块上移 / 下移 delta 位；越界时原样返回 */
export function moveBlockById(blocks, id, delta) {
  const index = blocks.findIndex((block) => block.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= blocks.length) return blocks;

  const next = blocks.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export function removeBlockById(blocks, id) {
  return blocks.filter((block) => block.id !== id);
}

export function toggleBlockVisible(blocks, id) {
  return blocks.map((block) =>
    block.id === id ? { ...block, visible: !block.visible } : block
  );
}

/** 改区块自身的属性（navLabel / showInNav 等） */
export function patchBlock(blocks, id, patch) {
  return blocks.map((block) => (block.id === id ? { ...block, ...patch } : block));
}

/** 改区块里的内容字段 */
export function patchBlockData(blocks, id, patch) {
  return blocks.map((block) =>
    block.id === id ? { ...block, data: { ...block.data, ...patch } } : block
  );
}

export function appendBlock(blocks, block) {
  return [...blocks, block];
}
