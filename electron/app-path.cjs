const path = require('node:path');

const APP_SCHEME = 'webdevgym:';
const APP_HOST = 'app';

function resolveAppRequest(rootDirectory, requestUrl) {
  let url;
  try {
    url = new URL(requestUrl);
  } catch (error) {
    return null;
  }

  if (url.protocol !== APP_SCHEME || url.hostname !== APP_HOST) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch (error) {
    return null;
  }

  if (pathname.includes('\0')) return null;
  const relativeRequest = (pathname === '/' ? 'index.html' : pathname).replace(/^[/\\]+/, '');
  const root = path.resolve(rootDirectory);
  const filePath = path.resolve(root, relativeRequest);
  const relativePath = path.relative(root, filePath);
  const escapesRoot = relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath);

  return escapesRoot ? null : filePath;
}

function bundledPageForUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch (error) {
    return null;
  }

  if (url.protocol !== 'https:' || url.hostname !== 'kernix01.github.io') return null;
  if (url.pathname === '/WebDevGym-EN' || url.pathname.startsWith('/WebDevGym-EN/')) return 'index-en.html';
  if (url.pathname === '/WebDevGym' || url.pathname.startsWith('/WebDevGym/')) return 'index.html';
  return null;
}

function isSafeExternalUrl(urlString) {
  try {
    const protocol = new URL(urlString).protocol;
    return protocol === 'https:' || protocol === 'http:';
  } catch (error) {
    return false;
  }
}

module.exports = {
  APP_HOST,
  APP_SCHEME,
  bundledPageForUrl,
  isSafeExternalUrl,
  resolveAppRequest
};
