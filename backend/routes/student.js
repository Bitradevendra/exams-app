const express = require('express');
const router = express.Router();
const db = require('../db');
const { prepareStudentPaper, assignPaperSet } = require('../shuffle');
const { evaluateTestCases } = require('../sandbox');

// Student Login by Roll Number + APAAR ID
router.post('/login', (req, res) => {
  const { rollNumber, apaarId, name, branch, section } = req.body;

  if (!rollNumber || !apaarId) {
    return res.status(400).json({ error: 'Roll Number and APAAR ID are required.' });
  }

  let student = db.findStudent(rollNumber, apaarId);

  // If not found in seed list, allow registering on the fly if student provided branch & section
  if (!student) {
    if (branch && section) {
      student = db.registerStudent({
        rollNumber,
        apaarId,
        name: name || `Student ${rollNumber}`,
        branch,
        section,
      });
    } else {
      return res.status(404).json({
        error: 'Invalid Roll Number or APAAR ID. Please check credentials or select a demo student.',
      });
    }
  }

  res.json({
    success: true,
    student,
  });
});

// List online exams allowed for this student based on branch & section
router.get('/exams', (req, res) => {
  const { branch, section, rollNumber } = req.query;

  if (!branch || !section) {
    return res.status(400).json({ error: 'Branch and Section are required to fetch exams.' });
  }

  const allExams = db.getExams();
  const submissions = rollNumber ? db.getStudentSubmissions(rollNumber) : [];

  // Filter exams that allow this student's branch & section
  const allowedExams = allExams.filter(exam => {
    const branchAllowed = exam.targetBranches.includes('ALL') || exam.targetBranches.includes(branch.toUpperCase());
    const sectionAllowed = exam.targetSections.includes('ALL') || exam.targetSections.includes(section.toUpperCase());
    return branchAllowed && sectionAllowed;
  });

  // Attach submission status
  const examsWithStatus = allowedExams.map(exam => {
    const existingSub = submissions.find(s => s.examId === exam.id);
    return {
      ...exam,
      hasSubmitted: !!existingSub,
      submissionId: existingSub ? existingSub.id : null,
      score: existingSub ? existingSub.score : null,
      percentage: existingSub ? existingSub.percentage : null,
    };
  });

  res.json({ exams: examsWithStatus });
});

// Fetch student-specific shuffled question paper
router.get('/exams/:id', (req, res) => {
  const { id } = req.params;
  const { rollNumber } = req.query;

  if (!rollNumber) {
    return res.status(400).json({ error: 'Roll Number query parameter is required for paper preparation.' });
  }

  const exam = db.getExamById(id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const questions = db.getQuestionsForExam(id);
  const paperSet = assignPaperSet(rollNumber);
  const studentQuestions = exam.shuffleEnabled
    ? prepareStudentPaper(exam, questions, rollNumber)
    : questions.map((q, idx) => ({
        id: q.id,
        displayNumber: idx + 1,
        type: q.type,
        questionText: q.questionText,
        scenarioContext: q.scenarioContext || undefined,
        options: (q.type === 'mcq' || q.type === 'multi_select') ? (q.options || []).map((opt, oIdx) => ({
          optionKey: String.fromCharCode(65 + oIdx),
          text: opt,
          originalIndex: oIdx,
        })) : undefined,
        placeholder: q.type === 'fill_blank' ? 'Type your answer here...' : undefined,
        problemStatement: q.type === 'coding' ? q.problemStatement : undefined,
        constraints: q.type === 'coding' ? q.constraints : undefined,
        starterCode: q.type === 'coding' ? q.starterCode : undefined,
        allowedLanguages: q.type === 'coding' ? q.allowedLanguages : undefined,
        sampleTestCases: q.type === 'coding' ? (q.testCases || []).filter(tc => !tc.isHidden).map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })) : undefined,
      }));

  res.json({
    exam: {
      id: exam.id,
      title: exam.title,
      code: exam.code,
      description: exam.description,
      type: exam.type,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      paperSet,
      totalQuestions: studentQuestions.length,
    },
    questions: studentQuestions,
  });
});

// Run code in real-time against sample / public test cases
router.post('/exams/:id/run-code', async (req, res) => {
  const { id } = req.params;
  const { questionId, language, code, customInput } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Language and code are required.' });
  }

  const questions = db.getQuestionsForExam(id);
  const question = questions.find(q => q.id === questionId);

  if (!question || question.type !== 'coding') {
    return res.status(404).json({ error: 'Coding question not found.' });
  }

  try {
    // If custom input is provided, run just for that input
    if (customInput !== undefined && customInput !== null) {
      const { executeCode } = require('../sandbox');
      const runResult = await executeCode(language, code, customInput);
      return res.json({
        customRun: true,
        input: customInput,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        executionTimeMs: runResult.executionTimeMs,
        success: runResult.success,
        timedOut: runResult.timedOut,
      });
    }

    // Run against public sample test cases
    const sampleCases = (question.testCases || []).filter(tc => !tc.isHidden);
    const evalResult = await evaluateTestCases(language, code, sampleCases);

    res.json(evalResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Exam with auto-grading (MCQ evaluation + Code sandbox execution)
router.post('/exams/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { rollNumber, studentName, branch, section, answers, codeAnswers, tabSwitchCount } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ error: 'Student Roll Number is required for submission.' });
  }

  const exam = db.getExamById(id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const questions = db.getQuestionsForExam(id);
  let totalScore = 0;
  const questionBreakdowns = [];

  for (const q of questions) {
    const qMarks = Number(q.marks) || 0;

    if (q.type === 'mcq') {
      // answers[q.id] is the originalIndex or selected option originalIndex
      const studentChosenIndex = answers && answers[q.id] !== undefined ? Number(answers[q.id]) : null;
      const isCorrect = studentChosenIndex !== null && studentChosenIndex === q.correctOptionIndex;
      const earned = isCorrect ? qMarks : 0;
      totalScore += earned;

      questionBreakdowns.push({
        questionId: q.id,
        type: 'mcq',
        questionText: q.questionText,
        options: q.options,
        studentChosenIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        marksPossible: qMarks,
        marksEarned: earned,
        scenarioContext: q.scenarioContext || '',
        explanation: q.explanation || '',
      });
    } else if (q.type === 'multi_select') {
      const studentChosen = Array.isArray(answers && answers[q.id])
        ? answers[q.id].map(Number)
        : (answers && answers[q.id] !== undefined ? [Number(answers[q.id])] : []);

      const correctIndices = (q.correctOptionIndices || []).map(Number);
      const correctlySelected = studentChosen.filter(idx => correctIndices.includes(idx));
      const incorrectlySelected = studentChosen.filter(idx => !correctIndices.includes(idx));

      const isExactMatch = correctIndices.length > 0 &&
        correctIndices.length === studentChosen.length &&
        correctlySelected.length === correctIndices.length;

      let earned = 0;
      if (isExactMatch) {
        earned = qMarks;
      } else if (correctIndices.length > 0 && incorrectlySelected.length === 0 && correctlySelected.length > 0) {
        earned = Math.round((correctlySelected.length / correctIndices.length) * qMarks);
      }

      totalScore += earned;

      questionBreakdowns.push({
        questionId: q.id,
        type: 'multi_select',
        questionText: q.questionText,
        options: q.options,
        studentChosenIndices: studentChosen,
        correctOptionIndices: correctIndices,
        isCorrect: isExactMatch,
        marksPossible: qMarks,
        marksEarned: earned,
        scenarioContext: q.scenarioContext || '',
        explanation: q.explanation || '',
      });
    } else if (q.type === 'fill_blank') {
      const rawStudent = answers && answers[q.id] !== undefined ? String(answers[q.id]) : '';
      const studentAnswer = rawStudent.trim();
      const caseSensitive = !!q.caseSensitive;
      const validAnswers = (Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length > 0)
        ? q.acceptedAnswers
        : (q.correctAnswer ? [q.correctAnswer] : []);

      const isCorrect = studentAnswer.length > 0 && validAnswers.some(ans => {
        if (!ans) return false;
        if (caseSensitive) {
          return studentAnswer === String(ans).trim();
        } else {
          return studentAnswer.toLowerCase() === String(ans).trim().toLowerCase();
        }
      });

      const earned = isCorrect ? qMarks : 0;
      totalScore += earned;

      questionBreakdowns.push({
        questionId: q.id,
        type: 'fill_blank',
        questionText: q.questionText,
        studentAnswer,
        correctAnswer: q.correctAnswer || (validAnswers[0] || ''),
        acceptedAnswers: validAnswers,
        isCorrect,
        marksPossible: qMarks,
        marksEarned: earned,
        explanation: q.explanation || '',
      });
    } else if (q.type === 'coding') {
      const codeSubmission = codeAnswers && codeAnswers[q.id];
      const code = codeSubmission ? codeSubmission.code : '';
      const language = (codeSubmission && codeSubmission.language) || 'python';

      if (!code || code.trim().length === 0) {
        questionBreakdowns.push({
          questionId: q.id,
          type: 'coding',
          questionText: q.questionText,
          code: '',
          language,
          isCorrect: false,
          marksPossible: qMarks,
          marksEarned: 0,
          testCaseResults: [],
          notes: 'No code submitted',
        });
      } else {
        // Evaluate against ALL test cases (including hidden)
        const evalResult = await evaluateTestCases(language, code, q.testCases || []);
        const earned = Math.round((evalResult.passedCount / (q.testCases.length || 1)) * qMarks);
        totalScore += earned;

        questionBreakdowns.push({
          questionId: q.id,
          type: 'coding',
          questionText: q.questionText,
          code,
          language,
          isCorrect: evalResult.allPassed,
          passedCount: evalResult.passedCount,
          totalTestCases: evalResult.totalTestCases,
          marksPossible: qMarks,
          marksEarned: earned,
          testCaseResults: evalResult.results,
        });
      }
    }
  }

  const percentage = exam.totalMarks > 0 ? Math.round((totalScore / exam.totalMarks) * 100) : 0;

  // Grade calculation
  let grade = 'F';
  if (percentage >= 90) grade = 'O (Outstanding)';
  else if (percentage >= 80) grade = 'A+ (Excellent)';
  else if (percentage >= 70) grade = 'A (Very Good)';
  else if (percentage >= 60) grade = 'B+ (Good)';
  else if (percentage >= 50) grade = 'B (Above Average)';
  else if (percentage >= 40) grade = 'C (Pass)';

  const submission = db.saveSubmission({
    examId: id,
    examTitle: exam.title,
    rollNumber,
    studentName: studentName || `Student ${rollNumber}`,
    branch: (branch || 'CSE').toUpperCase(),
    section: (section || 'A').toUpperCase(),
    score: totalScore,
    totalMarks: exam.totalMarks,
    percentage,
    grade,
    tabSwitchCount: Number(tabSwitchCount) || 0,
    answers: answers || {},
    codeAnswers: codeAnswers || {},
    breakdowns: questionBreakdowns,
  });

  res.json({
    success: true,
    submission,
  });
});

// Retrieve student submission result
router.get('/submissions/:id', (req, res) => {
  const submission = db.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }
  res.json({ submission });
});

module.exports = router;
