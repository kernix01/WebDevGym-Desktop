const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(process.env.WEBDEVGYM_SOURCE || path.join(projectRoot, '..', 'WebDevGym'));
const englishSourceRoot = path.resolve(process.env.WEBDEVGYM_EN_SOURCE || path.join(projectRoot, '..', 'WebDevGym-EN'));
const stagingRoot = path.join(projectRoot, '.web-sync-temp');
const targetRoot = path.join(projectRoot, 'web');
const overridesRoot = path.join(projectRoot, 'electron', 'web-overrides');
const directories = ['css', 'data', 'js'];
const files = ['index.html', 'index-en.html', 'favicon.svg', 'manifest.webmanifest', 'sw.js'];

for (const entry of [...directories, ...files.filter(file => file !== 'index-en.html')]) {
  if (!fs.existsSync(path.join(sourceRoot, entry))) {
    throw new Error(`WebDevGym source is missing: ${path.join(sourceRoot, entry)}`);
  }
}
if (!fs.existsSync(path.join(englishSourceRoot, 'index-en.html'))) {
  throw new Error(`English WebDevGym source is missing: ${path.join(englishSourceRoot, 'index-en.html')}`);
}

fs.rmSync(stagingRoot, { recursive: true, force: true });
fs.mkdirSync(stagingRoot, { recursive: true });

for (const directory of directories) {
  fs.cpSync(path.join(sourceRoot, directory), path.join(stagingRoot, directory), { recursive: true });
}

for (const file of files) {
  const fileRoot = file === 'index-en.html' ? englishSourceRoot : sourceRoot;
  fs.copyFileSync(path.join(fileRoot, file), path.join(stagingRoot, file));
}

for (const directory of ['css', 'js']) {
  fs.cpSync(path.join(overridesRoot, directory), path.join(stagingRoot, directory), {
    recursive: true,
    force: true
  });
}

for (const page of ['index.html', 'index-en.html']) {
  const pagePath = path.join(stagingRoot, page);
  const stylesheetTags = [
    '<link rel="stylesheet" href="css/webdevgym-desktop.css?v=20261003-4">',
    '<link rel="stylesheet" href="css/webdevgym-completions.css?v=20261105-1">',
    '<link rel="stylesheet" href="css/webdevgym-ai-edits.css?v=20260930-1">',
    '<link rel="stylesheet" href="css/webdevgym-electron-titlebar.css?v=20260928-1">'
  ];
  const scriptTags = [
    '<script src="js/webdevgym-electron-token.js?v=20260914-1"></script>',
    '<script src="js/webdevgym-offline-docs-data.js?v=20260930-1"></script>',
    '<script src="js/webdevgym-monaco.js?v=20261003-4"></script>',
    '<script src="js/webdevgym-desktop.js?v=20261003-4"></script>',
    '<script src="js/webdevgym-ai-edits.js?v=20260930-1"></script>',
    '<script src="js/webdevgym-electron-titlebar.js?v=20260928-1"></script>'
  ];
  let html = fs.readFileSync(pagePath, 'utf8');
  for (const stylesheetTag of stylesheetTags) {
    const asset = stylesheetTag.match(/href="([^"?]+)/)?.[1];
    if (asset) {
      const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`<link\\b[^>]*href=["'][^"']*${escaped}(?:\\?[^"']*)?["'][^>]*>\\s*`, 'gi'), '');
    }
    html = html.replace('</head>', `${stylesheetTag}\n</head>`);
  }
  for (const scriptTag of scriptTags) {
    const asset = scriptTag.match(/src="([^"?]+)/)?.[1];
    if (asset) {
      const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`<script\\b[^>]*src=["'][^"']*${escaped}(?:\\?[^"']*)?["'][^>]*>\\s*</script>\\s*`, 'gi'), '');
    }
    html = html.replace('</body>', `${scriptTag}\n</body>`);
  }
  fs.writeFileSync(pagePath, html, 'utf8');
}

fs.rmSync(targetRoot, { recursive: true, force: true });
fs.renameSync(stagingRoot, targetRoot);
require('./prepare-editor-vendor.cjs').prepareEditorVendor();
console.log(`Web files synchronized from ${sourceRoot}`);
