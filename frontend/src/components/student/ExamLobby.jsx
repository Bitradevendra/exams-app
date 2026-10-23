import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Award, 
  Code2, 
  ListChecks, 
  Shuffle, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Building2
} from 'lucide-react';
import { api } from '../../api';

export default function ExamLobby({ student, onStartExam, onViewResult }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getStudentExams(student.branch, student.section, student.rollNumber);
      setExams(data);
    } catch (err) {
      setError(err.message || 'Failed to load assigned exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    const handleDataChange = () => {
      loadExams();
    };
    window.addEventListener('exammatrix:data-changed', handleDataChange);
    return () => window.removeEventListener('exammatrix:data-changed', handleDataChange);
  }, [student]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'coding':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Code2 className="w-3.5 h-3.5" /> Coding Exam
          </span>
        );
      case 'bits':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ListChecks className="w-3.5 h-3.5" /> Bits Only (MCQ)
          </span>
        );
      case 'fill_blanks':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <FileText className="w-3.5 h-3.5" /> Fill in the Blanks
          </span>
        );
      case 'bits_blanks':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5" /> Bits + Blanks
          </span>
        );
      case 'sap':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-3.5 h-3.5" /> SAP / Enterprise Test
          </span>
        );
      case 'hybrid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
            <Sparkles className="w-3.5 h-3.5" /> Hybrid Assessment
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" /> Mixed (Bits + Code)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5" /> {type || 'Assessment'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Student Profile Card Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  Verified Candidate
                </span>
                <span className="text-xs text-slate-500">• ExamMatrix Candidate</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome, {student.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-slate-700 font-mono">
                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  Roll No: <strong className="text-slate-900">{student.rollNumber}</strong>
                </span>
              <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                APAAR: <strong className="text-slate-900">{student.apaarId}</strong>
              </span>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5 font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                {student.branch} • Section {student.section}
              </span>
            </div>
          </div>
        </div>

          <button
            onClick={loadExams}
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Exams</span>
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Assigned Examinations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exams configured by the examiner for branch <span className="text-slate-800 font-semibold">{student.branch}</span> and section <span className="text-slate-800 font-semibold">{student.section}</span>.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-semibold">
          {exams.length} Available
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white animate-pulse border border-slate-200" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && exams.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Exams Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No active exams are currently assigned to {student.branch} Section {student.section}. You can switch to the Middleman view to create or allow this section!
          </p>
        </div>
      )}

      {/* Exam Cards Grid */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                exam.hasSubmitted
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(exam.type)}
                    <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {exam.code}
                    </span>
                  </div>

                  {exam.shuffleEnabled && (
                    <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <Shuffle className="w-3 h-3 text-blue-600" /> Shuffled Paper
                    </span>
                  )}
                </div>

                {/* Exam Title & Description */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {exam.description || 'Institutional examination paper.'}
                </p>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-2 my-4 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Duration: <strong>{exam.durationMinutes} mins</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Total Marks: <strong>{exam.totalMarks} pts</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200">
                {exam.hasSubmitted ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div className="text-xs">
                        <span className="text-slate-500">Score: </span>
                        <strong className="text-emerald-700 font-mono font-bold">
                          {exam.score}/{exam.totalMarks} ({exam.percentage}%)
                        </strong>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewResult(exam.submissionId)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      View Result
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onStartExam(exam)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Online Examination</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
