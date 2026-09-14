const assert = require('node:assert/strict');
const path = require('node:path');
const {
  bundledPageForUrl,
  isSafeExternalUrl,
  resolveAppRequest
} = require('../electron/app-path.cjs');
const fs = require('node:fs');
const os = require('node:os');
const { createGithubTokenStore, TOKEN_FILE_NAME } = require('../electron/github-token-store.cjs');

const root = path.resolve('C:/webdevgym-test');

assert.equal(resolveAppRequest(root, 'webdevgym://app/'), path.join(root, 'index.html'));
assert.equal(resolveAppRequest(root, 'webdevgym://app/js/app.js'), path.join(root, 'js', 'app.js'));
assert.equal(resolveAppRequest(root, 'https://app/index.html'), null);
assert.equal(resolveAppRequest(root, 'webdevgym://other/index.html'), null);
assert.equal(resolveAppRequest(root, 'webdevgym://app/%2e%2e%5csecret.txt'), null);
assert.equal(resolveAppRequest(root, 'not a url'), null);

assert.equal(bundledPageForUrl('https://kernix01.github.io/WebDevGym/'), 'index.html');
assert.equal(bundledPageForUrl('https://kernix01.github.io/WebDevGym-EN/'), 'index-en.html');
assert.equal(bundledPageForUrl('https://example.com/WebDevGym/'), null);

assert.equal(isSafeExternalUrl('https://developer.mozilla.org/'), true);
assert.equal(isSafeExternalUrl('http://127.0.0.1:4173/'), true);
assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
assert.equal(isSafeExternalUrl('file:///C:/secret.txt'), false);

const tokenDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'webdevgym-token-store-'));
const fakeSafeStorage = {
  isEncryptionAvailable: () => true,
  encryptString: value => Buffer.from(`protected:${value}`, 'utf8'),
  decryptString: value => value.toString('utf8').replace(/^protected:/, '')
};
const tokenStore = createGithubTokenStore({ directory: tokenDirectory, safeStorage: fakeSafeStorage });
const testToken = `github_pat_${'a'.repeat(32)}`;

assert.equal(tokenStore.load(), '');
assert.throws(() => tokenStore.save('not-a-token-value-with-enough-characters'));
tokenStore.save(testToken);
assert.equal(tokenStore.load(), testToken);
assert.equal(fs.readFileSync(path.join(tokenDirectory, TOKEN_FILE_NAME), 'utf8').includes(testToken), false);
tokenStore.remove();
assert.equal(tokenStore.load(), '');
fs.rmSync(tokenDirectory, { recursive: true, force: true });

console.log('Electron shell tests passed.');
