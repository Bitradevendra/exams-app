const express = require('express');
const router = express.Router();
const db = require('../db');
const { prepareStudentPaper, assignPaperSet } = require('../shuffle');
const { evaluateTestCases } = require('../sandbox');

// List all exams
router.get('/exams', (req, res) => {
  const exams = db.getExams();
  const enhanced = exams.map(exam => {
    const questions = db.getQuestionsForExam(exam.id);
    const submissions = db.getSubmissions(exam.id);
    return {
      ...exam,
      questionCount: questions.length,
      submissionCount: submissions.length,
    };
  });
  res.json({ exams: enhanced });
});

// Get single exam with complete details (questions, keys, test cases)
router.get('/exams/:id', (req, res) => {
  const exam = db.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }
  const questions = db.getQuestionsForExam(req.params.id);
  res.json({ exam, questions });
});

// Create new exam
router.post('/exams', (req, res) => {
  const {
    title,
    code,
    description,
    type,
    durationMinutes,
    targetBranches,
    targetSections,
    shuffleEnabled,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Exam title is required.' });
  }

  const newExam = db.createExam({
    title,
    code,
    description,
    type: type || 'bits',
    durationMinutes: Number(durationMinutes) || 45,
    targetBranches: targetBranches || ['CSE'],
    targetSections: targetSections || ['A'],
    shuffleEnabled: shuffleEnabled !== false,
  });

  res.status(201).json({ success: true, exam: newExam });
});

// Edit exam settings
router.put('/exams/:id', (req, res) => {
  const updated = db.updateExam(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Exam not found.' });
  }
  res.json({ success: true, exam: updated });
});

// Delete exam
router.delete('/exams/:id', (req, res) => {
  const success = db.deleteExam(req.params.id);
  res.json({ success });
});

// Add question to exam (MCQ Bits or Coding problem)
router.post('/exams/:id/questions', (req, res) => {
  const exam = db.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const question = db.addQuestion(req.params.id, req.body);
  res.status(201).json({ success: true, question });
});

// Edit existing question (Middleman fix mistakes!)
router.put(['/questions/:id', '/exams/:examId/questions/:id'], (req, res) => {
  const updated = db.updateQuestion(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Question not found.' });
  }
  res.json({ success: true, question: updated });
});

// Delete question
router.delete(['/questions/:id', '/exams/:examId/questions/:id'], (req, res) => {
  const success = db.deleteQuestion(req.params.id);
  res.json({ success });
});

// Bulk upload questions (JSON or structured text for Bits & Blanks)
router.post('/exams/:id/bulk-upload', (req, res) => {
  const exam = db.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const { questions, rawText } = req.body;
  let parsedQuestions = [];

  if (Array.isArray(questions) && questions.length > 0) {
    parsedQuestions = questions;
  } else if (typeof rawText === 'string' && rawText.trim().length > 0) {
    const trimmed = rawText.trim();
    // Check if JSON
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsedQuestions = JSON.parse(trimmed);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON question array: ' + err.message });
      }
    } else {
      // Structured text parser supporting --- dividers or blank line separators
      // Split on either --- or multiple newlines
      const rawBlocks = trimmed.split(/(?:\r?\n\s*[-=_]{3,}\s*\r?\n)|(?:\r?\n\s*\r?\n)+/);
      for (const block of rawBlocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l && !l.match(/^[-=_]{3,}$/));
        if (lines.length === 0) continue;

        let type = 'mcq';
        let questionText = '';
        const options = [];
        let correctOptionIndex = 0;
        let correctOptionIndices = [];
        let correctAnswer = '';
        let acceptedAnswers = [];
        let marks = 2;
        let explanation = '';
        let scenarioContext = '';

        for (const line of lines) {
          const lower = line.toLowerCase();
          if (lower.startsWith('[blank]') || lower.startsWith('[fill_blank]') || lower.startsWith('[fill in the blank]') || lower.startsWith('type: fill_blank') || lower.startsWith('type: blank')) {
            type = 'fill_blank';
          } else if (lower.startsWith('[multi_select]') || lower.startsWith('[sap]') || lower.startsWith('[multiple_choice]') || lower.startsWith('type: multi_select') || lower.startsWith('type: sap')) {
            type = 'multi_select';
          } else if (lower.startsWith('[mcq]') || lower.startsWith('[bit]') || lower.startsWith('type: mcq') || lower.startsWith('type: bit')) {
            type = 'mcq';
          } else if (line.match(/^(scenario|case|context):/i)) {
            scenarioContext = line.replace(/^(scenario|case|context):\s*/i, '').trim();
          } else if (line.match(/^q(\d*|\.)?:/i) || line.match(/^question:/i)) {
            questionText = line.replace(/^(q(\d*|\.)?|question):\s*/i, '').trim();
          } else if (line.match(/^\[([ xX*])\]/i) || line.match(/^\(([ xX*])\)/i)) {
            // Checkbox [x] or radio (x)
            const isChecked = line.match(/^\[[xX*]\]/) || line.match(/^\([xX*]\)/);
            const cleanOpt = line.replace(/^(\[[ xX*]\]|\([ xX*]\))\s*/i, '').replace(/\*$/, '').trim();
            if (isChecked) {
              correctOptionIndex = options.length;
              correctOptionIndices.push(options.length);
            }
            options.push(cleanOpt);
          } else if (line.match(/^[A-D]\)/i) || line.match(/^[A-D]\./i)) {
            const isStar = line.includes('*');
            const cleanOpt = line.replace(/^[A-D][\)\.]\s*/i, '').replace(/\*$/, '').trim();
            if (isStar) {
              correctOptionIndex = options.length;
              correctOptionIndices.push(options.length);
            }
            options.push(cleanOpt);
          } else if (line.match(/^(answer|key|ans):/i)) {
            const val = line.replace(/^(answer|key|ans):\s*/i, '').trim();
            // Check if multiple letter keys e.g. "A, C" or "A,B"
            if (val.match(/^[A-D](\s*,\s*[A-D])+$/i)) {
              type = 'multi_select';
              correctOptionIndices = val.split(',').map(s => s.trim().toUpperCase().charCodeAt(0) - 65);
            } else if (val.match(/^[A-D]$/i)) {
              correctOptionIndex = val.toUpperCase().charCodeAt(0) - 65;
              correctOptionIndices = [correctOptionIndex];
            } else {
              correctAnswer = val;
              acceptedAnswers = val.split(',').map(s => s.trim()).filter(Boolean);
            }
          } else if (line.match(/^accepted:/i)) {
            const val = line.replace(/^accepted:\s*/i, '').trim();
            acceptedAnswers = val.split(',').map(s => s.trim()).filter(Boolean);
          } else if (line.match(/^marks:/i)) {
            marks = Number(line.replace(/^marks:\s*/i, '').trim()) || 2;
          } else if (line.match(/^explanation:/i)) {
            explanation = line.replace(/^explanation:\s*/i, '').trim();
          } else if (!questionText) {
            questionText = line;
          }
        }

        if (questionText) {
          if (type === 'mcq' && options.length === 0) {
            if (correctAnswer) type = 'fill_blank';
          }

          if (type === 'multi_select' && correctOptionIndices.length === 0) {
            correctOptionIndices = [correctOptionIndex];
          }

          parsedQuestions.push({
            type,
            questionText,
            scenarioContext,
            options: (type === 'mcq' || type === 'multi_select') ? (options.length >= 2 ? options : ['Option 1', 'Option 2']) : undefined,
            correctOptionIndex: type === 'mcq' ? correctOptionIndex : undefined,
            correctOptionIndices: type === 'multi_select' ? correctOptionIndices : undefined,
            correctAnswer: type === 'fill_blank' ? correctAnswer : undefined,
            acceptedAnswers: type === 'fill_blank' ? (acceptedAnswers.length > 0 ? acceptedAnswers : [correctAnswer]) : undefined,
            marks,
            explanation,
          });
        }
      }
    }
  }

  if (parsedQuestions.length === 0) {
    return res.status(400).json({ error: 'No valid questions found to upload.' });
  }

  const added = db.addQuestionsBulk(exam.id, parsedQuestions);
  res.status(201).json({
    success: true,
    count: added.length,
    questions: added,
    exam: db.getExamById(exam.id),
  });
});

// Test code sandbox from examiner panel (verify test cases before publishing)
router.post('/test-code', async (req, res) => {
  const { language, code, testCases } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Language and code are required.' });
  }

  try {
    const result = await evaluateTestCases(language, code, testCases || []);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview deterministic shuffling for different roll numbers
router.get('/exams/:id/preview-shuffle', (req, res) => {
  const exam = db.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const questions = db.getQuestionsForExam(req.params.id);
  const sampleRolls = (req.query.rollNumbers ? req.query.rollNumbers.split(',') : ['21CS001', '21CS002', '21CS041'])
    .map(r => r.trim());

  const previews = sampleRolls.map(roll => {
    const paperSet = assignPaperSet(roll);
    const shuffled = prepareStudentPaper(exam, questions, roll);
    return {
      rollNumber: roll,
      paperSet,
      questionSequence: shuffled.map(q => ({
        displayNumber: q.displayNumber,
        originalId: q.id,
        questionText: q.questionText.slice(0, 45) + (q.questionText.length > 45 ? '...' : ''),
        type: q.type,
        options: q.type === 'mcq' ? q.options.map(o => `${o.optionKey}: ${o.text}`) : null,
      })),
    };
  });

  res.json({
    examId: exam.id,
    title: exam.title,
    originalQuestionCount: questions.length,
    previews,
  });
});

// Live exam proctoring monitor
router.get('/exams/:id/monitor', (req, res) => {
  const exam = db.getExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const submissions = db.getSubmissions(req.params.id);
  const suspiciousCount = submissions.filter(s => s.tabSwitchCount > 0).length;
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
    : 0;

  res.json({
    examTitle: exam.title,
    totalSubmissions: submissions.length,
    averageScore: avgScore,
    suspiciousCount,
    submissions: submissions.map(s => ({
      id: s.id,
      rollNumber: s.rollNumber,
      studentName: s.studentName,
      branch: s.branch,
      section: s.section,
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      tabSwitchCount: s.tabSwitchCount,
      submittedAt: s.submittedAt,
    })),
  });
});

module.exports = router;
