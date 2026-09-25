const Result = require("../models/Result");
const Quiz = require("../models/Quiz");
const { calculateAssessmentScore } = require("../utils/scoreCalculator");

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
      const existingResult = await Result.findOne({ quiz: quiz._id, user: req.user.userId })
        .populate("quiz")
        .populate("answers.question");

      if (existingResult) {
        return res.status(200).json({
          message: "Assessment already submitted",
          quizId: quiz._id,
          resultId: existingResult._id,
          role: quiz.role,
          score: existingResult.score,
          mcqScore: existingResult.mcqScore,
          codingScore: existingResult.codingScore,
          overallScore: existingResult.overallScore,
          totalQuestions: existingResult.totalQuestions,
          percentage: existingResult.percentage,
          timeTaken: existingResult.timeTaken,
          topicPerformance: existingResult.topicPerformance,
          strengths: existingResult.strengths,
          weaknesses: existingResult.weaknesses,
          recommendations: existingResult.recommendations,
          result: existingResult,
        });
      }
    }

    // Timer enforcement
    const elapsedSeconds = (Date.now() - new Date(quiz.startTime).getTime()) / 1000;
    const gracePeriodSeconds = 15;
    const isExpired = elapsedSeconds > (quiz.duration || 1200) + gracePeriodSeconds;

    let answerMap = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans && ans.questionId) {
          answerMap[ans.questionId] = ans;
        }
      });
    } else if (typeof answers === "object" && answers !== null) {
      answerMap = answers;
    }

    if (Array.isArray(req.body.codingAnswers)) {
      req.body.codingAnswers.forEach((ca) => {
        if (ca && ca.questionId) {
          answerMap[ca.questionId] = ca;
        }
      });
    }

    const evaluated = await calculateAssessmentScore({ quiz, answers, answerMap });
    const actualTimeTaken = Math.min(Math.round(elapsedSeconds), quiz.duration || 1200);

    quiz.mcqScore = evaluated.mcqScore;
    quiz.codingScore = evaluated.codingScore;
    quiz.overallScore = evaluated.overallScore;
    quiz.score = evaluated.overallScore;
    quiz.percentage = evaluated.percentage;
    quiz.completed = true;
    quiz.status = isExpired ? "expired" : "completed";
    quiz.endTime = new Date();
    quiz.answers = evaluated.evaluatedAnswers;
    await quiz.save();

    const result = await Result.create({
      user: req.user.userId,
      quiz: quizId,
      role: quiz.role,
      isCustomRole: quiz.isCustomRole,
      score: evaluated.overallScore,
      mcqScore: evaluated.mcqScore,
      codingScore: evaluated.codingScore,
      overallScore: evaluated.overallScore,
      percentage: evaluated.percentage,
      totalQuestions: evaluated.totalPossibleMarks,
      attemptedCount: evaluated.attemptedCount,
      skippedCount: evaluated.skippedCount,
      correctCount: evaluated.correctCount,
      incorrectCount: evaluated.incorrectCount,
      timeTaken: actualTimeTaken,
      topicPerformance: evaluated.topicPerformance,
      difficultyPerformance: evaluated.difficultyPerformance,
      strengths: evaluated.strengths,
      weaknesses: evaluated.weaknesses,
      recommendations: evaluated.recommendations,
      answers: evaluated.evaluatedAnswers,
    });

    const populatedResult = await Result.findById(result._id)
      .populate("quiz")
      .populate("answers.question");

    res.status(201).json({
      message: "Assessment submitted successfully",
      quizId,
      resultId: result._id,
      role: quiz.role,
      score: evaluated.overallScore,
      mcqScore: evaluated.mcqScore,
      codingScore: evaluated.codingScore,
      overallScore: evaluated.overallScore,
      totalQuestions: evaluated.totalPossibleMarks,
      percentage: evaluated.percentage,
      timeTaken: actualTimeTaken,
      topicPerformance: evaluated.topicPerformance,
      difficultyPerformance: evaluated.difficultyPerformance,
      strengths: evaluated.strengths,
      weaknesses: evaluated.weaknesses,
      recommendations: evaluated.recommendations,
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