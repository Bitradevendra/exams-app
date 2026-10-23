const express = require('express');
const router = express.Router();
const db = require('../db');

// Unified Login for All 3 Roles (Admin, Middleman, Student)
router.post('/login', (req, res) => {
  const identifier = req.body.identifier || req.body.username;
  const { password, name, branch, section } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter both your User ID / Roll Number and Password / APAAR ID.' });
  }

  let user = db.authenticateUser(identifier, password);

  // If student is logging in for the first time with branch & section provided
  if (!user && branch && section) {
    const cleanId = identifier.trim().toUpperCase();
    const cleanPass = password.trim().toUpperCase();
    const registered = db.registerStudent({
      rollNumber: cleanId,
      apaarId: cleanPass,
      name: name || `Student ${cleanId}`,
      branch,
      section,
    });
    user = {
      id: 'std-' + registered.rollNumber,
      username: registered.rollNumber,
      rollNumber: registered.rollNumber,
      apaarId: registered.apaarId,
      name: registered.name,
      branch: registered.branch,
      section: registered.section,
      role: 'student',
    };
  }

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials. Please verify your ID and password or select a 1-click demo account.',
    });
  }

  res.json({
    success: true,
    role: user.role, // 'admin', 'examiner', 'student'
    user,
  });
});

// Demo accounts metadata for instant 1-click test fill on the login screen
router.get('/demo-accounts', (req, res) => {
  res.json({
    accounts: [
      {
        role: 'admin',
        title: 'Institutional Administrator',
        identifier: 'admin',
        password: 'admin123',
        description: 'Controller of Examinations - Full College Analytics & Grade Exports',
      },
      {
        role: 'examiner',
        title: 'Middleman / Paper Setter',
        identifier: 'examiner',
        password: 'exam123',
        description: 'Prof. S. K. Sharma - Upload & Edit Exam Papers, Auto-Correct Keys, Live Proctoring',
      },
      {
        role: 'student',
        title: 'Student (AIML - Section A)',
        identifier: '24AI001',
        password: 'APAAR-2024-AIML-001',
        description: 'Aditya Varma - AIML Section A Candidate',
      },
    ],
  });
});

module.exports = router;
