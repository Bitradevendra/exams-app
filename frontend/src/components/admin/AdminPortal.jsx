import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Filter, 
  Download, 
  Building2, 
  Layers, 
  HelpCircle,
  Printer
} from 'lucide-react';
import { api } from '../../api';

export default function AdminPortal() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedExam !== 'all') filters.examId = selectedExam;
      if (selectedBranch !== 'all') filters.branch = selectedBranch;
      if (selectedSection !== 'all') filters.section = selectedSection;
      if (dateFilter !== 'all') filters.dateFilter = dateFilter;

      const data = await api.getAdminAnalytics(filters);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedExam, selectedBranch, selectedSection, dateFilter]);

  useEffect(() => {
    async function fetchExams() {
      try {
        const list = await api.getExaminerExams();
        setExams(list);
      } catch (e) {
        console.error('Failed to load exams list', e);
      }
    }
    fetchExams();

    const handleDataChange = () => {
      fetchExams();
      fetchAnalytics();
    };
    window.addEventListener('exammatrix:data-changed', handleDataChange);
    return () => window.removeEventListener('exammatrix:data-changed', handleDataChange);
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = () => {
    try {
      const subs = analytics?.recentSubmissions || analytics?.toppers || [];
      if (subs.length > 0) {
        const headers = ['Roll Number', 'Student Name', 'Branch', 'Section', 'Exam Title', 'Score', 'Total Marks', 'Percentage', 'Grade', 'Tab Switches', 'Submitted At'];
        const rows = subs.map((s) => [
          s.rollNumber || '',
          `"${(s.studentName || '').replace(/"/g, '""')}"`,
          s.branch || '',
          s.section || '',
          `"${(s.examTitle || '').replace(/"/g, '""')}"`,
          s.score ?? 0,
          s.totalMarks ?? 100,
          `${s.percentage ?? 0}%`,
          s.grade || (s.percentage >= 40 ? 'PASS' : 'FAIL'),
          s.tabSwitchCount ?? 0,
          s.submittedAt || new Date().toISOString()
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ExamMatrix_GradeSheet_${selectedExam}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn('Direct CSV download fallback:', e);
    }
    const url = api.getExportUrl(selectedExam);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const kpis = analytics?.kpis || {
    totalExams: 0,
    totalSubmissions: 0,
    collegeAvgPercent: 0,
    passRate: 0,
    highestScorePercent: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Admin Title & Export Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="hidden xs:flex h-14 w-14 shrink-0 rounded-2xl bg-white border border-slate-200 shadow-xs items-center justify-center p-1.5">
            <img
              src="/logo_transparent.png"
              alt="ExamMatrix Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Institutional Administration
              </span>
              <span className="text-xs text-slate-500">• ExamMatrix Controller</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Comprehensive Examination Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Multi-dimensional assessment intelligence across academic branches, sections, date ranges, and question difficulty levels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Grade Sheet</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Dimensional Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Exam Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Examination Paper</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Examinations</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.code})
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Academic Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Academic Branches</option>
              <option value="AIML">Artificial Intelligence & ML (AIML)</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="IT">Information Tech (IT)</option>
              <option value="MECH">Mechanical (MECH)</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Sections (A, B, C)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date Wise Window</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Dates Conducted</option>
              <option value="today">Today's Exams</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>

        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
        
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-sans block mb-1">Total Submissions</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {kpis.totalSubmissions}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Candidates evaluated</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-sans block mb-1">Average Score</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
            {kpis.collegeAvgPercent}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Overall aggregate</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-sans block mb-1">Pass Clearance Rate</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {kpis.passRate}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Scored &gt;= 40%</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-sans block mb-1">Highest Score</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {kpis.highestScorePercent}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Peak performance</span>
        </div>

      </div>

      {/* ================= SECTION-WISE ANALYTICS COMPARISON ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Section-Wise Performance Breakdown (Average Marks & Pass Rates)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {analytics?.sectionAnalytics?.length || 0} Sections Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!analytics?.sectionAnalytics || analytics.sectionAnalytics.length === 0) ? (
            <div className="col-span-full py-8 px-4 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs font-semibold text-slate-700">No student submissions recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Section-wise performance analytics will calculate in real-time as candidates submit exams.
              </p>
            </div>
          ) : (
            analytics.sectionAnalytics.map((sec, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {sec.sectionLabel}
                    </span>
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      {sec.studentsCount} Students
                    </span>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-600">Section Average:</span>
                      <strong className="text-slate-900">{sec.averagePercent}%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sec.averagePercent >= 75
                            ? 'bg-emerald-600'
                            : sec.averagePercent >= 50
                            ? 'bg-blue-600'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, sec.averagePercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700 mt-3 pt-3 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pass Rate:</span>
                      <strong className="text-emerald-700 font-semibold">{sec.passRate}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">High / Low:</span>
                      <span className="text-slate-900">{sec.highestScore}% / {sec.lowestScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= BRANCH-WISE & SCORE HISTOGRAM ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Branch Comparative Analytics */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-blue-600" />
            Branch-Wise Comparative Analytics
          </h3>

          <div className="space-y-3.5">
            {(!analytics?.branchAnalytics || analytics.branchAnalytics.length === 0) ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No branch submissions recorded yet.
              </div>
            ) : (
              analytics.branchAnalytics.map((b, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-slate-800">{b.branch} ({b.studentsCount} candidates)</span>
                    <span className="text-blue-700 font-semibold">{b.averagePercent}% avg • {b.passRate}% pass</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, b.averagePercent)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Score Distribution Histogram */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Score Distribution Bell Spread
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {(analytics?.distribution || []).map((dist, idx) => {
              const total = kpis.totalSubmissions || 1;
              const pct = Math.round((dist.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-700">{dist.range}</span>
                    <span className="text-slate-900 font-bold">{dist.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: dist.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ================= QUESTION DIFFICULTY ACCURACY (IF SINGLE EXAM) ================= */}
      {analytics?.questionAnalytics && analytics.questionAnalytics.length > 0 && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            Question-Level Difficulty & Conceptual Gap Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Identifies questions with lowest accuracy where students require classroom reinforcement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {analytics.questionAnalytics.map((q) => (
              <div key={q.questionNumber} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-700 font-mono">Q#{q.questionNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : q.difficulty === 'Moderate'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {q.difficulty} ({q.accuracyPercent}% Accuracy)
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 truncate">{q.questionText}</p>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  {q.correctCount} of {q.totalAttempts} students answered correctly
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TOPPERS LEADERBOARD ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Top Institutional Performers
          </h3>
          <span className="text-xs font-mono text-slate-500">Ranked by Percentage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">Branch & Sec</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Score</th>
                <th className="p-3">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(!analytics?.toppers || analytics.toppers.length === 0) ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No submissions recorded yet. Live student rankings will populate dynamically as exams are completed.
                  </td>
                </tr>
              ) : (
                analytics.toppers.map((top) => (
                <tr key={top.rank + top.rollNumber} className="hover:bg-slate-50">
                  <td className="p-3 font-bold">
                    <span className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs ${
                      top.rank === 1
                        ? 'bg-amber-100 text-amber-800 font-black'
                        : top.rank === 2
                        ? 'bg-slate-200 text-slate-800 font-bold'
                        : top.rank === 3
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-500'
                    }`}>
                      #{top.rank}
                    </span>
                  </td>
                  <td className="p-3 font-sans font-semibold text-slate-900">
                    {top.studentName} <span className="text-slate-500 font-mono text-xs">({top.rollNumber})</span>
                  </td>
                  <td className="p-3 text-slate-700">
                    {top.branch} - Sec {top.section}
                  </td>
                  <td className="p-3 text-slate-600 truncate max-w-xs font-sans">
                    {top.examTitle}
                  </td>
                  <td className="p-3 text-emerald-700 font-bold">
                    {top.score}/{top.totalMarks} ({top.percentage}%)
                  </td>
                  <td className="p-3">
                    {top.tabSwitchCount === 0 ? (
                      <span className="text-emerald-700 text-[10px] font-bold">Clean Session</span>
                    ) : (
                      <span className="text-rose-700 text-[10px] font-bold">{top.tabSwitchCount} Strikes</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
