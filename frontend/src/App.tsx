import { useState } from "react";
import { authApi }       from "./api/research.api";
import { ResearchPage }  from "./pages/ResearchPage";
import { HistoryPage }   from "./pages/HistoryPage";

type Page = "research" | "history";

export default function App() {
  const [token, setToken]       = useState(localStorage.getItem("token") || "");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activePage, setActivePage] = useState<Page>("research");

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


  if (!token) {
    return (
      <div style={{
        minHeight:       "100vh",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        backgroundColor: "#f3f4f6",
      }}>
        <div style={{
          backgroundColor: "white",
          padding:         "2rem",
          borderRadius:    "14px",
          boxShadow:       "0 4px 20px rgba(0,0,0,0.08)",
          width:           "360px",
        }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem" }}>🔬</div>
            <h2 style={{ margin: "0.5rem 0 0", fontSize: "1.3rem", fontWeight: 700 }}>
              AI Research Agent
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>
              Multi-agent powered research
            </p>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ ...inputStyle, marginTop: "0.75rem" }}
          />

          {authError && (
            <p style={{ color: "#ef4444", fontSize: "0.82rem", margin: "0.5rem 0 0" }}>
              {authError}
            </p>
          )}

          <button onClick={handleLogin} style={{ ...primaryBtn, width: "100%", marginTop: "1rem" }}>
            Login
          </button>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#9ca3af", marginTop: "1rem" }}>
            Register via Postman, then login here.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>

      <nav style={{
        backgroundColor: "white",
        borderBottom:    "1px solid #e5e7eb",
        padding:         "0 2rem",
        height:          "60px",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        position:        "sticky",
        top:             0,
        zIndex:          100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>
            🔬 AI Research Agent
          </span>

          {(["research", "history"] as Page[]).map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              style={{
                background:    "none",
                border:        "none",
                cursor:        "pointer",
                fontSize:      "0.9rem",
                fontWeight:    activePage === page ? 600 : 400,
                color:         activePage === page ? "#4f46e5" : "#6b7280",
                borderBottom:  activePage === page ? "2px solid #4f46e5" : "2px solid transparent",
                padding:       "0.25rem 0",
                textTransform: "capitalize",
              }}
            >
              {page === "research" ? "🔬 Research" : "📚 History"}
            </button>
          ))}
        </div>

        <button onClick={handleLogout} style={outlineBtn}>
          Logout
        </button>
      </nav>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem" }}>
        {activePage === "research" ? <ResearchPage /> : <HistoryPage />}
      </main>
    </div>
  );
}


const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "0.65rem 0.9rem",
  fontSize:     "0.95rem",
  border:       "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing:    "border-box",
  outline:      "none",
};

const primaryBtn: React.CSSProperties = {
  padding:         "0.65rem 1.25rem",
  fontSize:        "0.95rem",
  backgroundColor: "#4f46e5",
  color:           "white",
  border:          "none",
  borderRadius:    "8px",
  cursor:          "pointer",
};

const outlineBtn: React.CSSProperties = {
  padding:         "0.45rem 1rem",
  fontSize:        "0.88rem",
  backgroundColor: "transparent",
  color:           "#4f46e5",
  border:          "1px solid #4f46e5",
  borderRadius:    "8px",
  cursor:          "pointer",
};