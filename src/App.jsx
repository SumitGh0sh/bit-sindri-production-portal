import { useState, useEffect, useMemo, useRef } from "react";
import { toPng } from "html-to-image";
import { gsap } from "gsap";
import { sfx } from "./utils/audio";
import { STUDENTS, studentRanks, getCharacterClass, getAvatarUrl } from "./data/mockData";
import { getUnlockedAchievements } from "./data/achievements";
import RadarChart from "./components/RadarChart";
import { Card, Button, ClassIcon } from "./components/UIComponents";

// Clean Outline SVG Icons
const SwordIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="15" y1="5" x2="19" y2="9" />
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="5" y1="9" x2="9" y2="5" />
  </svg>
);

const ShieldIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrophyIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z" />
  </svg>
);

const CrownIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M3 20h18" />
  </svg>
);

const WarningIcon = ({ color, size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", ...style }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const DownloadIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SoundIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SoundMuteIcon = ({ color = "currentColor", size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 1024 : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

export default function ProductionPortal() {
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState("dark");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Search profiles state
  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [searchError, setSearchError] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);

  // Battle Mode states
  const [compareMode, setCompareMode] = useState(false);
  const [oppRoll, setOppRoll] = useState("");
  const [oppName, setOppName] = useState("");
  const [opponentStudent, setOpponentStudent] = useState(null);
  const [battleActive, setBattleActive] = useState(false);

  // Tab & Semester views
  const [tab, setTab] = useState(0); // 0: Report Card, 1: Toppers, 2: Class Analytics, 3: Student Ledger
  const [semContext, setSemContext] = useState("cumulative"); // "1" | "2" | "cumulative"
  const [topperSubject, setTopperSubject] = useState("grand"); // "grand" | "sem1" | "sem2"

  // Active student reference (for details tab)
  const activeStudent = foundStudent;

  // Sound FX logic
  useEffect(() => {
    sfx.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => sfx.playSelect(), 100);
    }
  };

  // Color theme configurations
  const C = {
    background: theme === "dark" ? "#010102" : "#fafafb",
    surface: theme === "dark" ? "#0b0c10" : "#ffffff",
    raised: theme === "dark" ? "#12131a" : "#f1f3f6",
    border: theme === "dark" ? "#1f222d" : "#e4e7eb",
    text: theme === "dark" ? "#f3f4f6" : "#1f2937",
    muted: theme === "dark" ? "#9ca3af" : "#6b7280",
    dim: theme === "dark" ? "#6b7280" : "#9ca3af",
    gold: "#5e6ad2", // Periwinkle Primary Accent
    amber: "#f59e0b", // Gold/Amber Secondary Accent
    green: "#10b981", // Success green
    red: "#ef4444" // Warning red
  };

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme-grid" : "light-theme-grid";
  }, [theme]);

  // Search logic
  const handleSearch = (rQuery = roll, nQuery = name) => {
    setSearchError("");
    setFoundStudent(null);
    const r = rQuery.trim().toUpperCase();
    const n = nQuery.trim().toUpperCase();

    if (!r && !n) {
      setSearchError("Please fill in at least one field to search.");
      sfx.playError();
      return;
    }

    const s = STUDENTS.find((st) => {
      const matchRoll = r && st.rollNo.toUpperCase() === r;
      const matchName = n && st.name.toUpperCase().includes(n);
      return matchRoll || matchName;
    });

    if (s) {
      setFoundStudent(s);
      sfx.playLevelUp();
      setTab(0); // open report card
    } else {
      setSearchError("No student record matches query.");
      sfx.playError();
    }
  };

  // Initiate battle duel comparison
  const handleInitiateBattle = () => {
    if (!foundStudent) {
      setSearchError("Find Player 1 profile first.");
      sfx.playError();
      return;
    }
    const r = oppRoll.trim().toUpperCase();
    const n = oppName.trim().toUpperCase();

    if (!r && !n) {
      setSearchError("Please fill in Player 2 Roll No or Name.");
      sfx.playError();
      return;
    }

    const opp = STUDENTS.find((st) => {
      const matchRoll = r && st.rollNo.toUpperCase() === r;
      const matchName = n && st.name.toUpperCase().includes(n);
      return matchRoll || matchName;
    });

    if (opp) {
      if (opp.rollNo === foundStudent.rollNo) {
        setSearchError("Cannot duel/compare the same student.");
        sfx.playError();
        return;
      }
      setOpponentStudent(opp);
      setBattleActive(true);
      sfx.playLevelUp(); // play success level up chime
    } else {
      setSearchError("Player 2 student record not found.");
      sfx.playError();
      setBattleActive(false);
    }
  };

  // Render GPA Differential Box
  const renderStandingComparison = () => {
    if (!foundStudent || !opponentStudent) return null;
    const r1_1 = studentRanks[foundStudent.rollNo].r1;
    const r1_2 = studentRanks[opponentStudent.rollNo].r1;
    const r2_1 = studentRanks[foundStudent.rollNo].r2;
    const r2_2 = studentRanks[opponentStudent.rollNo].r2;
    const rc_1 = studentRanks[foundStudent.rollNo].rc;
    const rc_2 = studentRanks[opponentStudent.rollNo].rc;

    const getDiffBadge = (val1, val2) => {
      if (val1 === "-" || val2 === "-") return <span style={{ fontSize: 9, color: C.muted }}>Held</span>;
      const diff = val2 - val1;
      if (diff > 0) return <span style={{ fontSize: 9, color: C.green, fontWeight: 700 }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }}><path d="M12 4l-8 12h16z"/></svg> Player 1 (+{diff} ranks ahead)</span>;
      if (diff < 0) return <span style={{ fontSize: 9, color: C.amber, fontWeight: 700 }}><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }}><path d="M12 20l8-12H4z"/></svg> Player 2 (+{-diff} ranks ahead)</span>;
      return <span style={{ fontSize: 9, color: C.muted }}>Tied</span>;
    };

    return (
      <Card theme={C}>
        <div style={{ padding: 20 }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <TrophyIcon size={14} style={{ marginRight: 6 }} /> Academic Standing Differential
          </h4>
          <div className="aesthetic-scrollbar" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(140px, 1fr))", gap: 12, overflowX: "auto", maxWidth: "100%", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
            <div style={{ padding: 12, borderRadius: 8, background: C.raised, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Sem 1 Rank</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: "4px 0" }}>#{r1_1} vs #{r1_2}</div>
              {getDiffBadge(r1_1, r1_2)}
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: C.raised, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Sem 2 Rank</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: "4px 0" }}>#{r2_1} vs #{r2_2}</div>
              {getDiffBadge(r2_1, r2_2)}
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: C.raised, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Year 1 Rank</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, margin: "4px 0" }}>#{rc_1} vs #{rc_2}</div>
              {getDiffBadge(rc_1, rc_2)}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Render GPA Comparison Duel Card
  const renderUnifiedGpaTable = () => {
    if (!foundStudent || !opponentStudent) return null;
    const data1 = foundStudent;
    const data2 = opponentStudent;

    const g1_1 = parseFloat(data1.sem1.sgpa);
    const g1_2 = data1.sem2 ? parseFloat(data1.sem2.sgpa) : 0;
    const cgpa1 = data1.sem2 ? ((g1_1 + g1_2) / 2) : g1_1;

    const g2_1 = parseFloat(data2.sem1.sgpa);
    const g2_2 = data2.sem2 ? parseFloat(data2.sem2.sgpa) : 0;
    const cgpa2 = data2.sem2 ? ((g2_1 + g2_2) / 2) : g2_1;

    return (
      <Card theme={C}>
        <div style={{ padding: 24 }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <SwordIcon size={14} style={{ marginRight: 6 }} /> Term-wise GPA Combat
          </h4>

          <div className="aesthetic-scrollbar" style={{ overflowX: "auto", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600 }}>Term</th>
                  <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>{data1.name.split(" ")[0]}</th>
                  <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>{data2.name.split(" ")[0]}</th>
                  <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>Victor</th>
                </tr>
              </thead>
              <tbody>
                {/* Semester 1 Row */}
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: C.muted }}>Semester 1 SGPA</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: g1_1 > g2_1 ? C.gold : C.text, fontWeight: g1_1 > g2_1 ? 700 : 500 }}>{g1_1.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: g2_1 > g1_1 ? C.amber : C.text, fontWeight: g2_1 > g1_1 ? 700 : 500 }}>{g2_1.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      background: (g1_1 === g2_1 ? C.muted : (g1_1 > g2_1 ? C.gold : C.amber)) + "15",
                      border: `1px solid ${g1_1 === g2_1 ? C.muted : (g1_1 > g2_1 ? C.gold : C.amber)}30`,
                      color: g1_1 === g2_1 ? C.muted : (g1_1 > g2_1 ? C.gold : C.amber)
                    }}>
                      {g1_1 === g2_1 ? "Tie" : (
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          <CrownIcon size={10} style={{ marginRight: 4 }} />
                          <span>{g1_1 > g2_1 ? data1.name.split(" ")[0] : data2.name.split(" ")[0]}</span>
                        </span>
                      )}
                    </span>
                  </td>
                </tr>

                {/* Semester 2 Row */}
                {data1.sem2 && data2.sem2 && (
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: C.muted }}>Semester 2 SGPA</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: g1_2 > g2_2 ? C.gold : C.text, fontWeight: g1_2 > g2_2 ? 700 : 500 }}>{g1_2.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: g2_2 > g1_2 ? C.amber : C.text, fontWeight: g2_2 > g1_2 ? 700 : 500 }}>{g2_2.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 800,
                        background: (g1_2 === g2_2 ? C.muted : (g1_2 > g2_2 ? C.gold : C.amber)) + "15",
                        border: `1px solid ${g1_2 === g2_2 ? C.muted : (g1_2 > g2_2 ? C.gold : C.amber)}30`,
                        color: g1_2 === g2_2 ? C.muted : (g1_2 > g2_2 ? C.gold : C.amber)
                      }}>
                        {g1_2 === g2_2 ? "Tie" : (
                          <span style={{ display: "inline-flex", alignItems: "center" }}>
                            <CrownIcon size={10} style={{ marginRight: 4 }} />
                            <span>{g1_2 > g2_2 ? data1.name.split(" ")[0] : data2.name.split(" ")[0]}</span>
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                )}

                {/* Cumulative CGPA Row */}
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: C.muted }}>Cumulative CGPA</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: cgpa1 > cgpa2 ? C.gold : C.text, fontWeight: cgpa1 > cgpa2 ? 700 : 500 }}>{cgpa1.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: cgpa2 > cgpa1 ? C.amber : C.text, fontWeight: cgpa2 > cgpa1 ? 700 : 500 }}>{cgpa2.toFixed(2)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      background: (cgpa1 === cgpa2 ? C.muted : (cgpa1 > cgpa2 ? C.gold : C.amber)) + "15",
                      border: `1px solid ${cgpa1 === cgpa2 ? C.muted : (cgpa1 > cgpa2 ? C.gold : C.amber)}30`,
                      color: cgpa1 === cgpa2 ? C.muted : (cgpa1 > cgpa2 ? C.gold : C.amber)
                    }}>
                      {cgpa1 === cgpa2 ? "Tie" : (
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          <CrownIcon size={10} style={{ marginRight: 4 }} />
                          <span>{cgpa1 > cgpa2 ? data1.name.split(" ")[0] : data2.name.split(" ")[0]}</span>
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  };

  // Render Achievements Comparison Duel List
  const renderAchievementsDuel = () => {
    if (!foundStudent || !opponentStudent) return null;
    const u1 = getUnlockedAchievements(foundStudent);
    const u2 = getUnlockedAchievements(opponentStudent);

    return (
      <Card theme={C}>
        <div style={{ padding: 20 }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <CrownIcon size={14} style={{ marginRight: 6 }} /> Achievements Duel
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {/* Player 1 Quests */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>{foundStudent.name.split(" ")[0]}'s Quests ({u1.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {u1.map((ach) => (
                  <div key={ach.title} style={{ padding: "6px 10px", background: C.raised, borderRadius: 6, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12 }}>{ach.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{ach.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Player 2 Quests */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: "uppercase", marginBottom: 6 }}>{opponentStudent.name.split(" ")[0]}'s Quests ({u2.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {u2.map((ach) => (
                  <div key={ach.title} style={{ padding: "6px 10px", background: C.raised, borderRadius: 6, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12 }}>{ach.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{ach.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // GPA Scorecard Download Area
  const downloadRef = useRef(null);
  const handleDownloadScorecard = () => {
    if (!activeStudent || !downloadRef.current) return;
    sfx.playSelect();
    
    toPng(downloadRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${activeStudent.name.replace(/\s+/g, "_")}_BIT_Sindri_GPA_Report.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Scorecard generation error:", err);
      });
  };

  return (
    <div style={{ background: C.background, color: C.text, minHeight: "100vh", paddingBottom: 40, transition: "all 0.3s ease" }}>
      {/* Dynamic Header */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        padding: "14px 20px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${C.gold}, ${C.amber})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: "#ffffff",
              boxShadow: `0 0 12px ${C.gold}50`
            }}>
              B
            </div>
            <div>
              <div style={{ fontSize: 8, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>BIT Sindri</div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: -0.2 }}>PE Academic GPA Portal</h2>
            </div>
          </div>

          {/* Top Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.raised,
                color: C.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Toggle Sounds"
            >
              {soundEnabled ? <SoundIcon size={14} /> : <SoundMuteIcon size={14} />}
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                sfx.playSelect();
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.raised,
                color: C.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px" }}>
        
        {/* Duel Mode Toggle Card */}
        <div style={{ marginBottom: 16 }}>
          <Card theme={C}>
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>Academic Duel (Combat Mode)</h3>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Toggle side-by-side comparative GPA analysis fields.</p>
              </div>
              <button
                onClick={() => {
                  setCompareMode(!compareMode);
                  setBattleActive(false);
                  sfx.playSelect();
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${compareMode ? C.gold : C.border}`,
                  background: compareMode ? C.gold + "15" : C.raised,
                  color: compareMode ? C.gold : C.text,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <SwordIcon size={12} />
                <span>{compareMode ? "Single Mode" : "Duel Mode"}</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Input Cards: Search forms */}
        <div style={{ display: "grid", gridTemplateColumns: (compareMode && !battleActive) ? (isMobile ? "1fr" : "1fr 1fr") : "1fr", gap: 16, marginBottom: 16 }}>
          {/* Player 1 Search Card */}
          <Card theme={C}>
            <div style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: C.text }}>
                {compareMode ? "PLAYER 1: Primary Profile" : "Lookup Academic Records"}
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>Search results instantly using either university Roll No or Student Name.</p>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: 12, alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>University Roll No</label>
                  <input
                    type="text"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder="e.g. 230113"
                    style={{ width: "90%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                  />
                </div>
                <div style={{ textAlign: "center", paddingBottom: 10, color: C.dim, fontSize: 11, fontWeight: 700 }}>OR</div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Student Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sumit Ghosh"
                    style={{ width: "90%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <Button theme={C} onClick={() => handleSearch(roll, name)}>Search Student</Button>
              </div>
            </div>
          </Card>

          {/* Player 2 Duelist search card */}
          {compareMode && !battleActive && (
            <Card theme={C}>
              <div style={{ padding: 24 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: C.text }}>PLAYER 2: Opponent Profile</h3>
                <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>Select your rival duelist profile to configure the comparison canvas.</p>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: 12, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Opponent Roll No</label>
                    <input
                      type="text"
                      value={oppRoll}
                      onChange={(e) => setOppRoll(e.target.value)}
                      placeholder="e.g. 230114"
                      style={{ width: "90%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                    />
                  </div>
                  <div style={{ textAlign: "center", paddingBottom: 10, color: C.dim, fontSize: 11, fontWeight: 700 }}>OR</div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Opponent Name</label>
                    <input
                      type="text"
                      value={oppName}
                      onChange={(e) => setOppName(e.target.value)}
                      placeholder="e.g. Payal"
                      style={{ width: "90%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button onClick={() => { setOppRoll(""); setOppName(""); sfx.playSelect(); }} style={{ padding: "8px 16px", background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Clear</button>
                  <Button theme={C} onClick={handleInitiateBattle}>Initiate Academic Duel</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Global Error Banner */}
        {searchError && (
          <div style={{ padding: "12px 16px", background: C.red + "15", border: `1px solid ${C.red}30`, borderRadius: 10, color: C.red, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <WarningIcon color={C.red} size={14} />
            <span>{searchError}</span>
          </div>
        )}

        {/* Active Combat Dashboard / Comparison UI */}
        {compareMode && battleActive && opponentStudent && foundStudent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Visual VS Avatar Header Banner */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: 16, alignItems: "center", padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              {/* Player 1 Card */}
              <div style={{ padding: 16, background: C.gold + "0a", border: `1px solid ${C.gold}20`, borderRadius: 8, display: "flex", alignItems: "center", gap: 14 }}>
                <img src={getAvatarUrl(foundStudent)} style={{ width: 44, height: 44, borderRadius: 8, background: C.raised }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{foundStudent.name}</h4>
                  <span style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>PE Class Archetype</span>
                </div>
              </div>

              {/* VS Divider Badge */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: C.red,
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 900
                }}>
                  VS
                </span>
              </div>

              {/* Player 2 Card */}
              <div style={{ padding: 16, background: C.amber + "0a", border: `1px solid ${C.amber}20`, borderRadius: 8, display: "flex", alignItems: "center", gap: 14 }}>
                <img src={getAvatarUrl(opponentStudent)} style={{ width: 44, height: 44, borderRadius: 8, background: C.raised }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{opponentStudent.name}</h4>
                  <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>Opponent duelist</span>
                </div>
              </div>
            </div>

            {/* Compare Columns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr",
              gap: 16,
              alignItems: "start"
            }}>
              {/* Left Column: standing details & unified subject combat tables */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                {renderStandingComparison()}
                {renderUnifiedGpaTable()}
              </div>

              {/* Right Column: Comparative Charts & Achievements */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                <RadarChart
                  student={foundStudent}
                  opponent={opponentStudent}
                  semContext={semContext}
                  theme={C}
                  isMobile={isMobile}
                />
                {renderAchievementsDuel()}
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button
                onClick={() => {
                  setBattleActive(false);
                  setOpponentStudent(null);
                  sfx.playSelect();
                }}
                style={{ padding: "8px 18px", borderRadius: 8, background: C.raised, border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                Exit Duel Canvas
              </button>
            </div>
          </div>
        ) : (
          /* Single student results dashboard */
          activeStudent && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Term switcher tabs bar */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                {/* Semester selector context */}
                <div style={{
                  display: "inline-flex",
                  background: C.surface,
                  padding: 2,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  gap: 2,
                  overflowX: "auto",
                  maxWidth: "100%",
                  scrollbarWidth: "none"
                }}>
                  {[
                    { id: "1", label: "Semester 1" },
                    { id: "2", label: "Semester 2" },
                    { id: "cumulative", label: "Cumulative / Year 1" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSemContext(s.id);
                        sfx.playSelect();
                      }}
                      style={{
                        flex: 1,
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: `1px solid ${semContext === s.id ? C.border : "transparent"}`,
                        background: semContext === s.id ? C.raised : "transparent",
                        color: semContext === s.id ? C.text : C.muted,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
                  {[
                    { id: 0, label: "Report Card" },
                    { id: 1, label: "Toppers" },
                    { id: 2, label: "Class Analytics" },
                    { id: 3, label: "Student Ledger" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTab(t.id); sfx.playSelect(); }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${tab === t.id ? C.border : "transparent"}`,
                        background: tab === t.id ? C.surface : "transparent",
                        color: tab === t.id ? C.text : C.muted,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Tabs Contents */}
              {tab === 0 && (
                /* Report Card View */
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: 16, alignItems: "start" }}>
                  {/* Left block: Scorecard Download & GPA overview */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Visual Printable Scorecard Template */}
                    <Card theme={C}>
                      <div style={{ overflow: "hidden", position: "relative" }}>
                        {/* Hidden Printable Container */}
                        <div style={{ position: "absolute", left: -9999, top: -9999 }}>
                          <div ref={downloadRef} style={{
                            width: 600,
                            padding: 40,
                            background: "#0b0c10",
                            color: "#f3f4f6",
                            fontFamily: "'Inter', sans-serif",
                            border: "1px solid #1f222d",
                            borderRadius: 16,
                            position: "relative"
                          }}>
                            {/* Decorative background grids */}
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(135deg, rgba(94,106,210,0.15), transparent)", pointerEvents: "none" }} />
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
                              <div>
                                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>BIT Sindri Academic Report</div>
                                <h2 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: "#f3f4f6" }}>Production Engineering</h2>
                                <div style={{ fontSize: 11, color: "#5e6ad2", fontWeight: 600, marginTop: 4 }}>GPA Scorecard</div>
                              </div>
                              <div style={{ padding: "6px 12px", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#5e6ad2" }}>
                                Level {Math.floor(parseFloat(cgpaVal) * 10)}
                              </div>
                            </div>

                            <div style={{ background: "#12131a", padding: 20, borderRadius: 12, border: "1px solid #1f222d", marginBottom: 24, display: "flex", gap: 20, alignItems: "center" }}>
                              <div style={{ width: 60, height: 60, borderRadius: 8, border: "2px solid #5e6ad2", background: "rgba(94,106,210,0.1)", display: "flex", alignItems: "center", justifyCenter: "center", overflow: "hidden" }}>
                                <img src={getAvatarUrl(activeStudent)} style={{ width: "100%", height: "100%" }} />
                              </div>
                              <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f3f4f6" }}>{activeStudent.name}</h3>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Roll No: {activeStudent.rollNo}</div>
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                              <div style={{ padding: 14, background: "#12131a", border: "1px solid #1f222d", borderRadius: 10, textAlign: "center" }}>
                                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Sem 1 GPA</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#f3f4f6", margin: "4px 0" }}>{parseFloat(activeStudent.sem1.sgpa).toFixed(2)}</div>
                                <div style={{ fontSize: 9, color: "#10b981", fontWeight: 700 }}>{activeStudent.sem1.status}</div>
                              </div>
                              <div style={{ padding: 14, background: "#12131a", border: "1px solid #1f222d", borderRadius: 10, textAlign: "center" }}>
                                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Sem 2 GPA</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#f3f4f6", margin: "4px 0" }}>{activeStudent.sem2 ? parseFloat(activeStudent.sem2.sgpa).toFixed(2) : "N/A"}</div>
                                <div style={{ fontSize: 9, color: activeStudent.sem2 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{activeStudent.sem2 ? activeStudent.sem2.status : "Missing"}</div>
                              </div>
                              <div style={{ padding: 14, background: "#12131a", border: "1px solid #1f222d", borderRadius: 10, textAlign: "center" }}>
                                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Cumulative CGPA</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#5e6ad2", margin: "4px 0" }}>{cgpaVal}</div>
                                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>Active Scholar</div>
                              </div>
                            </div>

                            <div style={{ borderTop: "1px solid #1f222d", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ fontSize: 10, color: "#9ca3af" }}>Generated on: {new Date().toLocaleDateString()}</div>
                              <div style={{ fontSize: 10, color: "#5e6ad2", fontWeight: 700, letterSpacing: 0.5 }}>PE DEPT - BIT SINDRI</div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive UI Display */}
                        <div style={{ padding: 24 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Scorecard Preview</div>
                              <h3 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: C.text }}>PE Result Sheet</h3>
                            </div>
                            <Button theme={C} onClick={handleDownloadScorecard}>
                              <DownloadIcon size={12} style={{ marginRight: 6 }} /> Download Scorecard PNG
                            </Button>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
                            <div style={{ padding: 16, background: C.raised, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
                              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Semester 1 GPA</div>
                              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "6px 0" }}>{parseFloat(activeStudent.sem1.sgpa).toFixed(2)}</div>
                              <span style={{ fontSize: 10, background: C.green + "15", color: C.green, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{activeStudent.sem1.status}</span>
                            </div>
                            <div style={{ padding: 16, background: C.raised, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
                              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Semester 2 GPA</div>
                              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "6px 0" }}>{activeStudent.sem2 ? parseFloat(activeStudent.sem2.sgpa).toFixed(2) : "N/A"}</div>
                              <span style={{ fontSize: 10, background: (activeStudent.sem2 ? C.green : C.red) + "15", color: activeStudent.sem2 ? C.green : C.red, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{activeStudent.sem2 ? activeStudent.sem2.status : "N/A"}</span>
                            </div>
                            <div style={{ padding: 16, background: C.raised, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
                              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Cumulative CGPA</div>
                              <div style={{ fontSize: 24, fontWeight: 800, color: C.gold, margin: "6px 0" }}>{cgpaVal}</div>
                              <span style={{ fontSize: 10, background: C.gold + "15", color: C.gold, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>Year 1</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </Card>

                    {/* Ranks Standing Card */}
                    <Card theme={C}>
                      <div style={{ padding: 20 }}>
                        <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <TrophyIcon size={14} style={{ marginRight: 6 }} /> Departmental Rank Standing
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
                          <div style={{ padding: 14, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Sem 1 Rank</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 4 }}>#{studentRanks[activeStudent.rollNo].r1}</div>
                          </div>
                          <div style={{ padding: 14, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Sem 2 Rank</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 4 }}>#{studentRanks[activeStudent.rollNo].r2}</div>
                          </div>
                          <div style={{ padding: 14, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Cumulative Rank</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: C.gold, marginTop: 4 }}>#{studentRanks[activeStudent.rollNo].rc}</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right block: GPA progression and Quests */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <RadarChart student={activeStudent} opponent={null} semContext={semContext} theme={C} isMobile={isMobile} />

                    {/* Quests achievements */}
                    <Card theme={C}>
                      <div style={{ padding: 20 }}>
                        <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <CrownIcon size={14} style={{ marginRight: 6 }} /> Unlocked Achievements
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {getUnlockedAchievements(activeStudent).map((ach) => (
                            <div key={ach.title} style={{ padding: 10, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 16 }}>{ach.icon}</span>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{ach.title}</div>
                                <div style={{ fontSize: 10, color: C.muted }}>{ach.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {tab === 1 && (
                /* Toppers List View */
                <Card theme={C}>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>PE Department Toppers</h3>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>The elite scoring minds of the Production Engineering branch.</p>
                      </div>

                      {/* Topper term selection buttons */}
                      <div style={{ display: "flex", gap: 4, background: C.raised, padding: 3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                        {[
                          { id: "grand", label: "Grand" },
                          { id: "sem1", label: "Sem 1" },
                          { id: "sem2", label: "Sem 2" }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => { setTopperSubject(btn.id); sfx.playSelect(); }}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "none",
                              background: topperSubject === btn.id ? C.gold : "transparent",
                              color: topperSubject === btn.id ? "#ffffff" : C.muted,
                              cursor: "pointer"
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                      {/* Compute toppers based on selection */}
                      {(() => {
                        let sortedList = [];
                        if (topperSubject === "sem1") {
                          sortedList = [...STUDENTS].sort((a, b) => parseFloat(b.sem1.sgpa) - parseFloat(a.sem1.sgpa));
                        } else if (topperSubject === "sem2") {
                          sortedList = [...STUDENTS].filter(s => s.sem2).sort((a, b) => parseFloat(b.sem2.sgpa) - parseFloat(a.sem2.sgpa));
                        } else {
                          sortedList = [...STUDENTS].sort((a, b) => {
                            const cgpaB = b.sem2 ? (parseFloat(b.sem1.sgpa) + parseFloat(b.sem2.sgpa)) / 2 : parseFloat(b.sem1.sgpa);
                            const cgpaA = a.sem2 ? (parseFloat(a.sem1.sgpa) + parseFloat(a.sem2.sgpa)) / 2 : parseFloat(a.sem1.sgpa);
                            return cgpaB - cgpaA;
                          });
                        }

                        return sortedList.slice(0, 3).map((st, rankIdx) => {
                          const sgpa1 = parseFloat(st.sem1.sgpa);
                          const sgpa2 = st.sem2 ? parseFloat(st.sem2.sgpa) : 0;
                          const cg = st.sem2 ? (sgpa1 + sgpa2) / 2 : sgpa1;
                          const scoreDisplay = topperSubject === "sem1" ? sgpa1.toFixed(2) : (topperSubject === "sem2" ? sgpa2.toFixed(2) : cg.toFixed(2));

                          return (
                            <div key={st.rollNo} style={{
                              background: C.raised,
                              border: `1px solid ${rankIdx === 0 ? C.gold : C.border}`,
                              borderRadius: 12,
                              padding: 20,
                              textAlign: "center",
                              position: "relative"
                            }}>
                              {/* Rank Medal Circle */}
                              <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: rankIdx === 0 ? "#f59e0b" : (rankIdx === 1 ? "#9ca3af" : "#b45309"),
                                color: "#ffffff",
                                fontSize: 11,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "absolute",
                                top: 12,
                                left: 12
                              }}>
                                {rankIdx + 1}
                              </div>

                              <img src={getAvatarUrl(st)} style={{ width: 56, height: 56, borderRadius: "50%", background: C.surface, border: `2px solid ${rankIdx === 0 ? C.gold : C.border}`, margin: "0 auto 12px" }} />
                              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.text }}>{st.name}</h4>
                              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Roll: {st.rollNo}</div>
                              <div style={{ fontSize: 18, fontWeight: 900, color: C.gold, marginTop: 10, fontFamily: "monospace" }}>{scoreDisplay} GPA</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </Card>
              )}

              {tab === 2 && (
                /* Class Analytics View */
                <Card theme={C}>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: C.text }}>Production Branch Analytics</h3>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: 20 }}>
                      {/* Summary Metrics */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* Avg GPA */}
                        <div style={{ padding: 16, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                          <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Class Average CGPA</span>
                          <h4 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 900, color: C.gold }}>
                            {(STUDENTS.reduce((acc, st) => acc + (st.sem2 ? (parseFloat(st.sem1.sgpa) + parseFloat(st.sem2.sgpa)) / 2 : parseFloat(st.sem1.sgpa)), 0) / STUDENTS.length).toFixed(2)}
                          </h4>
                        </div>
                        {/* Total Count */}
                        <div style={{ padding: 16, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                          <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Total Enrolled Combatants</span>
                          <h4 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 900, color: C.text }}>{STUDENTS.length} Students</h4>
                        </div>
                      </div>

                      {/* Visual GPA Distribution Bar chart (custom HTML) */}
                      <div style={{ padding: 20, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: C.text }}>CGPA Tier Distribution</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {(() => {
                            const tiers = [
                              { label: "9.0+ Excellent", filter: cg => cg >= 9.0, color: C.gold },
                              { label: "8.0 - 9.0 Good", filter: cg => cg >= 8.0 && cg < 9.0, color: C.gold + "bb" },
                              { label: "7.0 - 8.0 Average", filter: cg => cg >= 7.0 && cg < 8.0, color: C.gold + "77" },
                              { label: "Below 7.0 Needs Dev", filter: cg => cg < 7.0, color: C.red }
                            ];

                            return tiers.map((t) => {
                              const count = STUDENTS.filter(st => {
                                const cg = st.sem2 ? (parseFloat(st.sem1.sgpa) + parseFloat(st.sem2.sgpa)) / 2 : parseFloat(st.sem1.sgpa);
                                return t.filter(cg);
                              }).length;
                              const percent = (count / STUDENTS.length) * 100;

                              return (
                                <div key={t.label}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.text, fontWeight: 600, marginBottom: 4 }}>
                                    <span>{t.label}</span>
                                    <span>{count} ({Math.round(percent)}%)</span>
                                  </div>
                                  <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${percent}%`, background: t.color, height: "100%", borderRadius: 3 }} />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {tab === 3 && (
                /* Student Ledger View */
                <Card theme={C}>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: C.text }}>Branch Student Ledger</h3>
                    <div className="aesthetic-scrollbar" style={{ overflowX: "auto", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
                      <table style={{ width: "100%", minWidth: 550, borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>
                            <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600 }}>Roll No</th>
                            <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600 }}>Name</th>
                            <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>Sem 1 SGPA</th>
                            <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>Sem 2 SGPA</th>
                            <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>CGPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {STUDENTS.map((st) => {
                            const sg1 = parseFloat(st.sem1.sgpa);
                            const sg2 = st.sem2 ? parseFloat(st.sem2.sgpa) : 0;
                            const cg = st.sem2 ? (sg1 + sg2) / 2 : sg1;

                            return (
                              <tr key={st.rollNo} style={{ borderBottom: `1px solid ${C.border}` }}>
                                <td style={{ padding: "10px 12px", fontFamily: "monospace", color: C.muted }}>{st.rollNo}</td>
                                <td style={{ padding: "10px 12px", fontWeight: 700, color: C.text }}>{st.name}</td>
                                <td style={{ padding: "10px 12px", textAlign: "center", color: C.text }}>{sg1.toFixed(2)}</td>
                                <td style={{ padding: "10px 12px", textAlign: "center", color: C.text }}>{st.sem2 ? sg2.toFixed(2) : "N/A"}</td>
                                <td style={{ padding: "10px 12px", textAlign: "center", color: C.gold, fontWeight: 800 }}>{cg.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
