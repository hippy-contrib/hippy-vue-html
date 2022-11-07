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
        node.type = child.type;
        node.styles = { ...node.styles, ...child.styles };
        node.content = child.content;
        node.text = child.text;
        // eslint-disable-next-line no-param-reassign
        delete tree[cid];
      }
      // Hippy 能处理 p & span 的嵌套
      // https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue
      // if (node.content.length > 1) {
      //   node.type = 'div';
      //   // node.styles = { ...node.styles, display: 'flex', flexWrap: 'wrap' };
      // }
    }
    if (node.type === 'text') continue;
    list.push(...node.content.map((i) => tree[i]));
  }
  return tree;
};
