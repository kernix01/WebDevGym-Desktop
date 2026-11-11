const assert = require('node:assert/strict');
const path = require('node:path');
const {
  bundledPageForUrl,
  isSafeExternalUrl,
  resolveAppRequest
} = require('../electron/app-path.cjs');
const fs = require('node:fs');
const os = require('node:os');
const vm = require('node:vm');
const { createGithubTokenStore, TOKEN_FILE_NAME } = require('../electron/github-token-store.cjs');
const {
  compareVersions,
  packageNameFromSpec,
  packageOperationCommand,
  parseGitStatus,
  resolveInside
} = require('../electron/desktop-services.cjs');
const {
  openPathArgument,
  openRequestFromArguments,
  openRequestFromPath,
  openRequestFromSecondInstance
} = require('../electron/launch-path.cjs');

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

assert.equal(resolveInside('C:/projects/demo', 'src/app.js'), path.resolve('C:/projects/demo/src/app.js'));
assert.throws(() => resolveInside('C:/projects/demo', '../secret.txt'));
assert.equal(compareVersions('0.2.0', '0.1.2'), 1);
assert.equal(compareVersions('v0.1.2', '0.1.2'), 0);
assert.equal(compareVersions('0.1.1', '0.1.2'), -1);
assert.equal(packageNameFromSpec('react@latest').name, 'react');
assert.equal(packageNameFromSpec('react && whoami'), null);
assert.equal(packageOperationCommand('yarn', 'update', 'react', false).display, 'yarn add react@latest');
assert.deepEqual(parseGitStatus(' M app.js\0?? new file.js\0A  staged.css\0'), [
  { path: 'app.js', originalPath: '', index: ' ', worktree: 'M', staged: false, unstaged: true },
  { path: 'new file.js', originalPath: '', index: '?', worktree: '?', staged: false, unstaged: true },
  { path: 'staged.css', originalPath: '', index: 'A', worktree: ' ', staged: true, unstaged: false }
]);

const launchDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'webdevgym-launch-path-'));
const launchSourceDirectory = path.join(launchDirectory, 'src');
const launchFile = path.join(launchSourceDirectory, 'app.js');
fs.mkdirSync(launchSourceDirectory);
fs.writeFileSync(path.join(launchDirectory, 'index.html'), '<h1>Launch path</h1>', 'utf8');
fs.writeFileSync(launchFile, '<h1>Launch path</h1>', 'utf8');
assert.equal(openPathArgument(['WebDevGym.exe', '--open-path', launchFile]), launchFile);
assert.deepEqual(openRequestFromPath(launchDirectory), { root: launchDirectory, file: '' });
assert.deepEqual(openRequestFromArguments(['WebDevGym.exe', '--open-path', launchFile]), {
  root: launchDirectory,
  file: 'src/app.js'
});
assert.deepEqual(openRequestFromSecondInstance(['WebDevGym.exe'], { openPath: launchFile }), {
  root: launchDirectory,
  file: 'src/app.js'
});
assert.equal(openRequestFromArguments(['WebDevGym.exe', '--open-path', path.join(launchDirectory, 'missing.js')]), null);
fs.rmSync(launchDirectory, { recursive: true, force: true });

for (const page of ['index.html', 'index-en.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'web', page), 'utf8');
  assert.ok(html.includes('css/webdevgym-desktop.css'));
  assert.ok(html.includes('css/webdevgym-ai-edits.css'));
  assert.ok(html.includes('css/webdevgym-electron-titlebar.css'));
  assert.ok(html.includes('css/webdevgym-scrollbars.css'));
  assert.ok(html.includes('css/webdevgym-device-sync.css'));
  assert.ok(html.includes('js/webdevgym-desktop.js'));
  assert.ok(html.includes('js/webdevgym-offline-docs-data.js'));
  assert.ok(html.includes('js/webdevgym-electron-titlebar.js'));
  assert.ok(html.includes('js/webdevgym-ai-edits.js'));
  assert.ok(html.includes('js/webdevgym-device-sync.js'));
}

const desktopCenter = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-desktop.js'), 'utf8');
const desktopOverride = fs.readFileSync(path.join(__dirname, '..', 'electron', 'web-overrides', 'js', 'webdevgym-desktop.js'), 'utf8');
const vsixReader = fs.readFileSync(path.join(__dirname, '..', 'electron', 'vsix-extensions.cjs'), 'utf8');
const extensionMarketplace = fs.readFileSync(path.join(__dirname, '..', 'electron', 'extension-marketplace.cjs'), 'utf8');
const desktopServices = fs.readFileSync(path.join(__dirname, '..', 'electron', 'desktop-services.cjs'), 'utf8');
const desktopCss = fs.readFileSync(path.join(__dirname, '..', 'electron', 'web-overrides', 'css', 'webdevgym-desktop.css'), 'utf8');
const desktopTitlebarCss = fs.readFileSync(path.join(__dirname, '..', 'electron', 'web-overrides', 'css', 'webdevgym-electron-titlebar.css'), 'utf8');
const monacoSource = fs.readFileSync(path.join(__dirname, '..', 'electron', 'web-overrides', 'js', 'webdevgym-monaco.js'), 'utf8');
const offlineDocsSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-offline-docs-data.js'), 'utf8');
const offlineDocsContext = { window: {} };
vm.runInNewContext(offlineDocsSource, offlineDocsContext);
assert.equal(offlineDocsContext.window.WebDevGymOfflineDocs.categories.length, 6);
assert.ok(offlineDocsContext.window.WebDevGymOfflineDocs.articles.length >= 18);
assert.ok(offlineDocsContext.window.WebDevGymOfflineDocs.articles.some(article => article.id === 'dom-events'));
const playgroundSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-playground-atlas.js'), 'utf8');
assert.ok(desktopCenter.includes('data-runner-state'));
assert.ok(desktopCenter.includes('data-desktop-scripts'));
assert.ok(desktopCenter.includes('data-runner-open-url'));
assert.ok(desktopCenter.includes('packageManager'));
assert.ok(desktopCenter.includes('data-desktop-view="packages"'));
assert.ok(desktopCenter.includes('data-desktop-file-tabs'));
assert.ok(desktopCenter.includes('data-desktop-splitter="explorer"'));
assert.ok(desktopCenter.includes('data-desktop-splitter="preview"'));
assert.ok(desktopCenter.includes('attachAutocomplete'));
assert.ok(desktopCenter.includes('refreshPreview'));
assert.ok(desktopCenter.includes('data-package-install-form'));
assert.ok(desktopCenter.includes('data-packages-updates'));
assert.ok(desktopCenter.includes('data-desktop-view="docs"'));
assert.ok(desktopCenter.includes('WebDevGymDesktopProjectContext'));
assert.ok(desktopCenter.includes('data-desktop-ai-context'));
assert.ok(desktopCenter.includes('fileKindMarkup'));
assert.ok(desktopCenter.includes('closeDesktopCenter'));
assert.ok(desktopCenter.includes('editorChangePaths: new Set()'));
assert.ok(desktopCenter.includes('webdevgym:desktop-project-context-changed'));
assert.match(desktopCenter, /sandbox="[^"]*allow-same-origin[^"]*"/);
assert.match(playgroundSource, /data-wdga-create-dialog/);
assert.match(playgroundSource, /openCreateItemDialog\('file'\)/);
assert.match(playgroundSource, /openCreateItemDialog\('folder'\)/);
assert.match(desktopCss, /\.wdgd-window\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;/);
assert.match(desktopCss, /\.wdgd-file-kind\.kind-js\s*\{\s*color:/);
assert.match(desktopTitlebarCss, /body\.wdge-titlebar-ready \.wdgd-window\s*\{\s*height:\s*100%;/);
assert.ok(monacoSource.includes("cursorSmoothCaretAnimation: 'on'"));
assert.ok(monacoSource.includes("cursorBlinking: 'smooth'"));
assert.ok(monacoSource.includes('smoothScrolling: true'));
assert.ok(monacoSource.includes('linkedEditing: true'));
assert.ok(monacoSource.includes('colorDecorators: true'));
assert.ok(monacoSource.includes('setModelMarkers'));
assert.ok(monacoSource.includes('wdgd-error-lens'));
assert.ok(monacoSource.includes('requestAnimationFrame(() => {'));
assert.doesNotMatch(playgroundSource, /window\.prompt\(ui\.filePath/);
assert.doesNotMatch(playgroundSource, /window\.prompt\(ui\.folderPath/);

const mainSource = fs.readFileSync(path.join(__dirname, '..', 'electron', 'main.cjs'), 'utf8');
const preloadSource = fs.readFileSync(path.join(__dirname, '..', 'electron', 'preload.cjs'), 'utf8');
const cloudSyncSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-cloud-sync.js'), 'utf8');
const cloudBackupMigration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20261111_cloud_backups.sql'), 'utf8');
const contextMenuSource = fs.readFileSync(path.join(__dirname, '..', 'installer', 'context-menu.nsh'), 'utf8');
const aiSettingsSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-ai-settings.js'), 'utf8');
const aiEditsSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-ai-edits.js'), 'utf8');
const aiEditsCssSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'css', 'webdevgym-ai-edits.css'), 'utf8');
const aiSettingsCssSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'css', 'webdevgym-ai-settings.css'), 'utf8');
const aiSoundsSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-custom-sounds.js'), 'utf8');
const deviceSyncSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-device-sync.js'), 'utf8');
const aiCoreRuSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-core-ru.js'), 'utf8');
const aiCoreEnSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'js', 'webdevgym-core-en.js'), 'utf8');
assert.match(preloadSource, /chooseChatFiles/);
assert.match(preloadSource, /installVsix/);
assert.match(preloadSource, /searchExtensions/);
assert.match(preloadSource, /installMarketplaceExtension/);
assert.match(preloadSource, /removeExtension/);
assert.match(preloadSource, /windowToggleMaximize/);
assert.match(preloadSource, /onWindowStateChange/);
assert.match(preloadSource, /consumeOpenRequest/);
assert.match(preloadSource, /onOpenRequest/);
assert.match(preloadSource, /gitChanges/);
assert.match(preloadSource, /gitDiff/);
assert.match(preloadSource, /gitStage/);
assert.match(preloadSource, /gitUnstage/);
assert.match(preloadSource, /packageUpdates/);
assert.match(preloadSource, /packageMutate/);
assert.match(preloadSource, /syncExchange/);
assert.match(preloadSource, /syncRegenerateCode/);
assert.match(preloadSource, /onSyncChanged/);
assert.match(preloadSource, /copyText/);
assert.match(desktopOverride, /data-editor-extensions/);
assert.match(desktopOverride, /data-extension-install/);
assert.match(desktopOverride, /data-extension-search-form/);
assert.match(desktopOverride, /data-extension-marketplace-panel/);
assert.match(desktopServices, /webdevgym:desktop:search-extensions/);
assert.match(desktopServices, /webdevgym:desktop:install-marketplace-extension/);
assert.match(desktopServices, /webdevgym:desktop:remove-extension/);
assert.match(extensionMarketplace, /https:\/\/open-vsx\.org/);
assert.match(extensionMarketplace, /createHash\('sha256'\)/);
assert.match(extensionMarketplace, /openvsx\.eclipsecontent\.org/);
assert.match(desktopCss, /\.wdgd-extension-dialog\s*\{[\s\S]*?inset:\s*50% auto auto 50%[\s\S]*?transform:\s*translate\(-50%, -50%\)/);
assert.match(vsixReader, /readVsixContributions/);
assert.match(vsixReader, /extractVsixPackage/);
assert.doesNotMatch(vsixReader, /child_process|\bspawn\(|\beval\(/);
assert.match(mainSource, /frame: false/);
assert.match(mainSource, /icon: APP_ICON_PATH/);
assert.match(mainSource, /window-toggle-maximize/);
assert.match(mainSource, /second-instance[\s\S]*openRequestFromSecondInstance/);
assert.match(mainSource, /createDeviceSyncService/);
assert.match(mainSource, /webdevgym:desktop:copy-text/);
assert.match(mainSource, /clipboard\.writeText/);
assert.match(mainSource, /requestSingleInstanceLock\([\s\S]*openPathArgument/);
assert.match(mainSource, /openRequestFromSecondInstance\(commandLine, additionalData\)/);
assert.match(mainSource, /setAsDefaultProtocolClient\(APP_SCHEME\.slice\(0, -1\)\)/);
assert.match(mainSource, /webdevgym:auth:callback/);
assert.match(preloadSource, /onAuthCallback/);
assert.match(cloudSyncSource, /exchangeCodeForSession/);
assert.match(cloudSyncSource, /create_user_state_backup/);
assert.match(cloudSyncSource, /data-cloud-backup-delete/);
assert.match(cloudSyncSource, /\.from\('user_state_backups'\)[\s\S]*?\.delete\(\)/);
assert.match(cloudSyncSource, /backupDeleteConfirm/);
assert.match(cloudBackupMigration, /enable row level security/);
assert.match(cloudBackupMigration, /auth\.uid\(\)/);
assert.match(cloudBackupMigration, /limit 20/);
assert.match(contextMenuSource, /Directory\\Background\\shell\\WebDevGym/);
assert.match(contextMenuSource, /--open-path/);
assert.match(contextMenuSource, /customUnInstall/);
assert.match(aiSettingsSource, /chooseChatFiles/);
assert.match(aiSettingsSource, /window\.aiHandleFiles/);
assert.match(aiSettingsSource, /data-ai-project-context/);
assert.match(aiSettingsSource, /wdgrAiAttachCurrent/);
assert.match(aiSettingsSource, /wdgrAiAttachSelected/);
assert.match(desktopCenter, /reviewProjectEdits/);
assert.match(desktopCenter, /applyProjectEdits/);
assert.match(desktopCenter, /readProjectContextFiles/);
assert.match(desktopCenter, /webdevgymProjectRoot/);
assert.match(desktopCenter, /api\.createBackup\(state\.project\.root\)/);
const aiEditsContext = {
  window: { setTimeout: () => {} },
  document: { documentElement: { lang: 'ru' } },
  localStorage: { getItem: () => null, setItem: () => {} }
};
vm.runInNewContext(aiEditsSource, aiEditsContext);
const editSample = 'Исправил обработчик.\n```webdevgym-edit\n{"path":"src/app.js"}\nconst ready = true;\n```';
const parsedEdit = aiEditsContext.window.WebDevGymAiEdits.parse(editSample);
assert.equal(parsedEdit.files.length, 1);
assert.equal(parsedEdit.files[0].path, 'src/app.js');
assert.match(parsedEdit.files[0].content, /ready = true/);
assert.equal(aiEditsContext.window.WebDevGymAiEdits.displayText(editSample), 'Исправил обработчик.');
assert.match(aiEditsContext.window.WebDevGymAiEdits.systemPrompt([{ projectPath: 'src/app.js' }]), /FULL FINAL FILE CONTENT/);
assert.match(aiEditsSource, /renderHoverPreview/);
assert.match(aiEditsCssSource, /wdgr-ai-edit-hover/);
assert.match(aiSettingsSource, /activeDragCleanup/);
assert.match(aiSettingsSource, /restoreComposerFocus/);
assert.match(aiSettingsCssSource, /wdgr-ai-minimized[^}]*pointer-events: none/);
assert.match(aiSoundsSource, /WebDevGymAiNotifications/);
assert.match(aiSoundsSource, /wdg_ai_reply_sound_v1/);
assert.match(aiSoundsSource, /classList\.toggle\('on', enabled\)/);
assert.match(deviceSyncSource, /targetAddressSpace = 'loopback'/);
assert.match(deviceSyncSource, /class="wdg-device-sync-icon"/);
assert.doesNotMatch(deviceSyncSource, /<iconify-icon/);
assert.doesNotMatch(deviceSyncSource, /location\.reload\(\)/);
assert.match(deviceSyncSource, /'iconify', 'wdgr_ai_window', 'wdgu_timer_window'/);
assert.match(deviceSyncSource, /targetAddressSpace: 'loopback'/);
assert.match(deviceSyncSource, /const POLL_MS = 30000/);
assert.match(deviceSyncSource, /const LOCAL_SYNC_DELAY = 80/);
assert.match(deviceSyncSource, /await desktopApi\.copyText\(text\)/);
assert.match(aiCoreRuSource, /ai-msg-attachments/);
assert.match(aiCoreRuSource, /WebDevGymAiNotifications/);
assert.match(aiCoreRuSource, /file\.webdevgymPath/);
assert.match(aiCoreRuSource, /await aiRefreshProjectAttachments\(\)/);
assert.match(aiCoreRuSource, /WebDevGymAiAttachments/);
assert.match(aiCoreRuSource, /function aiRenderMarkdown/);
assert.match(aiCoreRuSource, /function aiGeneratedImageSource/);
assert.doesNotMatch(aiCoreRuSource, /aiSaveHistory\(\);\s*aiClearAttachments\(\);/);
assert.doesNotMatch(aiCoreRuSource, /images\/generations[\s\S]{0,800}\bn:\s*1/);
assert.match(aiCoreEnSource, /ai-msg-attachments/);
assert.match(aiCoreEnSource, /WebDevGymAiNotifications/);
assert.match(aiCoreEnSource, /file\.webdevgymPath/);
assert.match(aiCoreEnSource, /await aiRefreshProjectAttachments\(\)/);
assert.match(aiCoreEnSource, /WebDevGymAiAttachments/);
assert.match(aiCoreEnSource, /function aiRenderMarkdown/);
assert.match(aiCoreEnSource, /function aiGeneratedImageSource/);
assert.doesNotMatch(aiCoreEnSource, /aiSaveHistory\(\);\s*aiClearAttachments\(\);/);
assert.doesNotMatch(aiCoreEnSource, /images\/generations[\s\S]{0,800}\bn:\s*1/);

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
