/* eslint-disable no-undef */

const { optimizeTree } = require('./optimizer');

const textTags = ['text', 'b', 'i', 'strong'];
const render = (tree, root = 1) => {
  const node = tree[root];
  const type = textTags.indexOf(node.type) > -1 ? 'span' : node.type;
  const style = Object.entries(node.styles)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  // return node.text ? node.text : `<${type}${style ? ` style="${style}"` : ''}>${node.content.map(i => render(tree, i)).join('')}</${type}>`
  return `<${type}${style ? ` style="${style}"` : ''}>${
    node.text ? node.text : node.content.map((i) => render(tree, i)).join('')
  }</${type}>`;
};

const tree1 = {
  1: {
    id: 1,
    parent: undefined,
    type: 'div',
    styles: {},
    content: [2],
    text: '',
  },
  2: {
    id: 2,
    type: 'div',
    styles: {
      display: 'flex',
    },
    content: [3, 4, 9, 10, 12],
    text: '',
    parent: 1,
  },
  3: {
    id: 3,
    type: 'text',
    styles: {},
    content: [],
    text: '\nHello,\n',
    parent: 2,
  },
  4: {
    id: 4,
    type: 'p',
    styles: {
      color: 'red',
    },
    content: [5, 6, 8],
    text: '',
    parent: 2,
  },
  5: {
    id: 5,
    type: 'text',
    styles: {},
    content: [],
    text: '\nsome\n',
    parent: 4,
  },
  6: {
    id: 6,
    type: 'span',
    styles: {
      backgroundColor: 'yellow',
    },
    content: [7],
    text: '',
    parent: 4,
  },
  7: {
    id: 7,
    type: 'text',
    styles: {},
    content: [],
    text: 'one',
    parent: 6,
  },
  8: {
    id: 8,
    type: 'text',
    styles: {},
    content: [],
    text: '\n',
    parent: 4,
  },
  9: {
    id: 9,
    type: 'text',
    styles: {},
    content: [],
    text: '\n',
    parent: 2,
  },
  10: {
    id: 10,
    type: 'strong',
    styles: {
      fontWeight: 'bold',
    },
    content: [11],
    text: '',
    parent: 2,
  },
  11: {
    id: 11,
    type: 'text',
    styles: {},
    content: [],
    text: '!',
    parent: 10,
  },
  12: {
    id: 12,
    type: 'text',
    styles: {},
    content: [],
    text: '\n',
    parent: 2,
  },
};

describe('optimize dom tree', () => {
  test('simple', () => {
    const opt = optimizeTree(tree1);
    // expect(opt).toStrictEqual({})
    expect(render(opt).replace(/\n/g, '<br/>')).toBe(
      `<div>
..<div style="display:flex">
....<span><br/>Hello,<br/></span>
....<div style="color:red">
......<span><br/>some<br/></span>
......<span style="backgroundColor:yellow">one</span>
......<span><br/></span>
....</div>
....<span><br/></span>
....<span style="fontWeight:bold">!</span>
....<span><br/></span>
..</div>
</div>`.replace(/\.|\n/g, ''),
    );
  });
});
