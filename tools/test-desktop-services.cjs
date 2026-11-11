const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  createDesktopServices,
  packageNameFromSpec,
  packageOperationCommand
} = require('../electron/desktop-services.cjs');

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function main() {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'webdevgym-desktop-services-'));
  const projectRoot = path.join(userData, 'sample-project');
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'index.html'), '<h1>Desktop preview</h1>', 'utf8');
  fs.writeFileSync(path.join(projectRoot, 'app.js'), 'console.log("one");', 'utf8');
  fs.writeFileSync(path.join(projectRoot, 'search.txt'), 'Nightwave Search\nnightwave search', 'utf8');
  fs.mkdirSync(path.join(projectRoot, 'covers'));
  fs.mkdirSync(path.join(projectRoot, 'music'));
  fs.writeFileSync(path.join(projectRoot, 'covers', 'cover.webp'), Buffer.from([82, 73, 70, 70]));
  fs.writeFileSync(path.join(projectRoot, 'music', 'track.mp3'), Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]));
  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({
    name: 'desktop-sample',
    scripts: { test: 'node app.js' },
    dependencies: { nanoid: '^5.0.0' },
    devDependencies: { eslint: '^9.0.0' }
  }), 'utf8');
  fs.mkdirSync(path.join(projectRoot, 'node_modules', 'nanoid'), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'node_modules', 'nanoid', 'package.json'), JSON.stringify({
    name: 'nanoid',
    version: '5.0.0'
  }), 'utf8');
  const fakeBin = path.join(userData, 'fake-bin');
  fs.mkdirSync(fakeBin);
  fs.writeFileSync(path.join(fakeBin, 'npm.cmd'), '@echo off\r\necho fake npm %*\r\nexit /b 0\r\n', 'utf8');
  process.env.PATH = `${fakeBin}${path.delimiter}${process.env.PATH || ''}`;
  const attachmentPath = path.join(userData, 'attachment.txt');
  fs.writeFileSync(attachmentPath, 'AI attachment test', 'utf8');

  execFileSync('git', ['init'], { cwd: projectRoot, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'desktop-test@webdevgym.local'], { cwd: projectRoot });
  execFileSync('git', ['config', 'user.name', 'WebDevGym Test'], { cwd: projectRoot });
  execFileSync('git', ['add', '-A'], { cwd: projectRoot });
  execFileSync('git', ['commit', '-m', 'Initial test project'], { cwd: projectRoot, stdio: 'ignore' });

  const handlers = new Map();
  const events = [];
  const openedUrls = [];
  const openedFiles = [];
  const notifications = [];
  const installerBytes = Buffer.from('WebDevGym test installer');
  const installerDigest = crypto.createHash('sha256').update(installerBytes).digest('hex');
  const ipcMain = { handle: (channel, handler) => handlers.set(channel, handler) };
  const event = {
    senderFrame: { url: 'webdevgym://app/index.html' },
    sender: {
      id: 1,
      getURL: () => 'webdevgym://app/index.html',
      isDestroyed: () => false,
      send: (channel, payload) => events.push({ channel, payload }),
      once: () => {}
    }
  };
  class FakeNotification {
    static isSupported() { return true; }
    constructor(options) { this.options = options; }
    show() { notifications.push(this.options); }
  }
  const service = createDesktopServices({
    app: {
      getPath: name => {
        assert.equal(name, 'userData');
        return userData;
      },
      getVersion: () => '0.1.2',
      quit: () => {}
    },
    dialog: {
      showOpenDialog: async (_window, options = {}) => ({
        canceled: false,
        filePaths: options.properties?.includes('openFile') ? [attachmentPath] : [projectRoot]
      })
    },
    ipcMain,
    Notification: FakeNotification,
    shell: {
      openExternal: async url => openedUrls.push(url),
      openPath: async filePath => {
        openedFiles.push(filePath);
        return '';
      },
      showItemInFolder: () => {}
    },
    getWindow: () => null,
    fetchImpl: async url => {
      if (String(url).includes('/releases/latest')) {
        return new Response(JSON.stringify({
          tag_name: 'v0.2.0',
          html_url: 'https://github.com/kernix01/WebDevGym-Desktop/releases/tag/v0.2.0',
          assets: [{
            name: 'WebDevGym-Setup-0.2.0-x64.exe',
            size: installerBytes.length,
            digest: `sha256:${installerDigest}`,
            browser_download_url: 'https://github.com/kernix01/WebDevGym-Desktop/releases/download/v0.2.0/WebDevGym-Setup-0.2.0-x64.exe'
          }]
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (String(url).endsWith('WebDevGym-Setup-0.2.0-x64.exe')) {
        return new Response(installerBytes, {
          status: 200,
          headers: { 'content-length': String(installerBytes.length), 'content-type': 'application/octet-stream' }
        });
      }
      if (String(url).includes('registry.npmjs.org')) {
        const version = String(url).includes('eslint') ? '10.0.0' : '5.1.0';
        return new Response(JSON.stringify({ version }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
      return new Response('Not found', { status: 404 });
    }
  });

  const invoke = (channel, payload) => {
    assert.ok(handlers.has(channel), `Missing IPC handler: ${channel}`);
    return handlers.get(channel)(event, payload);
  };

  const project = await invoke('webdevgym:desktop:choose-project');
  assert.equal(project.name, 'desktop-sample');
  assert.equal(project.hasPackageJson, true);
  assert.equal(project.packageManager, 'npm');
  assert.deepEqual(packageNameFromSpec('@scope/tool@1.2.3'), { name: '@scope/tool', spec: '@scope/tool@1.2.3' });
  assert.equal(packageNameFromSpec('bad;command'), null);
  assert.deepEqual(packageOperationCommand('npm', 'install', 'vite@latest', true).args, ['install', 'vite@latest', '--save-dev']);
  assert.deepEqual(packageOperationCommand('pnpm', 'remove', '@scope/tool').args, ['remove', '@scope/tool']);

  const packages = await invoke('webdevgym:desktop:packages', projectRoot);
  assert.equal(packages.manager, 'npm');
  assert.equal(packages.dependencies.length, 2);
  assert.equal(packages.dependencies.find(item => item.name === 'nanoid').installed, '5.0.0');
  assert.equal(packages.dependencies.find(item => item.name === 'eslint').installed, '');
  assert.equal(packages.dependencies.find(item => item.name === 'eslint').type, 'development');
  const packageUpdates = await invoke('webdevgym:desktop:package-updates', projectRoot);
  assert.equal(packageUpdates.dependencies.find(item => item.name === 'nanoid').latest, '5.1.0');
  assert.equal(packageUpdates.dependencies.find(item => item.name === 'nanoid').updateAvailable, true);
  await assert.rejects(() => invoke('webdevgym:desktop:package-mutate', {
    root: projectRoot,
    action: 'install',
    name: 'bad;command'
  }));
  const packageProcess = await invoke('webdevgym:desktop:package-mutate', {
    root: projectRoot,
    action: 'install',
    name: 'vite@latest',
    development: true
  });
  for (let attempt = 0; attempt < 40 && !events.some(item =>
    item.channel === 'webdevgym:desktop:process-output' && item.payload.id === packageProcess.id && item.payload.stream === 'exit'); attempt += 1) {
    await wait(25);
  }
  assert.ok(events.some(item =>
    item.channel === 'webdevgym:desktop:process-output' && item.payload.id === packageProcess.id && item.payload.text.includes('fake npm install vite@latest --save-dev')));
  assert.ok(events.some(item =>
    item.channel === 'webdevgym:desktop:process-output' && item.payload.id === packageProcess.id && item.payload.stream === 'exit' && item.payload.code === 0));
  assert.equal(project.scripts.test, 'node app.js');
  assert.ok(project.entries.some(entry => entry.path === 'index.html'));
  assert.equal((await invoke('webdevgym:desktop:recent')).length, 1);

  const insensitiveSearch = await invoke('webdevgym:desktop:search-project', {
    root: projectRoot,
    query: 'nightwave search',
    caseSensitive: false
  });
  assert.equal(insensitiveSearch.results.length, 2);
  assert.equal(insensitiveSearch.results[0].path, 'search.txt');
  assert.equal(insensitiveSearch.results[0].line, 1);
  const sensitiveSearch = await invoke('webdevgym:desktop:search-project', {
    root: projectRoot,
    query: 'Nightwave Search',
    caseSensitive: true
  });
  assert.equal(sensitiveSearch.results.length, 1);

  const watched = await invoke('webdevgym:desktop:watch-project', projectRoot);
  assert.equal(watched.watching, true);
  fs.writeFileSync(path.join(projectRoot, 'app.js'), 'console.log("external");', 'utf8');
  for (let attempt = 0; attempt < 40 && !events.some(item =>
    item.channel === 'webdevgym:desktop:project-changed' &&
    item.payload.changes.some(change => change.path === 'app.js')); attempt += 1) {
    await wait(50);
  }
  assert.ok(events.some(item =>
    item.channel === 'webdevgym:desktop:project-changed' &&
    item.payload.changes.some(change => change.path === 'app.js')));
  assert.equal(await invoke('webdevgym:desktop:unwatch-project'), true);
  fs.writeFileSync(path.join(projectRoot, 'app.js'), 'console.log("one");', 'utf8');

  const chatFiles = await invoke('webdevgym:desktop:choose-chat-files');
  assert.equal(chatFiles.length, 1);
  assert.equal(chatFiles[0].name, 'attachment.txt');
  assert.equal(chatFiles[0].type, 'text/plain');
  assert.equal(chatFiles[0].data.toString('utf8'), 'AI attachment test');

  const original = await invoke('webdevgym:desktop:read-file', { root: projectRoot, path: 'app.js' });
  assert.match(original.content, /one/);
  await invoke('webdevgym:desktop:write-file', {
    root: projectRoot,
    path: 'app.js',
    content: 'console.log("two");'
  });
  assert.match(fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8'), /two/);
  const diagnostics = await invoke('webdevgym:desktop:diagnose-file', {
    root: projectRoot,
    path: 'app.js',
    content: 'missingValue();'
  });
  assert.ok(diagnostics.some(problem => problem.rule === 'no-undef'));
  await assert.rejects(() => invoke('webdevgym:desktop:diagnose-file', {
    root: projectRoot,
    path: '../outside.js',
    content: 'outside();'
  }));

  await invoke('webdevgym:desktop:create-directory', { root: projectRoot, path: 'assets' });
  await invoke('webdevgym:desktop:create-file', { root: projectRoot, path: 'assets/theme.css' });
  await invoke('webdevgym:desktop:write-file', {
    root: projectRoot,
    path: 'assets/theme.css',
    content: 'body { color: purple; }'
  });
  await invoke('webdevgym:desktop:rename-entry', {
    root: projectRoot,
    from: 'assets/theme.css',
    to: 'assets/player.css'
  });
  assert.equal(fs.existsSync(path.join(projectRoot, 'assets', 'theme.css')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, 'assets', 'player.css')), true);
  await invoke('webdevgym:desktop:delete-entry', { root: projectRoot, path: 'assets' });
  assert.equal(fs.existsSync(path.join(projectRoot, 'assets')), false);
  await assert.rejects(() => invoke('webdevgym:desktop:create-file', { root: projectRoot, path: '../outside.txt' }));

  const backup = await invoke('webdevgym:desktop:create-backup', projectRoot);
  fs.writeFileSync(path.join(projectRoot, 'app.js'), 'console.log("three");', 'utf8');
  await invoke('webdevgym:desktop:restore-backup', { root: projectRoot, id: backup.id });
  assert.match(fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8'), /two/);
  assert.equal((await invoke('webdevgym:desktop:list-backups', projectRoot)).length, 1);

  const preview = await invoke('webdevgym:desktop:start-preview', projectRoot);
  const previewResponse = await fetch(preview.url);
  assert.equal(previewResponse.status, 200);
  assert.match(await previewResponse.text(), /Desktop preview/);
  const coverResponse = await fetch(new URL('covers/cover.webp', preview.url));
  assert.equal(coverResponse.status, 200);
  assert.equal(coverResponse.headers.get('content-type'), 'image/webp');
  const audioResponse = await fetch(new URL('music/track.mp3', preview.url), {
    headers: { range: 'bytes=2-5' }
  });
  assert.equal(audioResponse.status, 206);
  assert.equal(audioResponse.headers.get('content-type'), 'audio/mpeg');
  assert.equal(audioResponse.headers.get('content-range'), 'bytes 2-5/8');
  assert.deepEqual(Buffer.from(await audioResponse.arrayBuffer()), Buffer.from([2, 3, 4, 5]));
  assert.equal(await invoke('webdevgym:desktop:stop-preview', preview.id), true);

  const running = await invoke('webdevgym:desktop:start-process', {
    root: projectRoot,
    command: 'node -e "console.log(\'desktop-service-ok\')"'
  });
  for (let attempt = 0; attempt < 40 && !events.some(item => item.payload.id === running.id && item.payload.stream === 'exit'); attempt += 1) {
    await wait(50);
  }
  assert.ok(events.some(item => item.payload.id === running.id && item.payload.text.includes('desktop-service-ok')));
  const exitEvent = events.find(item => item.payload.id === running.id && item.payload.stream === 'exit');
  assert.equal(exitEvent?.payload.code, 0);

  const longRunning = await invoke('webdevgym:desktop:start-process', {
    root: projectRoot,
    command: 'node -e "setInterval(() => {}, 1000)"'
  });
  assert.equal(await invoke('webdevgym:desktop:stop-process', longRunning.id), true);
  for (let attempt = 0; attempt < 40 && !events.some(item => item.payload.id === longRunning.id && item.payload.stream === 'exit'); attempt += 1) {
    await wait(50);
  }
  assert.ok(events.some(item => item.payload.id === longRunning.id && item.payload.stream === 'exit'));

  fs.writeFileSync(path.join(projectRoot, 'search.txt'), 'Keep this change unstaged', 'utf8');
  const status = await invoke('webdevgym:desktop:git-status', projectRoot);
  assert.equal(status.code, 0);
  assert.match(status.stdout, /app\.js/);
  let changes = await invoke('webdevgym:desktop:git-changes', projectRoot);
  assert.equal(changes.branch.length > 0, true);
  assert.equal(changes.files.find(file => file.path === 'app.js')?.unstaged, true);
  const unstagedDiff = await invoke('webdevgym:desktop:git-diff', { root: projectRoot, path: 'app.js' });
  assert.match(unstagedDiff.unstaged, /console\.log\("two"\)/);
  const staged = await invoke('webdevgym:desktop:git-stage', { root: projectRoot, path: 'app.js' });
  assert.equal(staged.code, 0);
  changes = await invoke('webdevgym:desktop:git-changes', projectRoot);
  assert.equal(changes.files.find(file => file.path === 'app.js')?.staged, true);
  const stagedDiff = await invoke('webdevgym:desktop:git-diff', { root: projectRoot, path: 'app.js' });
  assert.match(stagedDiff.staged, /console\.log\("two"\)/);
  const commit = await invoke('webdevgym:desktop:git-commit', { root: projectRoot, message: 'Test desktop commit' });
  assert.equal(commit.code, 0);
  changes = await invoke('webdevgym:desktop:git-changes', projectRoot);
  assert.equal(changes.files.some(file => file.path === 'app.js'), false);
  assert.equal(changes.files.find(file => file.path === 'search.txt')?.unstaged, true);
  const history = await invoke('webdevgym:desktop:git-history', projectRoot);
  assert.match(history.stdout, /Test desktop commit/);
  fs.writeFileSync(path.join(projectRoot, 'app.js'), 'console.log("unstage");', 'utf8');
  assert.equal((await invoke('webdevgym:desktop:git-stage', { root: projectRoot, path: 'app.js' })).code, 0);
  assert.equal((await invoke('webdevgym:desktop:git-unstage', { root: projectRoot, path: 'app.js' })).code, 0);
  changes = await invoke('webdevgym:desktop:git-changes', projectRoot);
  assert.equal(changes.files.find(file => file.path === 'app.js')?.staged, false);
  assert.equal(changes.files.find(file => file.path === 'app.js')?.unstaged, true);
  fs.writeFileSync(path.join(projectRoot, 'draft.txt'), 'Untracked Git diff', 'utf8');
  const untrackedDiff = await invoke('webdevgym:desktop:git-diff', { root: projectRoot, path: 'draft.txt' });
  assert.match(untrackedDiff.unstaged, /Untracked Git diff/);
  await assert.rejects(() => invoke('webdevgym:desktop:git-stage', { root: projectRoot, path: '../outside.js' }));

  const update = await invoke('webdevgym:desktop:check-update');
  assert.equal(update.hasUpdate, true);
  assert.equal(update.latest, '0.2.0');
  assert.equal(update.canDownload, true);
  const downloadedUpdate = await invoke('webdevgym:desktop:download-update');
  assert.deepEqual(fs.readFileSync(downloadedUpdate.path), installerBytes);
  assert.equal(downloadedUpdate.sha256, installerDigest);
  assert.ok(events.some(item => item.channel === 'webdevgym:desktop:update-progress' && item.payload.percent === 100));
  assert.equal(await invoke('webdevgym:desktop:install-update', downloadedUpdate.path), true);
  assert.equal(openedFiles[0], downloadedUpdate.path);
  assert.equal(await invoke('webdevgym:desktop:notify', { title: 'WebDevGym', body: 'Ready' }), true);
  assert.equal(notifications.length, 1);
  await invoke('webdevgym:desktop:open-external', update.url);
  assert.equal(openedUrls[0], update.url);
  assert.equal((await invoke('webdevgym:desktop:forget-project', projectRoot)).length, 0);
  assert.equal((await invoke('webdevgym:desktop:recent')).length, 0);

  service.dispose();
  fs.rmSync(userData, { recursive: true, force: true });
  console.log('Desktop services integration tests passed.');
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
