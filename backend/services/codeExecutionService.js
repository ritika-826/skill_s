const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const TEMP_DIR = path.join(os.tmpdir(), "skill_specific_sandbox");

if (!fs.existsSync(TEMP_DIR)) {
  try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create sandbox temp dir:", err);
  }
}

// Find binary paths
const findExecutable = (name, fallback) => {
  // First check known real installation paths
  if (name === "python") {
    const knownPythonPaths = [
      path.resolve(__dirname, "../../ai-service/venv/Scripts/python.exe"),
      "C:\\Users\\reett\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
      "C:\\Users\\reett\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
      "C:\\Python312\\python.exe",
      "C:\\Python311\\python.exe",
      "C:\\Program Files\\Python312\\python.exe",
    ];
    for (const p of knownPythonPaths) {
      if (fs.existsSync(p)) return p;
    }
  }

  try {
    const res = execSync(`where.exe ${name}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const lines = res.trim().split(/\r?\n/);
    for (const line of lines) {
      if (line && !line.includes("WindowsApps") && fs.existsSync(line)) {
        return line;
      }
    }
  } catch (e) {}
  return fallback;
};

const PYTHON_BIN = findExecutable("python", "python");
const NODE_BIN = process.execPath;
const GCC_BIN = findExecutable("gcc", "gcc");
const GPP_BIN = findExecutable("g++", "g++");
const JAVAC_BIN = findExecutable("javac", "javac");
const JAVA_BIN = findExecutable("java", "java");

const normalizeOutput = (str) => {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
};

const executeProcess = (command, args, inputData = "", timeoutMs = 3000, cwd = TEMP_DIR) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = "";
    let stderr = "";
    let killed = false;

    const child = spawn(command, args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      killed = true;
      try {
        child.kill("SIGKILL");
      } catch (e) {}
      resolve({
        stdout,
        stderr: `Execution timed out (exceeded limit of ${timeoutMs}ms)`,
        exitCode: -1,
        timeMs: timeoutMs,
        isTimeout: true,
      });
    }, timeoutMs);

    if (inputData) {
      try {
        child.stdin.write(inputData);
        child.stdin.end();
      } catch (e) {}
    } else {
      try {
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      if (stdout.length > 100000) {
        killed = true;
        child.kill();
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (killed) return;
      const timeMs = Date.now() - startTime;
      resolve({
        stdout,
        stderr,
        exitCode: code,
        timeMs,
        isTimeout: false,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: err.message || "Process execution error",
        exitCode: 1,
        timeMs: Date.now() - startTime,
        isTimeout: false,
      });
    });
  });
};

const runCodeAgainstTestCases = async ({
  code,
  language = "javascript",
  testCases = [],
  customInput = undefined,
  timeLimit = 3,
}) => {
  const normalizedLang = (language || "javascript").toLowerCase();
  const timeoutMs = Math.max(1000, Math.min(6000, (timeLimit || 3) * 1000));

  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      success: false,
      output: "",
      error: "No code provided for execution",
      results: [],
      testResults: [],
      score: 0,
      passedCount: 0,
      totalCount: testCases.length,
      executionStatus: "No Code",
    };
  }

  // If customInput is provided, treat it as a single execution test case
  const effectiveTestCases = customInput !== undefined
    ? [{ input: customInput, expectedOutput: "", isHidden: false, isCustom: true }]
    : testCases.length > 0
    ? testCases
    : [{ input: "", expectedOutput: "", isHidden: false }];

  const runId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const runDir = path.join(TEMP_DIR, runId);

  try {
    fs.mkdirSync(runDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create run directory:", err);
  }

  const cleanup = () => {
    try {
      if (fs.existsSync(runDir)) {
        fs.rmSync(runDir, { recursive: true, force: true });
      }
    } catch (e) {}
  };

  let runnerCmd = "";
  let runnerArgs = [];

  try {
    // 1. Prepare & Compile if needed
    if (normalizedLang === "python" || normalizedLang === "py") {
      const pyFile = path.join(runDir, "solution.py");
      fs.writeFileSync(pyFile, code, "utf8");
      runnerCmd = PYTHON_BIN;
      runnerArgs = [pyFile];
    } else if (normalizedLang === "c") {
      const cFile = path.join(runDir, "solution.c");
      const exeFile = path.join(runDir, "solution.exe");
      fs.writeFileSync(cFile, code, "utf8");

      // Compile with GCC
      const compileRes = await executeProcess(GCC_BIN, [cFile, "-o", exeFile], "", 5000, runDir);
      if (compileRes.exitCode !== 0) {
        cleanup();
        return {
          success: false,
          output: "",
          error: `Compilation Error:\n${compileRes.stderr || compileRes.stdout}`,
          results: [],
          testResults: [],
          score: 0,
          passedCount: 0,
          totalCount: effectiveTestCases.length,
          executionStatus: "Compilation Error",
        };
      }
      runnerCmd = exeFile;
      runnerArgs = [];
    } else if (normalizedLang === "cpp" || normalizedLang === "c++") {
      const cppFile = path.join(runDir, "solution.cpp");
      const exeFile = path.join(runDir, "solution.exe");
      fs.writeFileSync(cppFile, code, "utf8");

      // Compile with G++
      const compileRes = await executeProcess(GPP_BIN, [cppFile, "-o", exeFile], "", 5000, runDir);
      if (compileRes.exitCode !== 0) {
        cleanup();
        return {
          success: false,
          output: "",
          error: `Compilation Error:\n${compileRes.stderr || compileRes.stdout}`,
          results: [],
          testResults: [],
          score: 0,
          passedCount: 0,
          totalCount: effectiveTestCases.length,
          executionStatus: "Compilation Error",
        };
      }
      runnerCmd = exeFile;
      runnerArgs = [];
    } else if (normalizedLang === "java") {
      // Ensure class name matches Main or wrap
      let javaCode = code;
      if (!javaCode.includes("class Main") && !javaCode.includes("public class Main")) {
        javaCode = `import java.util.*;\nimport java.io.*;\npublic class Main {\n${javaCode}\n}`;
      }
      const javaFile = path.join(runDir, "Main.java");
      fs.writeFileSync(javaFile, javaCode, "utf8");

      // Compile with javac
      const compileRes = await executeProcess(JAVAC_BIN, ["Main.java"], "", 6000, runDir);
      if (compileRes.exitCode !== 0) {
        cleanup();
        return {
          success: false,
          output: "",
          error: `Compilation Error:\n${compileRes.stderr || compileRes.stdout}`,
          results: [],
          testResults: [],
          score: 0,
          passedCount: 0,
          totalCount: effectiveTestCases.length,
          executionStatus: "Compilation Error",
        };
      }
      runnerCmd = JAVA_BIN;
      runnerArgs = ["-cp", runDir, "Main"];
    } else {
      // JavaScript (Node.js)
      const jsFile = path.join(runDir, "solution.js");
      fs.writeFileSync(jsFile, code, "utf8");
      runnerCmd = NODE_BIN;
      runnerArgs = [jsFile];
    }

    // 2. Execute against test cases
    const testResults = [];
    let passedCount = 0;
    let firstStdout = "";
    let firstStderr = "";

    for (let i = 0; i < effectiveTestCases.length; i++) {
      const tc = effectiveTestCases[i];
      const inputStr = tc.input !== undefined ? String(tc.input) : "";
      const expectedStr = normalizeOutput(tc.expectedOutput);

      const execResult = await executeProcess(runnerCmd, runnerArgs, inputStr, timeoutMs, runDir);

      if (i === 0) {
        firstStdout = execResult.stdout || "";
        firstStderr = execResult.stderr || "";
      }

      const actualOutput = normalizeOutput(execResult.stdout);
      const isCustom = Boolean(tc.isCustom);
      const isPassed =
        isCustom ||
        (!execResult.isTimeout &&
          execResult.exitCode === 0 &&
          actualOutput === expectedStr);

      if (isPassed && !isCustom) {
        passedCount++;
      }

      testResults.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
        expectedOutput: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
        actualOutput: tc.isHidden && !isPassed ? "[Hidden - Failed]" : actualOutput,
        passed: isPassed,
        isTimeout: execResult.isTimeout,
        timeMs: execResult.timeMs,
        stderr: execResult.stderr ? execResult.stderr.substring(0, 500) : "",
        isHidden: Boolean(tc.isHidden),
        isCustom,
      });
    }

    cleanup();

    const totalCount = customInput !== undefined ? 1 : effectiveTestCases.length;
    const score = totalCount === 0 ? 0 : Math.round((passedCount / totalCount) * 100);

    const overallOutput = firstStdout.trim() || (testResults[0]?.actualOutput || "");
    const overallError = firstStderr.trim() || null;

    let executionStatus = "Failed";
    if (customInput !== undefined) {
      executionStatus = "Executed";
    } else if (passedCount === totalCount && totalCount > 0) {
      executionStatus = "All Passed";
    } else if (passedCount > 0) {
      executionStatus = "Partially Passed";
    } else {
      const errStr = overallError || "";
      if (errStr.includes("SyntaxError") || errStr.includes("syntax error")) {
        executionStatus = "Syntax Error";
      } else if (errStr.includes("timed out") || testResults.some((t) => t.isTimeout)) {
        executionStatus = "Time Limit Exceeded";
      } else if (errStr.length > 0) {
        executionStatus = "Runtime Error";
      } else {
        executionStatus = "Failed";
      }
    }

    return {
      success: overallError ? false : true,
      output: overallOutput,
      error: overallError,
      score,
      percentage: score,
      passedCount,
      totalCount,
      results: testResults,
      testResults,
      executionStatus,
    };
  } catch (err) {
    cleanup();
    return {
      success: false,
      output: "",
      error: err.message || "Execution exception",
      results: [],
      testResults: [],
      score: 0,
      passedCount: 0,
      totalCount: effectiveTestCases.length,
      executionStatus: "Execution Error",
    };
  }
};

module.exports = {
  runCodeAgainstTestCases,
};