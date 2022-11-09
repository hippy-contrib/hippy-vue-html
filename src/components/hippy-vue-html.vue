<script>
import hippyVueHtmlElement from './hippy-vue-html-element';
import { parseTree } from '../utils/html-parser/tree';
import { optimizeTree } from '../utils/html-parser/optimizer';
import Bus from '../utils/bus.js';

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
        const { root, tree } = parseTree(this.html, this.styles);
        this.root = root;
        this.tree = optimizeTree(tree, root);
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
  created() {
    // 监听点击链接事件
    Bus.$on('link-press', (params) => {
      this.$emit('link-press', params);
    });
  },
};
</script>
