(function setupWebDevGymMonaco(global) {
  'use strict';

  if (!global.webdevgymDesktop?.isDesktop || global.WebDevGymMonaco) return;

  const controllers = new WeakMap();
  let runtimePromise = null;
  let emmetReady = false;
  const themeStorageKey = 'wdgd_monaco_themes_v1';
  const snippetStorageKey = 'wdgd_monaco_snippets_v1';
  const extensionStorageKey = 'wdgd_monaco_extensions_v1';
  const nativeCompatibility = [
    { id: 'auto-close-tag', label: 'Auto Close Tag', patterns: ['auto-close-tag', 'autoclosetag'] },
    { id: 'auto-rename-tag', label: 'Auto Rename Tag', patterns: ['auto-rename-tag', 'autorenametag'] },
    { id: 'color-highlight', label: 'Color Highlight', patterns: ['color-highlight', 'colorhighlight'] },
    { id: 'error-lens', label: 'Error Lens', patterns: ['errorlens', 'error-lens'] },
    { id: 'live-preview', label: 'Live Preview', patterns: ['live-preview', 'live-server'] }
  ];
  const builtinThemes = [
    {
      id: 'webdevgym-dark', label: 'WebDevGym Dark', base: 'vs-dark',
      colors: { 'editor.background': '#080c12', 'editor.foreground': '#d7e2f0', 'editorLineNumber.foreground': '#526176', 'editorLineNumber.activeForeground': '#cbd5e1', 'editorCursor.foreground': '#c084fc', 'editor.selectionBackground': '#5b2a865c', 'editor.inactiveSelectionBackground': '#33415566', 'editor.lineHighlightBackground': '#111827', 'editorSuggestWidget.background': '#101722', 'editorSuggestWidget.border': '#334155', 'editorWidget.background': '#101722', 'editorWidget.border': '#334155' },
      rules: [{ token: 'comment', foreground: '718096' }, { token: 'keyword', foreground: 'C084FC' }, { token: 'string', foreground: '86EFAC' }, { token: 'number', foreground: 'FDE68A' }, { token: 'tag', foreground: 'F0ABFC' }, { token: 'attribute.name', foreground: '7DD3FC' }, { token: 'attribute.value', foreground: '86EFAC' }, { token: 'property', foreground: '67E8F9' }, { token: 'identifier.function', foreground: '93C5FD' }, { token: 'delimiter', foreground: '94A3B8' }]
    },
    {
      id: 'dracula', label: 'Dracula', base: 'vs-dark',
      colors: { 'editor.background': '#282a36', 'editor.foreground': '#f8f8f2', 'editorLineNumber.foreground': '#6272a4', 'editorCursor.foreground': '#f8f8f0', 'editor.selectionBackground': '#44475a', 'editor.lineHighlightBackground': '#44475a66', 'editorSuggestWidget.background': '#21222c', 'editorSuggestWidget.border': '#6272a4' },
      rules: [{ token: 'comment', foreground: '6272A4' }, { token: 'keyword', foreground: 'FF79C6' }, { token: 'string', foreground: 'F1FA8C' }, { token: 'number', foreground: 'BD93F9' }, { token: 'type', foreground: '8BE9FD' }, { token: 'tag', foreground: 'BD93F9' }, { token: 'attribute.name', foreground: '8BE9FD' }, { token: 'attribute.value', foreground: 'F1FA8C' }, { token: 'property', foreground: '50FA7B' }, { token: 'identifier.function', foreground: 'FFB86C' }, { token: 'delimiter', foreground: '6272A4' }]
    },
    {
      id: 'monokai', label: 'Monokai', base: 'vs-dark',
      colors: { 'editor.background': '#272822', 'editor.foreground': '#f8f8f2', 'editorLineNumber.foreground': '#75715e', 'editorCursor.foreground': '#f8f8f0', 'editor.selectionBackground': '#49483e', 'editor.lineHighlightBackground': '#3e3d32', 'editorSuggestWidget.background': '#1e1f1c', 'editorSuggestWidget.border': '#75715e' },
      rules: [{ token: 'comment', foreground: '75715E' }, { token: 'keyword', foreground: 'F92672' }, { token: 'string', foreground: 'E6DB74' }, { token: 'number', foreground: 'AE81FF' }, { token: 'type', foreground: '66D9EF' }, { token: 'tag', foreground: 'F92672' }, { token: 'attribute.name', foreground: 'A6E22E' }, { token: 'attribute.value', foreground: 'E6DB74' }, { token: 'property', foreground: 'A6E22E' }, { token: 'identifier.function', foreground: 'A6E22E' }, { token: 'delimiter', foreground: '75715E' }]
    },
    {
      id: 'nord', label: 'Nord', base: 'vs-dark',
      colors: { 'editor.background': '#2e3440', 'editor.foreground': '#d8dee9', 'editorLineNumber.foreground': '#616e88', 'editorCursor.foreground': '#88c0d0', 'editor.selectionBackground': '#434c5e', 'editor.lineHighlightBackground': '#3b4252', 'editorSuggestWidget.background': '#2e3440', 'editorSuggestWidget.border': '#4c566a' },
      rules: [{ token: 'comment', foreground: '616E88' }, { token: 'keyword', foreground: '81A1C1' }, { token: 'string', foreground: 'A3BE8C' }, { token: 'number', foreground: 'B48EAD' }, { token: 'type', foreground: '8FBCBB' }, { token: 'tag', foreground: '81A1C1' }, { token: 'attribute.name', foreground: '88C0D0' }, { token: 'attribute.value', foreground: 'A3BE8C' }, { token: 'property', foreground: '8FBCBB' }, { token: 'identifier.function', foreground: '88C0D0' }, { token: 'delimiter', foreground: '616E88' }]
    },
    {
      id: 'webdevgym-light', label: 'WebDevGym Light', base: 'vs',
      colors: { 'editor.background': '#f7f9fc', 'editor.foreground': '#202938', 'editorLineNumber.foreground': '#8491a3', 'editorLineNumber.activeForeground': '#374151', 'editorCursor.foreground': '#7c3aed', 'editor.selectionBackground': '#c4b5fd66', 'editor.lineHighlightBackground': '#eef2f7', 'editorSuggestWidget.background': '#ffffff', 'editorSuggestWidget.border': '#cbd5e1', 'editorWidget.background': '#ffffff', 'editorWidget.border': '#cbd5e1' },
      rules: [{ token: 'comment', foreground: '778399' }, { token: 'keyword', foreground: '7C3AED' }, { token: 'string', foreground: '15803D' }, { token: 'number', foreground: 'B45309' }, { token: 'tag', foreground: '7C3AED' }, { token: 'attribute.name', foreground: '0369A1' }, { token: 'attribute.value', foreground: '15803D' }, { token: 'property', foreground: '0F766E' }, { token: 'identifier.function', foreground: '1D4ED8' }, { token: 'delimiter', foreground: '64748B' }]
    }
  ];

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
  }

  function customThemes() {
    const themes = readJson(themeStorageKey, []);
    return Array.isArray(themes) ? themes : [];
  }

  function importedSnippets() {
    const snippets = readJson(snippetStorageKey, {});
    return snippets && typeof snippets === 'object' && !Array.isArray(snippets) ? snippets : {};
  }

  function installedExtensions() {
    const extensions = readJson(extensionStorageKey, []);
    return Array.isArray(extensions) ? extensions
      .filter(item => item && typeof item.id === 'string')
      .map(item => ({
        ...item,
        features: Array.isArray(item.features) ? item.features : compatibleFeatures(item)
      })) : [];
  }

  function compatibleFeatures(extension) {
    const identity = [extension?.id, extension?.name, extension?.displayName, extension?.publisher]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return nativeCompatibility
      .filter(feature => feature.patterns.some(pattern => identity.includes(pattern)))
      .map(({ id, label }) => ({ id, label }));
  }

  function mapTextMateScope(scope) {
    const value = String(scope || '').toLowerCase();
    if (/comment/.test(value)) return 'comment';
    if (/string|markup\.raw/.test(value)) return 'string';
    if (/constant\.numeric|number/.test(value)) return 'number';
    if (/keyword|storage\.type|storage\.modifier/.test(value)) return 'keyword';
    if (/entity\.name\.tag|entity\.name\.selector|support\.type/.test(value)) return 'tag';
    if (/entity\.other\.attribute-name|entity\.name\.attribute/.test(value)) return 'attribute.name';
    if (/punctuation\.definition\.tag|punctuation\.section\.tag/.test(value)) return 'delimiter';
    if (/entity\.name\.type|support\.type|entity\.name\.class/.test(value)) return 'type';
    if (/entity\.name\.function|support\.function/.test(value)) return 'identifier.function';
    if (/support\.constant|constant\.language/.test(value)) return 'predefined';
    if (/support\.type\.property-name|variable\.other\.property|entity\.name\.property/.test(value)) return 'property';
    if (/variable|entity\.name\.variable/.test(value)) return 'identifier';
    if (/punctuation|meta\.brace/.test(value)) return 'delimiter';
    return '';
  }

  function registerTheme(monaco, theme) {
    const colors = {};
    for (const [key, value] of Object.entries(theme.colors || {})) {
      if (/^(editor|editorGutter|editorLineNumber|editorCursor|editor.selection|editor.inactiveSelection|editor.lineHighlight|editorSuggestWidget|editorWidget)\./.test(key) && typeof value === 'string' && /^(#[\da-f]{3,8}|rgba?\([\d.,% ]+\))$/i.test(value)) colors[key] = value;
    }
    const rules = Array.isArray(theme.rules) ? [...theme.rules] : [];
    for (const entry of theme.tokenColors || []) {
      const settings = entry?.settings || {};
      const scopes = Array.isArray(entry?.scope) ? entry.scope : [entry?.scope];
      for (const scope of scopes) {
        const token = mapTextMateScope(scope);
        if (!token || !/^#[\da-f]{6}$/i.test(settings.foreground || '')) continue;
        rules.push({ token, foreground: settings.foreground.slice(1) });
      }
    }
    monaco.editor.defineTheme(theme.id, { base: theme.base === 'light' ? 'vs' : 'vs-dark', inherit: true, rules, colors });
  }

  function registerSnippetProviders(monaco) {
    const languages = ['html', 'css', 'scss', 'less', 'javascript', 'typescript', 'json', 'markdown', 'xml', 'yaml'];
    const languageAliases = {
      javascriptreact: 'javascript', javascriptjsx: 'javascript',
      typescriptreact: 'typescript', typescriptjsx: 'typescript',
      html: 'html', javascript: 'javascript', typescript: 'typescript'
    };
    return languages.map(language => monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems(model, position) {
        const snippets = importedSnippets();
        const suggestions = [];
        const word = model.getWordUntilPosition(position);
        const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, position.column);
        for (const [name, snippet] of Object.entries(snippets)) {
          const scopes = Array.isArray(snippet.languages) ? snippet.languages.map(value => String(value).toLowerCase()) : [];
          if (scopes.length && !scopes.some(scope => (languageAliases[scope] || scope) === language)) continue;
          const prefixes = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix || name];
          const body = Array.isArray(snippet.body) ? snippet.body.join('\n') : String(snippet.body || '');
          if (!body) continue;
          for (const prefix of prefixes) {
            suggestions.push({
              label: String(prefix),
              detail: name,
              documentation: snippet.description || '',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: body,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            });
          }
        }
        return { suggestions };
      }
    }));
  }

  const voidHtmlTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

  function markupTagPairs(text) {
    const stack = [];
    const pairs = [];
    const expression = /<\s*(\/?)\s*([A-Za-z][\w:.-]*)\b[^>]*?>/g;
    let match;
    while ((match = expression.exec(text))) {
      const raw = match[0];
      const name = match[2];
      const nameOffset = match.index + raw.indexOf(name);
      const token = {
        name,
        normalizedName: name.toLowerCase(),
        nameStart: nameOffset,
        nameEnd: nameOffset + name.length,
        start: match.index,
        end: expression.lastIndex,
        closing: Boolean(match[1]),
        selfClosing: /\/\s*>$/.test(raw)
      };
      if (token.closing) {
        const openingIndex = stack.findLastIndex(item => item.normalizedName === token.normalizedName);
        if (openingIndex >= 0) {
          const opening = stack[openingIndex];
          stack.splice(openingIndex);
          pairs.push({ opening, closing: token });
        }
      } else if (!token.selfClosing && !voidHtmlTags.has(token.normalizedName)) {
        stack.push(token);
      }
    }
    return { pairs, stack };
  }

  function registerMarkupCompatibility(monaco) {
    const provider = {
      provideLinkedEditingRanges(model, position) {
        const offset = model.getOffsetAt(position);
        const pair = markupTagPairs(model.getValue()).pairs.find(({ opening, closing }) =>
          (offset >= opening.nameStart && offset <= opening.nameEnd) ||
          (offset >= closing.nameStart && offset <= closing.nameEnd)
        );
        if (!pair) return null;
        const toRange = tag => {
          const start = model.getPositionAt(tag.nameStart);
          const end = model.getPositionAt(tag.nameEnd);
          return new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
        };
        return { ranges: [toRange(pair.opening), toRange(pair.closing)], wordPattern: /[A-Za-z][\w:.-]*/ };
      }
    };
    monaco.languages.registerLinkedEditingRangeProvider('html', provider);
    monaco.languages.registerLinkedEditingRangeProvider('xml', provider);
  }

  function assetUrl(relativePath) {
    return new URL(relativePath, global.location.href).href;
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-wdgd-runtime="${source}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = source;
      script.async = true;
      script.dataset.wdgdRuntime = source;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Could not load ${source}`)), { once: true });
      document.head.append(script);
    });
  }

  function languageForFile(fileName) {
    const extension = String(fileName || '').split('.').at(-1).toLowerCase();
    return ({
      html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
      js: 'javascript', cjs: 'javascript', mjs: 'javascript', jsx: 'javascript',
      ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'typescript',
      json: 'json', md: 'markdown', xml: 'xml', svg: 'html', yaml: 'yaml', yml: 'yaml'
    })[extension] || 'plaintext';
  }

  function ensureRuntime() {
    if (runtimePromise) return runtimePromise;
    runtimePromise = (async () => {
      const vsBase = assetUrl('vendor/monaco/vs');
      await loadScript(`${vsBase}/loader.js`);
      if (!global.require?.config) throw new Error('Monaco AMD loader is unavailable');
      global.require.config({ paths: { vs: vsBase } });
      await new Promise((resolve, reject) => global.require(['vs/editor/editor.main'], resolve, reject));
      if (!global.monaco?.editor) throw new Error('Monaco editor did not initialize');

      [...builtinThemes, ...customThemes()].forEach(theme => registerTheme(global.monaco, theme));
      registerSnippetProviders(global.monaco);
      registerMarkupCompatibility(global.monaco);

      try {
        await loadScript(assetUrl('vendor/emmet-monaco.min.js'));
        if (!emmetReady && global.emmetMonaco) {
          global.emmetMonaco.emmetHTML(global.monaco, ['html', 'php']);
          global.emmetMonaco.emmetCSS(global.monaco, ['css', 'scss', 'less']);
          global.emmetMonaco.emmetJSX(global.monaco, ['javascript', 'typescript']);
          emmetReady = true;
        }
      } catch (error) {
        console.warn('[WebDevGym Monaco] Emmet unavailable:', error);
      }
      return global.monaco;
    })();
    return runtimePromise;
  }

  async function mount(textarea, options = {}) {
    if (!textarea?.parentElement) return null;
    if (controllers.has(textarea)) return controllers.get(textarea);

    const monaco = await ensureRuntime();
    const host = document.createElement('div');
    host.className = 'wdgd-monaco-editor';
    host.dataset.desktopMonaco = '';
    textarea.before(host);

    const nativeValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    const nativeDisabled = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'disabled');
    const nativeFocus = textarea.focus.bind(textarea);
    const nativeSetRangeText = textarea.setRangeText.bind(textarea);
    const nativeSetSelectionRange = textarea.setSelectionRange.bind(textarea);
    const models = new Map();
    let activePath = '';
    let suppressInput = false;
    let readOnly = textarea.disabled;
    let nativeSyncTimer = 0;
    const editorOptions = {
      value: nativeValue.get.call(textarea),
      language: languageForFile(options.fileName?.() || ''),
      theme: localStorage.getItem('wdgd_monaco_theme_active_v1') || 'webdevgym-dark',
      automaticLayout: false,
      readOnly,
      fontFamily: '"JetBrains Mono", Consolas, monospace',
      fontSize: 13,
      lineHeight: 21,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      minimap: { enabled: false },
      overviewRulerBorder: false,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorSmoothCaretAnimation: 'on',
      cursorBlinking: 'smooth',
      linkedEditing: true,
      colorDecorators: true,
      colorDecoratorsActivatedOn: 'clickAndHover',
      definitionLinkOpensInPeek: true,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
      folding: true,
      stickyScroll: { enabled: false },
      quickSuggestions: { other: true, comments: false, strings: true },
      quickSuggestionsDelay: 120,
      suggestOnTriggerCharacters: true,
      tabCompletion: 'on',
      wordBasedSuggestions: 'currentDocument',
      formatOnPaste: true,
      formatOnType: false,
      selectionHighlight: false,
      occurrencesHighlight: 'off',
      largeFileOptimizations: true,
      padding: { top: 10, bottom: 10 },
      renderWhitespace: 'none',
      renderLineHighlight: 'line',
      roundedSelection: false
    };

    const instance = monaco.editor.create(host, editorOptions);
    let splitInstance = null;
    let splitHost = null;
    const diagnosticsByPath = new Map();
    const diagnosticDecorations = instance.createDecorationsCollection();

    function activeModel() {
      return instance.getModel();
    }

    function setNativeValue(value) {
      nativeValue.set.call(textarea, String(value ?? ''));
    }

    function scheduleNativeValueSync() {
      clearTimeout(nativeSyncTimer);
      nativeSyncTimer = window.setTimeout(() => {
        setNativeValue(activeModel()?.getValue() ?? '');
      }, 250);
    }

    function selectionOffsets() {
      const model = activeModel();
      const selection = instance.getSelection();
      if (!model || !selection) return { start: 0, end: 0 };
      return {
        start: model.getOffsetAt(selection.getStartPosition()),
        end: model.getOffsetAt(selection.getEndPosition())
      };
    }

    function selectOffsets(start, end = start, reveal = true) {
      const model = activeModel();
      if (!model) return;
      const safeStart = Math.max(0, Math.min(model.getValueLength(), Number(start) || 0));
      const safeEnd = Math.max(safeStart, Math.min(model.getValueLength(), Number(end) || safeStart));
      const selection = monaco.Selection.fromPositions(model.getPositionAt(safeStart), model.getPositionAt(safeEnd));
      instance.setSelection(selection);
      if (reveal) instance.revealRangeInCenterIfOutsideViewport(selection);
    }

    function setValue(value) {
      const model = activeModel();
      const nextValue = String(value ?? '');
      setNativeValue(nextValue);
      if (!model || model.getValue() === nextValue) return;
      suppressInput = true;
      model.setValue(nextValue);
      suppressInput = false;
    }

    function normalizedProblem(problem, model) {
      const line = Math.max(1, Math.min(model.getLineCount(), Number(problem?.line) || 1));
      const maxColumn = model.getLineMaxColumn(line);
      const column = Math.max(1, Math.min(maxColumn, Number(problem?.column) || 1));
      const endLine = Math.max(line, Math.min(model.getLineCount(), Number(problem?.endLine) || line));
      const endMaxColumn = model.getLineMaxColumn(endLine);
      let endColumn = Math.max(1, Math.min(endMaxColumn, Number(problem?.endColumn) || column + 1));
      if (endLine === line && endColumn <= column && column < maxColumn) endColumn = column + 1;
      if (endLine === line && endColumn < column) endColumn = column;
      return { ...problem, line, column, endLine, endColumn };
    }

    function applyDiagnostics(filePath) {
      const model = models.get(filePath);
      if (!model) return;
      const problems = (diagnosticsByPath.get(filePath) || []).map(problem => normalizedProblem(problem, model));
      monaco.editor.setModelMarkers(model, 'webdevgym', problems.map(problem => ({
        startLineNumber: problem.line,
        startColumn: problem.column,
        endLineNumber: problem.endLine,
        endColumn: problem.endColumn,
        message: String(problem.message || ''),
        source: String(problem.source || 'WebDevGym'),
        code: problem.rule ? String(problem.rule) : undefined,
        severity: problem.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning
      })));
      if (instance.getModel() !== model) return;
      diagnosticDecorations.set(problems.map(problem => ({
        range: new monaco.Range(problem.line, problem.column, problem.endLine, problem.endColumn),
        options: {
          hoverMessage: { value: String(problem.message || '') },
          after: {
            content: `  ${String(problem.message || '').replace(/\s+/g, ' ').slice(0, 180)}`,
            inlineClassName: `wdgd-error-lens ${problem.severity === 'error' ? 'is-error' : 'is-warning'}`
          }
        }
      })));
    }

    function openFile(filePath, content) {
      const path = String(filePath || 'untitled');
      let model = models.get(path);
      if (!model) {
        const uri = monaco.Uri.parse(`inmemory://webdevgym/${encodeURIComponent(path)}`);
        model = monaco.editor.createModel(String(content ?? ''), languageForFile(path), uri);
        models.set(path, model);
      } else {
        monaco.editor.setModelLanguage(model, languageForFile(path));
        if (model.getValue() !== String(content ?? '')) {
          suppressInput = true;
          model.setValue(String(content ?? ''));
          suppressInput = false;
        }
      }
      activePath = path;
      suppressInput = true;
      instance.setModel(model);
      suppressInput = false;
      setNativeValue(model.getValue());
      instance.updateOptions({ readOnly });
      applyDiagnostics(path);
      instance.focus();
    }

    const controller = {
      editor: instance,
      host,
      openFile,
      openSplitFile(filePath, content) {
        const path = String(filePath || 'untitled');
        let model = models.get(path);
        if (!model) {
          model = monaco.editor.createModel(String(content ?? ''), languageForFile(path), monaco.Uri.parse(`inmemory://webdevgym/${encodeURIComponent(path)}`));
          models.set(path, model);
        }
        if (!splitInstance) return false;
        splitInstance.setModel(model);
        splitInstance.updateOptions({ readOnly: false });
        splitInstance.focus();
        return true;
      },
      setSplit(enabled, container = host.parentElement) {
        if (!enabled) {
          if (splitHost) resizeObserver.unobserve(splitHost);
          splitInstance?.dispose();
          splitInstance = null;
          splitHost?.remove();
          splitHost = null;
          return false;
        }
        if (splitInstance) return true;
        splitHost = document.createElement('div');
        splitHost.className = 'wdgd-monaco-editor wdgd-monaco-editor-split';
        splitHost.dataset.desktopMonacoSplit = '';
        container.append(splitHost);
        resizeObserver.observe(splitHost);
        splitInstance = monaco.editor.create(splitHost, { ...editorOptions, model: activeModel(), readOnly: false });
        splitInstance.onDidChangeModelContent(() => {
          const model = splitInstance?.getModel();
          if (model && typeof options.onDidChange === 'function') options.onDidChange([...models.entries()].find(([, item]) => item === model)?.[0] || '');
        });
        return true;
      },
      setSplitDirection(direction) {
        splitHost?.parentElement?.classList.toggle('is-split-horizontal', direction === 'horizontal');
      },
      getFileValue(filePath) { return models.get(filePath)?.getValue() ?? ''; },
      activeSplitFile() { return [...models.entries()].find(([, model]) => model === splitInstance?.getModel())?.[0] || ''; },
      closeFile(filePath) {
        const model = models.get(filePath);
        if (!model) return;
        if (instance.getModel() === model) instance.setModel(null);
        if (splitInstance?.getModel() === model) splitInstance.setModel(null);
        model.dispose();
        models.delete(filePath);
      },
      clear() {
        activePath = '';
        suppressInput = true;
        instance.setModel(null);
        suppressInput = false;
        diagnosticDecorations.clear();
        setNativeValue('');
      },
      renameFile(oldPath, newPath, content) {
        this.closeFile(oldPath);
        openFile(newPath, content);
      },
      setLanguage(filePath) {
        const model = activeModel();
        if (model) monaco.editor.setModelLanguage(model, languageForFile(filePath));
      },
      setDiagnostics(filePath, problems = []) {
        const path = String(filePath || activePath || '');
        if (!path) return;
        diagnosticsByPath.set(path, Array.isArray(problems) ? problems : []);
        applyDiagnostics(path);
      },
      getValue: () => activeModel()?.getValue() || '',
      setValue,
      focus: () => instance.focus(),
      selectOffsets,
      layout: () => instance.layout(),
      layoutSplit: () => splitInstance?.layout(),
      setTheme(themeId) {
        monaco.editor.setTheme(themeId);
        localStorage.setItem('wdgd_monaco_theme_active_v1', themeId);
      },
      importTheme(theme) {
        registerTheme(monaco, theme);
        const themes = customThemes().filter(item => item.id !== theme.id);
        themes.push(theme);
        localStorage.setItem(themeStorageKey, JSON.stringify(themes));
        this.setTheme(theme.id);
      },
      importSnippets(snippets) {
        const stored = importedSnippets();
        Object.assign(stored, snippets);
        localStorage.setItem(snippetStorageKey, JSON.stringify(stored));
        return Object.keys(snippets).length;
      },
      importExtension(extension) {
        if (!extension || typeof extension.id !== 'string' || !extension.id || !Array.isArray(extension.themes) || !Array.isArray(extension.snippets)) {
          throw new Error('Invalid extension contributions');
        }
        this.removeExtension(extension.id);
        const themes = customThemes();
        const themeIds = [];
        for (const theme of extension.themes) {
          if (!theme || typeof theme.id !== 'string') continue;
          const safeTheme = { ...theme, label: String(theme.label || theme.id).slice(0, 140) };
          registerTheme(monaco, safeTheme);
          const existing = themes.findIndex(item => item.id === safeTheme.id);
          if (existing >= 0) themes.splice(existing, 1);
          themes.push(safeTheme);
          themeIds.push(safeTheme.id);
        }
        localStorage.setItem(themeStorageKey, JSON.stringify(themes));

        const snippets = importedSnippets();
        const snippetKeys = [];
        for (const snippet of extension.snippets) {
          if (!snippet || typeof snippet.name !== 'string' || !snippet.body) continue;
          const key = `${extension.id}::${snippet.name}`;
          snippets[key] = {
            prefix: snippet.prefix || snippet.name,
            body: snippet.body,
            description: snippet.description || '',
            languages: Array.isArray(snippet.languages) ? snippet.languages : []
          };
          snippetKeys.push(key);
        }
        localStorage.setItem(snippetStorageKey, JSON.stringify(snippets));

        const features = compatibleFeatures(extension);
        const records = installedExtensions().filter(item => item.id !== extension.id);
        records.push({
          id: extension.id,
          name: String(extension.name || extension.id).slice(0, 100),
          publisher: String(extension.publisher || '').slice(0, 100),
          version: String(extension.version || '').slice(0, 40),
          description: String(extension.description || '').slice(0, 300),
          source: String(extension.source || 'vsix').slice(0, 40),
          themes: themeIds,
          snippets: snippetKeys,
          features,
          ignoredCount: Math.max(0, Number(extension.ignoredCount) || 0),
          installedAt: Date.now()
        });
        localStorage.setItem(extensionStorageKey, JSON.stringify(records));
        return { themes: themeIds.length, snippets: snippetKeys.length, features: features.length };
      },
      removeExtension(extensionId) {
        const records = installedExtensions();
        const extension = records.find(item => item.id === extensionId);
        if (!extension) return false;

        const themeIds = new Set(Array.isArray(extension.themes) ? extension.themes : []);
        const themes = customThemes().filter(theme => !themeIds.has(theme.id));
        localStorage.setItem(themeStorageKey, JSON.stringify(themes));
        if (themeIds.has(localStorage.getItem('wdgd_monaco_theme_active_v1'))) this.setTheme('webdevgym-dark');

        const snippetKeys = new Set(Array.isArray(extension.snippets) ? extension.snippets : []);
        const snippets = importedSnippets();
        for (const key of snippetKeys) delete snippets[key];
        localStorage.setItem(snippetStorageKey, JSON.stringify(snippets));
        localStorage.setItem(extensionStorageKey, JSON.stringify(records.filter(item => item.id !== extensionId)));
        return true;
      },
      dispose() {
        clearTimeout(nativeSyncTimer);
        cancelAnimationFrame(resizeFrame);
        resizeObserver.disconnect();
        splitInstance?.dispose();
        diagnosticDecorations.clear();
        diagnosticsByPath.clear();
        instance.dispose();
        models.forEach(model => model.dispose());
        models.clear();
        host.remove();
        textarea.hidden = false;
      }
    };
    controllers.set(textarea, controller);

    let autoCloseInProgress = false;
    function autoCloseMarkupTag(event) {
      if (autoCloseInProgress || event.isUndoing || event.isRedoing || event.changes.length !== 1 || event.changes[0].text !== '>') return;
      const model = activeModel();
      if (!model || !['html', 'xml'].includes(model.getLanguageId())) return;
      const cursorOffset = event.changes[0].rangeOffset + 1;
      const value = model.getValue();
      const beforeCursor = value.slice(0, cursorOffset);
      const lastTag = [...beforeCursor.matchAll(/<\s*(\/?)\s*([A-Za-z][\w:.-]*)\b[^>]*?>/g)].at(-1);
      if (!lastTag || lastTag.index + lastTag[0].length !== beforeCursor.length) return;
      const tagName = lastTag[2];
      if (lastTag[1] || /\/\s*>$/.test(lastTag[0]) || voidHtmlTags.has(tagName.toLowerCase())) return;
      if (value.slice(cursorOffset).startsWith(`</${tagName}>`)) return;
      const position = model.getPositionAt(cursorOffset);
      autoCloseInProgress = true;
      instance.executeEdits('webdevgym-auto-close-tag', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: `</${tagName}>`,
        forceMoveMarkers: true
      }]);
      instance.setPosition(position);
      autoCloseInProgress = false;
    }

    instance.onDidChangeModelContent(event => {
      autoCloseMarkupTag(event);
      if (suppressInput) return;
      if (typeof options.onDidChange !== 'function') scheduleNativeValueSync();
      if (typeof options.onDidChange === 'function') {
        const model = activeModel();
        options.onDidChange([...models.entries()].find(([, item]) => item === model)?.[0] || '');
      }
      else textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    Object.defineProperty(textarea, 'value', {
      configurable: true,
      get: () => activeModel()?.getValue() ?? nativeValue.get.call(textarea),
      set: setValue
    });
    Object.defineProperty(textarea, 'disabled', {
      configurable: true,
      get: () => readOnly,
      set(value) {
        readOnly = Boolean(value);
        nativeDisabled.set.call(textarea, readOnly);
        instance.updateOptions({ readOnly });
      }
    });
    Object.defineProperty(textarea, 'selectionStart', {
      configurable: true,
      get: () => selectionOffsets().start,
      set: value => selectOffsets(value, Math.max(value, selectionOffsets().end), false)
    });
    Object.defineProperty(textarea, 'selectionEnd', {
      configurable: true,
      get: () => selectionOffsets().end,
      set: value => selectOffsets(Math.min(selectionOffsets().start, value), value, false)
    });
    textarea.focus = () => instance.focus();
    textarea.setSelectionRange = (start, end) => selectOffsets(start, end);
    textarea.setRangeText = (replacement, start, end, selectionMode = 'preserve') => {
      const model = activeModel();
      if (!model) return nativeSetRangeText(replacement, start, end, selectionMode);
      const value = model.getValue();
      const next = value.slice(0, start) + replacement + value.slice(end);
      setValue(next);
      const replacementEnd = start + String(replacement).length;
      if (selectionMode === 'select') selectOffsets(start, replacementEnd);
      else if (selectionMode === 'start') selectOffsets(start);
      else selectOffsets(replacementEnd);
    };

    textarea.classList.add('wdgd-editor-fallback-hidden');
    textarea.setAttribute('aria-hidden', 'true');
    const initialPath = options.fileName?.() || '';
    if (initialPath) openFile(initialPath, nativeValue.get.call(textarea));

    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        instance.layout();
        splitInstance?.layout();
      });
    });
    resizeObserver.observe(host);

    global.dispatchEvent(new CustomEvent('webdevgym:monaco-ready', { detail: { textarea, controller } }));
    return controller;
  }

  global.WebDevGymMonaco = Object.freeze({
    ensureRuntime,
    languageForFile,
    themes() { return [...builtinThemes, ...customThemes()].map(({ id, label }) => ({ id, label })); },
    extensions() { return installedExtensions(); },
    activeTheme() { return localStorage.getItem('wdgd_monaco_theme_active_v1') || 'webdevgym-dark'; },
    mount,
    get(textarea) { return controllers.get(textarea) || null; }
  });
})(window);
