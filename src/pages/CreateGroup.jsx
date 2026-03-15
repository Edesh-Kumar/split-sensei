import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageBackground from '../components/PageBackground';

import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  FileText,
  Users,
  Image,
} from "lucide-react";
import { getCurrencyByLocation } from "../lib/countries";

const BG =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY;

export default function CreateGroup() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const fileInputRef = useRef();

  const [step, setStep] = useState(1); // 1: details, 2: members
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestingPhoto, setSuggestingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [members, setMembers] = useState([{ name: "", description: "" }]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const suggestPhoto = async () => {
    if (!form.name.trim())
      return setError("Enter a group name first to suggest a photo");
    setSuggestingPhoto(true);
    setError("");
    try {
      const query = form.location
        ? `${form.name} ${form.location} travel`
        : `${form.name} adventure travel`;
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`,
      );
      const data = await res.json();
      if (data.results?.[0]) {
        setImagePreview(data.results[0].urls.regular);
        setImage(null); // using URL directly
      } else {
        setError("No photo found, try a different group name");
      }
    } catch {
      // fallback to a curated mountain photo
      setImagePreview(
        `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70`,
      );
    }
    setSuggestingPhoto(false);
  };

  const addMember = () =>
    setMembers([...members, { name: "", description: "" }]);

  const removeMember = (i) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, idx) => idx !== i));
  };

  const updateMember = (i, field, value) => {
    const updated = [...members];
    updated[i][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Group name is required");
    const validMembers = members.filter((m) => m.name.trim());
    if (validMembers.length === 0) return setError("Add at least one member");

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currency =
      getCurrencyByLocation(form.location)?.currency ||
      profile?.currency ||
      "USD";

    // Upload image if file selected
    let imageUrl = imagePreview; // could be unsplash URL
    if (image) {
      const ext = image.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;
      const { data: uploadData } = await supabase.storage
        .from("group-images")
        .upload(fileName, image, { upsert: true });
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("group-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        image_url: imageUrl || null,
        currency,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) {
      setError(groupError.message);
      setLoading(false);
      return;
    }

    // Add members
    const memberInserts = validMembers.map((m) => ({
      group_id: group.id,
      display_name: m.name.trim(),
      description: m.description.trim() || null,
    }));
    await supabase.from("group_members").insert(memberInserts);

    // Log activity
    await supabase.from("activity_log").insert({
      group_id: group.id,
      action_type: "group_created",
      actor_id: user.id,
      actor_name: profile?.name || "Someone",
      metadata: { group_name: group.name },
    });

    navigate(`/groups/${group.id}`);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <PageBackground />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 720,
          margin: "0 auto",
          padding: "32px 24px 80px",
        }}
      >
        {/* Header */}
        <div
          className="anim-fadeUp"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: "var(--cream)",
              transition: "all 0.2s",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              className="font-display"
              style={{ fontSize: 28, color: "var(--cream)", lineHeight: 1.2 }}
            >
              New Group
            </h1>
            <p
              style={{
                color: "rgba(245,240,232,0.4)",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Step {step} of 2 — {step === 1 ? "Group Details" : "Add Members"}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div
          className="anim-fadeUp anim-delay-1"
          style={{ display: "flex", gap: 8, marginBottom: 36 }}
        >
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 2,
                background:
                  s <= step ? "var(--accent)" : "rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="anim-fadeUp anim-delay-1">
            {/* Cover image */}
            <div style={{ marginBottom: 28 }}>
              <label
                className="label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Image size={13} /> Cover Photo
              </label>
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                  aspectRatio: "16/7",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px dashed rgba(255,255,255,0.15)",
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        Change photo
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setImagePreview(null);
                      }}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      gap: 8,
                      color: "rgba(245,240,232,0.3)",
                    }}
                  >
                    <Upload size={24} />
                    <span style={{ fontSize: 14 }}>
                      Click to upload a photo
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImage}
              />

              <button
                onClick={suggestPhoto}
                disabled={suggestingPhoto}
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(201,169,110,0.1)",
                  border: "1px solid rgba(201,169,110,0.3)",
                  color: "var(--accent)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "all 0.2s",
                }}
              >
                <Sparkles size={14} />
                {suggestingPhoto
                  ? "Finding photo..."
                  : "Suggest a photo based on group name"}
              </button>
            </div>

            {/* Group name */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">Group Name *</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Manali Trip 2025, Goa Squad..."
                className="input-field"
                style={{ paddingLeft: 16 }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label
                className="label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FileText size={12} /> Description{" "}
                <span
                  style={{
                    color: "rgba(245,240,232,0.25)",
                    textTransform: "none",
                    fontSize: 11,
                  }}
                >
                  (optional)
                </span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What's this group about?"
                rows={3}
                className="input-field"
                style={{
                  paddingLeft: 16,
                  paddingTop: 12,
                  resize: "none",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: 20 }}>
              <label
                className="label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <MapPin size={12} /> Location{" "}
                <span
                  style={{
                    color: "rgba(245,240,232,0.25)",
                    textTransform: "none",
                    fontSize: 11,
                  }}
                >
                  (optional — sets currency)
                </span>
              </label>
              <input
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bali, Indonesia"
                className="input-field"
                style={{ paddingLeft: 16 }}
              />
              {form.location && (
                <p
                  style={{ fontSize: 12, color: "var(--accent)", marginTop: 6 }}
                >
                  💱 Currency will be set to:{" "}
                  {getCurrencyByLocation(form.location)?.currency || "USD"}
                </p>
              )}
            </div>

            {/* Dates */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 36,
              }}
            >
              <div>
                <label
                  className="label"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Calendar size={12} /> Start Date{" "}
                  <span
                    style={{
                      color: "rgba(245,240,232,0.25)",
                      textTransform: "none",
                      fontSize: 11,
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <input
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="input-field"
                  style={{ paddingLeft: 16, colorScheme: "dark" }}
                />
              </div>
              <div>
                <label
                  className="label"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Calendar size={12} /> End Date{" "}
                  <span
                    style={{
                      color: "rgba(245,240,232,0.25)",
                      textTransform: "none",
                      fontSize: 11,
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <input
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="input-field"
                  style={{ paddingLeft: 16, colorScheme: "dark" }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.name.trim())
                  return setError("Group name is required");
                setError("");
                setStep(2);
              }}
              className="btn-primary"
            >
              Continue to Members →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="anim-fadeUp anim-delay-1">
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 14,
                marginBottom: 28,
                background: "rgba(201,169,110,0.08)",
                border: "1px solid rgba(201,169,110,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Users size={16} color="var(--accent)" />
              <p style={{ fontSize: 14, color: "rgba(245,240,232,0.7)" }}>
                Add the people in{" "}
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {form.name}
                </span>
                . They don't need an account.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {members.map((member, i) => (
                <div
                  key={i}
                  className="glass-light"
                  style={{
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        "linear-gradient(135deg, var(--accent), #a8833f)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1c1c1e",
                      marginTop: 2,
                    }}
                  >
                    {member.name ? member.name[0].toUpperCase() : i + 1}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      placeholder={`Member ${i + 1} name`}
                      className="input-field"
                      style={{ paddingLeft: 14 }}
                    />
                    <input
                      type="text"
                      value={member.description}
                      onChange={(e) =>
                        updateMember(i, "description", e.target.value)
                      }
                      placeholder="Notes (optional)"
                      className="input-field"
                      style={{ paddingLeft: 14, fontSize: 13 }}
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      onClick={() => removeMember(i)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "rgba(255,100,100,0.1)",
                        border: "1px solid rgba(255,100,100,0.2)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ff8a80",
                        marginTop: 2,
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addMember}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: 12,
                cursor: "pointer",
                color: "rgba(245,240,232,0.5)",
                fontSize: 14,
                fontFamily: "DM Sans, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 32,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "rgba(245,240,232,0.5)";
              }}
            >
              <Plus size={16} /> Add another member
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 12,
              }}
            >
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  cursor: "pointer",
                  color: "var(--cream)",
                  fontSize: 15,
                  fontFamily: "DM Sans, sans-serif",
                  transition: "all 0.2s",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {loading ? "Creating group..." : "🏕️ Create Group"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
