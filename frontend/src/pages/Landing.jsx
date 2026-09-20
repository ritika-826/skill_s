import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const featuredRoles = [
    {
      title: "DevOps Engineer",
      skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Linux"],
      icon: "⚙️",
    },
    {
      title: "Backend Developer",
      skills: ["Node.js", "Express", "REST APIs", "SQL", "System Design"],
      icon: "💻",
    },
    {
      title: "Frontend Developer",
      skills: ["React", "JavaScript", "HTML/CSS", "DOM", "Performance"],
      icon: "🎨",
    },
    {
      title: "Data Analyst",
      skills: ["SQL", "Python", "Pandas", "Statistics", "Power BI"],
      icon: "📊",
    },
    {
      title: "Machine Learning Engineer",
      skills: ["Python", "NumPy", "Scikit-learn", "ML", "Model Evaluation"],
      icon: "🤖",
    },
    {
      title: "Cloud Engineer",
      skills: ["AWS", "Linux", "Networking", "IAM", "Containers"],
      icon: "☁️",
    },
  ];

  return (
    <div style={styles.landingWrapper}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          {/* Hero Left Content */}
          <div style={styles.heroLeft}>
            <div style={styles.badge}>
              <span>✨ Skill Specific Assessments</span>
            </div>
            <h1 style={styles.heroTitle}>
              AI-Powered <span style={styles.titleGradient}>Skill Specific</span> Assessments
            </h1>
            <p style={styles.heroSubtitle}>
              Test the skills that actually matter for your target role. Prepare for real-world technical roles with role-specific assessments powered by AI.
            </p>
            <div style={styles.heroBtnGroup}>
              <button
                onClick={() => navigate("/quiz-setup")}
                style={styles.primaryHeroBtn}
              >
                Start Assessment →
              </button>
              <a href="#roles" style={styles.secondaryHeroBtn}>
                Explore Roles
              </a>
            </div>
          </div>

          {/* Hero Right: CSS Dashboard Preview Illustration */}
          <div style={styles.heroRight}>
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <span style={styles.previewDotRed} />
                <span style={styles.previewDotYellow} />
                <span style={styles.previewDotGreen} />
                <span style={styles.previewTitle}>Skill Specific Assessment Dashboard</span>
              </div>
              <div style={styles.previewBody}>
                <div style={styles.previewMetaRow}>
                  <div>
                    <span style={styles.previewLabel}>ROLE</span>
                    <h4 style={styles.previewValue}>DevOps Engineer</h4>
                  </div>
                  <div style={styles.previewScoreBox}>
                    <span style={styles.previewScoreLabel}>OVERALL SCORE</span>
                    <span style={styles.previewScoreValue}>85%</span>
                  </div>
                </div>

                <div style={styles.previewSkillsBox}>
                  <span style={styles.previewLabel}>ASSESSMENT TOPICS</span>
                  <div style={styles.previewChips}>
                    <span style={styles.previewChip}>Docker</span>
                    <span style={styles.previewChip}>Kubernetes</span>
                    <span style={styles.previewChip}>AWS</span>
                    <span style={styles.previewChip}>Jenkins</span>
                  </div>
                </div>

                <div style={styles.previewStatsRow}>
                  <div>
                    <span style={styles.previewLabel}>QUESTIONS</span>
                    <strong style={{ color: "#f8fafc" }}>20 Max</strong>
                  </div>
                  <div>
                    <span style={styles.previewLabel}>TIMER</span>
                    <strong style={{ color: "#38bdf8" }}>20 min</strong>
                  </div>
                </div>

                <div style={styles.previewProgressTrack}>
                  <div style={styles.previewProgressFill} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Trust & Value Cards */}
      <section style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Assess the Skills That Matter for Your Role</h2>
            <p style={styles.sectionSubtitle}>
              Built to simulate rigorous technical evaluations used by top engineering teams.
            </p>
          </div>

          <div style={styles.cardsGrid4}>
            <div style={styles.valueCard}>
              <div style={styles.valueIcon}>🎯</div>
              <h3 style={styles.valueTitle}>Role-Based Assessments</h3>
              <p style={styles.valueDesc}>
                Targeted questions strictly mapped to the exact technologies required for your job role.
              </p>
            </div>

            <div style={styles.valueCard}>
              <div style={styles.valueIcon}>🧠</div>
              <h3 style={styles.valueTitle}>AI Generated Questions</h3>
              <p style={styles.valueDesc}>
                Dynamic question generation ensuring realistic, context-aware technical multiple-choice items.
              </p>
            </div>

            <div style={styles.valueCard}>
              <div style={styles.valueIcon}>📚</div>
              <h3 style={styles.valueTitle}>RAG-Powered Learning</h3>
              <p style={styles.valueDesc}>
                Retrieval-Augmented Generation indexes technical documentation to verify question accuracy.
              </p>
            </div>

            <div style={styles.valueCard}>
              <div style={styles.valueIcon}>📈</div>
              <h3 style={styles.valueTitle}>Instant Performance Analysis</h3>
              <p style={styles.valueDesc}>
                Detailed topic-by-topic score breakdown, strengths, weak topics, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works (4 Steps) */}
      <section id="how-it-works" style={styles.sectionAlt}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How Skill Specific Works</h2>
            <p style={styles.sectionSubtitle}>Four simple steps to benchmark and improve your technical proficiency.</p>
          </div>

          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <span style={styles.stepNum}>01</span>
              <h3 style={styles.stepTitle}>Choose Your Role</h3>
              <p style={styles.stepDesc}>Select from 11 specialized engineering roles matching your target career path.</p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNum}>02</span>
              <h3 style={styles.stepTitle}>Select Your Skills</h3>
              <p style={styles.stepDesc}>Customize specific skill topics like Docker, Kubernetes, SQL, React, or Python.</p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNum}>03</span>
              <h3 style={styles.stepTitle}>Take AI Assessment</h3>
              <p style={styles.stepDesc}>Complete a timed 20-minute assessment with dynamic questions and difficulty scaling.</p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNum}>04</span>
              <h3 style={styles.stepTitle}>Analyze Performance</h3>
              <p style={styles.stepDesc}>Review your score, topic accuracy breakdown, strengths, and study recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Role-Specific Assessment Cards */}
      <section id="roles" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Explore Skill-Specific Role Assessments</h2>
            <p style={styles.sectionSubtitle}>Select a job role to immediately start a tailored assessment.</p>
          </div>

          <div style={styles.roleGrid}>
            {featuredRoles.map((r, idx) => (
              <div key={idx} style={styles.roleCard}>
                <div style={styles.roleCardHeader}>
                  <span style={styles.roleIcon}>{r.icon}</span>
                  <h3 style={styles.roleCardTitle}>{r.title}</h3>
                </div>
                <div style={styles.skillPills}>
                  {r.skills.map((s, i) => (
                    <span key={i} style={styles.skillPill}>{s}</span>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/quiz-setup")}
                  style={styles.roleCardBtn}
                >
                  Take Assessment →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: AI & RAG Explanation */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Questions Built Around Your Skills</h2>
            <p style={styles.sectionSubtitle}>
              Skill Specific uses AI and knowledge retrieval to generate relevant questions based on your selected role and skills.
            </p>
          </div>

          <div style={styles.flowContainer}>
            <div style={styles.flowNode}>Your Target Role</div>
            <div style={styles.flowArrow}>↓</div>
            <div style={styles.flowNode}>Required Skills Index</div>
            <div style={styles.flowArrow}>↓</div>
            <div style={styles.flowNode}>Vector Knowledge Retrieval</div>
            <div style={styles.flowArrow}>↓</div>
            <div style={styles.flowNode}>AI Question Generation</div>
            <div style={styles.flowArrow}>↓</div>
            <div style={styles.flowNodeActive}>Personalized Assessment</div>
          </div>
        </div>
      </section>

      {/* Section 5: Analytics Dashboard Preview */}
      <section style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.analyticsPreviewBox}>
            <div style={styles.analyticsText}>
              <h2 style={{ ...styles.sectionTitle, textAlign: "left" }}>
                Deep Performance Analytics
              </h2>
              <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                Track your topic mastery with detailed insights. Identify your exact technical strengths and discover weak spots before your real interviews.
              </p>
            </div>

            <div style={styles.analyticsBars}>
              <div style={styles.barItem}>
                <div style={styles.barHeader}>
                  <span>Docker Containerization</span>
                  <strong style={{ color: "#22c55e" }}>90%</strong>
                </div>
                <div style={styles.barTrack}><div style={{ ...styles.barFill, width: "90%", backgroundColor: "#22c55e" }} /></div>
              </div>

              <div style={styles.barItem}>
                <div style={styles.barHeader}>
                  <span>Kubernetes Orchestration</span>
                  <strong style={{ color: "#38bdf8" }}>75%</strong>
                </div>
                <div style={styles.barTrack}><div style={{ ...styles.barFill, width: "75%", backgroundColor: "#38bdf8" }} /></div>
              </div>

              <div style={styles.barItem}>
                <div style={styles.barHeader}>
                  <span>AWS Cloud Services</span>
                  <strong style={{ color: "#22c55e" }}>85%</strong>
                </div>
                <div style={styles.barTrack}><div style={{ ...styles.barFill, width: "85%", backgroundColor: "#22c55e" }} /></div>
              </div>

              <div style={styles.barItem}>
                <div style={styles.barHeader}>
                  <span>Jenkins CI/CD Pipelines</span>
                  <strong style={{ color: "#eab308" }}>78%</strong>
                </div>
                <div style={styles.barTrack}><div style={{ ...styles.barFill, width: "78%", backgroundColor: "#eab308" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContainer}>
          <h2 style={styles.ctaTitle}>Ready to Test Your Skills?</h2>
          <p style={styles.ctaSubtitle}>
            Choose your target role and generate your custom 20-minute assessment in seconds.
          </p>
          <button
            onClick={() => navigate("/quiz-setup")}
            style={styles.ctaBtn}
          >
            Start Assessment Now →
          </button>
        </div>
      </section>
    </div>
  );
}

const styles = {
  landingWrapper: {
    backgroundColor: "#0b0f19",
    color: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  heroSection: {
    padding: "4rem 1.5rem 5rem 1.5rem",
    background: "radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 60%)",
    borderBottom: "1px solid #1e293b",
  },
  heroContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.5rem",
    alignItems: "center",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    padding: "0.35rem 0.85rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    width: "fit-content",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    lineHeight: "1.15",
    letterSpacing: "-1px",
    color: "#f8fafc",
  },
  titleGradient: {
    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    lineHeight: "1.6",
    maxWidth: "540px",
  },
  heroBtnGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.5rem",
  },
  primaryHeroBtn: {
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.9rem 1.75rem",
    borderRadius: "10px",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
  },
  secondaryHeroBtn: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "0.9rem 1.5rem",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  heroRight: {
    display: "flex",
    justifyContent: "center",
  },
  previewCard: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    overflow: "hidden",
  },
  previewHeader: {
    backgroundColor: "#090d16",
    padding: "0.75rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    borderBottom: "1px solid #1e293b",
  },
  previewDotRed: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" },
  previewDotYellow: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" },
  previewDotGreen: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" },
  previewTitle: { marginLeft: "0.5rem", fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600" },
  previewBody: { padding: "1.5rem" },
  previewMetaRow: { display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" },
  previewLabel: { fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
  previewValue: { fontSize: "1.25rem", color: "#f8fafc", margin: "2px 0 0 0" },
  previewScoreBox: { textAlign: "right" },
  previewScoreLabel: { fontSize: "0.65rem", color: "#94a3b8" },
  previewScoreValue: { display: "block", fontSize: "1.5rem", fontWeight: "800", color: "#38bdf8" },
  previewSkillsBox: { marginBottom: "1.25rem" },
  previewChips: { display: "flex", gap: "0.4rem", marginTop: "0.4rem", flexWrap: "wrap" },
  previewChip: { backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" },
  previewStatsRow: { display: "flex", justifyContent: "space-between", marginBottom: "1rem" },
  previewProgressTrack: { height: "6px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden" },
  previewProgressFill: { width: "85%", height: "100%", backgroundColor: "#38bdf8" },
  section: { padding: "5rem 1.5rem" },
  sectionAlt: { padding: "5rem 1.5rem", backgroundColor: "#080c14", borderTop: "1px solid #161e2e", borderBottom: "1px solid #161e2e" },
  sectionContainer: { maxWidth: "1280px", margin: "0 auto" },
  sectionHeader: { textAlign: "center", marginBottom: "3.5rem" },
  sectionTitle: { fontSize: "2.25rem", fontWeight: "800", color: "#f8fafc", marginBottom: "0.5rem" },
  sectionSubtitle: { fontSize: "1.05rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto" },
  cardsGrid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" },
  valueCard: { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "14px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  valueIcon: { fontSize: "2rem" },
  valueTitle: { fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" },
  valueDesc: { fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.5" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" },
  stepCard: { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "14px", padding: "1.75rem", position: "relative" },
  stepNum: { fontSize: "2rem", fontWeight: "800", color: "#38bdf8", opacity: 0.6, display: "block", marginBottom: "0.5rem" },
  stepTitle: { fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "0.4rem" },
  stepDesc: { fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.5" },
  roleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" },
  roleCard: { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  roleCardHeader: { display: "flex", alignItems: "center", gap: "0.75rem" },
  roleIcon: { fontSize: "1.5rem" },
  roleCardTitle: { fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" },
  skillPills: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
  skillPill: { backgroundColor: "#1e293b", color: "#cbd5e1", fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "6px" },
  roleCardBtn: { marginTop: "auto", padding: "0.75rem", backgroundColor: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "1px solid #38bdf8", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  flowContainer: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxWidth: "420px", margin: "0 auto" },
  flowNode: { width: "100%", textAlign: "center", backgroundColor: "#0f172a", border: "1px solid #334155", color: "#cbd5e1", padding: "0.85rem", borderRadius: "10px", fontWeight: "600" },
  flowNodeActive: { width: "100%", textAlign: "center", background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)", color: "#fff", padding: "0.85rem", borderRadius: "10px", fontWeight: "700" },
  flowArrow: { color: "#38bdf8", fontSize: "1.2rem" },
  analyticsPreviewBox: { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" },
  analyticsText: { display: "flex", flexDirection: "column", gap: "1rem" },
  analyticsBars: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  barItem: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  barHeader: { display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#cbd5e1" },
  barTrack: { height: "8px", backgroundColor: "#1e293b", borderRadius: "4px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px" },
  ctaSection: { padding: "5rem 1.5rem", background: "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 70%)" },
  ctaContainer: { maxWidth: "720px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" },
  ctaTitle: { fontSize: "2.5rem", fontWeight: "800", color: "#f8fafc" },
  ctaSubtitle: { fontSize: "1.1rem", color: "#cbd5e1", maxWidth: "520px" },
  ctaBtn: { marginTop: "1rem", background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)", color: "#ffffff", border: "none", padding: "1rem 2.25rem", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)" },
};

export default Landing;
