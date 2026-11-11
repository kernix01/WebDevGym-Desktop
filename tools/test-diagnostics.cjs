const assert = require('node:assert/strict');
const path = require('node:path');
const { diagnoseFile, positionFromOffset } = require('../electron/diagnostics.cjs');

async function run() {
  const root = path.resolve(__dirname, '..');

  const javascript = await diagnoseFile({
    root,
    path: 'script.js',
    content: 'const unused = 1;\nmissing();'
  });
  assert(javascript.some(problem => problem.rule === 'no-undef' && problem.line === 2));
  assert(javascript.some(problem => problem.rule === 'no-unused-vars' && problem.severity === 'warning'));

  const typescript = await diagnoseFile({
    root,
    path: 'types.ts',
    content: 'const count: number = "wrong";'
  });
  assert(typescript.some(problem => problem.rule === 'TS2322'));

  const html = await diagnoseFile({
    root,
    path: 'index.html',
    content: '<main><img src="cover.png"></main>'
  });
  assert(html.some(problem => problem.rule === 'wcag/h37'));

  const css = await diagnoseFile({
    root,
    path: 'style.css',
    content: 'a { color: #FFFFF; }'
  });
  assert(css.some(problem => problem.rule === 'declaration-property-value-no-unknown'));

  assert.deepEqual(await diagnoseFile({ root, path: 'README.md', content: '# Fine' }), []);
  assert.deepEqual(positionFromOffset('one\ntwo', 5), { line: 2, column: 2 });

  console.log('Desktop diagnostics tests passed.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
