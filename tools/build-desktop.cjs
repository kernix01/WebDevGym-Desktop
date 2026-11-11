const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const packageFile = path.join(projectRoot, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
const outputDirectory = `dist-electron-v${packageData.version}`;
const builderRoot = path.dirname(require.resolve('electron-builder/package.json'));
const builderCli = path.join(builderRoot, 'out', 'cli', 'cli.js');
const targetArguments = process.argv.includes('--dir') ? ['--dir'] : ['--win', 'nsis', 'portable'];

console.log(`Building WebDevGym ${packageData.version} in ${outputDirectory}`);
const result = spawnSync(process.execPath, [
  builderCli,
  ...targetArguments,
  `--config.directories.output=${outputDirectory}`
], {
  cwd: projectRoot,
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
