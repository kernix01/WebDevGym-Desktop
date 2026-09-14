const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, Menu, net, protocol, session, shell } = require('electron');
const {
  APP_SCHEME,
  bundledPageForUrl,
  isSafeExternalUrl,
  resolveAppRequest
} = require('./app-path.cjs');

const APP_ID = 'io.github.kernix01.webdevgym.desktop';
const WEB_ROOT = path.resolve(__dirname, '..', 'web');
const APP_URL = 'webdevgym://app/index.html';
const isDevelopment = process.argv.includes('--dev');
const isSmokeTest = process.argv.includes('--smoke');

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

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#080b12',
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
    if (!isSmokeTest) window.show();
  });
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null;
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

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    registerLocalProtocol();
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    mainWindow = createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
