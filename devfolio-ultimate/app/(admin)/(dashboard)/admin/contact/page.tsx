"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getApiBaseUrl } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  recipient_email: string | null;
  message: string;
  ip_address: string | null;
  created_at: string;
}

interface EmailEntry {
  label: string;
  email: string;
}

interface PhoneEntry {
  label: string;
  phone: string;
}

interface LocationEntry {
  address: string;
  gps_link: string;
}

interface ContactSettings {
  emails: EmailEntry[];
  phones: PhoneEntry[];
  locations: LocationEntry[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getToken(): string {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token") || ""
    : "";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem 1.25rem",
        borderRadius: "0.75rem",
        background: type === "success" ? "#0d2e1f" : "#2e0d0d",
        border: `1px solid ${type === "success" ? "#22c55e44" : "#ef444444"}`,
        boxShadow: `0 8px 32px ${type === "success" ? "#22c55e22" : "#ef444422"}`,
        color: type === "success" ? "#4ade80" : "#f87171",
        fontSize: "0.875rem",
        fontWeight: 500,
        maxWidth: "360px",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>
        {type === "success" ? "✓" : "✕"}
      </span>
      {msg}
    </div>
  );
}

// ─── Message Detail Modal ────────────────────────────────────────────────────

function MessageDetailModal({
  message,
  onClose,
  onDelete,
}: {
  message: ContactMessage;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/contacts/${message.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      if (res.ok) {
        onDelete(message.id);
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "580px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {message.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#f1f5f9", fontSize: "1rem" }}>
                {message.name}
              </p>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.8rem" }}>
                {message.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              fontSize: "1.25rem",
              lineHeight: 1,
              padding: "0.25rem",
              borderRadius: "0.375rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = "#f1f5f9")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = "#64748b")}
          >
            ✕
          </button>
        </div>

        {/* Meta info */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {[
            { label: "Sent to", value: message.recipient_email || "—", icon: "📧" },
            { label: "IP", value: message.ip_address || "—", icon: "🌐" },
            { label: "Date", value: formatDate(message.created_at), icon: "📅" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#1e293b",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
              <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>
                {item.label}:
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500 }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Message body */}
        <div style={{ padding: "1.5rem" }}>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 0.75rem 0",
            }}
          >
            Message
          </p>
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              color: "#cbd5e1",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message.message}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #1e293b",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.625rem",
              background: "transparent",
              border: "1px solid #334155",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1e293b";
              (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            Close
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.625rem",
              background: deleting ? "#7f1d1d" : "#ef4444",
              border: "none",
              color: "#fff",
              cursor: deleting ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!deleting) (e.currentTarget as HTMLButtonElement).style.background = "#dc2626";
            }}
            onMouseLeave={(e) => {
              if (!deleting) (e.currentTarget as HTMLButtonElement).style.background = "#ef4444";
            }}
          >
            {deleting ? "Deleting…" : "🗑 Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles (module-level to avoid re-creation on every render) ─────────

const inputStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "0.5rem",
  padding: "0.6rem 0.875rem",
  color: "#f1f5f9",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "0.375rem",
  display: "block",
};

// ─── SectionCard (module-level — NEVER define components inside other components) ─

function SectionCard({
  icon,
  title,
  accentColor,
  onAdd,
  addLabel,
  children,
}: {
  icon: string;
  title: string;
  accentColor: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "1rem",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              background: accentColor + "22",
              border: `1px solid ${accentColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            {icon}
          </span>
          <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.9375rem" }}>
            {title}
          </span>
        </div>
        <button
          onClick={onAdd}
          style={{
            padding: "0.4rem 0.875rem",
            borderRadius: "0.5rem",
            background: accentColor + "22",
            border: `1px solid ${accentColor}55`,
            color: accentColor,
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = accentColor + "33";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = accentColor + "22";
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span> {addLabel}
        </button>
      </div>
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab() {
  const [settings, setSettings] = useState<ContactSettings>({
    emails: [],
    phones: [],
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/contact/settings`);
        const json = await res.json();
        if (json.success && json.data) {
          setSettings({
            emails: json.data.emails || [],
            phones: json.data.phones || [],
            locations: json.data.locations || [],
          });
        }
      } catch {
        setToast({ msg: "Failed to load settings.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const token = getToken();
    try {
      const res = await fetch(`${getApiBaseUrl()}/contact/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      // Try to parse JSON regardless of status
      let json: Record<string, unknown> = {};
      try {
        json = await res.json();
      } catch {
        // Non-JSON response (HTML error page etc.)
        setToast({
          msg: `Server error ${res.status} — check Laravel is running.`,
          type: "error",
        });
        return;
      }

      if (res.ok && json.success) {
        setToast({ msg: "Settings saved successfully!", type: "success" });
      } else {
        // Show the real Laravel validation / auth error
        const errMsg =
          (json.message as string) ||
          Object.values(json.errors as Record<string, string[]> || {})
            .flat()
            .join(" ") ||
          `Error ${res.status}`;
        setToast({ msg: errMsg, type: "error" });
      }
    } catch (err) {
      // True network failure (server down / CORS preflight blocked)
      console.error("Save settings error:", err);
      setToast({
        msg: "Cannot reach server — is Laravel running on port 8000?",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Email helpers ──
  function addEmail() {
    setSettings((s) => ({ ...s, emails: [...s.emails, { label: "", email: "" }] }));
  }
  function updateEmail(i: number, field: keyof EmailEntry, value: string) {
    setSettings((s) => {
      const arr = [...s.emails];
      arr[i] = { ...arr[i], [field]: value };
      return { ...s, emails: arr };
    });
  }
  function removeEmail(i: number) {
    setSettings((s) => ({ ...s, emails: s.emails.filter((_, idx) => idx !== i) }));
  }

  // ── Phone helpers ──
  function addPhone() {
    setSettings((s) => ({ ...s, phones: [...s.phones, { label: "", phone: "" }] }));
  }
  function updatePhone(i: number, field: keyof PhoneEntry, value: string) {
    setSettings((s) => {
      const arr = [...s.phones];
      arr[i] = { ...arr[i], [field]: value };
      return { ...s, phones: arr };
    });
  }
  function removePhone(i: number) {
    setSettings((s) => ({ ...s, phones: s.phones.filter((_, idx) => idx !== i) }));
  }

  // ── Location helpers ──
  function addLocation() {
    setSettings((s) => ({
      ...s,
      locations: [...s.locations, { address: "", gps_link: "" }],
    }));
  }
  function updateLocation(i: number, field: keyof LocationEntry, value: string) {
    setSettings((s) => {
      const arr = [...s.locations];
      arr[i] = { ...arr[i], [field]: value };
      return { ...s, locations: arr };
    });
  }
  function removeLocation(i: number) {
    setSettings((s) => ({ ...s, locations: s.locations.filter((_, idx) => idx !== i) }));
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", border: "3px solid #334155", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── Emails ── */}
      <SectionCard
        icon="📧"
        title="Email Addresses"
        accentColor="#3b82f6"
        onAdd={addEmail}
        addLabel="Add Email"
      >
        {settings.emails.length === 0 && (
          <p style={{ color: "#475569", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
            No email addresses yet. Click &ldquo;Add Email&rdquo; to add one.
          </p>
        )}
        {settings.emails.map((entry, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr auto",
              gap: "0.75rem",
              alignItems: "end",
              padding: "0.875rem",
              background: "#1e293b",
              borderRadius: "0.75rem",
              border: "1px solid #334155",
            }}
          >
            <div>
              <span style={labelStyle}>Label</span>
              <input
                style={inputStyle}
                value={entry.label}
                placeholder="e.g. Personal"
                onChange={(e) => updateEmail(i, "label", e.target.value)}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#3b82f6")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
              />
            </div>
            <div>
              <span style={labelStyle}>Email Address</span>
              <input
                style={inputStyle}
                type="email"
                value={entry.email}
                placeholder="you@example.com"
                onChange={(e) => updateEmail(i, "email", e.target.value)}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#3b82f6")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
              />
            </div>
            <button
              onClick={() => removeEmail(i)}
              title="Remove"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.5rem",
                background: "#7f1d1d22",
                border: "1px solid #ef444433",
                color: "#f87171",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#ef444433";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#7f1d1d22";
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </SectionCard>

      {/* ── Phones ── */}
      <SectionCard
        icon="📞"
        title="Phone Numbers"
        accentColor="#22c55e"
        onAdd={addPhone}
        addLabel="Add Phone"
      >
        {settings.phones.length === 0 && (
          <p style={{ color: "#475569", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
            No phone numbers yet. Click &ldquo;Add Phone&rdquo; to add one.
          </p>
        )}
        {settings.phones.map((entry, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr auto",
              gap: "0.75rem",
              alignItems: "end",
              padding: "0.875rem",
              background: "#1e293b",
              borderRadius: "0.75rem",
              border: "1px solid #334155",
            }}
          >
            <div>
              <span style={labelStyle}>Label</span>
              <input
                style={inputStyle}
                value={entry.label}
                placeholder="e.g. Personal"
                onChange={(e) => updatePhone(i, "label", e.target.value)}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#22c55e")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
              />
            </div>
            <div>
              <span style={labelStyle}>Phone Number</span>
              <input
                style={inputStyle}
                type="tel"
                value={entry.phone}
                placeholder="+20 100 720 1178"
                onChange={(e) => updatePhone(i, "phone", e.target.value)}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#22c55e")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
              />
            </div>
            <button
              onClick={() => removePhone(i)}
              title="Remove"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.5rem",
                background: "#7f1d1d22",
                border: "1px solid #ef444433",
                color: "#f87171",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#ef444433";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#7f1d1d22";
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </SectionCard>

      {/* ── Locations ── */}
      <SectionCard
        icon="📍"
        title="Locations"
        accentColor="#f59e0b"
        onAdd={addLocation}
        addLabel="Add Location"
      >
        {settings.locations.length === 0 && (
          <p style={{ color: "#475569", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
            No locations yet. Click &ldquo;Add Location&rdquo; to add one.
          </p>
        )}
        {settings.locations.map((entry, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "0.75rem",
              alignItems: "end",
              padding: "0.875rem",
              background: "#1e293b",
              borderRadius: "0.75rem",
              border: "1px solid #334155",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <span style={labelStyle}>Address</span>
                <input
                  style={inputStyle}
                  value={entry.address}
                  placeholder="Cairo, Egypt"
                  onChange={(e) => updateLocation(i, "address", e.target.value)}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#f59e0b")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
                />
              </div>
              <div>
                <span style={labelStyle}>GPS / Maps Link</span>
                <input
                  style={inputStyle}
                  type="url"
                  value={entry.gps_link}
                  placeholder="https://maps.google.com/..."
                  onChange={(e) => updateLocation(i, "gps_link", e.target.value)}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#f59e0b")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
                />
              </div>
            </div>
            <button
              onClick={() => removeLocation(i)}
              title="Remove"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.5rem",
                background: "#7f1d1d22",
                border: "1px solid #ef444433",
                color: "#f87171",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s",
                flexShrink: 0,
                alignSelf: "end",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#ef444433";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#7f1d1d22";
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </SectionCard>

      {/* Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.75rem 2rem",
            borderRadius: "0.75rem",
            background: saving
              ? "linear-gradient(135deg, #1d4ed8, #0369a1)"
              : "linear-gradient(135deg, #3b82f6, #06b6d4)",
            border: "none",
            color: "#fff",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "0.9375rem",
            fontWeight: 700,
            boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
            transition: "all 0.25s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            if (!saving)
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 28px rgba(59,130,246,0.55)";
          }}
          onMouseLeave={(e) => {
            if (!saving)
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 20px rgba(59,130,246,0.35)";
          }}
        >
          {saving ? (
            <>
              <span
                style={{
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              Saving…
            </>
          ) : (
            "💾 Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Inbox Tab ───────────────────────────────────────────────────────────────

function InboxTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/contacts`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" },
      });
      const json = await res.json();
      if (json.success && json.data?.data) {
        setMessages(json.data.data);
      } else if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch {
      setToast({ msg: "Failed to load messages.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id: number) {
    setMessages((m) => m.filter((msg) => msg.id !== id));
    setToast({ msg: "Message deleted.", type: "success" });
  }

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(filter.toLowerCase()) ||
      m.email.toLowerCase().includes(filter.toLowerCase()) ||
      m.message.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            border: "3px solid #334155",
            borderTopColor: "#3b82f6",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
      {selected && (
        <MessageDetailModal
          message={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Search + count bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <span
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#475569",
              fontSize: "0.9rem",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search messages by name, email, or content…"
            style={{
              width: "100%",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.625rem",
              padding: "0.6rem 0.875rem 0.6rem 2.5rem",
              color: "#f1f5f9",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#3b82f6")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
          />
        </div>
        <div
          style={{
            padding: "0.5rem 0.875rem",
            borderRadius: "0.5rem",
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#64748b",
            fontSize: "0.8125rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} {filtered.length === 1 ? "message" : "messages"}
        </div>
        <button
          onClick={load}
          title="Refresh"
          style={{
            width: "2.375rem",
            height: "2.375rem",
            borderRadius: "0.5rem",
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#64748b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#64748b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155";
          }}
        >
          ↻
        </button>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "#0f172a",
            border: "1px dashed #334155",
            borderRadius: "1rem",
          }}
        >
          <p style={{ fontSize: "2.5rem", margin: "0 0 0.75rem" }}>📭</p>
          <p style={{ color: "#64748b", fontSize: "1rem", margin: 0, fontWeight: 500 }}>
            {filter ? "No messages match your search." : "Inbox is empty — no messages yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              style={{
                padding: "1rem 1.25rem",
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "0.875rem",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "1rem",
                alignItems: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f655";
                (e.currentTarget as HTMLDivElement).style.background = "#0f172a";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 0 1px #3b82f622, 0 4px 16px rgba(59,130,246,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#1e293b";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {msg.name.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.25rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.9375rem" }}>
                    {msg.name}
                  </span>
                  <span style={{ color: "#475569", fontSize: "0.8rem" }}>{msg.email}</span>
                  {msg.recipient_email && (
                    <span
                      style={{
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                        background: "#3b82f622",
                        border: "1px solid #3b82f633",
                        color: "#93c5fd",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      → {msg.recipient_email}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "0.85rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {msg.message}
                </p>
              </div>

              {/* Date + arrow */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.375rem",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "#475569", fontSize: "0.775rem", whiteSpace: "nowrap" }}>
                  {formatDate(msg.created_at)}
                </span>
                <span style={{ color: "#334155", fontSize: "0.875rem" }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminContactPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "settings">("inbox");

  const tabs = [
    { id: "inbox" as const, label: "📬 Inbox", description: "Received messages" },
    { id: "settings" as const, label: "⚙️ Settings", description: "Contact info & emails" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "0.875rem",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.375rem",
              boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
              flexShrink: 0,
            }}
          >
            📨
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.625rem",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              Contact Management
            </h1>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem" }}>
              Manage your inbox and contact information displayed on the site
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "inline-flex",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "0.875rem",
          padding: "0.3rem",
          marginBottom: "1.75rem",
          gap: "0.25rem",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.625rem",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.2s",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                  : "transparent",
              color: activeTab === tab.id ? "#fff" : "#64748b",
              boxShadow:
                activeTab === tab.id
                  ? "0 2px 12px rgba(59,130,246,0.35)"
                  : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "inbox" ? <InboxTab /> : <SettingsTab />}
    </div>
  );
}
