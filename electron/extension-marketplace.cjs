const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { extractVsixPackage, readVsixContributions } = require('./vsix-extensions.cjs');

const REGISTRY_ORIGIN = 'https://open-vsx.org';
const DOWNLOAD_HOSTS = new Set(['open-vsx.org', 'openvsx.eclipsecontent.org']);
const MAX_VSIX_SIZE = 50 * 1024 * 1024;
const MAX_SEARCH_BYTES = 3 * 1024 * 1024;

function extensionSegment(value) {
  return typeof value === 'string' && /^[a-z0-9_][a-z0-9_.+-]{0,79}$/i.test(value);
}

function extensionLocation(root, id) {
  if (typeof id !== 'string') throw new Error('Invalid extension identity');
  const parts = id.split('.');
  if (parts.length !== 2 || parts.some(part => !extensionSegment(part))) throw new Error('Invalid extension identity');
  const location = path.resolve(root, id.toLowerCase());
  if (!location.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error('Invalid extension path');
  return location;
}

function trustedUrl(value, allowedHosts = new Set(['open-vsx.org'])) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Open VSX returned an invalid download URL'); }
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname) || url.username || url.password) {
    throw new Error('Open VSX returned an untrusted URL');
  }
  return url;
}

async function responseBuffer(response, maxSize) {
  if (!response.ok) throw new Error(`Open VSX returned ${response.status}`);
  const length = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(length) && length > maxSize) throw new Error('Extension package exceeds the 50 MB limit');
  if (!response.body?.getReader) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxSize) throw new Error('Open VSX response exceeds the size limit');
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxSize) {
        await reader.cancel();
        throw new Error('Open VSX response exceeds the size limit');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock?.();
  }
  return Buffer.concat(chunks, size);
}

async function fetchTrustedFile(fetchImpl, value, maxSize) {
  let url = trustedUrl(value, DOWNLOAD_HOSTS);
  for (let redirects = 0; redirects <= 4; redirects += 1) {
    const response = await fetchImpl(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'WebDevGym-Desktop', accept: 'application/octet-stream, text/plain' },
      signal: AbortSignal.timeout(30000)
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || redirects === 4) throw new Error('Open VSX download redirected too many times');
      url = trustedUrl(new URL(location, url).href, DOWNLOAD_HOSTS);
      continue;
    }
    return responseBuffer(response, maxSize);
  }
  throw new Error('Open VSX download failed');
}

async function fetchRegistryJson(fetchImpl, url, maxSize = MAX_SEARCH_BYTES) {
  const trusted = trustedUrl(url.href, new Set(['open-vsx.org']));
  const response = await fetchImpl(trusted, {
    redirect: 'error',
    headers: { accept: 'application/json', 'user-agent': 'WebDevGym-Desktop' },
    signal: AbortSignal.timeout(30000)
  });
  const body = await responseBuffer(response, maxSize);
  try { return JSON.parse(body.toString('utf8')); }
  catch { throw new Error('Open VSX returned invalid JSON'); }
}

async function searchMarketplace(fetchImpl, query) {
  const text = String(query || '').trim().slice(0, 100);
  if (!text) throw new Error('Enter an extension name to search');
  const url = new URL('/api/-/search', REGISTRY_ORIGIN);
  url.searchParams.set('query', text);
  url.searchParams.set('size', '20');
  url.searchParams.set('offset', '0');
  const payload = await fetchRegistryJson(fetchImpl, url);
  return (Array.isArray(payload.extensions) ? payload.extensions : []).flatMap(item => {
    if (!item || !extensionSegment(item.namespace) || !extensionSegment(item.name) || typeof item.version !== 'string') return [];
    return [{
      id: `${item.namespace}.${item.name}`,
      namespace: item.namespace,
      name: item.name,
      version: item.version.slice(0, 40),
      displayName: String(item.displayName || item.name).slice(0, 120),
      description: String(item.description || '').slice(0, 320),
      downloadCount: Math.max(0, Number(item.downloadCount) || 0),
      verified: item.verified === true
    }];
  }).slice(0, 20);
}

async function ensureStore(root) {
  await fs.promises.mkdir(root, { recursive: true });
  const stat = await fs.promises.lstat(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Extension storage folder is not safe');
}

async function commitPackage(root, stagedFolder, extension, source) {
  if (!extensionSegment(extension.version) || !/^\d/.test(extension.version)) throw new Error('Extension version is invalid');
  const extensionFolder = extensionLocation(root, extension.id);
  const versionFolder = path.resolve(extensionFolder, extension.version);
  if (!versionFolder.startsWith(`${extensionFolder}${path.sep}`)) throw new Error('Invalid extension version path');

  await fs.promises.mkdir(extensionFolder, { recursive: true });
  const extensionFolderStat = await fs.promises.lstat(extensionFolder);
  if (!extensionFolderStat.isDirectory() || extensionFolderStat.isSymbolicLink()) throw new Error('Extension folder is not safe');
  let backupFolder = '';
  try {
    const versionStat = await fs.promises.lstat(versionFolder).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
    if (versionStat?.isSymbolicLink() || (versionStat && !versionStat.isDirectory())) throw new Error('Existing extension version folder is not safe');
    if (versionStat) {
      backupFolder = `${versionFolder}.previous-${crypto.randomUUID()}`;
      await fs.promises.rename(versionFolder, backupFolder);
    }
    await fs.promises.rename(stagedFolder, versionFolder);
    if (backupFolder) await fs.promises.rm(backupFolder, { recursive: true, force: true }).catch(() => {});
  } catch (error) {
    if (backupFolder && !fs.existsSync(versionFolder) && fs.existsSync(backupFolder)) {
      await fs.promises.rename(backupFolder, versionFolder).catch(() => {});
    }
    throw error;
  }
  return { ...extension, source };
}

async function savePackageBuffer(root, buffer, source, expected) {
  if (!Buffer.isBuffer(buffer) || buffer.length > MAX_VSIX_SIZE) throw new Error('Extension package exceeds the 50 MB limit');
  await ensureStore(root);
  const stagedFolder = await fs.promises.mkdtemp(path.join(root, '.install-'));
  try {
    const vsixPath = path.join(stagedFolder, '.extension.vsix');
    await fs.promises.writeFile(vsixPath, buffer, { flag: 'wx' });
    const extension = await readVsixContributions(vsixPath);
    if (expected && (extension.id.toLowerCase() !== expected.id.toLowerCase() || extension.version !== expected.version)) {
      throw new Error('Downloaded extension identity does not match Open VSX metadata');
    }
    await extractVsixPackage(vsixPath, stagedFolder);
    await fs.promises.rm(vsixPath, { force: true });
    await fs.promises.writeFile(path.join(stagedFolder, 'metadata.json'), JSON.stringify({
      id: extension.id,
      publisher: extension.publisher,
      name: extension.name,
      version: extension.version,
      displayName: extension.displayName,
      description: extension.description,
      source,
      installedAt: new Date().toISOString()
    }, null, 2), { flag: 'wx' });
    return await commitPackage(root, stagedFolder, extension, source);
  } finally {
    await fs.promises.rm(stagedFolder, { recursive: true, force: true }).catch(() => {});
  }
}

async function installVsixFile(root, filePath) {
  const extension = await readVsixContributions(filePath);
  const buffer = await fs.promises.readFile(filePath);
  return savePackageBuffer(root, buffer, 'vsix', { id: extension.id, version: extension.version });
}

async function installFromMarketplace(fetchImpl, root, request = {}) {
  const namespace = request.namespace;
  const name = request.name;
  const version = request.version;
  if (!extensionSegment(namespace) || !extensionSegment(name) || !extensionSegment(version) || !/^\d/.test(version)) {
    throw new Error('Invalid Open VSX extension selection');
  }
  const expectedId = `${namespace}.${name}`;
  const metadataUrl = new URL(`/api/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`, REGISTRY_ORIGIN);
  const metadata = await fetchRegistryJson(fetchImpl, metadataUrl, 1024 * 1024);
  if (`${metadata.namespace}.${metadata.name}`.toLowerCase() !== expectedId.toLowerCase() || metadata.version !== version) {
    throw new Error('Open VSX metadata does not match the selected extension');
  }
  const downloadUrl = metadata.files?.download;
  const checksumUrl = metadata.files?.sha256;
  if (!downloadUrl || !checksumUrl) throw new Error('Open VSX did not provide a package and checksum');
  const [archive, checksumBuffer] = await Promise.all([
    fetchTrustedFile(fetchImpl, downloadUrl, MAX_VSIX_SIZE),
    fetchTrustedFile(fetchImpl, checksumUrl, 256)
  ]);
  const expectedHash = checksumBuffer.toString('utf8').trim().split(/\s+/)[0].toLowerCase();
  if (!/^[a-f\d]{64}$/.test(expectedHash)) throw new Error('Open VSX returned an invalid SHA-256 checksum');
  const actualHash = crypto.createHash('sha256').update(archive).digest('hex');
  if (actualHash !== expectedHash) throw new Error('Extension package checksum verification failed');
  return savePackageBuffer(root, archive, 'open-vsx', { id: expectedId, version });
}

async function removeStoredExtension(root, id) {
  await ensureStore(root);
  const folder = extensionLocation(root, id);
  const stat = await fs.promises.lstat(folder).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
  if (!stat) return false;
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Extension folder is not safe');
  await fs.promises.rm(folder, { recursive: true, force: true });
  return true;
}

module.exports = { installFromMarketplace, installVsixFile, removeStoredExtension, searchMarketplace };
