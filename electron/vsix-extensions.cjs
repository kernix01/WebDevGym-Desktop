const fs = require('node:fs');
const path = require('node:path');
const yauzl = require('yauzl');
const { parse: parseJsonc, printParseErrorCode } = require('jsonc-parser');

const MAX_ARCHIVE_SIZE = 50 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 20000;
const MAX_ASSET_SIZE = 2 * 1024 * 1024;
const MAX_TOTAL_ASSETS = 12 * 1024 * 1024;
const MAX_PACKAGE_ENTRY_SIZE = 64 * 1024 * 1024;
const MAX_TOTAL_PACKAGE_SIZE = 250 * 1024 * 1024;
const MAX_CONTRIBUTIONS = 30;
const MAX_SNIPPETS = 1000;

function openArchive(filePath) {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, {
      lazyEntries: true,
      autoClose: false,
      validateEntrySizes: true,
      strictFileNames: true
    }, (error, zip) => error ? reject(error) : resolve(zip));
  });
}

function listEntries(zip) {
  return new Promise((resolve, reject) => {
    const entries = new Map();
    let count = 0;
    const fail = error => {
      zip.close();
      reject(error);
    };
    zip.on('error', fail);
    zip.on('entry', entry => {
      count += 1;
      if (count > MAX_ARCHIVE_ENTRIES) return fail(new Error('VSIX contains too many files'));
      if (!entry.fileName.endsWith('/')) {
        if (entries.has(entry.fileName)) return fail(new Error('VSIX contains duplicate file paths'));
        entries.set(entry.fileName, entry);
      }
      zip.readEntry();
    });
    zip.once('end', () => resolve(entries));
    zip.readEntry();
  });
}

function readEntry(zip, entry) {
  if (!entry || entry.uncompressedSize > MAX_ASSET_SIZE) {
    return Promise.reject(new Error('VSIX contribution file exceeds the size limit'));
  }
  if ((entry.generalPurposeBitFlag & 1) !== 0) {
    return Promise.reject(new Error('Encrypted VSIX files are not supported'));
  }
  const unixMode = (entry.externalFileAttributes >>> 16) & 0xf000;
  if (unixMode === 0xa000) return Promise.reject(new Error('Symbolic links are not allowed in VSIX packages'));

  return new Promise((resolve, reject) => {
    zip.openReadStream(entry, (error, stream) => {
      if (error) return reject(error);
      const chunks = [];
      let size = 0;
      stream.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_ASSET_SIZE) {
          stream.destroy(new Error('VSIX contribution file exceeds the size limit'));
          return;
        }
        chunks.push(chunk);
      });
      stream.once('error', reject);
      stream.once('end', () => resolve(Buffer.concat(chunks, size)));
    });
  });
}

function contributionPath(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 300) {
    throw new Error('VSIX contains an invalid contribution path');
  }
  let relative = value.replaceAll('\\', '/').trim();
  while (relative.startsWith('./')) relative = relative.slice(2);
  if (relative.startsWith('/') || /^[a-z]:/i.test(relative) || relative.split('/').some(part => !part || part === '..')) {
    throw new Error('VSIX contains an unsafe contribution path');
  }
  return `extension/${relative}`;
}

function normalizedLanguages(value) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.flatMap(item => String(item || '').split(',')).map(item => item.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

function parseContributionJson(data, filePath) {
  const errors = [];
  const source = data.toString('utf8').replace(/^\uFEFF/, '');
  const value = parseJsonc(source, errors, {
    allowTrailingComma: true,
    disallowComments: false
  });
  if (errors.length || value === undefined) {
    const reason = errors.length ? printParseErrorCode(errors[0].error) : 'EmptyContent';
    throw new Error(`Invalid JSONC in VSIX contribution: ${path.posix.basename(filePath)} (${reason})`);
  }
  return value;
}

async function parseContributions(manifest, readAsset) {
  if (!manifest || typeof manifest !== 'object' || typeof manifest.name !== 'string' || typeof manifest.publisher !== 'string') {
    throw new Error('VSIX does not contain a valid extension manifest');
  }
  const name = manifest.name.trim();
  const publisher = manifest.publisher.trim();
  if (!/^[\w.+-]{1,80}$/.test(name) || !/^[\w.+-]{1,80}$/.test(publisher)) {
    throw new Error('VSIX extension identity is invalid');
  }

  const id = `${publisher}.${name}`;
  const themes = [];
  const snippets = [];
  let totalBytes = 0;
  let contributionCount = 0;
  const readJson = async relativePath => {
    contributionCount += 1;
    if (contributionCount > MAX_CONTRIBUTIONS) throw new Error('VSIX has too many supported contributions');
    const filePath = contributionPath(relativePath);
    const data = await readAsset(filePath);
    totalBytes += data.length;
    if (totalBytes > MAX_TOTAL_ASSETS) throw new Error('VSIX supported files exceed the total size limit');
    return parseContributionJson(data, filePath);
  };

  for (const contribution of Array.isArray(manifest.contributes?.themes) ? manifest.contributes.themes : []) {
    const data = await readJson(contribution?.path);
    if (!data || typeof data !== 'object' || (!data.colors && !data.tokenColors)) continue;
    const themeName = String(data.name || contribution.label || path.posix.basename(contribution.path, '.json')).slice(0, 80);
    const themeKey = themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || String(themes.length + 1);
    themes.push({
      id: `wdgd-vsix-${id.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}-${themeKey}`,
      label: `${String(manifest.displayName || name).slice(0, 80)}: ${themeName}`,
      base: data.type === 'light' || /^vs\+?light$/i.test(contribution.uiTheme || '') ? 'light' : 'dark',
      colors: data.colors || {},
      tokenColors: Array.isArray(data.tokenColors) ? data.tokenColors.slice(0, 500) : []
    });
  }

  for (const contribution of Array.isArray(manifest.contributes?.snippets) ? manifest.contributes.snippets : []) {
    const data = await readJson(contribution?.path);
    if (!data || typeof data !== 'object' || Array.isArray(data)) continue;
    const defaultLanguages = normalizedLanguages(contribution.language);
    for (const [snippetName, value] of Object.entries(data)) {
      if (snippets.length >= MAX_SNIPPETS) throw new Error('VSIX contains too many snippets');
      if (!value || typeof value !== 'object' || (!value.prefix && !snippetName)) continue;
      const body = Array.isArray(value.body) ? value.body.slice(0, 500).map(line => String(line).slice(0, 2000)) : String(value.body || '').slice(0, 30000);
      if (!body.length) continue;
      snippets.push({
        name: String(snippetName).slice(0, 100),
        prefix: Array.isArray(value.prefix) ? value.prefix.slice(0, 20).map(item => String(item).slice(0, 120)) : String(value.prefix || snippetName).slice(0, 120),
        body,
        description: String(value.description || '').slice(0, 500),
        languages: normalizedLanguages(value.scope || defaultLanguages)
      });
    }
  }

  const contributes = manifest.contributes || {};
  const ignoredCount = Object.keys(contributes).filter(key => !['themes', 'snippets'].includes(key)).length + (manifest.main || manifest.browser ? 1 : 0);
  return {
    id,
    name,
    publisher,
    version: String(manifest.version || '').slice(0, 40),
    displayName: String(manifest.displayName || name).slice(0, 100),
    description: String(manifest.description || '').slice(0, 300),
    themes,
    snippets,
    ignoredCount
  };
}

async function readVsixContributions(filePath) {
  const stats = await fs.promises.stat(filePath);
  if (!stats.isFile() || stats.size > MAX_ARCHIVE_SIZE) throw new Error('VSIX must be a file smaller than 50 MB');
  const zip = await openArchive(filePath);
  try {
    const entries = await listEntries(zip);
    const manifestEntry = entries.get('extension/package.json');
    if (!manifestEntry) throw new Error('VSIX does not contain extension/package.json');
    const manifestData = await readEntry(zip, manifestEntry);
    const manifest = JSON.parse(manifestData.toString('utf8'));
    return await parseContributions(manifest, async filePathInArchive => {
      const entry = entries.get(filePathInArchive);
      if (!entry) throw new Error(`VSIX contribution file is missing: ${filePathInArchive}`);
      return readEntry(zip, entry);
    });
  } finally {
    zip.close();
  }
}

async function extractVsixPackage(filePath, destination) {
  const stats = await fs.promises.stat(filePath);
  if (!stats.isFile() || stats.size > MAX_ARCHIVE_SIZE) throw new Error('VSIX must be a file smaller than 50 MB');
  const root = path.resolve(destination);
  const zip = await openArchive(filePath);
  try {
    const entries = await listEntries(zip);
    let totalSize = 0;
    for (const entry of entries.values()) {
      const name = entry.fileName;
      const parts = name.split('/');
      if (!name || name.includes('\\') || name.includes('\0') || name.startsWith('/') || /^[a-z]:/i.test(name) || parts.some(part => !part || part === '.' || part === '..')) {
        throw new Error('VSIX contains an unsafe file path');
      }
      if ((entry.generalPurposeBitFlag & 1) !== 0) throw new Error('Encrypted VSIX files are not supported');
      const unixMode = (entry.externalFileAttributes >>> 16) & 0xf000;
      if (unixMode === 0xa000) throw new Error('Symbolic links are not allowed in VSIX packages');
      if (entry.uncompressedSize > MAX_PACKAGE_ENTRY_SIZE) throw new Error('VSIX contains a file larger than 64 MB');
      totalSize += entry.uncompressedSize;
      if (totalSize > MAX_TOTAL_PACKAGE_SIZE) throw new Error('VSIX expands beyond the 250 MB limit');

      const outputPath = path.resolve(root, ...parts);
      if (!outputPath.startsWith(`${root}${path.sep}`)) throw new Error('VSIX contains an unsafe file path');
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      const data = await new Promise((resolve, reject) => {
        zip.openReadStream(entry, (error, stream) => {
          if (error) return reject(error);
          const chunks = [];
          let size = 0;
          stream.on('data', chunk => {
            size += chunk.length;
            if (size > MAX_PACKAGE_ENTRY_SIZE) {
              stream.destroy(new Error('VSIX contains a file larger than 64 MB'));
              return;
            }
            chunks.push(chunk);
          });
          stream.once('error', reject);
          stream.once('end', () => resolve(Buffer.concat(chunks, size)));
        });
      });
      await fs.promises.writeFile(outputPath, data, { flag: 'wx' });
    }
  } finally {
    zip.close();
  }
}

module.exports = { contributionPath, extractVsixPackage, parseContributionJson, parseContributions, readVsixContributions };
