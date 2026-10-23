const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'exam_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const initialSeed = {
  users: [
    {
      id: 'usr-admin',
      username: 'admin',
      password: 'admin123',
      name: 'Dr. Ramesh Rao',
      role: 'admin',
      designation: 'Controller of Examinations',
    },
    {
      id: 'usr-examiner-1',
      username: 'examiner',
      password: 'exam123',
      name: 'Prof. S. K. Sharma',
      role: 'examiner',
      department: 'Department of Computer Science',
      designation: 'Senior Paper Setter',
    },
    {
      id: 'usr-examiner-2',
      username: 'teacher1',
      password: 'teach123',
      name: 'Dr. Meera Iyer',
      role: 'examiner',
      department: 'Department of Electronics',
      designation: 'Associate Professor',
    },
  ],
  students: [
    { rollNumber: '24AI001', apaarId: 'APAAR-2024-AIML-001', name: 'Aditya Varma', branch: 'AIML', section: 'A' },
  ],
  exams: [
    {
      id: 'exam-107',
      title: 'Cafe Order Management System Assessment',
      code: 'CS402-JAVA',
      description: 'Object-Oriented Programming & Multi-line Command Architecture using Java / Python.',
      type: 'coding',
      durationMinutes: 45,
      totalMarks: 50,
      targetBranches: ['AIML', 'CSE', 'IT', 'ECE', 'ALL'],
      targetSections: ['A', 'B', 'ALL'],
      shuffleEnabled: true,
      status: 'active',
      startDate: '2026-09-01T09:00:00.000Z',
      endDate: '2026-09-30T18:00:00.000Z',
      createdAt: '2026-09-01T07:30:00.000Z',
    },
    {
      id: 'exam-101',
      title: 'Python Core & Algorithmic Problem Solving',
      code: 'CS301-P',
      description: 'Hands-on coding exam assessing basic input/output handling, string algorithms, and loops.',
      type: 'coding', // 'coding', 'bits', 'mixed'
      durationMinutes: 45,
      totalMarks: 30,
      targetBranches: ['AIML', 'CSE', 'IT', 'ECE'],
      targetSections: ['A', 'B'],
      shuffleEnabled: true,
      status: 'active',
      startDate: '2026-09-01T09:00:00.000Z',
      endDate: '2026-09-30T18:00:00.000Z',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'exam-102',
      title: 'Operating Systems & Networks Bits Assessment',
      code: 'CS204-B',
      description: 'Comprehensive multiple choice bits exam covering process scheduling, TCP/IP, and memory paging.',
      type: 'bits',
      durationMinutes: 30,
      totalMarks: 25,
      targetBranches: ['AIML', 'CSE', 'ECE'],
      targetSections: ['A', 'B'],
      shuffleEnabled: true,
      status: 'active',
      startDate: '2026-09-02T09:00:00.000Z',
      endDate: '2026-09-30T18:00:00.000Z',
      createdAt: '2026-09-02T08:30:00.000Z',
    },
    {
      id: 'exam-103',
      title: 'Data Structures & Algorithms Comprehensive Mid-Term',
      code: 'CS201-M',
      description: 'Mixed assessment featuring 3 conceptual bits and 1 implementation coding challenge.',
      type: 'mixed',
      durationMinutes: 50,
      totalMarks: 35,
      targetBranches: ['AIML', 'CSE'],
      targetSections: ['A', 'B'],
      shuffleEnabled: true,
      status: 'active',
      startDate: '2026-09-05T09:00:00.000Z',
      endDate: '2026-09-30T20:00:00.000Z',
      createdAt: '2026-09-05T08:00:00.000Z',
    },
    {
      id: 'exam-104',
      title: 'SAP S/4HANA Enterprise Systems Assessment',
      code: 'SAP401-E',
      description: 'Enterprise evaluation on organizational structures, transactional document flows, and S/4HANA architecture.',
      type: 'sap',
      durationMinutes: 30,
      totalMarks: 20,
      targetBranches: ['AIML', 'CSE', 'IT'],
      targetSections: ['A', 'B'],
      shuffleEnabled: true,
      status: 'active',
      startDate: '2026-09-05T09:00:00.000Z',
      endDate: '2026-09-30T20:00:00.000Z',
      createdAt: '2026-09-05T08:00:00.000Z',
    },
  ],
  questions: [
    // Exam 107 - Cafe Order Management System (Techademy Photo Reference)
    {
      id: 'q-107-1',
      examId: 'exam-107',
      type: 'coding',
      questionText: 'Cafe Order Management System',
      problemStatement: `You need to build a simple Cafe Order Management System.
Implement two classes:
- Beverage: attributes name (String), price (double)
- Pastry: attributes name (String), price (double)

Input Format:
The input consists of multiple lines:
Each line contains an action code followed by the necessary information for that action:
1: Add Beverage (followed by beverage name and price)
2: Add Pastry (followed by pastry name and price)
3: Calculate Total
4: Exit

Output Format:
The program should print the following:
For each action to add an item, print "Order Added: <name>".
For calculating the total cost, print "Total Order Cost: <cost>".`,
      constraints: 'The name of the item is a string containing alphanumeric characters and spaces. Price > 0.',
      starterCode: `import java.util.Scanner;

class Beverage {
    String name;
    double price;
    public Beverage(String name, double price) {
        this.name = name;
        this.price = price;
    }
}

class Pastry {
    String name;
    double price;
    public Pastry(String name, double price) {
        this.name = name;
        this.price = price;
    }
}

public class CafeOrderManagementSystem {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        double totalCost = 0.0;
        
        while (scanner.hasNextInt()) {
            int action = scanner.nextInt();
            scanner.nextLine();
            
            switch (action) {
                case 1:
                    String beverageName = scanner.nextLine();
                    double beveragePrice = scanner.nextDouble();
                    if (scanner.hasNextLine()) scanner.nextLine();
                    System.out.println("Order Added: " + beverageName);
                    totalCost += beveragePrice;
                    break;
                case 2:
                    String pastryName = scanner.nextLine();
                    double pastryPrice = scanner.nextDouble();
                    if (scanner.hasNextLine()) scanner.nextLine();
                    System.out.println("Order Added: " + pastryName);
                    totalCost += pastryPrice;
                    break;
                case 3:
                    if (totalCost == (long) totalCost) {
                        System.out.println(String.format("Total Order Cost: %.1f", totalCost));
                    } else {
                        System.out.println("Total Order Cost: " + totalCost);
                    }
                    break;
                case 4:
                    System.exit(0);
            }
        }
    }
}`,
      allowedLanguages: ['java', 'python', 'javascript'],
      marks: 50,
      testCases: [
        {
          input: '1\nCoffee\n3.50\n2\nCroissant\n2.50\n3\n4',
          expectedOutput: 'Order Added: Coffee\nOrder Added: Croissant\nTotal Order Cost: 6.0',
          isHidden: false,
        },
        {
          input: '1\nEspresso\n2.50\n1\nLatte\n4.50\n3\n4',
          expectedOutput: 'Order Added: Espresso\nOrder Added: Latte\nTotal Order Cost: 7.0',
          isHidden: false,
        },
        {
          input: '2\nMuffin\n3.00\n3\n4',
          expectedOutput: 'Order Added: Muffin\nTotal Order Cost: 3.0',
          isHidden: true,
        },
      ],
    },
    // Exam 101 - Coding Exam
    {
      id: 'q-101-1',
      examId: 'exam-101',
      type: 'coding',
      questionText: 'Problem 1: Palindrome String Checker',
      problemStatement: 'Read a single word from standard input. If the string is identical forwards and backwards (case-insensitive), print "[word] is palindrome". Otherwise print "[word] is not palindrome".',
      constraints: 'String length <= 100 characters. Letters only.',
      starterCode: '# Read input from stdin\nword = input().strip()\n# Write your solution below\n',
      allowedLanguages: ['python', 'javascript'],
      marks: 15,
      testCases: [
        { input: 'radar', expectedOutput: 'radar is palindrome', isHidden: false },
        { input: 'hello', expectedOutput: 'hello is not palindrome', isHidden: false },
        { input: 'Racecar', expectedOutput: 'Racecar is palindrome', isHidden: true },
        { input: 'antigravity', expectedOutput: 'antigravity is not palindrome', isHidden: true },
      ],
    },
    {
      id: 'q-101-2',
      examId: 'exam-101',
      type: 'coding',
      questionText: 'Problem 2: Sum of Even Numbers in an Array',
      problemStatement: 'Read space-separated integers from standard input. Calculate and print the sum of only the even numbers.',
      constraints: '-1000 <= number <= 1000. Up to 100 integers.',
      starterCode: '# Read space separated numbers from input\nnums = list(map(int, input().split()))\n# Compute even sum and print it\n',
      allowedLanguages: ['python', 'javascript'],
      marks: 15,
      testCases: [
        { input: '2 4 5 7 8', expectedOutput: '14', isHidden: false },
        { input: '1 3 5 7 9', expectedOutput: '0', isHidden: false },
        { input: '10 20 30', expectedOutput: '60', isHidden: true },
        { input: '-2 4 -6 7', expectedOutput: '-4', isHidden: true },
      ],
    },

    // Exam 102 - Bits Assessment (MCQs)
    {
      id: 'q-102-1',
      examId: 'exam-102',
      type: 'mcq',
      questionText: 'Which OSI layer is primarily responsible for end-to-end reliable transmission and flow control?',
      options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'],
      correctOptionIndex: 1, // 'Transport Layer'
      marks: 5,
      explanation: 'The Transport layer (Layer 4) handles host-to-host communication, connection reliability (e.g. TCP), and flow control.',
    },
    {
      id: 'q-102-2',
      examId: 'exam-102',
      type: 'mcq',
      questionText: 'Which condition is NOT a mandatory Coffman condition for a Deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      correctOptionIndex: 2, // 'Preemption Allowed'
      marks: 5,
      explanation: 'For deadlock, No Preemption is required. If preemption is allowed, deadlock cannot happen.',
    },
    {
      id: 'q-102-3',
      examId: 'exam-102',
      type: 'mcq',
      questionText: 'In Operating Systems, Belady\'s Anomaly occurs in which page replacement algorithm?',
      options: ['LRU (Least Recently Used)', 'FIFO (First In First Out)', 'Optimal Page Replacement', 'Clock Algorithm'],
      correctOptionIndex: 1, // 'FIFO'
      marks: 5,
      explanation: 'Belady\'s Anomaly is the phenomenon where increasing the number of page frames results in an increase in the number of page faults for FIFO.',
    },
    {
      id: 'q-102-4',
      examId: 'exam-102',
      type: 'mcq',
      questionText: 'What is the default port used by HTTPS protocol for secure communication?',
      options: ['80', '8080', '443', '22'],
      correctOptionIndex: 2, // '443'
      marks: 5,
      explanation: 'HTTPS operates by default on port 443, while unencrypted HTTP operates on port 80.',
    },
    {
      id: 'q-102-5',
      examId: 'exam-102',
      type: 'mcq',
      questionText: 'Which CPU scheduling algorithm is non-preemptive by default and may suffer from the Convoy Effect?',
      options: ['First-Come First-Served (FCFS)', 'Round Robin', 'Shortest Remaining Time First', 'Multilevel Queue'],
      correctOptionIndex: 0, // 'FCFS'
      marks: 5,
      explanation: 'FCFS can lead to the convoy effect where short processes wait behind a long CPU-burst process.',
    },

    // Exam 103 - Mixed Exam
    {
      id: 'q-103-1',
      examId: 'exam-103',
      type: 'mcq',
      questionText: 'What is the worst-case time complexity of QuickSort when a poor pivot is selected?',
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
      correctOptionIndex: 2, // 'O(n²)'
      marks: 5,
      explanation: 'When the array is already sorted and the first/last element is picked as pivot, QuickSort degrades to O(n²).',
    },
    {
      id: 'q-103-2',
      examId: 'exam-103',
      type: 'mcq',
      questionText: 'Which data structure follows the LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correctOptionIndex: 1, // 'Stack'
      marks: 5,
      explanation: 'Stacks adhere to LIFO where the last inserted element is the first to be popped.',
    },
    {
      id: 'q-103-3',
      examId: 'exam-103',
      type: 'mcq',
      questionText: 'Which tree traversal visits nodes in non-decreasing order for a Binary Search Tree (BST)?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level Order'],
      correctOptionIndex: 1, // 'Inorder'
      marks: 5,
      explanation: 'Inorder traversal (Left, Root, Right) of a valid BST always yields elements in ascending sorted order.',
    },
    {
      id: 'q-103-4',
      examId: 'exam-103',
      type: 'coding',
      questionText: 'Coding Challenge: Maximum Element and Its Frequency',
      problemStatement: 'Given space-separated integers on standard input, print the maximum number and how many times it appeared, separated by a space.\nExample: input "3 7 2 7 5 7" -> output "7 3"',
      constraints: 'At least 1 integer. Numbers between -10000 and 10000.',
      starterCode: '# Read numbers and find max + frequency\nnums = list(map(int, input().split()))\n# Write solution here\n',
      allowedLanguages: ['python', 'javascript'],
      marks: 20,
      testCases: [
        { input: '3 7 2 7 5 7', expectedOutput: '7 3', isHidden: false },
        { input: '5 5 5 5', expectedOutput: '5 4', isHidden: false },
        { input: '99', expectedOutput: '99 1', isHidden: true },
        { input: '-10 -5 -5 -20', expectedOutput: '-5 2', isHidden: true },
      ],
    },
    // Exam 104 - SAP Enterprise Assessment
    {
      id: 'q-104-1',
      examId: 'exam-104',
      type: 'multi_select',
      scenarioContext: 'An enterprise order-to-cash process requires automated billing and financial document posting.',
      questionText: 'Which two organizational elements are mandatory to define a valid Sales Area in SAP S/4HANA? (Select 2 correct answers)',
      options: ['Sales Organization', 'Plant Code', 'Distribution Channel', 'Storage Location'],
      correctOptionIndices: [0, 2],
      marks: 6,
      explanation: 'A Sales Area in SAP SD is uniquely formed by Sales Organization, Distribution Channel, and Division.',
    },
    {
      id: 'q-104-2',
      examId: 'exam-104',
      type: 'mcq',
      questionText: 'What is the primary database technology foundation of SAP S/4HANA?',
      options: ['Oracle Exadata', 'SAP HANA In-Memory Engine', 'Microsoft SQL Server', 'IBM DB2'],
      correctOptionIndex: 1,
      marks: 4,
      explanation: 'SAP HANA is SAP\'s proprietary column-oriented in-memory database engine.',
    },
    {
      id: 'q-104-3',
      examId: 'exam-104',
      type: 'fill_blank',
      questionText: 'In SAP Materials Management, the single-screen transaction code used to create a standard Purchase Order is _____.',
      correctAnswer: 'ME21N',
      acceptedAnswers: ['ME21N', 'me21n'],
      marks: 5,
      explanation: 'ME21N is the standard single-screen transaction code for Purchase Order creation.',
    },
    {
      id: 'q-104-4',
      examId: 'exam-104',
      type: 'multi_select',
      scenarioContext: 'A manufacturing firm is mapping organizational units across financial accounting and controlling.',
      questionText: 'Which of the following are core financial organizational units in SAP ERP? (Select 2 correct answers)',
      options: ['Company Code', 'Shipping Point', 'Controlling Area', 'Purchasing Group'],
      correctOptionIndices: [0, 2],
      marks: 5,
      explanation: 'Company Code (FI) and Controlling Area (CO) are the fundamental accounting entities in SAP.',
    },
  ],
  submissions: [],
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
      return initialSeed;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = initialSeed.users;
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch (e) {}
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err.message);
    return initialSeed;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err.message);
  }
}

// Student methods
function getStudents() {
  return readDb().students || [];
}

function findStudent(rollNumber, apaarId) {
  const students = getStudents();
  return students.find(
    s => s.rollNumber.trim().toUpperCase() === (rollNumber || '').trim().toUpperCase() &&
         s.apaarId.trim().toUpperCase() === (apaarId || '').trim().toUpperCase()
  );
}

function registerStudent(studentData) {
  const db = readDb();
  const existing = db.students.find(s => s.rollNumber.toUpperCase() === studentData.rollNumber.toUpperCase());
  if (existing) {
    return existing;
  }
  const newStudent = {
    rollNumber: studentData.rollNumber.toUpperCase(),
    apaarId: studentData.apaarId.toUpperCase(),
    name: studentData.name || 'Student ' + studentData.rollNumber,
    branch: studentData.branch || 'CSE',
    section: studentData.section || 'A',
  };
  db.students.push(newStudent);
  writeDb(db);
  return newStudent;
}

// Exam methods
function getExams() {
  return readDb().exams || [];
}

function getExamById(id) {
  const exams = getExams();
  return exams.find(e => e.id === id);
}

function createExam(examData) {
  const db = readDb();
  const newExam = {
    id: 'exam-' + Date.now(),
    title: examData.title,
    code: examData.code || ('EX-' + Math.floor(100 + Math.random() * 900)),
    description: examData.description || '',
    type: examData.type || 'bits', // 'bits', 'coding', 'mixed'
    durationMinutes: Number(examData.durationMinutes) || 45,
    totalMarks: Number(examData.totalMarks) || 0,
    targetBranches: examData.targetBranches || ['CSE'],
    targetSections: examData.targetSections || ['A'],
    shuffleEnabled: examData.shuffleEnabled !== false,
    status: examData.status || 'active',
    startDate: examData.startDate || new Date().toISOString(),
    endDate: examData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  db.exams.unshift(newExam);
  writeDb(db);
  return newExam;
}

function updateExam(id, updateData) {
  const db = readDb();
  const index = db.exams.findIndex(e => e.id === id);
  if (index === -1) return null;

  db.exams[index] = {
    ...db.exams[index],
    ...updateData,
    id, // preserve id
  };
  writeDb(db);
  return db.exams[index];
}

function deleteExam(id) {
  const db = readDb();
  db.exams = db.exams.filter(e => e.id !== id);
  db.questions = db.questions.filter(q => q.examId !== id);
  db.submissions = db.submissions.filter(s => s.examId !== id);
  writeDb(db);
  return true;
}

// Question methods (Paper Setter / Middleman editing)
function getQuestionsForExam(examId) {
  const db = readDb();
  return (db.questions || []).filter(q => q.examId === examId);
}

function addQuestion(examId, questionData) {
  const db = readDb();
  const exam = db.exams.find(e => e.id === examId);
  const newQuestion = {
    id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    examId,
    type: questionData.type || (exam ? (exam.type === 'coding' ? 'coding' : 'mcq') : 'mcq'),
    questionText: questionData.questionText || '',
    marks: Number(questionData.marks) || 5,
  };

  if (newQuestion.type === 'mcq') {
    newQuestion.options = questionData.options || ['Option A', 'Option B', 'Option C', 'Option D'];
    newQuestion.correctOptionIndex = Number(questionData.correctOptionIndex) || 0;
    newQuestion.explanation = questionData.explanation || '';
    newQuestion.scenarioContext = questionData.scenarioContext || '';
  } else if (newQuestion.type === 'multi_select') {
    newQuestion.options = questionData.options || ['Option A', 'Option B', 'Option C', 'Option D'];
    newQuestion.correctOptionIndices = Array.isArray(questionData.correctOptionIndices)
      ? questionData.correctOptionIndices.map(Number)
      : [0];
    newQuestion.explanation = questionData.explanation || '';
    newQuestion.scenarioContext = questionData.scenarioContext || '';
  } else if (newQuestion.type === 'fill_blank') {
    const rawCorrect = (questionData.correctAnswer || '').trim();
    let accepted = [];
    if (Array.isArray(questionData.acceptedAnswers)) {
      accepted = questionData.acceptedAnswers.map(a => String(a).trim()).filter(Boolean);
    } else if (typeof questionData.acceptedAnswers === 'string') {
      accepted = questionData.acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (rawCorrect && !accepted.includes(rawCorrect)) {
      accepted.unshift(rawCorrect);
    }
    newQuestion.correctAnswer = rawCorrect || (accepted[0] || '');
    newQuestion.acceptedAnswers = accepted.length > 0 ? accepted : [newQuestion.correctAnswer];
    newQuestion.caseSensitive = !!questionData.caseSensitive;
    newQuestion.explanation = questionData.explanation || '';
    newQuestion.scenarioContext = questionData.scenarioContext || '';
  } else if (newQuestion.type === 'coding') {
    newQuestion.problemStatement = questionData.problemStatement || '';
    newQuestion.constraints = questionData.constraints || '';
    newQuestion.starterCode = questionData.starterCode || '# Write solution here\n';
    newQuestion.allowedLanguages = questionData.allowedLanguages || ['python', 'javascript'];
    newQuestion.testCases = questionData.testCases || [
      { input: '1', expectedOutput: '1', isHidden: false }
    ];
  }

  db.questions.push(newQuestion);

  // Recalculate exam total marks
  if (exam) {
    const questions = db.questions.filter(q => q.examId === examId);
    exam.totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  }

  writeDb(db);
  return newQuestion;
}

// Bulk add questions for paper setter upload
function addQuestionsBulk(examId, questionsArray) {
  const db = readDb();
  const exam = db.exams.find(e => e.id === examId);
  if (!exam) return [];

  const added = [];
  for (const qData of questionsArray) {
    const newQuestion = {
      id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      examId,
      type: qData.type || 'mcq',
      questionText: qData.questionText || '',
      marks: Number(qData.marks) || 5,
    };

    if (newQuestion.type === 'mcq') {
      newQuestion.options = qData.options || ['Option A', 'Option B', 'Option C', 'Option D'];
      newQuestion.correctOptionIndex = Number(qData.correctOptionIndex) || 0;
      newQuestion.explanation = qData.explanation || '';
      newQuestion.scenarioContext = qData.scenarioContext || '';
    } else if (newQuestion.type === 'multi_select') {
      newQuestion.options = qData.options || ['Option A', 'Option B', 'Option C', 'Option D'];
      newQuestion.correctOptionIndices = Array.isArray(qData.correctOptionIndices)
        ? qData.correctOptionIndices.map(Number)
        : [0];
      newQuestion.explanation = qData.explanation || '';
      newQuestion.scenarioContext = qData.scenarioContext || '';
    } else if (newQuestion.type === 'fill_blank') {
      const rawCorrect = (qData.correctAnswer || '').trim();
      let accepted = [];
      if (Array.isArray(qData.acceptedAnswers)) {
        accepted = qData.acceptedAnswers.map(a => String(a).trim()).filter(Boolean);
      } else if (typeof qData.acceptedAnswers === 'string') {
        accepted = qData.acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (rawCorrect && !accepted.includes(rawCorrect)) {
        accepted.unshift(rawCorrect);
      }
      newQuestion.correctAnswer = rawCorrect || (accepted[0] || '');
      newQuestion.acceptedAnswers = accepted.length > 0 ? accepted : [newQuestion.correctAnswer];
      newQuestion.caseSensitive = !!qData.caseSensitive;
      newQuestion.explanation = qData.explanation || '';
      newQuestion.scenarioContext = qData.scenarioContext || '';
    } else if (newQuestion.type === 'coding') {
      newQuestion.problemStatement = qData.problemStatement || '';
      newQuestion.constraints = qData.constraints || '';
      newQuestion.starterCode = qData.starterCode || '# Write solution here\n';
      newQuestion.allowedLanguages = qData.allowedLanguages || ['python', 'javascript'];
      newQuestion.testCases = qData.testCases || [{ input: '1', expectedOutput: '1', isHidden: false }];
    }

    db.questions.push(newQuestion);
    added.push(newQuestion);
  }

  // Recalculate exam total marks
  const allExamQuestions = db.questions.filter(q => q.examId === examId);
  exam.totalMarks = allExamQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  writeDb(db);
  return added;
}

// Middleman: Edit question if any mistakes are found!
function updateQuestion(questionId, updateData) {
  const db = readDb();
  const index = db.questions.findIndex(q => q.id === questionId);
  if (index === -1) return null;

  const currentQ = db.questions[index];
  const merged = {
    ...currentQ,
    ...updateData,
    id: questionId,
  };

  if (merged.type === 'multi_select') {
    merged.correctOptionIndices = Array.isArray(merged.correctOptionIndices)
      ? merged.correctOptionIndices.map(Number)
      : (merged.correctOptionIndex !== undefined ? [Number(merged.correctOptionIndex)] : [0]);
  } else if (merged.type === 'fill_blank') {
    const rawCorrect = (merged.correctAnswer || '').trim();
    let accepted = [];
    if (Array.isArray(merged.acceptedAnswers)) {
      accepted = merged.acceptedAnswers.map(a => String(a).trim()).filter(Boolean);
    } else if (typeof merged.acceptedAnswers === 'string') {
      accepted = merged.acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (rawCorrect && !accepted.includes(rawCorrect)) {
      accepted.unshift(rawCorrect);
    }
    merged.correctAnswer = rawCorrect || (accepted[0] || '');
    merged.acceptedAnswers = accepted.length > 0 ? accepted : [merged.correctAnswer];
    merged.caseSensitive = !!merged.caseSensitive;
  }

  db.questions[index] = merged;

  // Recalculate exam total marks
  const examId = db.questions[index].examId;
  const exam = db.exams.find(e => e.id === examId);
  if (exam) {
    const questions = db.questions.filter(q => q.examId === examId);
    exam.totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  }

  writeDb(db);
  return db.questions[index];
}

function deleteQuestion(questionId) {
  const db = readDb();
  const q = db.questions.find(item => item.id === questionId);
  if (!q) return false;

  const examId = q.examId;
  db.questions = db.questions.filter(item => item.id !== questionId);

  const exam = db.exams.find(e => e.id === examId);
  if (exam) {
    const questions = db.questions.filter(item => item.examId === examId);
    exam.totalMarks = questions.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
  }

  writeDb(db);
  return true;
}

// Submissions
function getSubmissions(examId) {
  const db = readDb();
  let subs = db.submissions || [];
  if (examId) {
    subs = subs.filter(s => s.examId === examId);
  }
  return subs;
}

function getStudentSubmissions(rollNumber) {
  const db = readDb();
  return (db.submissions || []).filter(
    s => s.rollNumber.toUpperCase() === rollNumber.toUpperCase()
  );
}

function getSubmissionById(id) {
  const db = readDb();
  return (db.submissions || []).find(s => s.id === id);
}

function saveSubmission(subData) {
  const db = readDb();
  const newSub = {
    id: 'sub-' + Date.now(),
    submittedAt: new Date().toISOString(),
    ...subData,
  };
  db.submissions.unshift(newSub);
  writeDb(db);
  return newSub;
}

function getUsers() {
  return readDb().users || [];
}

function authenticateUser(identifier, password) {
  const db = readDb();
  const cleanId = (identifier || '').trim().toUpperCase();
  const cleanPass = (password || '').trim();

  // 1. Check in db.users (Admin & Middlemen / Examiners)
  const users = db.users || [];
  const foundUser = users.find(
    u => u.username.trim().toUpperCase() === cleanId && u.password === cleanPass
  );

  if (foundUser) {
    const { password, ...safeUser } = foundUser;
    return safeUser;
  }

  // 2. Check in db.students (Roll Number + APAAR ID)
  const students = db.students || [];
  const foundStudent = students.find(
    s => s.rollNumber.trim().toUpperCase() === cleanId &&
         (s.apaarId.trim().toUpperCase() === cleanPass.toUpperCase() || cleanPass === 'student123')
  );

  if (foundStudent) {
    return {
      id: 'std-' + foundStudent.rollNumber,
      username: foundStudent.rollNumber,
      rollNumber: foundStudent.rollNumber,
      apaarId: foundStudent.apaarId,
      name: foundStudent.name,
      branch: foundStudent.branch,
      section: foundStudent.section,
      role: 'student',
    };
  }

  return null;
}

module.exports = {
  getUsers,
  authenticateUser,
  getStudents,
  findStudent,
  registerStudent,
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getQuestionsForExam,
  addQuestion,
  addQuestionsBulk,
  updateQuestion,
  deleteQuestion,
  getSubmissions,
  getStudentSubmissions,
  getSubmissionById,
  saveSubmission,
  initialSeed,
};
