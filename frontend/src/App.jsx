import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UnifiedLogin from './components/UnifiedLogin';
import ExamLobby from './components/student/ExamLobby';
import ExamTaker from './components/student/ExamTaker';
import ExamResult from './components/student/ExamResult';
import ExaminerPortal from './components/examiner/ExaminerPortal';
import AdminPortal from './components/admin/AdminPortal';
import { api } from './api';

export default function App() {
  const [isServerOnline, setIsServerOnline] = useState(false);

  // Authenticated user state (Admin, Middleman / Examiner, or Student)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('exammatrix_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Student portal navigation sub-views
  const [studentSubView, setStudentSubView] = useState('lobby'); // 'lobby', 'exam', 'result'
  const [activeExam, setActiveExam] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);

  // Periodic health check
  useEffect(() => {
    const check = async () => {
      const res = await api.checkHealth();
      setIsServerOnline(res.status === 'ok');
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('exammatrix_auth', JSON.stringify(user));
    } catch (e) {}
    setStudentSubView('lobby');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('exammatrix_auth');
    } catch (e) {}
    setStudentSubView('lobby');
    setActiveExam(null);
    setActiveSubmission(null);
  };

  const handleStartExam = (exam) => {
    setActiveExam(exam);
    setStudentSubView('exam');
  };

  const handleExamSubmitted = (submission) => {
    setActiveSubmission(submission);
    setStudentSubView('result');
  };

  const handleViewExistingResult = async (submissionId) => {
    try {
      const sub = await api.getSubmission(submissionId);
      setActiveSubmission(sub);
      setStudentSubView('result');
    } catch (e) {
      alert('Could not load submission: ' + e.message);
    }
  };

  // Determine if full-screen exam mode should hide top navbar
  const isInActiveExam = currentUser?.role === 'student' && studentSubView === 'exam';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar with brand, status, authenticated profile badge, and logout */}
      {!isInActiveExam && (
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          isServerOnline={isServerOnline}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-8">
        
        {/* State 1: Not Authenticated -> Show Unified Single Login Screen */}
        {!currentUser ? (
          <UnifiedLogin onLoginSuccess={handleLoginSuccess} />
        ) : currentUser.role === 'admin' ? (
          /* State 2: Authenticated as Institutional Admin -> Show Admin Analytics */
          <AdminPortal />
        ) : currentUser.role === 'examiner' ? (
          /* State 3: Authenticated as Middleman / Paper Setter -> Show Examiner Portal */
          <ExaminerPortal />
        ) : currentUser.role === 'student' ? (
          /* State 4: Authenticated as Student Candidate -> Show Student Assessment Flow */
          <>
            {studentSubView === 'lobby' && (
              <ExamLobby
                student={currentUser}
                onStartExam={handleStartExam}
                onViewResult={handleViewExistingResult}
              />
            )}

            {studentSubView === 'exam' && activeExam && (
              <ExamTaker
                exam={activeExam}
                student={currentUser}
                onExamSubmitted={handleExamSubmitted}
                onExit={() => setStudentSubView('lobby')}
              />
            )}

            {studentSubView === 'result' && activeSubmission && (
              <ExamResult
                submission={activeSubmission}
                onBackToLobby={() => setStudentSubView('lobby')}
              />
            )}

            {studentSubView !== 'lobby' && !activeExam && !activeSubmission && (
              <div className="text-center py-12">
                <button
                  onClick={() => setStudentSubView('lobby')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Back to Exam Lobby
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 mb-4">Unrecognized account role: {currentUser.role}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
