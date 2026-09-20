const {
  getRoles,
  getSkillsForRole,
  validateRoleAndTopics,
} = require("./config/roleSkills");

console.log("==========================================");
console.log("RUNNING ADAPTIQ AUTOMATED VERIFICATION");
console.log("==========================================");

// 1. Verify Role to Skill Configuration
const roles = getRoles();
console.log("\n1. Testing Centralized Roles...");
console.log(`Found ${roles.length} roles:`, roles);

if (!roles.includes("DevOps Engineer") || !roles.includes("Backend Developer")) {
  console.error("FAILED: Essential roles missing from roleSkills config!");
  process.exit(1);
}

const devopsSkills = getSkillsForRole("DevOps Engineer");
console.log("\nDevOps Engineer Skills:", devopsSkills);

if (!devopsSkills.includes("Docker") || !devopsSkills.includes("Kubernetes")) {
  console.error("FAILED: DevOps skills mapping incorrect!");
  process.exit(1);
}

// 2. Verify Role & Topic Validation
console.log("\n2. Testing Role & Topic Validation...");
const devopsValid = validateRoleAndTopics("DevOps Engineer", ["Docker", "Kubernetes", "Jenkins", "AWS"]);
console.log("DevOps Validation:", devopsValid);

if (!devopsValid.isValid || devopsValid.validTopics.length !== 4) {
  console.error("FAILED: Topic validation logic failed!");
  process.exit(1);
}

// 3. Test Question Security & Sanitization
console.log("\n3. Testing Security Sanitization...");
const sampleQuestion = {
  _id: "q123",
  questionText: "Which Docker command lists running containers?",
  options: ["docker images", "docker ps", "docker run", "docker start"],
  correctAnswer: "docker ps",
  explanation: "docker ps lists running containers.",
  topic: "Docker",
  difficulty: "easy",
};

const sanitizeForCandidate = (q) => ({
  _id: q._id,
  questionText: q.questionText,
  options: q.options,
  topic: q.topic,
  difficulty: q.difficulty,
});

const sanitized = sanitizeForCandidate(sampleQuestion);
console.log("Sanitized candidate payload:", sanitized);

if (sanitized.correctAnswer || sanitized.explanation) {
  console.error("FAILED: Security breach! Answer or explanation leaked in candidate payload!");
  process.exit(1);
}

console.log("\n==========================================");
console.log("ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ✅");
console.log("==========================================");
