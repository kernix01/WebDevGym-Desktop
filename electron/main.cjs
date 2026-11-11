const path = require('node:path');
const { pathToFileURL } = require('node:url');
const {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  net,
  Notification,
  protocol,
  safeStorage,
  session,
  shell,
  Tray
} = require('electron');
const {
  APP_SCHEME,
  bundledPageForUrl,
  isSafeExternalUrl,
  resolveAppRequest
} = require('./app-path.cjs');
const { createGithubTokenStore } = require('./github-token-store.cjs');
const { createDesktopServices } = require('./desktop-services.cjs');
const { createDeviceSyncService } = require('./device-sync.cjs');
const { openPathArgument, openRequestFromArguments, openRequestFromSecondInstance } = require('./launch-path.cjs');

const APP_ID = 'io.github.kernix01.webdevgym.desktop';
const WEB_ROOT = path.resolve(__dirname, '..', 'web');
const APP_URL = 'webdevgym://app/index.html';
const APP_ICON_PATH = path.resolve(__dirname, '..', 'build', 'icon.png');
const isDevelopment = process.argv.includes('--dev');
const isSmokeTest = process.argv.includes('--smoke');
const showSmokeWindow = isSmokeTest && process.env.WEBDEVGYM_SMOKE_SHOW === '1';

if (isSmokeTest && process.env.WEBDEVGYM_TEST_USER_DATA) {
  app.setPath('userData', path.resolve(process.env.WEBDEVGYM_TEST_USER_DATA));
}

protocol.registerSchemesAsPrivileged([{
  scheme: APP_SCHEME.slice(0, -1),
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: true,
    stream: true,
    codeCache: true
  }
}]);

app.setAppUserModelId(APP_ID);

let mainWindow = null;
let tray = null;
let desktopServices = null;
let deviceSyncService = null;
let isQuitting = false;
let pendingOpenRequest = openRequestFromArguments(process.argv);
let pendingAuthCallback = process.argv.find(argument => /^webdevgym:\/\/app\/auth\/callback(?:[?#]|$)/i.test(argument)) || '';

function bundledUrl(page) {
  return `webdevgym://app/${page}`;
}

function openOutsideApp(url) {
  if (isSafeExternalUrl(url)) void shell.openExternal(url);
}

function handleOutsideNavigation(window, url) {
  const bundledPage = bundledPageForUrl(url);
  if (bundledPage) {
    void window.loadURL(bundledUrl(bundledPage));
    return;
  }
  openOutsideApp(url);
}

function secureWindow(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    handleOutsideNavigation(window, url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('webdevgym://app/')) return;
    event.preventDefault();
    handleOutsideNavigation(window, url);
  });

  window.webContents.on('will-attach-webview', event => event.preventDefault());
  window.webContents.on('before-input-event', (event, input) => {
    const togglesDevTools = input.key === 'F12' ||
      (input.control && input.shift && input.key.toLowerCase() === 'i');
    if (!togglesDevTools) return;
    event.preventDefault();
    window.webContents.toggleDevTools();
  });
}

function showMainWindow() {
  if (!mainWindow) mainWindow = createWindow();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function hideMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
}

function dispatchPendingOpenRequest() {
  if (!pendingOpenRequest || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoadingMainFrame()) {
    return false;
  }
  const request = pendingOpenRequest;
  pendingOpenRequest = null;
  mainWindow.webContents.send('webdevgym:desktop:open-path', request);
  return true;
}

function dispatchPendingAuthCallback() {
  if (!pendingAuthCallback || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoadingMainFrame()) return false;
  const callbackUrl = pendingAuthCallback;
  pendingAuthCallback = '';
  mainWindow.webContents.send('webdevgym:auth:callback', callbackUrl);
  return true;
}

function handleAuthCallback(url) {
  if (!/^webdevgym:\/\/app\/auth\/callback(?:[?#]|$)/i.test(String(url || ''))) return false;
  pendingAuthCallback = String(url);
  showMainWindow();
  dispatchPendingAuthCallback();
  return true;
}

async function authorizePendingOpenRequest() {
  if (!pendingOpenRequest || !desktopServices) return false;
  try {
    await desktopServices.authorizeProject(pendingOpenRequest.root);
    return true;
  } catch (error) {
    console.warn('[desktop] Could not open the requested project:', error.message);
    pendingOpenRequest = null;
    return false;
  }
}

async function queueOpenRequest(request) {
  if (!request) return false;
  pendingOpenRequest = request;
  if (!app.isReady()) return true;
  if (!await authorizePendingOpenRequest()) return false;
  showMainWindow();
  dispatchPendingOpenRequest();
  return true;
}

function createTray() {
  if (tray || isSmokeTest) return;
  const iconPath = path.resolve(__dirname, '..', 'build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });
  tray = new Tray(icon);
  tray.setToolTip('WebDevGym');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Открыть WebDevGym', click: showMainWindow },
    { label: 'Свернуть в трей', click: hideMainWindow },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));
  tray.on('click', showMainWindow);
  tray.on('double-click', showMainWindow);
}

function registerDesktopAppControls() {
  const trustedSender = event => (event.senderFrame?.url || event.sender.getURL()).startsWith('webdevgym://app/');
  const guard = callback => event => {
    if (!trustedSender(event)) throw new Error('Untrusted desktop request');
    return callback();
  };
  const guardWindow = callback => event => {
    if (!trustedSender(event)) throw new Error('Untrusted desktop request');
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (!senderWindow || senderWindow.isDestroyed()) return false;
    return callback(senderWindow);
  };
  ipcMain.handle('webdevgym:desktop:hide-to-tray', guard(() => {
    hideMainWindow();
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:quit', guard(() => {
    isQuitting = true;
    app.quit();
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:window-minimize', guardWindow(window => {
    window.minimize();
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:window-toggle-maximize', guardWindow(window => {
    if (window.isMaximized()) window.unmaximize();
    else window.maximize();
    return { maximized: window.isMaximized(), fullscreen: window.isFullScreen() };
  }));
  ipcMain.handle('webdevgym:desktop:window-close', guardWindow(window => {
    window.close();
    return true;
  }));
  ipcMain.handle('webdevgym:desktop:window-state', guardWindow(window => ({
    maximized: window.isMaximized(),
    fullscreen: window.isFullScreen()
  })));
  ipcMain.handle('webdevgym:desktop:app-info', guard(() => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    shortcut: 'Ctrl+Shift+G'
  })));
  ipcMain.handle('webdevgym:desktop:consume-open-request', guard(() => {
    const request = pendingOpenRequest;
    pendingOpenRequest = null;
    return request;
  }));
  ipcMain.handle('webdevgym:desktop:copy-text', (event, value) => {
    if (!trustedSender(event)) throw new Error('Untrusted desktop request');
    const text = String(value ?? '').slice(0, 10000);
    clipboard.writeText(text);
    return clipboard.readText() === text;
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#080b12',
    frame: false,
    icon: APP_ICON_PATH,
    title: 'WebDevGym',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
      spellcheck: false
    }
  });

  secureWindow(window);
  window.once('ready-to-show', () => {
    if (!isSmokeTest || showSmokeWindow) window.show();
  });
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null;
  });
  window.on('close', event => {
    if (isQuitting || isSmokeTest) return;
    event.preventDefault();
    window.hide();
  });
  const sendWindowState = () => {
    if (window.isDestroyed()) return;
    window.webContents.send('webdevgym:desktop:window-state-changed', {
      maximized: window.isMaximized(),
      fullscreen: window.isFullScreen()
    });
  };
  window.on('maximize', sendWindowState);
  window.on('unmaximize', sendWindowState);
  window.on('enter-full-screen', sendWindowState);
  window.on('leave-full-screen', sendWindowState);
  window.webContents.on('did-finish-load', () => {
    dispatchPendingOpenRequest();
    dispatchPendingAuthCallback();
  });
  void window.loadURL(APP_URL);

  if (isDevelopment) window.webContents.openDevTools({ mode: 'detach' });
  return window;
}

function registerLocalProtocol() {
  protocol.handle(APP_SCHEME.slice(0, -1), request => {
    const filePath = resolveAppRequest(WEB_ROOT, request.url);
    if (!filePath) {
      return new Response('Not found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }

    return net.fetch(pathToFileURL(filePath).toString(), {
      method: request.method,
      headers: request.headers
    });
  });
}

function registerGithubTokenStore() {
  const store = createGithubTokenStore({
    directory: path.join(app.getPath('userData'), 'secure-storage'),
    safeStorage
  });
  const trustedSender = event => (event.senderFrame?.url || event.sender.getURL()).startsWith('webdevgym://app/');

  ipcMain.handle('webdevgym:github-token:load', event => {
    if (!trustedSender(event)) throw new Error('Untrusted token request');
    return store.load();
  });
  ipcMain.handle('webdevgym:github-token:save', (event, token) => {
    if (!trustedSender(event)) throw new Error('Untrusted token request');
    store.save(token);
    return true;
  });
  ipcMain.handle('webdevgym:github-token:remove', event => {
    if (!trustedSender(event)) throw new Error('Untrusted token request');
    store.remove();
    return true;
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock({
  openPath: openPathArgument(process.argv)
});

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleAuthCallback(url);
  });

  app.on('second-instance', (_event, commandLine, _workingDirectory, additionalData = {}) => {
    const authCallback = commandLine.find(argument => /^webdevgym:\/\/app\/auth\/callback(?:[?#]|$)/i.test(argument));
    if (authCallback && handleAuthCallback(authCallback)) return;
    const request = openRequestFromSecondInstance(commandLine, additionalData);
    if (!request) {
      showMainWindow();
      return;
    }
    void queueOpenRequest(request).then(opened => {
      if (!opened) showMainWindow();
    });
  });

  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    registerLocalProtocol();
    app.setAsDefaultProtocolClient(APP_SCHEME.slice(0, -1));
    registerGithubTokenStore();
    registerDesktopAppControls();
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    try {
      await session.defaultSession.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });
    } catch (error) {
      console.warn('[desktop] Could not clear stale web caches:', error.message);
    }
    desktopServices = createDesktopServices({
      app,
      dialog,
      ipcMain,
      Notification,
      shell,
      getWindow: () => mainWindow
    });
    deviceSyncService = createDeviceSyncService({
      app,
      ipcMain,
      getWindow: () => mainWindow
    });
    await deviceSyncService.ready;
    await authorizePendingOpenRequest();
    mainWindow = createWindow();
    createTray();
    globalShortcut.register('CommandOrControl+Shift+G', showMainWindow);
    if (!isSmokeTest) {
      setTimeout(async () => {
        const update = await desktopServices?.checkForUpdate();
        if (!update || !Notification.isSupported()) return;
        new Notification({
          title: `WebDevGym ${update.latest} доступен`,
          body: 'Открой Desktop Center, чтобы перейти к новой версии.'
        }).show();
      }, 12000).unref();
    }

    app.on('activate', () => {
      showMainWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform === 'darwin' && isQuitting) app.quit();
  });

  app.on('before-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    desktopServices?.dispose();
    void deviceSyncService?.dispose();
  });
}
