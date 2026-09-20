// =====================================================
// SKILL SPECIFIC CENTRALIZED ROLE-TO-SKILL CONFIGURATION
// =====================================================

const ROLE_SKILLS_MAP = {
  "Backend Developer": [
    "Node.js",
    "Express.js",
    "REST APIs",
    "Databases",
    "MongoDB",
    "SQL",
    "Authentication",
    "System Design",
    "Caching & Redis",
    "Backend Security",
  ],
  "Frontend Developer": [
    "HTML5",
    "CSS3",
    "JavaScript",
    "React",
    "DOM Manipulation",
    "Web APIs",
    "Responsive Design",
    "Web Performance",
    "Accessibility",
    "State Management",
  ],
  "Full Stack Developer": [
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "REST APIs",
    "MongoDB",
    "SQL",
    "Authentication",
    "Git",
    "Full Stack Architecture",
  ],
  "DevOps Engineer": [
    "Linux",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Jenkins",
    "GitHub Actions",
    "AWS",
    "Networking",
    "Terraform",
    "Monitoring & Observability",
  ],
  "Cloud Engineer": [
    "AWS",
    "Azure",
    "GCP",
    "Linux",
    "Cloud Architecture",
    "IAM",
    "Networking & VPC",
    "Containers",
    "Serverless",
    "Cloud Security",
  ],
  "Data Analyst": [
    "SQL",
    "Excel",
    "Python",
    "Pandas",
    "Statistics",
    "Data Visualization",
    "Power BI",
    "Tableau",
    "Data Cleaning",
    "Reporting",
  ],
  "Data Scientist": [
    "Python",
    "Statistics",
    "Machine Learning",
    "Data Visualization",
    "Pandas & NumPy",
    "SQL",
    "Data Preprocessing",
    "Feature Engineering",
    "Model Evaluation",
    "Deep Learning",
  ],
  "Machine Learning Engineer": [
    "Python",
    "NumPy & Pandas",
    "Statistics",
    "Machine Learning Algorithms",
    "Scikit-learn",
    "Deep Learning (PyTorch/TensorFlow)",
    "Model Evaluation",
    "Feature Engineering",
    "MLOps",
    "Model Deployment",
  ],
  "AI Engineer": [
    "Generative AI",
    "LLM Architecture",
    "Prompt Engineering",
    "RAG & Embeddings",
    "Vector Databases",
    "Fine-Tuning",
    "LangChain / LlamaIndex",
    "Python",
    "AI Safety & Ethics",
    "Model Evaluation",
  ],
  "QA Engineer": [
    "Software Testing Fundamentals",
    "Test Planning & Test Cases",
    "Manual Testing",
    "Bug Tracking & JIRA",
    "API Testing (Postman)",
    "Performance Testing",
    "Regression Testing",
    "SDLC & STLC",
    "Quality Metrics",
  ],
  "Automation Test Engineer": [
    "Selenium / Playwright",
    "Test Automation Frameworks",
    "JavaScript / Python for QA",
    "API Automation",
    "CI/CD Test Integration",
    "BDD / Cucumber",
    "Locators & Web Elements",
    "Cross-browser Testing",
    "Continuous Testing",
  ],
  "Cybersecurity Engineer": [
    "Networking Protocols",
    "Cryptography",
    "Network Security",
    "Vulnerability Assessment",
    "IAM & Access Control",
    "Incident Response",
    "Firewalls & IDS/IPS",
    "Security Auditing",
    "Linux Security",
    "Penetration Testing Basics",
  ],
  "Software Engineer": [
    "Data Structures",
    "Algorithms",
    "OOP Principles",
    "Software Design Patterns",
    "Version Control (Git)",
    "Unit Testing",
    "Code Optimization",
    "Databases",
    "Operating Systems",
    "Networking",
  ],
  "Mobile App Developer": [
    "Mobile App Architecture",
    "React Native / Flutter",
    "Mobile UI/UX",
    "State Management",
    "REST APIs & Networking",
    "Local Storage & SQLite",
    "App Lifecycle",
    "Push Notifications",
    "Performance Optimization",
  ],
  "Android Developer": [
    "Kotlin",
    "Java for Android",
    "Android SDK & Lifecycle",
    "Jetpack Compose / XML Layouts",
    "Coroutines & Flow",
    "Room Database",
    "Retrofit & REST APIs",
    "Android Architecture (MVVM)",
  ],
  "iOS Developer": [
    "Swift",
    "SwiftUI",
    "UIKit",
    "iOS App Lifecycle",
    "Core Data",
    "Combine & Concurrency",
    "URLSession & Networking",
    "iOS Architecture (MVVM/VIPER)",
  ],
  "Database Administrator": [
    "SQL Query Optimization",
    "Database Architecture",
    "Indexing Strategies",
    "Backup & Disaster Recovery",
    "Database Security",
    "Replication & Clustering",
    "Transactions & ACID",
    "PostgreSQL",
    "MySQL",
    "MongoDB Administration",
  ],
  "Site Reliability Engineer": [
    "Linux Systems Internals",
    "Kubernetes & Orchestration",
    "SLI / SLO / SLA Management",
    "Incident Management & Postmortems",
    "Observability (Prometheus/Grafana)",
    "Distributed Tracing",
    "Automation & Scripting",
    "Infrastructure as Code",
    "Capacity Planning",
  ],
  "Network Engineer": [
    "TCP/IP & OSI Model",
    "Subnetting & Routing",
    "VLANs & Switching",
    "Firewalls & VPNs",
    "DNS & DHCP",
    "BGP & OSPF",
    "Network Troubleshooting",
    "Network Monitoring",
    "SDN & Network Automation",
  ],
  "System Administrator": [
    "Linux Administration",
    "Windows Server & Active Directory",
    "User & Permission Management",
    "Shell Scripting (Bash/PowerShell)",
    "Backup & Restore Procedures",
    "System Monitoring & Logs",
    "Package Management",
    "Storage & LVM",
    "Virtualization",
  ],
  "UI/UX Developer": [
    "Modern CSS & Flexbox/Grid",
    "HTML Semantics",
    "Design Systems & Component Libraries",
    "Responsive & Mobile-First Design",
    "Micro-Interactions & CSS Animations",
    "Web Accessibility (WCAG)",
    "UI Prototyping & Figma to Code",
    "User Centric Performance",
  ],
  "Product Manager": [
    "Product Lifecycle Management",
    "User Stories & Requirements",
    "Agile & Scrum Methodologies",
    "Product Analytics & Metrics (KPIs)",
    "A/B Testing & Experimentation",
    "Roadmap Prioritization",
    "User Research & Feedback Loops",
    "Competitive Analysis",
    "Go-To-Market Strategy",
  ],
};

/**
 * Get list of predefined roles
 */
const getRoles = () => {
  return Object.keys(ROLE_SKILLS_MAP);
};

/**
 * Get list of skills for a given role (predefined or custom)
 */
const getSkillsForRole = (role) => {
  if (!role) return [];
  if (ROLE_SKILLS_MAP[role]) {
    return ROLE_SKILLS_MAP[role];
  }
  // Generate intelligent default topics for custom roles
  return generateCustomRoleTopics(role);
};

/**
 * Generate intelligent default skill topics for any custom role
 * e.g. "Cloud Developer", "Blockchain Developer", "MLOps Engineer", "Prompt Engineer"
 */
const generateCustomRoleTopics = (customRole) => {
  if (!customRole || typeof customRole !== "string") {
    return ["Core Principles", "Architecture", "Best Practices", "Troubleshooting", "Security"];
  }

  const roleLower = customRole.toLowerCase();

  if (roleLower.includes("blockchain") || roleLower.includes("web3")) {
    return [
      "Smart Contracts & Solidity",
      "Ethereum & EVM",
      "Consensus Mechanisms",
      "Cryptography & Wallets",
      "DeFi Architecture",
      "Web3.js / Ethers.js",
      "Smart Contract Security",
      "Gas Optimization",
    ];
  }

  if (roleLower.includes("mlops")) {
    return [
      "Model Versioning (DVC/MLflow)",
      "Continuous Training & Pipelines",
      "Feature Stores",
      "Model Monitoring & Drift Detection",
      "Containerization & Docker",
      "Kubernetes & Kubeflow",
      "Model Serving (TorchServe/Triton)",
      "Automated Testing for ML",
    ];
  }

  if (roleLower.includes("prompt")) {
    return [
      "Zero-Shot & Few-Shot Prompting",
      "Chain-of-Thought Prompting",
      "System Instructions & Personas",
      "Output Formatting (JSON/Structured)",
      "Prompt Security & Jailbreak Defense",
      "Context Window Optimization",
      "RAG Query Formulation",
      "Model Evaluation Metrics",
    ];
  }

  if (roleLower.includes("embedded") || roleLower.includes("iot")) {
    return [
      "C / C++ for Embedded",
      "Microcontrollers (ARM/ESP32)",
      "RTOS Fundamentals",
      "Communication Protocols (I2C/SPI/UART)",
      "Memory Management & Constraints",
      "Hardware Debugging (JTAG/GDB)",
      "Power Optimization",
      "Sensors & Actuators",
    ];
  }

  if (roleLower.includes("game")) {
    return [
      "Game Engine (Unity/Unreal)",
      "C# / C++ for Games",
      "Game Physics & Collisions",
      "Graphics & Shaders",
      "Game State Management",
      "Audio & Asset Pipelines",
      "Performance & Framerate Optimization",
      "Multiplayer Networking",
    ];
  }

  if (roleLower.includes("cloud")) {
    return [
      "Cloud Architecture & Design",
      "AWS / Azure / GCP Services",
      "Serverless & Microservices",
      "Containers (Docker & Kubernetes)",
      "Infrastructure as Code (Terraform)",
      "Cloud Security & IAM",
      "Cloud Networking & VPCs",
      "CI/CD in Cloud",
    ];
  }

  if (roleLower.includes("salesforce")) {
    return [
      "Apex Programming",
      "Lightning Web Components (LWC)",
      "SOQL & SOSL Queries",
      "Salesforce Data Modeling",
      "Process Automation & Flows",
      "REST & SOAP Integrations",
      "Salesforce Security & Sharing",
      "Deployment & Change Sets",
    ];
  }

  if (roleLower.includes("security") || roleLower.includes("devsecops")) {
    return [
      "Secure SDLC & DevSecOps",
      "Vulnerability Scanning (SAST/DAST)",
      "Container & Cloud Security",
      "Identity & Access Management (IAM)",
      "Threat Modeling & OWASP Top 10",
      "Secrets Management (Vault)",
      "Compliance & Policy as Code",
      "Incident Response & Forensics",
    ];
  }

  if (roleLower.includes("qa") || roleLower.includes("test")) {
    return [
      "Test Planning & Strategies",
      "API Testing (Postman/RestAssured)",
      "UI Automation (Selenium/Playwright)",
      "Performance & Load Testing",
      "CI/CD Test Automation",
      "Bug Tracking & Quality Metrics",
      "Security & Penetration Testing",
      "BDD / Cucumber Frameworks",
    ];
  }

  if (roleLower.includes("ai") || roleLower.includes("data")) {
    return [
      "Machine Learning & Deep Learning",
      "Python Data Pipelines",
      "LLMs & Generative AI",
      "Feature Engineering & ETL",
      "Model Evaluation & Testing",
      "Vector Databases & Embeddings",
      "AI Safety & Governance",
      "API Integration for AI",
    ];
  }

  // General custom role fallback generator
  const cleanRole = customRole.trim();
  return [
    `${cleanRole} Core Architecture`,
    `${cleanRole} Tools & Frameworks`,
    "API & System Integration",
    "Performance Optimization",
    "Security & Best Practices",
    "Testing & Quality Assurance",
    "Troubleshooting & Debugging",
  ];
};

/**
 * Validate role and selected topics with full support for custom roles
 */
const validateRoleAndTopics = (role, topics = []) => {
  if (!role || typeof role !== "string" || !role.trim()) {
    return {
      isValid: false,
      message: "Job role is required",
      validTopics: [],
    };
  }

  const cleanRole = role.trim();
  const availableSkills = getSkillsForRole(cleanRole);

  // If no topics specified, use all generated/predefined topics
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    return {
      isValid: true,
      role: cleanRole,
      isCustomRole: !ROLE_SKILLS_MAP[cleanRole],
      validTopics: availableSkills.slice(0, 5),
    };
  }

  // Filter topics or accept custom topics
  const validTopics = topics.filter((t) => typeof t === "string" && t.trim().length > 0);

  return {
    isValid: validTopics.length > 0,
    role: cleanRole,
    isCustomRole: !ROLE_SKILLS_MAP[cleanRole],
    validTopics: validTopics.length > 0 ? validTopics : availableSkills.slice(0, 5),
  };
};

module.exports = {
  ROLE_SKILLS_MAP,
  getRoles,
  getSkillsForRole,
  generateCustomRoleTopics,
  validateRoleAndTopics,
};
