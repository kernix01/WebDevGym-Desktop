const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(process.env.WEBDEVGYM_SOURCE || path.join(projectRoot, '..', 'WebDevGym'));
const stagingRoot = path.join(projectRoot, '.web-sync-temp');
const targetRoot = path.join(projectRoot, 'web');
const overridesRoot = path.join(projectRoot, 'electron', 'web-overrides');
const directories = ['css', 'data', 'js'];
const files = ['index.html', 'index-en.html', 'favicon.svg', 'manifest.webmanifest', 'sw.js'];

for (const entry of [...directories, ...files]) {
  if (!fs.existsSync(path.join(sourceRoot, entry))) {
    throw new Error(`WebDevGym source is missing: ${path.join(sourceRoot, entry)}`);
  }
}

fs.rmSync(stagingRoot, { recursive: true, force: true });
fs.mkdirSync(stagingRoot, { recursive: true });

for (const directory of directories) {
  fs.cpSync(path.join(sourceRoot, directory), path.join(stagingRoot, directory), { recursive: true });
}

for (const file of files) {
  fs.copyFileSync(path.join(sourceRoot, file), path.join(stagingRoot, file));
}

fs.cpSync(path.join(overridesRoot, 'js'), path.join(stagingRoot, 'js'), {
  recursive: true,
  force: true
});

for (const page of ['index.html', 'index-en.html']) {
  const pagePath = path.join(stagingRoot, page);
  const scriptTag = '<script src="js/webdevgym-electron-token.js?v=20260914-1"></script>';
  const html = fs.readFileSync(pagePath, 'utf8');
  if (!html.includes(scriptTag)) {
    fs.writeFileSync(pagePath, html.replace('</body>', `${scriptTag}\n</body>`), 'utf8');
  }
}

fs.rmSync(targetRoot, { recursive: true, force: true });
fs.renameSync(stagingRoot, targetRoot);
console.log(`Web files synchronized from ${sourceRoot}`);
