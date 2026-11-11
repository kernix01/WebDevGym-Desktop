const path = require('path');
const { Linter } = require('eslint');
const ts = require('typescript');
const { HtmlValidate } = require('html-validate');
const stylelint = require('stylelint');

const linter = new Linter({ configType: 'flat' });
const htmlValidate = new HtmlValidate({ extends: ['html-validate:recommended'] });

const JAVASCRIPT_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);
const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);
const BROWSER_GLOBALS = [
  'AbortController', 'Audio', 'Blob', 'console', 'CustomEvent', 'document', 'Event',
  'fetch', 'File', 'FileReader', 'FormData', 'HTMLElement', 'history', 'Image',
  'IntersectionObserver', 'localStorage', 'location', 'MutationObserver', 'navigator',
  'Node', 'performance', 'requestAnimationFrame', 'ResizeObserver', 'sessionStorage',
  'setInterval', 'setTimeout', 'clearInterval', 'clearTimeout', 'URL', 'URLSearchParams',
  'WebSocket', 'window'
];

const globals = Object.fromEntries(BROWSER_GLOBALS.map(name => [name, 'readonly']));
Object.assign(globals, {
  __dirname: 'readonly',
  __filename: 'readonly',
  Buffer: 'readonly',
  exports: 'writable',
  global: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly'
});

function severity(value) {
  return value === 2 || value === 'error' ? 'error' : 'warning';
}

function positionFromOffset(content, offset = 0) {
  const safeOffset = Math.max(0, Math.min(Number(offset) || 0, content.length));
  const before = content.slice(0, safeOffset);
  const lines = before.split(/\r?\n/);
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function normalizedProblem(problem) {
  return {
    severity: severity(problem.severity),
    message: String(problem.message || 'Unknown problem'),
    line: Math.max(1, Number(problem.line) || 1),
    column: Math.max(1, Number(problem.column) || 1),
    endLine: Math.max(1, Number(problem.endLine || problem.line) || 1),
    endColumn: Math.max(1, Number(problem.endColumn || problem.column) || 1),
    source: String(problem.source || ''),
    rule: String(problem.rule || '')
  };
}

function diagnoseJavaScript(content, filePath) {
  const sourceType = path.extname(filePath).toLowerCase() === '.cjs' ? 'commonjs' : 'module';
  const messages = linter.verify(content, [{
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals
    },
    rules: {
      'no-class-assign': 'error',
      'no-const-assign': 'error',
      'no-dupe-keys': 'error',
      'no-func-assign': 'error',
      'no-redeclare': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'valid-typeof': 'error'
    }
  }], { filename: filePath });

  return messages.map(message => normalizedProblem({
    severity: message.severity,
    message: message.message,
    line: message.line,
    column: message.column,
    endLine: message.endLine,
    endColumn: message.endColumn,
    source: 'ESLint',
    rule: message.ruleId || 'syntax'
  }));
}

function diagnoseTypeScript(content, root, filePath) {
  const absolutePath = path.resolve(root, filePath);
  const options = {
    allowJs: false,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: false,
    target: ts.ScriptTarget.ES2022
  };
  const host = ts.createCompilerHost(options);
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);
  const sameFile = value => path.resolve(value).toLowerCase() === absolutePath.toLowerCase();
  host.fileExists = value => sameFile(value) || originalFileExists(value);
  host.readFile = value => sameFile(value) ? content : originalReadFile(value);
  host.getSourceFile = (value, languageVersion) => {
    const source = host.readFile(value);
    return source === undefined ? undefined : ts.createSourceFile(value, source, languageVersion, true);
  };

  const program = ts.createProgram([absolutePath], options, host);
  return ts.getPreEmitDiagnostics(program)
    .filter(item => !item.file || sameFile(item.file.fileName))
    .map(item => {
      const position = item.file && Number.isInteger(item.start)
        ? item.file.getLineAndCharacterOfPosition(item.start)
        : { line: 0, character: 0 };
      const end = item.file && Number.isInteger(item.start)
        ? item.file.getLineAndCharacterOfPosition(item.start + Math.max(1, item.length || 1))
        : position;
      return normalizedProblem({
        severity: item.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
        message: ts.flattenDiagnosticMessageText(item.messageText, ' '),
        line: position.line + 1,
        column: position.character + 1,
        endLine: end.line + 1,
        endColumn: end.character + 1,
        source: 'TypeScript',
        rule: `TS${item.code}`
      });
    });
}

async function diagnoseHtml(content, filePath) {
  const report = await htmlValidate.validateString(content, filePath);
  return report.results.flatMap(result => result.messages.map(message => normalizedProblem({
    severity: message.severity,
    message: message.message,
    line: message.line,
    column: message.column,
    endLine: message.line,
    endColumn: message.column + Math.max(1, message.size || 1),
    source: 'HTML Validate',
    rule: message.ruleId
  })));
}

async function diagnoseCss(content, filePath) {
  const report = await stylelint.lint({
    code: content,
    codeFilename: filePath,
    config: { extends: ['stylelint-config-standard'] }
  });
  return report.results.flatMap(result => result.warnings.map(message => normalizedProblem({
    severity: message.severity,
    message: message.text.replace(/\s*\([^()]+\)\s*$/, ''),
    line: message.line,
    column: message.column,
    endLine: message.endLine,
    endColumn: message.endColumn,
    source: 'Stylelint',
    rule: message.rule
  })));
}

async function diagnoseFile({ root = '', path: filePath = '', content = '' } = {}) {
  const extension = path.extname(String(filePath)).toLowerCase();
  let problems = [];
  if (JAVASCRIPT_EXTENSIONS.has(extension)) problems = diagnoseJavaScript(String(content), String(filePath));
  else if (TYPESCRIPT_EXTENSIONS.has(extension)) problems = diagnoseTypeScript(String(content), String(root), String(filePath));
  else if (extension === '.html' || extension === '.htm') problems = await diagnoseHtml(String(content), String(filePath));
  else if (extension === '.css') problems = await diagnoseCss(String(content), String(filePath));

  return problems
    .sort((left, right) => left.line - right.line || left.column - right.column || left.severity.localeCompare(right.severity))
    .slice(0, 200);
}

module.exports = { diagnoseFile, positionFromOffset };
