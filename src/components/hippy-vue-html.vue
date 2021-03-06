<script>
  import hippyVueHtmlElement from './hippy-vue-html-element';
  import htmlParser from '../utils/html-parser/parser';
  import { v4 as uuidv4 } from 'uuid';
  import Bus from '../utils/bus.js';

  const singleTags = ['img', 'input']; // br特殊处理
  const supportTags = [
    'input', 'img', // 支持的单标签
    'button', 'div', 'label', 'li', 'ul', 'ol', 'p', 'span', 'strong', 'b', 'i', 'text', 'a'// 支持的成对标签
  ];
  const defaultStylesMap = { // 标签默认样式
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
  let tree = {}, current = createNode('div', ''), root = current; // 文档树构建参数

  function createNode(type, text) { // 文档树节点创建
    const id = uuidv4();
    if (current) tree[current].content.push(id);
    tree[id] = {
      id,
      type,
      styles: defaultStylesMap[type] ? defaultStylesMap[type] : {},
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
    },
    data() {
      return {
        tree: {}
      }
    },
    components: {
      hippyVueHtmlElement,
    },
    render (h) {
      if (!this.tree[root]) return h('span'); // 未解析完成时默认渲染空内容
      else return h('hippy-vue-html-element', { // 按照文档树结构递归使用render函数渲染
        props: {
          tree: this.tree,
          root,
        }
      })
    },
    methods: {
      init() {
        // 参数初始化
        tree = {};
        current = undefined;
        current = createNode('div', '');
        root = current;
      },
      parseTree() {
        htmlParser.parse(this.html, {
          openElement (name) {
            if (supportTags.indexOf(name) > -1) current = createNode(name, '');
          },
          closeElement (name) {
            if (supportTags.indexOf(name) === -1) return;
            current = tree[current].parent;
          },
          closeOpenedElement (name) {
            // 单标签移动指针到父节点
            if (singleTags.indexOf(name) !== -1) current = tree[current].parent;
          },
          attribute (name, value) {
            if (name === 'style') {
              const styles = {};
              value.split(';').map(item => {
                if (item || item.split(':')[0]) {
                  styles[item.split(':')[0]] = item.split(':')[1].trim();
                }
              });
              // 如果存在自定义style则合并/覆盖标签自带属性
              tree[current].styles = Object.assign(tree[current].styles, styles);
            } else {
              if (!tree[current].attrs) tree[current].attrs = {};
              tree[current].attrs[name] = value;
            }
          },
          text (value) {
            createNode('text', value);
          },
        });
        this.tree = tree;
      }
    },
    created() {
      this.init();
      // 监听点击链接事件
      Bus.$on('link-press', params => {
          this.$emit('link-press', params);
      });
      // 解析html富文本，建立文档树
      this.parseTree();
    },
  };
</script>
