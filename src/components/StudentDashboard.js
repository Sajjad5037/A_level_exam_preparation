// StudentDashboard.js
import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";

const StudentDashboard = ({ doctorData }) => {
  const [activeLink, setActiveLink] = useState("ai_evaluator");
  const [accessAllowed, setAccessAllowed] = useState(null); // null = loading

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.get(
          `https://usefulapis-production.up.railway.app/check-user-access?username=${doctorData.name}`
        );
        setAccessAllowed(response.data.access_allowed);
      } catch (error) {
        console.error("Failed to check access:", error);
        setAccessAllowed(false);
      }
    };

    checkAccess();
  }, [doctorData.name]);

  if (accessAllowed === null) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading dashboard...</div>;
  }

  if (!accessAllowed) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "18px", color: "#b91c1c" }}>
        ❌ Access Restricted: You have exceeded your allowed usage limit.
      </div>
    );
  }

  const colors = {
    primary: "#2563eb",
    primaryLight: "#dbeafe",
    accent: "#0ea5e9",
    background: "#f9fafb",
    surface: "#ffffff",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      backgroundColor: colors.background,
      color: colors.textPrimary,
    },

    header: {
      padding: "14px 24px",
      backgroundColor: colors.primary,
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      letterSpacing: "0.5px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    headerTitle: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    navBar: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      backgroundColor: colors.surface,
      padding: "10px 16px",
      borderBottom: `1px solid ${colors.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      fontSize: "14px",
      justifyContent: "center",
    },

    navLink: (isActive) => ({
      textDecoration: "none",
      color: isActive ? colors.primary : colors.textSecondary,
      fontWeight: isActive ? "600" : "500",
      padding: "8px 14px",
      borderRadius: "6px",
      backgroundColor: isActive ? colors.primaryLight : "transparent",
      transition: "all 0.25s ease",
      boxShadow: isActive ? "inset 0 0 4px rgba(0,0,0,0.05)" : "none",
      cursor: "pointer",
    }),

    mainContent: {
      flex: 1,
      width: "100%",
      backgroundColor: colors.surface,
      padding: "24px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      overflowY: "auto",
      margin: "20px auto",
      maxWidth: "1100px",
      boxSizing: "border-box",
    },

    footer: {
      textAlign: "center",
      padding: "10px",
      fontSize: "13px",
      color: colors.textSecondary,
      borderTop: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span role="img" aria-label="ai">🤖</span>
          <span>AI Tutor — Helping You Prepare for Exams!</span>
        </div>
        {/* Placeholder for future logout/profile */}
        <div style={{ fontSize: "13px", opacity: 0.9 }}>Welcome, {doctorData.name}</div>
      </header>

      {/* NavBar */}
      <nav style={styles.navBar}>
        {[
          ["ai_evaluator", "📝 AI Evaluator"],
          ["ai_learning", "📘 AI Interactive Learning"],
          ["StudentReport", "📊 Exams Preparation Status"],
          ["AiAudioLearning", "🎧 Talk to the AI"],
          ["StudentUsageReport", "📈 App Usage"],
          ["ResponseAnalyzer", "🔍 Response Analyzer"],
        ].map(([key, label]) => (
          <Link
            key={key}
            to={`/StudentDashboard/${key}`}
            style={styles.navLink(activeLink === key)}
            onClick={() => setActiveLink(key)}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} AI Tutor | Empowering Smarter Learning
      </footer>
    </div>
  );
};

export default StudentDashboard;
