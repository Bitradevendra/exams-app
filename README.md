# ExamMatrix: Secure Examination Conducting & Auto-Evaluation Platform

An end-to-end examination conducting platform engineered for colleges and academic institutions, featuring **3 dedicated role portals**, an **automated code evaluation sandbox**, **deterministic question and choice paper shuffling by roll number**, and a **ready-to-deploy Native Android APK**.

---

## 🌟 Key Capabilities & 3 Role Portals

### 1. 🎓 Student View (Candidate Portal)
- **Authentication**: Simple, secure login using institutional **Roll Number** + **APAAR ID** (Indian National Academic Account Registry).
- **Targeted Exam Access**: Displays only exams explicitly authorized for the student's **Branch** (e.g. CSE, ECE, MECH, IT) and **Section** (A, B, C).
- **Deterministic Paper Shuffling**:
  - Automatically loads a unique paper variant (e.g., Set A, Set B, Set C, Set D).
  - Shuffles questions and MCQ choices deterministically using the student's roll number as seed (preventing copying between adjacent students).
- **Examination Environment**:
  - **MCQ / Bits**: Radio option selector, clear choice, mark for review toggle, live question palette (Answered in green, Review in purple, Unanswered in slate).
  - **Coding Questions**: In-browser code editor with line numbers, language toggle (**Python 3** and **Node.js**), and **"Run Sample Tests"** button with a real-time terminal output.
  - **Proctor Integrity Safeguards**: Detects and logs tab-switching or window focus loss with real-time warning alerts and strike tracking.
  - **Auto-Submission**: Automatically submits the paper when the countdown timer reaches zero.
- **Scorecard & Detailed Review**:
  - Immediate auto-graded results with celebration confetti.
  - Total score, percentage, grade badge, section rank, and question-by-question breakdown showing student choices, correct answers, explanations, and code test results.

---

### 2. ✏️ Middleman / Examiner View (Paper Setter & Proctor)
- **Exam Management**: Create exams, assign titles, exam codes, duration in minutes, and target branches/sections.
- **Supported Exam Types**:
  - **Bits / Multiple Choice Questions (MCQ)**: Single/multi-choice with automated scoring and explanations.
  - **Coding-Based**: Problem statements, starter templates, and test cases (both public sample cases and hidden evaluation cases).
  - **Mixed Assessments**: Blends Bits and Coding questions in a single examination paper.
- **Mistake Correction Guarantee**:
  - Edit existing questions in real-time to fix typos, change choices, update the answer key for autocorrect, or modify test cases even after creating the paper!
- **Roll Number Shuffle Simulator**:
  - Enter test roll numbers (e.g., `21CS001, 21CS002`) to inspect side-by-side how questions and options shuffle mathematically for each candidate.
- **Live Proctoring Console**:
  - Monitor submissions, average score, and cheating/tab-switch alert flags in real time.

---

### 3. 📊 Admin View (Institutional Analytics)
- **Executive KPIs**: Total exams conducted, candidate submissions, institutional average score, and pass rate.
- **Multi-Dimensional Filters**: Filter by Exam, Branch (CSE, ECE, IT, MECH), Section (A, B, C), and Date Range (Today, 7 Days, 30 Days, All Time).
- **Section-to-Section Analytics**: Side-by-side comparison of section averages (e.g. CSE-A vs CSE-B), pass percentages, and high/low scores.
- **Branch Performance Charts**: Comparative performance distribution across academic departments.
- **Score Spread Histogram**: Visual distribution across Fail (0-39%), Average (40-59%), Good (60-79%), and Distinction (80-100%).
- **Question Difficulty Diagnostics**: Highlights questions with the lowest accuracy where students require classroom reinforcement.
- **Export Capabilities**: 1-click **CSV Grade Sheet Export** and printable institutional reports.

---

## 🚀 Quick Start Guide

### Option 1: Double-Click Launcher (Windows)
Double-click either:
- `start.bat`
- `start.ps1`

Both backend and frontend will start in independent windows.

### Option 2: Command Line
```powershell
# In terminal 1 (Backend):
cd backend
npm install
node server.js

# In terminal 2 (Frontend):
cd frontend
npm install
npm run dev
```

- **Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📱 Native Android APK

The ready-to-deploy Android debug APK is built and located in the project root:
```
ExamMatrix.apk
```
And in the Gradle build output directory:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### Installing onto an Android Device or Emulator
Connect your Android device via USB with USB Debugging enabled, then run:
```powershell
adb install -r ExamMatrix.apk
```
Or open the `frontend/android` folder in **Android Studio** and click **Run**.

---

## 🧪 Automated Testing & Verification

Run the comprehensive test suites:

```powershell
# 1. Backend Sandbox & Shuffling Verification:
node backend/test/test-sandbox.js

# 2. End-to-End System Integration Test (All 3 Portals + Code Runner + Mistake Editing + Admin CSV):
node test-e2e.js
```
