/**
 * Deterministic PRNG and Shuffling Utilities for Examination Question Papers
 */

// Simple string hash to 32-bit integer
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Mulberry32 deterministic PRNG
function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles an array based on a string seed (e.g. Student Roll Number)
 * Uses Fisher-Yates shuffle with seeded PRNG.
 */
function shuffleArray(array, seedStr) {
  const result = [...array];
  const seedNum = hashString(seedStr || 'default-seed');
  const random = mulberry32(seedNum);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Prepares a student-specific question paper:
 * - Deterministically shuffles question order based on rollNumber
 * - Deterministically shuffles MCQ options for each question
 * - Strips answer keys and hidden test cases so student cannot inspect them
 * - Preserves questionId and original option mapping
 */
function prepareStudentPaper(exam, questions, rollNumber) {
  const seed = `${exam.id}_${rollNumber}`;
  const shuffledQuestions = shuffleArray(questions, seed);

  return shuffledQuestions.map((q, qIndex) => {
    const sanitized = {
      id: q.id,
      displayNumber: qIndex + 1,
      type: q.type, // 'mcq', 'multi_select', 'fill_blank', 'coding'
      questionText: q.questionText,
      marks: q.marks,
      scenarioContext: q.scenarioContext || undefined,
    };

    if (q.type === 'mcq' || q.type === 'multi_select') {
      // Shuffle options deterministically
      const optionSeed = `${seed}_q_${q.id}`;
      const originalOptions = (q.options || []).map((opt, idx) => ({
        originalIndex: idx,
        text: opt,
      }));
      const shuffledOptions = shuffleArray(originalOptions, optionSeed);

      sanitized.options = shuffledOptions.map((opt, newIdx) => ({
        optionKey: String.fromCharCode(65 + newIdx), // 'A', 'B', 'C', 'D'
        text: opt.text,
        originalIndex: opt.originalIndex,
      }));
    } else if (q.type === 'fill_blank') {
      sanitized.placeholder = 'Type your answer here...';
    } else if (q.type === 'coding') {
      sanitized.problemStatement = q.problemStatement;
      sanitized.constraints = q.constraints || '';
      sanitized.starterCode = q.starterCode || '';
      sanitized.allowedLanguages = q.allowedLanguages || ['python', 'javascript'];
      // Include ONLY public sample test cases for the student to run in-editor
      sanitized.sampleTestCases = (q.testCases || [])
        .filter(tc => !tc.isHidden)
        .map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }));
    }

    return sanitized;
  });
}

/**
 * Assigns paper set (Set A, Set B, Set C, Set D) based on roll number
 */
function assignPaperSet(rollNumber, availableSets = ['Set A', 'Set B', 'Set C', 'Set D']) {
  if (!availableSets || availableSets.length === 0) return 'Set A';
  const hash = hashString(rollNumber);
  const index = hash % availableSets.length;
  return availableSets[index];
}

module.exports = {
  hashString,
  shuffleArray,
  prepareStudentPaper,
  assignPaperSet,
};
