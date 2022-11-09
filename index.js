import HippyVueHtml from './src/components/hippy-vue-html';

const install = (Vue) => {
  Vue.component('HippyVueHtml', HippyVueHtml);
};

export default {
  install,
  HippyVueHtml,
};
