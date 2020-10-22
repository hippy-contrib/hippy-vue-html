<script>
  import Bus from '../utils/bus.js';

  const textTags = ['text', 'b', 'i', 'strong'];
  const inheritStyles = ['fontFamily', 'fontWeight', 'fontSize', 'fontStyle', 'fontVariant', 'fontStretch', // 字体
  'textIndent', 'textAlign', 'textShadow', 'direction', 'color', // 文字
  'visibility', 'borderCollapse', 'cursor'];

  const component = {
    name: 'hippy-vue-html-element',
    props: {
      tree: {
        type: Object,
        default: () => {},
      },
      root: {
        type: Number,
        default: 1,
      },
      style: {
        type: Object,
        default: () => {},
      }
    },
    render: function (h) {
      const root = this.tree[this.root];
      const parent = root.parent ? this.tree[root.parent] : {};
      let type = textTags.indexOf(root.type) > -1 ? 'span' : root.type;
      let attrs = root.attrs;

      // 处理标签特性
      if (root.type === 'ul' || root.type === 'ol') {
        type = 'ul';
        attrs = {
          ...attrs,
          numberOfRows: root.content.length
        }
      }

      // 处理继承样式
      const inheritStyle = this.style ? Object.keys(this.style).filter(key => inheritStyles.includes(key)).reduce((obj, key) => {
          obj[key] = this.style[key];
          return obj;
      }, {}) : {};

      // 渲染节点、递归渲染子节点
      return h(type, {
        style: this.style,
        attrs,
        on: parent.type === 'a' ? {
          click: (e) => {
              Bus.$emit('link-press', parent.attrs ? parent.attrs['href'] : '');
          }
        } : {}
      }, root.type === 'text' ? root.text : root.content.map(item => {
        return h(component, {
          props: {
            tree: this.tree,
            root: this.tree[item].id,
            style: {
              ...inheritStyle, // 继承样式
              ...this.tree[item].styles, // 自身内联样式(高优先)
            },
          }
        })
      }));
    },
  };

  export default component;
</script>
