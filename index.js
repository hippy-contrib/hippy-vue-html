import HippyVueHtml from './src/components/hippy-vue-html';

const install = function(Vue, opts = {}) {
    Vue.component("HippyVueHtml", HippyVueHtml);
}

export default {
    install,
    HippyVueHtml,
};
