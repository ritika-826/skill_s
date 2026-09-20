const { validateRoleAndTopics } = require("./config/roleSkills");
const quizController = require("./controllers/quizController");

// Mock deduplication check function simulation
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
};

console.log("=== TESTING QUESTION DEDUPLICATION AND REBRANDING ===");

const role = "DevOps Engineer";
const topics = ["Docker", "Kubernetes", "Jenkins", "AWS"];

const validation = validateRoleAndTopics(role, topics);
console.log("1. Validation:", validation.isValid ? "PASSED" : "FAILED");

console.log("2. Testing Alphanumeric Normalization:");
const testQ1 = "Which Docker command lists running containers?";
const testQ2 = "which docker command lists running containers ?";
const testQ3 = "WHICH DOCKER COMMAND LISTS RUNNING CONTAINERS!!!";

const norm1 = normalizeText(testQ1);
const norm2 = normalizeText(testQ2);
const norm3 = normalizeText(testQ3);

console.log("Norm 1:", norm1);
console.log("Norm 2:", norm2);
console.log("Norm 3:", norm3);
console.log("Deduplication Match:", (norm1 === norm2 && norm2 === norm3) ? "PASSED ✅" : "FAILED ❌");

console.log("=== DEDUPLICATION TEST COMPLETE ===");
