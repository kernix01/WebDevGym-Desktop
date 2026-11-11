const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const packagedInput = process.env.WEBDEVGYM_ELECTRON_BINARY || process.argv[2] || '';
const packagedBinary = packagedInput ? path.resolve(packagedInput) : '';
const electronPath = packagedBinary || require('electron');
const projectRoot = path.resolve(__dirname, '..');

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function removeTemporaryDirectory(directory) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      fs.rmSync(directory, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!['EBUSY', 'EPERM', 'ENOTEMPTY'].includes(error.code)) throw error;
      await delay(250);
    }
  }
  fs.rmSync(directory, { recursive: true, force: true });
}

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForPage(port, child, output) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Electron stopped before loading the page.\n${output.join('')}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find(target => target.type === 'page' && target.url.startsWith('webdevgym://app/'));
      if (page?.webSocketDebuggerUrl) return page;
    } catch (error) {}
    await delay(200);
  }
  throw new Error(`Electron page did not become ready.\n${output.join('')}`);
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let requestId = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    close() {
      socket.close();
    },
    send(method, params = {}) {
      requestId += 1;
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
        socket.send(JSON.stringify({ id: requestId, method, params }));
      });
    }
  };
}

async function main() {
  const port = await availablePort();
  const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'webdevgym-electron-smoke-'));
  const workspaceDirectory = path.join(profileDirectory, 'desktop-sample');
  const secondWorkspaceDirectory = path.join(profileDirectory, 'second-desktop-project');
  fs.mkdirSync(path.join(workspaceDirectory, 'src'), { recursive: true });
  fs.mkdirSync(path.join(workspaceDirectory, 'covers'), { recursive: true });
  fs.mkdirSync(secondWorkspaceDirectory, { recursive: true });
  fs.writeFileSync(path.join(secondWorkspaceDirectory, 'index.html'), '<h1>Second instance folder</h1>', 'utf8');
  fs.writeFileSync(path.join(secondWorkspaceDirectory, 'package.json'), JSON.stringify({
    name: 'second-desktop-project'
  }), 'utf8');
  fs.writeFileSync(path.join(workspaceDirectory, 'index.html'), `<!doctype html>
<html><body>
  <h1>Desktop smoke project</h1>
  <img id="cover" src="covers/pixel.png" alt="Smoke cover">
  <ul id="tracks"></ul>
  <script src="src/app.js" defer></script>
</body></html>`, 'utf8');
  fs.writeFileSync(path.join(workspaceDirectory, 'welcome.html'), `<!doctype html>
<html><body>
  <h1 id="welcome-title">Welcome from a non-index file</h1>
  <script>parent.postMessage({ type: 'webdevgym-named-html-smoke', title: document.querySelector('#welcome-title').textContent }, '*');<\/script>
</body></html>`, 'utf8');
  fs.writeFileSync(path.join(workspaceDirectory, 'src', 'app.js'), `
const savedTrack = localStorage.getItem('desktop-smoke-track');
localStorage.setItem('desktop-smoke-track', savedTrack || '0');
document.getElementById('tracks').innerHTML = '<li>Track one</li><li>Track two</li>';
const cover = document.getElementById('cover');
const report = () => parent.postMessage({
  type: 'webdevgym-desktop-preview-smoke',
  storageReady: localStorage.getItem('desktop-smoke-track') === '0',
  coverReady: cover.complete && cover.naturalWidth === 1,
  itemCount: document.querySelectorAll('#tracks li').length
}, '*');
if (cover.complete) report();
else cover.addEventListener('load', report, { once: true });
`, 'utf8');
  fs.writeFileSync(path.join(workspaceDirectory, 'covers', 'pixel.png'), Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  ));
  fs.writeFileSync(path.join(workspaceDirectory, 'package.json'), JSON.stringify({
    name: 'desktop-smoke',
    scripts: { dev: 'node -e "console.log(\'http://localhost:4173/\')"' },
    dependencies: { 'smoke-runtime': '^1.0.0' },
    devDependencies: { 'smoke-dev': '^2.0.0' }
  }), 'utf8');
  fs.mkdirSync(path.join(workspaceDirectory, 'node_modules', 'smoke-runtime'), { recursive: true });
  fs.writeFileSync(path.join(workspaceDirectory, 'node_modules', 'smoke-runtime', 'package.json'), JSON.stringify({
    name: 'smoke-runtime',
    version: '1.0.2'
  }), 'utf8');
  fs.writeFileSync(path.join(workspaceDirectory, 'git-smoke.txt'), 'Git smoke baseline\n', 'utf8');
  for (const args of [
    ['init'],
    ['config', 'user.email', 'desktop-smoke@webdevgym.local'],
    ['config', 'user.name', 'WebDevGym Smoke'],
    ['add', '-A'],
    ['commit', '-m', 'Initial smoke project']
  ]) {
    const git = spawnSync('git', args, { cwd: workspaceDirectory, encoding: 'utf8', windowsHide: true });
    if (git.status !== 0) throw new Error(git.stderr || git.stdout || `git ${args.join(' ')} failed`);
  }
  fs.writeFileSync(path.join(workspaceDirectory, 'git-smoke.txt'), 'Git smoke changed\n', 'utf8');
  const output = [];
  const launchArguments = [];
  if (!packagedBinary) launchArguments.push(projectRoot);
  launchArguments.push(
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    '--smoke',
    '--open-path',
    path.join(workspaceDirectory, 'src', 'app.js')
  );

  const child = spawn(electronPath, launchArguments, {
    cwd: projectRoot,
    env: {
      ...process.env,
      ELECTRON_ENABLE_SECURITY_WARNINGS: 'true',
      WEBDEVGYM_TEST_USER_DATA: profileDirectory,
      WEBDEVGYM_SYNC_PORT: '0'
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false
  });

  child.stdout.on('data', chunk => output.push(chunk.toString()));
  child.stderr.on('data', chunk => output.push(chunk.toString()));

  let cdp;
  let secondInstanceChild;
  try {
    const page = await waitForPage(port, child, output);
    cdp = await connectCdp(page.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    const evaluation = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        for (let attempt = 0; attempt < 40; attempt += 1) {
          const launchProject = document.querySelector('[data-desktop-project-name]')?.textContent || '';
          const launchFile = document.querySelector('[data-desktop-file-name]')?.textContent || '';
          if (launchProject === 'desktop-smoke' && launchFile === 'src/app.js') break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        const launchShell = document.getElementById('wdgdShell');
        const explorerLaunchOpened = launchShell?.hidden === false;
        const explorerLaunchProject = document.querySelector('[data-desktop-project-name]')?.textContent || '';
        const explorerLaunchFile = document.querySelector('[data-desktop-file-name]')?.textContent || '';
        const explorerLaunchContent = document.querySelector('[data-desktop-editor]')?.value || '';
        const visibleButton = label => [...document.querySelectorAll('button')]
          .find(button => button.textContent.trim() === label && button.offsetParent !== null);
        const waitUntil = async (predicate, timeout = 3000) => {
          const deadline = performance.now() + timeout;
          while (performance.now() < deadline) {
            if (predicate()) return true;
            await new Promise(resolve => setTimeout(resolve, 80));
          }
          return Boolean(predicate());
        };
        let monacoRuntimeError = '';
        try {
          await window.WebDevGymMonaco?.ensureRuntime();
        } catch (error) {
          monacoRuntimeError = error?.stack || error?.message || String(error);
        }
        const monacoMounted = await waitUntil(() => Boolean(document.querySelector('[data-desktop-monaco] .monaco-editor')), 5000);
        const routes = visibleButton('Маршруты');
        const overview = visibleButton('Обзор');
        const firstStart = performance.now();
        routes?.click();
        const firstRouteMs = performance.now() - firstStart;
        overview?.click();
        const cachedAfterOverview = document.querySelectorAll('[data-feature-page="paths"]').length;
        const repeatStart = performance.now();
        routes?.click();
        const repeatedRouteMs = performance.now() - repeatStart;
        await new Promise(resolve => requestAnimationFrame(resolve));
        const pathOpenAfterRoutes = Boolean(document.querySelector('[data-feature-page="paths"].open'));
        const pathPageCountAfterRoutes = document.querySelectorAll('[data-feature-page="paths"]').length;
        const playgroundButton = visibleButton('Playground');
        playgroundButton?.click();
        await new Promise(resolve => setTimeout(resolve, 400));
        const playgroundEditor = document.getElementById('pg-editor');
        let playgroundIndentWorks = false;
        let playgroundClassCompletionWorks = false;
        if (playgroundEditor) {
          playgroundEditor.value = '  const title = "Nightwave";';
          playgroundEditor.setSelectionRange(playgroundEditor.value.length, playgroundEditor.value.length);
          playgroundEditor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
          playgroundIndentWorks = playgroundEditor.value.endsWith('\\n  ');
          playgroundEditor.value = '<div class';
          playgroundEditor.setSelectionRange(playgroundEditor.value.length, playgroundEditor.value.length);
          playgroundEditor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
          playgroundClassCompletionWorks = playgroundEditor.value === '<div class=""';
        }
        const playgroundAddFile = document.querySelector('[data-wdga-add-file]');
        playgroundAddFile?.click();
        const playgroundCreateDialog = document.querySelector('[data-wdga-create-dialog]');
        const playgroundCreateInput = document.querySelector('[data-wdga-create-path]');
        const playgroundCreateForm = document.querySelector('[data-wdga-create-form]');
        const playgroundCreateDialogOpens = Boolean(playgroundCreateDialog?.open);
        if (playgroundCreateInput && playgroundCreateForm) {
          playgroundCreateInput.value = 'tests/smoke-created.js';
          playgroundCreateForm.requestSubmit();
        }
        const playgroundCreatedFile = document.querySelector('[data-wdga-tree-file="tests/smoke-created.js"]');
        const playgroundCreatedFileContent = playgroundEditor?.value || '';
        document.querySelector('[data-wdga-add-folder]')?.click();
        if (playgroundCreateInput && playgroundCreateForm) {
          playgroundCreateInput.value = 'assets/smoke-icons';
          playgroundCreateForm.requestSubmit();
        }
        const playgroundCreatedFolder = document.querySelector('[data-wdga-folder="assets/smoke-icons"]');
        overview?.click();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const testToken = 'github_pat_' + 'a'.repeat(32);
        await window.webdevgymDesktop.githubToken.save(testToken);
        const tokenRoundTrip = await window.webdevgymDesktop.githubToken.load() === testToken;
        const appInfo = await window.webdevgymDesktop.desktop.appInfo();
        const recentProjects = await window.webdevgymDesktop.desktop.recentProjects();
        const desktopLauncher = document.getElementById('wdgdLauncher');
        const launcherRect = desktopLauncher?.getBoundingClientRect();
        const launcherStyles = desktopLauncher ? getComputedStyle(desktopLauncher) : null;
        const desktopLauncherVisible = Boolean(
          desktopLauncher &&
          launcherStyles.display !== 'none' &&
          launcherStyles.visibility !== 'hidden' &&
          Number(launcherStyles.opacity) > 0 &&
          launcherRect.width >= 30 &&
          launcherRect.height >= 30 &&
          launcherRect.left >= 0 &&
          launcherRect.top >= 0 &&
          launcherRect.right <= window.innerWidth &&
          launcherRect.bottom <= window.innerHeight
        );
        if (document.getElementById('wdgdShell')?.hidden) desktopLauncher?.click();
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (!window.WebDevGymDesktopProjectContext?.snapshot()?.available) {
          await waitUntil(() => Boolean(document.querySelector('.wdgd-recent')), 4000);
          document.querySelector('.wdgd-recent')?.click();
        }
        await waitUntil(() => Boolean(window.WebDevGymDesktopProjectContext?.snapshot()?.currentFile), 5000);
        await new Promise(resolve => setTimeout(resolve, 250));
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'f',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        }));
        await new Promise(resolve => setTimeout(resolve, 50));
        const searchViewOpenedByShortcut = document.querySelector('[data-desktop-view="search"]')?.hidden === false;
        const projectSearchInput = document.querySelector('[data-project-search-input]');
        projectSearchInput.value = 'Track two';
        document.querySelector('[data-project-search-form]')?.requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 350));
        const firstProjectSearchResult = document.querySelector('.wdgd-search-result');
        const projectSearchFound = Boolean(firstProjectSearchResult && firstProjectSearchResult.textContent.includes('src/app.js'));
        document.querySelector('[data-search-case]')?.click();
        projectSearchInput.value = 'track two';
        document.querySelector('[data-project-search-form]')?.requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 250));
        const projectSearchCaseSensitive = !document.querySelector('.wdgd-search-result');
        document.querySelector('[data-search-case]')?.click();
        await new Promise(resolve => setTimeout(resolve, 250));
        const projectSearchResult = document.querySelector('.wdgd-search-result');
        projectSearchResult?.click();
        await new Promise(resolve => setTimeout(resolve, 250));
        const searchEditor = document.querySelector('[data-desktop-editor]');
        const searchOpenedFile = document.querySelector('[data-desktop-file-name]')?.textContent === 'src/app.js';
        const searchSelectedText = searchEditor?.value.slice(searchEditor.selectionStart, searchEditor.selectionEnd) || '';
        const desktopPreviewResult = await new Promise(resolve => {
          const timeout = setTimeout(() => resolve(null), 4000);
          const receive = event => {
            if (event.data?.type !== 'webdevgym-desktop-preview-smoke') return;
            clearTimeout(timeout);
            window.removeEventListener('message', receive);
            resolve(event.data);
          };
          window.addEventListener('message', receive);
          document.querySelector('[data-desktop-preview]')?.click();
        });
        const nestedFileInitiallyHidden = !document.querySelector('.wdgd-tree-row[title="src/app.js"]');
        document.querySelector('.wdgd-tree-row[title="src"]')?.click();
        const nestedFileAfterExpand = Boolean(document.querySelector('.wdgd-tree-row[title="src/app.js"]'));
        document.querySelector('[data-desktop-collapse]')?.click();
        const nestedFileAfterCollapse = Boolean(document.querySelector('.wdgd-tree-row[title="src/app.js"]'));
        document.querySelector('.wdgd-tree-row[title="index.html"]')?.click();
        await new Promise(resolve => setTimeout(resolve, 200));
        const desktopEditor = document.querySelector('[data-desktop-editor]');
        const desktopOpenTabs = [...document.querySelectorAll('[data-desktop-open-file]')]
          .map(tab => tab.dataset.desktopOpenFile);
        desktopEditor.value = '!';
        desktopEditor.setSelectionRange(1, 1);
        desktopEditor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        const desktopHtmlBoilerplateWorks = desktopEditor.value.includes('<!DOCTYPE html>') &&
          desktopEditor.value.includes('<body>');
        const desktopMonaco = window.WebDevGymMonaco?.get(desktopEditor);
        const typingContentBefore = desktopEditor.value;
        desktopMonaco?.setValue('');
        const typingStartedAt = performance.now();
        for (let index = 0; index < 120; index += 1) {
          desktopMonaco?.editor.executeEdits('typing-smoke', [{
            range: new window.monaco.Range(1, index + 1, 1, index + 1),
            text: 'a',
            forceMoveMarkers: true
          }]);
        }
        const desktopTypingBurstMs = performance.now() - typingStartedAt;
        const desktopTypingCharacters = desktopEditor.value.length;
        desktopMonaco?.setValue(typingContentBefore);
        desktopMonaco?.setValue('ul>li.item*3');
        desktopMonaco?.selectOffsets('ul>li.item*3'.length);
        desktopMonaco?.editor.trigger('smoke', 'editor.action.triggerSuggest', {});
        const desktopMonacoEmmetSuggestion = await waitUntil(() =>
          Boolean(document.querySelector('.suggest-widget.visible .monaco-list-row')),
          2500
        );
        desktopMonaco?.editor.trigger('smoke', 'acceptSelectedSuggestion', {});
        await new Promise(resolve => setTimeout(resolve, 120));
        const desktopMonacoEmmetWorks = desktopEditor.value.includes('<ul>') &&
          (desktopEditor.value.match(/class="item"/g) || []).length === 3;
        desktopMonaco?.setLanguage('index.html');
        desktopMonaco?.setValue('<article');
        desktopMonaco?.selectOffsets('<article'.length);
        desktopMonaco?.editor.trigger('smoke', 'type', { text: '>' });
        const desktopAutoCloseTagWorks = await waitUntil(() => desktopEditor.value === '<article></article>', 2000);
        const desktopAutoCloseTagValue = desktopEditor.value;
        desktopMonaco?.setValue('<section></section>');
        desktopMonaco?.selectOffsets(1, 'section'.length + 1);
        await new Promise(resolve => setTimeout(resolve, 300));
        desktopMonaco?.editor.trigger('smoke', 'type', { text: 'article' });
        const desktopAutoRenameTagWorks = await waitUntil(() => desktopEditor.value === '<article></article>', 2500);
        window.monaco.editor.setModelLanguage(desktopMonaco.editor.getModel(), 'css');
        desktopMonaco?.setValue('.sample { color: #ff3366; }');
        const desktopColorHighlightWorks = await waitUntil(() =>
          Boolean(document.querySelector('.colorpicker-color-decoration')),
          2500
        );
        desktopMonaco?.setLanguage('index.html');
        desktopMonaco?.setValue(typingContentBefore);
        document.querySelector('[data-desktop-open-file="src/app.js"]')?.click();
        await new Promise(resolve => setTimeout(resolve, 150));
        const appContentBeforeAutocomplete = desktopEditor.value;
        desktopMonaco?.setValue('cons');
        desktopMonaco?.selectOffsets(4);
        desktopMonaco?.editor.trigger('smoke', 'editor.action.triggerSuggest', {});
        const desktopAutocompleteVisible = await waitUntil(() =>
          Boolean(document.querySelector('.suggest-widget.visible .monaco-list-row')),
          2500
        );
        desktopMonaco?.editor.trigger('smoke', 'acceptSelectedSuggestion', {});
        await new Promise(resolve => setTimeout(resolve, 100));
        const desktopAutocompleteApplied = desktopEditor.value.startsWith('console');
        desktopEditor.value = appContentBeforeAutocomplete;
        desktopEditor.dispatchEvent(new Event('input', { bubbles: true }));
        const desktopNamedHtmlPreview = await new Promise(resolve => {
          const timeout = setTimeout(() => resolve(''), 4000);
          const receive = event => {
            if (event.data?.type !== 'webdevgym-named-html-smoke') return;
            clearTimeout(timeout);
            window.removeEventListener('message', receive);
            resolve(event.data.title || '');
          };
          window.addEventListener('message', receive);
          document.querySelector('.wdgd-tree-row[title="welcome.html"]')?.click();
        });
        document.querySelector('.wdgd-tree-row[title="index.html"]')?.click();
        await new Promise(resolve => setTimeout(resolve, 200));
        const explorerSplitter = document.querySelector('[data-desktop-splitter="explorer"]');
        const desktopShell = document.getElementById('wdgdShell');
        const workspaceRect = document.querySelector('.wdgd-workspace')?.getBoundingClientRect();
        const explorerWidthBeforeDrag = Number.parseFloat(getComputedStyle(desktopShell).getPropertyValue('--wdgd-explorer-size')) || 0;
        explorerSplitter?.dispatchEvent(new PointerEvent('pointerdown', {
          button: 0,
          clientX: workspaceRect.left + explorerWidthBeforeDrag,
          bubbles: true,
          cancelable: true
        }));
        const dragShield = document.querySelector('.wdgd-drag-shield');
        dragShield?.dispatchEvent(new PointerEvent('pointermove', {
          clientX: workspaceRect.left + explorerWidthBeforeDrag + 70,
          bubbles: true
        }));
        dragShield?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        const explorerWidthAfterDrag = Number.parseFloat(getComputedStyle(desktopShell).getPropertyValue('--wdgd-explorer-size')) || 0;
        const desktopExplorerResizes = explorerWidthAfterDrag >= explorerWidthBeforeDrag + 60;
        explorerSplitter?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        const desktopExplorerResets = Number.parseFloat(getComputedStyle(desktopShell).getPropertyValue('--wdgd-explorer-size')) === 230;
        const explorerToggle = document.querySelector('[data-desktop-explorer-toggle]');
        explorerToggle?.click();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const collapsedEditorRect = document.querySelector('.wdgd-editor-pane')?.getBoundingClientRect();
        const collapsedPreviewRect = document.querySelector('.wdgd-preview-pane')?.getBoundingClientRect();
        const collapsedMonacoRect = document.querySelector('[data-desktop-monaco] .monaco-editor')?.getBoundingClientRect();
        const collapsedEditorOverflow = getComputedStyle(document.querySelector('.wdgd-editor-pane')).overflow;
        const desktopExplorerCollapseKeepsLayout = desktopShell?.classList.contains('is-explorer-collapsed') === true &&
          collapsedEditorRect?.width >= 320 && collapsedPreviewRect?.width >= 280 &&
          collapsedEditorRect.right <= collapsedPreviewRect.left && collapsedMonacoRect?.right <= collapsedEditorRect.right + 1 &&
          collapsedEditorOverflow === 'hidden';
        explorerToggle?.click();
        const sidebarToggle = document.querySelector('[data-desktop-sidebar-toggle]');
        sidebarToggle?.click();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const collapsedContentRect = document.querySelector('.wdgd-content')?.getBoundingClientRect();
        const collapsedMainRect = document.querySelector('.wdgd-main')?.getBoundingClientRect();
        const desktopSidebarCollapseKeepsLayout = desktopShell?.classList.contains('is-sidebar-collapsed') === true &&
          collapsedContentRect?.width >= collapsedMainRect?.width - 1;
        sidebarToggle?.click();
        const previewToggle = document.querySelector('[data-desktop-preview-toggle]');
        previewToggle?.click();
        const desktopPreviewCollapses = document.getElementById('wdgdShell')?.classList.contains('is-preview-collapsed') === true;
        previewToggle?.click();
        const desktopPreviewRestores = document.getElementById('wdgdShell')?.classList.contains('is-preview-collapsed') === false;
        desktopEditor.value = '    const volume = 75;';
        desktopEditor.setSelectionRange(desktopEditor.value.length, desktopEditor.value.length);
        desktopEditor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        const desktopIndentWorks = desktopEditor.value.endsWith('\\n    ');
        desktopEditor.value = '<main class';
        desktopEditor.setSelectionRange(desktopEditor.value.length, desktopEditor.value.length);
        desktopEditor.dispatchEvent(new KeyboardEvent('keydown', { key: '=', bubbles: true, cancelable: true }));
        const desktopClassCompletionWorks = desktopEditor.value === '<main class=""';
        desktopEditor.value = 'section';
        desktopEditor.setSelectionRange(desktopEditor.value.length, desktopEditor.value.length);
        desktopEditor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        const desktopEmmetWorks = desktopEditor.value.includes('<section') && desktopEditor.value.includes('</section>');
        desktopEditor.value = '<main><img src="cover.png"></main>';
        desktopEditor.dispatchEvent(new Event('input', { bubbles: true }));
        const problemTexts = () => [...document.querySelectorAll('.wdgd-problem.error .wdgd-problem-copy strong')]
          .map(element => element.textContent || '');
        const errorLensTexts = () => [...document.querySelectorAll('.wdgd-error-lens.is-error')]
          .map(element => element.textContent || '');
        const desktopDiagnosticsVisible = await waitUntil(() =>
          problemTexts().some(text => /alt/i.test(text)),
          2500
        );
        const desktopErrorLensVisible = await waitUntil(() =>
          errorLensTexts().some(text => /alt/i.test(text)),
          2500
        );
        const desktopDiagnosticText = problemTexts().find(text => /alt/i.test(text)) || '';
        const desktopErrorLensText = errorLensTexts().find(text => /alt/i.test(text)) || '';
        const desktopEditorHeight = (document.querySelector('[data-desktop-monaco]') || desktopEditor).getBoundingClientRect().height;
        const desktopProblemsHeight = document.querySelector('[data-desktop-problems]')?.getBoundingClientRect().height || 0;
        await window.webdevgymDesktop.desktop.writeFile(
          recentProjects[0].path,
          'index.html',
          '<h1>External auto reload</h1>'
        );
        await new Promise(resolve => setTimeout(resolve, 450));
        const watcherAutoReload = desktopEditor.value === '<h1>External auto reload</h1>';
        desktopEditor.value = '<h1>Unsaved local version</h1>';
        desktopEditor.dispatchEvent(new Event('input', { bubbles: true }));
        await window.webdevgymDesktop.desktop.writeFile(
          recentProjects[0].path,
          'index.html',
          '<h1>External conflict version</h1>'
        );
        await new Promise(resolve => setTimeout(resolve, 350));
        const watcherConflictVisible = document.querySelector('[data-desktop-file-change]')?.hidden === false;
        const watcherProtectedLocal = desktopEditor.value === '<h1>Unsaved local version</h1>';
        document.querySelector('[data-external-reload]')?.click();
        await new Promise(resolve => setTimeout(resolve, 250));
        const watcherReloadedConflict = desktopEditor.value === '<h1>External conflict version</h1>' &&
          document.querySelector('[data-desktop-file-change]')?.hidden === true;
        const originalAiHandleFiles = window.aiHandleFiles;
        const capturedProjectContextFiles = [];
        window.aiHandleFiles = async files => {
          for (const file of files) {
            capturedProjectContextFiles.push({
              name: file.name,
              path: file.webdevgymPath,
              text: await file.text()
            });
          }
          return files.length;
        };
        desktopEditor.value = 'const unsavedAiContext = true;';
        const projectContextSnapshot = window.WebDevGymDesktopProjectContext?.snapshot();
        if (!projectContextSnapshot?.available) {
          throw new Error('Desktop project context unavailable: ' + JSON.stringify({
            snapshot: projectContextSnapshot,
            recentServiceCount: recentProjects.length,
            recentUiCount: document.querySelectorAll('.wdgd-recent').length,
            shellHidden: document.getElementById('wdgdShell')?.hidden,
            projectLabel: document.querySelector('[data-desktop-project-name]')?.textContent,
            fileLabel: document.querySelector('[data-desktop-file-name]')?.textContent,
            status: document.querySelector('[data-desktop-status]')?.textContent
          }));
        }
        const projectContextAttach = await window.WebDevGymDesktopProjectContext?.attach(['index.html', 'src/app.js']);
        window.aiHandleFiles = originalAiHandleFiles;
        const persistentContextAttach = await window.WebDevGymDesktopProjectContext?.attach(['src/app.js']);
        const persistentAttachmentInitialCount = window.WebDevGymAiAttachments?.snapshot().length || 0;
        const projectContextUiVisible = document.querySelector('[data-ai-project-context]')?.hidden === false;
        const projectContextUiName = document.getElementById('wdgrAiProjectName')?.textContent || '';
        const backupsBeforeAiEdit = await window.webdevgymDesktop.desktop.listBackups(recentProjects[0].path);
        const originalAppContent = capturedProjectContextFiles.find(file => file.path === 'src/app.js')?.text || '';
        const editedAppContent = originalAppContent
          .replace('Track two', 'Track three') + '\\nconst aiEditApplied = true;\\n';
        const fence = String.fromCharCode(96).repeat(3);
        aiAddMsg('bot', 'Обновил список треков и добавил флаг.\\n' + fence + 'webdevgym-edit\\n{"path":"src/app.js"}\\n' + editedAppContent + fence);
        const aiEditBadgeReady = await waitUntil(() => {
          const badge = [...document.querySelectorAll('[data-ai-edit-summary]')].at(-1);
          return badge && !badge.classList.contains('loading') && !badge.classList.contains('error');
        });
        const aiEditBadge = [...document.querySelectorAll('[data-ai-edit-summary]')].at(-1);
        const aiEditBadgeText = aiEditBadge?.textContent || '';
        const aiEditHoverText = aiEditBadge?.parentElement?.querySelector('.wdgr-ai-edit-hover')?.textContent || '';
        aiEditBadge?.click();
        await new Promise(resolve => setTimeout(resolve, 120));
        const aiEditReviewVisible = document.getElementById('wdgrAiEditReview')?.hidden === false;
        const aiEditGreenLines = document.querySelectorAll('.wdgr-ai-diff-line.add').length;
        const aiEditRedLines = document.querySelectorAll('.wdgr-ai-diff-line.remove').length;
        document.querySelector('[data-ai-edit-apply]')?.click();
        const aiEditApplied = await waitUntil(() => document.querySelector('[data-ai-edit-summary].applied'));
        const appliedAppFile = await window.webdevgymDesktop.desktop.readFile(recentProjects[0].path, 'src/app.js');
        const backupsAfterAiEdit = await window.webdevgymDesktop.desktop.listBackups(recentProjects[0].path);
        await window.WebDevGymAiAttachments?.refresh();
        const refreshedAttachment = window.WebDevGymAiAttachments?.snapshot().find(attachment => attachment.projectPath === 'src/app.js');
        await window.WebDevGymDesktopProjectContext?.attach(['src/app.js']);
        const persistentAttachmentDeduplicated = window.WebDevGymAiAttachments?.snapshot().length === persistentAttachmentInitialCount;
        document.querySelector('[data-desktop-tab="terminal"]')?.click();
        await new Promise(resolve => setTimeout(resolve, 80));
        const runnerVisible = document.querySelector('[data-desktop-view="terminal"]')?.hidden === false;
        const runnerManager = document.querySelector('[data-runner-manager]')?.textContent || '';
        const runnerScriptCount = document.querySelectorAll('[data-runner-script]').length;
        document.querySelector('[data-runner-script="dev"] [data-runner-action="run"]')?.click();
        await waitUntil(() => document.querySelector('[data-runner-status]')?.textContent === 'Завершён', 4000);
        const runnerStatus = document.querySelector('[data-runner-status]')?.textContent || '';
        const runnerUrl = document.querySelector('[data-runner-open-url]')?.textContent || '';
        const runnerStopDisabled = Boolean(document.querySelector('[data-desktop-stop]')?.disabled);
        document.querySelector('[data-desktop-tab="packages"]')?.click();
        const packagesLoaded = await waitUntil(() => document.querySelectorAll('.wdgd-package-row[data-package-name]').length === 2);
        const packagesViewVisible = document.querySelector('[data-desktop-view="packages"]')?.hidden === false;
        const packagesManager = document.querySelector('[data-packages-manager]')?.textContent || '';
        const packageRuntimeVersion = document.querySelector('.wdgd-package-row[data-package-name="smoke-runtime"] .wdgd-package-versions strong')?.textContent || '';
        const packageMissingVisible = document.querySelector('.wdgd-package-row[data-package-name="smoke-dev"]')?.classList.contains('missing') === true;
        const packageInstallEnabled = document.querySelector('[data-package-install]')?.disabled === false;
        const packageSearchInput = document.querySelector('[data-package-search]');
        packageSearchInput.value = 'runtime';
        packageSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        const packageSearchWorks = document.querySelectorAll('.wdgd-package-row[data-package-name]').length === 1 &&
          document.querySelector('.wdgd-package-row[data-package-name="smoke-runtime"]');
        packageSearchInput.value = '';
        packageSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('[data-desktop-tab="git"]')?.click();
        await waitUntil(() => [...document.querySelectorAll('.wdgd-git-file')]
          .some(row => row.textContent.includes('git-smoke.txt')));
        await new Promise(resolve => setTimeout(resolve, 500));
        let gitSmokeRow = [...document.querySelectorAll('.wdgd-git-file')]
          .find(row => row.textContent.includes('git-smoke.txt'));
        const gitViewVisible = document.querySelector('[data-desktop-view="git"]')?.hidden === false;
        const gitChangedFileVisible = Boolean(gitSmokeRow);
        const gitSelectButton = gitSmokeRow?.querySelector('.wdgd-git-file-main');
        const gitSelectExists = Boolean(gitSelectButton);
        gitSelectButton?.click();
        const gitSelectedImmediately = document.querySelector('[data-git-diff-title]')?.textContent || '';
        const gitDiffVisible = await waitUntil(() => {
          const loaded = document.querySelector('[data-git-diff]')?.textContent.includes('Git smoke changed');
          if (!loaded) gitSmokeRow?.querySelector('.wdgd-git-file-main')?.click();
          return loaded;
        }, 6000);
        const gitDiffText = document.querySelector('[data-git-diff]')?.textContent || '';
        const gitStatusText = document.querySelector('[data-desktop-status]')?.textContent || '';
        gitSmokeRow?.querySelector('button[title="Добавить файл в коммит"]')?.click();
        const gitStageWorks = await waitUntil(() => {
          gitSmokeRow = [...document.querySelectorAll('.wdgd-git-file')]
            .find(row => row.textContent.includes('git-smoke.txt'));
          return gitSmokeRow?.textContent.includes('Подготовлен');
        });
        gitSmokeRow?.querySelector('button[title="Убрать файл из коммита"]')?.click();
        const gitUnstageWorks = await waitUntil(() => {
          gitSmokeRow = [...document.querySelectorAll('.wdgd-git-file')]
            .find(row => row.textContent.includes('git-smoke.txt'));
          return gitSmokeRow?.textContent.includes('Не подготовлен');
        });
        const gitWorkspaceRect = document.querySelector('.wdgd-git-workspace')?.getBoundingClientRect();
        document.querySelector('[data-desktop-tab="docs"]')?.click();
        const docsViewVisible = document.querySelector('[data-desktop-view="docs"]')?.hidden === false;
        const docsInitialCount = document.querySelectorAll('[data-docs-id]').length;
        const docsInput = document.querySelector('[data-docs-search]');
        docsInput.value = 'addEventListener';
        docsInput.dispatchEvent(new Event('input', { bubbles: true }));
        const docsSearchFound = await waitUntil(() =>
          document.querySelector('[data-docs-id="dom-events"]')?.textContent.includes('События'));
        const docsArticleText = document.querySelector('[data-docs-article]')?.textContent || '';
        const docsCodeText = document.querySelector('[data-docs-code="dom-events"]')?.textContent || '';
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        }));
        const docsShortcutWorks = document.activeElement === docsInput;
        const docsResourceLocal = [...document.scripts].some(script =>
          script.src.startsWith('webdevgym://app/') && script.src.includes('webdevgym-offline-docs-data.js'));
        const docsWorkspaceHeight = document.querySelector('.wdgd-docs-workspace')?.getBoundingClientRect().height || 0;
        const desktopWorkspace = document.querySelector('[data-desktop-workspace]');
        const desktopContent = document.querySelector('.wdgd-content');
        const desktopShellElement = document.getElementById('wdgdShell');
        const desktopWindowElement = desktopShellElement?.querySelector('.wdgd-window');
        const desktopCenterOpen = document.getElementById('wdgdShell')?.hidden === false;
        const backgroundScrollLocked = document.body.classList.contains('wdgd-open');
        const desktopWorkspaceRect = desktopWorkspace?.getBoundingClientRect();
        const desktopContentRect = desktopContent?.getBoundingClientRect();
        const desktopShellRect = desktopShellElement?.getBoundingClientRect();
        const desktopWindowRect = desktopWindowElement?.getBoundingClientRect();
        const desktopCenterFillsAvailableArea = Boolean(desktopShellRect && desktopWindowRect) &&
          Math.abs(desktopShellRect.left) <= 1 && Math.abs(desktopShellRect.right - innerWidth) <= 1 &&
          Math.abs(desktopShellRect.bottom - innerHeight) <= 1 &&
          Math.abs(desktopWindowRect.left - desktopShellRect.left) <= 1 &&
          Math.abs(desktopWindowRect.top - desktopShellRect.top) <= 1 &&
          Math.abs(desktopWindowRect.right - desktopShellRect.right) <= 1 &&
          Math.abs(desktopWindowRect.bottom - desktopShellRect.bottom) <= 1;
        const desktopFileTypeIconsVisible = Boolean(
          document.querySelector('[data-desktop-open-file="index.html"] .wdgd-file-kind.kind-html') &&
          document.querySelector('[data-desktop-open-file="src/app.js"] .wdgd-file-kind.kind-js')
        );
        const desktopApplicationSettingsVisible = Boolean(
          document.querySelector('[data-settings-category="application"]') &&
          document.querySelector('[data-settings-page="application"] #wdgrDesktopUpdate') &&
          document.querySelector('[data-settings-page="application"] #wdgrDesktopNotify') &&
          document.querySelector('[data-settings-page="application"] #wdgrDesktopTray') &&
          document.querySelector('[data-settings-page="application"] #wdgrDesktopQuit')
        );
        const desktopApplicationTabRemoved = !document.querySelector('[data-desktop-tab="app"]') &&
          !document.querySelector('[data-desktop-view="app"]');
        const desktopWorkspaceLayout = desktopWorkspace ? {
          display: getComputedStyle(desktopWorkspace).display,
          top: desktopWorkspaceRect.top,
          width: desktopWorkspaceRect.width,
          height: desktopWorkspaceRect.height
        } : null;
        const desktopContentLayout = desktopContent ? {
          display: getComputedStyle(desktopContent).display,
          width: desktopContentRect.width,
          height: desktopContentRect.height
        } : null;
        document.querySelector('[data-desktop-close]')?.click();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const desktopCenterClosed = desktopShellElement?.hidden === true;
        const desktopCloseRestoresFocus = document.activeElement === desktopLauncher;
        const aiMessageCount = document.querySelectorAll('#aiMsgs .ai-msg').length;
        aiAddMsg('bot', '##Уровень\\n- первый пункт\\n- второй пункт');
        const markdownMessage = [...document.querySelectorAll('#aiMsgs .ai-msg')].at(-1);
        const markdownHeadingRendered = markdownMessage?.querySelector('h4')?.textContent === 'Уровень';
        const markdownListRendered = markdownMessage?.querySelectorAll('ul li').length === 2;
        const markdownArtifactsHidden = !markdownMessage?.textContent.includes('##');
        markdownMessage?.remove();
        const aiChatWindow = document.getElementById('aiChatWin');
        if (!aiChatWindow?.classList.contains('open')) window.toggleAiChat?.();
        const aiMinimizeButton = document.getElementById('wdgrAiMinimize');
        aiMinimizeButton?.click();
        const aiMinimized = Boolean(aiChatWindow?.classList.contains('wdgr-ai-minimized'));
        const aiMinimizedDoesNotBlockPage = getComputedStyle(aiChatWindow).pointerEvents === 'none' &&
          getComputedStyle(aiChatWindow?.querySelector('.wdgr-ai-topbar')).pointerEvents === 'auto';
        aiMinimizeButton?.click();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const aiRestoredInteractive = !aiChatWindow?.classList.contains('wdgr-ai-minimized') &&
          document.activeElement === document.getElementById('aiInp');
        const imageBase64ResponseSupported = aiGeneratedImageSource({ data: [{ b64_json: 'AAAA' }] }) === 'data:image/png;base64,AAAA';
        const imageUrlResponseSupported = aiGeneratedImageSource({ data: [{ url: 'https://example.com/image.png' }] }) === 'https://example.com/image.png';
        aiAddMsg('user', 'Attachment smoke test', [{
          name: 'preview.png',
          type: 'image/png',
          size: 68,
          isImage: true,
          thumbnail: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
        }]);
        const aiAttachmentPreview = Boolean(document.querySelector('#aiMsgs .ai-msg-attachment img'));
        [...document.querySelectorAll('#aiMsgs .ai-msg')].slice(aiMessageCount).forEach(message => message.remove());
        const aiSoundToggle = document.getElementById('wdgcAiSoundToggle');
        const aiSoundToggleInitiallyOn = Boolean(aiSoundToggle?.classList.contains('on'));
        aiSoundToggle?.click();
        const aiSoundToggleTurnsOff = Boolean(aiSoundToggle && !aiSoundToggle.classList.contains('on'));
        aiSoundToggle?.click();
        const aiSoundToggleTurnsOn = Boolean(aiSoundToggle?.classList.contains('on'));
        const electronTitlebar = document.getElementById('wdgeTitlebar');
        const electronTitlebarRect = electronTitlebar?.getBoundingClientRect();
        const electronTitlebarControls = electronTitlebar?.querySelectorAll('[data-wdge-window]').length || 0;
        const electronTitlebarReady = document.body.classList.contains('wdge-titlebar-ready');
        const electronVersionLabel = electronTitlebar?.querySelector('[data-wdge-version]')?.textContent || '';
        const maximizeButton = electronTitlebar?.querySelector('[data-wdge-window="maximize"]');
        const originalWindowState = await window.webdevgymDesktop.desktop.windowState();
        maximizeButton?.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        const maximizedWindowState = await window.webdevgymDesktop.desktop.windowState();
        const maximizeIconChanged = Boolean(maximizeButton?.classList.contains('is-maximized'));
        maximizeButton?.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        const restoredWindowState = await window.webdevgymDesktop.desktop.windowState();
        const electronMaximizeControlWorks = maximizedWindowState.maximized !== originalWindowState.maximized &&
          restoredWindowState.maximized === originalWindowState.maximized && maximizeIconChanged;
        const syncInfo = await window.webdevgymDesktop.desktop.syncInfo();
        localStorage.setItem('wdg_smoke_sync_value', 'desktop-to-web');
        await window.WebDevGymDeviceSync?.sync();
        const syncSnapshot = await window.webdevgymDesktop.desktop.syncExchange(
          localStorage.getItem('wdg_device_sync_client_v1'),
          []
        );
        const syncRoundTrip = syncSnapshot.entries.some(entry =>
          entry.key === 'wdg_smoke_sync_value' && entry.value === 'desktop-to-web'
        );
        const deviceSyncButton = document.getElementById('wdgDeviceSyncButton');
        deviceSyncButton?.click();
        await new Promise(resolve => setTimeout(resolve, 120));
        const deviceSyncModal = document.getElementById('wdgDeviceSyncModal');
        const cloudSyncModal = document.getElementById('wdgCloudSyncModal');
        const deviceSyncIconRect = deviceSyncButton?.querySelector('.wdg-device-sync-icon')?.getBoundingClientRect();
        const deviceSyncIconVisible = Boolean(deviceSyncIconRect?.width && deviceSyncIconRect?.height);
        const deviceSyncModalVisible = Boolean(deviceSyncModal?.classList.contains('open'));
        const deviceSyncCodeVisible = Boolean(deviceSyncModal?.textContent.includes(syncInfo.code));
        const cloudSyncModalVisible = Boolean(cloudSyncModal?.classList.contains('open'));
        const cloudAuthFormVisible = Boolean(cloudSyncModal?.querySelector('[data-cloud-auth-form]'));
        const cloudBackupControlsVisible = Boolean(cloudSyncModal?.querySelector('[data-cloud-backup-create]'));
        desktopLauncher?.click();
        await new Promise(resolve => requestAnimationFrame(resolve));
        document.querySelector('[data-desktop-tab="terminal"]')?.click();
        return {
          title: document.title,
          language: document.documentElement.lang,
          desktop: window.webdevgymDesktop,
          stylesheets: document.styleSheets.length,
          routesFound: Boolean(routes),
          overviewFound: Boolean(overview),
          pathOpen: pathOpenAfterRoutes,
          pathPageCount: pathPageCountAfterRoutes,
          cachedAfterOverview,
          firstRouteMs,
          repeatedRouteMs,
          playgroundEditor: Boolean(playgroundEditor),
          playgroundIndentWorks,
          playgroundClassCompletionWorks,
          playgroundCreateDialogOpens,
          playgroundCreatedFile: Boolean(playgroundCreatedFile),
          playgroundCreatedFileContent,
          playgroundCreatedFolder: Boolean(playgroundCreatedFolder),
          desktopCenter: Boolean(document.getElementById('wdgdShell')),
          monacoApi: Boolean(window.WebDevGymMonaco),
          monacoRuntime: Boolean(window.monaco?.editor),
          monacoMounted,
          monacoRuntimeError,
          desktopCenterOpen,
          desktopCenterFillsAvailableArea,
          desktopCenterClosed,
          desktopCloseRestoresFocus,
          desktopFileTypeIconsVisible,
          desktopApplicationSettingsVisible,
          desktopApplicationTabRemoved,
          desktopViews: document.querySelectorAll('[data-desktop-view]').length,
          searchViewOpenedByShortcut,
          projectSearchFound,
          projectSearchCaseSensitive,
          searchOpenedFile,
          searchSelectedText,
          explorerLaunchOpened,
          explorerLaunchProject,
          explorerLaunchFile,
          explorerLaunchContent,
          desktopLauncher: Boolean(desktopLauncher),
          desktopLauncherVisible,
          desktopLauncherLayout: desktopLauncher ? {
            className: desktopLauncher.className,
            display: getComputedStyle(desktopLauncher).display,
            visibility: getComputedStyle(desktopLauncher).visibility,
            opacity: getComputedStyle(desktopLauncher).opacity,
            parentClass: desktopLauncher.parentElement?.className || desktopLauncher.parentElement?.tagName,
            rect: launcherRect ? {
              left: launcherRect.left,
              top: launcherRect.top,
              right: launcherRect.right,
              bottom: launcherRect.bottom,
              width: launcherRect.width,
              height: launcherRect.height
            } : null
          } : null,
          nestedFileInitiallyHidden,
          nestedFileAfterExpand,
          nestedFileAfterCollapse,
          desktopBridge: Boolean(window.webdevgymDesktop?.desktop?.chooseProject),
          desktopProjectLoaded: document.querySelector('[data-desktop-workspace]')?.hidden === false,
          desktopPreviewResult,
          desktopEditorLoaded: !desktopEditor.disabled,
          desktopOpenTabs,
          desktopHtmlBoilerplateWorks,
          desktopMonacoEmmetSuggestion,
          desktopMonacoEmmetWorks,
          desktopAutoCloseTagWorks,
          desktopAutoCloseTagValue,
          desktopAutoRenameTagWorks,
          desktopColorHighlightWorks,
          desktopTypingBurstMs,
          desktopTypingCharacters,
          desktopAutocompleteVisible,
          desktopAutocompleteApplied,
          desktopNamedHtmlPreview,
          desktopExplorerResizes,
          desktopExplorerResets,
          desktopExplorerCollapseKeepsLayout,
          desktopSidebarCollapseKeepsLayout,
          desktopPreviewCollapses,
          desktopPreviewRestores,
          desktopIndentWorks,
          desktopClassCompletionWorks,
          desktopEmmetWorks,
          desktopDiagnosticsVisible,
          desktopDiagnosticText,
          desktopErrorLensVisible,
          desktopErrorLensText,
          desktopEditorHeight,
          desktopProblemsHeight,
          watcherAutoReload,
          watcherConflictVisible,
          watcherProtectedLocal,
          watcherReloadedConflict,
          projectContextAvailable: projectContextSnapshot?.available === true,
          projectContextProjectName: projectContextSnapshot?.projectName || '',
          projectContextCurrentFile: projectContextSnapshot?.currentFile || '',
          projectContextFileCount: projectContextSnapshot?.files?.length || 0,
          projectContextAttach,
          persistentContextAttach,
          persistentAttachmentInitialCount,
          capturedProjectContextFiles,
          projectContextUiVisible,
          projectContextUiName,
          aiEditBadgeReady,
          aiEditBadgeText,
          aiEditHoverText,
          aiEditReviewVisible,
          aiEditGreenLines,
          aiEditRedLines,
          aiEditApplied,
          aiEditFileWritten: appliedAppFile.content.includes('Track three') && appliedAppFile.content.includes('aiEditApplied'),
          aiEditBackupCreated: backupsAfterAiEdit.length > backupsBeforeAiEdit.length,
          persistentAttachmentRefreshed: Boolean(refreshedAttachment?.text.includes('aiEditApplied = true')),
          persistentAttachmentDeduplicated,
          runnerVisible,
          runnerManager,
          runnerScriptCount,
          runnerStatus,
          runnerUrl,
          runnerStopDisabled,
          packagesLoaded,
          packagesViewVisible,
          packagesManager,
          packageRuntimeVersion,
          packageMissingVisible,
          packageInstallEnabled,
          packageSearchWorks: Boolean(packageSearchWorks),
          gitViewVisible,
          gitChangedFileVisible,
          gitSelectExists,
          gitSelectedImmediately,
          gitDiffVisible,
          gitDiffText,
          gitStatusText,
          gitStageWorks,
          gitUnstageWorks,
          gitWorkspaceHeight: gitWorkspaceRect?.height || 0,
          docsViewVisible,
          docsInitialCount,
          docsSearchFound,
          docsArticleText,
          docsCodeText,
          docsShortcutWorks,
          docsResourceLocal,
          docsWorkspaceHeight,
          backgroundScrollLocked,
          desktopWorkspaceLayout,
          desktopContentLayout,
          appInfo,
          recentProjectsIsArray: Array.isArray(recentProjects),
          tokenBridge: Boolean(window.webdevgymDesktop?.githubToken?.load),
          tokenRoundTrip,
          aiReplySoundApi: typeof window.WebDevGymAiNotifications?.complete === 'function',
          aiReplySoundSettings: Boolean(document.getElementById('wdgcAiSoundPanel')),
          aiSoundToggleInitiallyOn,
          aiSoundToggleTurnsOff,
          aiSoundToggleTurnsOn,
          electronTitlebar: Boolean(electronTitlebar),
          electronTitlebarReady,
          electronTitlebarControls,
          electronVersionLabel,
          electronMaximizeControlWorks,
          deviceSyncButton: Boolean(document.getElementById('wdgDeviceSyncButton')),
          deviceSyncIconVisible,
          deviceSyncModalVisible,
          deviceSyncCodeVisible,
          cloudSyncModalVisible,
          cloudAuthFormVisible,
          cloudBackupControlsVisible,
          deviceSyncInfo: syncInfo,
          deviceSyncRoundTrip: syncRoundTrip,
          electronTitlebarRect: electronTitlebarRect ? {
            top: electronTitlebarRect.top,
            left: electronTitlebarRect.left,
            width: electronTitlebarRect.width,
            height: electronTitlebarRect.height
          } : null,
          aiAttachmentPreview,
          markdownHeadingRendered,
          markdownListRendered,
          markdownArtifactsHidden,
          aiMinimized,
          aiMinimizedDoesNotBlockPage,
          aiRestoredInteractive,
          imageBase64ResponseSupported,
          imageUrlResponseSupported
        };
      })()`
    });

    if (evaluation.exceptionDetails) {
      const details = evaluation.exceptionDetails;
      throw new Error(details.exception?.description || details.text || 'Renderer smoke evaluation failed');
    }
    const screenshotDirectory = packagedBinary ? path.dirname(packagedBinary) : path.join(projectRoot, 'output');
    fs.mkdirSync(screenshotDirectory, { recursive: true });
    const result = evaluation.result.value;
    if (result.deviceSyncModalVisible || result.cloudSyncModalVisible) {
      const syncScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(screenshotDirectory, 'smoke-device-sync.png'), syncScreenshot.data, 'base64');
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('#wdgCloudSyncModal [data-cloud-close], #wdgDeviceSyncModal [data-sync-close]')?.click()`
      });
    }
    await cdp.send('Page.enable');
    await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('[data-desktop-tab="packages"]')?.click()`
    });
    await delay(180);
    const packagesScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-dependencies.png'), packagesScreenshot.data, 'base64');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelector('[data-desktop-tab="docs"]')?.click();
        const input = document.querySelector('[data-docs-search]');
        if (input) {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()`
    });
    await delay(180);
    const docsScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-offline-docs.png'), docsScreenshot.data, 'base64');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        if (document.getElementById('wdgdShell')?.hidden === false) document.querySelector('[data-desktop-close]')?.click();
        document.querySelector('.wdgn-priority-picker')?.remove();
        const chat = document.getElementById('aiChatWin');
        chat?.classList.add('open');
        chat?.classList.add('wdgr-context-open');
        document.getElementById('wdgrAiProjectSearch')?.focus();
      })()`
    });
    await delay(180);
    const projectContextScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-ai-project-context.png'), projectContextScreenshot.data, 'base64');
    const editSummaryEvaluation = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const newline = String.fromCharCode(10);
        const fence = String.fromCharCode(96).repeat(3);
        const content = 'const unsavedAiContext = false;' + newline + 'const diffPreview = true;' + newline;
        aiAddMsg('bot', 'Подготовил тестовую правку.' + newline + fence + 'webdevgym-edit' + newline + '{"path":"index.html"}' + newline + content + fence);
        for (let attempt = 0; attempt < 30; attempt += 1) {
          const badge = [...document.querySelectorAll('[data-ai-edit-summary]')].at(-1);
          if (badge && !badge.classList.contains('loading') && !badge.disabled) {
            const rect = badge.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          }
          await new Promise(resolve => setTimeout(resolve, 80));
        }
        return null;
      })()`
    });
    const editSummaryPoint = editSummaryEvaluation.result.value;
    if (editSummaryEvaluation.exceptionDetails || !editSummaryPoint) {
      throw new Error(editSummaryEvaluation.exceptionDetails?.exception?.description || 'AI edit summary did not render');
    }
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: editSummaryPoint.x,
      y: editSummaryPoint.y
    });
    await delay(180);
    const editHoverScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-ai-edit-hover.png'), editHoverScreenshot.data, 'base64');
    const editReviewEvaluation = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const badge = [...document.querySelectorAll('[data-ai-edit-summary]')].at(-1);
        if (!badge || badge.disabled) return false;
        badge.click();
        return true;
      })()`
    });
    if (editReviewEvaluation.exceptionDetails || editReviewEvaluation.result.value !== true) {
      throw new Error(editReviewEvaluation.exceptionDetails?.exception?.description || 'AI edit review did not open');
    }
    await delay(120);
    const editReviewScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-ai-edit-review.png'), editReviewScreenshot.data, 'base64');
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelector('[data-ai-edit-close]')?.click();
        const chat = document.getElementById('aiChatWin');
        if (chat?.classList.contains('open')) window.toggleAiChat?.();
      })()`
    });
    let secondInstanceResult = null;
    {
      const secondInstanceArguments = packagedBinary ? [
        `--user-data-dir=${profileDirectory}`,
        '--smoke',
        '--open-path',
        secondWorkspaceDirectory
      ] : [
        projectRoot,
        `--user-data-dir=${profileDirectory}`,
        '--smoke',
        '--open-path',
        secondWorkspaceDirectory
      ];
      const secondInstanceOutput = [];
      secondInstanceChild = spawn(electronPath, secondInstanceArguments, {
        cwd: projectRoot,
        env: {
          ...process.env,
          WEBDEVGYM_TEST_USER_DATA: profileDirectory
        },
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      secondInstanceChild.stdout.on('data', chunk => secondInstanceOutput.push(chunk.toString()));
      secondInstanceChild.stderr.on('data', chunk => secondInstanceOutput.push(chunk.toString()));
      secondInstanceChild.once('error', error => secondInstanceOutput.push(error.stack || error.message));
      await delay(900);
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const secondInstanceEvaluation = await cdp.send('Runtime.evaluate', {
          returnByValue: true,
          expression: `({
            open: document.getElementById('wdgdShell')?.hidden === false,
            project: document.querySelector('[data-desktop-project-name]')?.textContent || '',
            file: document.querySelector('[data-desktop-file-name]')?.textContent || '',
            content: document.querySelector('[data-desktop-editor]')?.value || ''
          })`
        });
        secondInstanceResult = secondInstanceEvaluation.result.value;
        if (
          secondInstanceResult?.project === 'second-desktop-project' &&
          secondInstanceResult?.file === 'index.html' &&
          secondInstanceResult?.content.includes('Second instance folder')
        ) break;
        await delay(120);
      }
      assert.equal(secondInstanceResult.open, true, secondInstanceOutput.join(''));
    }
    if (process.env.WEBDEVGYM_SMOKE_SCREENSHOT) {
      await cdp.send('Page.enable');
      const capture = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      const screenshotPath = path.resolve(process.env.WEBDEVGYM_SMOKE_SCREENSHOT);
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      fs.writeFileSync(screenshotPath, Buffer.from(capture.data, 'base64'));
    }
    assert.equal(result.title, 'WebDevGym');
    assert.equal(result.language, 'ru');
    assert.equal(result.desktop?.isDesktop, true);
    assert.equal(result.tokenBridge, true);
    assert.equal(result.tokenRoundTrip, true);
    assert.equal(result.aiReplySoundApi, true);
    assert.equal(result.aiReplySoundSettings, true);
    assert.equal(result.aiSoundToggleInitiallyOn, true);
    assert.equal(result.aiSoundToggleTurnsOff, true);
    assert.equal(result.aiSoundToggleTurnsOn, true);
    assert.equal(result.electronTitlebar, true);
    assert.equal(result.electronTitlebarReady, true);
    assert.equal(result.electronTitlebarControls, 3);
    assert.equal(result.electronVersionLabel, `v${result.appInfo.version}`);
    assert.equal(result.electronMaximizeControlWorks, true);
    assert.equal(result.deviceSyncButton, true);
    assert.equal(result.deviceSyncIconVisible, true);
    if (result.cloudSyncModalVisible) {
      assert.equal(result.cloudAuthFormVisible || result.cloudBackupControlsVisible, true);
    } else {
      assert.equal(result.deviceSyncModalVisible, true);
      assert.equal(result.deviceSyncCodeVisible, true);
      assert.equal(result.deviceSyncInfo.available, true);
      assert.match(result.deviceSyncInfo.code, /^\d{6}$/);
    }
    assert.equal(result.deviceSyncRoundTrip, true);
    assert.equal(result.electronTitlebarRect.top, 0);
    assert.equal(result.electronTitlebarRect.height, 40);
    assert.equal(result.aiAttachmentPreview, true);
    assert.equal(result.desktopCenter, true);
    assert.equal(result.monacoApi, true);
    assert.equal(result.monacoRuntime, true, result.monacoRuntimeError);
    assert.equal(result.monacoMounted, true, result.monacoRuntimeError);
    assert.equal(result.desktopCenterOpen, true);
    assert.equal(result.desktopCenterFillsAvailableArea, true);
    assert.equal(result.desktopCenterClosed, true);
    assert.equal(result.desktopCloseRestoresFocus, true);
    assert.equal(result.desktopFileTypeIconsVisible, true);
    assert.equal(result.desktopViews, 7);
    assert.equal(result.desktopApplicationSettingsVisible, true);
    assert.equal(result.desktopApplicationTabRemoved, true);
    assert.equal(result.searchViewOpenedByShortcut, true);
    assert.equal(result.projectSearchFound, true);
    assert.equal(result.projectSearchCaseSensitive, true);
    assert.equal(result.searchOpenedFile, true);
    assert.equal(result.searchSelectedText, 'Track two');
    assert.equal(result.explorerLaunchOpened, true);
    assert.equal(result.explorerLaunchProject, 'desktop-smoke');
    assert.equal(result.explorerLaunchFile, 'src/app.js');
    assert.match(result.explorerLaunchContent, /Track two/);
    assert.equal(secondInstanceResult.project, 'second-desktop-project');
    assert.equal(secondInstanceResult.file, 'index.html');
    assert.match(secondInstanceResult.content, /Second instance folder/);
    assert.equal(result.desktopLauncher, true);
    assert.equal(result.desktopLauncherVisible, true, `Desktop launcher is not visible: ${JSON.stringify(result.desktopLauncherLayout)}`);
    assert.equal(result.nestedFileInitiallyHidden, true);
    assert.equal(result.nestedFileAfterExpand, true);
    assert.equal(result.nestedFileAfterCollapse, false);
    assert.equal(result.desktopBridge, true);
    assert.equal(result.desktopProjectLoaded, true);
    assert.equal(result.desktopPreviewResult?.storageReady, true);
    assert.equal(result.desktopPreviewResult?.coverReady, true);
    assert.equal(result.desktopPreviewResult?.itemCount, 2);
    assert.equal(result.desktopEditorLoaded, true);
    assert.ok(result.desktopOpenTabs.includes('src/app.js'));
    assert.ok(result.desktopOpenTabs.includes('index.html'));
    assert.equal(result.desktopHtmlBoilerplateWorks, true);
    assert.equal(result.desktopMonacoEmmetSuggestion, true);
    assert.equal(result.desktopMonacoEmmetWorks, true);
    assert.equal(result.desktopAutoCloseTagWorks, true, `Auto Close Tag result: ${result.desktopAutoCloseTagValue}`);
    assert.equal(result.desktopAutoRenameTagWorks, true);
    assert.equal(result.desktopColorHighlightWorks, true);
    assert.equal(result.desktopTypingCharacters, 120);
    assert.ok(result.desktopTypingBurstMs < 500, `Monaco typing burst is too slow: ${result.desktopTypingBurstMs.toFixed(1)}ms`);
    assert.equal(result.desktopAutocompleteVisible, true);
    assert.equal(result.desktopAutocompleteApplied, true);
    assert.equal(result.desktopNamedHtmlPreview, 'Welcome from a non-index file');
    assert.equal(result.desktopExplorerResizes, true);
    assert.equal(result.desktopExplorerResets, true);
    assert.equal(result.desktopExplorerCollapseKeepsLayout, true);
    assert.equal(result.desktopSidebarCollapseKeepsLayout, true);
    assert.equal(result.desktopPreviewCollapses, true);
    assert.equal(result.desktopPreviewRestores, true);
    assert.equal(result.desktopIndentWorks, true);
    assert.equal(result.desktopClassCompletionWorks, true);
    assert.equal(result.desktopEmmetWorks, true);
    assert.equal(result.desktopDiagnosticsVisible, true);
    assert.match(result.desktopDiagnosticText, /alt/i);
    assert.equal(result.desktopErrorLensVisible, true);
    assert.match(result.desktopErrorLensText, /alt/i);
    assert.ok(result.desktopEditorHeight > 300, `Editor is too short: ${result.desktopEditorHeight}px`);
    assert.ok(result.desktopProblemsHeight <= 180, `Problems panel is too tall: ${result.desktopProblemsHeight}px`);
    assert.equal(result.watcherAutoReload, true);
    assert.equal(result.watcherConflictVisible, true);
    assert.equal(result.watcherProtectedLocal, true);
    assert.equal(result.watcherReloadedConflict, true);
    assert.equal(result.projectContextAvailable, true);
    assert.equal(result.projectContextProjectName, 'desktop-smoke');
    assert.equal(result.projectContextCurrentFile, 'index.html');
    assert.ok(result.projectContextFileCount >= 2);
    assert.deepEqual(result.projectContextAttach?.attached, ['index.html', 'src/app.js']);
    assert.equal(result.projectContextAttach?.skipped?.length, 0);
    assert.deepEqual(result.persistentContextAttach?.attached, ['src/app.js']);
    assert.equal(result.persistentAttachmentInitialCount, 1);
    assert.equal(result.capturedProjectContextFiles[0]?.path, 'index.html');
    assert.equal(result.capturedProjectContextFiles[0]?.text, 'const unsavedAiContext = true;');
    assert.equal(result.capturedProjectContextFiles[1]?.path, 'src/app.js');
    assert.match(result.capturedProjectContextFiles[1]?.text || '', /Track two/);
    assert.equal(result.projectContextUiVisible, true);
    assert.equal(result.projectContextUiName, 'desktop-smoke');
    assert.equal(result.aiEditBadgeReady, true);
    assert.match(result.aiEditBadgeText, /\+\d+/);
    assert.match(result.aiEditBadgeText, /−\d+/);
    assert.match(result.aiEditHoverText, /src\/app\.js/);
    assert.match(result.aiEditHoverText, /\+\d+/);
    assert.equal(result.aiEditReviewVisible, true);
    assert.ok(result.aiEditGreenLines > 0);
    assert.ok(result.aiEditRedLines > 0);
    assert.equal(result.aiEditApplied, true);
    assert.equal(result.aiEditFileWritten, true);
    assert.equal(result.aiEditBackupCreated, true);
    assert.equal(result.persistentAttachmentRefreshed, true);
    assert.equal(result.persistentAttachmentDeduplicated, true);
    assert.equal(result.runnerVisible, true);
    assert.equal(result.runnerManager, 'npm');
    assert.equal(result.runnerScriptCount, 1);
    assert.equal(result.runnerStatus, 'Завершён');
    assert.equal(result.runnerUrl, 'http://localhost:4173/');
    assert.equal(result.runnerStopDisabled, true);
    assert.equal(result.packagesLoaded, true);
    assert.equal(result.packagesViewVisible, true);
    assert.equal(result.packagesManager, 'npm');
    assert.equal(result.packageRuntimeVersion, '1.0.2');
    assert.equal(result.packageMissingVisible, true);
    assert.equal(result.packageInstallEnabled, true);
    assert.equal(result.packageSearchWorks, true);
    assert.equal(result.gitViewVisible, true);
    assert.equal(result.gitChangedFileVisible, true);
    assert.equal(result.gitDiffVisible, true, `Git diff did not load: ${JSON.stringify({
      select: result.gitSelectExists,
      title: result.gitSelectedImmediately,
      diff: result.gitDiffText,
      status: result.gitStatusText
    })}`);
    assert.equal(result.gitStageWorks, true);
    assert.equal(result.gitUnstageWorks, true);
    assert.ok(result.gitWorkspaceHeight > 300, `Git workspace is too short: ${result.gitWorkspaceHeight}px`);
    assert.equal(result.docsViewVisible, true);
    assert.ok(result.docsInitialCount >= 18, `Expected at least 18 offline topics, got ${result.docsInitialCount}`);
    assert.equal(result.docsSearchFound, true);
    assert.match(result.docsArticleText, /callback/i);
    assert.match(result.docsCodeText, /addEventListener/);
    assert.equal(result.docsShortcutWorks, true);
    assert.equal(result.docsResourceLocal, true);
    assert.ok(result.docsWorkspaceHeight > 300, `Docs workspace is too short: ${result.docsWorkspaceHeight}px`);
    assert.equal(result.playgroundEditor, true);
    assert.equal(result.playgroundIndentWorks, true);
    assert.equal(result.playgroundClassCompletionWorks, true);
    assert.equal(result.playgroundCreateDialogOpens, true);
    assert.equal(result.playgroundCreatedFile, true);
    assert.equal(result.playgroundCreatedFileContent, '"use strict";\n\n');
    assert.equal(result.playgroundCreatedFolder, true);
    assert.equal(result.backgroundScrollLocked, true);
    assert.equal(result.appInfo.platform, process.platform);
    assert.equal(result.recentProjectsIsArray, true);
    assert.equal(result.routesFound, true);
    assert.equal(result.overviewFound, true);
    assert.equal(result.pathOpen, true);
    assert.equal(result.pathPageCount, 1);
    assert.equal(result.cachedAfterOverview, 1);
    assert.ok(result.stylesheets >= 10, 'Expected WebDevGym stylesheets to load');
    assert.equal(result.markdownHeadingRendered, true);
    assert.equal(result.markdownListRendered, true);
    assert.equal(result.markdownArtifactsHidden, true);
    assert.equal(result.aiMinimized, true);
    assert.equal(result.aiMinimizedDoesNotBlockPage, true);
    assert.equal(result.aiRestoredInteractive, true);
    assert.equal(result.imageBase64ResponseSupported, true);
    assert.equal(result.imageUrlResponseSupported, true);
    assert.ok(result.firstRouteMs < 250, `First route render took ${result.firstRouteMs.toFixed(1)} ms`);
    assert.ok(result.repeatedRouteMs < 100, `Repeated route render took ${result.repeatedRouteMs.toFixed(1)} ms`);
    await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('[data-desktop-tab="projects"]')?.click()`
    });
    await delay(150);
    await cdp.send('Page.enable');
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-desktop-center.png'), screenshot.data, 'base64');
    await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        document.querySelector('[data-desktop-tab="search"]')?.click();
        const input = document.querySelector('[data-project-search-input]');
        input.value = 'Track';
        document.querySelector('[data-project-search-form]')?.requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 300));
      })()`
    });
    const searchScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(screenshotDirectory, 'smoke-project-search.png'), searchScreenshot.data, 'base64');
    await cdp.send('Page.reload');
    await delay(1600);
    const restoreEvaluation = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = '<input id="gh-token" type="password"><span></span>';
        document.body.appendChild(wrapper);
        await new Promise(resolve => setTimeout(resolve, 500));
        const input = document.getElementById('gh-token');
        const restored = input.value === 'github_pat_' + 'a'.repeat(32);
        input.value = '';
        const restoredToken = await window.WebDevGymGitHubTokenVault.restore();
        const restoredByVault = input.value === restoredToken && restoredToken.length >= 20;
        await window.webdevgymDesktop.githubToken.remove();
        const tokenRemoved = await window.webdevgymDesktop.githubToken.load() === '';
        wrapper.remove();
        return { restored, restoredByVault, tokenRemoved };
      })()`
    });
    const restoreResult = restoreEvaluation.result.value;
    assert.equal(restoreResult.restored, true);
    assert.equal(restoreResult.restoredByVault, true);
    assert.equal(restoreResult.tokenRemoved, true);
    console.log(JSON.stringify({ ...result, secondInstanceResult, ...restoreResult }, null, 2));
    await cdp.send('Browser.close');
  } finally {
    cdp?.close();
    if (secondInstanceChild?.exitCode === null) {
      if (process.platform === 'win32' && secondInstanceChild.pid) {
        spawnSync('taskkill', ['/pid', String(secondInstanceChild.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
      } else {
        secondInstanceChild.kill();
      }
    }
    if (child.exitCode === null) {
      if (process.platform === 'win32' && child.pid) {
        spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
      } else {
        child.kill();
      }
    }
    await Promise.race([
      new Promise(resolve => child.once('exit', resolve)),
      delay(3000)
    ]);
    await removeTemporaryDirectory(profileDirectory);
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
