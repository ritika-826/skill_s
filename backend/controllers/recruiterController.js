const mongoose = require("mongoose");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const Question = require("../models/Question");

// Helper: compute relative time string
const getRelativeTimeString = (date) => {
  if (!date) return "N/A";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
};

// Helper: determine badge from average percentage
const getPerformanceBadge = (percentage) => {
  if (percentage >= 85) return { label: "Excellent", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" };
  if (percentage >= 70) return { label: "Proficient", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
  if (percentage >= 50) return { label: "Average", color: "#eab308", bg: "rgba(234, 179, 8, 0.15)" };
  return { label: "Needs Practice", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
};

// Helper: compute Date filter query
const getDateFilter = (dateRange) => {
  if (!dateRange || dateRange === "all") return null;
  const now = new Date();
  if (dateRange === "today") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { $gte: startOfToday };
  }
  if (dateRange === "7d") {
    return { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  }
  if (dateRange === "30d") {
    return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
  }
  return null;
};

// =====================================================
// 1. RECRUITER DASHBOARD & LEADERBOARD (100% Real MongoDB Data)
// =====================================================
const getDashboardStats = async (req, res, next) => {
  try {
    const { role, dateRange } = req.query;

    const resultMatch = {};
    const dateFilter = getDateFilter(dateRange);
    if (dateFilter) {
      resultMatch.createdAt = dateFilter;
    }

    if (role && role !== "All Roles" && role !== "All") {
      resultMatch.role = { $regex: new RegExp(`^${role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
    }

    // 1. Total registered students
    const totalStudents = await User.countDocuments({ role: "student" });

    // 2. Total students who attempted assessments
    const attemptedStudents = (await Quiz.distinct("user", role && role !== "All Roles" && role !== "All" ? { role: resultMatch.role } : {})).length;

    // 3. Completed assessments
    const assessmentsCompleted = await Result.countDocuments(resultMatch);
    const totalQuizzes = await Quiz.countDocuments(role && role !== "All Roles" && role !== "All" ? { role: resultMatch.role } : {});

    // 4. Score metrics
    const scoreAgg = await Result.aggregate([
      { $match: resultMatch },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$percentage" },
          avgMcq: { $avg: "$mcqScore" },
          avgCoding: { $avg: "$codingScore" },
          maxScore: { $max: "$percentage" },
          avgTime: { $avg: "$timeTaken" },
        },
      },
    ]);

    const averageScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avgScore * 10) / 10 : 0;
    const averageMcqScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avgMcq || 0) : 0;
    const averageCodingScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avgCoding || 0) : 0;
    const highestScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].maxScore || 0) : 0;
    const avgTimeSec = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avgTime || 0) : 0;
    const avgMins = Math.floor(avgTimeSec / 60);
    const avgSecs = avgTimeSec % 60;
    const averageCompletionTime = `${avgMins}m ${avgSecs}s`;

    // 5. Active candidates (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeCandidates = (
      await Result.distinct("user", {
        createdAt: { $gte: thirtyDaysAgo },
      })
    ).length;

    // 6. Completion rate
    const completionRate = totalQuizzes > 0 ? Math.round((assessmentsCompleted / totalQuizzes) * 1000) / 10 : 0;

    // 7. Dynamic Top Performing Students / Leaderboard (Strictly calculated from real submissions)
    const topStudentsPipeline = [
      { $match: resultMatch },
      {
        $group: {
          _id: "$user",
          totalAssessments: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          avgCodingScore: { $avg: "$codingScore" },
          avgMcqScore: { $avg: "$mcqScore" },
          avgTimeTaken: { $avg: "$timeTaken" },
          lastAssessmentDate: { $max: "$createdAt" },
          roles: { $push: "$role" },
          latestAssessmentName: { $last: "$role" },
          allTopicPerformances: { $push: "$topicPerformance" },
        },
      },
      {
        $sort: {
          avgScore: -1,
          bestScore: -1,
          avgCodingScore: -1,
          totalAssessments: -1,
          avgTimeTaken: 1, // Faster time is secondary ranking factor
        },
      },
      { $limit: 15 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
    ];

    const topStudentsAgg = await Result.aggregate(topStudentsPipeline);

    const topStudents = topStudentsAgg.map((item, index) => {
      const primaryRole = item.roles && item.roles.length > 0 ? item.roles[item.roles.length - 1] : "Software Developer";

      // Calculate strongest skill
      const skillStats = {};
      if (item.allTopicPerformances) {
        item.allTopicPerformances.flat().forEach((tp) => {
          if (tp && tp.topic) {
            if (!skillStats[tp.topic]) {
              skillStats[tp.topic] = { correct: 0, total: 0 };
            }
            skillStats[tp.topic].correct += tp.correct || 0;
            skillStats[tp.topic].total += tp.total || 0;
          }
        });
      }

      let strongestSkill = "General Logic";
      let highestSkillPct = -1;
      Object.keys(skillStats).forEach((skill) => {
        const total = skillStats[skill].total;
        if (total > 0) {
          const pct = Math.round((skillStats[skill].correct / total) * 100);
          if (pct > highestSkillPct) {
            highestSkillPct = pct;
            strongestSkill = skill;
          }
        }
      });

      const avgPct = Math.round(item.avgScore);
      const badge = getPerformanceBadge(avgPct);

      const timeSecs = Math.round(item.avgTimeTaken || 0);
      const mins = Math.floor(timeSecs / 60);
      const secs = timeSecs % 60;

      return {
        rank: index + 1,
        studentId: item._id,
        name: item.userDetails.name || "Student",
        email: item.userDetails.email || "",
        targetRole: primaryRole,
        assessmentName: `${primaryRole} Assessment`,
        assessmentsTaken: item.totalAssessments,
        overallScore: avgPct,
        percentage: avgPct,
        averageScore: avgPct,
        bestScore: Math.round(item.bestScore),
        codingScore: Math.round(item.avgCodingScore || 0),
        mcqScore: Math.round(item.avgMcqScore || 0),
        timeTaken: `${mins}m ${secs}s`,
        status: "Completed",
        submissionDate: getRelativeTimeString(item.lastAssessmentDate),
        strongestSkill: strongestSkill,
        lastAssessment: getRelativeTimeString(item.lastAssessmentDate),
        lastAssessmentDate: item.lastAssessmentDate,
        badge: badge.label,
        badgeColor: badge.color,
        badgeBg: badge.bg,
      };
    });

    // 8. Recent Activity (Real submissions only)
    const recentResults = await Result.find(resultMatch)
      .populate("user", "name email")
      .populate("quiz", "title role status duration")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentActivity = recentResults.map((r) => {
      const timeTakenSec = r.timeTaken || 0;
      const mins = Math.floor(timeTakenSec / 60);
      const secs = timeTakenSec % 60;

      return {
        id: r._id,
        quizId: r.quiz?._id,
        studentId: r.user?._id,
        studentName: r.user?.name || "Candidate",
        email: r.user?.email || "",
        targetRole: r.role || r.quiz?.role || "Engineering Track",
        assessment: `${r.role || "Technical"} Assessment`,
        score: `${r.percentage}%`,
        rawScore: r.score,
        percentage: r.percentage,
        codingScore: r.codingScore || 0,
        mcqScore: r.mcqScore || 0,
        questions: `${r.score}/${r.totalQuestions}`,
        timeTaken: `${mins}m ${secs}s`,
        status: "Completed",
        date: getRelativeTimeString(r.createdAt),
        rawDate: r.createdAt,
      };
    });

    // 9. Real MongoDB Charts Aggregations
    // Chart 1: Performance Overview over dates
    const scoreOverviewAgg = await Result.aggregate([
      { $match: resultMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          avgScore: { $avg: "$percentage" },
          maxScore: { $max: "$percentage" },
          minScore: { $min: "$percentage" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 15 },
    ]);

    const performanceOverview = scoreOverviewAgg.map((item) => ({
      date: item._id,
      average: Math.round(item.avgScore),
      highest: Math.round(item.maxScore),
      lowest: Math.round(item.minScore),
      count: item.count,
    }));

    // Chart 2: Students & Assessments by Target Role
    const roleDistributionAgg = await Result.aggregate([
      { $match: resultMatch },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          avgCoding: { $avg: "$codingScore" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const studentsByRole = roleDistributionAgg
      .filter((item) => item._id)
      .map((item) => ({
        role: item._id,
        count: item.count,
        avgScore: Math.round(item.avgScore),
        avgCoding: Math.round(item.avgCoding || 0),
      }));

    // Chart 3: Topic / Skill Performance
    const topicAgg = await Result.aggregate([
      { $match: resultMatch },
      { $unwind: "$topicPerformance" },
      {
        $group: {
          _id: "$topicPerformance.topic",
          totalCorrect: { $sum: "$topicPerformance.correct" },
          totalQuestions: { $sum: "$topicPerformance.total" },
        },
      },
      {
        $project: {
          topic: "$_id",
          percentage: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              { $round: [{ $multiply: [{ $divide: ["$totalCorrect", "$totalQuestions"] }, 100] }] },
              0,
            ],
          },
          totalQuestions: 1,
        },
      },
      { $sort: { percentage: -1 } },
      { $limit: 10 },
    ]);

    const skillPerformance = topicAgg.map((item) => ({
      topic: item.topic,
      percentage: item.percentage,
      totalQuestions: item.totalQuestions,
    }));

    // Chart 4: Completion Trend
    const completionTrendAgg = await Result.aggregate([
      { $match: resultMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    const completionTrend = completionTrendAgg.map((item) => ({
      date: item._id,
      completed: item.completed,
    }));

    res.json({
      summary: {
        totalStudents,
        totalAttemptedStudents: attemptedStudents,
        assessmentsCompleted,
        totalQuizzes,
        averageScore,
        averagePercentage: averageScore,
        averageMcqScore,
        averageCodingScore,
        highestScore,
        averageCompletionTime,
        topPerformers: topStudents.filter((s) => s.averageScore >= 80).length,
        activeCandidates,
        completionRate,
      },
      topStudents,
      recentActivity,
      charts: {
        performanceOverview,
        studentsByRole,
        skillPerformance,
        completionTrend,
      },
    });
  } catch (error) {
    console.error("GET RECRUITER DASHBOARD ERROR:", error);
    next(error);
  }
};

// =====================================================
// 2. CANDIDATE MANAGEMENT (Filterable, Paginated, Real MongoDB Data)
// =====================================================
const getStudents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 15));
    const search = (req.query.search || "").trim();
    const roleFilter = (req.query.role || "").trim();
    const statusFilter = (req.query.status || "").trim();
    const dateRange = (req.query.dateRange || "all").trim();
    const minScore = req.query.minScore ? parseFloat(req.query.minScore) : null;
    const maxScore = req.query.maxScore ? parseFloat(req.query.maxScore) : null;
    const sortBy = req.query.sortBy || "highestScore";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const userMatch = { role: "student" };
    if (search) {
      userMatch.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const resultMatchCondition = {};
    const dateFilter = getDateFilter(dateRange);
    if (dateFilter) {
      resultMatchCondition.createdAt = dateFilter;
    }

    const pipeline = [
      { $match: userMatch },
      {
        $lookup: {
          from: "results",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$userId"] },
                ...resultMatchCondition,
              },
            },
          ],
          as: "results",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "user",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          assessmentsTaken: { $size: "$quizzes" },
          assessmentsCompleted: { $size: "$results" },
          averageScore: {
            $cond: [
              { $gt: [{ $size: "$results" }, 0] },
              { $round: [{ $avg: "$results.percentage" }, 1] },
              0,
            ],
          },
          codingScore: {
            $cond: [
              { $gt: [{ $size: "$results" }, 0] },
              { $round: [{ $avg: "$results.codingScore" }, 1] },
              0,
            ],
          },
          mcqScore: {
            $cond: [
              { $gt: [{ $size: "$results" }, 0] },
              { $round: [{ $avg: "$results.mcqScore" }, 1] },
              0,
            ],
          },
          bestScore: {
            $cond: [
              { $gt: [{ $size: "$results" }, 0] },
              { $max: "$results.percentage" },
              0,
            ],
          },
          lastAssessmentDate: {
            $cond: [
              { $gt: [{ $size: "$results" }, 0] },
              { $max: "$results.createdAt" },
              null,
            ],
          },
          targetRole: {
            $cond: [
              { $gt: [{ $size: "$results" }, 0] },
              { $arrayElemAt: ["$results.role", -1] },
              { $ifNull: ["$targetRole", "Unassigned"] },
            ],
          },
        },
      },
    ];

    if (roleFilter && roleFilter !== "All" && roleFilter !== "All Roles") {
      pipeline.push({
        $match: {
          targetRole: { $regex: new RegExp(`^${roleFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        },
      });
    }

    if (minScore !== null) {
      pipeline.push({ $match: { averageScore: { $gte: minScore } } });
    }
    if (maxScore !== null) {
      pipeline.push({ $match: { averageScore: { $lte: maxScore } } });
    }

    if (statusFilter === "active") {
      pipeline.push({ $match: { assessmentsCompleted: { $gt: 0 } } });
    } else if (statusFilter === "inactive") {
      pipeline.push({ $match: { assessmentsCompleted: 0 } });
    } else if (statusFilter === "top") {
      pipeline.push({ $match: { averageScore: { $gte: 80 } } });
    }

    const sortStage = {};
    if (sortBy === "highestScore") {
      sortStage.averageScore = sortOrder;
      sortStage.bestScore = sortOrder;
      sortStage.codingScore = sortOrder;
    } else if (sortBy === "lowestScore") {
      sortStage.averageScore = 1;
    } else if (sortBy === "mostAssessments") {
      sortStage.assessmentsCompleted = sortOrder;
    } else if (sortBy === "recentAssessment") {
      sortStage.lastAssessmentDate = sortOrder;
    } else if (sortBy === "name") {
      sortStage.name = sortOrder;
    } else {
      sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      },
    });

    const result = await User.aggregate(pipeline);
    const total = result[0]?.metadata[0]?.total || 0;
    const rawStudents = result[0]?.data || [];

    const students = rawStudents.map((s, idx) => {
      const avgScore = s.averageScore || 0;
      const badge = getPerformanceBadge(avgScore);
      const statusLabel =
        s.assessmentsCompleted > 0
          ? avgScore >= 80
            ? "Top Performer"
            : "Active Candidate"
          : "Registered";

      return {
        rank: (page - 1) * limit + idx + 1,
        id: s._id,
        name: s.name,
        email: s.email,
        targetRole: s.targetRole || "Engineering",
        assessmentsTaken: s.assessmentsTaken || 0,
        assessmentsCompleted: s.assessmentsCompleted || 0,
        overallScore: avgScore,
        percentage: avgScore,
        averageScore: avgScore,
        bestScore: s.bestScore || 0,
        codingScore: s.codingScore || 0,
        mcqScore: s.mcqScore || 0,
        lastAssessment: s.lastAssessmentDate ? getRelativeTimeString(s.lastAssessmentDate) : "Never",
        lastAssessmentDate: s.lastAssessmentDate,
        joinedDate: s.createdAt,
        status: statusLabel,
        badge: badge.label,
        badgeColor: badge.color,
        badgeBg: badge.bg,
      };
    });

    res.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET RECRUITER STUDENTS ERROR:", error);
    next(error);
  }
};

// =====================================================
// 3. STUDENT PERFORMANCE PROFILE (Single Student Deep-Dive)
// =====================================================
const getStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findOne({ _id: studentId, role: "student" }).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const results = await Result.find({ user: studentId })
      .populate("quiz", "title duration status numberOfQuestions topics")
      .sort({ createdAt: -1 })
      .lean();

    const quizzes = await Quiz.find({ user: studentId }).sort({ createdAt: -1 }).lean();

    const completedCount = results.length;
    const totalTaken = quizzes.length;
    const totalPercentage = results.reduce((sum, r) => sum + (r.percentage || 0), 0);
    const avgScore = completedCount > 0 ? Math.round((totalPercentage / completedCount) * 10) / 10 : 0;
    const bestScore = completedCount > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;
    const badge = getPerformanceBadge(avgScore);

    const roles = results.map((r) => r.role).filter(Boolean);
    const targetRole = roles.length > 0 ? roles[0] : student.targetRole || "Engineering";

    const assessmentHistory = results.map((r) => {
      const timeTakenSec = r.timeTaken || 0;
      const mins = Math.floor(timeTakenSec / 60);
      const secs = timeTakenSec % 60;

      return {
        id: r._id,
        quizId: r.quiz?._id,
        assessmentName: `${r.role || "Technical"} Assessment`,
        targetRole: r.role || r.quiz?.role || "General",
        score: `${r.score} / ${r.totalQuestions}`,
        percentage: r.percentage,
        overallScore: r.overallScore || r.percentage,
        codingScore: r.codingScore || 0,
        mcqScore: r.mcqScore || 0,
        correctAnswers: r.score,
        totalQuestions: r.totalQuestions,
        timeTaken: `${mins}m ${secs}s`,
        rawTimeTaken: r.timeTaken,
        difficulty: "Mixed",
        date: r.createdAt,
        relativeDate: getRelativeTimeString(r.createdAt),
        status: "Completed",
        monitoringSummary: r.monitoringSummary || {},
        strengths: r.strengths || [],
        weaknesses: r.weaknesses || [],
      };
    });

    const topicStats = {};
    results.forEach((res) => {
      if (Array.isArray(res.topicPerformance)) {
        res.topicPerformance.forEach((tp) => {
          if (tp && tp.topic) {
            if (!topicStats[tp.topic]) {
              topicStats[tp.topic] = { correct: 0, total: 0 };
            }
            topicStats[tp.topic].correct += tp.correct || 0;
            topicStats[tp.topic].total += tp.total || 0;
          }
        });
      }
    });

    const topicPerformance = Object.keys(topicStats).map((topic) => {
      const stat = topicStats[topic];
      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      return {
        topic,
        correct: stat.correct,
        total: stat.total,
        percentage: pct,
      };
    });

    topicPerformance.sort((a, b) => b.percentage - a.percentage);

    const strongSkills = topicPerformance.filter((t) => t.percentage >= 70).map((t) => t.topic);
    const needsImprovement = topicPerformance.filter((t) => t.percentage < 70).map((t) => t.topic);

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        targetRole,
        joinedDate: student.createdAt,
        assessmentsCompleted: completedCount,
        assessmentsStarted: totalTaken,
        averageScore: avgScore,
        bestScore,
        badge: badge.label,
        badgeColor: badge.color,
        badgeBg: badge.bg,
      },
      assessmentHistory,
      topicPerformance,
      skillsSummary: {
        strongSkills,
        needsImprovement,
      },
    });
  } catch (error) {
    console.error("GET STUDENT BY ID ERROR:", error);
    next(error);
  }
};

// =====================================================
// 4. RECRUITER ASSESSMENTS LIST (Filterable, Paginated)
// =====================================================
const getAssessments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 15));
    const search = (req.query.search || "").trim();
    const role = (req.query.role || "").trim();
    const dateRange = (req.query.dateRange || "all").trim();

    const query = {};
    if (role && role !== "All" && role !== "All Roles") {
      query.role = { $regex: new RegExp(`^${role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
    }
    const dateFilter = getDateFilter(dateRange);
    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    let results = await Result.find(query)
      .populate("user", "name email")
      .populate("quiz", "title duration status numberOfQuestions topics")
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(searchLower) ||
          r.user?.email?.toLowerCase().includes(searchLower) ||
          r.role?.toLowerCase().includes(searchLower)
      );
    }

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    const assessments = paginated.map((r) => {
      const timeTakenSec = r.timeTaken || 0;
      const mins = Math.floor(timeTakenSec / 60);
      const secs = timeTakenSec % 60;

      return {
        id: r._id,
        quizId: r.quiz?._id,
        studentId: r.user?._id,
        studentName: r.user?.name || "Candidate",
        email: r.user?.email || "",
        targetRole: r.role || r.quiz?.role || "Engineering Track",
        assessmentName: `${r.role || "Technical"} Assessment`,
        score: `${r.percentage}%`,
        percentage: r.percentage,
        overallScore: r.overallScore || r.percentage,
        codingScore: r.codingScore || 0,
        mcqScore: r.mcqScore || 0,
        scoreCount: `${r.score}/${r.totalQuestions}`,
        totalQuestions: r.totalQuestions,
        timeTaken: `${mins}m ${secs}s`,
        rawTimeTaken: r.timeTaken,
        status: "Completed",
        monitoringSummary: r.monitoringSummary || {},
        date: getRelativeTimeString(r.createdAt),
        rawDate: r.createdAt,
      };
    });

    res.json({
      assessments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET RECRUITER ASSESSMENTS ERROR:", error);
    next(error);
  }
};

// =====================================================
// 5. ASSESSMENT DETAIL (Deep-Dive into a Specific Test Attempt + Monitoring)
// =====================================================
const getAssessmentById = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }

    let result = await Result.findById(assessmentId)
      .populate("user", "name email createdAt targetRole")
      .populate("quiz")
      .populate("answers.question")
      .lean();

    if (!result) {
      result = await Result.findOne({ quiz: assessmentId })
        .populate("user", "name email createdAt targetRole")
        .populate("quiz")
        .populate("answers.question")
        .lean();
    }

    if (!result) {
      return res.status(404).json({ message: "Assessment record not found" });
    }

    const totalQuestions = result.totalQuestions || result.answers?.length || 20;
    const correctAnswers = result.score || 0;
    const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);
    const percentage = result.percentage !== undefined ? result.percentage : Math.round((correctAnswers / totalQuestions) * 100);

    const timeTakenSec = result.timeTaken || 0;
    const mins = Math.floor(timeTakenSec / 60);
    const secs = timeTakenSec % 60;

    const difficultyStats = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    const questionReview = (result.answers || []).map((ans, idx) => {
      const q = ans.question || {};
      const diff = (q.difficulty || "medium").toLowerCase();
      const isCorrect = Boolean(ans.isCorrect);

      if (difficultyStats[diff]) {
        difficultyStats[diff].total += 1;
        if (isCorrect) difficultyStats[diff].correct += 1;
      }

      if (q.questionType === "coding") {
        return {
          questionIndex: idx + 1,
          questionId: q._id,
          questionType: "coding",
          title: q.title || "Coding Challenge",
          problemStatement: q.problemStatement,
          submittedCode: ans.code || "",
          language: ans.language || "javascript",
          codingScore: ans.codingScore || 0,
          testCasesPassed: ans.testCasesPassed || 0,
          totalTestCases: ans.totalTestCases || 0,
          executionStatus: ans.executionStatus || "Evaluated",
          isCorrect,
          explanation: q.explanation || "Coding problem evaluated with automated test suites.",
          difficulty: q.difficulty || "medium",
          topic: q.topic || "Coding",
        };
      }

      return {
        questionIndex: idx + 1,
        questionId: q._id,
        questionType: "mcq",
        questionText: q.questionText || "Question text unavailable",
        options: q.options || [],
        candidateAnswer: ans.selectedAnswer || "Not answered",
        correctAnswer: q.correctAnswer || "Unavailable",
        isCorrect,
        explanation: q.explanation || "No explanation provided.",
        difficulty: q.difficulty || "medium",
        topic: q.topic || "General",
      };
    });

    const difficultyBreakdown = ["easy", "medium", "hard"].map((level) => {
      const stats = difficultyStats[level];
      const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return {
        level: level.charAt(0).toUpperCase() + level.slice(1),
        correct: stats.correct,
        total: stats.total,
        percentage: pct,
      };
    });

    res.json({
      assessment: {
        id: result._id,
        quizId: result.quiz?._id,
        student: {
          id: result.user?._id,
          name: result.user?.name || "Candidate",
          email: result.user?.email || "",
          targetRole: result.user?.targetRole || result.role,
        },
        targetRole: result.role || result.quiz?.role || "Engineering Track",
        assessmentName: `${result.role || "Technical"} Assessment`,
        score: correctAnswers,
        totalQuestions,
        percentage,
        overallScore: result.overallScore || percentage,
        codingScore: result.codingScore || 0,
        mcqScore: result.mcqScore || 0,
        correct: correctAnswers,
        incorrect: incorrectAnswers,
        skipped: result.skippedCount || 0,
        timeTaken: `${mins}m ${secs}s`,
        rawTimeTaken: result.timeTaken,
        duration: result.quiz?.duration || 1200,
        completedAt: result.createdAt,
        formattedDate: new Date(result.createdAt).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        topicPerformance: result.topicPerformance || [],
        difficultyBreakdown,
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        recommendations: result.recommendations || [],
        monitoringEvents: result.monitoringEvents || [],
        monitoringSummary: result.monitoringSummary || {
          tabSwitches: 0,
          cameraDisconnections: 0,
          multipleFacesCount: 0,
          noFaceCount: 0,
        },
        questionReview,
      },
    });
  } catch (error) {
    console.error("GET ASSESSMENT DETAIL ERROR:", error);
    next(error);
  }
};

// =====================================================
// 6. RECRUITER ANALYTICS (Advanced Metrics & Distributions)
// =====================================================
const getAnalytics = async (req, res, next) => {
  try {
    const { dateRange, targetRole, studentId } = req.query;

    const matchQuery = {};

    const dateFilter = getDateFilter(dateRange);
    if (dateFilter) {
      matchQuery.createdAt = dateFilter;
    }

    if (targetRole && targetRole !== "All" && targetRole !== "All Roles") {
      matchQuery.role = { $regex: new RegExp(`^${targetRole.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
    }

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      matchQuery.user = new mongoose.Types.ObjectId(studentId);
    }

    const totalAssessments = await Result.countDocuments(matchQuery);

    const summaryAgg = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$percentage" },
          avgCoding: { $avg: "$codingScore" },
          avgMcq: { $avg: "$mcqScore" },
          avgTime: { $avg: "$timeTaken" },
        },
      },
    ]);

    const avgScore = summaryAgg.length > 0 ? Math.round(summaryAgg[0].avgScore * 10) / 10 : 0;
    const avgCodingScore = summaryAgg.length > 0 ? Math.round(summaryAgg[0].avgCoding || 0) : 0;
    const avgMcqScore = summaryAgg.length > 0 ? Math.round(summaryAgg[0].avgMcq || 0) : 0;
    const avgTimeSec = summaryAgg.length > 0 ? Math.round(summaryAgg[0].avgTime || 0) : 0;
    const avgTimeMins = Math.floor(avgTimeSec / 60);
    const avgTimeSecs = avgTimeSec % 60;
    const averageCompletionTime = `${avgTimeMins}m ${avgTimeSecs}s`;

    const totalStartedQuizzes = await Quiz.countDocuments(
      targetRole && targetRole !== "All" && targetRole !== "All Roles" ? { role: matchQuery.role } : {}
    );
    const completionRate =
      totalStartedQuizzes > 0
        ? Math.round((totalAssessments / totalStartedQuizzes) * 1000) / 10
        : totalAssessments > 0 ? 100 : 0;

    // Score distribution buckets
    const scoreDistributionAgg = await Result.aggregate([
      { $match: matchQuery },
      {
        $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 21, 41, 61, 81, 101],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    const bucketLabels = {
      0: "0-20%",
      21: "21-40%",
      41: "41-60%",
      61: "61-80%",
      81: "81-100%",
    };

    const scoreDistribution = [
      { range: "0-20%", count: 0 },
      { range: "21-40%", count: 0 },
      { range: "41-60%", count: 0 },
      { range: "61-80%", count: 0 },
      { range: "81-100%", count: 0 },
    ];

    scoreDistributionAgg.forEach((b) => {
      const idx = scoreDistribution.findIndex(
        (item) => item.range === (bucketLabels[b._id] || "0-20%")
      );
      if (idx !== -1) {
        scoreDistribution[idx].count = b.count;
      }
    });

    // Performance by Target Role
    const roleAgg = await Result.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          avgCoding: { $avg: "$codingScore" },
          highestScore: { $max: "$percentage" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const rolePerformance = roleAgg
      .filter((r) => r._id)
      .map((r) => ({
        role: r._id,
        assessments: r.count,
        avgScore: Math.round(r.avgScore),
        avgCoding: Math.round(r.avgCoding || 0),
        highestScore: Math.round(r.highestScore),
      }));

    // Performance by Topic
    const topicAgg = await Result.aggregate([
      { $match: matchQuery },
      { $unwind: "$topicPerformance" },
      {
        $group: {
          _id: "$topicPerformance.topic",
          totalCorrect: { $sum: "$topicPerformance.correct" },
          totalQuestions: { $sum: "$topicPerformance.total" },
        },
      },
      {
        $project: {
          topic: "$_id",
          percentage: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              { $round: [{ $multiply: [{ $divide: ["$totalCorrect", "$totalQuestions"] }, 100] }] },
              0,
            ],
          },
          totalQuestions: 1,
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    const topicPerformance = topicAgg.map((t) => ({
      topic: t.topic,
      percentage: t.percentage,
      totalQuestions: t.totalQuestions,
    }));

    // Difficulty performance
    const resultsForDiff = await Result.find(matchQuery)
      .populate("answers.question", "difficulty")
      .select("answers")
      .lean();

    const diffStats = {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 },
    };

    resultsForDiff.forEach((r) => {
      (r.answers || []).forEach((ans) => {
        const diff = ans.question?.difficulty ? ans.question.difficulty.toLowerCase() : "medium";
        const level = diff === "easy" ? "Easy" : diff === "hard" ? "Hard" : "Medium";
        diffStats[level].total++;
        if (ans.isCorrect) diffStats[level].correct++;
      });
    });

    const difficultyPerformance = ["Easy", "Medium", "Hard"].map((level) => {
      const item = diffStats[level];
      const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      return {
        difficulty: level,
        correct: item.correct,
        total: item.total,
        percentage: pct,
      };
    });

    res.json({
      metrics: {
        totalAssessments,
        averageScore: avgScore,
        averageMcqScore: avgMcqScore,
        averageCodingScore: avgCodingScore,
        completionRate,
        averageCompletionTime,
        avgTimeSeconds: avgTimeSec,
      },
      scoreDistribution,
      rolePerformance,
      topicPerformance,
      difficultyPerformance,
      mostAttemptedRoles: rolePerformance.slice(0, 5),
    });
  } catch (error) {
    console.error("GET RECRUITER ANALYTICS ERROR:", error);
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStudents,
  getStudentById,
  getAssessments,
  getAssessmentById,
  getAnalytics,
};
