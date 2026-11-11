const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { diagnoseFile } = require('./diagnostics.cjs');
const { installFromMarketplace, installVsixFile, removeStoredExtension, searchMarketplace } = require('./extension-marketplace.cjs');

const fsp = fs.promises;
const MAX_TEXT_FILE_SIZE = 2 * 1024 * 1024;
const MAX_SEARCH_RESULTS = 500;
const MAX_SEARCH_QUERY = 200;
const MAX_COMMAND_OUTPUT = 2 * 1024 * 1024;
const MAX_TREE_ENTRIES = 4000;
const IGNORED_DIRECTORIES = new Set([
  '.git', '.next', '.nuxt', '.vite', 'build', 'coverage', 'dist', 'node_modules', 'out'
]);
const BINARY_EXTENSIONS = new Set([
  '.7z', '.avi', '.bmp', '.class', '.dll', '.doc', '.docx', '.eot', '.exe', '.gif', '.gz', '.ico',
  '.jar', '.jpeg', '.jpg', '.mkv', '.mov', '.mp3', '.mp4', '.ogg', '.otf', '.pdf', '.png', '.rar',
  '.tar', '.ttf', '.wav', '.webm', '.webp', '.woff', '.woff2', '.xls', '.xlsx', '.zip'
]);
const MAX_CHAT_FILE_SIZE = 25 * 1024 * 1024;
const MAX_CHAT_TOTAL_SIZE = 64 * 1024 * 1024;
const MAX_CHAT_FILES = 8;
const MAX_UPDATE_SIZE = 512 * 1024 * 1024;
const MAX_PROJECT_DEPENDENCIES = 300;
const LATEST_RELEASE_URL = 'https://api.github.com/repos/kernix01/WebDevGym-Desktop/releases/latest';
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.htm': 'text/html; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function normalizeRoot(root) {
  if (typeof root !== 'string' || !root.trim()) throw new Error('Project folder is required');
  return path.resolve(root.trim());
}

function resolveInside(root, relativePath = '.') {
  const normalizedRoot = normalizeRoot(root);
  const target = path.resolve(normalizedRoot, String(relativePath || '.'));
  if (target !== normalizedRoot && !target.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error('The requested path is outside the project');
  }
  return target;
}

function assertNoSymlink(root, target) {
  const relative = path.relative(root, target);
  let current = root;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) continue;
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Symbolic links are not supported');
  }
}

function versionParts(version) {
  return String(version || '0').replace(/^v/i, '').split('.').map(part => Number.parseInt(part, 10) || 0);
}

function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  const count = Math.max(a.length, b.length);
  for (let index = 0; index < count; index += 1) {
    if ((a[index] || 0) > (b[index] || 0)) return 1;
    if ((a[index] || 0) < (b[index] || 0)) return -1;
  }
  return 0;
}

function parseGitStatus(output) {
  const records = String(output || '').split('\0');
  const files = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record || record.length < 3) continue;
    const indexStatus = record[0];
    const worktreeStatus = record[1];
    const filePath = record.slice(3);
    let originalPath = '';
    if ('RC'.includes(indexStatus) || 'RC'.includes(worktreeStatus)) {
      originalPath = records[index + 1] || '';
      index += 1;
    }
    files.push({
      path: filePath,
      originalPath,
      index: indexStatus,
      worktree: worktreeStatus,
      staged: indexStatus !== ' ' && indexStatus !== '?',
      unstaged: worktreeStatus !== ' ' || (indexStatus === '?' && worktreeStatus === '?')
    });
  }
  return files;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fsp.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await fsp.writeFile(temporaryPath, JSON.stringify(value, null, 2), 'utf8');
  await fsp.rm(filePath, { force: true });
  await fsp.rename(temporaryPath, filePath);
}

function detectPackageManager(root, packageData = {}) {
  const declared = String(packageData.packageManager || '').split('@')[0].toLowerCase();
  if (['npm', 'pnpm', 'yarn', 'bun'].includes(declared)) return declared;
  if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(root, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(root, 'bun.lock')) || fs.existsSync(path.join(root, 'bun.lockb'))) return 'bun';
  return 'npm';
}

function packageNameFromSpec(value) {
  const spec = String(value || '').trim();
  if (!spec || spec.length > 214 || /[\s\\"'`;|&<>$(){}\[\]\0]/.test(spec)) return null;
  const versionSeparator = spec.startsWith('@')
    ? spec.indexOf('@', spec.indexOf('/') + 1)
    : spec.indexOf('@');
  const name = versionSeparator > 0 ? spec.slice(0, versionSeparator) : spec;
  const version = versionSeparator > 0 ? spec.slice(versionSeparator + 1) : '';
  if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(name)) return null;
  if (version && !/^[a-z0-9][a-z0-9._+-]*$/i.test(version)) return null;
  return { name, spec };
}

function packageOperationCommand(managerValue, actionValue, packageValue, development = false) {
  const manager = ['npm', 'pnpm', 'yarn', 'bun'].includes(managerValue) ? managerValue : 'npm';
  const action = String(actionValue || '');
  const parsed = packageNameFromSpec(packageValue);
  if (!parsed) throw new Error('Enter a valid registry package name');

  let args;
  if (action === 'install') {
    args = manager === 'npm' ? ['install', parsed.spec] : ['add', parsed.spec];
    if (development) args.push(manager === 'npm' || manager === 'pnpm' ? '--save-dev' : '--dev');
  } else if (action === 'update') {
    const latest = `${parsed.name}@latest`;
    args = manager === 'npm' ? ['install', latest] : ['add', latest];
    if (development) args.push(manager === 'npm' || manager === 'pnpm' ? '--save-dev' : '--dev');
  } else if (action === 'remove') {
    args = [manager === 'npm' ? 'uninstall' : 'remove', parsed.name];
  } else {
    throw new Error('Unsupported package operation');
  }

  const executable = process.platform === 'win32' && manager !== 'bun' ? `${manager}.cmd` : manager;
  return {
    executable,
    args,
    display: `${manager} ${args.join(' ')}`,
    name: parsed.name
  };
}

async function projectPackages(root) {
  const packagePath = path.join(root, 'package.json');
  const exists = fs.existsSync(packagePath);
  const packageData = exists ? await readJson(packagePath, {}) : {};
  const records = new Map();
  const add = (dependencies, type) => {
    if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)) return;
    Object.entries(dependencies).forEach(([name, requested]) => {
      if (!packageNameFromSpec(name) || typeof requested !== 'string' || records.size >= MAX_PROJECT_DEPENDENCIES) return;
      if (!records.has(name)) records.set(name, { name, requested, type });
    });
  };
  add(packageData.dependencies, 'production');
  add(packageData.devDependencies, 'development');

  const dependencies = [];
  for (const dependency of records.values()) {
    const installedData = await readJson(path.join(root, 'node_modules', dependency.name, 'package.json'), null);
    dependencies.push({
      ...dependency,
      installed: typeof installedData?.version === 'string' ? installedData.version : '',
      latest: '',
      updateAvailable: false
    });
  }
  dependencies.sort((left, right) => left.name.localeCompare(right.name));
  return {
    hasPackageJson: exists,
    name: packageData.name || path.basename(root),
    manager: detectPackageManager(root, packageData),
    dependencies
  };
}

function runExecutable(command, args, cwd) {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd, windowsHide: true, shell: false });
    let stdout = '';
    let stderr = '';
    const append = (key, chunk) => {
      const text = chunk.toString('utf8');
      if (key === 'stdout') stdout = (stdout + text).slice(-MAX_COMMAND_OUTPUT);
      else stderr = (stderr + text).slice(-MAX_COMMAND_OUTPUT);
    };
    child.stdout.on('data', chunk => append('stdout', chunk));
    child.stderr.on('data', chunk => append('stderr', chunk));
    child.once('error', error => resolve({ code: -1, stdout, stderr: error.message }));
    child.once('close', code => resolve({ code: code ?? -1, stdout, stderr }));
  });
}

async function listProjectTree(root) {
  const files = [];
  const stack = [{ absolute: root, relative: '' }];
  while (stack.length && files.length < MAX_TREE_ENTRIES) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = await fsp.readdir(current.absolute, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const entry = entries[index];
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) continue;
      const relative = path.join(current.relative, entry.name).replaceAll('\\', '/');
      if (entry.isDirectory()) {
        files.push({ path: relative, type: 'directory' });
        stack.push({ absolute: path.join(current.absolute, entry.name), relative });
      } else if (entry.isFile()) {
        files.push({ path: relative, type: 'file' });
      }
      if (files.length >= MAX_TREE_ENTRIES) break;
    }
  }
  return { entries: files, truncated: files.length >= MAX_TREE_ENTRIES };
}

async function searchProjectFiles(root, queryValue, caseSensitive = false) {
  const query = String(queryValue || '').trim();
  if (!query) return { query: '', results: [], searchedFiles: 0, truncated: false };
  if (query.length > MAX_SEARCH_QUERY) throw new Error(`Search text must be ${MAX_SEARCH_QUERY} characters or shorter`);

  const normalizedNeedle = caseSensitive ? query : query.toLocaleLowerCase();
  const tree = await listProjectTree(root);
  const results = [];
  let searchedFiles = 0;

  for (const entry of tree.entries) {
    if (entry.type !== 'file' || BINARY_EXTENSIONS.has(path.extname(entry.path).toLowerCase())) continue;
    const target = resolveInside(root, entry.path);
    let stats;
    let content;
    try {
      stats = await fsp.stat(target);
      if (!stats.isFile() || stats.size > MAX_TEXT_FILE_SIZE) continue;
      content = await fsp.readFile(target, 'utf8');
    } catch {
      continue;
    }
    if (content.includes('\0')) continue;
    searchedFiles += 1;

    let lineOffset = 0;
    const lines = content.split('\n');
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const rawLine = lines[lineIndex];
      const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
      const haystack = caseSensitive ? line : line.toLocaleLowerCase();
      let column = haystack.indexOf(normalizedNeedle);
      while (column !== -1) {
        const previewStart = Math.max(0, column - 80);
        const previewEnd = Math.min(line.length, column + query.length + 140);
        results.push({
          path: entry.path,
          line: lineIndex + 1,
          column: column + 1,
          offset: lineOffset + column,
          length: query.length,
          preview: line.slice(previewStart, previewEnd).trim()
        });
        if (results.length >= MAX_SEARCH_RESULTS) {
          return { query, results, searchedFiles, truncated: true };
        }
        column = haystack.indexOf(normalizedNeedle, column + Math.max(normalizedNeedle.length, 1));
      }
      lineOffset += rawLine.length + 1;
    }
  }

  return { query, results, searchedFiles, truncated: false };
}

function createDesktopServices({ app, dialog, ipcMain, Notification, shell, getWindow, fetchImpl = global.fetch }) {
  const dataFile = path.join(app.getPath('userData'), 'desktop-workspaces.json');
  const backupsRoot = path.join(app.getPath('userData'), 'project-backups');
  const updatesRoot = path.join(app.getPath('userData'), 'updates');
  const extensionsRoot = path.join(app.getPath('userData'), 'extensions');
  const processes = new Map();
  const previewServers = new Map();
  const projectWatchers = new Map();
  let recentProjects = [];
  let updateDownloadPromise = null;

  const ready = readJson(dataFile, []).then(value => {
    recentProjects = Array.isArray(value) ? value.filter(item => item && typeof item.path === 'string') : [];
  });

  async function fetchLatestRelease() {
    const response = await fetchImpl(LATEST_RELEASE_URL, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'WebDevGym-Desktop' }
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    return response.json();
  }

  function findSetupAsset(release, latest) {
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const exactName = `WebDevGym-Setup-${latest}-x64.exe`.toLowerCase();
    return assets.find(asset => String(asset?.name || '').toLowerCase() === exactName)
      || assets.find(asset => /^webdevgym-setup-.*-x64\.exe$/i.test(String(asset?.name || '')))
      || null;
  }

  async function downloadLatestUpdate(event) {
    await ready;
    const current = app.getVersion();
    const release = await fetchLatestRelease();
    const latest = String(release.tag_name || '').replace(/^v/i, '');
    if (compareVersions(latest, current) <= 0) throw new Error('The latest version is already installed');

    const asset = findSetupAsset(release, latest);
    if (!asset) throw new Error('The release does not contain a WebDevGym Setup x64 installer');
    const assetUrl = new URL(String(asset.browser_download_url || ''));
    if (assetUrl.protocol !== 'https:' || assetUrl.hostname !== 'github.com') {
      throw new Error('GitHub returned an invalid installer URL');
    }

    const expectedSize = Number(asset.size) || 0;
    if (expectedSize > MAX_UPDATE_SIZE) throw new Error('The update installer is too large');
    const fileName = path.basename(String(asset.name || ''));
    if (!/^webdevgym-setup-.*-x64\.exe$/i.test(fileName)) throw new Error('Invalid installer name');

    await fsp.mkdir(updatesRoot, { recursive: true });
    const finalPath = path.join(updatesRoot, fileName);
    const temporaryPath = `${finalPath}.download`;
    await fsp.rm(temporaryPath, { force: true });

    const response = await fetchImpl(assetUrl.href, {
      headers: { accept: 'application/octet-stream', 'user-agent': 'WebDevGym-Desktop' },
      redirect: 'follow'
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status} while downloading the update`);
    if (!response.body) throw new Error('GitHub returned an empty installer');

    const hash = crypto.createHash('sha256');
    const file = await fsp.open(temporaryPath, 'w');
    let downloaded = 0;
    let lastPercent = -1;
    let downloadError = null;
    try {
      for await (const chunk of response.body) {
        const buffer = Buffer.from(chunk);
        downloaded += buffer.length;
        if (downloaded > MAX_UPDATE_SIZE) throw new Error('The update installer is too large');
        hash.update(buffer);
        await file.write(buffer);
        const total = expectedSize || Number(response.headers.get('content-length')) || 0;
        const percent = total ? Math.min(100, Math.round((downloaded / total) * 100)) : 0;
        if (percent !== lastPercent) {
          lastPercent = percent;
          event.sender.send('webdevgym:desktop:update-progress', { downloaded, total, percent, latest });
        }
      }
    } catch (error) {
      downloadError = error;
    } finally {
      await file.close();
    }
    if (downloadError) {
      await fsp.rm(temporaryPath, { force: true });
      throw downloadError;
    }

    if (expectedSize && downloaded !== expectedSize) {
      await fsp.rm(temporaryPath, { force: true });
      throw new Error('The downloaded installer size does not match the GitHub release');
    }
    const actualDigest = hash.digest('hex');
    const expectedDigest = String(asset.digest || '').match(/^sha256:([a-f\d]{64})$/i)?.[1]?.toLowerCase();
    if (expectedDigest && actualDigest !== expectedDigest) {
      await fsp.rm(temporaryPath, { force: true });
      throw new Error('The downloaded installer failed the SHA-256 check');
    }

    await fsp.rm(finalPath, { force: true });
    await fsp.rename(temporaryPath, finalPath);
    event.sender.send('webdevgym:desktop:update-progress', {
      downloaded,
      total: expectedSize || downloaded,
      percent: 100,
      latest
    });
    return { latest, name: fileName, path: finalPath, size: downloaded, sha256: actualDigest };
  }

  const trustedSender = event => {
    const url = event.senderFrame?.url || event.sender.getURL();
    return url.startsWith('webdevgym://app/');
  };

  function protect(handler) {
    return async (event, payload) => {
      if (!trustedSender(event)) throw new Error('Untrusted desktop request');
      await ready;
      return handler(event, payload);
    };
  }

  function assertKnownRoot(root) {
    const normalized = normalizeRoot(root);
    if (!recentProjects.some(project => path.resolve(project.path) === normalized)) {
      throw new Error('Choose this project folder in WebDevGym first');
    }
    if (!fs.existsSync(normalized) || !fs.statSync(normalized).isDirectory()) {
      throw new Error('Project folder is unavailable');
    }
    return normalized;
  }

  async function rememberProject(root) {
    const normalized = normalizeRoot(root);
    recentProjects = [
      { path: normalized, name: path.basename(normalized), lastOpened: new Date().toISOString() },
      ...recentProjects.filter(project => path.resolve(project.path) !== normalized)
    ].slice(0, 12);
    await writeJson(dataFile, recentProjects);
    return recentProjects[0];
  }

  async function projectSummary(root) {
    const packagePath = path.join(root, 'package.json');
    const packageData = await readJson(packagePath, {});
    const tree = await listProjectTree(root);
    const scripts = Object.fromEntries(Object.entries(packageData.scripts || {})
      .filter(([name, command]) => typeof name === 'string' && typeof command === 'string'));
    return {
      root,
      name: packageData.name || path.basename(root),
      hasPackageJson: fs.existsSync(packagePath),
      packageManager: detectPackageManager(root, packageData),
      scripts,
      ...tree
    };
  }

  function stopProjectWatcher(senderId) {
    const active = projectWatchers.get(senderId);
    if (!active) return false;
    clearTimeout(active.timer);
    active.watcher.close();
    projectWatchers.delete(senderId);
    return true;
  }

  function ignoredWatchPath(relativePath) {
    return relativePath.split('/').some(part => IGNORED_DIRECTORIES.has(part.toLowerCase()));
  }

  function projectEntry(rootValue, entryPath) {
    const root = assertKnownRoot(rootValue);
    const relative = String(entryPath || '').replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
    if (!relative || relative === '.' || relative.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new Error('Choose a valid project item');
    }
    const target = resolveInside(root, relative);
    assertNoSymlink(root, target);
    return { root, relative, target };
  }

  function gitEntry(rootValue, entryPath) {
    const root = assertKnownRoot(rootValue);
    const relative = String(entryPath || '').replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
    if (!relative || relative.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new Error('Choose a valid Git file');
    }
    const target = resolveInside(root, relative);
    assertNoSymlink(root, target);
    return { root, relative };
  }

  async function gitChanges(rootValue) {
    const root = assertKnownRoot(rootValue);
    const status = await runExecutable('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], root);
    if (status.code !== 0) throw new Error(status.stderr.trim() || 'Git status failed');
    const branch = await runExecutable('git', ['branch', '--show-current'], root);
    const files = parseGitStatus(status.stdout);
    return {
      branch: branch.code === 0 ? branch.stdout.trim() : '',
      files,
      stagedCount: files.filter(file => file.staged).length,
      unstagedCount: files.filter(file => file.unstaged).length
    };
  }

  function launchProcess(event, root, executable, args, displayCommand, useShell = false) {
    const id = crypto.randomUUID();
    let launchExecutable = executable;
    let launchArgs = args;
    if (!useShell && process.platform === 'win32' && executable.toLowerCase().endsWith('.cmd')) {
      launchExecutable = process.env.ComSpec || 'cmd.exe';
      launchArgs = ['/d', '/s', '/c', `${executable} ${args.join(' ')}`];
    }
    const child = spawn(launchExecutable, launchArgs, {
      cwd: root,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      shell: useShell,
      windowsHide: true
    });
    const send = (stream, chunk, details = {}) => {
      if (event.sender.isDestroyed()) return;
      event.sender.send('webdevgym:desktop:process-output', {
        id,
        stream,
        text: String(chunk).slice(-64000),
        ...details
      });
    };
    child.stdout.on('data', chunk => send('stdout', chunk));
    child.stderr.on('data', chunk => send('stderr', chunk));
    child.once('error', error => send('stderr', `${error.message}\n`));
    child.once('close', (code, signal) => {
      const exitCode = code ?? -1;
      send('exit', `\nProcess finished with code ${exitCode}.\n`, { code: exitCode, signal: signal || '' });
      processes.delete(id);
    });
    processes.set(id, { child, command: displayCommand, root });
    return { id, command: displayCommand, pid: child.pid, startedAt: Date.now() };
  }

  async function packageUpdates(root) {
    const snapshot = await projectPackages(root);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    timeout.unref?.();
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < snapshot.dependencies.length) {
        const dependency = snapshot.dependencies[nextIndex];
        nextIndex += 1;
        try {
          const response = await fetchImpl(`https://registry.npmjs.org/${encodeURIComponent(dependency.name)}/latest`, {
            headers: { accept: 'application/json', 'user-agent': 'WebDevGym-Desktop' },
            signal: controller.signal
          });
          if (!response.ok) continue;
          const data = await response.json();
          dependency.latest = typeof data?.version === 'string' ? data.version : '';
          dependency.updateAvailable = Boolean(
            dependency.installed && dependency.latest && compareVersions(dependency.latest, dependency.installed) > 0
          );
        } catch {}
      }
    };
    try {
      const workerCount = Math.min(12, snapshot.dependencies.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));
    } finally {
      clearTimeout(timeout);
    }
    return snapshot;
  }

  ipcMain.handle('webdevgym:desktop:recent', protect(() => recentProjects));
  ipcMain.handle('webdevgym:desktop:forget-project', protect(async (_event, rootValue) => {
    const normalized = normalizeRoot(rootValue);
    recentProjects = recentProjects.filter(project => path.resolve(project.path) !== normalized);
    await writeJson(dataFile, recentProjects);
    return recentProjects;
  }));
  ipcMain.handle('webdevgym:desktop:choose-project', protect(async () => {
    const result = await dialog.showOpenDialog(getWindow(), {
      title: 'Open a project folder',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const root = normalizeRoot(result.filePaths[0]);
    await rememberProject(root);
    return projectSummary(root);
  }));
  ipcMain.handle('webdevgym:desktop:install-vsix', protect(async () => {
    const result = await dialog.showOpenDialog(getWindow(), {
      title: 'Select a VS Code extension package',
      properties: ['openFile'],
      filters: [{ name: 'VS Code extension', extensions: ['vsix'] }]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    if (path.extname(result.filePaths[0]).toLowerCase() !== '.vsix') throw new Error('Choose a .vsix extension package');
    return installVsixFile(extensionsRoot, result.filePaths[0]);
  }));
  ipcMain.handle('webdevgym:desktop:search-extensions', protect(async (_event, query) => searchMarketplace(fetchImpl, query)));
  ipcMain.handle('webdevgym:desktop:install-marketplace-extension', protect(async (_event, request) => installFromMarketplace(fetchImpl, extensionsRoot, request)));
  ipcMain.handle('webdevgym:desktop:remove-extension', protect(async (_event, id) => removeStoredExtension(extensionsRoot, id)));

  ipcMain.handle('webdevgym:desktop:choose-chat-files', protect(async () => {
    const result = await dialog.showOpenDialog(getWindow(), {
      title: 'Attach files to AI chat',
      properties: ['openFile', 'multiSelections']
    });
    if (result.canceled) return [];

    const files = [];
    let totalSize = 0;
    for (const filePath of result.filePaths.slice(0, MAX_CHAT_FILES)) {
      const stats = await fsp.stat(filePath);
      if (!stats.isFile()) continue;
      if (stats.size > MAX_CHAT_FILE_SIZE) {
        throw new Error('Each attachment must be 25 MB or smaller');
      }

      totalSize += stats.size;
      if (totalSize > MAX_CHAT_TOTAL_SIZE) {
        throw new Error('Attachments must be 64 MB or smaller in total');
      }

      const extension = path.extname(filePath).toLowerCase();
      files.push({
        name: path.basename(filePath),
        type: String(MIME_TYPES[extension] || 'application/octet-stream').replace('; charset=utf-8', ''),
        size: stats.size,
        lastModified: stats.mtimeMs,
        data: await fsp.readFile(filePath)
      });
    }
    return files;
  }));
  ipcMain.handle('webdevgym:desktop:open-project', protect(async (_event, rootValue) => {
    const root = assertKnownRoot(rootValue);
    await rememberProject(root);
    return projectSummary(root);
  }));
  ipcMain.handle('webdevgym:desktop:refresh-project', protect(async (_event, rootValue) => {
    return projectSummary(assertKnownRoot(rootValue));
  }));
  ipcMain.handle('webdevgym:desktop:search-project', protect(async (_event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    return searchProjectFiles(root, payload.query, payload.caseSensitive === true);
  }));
  ipcMain.handle('webdevgym:desktop:packages', protect(async (_event, rootValue) => {
    return projectPackages(assertKnownRoot(rootValue));
  }));
  ipcMain.handle('webdevgym:desktop:package-updates', protect(async (_event, rootValue) => {
    return packageUpdates(assertKnownRoot(rootValue));
  }));
  ipcMain.handle('webdevgym:desktop:package-mutate', protect(async (event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const packageData = await readJson(path.join(root, 'package.json'), {});
    const manager = detectPackageManager(root, packageData);
    const command = packageOperationCommand(manager, payload.action, payload.name, payload.development === true);
    return launchProcess(event, root, command.executable, command.args, command.display);
  }));
  ipcMain.handle('webdevgym:desktop:watch-project', protect(async (event, rootValue) => {
    const root = assertKnownRoot(rootValue);
    const senderId = event.sender.id;
    stopProjectWatcher(senderId);

    const pendingChanges = new Map();
    const active = { root, sender: event.sender, timer: 0, watcher: null };
    const flush = () => {
      active.timer = 0;
      if (active.sender.isDestroyed()) {
        stopProjectWatcher(senderId);
        return;
      }
      const changes = [...pendingChanges].map(([entryPath, eventType]) => ({ path: entryPath, eventType }));
      pendingChanges.clear();
      if (!changes.length) return;
      active.sender.send('webdevgym:desktop:project-changed', {
        root,
        changes,
        changedAt: Date.now()
      });
    };

    active.watcher = fs.watch(root, { recursive: true }, (eventType, fileName) => {
      const relative = String(fileName || '').replaceAll('\\\\', '/').replace(/^\/+/, '');
      if (!relative || ignoredWatchPath(relative)) return;
      pendingChanges.set(relative, eventType);
      clearTimeout(active.timer);
      active.timer = setTimeout(flush, 120);
    });
    active.watcher.on('error', error => {
      if (!active.sender.isDestroyed()) {
        active.sender.send('webdevgym:desktop:project-watch-error', {
          root,
          message: error.message
        });
      }
      stopProjectWatcher(senderId);
    });
    projectWatchers.set(senderId, active);
    event.sender.once('destroyed', () => stopProjectWatcher(senderId));
    return { root, watching: true };
  }));
  ipcMain.handle('webdevgym:desktop:unwatch-project', protect(async event => {
    return stopProjectWatcher(event.sender.id);
  }));
  ipcMain.handle('webdevgym:desktop:read-file', protect(async (_event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const target = resolveInside(root, payload.path);
    assertNoSymlink(root, target);
    const stats = await fsp.stat(target);
    if (!stats.isFile()) throw new Error('Choose a file');
    if (stats.size > MAX_TEXT_FILE_SIZE) throw new Error('The file is larger than 2 MB');
    const content = await fsp.readFile(target, 'utf8');
    if (content.includes('\0')) throw new Error('Binary files cannot be edited as text');
    return { path: String(payload.path), content, modifiedAt: stats.mtimeMs };
  }));
  ipcMain.handle('webdevgym:desktop:write-file', protect(async (_event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const target = resolveInside(root, payload.path);
    assertNoSymlink(root, target);
    const content = typeof payload.content === 'string' ? payload.content : '';
    if (Buffer.byteLength(content, 'utf8') > MAX_TEXT_FILE_SIZE) throw new Error('The file is larger than 2 MB');
    await fsp.writeFile(target, content, 'utf8');
    return { savedAt: Date.now() };
  }));
  ipcMain.handle('webdevgym:desktop:diagnose-file', protect(async (_event, payload = {}) => {
    const { root, relative } = projectEntry(payload.root, payload.path);
    const content = typeof payload.content === 'string' ? payload.content : '';
    if (Buffer.byteLength(content, 'utf8') > MAX_TEXT_FILE_SIZE) throw new Error('The file is larger than 2 MB');
    return diagnoseFile({ root, path: relative, content });
  }));
  ipcMain.handle('webdevgym:desktop:create-file', protect(async (_event, payload = {}) => {
    const { target, relative } = projectEntry(payload.root, payload.path);
    const parent = path.dirname(target);
    const parentStats = await fsp.stat(parent);
    if (!parentStats.isDirectory()) throw new Error('Parent folder is unavailable');
    const handle = await fsp.open(target, 'wx');
    await handle.close();
    return { path: relative, type: 'file' };
  }));
  ipcMain.handle('webdevgym:desktop:create-directory', protect(async (_event, payload = {}) => {
    const { target, relative } = projectEntry(payload.root, payload.path);
    await fsp.mkdir(target);
    return { path: relative, type: 'directory' };
  }));
  ipcMain.handle('webdevgym:desktop:rename-entry', protect(async (_event, payload = {}) => {
    const source = projectEntry(payload.root, payload.from);
    const destination = projectEntry(payload.root, payload.to);
    if (source.root !== destination.root) throw new Error('Project folders do not match');
    await fsp.rename(source.target, destination.target);
    return { from: source.relative, to: destination.relative };
  }));
  ipcMain.handle('webdevgym:desktop:delete-entry', protect(async (_event, payload = {}) => {
    const { target, relative } = projectEntry(payload.root, payload.path);
    const stats = await fsp.stat(target);
    await fsp.rm(target, { recursive: stats.isDirectory(), force: false });
    return { path: relative, type: stats.isDirectory() ? 'directory' : 'file' };
  }));
  ipcMain.handle('webdevgym:desktop:reveal-file', protect(async (_event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const target = resolveInside(root, payload.path || '.');
    assertNoSymlink(root, target);
    shell.showItemInFolder(target);
    return true;
  }));

  ipcMain.handle('webdevgym:desktop:start-process', protect(async (event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const command = String(payload.command || '').trim();
    if (!command || command.length > 500 || command.includes('\0')) throw new Error('Enter a valid command');
    return launchProcess(event, root, command, [], command, true);
  }));
  ipcMain.handle('webdevgym:desktop:stop-process', protect(async (_event, idValue) => {
    const id = String(idValue || '');
    const running = processes.get(id);
    if (!running) return false;
    if (process.platform === 'win32' && running.child.pid) {
      spawn('taskkill', ['/pid', String(running.child.pid), '/t', '/f'], { windowsHide: true });
    } else {
      running.child.kill('SIGTERM');
    }
    processes.delete(id);
    return true;
  }));

  ipcMain.handle('webdevgym:desktop:git-status', protect(async (_event, rootValue) => {
    return runExecutable('git', ['status', '--short', '--branch'], assertKnownRoot(rootValue));
  }));
  ipcMain.handle('webdevgym:desktop:git-changes', protect(async (_event, rootValue) => {
    return gitChanges(rootValue);
  }));
  ipcMain.handle('webdevgym:desktop:git-diff', protect(async (_event, payload = {}) => {
    const { root, relative } = gitEntry(payload.root, payload.path);
    const changes = await gitChanges(root);
    const file = changes.files.find(item => item.path === relative);
    if (!file) return { path: relative, staged: '', unstaged: '' };

    let staged = '';
    let unstaged = '';
    if (file.staged) {
      const result = await runExecutable('git', ['diff', '--cached', '--no-ext-diff', '--unified=3', '--', relative], root);
      staged = `${result.stdout || ''}${result.stderr || ''}`;
    }
    if (file.index === '?' && file.worktree === '?') {
      const result = await runExecutable('git', ['diff', '--no-index', '--no-ext-diff', '--unified=3', '--', '/dev/null', relative], root);
      if (![0, 1].includes(result.code)) throw new Error(result.stderr.trim() || 'Git diff failed');
      unstaged = `${result.stdout || ''}${result.stderr || ''}`;
    } else if (file.unstaged) {
      const result = await runExecutable('git', ['diff', '--no-ext-diff', '--unified=3', '--', relative], root);
      if (result.code !== 0) throw new Error(result.stderr.trim() || 'Git diff failed');
      unstaged = `${result.stdout || ''}${result.stderr || ''}`;
    }
    return { path: relative, staged, unstaged };
  }));
  ipcMain.handle('webdevgym:desktop:git-stage', protect(async (_event, payload = {}) => {
    const { root, relative } = gitEntry(payload.root, payload.path);
    return runExecutable('git', ['add', '--', relative], root);
  }));
  ipcMain.handle('webdevgym:desktop:git-unstage', protect(async (_event, payload = {}) => {
    const { root, relative } = gitEntry(payload.root, payload.path);
    const restored = await runExecutable('git', ['restore', '--staged', '--', relative], root);
    if (restored.code === 0) return restored;
    return runExecutable('git', ['rm', '--cached', '--ignore-unmatch', '--', relative], root);
  }));
  ipcMain.handle('webdevgym:desktop:git-history', protect(async (_event, rootValue) => {
    return runExecutable('git', ['log', '--oneline', '--decorate', '-20'], assertKnownRoot(rootValue));
  }));
  ipcMain.handle('webdevgym:desktop:git-commit', protect(async (_event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const message = String(payload.message || '').trim();
    if (!message || message.length > 120 || /[\r\n\0]/.test(message)) throw new Error('Enter a commit message up to 120 characters');
    return runExecutable('git', ['commit', '-m', message], root);
  }));
  ipcMain.handle('webdevgym:desktop:git-push', protect(async (_event, rootValue) => {
    return runExecutable('git', ['push'], assertKnownRoot(rootValue));
  }));

  ipcMain.handle('webdevgym:desktop:create-backup', protect(async (_event, rootValue) => {
    const root = assertKnownRoot(rootValue);
    const projectKey = crypto.createHash('sha1').update(root).digest('hex').slice(0, 16);
    const id = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
    const directory = path.join(backupsRoot, projectKey, id);
    await fsp.mkdir(directory, { recursive: true });
    const target = path.join(directory, 'project');
    await fsp.cp(root, target, {
      recursive: true,
      force: true,
      filter: source => !IGNORED_DIRECTORIES.has(path.basename(source).toLowerCase())
    });
    const metadata = { id, root, name: path.basename(root), createdAt: new Date().toISOString() };
    await writeJson(path.join(directory, 'meta.json'), metadata);
    const projectBackupRoot = path.join(backupsRoot, projectKey);
    const snapshots = (await fsp.readdir(projectBackupRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory()).map(entry => entry.name).sort().reverse();
    for (const staleId of snapshots.slice(10)) {
      await fsp.rm(path.join(projectBackupRoot, staleId), { recursive: true, force: true });
    }
    return metadata;
  }));
  ipcMain.handle('webdevgym:desktop:list-backups', protect(async (_event, rootValue) => {
    const root = assertKnownRoot(rootValue);
    const projectKey = crypto.createHash('sha1').update(root).digest('hex').slice(0, 16);
    const directory = path.join(backupsRoot, projectKey);
    let entries = [];
    try {
      entries = await fsp.readdir(directory, { withFileTypes: true });
    } catch {
      return [];
    }
    const snapshots = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const metadata = await readJson(path.join(directory, entry.name, 'meta.json'), null);
      if (metadata) snapshots.push(metadata);
    }
    return snapshots.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }));
  ipcMain.handle('webdevgym:desktop:restore-backup', protect(async (_event, payload = {}) => {
    const root = assertKnownRoot(payload.root);
    const projectKey = crypto.createHash('sha1').update(root).digest('hex').slice(0, 16);
    const id = path.basename(String(payload.id || ''));
    if (!/^\d{4}-\d{2}-\d{2}T[\d\-]+Z$/.test(id)) throw new Error('Invalid backup identifier');
    const directory = path.join(backupsRoot, projectKey, id, 'project');
    if (!id || !fs.existsSync(directory)) throw new Error('Backup not found');
    await fsp.cp(directory, root, { recursive: true, force: true });
    return true;
  }));

  ipcMain.handle('webdevgym:desktop:start-preview', protect(async (_event, rootValue) => {
    const root = assertKnownRoot(rootValue);
    const existing = [...previewServers.values()].find(item => item.root === root);
    if (existing) return { id: existing.id, url: existing.url };
    const id = crypto.randomUUID();
    const server = http.createServer(async (request, response) => {
      try {
        const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
        const relative = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '') || 'index.html';
        let target = resolveInside(root, relative);
        assertNoSymlink(root, target);
        if ((await fsp.stat(target)).isDirectory()) target = path.join(target, 'index.html');
        const stats = await fsp.stat(target);
        if (!stats.isFile()) throw new Error('Not a file');
        const headers = {
          'cache-control': 'no-store',
          'content-type': MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
          'accept-ranges': 'bytes'
        };
        const rangeMatch = String(request.headers.range || '').match(/^bytes=(\d*)-(\d*)$/i);
        if (rangeMatch) {
          const requestedStart = rangeMatch[1] === '' ? null : Number(rangeMatch[1]);
          const requestedEnd = rangeMatch[2] === '' ? null : Number(rangeMatch[2]);
          const start = requestedStart === null
            ? Math.max(0, stats.size - (requestedEnd || 0))
            : requestedStart;
          const end = requestedStart === null
            ? stats.size - 1
            : Math.min(requestedEnd ?? stats.size - 1, stats.size - 1);
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= stats.size) {
            response.writeHead(416, { ...headers, 'content-range': `bytes */${stats.size}` });
            response.end();
            return;
          }
          response.writeHead(206, {
            ...headers,
            'content-length': end - start + 1,
            'content-range': `bytes ${start}-${end}/${stats.size}`
          });
          if (request.method === 'HEAD') response.end();
          else fs.createReadStream(target, { start, end }).pipe(response);
          return;
        }
        response.writeHead(200, { ...headers, 'content-length': stats.size });
        if (request.method === 'HEAD') response.end();
        else fs.createReadStream(target).pipe(response);
      } catch {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
      }
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/`;
    previewServers.set(id, { id, root, server, url });
    return { id, url };
  }));
  ipcMain.handle('webdevgym:desktop:stop-preview', protect(async (_event, idValue) => {
    const id = String(idValue || '');
    const item = previewServers.get(id);
    if (!item) return false;
    await new Promise(resolve => item.server.close(resolve));
    previewServers.delete(id);
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:open-external', protect(async (_event, urlValue) => {
    const url = String(urlValue || '');
    if (!/^https?:\/\//i.test(url)) throw new Error('Only HTTP links can be opened');
    await shell.openExternal(url);
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:notify', protect(async (_event, payload = {}) => {
    if (!Notification.isSupported()) return false;
    const title = String(payload.title || 'WebDevGym').slice(0, 80);
    const body = String(payload.body || '').slice(0, 240);
    new Notification({ title, body, silent: false }).show();
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:check-update', protect(async () => {
    const current = app.getVersion();
    const release = await fetchLatestRelease();
    const latest = String(release.tag_name || '').replace(/^v/i, '');
    const asset = findSetupAsset(release, latest);
    return {
      current,
      latest,
      hasUpdate: compareVersions(latest, current) > 0,
      canDownload: Boolean(asset),
      url: release.html_url || 'https://github.com/kernix01/WebDevGym-Desktop/releases'
    };
  }));
  ipcMain.handle('webdevgym:desktop:download-update', protect(async event => {
    if (!updateDownloadPromise) {
      updateDownloadPromise = downloadLatestUpdate(event).finally(() => {
        updateDownloadPromise = null;
      });
    }
    return updateDownloadPromise;
  }));
  ipcMain.handle('webdevgym:desktop:install-update', protect(async (_event, filePathValue) => {
    const installerPath = path.resolve(String(filePathValue || ''));
    if (path.dirname(installerPath) !== path.resolve(updatesRoot) || path.extname(installerPath).toLowerCase() !== '.exe') {
      throw new Error('Invalid update installer path');
    }
    const stats = await fsp.stat(installerPath);
    if (!stats.isFile()) throw new Error('The update installer is unavailable');
    const openError = await shell.openPath(installerPath);
    if (openError) throw new Error(openError);
    const quitTimer = setTimeout(() => app.quit(), 700);
    quitTimer.unref?.();
    return true;
  }));

  return {
    async authorizeProject(rootValue) {
      await ready;
      const root = normalizeRoot(rootValue);
      if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new Error('Project folder is unavailable');
      }
      await rememberProject(root);
      return projectSummary(root);
    },
    async checkForUpdate() {
      await ready;
      const current = app.getVersion();
      try {
        const release = await fetchLatestRelease();
        const latest = String(release.tag_name || '').replace(/^v/i, '');
        if (compareVersions(latest, current) <= 0) return null;
        return { current, latest, canDownload: Boolean(findSetupAsset(release, latest)), url: release.html_url };
      } catch {
        return null;
      }
    },
    dispose() {
      for (const running of processes.values()) running.child.kill();
      processes.clear();
      for (const preview of previewServers.values()) preview.server.close();
      previewServers.clear();
      for (const senderId of [...projectWatchers.keys()]) stopProjectWatcher(senderId);
    }
  };
}

module.exports = {
  compareVersions,
  createDesktopServices,
  detectPackageManager,
  packageNameFromSpec,
  packageOperationCommand,
  parseGitStatus,
  projectPackages,
  resolveInside
};
