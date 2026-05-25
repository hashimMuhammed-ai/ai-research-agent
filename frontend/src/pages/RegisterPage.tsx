import { useState } from "react";
import { authApi } from "../api/research.api";

interface Props {
  onGoToLogin: () => void;
}

export const RegisterPage = ({ onGoToLogin }: Props) => {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): string => {
    if (!name.trim())           return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!email.trim())          return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email";
    if (!password)              return "Password is required";
    if (password.length < 6)   return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

const handleRegister = async () => {
  const validationError = validate();
  if (validationError) {
    setError(validationError);
    return;
  }

  setError("");
  setLoading(true);

  try {
    const res = await authApi.register(name.trim(), email.trim(), password);

    localStorage.setItem("token", res.data.token);

    window.location.reload();
  } catch (err: any) {
    setError(
      err?.response?.data?.message || "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <style>{globalStyles}</style>
      <div className="auth-wrapper">
        <div className="auth-card">

          {/* Header */}
          <div className="auth-header">
            <div style={{ fontSize: "2.5rem" }}>🔬</div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start researching with AI agents</p>
          </div>

          {/* Form fields */}
          <div className="auth-form">

            {/* Name */}
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <input
                className={`auth-input ${
                  confirmPassword && confirmPassword !== password
                    ? "input-error" : ""
                }`}
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                disabled={loading}
              />
              {/* Inline password match indicator */}
              {confirmPassword && (
                <p style={{
                  fontSize: "0.78rem",
                  marginTop: "0.3rem",
                  color: confirmPassword === password ? "#10b981" : "#ef4444",
                }}>
                  {confirmPassword === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Password strength indicator */}
            {password && (
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginBottom: "0.3rem",
                }}>
                  <span>Password strength</span>
                  <span style={{ color: strengthColor(password) }}>
                    {strengthLabel(password)}
                  </span>
                </div>
                <div style={{
                  height: "4px",
                  background: "#e5e7eb",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${strengthPercent(password)}%`,
                    background: strengthColor(password),
                    borderRadius: "9999px",
                    transition: "width 0.3s ease",
                  }} />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="auth-error">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              className="auth-btn-primary"
              onClick={handleRegister}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            {/* Go to login */}
            <button
              className="auth-btn-outline"
              onClick={onGoToLogin}
              disabled={loading}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Password strength helpers ────────────────────────────────────────────────

const strengthPercent = (p: string): number => {
  let score = 0;
  if (p.length >= 6)              score += 25;
  if (p.length >= 10)             score += 25;
  if (/[A-Z]/.test(p))           score += 25;
  if (/[0-9!@#$%^&*]/.test(p))  score += 25;
  return score;
};

const strengthLabel = (p: string): string => {
  const pct = strengthPercent(p);
  if (pct <= 25) return "Weak";
  if (pct <= 50) return "Fair";
  if (pct <= 75) return "Good";
  return "Strong";
};

const strengthColor = (p: string): string => {
  const pct = strengthPercent(p);
  if (pct <= 25) return "#ef4444";
  if (pct <= 50) return "#f59e0b";
  if (pct <= 75) return "#3b82f6";
  return "#10b981";
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; }

  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    padding: 1rem;
  }

  .auth-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    width: 100%;
    max-width: 440px;
    padding: 2rem;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 1.75rem;
  }

  .auth-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #111827;
    margin-top: 0.5rem;
  }

  .auth-subtitle {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 0.3rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .field-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #374151;
  }

  .auth-input {
    width: 100%;
    padding: 0.7rem 1rem;
    font-size: 0.95rem;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s;
    color: #111827;
  }

  .auth-input:focus {
    border-color: #4f46e5;
  }

  .auth-input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }

  .input-error {
    border-color: #ef4444 !important;
  }

  .auth-error {
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #ef4444;
    font-size: 0.85rem;
  }

  .auth-btn-primary {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .auth-btn-primary:hover:not(:disabled) {
    background: #4338ca;
  }

  .auth-btn-primary:disabled {
    cursor: not-allowed;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.82rem;
    text-align: center;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  .auth-btn-outline {
    width: 100%;
    padding: 0.7rem;
    font-size: 0.95rem;
    font-weight: 600;
    background: transparent;
    color: #4f46e5;
    border: 1.5px solid #4f46e5;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .auth-btn-outline:hover:not(:disabled) {
    background: #eff6ff;
  }

  /* Mobile */
  @media (max-width: 480px) {
    .auth-card  { padding: 1.5rem 1.25rem; border-radius: 12px; }
    .auth-title { font-size: 1.2rem; }
  }
`;