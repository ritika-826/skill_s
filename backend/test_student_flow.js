const axios = require("./node_modules/axios");

const BASE_URL = "http://localhost:5000/api";

async function verifyStudentFlow() {
  console.log("==========================================");
  console.log("VERIFYING STUDENT & ASSESSMENT INTEGRITY");
  console.log("==========================================");

  try {
    // 1. Student Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "rahul@example.com",
      password: "password123",
    });
    const token = loginRes.data.token;
    console.log("1. Student Logged In:", loginRes.data.user.name);

    // 2. Fetch Roles Config
    const rolesRes = await axios.get(`${BASE_URL}/quizzes/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`2. Roles Config Retrieved (${rolesRes.data.roles?.length} roles)`);

    // 3. Start Assessment
    const startRes = await axios.post(
      `${BASE_URL}/quizzes/start`,
      {
        role: "DevOps Engineer",
        topics: ["Docker", "Kubernetes"],
        numberOfQuestions: 10,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const quizId = startRes.data.quizId;
    const questions = startRes.data.questions;
    console.log(`3. Started Assessment "${quizId}" with ${questions.length} questions`);

    // Verify sanitization
    if (questions.some((q) => q.correctAnswer || q.explanation)) {
      throw new Error("SECURITY FAILURE: Sanitization breached during active quiz!");
    }
    console.log("   Question sanitization verified! No answers leaked. ✅");

    // 4. Submit Assessment
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: q.options[0],
    }));

    const submitRes = await axios.post(
      `${BASE_URL}/quizzes/${quizId}/submit`,
      { answers },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("4. Submitted Assessment Successfully! Result:", {
      resultId: submitRes.data.resultId,
      score: submitRes.data.score,
      total: submitRes.data.totalQuestions,
      pct: submitRes.data.percentage,
      topicPerformanceCount: submitRes.data.topicPerformance?.length,
    });

    // 5. Fetch Student History
    const historyRes = await axios.get(`${BASE_URL}/results/my-results`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`5. Retrieved Student Assessment History (${historyRes.data.results?.length} records)`);

    console.log("\n==========================================");
    console.log("STUDENT WORKFLOW VERIFIED SUCCESSFULLY! ✅");
    console.log("==========================================");
  } catch (err) {
    console.error("STUDENT VERIFICATION FAILED:", err.response?.data || err.message);
    process.exit(1);
  }
}

verifyStudentFlow();
