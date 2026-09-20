import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <span style={styles.icon}>⚠️</span>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.text}>
              An unexpected error occurred while rendering this page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              style={styles.btn}
            >
              Return to Home Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "2.5rem",
    textAlign: "center",
    maxWidth: "480px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  icon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: "0.5rem",
  },
  text: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    marginBottom: "1.75rem",
  },
  btn: {
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
};

export default ErrorBoundary;
