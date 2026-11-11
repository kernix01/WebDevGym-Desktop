const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { WebSocket } = require('ws');
const {
  createDeviceSyncService,
  isAllowedOrigin,
  isSafeSyncKey,
  mergeEntries
} = require('../electron/device-sync.cjs');

assert.equal(isAllowedOrigin('https://kernix01.github.io'), true);
assert.equal(isAllowedOrigin('http://127.0.0.1:4202'), true);
assert.equal(isAllowedOrigin('https://example.com'), false);
assert.equal(isSafeSyncKey('prog_html-basics'), true);
assert.equal(isSafeSyncKey('gh-token'), false);
assert.equal(isSafeSyncKey('ai_custom_models'), false);
assert.equal(isSafeSyncKey('wdgr_ai_threads_v1'), false);
assert.equal(isSafeSyncKey('iconify-count'), false);
assert.equal(isSafeSyncKey('wdgr_ai_window_v2'), false);
assert.equal(isSafeSyncKey('wdgu_timer_window_v1'), false);

const mergeStore = new Map();
assert.equal(mergeEntries(mergeStore, [{ key: 'theme', value: 'dark', updatedAt: 0 }], 'desktop'), true);
assert.equal(mergeEntries(mergeStore, [{ key: 'theme', value: 'light', updatedAt: 0 }], 'web'), false);
assert.equal(mergeEntries(mergeStore, [{ key: 'theme', value: 'light', updatedAt: 2 }], 'web'), true);
assert.equal(mergeStore.get('theme').value, 'light');

async function main() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'webdevgym-device-sync-'));
  const handlers = new Map();
  let onRendererChanged = null;
  const ipcMain = {
    handle(name, callback) { handlers.set(name, callback); },
    removeHandler(name) { handlers.delete(name); }
  };
  const app = {
    getPath(name) {
      assert.equal(name, 'userData');
      return directory;
    },
    getVersion() { return '0.14.0'; }
  };
  const window = {
    isDestroyed: () => false,
    webContents: {
      send(name, payload) {
        if (name === 'webdevgym:sync:changed') onRendererChanged?.(payload);
      }
    }
  };
  const service = createDeviceSyncService({ app, ipcMain, getWindow: () => window, port: 0 });

  try {
    await service.ready;
    const info = await service.info();
    assert.ok(info.port > 0);
    assert.match(info.code, /^\d{6}$/);

    const blocked = await fetch(`http://127.0.0.1:${info.port}/health`, {
      headers: { Origin: 'https://example.com' }
    });
    assert.equal(blocked.status, 403);

    const origin = 'https://kernix01.github.io';
    const health = await fetch(`http://127.0.0.1:${info.port}/health`, { headers: { Origin: origin } });
    assert.equal(health.status, 200);
    assert.equal((await health.json()).version, '0.14.0');

    const pair = await fetch(`http://127.0.0.1:${info.port}/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({
        code: info.code,
        clientId: 'web-test',
        entries: [
          { key: 'prog_test', value: '1', updatedAt: 0 },
          { key: 'gh-token', value: 'must-not-sync', updatedAt: 0 }
        ]
      })
    });
    assert.equal(pair.status, 200);
    const paired = await pair.json();
    assert.ok(paired.token);
    assert.equal(paired.entries.some(entry => entry.key === 'prog_test'), true);
    assert.equal(paired.entries.some(entry => entry.key === 'gh-token'), false);

    const listenerPairResponse = await fetch(`http://127.0.0.1:${info.port}/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ code: info.code, clientId: 'web-listener', entries: [] })
    });
    assert.equal(listenerPairResponse.status, 200);
    const listenerPair = await listenerPairResponse.json();
    const socket = new WebSocket(`ws://127.0.0.1:${info.port}/events?token=${encodeURIComponent(listenerPair.token)}`, {
      headers: { Origin: origin }
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket did not open')), 2000);
      socket.once('open', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.once('error', reject);
    });
    const syncChanged = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket sync event timed out')), 2000);
      socket.on('message', raw => {
        const message = JSON.parse(String(raw));
        if (message.type !== 'sync-changed') return;
        clearTimeout(timer);
        resolve(message);
      });
    });
    const senderSocket = new WebSocket(`ws://127.0.0.1:${info.port}/events?token=${encodeURIComponent(paired.token)}`, {
      headers: { Origin: origin }
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Sender WebSocket did not open')), 2000);
      senderSocket.once('open', () => {
        clearTimeout(timer);
        resolve();
      });
      senderSocket.once('error', reject);
    });
    const syncResult = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket sync response timed out')), 2000);
      senderSocket.on('message', raw => {
        const message = JSON.parse(String(raw));
        if (message.type !== 'sync-result' || message.requestId !== 'request-1') return;
        clearTimeout(timer);
        resolve(message);
      });
    });
    const sentAt = Date.now();
    const rendererChanged = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Desktop renderer notification timed out')), 1000);
      onRendererChanged = payload => {
        clearTimeout(timer);
        resolve(payload);
      };
    });
    senderSocket.send(JSON.stringify({
      type: 'sync',
      requestId: 'request-1',
      entries: [{ key: 'prog_test', value: null, deleted: true, updatedAt: Date.now() }]
    }));
    const synced = await syncResult;
    assert.equal(synced.entries.find(entry => entry.key === 'prog_test').deleted, true);
    const rendererMessage = await rendererChanged;
    assert.equal(rendererMessage.source, 'web-test');
    assert.ok(Date.now() - sentAt < 1000);
    const syncMessage = await syncChanged;
    assert.equal(syncMessage.source, 'web-test');
    assert.ok(syncMessage.revision >= 1);
    senderSocket.close();
    socket.close();
  } finally {
    await service.dispose();
    fs.rmSync(directory, { recursive: true, force: true });
  }

  console.log('Device sync tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
