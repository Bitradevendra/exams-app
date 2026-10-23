import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ShieldAlert,
  FileCheck
} from 'lucide-react';

export default function ExamResult({ submission, onBackToLobby }) {
  useEffect(() => {
    if (submission && submission.percentage >= 60) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  }, [submission]);

  if (!submission) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
        <p className="text-xs text-slate-600">Submission data unavailable.</p>
        <button
          onClick={onBackToLobby}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  const {
    examTitle,
    rollNumber,
    studentName,
    branch,
    section,
    score,
    totalMarks,
    percentage,
    grade,
    tabSwitchCount,
    submittedAt,
  } = submission;

  const breakdowns = submission.breakdowns || submission.evaluation || [];
  const isPassed = percentage >= 40;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Navigation */}
      <button
        onClick={onBackToLobby}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Examination Lobby</span>
      </button>

      {/* Main Scorecard Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-center sm:text-left">
          
          <div>
            {/* Scorecard Header */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <img
                src="/logo_transparent.png"
                alt="ExamMatrix Logo"
                className="h-11 w-auto object-contain"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  ExamMatrix Examination Report
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Official Academic Evaluation & Grade Breakdown
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isPassed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {isPassed ? 'Official Result: Passed' : 'Official Result: Needs Improvement'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {new Date(submittedAt).toLocaleTimeString()} • {new Date(submittedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {examTitle}
            </h1>
            
            <p className="text-xs text-slate-600 mt-2 font-mono">
              Candidate: <strong className="text-slate-900">{studentName}</strong> ({rollNumber}) • {branch}-{section}
            </p>

            {tabSwitchCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Recorded {tabSwitchCount} tab switch warning{tabSwitchCount > 1 ? 's' : ''} during session</span>
              </div>
            )}
          </div>

          {/* Big Score Box */}
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs min-w-[160px]">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
              {score}
              <span className="text-lg text-slate-400 font-normal">/{totalMarks}</span>
            </div>
            <div className="text-sm font-bold text-blue-700 font-mono mt-1">
              {percentage}%
            </div>
            <div className="mt-2 px-3 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
              Grade: {grade}
            </div>
          </div>

        </div>
      </div>

      {/* Breakdown Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          Question-by-Question Evaluation Breakdown
        </h2>
        <span className="text-xs font-mono text-slate-500">
          {breakdowns.length} Questions Graded
        </span>
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-4">
        {breakdowns.map((item, idx) => {
          const isMcq = item.type === 'mcq';
          const isMultiSelect = item.type === 'multi_select';
          const isFillBlank = item.type === 'fill_blank';
          const isCoding = item.type === 'coding';
          const isCorrect = item.isCorrect;

          const getTypeName = () => {
            if (isMcq) return 'MCQ Bits';
            if (isMultiSelect) return 'SAP Multi-Select';
            if (isFillBlank) return 'Fill in the Blank';
            if (isCoding) return 'Coding Challenge';
            return 'Question';
          };

          return (
            <div
              key={item.questionId || idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
            >
              {/* Question Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-slate-100 text-slate-700">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {getTypeName()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(() => {
                    const marksPossible = item.marksPossible || item.maxMarks || 5;
                    const marksEarned = item.marksEarned !== undefined ? item.marksEarned : (item.isCorrect ? marksPossible : 0);
                    const isItemCorrect = item.isCorrect ?? (item.status === 'correct' || marksEarned === marksPossible);
                    return (
                      <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border ${
                        isItemCorrect
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : marksEarned > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {marksEarned} / {marksPossible} Marks
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Scenario Context if present */}
              {item.scenarioContext && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Business / Technical Scenario:
                  </span>
                  <div className="whitespace-pre-line">{item.scenarioContext}</div>
                </div>
              )}

              {/* Question Text */}
              <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                {item.questionText}
              </div>

              {/* MCQ Evaluation Details */}
              {isMcq && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Your Selected Answer:</span>
                      {item.studentChosenIndex !== null && item.studentChosenIndex !== undefined ? (
                        <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {item.options ? item.options[item.studentChosenIndex] : `Option ${item.studentChosenIndex + 1}`}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Attempted</span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Correct Answer Key:</span>
                      <span className="text-emerald-700 font-bold">
                        {item.options ? item.options[item.correctOptionIndex] : `Option ${item.correctOptionIndex + 1}`}
                      </span>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="mt-2 text-xs text-slate-700 bg-blue-50/50 border border-blue-200 p-2.5 rounded-lg">
                      <strong className="text-blue-700">Explanation: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Multi-Select / SAP Evaluation Details */}
              {isMultiSelect && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block mb-1">Your Selected Options:</span>
                      {Array.isArray(item.studentChosenIndices) && item.studentChosenIndices.length > 0 ? (
                        <div className="space-y-1">
                          {item.studentChosenIndices.map((ci) => {
                            const isChosenCorrect = item.correctOptionIndices?.includes(ci);
                            return (
                              <div
                                key={ci}
                                className={`text-xs font-semibold px-2 py-1 rounded border flex items-center gap-1.5 ${
                                  isChosenCorrect
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {isChosenCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                                <span>{item.options?.[ci] || `Option ${ci + 1}`}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No options selected</span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block mb-1">Official Correct Keys:</span>
                      <div className="space-y-1">
                        {item.correctOptionIndices?.map((ci) => (
                          <div
                            key={ci}
                            className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item.options?.[ci] || `Option ${ci + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="mt-2 text-xs text-slate-700 bg-blue-50/50 border border-blue-200 p-2.5 rounded-lg">
                      <strong className="text-blue-700">Explanation: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Fill in the Blank Evaluation Details */}
              {isFillBlank && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Your Response:</span>
                      {item.studentAnswer ? (
                        <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          "{item.studentAnswer}"
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Blank / Unanswered</span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Accepted Answer(s):</span>
                      <span className="text-emerald-700 font-bold">
                        {item.acceptedAnswers?.length > 1
                          ? item.acceptedAnswers.join(' / ')
                          : item.correctAnswer || item.acceptedAnswers?.[0] || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="mt-2 text-xs text-slate-700 bg-blue-50/50 border border-blue-200 p-2.5 rounded-lg">
                      <strong className="text-blue-700">Explanation: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Coding Evaluation Details */}
              {isCoding && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">Language: <strong className="text-slate-900">{item.language || 'Java'}</strong></span>
                    <span className="text-emerald-700 font-bold">
                      {item.passedCount !== undefined ? item.passedCount : ((item.isCorrect || item.status === 'correct') ? (item.totalTestCases || 3) : 0)} of {item.totalTestCases || 3} Test Cases Passed
                    </span>
                  </div>

                  {/* Submitted Code View */}
                  {(item.code || item.studentAnswer) ? (
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block mb-1">Submitted Source Code:</span>
                      <pre className="bg-white p-3 rounded-lg text-xs font-mono text-slate-900 overflow-x-auto max-h-48 border border-slate-200">
                        {item.code || item.studentAnswer}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No code submitted for this problem.</p>
                  )}

                  {/* Test Cases Results */}
                  {item.testCaseResults && item.testCaseResults.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono text-slate-600 block mb-1.5">Server Test Run Results:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.testCaseResults.map((tc, tIdx) => (
                          <div
                            key={tIdx}
                            className={`p-2 rounded-lg border text-xs font-mono ${
                              tc.passed
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : 'bg-rose-50/60 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-800">Test #{tc.testCaseNumber} {tc.isHidden ? '(Hidden)' : ''}</span>
                              {tc.passed ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Passed
                                </span>
                              ) : (
                                <span className="text-rose-700 font-bold flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Failed
                                </span>
                              )}
                            </div>
                            {!tc.isHidden && (
                              <div className="text-[10px] text-slate-600">
                                <div>Input: <span className="text-slate-900 font-semibold">{tc.input}</span></div>
                                <div>Expected: <span className="text-emerald-700 font-semibold">{tc.expectedOutput}</span></div>
                                <div>Actual: <span className={tc.passed ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>{tc.actualOutput}</span></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom return button */}
      <div className="text-center pt-4">
        <button
          onClick={onBackToLobby}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Return to Examination Lobby
        </button>
      </div>

    </div>
  );
}
