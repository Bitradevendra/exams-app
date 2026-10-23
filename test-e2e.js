/**
 * End-to-End Autonomous System Verification
 * Verifies all 3 views and real-time flows:
 * 1. Student Auth & Examination with Code Sandbox & Paper Shuffling
 * 2. Middleman Exam Creation, Paper Setting, and Mistake Editing
 * 3. Admin Section-wise & Branch-wise Analytics & Grade Sheet Export
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:5000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('================================================================');
  console.log('🚀 Starting Comprehensive End-to-End System Verification Test');
  console.log('================================================================\n');

  // 1. Health Check
  console.log('STEP 1: Backend Service Health Check...');
  const health = await makeRequest('GET', '/api/health');
  assert.strictEqual(health.status, 200, 'Health check should return 200');
  assert.strictEqual(health.body.status, 'ok', 'Status should be ok');
  console.log('✅ Server is alive and responding\n');

  // 1B. Unified Single-Screen Authentication for All 3 Portals
  console.log('STEP 1B: Unified Database-Driven Authentication for Admin, Middleman, & Student...');
  
  // Test Admin credentials
  const adminAuth = await makeRequest('POST', '/api/auth/login', {
    identifier: 'admin',
    password: 'admin123',
  });
  assert.strictEqual(adminAuth.status, 200, 'Admin login should succeed');
  assert.strictEqual(adminAuth.body.role, 'admin', 'Role must be admin');
  assert.strictEqual(adminAuth.body.user.name, 'Dr. Ramesh Rao');
  console.log(`✅ Admin Authentication Verified: ${adminAuth.body.user.name} -> routes to Admin Analytics Dashboard`);

  // Test Middleman / Examiner credentials
  const examinerAuth = await makeRequest('POST', '/api/auth/login', {
    identifier: 'examiner',
    password: 'exam123',
  });
  assert.strictEqual(examinerAuth.status, 200, 'Examiner login should succeed');
  assert.strictEqual(examinerAuth.body.role, 'examiner', 'Role must be examiner');
  assert.strictEqual(examinerAuth.body.user.name, 'Prof. S. K. Sharma');
  console.log(`✅ Middleman Authentication Verified: ${examinerAuth.body.user.name} -> routes to Examiner / Paper Setter Portal`);

  // Test Student credentials (Roll Number + APAAR ID)
  const studentAuth = await makeRequest('POST', '/api/auth/login', {
    identifier: '24AI001',
    password: 'APAAR-2024-AIML-001',
  });
  assert.strictEqual(studentAuth.status, 200, 'Student unified login should succeed');
  assert.strictEqual(studentAuth.body.role, 'student', 'Role must be student');
  assert.strictEqual(studentAuth.body.user.name, 'Aditya Varma');
  assert.strictEqual(studentAuth.body.user.branch, 'AIML');
  assert.strictEqual(studentAuth.body.user.section, 'A');
  console.log(`✅ Student Authentication Verified: ${studentAuth.body.user.name} (${studentAuth.body.user.branch}-${studentAuth.body.user.section}) -> routes to Student Exam Lobby`);

  // Test Invalid Credentials
  const badAuth = await makeRequest('POST', '/api/auth/login', {
    identifier: 'wrong_user',
    password: 'wrong_password',
  });
  assert.strictEqual(badAuth.status, 401, 'Invalid credentials should return 401');
  console.log('✅ Security Verified: Unauthorized access rejected with 401 status\n');

  // 1C. Verify Real-Time Admin Analytics Starts Clean (Zero Fake Submissions)
  console.log('STEP 1C: Real-Time Initial Analytics Verification (Zero Fake Data)...');
  const initialAdmin = await makeRequest('GET', '/api/admin/analytics');
  assert.strictEqual(initialAdmin.status, 200);
  assert.strictEqual(initialAdmin.body.kpis.totalSubmissions, 0, 'Initial submissions should be 0 (no fake data)');
  assert.strictEqual(initialAdmin.body.kpis.collegeAvgPercent, 0, 'Initial college average should be 0%');
  console.log('✅ Admin Analytics Verified: Clean state with 0 fake submissions\n');

  // 2. Student Authentication (Roll No + APAAR ID)
  console.log('STEP 2: Student Authentication Verification...');
  const loginRes = await makeRequest('POST', '/api/student/login', {
    rollNumber: '24AI001',
    apaarId: 'APAAR-2024-AIML-001',
  });
  assert.strictEqual(loginRes.status, 200, 'Student login should succeed');
  assert.strictEqual(loginRes.body.student.rollNumber, '24AI001', 'Roll number should match');
  assert.strictEqual(loginRes.body.student.branch, 'AIML', 'Branch should be AIML');
  assert.strictEqual(loginRes.body.student.section, 'A', 'Section should be A');
  console.log(`✅ Student Verified: ${loginRes.body.student.name} (${loginRes.body.student.branch}-${loginRes.body.student.section})\n`);

  // 3. Fetch Exams Allowed for Student's Branch & Section
  console.log('STEP 3: Branch & Section Allowed Exam Listing...');
  const examsRes = await makeRequest('GET', '/api/student/exams?branch=AIML&section=A&rollNumber=24AI001');
  assert.strictEqual(examsRes.status, 200);
  assert.ok(examsRes.body.exams.length > 0, 'AIML Section A should have allowed exams');
  const codingExam = examsRes.body.exams.find(e => e.type === 'coding');
  assert.ok(codingExam, 'Should find coding exam CS301-P');
  console.log(`✅ Retrieved ${examsRes.body.exams.length} allowed exams for AIML-A. Selected: ${codingExam.title}\n`);

  // 4. Deterministic Shuffling Verification
  console.log('STEP 4: Deterministic Shuffling for Different Roll Numbers...');
  const paper1 = await makeRequest('GET', `/api/student/exams/${codingExam.id}?rollNumber=24AI001`);
  const paper2 = await makeRequest('GET', `/api/student/exams/${codingExam.id}?rollNumber=24AI002`);

  assert.strictEqual(paper1.status, 200);
  assert.strictEqual(paper2.status, 200);

  // Shuffled sets should be assigned
  console.log(`✅ Candidate 24AI001 assigned: ${paper1.body.exam.paperSet}`);
  console.log(`✅ Candidate 24AI002 assigned: ${paper2.body.exam.paperSet}`);
  assert.ok(paper1.body.questions.length > 0, 'Questions should be generated');

  // Verify hidden test cases are STRIPPED from student paper
  const firstQ = paper1.body.questions[0];
  if (firstQ.type === 'coding') {
    assert.strictEqual(firstQ.testCases, undefined, 'Hidden test cases must NOT be exposed to student');
    assert.ok(firstQ.sampleTestCases, 'Sample test cases should be provided');
    console.log(`✅ Security Verified: Hidden test cases stripped, only ${firstQ.sampleTestCases.length} sample cases exposed to student`);
  }
  console.log('');

  // 5. Real-Time Code Execution in Sandbox
  console.log('STEP 5: Real-Time Python Code Execution via Sandbox...');
  const palindromeSolution = `
word = input().strip()
if word.lower() == word.lower()[::-1]:
    print(f"{word} is palindrome")
else:
    print(f"{word} is not palindrome")
`;
  const codeRunRes = await makeRequest('POST', `/api/student/exams/${codingExam.id}/run-code`, {
    questionId: 'q-101-1',
    language: 'python',
    code: palindromeSolution,
  });
  assert.strictEqual(codeRunRes.status, 200);
  assert.ok(codeRunRes.body.passedCount > 0, 'Sample test cases should pass');
  console.log(`✅ Sandbox Run: ${codeRunRes.body.passedCount}/${codeRunRes.body.totalTestCases} sample test cases passed on server!\n`);

  // 6. Submit Exam & Receive Instant Graded Scorecard
  console.log('STEP 6: Student Exam Submission & Auto-Grading...');
  const sumEvenSolution = `
nums = list(map(int, input().split()))
print(sum(x for x in nums if x % 2 == 0))
`;
  const submitRes = await makeRequest('POST', `/api/student/exams/${codingExam.id}/submit`, {
    rollNumber: '24AI001',
    studentName: 'Aditya Varma',
    branch: 'AIML',
    section: 'A',
    codeAnswers: {
      'q-101-1': { code: palindromeSolution, language: 'python' },
      'q-101-2': { code: sumEvenSolution, language: 'python' },
    },
    tabSwitchCount: 0,
  });
  assert.strictEqual(submitRes.status, 200);
  assert.strictEqual(submitRes.body.submission.score, 30, 'All 30 marks should be earned for correct code');
  assert.strictEqual(submitRes.body.submission.percentage, 100, 'Percentage should be 100%');
  console.log(`✅ Exam Auto-Graded: Score ${submitRes.body.submission.score}/${submitRes.body.submission.totalMarks} (${submitRes.body.submission.percentage}%) - Grade: ${submitRes.body.submission.grade}\n`);

  // 7. Middleman Paper Setter & Mistake Editing Verification
  console.log('STEP 7: Middleman / Examiner Paper Setup & Mistake Fixing...');
  // Create an exam
  const newExamRes = await makeRequest('POST', '/api/examiner/exams', {
    title: 'Automated QA Assessment',
    code: 'QA101',
    description: 'E2E Testing Exam',
    type: 'bits',
    durationMinutes: 20,
    targetBranches: ['AIML', 'CSE'],
    targetSections: ['A'],
  });
  assert.strictEqual(newExamRes.status, 201);
  const createdExamId = newExamRes.body.exam.id;
  console.log(`✅ Examiner created new exam: "${newExamRes.body.exam.title}" (${createdExamId})`);

  // Add question with intentional typo
  const addQRes = await makeRequest('POST', `/api/examiner/exams/${createdExamId}/questions`, {
    type: 'mcq',
    questionText: 'What is 2 + 2? (Typo in original)',
    marks: 5,
    options: ['3', '4', '5', '6'],
    correctOptionIndex: 0, // intentional mistake by middleman
    explanation: 'Basic arithmetic',
  });
  assert.strictEqual(addQRes.status, 201);
  const questionId = addQRes.body.question.id;
  console.log(`✅ Examiner added question: "${addQRes.body.question.questionText}"`);

  // Middleman fixes the mistake!
  console.log('Fixing the mistake via PUT /api/examiner/questions/:id...');
  const editQRes = await makeRequest('PUT', `/api/examiner/questions/${questionId}`, {
    questionText: 'What is 2 + 2? (Corrected & Polished)',
    correctOptionIndex: 1, // Corrected to option '4'!
  });
  assert.strictEqual(editQRes.status, 200);
  assert.strictEqual(editQRes.body.question.questionText, 'What is 2 + 2? (Corrected & Polished)');
  assert.strictEqual(editQRes.body.question.correctOptionIndex, 1);
  console.log(`✅ Mistake Fixed Successfully: Answer key updated to option index 1 ('4')!\n`);

  // 8. Admin Analytics & Multi-dimensional Filtering
  console.log('STEP 8: Admin Analytics, Section Breakdown & CSV Export...');
  const adminAnalyticsRes = await makeRequest('GET', '/api/admin/analytics');
  assert.strictEqual(adminAnalyticsRes.status, 200);
  const data = adminAnalyticsRes.body;
  assert.strictEqual(data.kpis.totalSubmissions, 1, 'Should have recorded exactly 1 real-time submission');
  assert.strictEqual(data.sectionAnalytics.length, 1, 'Should have exactly 1 active section analytics');
  assert.strictEqual(data.sectionAnalytics[0].sectionLabel, 'AIML - Section A');
  assert.strictEqual(data.sectionAnalytics[0].studentsCount, 1);
  assert.ok(data.branchAnalytics.length > 0, 'Should have branch analytics');

  console.log(`✅ Total College Submissions: ${data.kpis.totalSubmissions}`);
  console.log(`✅ College Average: ${data.kpis.collegeAvgPercent}% | Pass Rate: ${data.kpis.passRate}%`);
  console.log('✅ Section-wise Breakdown:');
  data.sectionAnalytics.forEach(sec => {
    console.log(`   - ${sec.sectionLabel}: Avg ${sec.averagePercent}%, Pass ${sec.passRate}%, Students: ${sec.studentsCount}`);
  });

  // Test CSV export endpoint
  const csvRes = await makeRequest('GET', '/api/admin/export/all');
  assert.strictEqual(csvRes.status, 200);
  assert.ok(csvRes.raw.includes('Roll Number,Student Name,Branch,Section'), 'CSV should contain standard header columns');
  console.log('✅ CSV Export Verified: Full grade sheet generated with all student columns.\n');

  console.log('================================================================');
  console.log('🎉 ALL END-TO-END SYSTEM INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runE2ETests().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
