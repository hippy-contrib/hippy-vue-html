const htmlParser = require('./parser');

const singleTags = ['img', 'input']; // br特殊处理
const supportTags = [
  'input',
  'img', // 支持的单标签
  'button',
  'div',
  'label',
  'li',
  'ul',
  'ol',
  'p',
  'span',
  'strong',
  'b',
  'i',
  'text',
  'a', // 支持的成对标签
];
const defaultStylesMap = {
  // 标签默认样式
  a: {
    color: 'blue',
  },
  b: {
    fontWeight: 'bold',
  },
  strong: {
    fontWeight: 'bold',
  },
  img: {
    height: 100,
    width: 100,
  },
};

function transformCamel(str) {
  const regex = /-(\w)/g;
  return str.replace(regex, ($0, $1) => $1.toUpperCase());
}

export const parseTree = (html, styles = {}) => {
  const stylesMap = Object.assign({}, defaultStylesMap, styles);
  let id = 0; // 使用自增id作为key

  function createNode(tree, type, text, current) {
    // 文档树节点创建
    id += 1;
    if (current) tree[current].content.push(id);
    // eslint-disable-next-line no-param-reassign
    tree[id] = {
      id,
      type,
      styles: stylesMap[type] ? stylesMap[type] : {},
      content: [],
      text,
      parent: current,
    };
    return id;
  }

  const tree = {};
  let current = createNode(tree, 'div', '');
  const root = current; // 文档树构建参数
  htmlParser.parse(html, {
    openElement(name) {
      if (supportTags.indexOf(name) > -1) current = createNode(tree, name, '', current);
    },
    closeElement(name) {
      if (supportTags.indexOf(name) === -1) return;
      current = tree[current].parent;
    },
    closeOpenedElement(name) {
      // 单标签移动指针到父节点
      if (singleTags.indexOf(name) !== -1) current = tree[current].parent;
    },
    attribute(name, value) {
      if (name === 'style') {
        const styles = {};
        value.split(';').forEach((item) => {
          if (item || item.split(':')[0]) {
            styles[transformCamel(item.split(':')[0])] = item.split(':')[1].trim();
          }
        });
        // 如果存在自定义style则合并/覆盖标签自带属性
        tree[current].styles = Object.assign({}, tree[current].styles, styles);
      } else {
        if (!tree[current].attrs) tree[current].attrs = {};
        tree[current].attrs[name] = value;
      }
    },
    text(value) {
      createNode(tree, 'text', value, current);
    },
  });
  return { root, tree };
};
