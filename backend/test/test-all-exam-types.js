const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null) {
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
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

async function runAllTests() {
  console.log('🚀 Starting ExamMatrix Full End-to-End Suite...\n');

  // 1. Unified Authentication Tests
  console.log('--- 1. Testing Unified Authentication ---');
  // Admin Login
  const adminRes = await request('POST', '/api/auth/login', { identifier: 'admin', password: 'admin123' });
  assert.strictEqual(adminRes.status, 200);
  assert.strictEqual(adminRes.body.user.role, 'admin');
  console.log('  ✅ Admin login successful:', adminRes.body.user.username);

  // Middleman Login
  const middlemanRes = await request('POST', '/api/auth/login', { identifier: 'examiner', password: 'exam123' });
  assert.strictEqual(middlemanRes.status, 200);
  assert.strictEqual(middlemanRes.body.user.role, 'examiner');
  console.log('  ✅ Middleman (examiner) login successful:', middlemanRes.body.user.username);

  // Student Login (Roll + APAAR)
  const studentRes = await request('POST', '/api/auth/login', { identifier: '24AI001', password: 'APAAR-2024-AIML-001' });
  assert.strictEqual(studentRes.status, 200);
  assert.strictEqual(studentRes.body.user.role, 'student');
  assert.strictEqual(studentRes.body.user.branch, 'AIML');
  assert.strictEqual(studentRes.body.user.section, 'A');
  console.log('  ✅ Single real student login successful: 24AI001 (AIML Section A)');

  // 2. Middleman Creates a SAP Enterprise Exam
  console.log('\n--- 2. Creating SAP Enterprise Exam ---');
  const sapExamRes = await request('POST', '/api/examiner/exams', {
    title: 'SAP S/4HANA Enterprise Systems Assessment',
    description: 'Assessment covering business processes, enterprise structures, and client transactions.',
    durationMinutes: 45,
    type: 'sap',
    targetBranches: ['AIML', 'CSE'],
    targetSections: ['A', 'B'],
    shuffleEnabled: true,
  });
  assert.strictEqual(sapExamRes.status, 201);
  const sapExamId = sapExamRes.body.exam.id;
  console.log('  ✅ SAP Exam created:', sapExamId, sapExamRes.body.exam.title);

  // 3. Middleman Bulk Uploads Questions (MCQ bits, SAP Multi-Select, Fill in Blanks)
  console.log('\n--- 3. Testing Middleman Bulk Upload API ---');
  const bulkText = `
TYPE: MULTI_SELECT
MARKS: 4
SCENARIO: Company XYZ is configuring organizational levels for Sales and Distribution in SAP S/4HANA.
QUESTION: Which of the following elements are mandatory components of a Sales Area? (Choose two)
[x] Sales Organization
[ ] Plant Code
[x] Distribution Channel
[ ] Storage Location
EXPLANATION: A Sales Area is uniquely defined by Sales Organization, Distribution Channel, and Division.

---

TYPE: MCQ
MARKS: 2
QUESTION: What is the primary in-memory database engine powering SAP S/4HANA?
( ) Oracle Exadata
(x) SAP HANA
( ) Microsoft SQL Server
( ) IBM DB2
EXPLANATION: SAP HANA is SAP's proprietary column-oriented in-memory database engine.

---

TYPE: FILL_BLANK
MARKS: 3
QUESTION: In SAP ERP, the central document created to record materials movements is called the _____ document.
ANSWER: Material
ACCEPTED: Material, Material Document, MatDoc
EXPLANATION: A material document is automatically generated when goods receipts or goods issues are posted.
`;

  const bulkRes = await request('POST', `/api/examiner/exams/${sapExamId}/bulk-upload`, {
    rawText: bulkText,
    format: 'text',
  });
  assert.strictEqual(bulkRes.status, 201);
  assert.strictEqual(bulkRes.body.count, 3);
  console.log(`  ✅ Bulk uploaded ${bulkRes.body.count} questions into exam ${sapExamId}`);

  // 4. Middleman Mistake Correction Test
  console.log('\n--- 4. Testing Middleman Mistake Correction ---');
  const examDetailsRes = await request('GET', `/api/examiner/exams/${sapExamId}`);
  const questions = examDetailsRes.body.questions;
  const blankQuestion = questions.find(q => q.type === 'fill_blank');
  assert(blankQuestion, 'Blank question should exist');

  // Middleman fixes the mistake: adds another accepted spelling
  const updateRes = await request('PUT', `/api/examiner/exams/${sapExamId}/questions/${blankQuestion.id}`, {
    ...blankQuestion,
    acceptedAnswers: ['Material', 'Material Document', 'MatDoc', 'mat doc'],
    explanation: 'Corrected mistake: now also accepts lowercase mat doc.',
  });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.body.question.acceptedAnswers.includes('mat doc'), true);
  console.log('  ✅ Mistake corrected live on answer key:', blankQuestion.id);

  // 5. Student Accesses Exam Lobby
  console.log('\n--- 5. Testing Student Exam Lobby & Eligibility ---');
  const studentLobbyRes = await request('GET', '/api/student/exams?branch=AIML&section=A&rollNumber=24AI001');
  assert.strictEqual(studentLobbyRes.status, 200);
  const examsList = studentLobbyRes.body.exams || studentLobbyRes.body;
  const matchedExam = examsList.find(e => e.id === sapExamId);
  assert(matchedExam, 'SAP Exam should appear in AIML-A student lobby');
  console.log('  ✅ Student 24AI001 found exam in lobby with type:', matchedExam.type);

  // 6. Student Starts Exam & Sanitization Security Check
  console.log('\n--- 6. Testing Paper Generation & Answer Sanitization ---');
  const takeRes = await request('GET', `/api/student/exams/${sapExamId}?rollNumber=24AI001`);
  assert.strictEqual(takeRes.status, 200);
  const studentPaperQuestions = takeRes.body.questions;
  assert.strictEqual(studentPaperQuestions.length, 3);

  // Security assertion: NO answers or accepted keys leaked to student
  for (const q of studentPaperQuestions) {
    assert.strictEqual(q.correctOptionIndex, undefined, 'correctOptionIndex MUST NOT be sent to student');
    assert.strictEqual(q.correctOptionIndices, undefined, 'correctOptionIndices MUST NOT be sent to student');
    assert.strictEqual(q.correctAnswer, undefined, 'correctAnswer MUST NOT be sent to student');
    assert.strictEqual(q.acceptedAnswers, undefined, 'acceptedAnswers MUST NOT be sent to student');
  }
  console.log('  ✅ Security verified: Zero answer keys or accepted answers leaked to student');

  // 7. Student Submits Answers and Gets Auto-Graded
  console.log('\n--- 7. Student Submission and Instant Auto-Grading ---');
  // Find questions in the student's shuffled paper
  const sMulti = studentPaperQuestions.find(q => q.type === 'multi_select');
  const sMcq = studentPaperQuestions.find(q => q.type === 'mcq');
  const sBlank = studentPaperQuestions.find(q => q.type === 'fill_blank');

  // Identify student's chosen option indices based on option text (since options were shuffled!)
  const multiIndices = sMulti.options
    .filter(opt => {
      const text = typeof opt === 'object' ? opt.text : opt;
      return text.toLowerCase().includes('sales organization') || text.toLowerCase().includes('distribution channel');
    })
    .map(opt => (typeof opt === 'object' && opt.originalIndex !== undefined ? opt.originalIndex : sMulti.options.indexOf(opt)));

  const matchedMcq = sMcq.options.find(opt => {
    const text = typeof opt === 'object' ? opt.text : opt;
    return text.toLowerCase().includes('sap hana');
  });
  const mcqIndex = matchedMcq ? (typeof matchedMcq === 'object' && matchedMcq.originalIndex !== undefined ? matchedMcq.originalIndex : 0) : 0;

  const submitRes = await request('POST', `/api/student/exams/${sapExamId}/submit`, {
    rollNumber: '24AI001',
    studentName: 'Aditya Varma',
    branch: 'AIML',
    section: 'A',
    answers: {
      [sMulti.id]: multiIndices,
      [sMcq.id]: mcqIndex,
      [sBlank.id]: 'mat doc', // tests case-insensitivity & middleman updated synonym!
    },
    codeAnswers: {},
    tabSwitchCount: 0,
  });

  assert.strictEqual(submitRes.status, 200);
  const sub = submitRes.body.submission;
  console.log(`  ✅ Exam Submitted! Score: ${sub.score}/${sub.totalMarks} (${sub.percentage}%) - Grade: ${sub.grade}`);
  assert.strictEqual(sub.score, sub.totalMarks, 'Student should get 100% with correct answers');
  assert.strictEqual(sub.percentage, 100);
  assert.strictEqual(sub.breakdowns.length, 3);
  assert.strictEqual(sub.breakdowns.every(b => b.isCorrect), true);
  console.log('  ✅ All questions including SAP multi-select, MCQ bits, and fill-in-blank scored correctly!');

  // 8. Admin Realtime Analytics Verification
  console.log('\n--- 8. Verifying Realtime Admin Analytics ---');
  const adminStatsRes = await request('GET', '/api/admin/analytics');
  assert.strictEqual(adminStatsRes.status, 200);
  const stats = adminStatsRes.body;
  const kpis = stats.kpis || {};
  console.log('  Stats Summary:');
  console.log(`    Total Submissions: ${kpis.totalSubmissions}`);
  console.log(`    College Avg: ${kpis.collegeAvgPercent}%`);
  console.log(`    Pass Rate: ${kpis.passRate}%`);
  console.log(`    Branch Stats for AIML:`, (stats.branchAnalytics || []).find(b => b.branch === 'AIML'));

  assert(kpis.totalSubmissions >= 1, 'Real submissions should exist in analytics');
  assert(kpis.passRate >= 0, 'Pass rate should be calculated');
  assert.strictEqual(kpis.collegeAvgPercent, 100, 'Real college average should be 100%');

  console.log('\n🎉 ALL FULL END-TO-END TESTS PASSED WITH 100% SUCCESS! 🎉\n');
}

runAllTests().catch((err) => {
  console.error('❌ Test suite error:', err);
  process.exit(1);
});
