exports.create = function (raw, callbacks, regex) {
  let index = 0;
  let current = null;
  let substring = null;

  const context = {
    text: '',
    peek(count) {
      count = count || 1;
      return this.raw.substr(this.index + 1, count);
    },
    read(count) {
      if (count === 0) {
        return '';
      }
      count = count || 1;
      const next = this.peek(count);
      this.index += count;
      if (this.index > this.length) {
        this.index = this.length;
      }
      return next;
    },
    readUntilNonWhitespace() {
      let value = ''; let next;
      while (!this.isEof()) {
        next = this.read();
        value += next;
        if (!/\s$/.test(value)) {
          break;
        }
      }

      return value;
    },
    isEof() {
      return this.index >= this.length;
    },
    readRegex(regex) {
      const value = (regex.exec(this.raw.substring(this.index)) || [''])[0];
      this.index += value.length;
      return value;
    },
    peekIgnoreWhitespace(count) {
      count = count || 1;
      let value = ''; let next = ''; let offset = 0;
      do {
        offset += 1;
        next = this.raw.charAt(this.index + offset);
        if (!next) {
          break;
        }
        if (!/\s/.test(next)) {
          value += next;
        }
      } while (value.length < count);

      return value;
    },
  };

  context.__defineGetter__('current', function () {
    return this.isEof() ? '' : current === null ? (current = this.raw.charAt(this.index)) : current;
  });
  context.__defineGetter__('raw', () => raw);
  context.__defineGetter__('length', function () {
    return this.raw.length;
  });
  context.__defineGetter__('index', () => index);
  context.__defineSetter__('index', (value) => {
    index = value;
    current = null;
    substring = null;
  });
  context.__defineGetter__('substring', function () {
    return substring === null ? (substring = this.raw.substring(this.index)) : substring;
  });

  context.callbacks = {};
  const types = [
    'openElement',
    'closeElement',
    'attribute',
    'comment',
    'cdata',
    'text',
    'docType',
    'xmlProlog',
    'closeOpenedElement',
  ];
  types.forEach((value) => {
    context.callbacks[value] = function () {};
  });

  merge(context.callbacks, callbacks || {});

  context.regex = {
    name: /[a-zA-Z_][\w:\-.]*/,
    attribute: /[a-zA-Z_][\w:\-.]*/,
    dataElements: {
      cdata: {
        start: '<![CDATA[',
        end: ']]>',
      },
      comment: {
        start: '<!--',
        end: '-->',
      },
      docType: {
        start: /^<!DOCTYPE /i,
        end: '>',
      },
    },
  };

  merge(context.regex, regex || {});

  return context;
};

function merge(target, source) {
  for (const name in source) {
    if (!Object.prototype.hasOwnProperty.call(source, name)) continue;

    const value = source[name];

    if (target[name] && typeof value === 'object' && value instanceof RegExp === false) {
      merge(target[name], value);
    } else {
      target[name] = value;
    }
  }
}
