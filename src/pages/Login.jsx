import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const BG =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else navigate("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          filter: "brightness(0.7)",
          zIndex: 0,
        }}
        className="anim-fadeIn"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.65) 100%)",
          zIndex: 1,
        }}
      />

      {/* Brand */}
      <div
        style={{ position: "absolute", top: 32, left: 40, zIndex: 10 }}
        className="anim-fadeUp"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🧭</span>
          <span
            className="font-display"
            style={{
              fontSize: 22,
              color: "var(--accent)",
              letterSpacing: "0.5px",
            }}
          >
            Split Sensei
          </span>
        </div>
      </div>

      {/* Card */}
      <div
        className="glass anim-scaleIn"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          borderRadius: 24,
          padding: "48px 40px",
          margin: "0 20px",
        }}
      >
        <div className="anim-fadeUp anim-delay-1">
          <h1
            className="font-display"
            style={{
              fontSize: 36,
              color: "var(--cream)",
              marginBottom: 6,
              lineHeight: 1.2,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              color: "rgba(245,240,232,0.5)",
              fontSize: 15,
              marginBottom: 32,
            }}
          >
            Sign in to continue your adventure
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Google Button */}
        <div className="anim-fadeUp anim-delay-1" style={{ marginBottom: 24 }}>
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "var(--cream)",
              fontSize: 15,
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.13)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>
        </div>

        {/* Divider */}
        <div
          className="anim-fadeUp anim-delay-2"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}
          />
          <span style={{ color: "rgba(245,240,232,0.3)", fontSize: 13 }}>
            or continue with email
          </span>
          <div
            style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}
          />
        </div>

        <form onSubmit={handleLogin}>
          <div
            className="anim-fadeUp anim-delay-2"
            style={{ marginBottom: 18 }}
          >
            <label className="label">Email</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.4,
                }}
              >
                ✉
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input-field"
              />
            </div>
          </div>

          <div
            className="anim-fadeUp anim-delay-3"
            style={{ marginBottom: 28 }}
          >
            <label className="label">Password</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.4,
                }}
              >
                🔒
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(245,240,232,0.4)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="anim-fadeUp anim-delay-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: "rgba(245,240,232,0.45)",
          }}
        >
          New here?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Create an account
          </Link>
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            color: "rgba(245,240,232,0.3)",
            fontSize: 13,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          Split expenses · Track adventures · Travel together
        </p>
      </div>
    </div>
  );
}
