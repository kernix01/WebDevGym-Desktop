const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const packagedBinary = process.env.WEBDEVGYM_ELECTRON_BINARY || '';
const electronPath = packagedBinary || require('electron');
const projectRoot = path.resolve(__dirname, '..');

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
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
  const output = [];
  const launchArguments = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    '--smoke'
  ];
  if (!packagedBinary) launchArguments.push(projectRoot);

  const child = spawn(electronPath, launchArguments, {
    cwd: projectRoot,
    env: {
      ...process.env,
      ELECTRON_ENABLE_SECURITY_WARNINGS: 'true',
      WEBDEVGYM_TEST_USER_DATA: profileDirectory
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false
  });

  child.stdout.on('data', chunk => output.push(chunk.toString()));
  child.stderr.on('data', chunk => output.push(chunk.toString()));

  let cdp;
  try {
    const page = await waitForPage(port, child, output);
    cdp = await connectCdp(page.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    const evaluation = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        await new Promise(resolve => setTimeout(resolve, 1400));
        const visibleButton = label => [...document.querySelectorAll('button')]
          .find(button => button.textContent.trim() === label && button.offsetParent !== null);
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
        const testToken = 'github_pat_' + 'a'.repeat(32);
        await window.webdevgymDesktop.githubToken.save(testToken);
        const tokenRoundTrip = await window.webdevgymDesktop.githubToken.load() === testToken;
        return {
          title: document.title,
          language: document.documentElement.lang,
          desktop: window.webdevgymDesktop,
          stylesheets: document.styleSheets.length,
          routesFound: Boolean(routes),
          overviewFound: Boolean(overview),
          pathOpen: Boolean(document.querySelector('[data-feature-page="paths"].open')),
          pathPageCount: document.querySelectorAll('[data-feature-page="paths"]').length,
          cachedAfterOverview,
          firstRouteMs,
          repeatedRouteMs,
          tokenBridge: Boolean(window.webdevgymDesktop?.githubToken?.load),
          tokenRoundTrip
        };
      })()`
    });

    const result = evaluation.result.value;
    assert.equal(result.title, 'WebDevGym');
    assert.equal(result.language, 'ru');
    assert.equal(result.desktop?.isDesktop, true);
    assert.equal(result.tokenBridge, true);
    assert.equal(result.tokenRoundTrip, true);
    assert.equal(result.routesFound, true);
    assert.equal(result.overviewFound, true);
    assert.equal(result.pathOpen, true);
    assert.equal(result.pathPageCount, 1);
    assert.equal(result.cachedAfterOverview, 1);
    assert.ok(result.stylesheets >= 10, 'Expected WebDevGym stylesheets to load');
    assert.ok(result.firstRouteMs < 250, `First route render took ${result.firstRouteMs.toFixed(1)} ms`);
    assert.ok(result.repeatedRouteMs < 100, `Repeated route render took ${result.repeatedRouteMs.toFixed(1)} ms`);
    await cdp.send('Page.enable');
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
    console.log(JSON.stringify({ ...result, ...restoreResult }, null, 2));
    await cdp.send('Browser.close');
  } finally {
    cdp?.close();
    if (child.exitCode === null) child.kill();
    await Promise.race([
      new Promise(resolve => child.once('exit', resolve)),
      delay(3000)
    ]);
    fs.rmSync(profileDirectory, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
