import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff, Camera } from "lucide-react";
import { countries } from "../lib/countries";

const BG =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const passwordStrength = () => {
    const len = form.password.length;
    if (len === 0) return { width: "0%", color: "transparent", label: "" };
    if (len < 8) return { width: "33%", color: "#ff6b6b", label: "Too short" };
    if (len < 11)
      return { width: "66%", color: "var(--accent)", label: "Good" };
    return { width: "100%", color: "#6bcb77", label: "Strong" };
  };
  const strength = passwordStrength();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters");
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    let avatarUrl = null;

    if (avatar && userId) {
      const ext = avatar.name.split(".").pop();
      const { data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(`${userId}.${ext}`, avatar, { upsert: true });
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);
        avatarUrl = urlData.publicUrl;
      }
    }

    const selectedCountry = countries.find((c) => c.code === form.country);
    await supabase.from("profiles").upsert({
      id: userId,
      name: form.name,
      email: form.email,
      country: form.country,
      currency: selectedCountry?.currency || "USD",
      avatar_url: avatarUrl,
    });

    navigate("/dashboard");
    setLoading(false);
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
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          filter: "brightness(0.4)",
          zIndex: 0,
        }}
        className="anim-fadeIn"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, rgba(10,10,15,0.65) 100%)",
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
            style={{ fontSize: 22, color: "var(--accent)" }}
          >
            Split Sensei
          </span>
        </div>
      </div>

      {/* Scrollable card wrapper */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 460,
          margin: "100px 20px 40px",
          padding: "0",
        }}
      >
        <div
          className="glass anim-scaleIn"
          style={{ borderRadius: 24, padding: "48px 40px" }}
        >
          <div
            className="anim-fadeUp anim-delay-1"
            style={{ marginBottom: 36 }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: 36,
                color: "var(--cream)",
                marginBottom: 6,
                lineHeight: 1.2,
              }}
            >
              Create account
            </h1>
            <p style={{ color: "rgba(245,240,232,0.5)", fontSize: 15 }}>
              Join the adventure — it's free
            </p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleRegister}>
            {/* Avatar */}
            <div
              className="anim-fadeUp anim-delay-1"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 28,
              }}
            >
              <label
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.08)",
                    border: "2px dashed rgba(201,169,110,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Camera size={22} color="rgba(201,169,110,0.6)" />
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#1c1c1e",
                    fontWeight: 700,
                  }}
                >
                  +
                </div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatar}
                />
              </label>
            </div>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "rgba(245,240,232,0.3)",
                marginBottom: 24,
                marginTop: -16,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Optional photo
            </p>

            {/* Name */}
            <div
              className="anim-fadeUp anim-delay-2"
              style={{ marginBottom: 18 }}
            >
              <label className="label">Full Name</label>
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
                  👤
                </span>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
            </div>

            {/* Country */}
            <div
              className="anim-fadeUp anim-delay-2"
              style={{ marginBottom: 18 }}
            >
              <label className="label">Country</label>
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
                  🌍
                </span>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div
              className="anim-fadeUp anim-delay-3"
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
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="input-field"
                />
              </div>
            </div>

            {/* Password */}
            <div
              className="anim-fadeUp anim-delay-3"
              style={{ marginBottom: 28 }}
            >
              <label className="label">
                Password{" "}
                <span
                  style={{
                    textTransform: "none",
                    color: "rgba(245,240,232,0.3)",
                    fontSize: 11,
                  }}
                >
                  (min 8 characters)
                </span>
              </label>
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
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
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
              {form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: strength.width,
                        background: strength.color,
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: strength.color,
                      marginTop: 4,
                    }}
                  >
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div className="anim-fadeUp anim-delay-4">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating your account..." : "Start Adventuring 🧭"}
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
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
