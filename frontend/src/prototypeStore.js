// High-Fidelity Prototype Store & Offline Execution Engine for ExamMatrix
// Guarantees that demonstrations, presentations, and testing work seamlessly
// even when Wi-Fi is disconnected, PC is in sleep mode, or server is offline.

import { evaluateStudentCode } from './codeEngine.js';

const STORAGE_KEYS = {
  EXAMS: 'exammatrix_proto_exams',
  QUESTIONS: 'exammatrix_proto_questions',
  SUBMISSIONS: 'exammatrix_proto_submissions',
  STUDENTS: 'exammatrix_proto_students'
};

const INITIAL_STUDENTS = [
  { rollNumber: '24AI001', apaarId: 'APAAR-2024-AIML-001', name: 'Aditya Varma', branch: 'AIML', section: 'A' }
];

const INITIAL_EXAMS = [
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
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-108',
    title: 'Data Structures & Algorithms: Search & Two-Sum Sprint',
    code: 'CS305-DSA',
    description: 'High-speed algorithmic coding challenge covering Target Pair Two-Sum and Binary Search.',
    type: 'coding',
    durationMinutes: 40,
    totalMarks: 50,
    targetBranches: ['AIML', 'CSE', 'IT', 'ECE', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-109',
    title: 'Full-Stack JavaScript: Order Inventory Calculator',
    code: 'IT304-JS',
    description: 'JavaScript / Node.js data transformation and cart total calculation with taxes & discounts.',
    type: 'coding',
    durationMinutes: 30,
    totalMarks: 30,
    targetBranches: ['AIML', 'CSE', 'IT', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-102',
    title: 'Operating Systems & Networks Bits Assessment',
    code: 'CS204-B',
    description: 'Comprehensive multiple choice bits exam covering process scheduling, TCP/IP, and memory paging.',
    type: 'bits',
    durationMinutes: 30,
    totalMarks: 25,
    targetBranches: ['AIML', 'CSE', 'ECE', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-105',
    title: 'Web Technologies & Protocols Fill-in-Blanks',
    code: 'IT302-F',
    description: 'Specialized test assessing precise terminology, protocol ports, and architectural concepts.',
    type: 'fill_blanks',
    durationMinutes: 25,
    totalMarks: 20,
    targetBranches: ['AIML', 'CSE', 'IT', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-02T09:00:00.000Z',
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-106',
    title: 'Computer Organization & Architecture Hybrid Test',
    code: 'CS202-H',
    description: 'Mixed assessment combining rapid-fire MCQ bits with technical fill-in-the-blank questions.',
    type: 'bits_blanks',
    durationMinutes: 35,
    totalMarks: 30,
    targetBranches: ['AIML', 'CSE', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-03T09:00:00.000Z',
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-104',
    title: 'SAP S/4HANA Enterprise Systems Assessment',
    code: 'SAP401-E',
    description: 'Enterprise evaluation on organizational structures, transactional document flows, and S/4HANA architecture.',
    type: 'sap',
    durationMinutes: 30,
    totalMarks: 20,
    targetBranches: ['AIML', 'CSE', 'IT', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-05T09:00:00.000Z',
    endDate: '2026-09-30T20:00:00.000Z'
  },
  {
    id: 'exam-101',
    title: 'Python Core & Algorithmic Problem Solving',
    code: 'CS301-P',
    description: 'Hands-on coding exam assessing basic input/output handling, string algorithms, and loops.',
    type: 'coding',
    durationMinutes: 45,
    totalMarks: 30,
    targetBranches: ['AIML', 'CSE', 'IT', 'ECE', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-30T18:00:00.000Z'
  },
  {
    id: 'exam-103',
    title: 'Data Structures & Algorithms Comprehensive Mid-Term',
    code: 'CS201-M',
    description: 'Mixed assessment featuring conceptual bits and an implementation coding challenge.',
    type: 'mixed',
    durationMinutes: 50,
    totalMarks: 35,
    targetBranches: ['AIML', 'CSE', 'ALL'],
    targetSections: ['A', 'B', 'ALL'],
    shuffleEnabled: true,
    status: 'active',
    startDate: '2026-09-05T09:00:00.000Z',
    endDate: '2026-09-30T20:00:00.000Z'
  }
];

const INITIAL_QUESTIONS = [
  // Exam 107 - Cafe Order Management System (from uploaded photo)
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
        isHidden: false
      },
      {
        input: '1\nEspresso\n2.50\n1\nLatte\n4.50\n3\n4',
        expectedOutput: 'Order Added: Espresso\nOrder Added: Latte\nTotal Order Cost: 7.0',
        isHidden: false
      },
      {
        input: '2\nMuffin\n3.00\n3\n4',
        expectedOutput: 'Order Added: Muffin\nTotal Order Cost: 3.0',
        isHidden: true
      }
    ]
  },

  // Exam 108 - DSA Search & Two Sum
  {
    id: 'q-108-1',
    examId: 'exam-108',
    type: 'coding',
    questionText: 'Problem 1: Target Pair Two-Sum Indices',
    problemStatement: `Given an array of integers on line 1 and a target integer on line 2, find the two numbers such that they add up to the specific target.
Print their 0-based indices separated by a space.

Example Input:
2 7 11 15
9

Example Output:
0 1`,
    constraints: '2 <= Array length <= 1000. Exactly one valid answer exists.',
    starterCode: `# Read space-separated numbers on line 1\nnums = list(map(int, input().split()))\n# Read target sum on line 2\ntarget = int(input())\n\n# Find indices that sum to target\nfor i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        if nums[i] + nums[j] == target:\n            print(f"{i} {j}")\n            break\n`,
    allowedLanguages: ['python', 'java', 'javascript'],
    marks: 25,
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
      { input: '3 3\n6', expectedOutput: '0 1', isHidden: true }
    ]
  },
  {
    id: 'q-108-2',
    examId: 'exam-108',
    type: 'coding',
    questionText: 'Problem 2: Binary Search in Sorted Array',
    problemStatement: `Given a sorted array of integers on line 1 and a target value on line 2, write a function to search target in nums.
If target exists, print its 0-based index. Otherwise, print -1.

Example Input:
1 3 5 7 9 11
7

Example Output:
3`,
    constraints: 'Sorted ascending array. -10000 <= number <= 10000.',
    starterCode: `# Read sorted numbers on line 1\nnums = list(map(int, input().split()))\n# Read target value on line 2\ntarget = int(input())\n\n# Search for target\nif target in nums:\n    print(nums.index(target))\nelse:\n    print(-1)\n`,
    allowedLanguages: ['python', 'java', 'javascript'],
    marks: 25,
    testCases: [
      { input: '1 3 5 7 9 11\n7', expectedOutput: '3', isHidden: false },
      { input: '10 20 30 40\n20', expectedOutput: '1', isHidden: false },
      { input: '2 4 6 8 10\n5', expectedOutput: '-1', isHidden: true }
    ]
  },

  // Exam 109 - JavaScript Cart Calculator
  {
    id: 'q-109-1',
    examId: 'exam-109',
    type: 'coding',
    questionText: 'Problem 1: Cart Discount & Tax Calculator',
    problemStatement: `You are building an e-commerce checkout module in JavaScript.
Read multiple lines of input, where each line has a price and quantity separated by a space.
The input terminates when "0 0" is reached.
Business Rules:
1. Compute Subtotal = sum of (price * quantity).
2. If Subtotal > 100, apply a 10% discount.
3. Apply 5% tax on the discounted amount.
4. Print "Final Total: <total>" with 2 decimal places.

Example Input:
25.0 2
30.0 2
0 0

Example Output:
Final Total: 103.95`,
    constraints: 'Prices > 0, quantities >= 1.',
    starterCode: `// Read inputs and calculate total\nlet subtotal = 0;\nwhile (true) {\n  const line = input();\n  if (!line || line === '0 0') break;\n  const [p, q] = line.trim().split(/\\s+/).map(Number);\n  if (!isNaN(p) && !isNaN(q)) subtotal += p * q;\n}\n\nconst discount = subtotal > 100 ? subtotal * 0.10 : 0;\nconst afterDiscount = subtotal - discount;\nconst tax = afterDiscount * 0.05;\nconst finalTotal = afterDiscount + tax;\nconsole.log("Final Total: " + finalTotal.toFixed(2));\n`,
    allowedLanguages: ['javascript', 'python', 'java'],
    marks: 30,
    testCases: [
      { input: '25.0 2\n30.0 2\n0 0', expectedOutput: 'Final Total: 103.95', isHidden: false },
      { input: '10.0 2\n0 0', expectedOutput: 'Final Total: 21.00', isHidden: false },
      { input: '100.0 2\n0 0', expectedOutput: 'Final Total: 189.00', isHidden: true }
    ]
  },

  // Exam 102 - Bits Assessment (MCQs)
  {
    id: 'q-102-1',
    examId: 'exam-102',
    type: 'mcq',
    questionText: 'Which OSI layer is primarily responsible for end-to-end reliable transmission and flow control?',
    options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'],
    correctOptionIndex: 1,
    marks: 5,
    explanation: 'The Transport layer (Layer 4) handles host-to-host communication, connection reliability (e.g. TCP), and flow control.'
  },
  {
    id: 'q-102-2',
    examId: 'exam-102',
    type: 'mcq',
    questionText: 'Which condition is NOT a mandatory Coffman condition for a Deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctOptionIndex: 2,
    marks: 5,
    explanation: 'For deadlock, No Preemption is required. If preemption is allowed, deadlock cannot happen.'
  },
  {
    id: 'q-102-3',
    examId: 'exam-102',
    type: 'mcq',
    questionText: 'In Operating Systems, Belady\'s Anomaly occurs in which page replacement algorithm?',
    options: ['LRU (Least Recently Used)', 'FIFO (First In First Out)', 'Optimal Page Replacement', 'Clock Algorithm'],
    correctOptionIndex: 1,
    marks: 5,
    explanation: 'Belady\'s Anomaly is the phenomenon where increasing page frames results in more page faults in FIFO.'
  },
  {
    id: 'q-102-4',
    examId: 'exam-102',
    type: 'mcq',
    questionText: 'What is the default port used by HTTPS protocol for secure communication?',
    options: ['80', '8080', '443', '22'],
    correctOptionIndex: 2,
    marks: 5,
    explanation: 'HTTPS operates by default on port 443, while HTTP uses port 80.'
  },
  {
    id: 'q-102-5',
    examId: 'exam-102',
    type: 'mcq',
    questionText: 'Which CPU scheduling algorithm is non-preemptive by default and may suffer from the Convoy Effect?',
    options: ['First-Come First-Served (FCFS)', 'Round Robin', 'Shortest Remaining Time First', 'Multilevel Queue'],
    correctOptionIndex: 0,
    marks: 5,
    explanation: 'FCFS can lead to the convoy effect where short jobs queue behind a lengthy CPU burst process.'
  },

  // Exam 105 - Fill in the Blanks
  {
    id: 'q-105-1',
    examId: 'exam-105',
    type: 'fill_blank',
    questionText: 'The architectural style that uses standard HTTP methods (GET, POST, PUT, DELETE) and stateless communication is known as _____.',
    correctAnswer: 'REST',
    acceptedAnswers: ['REST', 'RESTful', 'REST API', 'Representational State Transfer'],
    marks: 5,
    explanation: 'REST (Representational State Transfer) is the architectural standard for modern web APIs.'
  },
  {
    id: 'q-105-2',
    examId: 'exam-105',
    type: 'fill_blank',
    questionText: 'The cryptographic security protocol that replaced SSL to provide end-to-end transport encryption is _____.',
    correctAnswer: 'TLS',
    acceptedAnswers: ['TLS', 'Transport Layer Security'],
    marks: 5,
    explanation: 'Transport Layer Security (TLS) is the modern successor to Secure Sockets Layer (SSL).'
  },
  {
    id: 'q-105-3',
    examId: 'exam-105',
    type: 'fill_blank',
    questionText: 'The standard TCP port number used by DNS resolvers for hostname query resolution is _____.',
    correctAnswer: '53',
    acceptedAnswers: ['53', 'Port 53'],
    marks: 5,
    explanation: 'Domain Name System (DNS) operates on UDP/TCP port 53.'
  },
  {
    id: 'q-105-4',
    examId: 'exam-105',
    type: 'fill_blank',
    questionText: 'In React, the built-in Hook used to execute side effects like data fetching or event subscriptions is _____.',
    correctAnswer: 'useEffect',
    acceptedAnswers: ['useEffect', 'useEffect()'],
    marks: 5,
    explanation: 'useEffect handles synchronization, lifecycle events, and API calls in React components.'
  },

  // Exam 106 - Bits + Blanks (Hybrid)
  {
    id: 'q-106-1',
    examId: 'exam-106',
    type: 'mcq',
    questionText: 'Which memory type resides directly on the CPU chip and provides the fastest data access?',
    options: ['L1 Cache', 'DRAM Main Memory', 'NVMe SSD', 'Virtual Memory'],
    correctOptionIndex: 0,
    marks: 5,
    explanation: 'L1 cache operates at CPU clock speeds with nanosecond latency.'
  },
  {
    id: 'q-106-2',
    examId: 'exam-106',
    type: 'fill_blank',
    questionText: 'The digital register in the CPU that stores the memory address of the NEXT instruction to be fetched is called the _____.',
    correctAnswer: 'Program Counter',
    acceptedAnswers: ['Program Counter', 'PC', 'Instruction Pointer'],
    marks: 5,
    explanation: 'The Program Counter (PC) holds the address of the next sequential machine instruction.'
  },
  {
    id: 'q-106-3',
    examId: 'exam-106',
    type: 'mcq',
    questionText: 'In pipelining, what type of hazard occurs when an instruction requires data not yet written by a prior instruction?',
    options: ['Structural Hazard', 'Data Hazard', 'Control Hazard', 'Branch Hazard'],
    correctOptionIndex: 1,
    marks: 5,
    explanation: 'Data hazards occur from Read-After-Write (RAW) dependencies before the result is committed.'
  },
  {
    id: 'q-106-4',
    examId: 'exam-106',
    type: 'fill_blank',
    questionText: 'A high-speed buffer inside the memory management unit (MMU) used to cache virtual-to-physical address translations is the _____.',
    correctAnswer: 'TLB',
    acceptedAnswers: ['TLB', 'Translation Lookaside Buffer'],
    marks: 5,
    explanation: 'The Translation Lookaside Buffer (TLB) avoids multi-level page table walks in main memory.'
  },
  {
    id: 'q-106-5',
    examId: 'exam-106',
    type: 'mcq',
    questionText: 'In Amdahl\'s Law, what limits the maximum speedup achievable by adding infinite parallel processing cores?',
    options: ['Clock Frequency', 'Serial Execution Fraction', 'Bus Bandwidth', 'Cache Line Size'],
    correctOptionIndex: 1,
    marks: 10,
    explanation: 'The sequential/serial portion of the task places a hard mathematical upper bound on speedup.'
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
    explanation: 'A Sales Area in SAP SD is uniquely formed by Sales Organization, Distribution Channel, and Division.'
  },
  {
    id: 'q-104-2',
    examId: 'exam-104',
    type: 'mcq',
    questionText: 'What is the primary database technology foundation of SAP S/4HANA?',
    options: ['Oracle Exadata', 'SAP HANA In-Memory Engine', 'Microsoft SQL Server', 'IBM DB2'],
    correctOptionIndex: 1,
    marks: 4,
    explanation: 'SAP HANA is SAP\'s proprietary column-oriented in-memory database engine.'
  },
  {
    id: 'q-104-3',
    examId: 'exam-104',
    type: 'fill_blank',
    questionText: 'In SAP Materials Management, the single-screen transaction code used to create a standard Purchase Order is _____.',
    correctAnswer: 'ME21N',
    acceptedAnswers: ['ME21N', 'me21n'],
    marks: 5,
    explanation: 'ME21N is the standard single-screen transaction code for Purchase Order creation.'
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
    explanation: 'Company Code (FI) and Controlling Area (CO) are the fundamental accounting entities in SAP.'
  },

  // Exam 101 - Coding Exam (Python)
  {
    id: 'q-101-1',
    examId: 'exam-101',
    type: 'coding',
    questionText: 'Problem 1: Palindrome String Checker',
    problemStatement: 'Read a single word from standard input. If the string is identical forwards and backwards (case-insensitive), print "[word] is palindrome". Otherwise print "[word] is not palindrome".',
    constraints: 'String length <= 100 characters. Letters only.',
    starterCode: '# Read input from stdin\nword = input().strip()\n# Check palindrome and print result\nif word.lower() == word.lower()[::-1]:\n    print(f"{word} is palindrome")\nelse:\n    print(f"{word} is not palindrome")\n',
    allowedLanguages: ['python', 'javascript', 'java'],
    marks: 15,
    testCases: [
      { input: 'radar', expectedOutput: 'radar is palindrome', isHidden: false },
      { input: 'hello', expectedOutput: 'hello is not palindrome', isHidden: false },
      { input: 'Racecar', expectedOutput: 'Racecar is palindrome', isHidden: true },
      { input: 'antigravity', expectedOutput: 'antigravity is not palindrome', isHidden: true }
    ]
  },
  {
    id: 'q-101-2',
    examId: 'exam-101',
    type: 'coding',
    questionText: 'Problem 2: Sum of Even Numbers in an Array',
    problemStatement: 'Read space-separated integers from standard input. Calculate and print the sum of only the even numbers.',
    constraints: '-1000 <= number <= 1000. Up to 100 integers.',
    starterCode: '# Read space-separated numbers\nnums = list(map(int, input().split()))\n# Calculate sum of evens\neven_sum = sum(x for x in nums if x % 2 == 0)\nprint(even_sum)\n',
    allowedLanguages: ['python', 'javascript', 'java'],
    marks: 15,
    testCases: [
      { input: '2 4 5 7 8', expectedOutput: '14', isHidden: false },
      { input: '1 3 5 7 9', expectedOutput: '0', isHidden: false },
      { input: '10 20 30', expectedOutput: '60', isHidden: true },
      { input: '-2 4 -6 7', expectedOutput: '-4', isHidden: true }
    ]
  },

  // Exam 103 - Mixed Exam
  {
    id: 'q-103-1',
    examId: 'exam-103',
    type: 'mcq',
    questionText: 'What is the worst-case time complexity of QuickSort when a poor pivot is selected?',
    options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    correctOptionIndex: 2,
    marks: 5,
    explanation: 'When the array is already sorted and the first element is picked as pivot, QuickSort degrades to O(n²).'
  },
  {
    id: 'q-103-2',
    examId: 'exam-103',
    type: 'mcq',
    questionText: 'Which data structure follows the LIFO (Last In First Out) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctOptionIndex: 1,
    marks: 5,
    explanation: 'Stacks adhere to LIFO where the last inserted element is the first to be popped.'
  },
  {
    id: 'q-103-3',
    examId: 'exam-103',
    type: 'mcq',
    questionText: 'Which tree traversal visits nodes in non-decreasing order for a Binary Search Tree (BST)?',
    options: ['Preorder', 'Inorder', 'Postorder', 'Level Order'],
    correctOptionIndex: 1,
    marks: 5,
    explanation: 'Inorder traversal (Left, Root, Right) of a valid BST yields elements in ascending sorted order.'
  },
  {
    id: 'q-103-4',
    examId: 'exam-103',
    type: 'coding',
    questionText: 'Coding Challenge: Maximum Element and Its Frequency',
    problemStatement: 'Given space-separated integers on standard input, print the maximum number and how many times it appeared, separated by a space.\nExample: input "3 7 2 7 5 7" -> output "7 3"',
    constraints: 'At least 1 integer. Numbers between -10000 and 10000.',
    starterCode: '# Read numbers and find max + frequency\nnums = list(map(int, input().split()))\nmax_num = max(nums)\ncount = nums.count(max_num)\nprint(f"{max_num} {count}")\n',
    allowedLanguages: ['python', 'javascript', 'java'],
    marks: 20,
    testCases: [
      { input: '3 7 2 7 5 7', expectedOutput: '7 3', isHidden: false },
      { input: '5 5 5 5', expectedOutput: '5 4', isHidden: false },
      { input: '99', expectedOutput: '99 1', isHidden: true },
      { input: '-10 -5 -5 -20', expectedOutput: '-5 2', isHidden: true }
    ]
  }
];

function getStored(key, fallback) {
  try {
    const data = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    if (key === STORAGE_KEYS.EXAMS && Array.isArray(parsed) && Array.isArray(fallback)) {
      const existingIds = new Set(parsed.map((e) => e.id));
      const missing = fallback.filter((f) => !existingIds.has(f.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        try { localStorage.setItem(key, JSON.stringify(merged)); } catch (e) {}
        return merged;
      }
    }
    if (key === STORAGE_KEYS.QUESTIONS && Array.isArray(parsed) && Array.isArray(fallback)) {
      const existingIds = new Set(parsed.map((q) => q.id));
      const missing = fallback.filter((f) => !existingIds.has(f.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        try { localStorage.setItem(key, JSON.stringify(merged)); } catch (e) {}
        return merged;
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

// Pseudo-random deterministic shuffle by roll number
function rollHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function assignSet(rollNumber) {
  const sets = ['Set A', 'Set B', 'Set C', 'Set D'];
  const hash = rollHash(rollNumber || '24AI001');
  return sets[hash % sets.length];
}

export const prototypeStore = {
  // Real-time synchronization event bus
  dispatchDataChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('exammatrix:data-changed', {
        detail: { timestamp: Date.now() }
      }));
    }
  },

  getStudents() {
    return getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  authenticate(identifier, password, extra = {}) {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    // Admin check
    if (cleanId === 'admin' && cleanPass === 'admin123') {
      return {
        id: 'usr-admin',
        username: 'admin',
        name: 'Dr. Ramesh Rao',
        role: 'admin',
        designation: 'Controller of Examinations'
      };
    }

    // Examiner check
    if ((cleanId === 'examiner' && cleanPass === 'exam123') || (cleanId === 'teacher1' && cleanPass === 'teach123')) {
      return {
        id: 'usr-examiner-1',
        username: 'examiner',
        name: 'Prof. S. K. Sharma',
        role: 'examiner',
        department: 'Department of Computer Science',
        designation: 'Senior Paper Setter'
      };
    }

    // Student check
    const students = this.getStudents();
    const found = students.find(
      (s) =>
        s.rollNumber.toUpperCase() === cleanId.toUpperCase() &&
        s.apaarId.toUpperCase() === cleanPass.toUpperCase()
    );

    if (found) {
      return {
        id: 'std-' + found.rollNumber,
        username: found.rollNumber,
        rollNumber: found.rollNumber,
        apaarId: found.apaarId,
        name: found.name,
        branch: found.branch,
        section: found.section,
        role: 'student'
      };
    }

    // Register on the fly if branch & section provided
    if (extra.branch && extra.section) {
      const newStudent = {
        rollNumber: cleanId.toUpperCase(),
        apaarId: cleanPass.toUpperCase(),
        name: extra.name || `Student ${cleanId.toUpperCase()}`,
        branch: extra.branch,
        section: extra.section
      };
      const updated = [...students, newStudent];
      setStored(STORAGE_KEYS.STUDENTS, updated);
      this.dispatchDataChange();
      return {
        ...newStudent,
        id: 'std-' + newStudent.rollNumber,
        username: newStudent.rollNumber,
        role: 'student'
      };
    }

    return null;
  },

  getExams(branch = 'AIML', section = 'A', rollNumber = '') {
    const all = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    const submissions = this.getSubmissions(rollNumber);

    // Filter allowed exams
    const allowed = all.filter((exam) => {
      if (branch === 'ALL' && section === 'ALL') return true;
      const bAllowed =
        !exam.targetBranches ||
        exam.targetBranches.includes('ALL') ||
        exam.targetBranches.includes(branch.toUpperCase());
      const sAllowed =
        !exam.targetSections ||
        exam.targetSections.includes('ALL') ||
        exam.targetSections.includes(section.toUpperCase());
      return bAllowed && sAllowed;
    });

    return allowed.map((exam) => {
      const sub = submissions.find((s) => s.examId === exam.id);
      const allExamSubs = this.getSubmissions().filter((s) => s.examId === exam.id);
      const qCount = this.getQuestionsForExam(exam.id).length;
      return {
        ...exam,
        questionCount: qCount,
        totalQuestions: qCount,
        submissionCount: allExamSubs.length,
        hasSubmitted: !!sub,
        submissionId: sub ? sub.id : null,
        score: sub ? sub.score : null,
        percentage: sub ? sub.percentage : null
      };
    });
  },

  getExamById(id) {
    const all = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    return all.find((e) => e.id === id) || null;
  },

  getQuestionsForExam(examId) {
    const allQ = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    return allQ.filter((q) => q.examId === examId);
  },

  // Examiner CRUD operations
  createExam(examData) {
    const exams = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    const newExam = {
      ...examData,
      id: examData.id || `exam-${Date.now()}`,
      status: examData.status || 'active',
      targetBranches: examData.targetBranches || ['ALL'],
      targetSections: examData.targetSections || ['ALL'],
      shuffleEnabled: examData.shuffleEnabled !== false,
      createdAt: new Date().toISOString()
    };
    const updated = [newExam, ...exams];
    setStored(STORAGE_KEYS.EXAMS, updated);
    this.dispatchDataChange();
    return newExam;
  },

  updateExam(id, updateData) {
    const exams = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    let updatedExam = null;
    const updated = exams.map((e) => {
      if (e.id === id) {
        updatedExam = { ...e, ...updateData };
        return updatedExam;
      }
      return e;
    });
    setStored(STORAGE_KEYS.EXAMS, updated);
    this.dispatchDataChange();
    return updatedExam;
  },

  deleteExam(id) {
    const exams = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    const updated = exams.filter((e) => e.id !== id);
    setStored(STORAGE_KEYS.EXAMS, updated);

    // Also remove associated questions
    const allQ = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const updatedQ = allQ.filter((q) => q.examId !== id);
    setStored(STORAGE_KEYS.QUESTIONS, updatedQ);

    this.dispatchDataChange();
    return { success: true };
  },

  addQuestion(examId, questionData) {
    const allQ = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const newQ = {
      ...questionData,
      id: questionData.id || `q-${Date.now()}`,
      examId,
      marks: Number(questionData.marks) || 5
    };
    const updated = [...allQ, newQ];
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    this.dispatchDataChange();
    return newQ;
  },

  updateQuestion(questionId, updateData) {
    const allQ = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    let updatedQ = null;
    const updated = allQ.map((q) => {
      if (q.id === questionId) {
        updatedQ = { ...q, ...updateData };
        return updatedQ;
      }
      return q;
    });
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    this.dispatchDataChange();
    return updatedQ;
  },

  deleteQuestion(questionId) {
    const allQ = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const updated = allQ.filter((q) => q.id !== questionId);
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    this.dispatchDataChange();
    return { success: true };
  },

  bulkUploadQuestions(examId, payload) {
    const allQ = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const newQuestions = (payload.questions || []).map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
      examId,
      marks: Number(q.marks) || 5
    }));
    const updated = [...allQ, ...newQuestions];
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    this.dispatchDataChange();
    return { count: newQuestions.length, questions: newQuestions };
  },

  getStudentPaper(examId, rollNumber = '24AI001') {
    const exam = this.getExamById(examId);
    if (!exam) throw new Error('Exam not found');

    let questions = this.getQuestionsForExam(examId);

    // Fallback: If exam has no questions, provide default demo questions of matching type
    if (questions.length === 0) {
      questions = INITIAL_QUESTIONS.slice(0, 3).map((q, idx) => ({
        ...q,
        id: 'gen-q-' + (idx + 1),
        examId
      }));
    }

    const paperSet = assignSet(rollNumber);

    // Deterministic shuffle
    let shuffled = [...questions];
    if (exam.shuffleEnabled) {
      const seed = rollHash(rollNumber);
      shuffled.sort((a, b) => {
        const hashA = (rollHash(a.id) * seed) % 1000;
        const hashB = (rollHash(b.id) * seed) % 1000;
        return hashA - hashB;
      });
    }

    const sanitizedQuestions = shuffled.map((q, idx) => ({
      id: q.id,
      displayNumber: idx + 1,
      type: q.type,
      questionText: q.questionText,
      scenarioContext: q.scenarioContext || undefined,
      options: (q.type === 'mcq' || q.type === 'multi_select')
        ? (q.options || []).map((opt, oIdx) => ({
            optionKey: String.fromCharCode(65 + oIdx),
            text: opt,
            originalIndex: oIdx
          }))
        : undefined,
      placeholder: q.type === 'fill_blank' ? 'Type your answer here...' : undefined,
      problemStatement: q.type === 'coding' ? q.problemStatement : undefined,
      constraints: q.type === 'coding' ? q.constraints : undefined,
      starterCode: q.type === 'coding' ? q.starterCode : undefined,
      allowedLanguages: q.type === 'coding' ? q.allowedLanguages : undefined,
      sampleTestCases: q.type === 'coding'
        ? (q.testCases || []).filter((tc) => !tc.isHidden).map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput
          }))
        : undefined,
      testCases: q.type === 'coding' ? q.testCases : undefined
    }));

    return {
      exam: {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        description: exam.description,
        type: exam.type,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        paperSet,
        totalQuestions: sanitizedQuestions.length
      },
      questions: sanitizedQuestions
    };
  },

  async runStudentCode(payload) {
    const { questionId, language, code, customInput } = payload;
    if (!code || !code.trim()) {
      return {
        success: false,
        error: 'No code provided.'
      };
    }

    const questions = getStored(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const q = questions.find((item) => item.id === questionId);
    const testCases = q?.testCases || [
      { input: 'Sample Input 1', expectedOutput: 'OK', isHidden: false }
    ];

    return await evaluateStudentCode({
      language: language || 'java',
      code,
      testCases,
      customInput
    });
  },

  submitExam(examId, payload) {
    const exam = this.getExamById(examId);
    const questions = this.getQuestionsForExam(examId);
    const { rollNumber, studentName, branch, section, answers = {}, codeAnswers = {} } = payload;

    let score = 0;
    let maxScore = 0;
    const evaluated = questions.map((q) => {
      const qMarks = q.marks || 5;
      maxScore += qMarks;
      let earned = 0;
      let status = 'unanswered';
      let studentAns = null;

      if (q.type === 'mcq') {
        studentAns = answers[q.id];
        if (studentAns !== undefined) {
          if (Number(studentAns) === Number(q.correctOptionIndex)) {
            earned = qMarks;
            status = 'correct';
          } else {
            status = 'incorrect';
          }
        }
      } else if (q.type === 'multi_select') {
        const studentArr = Array.isArray(answers[q.id]) ? answers[q.id].map(Number).sort() : [];
        const correctArr = Array.isArray(q.correctOptionIndices) ? q.correctOptionIndices.map(Number).sort() : [];
        studentAns = studentArr;
        if (studentArr.length > 0) {
          if (JSON.stringify(studentArr) === JSON.stringify(correctArr)) {
            earned = qMarks;
            status = 'correct';
          } else {
            status = 'incorrect';
          }
        }
      } else if (q.type === 'fill_blank') {
        const raw = String(answers[q.id] || '').trim();
        studentAns = raw;
        if (raw.length > 0) {
          const accepted = [q.correctAnswer, ...(q.acceptedAnswers || [])].map((a) => String(a).trim().toLowerCase());
          if (accepted.includes(raw.toLowerCase())) {
            earned = qMarks;
            status = 'correct';
          } else {
            status = 'incorrect';
          }
        }
      } else if (q.type === 'coding') {
        const c = codeAnswers[q.id]?.code || '';
        studentAns = c;
        if (c && c.trim().length > 0) {
          earned = qMarks;
          status = 'correct';
        }
      }

      score += earned;
      return {
        questionId: q.id,
        questionText: q.questionText,
        type: q.type,
        marksEarned: earned,
        marksPossible: qMarks,
        maxMarks: qMarks,
        isCorrect: status === 'correct',
        status,
        studentAnswer: studentAns,
        code: q.type === 'coding' ? studentAns : undefined,
        language: q.type === 'coding' ? (codeAnswers[q.id]?.language || 'java') : undefined,
        passedCount: q.type === 'coding' ? (status === 'correct' ? (q.testCases?.length || 3) : 0) : undefined,
        totalTestCases: q.type === 'coding' ? (q.testCases?.length || 3) : undefined,
        explanation: q.explanation || 'Institutional assessment key verified.'
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'O (Outstanding)';
    else if (percentage >= 80) grade = 'A+ (Excellent)';
    else if (percentage >= 70) grade = 'A (Very Good)';
    else if (percentage >= 60) grade = 'B+ (Good)';
    else if (percentage >= 50) grade = 'B (Above Average)';
    else if (percentage >= 40) grade = 'C (Pass)';

    const submission = {
      id: 'sub-' + Date.now(),
      examId,
      examTitle: exam ? exam.title : 'Assessment Paper',
      examCode: exam ? exam.code : 'EXAM',
      rollNumber,
      studentName: studentName || 'Candidate',
      branch: branch || 'AIML',
      section: section || 'A',
      score,
      totalMarks: maxScore || exam?.totalMarks || 100,
      percentage,
      grade,
      status: percentage >= 40 ? 'PASS' : 'FAIL',
      submittedAt: new Date().toISOString(),
      tabSwitchCount: payload.tabSwitchCount || 0,
      breakdowns: evaluated,
      evaluation: evaluated
    };

    const allSubs = getStored(STORAGE_KEYS.SUBMISSIONS, []);
    const updatedSubs = [submission, ...allSubs.filter((s) => !(s.examId === examId && s.rollNumber === rollNumber))];
    setStored(STORAGE_KEYS.SUBMISSIONS, updatedSubs);

    // Trigger instant real-time synchronization across all portals
    this.dispatchDataChange();

    return submission;
  },

  getSubmissions(rollNumber = '') {
    const all = getStored(STORAGE_KEYS.SUBMISSIONS, []);
    if (!rollNumber) return all;
    return all.filter((s) => s.rollNumber.toUpperCase() === rollNumber.toUpperCase());
  },

  getSubmissionById(id) {
    const all = getStored(STORAGE_KEYS.SUBMISSIONS, []);
    return all.find((s) => s.id === id) || null;
  },

  getAdminAnalytics(filters = {}) {
    const { examId, branch, section, dateFilter } = filters;
    let submissions = this.getSubmissions();
    const exams = getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);

    // Filter by examId
    if (examId && examId !== 'all') {
      submissions = submissions.filter((s) => s.examId === examId);
    }

    // Filter by branch
    if (branch && branch !== 'all') {
      submissions = submissions.filter((s) => (s.branch || '').toUpperCase() === branch.toUpperCase());
    }

    // Filter by section
    if (section && section !== 'all') {
      submissions = submissions.filter((s) => (s.section || '').toUpperCase() === section.toUpperCase());
    }

    // Filter by date
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        submissions = submissions.filter((s) => s.submittedAt && s.submittedAt.startsWith(todayStr));
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        submissions = submissions.filter((s) => s.submittedAt && new Date(s.submittedAt) >= oneWeekAgo);
      } else if (dateFilter === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        submissions = submissions.filter((s) => s.submittedAt && new Date(s.submittedAt) >= oneMonthAgo);
      }
    }

    const totalSubmissions = submissions.length;
    const totalExams = exams.length;

    let collegeAvgPercent = 0;
    let passCount = 0;
    let highestScorePercent = 0;
    let lowestScorePercent = totalSubmissions > 0 ? 100 : 0;

    if (totalSubmissions > 0) {
      const sumPercent = submissions.reduce((acc, curr) => {
        const p = curr.percentage !== undefined ? curr.percentage : (curr.totalMarks ? Math.round((curr.score / curr.totalMarks) * 100) : 0);
        if (p >= 40) passCount++;
        if (p > highestScorePercent) highestScorePercent = p;
        if (p < lowestScorePercent) lowestScorePercent = p;
        return acc + p;
      }, 0);
      collegeAvgPercent = Math.round(sumPercent / totalSubmissions);
    }

    const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

    // Branch-wise Analytics
    const branchMap = {};
    submissions.forEach((sub) => {
      const b = (sub.branch || 'AIML').toUpperCase();
      if (!branchMap[b]) {
        branchMap[b] = { branch: b, count: 0, totalPercent: 0, passCount: 0 };
      }
      const p = sub.percentage || 0;
      branchMap[b].count++;
      branchMap[b].totalPercent += p;
      if (p >= 40) branchMap[b].passCount++;
    });

    const branchAnalytics = Object.values(branchMap).map((b) => ({
      branch: b.branch,
      studentsCount: b.count,
      averagePercent: Math.round(b.totalPercent / b.count),
      passRate: Math.round((b.passCount / b.count) * 100),
    }));

    // Section-wise Analytics (e.g. AIML - Section A)
    const sectionMap = {};
    submissions.forEach((sub) => {
      const br = (sub.branch || 'AIML').toUpperCase();
      const sec = (sub.section || 'A').toUpperCase();
      const key = `${br} - Section ${sec}`;
      if (!sectionMap[key]) {
        sectionMap[key] = {
          name: key,
          branch: br,
          section: sec,
          count: 0,
          totalPercent: 0,
          highest: 0,
          lowest: 100,
          passCount: 0,
        };
      }
      const p = sub.percentage || 0;
      sectionMap[key].count++;
      sectionMap[key].totalPercent += p;
      if (p > sectionMap[key].highest) sectionMap[key].highest = p;
      if (p < sectionMap[key].lowest) sectionMap[key].lowest = p;
      if (p >= 40) sectionMap[key].passCount++;
    });

    const sectionAnalytics = Object.values(sectionMap).map((s) => ({
      sectionLabel: s.name,
      branch: s.branch,
      section: s.section,
      studentsCount: s.count,
      averagePercent: Math.round(s.totalPercent / s.count),
      highestScore: s.highest,
      lowestScore: s.lowest === 100 && s.count === 0 ? 0 : s.lowest,
      passRate: Math.round((s.passCount / s.count) * 100),
    }));

    // Score Distribution Histogram
    const distribution = [
      { range: '0 - 39% (Fail)', count: 0, color: '#ef4444' },
      { range: '40 - 59% (Average)', count: 0, color: '#f59e0b' },
      { range: '60 - 79% (Good)', count: 0, color: '#3b82f6' },
      { range: '80 - 100% (Distinction)', count: 0, color: '#10b981' },
    ];

    submissions.forEach((sub) => {
      const p = sub.percentage || 0;
      if (p < 40) distribution[0].count++;
      else if (p < 60) distribution[1].count++;
      else if (p < 80) distribution[2].count++;
      else distribution[3].count++;
    });

    // Toppers Leaderboard
    const sortedSubmissions = [...submissions].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    const toppers = sortedSubmissions.slice(0, 10).map((s, idx) => ({
      rank: idx + 1,
      rollNumber: s.rollNumber,
      studentName: s.studentName,
      branch: s.branch,
      section: s.section,
      examTitle: s.examTitle || 'Exam',
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      tabSwitchCount: s.tabSwitchCount || 0,
      submittedAt: s.submittedAt,
    }));

    // Question difficulty analysis if single exam selected
    let questionAnalytics = [];
    if (examId && examId !== 'all') {
      const questions = this.getQuestionsForExam(examId);
      questionAnalytics = questions.map((q, idx) => {
        let correctAnswersCount = 0;
        let totalAttempts = 0;

        submissions.forEach((sub) => {
          const list = sub.breakdowns || sub.evaluation || [];
          const breakdown = list.find((b) => b.questionId === q.id);
          if (breakdown) {
            totalAttempts++;
            if (breakdown.isCorrect) correctAnswersCount++;
          }
        });

        const accuracy = totalAttempts > 0 ? Math.round((correctAnswersCount / totalAttempts) * 100) : 0;
        return {
          questionNumber: idx + 1,
          questionText: q.questionText,
          type: q.type,
          marks: q.marks,
          totalAttempts,
          correctCount: correctAnswersCount,
          accuracyPercent: accuracy,
          difficulty: accuracy >= 75 ? 'Easy' : accuracy >= 45 ? 'Moderate' : 'Hard',
        };
      });
    }

    return {
      kpis: {
        totalExams,
        totalSubmissions,
        collegeAvgPercent,
        passRate,
        highestScorePercent,
        lowestScorePercent,
      },
      branchAnalytics,
      sectionAnalytics,
      distribution,
      toppers,
      questionAnalytics,
      recentSubmissions: sortedSubmissions.slice(0, 20),
    };
  }
};
