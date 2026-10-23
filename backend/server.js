const express = require('express');
const cors = require('cors');
const path = require('path');

const studentRoutes = require('./routes/student');
const examinerRoutes = require('./routes/examiner');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Examination Conducting System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Helper route to get all registered students for quick login selector
app.get('/api/students-list', (req, res) => {
  const students = db.getStudents();
  res.json({ students });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/examiner', examinerRoutes);
app.use('/api/admin', adminRoutes);

// Optional: Serve frontend dist if available
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  const indexHtml = path.join(frontendDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// 404 & Error handlers
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Exam Conducting Backend Server Running!`);
  console.log(`📡 Local Address:   http://localhost:${PORT}`);
  console.log(`📡 Network Access:  http://0.0.0.0:${PORT}`);
  console.log(`🧪 Student API:     http://localhost:${PORT}/api/student`);
  console.log(`✏️ Examiner API:    http://localhost:${PORT}/api/examiner`);
  console.log(`📊 Admin API:       http://localhost:${PORT}/api/admin`);
  console.log(`=======================================================`);
});

module.exports = app;
