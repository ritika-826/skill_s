const axios = require("./node_modules/axios");

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("==========================================");
  console.log("STARTING RECRUITER BACKEND VERIFICATION");
  console.log("==========================================");

  try {
    // 1. Recruiter Login
    console.log("\n1. Testing Recruiter Login...");
    const recruiterLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "recruiter@skillspecific.com",
      password: "password123",
    });

    console.log("Recruiter login response:", {
      role: recruiterLoginRes.data.user.role,
      name: recruiterLoginRes.data.user.name,
      hasToken: Boolean(recruiterLoginRes.data.token),
    });

    if (recruiterLoginRes.data.user.role !== "recruiter") {
      throw new Error(`Expected recruiter role, got: ${recruiterLoginRes.data.user.role}`);
    }
    const recruiterToken = recruiterLoginRes.data.token;

    // 2. Student Login
    console.log("\n2. Testing Student Login...");
    const studentLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "rahul@example.com",
      password: "password123",
    });

    console.log("Student login response:", {
      role: studentLoginRes.data.user.role,
      name: studentLoginRes.data.user.name,
    });
    const studentToken = studentLoginRes.data.token;

    // 3. Authorization Check: Student token accessing recruiter endpoint
    console.log("\n3. Testing Authorization (Student attempting recruiter route)...");
    try {
      await axios.get(`${BASE_URL}/recruiter/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      throw new Error("SECURITY FAILURE: Student was allowed access to recruiter dashboard!");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log("PASS: Student access was correctly denied with 403 Forbidden! ✅");
      } else {
        throw err;
      }
    }

    // 4. Authorization Check: No token
    console.log("\n4. Testing Unauthorized Access (No token)...");
    try {
      await axios.get(`${BASE_URL}/recruiter/dashboard`);
      throw new Error("SECURITY FAILURE: Unauthenticated request was allowed access!");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log("PASS: Unauthenticated access was correctly denied with 401 Unauthorized! ✅");
      } else {
        throw err;
      }
    }

    // 5. Recruiter Dashboard Stats
    console.log("\n5. Testing Recruiter Dashboard Stats...");
    const dashRes = await axios.get(`${BASE_URL}/recruiter/dashboard`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    console.log("Dashboard Summary:", dashRes.data.summary);
    console.log(`Top students count: ${dashRes.data.topStudents.length}`);
    console.log(`Recent activity count: ${dashRes.data.recentActivity.length}`);
    console.log("Charts data available:", Object.keys(dashRes.data.charts));

    if (!dashRes.data.summary.totalStudents || !dashRes.data.summary.assessmentsCompleted) {
      throw new Error("Dashboard summary numbers missing or zero!");
    }

    // 6. Recruiter Students List
    console.log("\n6. Testing Recruiter Students List...");
    const studentsRes = await axios.get(`${BASE_URL}/recruiter/students?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    console.log(`Found ${studentsRes.data.students.length} students. Total: ${studentsRes.data.pagination.total}`);
    const sampleStudent = studentsRes.data.students[0];
    console.log("Sample Student:", {
      name: sampleStudent.name,
      targetRole: sampleStudent.targetRole,
      avgScore: sampleStudent.averageScore,
      bestScore: sampleStudent.bestScore,
      badge: sampleStudent.badge,
    });

    // 7. Student Detail
    console.log("\n7. Testing Student Profile Deep-Dive...");
    const studentDetailRes = await axios.get(`${BASE_URL}/recruiter/students/${sampleStudent.id}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    console.log("Student Profile Detail:", {
      name: studentDetailRes.data.student.name,
      historyCount: studentDetailRes.data.assessmentHistory.length,
      topicCount: studentDetailRes.data.topicPerformance.length,
      strongSkills: studentDetailRes.data.skillsSummary.strongSkills,
      needsImprovement: studentDetailRes.data.skillsSummary.needsImprovement,
    });

    // 8. Assessments List
    console.log("\n8. Testing Recruiter Assessments List...");
    const assessmentsRes = await axios.get(`${BASE_URL}/recruiter/assessments?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    console.log(`Found ${assessmentsRes.data.assessments.length} assessments.`);
    const sampleAssessment = assessmentsRes.data.assessments[0];

    // 9. Assessment Detail
    console.log("\n9. Testing Assessment Detail...");
    const assessmentDetailRes = await axios.get(`${BASE_URL}/recruiter/assessments/${sampleAssessment.id}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    console.log("Assessment Detail:", {
      role: assessmentDetailRes.data.assessment.targetRole,
      score: assessmentDetailRes.data.assessment.score,
      pct: assessmentDetailRes.data.assessment.percentage,
      questionsReviewed: assessmentDetailRes.data.assessment.questionReview.length,
      difficultyBreakdown: assessmentDetailRes.data.assessment.difficultyBreakdown,
    });

    // 10. Analytics
    console.log("\n10. Testing Recruiter Analytics...");
    const analyticsRes = await axios.get(`${BASE_URL}/recruiter/analytics?dateRange=30d`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    console.log("Analytics Metrics:", analyticsRes.data.metrics);
    console.log("Score Distribution:", analyticsRes.data.scoreDistribution);
    console.log("Role Performance:", analyticsRes.data.rolePerformance);

    console.log("\n==========================================");
    console.log("ALL RECRUITER BACKEND TESTS PASSED! 🚀✅");
    console.log("==========================================");
  } catch (err) {
    console.error("TEST FAILED:", err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
