<script>
import hippyVueHtmlElement from './hippy-vue-html-element';
import htmlParser from '../utils/html-parser/parser';
import Bus from '../utils/bus.js';

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
let stylesMap = {
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
let id = 0; // 使用自增id作为key

function createNode(tree, type, text, current) {
  // 文档树节点创建
  id += 1;
  if (current) tree[current].content.push(id);
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

export default {
  name: 'hippy-vue-html',
  props: {
    html: {
      type: String,
      default: '',
    },
    styles: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      tree: {},
      root: '',
    };
  },
  components: {
    hippyVueHtmlElement,
  },
  watch: {
    html: {
      handler() {
        stylesMap = Object.assign(stylesMap, this.styles);
        this.parseTree();
      },
      immediate: true,
    },
  },
  render(h) {
    if (!this.root || !this.tree[this.root]) return h('span');
    // 未解析完成时默认渲染空内容
    return h('hippy-vue-html-element', {
      // 按照文档树结构递归使用render函数渲染
      props: {
        tree: this.tree,
        root: this.root,
      },
    });
  },
  methods: {
    parseTree() {
      const tree = {};
      id = 0;
      let current = createNode(tree, 'div', '');
      const root = current; // 文档树构建参数
      htmlParser.parse(this.html, {
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
            value.split(';').map((item) => {
              if (item || item.split(':')[0]) {
                styles[item.split(':')[0]] = item.split(':')[1].trim();
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
      this.root = root;
      this.tree = tree;
    },
  },
  created() {
    // 监听点击链接事件
    Bus.$on('link-press', (params) => {
      this.$emit('link-press', params);
    });
  },
};
</script>
