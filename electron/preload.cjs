const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('webdevgymDesktop', Object.freeze({
  isDesktop: true,
  platform: process.platform,
  versions: Object.freeze({
    electron: process.versions.electron,
    chrome: process.versions.chrome
  })
}));

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.desktop = 'electron';
});
