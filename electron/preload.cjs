const { contextBridge, ipcRenderer } = require('electron');

const githubToken = Object.freeze({
  load: () => ipcRenderer.invoke('webdevgym:github-token:load'),
  remove: () => ipcRenderer.invoke('webdevgym:github-token:remove'),
  save: token => ipcRenderer.invoke('webdevgym:github-token:save', token)
});

contextBridge.exposeInMainWorld('webdevgymDesktop', Object.freeze({
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
