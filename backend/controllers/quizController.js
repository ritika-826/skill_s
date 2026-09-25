const crypto = require("crypto");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Result = require("../models/Result");
const User = require("../models/User");
const { generateAIQuiz, generateAICodingQuestion } = require("../services/aiService");
const { runCodeAgainstTestCases } = require("../services/codeExecutionService");
const { calculateAssessmentScore } = require("../utils/scoreCalculator");
const {
  ROLE_SKILLS_MAP,
  getRoles,
  getSkillsForRole,
  generateCustomRoleTopics,
  validateRoleAndTopics,
} = require("../config/roleSkills");

// Alphanumeric normalization helper for duplicate detection
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
};

const cleanStarterCode = (starterCode) => {
  if (!starterCode || typeof starterCode !== "object") return {};
  const cleaned = {};
  const langs = ["javascript", "python", "java", "cpp", "c"];
  langs.forEach((lang) => {
    const raw = starterCode[lang] || "";
    if (
      raw.includes("localeCompare") ||
      raw.includes("count4xx") ||
      raw.includes("TreeSet") ||
      raw.includes("qsort") ||
      raw.includes("pairs.sort")
    ) {
      if (lang === "javascript") {
        cleaned[lang] = `// Read input from standard input (stdin)\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\n// Write your solution here\n`;
      } else if (lang === "python") {
        cleaned[lang] = `import sys\n\ninput_text = sys.stdin.read().strip()\n# Write your solution here\n`;
      } else if (lang === "java") {
        cleaned[lang] = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n        \n    }\n}\n`;
      } else if (lang === "cpp") {
        cleaned[lang] = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}\n`;
      } else if (lang === "c") {
        cleaned[lang] = `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}\n`;
      }
    } else {
      cleaned[lang] = raw;
    }
  });
  return cleaned;
};

// Unique hash generator for deduplication
const computeQuestionHash = (text) => {
  return crypto.createHash("md5").update(normalizeText(text)).digest("hex");
};

// Fisher-Yates array shuffle helper
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// =====================================================
// FALLBACK QUESTION REPOSITORY (Ensures 100% reliability & uniqueness)
// =====================================================
const FALLBACK_QUESTIONS = {
  // DevOps Engineer
  Docker: [
    {
      questionText: "Which Docker command is used to list currently running containers?",
      options: ["docker images", "docker ps", "docker run", "docker start"],
      correctAnswer: "docker ps",
      explanation: "docker ps lists currently active and running Docker containers.",
      difficulty: "easy",
    },
    {
      questionText: "What is the primary purpose of a Dockerfile?",
      options: [
        "To manage Kubernetes cluster nodes",
        "To define environment variables for Linux",
        "To contain text instructions for building a Docker container image",
        "To store container log files",
      ],
      correctAnswer: "To contain text instructions for building a Docker container image",
      explanation: "A Dockerfile contains all sequential commands needed to assemble a container image.",
      difficulty: "easy",
    },
    {
      questionText: "Which command removes all stopped containers, unused networks, and dangling images?",
      options: ["docker system prune", "docker container kill", "docker rm -f", "docker stop all"],
      correctAnswer: "docker system prune",
      explanation: "docker system prune safely removes unused Docker objects and frees disk space.",
      difficulty: "medium",
    },
    {
      questionText: "In Docker networking, which network driver attaches containers directly to host interfaces without NAT?",
      options: ["bridge", "overlay", "macvlan", "host"],
      correctAnswer: "host",
      explanation: "The host network driver removes network isolation between container and host.",
      difficulty: "medium",
    },
    {
      questionText: "Which multi-stage Docker build instruction reduces final image size by discarding build dependencies?",
      options: ["FROM scratch", "COPY --from=builder", "RUN cleanup", "EXPORT minimal"],
      correctAnswer: "COPY --from=builder",
      explanation: "Multi-stage builds allow copying compiled binaries from an earlier build stage into a minimal production image.",
      difficulty: "hard",
    },
  ],
  Kubernetes: [
    {
      questionText: "What is the smallest deployable computing unit in Kubernetes?",
      options: ["Container", "Pod", "Node", "Service"],
      correctAnswer: "Pod",
      explanation: "A Pod represents one or more co-located containers running on a cluster node.",
      difficulty: "easy",
    },
    {
      questionText: "Which Kubernetes component is responsible for storing cluster state and metadata?",
      options: ["kube-apiserver", "etcd", "kube-scheduler", "kubelet"],
      correctAnswer: "etcd",
      explanation: "etcd is a consistent, highly-available key-value store used as Kubernetes' backing store.",
      difficulty: "medium",
    },
    {
      questionText: "Which Service type exposes a Kubernetes app externally using a cloud provider's load balancer?",
      options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"],
      correctAnswer: "LoadBalancer",
      explanation: "LoadBalancer provisions an external load balancer through the cloud provider.",
      difficulty: "medium",
    },
    {
      questionText: "Which resource defines declarative updates for Pods and ReplicaSets?",
      options: ["Deployment", "DaemonSet", "StatefulSet", "ConfigMap"],
      correctAnswer: "Deployment",
      explanation: "Deployments describe desired states for Pods and ReplicaSets.",
      difficulty: "easy",
    },
    {
      questionText: "What happens when a Kubernetes Horizontal Pod Autoscaler (HPA) triggers scaling?",
      options: [
        "It increases CPU memory per container",
        "It dynamically changes the number of Pod replicas",
        "It provisions new physical cluster nodes",
        "It updates ingress routing rules",
      ],
      correctAnswer: "It dynamically changes the number of Pod replicas",
      explanation: "HPA scales the replica count of a Deployment or ReplicaSet based on targeted metrics.",
      difficulty: "hard",
    },
  ],
  Jenkins: [
    {
      questionText: "Which file is used to define a Jenkins pipeline as code?",
      options: ["Dockerfile", "Jenkinsfile", "pipeline.yml", "build.json"],
      correctAnswer: "Jenkinsfile",
      explanation: "A Jenkinsfile is a text file that contains the definition of a Jenkins Pipeline.",
      difficulty: "easy",
    },
    {
      questionText: "In Jenkins Declarative Pipeline syntax, which block contains the actual execution steps?",
      options: ["agent", "stages", "steps", "post"],
      correctAnswer: "steps",
      explanation: "The steps block defines the series of tasks to execute inside a stage.",
      difficulty: "medium",
    },
    {
      questionText: "Which feature allows offloading build workloads from the Jenkins controller to worker nodes?",
      options: ["Jenkins Agents / Slaves", "Jenkins Plugins", "Jenkins Webhooks", "Jenkins Shared Library"],
      correctAnswer: "Jenkins Agents / Slaves",
      explanation: "Jenkins Agents perform build tasks assigned by the controller node.",
      difficulty: "medium",
    },
    {
      questionText: "How can a Git commit automatically trigger a Jenkins build?",
      options: ["Via Git Webhooks", "Via CRON schedule only", "Via manual trigger only", "Via Docker push"],
      correctAnswer: "Via Git Webhooks",
      explanation: "Webhooks notify Jenkins of repository events such as code pushes.",
      difficulty: "easy",
    },
    {
      questionText: "Which Jenkins Pipeline directive executes commands conditionally depending on build status?",
      options: ["post", "when", "options", "environment"],
      correctAnswer: "post",
      explanation: "The post section defines steps to run at the end of a pipeline run (e.g. success, failure, always).",
      difficulty: "hard",
    },
  ],
  AWS: [
    {
      questionText: "Which AWS service provides resizable virtual servers in the cloud?",
      options: ["Amazon S3", "Amazon EC2", "Amazon RDS", "AWS Lambda"],
      correctAnswer: "Amazon EC2",
      explanation: "Amazon EC2 (Elastic Compute Cloud) provides scalable computing capacity in the AWS cloud.",
      difficulty: "easy",
    },
    {
      questionText: "Which AWS service provides object storage with high durability?",
      options: ["Amazon EBS", "Amazon EFS", "Amazon S3", "Amazon ElastiCache"],
      correctAnswer: "Amazon S3",
      explanation: "Amazon Simple Storage Service (S3) stores scalable data objects in buckets.",
      difficulty: "easy",
    },
    {
      questionText: "Which AWS security feature controls access permissions for users, roles, and services?",
      options: ["AWS IAM", "AWS Shield", "AWS WAF", "AWS KMS"],
      correctAnswer: "AWS IAM",
      explanation: "Identity and Access Management (IAM) controls authentication and authorization across AWS resources.",
      difficulty: "medium",
    },
    {
      questionText: "What does an AWS VPC (Virtual Private Cloud) allow you to create?",
      options: [
        "A isolated virtual network environment in AWS",
        "A serverless code deployment pipeline",
        "A relational database instance",
        "A content delivery network cache",
      ],
      correctAnswer: "A isolated virtual network environment in AWS",
      explanation: "VPC lets you provision a logically isolated section of the AWS Cloud.",
      difficulty: "medium",
    },
    {
      questionText: "Which AWS service automatically scales EC2 instances based on demand?",
      options: ["Auto Scaling Groups", "Elastic Load Balancer", "CloudFront", "Route 53"],
      correctAnswer: "Auto Scaling Groups",
      explanation: "Auto Scaling Groups maintain application availability by adding or removing EC2 instances.",
      difficulty: "hard",
    },
  ],
  Linux: [
    {
      questionText: "Which command changes file permissions in Linux?",
      options: ["chown", "chmod", "chgrp", "touch"],
      correctAnswer: "chmod",
      explanation: "chmod (change mode) modifies file access permissions.",
      difficulty: "easy",
    },
    {
      questionText: "Which Linux directory stores global system configuration files?",
      options: ["/var", "/etc", "/usr", "/tmp"],
      correctAnswer: "/etc",
      explanation: "/etc contains core system configuration files and scripts.",
      difficulty: "easy",
    },
    {
      questionText: "Which command searches for text patterns within files using regular expressions?",
      options: ["find", "grep", "locate", "awk"],
      correctAnswer: "grep",
      explanation: "grep searches input files for lines matching a regular expression.",
      difficulty: "medium",
    },
    {
      questionText: "Which file system table maps disk partitions to mount points during Linux boot?",
      options: ["/etc/fstab", "/etc/hosts", "/etc/resolv.conf", "/etc/sysctl.conf"],
      correctAnswer: "/etc/fstab",
      explanation: "/etc/fstab defines how file systems and storage devices are mounted.",
      difficulty: "medium",
    },
    {
      questionText: "Which command inspects network socket metrics and listening ports in modern Linux?",
      options: ["ss", "netstat", "ifconfig", "ping"],
      correctAnswer: "ss",
      explanation: "ss is the modern utility to dump socket statistics and replace netstat.",
      difficulty: "hard",
    },
  ],
};

const ASPECTS = [
  {
    topicFocus: "automated configuration and version control",
    question: (role, topic) => `In ${role} environments, what is a key architectural practice when managing ${topic}?`,
    correctOpt: (topic) => `Automating ${topic} configuration and maintaining declarative code in version control`,
    distractors: (topic) => [
      `Manually applying untracked changes directly on production nodes for ${topic}`,
      `Disabling security audits and logging for ${topic} processes`,
      `Hardcoding plain-text credentials inside ${topic} configuration files`,
    ],
    explanation: (role, topic) => `In ${role} workflows, maintaining automated, version-controlled configurations for ${topic} prevents drift and improves reproducibility.`,
  },
  {
    topicFocus: "security and access policy enforcement",
    question: (role, topic) => `When securing ${topic} in a ${role} infrastructure, which security principle should be prioritized?`,
    correctOpt: (topic) => `Enforcing the principle of least privilege and strict access control for ${topic}`,
    distractors: (topic) => [
      `Granting administrative root permissions to all services accessing ${topic}`,
      `Storing all API keys in public code repositories for ${topic}`,
      `Disabling encryption in transit and at rest for ${topic} traffic`,
    ],
    explanation: (role, topic) => `Enforcing least privilege access for ${topic} mitigates unauthorized access vectors.`,
  },
  {
    topicFocus: "performance monitoring and metric telemetry",
    question: (role, topic) => `How should a ${role} monitor operational health and performance for ${topic}?`,
    correctOpt: (topic) => `Collecting real-time metrics, logs, and alerts for ${topic} resource usage`,
    distractors: (topic) => [
      `Relying exclusively on user complaint tickets without proactive metrics for ${topic}`,
      `Deleting system logs immediately after ${topic} execution`,
      `Disabling heartbeat telemetry checks for ${topic}`,
    ],
    explanation: (role, topic) => `Real-time observability and log analytics enable proactive issue resolution for ${topic}.`,
  },
  {
    topicFocus: "high availability and fault tolerance",
    question: (role, topic) => `Which design strategy ensures high availability for ${topic} in ${role} production deployment?`,
    correctOpt: (topic) => `Deploying ${topic} across redundant nodes with automated failover handling`,
    distractors: (topic) => [
      `Running ${topic} on a single non-redundant instance without backup`,
      `Disabling automated health checks for ${topic}`,
      `Restricting ${topic} deployments to a single fault domain`,
    ],
    explanation: (role, topic) => `Redundancy across multiple fault domains guarantees uninterrupted uptime for ${topic}.`,
  },
  {
    topicFocus: "disaster recovery and data backup",
    question: (role, topic) => `What is an essential component of a disaster recovery plan for ${topic}?`,
    correctOpt: (topic) => `Performing scheduled automated backups and routinely testing restore procedures for ${topic}`,
    distractors: (topic) => [
      `Creating manual snapshots once a year without testing restore viability for ${topic}`,
      `Storing backup files on the same volatile disk as live ${topic}`,
      `Ignoring backup verification for ${topic}`,
    ],
    explanation: (role, topic) => `Automated backups combined with periodic restore validation are mandatory for ${topic} resiliency.`,
  },
];

const generateGenericFallbackQuestion = (role, topic, index, difficulty) => {
  const aspectIndex = (index - 1) % ASPECTS.length;
  const aspect = ASPECTS[aspectIndex];

  const qText = aspect.question(role, topic);
  const correctOpt = aspect.correctOpt(topic);
  const distractors = aspect.distractors(topic);

  const options = shuffleArray([correctOpt, ...distractors]);

  return {
    questionText: qText,
    options: options,
    correctAnswer: correctOpt,
    explanation: aspect.explanation(role, topic),
    difficulty: difficulty || "medium",
  };
};

// =====================================================
// GET ROLES CONFIGURATION
// =====================================================
const getRolesConfig = async (req, res, next) => {
  try {
    res.json({
      roles: getRoles(),
      roleSkillsMap: ROLE_SKILLS_MAP,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET CUSTOM ROLE SUGGESTIONS
// =====================================================
const getCustomRoleConfig = async (req, res, next) => {
  try {
    const { customRole } = req.body;
    if (!customRole || typeof customRole !== "string") {
      return res.status(400).json({ message: "Custom role name is required" });
    }

    const topics = getSkillsForRole(customRole.trim());
    res.json({
      role: customRole.trim(),
      topics,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// HELPER: CALCULATE TOPIC & DIFFICULTY DISTRIBUTION
// =====================================================
const calculateQuestionDistribution = (topics, maxQuestions = 20) => {
  const targetTotal = Math.min(maxQuestions, topics.length * 5);
  const numTopics = topics.length;

  const basePerTopic = Math.floor(targetTotal / numTopics);
  let remainder = targetTotal % numTopics;

  const distribution = [];
  topics.forEach((topic) => {
    let count = basePerTopic;
    if (remainder > 0) {
      count += 1;
      remainder -= 1;
    }
    count = Math.min(count, 5); // Max 5 per topic
    distribution.push({ topic, count });
  });

  const totalAllocated = distribution.reduce((sum, item) => sum + item.count, 0);
  const easyTarget = Math.round((6 / 20) * totalAllocated);
  const hardTarget = Math.round((4 / 20) * totalAllocated);
  const mediumTarget = totalAllocated - easyTarget - hardTarget;

  return {
    distribution,
    totalAllocated,
    difficultyTargets: {
      easy: Math.max(1, easyTarget),
      medium: Math.max(1, mediumTarget),
      hard: Math.max(1, hardTarget),
    },
  };
};

// =====================================================
// START ASSESSMENT (MCQ + Live Coding)
// =====================================================
const startQuiz = async (req, res, next) => {
  try {
    let { role, customRole, isCustomRole, topics, numberOfQuestions, monitoringEnabled, includeCoding } = req.body;

    // Resolve custom role if provided
    let effectiveRole = role;
    if (role === "Other / Custom Role" || isCustomRole) {
      effectiveRole = (customRole || "").trim() || "Software Developer";
      isCustomRole = true;
    }

    if (!effectiveRole) {
      return res.status(400).json({
        message: "Job role is required",
      });
    }

    // Update student's targetRole in User profile
    if (req.user && req.user.userId) {
      await User.findByIdAndUpdate(req.user.userId, { targetRole: effectiveRole });
    }

    // 1. Validate role and select topics
    const roleValidation = validateRoleAndTopics(effectiveRole, topics);
    if (!roleValidation.isValid) {
      return res.status(400).json({
        message: roleValidation.message || "Invalid role or topics",
      });
    }

    const selectedTopics = roleValidation.validTopics;
    // Cap total questions to maximum 20
    const requestedMax = Math.min(Number(numberOfQuestions) || 20, 20);

    // Reserve 2 slots for Coding Questions if includeCoding !== false (guaranteeing min 2 coding questions)
    const wantsCoding = includeCoding !== false;
    const mcqTargetMax = wantsCoding ? Math.max(1, requestedMax - 2) : requestedMax;

    // 2. Compute question distribution (max 5 per topic)
    const { distribution, totalAllocated, difficultyTargets } =
      calculateQuestionDistribution(selectedTopics, mcqTargetMax);

    console.log(`Starting assessment for Role: "${effectiveRole}"`, {
      topics: selectedTopics,
      totalMCQs: totalAllocated,
      includeCoding: wantsCoding,
      difficultyTargets,
    });

    // 3. Fetch/Generate MCQ questions per topic with strict deduplication
    const createdQuestions = [];
    const usedQuestionTexts = new Set();

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const item of distribution) {
      const topic = item.topic;
      const targetCount = item.count;

      if (targetCount <= 0) continue;

      let topicQuestions = [];

      // Attempt AI Service generation
      try {
        const aiResponse = await generateAIQuiz({
          role: effectiveRole,
          topic,
          topics: selectedTopics,
          difficulty: "mixed",
          numberOfQuestions: targetCount,
        });

        if (aiResponse && Array.isArray(aiResponse.questions)) {
          topicQuestions = aiResponse.questions;
        }
      } catch (err) {
        console.log(`AI service unavailable for topic "${topic}", using fallback repository.`);
      }

      let addedForTopic = 0;

      // Process AI Questions
      for (const rawQ of topicQuestions) {
        if (addedForTopic >= targetCount) break;

        const qText = (rawQ.questionText || rawQ.question || "").trim();
        const cAnswer = (rawQ.correctAnswer || rawQ.answer || "").trim();
        const options = rawQ.options;

        const normText = normalizeText(qText);

        if (
          !normText ||
          !Array.isArray(options) ||
          options.length !== 4 ||
          !cAnswer ||
          !options.map((o) => o.trim()).includes(cAnswer) ||
          usedQuestionTexts.has(normText)
        ) {
          continue;
        }

        let diff = rawQ.difficulty;
        if (!["easy", "medium", "hard"].includes(diff)) {
          if (easyCount < difficultyTargets.easy) diff = "easy";
          else if (hardCount < difficultyTargets.hard) diff = "hard";
          else diff = "medium";
        }

        const qHash = computeQuestionHash(qText);

        const newQ = await Question.create({
          questionType: "mcq",
          questionHash: qHash,
          questionText: qText,
          options: options.map((opt) => opt.trim()),
          correctAnswer: cAnswer,
          explanation: rawQ.explanation || "",
          topic: topic,
          role: effectiveRole,
          difficulty: diff,
        });

        usedQuestionTexts.add(normText);
        createdQuestions.push(newQ);
        addedForTopic++;

        if (diff === "easy") easyCount++;
        else if (diff === "hard") hardCount++;
        else mediumCount++;
      }

      // Fallback repository pool if AI questions were insufficient
      if (addedForTopic < targetCount) {
        const fallbackPool = FALLBACK_QUESTIONS[topic] || [];
        for (const fbQ of fallbackPool) {
          if (addedForTopic >= targetCount) break;

          const normFbText = normalizeText(fbQ.questionText);
          if (usedQuestionTexts.has(normFbText)) continue;

          let diff = fbQ.difficulty || "medium";
          if (easyCount < difficultyTargets.easy) diff = "easy";
          else if (hardCount < difficultyTargets.hard) diff = "hard";

          const qHash = computeQuestionHash(fbQ.questionText);

          const newQ = await Question.create({
            questionType: "mcq",
            questionHash: qHash,
            questionText: fbQ.questionText,
            options: fbQ.options,
            correctAnswer: fbQ.correctAnswer,
            explanation: fbQ.explanation,
            topic: topic,
            role: effectiveRole,
            difficulty: diff,
          });

          usedQuestionTexts.add(normFbText);
          createdQuestions.push(newQ);
          addedForTopic++;

          if (diff === "easy") easyCount++;
          else if (diff === "hard") hardCount++;
          else mediumCount++;
        }
      }

      // Aspect-based unique generic fallback if still under target count
      let fallbackAttempt = 1;
      while (addedForTopic < targetCount && fallbackAttempt <= 10) {
        let diff = "medium";
        if (easyCount < difficultyTargets.easy) diff = "easy";
        else if (hardCount < difficultyTargets.hard) diff = "hard";

        const genericQ = generateGenericFallbackQuestion(
          effectiveRole,
          topic,
          addedForTopic + fallbackAttempt,
          diff
        );

        const normGenText = normalizeText(genericQ.questionText);

        if (!usedQuestionTexts.has(normGenText)) {
          const qHash = computeQuestionHash(genericQ.questionText);

          const newQ = await Question.create({
            questionType: "mcq",
            questionHash: qHash,
            questionText: genericQ.questionText,
            options: genericQ.options,
            correctAnswer: genericQ.correctAnswer,
            explanation: genericQ.explanation,
            topic: topic,
            role: effectiveRole,
            difficulty: genericQ.difficulty,
          });

          usedQuestionTexts.add(normGenText);
          createdQuestions.push(newQ);
          addedForTopic++;

          if (diff === "easy") easyCount++;
          else if (diff === "hard") hardCount++;
          else mediumCount++;
        }

        fallbackAttempt++;
      }
    }

    // 4. Generate AT LEAST 2 Role-specific Coding Questions if requested
    if (wantsCoding) {
      for (let cIdx = 0; cIdx < 2; cIdx++) {
        try {
          const cTopic = selectedTopics[cIdx % selectedTopics.length] || "Coding Challenge";
          const codingData = await generateAICodingQuestion({
            role: effectiveRole,
            topic: cTopic,
            index: cIdx,
            difficulty: cIdx === 0 ? "easy" : "medium",
          });

          const codingQ = await Question.create({
            questionType: "coding",
            questionHash: computeQuestionHash(codingData.title + codingData.problemStatement + cIdx),
            title: codingData.title,
            problemStatement: codingData.problemStatement,
            questionText: codingData.problemStatement,
            inputDescription: codingData.inputDescription || "",
            outputDescription: codingData.outputDescription || "",
            constraints: codingData.constraints || "",
            examples: codingData.examples || [],
            testCases: codingData.testCases || [],
            starterCode: codingData.starterCode || {},
            timeLimit: codingData.timeLimit || 3,
            memoryLimit: codingData.memoryLimit || 128,
            topic: codingData.topic || cTopic,
            role: effectiveRole,
            difficulty: cIdx === 0 ? "easy" : "medium",
            explanation: "Coding solution evaluated via automated test suites.",
          });

          createdQuestions.push(codingQ);
        } catch (err) {
          console.error("Failed to create coding question:", err);
        }
      }
    }

    if (createdQuestions.length === 0) {
      return res.status(500).json({
        message: "Failed to generate assessment questions",
      });
    }

    // 5. Create Quiz session in MongoDB (Duration 1200 seconds = 20 minutes)
    const quiz = await Quiz.create({
      title: `${effectiveRole} Technical Assessment`,
      description: `Skill-specific assessment for ${effectiveRole} covering ${selectedTopics.join(", ")}`,
      role: effectiveRole,
      isCustomRole: Boolean(isCustomRole),
      topic: selectedTopics.join(", "),
      topics: selectedTopics,
      difficulty: "mixed",
      numberOfQuestions: createdQuestions.length,
      questions: createdQuestions.map((q) => q._id),
      user: req.user.userId,
      startTime: new Date(),
      duration: 1200, // 20 minutes
      monitoringEnabled: Boolean(monitoringEnabled),
      status: "in-progress",
      completed: false,
    });

    const populatedQuiz = await Quiz.findById(quiz._id).populate("questions");

    // =================================================
    // CRITICAL SECURITY REQUIREMENT:
    // Omit correctAnswer, explanation, and hidden test cases during active quiz!
    // =================================================
    const sanitizedQuestions = populatedQuiz.questions.map((q) => {
      if (q.questionType === "coding") {
        return {
          _id: q._id,
          questionType: "coding",
          title: q.title,
          problemStatement: q.problemStatement || q.questionText,
          questionText: q.questionText || q.problemStatement,
          inputDescription: q.inputDescription,
          outputDescription: q.outputDescription,
          constraints: q.constraints,
          examples: q.examples,
          // Only reveal public test cases to student during active quiz
          testCases: (q.testCases || []).filter((tc) => !tc.isHidden),
          starterCode: cleanStarterCode(q.starterCode),
          timeLimit: q.timeLimit,
          memoryLimit: q.memoryLimit,
          topic: q.topic,
          difficulty: q.difficulty,
          role: q.role,
        };
      }

      return {
        _id: q._id,
        questionType: "mcq",
        questionText: q.questionText,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty,
        role: q.role,
      };
    });

    res.status(201).json({
      message: "Assessment started successfully",
      quizId: populatedQuiz._id,
      role: populatedQuiz.role,
      isCustomRole: populatedQuiz.isCustomRole,
      topics: populatedQuiz.topics,
      numberOfQuestions: populatedQuiz.numberOfQuestions,
      duration: populatedQuiz.duration,
      startTime: populatedQuiz.startTime,
      monitoringEnabled: populatedQuiz.monitoringEnabled,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("START ASSESSMENT ERROR:", error);
    next(error);
  }
};

// =====================================================
// RUN CODE (Isolated sandbox testing against sample cases)
// =====================================================
const runCode = async (req, res, next) => {
  try {
    const { questionId, code, language, customInput } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Code is required" });
    }

    let testCases = [];
    if (questionId) {
      const q = await Question.findById(questionId);
      if (q && Array.isArray(q.testCases)) {
        testCases = q.testCases.filter((tc) => !tc.isHidden); // Run public sample cases
      }
    }

    if (testCases.length === 0 && customInput === undefined) {
      testCases = [{ input: "2 3", expectedOutput: "5", isHidden: false }];
    }

    const execResult = await runCodeAgainstTestCases({
      code,
      language: language || "javascript",
      testCases,
      customInput: customInput !== undefined && String(customInput).trim().length > 0 ? String(customInput) : undefined,
      timeLimit: 3,
    });

    res.json(execResult);
  } catch (error) {
    console.error("RUN CODE ERROR:", error);
    next(error);
  }
};

// =====================================================
// SUBMIT CODE (Isolated sandbox testing against ALL cases)
// =====================================================
const submitCode = async (req, res, next) => {
  try {
    const { questionId, code, language } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required" });
    }

    const q = await Question.findById(questionId);
    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    const execResult = await runCodeAgainstTestCases({
      code,
      language: language || "javascript",
      testCases: q.testCases || [],
      timeLimit: q.timeLimit || 3,
    });

    res.json(execResult);
  } catch (error) {
    console.error("SUBMIT CODE ERROR:", error);
    next(error);
  }
};

// =====================================================
// GET ONE QUIZ
// =====================================================
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate("questions");

    if (!quiz) {
      return res.status(404).json({
        message: "Assessment not found",
      });
    }

    let returnedQuestions = quiz.questions;
    if (!quiz.completed) {
      returnedQuestions = quiz.questions.map((q) => {
        if (q.questionType === "coding") {
          return {
            _id: q._id,
            questionType: "coding",
            title: q.title,
            problemStatement: q.problemStatement || q.questionText,
            questionText: q.questionText || q.problemStatement,
            inputDescription: q.inputDescription,
            outputDescription: q.outputDescription,
            constraints: q.constraints,
            examples: q.examples,
            testCases: (q.testCases || []).filter((tc) => !tc.isHidden),
            starterCode: cleanStarterCode(q.starterCode),
            timeLimit: q.timeLimit,
            memoryLimit: q.memoryLimit,
            topic: q.topic,
            difficulty: q.difficulty,
            role: q.role,
          };
        }
        return {
          _id: q._id,
          questionType: "mcq",
          questionText: q.questionText,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty,
          role: q.role,
        };
      });
    }

    res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        role: quiz.role,
        isCustomRole: quiz.isCustomRole,
        topic: quiz.topic,
        topics: quiz.topics,
        numberOfQuestions: quiz.numberOfQuestions,
        startTime: quiz.startTime,
        duration: quiz.duration,
        monitoringEnabled: quiz.monitoringEnabled,
        status: quiz.status,
        completed: quiz.completed,
        questions: returnedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ALL QUIZZES
// =====================================================
const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ user: req.user.userId })
      .select("-questions.correctAnswer -questions.explanation")
      .sort({ createdAt: -1 });

    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// SUBMIT ASSESSMENT & COMPUTE ANALYTICS (Idempotent)
// =====================================================
const submitQuiz = async (req, res, next) => {
  try {
    const { answers, monitoringEvents = [] } = req.body;

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate("questions");

    if (!quiz) {
      return res.status(404).json({
        message: "Assessment not found",
      });
    }

    // Idempotent Check: If assessment already completed, return existing Result
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
          monitoringSummary: existingResult.monitoringSummary,
          result: existingResult,
        });
      }
    }

    if (!answers) {
      return res.status(400).json({
        message: "Answers are required for submission",
      });
    }

    // Timer & Expiry Enforcement
    const elapsedSeconds = (Date.now() - new Date(quiz.startTime).getTime()) / 1000;
    const gracePeriodSeconds = 15;
    const isExpired = elapsedSeconds > quiz.duration + gracePeriodSeconds;

    let assessmentStatus = "completed";
    if (isExpired) {
      assessmentStatus = "expired";
      console.log(`Assessment ${quiz._id} submitted after expiry. Elapsed: ${elapsedSeconds}s`);
    }

    // Format answers input
    let answerMap = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans && ans.questionId) {
          answerMap[ans.questionId] = ans;
        }
      });
    } else if (typeof answers === "object" && answers !== null) {
      Object.entries(answers).forEach(([k, v]) => {
        answerMap[k] = v;
      });
    }

    if (Array.isArray(req.body.codingAnswers)) {
      req.body.codingAnswers.forEach((ca) => {
        if (ca && ca.questionId) {
          answerMap[ca.questionId] = ca;
        }
      });
    } else if (typeof req.body.codingAnswers === "object" && req.body.codingAnswers !== null) {
      Object.entries(req.body.codingAnswers).forEach(([k, v]) => {
        answerMap[k] = v;
      });
    }

    // Evaluate assessment answers using central score calculator
    const evaluated = await calculateAssessmentScore({ quiz, answers, answerMap });

    const actualTimeTaken = Math.min(Math.round(elapsedSeconds), quiz.duration);

    // Aggregate Proctoring / Monitoring Summary
    let explicitTabSwitches = req.body.monitoringSummary?.tabSwitches || 0;
    let explicitCameraDisconnections = req.body.monitoringSummary?.cameraDisconnections || 0;
    let explicitFocusLost = req.body.monitoringSummary?.focusLostCount || 0;
    let explicitMultipleFaces = req.body.monitoringSummary?.multipleFacesCount || 0;
    let explicitNoFace = req.body.monitoringSummary?.noFaceCount || 0;

    let eventTabSwitches = 0;
    let eventCameraDisconnections = 0;
    let eventMultipleFaces = 0;
    let eventNoFace = 0;

    const formattedEvents = [];
    if (Array.isArray(monitoringEvents)) {
      monitoringEvents.forEach((ev) => {
        const rawType = (ev.type || ev.eventType || "").toUpperCase();
        if (rawType.includes("TAB") || rawType.includes("BLUR") || rawType.includes("FOCUS") || rawType === "TAB_SWITCH") {
          eventTabSwitches++;
        }
        if (rawType.includes("CAMERA") || rawType.includes("VIDEO")) {
          eventCameraDisconnections++;
        }
        if (rawType.includes("MULTIPLE_FACE") || rawType.includes("MULTIPLE")) {
          eventMultipleFaces++;
        }
        if (rawType.includes("NO_FACE") || rawType.includes("NOT_DETECTED")) {
          eventNoFace++;
        }
        formattedEvents.push({
          type: ev.type || ev.eventType || "EVENT",
          eventType: ev.eventType || ev.type || "EVENT",
          timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
          duration: ev.duration || 0,
          details: ev.details || "",
        });
      });
    }

    const monitoringSummary = {
      tabSwitches: Math.max(explicitTabSwitches, eventTabSwitches),
      focusLostCount: explicitFocusLost,
      cameraDisconnections: Math.max(explicitCameraDisconnections, eventCameraDisconnections),
      multipleFacesCount: Math.max(explicitMultipleFaces, eventMultipleFaces),
      noFaceCount: Math.max(explicitNoFace, eventNoFace),
      integrityStatus: "NO_ISSUES",
      integrityScore: 100,
      flagCount: 0,
    };

    const flagCount = (monitoringSummary.tabSwitches > 0 ? 1 : 0) + (monitoringSummary.cameraDisconnections > 0 ? 1 : 0);
    const integrityStatus = flagCount > 0 ? "REVIEW_REQUIRED" : "NO_ISSUES";
    const integrityScore = Math.max(0, 100 - (monitoringSummary.tabSwitches * 15 + monitoringSummary.focusLostCount * 5 + monitoringSummary.cameraDisconnections * 10));

    monitoringSummary.flagCount = flagCount;
    monitoringSummary.integrityStatus = integrityStatus;
    monitoringSummary.integrityScore = integrityScore;

    // Save quiz status
    quiz.mcqScore = evaluated.mcqScore;
    quiz.codingScore = evaluated.codingScore;
    quiz.overallScore = evaluated.overallScore;
    quiz.score = evaluated.overallScore;
    quiz.percentage = evaluated.percentage;
    quiz.completed = true;
    quiz.endTime = new Date();
    quiz.status = assessmentStatus;
    quiz.answers = evaluated.evaluatedAnswers;
    await quiz.save();

    // Create Result document in MongoDB
    const result = await Result.create({
      user: req.user.userId,
      quiz: quiz._id,
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
      monitoringEvents: formattedEvents.length > 0 ? formattedEvents : (monitoringEvents || []),
      monitoringSummary: monitoringSummary,
    });

    const populatedResult = await Result.findById(result._id)
      .populate("quiz")
      .populate("answers.question");

    res.status(200).json({
      message: "Assessment submitted successfully",
      quizId: quiz._id,
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
      monitoringSummary: monitoringSummary,
      result: populatedResult,
    });
  } catch (error) {
    console.error("SUBMIT ASSESSMENT ERROR:", error);
    next(error);
  }
};

// =====================================================
// DELETE QUIZ
// =====================================================
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Assessment not found",
      });
    }

    await Question.deleteMany({ _id: { $in: quiz.questions } });
    await Result.deleteMany({ quiz: quiz._id });

    res.json({
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRolesConfig,
  getCustomRoleConfig,
  startQuiz,
  createQuiz: startQuiz,
  runCode,
  submitCode,
  getQuiz,
  getQuizzes,
  submitQuiz,
  deleteQuiz,
};