import React, { useState, useEffect } from 'react';
import { 
  User, 
  KeyRound, 
  LogIn, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  School,
  Lock,
  GraduationCap,
  FileEdit,
  BarChart3,
  Server,
  Wifi,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../api';

export default function UnifiedLogin({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Optional first-time registration fields
  const [showRegisterFields, setShowRegisterFields] = useState(false);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('AIML');
  const [section, setSection] = useState('A');

  // Server Settings Modal State
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrl, setServerUrl] = useState(api.getServerUrl());
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  useEffect(() => {
    setServerUrl(api.getServerUrl());
  }, []);

  // Exactly 3 quick 1-click test fill credentials (Admin, Middleman, Student AIML-A)
  const demoAccounts = [
    {
      role: 'admin',
      label: 'Admin Portal',
      icon: BarChart3,
      id: 'admin',
      pass: 'admin123',
      sub: 'Exam Controller',
      color: 'blue',
    },
    {
      role: 'examiner',
      label: 'Middleman Portal',
      icon: FileEdit,
      id: 'examiner',
      pass: 'exam123',
      sub: 'Paper Setter',
      color: 'indigo',
    },
    {
      role: 'student',
      label: 'Student (AIML-A)',
      icon: GraduationCap,
      id: '24AI001',
      pass: 'APAAR-2024-AIML-001',
      sub: 'Aditya Varma (AIML-A)',
      color: 'emerald',
    },
  ];

  const handleDemoFill = (acc) => {
    setIdentifier(acc.id);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your User ID / Roll Number and Password / APAAR ID.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.unifiedLogin({
        identifier: identifier.trim(),
        password: password.trim(),
        name: name.trim(),
        branch,
        section,
      });

      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      // If student format, suggest registration
      if (identifier.trim().match(/^[0-9]{2}[A-Za-z]{2,4}[0-9]{3}$/i)) {
        setShowRegisterFields(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentHostDisplay = api.getServerUrl().replace(/^https?:\/\//, '') || 'Local';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8">
        
        {/* Top Header: App Badge & Server Connection Indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 font-mono tracking-wide">
            ExamMatrix Mobile
          </span>
          <button
            type="button"
            onClick={() => {
              setServerUrl(api.getServerUrl());
              setPingResult(null);
              setShowServerModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Configure backend server IP address"
          >
            <Server className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate max-w-[130px] font-mono">{currentHostDisplay}</span>
          </button>
        </div>

        {/* App Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs mb-3 flex items-center justify-center">
            <img
              src="/logo_transparent.png"
              alt="ExamMatrix Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ExamMatrix</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
            Secure Examination Portal. Sign in with your registered credentials to access your authorized dashboard.
          </p>
        </div>

        {/* Error Alert with 1-click Server IP Config */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {(error.includes('server') || error.includes('Server') || error.includes('connect') || error.includes('HTML') || error.includes('network') || error.includes('localhost')) && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60">
                {/* 1-Tap instant fix to PC Wi-Fi IP */}
                <button
                  type="button"
                  onClick={async () => {
                    api.setServerUrl(api.DEFAULT_SERVER_HOST);
                    setServerUrl(api.DEFAULT_SERVER_HOST);
                    setError('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow-2xs"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Connect to PC Wi-Fi ({api.CURRENT_WIFI_IP}:5050)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServerUrl(api.getServerUrl());
                    setPingResult(null);
                    setShowServerModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 text-[11px] font-bold hover:bg-rose-100 cursor-pointer transition-colors shadow-2xs"
                >
                  <Server className="w-3.5 h-3.5 text-rose-600" />
                  <span>Configure Server IP</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Unified Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              User ID / Roll Number / Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. admin, examiner, 24AI001"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              Password / Secret / APAAR ID
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. admin123, exam123, APAAR-ID"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* First-time registration fields for new students */}
          {showRegisterFields && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 pt-3">
              <div className="text-[11px] font-medium text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                First-time student? Confirm details to register:
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
                    <option value="AIML">AIML</option>
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
                <span>Authenticate & Open Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-slate-400">Instant test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const IconComp = acc.icon;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleDemoFill(acc)}
                  className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                    <IconComp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{acc.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    ID: <strong className="text-slate-700">{acc.id}</strong> • Pass: <strong className="text-slate-700">{acc.pass}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Role access is verified cryptographically by the central authentication engine.</span>
        </div>

      </div>

      {/* ================= MODAL: SERVER SETTINGS ================= */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Backend Server Connection</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ensure your phone is on the same Wi-Fi network as the computer running the ExamMatrix backend server.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Server IP Address & Port:
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => {
                  setServerUrl(e.target.value);
                  setPingResult(null);
                }}
                placeholder={`e.g. ${api.DEFAULT_SERVER_HOST}`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setServerUrl(api.DEFAULT_SERVER_HOST);
                    setPingResult(null);
                  }}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[10px] font-mono border border-blue-200 cursor-pointer flex items-center gap-1"
                >
                  <Wifi className="w-3 h-3 text-blue-600" />
                  PC Wi-Fi ({api.CURRENT_WIFI_IP}:5050)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServerUrl('http://10.0.2.2:5050');
                    setPingResult(null);
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-[10px] font-mono border border-slate-200 cursor-pointer"
                >
                  Emulator (10.0.2.2:5050)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServerUrl('http://localhost:5050');
                    setPingResult(null);
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-[10px] font-mono border border-slate-200 cursor-pointer"
                >
                  Localhost (PC Browser only)
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight pt-1">
                💡 Tip: On physical Android phones, always use <b>PC Wi-Fi ({api.CURRENT_WIFI_IP}:5050)</b> while connected to the same Wi-Fi.
              </p>
            </div>

            {/* Test Connection Result */}
            {pingResult && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                pingResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {pingResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-mono text-[11px] truncate">
                  {pingResult.success 
                    ? `Connected! (${pingResult.latency}ms)` 
                    : `Offline: ${pingResult.error}`}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={async () => {
                  setTestingPing(true);
                  const res = await api.testConnection(serverUrl);
                  setPingResult(res);
                  setTestingPing(false);
                }}
                disabled={testingPing}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {testingPing ? 'Pinging...' : 'Test Ping'}
              </button>
              <button
                type="button"
                onClick={() => {
                  api.setServerUrl(serverUrl);
                  setShowServerModal(false);
                  setError('');
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
