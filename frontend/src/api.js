import { Capacitor } from '@capacitor/core';
import { prototypeStore } from './prototypeStore';

// Centralized API client for the Exam Conducting Application
// Fully supporting native Android APKs (Capacitor), mobile browsers, and desktop environments.

export const CURRENT_WIFI_IP = '172.16.46.191';
export const DEFAULT_SERVER_PORT = '5050';
export const DEFAULT_SERVER_HOST = `http://${CURRENT_WIFI_IP}:${DEFAULT_SERVER_PORT}`;

export function getStoredServerUrl() {
  if (typeof window === 'undefined') return DEFAULT_SERVER_HOST;

  const isNative =
    Capacitor.isNativePlatform() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80'));

  const saved = localStorage.getItem('exam_matrix_server_url');
  if (saved && saved.trim()) {
    const trimmed = saved.trim().replace(/\/+$/, '');
    // If running on a native mobile APK, localhost/127.0.0.1 connects to the phone, which has no backend.
    // Automatically purge invalid localhost so the user connects directly to the PC Wi-Fi server.
    if (isNative && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
      localStorage.removeItem('exam_matrix_server_url');
      return DEFAULT_SERVER_HOST;
    }
    return trimmed;
  }

  if (isNative) {
    return DEFAULT_SERVER_HOST;
  }

  // If accessed from a mobile browser or remote device via IP
  if (window.location.hostname && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:${DEFAULT_SERVER_PORT}`;
  }

  // Local desktop browser development
  return `http://localhost:${DEFAULT_SERVER_PORT}`;
}

export function setStoredServerUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('exam_matrix_server_url');
    return;
  }
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  localStorage.setItem('exam_matrix_server_url', clean);
}

export async function testServerConnection(url) {
  try {
    let clean = (url || getStoredServerUrl()).trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${clean}/api/health`, { signal: controller.signal });
    clearTimeout(timer);
    const end = performance.now();

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      success: true,
      latency: Math.round(end - start),
      service: data.service,
      host: clean,
    };
  } catch (err) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}

// Internal robust request wrapper with timeout and content-type validation
async function request(endpoint, options = {}) {
  const base = getStoredServerUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${base}/api${cleanEndpoint}`;

  let res;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Connection timed out to ExamMatrix server at ${base}. Please check Server Settings.`);
    }
    throw new Error(
      `Cannot connect to ExamMatrix server at ${base}. Please ensure your mobile device is on the same Wi-Fi network and check Server Settings.`
    );
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('<!doctype') || text.includes('<!DOCTYPE') || text.trim().startsWith('<')) {
      throw new Error(
        `Received HTML instead of JSON from ${base}. Server IP may need updating. Tap 'Server Settings' to configure the server IP.`
      );
    }
    throw new Error(`Invalid server response (${res.status}): ${text.slice(0, 80)}`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Server error (HTTP ${res.status})`);
  }
  return data;
}

export const api = {
  CURRENT_WIFI_IP,
  DEFAULT_SERVER_PORT,
  DEFAULT_SERVER_HOST,
  // Server Host utilities
  getServerUrl: getStoredServerUrl,
  setServerUrl: setStoredServerUrl,
  testConnection: testServerConnection,

  // Health & Utilities
  async checkHealth() {
    try {
      return await request('/health');
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  },

  async getDemoStudents() {
    try {
      return await request('/students-list');
    } catch {
      return { students: prototypeStore.getStudents() };
    }
  },

  // Unified Authentication for Admin, Middleman, and Student
  async unifiedLogin(credentials) {
    try {
      return await request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
    } catch (netErr) {
      console.warn('Live server offline/unreachable, utilizing embedded Prototype Store:', netErr.message);
      const user = prototypeStore.authenticate(
        credentials.identifier || credentials.username,
        credentials.password,
        credentials
      );
      if (user) {
        return {
          success: true,
          role: user.role,
          user,
          isPrototypeMode: true,
        };
      }
      throw new Error('Invalid credentials. Please select one of the 1-click demo accounts.');
    }
  },

  async getDemoAccounts() {
    try {
      return await request('/auth/demo-accounts');
    } catch {
      return {
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
      };
    }
  },

  // Student Endpoints
  async studentLogin(credentials) {
    try {
      return await request('/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
    } catch {
      return this.unifiedLogin(credentials);
    }
  },

  async getStudentExams(branch, section, rollNumber) {
    try {
      const params = new URLSearchParams({ branch, section, rollNumber });
      const data = await request(`/student/exams?${params}`);
      return data.exams;
    } catch (netErr) {
      console.warn('Using prototype store for student exams:', netErr.message);
      return prototypeStore.getExams(branch, section, rollNumber);
    }
  },

  async getStudentPaper(examId, rollNumber) {
    try {
      const params = new URLSearchParams({ rollNumber });
      return await request(`/student/exams/${examId}?${params}`);
    } catch (netErr) {
      console.warn('Using prototype store for student question paper:', netErr.message);
      return prototypeStore.getStudentPaper(examId, rollNumber);
    }
  },

  async runStudentCode(examId, payload) {
    try {
      return await request(`/student/exams/${examId}/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      console.warn('Using prototype code evaluation engine:', netErr.message);
      return await prototypeStore.runStudentCode(payload);
    }
  },

  async submitExam(examId, submissionPayload) {
    // Always persist to prototypeStore for instant local state & event dispatch
    const protoSub = prototypeStore.submitExam(examId, submissionPayload);
    try {
      const serverRes = await request(`/student/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });
      prototypeStore.dispatchDataChange();
      return serverRes;
    } catch (netErr) {
      console.warn('Server offline, completed submission in prototype engine:', netErr.message);
      prototypeStore.dispatchDataChange();
      return { success: true, submission: protoSub };
    }
  },

  async getSubmission(submissionId) {
    try {
      const data = await request(`/student/submissions/${submissionId}`);
      return data.submission;
    } catch (netErr) {
      console.warn('Using prototype submission lookup:', netErr.message);
      const sub = prototypeStore.getSubmissionById(submissionId);
      if (!sub) throw new Error('Submission record not found');
      return sub;
    }
  },

  // Middleman / Examiner Endpoints
  async getExaminerExams() {
    try {
      const data = await request('/examiner/exams');
      return data.exams;
    } catch {
      return prototypeStore.getExams('ALL', 'ALL');
    }
  },

  async getExaminerExam(id) {
    try {
      return await request(`/examiner/exams/${id}`);
    } catch {
      const exam = prototypeStore.getExamById(id);
      const questions = prototypeStore.getQuestionsForExam(id);
      return { exam, questions };
    }
  },

  async createExam(examData) {
    try {
      const data = await request('/examiner/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });
      prototypeStore.createExam(data.exam || examData);
      return data.exam;
    } catch (err) {
      console.warn('Backend offline, creating exam in prototypeStore:', err.message);
      return prototypeStore.createExam(examData);
    }
  },

  async updateExam(id, updateData) {
    try {
      const data = await request(`/examiner/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      prototypeStore.updateExam(id, updateData);
      return data.exam;
    } catch (err) {
      console.warn('Backend offline, updating exam in prototypeStore:', err.message);
      return prototypeStore.updateExam(id, updateData);
    }
  },

  async deleteExam(id) {
    try {
      await request(`/examiner/exams/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Backend offline, deleting exam in prototypeStore:', err.message);
    }
    return prototypeStore.deleteExam(id);
  },

  async addQuestion(examId, questionData) {
    try {
      const data = await request(`/examiner/exams/${examId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      prototypeStore.addQuestion(examId, data.question || questionData);
      return data.question;
    } catch (err) {
      console.warn('Backend offline, adding question in prototypeStore:', err.message);
      return prototypeStore.addQuestion(examId, questionData);
    }
  },

  async bulkUploadQuestions(examId, payload) {
    try {
      const data = await request(`/examiner/exams/${examId}/bulk-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      prototypeStore.bulkUploadQuestions(examId, payload);
      return data;
    } catch (err) {
      console.warn('Backend offline, bulk uploading questions in prototypeStore:', err.message);
      return prototypeStore.bulkUploadQuestions(examId, payload);
    }
  },

  // Edit question if any mistakes are found!
  async updateQuestion(questionId, updateData) {
    try {
      const data = await request(`/examiner/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      prototypeStore.updateQuestion(questionId, updateData);
      return data.question;
    } catch (err) {
      console.warn('Backend offline, updating question in prototypeStore:', err.message);
      return prototypeStore.updateQuestion(questionId, updateData);
    }
  },

  async deleteQuestion(questionId) {
    try {
      await request(`/examiner/questions/${questionId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Backend offline, deleting question in prototypeStore:', err.message);
    }
    return prototypeStore.deleteQuestion(questionId);
  },

  async previewShuffle(examId, rollNumbers) {
    try {
      const params = new URLSearchParams();
      if (rollNumbers) params.append('rollNumbers', rollNumbers);
      return await request(`/examiner/exams/${examId}/preview-shuffle?${params}`);
    } catch {
      const rolls = (rollNumbers || '24AI001').split(',').map((r) => r.trim()).filter(Boolean);
      const exam = prototypeStore.getExamById(examId);
      const sets = rolls.map((r) => {
        const paper = prototypeStore.getStudentPaper(examId, r);
        return {
          rollNumber: r,
          paperSet: paper.exam.paperSet,
          firstQuestionId: paper.questions[0]?.id,
          questionOrder: paper.questions.map((q) => q.id)
        };
      });
      return { exam, previewSets: sets };
    }
  },

  async getExamMonitoring(examId) {
    try {
      return await request(`/examiner/exams/${examId}/monitor`);
    } catch {
      const exam = examId && examId !== 'all' ? prototypeStore.getExamById(examId) : null;
      const allSubs = prototypeStore.getSubmissions();
      const submissions = (!examId || examId === 'all')
        ? allSubs
        : allSubs.filter((s) => s.examId === examId);
      const suspiciousCount = submissions.filter((s) => (s.tabSwitchCount || 0) > 0).length;
      const avgScore = submissions.length > 0
        ? Math.round(submissions.reduce((a, b) => a + (b.score || 0), 0) / submissions.length)
        : 0;

      return {
        exam,
        examTitle: exam ? exam.title : (examId === 'all' ? 'All Institutional Examinations' : 'Exam Session Monitor'),
        totalSubmissions: submissions.length,
        averageScore: avgScore,
        suspiciousCount,
        activeStudents: [
          { rollNumber: '24AI001', name: 'Aditya Varma', branch: 'AIML', section: 'A', status: submissions.length > 0 ? 'Submitted' : 'In-Progress', tabSwitches: 0 }
        ],
        submissions
      };
    }
  },

  // Admin Analytics Endpoints
  async getAdminAnalytics(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      return await request(`/admin/analytics?${params}`);
    } catch {
      return prototypeStore.getAdminAnalytics(filters);
    }
  },

  getExportUrl(examId = 'all') {
    return `${getStoredServerUrl()}/api/admin/export/${examId}`;
  },
};
