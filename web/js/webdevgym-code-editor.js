(function (global) {
  'use strict';

  const INDENT = '  ';
  const OPEN_PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  const CLOSE_PAIRS = new Set([')', ']', '}', '"', "'", '`']);
  const WORDS = values => values.split(/\s+/).filter(Boolean);
  const makeItems = (values, kind, detail = '') => WORDS(values).map(label => ({ label, insert: label, kind, detail }));
  const HTML_TAGS = makeItems('a abbr address article aside audio b blockquote body br button canvas caption code col data datalist dd details div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input label legend li link main meta nav ol option p picture pre script section select small source span strong style summary table tbody td textarea tfoot th thead tr title ul video', 'tag', 'HTML element');
  const HTML_ATTRIBUTES = makeItems('accept action alt aria-label aria-labelledby autocomplete autofocus checked class colspan content controls data-* disabled for height href id lang loading max maxlength method min name placeholder rel required role selected src srcset step style target title type value width', 'attribute', 'HTML attribute');
  const CSS_PROPERTIES = makeItems('align-content align-items align-self animation appearance aspect-ratio background background-color background-image border border-radius bottom box-shadow box-sizing color column-gap cursor display flex flex-basis flex-direction flex-grow flex-shrink flex-wrap font font-family font-size font-style font-weight gap grid grid-template-columns grid-template-rows height justify-content left line-height margin margin-bottom margin-left margin-right margin-top max-height max-width min-height min-width object-fit opacity overflow padding padding-bottom padding-left padding-right padding-top place-content place-items position right text-align text-decoration text-overflow text-transform top transform transition user-select vertical-align visibility white-space width z-index', 'property', 'CSS property');
  const JS_KEYWORDS = makeItems('async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield', 'keyword', 'JavaScript keyword');
  const JS_GLOBALS = makeItems('Array Boolean Date Error Intl JSON Map Math Number Object Promise RegExp Set String Symbol WeakMap WeakSet console document window localStorage sessionStorage fetch setInterval setTimeout clearInterval clearTimeout URL URLSearchParams', 'variable', 'JavaScript API');
  const JS_SNIPPETS = [
    { label: 'console.log()', insert: 'console.log()', caret: 12, kind: 'function', detail: 'console.log(...data)', description: 'Print values to the developer console.' },
    { label: 'addEventListener()', insert: 'addEventListener("click", (event) => {\n  \n})', caret: 38, kind: 'method', detail: 'EventTarget.addEventListener(type, listener)', description: 'Register a handler for a DOM event.' },
    { label: 'document.querySelector()', insert: 'document.querySelector("")', caret: 24, kind: 'method', detail: 'Document.querySelector(selectors)', description: 'Select the first matching element.' },
    { label: 'document.querySelectorAll()', insert: 'document.querySelectorAll("")', caret: 27, kind: 'method', detail: 'Document.querySelectorAll(selectors)', description: 'Select every matching element.' },
    { label: 'forEach()', insert: 'forEach((item) => {\n  \n})', caret: 17, kind: 'method', detail: 'Array.forEach(callback)', description: 'Run a callback once for each array item.' },
    { label: 'map()', insert: 'map((item) => item)', caret: 17, kind: 'method', detail: 'Array.map(callback)', description: 'Create a new array from callback results.' },
    { label: 'filter()', insert: 'filter((item) => )', caret: 16, kind: 'method', detail: 'Array.filter(callback)', description: 'Keep items that pass a test.' },
    { label: 'fetch()', insert: 'fetch("")', caret: 7, kind: 'method', detail: 'fetch(input, options)', description: 'Request a resource and return a Promise.' },
    { label: 'JSON.parse()', insert: 'JSON.parse()', caret: 11, kind: 'method', detail: 'JSON.parse(text)', description: 'Parse JSON text into a JavaScript value.' },
    { label: 'JSON.stringify()', insert: 'JSON.stringify()', caret: 15, kind: 'method', detail: 'JSON.stringify(value)', description: 'Serialize a JavaScript value as JSON.' },
    { label: 'localStorage.getItem()', insert: 'localStorage.getItem("")', caret: 22, kind: 'method', detail: 'Storage.getItem(key)', description: 'Read a value saved in local storage.' },
    { label: 'localStorage.setItem()', insert: 'localStorage.setItem("", "")', caret: 22, kind: 'method', detail: 'Storage.setItem(key, value)', description: 'Save a string in local storage.' },
    { label: 'if', insert: 'if () {\n  \n}', caret: 4, kind: 'snippet', detail: 'if (condition) { … }', description: 'Conditional statement.' },
    { label: 'function', insert: 'function name() {\n  \n}', caret: 9, kind: 'snippet', detail: 'function name() { … }', description: 'Declare a function.' },
    { label: 'try/catch', insert: 'try {\n  \n} catch (error) {\n  console.error(error);\n}', caret: 8, kind: 'snippet', detail: 'try { … } catch (error) { … }', description: 'Handle an exception.' }
  ];
  const CSS_VALUES = makeItems('absolute auto block border-box center column flex flex-start flex-end grid hidden inline inline-block inline-flex inline-grid inherit initial fixed none normal relative repeat(2, 1fr) space-between space-around space-evenly sticky transparent unset visible wrap nowrap 100% 100vh 100vw 1fr', 'value', 'CSS value');
  const COMPLETIONS = { html: [...HTML_TAGS, ...HTML_ATTRIBUTES], css: CSS_PROPERTIES, javascript: [...JS_KEYWORDS, ...JS_GLOBALS, ...JS_SNIPPETS] };

  function isMarkupFile(fileName) {
    return /\.(html?|xhtml|jsx|tsx|vue|svelte|astro)$/i.test(String(fileName || ''));
  }

  function emmetContext(fileName) {
    const extension = String(fileName || '').split('.').pop().toLowerCase();
    if (['html', 'htm', 'xhtml', 'vue', 'svelte', 'astro'].includes(extension)) return { syntax: 'html', type: 'markup' };
    if (['jsx', 'tsx'].includes(extension)) return { syntax: 'jsx', type: 'markup' };
    if (['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'postcss'].includes(extension)) {
      return { syntax: extension === 'styl' ? 'stylus' : extension, type: 'stylesheet' };
    }
    return null;
  }

  function emitInput(editor) {
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function replaceRange(editor, text, start, end, caretOffset = text.length) {
    editor.setRangeText(text, start, end, 'end');
    const caret = start + caretOffset;
    editor.setSelectionRange(caret, caret);
    emitInput(editor);
  }

  function completeHtmlAttribute(editor, fileName) {
    if (!isMarkupFile(fileName) || editor.selectionStart !== editor.selectionEnd) return false;
    const caret = editor.selectionStart;
    const before = editor.value.slice(0, caret);
    const tagStart = before.lastIndexOf('<');
    const tagEnd = before.lastIndexOf('>');
    if (tagStart <= tagEnd) return false;
    const tagText = before.slice(tagStart + 1);
    if (/^[!/]/.test(tagText) || !/^\S+\s+/.test(tagText)) return false;
    const match = tagText.match(/([:@a-zA-Z_][\w:.-]*)$/);
    if (!match) return false;
    const name = match[1];
    replaceRange(editor, `${name}=""`, caret - name.length, caret, name.length + 2);
    return true;
  }

  function expandEmmet(editor, fileName) {
    const context = emmetContext(fileName);
    if (!context) return false;
    if (editor.selectionStart !== editor.selectionEnd) return false;
    const caret = editor.selectionStart;
    const before = editor.value.slice(0, caret);
    const boilerplate = before.match(/(^|\n)([\t ]*)!$/);
    if (context.syntax === 'html' && boilerplate) {
      const indent = boilerplate[2] || '';
      const cursorMarker = '\uE000';
      const template = [
        '<!DOCTYPE html>', '<html lang="en">', '<head>', '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>Document</title>', '</head>', '<body>', `  ${cursorMarker}`, '</body>', '</html>'
      ].map(line => indent + line).join('\n');
      const markerIndex = template.indexOf(cursorMarker);
      const clean = template.replace(cursorMarker, '');
      replaceRange(editor, clean, caret - 1, caret, markerIndex);
      return true;
    }
    const engine = global.WebDevGymEmmet;
    if (!engine || typeof engine.extract !== 'function' || typeof engine.expand !== 'function') return false;
    let extracted;
    try {
      extracted = engine.extract(editor.value, editor.selectionStart, { type: context.type });
    } catch {
      return false;
    }
    const abbreviation = extracted?.abbreviation || '';
    if (!abbreviation) return false;
    const lineStart = editor.value.lastIndexOf('\n', Math.max(0, extracted.start - 1)) + 1;
    const baseIndent = (editor.value.slice(lineStart, extracted.start).match(/^[\t ]*/) || [''])[0];
    const cursorMarker = '\uE000';
    let cursorPlaced = false;
    let expanded;
    try {
      expanded = engine.expand(abbreviation, {
        syntax: context.syntax,
        type: context.type,
        options: {
          'output.indent': INDENT,
          'output.baseIndent': baseIndent,
          'output.field': (index, placeholder) => {
            if (!cursorPlaced && (index === 1 || !placeholder)) {
              cursorPlaced = true;
              return cursorMarker;
            }
            return placeholder || '';
          }
        }
      });
    } catch {
      return false;
    }
    if (!expanded || expanded.trim() === abbreviation.trim()) return false;
    const markerIndex = expanded.indexOf(cursorMarker);
    const clean = expanded.replace(cursorMarker, '');
    replaceRange(
      editor,
      clean,
      extracted.start,
      extracted.end,
      markerIndex >= 0 ? markerIndex : clean.length
    );
    return true;
  }

  function completionLanguage(fileName) {
    const extension = String(fileName || '').split('.').pop().toLowerCase();
    if (['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx'].includes(extension)) return 'javascript';
    if (['html', 'htm', 'xhtml', 'vue', 'svelte', 'astro'].includes(extension)) return 'html';
    if (['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'postcss'].includes(extension)) return 'css';
    return '';
  }

  function completionContext(editor, language) {
    const before = editor.value.slice(0, editor.selectionStart);
    const word = before.match(/[\w$-]+$/)?.[0] || '';
    if (language === 'html') {
      const tagStart = before.lastIndexOf('<');
      const tagEnd = before.lastIndexOf('>');
      if (tagStart > tagEnd) {
        const tagText = before.slice(tagStart + 1);
        if (!/^[!/]/.test(tagText) && /^\S+\s+/.test(tagText)) return { before, prefix: word, mode: 'attribute', from: editor.selectionStart - word.length };
        if (!/^[!/]/.test(tagText)) return { before, prefix: tagText.match(/[\w-]*$/)?.[0] || '', mode: 'tag', from: editor.selectionStart - (tagText.match(/[\w-]*$/)?.[0] || '').length };
        return null;
      }
      return null;
    }
    if (language === 'css') {
      const lastOpen = Math.max(before.lastIndexOf('{'), before.lastIndexOf(';'), before.lastIndexOf('}'));
      const declaration = before.slice(lastOpen + 1);
      if (declaration.includes(':')) return { before, prefix: word, mode: 'value', from: editor.selectionStart - word.length };
      return { before, prefix: word, mode: 'property', from: editor.selectionStart - word.length };
    }
    const member = before.match(/([\w$]+)\.([\w$]*)$/);
    if (member) return { before, prefix: member[2], mode: 'member', object: member[1], from: editor.selectionStart - member[2].length };
    return { before, prefix: (before.match(/[a-zA-Z_$][\w$]*$/) || [''])[0], mode: 'word', from: editor.selectionStart - ((before.match(/[a-zA-Z_$][\w$]*$/) || [''])[0].length) };
  }

  function emmetCompletion(editor, language, context) {
    if (!['html', 'css'].includes(language) || !context?.prefix || context.mode !== 'tag' && context.mode !== 'property') return null;
    const engine = global.WebDevGymEmmet;
    if (!engine || typeof engine.extract !== 'function' || typeof engine.expand !== 'function') return null;
    try {
      const type = language === 'html' ? 'markup' : 'stylesheet';
      const extracted = engine.extract(editor.value, editor.selectionStart, { type });
      const abbreviation = extracted?.abbreviation || '';
      if (abbreviation.toLowerCase() !== context.prefix.toLowerCase()) return null;
      const syntax = language === 'html' ? 'html' : 'css';
      const insert = engine.expand(abbreviation, { syntax, type, options: { 'output.indent': INDENT } });
      if (!insert || insert.trim() === abbreviation.trim()) return null;
      return { label: abbreviation, insert, kind: 'emmet', detail: 'Emmet Abbreviation', description: insert.split('\n').slice(0, 5).join('\n'), from: extracted.start };
    } catch {
      return null;
    }
  }

  function attachAutocomplete(editor, options = {}) {
    if (!editor?.parentElement) return null;
    const popup = document.createElement('div');
    popup.className = 'wdg-code-completions';
    popup.hidden = true;
    popup.setAttribute('role', 'listbox');
    editor.parentElement.appendChild(popup);
    let items = [];
    let selectedIndex = 0;
    let context = null;

    const fileName = () => typeof options.fileName === 'function' ? options.fileName() : options.fileName || '';
    const hide = () => {
      popup.hidden = true;
      popup.replaceChildren();
      items = [];
      context = null;
    };
    const render = () => {
      const fragment = document.createDocumentFragment();
      items.forEach((item, index) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', String(index === selectedIndex));
        row.className = index === selectedIndex ? 'active' : '';
        row.dataset.completionIndex = String(index);
        const icon = document.createElement('span');
        icon.className = `wdg-completion-icon is-${item.kind}`;
        icon.textContent = ({ tag: '<>', attribute: 'a', property: 'P', value: 'v', keyword: 'K', variable: 'x', function: 'ƒ', method: 'm', snippet: '▣', emmet: '⌘' })[item.kind] || '•';
        const main = document.createElement('span');
        main.className = 'wdg-completion-main';
        const label = document.createElement('span');
        label.className = 'wdg-completion-label';
        label.textContent = item.label;
        const detail = document.createElement('small');
        detail.textContent = item.detail || '';
        main.append(label, detail);
        const description = document.createElement('span');
        description.className = 'wdg-completion-description';
        description.textContent = item.description || item.kind;
        row.append(icon, main, description);
        fragment.append(row);
      });
      popup.replaceChildren(fragment);
    };
    const refresh = () => {
      if (typeof options.disabled === 'function' && options.disabled()) return hide();
      const language = completionLanguage(fileName());
      context = completionContext(editor, language);
      if (!language || !context || (context.prefix.length < 1 && !/[<.:\s]$/.test(context.before)) || editor.selectionStart !== editor.selectionEnd) return hide();
      const source = language === 'html'
        ? context.mode === 'tag' ? HTML_TAGS : HTML_ATTRIBUTES
        : language === 'css'
          ? context.mode === 'value' ? CSS_VALUES : CSS_PROPERTIES
          : context.mode === 'member'
            ? context.object === 'console' ? makeItems('assert clear count countReset debug dir error group groupCollapsed groupEnd info log table time timeEnd trace warn', 'method', 'Console method')
              : context.object === 'Math' ? makeItems('abs ceil floor max min pow random round sqrt trunc', 'method', 'Math method')
                : context.object === 'JSON' ? makeItems('parse stringify', 'method', 'JSON method')
                  : context.object === 'document' ? makeItems('createElement getElementById querySelector querySelectorAll addEventListener', 'method', 'Document method')
                    : context.object === 'localStorage' ? makeItems('clear getItem key removeItem setItem', 'method', 'Storage method') : []
            : COMPLETIONS.javascript;
      const lower = context.prefix.toLowerCase();
      const matches = source.filter(item => item.label.toLowerCase().startsWith(lower));
      items = matches.slice(0, 12).map(item => {
        if (language === 'html' && context.mode === 'attribute') return { ...item, from: context.from, insert: `${item.label}=""`, caret: item.label.length + 2 };
        if (language === 'css' && context.mode === 'property') return { ...item, from: context.from, insert: `${item.label}: ;`, caret: item.label.length + 2 };
        return { ...item, from: context.from, insert: item.insert || item.label, caret: item.caret ?? (item.insert || item.label).length };
      });
      const emmet = emmetCompletion(editor, language, context);
      if (emmet) items.unshift({ ...emmet, caret: emmet.insert.length });
      if (!items.length || (items.length === 1 && items[0].label === context.prefix && items[0].insert === context.prefix)) return hide();
      selectedIndex = 0;
      render();
      popup.hidden = false;
      positionPopup();
    };
    const positionPopup = () => {
      const mirror = document.createElement('div');
      const style = global.getComputedStyle(editor);
      for (const property of ['font', 'lineHeight', 'letterSpacing', 'padding', 'border', 'boxSizing', 'whiteSpace', 'wordBreak', 'overflowWrap']) mirror.style[property] = style[property];
      mirror.style.position = 'absolute'; mirror.style.visibility = 'hidden'; mirror.style.width = `${editor.clientWidth}px`; mirror.style.height = 'auto'; mirror.style.overflow = 'hidden';
      const marker = document.createElement('span');
      const before = editor.value.slice(0, editor.selectionStart);
      mirror.textContent = before;
      marker.textContent = editor.value.slice(editor.selectionStart, editor.selectionStart + 1) || '\u200b';
      mirror.append(marker);
      editor.parentElement.append(mirror);
      const top = editor.offsetTop + marker.offsetTop - editor.scrollTop + parseFloat(style.borderTopWidth || '0');
      const left = editor.offsetLeft + marker.offsetLeft - editor.scrollLeft;
      mirror.remove();
      popup.style.left = `${Math.max(8, Math.min(left, editor.clientWidth - popup.offsetWidth - 8))}px`;
      popup.style.top = `${top > editor.clientHeight * 0.62 ? Math.max(8, top - popup.offsetHeight - 28) : top + parseFloat(style.lineHeight || '20') + 4}px`;
    };
    const accept = index => {
      const item = items[index];
      if (!item) return false;
      replaceRange(editor, item.insert, item.from, editor.selectionStart, item.caret);
      hide();
      return true;
    };
    const handleKeydown = event => {
      if (typeof options.disabled === 'function' && options.disabled()) return false;
      if (popup.hidden || !items.length) return false;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = (selectedIndex + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        render();
        return true;
      }
      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        return accept(selectedIndex);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        hide();
        return true;
      }
      return false;
    };
    popup.addEventListener('pointerdown', event => {
      const button = event.target.closest('[data-completion-index]');
      if (!button) return;
      event.preventDefault();
      accept(Number(button.dataset.completionIndex));
      editor.focus();
    });
    editor.addEventListener('input', refresh);
    editor.addEventListener('click', refresh);
    editor.addEventListener('scroll', () => { if (!popup.hidden) positionPopup(); }, { passive: true });
    editor.addEventListener('blur', () => window.setTimeout(hide, 120));
    return { handleKeydown, refresh, hide };
  }

  function indentSelection(editor, outdent) {
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineEndIndex = value.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const block = value.slice(lineStart, lineEnd);
    const changed = outdent ? block.replace(/^( {1,2}|\t)/gm, '') : block.replace(/^/gm, INDENT);
    editor.setRangeText(changed, lineStart, lineEnd, 'select');
    editor.setSelectionRange(lineStart, lineStart + changed.length);
    emitInput(editor);
  }

  function smartEnter(editor) {
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineBefore = value.slice(lineStart, start);
    const indent = (lineBefore.match(/^[\t ]*/) || [''])[0];
    const previous = value[start - 1] || '';
    const next = value[end] || '';
    const betweenPair = OPEN_PAIRS[previous] === next || (previous === '>' && next === '<');
    const opensBlock = /[{[(]$/.test(lineBefore.trimEnd()) || /<[a-z][^<>]*>$/i.test(lineBefore.trimEnd());
    const insertion = betweenPair
      ? `\n${indent}${INDENT}\n${indent}`
      : `\n${indent}${opensBlock ? INDENT : ''}`;
    const caretOffset = betweenPair
      ? 1 + indent.length + INDENT.length
      : insertion.length;
    replaceRange(editor, insertion, start, end, caretOffset);
  }

  function handleKeydown(editor, event, options = {}) {
    if (!editor || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return false;
    const fileName = options.fileName || '';

    if (event.key === 'Tab') {
      event.preventDefault();
      if (!event.shiftKey && completeHtmlAttribute(editor, fileName)) return true;
      if (!event.shiftKey && editor.selectionStart === editor.selectionEnd && options.expandAbbreviation?.()) return true;
      if (!event.shiftKey && editor.selectionStart === editor.selectionEnd && expandEmmet(editor, fileName)) return true;
      if (!event.shiftKey && editor.selectionStart === editor.selectionEnd) {
        replaceRange(editor, INDENT, editor.selectionStart, editor.selectionEnd);
      } else {
        indentSelection(editor, event.shiftKey);
      }
      return true;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.shiftKey && completeHtmlAttribute(editor, fileName)) return true;
      smartEnter(editor);
      return true;
    }

    if (event.key === '=' && isMarkupFile(fileName) && editor.selectionStart === editor.selectionEnd) {
      const before = editor.value.slice(0, editor.selectionStart);
      const tagStart = before.lastIndexOf('<');
      const tagEnd = before.lastIndexOf('>');
      if (tagStart > tagEnd && !/^[!/]/.test(before.slice(tagStart + 1)) && /[:@\w.-]$/.test(before)) {
        event.preventDefault();
        replaceRange(editor, '=""', editor.selectionStart, editor.selectionEnd, 2);
        return true;
      }
    }

    const nextCharacter = editor.value[editor.selectionStart] || '';
    if (CLOSE_PAIRS.has(event.key) && nextCharacter === event.key && editor.selectionStart === editor.selectionEnd) {
      event.preventDefault();
      editor.setSelectionRange(editor.selectionStart + 1, editor.selectionStart + 1);
      return true;
    }

    if (OPEN_PAIRS[event.key]) {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end);
      const close = OPEN_PAIRS[event.key];
      replaceRange(editor, `${event.key}${selected}${close}`, start, end, selected ? selected.length + 2 : 1);
      return true;
    }

    if (event.key === 'Backspace' && editor.selectionStart === editor.selectionEnd) {
      const caret = editor.selectionStart;
      const previous = editor.value[caret - 1];
      const next = editor.value[caret];
      if (previous && OPEN_PAIRS[previous] === next) {
        event.preventDefault();
        replaceRange(editor, '', caret - 1, caret + 1, 0);
        return true;
      }
    }

    return false;
  }

  const api = Object.freeze({ attachAutocomplete, completeHtmlAttribute, expandEmmet, handleKeydown, indentSelection, smartEnter });
  global.WebDevGymCodeEditor = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
