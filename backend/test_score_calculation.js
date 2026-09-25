const assert = require("assert");
const { calculateAssessmentScore } = require("./utils/scoreCalculator");

async function runScoreTests() {
  console.log("=== STARTING SCORE CALCULATION UNIT TESTS ===");

  // Mock Question generator helpers
  const makeMcq = (id, topic = "Docker", correctAnswer = "A") => ({
    _id: id,
    questionType: "mcq",
    topic,
    difficulty: "medium",
    correctAnswer,
  });

  const makeCoding = (id, topic = "Algorithms", testCases = [{ input: "1", expectedOutput: "1" }, { input: "2", expectedOutput: "2" }]) => ({
    _id: id,
    questionType: "coding",
    topic,
    difficulty: "medium",
    testCases,
  });

  // TEST CASE 1: 0 marks (MCQ = 0, Coding = 0 out of 20)
  {
    console.log("\nTest 1: 0 Marks (18 MCQs, 2 Coding)");
    const mcqs = Array.from({ length: 18 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const codings = [makeCoding("code_1"), makeCoding("code_2")];
    const quiz = { questions: [...mcqs, ...codings], topics: ["Docker", "Algorithms"] };

    // User selected wrong answer for all MCQs and submitted empty code
    const answerMap = {};
    mcqs.forEach((q) => { answerMap[q._id] = { selectedAnswer: "B" }; });
    codings.forEach((q) => { answerMap[q._id] = { code: "" }; });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 0, "Overall score should be 0");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 0, "Percentage should be 0%");
    assert.strictEqual(result.mcqScore, 0, "MCQ score should be 0");
    assert.strictEqual(result.codingScore, 0, "Coding score should be 0");
    console.log("✓ Test 1 Passed! (0/20, 0%, MCQ: 0 | Coding: 0)");
  }

  // TEST CASE 2: Only MCQ marks (MCQ = 10, Coding = 0 out of 20)
  {
    console.log("\nTest 2: Only MCQ Marks (10/18 MCQs correct, 0/2 Coding)");
    const mcqs = Array.from({ length: 18 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const codings = [makeCoding("code_1"), makeCoding("code_2")];
    const quiz = { questions: [...mcqs, ...codings], topics: ["Docker", "Algorithms"] };

    const answerMap = {};
    mcqs.forEach((q, idx) => {
      answerMap[q._id] = { selectedAnswer: idx < 10 ? "A" : "B" };
    });
    codings.forEach((q) => { answerMap[q._id] = { code: "" }; });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 10, "Overall score should be 10");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 50, "Percentage should be 50%");
    assert.strictEqual(result.mcqScore, 10, "MCQ score should be 10");
    assert.strictEqual(result.codingScore, 0, "Coding score should be 0");
    console.log("✓ Test 2 Passed! (10/20, 50%, MCQ: 10 | Coding: 0)");
  }

  // TEST CASE 3: Only Coding marks (MCQ = 0, Coding = 2 out of 20)
  {
    console.log("\nTest 3: Only Coding Marks (0/18 MCQs correct, 2/2 Coding full marks)");
    const mcqs = Array.from({ length: 18 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const codings = [makeCoding("code_1"), makeCoding("code_2")];
    const quiz = { questions: [...mcqs, ...codings], topics: ["Docker", "Algorithms"] };

    const answerMap = {};
    mcqs.forEach((q) => { answerMap[q._id] = { selectedAnswer: "B" }; });
    // Simulate passing code (JavaScript returning expected stdout)
    codings.forEach((q) => {
      answerMap[q._id] = {
        code: "const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim(); console.log(input);",
        language: "javascript",
      };
    });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 2, "Overall score should be 2");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 10, "Percentage should be 10%");
    assert.strictEqual(result.mcqScore, 0, "MCQ score should be 0");
    assert.strictEqual(result.codingScore, 2, "Coding score should be 2");
    console.log("✓ Test 3 Passed! (2/20, 10%, MCQ: 0 | Coding: 2)");
  }

  // TEST CASE 4: Both MCQ and Coding marks (MCQ = 10, Coding = 2 out of 20)
  {
    console.log("\nTest 4: Both MCQ and Coding Marks (10/18 MCQs, 2/2 Coding)");
    const mcqs = Array.from({ length: 18 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const codings = [makeCoding("code_1"), makeCoding("code_2")];
    const quiz = { questions: [...mcqs, ...codings], topics: ["Docker", "Algorithms"] };

    const answerMap = {};
    mcqs.forEach((q, idx) => { answerMap[q._id] = { selectedAnswer: idx < 10 ? "A" : "B" }; });
    codings.forEach((q) => {
      answerMap[q._id] = {
        code: "const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim(); console.log(input);",
        language: "javascript",
      };
    });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 12, "Overall score should be 12");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 60, "Percentage should be 60%");
    assert.strictEqual(result.mcqScore, 10, "MCQ score should be 10");
    assert.strictEqual(result.codingScore, 2, "Coding score should be 2");
    console.log("✓ Test 4 Passed! (12/20, 60%, MCQ: 10 | Coding: 2)");
  }

  // TEST CASE 5: Full marks (18 MCQ, 2 Coding out of 20)
  {
    console.log("\nTest 5: Full Marks (18/18 MCQs, 2/2 Coding)");
    const mcqs = Array.from({ length: 18 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const codings = [makeCoding("code_1"), makeCoding("code_2")];
    const quiz = { questions: [...mcqs, ...codings], topics: ["Docker", "Algorithms"] };

    const answerMap = {};
    mcqs.forEach((q) => { answerMap[q._id] = { selectedAnswer: "A" }; });
    codings.forEach((q) => {
      answerMap[q._id] = {
        code: "const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim(); console.log(input);",
        language: "javascript",
      };
    });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 20, "Overall score should be 20");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 100, "Percentage should be 100%");
    assert.strictEqual(result.mcqScore, 18, "MCQ score should be 18");
    assert.strictEqual(result.codingScore, 2, "Coding score should be 2");
    console.log("✓ Test 5 Passed! (20/20, 100%, MCQ: 18 | Coding: 2)");
  }

  // TEST CASE 6: Unanswered questions (Empty answer payload)
  {
    console.log("\nTest 6: Unanswered Questions (Empty payload)");
    const mcqs = Array.from({ length: 18 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const codings = [makeCoding("code_1"), makeCoding("code_2")];
    const quiz = { questions: [...mcqs, ...codings], topics: ["Docker", "Algorithms"] };

    const answerMap = {};

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 0, "Overall score should be 0");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 0, "Percentage should be 0%");
    assert.strictEqual(result.mcqScore, 0, "MCQ score should be 0");
    assert.strictEqual(result.codingScore, 0, "Coding score should be 0");
    assert.strictEqual(result.skippedCount, 20, "Skipped count should be 20");
    console.log("✓ Test 6 Passed! (0/20, 0%, Skipped: 20)");
  }

  // TEST CASE 7: Assessment with NO coding questions (20 MCQs)
  {
    console.log("\nTest 7: Assessment with NO Coding Questions (20 MCQs)");
    const mcqs = Array.from({ length: 20 }, (_, i) => makeMcq(`mcq_${i}`, "Docker", "A"));
    const quiz = { questions: mcqs, topics: ["Docker"] };

    const answerMap = {};
    mcqs.forEach((q, idx) => { answerMap[q._id] = { selectedAnswer: idx < 15 ? "A" : "B" }; });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 15, "Overall score should be 15");
    assert.strictEqual(result.totalPossibleMarks, 20, "Total possible marks should be 20");
    assert.strictEqual(result.percentage, 75, "Percentage should be 75%");
    assert.strictEqual(result.mcqScore, 15, "MCQ score should be 15");
    assert.strictEqual(result.codingScore, 0, "Coding score should be 0");
    console.log("✓ Test 7 Passed! (15/20, 75%, MCQ: 15 | Coding: 0)");
  }

  // TEST CASE 8: Assessment with NO MCQ questions (5 Coding questions)
  {
    console.log("\nTest 8: Assessment with NO MCQ Questions (5 Coding questions)");
    const codings = Array.from({ length: 5 }, (_, i) => makeCoding(`code_${i}`));
    const quiz = { questions: codings, topics: ["Algorithms"] };

    const answerMap = {};
    // 3 coding questions passed, 2 empty
    codings.forEach((q, idx) => {
      answerMap[q._id] = {
        code: idx < 3 ? "const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim(); console.log(input);" : "",
        language: "javascript",
      };
    });

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 3, "Overall score should be 3");
    assert.strictEqual(result.totalPossibleMarks, 5, "Total possible marks should be 5");
    assert.strictEqual(result.percentage, 60, "Percentage should be 60%");
    assert.strictEqual(result.mcqScore, 0, "MCQ score should be 0");
    assert.strictEqual(result.codingScore, 3, "Coding score should be 3");
    console.log("✓ Test 8 Passed! (3/5, 60%, MCQ: 0 | Coding: 3)");
  }

  // TEST CASE 9: Division by zero / Empty assessment (0 questions)
  {
    console.log("\nTest 9: Empty Assessment (0 questions)");
    const quiz = { questions: [], topics: [] };
    const answerMap = {};

    const result = await calculateAssessmentScore({ quiz, answers: [], answerMap });

    assert.strictEqual(result.overallScore, 0, "Overall score should be 0");
    assert.strictEqual(result.totalPossibleMarks, 0, "Total possible marks should be 0");
    assert.strictEqual(result.percentage, 0, "Percentage should be 0%");
    assert.strictEqual(result.mcqScore, 0, "MCQ score should be 0");
    assert.strictEqual(result.codingScore, 0, "Coding score should be 0");
    console.log("✓ Test 9 Passed! (0/0, 0%, MCQ: 0 | Coding: 0)");
  }

  console.log("\n=============================================");
  console.log("ALL 9 SCORE CALCULATION UNIT TESTS PASSED!");
  console.log("=============================================\n");
}

runScoreTests().catch((err) => {
  console.error("SCORE UNIT TEST FAILED:", err);
  process.exit(1);
});
