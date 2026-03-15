import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Plus, Users, MapPin, LogOut, ChevronRight } from "lucide-react";

const AVATAR_BG =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80";

function Avatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt="avatar"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid var(--accent)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), #a8833f)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 600,
        color: "#1c1c1e",
        border: "2px solid var(--accent)",
      }}
    >
      {profile?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function GroupCard({ group, onClick }) {
  const coverImage =
    group.image_url ||
    `https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=70`;

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        aspectRatio: "4/3",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
      }}
    >
      {/* Cover image */}
      <img
        src={coverImage}
        alt={group.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Top badges */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          display: "flex",
          gap: 6,
        }}
      >
        {group.location && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: 12,
              color: "rgba(245,240,232,0.9)",
            }}
          >
            <MapPin size={10} />
            {group.location}
          </div>
        )}
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 20px 18px",
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: 22,
            color: "var(--cream)",
            marginBottom: 8,
            lineHeight: 1.2,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {group.name}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "rgba(245,240,232,0.7)",
                fontSize: 13,
              }}
            >
              <Users size={13} />
              <span>{group.member_count || 0} members</span>
            </div>
            {group.total_spent > 0 && (
              <div
                style={{
                  color: "var(--accent)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {formatCurrency(group.total_spent, group.currency)} spent
              </div>
            )}
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(201,169,110,0.2)",
              border: "1px solid rgba(201,169,110,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={14} color="var(--accent)" />
          </div>
        </div>

        {group.start_date && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "rgba(245,240,232,0.4)",
            }}
          >
            {new Date(group.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {group.end_date &&
              ` → ${new Date(group.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onCreateGroup }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "80px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 8 }}>🗺️</div>
      <h2
        className="font-display"
        style={{ fontSize: 28, color: "var(--cream)" }}
      >
        No adventures yet
      </h2>
      <p
        style={{
          color: "rgba(245,240,232,0.45)",
          fontSize: 16,
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        Create your first group to start splitting expenses with your crew
      </p>
      <button
        onClick={onCreateGroup}
        style={{
          marginTop: 8,
          padding: "14px 28px",
          background: "linear-gradient(135deg, #c9a96e, #a8833f)",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          color: "#1c1c1e",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "DM Sans, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.2s",
        }}
      >
        <Plus size={18} />
        Create your first group
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: groupData } = await supabase
      .from("groups")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (groupData) {
      const enriched = await Promise.all(
        groupData.map(async (g) => {
          const { count: member_count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", g.id)
            .is("removed_at", null);

          const { data: expenses } = await supabase
            .from("expenses")
            .select("amount")
            .eq("group_id", g.id);

          const total_spent =
            expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
          return { ...g, member_count, total_spent };
        }),
      );
      setGroups(enriched);
    }
    setLoading(false);
  };

  const skeletonCards = Array(3).fill(null);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Full page background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${AVATAR_BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center 60%',
        filter: 'brightness(0.55)'
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.35)' }} />

      {/* Hero header */}
      <div style={{ position: 'relative', zIndex: 2, height: 220, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)' }} />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 32px 28px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 24 }}>🧭</span>
              <span
                className="font-display"
                style={{ fontSize: 20, color: "var(--accent)" }}
              >
                Split Sensei
              </span>
            </div>
            <h1
              className="font-display"
              style={{ fontSize: 32, color: "var(--cream)", lineHeight: 1.2 }}
            >
              Hey, {profile?.name?.split(" ")[0] || "Adventurer"} 👋
            </h1>
            <p
              style={{
                color: "rgba(245,240,232,0.45)",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              {groups.length > 0
                ? `${groups.length} group${groups.length > 1 ? "s" : ""} · ready to explore`
                : "Ready for your next adventure?"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="Your profile">
              <Avatar profile={profile} />
            </div>
            <button
              onClick={signOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(245,240,232,0.6)",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ff8a80")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(245,240,232,0.6)")
              }
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '32px 32px 60px' }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <h2
            className="font-display"
            style={{ fontSize: 24, color: "var(--cream)" }}
          >
            Your Groups
          </h2>
          {groups.length > 0 && (
            <button
              onClick={() => navigate("/groups/new")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #c9a96e, #a8833f)",
                border: "none",
                cursor: "pointer",
                color: "#1c1c1e",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s",
              }}
            >
              <Plus size={16} />
              New Group
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {skeletonCards.map((_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{ borderRadius: 20, aspectRatio: "4/3" }}
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState onCreateGroup={() => navigate("/groups/new")} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {groups.map((group, i) => (
              <div
                key={group.id}
                className="anim-fadeUp"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <GroupCard
                  group={group}
                  onClick={() => navigate(`/groups/${group.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
