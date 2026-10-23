const express = require('express');
const router = express.Router();
const db = require('../db');

// Overall and Filtered Analytics
router.get('/analytics', (req, res) => {
  const { examId, branch, section, dateFilter } = req.query;

  let submissions = db.getSubmissions();
  const exams = db.getExams();

  // Filter by examId
  if (examId && examId !== 'all') {
    submissions = submissions.filter(s => s.examId === examId);
  }

  // Filter by branch
  if (branch && branch !== 'all') {
    submissions = submissions.filter(s => (s.branch || '').toUpperCase() === branch.toUpperCase());
  }

  // Filter by section
  if (section && section !== 'all') {
    submissions = submissions.filter(s => (s.section || '').toUpperCase() === section.toUpperCase());
  }

  // Filter by date
  if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    if (dateFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      submissions = submissions.filter(s => s.submittedAt && s.submittedAt.startsWith(todayStr));
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      submissions = submissions.filter(s => s.submittedAt && new Date(s.submittedAt) >= oneWeekAgo);
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      submissions = submissions.filter(s => s.submittedAt && new Date(s.submittedAt) >= oneMonthAgo);
    }
  }

  const totalSubmissions = submissions.length;
  const totalExams = exams.length;

  let collegeAvgPercent = 0;
  let passCount = 0;
  let highestScorePercent = 0;
  let lowestScorePercent = totalSubmissions > 0 ? 100 : 0;

  if (totalSubmissions > 0) {
    const sumPercent = submissions.reduce((acc, curr) => {
      const p = curr.percentage !== undefined ? curr.percentage : (curr.totalMarks ? (curr.score / curr.totalMarks) * 100 : 0);
      if (p >= 40) passCount++;
      if (p > highestScorePercent) highestScorePercent = p;
      if (p < lowestScorePercent) lowestScorePercent = p;
      return acc + p;
    }, 0);
    collegeAvgPercent = Math.round(sumPercent / totalSubmissions);
  }

  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

  // Branch-wise Analytics
  const branchMap = {};
  submissions.forEach(sub => {
    const b = (sub.branch || 'OTHER').toUpperCase();
    if (!branchMap[b]) {
      branchMap[b] = { branch: b, count: 0, totalPercent: 0, passCount: 0 };
    }
    const p = sub.percentage || 0;
    branchMap[b].count++;
    branchMap[b].totalPercent += p;
    if (p >= 40) branchMap[b].passCount++;
  });

  const branchAnalytics = Object.values(branchMap).map(b => ({
    branch: b.branch,
    studentsCount: b.count,
    averagePercent: Math.round(b.totalPercent / b.count),
    passRate: Math.round((b.passCount / b.count) * 100),
  }));

  // Section-wise Analytics (e.g. CSE-A, CSE-B, ECE-A)
  const sectionMap = {};
  submissions.forEach(sub => {
    const key = `${(sub.branch || 'OTHER').toUpperCase()} - Section ${(sub.section || 'A').toUpperCase()}`;
    if (!sectionMap[key]) {
      sectionMap[key] = {
        name: key,
        branch: sub.branch,
        section: sub.section,
        count: 0,
        totalPercent: 0,
        highest: 0,
        lowest: 100,
        passCount: 0,
      };
    }
    const p = sub.percentage || 0;
    sectionMap[key].count++;
    sectionMap[key].totalPercent += p;
    if (p > sectionMap[key].highest) sectionMap[key].highest = p;
    if (p < sectionMap[key].lowest) sectionMap[key].lowest = p;
    if (p >= 40) sectionMap[key].passCount++;
  });

  const sectionAnalytics = Object.values(sectionMap).map(s => ({
    sectionLabel: s.name,
    branch: s.branch,
    section: s.section,
    studentsCount: s.count,
    averagePercent: Math.round(s.totalPercent / s.count),
    highestScore: s.highest,
    lowestScore: s.lowest === 100 && s.count === 0 ? 0 : s.lowest,
    passRate: Math.round((s.passCount / s.count) * 100),
  }));

  // Score Distribution Histogram
  const distribution = [
    { range: '0 - 39% (Fail)', count: 0, color: '#ef4444' },
    { range: '40 - 59% (Average)', count: 0, color: '#f59e0b' },
    { range: '60 - 79% (Good)', count: 0, color: '#3b82f6' },
    { range: '80 - 100% (Distinction)', count: 0, color: '#10b981' },
  ];

  submissions.forEach(sub => {
    const p = sub.percentage || 0;
    if (p < 40) distribution[0].count++;
    else if (p < 60) distribution[1].count++;
    else if (p < 80) distribution[2].count++;
    else distribution[3].count++;
  });

  // Toppers Leaderboard
  const sortedSubmissions = [...submissions].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const toppers = sortedSubmissions.slice(0, 10).map((s, idx) => ({
    rank: idx + 1,
    rollNumber: s.rollNumber,
    studentName: s.studentName,
    branch: s.branch,
    section: s.section,
    examTitle: s.examTitle || 'Exam',
    score: s.score,
    totalMarks: s.totalMarks,
    percentage: s.percentage,
    tabSwitchCount: s.tabSwitchCount || 0,
    submittedAt: s.submittedAt,
  }));

  // Question difficulty analysis if single exam selected
  let questionAnalytics = [];
  if (examId && examId !== 'all') {
    const questions = db.getQuestionsForExam(examId);
    questionAnalytics = questions.map((q, idx) => {
      let correctAnswersCount = 0;
      let totalAttempts = 0;

      submissions.forEach(sub => {
        if (sub.breakdowns) {
          const breakdown = sub.breakdowns.find(b => b.questionId === q.id);
          if (breakdown) {
            totalAttempts++;
            if (breakdown.isCorrect) correctAnswersCount++;
          }
        }
      });

      const accuracy = totalAttempts > 0 ? Math.round((correctAnswersCount / totalAttempts) * 100) : 0;

      return {
        questionNumber: idx + 1,
        questionText: q.questionText,
        type: q.type,
        marks: q.marks,
        totalAttempts,
        correctCount: correctAnswersCount,
        accuracyPercent: accuracy,
        difficulty: accuracy >= 75 ? 'Easy' : accuracy >= 45 ? 'Moderate' : 'Hard',
      };
    });
  }

  res.json({
    kpis: {
      totalExams,
      totalSubmissions,
      collegeAvgPercent,
      passRate,
      highestScorePercent,
      lowestScorePercent,
    },
    branchAnalytics,
    sectionAnalytics,
    distribution,
    toppers,
    questionAnalytics,
    recentSubmissions: sortedSubmissions.slice(0, 20),
  });
});

// CSV Export of Exam Results
router.get('/export/:examId', (req, res) => {
  const { examId } = req.params;
  let submissions = db.getSubmissions();

  if (examId && examId !== 'all') {
    submissions = submissions.filter(s => s.examId === examId);
  }

  const headers = [
    'Roll Number',
    'Student Name',
    'Branch',
    'Section',
    'Exam Title',
    'Score Obtained',
    'Total Marks',
    'Percentage',
    'Grade',
    'Cheating/Tab Switch Alerts',
    'Submitted At',
  ];

  const rows = submissions.map(s => [
    `"${s.rollNumber}"`,
    `"${s.studentName || ''}"`,
    `"${s.branch}"`,
    `"${s.section}"`,
    `"${(s.examTitle || '').replace(/"/g, '""')}"`,
    s.score,
    s.totalMarks,
    `${s.percentage}%`,
    `"${s.grade || 'N/A'}"`,
    s.tabSwitchCount || 0,
    `"${s.submittedAt || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="exam_results_${examId}_${Date.now()}.csv"`);
  res.send(csvContent);
});

module.exports = router;
