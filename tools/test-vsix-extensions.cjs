const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { extractVsixPackage, readVsixContributions, contributionPath } = require('../electron/vsix-extensions.cjs');
const { installFromMarketplace, installVsixFile, removeStoredExtension, searchMarketplace } = require('../electron/extension-marketplace.cjs');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStored(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  for (const [fileName, content] of Object.entries(entries)) {
    const name = Buffer.from(fileName);
    const data = Buffer.from(content);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, name);
    localOffset += local.length + name.length + data.length;
  }

  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(localOffset, 16);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

async function main() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'webdevgym-vsix-test-'));
  const packagePath = path.join(temp, 'sample.vsix');
  const manifest = {
    name: 'sample-pack',
    publisher: 'webdevgym-test',
    displayName: 'Sample Pack',
    version: '1.2.3',
    main: './extension.js',
    contributes: {
      themes: [{ label: 'Sample Dark', path: './themes/tokyo-night-color-theme.json', uiTheme: 'vs-dark' }],
      snippets: [{ language: 'javascript', path: './snippets/javascript.json' }],
      commands: [{ command: 'sample.run', title: 'Run sample' }]
    }
  };
  fs.writeFileSync(packagePath, zipStored({
    'extension/package.json': JSON.stringify(manifest),
    'extension/themes/tokyo-night-color-theme.json': `\uFEFF{
      // VS Code themes commonly use JSON with comments and trailing commas.
      "name": "Sample Dark",
      "type": "dark",
      "colors": { "editor.background": "#101010", },
      "tokenColors": [],
    }`,
    'extension/snippets/javascript.json': `{
      /* Snippet files may use JSONC too. */
      "log": { "prefix": "logx", "body": ["console.log($1);"], "description": "Log a value", },
    }`,
    'extension/extension.js': 'throw new Error("must not be loaded");'
  }));

  try {
    const extension = await readVsixContributions(packagePath);
    assert.equal(extension.id, 'webdevgym-test.sample-pack');
    assert.equal(extension.displayName, 'Sample Pack');
    assert.equal(extension.themes.length, 1);
    assert.match(extension.themes[0].id, /^wdgd-vsix-/);
    assert.equal(extension.themes[0].colors['editor.background'], '#101010');
    assert.equal(extension.snippets.length, 1);
    assert.equal(extension.snippets[0].prefix, 'logx');
    assert.deepEqual(extension.snippets[0].languages, ['javascript']);
    assert.equal(extension.ignoredCount, 2);
    assert.throws(() => contributionPath('../../outside.json'), /unsafe/);

    const archive = fs.readFileSync(packagePath);
    const checksum = require('node:crypto').createHash('sha256').update(archive).digest('hex');
    const registryEntry = {
      namespace: 'webdevgym-test',
      name: 'sample-pack',
      version: '1.2.3',
      displayName: 'Sample Pack',
      description: 'Safe sample extension',
      downloadCount: 1234,
      verified: true,
      files: {
        download: 'https://open-vsx.org/api/webdevgym-test/sample-pack/1.2.3/file/sample-pack.vsix',
        sha256: 'https://open-vsx.org/api/webdevgym-test/sample-pack/1.2.3/file/sample-pack.sha256'
      }
    };
    const marketplaceFetch = async url => {
      const parsed = new URL(url);
      if (parsed.pathname === '/api/-/search') {
        assert.equal(parsed.searchParams.get('query'), 'sample');
        return new Response(JSON.stringify({ extensions: [registryEntry] }), { status: 200 });
      }
      if (parsed.pathname === '/api/webdevgym-test/sample-pack/1.2.3') {
        return new Response(JSON.stringify({
          ...manifest,
          namespace: registryEntry.namespace,
          files: registryEntry.files
        }), { status: 200 });
      }
      if (parsed.pathname.endsWith('.vsix')) return new Response(archive, { status: 200 });
      if (parsed.pathname.endsWith('.sha256')) return new Response(checksum, { status: 200 });
      return new Response('Not found', { status: 404 });
    };
    const results = await searchMarketplace(marketplaceFetch, ' sample ');
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'webdevgym-test.sample-pack');
    const extensionsRoot = path.join(temp, 'extensions');
    const installed = await installFromMarketplace(marketplaceFetch, extensionsRoot, {
      namespace: registryEntry.namespace,
      name: registryEntry.name,
      version: registryEntry.version
    });
    assert.equal(installed.source, 'open-vsx');
    const installedFolder = path.join(extensionsRoot, 'webdevgym-test.sample-pack', '1.2.3');
    assert.equal(fs.existsSync(path.join(installedFolder, 'extension', 'package.json')), true);
    assert.equal(fs.existsSync(path.join(installedFolder, 'extension.vsix')), false);
    assert.equal(JSON.parse(fs.readFileSync(path.join(installedFolder, 'metadata.json'), 'utf8')).source, 'open-vsx');
    assert.equal(await removeStoredExtension(extensionsRoot, installed.id), true);
    assert.equal(fs.existsSync(installedFolder), false);

    const localInstalled = await installVsixFile(extensionsRoot, packagePath);
    assert.equal(localInstalled.source, 'vsix');
    assert.equal(fs.existsSync(path.join(extensionsRoot, `${localInstalled.id.toLowerCase()}`, localInstalled.version, 'extension', 'package.json')), true);
    await assert.rejects(() => removeStoredExtension(extensionsRoot, '../outside'), /identity/);
    await removeStoredExtension(extensionsRoot, localInstalled.id);

    const unsafeArchive = path.join(temp, 'unsafe.vsix');
    fs.writeFileSync(unsafeArchive, zipStored({ 'extension/../../outside.txt': 'not allowed' }));
    await assert.rejects(() => extractVsixPackage(unsafeArchive, path.join(temp, 'unsafe-extract')), /unsafe|invalid relative path/);

    const untrustedFetch = async url => {
      const parsed = new URL(url);
      if (parsed.pathname === '/api/webdevgym-test/sample-pack/1.2.3') {
        return new Response(JSON.stringify({
          ...manifest,
          namespace: registryEntry.namespace,
          files: { ...registryEntry.files, download: 'https://attacker.example/extension.vsix' }
        }), { status: 200 });
      }
      return new Response('Not found', { status: 404 });
    };
    await assert.rejects(() => installFromMarketplace(untrustedFetch, extensionsRoot, {
      namespace: registryEntry.namespace,
      name: registryEntry.name,
      version: registryEntry.version
    }), /untrusted URL/);
    console.log('VSIX extension import tests passed.');
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
