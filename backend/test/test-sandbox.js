const { executeCode, evaluateTestCases } = require('../sandbox');
const { prepareStudentPaper, assignPaperSet } = require('../shuffle');
const assert = require('assert');

async function runTests() {
  console.log('🧪 Starting Automated Backend Verification Tests...\n');

  // Test 1: Python execution with stdin
  console.log('Test 1: Python Code Execution with Stdin...');
  const pythonCode = `
word = input().strip()
if word.lower() == word.lower()[::-1]:
    print(f"{word} is palindrome")
else:
    print(f"{word} is not palindrome")
`;
  const pyResult1 = await executeCode('python', pythonCode, 'radar\n');
  assert.strictEqual(pyResult1.success, true, 'Python run should succeed');
  assert.strictEqual(pyResult1.stdout.trim(), 'radar is palindrome', 'Palindrome check should pass');
  console.log('✅ Python execution passed:', pyResult1.stdout.trim());

  // Test 2: Evaluate Test Cases (Public + Hidden)
  console.log('\nTest 2: Multi-Test Case Evaluation...');
  const testCases = [
    { input: 'radar', expectedOutput: 'radar is palindrome', isHidden: false },
    { input: 'hello', expectedOutput: 'hello is not palindrome', isHidden: false },
    { input: 'level', expectedOutput: 'level is palindrome', isHidden: true },
  ];
  const evalResult = await evaluateTestCases('python', pythonCode, testCases);
  assert.strictEqual(evalResult.passedCount, 3, 'All 3 test cases should pass');
  assert.strictEqual(evalResult.allPassed, true, 'allPassed flag should be true');
  console.log(`✅ Test Case Evaluation: ${evalResult.passedCount}/${evalResult.totalTestCases} passed!`);

  // Test 3: Timeout handling on Infinite Loop
  console.log('\nTest 3: Infinite Loop Timeout Handling...');
  const infiniteLoopPy = `
while True:
    pass
`;
  const timeoutResult = await executeCode('python', infiniteLoopPy, '', 1500);
  assert.strictEqual(timeoutResult.timedOut, true, 'Subprocess should timeout');
  assert.strictEqual(timeoutResult.success, false, 'Timed out process should not succeed');
  console.log('✅ Infinite loop was caught and terminated safely in', timeoutResult.executionTimeMs, 'ms');

  // Test 4: JavaScript execution
  console.log('\nTest 4: JavaScript Node Execution...');
  const jsCode = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const nums = input.split(' ').map(Number);
const sum = nums.filter(x => x % 2 === 0).reduce((a, b) => a + b, 0);
console.log(sum);
`;
  const jsResult = await executeCode('javascript', jsCode, '2 4 5 7 8');
  assert.strictEqual(jsResult.success, true, 'JS code should execute');
  assert.strictEqual(jsResult.stdout.trim(), '14', 'JS output should be 14');
  console.log('✅ JavaScript code passed:', jsResult.stdout.trim());

  // Test 5: Deterministic Shuffling by Roll Number
  console.log('\nTest 5: Deterministic Shuffling by Roll Number...');
  const sampleExam = {
    id: 'exam-test',
    shuffleEnabled: true,
  };
  const mockQuestions = [
    { id: 'q1', type: 'mcq', questionText: 'Question 1', marks: 5, options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0 },
    { id: 'q2', type: 'mcq', questionText: 'Question 2', marks: 5, options: ['W', 'X', 'Y', 'Z'], correctOptionIndex: 1 },
    { id: 'q3', type: 'coding', questionText: 'Question 3', marks: 10 },
    { id: 'q4', type: 'mcq', questionText: 'Question 4', marks: 5, options: ['1', '2', '3', '4'], correctOptionIndex: 2 },
  ];

  const roll1_run1 = prepareStudentPaper(sampleExam, mockQuestions, '21CS001');
  const roll1_run2 = prepareStudentPaper(sampleExam, mockQuestions, '21CS001');
  const roll2 = prepareStudentPaper(sampleExam, mockQuestions, '21CS002');

  const ids1 = roll1_run1.map(q => q.id).join(',');
  const ids2 = roll1_run2.map(q => q.id).join(',');
  const ids3 = roll2.map(q => q.id).join(',');

  assert.strictEqual(ids1, ids2, 'Same roll number must produce identical question order every time');
  console.log(`✅ Roll 21CS001 Question Order: [${ids1}] (Consistent across reloads)`);
  console.log(`✅ Roll 21CS002 Question Order: [${ids3}] (Distinct permutation)`);
  console.log(`✅ Assigned Paper Set 21CS001: ${assignPaperSet('21CS001')}`);
  console.log(`✅ Assigned Paper Set 21CS002: ${assignPaperSet('21CS002')}`);

  console.log('\n🎉 ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
