const textTags = ['text', 'b', 'i', 'strong'].concat('span', 'p');

/**
 * optimize dom tree
 *
 * @param {Array} [tree] dom tree
 * @param {number} [id] root key of dom tree
 */
exports.optimizeTree = (tree, id = 1) => {
  const node = tree[id];
  const list = node ? [node] : [];
  while (list.length > 0) {
    const node = list.shift();
    if (textTags.includes(node.type) && node && node.content && node.content.length > 0) {
      // 打平 span 嵌套、合并样式
      while (node.content.length === 1) {
        const [cid] = node.content;
        const child = tree[cid];
        node.style = { ...node.style, ...child.style };
        node.content = child.content;
        node.text = child.text;
        // eslint-disable-next-line no-param-reassign
        delete tree[cid];
      }
      // 修正错误节点类型
      if (node.content.length > 1) {
        node.type = 'div';
      }
    }
    if (textTags.includes(node.type)) continue;
    list.push(...node.content.map((i) => tree[i]));
  }
  return tree;
};
