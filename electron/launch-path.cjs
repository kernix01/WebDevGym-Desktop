const fs = require('node:fs');
const path = require('node:path');

const OPEN_PATH_FLAG = '--open-path';

function openPathArgument(argumentsList = []) {
  const flagIndex = argumentsList.indexOf(OPEN_PATH_FLAG);
  if (flagIndex < 0) return '';
  const value = argumentsList[flagIndex + 1];
  return typeof value === 'string' ? value.trim() : '';
}

function projectRootForFile(filePath) {
  const fallback = path.dirname(filePath);
  let directory = fallback;
  const markers = ['package.json', '.git', 'index.html'];

  while (true) {
    if (markers.some(marker => fs.existsSync(path.join(directory, marker)))) return directory;
    const parent = path.dirname(directory);
    if (parent === directory) return fallback;
    directory = parent;
  }
}

function openRequestFromPath(targetPath) {
  if (typeof targetPath !== 'string' || !targetPath.trim()) return null;
  const absolutePath = path.resolve(targetPath.trim());

  let stats;
  try {
    stats = fs.statSync(absolutePath);
  } catch {
    return null;
  }

  if (stats.isDirectory()) {
    return { root: absolutePath, file: '' };
  }
  if (stats.isFile()) {
    const root = projectRootForFile(absolutePath);
    return { root, file: path.relative(root, absolutePath).split(path.sep).join('/') };
  }
  return null;
}

function openRequestFromArguments(argumentsList = []) {
  return openRequestFromPath(openPathArgument(argumentsList));
}

function openRequestFromSecondInstance(argumentsList = [], additionalData = {}) {
  return openRequestFromArguments(argumentsList)
    || openRequestFromPath(additionalData && typeof additionalData === 'object' ? additionalData.openPath : '');
}

module.exports = {
  OPEN_PATH_FLAG,
  openPathArgument,
  projectRootForFile,
  openRequestFromArguments,
  openRequestFromPath,
  openRequestFromSecondInstance
};
