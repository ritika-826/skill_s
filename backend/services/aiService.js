const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// =====================================================
// 1. GENERATE MCQ QUESTIONS VIA AI SERVICE
// =====================================================
const generateAIQuiz = async ({
  role,
  topic,
  topics,
  difficulty,
  numberOfQuestions,
}) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/generate`,
      {
        role,
        topic,
        topics,
        difficulty,
        numberOfQuestions,
      },
      {
        timeout: 4000, // 4-second fast timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI SERVICE NOTICE (using MCQ fallback repository):",
      error.response?.data || error.message
    );
    return { questions: [] };
  }
};

// =====================================================
// 2. ROLE-SPECIFIC CODING QUESTIONS CATALOG
// =====================================================
const ROLE_CODING_CATALOG = {
  "DevOps Engineer": {
    title: "Parse Nginx HTTP Status Codes",
    topic: "Linux & Log Parsing",
    problemStatement: `You are monitoring production Nginx servers. Write a program that reads a list of HTTP log entries from standard input and counts the occurrences of 4xx and 5xx status codes.
Output the count of 4xx and 5xx errors separated by a space.

Format:
Input: Space or newline separated list of HTTP status code integers (e.g., 200 404 500 200 502 403)
Output: "<4xx_count> <5xx_count>"`,
    inputDescription: "A space-separated string of HTTP status codes.",
    outputDescription: "Two integers separated by a single space: total 4xx errors and total 5xx errors.",
    constraints: "1 <= number of status codes <= 1000. Codes are between 100 and 599.",
    examples: [
      {
        input: "200 404 500 200 502 403 201",
        output: "2 2",
        explanation: "404 and 403 are 4xx errors (2). 500 and 502 are 5xx errors (2).",
      },
    ],
    testCases: [
      { input: "200 404 500 200 502 403 201", expectedOutput: "2 2", isHidden: false },
      { input: "200 200 201 301 302", expectedOutput: "0 0", isHidden: false },
      { input: "500 501 502 503 504", expectedOutput: "0 5", isHidden: true },
      { input: "400 401 403 404 429 500", expectedOutput: "5 1", isHidden: true },
    ],
    starterCode: {
      javascript: `// Read input from standard input (stdin)
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

// Write your solution here
`,
      python: `import sys

input_text = sys.stdin.read().strip()
# Write your solution here
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}
`,
    },
  },
  "Backend Developer": {
    title: "Parse & Validate API Query Parameters",
    topic: "REST APIs & Data Processing",
    problemStatement: `Implement a query string key-value parser. Given a raw URL query string (e.g., "name=Rahul&role=admin&limit=10"), parse each key-value pair and output the keys and values sorted alphabetically by key.

Format:
Input: A standard URL query string.
Output: Lines of "key=value" sorted alphabetically by key.`,
    inputDescription: "A single URL query string without the leading '?'.",
    outputDescription: "Alphabetically sorted key=value pairs, one per line.",
    constraints: "Query string contains between 1 and 20 parameters.",
    examples: [
      {
        input: "role=admin&name=Rahul&limit=10",
        output: "limit=10\nname=Rahul\nrole=admin",
        explanation: "Sorted alphabetically: limit, name, role.",
      },
    ],
    testCases: [
      { input: "role=admin&name=Rahul&limit=10", expectedOutput: "limit=10\nname=Rahul\nrole=admin", isHidden: false },
      { input: "page=2&filter=active", expectedOutput: "filter=active\npage=2", isHidden: false },
      { input: "z=last&a=first&m=middle", expectedOutput: "a=first\nm=middle\nz=last", isHidden: true },
      { input: "single=value", expectedOutput: "single=value", isHidden: true },
    ],
    starterCode: {
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

if (input) {
  // Write your solution here
  
}
`,
      python: `import sys

query = sys.stdin.read().strip()
if query:
    # Write your solution here
    pass
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}
`,
    },
  },
  "Frontend Developer": {
    title: "Format Pagination Page Numbers",
    topic: "UI Logic & Data Manipulation",
    problemStatement: `Write a helper for a UI pagination component. Given total pages $N$ and current active page $P$, output an array of visible page numbers with a window of 2 pages around the current page, bounded by 1 and $N$.

Format:
Input: "totalPages currentPage" (e.g., "10 5")
Output: Space-separated list of visible page numbers.`,
    inputDescription: "Two integers: totalPages and currentPage.",
    outputDescription: "Space separated page numbers.",
    constraints: "1 <= currentPage <= totalPages <= 1000",
    examples: [
      {
        input: "10 5",
        output: "3 4 5 6 7",
        explanation: "Window of 2 around page 5 gives [3, 4, 5, 6, 7].",
      },
    ],
    testCases: [
      { input: "10 5", expectedOutput: "3 4 5 6 7", isHidden: false },
      { input: "5 1", expectedOutput: "1 2 3", isHidden: false },
      { input: "8 8", expectedOutput: "6 7 8", isHidden: true },
      { input: "3 2", expectedOutput: "1 2 3", isHidden: true },
    ],
    starterCode: {
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

if (input) {
  // Write your solution here
  
}
`,
      python: `import sys

data = sys.stdin.read().strip()
if data:
    # Write your solution here
    pass
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}
`,
    },
  },
};

// =====================================================
// 3. GENERATE CODING QUESTION VIA AI / FALLBACK
// =====================================================
const generateAICodingQuestion = async ({ role, topic, difficulty }) => {
  // If in catalog, return tailored problem
  if (ROLE_CODING_CATALOG[role]) {
    return ROLE_CODING_CATALOG[role];
  }

  // Generic intelligent coding problem for any custom or specialized role
  const cleanRole = role || "Software Engineer";
  return {
    title: `${cleanRole} Data Processing Task`,
    topic: topic || "Algorithmic Logic",
    problemStatement: `As a ${cleanRole}, write a program that takes a list of numbers from standard input, filters out all duplicate numbers, sorts the unique numbers in ascending order, and outputs the result as a space-separated string.

Format:
Input: A space-separated list of integers.
Output: A space-separated list of unique sorted integers.`,
    inputDescription: "A space-separated string of integers.",
    outputDescription: "Unique sorted integers separated by a single space.",
    constraints: "1 <= numbers count <= 1000",
    examples: [
      {
        input: "4 2 5 2 3 4 1",
        output: "1 2 3 4 5",
        explanation: "Unique elements are 1, 2, 3, 4, 5 in ascending order.",
      },
    ],
    testCases: [
      { input: "4 2 5 2 3 4 1", expectedOutput: "1 2 3 4 5", isHidden: false },
      { input: "10 20 10 30", expectedOutput: "10 20 30", isHidden: false },
      { input: "9 8 7 6 5 4 3 2 1", expectedOutput: "1 2 3 4 5 6 7 8 9", isHidden: true },
      { input: "100", expectedOutput: "100", isHidden: true },
    ],
    starterCode: {
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

if (input) {
  // Write your solution here
  
}
`,
      python: `import sys

data = sys.stdin.read().strip()
if data:
    # Write your solution here
    pass
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}
`,
    },
  };
};

module.exports = {
  generateAIQuiz,
  generateAICodingQuestion,
};