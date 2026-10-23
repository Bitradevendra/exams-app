const { executeCode, evaluateTestCases } = require('../sandbox');
const assert = require('assert');

async function test() {
  console.log('Testing multi-line input handling in sandbox...');
  const code = `
a = input().strip()
b = input().strip()
print(f"{a}+{b}")
`;
  const res = await executeCode('python', code, 'hello\nworld\n');
  assert.strictEqual(res.stdout.trim(), 'hello+world');
  console.log('✅ Multi-line input test passed:', res.stdout.trim());

  // Test syntax error capture
  console.log('Testing Python syntax error capture...');
  const badCode = 'def invalid syntax (';
  const errRes = await executeCode('python', badCode, '');
  assert.strictEqual(errRes.success, false);
  assert.ok(errRes.stderr.includes('SyntaxError'));
  console.log('✅ Syntax error cleanly captured in stderr without server crash');
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
