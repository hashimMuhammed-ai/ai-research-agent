import { useState } from "react";
import { authApi }       from "./api/research.api";
import { ResearchPage }  from "./pages/ResearchPage";
import { HistoryPage }   from "./pages/HistoryPage";
import { RegisterPage }  from "./pages/RegisterPage";

type Page     = "research" | "history";
type AuthView = "login" | "register";

export default function App() {
  const [token, setToken]           = useState(localStorage.getItem("token") || "");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [authError, setAuthError]   = useState("");
  const [activePage, setActivePage] = useState<Page>("research");
  const [authView, setAuthView]     = useState<AuthView>("login");
  const [menuOpen, setMenuOpen]     = useState(false);

  const handleLogin = async () => {
    try {
      setAuthError("");
      const res = await authApi.login(email, password);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      window.location.reload();
    } catch {
      setAuthError("Invalid email or password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  // ─── Register page ────────────────────────────────────────────
  if (!token && authView === "register") {
    return (
      <RegisterPage
        onGoToLogin={() => setAuthView("login")}
      />
    );
  }

  // ─── Login page ───────────────────────────────────────────────
  if (!token) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', sans-serif; }

          .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            padding: 1rem;
          }
          .login-card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 400px;
          }
          .login-input {
            width: 100%;
            padding: 0.7rem 1rem;
            font-size: 0.95rem;
            border: 1.5px solid #d1d5db;
            border-radius: 8px;
            outline: none;
            margin-top: 0.75rem;
            transition: border-color 0.2s;
          }
          .login-input:focus { border-color: #4f46e5; }
          .login-btn {
            width: 100%;
            padding: 0.75rem;
            font-size: 1rem;
            font-weight: 600;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 1rem;
          }
          .login-btn:hover { background: #4338ca; }
          .register-link-btn {
            width: 100%;
            padding: 0.7rem;
            font-size: 0.95rem;
            font-weight: 600;
            background: transparent;
            color: #4f46e5;
            border: 1.5px solid #4f46e5;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 0.75rem;
          }
          .register-link-btn:hover { background: #eff6ff; }
          .divider {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #9ca3af;
            font-size: 0.82rem;
            margin-top: 1rem;
          }
          .divider::before, .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
          }

          @media (max-width: 480px) {
            .login-card { padding: 1.5rem 1.25rem; }
          }
        `}</style>

        <div className="login-wrapper">
          <div className="login-card">
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem" }}>🔬</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.5rem" }}>
                AI Research Agent
              </h2>
              <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                Multi-agent powered research
              </p>
            </div>

            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setAuthError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            {authError && (
              <p style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: "0.5rem" }}>
                ⚠️ {authError}
              </p>
            )}

            <button className="login-btn" onClick={handleLogin}>
              Sign In
            </button>

            <div className="divider">
              <span>Don't have an account?</span>
            </div>

            <button
              className="register-link-btn"
              onClick={() => setAuthView("register")}
            >
              Create Account
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Main app ─────────────────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; }

        .navbar {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-brand { font-weight: 700; font-size: 1rem; white-space: nowrap; }
        .navbar-tabs  { display: flex; align-items: center; gap: 1.5rem; }
        .nav-tab {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.25rem 0;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          white-space: nowrap;
        }
        .nav-tab.active { font-weight: 600; color: #4f46e5; border-bottom-color: #4f46e5; }
        .logout-btn {
          padding: 0.45rem 1rem;
          font-size: 0.88rem;
          background: transparent;
          color: #4f46e5;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: #374151;
        }
        .mobile-menu {
          display: none;
          flex-direction: column;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
          gap: 0.75rem;
        }
        .mobile-menu.open { display: flex; }
        .mobile-nav-tab {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem 0;
          color: #374151;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }
        .mobile-nav-tab.active { color: #4f46e5; font-weight: 600; }
        .mobile-logout {
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 0.25rem;
        }
        .main-content { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }

        @media (max-width: 640px) {
          .navbar-tabs { display: none; }
          .logout-btn  { display: none; }
          .hamburger   { display: block; }
          .main-content { padding: 1rem; }
          .navbar { padding: 0 1rem; }
        }
      `}</style>

      <nav className="navbar">
        <span className="navbar-brand">🔬 AI Research Agent</span>

        <div className="navbar-tabs">
          {(["research", "history"] as Page[]).map((page) => (
            <button
              key={page}
              className={`nav-tab ${activePage === page ? "active" : ""}`}
              onClick={() => setActivePage(page)}
            >
              {page === "research" ? "🔬 Research" : "📚 History"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {(["research", "history"] as Page[]).map((page) => (
          <button
            key={page}
            className={`mobile-nav-tab ${activePage === page ? "active" : ""}`}
            onClick={() => { setActivePage(page); setMenuOpen(false); }}
          >
            {page === "research" ? "🔬 Research" : "📚 History"}
          </button>
        ))}
        <button className="mobile-logout" onClick={handleLogout}>Logout</button>
      </div>

      <main className="main-content">
        {activePage === "research" ? <ResearchPage /> : <HistoryPage />}
      </main>
    </>
  );
}