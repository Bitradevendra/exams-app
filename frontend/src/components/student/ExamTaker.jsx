import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Send, 
  Code2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ListOrdered, 
  Terminal, 
  ShieldAlert, 
  CheckSquare, 
  FileEdit, 
  FileText, 
  RotateCcw, 
  Save, 
  Maximize2, 
  Minimize2, 
  Info, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Laptop, 
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../api';
import { prototypeStore } from '../../prototypeStore';

const QUICK_KEYS = [
  { label: 'Tab', insert: '    ' },
  { label: '{ }', insert: '{\n    \n}' },
  { label: '( )', insert: '()' },
  { label: '[ ]', insert: '[]' },
  { label: ';', insert: ';' },
  { label: ':', insert: ':' },
  { label: '=', insert: ' = ' },
  { label: '" "', insert: '""' },
  { label: "' '", insert: "''" },
  { label: '.', insert: '.' },
  { label: '->', insert: ' -> ' },
  { label: '+', insert: ' + ' },
  { label: '-', insert: ' - ' },
  { label: '*', insert: ' * ' },
  { label: '/', insert: ' / ' },
  { label: '<', insert: ' < ' },
  { label: '>', insert: ' > ' },
  { label: '==', insert: ' == ' },
  { label: '!=', insert: ' != ' },
  { label: '!', insert: '!' }
];

export default function ExamTaker({ exam, student, onExamSubmitted, onExit }) {
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Responses state
  const [answers, setAnswers] = useState({});
  const [codeAnswers, setCodeAnswers] = useState({});
  const [reviewed, setReviewed] = useState(new Set());

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState((exam.durationMinutes || 45) * 60);

  // Anti-cheat / integrity state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);

  // Coding execution & Techademy state
  const [runningCode, setRunningCode] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile layout switcher
  const [mobileTab, setMobileTab] = useState('problem'); // 'problem' or 'editor'
  
  // Bottom drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('testcases'); // 'testcases', 'custom', 'console'

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Ref for textarea to insert quick symbols
  const textareaRef = useRef(null);

  useEffect(() => {
    async function loadPaper() {
      setLoading(true);
      setError('');
      try {
        let data = await api.getStudentPaper(exam.id, student.rollNumber);
        let paperQuestions = data?.questions || [];

        if (!paperQuestions || paperQuestions.length === 0) {
          const protoPaper = prototypeStore.getStudentPaper(exam.id, student.rollNumber);
          paperQuestions = protoPaper.questions;
          data = { ...data, exam: data?.exam || protoPaper.exam, questions: paperQuestions };
        }

        setPaper(data.exam || exam);
        setQuestions(paperQuestions);

        const initialCode = {};
        paperQuestions.forEach((q) => {
          if (q.type === 'coding') {
            const defaultLang = (q.allowedLanguages && q.allowedLanguages[0]) || 'java';
            initialCode[q.id] = {
              code: q.starterCode || '// Write your solution here\n',
              language: defaultLang,
            };
          }
        });
        setCodeAnswers(initialCode);
      } catch (err) {
        console.warn('Network error in loadPaper, using prototype store:', err.message);
        try {
          const protoPaper = prototypeStore.getStudentPaper(exam.id, student.rollNumber);
          setPaper(protoPaper.exam);
          setQuestions(protoPaper.questions);

          const initialCode = {};
          protoPaper.questions.forEach((q) => {
            if (q.type === 'coding') {
              const defaultLang = (q.allowedLanguages && q.allowedLanguages[0]) || 'java';
              initialCode[q.id] = {
                code: q.starterCode || '// Write your solution here\n',
                language: defaultLang,
              };
            }
          });
          setCodeAnswers(initialCode);
        } catch (innerErr) {
          setError(innerErr.message || 'Failed to load exam paper');
        }
      } finally {
        setLoading(false);
      }
    }
    loadPaper();
  }, [exam.id, student.rollNumber]);

  // Anti-cheat listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowCheatingWarning(true);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setShowCheatingWarning(true);
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, secondsRemaining]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (originalIndex) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: originalIndex,
    }));
  };

  const handleToggleMultiSelectOption = (originalIndex) => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const currentArr = Array.isArray(prev[currentQ.id]) ? [...prev[currentQ.id]] : [];
      let updated;
      if (currentArr.includes(originalIndex)) {
        updated = currentArr.filter((x) => x !== originalIndex);
      } else {
        updated = [...currentArr, originalIndex];
      }
      return {
        ...prev,
        [currentQ.id]: updated,
      };
    });
  };

  const handleClearSelection = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleReview = () => {
    if (!currentQ) return;
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  const handleCodeChange = (newCode) => {
    if (!currentQ) return;
    setCodeAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || { language: 'java' }),
        code: newCode,
      },
    }));
  };

  const handleLanguageChange = (newLang) => {
    if (!currentQ) return;
    
    // Provide appropriate template if switching between languages
    let starter = codeAnswers[currentQ.id]?.code || '';
    if (newLang === 'python' && starter.includes('public class')) {
      starter = `# Python Solution for ${currentQ.questionText}\nimport sys\n\ntotal_cost = 0.0\nwhile True:\n    line = sys.stdin.readline()\n    if not line: break\n    action = int(line.strip())\n    if action == 1:\n        name = sys.stdin.readline().strip()\n        price = float(sys.stdin.readline().strip())\n        print(f"Order Added: {name}")\n        total_cost += price\n    elif action == 2:\n        name = sys.stdin.readline().strip()\n        price = float(sys.stdin.readline().strip())\n        print(f"Order Added: {name}")\n        total_cost += price\n    elif action == 3:\n        print(f"Total Order Cost: {total_cost:.1f}")\n    elif action == 4:\n        break\n`;
    } else if (newLang === 'java' && starter.includes('import sys')) {
      starter = currentQ.starterCode || '// Java Solution\n';
    }

    setCodeAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        code: starter,
        language: newLang,
      },
    }));
  };

  // Quick-code touch key inserter for mobile keyboards
  const handleInsertQuickKey = (strToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea || !currentQ) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = codeAnswers[currentQ.id]?.code || '';

    const nextVal = currentVal.substring(0, start) + strToInsert + currentVal.substring(end);
    handleCodeChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      const cursorTarget = start + strToInsert.length;
      textarea.setSelectionRange(cursorTarget, cursorTarget);
    }, 10);
  };

  const handleResetCode = () => {
    if (!currentQ) return;
    if (window.confirm('Reset code to original starter template? Any unsaved edits will be discarded.')) {
      handleCodeChange(currentQ.starterCode || '');
    }
  };

  const handleSaveCode = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleAutoSolveDemo = () => {
    if (!currentQ || currentQ.type !== 'coding') return;
    let sol = '';
    const lang = codeAnswers[currentQ.id]?.language || 'java';

    if (currentQ.id === 'q-107-1' || currentQ.questionText.includes('Cafe Order')) {
      if (lang === 'python') {
        sol = `import sys\n\ntotal = 0.0\nwhile True:\n    line = sys.stdin.readline()\n    if not line: break\n    act = int(line.strip())\n    if act == 1:\n        name = sys.stdin.readline().strip()\n        price = float(sys.stdin.readline().strip())\n        print(f"Order Added: {name}")\n        total += price\n    elif act == 2:\n        name = sys.stdin.readline().strip()\n        price = float(sys.stdin.readline().strip())\n        print(f"Order Added: {name}")\n        total += price\n    elif act == 3:\n        print(f"Total Order Cost: {total:.1f}")\n    elif act == 4:\n        break\n`;
      } else {
        sol = currentQ.starterCode;
      }
    } else if (currentQ.id === 'q-101-1' || currentQ.questionText.includes('Palindrome')) {
      sol = `# Palindrome Solution\nword = input().strip()\nif word.lower() == word.lower()[::-1]:\n    print(f"{word} is palindrome")\nelse:\n    print(f"{word} is not palindrome")\n`;
    } else if (currentQ.id === 'q-101-2' || currentQ.questionText.includes('Even Numbers')) {
      sol = `# Sum of Evens Solution\nnums = list(map(int, input().split()))\neven_sum = sum(x for x in nums if x % 2 == 0)\nprint(even_sum)\n`;
    } else if (currentQ.id === 'q-108-1' || currentQ.questionText.includes('Two-Sum')) {
      sol = `# Two-Sum Solution\nnums = list(map(int, input().split()))\ntarget = int(input())\nfor i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        if nums[i] + nums[j] == target:\n            print(f"{i} {j}")\n            break\n`;
    } else if (currentQ.id === 'q-108-2' || currentQ.questionText.includes('Binary Search')) {
      sol = `# Binary Search Solution\nnums = list(map(int, input().split()))\ntarget = int(input())\nprint(nums.index(target) if target in nums else -1)\n`;
    } else if (currentQ.id === 'q-109-1' || currentQ.questionText.includes('Cart')) {
      sol = `// JavaScript Cart Calculator\nlet subtotal = 0;\nwhile (true) {\n  const line = input();\n  if (!line || line === '0 0') break;\n  const [p, q] = line.trim().split(/\\s+/).map(Number);\n  if (!isNaN(p) && !isNaN(q)) subtotal += p * q;\n}\nconst discount = subtotal > 100 ? subtotal * 0.10 : 0;\nconst afterDiscount = subtotal - discount;\nconst tax = afterDiscount * 0.05;\nconst finalTotal = afterDiscount + tax;\nconsole.log("Final Total: " + finalTotal.toFixed(2));\n`;
    } else {
      sol = currentQ.starterCode || '// Verified Solution\n';
    }

    handleCodeChange(sol);
    handleSaveCode();
    setTimeout(() => {
      handleRunSampleCode(false);
    }, 150);
  };

  const handleRunSampleCode = async (useCustom = false) => {
    if (!currentQ || currentQ.type !== 'coding') return;
    const submission = codeAnswers[currentQ.id] || { code: '', language: 'java' };

    setRunningCode(true);
    setDrawerOpen(true);
    setDrawerTab(useCustom ? 'custom' : 'testcases');
    setRunResult(null);
    setAttempts((prev) => Math.min(prev + 1, 10));

    try {
      const payload = {
        questionId: currentQ.id,
        language: submission.language,
        code: submission.code,
        customInput: useCustom ? customInput : undefined,
      };
      const res = await api.runStudentCode(exam.id, payload);
      setRunResult(res);
      if (useCustom) {
        setDrawerTab('console');
      }
    } catch (err) {
      setRunResult({
        success: false,
        error: err.message,
      });
      setDrawerTab('console');
    } finally {
      setRunningCode(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const submissionPayload = {
        rollNumber: student.rollNumber,
        studentName: student.name,
        branch: student.branch,
        section: student.section,
        answers,
        codeAnswers,
        tabSwitchCount,
      };

      const res = await api.submitExam(exam.id, submissionPayload);
      onExamSubmitted(res.submission);
    } catch (err) {
      alert('Error submitting exam: ' + err.message);
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Your assessment is now being submitted automatically.');
    handleConfirmSubmit();
  };

  // Status counters
  const answeredCount = questions.filter((q) => {
    if (q.type === 'mcq') return answers[q.id] !== undefined;
    if (q.type === 'multi_select') return Array.isArray(answers[q.id]) && answers[q.id].length > 0;
    if (q.type === 'fill_blank') return answers[q.id] !== undefined && String(answers[q.id]).trim().length > 0;
    if (q.type === 'coding') {
      const c = codeAnswers[q.id]?.code;
      return c && c.trim().length > 0 && c !== q.starterCode;
    }
    return false;
  }).length;

  const attemptedCount = answeredCount;
  const reviewCount = reviewed.size;
  const skippedCount = Math.max(0, questions.length - attemptedCount);
  const unreadCount = 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-semibold tracking-wide">Initializing Assessment Engine...</p>
        <p className="text-xs text-slate-400 mt-1">Roll No: {student.rollNumber} • {student.name}</p>
      </div>
    );
  }

  if (error || !currentQ) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-md text-center">
          <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Assessment Error</h3>
          <p className="text-xs text-slate-600 mt-1">{error || 'No questions available in this examination paper.'}</p>
          <button
            onClick={onExit}
            className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white shadow transition-all cursor-pointer"
          >
            Return to Exam Lobby
          </button>
        </div>
      </div>
    );
  }

  const isCurrentReviewed = reviewed.has(currentQ.id);
  const currentCode = codeAnswers[currentQ.id]?.code || '';
  const currentLang = codeAnswers[currentQ.id]?.language || 'java';

  // Compute line numbers gutter for code editor
  const lineCount = Math.max((currentCode.split('\n').length || 1), 20);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col exam-proctor-mode select-none font-sans">
      
      {/* 1. TOP HEADER (Techademy style: Assessment Engine) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Exam / Batch Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs font-mono shrink-0">
              {currentIndex + 1}/{questions.length}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[160px] sm:max-w-md">
                {paper?.title || exam.title}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 truncate">
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  {paper?.paperSet || 'Set A'}
                </span>
                <span className="hidden xs:inline">• {student.name} ({student.rollNumber})</span>
              </div>
            </div>
          </div>

          {/* Right: Time Remaining, Tools & Submit Assessment */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Anti-cheat strike counter */}
            {tabSwitchCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Focus Lost:</span> {tabSwitchCount}
              </div>
            )}

            {/* Time Remaining */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm tracking-wide ${
                secondsRemaining < 300
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] sm:text-xs text-slate-500 hidden sm:inline">Time Remaining</span>
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Fullscreen icon */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hidden sm:flex items-center justify-center cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Info icon */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
              title="Assessment Instructions"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Submit Assessment Button (Techademy purple pill) */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 sm:px-4 py-1.5 bg-[#6355d8] hover:bg-[#5244c4] text-white font-bold text-xs rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Submit Assessment</span>
            </button>

          </div>
        </div>
      </header>

      {/* 2. SUB-HEADER: Status Chips (Techademy style: Unread, Attempted, For Review, Skipped) */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
              Unread
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700 font-semibold">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {attemptedCount}
              </span>
              Attempted
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-700">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                {reviewCount}
              </span>
              For Review
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {skippedCount}
              </span>
              Skipped
            </span>
          </div>

          {/* Question Navigator Pager */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-600 font-medium">
              Q {currentIndex + 1} of {questions.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE VIEW SWITCHER (Visible on screens < 1024px) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-1.5 sticky top-[53px] z-30 flex items-center justify-center">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full max-w-sm border border-slate-200">
          <button
            onClick={() => setMobileTab('problem')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'problem'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN ASSESSMENT WORKSPACE (Split Screen on Desktop, Tabbed on Mobile) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        
        {/* LEFT PANE: Problem Statement */}
        <div className={`lg:col-span-5 flex flex-col space-y-3 ${
          mobileTab !== 'problem' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Question Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold font-mono">
                  Q{currentIndex + 1}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase">
                  {currentQ.type === 'coding' ? 'Coding' : currentQ.type === 'sap' ? 'SAP Test' : 'MCQ Bits'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  +{currentQ.marks} Marks
                </span>
                <button
                  onClick={toggleReview}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                    isCurrentReviewed
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentReviewed ? 'fill-current text-amber-600' : ''}`} />
                  <span className="hidden sm:inline">{isCurrentReviewed ? 'Marked' : 'Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Title */}
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {currentQ.questionText}
            </h2>

            {/* Problem Statement Content */}
            {currentQ.problemStatement && (
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                {currentQ.problemStatement}
              </div>
            )}

            {/* Constraints */}
            {currentQ.constraints && (
              <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200 p-3 rounded-xl">
                <strong className="font-semibold block mb-0.5">Constraints:</strong>
                <span>{currentQ.constraints}</span>
              </div>
            )}

            {/* Non-Coding Questions: MCQ, Multi-Select, Fill Blank */}
            {currentQ.type === 'mcq' && (
              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.originalIndex;
                  return (
                    <button
                      key={opt.optionKey}
                      type="button"
                      onClick={() => handleSelectOption(opt.originalIndex)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs text-indigo-950 font-medium'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="text-xs sm:text-sm leading-normal flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'multi_select' && (
              <div className="space-y-2 pt-2">
                {(currentQ.options || []).map((opt) => {
                  const selectedArr = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                  const isSelected = selectedArr.includes(opt.originalIndex);
                  return (
                    <button
                      key={opt.optionKey}
                      type="button"
                      onClick={() => handleToggleMultiSelectOption(opt.originalIndex)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs text-indigo-950 font-semibold'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓' : opt.optionKey}
                      </span>
                      <span className="text-xs sm:text-sm leading-normal flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'fill_blank' && (
              <div className="pt-2 space-y-2">
                <input
                  type="text"
                  value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
                  }}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus:outline-none transition-all shadow-xs"
                />
              </div>
            )}

            {/* Switch to Code Editor button on mobile if coding question */}
            {currentQ.type === 'coding' && (
              <div className="lg:hidden pt-3 border-t border-slate-100">
                <button
                  onClick={() => setMobileTab('editor')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Open Code Editor</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANE: Code Editor & Drawer */}
        <div className={`lg:col-span-7 flex flex-col space-y-3 ${
          mobileTab !== 'editor' ? 'hidden lg:flex' : 'flex'
        }`}>
          {currentQ.type === 'coding' ? (
            <div className="bg-[#1e1e1e] border border-slate-700 rounded-2xl overflow-hidden shadow-md flex flex-col text-slate-200">
              
              {/* Techademy Code Editor Header Bar */}
              <div className="bg-[#252526] px-3 py-2 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
                
                {/* Language Selector Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={currentLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-[#1e1e1e] text-indigo-400 font-mono text-xs font-semibold px-2.5 py-1 rounded border border-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="java">java</option>
                    <option value="python">python 3</option>
                    <option value="javascript">javascript</option>
                  </select>

                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    Compile & Run Attempts: <strong className="text-slate-200">{attempts}/10</strong>
                  </span>
                </div>

                {/* Right Action Buttons: Run, Save Code, Reset */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono sm:hidden mr-1">
                    {attempts}/10
                  </span>

                  {/* Run Button (Green Techademy style) */}
                  <button
                    onClick={() => handleRunSampleCode(false)}
                    disabled={runningCode}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Play className={`w-3 h-3 fill-current ${runningCode ? 'animate-spin' : ''}`} />
                    <span>{runningCode ? 'Running...' : 'Run'}</span>
                  </button>

                  {/* Save Code Button */}
                  <button
                    onClick={handleSaveCode}
                    className="px-2.5 py-1 bg-[#333333] hover:bg-[#444444] text-slate-200 text-xs font-medium rounded flex items-center gap-1 transition-all border border-slate-600 cursor-pointer"
                  >
                    {savedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                    <span className="hidden xs:inline">{savedFeedback ? 'Saved' : 'Save Code'}</span>
                  </button>

                  {/* Auto-Solve Demo Button */}
                  <button
                    onClick={handleAutoSolveDemo}
                    title="Load Working Solution & Test (Demo Helper)"
                    className="px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-700 text-indigo-200 border border-indigo-500/60 text-xs font-semibold rounded flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span className="hidden xs:inline">Auto-Solve</span>
                  </button>

                  {/* Reset Template Button */}
                  <button
                    onClick={handleResetCode}
                    title="Reset to Starter Code"
                    className="p-1 text-slate-400 hover:text-white hover:bg-[#333333] rounded transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Area with Line Numbers Gutter */}
              <div className="relative flex bg-[#1e1e1e] font-mono text-xs sm:text-sm min-h-[300px] sm:min-h-[380px] max-h-[500px] overflow-hidden">
                
                {/* Line numbers gutter */}
                <div className="w-10 sm:w-12 bg-[#1e1e1e] border-r border-slate-800 text-slate-600 select-none py-3 pr-2 text-right font-mono text-[11px] sm:text-xs leading-5">
                  {lineNumbers.map((num) => (
                    <div key={num} className="leading-5">{num}</div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={currentCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="// Enter your source code solution here..."
                  spellCheck={false}
                  className="flex-1 bg-transparent text-slate-100 p-3 leading-5 outline-none resize-none overflow-y-auto whitespace-pre font-mono text-xs sm:text-sm"
                  style={{
                    tabSize: 4,
                    lineHeight: '1.25rem'
                  }}
                />
              </div>

              {/* Mobile Quick-Code Touchbar (Sticky bar above mobile touch keyboard) */}
              <div className="bg-[#2d2d2d] border-t border-slate-700 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 shrink-0">
                  Quick-Keys:
                </span>
                {QUICK_KEYS.map((key) => (
                  <button
                    key={key.label}
                    type="button"
                    onClick={() => handleInsertQuickKey(key.insert)}
                    className="px-2 py-1 bg-[#3a3a3a] hover:bg-indigo-600 active:bg-indigo-700 text-slate-200 hover:text-white font-mono text-xs font-bold rounded shadow-xs shrink-0 transition-colors border border-slate-600 cursor-pointer"
                  >
                    {key.label}
                  </button>
                ))}
              </div>

              {/* Collapsible Input/Output Bottom Drawer */}
              <div className="border-t border-slate-700 bg-[#252526]">
                
                {/* Drawer Header Accordion Toggle */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="w-full px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Input / Output Console</span>
                    {runResult && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        runResult.allPassed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}>
                        {runResult.passedCount}/{runResult.totalCount} Passed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[10px] font-normal">{drawerOpen ? 'Collapse' : 'Expand'}</span>
                    {drawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {/* Drawer Body */}
                {drawerOpen && (
                  <div className="p-3 bg-[#1e1e1e] border-t border-slate-700 space-y-3">
                    
                    {/* Drawer Tab Navigation */}
                    <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                      <button
                        onClick={() => setDrawerTab('testcases')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          drawerTab === 'testcases'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white bg-[#2d2d2d]'
                        }`}
                      >
                        Sample Test Cases
                      </button>
                      <button
                        onClick={() => setDrawerTab('custom')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          drawerTab === 'custom'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white bg-[#2d2d2d]'
                        }`}
                      >
                        Custom Input
                      </button>
                      <button
                        onClick={() => setDrawerTab('console')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          drawerTab === 'console'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white bg-[#2d2d2d]'
                        }`}
                      >
                        Output Console
                      </button>
                    </div>

                    {/* Tab 1: Sample Test Cases */}
                    {drawerTab === 'testcases' && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {runResult?.results ? (
                          runResult.results.map((res) => (
                            <div
                              key={res.testCaseIndex}
                              className={`p-3 rounded-xl border font-mono text-xs space-y-1.5 ${
                                res.passed
                                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  {res.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                  )}
                                  Test Case {res.testCaseIndex} {res.isHidden ? '(Hidden)' : ''}
                                </span>
                                <span className="text-[10px] opacity-75">
                                  {res.executionTimeMs}ms • {res.passed ? 'PASSED' : 'FAILED'}
                                </span>
                              </div>

                              {!res.isHidden && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                  <div className="bg-[#121212] p-2 rounded border border-slate-800">
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Input:</span>
                                    <pre className="whitespace-pre-wrap">{res.input}</pre>
                                  </div>
                                  <div className="bg-[#121212] p-2 rounded border border-slate-800">
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Expected Output:</span>
                                    <pre className="whitespace-pre-wrap">{res.expectedOutput}</pre>
                                  </div>
                                  <div className="sm:col-span-2 bg-[#121212] p-2 rounded border border-slate-800">
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Your Output:</span>
                                    <pre className="whitespace-pre-wrap text-slate-200">{res.actualOutput}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-400 text-xs font-mono">
                            Click <strong className="text-emerald-400 font-bold">Run</strong> above to compile your code and execute all test cases.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Custom Input */}
                    {drawerTab === 'custom' && (
                      <div className="space-y-2">
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Type custom standard input here..."
                          rows={4}
                          className="w-full bg-[#121212] border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleRunSampleCode(true)}
                          disabled={runningCode}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run with Custom Input</span>
                        </button>
                      </div>
                    )}

                    {/* Tab 3: Console Output */}
                    {drawerTab === 'console' && (
                      <div className="bg-[#121212] border border-slate-800 rounded-lg p-3 font-mono text-xs max-h-48 overflow-y-auto">
                        {runResult ? (
                          <div>
                            {runResult.error ? (
                              <div className="text-rose-400 whitespace-pre-wrap">
                                [Execution Error]: {runResult.error}
                              </div>
                            ) : (
                              <div className="text-emerald-300 whitespace-pre-wrap">
                                {runResult.stdout || 'Program exited with 0 errors.'}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-1">
                              Execution Time: {runResult.executionTimeMs || 10}ms
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Console is idle.</span>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ) : (
            /* If non-coding exam, display supportive status or prompt */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center">
              <p className="text-xs text-slate-500">Select your answers in the Question Pane on the left.</p>
            </div>
          )}
        </div>

      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Assessment Submission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to submit your paper? You will not be able to modify your answers once submitted.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Attempted:</span>
                <strong className="text-emerald-700">{attemptedCount} / {questions.length}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Marked for Review:</span>
                <strong className="text-amber-700">{reviewCount}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Time Left:</span>
                <strong className="text-indigo-700">{formatTime(secondsRemaining)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Focus Lost Strikes:</span>
                <strong className={tabSwitchCount > 0 ? 'text-rose-700' : 'text-slate-700'}>{tabSwitchCount}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6355d8] hover:bg-[#5244c4] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Confirm & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANTI-CHEAT FOCUS LOST WARNING MODAL */}
      {showCheatingWarning && (
        <div className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-300 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">Security Warning: Window Focus Lost</h3>
            <p className="text-xs text-slate-600">
              ExamMatrix has detected that you switched away from the examination screen. This event has been recorded for institutional proctor review.
            </p>
            <div className="text-xs font-mono font-bold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
              Violation Strike Count: {tabSwitchCount}
            </div>
            <button
              onClick={() => setShowCheatingWarning(false)}
              className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
            >
              I Understand and Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* INSTRUCTION MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <span>Assessment Instructions</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>• Do not minimize or switch tabs. All actions are proctored and logged.</p>
              <p>• For coding questions, you can select Java, Python 3, or Node.js from the language dropdown.</p>
              <p>• Use the <strong>Quick-Keys</strong> toolbar (Tab, semicolons, brackets) to easily type code on mobile keyboards.</p>
              <p>• Click <strong>Run</strong> to compile and execute test cases before submitting.</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
