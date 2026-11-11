const { contextBridge, ipcRenderer } = require('electron');

const githubToken = Object.freeze({
  load: () => ipcRenderer.invoke('webdevgym:github-token:load'),
  remove: () => ipcRenderer.invoke('webdevgym:github-token:remove'),
  save: token => ipcRenderer.invoke('webdevgym:github-token:save', token)
});

const desktop = Object.freeze({
  appInfo: () => ipcRenderer.invoke('webdevgym:desktop:app-info'),
  checkUpdate: () => ipcRenderer.invoke('webdevgym:desktop:check-update'),
  downloadUpdate: () => ipcRenderer.invoke('webdevgym:desktop:download-update'),
  installUpdate: filePath => ipcRenderer.invoke('webdevgym:desktop:install-update', filePath),
  installVsix: () => ipcRenderer.invoke('webdevgym:desktop:install-vsix'),
  searchExtensions: query => ipcRenderer.invoke('webdevgym:desktop:search-extensions', query),
  installMarketplaceExtension: extension => ipcRenderer.invoke('webdevgym:desktop:install-marketplace-extension', extension),
  removeExtension: id => ipcRenderer.invoke('webdevgym:desktop:remove-extension', id),
  consumeOpenRequest: () => ipcRenderer.invoke('webdevgym:desktop:consume-open-request'),
  copyText: value => ipcRenderer.invoke('webdevgym:desktop:copy-text', value),
  chooseChatFiles: () => ipcRenderer.invoke('webdevgym:desktop:choose-chat-files'),
  chooseProject: () => ipcRenderer.invoke('webdevgym:desktop:choose-project'),
  createDirectory: (root, entryPath) => ipcRenderer.invoke('webdevgym:desktop:create-directory', { root, path: entryPath }),
  createFile: (root, entryPath) => ipcRenderer.invoke('webdevgym:desktop:create-file', { root, path: entryPath }),
  createBackup: root => ipcRenderer.invoke('webdevgym:desktop:create-backup', root),
  deleteEntry: (root, entryPath) => ipcRenderer.invoke('webdevgym:desktop:delete-entry', { root, path: entryPath }),
  diagnoseFile: (root, filePath, content) => ipcRenderer.invoke('webdevgym:desktop:diagnose-file', {
    root,
    path: filePath,
    content
  }),
  forgetProject: root => ipcRenderer.invoke('webdevgym:desktop:forget-project', root),
  gitCommit: (root, message) => ipcRenderer.invoke('webdevgym:desktop:git-commit', { root, message }),
  gitChanges: root => ipcRenderer.invoke('webdevgym:desktop:git-changes', root),
  gitDiff: (root, filePath) => ipcRenderer.invoke('webdevgym:desktop:git-diff', { root, path: filePath }),
  gitHistory: root => ipcRenderer.invoke('webdevgym:desktop:git-history', root),
  gitPush: root => ipcRenderer.invoke('webdevgym:desktop:git-push', root),
  gitStage: (root, filePath) => ipcRenderer.invoke('webdevgym:desktop:git-stage', { root, path: filePath }),
  gitStatus: root => ipcRenderer.invoke('webdevgym:desktop:git-status', root),
  gitUnstage: (root, filePath) => ipcRenderer.invoke('webdevgym:desktop:git-unstage', { root, path: filePath }),
  hideToTray: () => ipcRenderer.invoke('webdevgym:desktop:hide-to-tray'),
  listBackups: root => ipcRenderer.invoke('webdevgym:desktop:list-backups', root),
  notify: (title, body) => ipcRenderer.invoke('webdevgym:desktop:notify', { title, body }),
  packages: root => ipcRenderer.invoke('webdevgym:desktop:packages', root),
  packageUpdates: root => ipcRenderer.invoke('webdevgym:desktop:package-updates', root),
  packageMutate: (root, action, name, development = false) => ipcRenderer.invoke('webdevgym:desktop:package-mutate', {
    root,
    action,
    name,
    development
  }),
  onProcessOutput: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:desktop:process-output', listener);
    return () => ipcRenderer.removeListener('webdevgym:desktop:process-output', listener);
  },
  onUpdateProgress: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:desktop:update-progress', listener);
    return () => ipcRenderer.removeListener('webdevgym:desktop:update-progress', listener);
  },
  onOpenRequest: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:desktop:open-path', listener);
    return () => ipcRenderer.removeListener('webdevgym:desktop:open-path', listener);
  },
  onProjectChanged: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:desktop:project-changed', listener);
    return () => ipcRenderer.removeListener('webdevgym:desktop:project-changed', listener);
  },
  onProjectWatchError: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:desktop:project-watch-error', listener);
    return () => ipcRenderer.removeListener('webdevgym:desktop:project-watch-error', listener);
  },
  syncInfo: () => ipcRenderer.invoke('webdevgym:sync:info'),
  syncExchange: (clientId, entries) => ipcRenderer.invoke('webdevgym:sync:exchange', { clientId, entries }),
  syncRegenerateCode: () => ipcRenderer.invoke('webdevgym:sync:regenerate-code'),
  syncDisconnectAll: () => ipcRenderer.invoke('webdevgym:sync:disconnect-all'),
  onSyncChanged: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:sync:changed', listener);
    return () => ipcRenderer.removeListener('webdevgym:sync:changed', listener);
  },
  openExternal: url => ipcRenderer.invoke('webdevgym:desktop:open-external', url),
  openProject: root => ipcRenderer.invoke('webdevgym:desktop:open-project', root),
  quit: () => ipcRenderer.invoke('webdevgym:desktop:quit'),
  windowClose: () => ipcRenderer.invoke('webdevgym:desktop:window-close'),
  windowMinimize: () => ipcRenderer.invoke('webdevgym:desktop:window-minimize'),
  windowState: () => ipcRenderer.invoke('webdevgym:desktop:window-state'),
  windowToggleMaximize: () => ipcRenderer.invoke('webdevgym:desktop:window-toggle-maximize'),
  onWindowStateChange: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('webdevgym:desktop:window-state-changed', listener);
    return () => ipcRenderer.removeListener('webdevgym:desktop:window-state-changed', listener);
  },
  readFile: (root, filePath) => ipcRenderer.invoke('webdevgym:desktop:read-file', { root, path: filePath }),
  recentProjects: () => ipcRenderer.invoke('webdevgym:desktop:recent'),
  refreshProject: root => ipcRenderer.invoke('webdevgym:desktop:refresh-project', root),
  renameEntry: (root, from, to) => ipcRenderer.invoke('webdevgym:desktop:rename-entry', { root, from, to }),
  restoreBackup: (root, id) => ipcRenderer.invoke('webdevgym:desktop:restore-backup', { root, id }),
  revealFile: (root, filePath) => ipcRenderer.invoke('webdevgym:desktop:reveal-file', { root, path: filePath }),
  searchProject: (root, query, caseSensitive = false) => ipcRenderer.invoke('webdevgym:desktop:search-project', {
    root,
    query,
    caseSensitive
  }),
  startPreview: root => ipcRenderer.invoke('webdevgym:desktop:start-preview', root),
  startProcess: (root, command) => ipcRenderer.invoke('webdevgym:desktop:start-process', { root, command }),
  stopPreview: id => ipcRenderer.invoke('webdevgym:desktop:stop-preview', id),
  stopProcess: id => ipcRenderer.invoke('webdevgym:desktop:stop-process', id),
  unwatchProject: () => ipcRenderer.invoke('webdevgym:desktop:unwatch-project'),
  watchProject: root => ipcRenderer.invoke('webdevgym:desktop:watch-project', root),
  writeFile: (root, filePath, content) => ipcRenderer.invoke('webdevgym:desktop:write-file', {
    root,
    path: filePath,
    content
  })
});

contextBridge.exposeInMainWorld('webdevgymDesktop', Object.freeze({
  desktop,
  isDesktop: true,
  platform: process.platform,
  githubToken,
  versions: Object.freeze({
    electron: process.versions.electron,
    chrome: process.versions.chrome
  })
}));

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.desktop = 'electron';
});
