const fs = require('node:fs');
const path = require('node:path');

const TOKEN_FILE_NAME = 'github-token.secure';
const TOKEN_PATTERN = /^(gh[pousr]_|github_pat_)[A-Za-z0-9_]+$/;

function createGithubTokenStore({ directory, safeStorage }) {
  const filePath = path.join(directory, TOKEN_FILE_NAME);

  function encryptionAvailable() {
    return Boolean(safeStorage?.isEncryptionAvailable?.());
  }

  function load() {
    if (!encryptionAvailable() || !fs.existsSync(filePath)) return '';
    try {
      const encrypted = Buffer.from(fs.readFileSync(filePath, 'utf8'), 'base64');
      return safeStorage.decryptString(encrypted);
    } catch (error) {
      return '';
    }
  }

  function save(token) {
    if (!encryptionAvailable()) throw new Error('Secure token storage is unavailable');
    if (typeof token !== 'string' || token.length < 20 || !TOKEN_PATTERN.test(token)) {
      throw new Error('Invalid GitHub token');
    }

    fs.mkdirSync(directory, { recursive: true });
    const temporaryPath = `${filePath}.tmp`;
    const encrypted = safeStorage.encryptString(token.trim()).toString('base64');
    fs.writeFileSync(temporaryPath, encrypted, 'utf8');
    fs.renameSync(temporaryPath, filePath);
  }

  function remove() {
    try {
      fs.rmSync(filePath, { force: true });
    } catch (error) {}
  }

  return { load, remove, save };
}

module.exports = { createGithubTokenStore, TOKEN_FILE_NAME };
