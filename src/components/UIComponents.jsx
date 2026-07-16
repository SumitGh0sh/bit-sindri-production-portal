
export const Pill = ({ children, color = "#5e6ad2", style = {} }) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "9999px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
    background: color + "12",
    border: `1px solid ${color}25`,
    color,
    ...style
  }}>
    {children}
  </span>
);

export const Card = ({ children, theme, style = {}, className = "", ...props }) => (
  <div
    className={`animate-fade-in ${className}`}
    style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      ...style
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = theme.borderHi;
      e.currentTarget.style.background = theme.raised;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = theme.border;
      e.currentTarget.style.background = theme.surface;
    }}
    {...props}
  >
    {children}
  </div>
);

export const Label = ({ children, theme, style = {} }) => (
  <label style={{
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: theme.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    ...style
  }}>
    {children}
  </label>
);

export const Input = ({ theme, style = {}, className = "shadcn-input", ...props }) => (
  <input
    className={className}
    style={{
      width: "100%",
      padding: "8px 12px",
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      color: theme.text,
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      ...style
    }}
    {...props}
  />
);

export const Select = ({ theme, children, style = {}, className = "shadcn-select", ...props }) => (
  <select
    className={className}
    style={{
      padding: "8px 12px",
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      color: theme.text,
      fontSize: 13,
      outline: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      boxSizing: "border-box",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      ...style
    }}
    {...props}
  >
    {children}
  </select>
);

export const Button = ({ theme, children, variant = "primary", style = {}, ...props }) => {
  let bg = theme.gold; // Lavender Accent
  let fg = "#ffffff";
  let border = "1px solid transparent";

  if (variant === "secondary") {
    bg = theme.surface;
    fg = theme.text;
    border = `1px solid ${theme.border}`;
  } else if (variant === "outline") {
    bg = "transparent";
    fg = theme.text;
    border = `1px solid ${theme.border}`;
  } else if (variant === "ghost") {
    bg = "transparent";
    fg = theme.muted;
    border = "1px solid transparent";
  }

  return (
    <button
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.background = theme.goldDim; // hover state (#828fff)
        } else if (variant === "secondary" || variant === "outline") {
          e.currentTarget.style.background = theme.raised;
          e.currentTarget.style.borderColor = theme.borderHi;
        } else if (variant === "ghost") {
          e.currentTarget.style.background = theme.raised;
          e.currentTarget.style.color = theme.text;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.background = theme.gold;
        } else if (variant === "secondary") {
          e.currentTarget.style.background = theme.surface;
          e.currentTarget.style.borderColor = theme.border;
        } else if (variant === "outline") {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = theme.border;
        } else if (variant === "ghost") {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = theme.muted;
        }
      }}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border,
        background: bg,
        color: fg,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: "inherit",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export const ClassIcon = ({ classTitle, color = "currentColor", size = 12, style = {} }) => {
  const t = (classTitle || "").toUpperCase();
  if (t.includes("SAGE")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        <path d="m21 3-9 9" />
        <path d="m15 3 6 6" />
        <path d="M10 8.5 8.5 10" />
        <path d="M16 14.5 14.5 16" />
        <path d="M19 11.5 17.5 13" />
        <path d="M13 5.5 11.5 7" />
        <path d="m7 17-4 4" />
        <path d="m17 7-4 4" />
      </svg>
    );
  }
  if (t.includes("SPECIALIST")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
    );
  }
  if (t.includes("SPELLSWORD")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" y1="19" x2="19" y2="13" />
        <line x1="16" y1="16" x2="20" y2="20" />
        <line x1="19" y1="21" x2="21" y2="19" />
      </svg>
    );
  }
  if (t.includes("VANGUARD")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (t.includes("INITIATE")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
        <path d="M9 22v-4" />
      </svg>
    );
  }
  // Challenger / Default
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
};

export const Slider = ({ label, min, max, step, value, onChange, theme: C, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
      <span>{label}</span>
      <span style={{ color: C.gold, fontFamily: "monospace" }}>{parseFloat(value).toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        height: 6,
        borderRadius: 3,
        background: C.border,
        outline: "none",
        WebkitAppearance: "none",
        cursor: "pointer",
        accentColor: C.gold
      }}
      {...props}
    />
  </div>
);