import React, { useState, useEffect } from 'react';
import { 
  FileEdit, 
  Plus, 
  Trash2, 
  Edit3, 
  Code2, 
  ListChecks, 
  Sparkles, 
  Clock, 
  Shuffle, 
  Eye, 
  CheckCircle2, 
  RefreshCw,
  Upload,
  CheckSquare,
  Layers,
  FileText
} from 'lucide-react';
import { api } from '../../api';

export default function ExaminerPortal() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams', 'questions', 'shuffle', 'monitor'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploading, setUploading] = useState(false);

  // Live monitor state
  const [monitorData, setMonitorData] = useState(null);

  // Shuffle preview state
  const [shuffleRolls, setShuffleRolls] = useState('24AI001');
  const [shufflePreview, setShufflePreview] = useState(null);
  const [loadingShuffle, setLoadingShuffle] = useState(false);

  // New Exam Form State
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    code: '',
    description: '',
    type: 'bits',
    durationMinutes: 45,
    targetBranches: ['AIML', 'CSE'],
    targetSections: ['A', 'B'],
    shuffleEnabled: true,
  });

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    type: 'mcq',
    questionText: '',
    scenarioContext: '',
    marks: 5,
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    correctOptionIndices: [0],
    correctAnswer: '',
    acceptedAnswers: '',
    caseSensitive: false,
    explanation: '',
    problemStatement: '',
    constraints: '',
    starterCode: '# Write your solution below\n',
    testCases: [
      { input: '', expectedOutput: '', isHidden: false },
      { input: '', expectedOutput: '', isHidden: true },
    ],
  });

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await api.getExaminerExams();
      setExams(data);
      if (data.length > 0 && !selectedExamId) {
        setSelectedExamId(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    const handleDataChange = () => {
      loadExams();
      loadMonitoring(selectedExamId || 'all');
    };
    window.addEventListener('exammatrix:data-changed', handleDataChange);
    return () => window.removeEventListener('exammatrix:data-changed', handleDataChange);
  }, [selectedExamId]);

  useEffect(() => {
    if (!selectedExamId) return;

    async function fetchExamDetails() {
      try {
        const data = await api.getExaminerExam(selectedExamId);
        setSelectedExamDetails(data.exam);
        setQuestions(data.questions);
      } catch (err) {
        console.error('Error fetching exam details:', err);
      }
    }

    fetchExamDetails();
  }, [selectedExamId]);

  useEffect(() => {
    if (activeTab === 'monitor') {
      loadMonitoring(selectedExamId || 'all');
    }
  }, [activeTab, selectedExamId]);

  const loadMonitoring = async (targetId = selectedExamId) => {
    const id = targetId || 'all';
    try {
      const data = await api.getExamMonitoring(id);
      setMonitorData(data);
    } catch (err) {
      console.error('Error loading monitoring:', err);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamForm.title.trim()) {
      alert('Exam Title is required');
      return;
    }
    try {
      const created = await api.createExam(newExamForm);
      setShowCreateExamModal(false);
      setSuccessMsg('Exam created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadExams();
      setSelectedExamId(created.id);
      setActiveTab('questions');
    } catch (err) {
      alert('Failed to create exam: ' + err.message);
    }
  };

  const openAddQuestion = () => {
    const examType = selectedExamDetails?.type || 'bits';
    let defaultType = 'mcq';
    if (examType === 'coding') defaultType = 'coding';
    else if (examType === 'fill_blanks') defaultType = 'fill_blank';
    else if (examType === 'sap') defaultType = 'multi_select';

    setEditingQuestion(null);
    setQuestionForm({
      type: defaultType,
      questionText: '',
      scenarioContext: '',
      marks: defaultType === 'coding' ? 15 : (defaultType === 'fill_blank' ? 2 : (defaultType === 'multi_select' ? 4 : 5)),
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      correctOptionIndices: [0],
      correctAnswer: '',
      acceptedAnswers: '',
      caseSensitive: false,
      explanation: '',
      problemStatement: '',
      constraints: '',
      starterCode: '# Read input from stdin\nword = input().strip()\n',
      testCases: [
        { input: '', expectedOutput: '', isHidden: false },
        { input: '', expectedOutput: '', isHidden: true },
      ],
    });
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      type: q.type || 'mcq',
      questionText: q.questionText || '',
      scenarioContext: q.scenarioContext || '',
      marks: q.marks || 5,
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : 0,
      correctOptionIndices: Array.isArray(q.correctOptionIndices) ? q.correctOptionIndices : [q.correctOptionIndex || 0],
      correctAnswer: q.correctAnswer || '',
      acceptedAnswers: Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.join(', ') : (q.acceptedAnswers || ''),
      caseSensitive: !!q.caseSensitive,
      explanation: q.explanation || '',
      problemStatement: q.problemStatement || '',
      constraints: q.constraints || '',
      starterCode: q.starterCode || '# Starter code\n',
      testCases: q.testCases || [{ input: '', expectedOutput: '', isHidden: false }],
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      alert('Question text is required');
      return;
    }

    const payload = {
      ...questionForm,
      acceptedAnswers: questionForm.acceptedAnswers
        ? (typeof questionForm.acceptedAnswers === 'string'
            ? questionForm.acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean)
            : questionForm.acceptedAnswers)
        : (questionForm.correctAnswer ? [questionForm.correctAnswer.trim()] : []),
    };

    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion.id, payload);
        setSuccessMsg('Question updated and autocorrect key adjusted!');
      } else {
        await api.addQuestion(selectedExamId, payload);
        setSuccessMsg('New question added to exam paper!');
      }

      setShowQuestionModal(false);
      setTimeout(() => setSuccessMsg(''), 3000);

      const refreshed = await api.getExaminerExam(selectedExamId);
      setSelectedExamDetails(refreshed.exam);
      setQuestions(refreshed.questions);
      loadExams();
    } catch (err) {
      alert('Failed to save question: ' + err.message);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadText.trim()) {
      alert('Please paste questions or load a template');
      return;
    }
    setUploading(true);
    try {
      const res = await api.bulkUploadQuestions(selectedExamId, { rawText: uploadText });
      setShowUploadModal(false);
      setUploadText('');
      setSuccessMsg(`Successfully uploaded ${res.count} questions to paper!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      const refreshed = await api.getExaminerExam(selectedExamId);
      setSelectedExamDetails(refreshed.exam);
      setQuestions(refreshed.questions);
      loadExams();
    } catch (err) {
      alert('Bulk upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteQuestion(qId);
      const refreshed = await api.getExaminerExam(selectedExamId);
      setSelectedExamDetails(refreshed.exam);
      setQuestions(refreshed.questions);
      loadExams();
    } catch (err) {
      alert('Error deleting question: ' + err.message);
    }
  };

  const handleDeleteExam = async (eId) => {
    if (!confirm('Are you sure you want to delete this exam and all its questions?')) return;
    try {
      await api.deleteExam(eId);
      setSelectedExamId(null);
      loadExams();
    } catch (err) {
      alert('Error deleting exam: ' + err.message);
    }
  };

  const handlePreviewShuffle = async () => {
    if (!selectedExamId) return;
    setLoadingShuffle(true);
    try {
      const data = await api.previewShuffle(selectedExamId, shuffleRolls);
      setShufflePreview(data);
    } catch (err) {
      alert('Failed to preview shuffle: ' + err.message);
    } finally {
      setLoadingShuffle(false);
    }
  };

  const addTestCaseField = () => {
    setQuestionForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }],
    }));
  };

  const removeTestCaseField = (idx) => {
    setQuestionForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== idx),
    }));
  };

  const updateTestCaseField = (idx, field, value) => {
    setQuestionForm((prev) => {
      const copy = [...prev.testCases];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, testCases: copy };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="hidden xs:flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-white border border-slate-200 shadow-xs items-center justify-center p-1.5">
            <img
              src="/logo_transparent.png"
              alt="ExamMatrix Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                Middleman / Paper Setter
              </span>
              <span className="text-[11px] text-slate-500 whitespace-nowrap hidden xs:inline">• ExamMatrix Authoring</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Exam Authoring & Proctoring
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Configure exam papers, set allowed branches & sections, fix mistakes in real-time, configure auto-evaluation answer keys, and simulate roll number shuffling.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateExamModal(true)}
          className="self-start sm:self-center px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Exam</span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="w-full max-w-full overflow-x-auto flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('exams')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Exams List ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Paper Setter & Mistake Editor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('shuffle');
            handlePreviewShuffle();
          }}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'shuffle'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Roll No. Shuffle Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('monitor')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'monitor'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Proctoring</span>
        </button>
      </div>

      {/* ================= TAB 1: EXAMS LIST ================= */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {exam.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                    {exam.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">{exam.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exam.description || 'No description provided.'}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-700 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <strong className="text-slate-900">{exam.durationMinutes} mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Questions:</span>
                    <strong className="text-slate-900">{exam.questionCount || 0} ({exam.totalMarks || 0} pts)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branches:</span>
                    <strong className="text-blue-700">{exam.targetBranches.join(', ')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sections:</span>
                    <strong className="text-blue-700">{exam.targetSections.join(', ')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submissions:</span>
                    <strong className="text-emerald-700">{exam.submissionCount || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setActiveTab('monitor');
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Monitor ({exam.submissionCount || 0})</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setActiveTab('questions');
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Paper</span>
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                  title="Delete Exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 2: PAPER SETTER & MISTAKE EDITOR ================= */}
      {activeTab === 'questions' && (
        <div className="space-y-5">
          {/* Exam Selector Bar */}
          <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Selected Exam:</span>
              <select
                value={selectedExamId || ''}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full xs:w-auto max-w-full sm:max-w-xs md:max-w-md bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.code}) - {e.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-600 hidden md:inline">
                Total: <strong className="text-slate-900">{questions.length} Qs</strong> ({selectedExamDetails?.totalMarks || 0} Pts)
              </span>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Paper</span>
              </button>
              <button
                onClick={openAddQuestion}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Notice about Mistake Editing */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Mistake Correction:</strong> Found an error in question text, choices, or test cases? Click <strong>"Fix Mistake"</strong> on any question below to update the autocorrect logic immediately!
            </span>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white border border-slate-200">
              <FileEdit className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No questions in this paper yet.</p>
              <button
                onClick={openAddQuestion}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs flex items-center justify-center">
                        Q{idx + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.type === 'coding'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.type === 'multi_select'
                          ? 'bg-purple-100 text-purple-800'
                          : q.type === 'fill_blank'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {q.type === 'coding' ? 'Coding Problem' : q.type === 'multi_select' ? 'SAP Multi-Select' : q.type === 'fill_blank' ? 'Fill in Blank' : 'MCQ Bit'}
                      </span>
                      <span className="text-xs font-mono text-blue-700">+{q.marks} Marks</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditQuestion(q)}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Fix Mistake / Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scenario / Case Context Banner */}
                  {q.scenarioContext && (
                    <div className="mb-2.5 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 font-sans">
                      <strong className="text-blue-700 block text-[10px] uppercase font-mono mb-0.5">Scenario / Context:</strong>
                      {q.scenarioContext}
                    </div>
                  )}

                  <div className="text-sm font-semibold text-slate-900 mb-3">{q.questionText}</div>

                  {/* MCQ Options Display */}
                  {q.type === 'mcq' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctOptionIndex;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1 truncate">{opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                                Answer Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SAP Multi-Select Options Display */}
                  {q.type === 'multi_select' && (
                    <div className="space-y-2 mt-2">
                      <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Multi-Select Keys (All checked options are correct):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(q.options || []).map((opt, oIdx) => {
                          const isCorrect = Array.isArray(q.correctOptionIndices) && q.correctOptionIndices.includes(oIdx);
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                                isCorrect
                                  ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] ${
                                isCorrect ? 'bg-purple-600 text-white font-bold' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1 truncate">{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-300">
                                  Correct Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fill in the Blank Display */}
                  {q.type === 'fill_blank' && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl mt-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-amber-900 uppercase">Correct Answer Key:</span>
                        <span className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono font-bold text-emerald-700 shadow-2xs">
                          {q.correctAnswer}
                        </span>
                        {q.acceptedAnswers && q.acceptedAnswers.length > 1 && (
                          <span className="text-slate-500 text-[11px]">
                            (Also accepted: <span className="font-mono text-slate-700">{q.acceptedAnswers.filter(a => a !== q.correctAnswer).join(', ')}</span>)
                          </span>
                        )}
                        {q.caseSensitive ? (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">Exact Case</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Case Insensitive</span>
                        )}
                      </div>
                      {q.explanation && (
                        <p className="mt-2 text-slate-600 text-[11px] font-sans">
                          <strong>Hint/Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Coding Details Display */}
                  {q.type === 'coding' && (
                    <div className="space-y-2 mt-2 text-xs font-mono">
                      {q.problemStatement && (
                        <p className="text-slate-700 font-sans text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {q.problemStatement}
                        </p>
                      )}
                      <div className="text-slate-600 text-[11px] flex items-center gap-2">
                        <span>Configured Test Cases: <strong className="text-slate-900">{(q.testCases || []).length}</strong></span>
                        <span className="text-emerald-700 font-semibold">
                          ({(q.testCases || []).filter(tc => !tc.isHidden).length} Public, {(q.testCases || []).filter(tc => tc.isHidden).length} Hidden)
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SHUFFLE SIMULATOR ================= */}
      {activeTab === 'shuffle' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-blue-600" />
                Roll Number Deterministic Shuffle Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Inspect how questions and choices are permutated deterministically for specific student roll numbers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shuffleRolls}
                onChange={(e) => setShuffleRolls(e.target.value)}
                placeholder="21CS001, 21CS002"
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
              />
              <button
                onClick={handlePreviewShuffle}
                disabled={loadingShuffle}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {loadingShuffle ? 'Computing...' : 'Simulate'}
              </button>
            </div>
          </div>

          {shufflePreview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shufflePreview.previews.map((prev, pIdx) => (
                <div key={pIdx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-mono">{prev.rollNumber}</div>
                      <div className="text-[10px] text-blue-700 font-semibold">{prev.paperSet}</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                      {prev.questionSequence.length} Questions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {prev.questionSequence.map((qSeq) => (
                      <div key={qSeq.originalId} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-blue-700 font-mono">Display #{qSeq.displayNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Original: {qSeq.originalId}</span>
                        </div>
                        <div className="text-slate-800 text-[11px] truncate">{qSeq.questionText}</div>
                        {qSeq.options && (
                          <div className="mt-1.5 text-[10px] text-slate-500 space-y-0.5">
                            {qSeq.options.slice(0, 2).map((optStr, i) => (
                              <div key={i} className="truncate">• {optStr}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: LIVE PROCTORING ================= */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Real-Time Examination Session Monitor
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                {monitorData?.examTitle || 'Live Proctoring & Candidate Score Verification'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedExamId || 'all'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedExamId(val === 'all' ? null : val);
                  loadMonitoring(val === 'all' ? 'all' : val);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              >
                <option value="all">All Examinations (College Aggregate)</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.code})
                  </option>
                ))}
              </select>

              <button
                onClick={() => loadMonitoring(selectedExamId || 'all')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {monitorData && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-sans">Submissions Logged:</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{monitorData.totalSubmissions || 0}</div>
                  <span className="text-[10px] text-slate-400 font-sans">Verified candidates</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-sans">Average Score:</span>
                  <div className="text-2xl font-bold text-blue-700 mt-1">{monitorData.averageScore || 0} pts</div>
                  <span className="text-[10px] text-slate-400 font-sans">Mean evaluation</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-sans">Integrity Alerts:</span>
                  <div className="text-2xl font-bold text-rose-600 mt-1">{monitorData.suspiciousCount || 0}</div>
                  <span className="text-[10px] text-slate-400 font-sans">Tab switch violations</span>
                </div>
              </div>

              {/* Submissions List */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Branch & Section</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Integrity Violations</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {(!monitorData.submissions || monitorData.submissions.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                          No student submissions logged yet for this assessment paper. Live candidate entries will appear here instantly as soon as students complete exams.
                        </td>
                      </tr>
                    ) : (
                      monitorData.submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900 font-sans">
                            {sub.studentName} <span className="text-slate-500 font-mono text-xs">({sub.rollNumber})</span>
                          </td>
                          <td className="p-3 text-slate-700">
                            {sub.branch} - Sec {sub.section}
                          </td>
                          <td className="p-3 text-emerald-700 font-bold">
                            {sub.score}/{sub.totalMarks} ({sub.percentage}%)
                          </td>
                          <td className="p-3">
                            {sub.tabSwitchCount > 0 ? (
                              <span className="text-rose-700 font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                                {sub.tabSwitchCount} Strikes
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold text-[11px]">Clean</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500">
                            {new Date(sub.submittedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= MODAL: CREATE EXAM ================= */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Examination Paper</h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  value={newExamForm.title}
                  onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                  placeholder="e.g. Advanced Operating Systems Mid-Term"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Code</label>
                  <input
                    type="text"
                    value={newExamForm.code}
                    onChange={(e) => setNewExamForm({ ...newExamForm, code: e.target.value })}
                    placeholder="e.g. CS205"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newExamForm.durationMinutes}
                    onChange={(e) => setNewExamForm({ ...newExamForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Assessment Type</label>
                <select
                  value={newExamForm.type}
                  onChange={(e) => setNewExamForm({ ...newExamForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="bits">Bits Only (Single-Choice Objective MCQ)</option>
                  <option value="fill_blanks">Fill in the Blanks Only</option>
                  <option value="bits_blanks">Bits + Fill in the Blanks</option>
                  <option value="sap">SAP / Enterprise Certification Test (Scenarios & Multi-select)</option>
                  <option value="hybrid">Hybrid Comprehensive (Bits + Blanks + Coding)</option>
                  <option value="coding">Hands-on Coding (Server Sandbox Evaluation)</option>
                  <option value="mixed">Mixed Assessment (Bits + Coding)</option>
                </select>
              </div>

              {/* Target Branches Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Branches (Who Can Take)</label>
                <div className="flex flex-wrap gap-3">
                  {['AIML', 'CSE', 'ECE', 'IT', 'MECH'].map((b) => (
                    <label key={b} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExamForm.targetBranches.includes(b)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExamForm({ ...newExamForm, targetBranches: [...newExamForm.targetBranches, b] });
                          } else {
                            setNewExamForm({ ...newExamForm, targetBranches: newExamForm.targetBranches.filter(x => x !== b) });
                          }
                        }}
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Sections Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Sections</label>
                <div className="flex gap-4">
                  {['A', 'B', 'C'].map((s) => (
                    <label key={s} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExamForm.targetSections.includes(s)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExamForm({ ...newExamForm, targetSections: [...newExamForm.targetSections, s] });
                          } else {
                            setNewExamForm({ ...newExamForm, targetSections: newExamForm.targetSections.filter(x => x !== s) });
                          }
                        }}
                      />
                      <span>Section {s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shuffling Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExamForm.shuffleEnabled}
                    onChange={(e) => setNewExamForm({ ...newExamForm, shuffleEnabled: e.target.checked })}
                  />
                  <span>Enable Deterministic Question & Choice Shuffling for Students</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Create & Open Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT QUESTION (FIX MISTAKES) ================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {editingQuestion ? 'Fix Mistake in Question Paper' : 'Add Question to Paper'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {editingQuestion
                ? 'Update question wording, adjust choices, modify answer key for autocorrect, or edit test cases.'
                : 'Configure question details, marks, and auto-evaluation criteria.'}
            </p>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Question Type</label>
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold"
                  >
                    <option value="mcq">Multiple Choice Bits (Single Choice MCQ)</option>
                    <option value="multi_select">SAP Multi-Select Bit (Choose Multiple)</option>
                    <option value="fill_blank">Fill in the Blank</option>
                    <option value="coding">Hands-on Coding Problem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Value</label>
                  <input
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Optional Scenario / Case Context (For SAP & Hybrid questions) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scenario / Business Case Context <span className="text-slate-400 font-normal">(Optional for SAP & Enterprise tests)</span>
                </label>
                <textarea
                  value={questionForm.scenarioContext || ''}
                  onChange={(e) => setQuestionForm({ ...questionForm, scenarioContext: e.target.value })}
                  placeholder="e.g. A company is procuring raw materials and needs to verify the Goods Receipt against the Purchase Order in SAP S/4HANA..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text / Prompt</label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="e.g. Which layer handles end-to-end communication?"
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* MCQ Options & Correct Answer Key */}
              {questionForm.type === 'mcq' && (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    Multiple Choice Options & Autocorrect Answer Key:
                  </label>
                  {questionForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctKey"
                        checked={questionForm.correctOptionIndex === i}
                        onChange={() => setQuestionForm({ ...questionForm, correctOptionIndex: i })}
                        title="Mark as correct answer key"
                        className="cursor-pointer text-blue-600"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 w-4">
                        {String.fromCharCode(65 + i)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[i] = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        required
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Explanation (Shown after exam):</label>
                    <input
                      type="text"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                      placeholder="e.g. Layer 4 is the Transport layer..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Multi-Select Options & Correct Keys (SAP Style) */}
              {questionForm.type === 'multi_select' && (
                <div className="space-y-3 p-3.5 bg-purple-50/50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-purple-900">
                      Multi-Select Options (Check all correct answer keys):
                    </label>
                    <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                      SAP / Certification Style
                    </span>
                  </div>
                  {questionForm.options.map((opt, i) => {
                    const isChecked = Array.isArray(questionForm.correctOptionIndices) && questionForm.correctOptionIndices.includes(i);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let current = Array.isArray(questionForm.correctOptionIndices) ? [...questionForm.correctOptionIndices] : [];
                            if (e.target.checked) {
                              if (!current.includes(i)) current.push(i);
                            } else {
                              current = current.filter(x => x !== i);
                            }
                            setQuestionForm({ ...questionForm, correctOptionIndices: current });
                          }}
                          className="cursor-pointer text-purple-600 rounded"
                        />
                        <span className="text-xs font-mono font-bold text-slate-600 w-4">
                          {String.fromCharCode(65 + i)}:
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...questionForm.options];
                            updated[i] = e.target.value;
                            setQuestionForm({ ...questionForm, options: updated });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          required
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                    );
                  })}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Explanation (Shown after exam):</label>
                    <input
                      type="text"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                      placeholder="e.g. In SAP ERP, both MM and FI are integrated during invoice verification."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Fill in the Blank Form */}
              {questionForm.type === 'fill_blank' && (
                <div className="space-y-3 p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-900">
                      Fill In The Blank Key & Auto-Correction Rules:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionForm({
                          ...questionForm,
                          questionText: (questionForm.questionText || '') + ' _____ ',
                        });
                      }}
                      className="text-[10px] px-2 py-1 bg-white border border-amber-300 rounded text-amber-900 hover:bg-amber-100 font-semibold cursor-pointer"
                    >
                      + Insert Blank (_____)
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Primary Correct Answer:
                    </label>
                    <input
                      type="text"
                      value={questionForm.correctAnswer || ''}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      placeholder="e.g. def or Network or SELECT"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Accepted Synonyms / Alternate Variations (Comma-Separated):
                    </label>
                    <input
                      type="text"
                      value={questionForm.acceptedAnswers || ''}
                      onChange={(e) => setQuestionForm({ ...questionForm, acceptedAnswers: e.target.value })}
                      placeholder="e.g. def, def(), define"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Students typing any of these variants will be awarded full marks automatically.
                    </p>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionForm.caseSensitive}
                        onChange={(e) => setQuestionForm({ ...questionForm, caseSensitive: e.target.checked })}
                      />
                      <span>Strict Case-Sensitive (Default is case-insensitive for fair autocorrect)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Explanation (Shown after exam):</label>
                    <input
                      type="text"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                      placeholder="e.g. def is the reserved keyword in Python for function definitions."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Coding Problem Details */}
              {questionForm.type === 'coding' && (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Statement & Requirements</label>
                    <textarea
                      value={questionForm.problemStatement}
                      onChange={(e) => setQuestionForm({ ...questionForm, problemStatement: e.target.value })}
                      placeholder="Read standard input and print the answer..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Starter Code Template</label>
                    <textarea
                      value={questionForm.starterCode}
                      onChange={(e) => setQuestionForm({ ...questionForm, starterCode: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                    />
                  </div>

                  {/* Test Cases List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700">
                        Server Test Cases (Input & Expected Output):
                      </label>
                      <button
                        type="button"
                        onClick={addTestCaseField}
                        className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    <div className="space-y-2">
                      {questionForm.testCases.map((tc, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-500">Test Case #{idx + 1}</span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-[10px] text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden}
                                  onChange={(e) => updateTestCaseField(idx, 'isHidden', e.target.checked)}
                                />
                                <span>Hidden Case</span>
                              </label>
                              {questionForm.testCases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTestCaseField(idx)}
                                  className="text-rose-600 hover:text-rose-700 text-[10px] cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 font-mono">
                            <input
                              type="text"
                              value={tc.input}
                              onChange={(e) => updateTestCaseField(idx, 'input', e.target.value)}
                              placeholder="Standard Input (e.g. radar)"
                              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900"
                            />
                            <input
                              type="text"
                              value={tc.expectedOutput}
                              onChange={(e) => updateTestCaseField(idx, 'expectedOutput', e.target.value)}
                              placeholder="Expected Output (e.g. radar is palindrome)"
                              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-emerald-700 font-semibold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingQuestion ? 'Save Mistake Corrections' : 'Save Question to Paper'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BULK UPLOAD / IMPORT PAPER ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload / Import Exam Paper
              </h2>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Target: {selectedExamDetails?.code || 'Active Paper'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Upload any exam instantly by pasting formatted questions (Bits only, Fill in the blanks, SAP multi-select, or Hybrid) or JSON.
            </p>

            {/* Quick Templates Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
              <span className="text-[11px] font-bold text-slate-700 block mb-2">
                Load Sample Question Paper Template:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setUploadText(`[MCQ]
Q: Which OSI layer is responsible for logical routing of IP packets?
A) Physical Layer
B) Data Link Layer
C) Network Layer*
D) Transport Layer
Marks: 2
Explanation: The Network layer (Layer 3) handles IP packet routing.

[MCQ]
Q: In Operating Systems, which condition is NOT required for deadlock?
A) Mutual Exclusion
B) Hold and Wait
C) Preemption Allowed*
D) Circular Wait
Marks: 2
Explanation: Deadlock requires No Preemption.`)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Bits Only Template
                </button>

                <button
                  type="button"
                  onClick={() => setUploadText(`[MCQ]
Q: Which HTTP status code indicates a successful resource creation?
A) 200 OK
B) 201 Created*
C) 204 No Content
D) 301 Moved Permanently
Marks: 2
Explanation: 201 Created is returned when a resource is created.

[BLANK]
Q: In Python, the keyword used to define a function is _____.
Answer: def
Accepted: def, def()
Marks: 2
Explanation: Functions in Python are defined with the def keyword.

[MCQ]
Q: Which data structure uses the LIFO (Last In First Out) principle?
A) Queue
B) Stack*
C) Linked List
D) Binary Heap
Marks: 2
Explanation: Stacks operate on Last In, First Out order.

[BLANK]
Q: In SQL, the command used to retrieve records from a database is _____.
Answer: SELECT
Accepted: SELECT, select
Marks: 2
Explanation: The SELECT query retrieves tabular rows.`)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-slate-300 hover:border-amber-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Bits + Fill in Blanks Template
                </button>

                <button
                  type="button"
                  onClick={() => setUploadText(`[SAP]
Scenario: An enterprise order-to-cash process requires automated billing and account receivable posting.
Q: Which two modules in SAP ERP are primarily involved in this integration? (Choose 2)
A) Sales & Distribution (SD)*
B) Financial Accounting (FI)*
C) Plant Maintenance (PM)
D) Quality Management (QM)
Marks: 4
Explanation: SD handles sales orders/billing and posts accounting documents directly to FI.

[SAP]
Scenario: Material requirements planning (MRP) is executed for a production plant.
Q: In SAP S/4HANA, the transaction code to create a standard Purchase Order is _____.
Answer: ME21N
Accepted: ME21N, me21n
Marks: 2
Explanation: ME21N is the standard single-screen transaction for Purchase Order creation.`)}
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-800 border border-slate-300 hover:border-purple-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  SAP Test Template
                </button>
              </div>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Questions Content (Paste below):
                </label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Paste your questions in Bits, Blanks, or SAP format, or click a template above..."
                  rows={10}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  spellCheck="false"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Importing...' : 'Import Questions Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
