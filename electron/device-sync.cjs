const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { WebSocket, WebSocketServer } = require('ws');

const DEFAULT_PORT = 47831;
const MAX_PORT_ATTEMPTS = 1;
const MAX_REQUEST_BYTES = 5 * 1024 * 1024;
const MAX_VALUE_BYTES = 1024 * 1024;
const PAIR_CODE_LIFETIME = 10 * 60 * 1000;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === 'https://kernix01.github.io') return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);
  } catch {
    return false;
  }
}

function isSafeSyncKey(value) {
  const key = String(value || '');
  if (!key || key.length > 200 || /[\r\n\0]/.test(key)) return false;
  const lower = key.toLowerCase();
  const blocked = [
    'token', 'secret', 'password', 'credential', 'api_key', 'apikey',
    'github', 'gh-', 'ai_custom_models', 'ai_active_custom_model',
    'ai_chat_history', 'ai_threads', 'ai_active_thread', 'custombg',
    'wdga_projects', 'device_sync', 'iconify', 'wdgr_ai_window',
    'wdgu_timer_window'
  ];
  return !blocked.some(part => lower.includes(part));
}

function normalizeEntry(entry, source) {
  if (!entry || !isSafeSyncKey(entry.key)) return null;
  const deleted = Boolean(entry.deleted);
  const value = deleted ? null : String(entry.value ?? '');
  if (!deleted && Buffer.byteLength(value, 'utf8') > MAX_VALUE_BYTES) return null;
  const updatedAt = Number(entry.updatedAt);
  return {
    key: String(entry.key),
    value,
    deleted,
    updatedAt: Number.isFinite(updatedAt) && updatedAt >= 0 ? Math.floor(updatedAt) : 0,
    source: String(source || '').slice(0, 100)
  };
}

function mergeEntries(store, incoming, source) {
  let changed = false;
  for (const candidate of Array.isArray(incoming) ? incoming : []) {
    const entry = normalizeEntry(candidate, source);
    if (!entry) continue;
    const current = store.get(entry.key);
    const shouldReplace = !current || entry.updatedAt > current.updatedAt;
    if (!shouldReplace) continue;
    store.set(entry.key, entry);
    changed = true;
  }
  return changed;
}

function publicEntries(store) {
  return [...store.values()].map(({ key, value, deleted, updatedAt }) => ({
    key,
    value,
    deleted,
    updatedAt
  }));
}

function jsonResponse(response, status, body, origin) {
  const payload = JSON.stringify(body);
  const headers = {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'access-control-allow-private-network': 'true',
    vary: 'Origin'
  };
  if (origin && isAllowedOrigin(origin)) headers['access-control-allow-origin'] = origin;
  response.writeHead(status, headers);
  response.end(payload);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_REQUEST_BYTES) {
        reject(Object.assign(new Error('Request is too large'), { statusCode: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { statusCode: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function createDeviceSyncService({ app, ipcMain, getWindow, port = null }) {
  const stateFile = path.join(app.getPath('userData'), 'device-sync-state.json');
  const entries = new Map();
  const clients = new Map();
  const sockets = new Map();
  const socketServer = new WebSocketServer({ noServer: true, maxPayload: MAX_REQUEST_BYTES });
  let revision = 0;
  let pairCode = '';
  let pairCodeExpiresAt = 0;
  let actualPort = 0;
  let disposed = false;
  let writeQueue = Promise.resolve();
  const failedPairs = [];

  function renewPairCode() {
    pairCode = String(crypto.randomInt(100000, 1000000));
    pairCodeExpiresAt = Date.now() + PAIR_CODE_LIFETIME;
    return pairCode;
  }

  function ensurePairCode() {
    if (!pairCode || Date.now() >= pairCodeExpiresAt) renewPairCode();
  }

  async function loadState() {
    try {
      const saved = JSON.parse(await fsp.readFile(stateFile, 'utf8'));
      revision = Number(saved.revision) || 0;
      for (const entry of Array.isArray(saved.entries) ? saved.entries : []) {
        const normalized = normalizeEntry(entry, 'persisted');
        if (normalized) entries.set(normalized.key, normalized);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') console.warn('[sync] Could not restore state:', error.message);
    }
  }

  function persistState() {
    const payload = JSON.stringify({ revision, entries: publicEntries(entries) });
    writeQueue = writeQueue.then(async () => {
      await fsp.mkdir(path.dirname(stateFile), { recursive: true });
      const temporary = `${stateFile}.tmp`;
      await fsp.writeFile(temporary, payload, 'utf8');
      await fsp.rename(temporary, stateFile);
    }).catch(error => console.warn('[sync] Could not save state:', error.message));
    return writeQueue;
  }

  function notifyRenderer(source) {
    const window = getWindow?.();
    if (!window || window.isDestroyed()) return;
    window.webContents.send('webdevgym:sync:changed', { revision, source });
  }

  function notifyWebClients(source) {
    const message = JSON.stringify({ type: 'sync-changed', revision, source });
    for (const [socket, client] of sockets) {
      if (socket.readyState !== WebSocket.OPEN || client.clientId === source) continue;
      socket.send(message);
    }
  }

  function sendSocketMessage(socket, payload) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
  }

  function handleSocketMessage(socket, client, raw) {
    let message;
    try {
      message = JSON.parse(String(raw || '{}'));
    } catch {
      sendSocketMessage(socket, { type: 'sync-error', requestId: '', error: 'Invalid JSON' });
      return;
    }
    if (message.type !== 'sync') return;
    const requestId = String(message.requestId || '').slice(0, 200);
    if (!requestId) {
      sendSocketMessage(socket, { type: 'sync-error', requestId: '', error: 'Request id is required' });
      return;
    }
    try {
      client.lastSeenAt = Date.now();
      sendSocketMessage(socket, { type: 'sync-result', requestId, ...exchange(client.clientId, message.entries) });
    } catch (error) {
      sendSocketMessage(socket, { type: 'sync-error', requestId, error: error.message || 'Sync failed' });
    }
  }

  function exchange(clientIdValue, incoming) {
    const clientId = String(clientIdValue || 'desktop').slice(0, 100);
    const changed = mergeEntries(entries, incoming, clientId);
    if (changed) {
      revision += 1;
      void persistState();
      notifyRenderer(clientId);
      notifyWebClients(clientId);
    }
    return { revision, entries: publicEntries(entries), changed };
  }

  function info() {
    ensurePairCode();
    return {
      available: Boolean(actualPort),
      port: actualPort,
      code: pairCode,
      codeExpiresAt: pairCodeExpiresAt,
      connectedClients: clients.size,
      revision
    };
  }

  function corsPreflight(request, response, origin) {
    if (!isAllowedOrigin(origin)) {
      jsonResponse(response, 403, { error: 'Origin is not allowed' }, '');
      return;
    }
    const headers = {
      'access-control-allow-origin': origin || '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
      'access-control-allow-private-network': 'true',
      'access-control-max-age': '600',
      vary: 'Origin'
    };
    response.writeHead(204, headers);
    response.end();
  }

  function authorizedClient(request) {
    const match = String(request.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
    if (!match) return null;
    const client = clients.get(match[1]);
    if (client) client.lastSeenAt = Date.now();
    return client || null;
  }

  async function handleRequest(request, response) {
    const origin = String(request.headers.origin || '');
    if (request.method === 'OPTIONS') {
      corsPreflight(request, response, origin);
      return;
    }
    if (!isAllowedOrigin(origin)) {
      jsonResponse(response, 403, { error: 'Origin is not allowed' }, '');
      return;
    }

    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    if (request.method === 'GET' && requestUrl.pathname === '/health') {
      jsonResponse(response, 200, {
        app: 'WebDevGym',
        version: app.getVersion(),
        port: actualPort,
        revision
      }, origin);
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/pair') {
      const now = Date.now();
      while (failedPairs.length && failedPairs[0] < now - 60000) failedPairs.shift();
      if (failedPairs.length >= 10) {
        jsonResponse(response, 429, { error: 'Too many pairing attempts' }, origin);
        return;
      }
      const body = await readJsonBody(request);
      ensurePairCode();
      if (String(body.code || '') !== pairCode) {
        failedPairs.push(now);
        jsonResponse(response, 401, { error: 'Incorrect pairing code' }, origin);
        return;
      }
      const token = crypto.randomBytes(32).toString('base64url');
      const clientId = String(body.clientId || crypto.randomUUID()).slice(0, 100);
      clients.set(token, { clientId, pairedAt: now, lastSeenAt: now });
      jsonResponse(response, 200, { token, clientId, ...exchange(clientId, body.entries) }, origin);
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/sync') {
      const client = authorizedClient(request);
      if (!client) {
        jsonResponse(response, 401, { error: 'Pairing is required' }, origin);
        return;
      }
      const body = await readJsonBody(request);
      jsonResponse(response, 200, exchange(client.clientId, body.entries), origin);
      return;
    }

    jsonResponse(response, 404, { error: 'Not found' }, origin);
  }

  const server = http.createServer((request, response) => {
    void handleRequest(request, response).catch(error => {
      if (!response.headersSent) {
        jsonResponse(response, error.statusCode || 500, { error: error.message || 'Sync failed' }, String(request.headers.origin || ''));
      } else {
        response.end();
      }
    });
  });

  server.on('upgrade', (request, socket, head) => {
    const origin = String(request.headers.origin || '');
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const token = requestUrl.searchParams.get('token') || '';
    const client = clients.get(token);
    if (requestUrl.pathname !== '/events' || !isAllowedOrigin(origin) || !client) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    socketServer.handleUpgrade(request, socket, head, webSocket => {
      client.lastSeenAt = Date.now();
      sockets.set(webSocket, client);
      webSocket.once('close', () => sockets.delete(webSocket));
      webSocket.on('message', raw => handleSocketMessage(webSocket, client, raw));
      webSocket.send(JSON.stringify({ type: 'ready', revision }));
    });
  });

  async function listen() {
    await loadState();
    renewPairCode();
    const configured = port ?? Number(process.env.WEBDEVGYM_SYNC_PORT || DEFAULT_PORT);
    const candidates = configured === 0
      ? [0]
      : Array.from({ length: MAX_PORT_ATTEMPTS }, (_, index) => configured + index);
    for (const candidate of candidates) {
      try {
        await new Promise((resolve, reject) => {
          const onError = error => {
            server.off('listening', onListening);
            reject(error);
          };
          const onListening = () => {
            server.off('error', onError);
            resolve();
          };
          server.once('error', onError);
          server.once('listening', onListening);
          server.listen(candidate, '127.0.0.1');
        });
        actualPort = server.address().port;
        return;
      } catch (error) {
        if (error.code !== 'EADDRINUSE' || candidate === candidates.at(-1)) throw error;
      }
    }
  }

  const ready = listen().catch(error => {
    console.warn('[sync] Local bridge is unavailable:', error.message);
  });

  const trustedSender = event => (event.senderFrame?.url || event.sender.getURL()).startsWith('webdevgym://app/');
  const protect = callback => async (event, ...args) => {
    if (!trustedSender(event)) throw new Error('Untrusted sync request');
    await ready;
    return callback(event, ...args);
  };

  ipcMain.handle('webdevgym:sync:info', protect(() => info()));
  ipcMain.handle('webdevgym:sync:exchange', protect((_event, payload = {}) => exchange(payload.clientId || 'desktop', payload.entries)));
  ipcMain.handle('webdevgym:sync:regenerate-code', protect(() => {
    renewPairCode();
    return info();
  }));
  ipcMain.handle('webdevgym:sync:disconnect-all', protect(() => {
    for (const socket of sockets.keys()) socket.close(4001, 'Disconnected');
    clients.clear();
    renewPairCode();
    return info();
  }));

  return {
    ready,
    exchange,
    info: async () => {
      await ready;
      return info();
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      for (const channel of [
        'webdevgym:sync:info',
        'webdevgym:sync:exchange',
        'webdevgym:sync:regenerate-code',
        'webdevgym:sync:disconnect-all'
      ]) ipcMain.removeHandler(channel);
      await writeQueue;
      for (const socket of sockets.keys()) socket.terminate();
      sockets.clear();
      socketServer.close();
      if (server.listening) await new Promise(resolve => server.close(resolve));
    }
  };
}

module.exports = {
  DEFAULT_PORT,
  createDeviceSyncService,
  isAllowedOrigin,
  isSafeSyncKey,
  mergeEntries
};
