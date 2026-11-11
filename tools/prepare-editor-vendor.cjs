const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

function prepareEditorVendor() {
  const monacoSource = path.join(projectRoot, 'node_modules', 'monaco-editor', 'min', 'vs');
  const emmetSource = path.join(projectRoot, 'node_modules', 'emmet-monaco-es', 'dist', 'emmet-monaco.min.js');
  const vendorRoot = path.join(projectRoot, 'web', 'vendor');
  const monacoTarget = path.join(vendorRoot, 'monaco', 'vs');
  const emmetTarget = path.join(vendorRoot, 'emmet-monaco.min.js');

  if (!fs.existsSync(monacoSource) || !fs.existsSync(emmetSource)) {
    throw new Error('Editor dependencies are missing. Run npm install first.');
  }

  fs.rmSync(path.join(vendorRoot, 'monaco'), { recursive: true, force: true });
  fs.mkdirSync(vendorRoot, { recursive: true });
  fs.cpSync(monacoSource, monacoTarget, { recursive: true });
  fs.copyFileSync(emmetSource, emmetTarget);
  console.log('Monaco and Emmet runtime prepared in web/vendor.');
}

if (require.main === module) prepareEditorVendor();

module.exports = { prepareEditorVendor };
