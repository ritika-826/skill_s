const Result = require("../models/Result");
const Quiz = require("../models/Quiz");

// SUBMIT QUIZ VIA RESULT CONTROLLER
const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({
        message: "Quiz ID and answers are required",
      });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      user: req.user.userId,
    }).populate("questions");

    if (!quiz) {
      return res.status(404).json({
        message: "Assessment not found",
      });
    }

    if (quiz.completed) {
      return res.status(400).json({
        message: "Assessment has already been submitted",
      });
    }

    // Timer enforcement
    const elapsedSeconds = (Date.now() - new Date(quiz.startTime).getTime()) / 1000;
    const gracePeriodSeconds = 15;
    const isExpired = elapsedSeconds > (quiz.duration || 1200) + gracePeriodSeconds;

    let answerMap = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans.questionId) {
          answerMap[ans.questionId] = ans.selectedAnswer || "";
        }
      });
    } else if (typeof answers === "object") {
      answerMap = answers;
    }

    let score = 0;
    const processedAnswers = [];
    const topicStats = {};

    if (quiz.topics && quiz.topics.length > 0) {
      quiz.topics.forEach((top) => {
        topicStats[top] = { correct: 0, total: 0 };
      });
    }

    for (const question of quiz.questions) {
      const qId = question._id.toString();
      const selected = answerMap[qId] || "";
      const isCorrect = selected === question.correctAnswer;

      if (isCorrect) {
        score++;
      }

      const qTopic = question.topic || "General";
      if (!topicStats[qTopic]) {
        topicStats[qTopic] = { correct: 0, total: 0 };
      }
      topicStats[qTopic].total += 1;
      if (isCorrect) {
        topicStats[qTopic].correct += 1;
      }

      processedAnswers.push({
        question: question._id,
        selectedAnswer: selected,
        isCorrect: isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);
    const actualTimeTaken = Math.min(Math.round(elapsedSeconds), quiz.duration || 1200);

    const topicPerformance = Object.keys(topicStats).map((tName) => {
      const stats = topicStats[tName];
      const tPct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
      return {
        topic: tName,
        correct: stats.correct,
        total: stats.total,
        percentage: tPct,
      };
    });

    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    topicPerformance.forEach((tp) => {
      if (tp.percentage >= 70) {
        strengths.push(tp.topic);
      } else {
        weaknesses.push(tp.topic);
        recommendations.push(
          `Review core concepts and practical workflows for ${tp.topic} to improve performance.`
        );
      }
    });

    if (weaknesses.length === 0) {
      recommendations.push("Excellent work! Outstanding performance across all assessment skills.");
    }

    quiz.score = score;
    quiz.completed = true;
    quiz.status = isExpired ? "expired" : "completed";
    quiz.endTime = new Date();
    quiz.answers = processedAnswers;
    await quiz.save();

    const result = await Result.create({
      user: req.user.userId,
      quiz: quizId,
      role: quiz.role,
      score,
      totalQuestions,
      percentage,
      timeTaken: actualTimeTaken,
      topicPerformance,
      strengths,
      weaknesses,
      recommendations,
      answers: processedAnswers,
    });

    const populatedResult = await Result.findById(result._id)
      .populate("quiz")
      .populate("answers.question");

    res.status(201).json({
      message: "Assessment submitted successfully",
      quizId,
      resultId: result._id,
      role: quiz.role,
      score,
      totalQuestions,
      percentage,
      timeTaken: actualTimeTaken,
      topicPerformance,
      strengths,
      weaknesses,
      recommendations,
      result: populatedResult,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER RESULTS
const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user.userId })
      .populate("quiz")
      .sort({ createdAt: -1 });

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

// GET ONE RESULT
const getResult = async (req, res, next) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })
      .populate("quiz")
      .populate("answers.question");

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    res.json({ result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuiz,
  getMyResults,
  getResult,
};