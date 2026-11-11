const assert = require('node:assert/strict');
const editorTools = require('../web/js/webdevgym-code-editor.js');

function createEditor(value, caret = value.length, selectionEnd = caret) {
  return {
    value,
    selectionStart: caret,
    selectionEnd,
    inputEvents: 0,
    setRangeText(text, start, end) {
      this.value = this.value.slice(0, start) + text + this.value.slice(end);
    },
    setSelectionRange(start, end) {
      this.selectionStart = start;
      this.selectionEnd = end;
    },
    dispatchEvent(event) {
      if (event.type === 'input') this.inputEvents += 1;
      return true;
    }
  };
}

function key(key, options = {}) {
  return {
    key,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
    ...options
  };
}

let editor = createEditor('  const title = "Nightwave";');
assert.equal(editorTools.handleKeydown(editor, key('Enter'), { fileName: 'script.js' }), true);
assert.equal(editor.value, '  const title = "Nightwave";\n  ');

editor = createEditor('{}', 1);
editorTools.handleKeydown(editor, key('Enter'), { fileName: 'script.js' });
assert.equal(editor.value, '{\n  \n}');
assert.equal(editor.selectionStart, 4);

editor = createEditor('<div class');
editorTools.handleKeydown(editor, key('='), { fileName: 'index.html' });
assert.equal(editor.value, '<div class=""');
assert.equal(editor.selectionStart, '<div class="'.length);

editor = createEditor('<main class');
editorTools.handleKeydown(editor, key('Tab'), { fileName: 'index.html' });
assert.equal(editor.value, '<main class=""');
assert.equal(editor.selectionStart, '<main class="'.length);

editor = createEditor('const player = ');
editorTools.handleKeydown(editor, key('('), { fileName: 'script.js' });
assert.equal(editor.value, 'const player = ()');
assert.equal(editor.selectionStart, 'const player = ('.length);

editor = createEditor('[]', 1);
editorTools.handleKeydown(editor, key('Backspace'), { fileName: 'script.js' });
assert.equal(editor.value, '');
assert.equal(editor.selectionStart, 0);

editor = createEditor('const volume = 75;');
editorTools.handleKeydown(editor, key('Tab'), { fileName: 'script.js' });
assert.equal(editor.value, 'const volume = 75;  ');

global.WebDevGymEmmet = {
  extract(value, caret) {
    const match = value.slice(0, caret).match(/[a-z][a-z0-9-]*$/i);
    return match ? { abbreviation: match[0], start: caret - match[0].length, end: caret } : null;
  },
  expand(abbreviation, options) {
    const cursor = options.options['output.field'](1, '');
    return `<${abbreviation}>${cursor}</${abbreviation}>`;
  }
};
editor = createEditor('section');
editorTools.handleKeydown(editor, key('Tab'), { fileName: 'index.html' });
assert.equal(editor.value, '<section></section>');
assert.equal(editor.selectionStart, '<section>'.length);
delete global.WebDevGymEmmet;

editor = createEditor('!');
editorTools.handleKeydown(editor, key('Tab'), { fileName: 'index.html' });
assert.match(editor.value, /^<!DOCTYPE html>/);
assert.match(editor.value, /<body>\n  \n<\/body>/);
assert.equal(editor.value.includes('!'), true);

assert.ok(editor.inputEvents > 0);
console.log('Code editor keyboard tests passed.');
