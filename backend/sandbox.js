const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

/**
 * Normalizes output string for fair comparison (trims trailing whitespace/newlines, handles CRLF).
 */
function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Executes code in a subprocess with input piped into stdin.
 * @param {string} language - 'python' or 'javascript'
 * @param {string} code - source code string
 * @param {string} input - input to pass via stdin
 * @param {number} timeoutMs - maximum allowed execution time in ms (default 4000)
 */
async function executeCode(language, code, input = '', timeoutMs = 4000) {
  const tempDir = os.tmpdir();
  const fileId = uuidv4();
  let tempFilePath = '';
  let cmd = '';
  let args = [];

  let javaDir = null;

  if (language === 'python' || language === 'python3' || language === 'py') {
    tempFilePath = path.join(tempDir, `exam_run_${fileId}.py`);
    cmd = 'python';
    args = [tempFilePath];
    await fs.promises.writeFile(tempFilePath, code, 'utf-8');
  } else if (language === 'javascript' || language === 'nodejs' || language === 'js') {
    tempFilePath = path.join(tempDir, `exam_run_${fileId}.js`);
    cmd = 'node';
    args = [tempFilePath];
    await fs.promises.writeFile(tempFilePath, code, 'utf-8');
  } else if (language === 'java') {
    javaDir = path.join(tempDir, `exam_java_${fileId}`);
    await fs.promises.mkdir(javaDir, { recursive: true });
    const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/) || code.match(/class\s+([A-Za-z0-9_]+)/);
    const className = match ? match[1] : 'Main';
    tempFilePath = path.join(javaDir, `${className}.java`);
    await fs.promises.writeFile(tempFilePath, code, 'utf-8');

    // Compile first with javac
    const compileResult = await new Promise((res) => {
      const compileProc = spawn('javac', [tempFilePath], { windowsHide: true });
      let compileErr = '';
      compileProc.stderr.on('data', (d) => { compileErr += d.toString(); });
      compileProc.on('close', (exitC) => {
        res({ success: exitC === 0, error: compileErr });
      });
    });

    if (!compileResult.success) {
      try {
        await fs.promises.rm(javaDir, { recursive: true, force: true });
      } catch (e) {}
      return {
        success: false,
        timedOut: false,
        exitCode: 1,
        stdout: '',
        stderr: 'Compilation Error:\n' + compileResult.error,
        executionTimeMs: 0
      };
    }

    cmd = 'java';
    args = ['-cp', javaDir, className];
  } else {
    throw new Error(`Unsupported language: ${language}. Supported languages are 'python', 'javascript', and 'java'.`);
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', async (exitCode) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;

      // Clean up temp file
      try {
        if (javaDir) {
          await fs.promises.rm(javaDir, { recursive: true, force: true });
        } else if (fs.existsSync(tempFilePath)) {
          await fs.promises.unlink(tempFilePath);
        }
      } catch (err) {
        console.error('Failed to cleanup temp script:', err.message);
      }

      if (timedOut) {
        return resolve({
          success: false,
          timedOut: true,
          exitCode: null,
          stdout: stdout.trim(),
          stderr: 'Time Limit Exceeded (Execution exceeded ' + timeoutMs / 1000 + 's)',
          executionTimeMs,
        });
      }

      resolve({
        success: exitCode === 0,
        timedOut: false,
        exitCode,
        stdout: stdout,
        stderr: stderr.trim(),
        executionTimeMs,
      });
    });

    child.on('error', async (err) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(tempFilePath)) {
          await fs.promises.unlink(tempFilePath);
        }
      } catch (cleanupErr) {}

      resolve({
        success: false,
        timedOut: false,
        exitCode: -1,
        stdout: '',
        stderr: err.message,
        executionTimeMs: Date.now() - startTime,
      });
    });
  });
}

/**
 * Runs code against an array of test cases.
 * @param {string} language
 * @param {string} code
 * @param {Array<{input: string, expectedOutput: string, isHidden?: boolean}>} testCases
 */
async function evaluateTestCases(language, code, testCases = []) {
  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const run = await executeCode(language, code, tc.input || '');
    const actualNormalized = normalizeOutput(run.stdout);
    const expectedNormalized = normalizeOutput(tc.expectedOutput || '');
    const passed = run.success && actualNormalized === expectedNormalized;

    if (passed) passedCount++;

    results.push({
      testCaseNumber: i + 1,
      input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
      expectedOutput: tc.isHidden ? '[Hidden Output]' : tc.expectedOutput,
      actualOutput: tc.isHidden && !passed ? (run.stderr ? 'Runtime Error: ' + run.stderr : '[Hidden Failure]') : actualNormalized,
      passed,
      executionTimeMs: run.executionTimeMs,
      error: run.stderr || null,
      timedOut: run.timedOut,
      isHidden: !!tc.isHidden,
    });
  }

  const allPassed = passedCount === testCases.length && testCases.length > 0;
  const scorePercent = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;

  return {
    totalTestCases: testCases.length,
    passedCount,
    allPassed,
    scorePercent,
    results,
  };
}

module.exports = {
  executeCode,
  evaluateTestCases,
  normalizeOutput,
};
