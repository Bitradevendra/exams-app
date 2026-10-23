import React, { useState } from 'react';
import { 
  IdCard, 
  KeyRound, 
  LogIn, 
  Sparkles, 
  ShieldCheck, 
  School, 
  AlertCircle,
  Users
} from 'lucide-react';
import { api } from '../../api';

export default function StudentLogin({ onLoginSuccess }) {
  const [rollNumber, setRollNumber] = useState('');
  const [apaarId, setApaarId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterFields, setShowRegisterFields] = useState(false);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');

  // Quick preset student profiles for rapid testing
  const demoStudents = [
    { roll: '21CS001', apaar: 'APAAR-9812-4567-0101', name: 'Aarav Sharma', branch: 'CSE', section: 'A' },
    { roll: '21CS041', apaar: 'APAAR-9812-4567-0141', name: 'Rohan Varma', branch: 'CSE', section: 'B' },
    { roll: '21EC010', apaar: 'APAAR-9812-4567-0210', name: 'Priya Nair', branch: 'ECE', section: 'A' },
    { roll: '21IT001', apaar: 'APAAR-9812-4567-0401', name: 'Tanvi Deshmukh', branch: 'IT', section: 'A' },
  ];

  const handleDemoFill = (student) => {
    setRollNumber(student.roll);
    setApaarId(student.apaar);
    setName(student.name);
    setBranch(student.branch);
    setSection(student.section);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim() || !apaarId.trim()) {
      setError('Please fill in both your Roll Number and APAAR ID.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.studentLogin({
        rollNumber: rollNumber.trim().toUpperCase(),
        apaarId: apaarId.trim().toUpperCase(),
        name: name.trim(),
        branch,
        section,
      });

      onLoginSuccess(res.student);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      setShowRegisterFields(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
            <IdCard className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Exam Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your Roll Number and APAAR ID to access assigned examinations.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-600" />
              Institutional Roll Number
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 21CS001"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              APAAR ID (Academic Account Registry)
            </label>
            <input
              type="text"
              value={apaarId}
              onChange={(e) => setApaarId(e.target.value)}
              placeholder="e.g. APAAR-9812-4567-0101"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase transition-all"
            />
          </div>

          {/* First-time registration details */}
          {showRegisterFields && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 pt-3">
              <div className="text-[11px] font-medium text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                First-time student? Confirm details to auto-register:
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Verify & Enter Exam Lobby</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-slate-400">Instant test</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoStudents.map((s) => (
              <button
                key={s.roll}
                type="button"
                onClick={() => handleDemoFill(s)}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                  {s.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {s.roll} • <span className="text-blue-600 font-semibold">{s.branch}-{s.section}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Examinations feature deterministic question shuffling and integrity monitoring.</span>
        </div>

      </div>
    </div>
  );
}
