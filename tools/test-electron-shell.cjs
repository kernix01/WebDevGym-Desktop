const assert = require('node:assert/strict');
const path = require('node:path');
const {
  bundledPageForUrl,
  isSafeExternalUrl,
  resolveAppRequest
} = require('../electron/app-path.cjs');

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

console.log('Electron shell tests passed.');
