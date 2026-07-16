import { useState, useMemo } from "react";
import { getCharacterClass, getAvatarUrl } from "../data/mockData";
import { ClassIcon, Card } from "./UIComponents";
import { getUnlockedAchievements } from "../data/achievements";
import { sfx } from "../utils/audio";

const ShieldIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrendingUpIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default function RadarChart({ student, opponent, semContext, theme: C, isMobile }) {
  const [activeTerm, setActiveTerm] = useState("all"); // "sem1" | "sem2" | "all"

  if (!student) return null;

  const g1 = parseFloat(student.sem1.sgpa);
  const g2 = student.sem2 ? parseFloat(student.sem2.sgpa) : 0;
  const cgpaVal = student.sem2 ? ((g1 + g2) / 2).toFixed(2) : g1.toFixed(2);

  const charClass = getCharacterClass(cgpaVal);
  const combatPower = Math.round(cgpaVal * 1000);

  // Opponent calculations if in duel mode
  const oppG1 = opponent ? parseFloat(opponent.sem1.sgpa) : 0;
  const oppG2 = opponent && opponent.sem2 ? parseFloat(opponent.sem2.sgpa) : 0;
  const oppCgpa = opponent ? (opponent.sem2 ? ((oppG1 + oppG2) / 2).toFixed(2) : oppG1.toFixed(2)) : 0;

  // SVG dimensions for GPA line progression
  const width = 320;
  const height = 180;
  const padding = 30;

  // Grid coordinates mapping
  const getCoordinates = (val, index) => {
    // index 0 = Sem 1, index 1 = Sem 2, index 2 = CGPA
    const x = padding + (index * (width - 2 * padding)) / 2;
    const y = height - padding - ((val / 10) * (height - 2 * padding));
    return { x, y };
  };

  const p1Points = [
    getCoordinates(g1, 0),
    ...(student.sem2 ? [getCoordinates(g2, 1), getCoordinates(parseFloat(cgpaVal), 2)] : [])
  ];

  const p2Points = opponent ? [
    getCoordinates(oppG1, 0),
    ...(opponent.sem2 ? [getCoordinates(oppG2, 1), getCoordinates(parseFloat(oppCgpa), 2)] : [])
  ] : [];

  const getPathD = (pts) => {
    if (pts.length === 0) return "";
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* RPG Profile Badge */}
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: `0 8px 30px rgba(0,0,0,0.12)`,
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: -30,
          left: -30,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: charClass.glow,
          filter: "blur(20px)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 10,
            background: charClass.color + "1a",
            border: `2px solid ${charClass.color}`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 12px ${charClass.color}40`
          }}>
            <img
              src={getAvatarUrl(student)}
              alt={`${student.name}'s Avatar`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: charClass.color,
            border: `1.5px solid ${C.surface}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 900,
            color: "#ffffff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
          }}>
            {cgpaVal >= 9.0 ? "S" : cgpaVal >= 8.0 ? "A" : cgpaVal >= 7.0 ? "B" : cgpaVal >= 6.0 ? "C" : "D"}
          </div>
        </div>

        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="eyebrow" style={{ fontSize: 9, color: charClass.color, fontWeight: 700 }}>
              Class Archetype
            </span>
            <span style={{ fontSize: 9, color: C.muted, background: C.raised, padding: "2px 6px", borderRadius: 4, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ClassIcon classTitle={charClass.title} color={charClass.color} size={10} />
              <span>LVL {Math.floor(cgpaVal * 10)}</span>
            </span>
          </div>
          <h3 style={{ margin: "2px 0", fontSize: 16, fontWeight: 800, color: C.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{charClass.title}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: "monospace" }}>
              {combatPower} CP
            </span>
          </h3>
          <p style={{ margin: 0, fontSize: 11, color: C.muted, opacity: 0.9 }}>
            {charClass.desc}
          </p>
        </div>
      </div>

      {/* GPA Progression Curve Panel */}
      <Card theme={C}>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h4 className="heading-card" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <TrendingUpIcon size={14} color={C.gold} /> GPA Progression
            </h4>
            <span style={{ fontSize: 10, color: C.dim }}>
              {opponent ? "Interactive Duel GPA Progression" : "Visualizing GPA term-wise performance"}
            </span>
          </div>

          {/* Legends */}
          <div style={{ display: "flex", gap: 14, fontSize: 10, fontWeight: 600, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold }} />
              <span style={{ color: C.text }}>{student.name.split(" ")[0]} ({cgpaVal})</span>
            </div>
            {opponent && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} />
                <span style={{ color: C.text }}>{opponent.name.split(" ")[0]} ({oppCgpa})</span>
              </div>
            )}
          </div>

          {/* Chart SVG */}
          <div style={{ width: "100%", maxWidth: width, position: "relative" }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ overflow: "visible" }}>
              {/* Horizontal Grid lines (y = 4.0, 6.0, 8.0, 10.0) */}
              {[4, 6, 8, 10].map((level) => {
                const yCoord = height - padding - ((level / 10) * (height - 2 * padding));
                return (
                  <g key={level}>
                    <line x1={padding} y1={yCoord} x2={width - padding} y2={yCoord} stroke={C.border} strokeDasharray="3,3" strokeWidth="0.8" />
                    <text x={padding - 8} y={yCoord + 3} fill={C.dim} fontSize="8" textAnchor="end" fontFamily="monospace">{level.toFixed(1)}</text>
                  </g>
                );
              })}

              {/* Vertical term labels */}
              {["Sem 1", "Sem 2", "CGPA"].map((label, idx) => {
                // If student doesn't have sem 2, only draw Sem 1 label
                if (idx > 0 && !student.sem2) return null;
                const xCoord = padding + (idx * (width - 2 * padding)) / 2;
                return (
                  <g key={label}>
                    <line x1={xCoord} y1={padding} x2={xCoord} y2={height - padding} stroke={C.border} strokeWidth="0.8" />
                    <text x={xCoord} y={height - padding + 12} fill={C.dim} fontSize="9" textAnchor="middle" fontWeight="600">{label}</text>
                  </g>
                );
              })}

              {/* Line Paths */}
              {opponent && p2Points.length > 0 && (
                <path
                  d={getPathD(p2Points)}
                  fill="none"
                  stroke={C.amber}
                  strokeWidth="2.5"
                  style={{ strokeDasharray: "4,4", transition: "all 0.3s ease" }}
                />
              )}

              {p1Points.length > 0 && (
                <path
                  d={getPathD(p1Points)}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth="3"
                  style={{ transition: "all 0.3s ease" }}
                />
              )}

              {/* Data Dots (Player 1) */}
              {p1Points.map((p, idx) => (
                <circle
                  key={`p1-dot-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill={C.gold}
                  stroke={C.surface}
                  strokeWidth="1.5"
                />
              ))}

              {/* Data Dots (Player 2) */}
              {opponent && p2Points.map((p, idx) => (
                <circle
                  key={`p2-dot-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill={C.amber}
                  stroke={C.surface}
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}
