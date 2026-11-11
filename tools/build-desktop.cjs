const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const packageFile = path.join(projectRoot, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
const isLinux = process.argv.includes('--linux');
const isPacmanOnly = process.argv.includes('--pacman-only');
if ((isLinux || isPacmanOnly) && process.argv.includes('--win')) {
  throw new Error('Choose one build platform: --win or --linux.');
}
const platformDirectory = isLinux || isPacmanOnly ? 'linux' : 'windows';
const outputDirectory = `dist-electron-v${packageData.version}/${platformDirectory}`;
const builderRoot = path.dirname(require.resolve('electron-builder/package.json'));
const builderCli = path.join(builderRoot, 'out', 'cli', 'cli.js');
const targetArguments = process.argv.includes('--dir')
  ? ['--dir', platformDirectory === 'linux' ? '--linux' : '--win']
  : isPacmanOnly
    ? ['--linux', 'pacman', '--x64']
    : isLinux
    ? ['--linux', 'AppImage', 'deb', 'pacman', '--x64']
    : ['--win', 'nsis', 'portable', '--x64'];

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
