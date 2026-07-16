import { useState, useEffect, useMemo, useRef } from "react";
import { toPng } from "html-to-image";
import { gsap } from "gsap";
import { sfx } from "./utils/audio";
import { STUDENTS, studentRanks, getCharacterClass, getAvatarUrl } from "./data/mockData";
import { getUnlockedAchievements } from "./data/achievements";
import RadarChart from "./components/RadarChart";
import { Card, Button } from "./components/UIComponents";

// Navigation Tab Icon Helper from original BCA portal
const renderTabIcon = (id, active, C) => {
  const color = active ? C.gold : C.muted;
  const strokeWidth = 2.2;
  const size = 15;
  
  if (id === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    );
  }
  if (id === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
        <path d="M12 2a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"></path>
      </svg>
    );
  }
  if (id === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}>
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    );
  }
  if (id === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
    );
  }
  return null;
};

// SVG Outline Icons
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

  // Search input focus states
  const [rollFocused, setRollFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  // Battle Mode states
  const [compareMode, setCompareMode] = useState(false);
  const [oppRoll, setOppRoll] = useState("");
  const [oppName, setOppName] = useState("");
  const [opponentStudent, setOpponentStudent] = useState(null);
  const [battleActive, setBattleActive] = useState(false);

  // Opponent input focus states
  const [oppRollFocused, setOppRollFocused] = useState(false);
  const [oppNameFocused, setOppNameFocused] = useState(false);

  // Tab & Semester views
  const [tab, setTab] = useState(0); // 0: Report Card, 1: Toppers, 2: Class Analytics, 3: Student Ledger
  const [semContext, setSemContext] = useState("cumulative"); // "1" | "2" | "cumulative"
  const [topperSubject, setTopperSubject] = useState("grand"); // "grand" | "sem1" | "sem2"

  // Ledger Filter & Sorting states
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerFilter, setLedgerFilter] = useState("all"); // "all" | "passed" | "promoted"
  const [ledgerSort, setLedgerSort] = useState("rank"); // "rank" | "name" | "sgpa"

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

  // Color theme configurations - exactly matched from the BCA result portal
  const C = {
    bg: theme === "dark" ? "#010102" : "#fafafb",
    surface: theme === "dark" ? "#0f1011" : "#ffffff",
    raised: theme === "dark" ? "#141516" : "#f4f5f6",
    border: theme === "dark" ? "#23252a" : "#e4e4e7",
    borderHi: theme === "dark" ? "#34343a" : "#d4d4d8",
    text: theme === "dark" ? "#f7f8f8" : "#18181b",
    muted: theme === "dark" ? "#d0d6e0" : "#71717a",
    dim: theme === "dark" ? "#8a8f98" : "#a1a1aa",
    gold: "#5e6ad2", // Signature Lavender Accent
    amber: "#f59e0b", // Secondary accent
    green: theme === "dark" ? "#27a644" : "#10b981", // Success green
    red: theme === "dark" ? "#f43f5e" : "#ef4444" // Rose/Red
  };

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme-grid" : "light-theme-grid";
  }, [theme]);

  // Suggestions Calculation Logic
  const rollSuggestions = useMemo(() => {
    if (!roll.trim()) return [];
    const query = roll.trim();
    return STUDENTS.filter(st => st.rollNo.includes(query)).slice(0, 5);
  }, [roll]);

  const nameSuggestions = useMemo(() => {
    if (!name.trim()) return [];
    const query = name.toUpperCase();
    return STUDENTS.filter(st => st.name.toUpperCase().includes(query)).slice(0, 5);
  }, [name]);

  const opponentRollSuggestions = useMemo(() => {
    if (!oppRoll.trim()) return [];
    const query = oppRoll.trim();
    return STUDENTS.filter(st => st.rollNo.includes(query)).slice(0, 5);
  }, [oppRoll]);

  const opponentNameSuggestions = useMemo(() => {
    if (!oppName.trim()) return [];
    const query = oppName.toUpperCase();
    return STUDENTS.filter(st => st.name.toUpperCase().includes(query)).slice(0, 5);
  }, [oppName]);

  const selectSuggestedStudent = (student, searchType) => {
    if (searchType === "name") {
      setName(student.name);
      setRoll(student.rollNo);
    } else {
      setRoll(student.rollNo);
      setName(student.name);
    }
    setNameFocused(false);
    setRollFocused(false);
    sfx.playSelect();
    
    if (!compareMode) {
      setBattleActive(false);
      setTimeout(() => {
        setFoundStudent(student);
        setSearchError("");
        setTab(0);
      }, 200);
    } else {
      setFoundStudent(student);
      setSearchError("");
    }
  };

  const selectSuggestedOpponent = (student, searchType) => {
    if (searchType === "name") {
      setOppName(student.name);
      setOppRoll(student.rollNo);
    } else {
      setOppRoll(student.rollNo);
      setOppName(student.name);
    }
    setOppNameFocused(false);
    setOppRollFocused(false);
    sfx.playSelect();
    setOpponentStudent(student);
    setSearchError("");
  };

  // Search logic
  const handleSearch = () => {
    setSearchError("");
    setFoundStudent(null);
    const r = roll.trim().toUpperCase();
    const n = name.trim().toUpperCase();

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
    setSearchError("");
    
    // Resolve Player 1
    let p1 = foundStudent;
    if (!p1) {
      const r1 = roll.trim().toUpperCase();
      const n1 = name.trim().toUpperCase();
      if (!r1 && !n1) {
        setSearchError("Please fill in Player 1 Roll No or Name.");
        sfx.playError();
        return;
      }
      p1 = STUDENTS.find((st) => {
        const matchRoll = r1 && st.rollNo.toUpperCase() === r1;
        const matchName = n1 && st.name.toUpperCase().includes(n1);
        return matchRoll || matchName;
      });
      if (!p1) {
        setSearchError("Player 1 student record not found.");
        sfx.playError();
        return;
      }
    }

    // Resolve Player 2
    const r2 = oppRoll.trim().toUpperCase();
    const n2 = oppName.trim().toUpperCase();

    if (!r2 && !n2) {
      setSearchError("Please fill in Player 2 Roll No or Name.");
      sfx.playError();
      return;
    }

    const p2 = STUDENTS.find((st) => {
      const matchRoll = r2 && st.rollNo.toUpperCase() === r2;
      const matchName = n2 && st.name.toUpperCase().includes(n2);
      return matchRoll || matchName;
    });

    if (!p2) {
      setSearchError("Player 2 student record not found.");
      sfx.playError();
      setBattleActive(false);
      return;
    }

    if (p1.rollNo === p2.rollNo) {
      setSearchError("Cannot duel/compare the same student.");
      sfx.playError();
      return;
    }

    setFoundStudent(p1);
    setOpponentStudent(p2);
    setBattleActive(true);
    sfx.playLevelUp(); // play success level up chime
  };

  // Pre-calculated cohort metrics for Cohort Analytics view
  const cohortMetrics = useMemo(() => {
    const totalCount = STUDENTS.length;
    
    // Sem 1 averages
    const s1Sum = STUDENTS.reduce((acc, st) => acc + parseFloat(st.sem1.sgpa), 0);
    const s1Avg = s1Sum / totalCount;
    const s1PassCount = STUDENTS.filter(st => st.sem1.status === "PASSED & PROMOTED").length;
    const s1PassRate = (s1PassCount / totalCount) * 100;
    const s1Max = Math.max(...STUDENTS.map(st => parseFloat(st.sem1.sgpa)));

    // Sem 2 averages
    const s2Sum = STUDENTS.reduce((acc, st) => acc + parseFloat(st.sem2.sgpa), 0);
    const s2Avg = s2Sum / totalCount;
    const s2PassCount = STUDENTS.filter(st => st.sem2.status === "PASSED & PROMOTED").length;
    const s2PassRate = (s2PassCount / totalCount) * 100;
    const s2Max = Math.max(...STUDENTS.map(st => parseFloat(st.sem2.sgpa)));

    // CGPA overall
    const cgpas = STUDENTS.map(st => (parseFloat(st.sem1.sgpa) + parseFloat(st.sem2.sgpa)) / 2);
    const maxCgpa = Math.max(...cgpas);

    return {
      s1Avg,
      s1PassRate,
      s1Max,
      s2Avg,
      s2PassRate,
      s2Max,
      maxCgpa
    };
  }, []);

  // Compute GPA distribution counts for distribution bars
  const distributionCounts = useMemo(() => {
    const s1Tiers = { outstanding: 0, excellent: 0, verygood: 0, good: 0 };
    const s2Tiers = { outstanding: 0, excellent: 0, verygood: 0, good: 0 };

    STUDENTS.forEach(st => {
      const g1 = parseFloat(st.sem1.sgpa);
      const g2 = parseFloat(st.sem2.sgpa);

      if (g1 >= 9.0) s1Tiers.outstanding++;
      else if (g1 >= 8.0) s1Tiers.excellent++;
      else if (g1 >= 7.0) s1Tiers.verygood++;
      else s1Tiers.good++;

      if (g2 >= 9.0) s2Tiers.outstanding++;
      else if (g2 >= 8.0) s2Tiers.excellent++;
      else if (g2 >= 7.0) s2Tiers.verygood++;
      else s2Tiers.good++;
    });

    return { s1Tiers, s2Tiers };
  }, []);

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
            Academic Standing Differential
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
            Achievements Duel
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
        link.download = `scorecard-${activeStudent.rollNo}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Scorecard generation error:", err);
      });
  };

  // Filtered & Sorted Ledger List
  const filteredStudents = useMemo(() => {
    let list = [...STUDENTS];
    
    // 1. Text Search Filter
    if (ledgerSearch.trim()) {
      const q = ledgerSearch.trim().toUpperCase();
      list = list.filter(st => st.rollNo.includes(q) || st.name.toUpperCase().includes(q));
    }

    // 2. Status Outcome Filter
    if (ledgerFilter === "passed") {
      list = list.filter(st => {
        const status = semContext === "1" ? st.sem1.status : (semContext === "2" ? st.sem2.status : (st.sem1.status === "PASSED & PROMOTED" && st.sem2.status === "PASSED & PROMOTED"));
        return status === "PASSED & PROMOTED";
      });
    } else if (ledgerFilter === "promoted") {
      list = list.filter(st => {
        const status = semContext === "1" ? st.sem1.status : (semContext === "2" ? st.sem2.status : (st.sem1.status !== "PASSED & PROMOTED" || st.sem2.status !== "PASSED & PROMOTED"));
        return status !== "PASSED & PROMOTED";
      });
    }

    // 3. Sorting
    list.sort((a, b) => {
      const aRank = studentRanks[a.rollNo];
      const bRank = studentRanks[b.rollNo];

      if (ledgerSort === "rank") {
        const rKey = semContext === "1" ? "r1" : (semContext === "2" ? "r2" : "rc");
        return aRank[rKey] - bRank[rKey];
      }
      if (ledgerSort === "name") {
        return a.name.localeCompare(b.name);
      }
      if (ledgerSort === "sgpa") {
        const aVal = semContext === "1" ? parseFloat(a.sem1.sgpa) : (semContext === "2" ? parseFloat(a.sem2.sgpa) : (parseFloat(a.sem1.sgpa) + parseFloat(a.sem2.sgpa)) / 2);
        const bVal = semContext === "1" ? parseFloat(b.sem1.sgpa) : (semContext === "2" ? parseFloat(b.sem2.sgpa) : (parseFloat(b.sem1.sgpa) + parseFloat(b.sem2.sgpa)) / 2);
        return bVal - aVal;
      }
      return 0;
    });

    return list;
  }, [ledgerSearch, ledgerFilter, ledgerSort, semContext]);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column", transition: "all 0.3s ease" }}>
      {/* ── Translucent Header from original BCA portal ─────────────────── */}
      <header style={{
        background: theme === "dark" ? "rgba(1, 1, 2, 0.85)" : "rgba(250, 250, 251, 0.85)",
        borderBottom: `1px solid ${C.border}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: C.surface,
                border: `1px solid ${C.borderHi}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "monospace",
                color: C.gold
              }}>
                B
              </div>
              <div>
                <div style={{ fontSize: 9, color: C.dim, fontWeight: 600 }}>
                  B.I.T. Sindri
                </div>
                <h1 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: C.text, margin: "1px 0 0" }}>
                  Production and Industrial Engineering Academic Portal
                </h1>
              </div>
            </div>

            {/* Header Right Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Home Search Button to Reset lookup view */}
              {(foundStudent || tab !== 0) && (
                <button
                  onClick={() => {
                    setFoundStudent(null);
                    setRoll("");
                    setName("");
                    setSearchError("");
                    setTab(0);
                    sfx.playSelect();
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.surface,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.text,
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.borderHi;
                    e.currentTarget.style.background = C.raised;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = C.surface;
                  }}
                  title="Search New Student"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              )}

              {/* Theme Toggle switch */}
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
                  background: C.surface,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.text,
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.borderHi;
                  e.currentTarget.style.background = C.raised;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = C.surface;
                }}
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
                  </svg>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Sub-Navigation Bar exactly matching your screenshot */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 20px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {/* Leftaligned Semester Context Buttons */}
          <div style={{
            display: "inline-flex",
            background: C.raised,
            padding: 3,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            gap: 2
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
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: semContext === s.id ? C.surface : "transparent",
                  color: semContext === s.id ? C.text : C.dim,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Rightaligned View Buttons */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              ...(foundStudent ? [{ id: 0, label: "Report Card" }] : []),
              { id: 1, label: "Toppers" },
              { id: 2, label: "Class Analytics" },
              { id: 3, label: "Student Ledger" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); sfx.playSelect(); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1px solid ${tab === t.id ? C.borderHi : "transparent"}`,
                  background: tab === t.id ? C.raised : "transparent",
                  color: tab === t.id ? C.text : C.dim,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s"
                }}
              >
                {renderTabIcon(t.id, tab === t.id, C)}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "24px auto", padding: "0 20px 40px", boxSizing: "border-box" }}>
        
        {/* TAB 0: Lookup Academic records & Profile Dashboard */}
        {tab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Search Input Forms Card when no student is found */}
            {(!foundStudent || (compareMode && !battleActive)) && (
              <div style={{ maxWidth: 800, width: "100%", margin: "0 auto" }}>
                <Card theme={C}>
                  <div style={{ padding: 28 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>Lookup Academic Records</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.dim }}>Search results instantly or compare two students in Duel Mode.</p>
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
                          fontSize: 11,
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
                        <span>{compareMode ? "Single Mode" : "Battle Mode"}</span>
                      </button>
                    </div>

                    {/* Standard Search Fields Layout */}
                    {!compareMode ? (
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: 14, alignItems: "end" }}>
                        {/* Roll Input with Dropdown suggestions */}
                        <div style={{ position: "relative" }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: "uppercase", display: "block", marginBottom: 4 }}>University Roll No</label>
                          <input
                            type="text"
                            value={roll}
                            onChange={(e) => setRoll(e.target.value)}
                            onFocus={() => setRollFocused(true)}
                            onBlur={() => setTimeout(() => setRollFocused(false), 200)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                            placeholder="e.g. 24030570011"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13, boxSizing: "border-box" }}
                          />
                          {rollFocused && rollSuggestions.length > 0 && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, maxHeight: 200, overflowY: "auto" }}>
                              {rollSuggestions.map(st => (
                                <div
                                  key={st.rollNo}
                                  onMouseDown={() => selectSuggestedStudent(st, "roll")}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                                  <div style={{ flex: 1, textAlign: "left" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700 }}>{st.name}</div>
                                    <div style={{ fontSize: 9, color: C.dim }}>{st.rollNo}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: "center", paddingBottom: 10, color: C.dim, fontSize: 11, fontWeight: 700 }}>OR</div>

                        {/* Name Input with Dropdown suggestions */}
                        <div style={{ position: "relative" }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Student Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setNameFocused(true)}
                            onBlur={() => setTimeout(() => setNameFocused(false), 200)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                            placeholder="e.g. AMLESHWAR PRASAD"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13, boxSizing: "border-box" }}
                          />
                          {nameFocused && nameSuggestions.length > 0 && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, maxHeight: 200, overflowY: "auto" }}>
                              {nameSuggestions.map(st => (
                                <div
                                  key={st.rollNo}
                                  onMouseDown={() => selectSuggestedStudent(st, "name")}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                                  <div style={{ flex: 1, textAlign: "left" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700 }}>{st.name}</div>
                                    <div style={{ fontSize: 9, color: C.dim }}>{st.rollNo}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Duel Mode Search Fields */
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                        {/* Player 1 Block */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.gold }}>PLAYER 1 PROFILE</span>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={roll}
                              onChange={(e) => setRoll(e.target.value)}
                              onFocus={() => setRollFocused(true)}
                              onBlur={() => setTimeout(() => setRollFocused(false), 200)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInitiateBattle(); } }}
                              placeholder="Player 1 Roll e.g. 24030570011"
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13, boxSizing: "border-box" }}
                            />
                            {rollFocused && rollSuggestions.length > 0 && (
                              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, maxHeight: 150, overflowY: "auto" }}>
                                {rollSuggestions.map(st => (
                                  <div key={st.rollNo} onMouseDown={() => selectSuggestedStudent(st, "roll")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                                    <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 11, fontWeight: 700 }}>{st.name}</div><div style={{ fontSize: 9, color: C.dim }}>{st.rollNo}</div></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              onFocus={() => setNameFocused(true)}
                              onBlur={() => setTimeout(() => setNameFocused(false), 200)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInitiateBattle(); } }}
                              placeholder="Player 1 Name e.g. AMLESHWAR PRASAD"
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13, boxSizing: "border-box" }}
                            />
                            {nameFocused && nameSuggestions.length > 0 && (
                              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, maxHeight: 150, overflowY: "auto" }}>
                                {nameSuggestions.map(st => (
                                  <div key={st.rollNo} onMouseDown={() => selectSuggestedStudent(st, "name")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                                    <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 11, fontWeight: 700 }}>{st.name}</div><div style={{ fontSize: 9, color: C.dim }}>{st.rollNo}</div></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Player 2 Block */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.amber }}>PLAYER 2 PROFILE</span>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={oppRoll}
                              onChange={(e) => setOppRoll(e.target.value)}
                              onFocus={() => setOppRollFocused(true)}
                              onBlur={() => setTimeout(() => setOppRollFocused(false), 200)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInitiateBattle(); } }}
                              placeholder="Player 2 Roll e.g. 24030570022"
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13, boxSizing: "border-box" }}
                            />
                            {oppRollFocused && opponentRollSuggestions.length > 0 && (
                              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, maxHeight: 150, overflowY: "auto" }}>
                                {opponentRollSuggestions.map(st => (
                                  <div key={st.rollNo} onMouseDown={() => selectSuggestedOpponent(st, "roll")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                                    <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 11, fontWeight: 700 }}>{st.name}</div><div style={{ fontSize: 9, color: C.dim }}>{st.rollNo}</div></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={oppName}
                              onChange={(e) => setOppName(e.target.value)}
                              onFocus={() => setOppNameFocused(true)}
                              onBlur={() => setTimeout(() => setOppNameFocused(false), 200)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInitiateBattle(); } }}
                              placeholder="Player 2 Name e.g. HARSH KUMAR"
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13, boxSizing: "border-box" }}
                            />
                            {oppNameFocused && opponentNameSuggestions.length > 0 && (
                              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000, maxHeight: 150, overflowY: "auto" }}>
                                {opponentNameSuggestions.map(st => (
                                  <div key={st.rollNo} onMouseDown={() => selectSuggestedOpponent(st, "name")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                                    <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 11, fontWeight: 700 }}>{st.name}</div><div style={{ fontSize: 9, color: C.dim }}>{st.rollNo}</div></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                      {(roll || name || oppRoll || oppName) && (
                        <button
                          onClick={() => {
                            setRoll(""); setName(""); setOppRoll(""); setOppName("");
                            setFoundStudent(null); setOpponentStudent(null);
                            setSearchError(""); setBattleActive(false);
                            sfx.playSelect();
                          }}
                          style={{ padding: "8px 16px", background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13 }}
                        >
                          Clear
                        </button>
                      )}
                      <Button theme={C} onClick={compareMode ? handleInitiateBattle : handleSearch}>
                        {compareMode ? "Initiate Academic Duel" : "Search Student"}
                      </Button>
                    </div>

                    {searchError && (
                      <div style={{ padding: "12px 16px", background: C.red + "15", border: `1px solid ${C.red}30`, borderRadius: 10, color: C.red, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                        <WarningIcon color={C.red} size={14} />
                        <span>{searchError}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Duel Mode Screen Active Dashboard */}
            {compareMode && battleActive && opponentStudent && foundStudent && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* VS Header Banner */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr", gap: 16, alignItems: "center", padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                  <div style={{ padding: 16, background: C.gold + "0a", border: `1px solid ${C.gold}20`, borderRadius: 8, display: "flex", alignItems: "center", gap: 14 }}>
                    <img src={getAvatarUrl(foundStudent)} style={{ width: 44, height: 44, borderRadius: "50%", background: C.raised }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{foundStudent.name}</h4>
                      <span style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>Player 1</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: C.red, color: "#ffffff", display: "inline-flex", alignItems: "center", justifyCenter: "center", fontSize: 10, fontWeight: 900, lineHeight: "32px", textAlign: "center" }}>VS</span>
                  </div>
                  <div style={{ padding: 16, background: C.amber + "0a", border: `1px solid ${C.amber}20`, borderRadius: 8, display: "flex", alignItems: "center", gap: 14 }}>
                    <img src={getAvatarUrl(opponentStudent)} style={{ width: 44, height: 44, borderRadius: "50%", background: C.raised }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{opponentStudent.name}</h4>
                      <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>Player 2</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: 16, alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                    {renderStandingComparison()}
                    {renderUnifiedGpaTable()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                    <RadarChart student={foundStudent} opponent={opponentStudent} semContext={semContext} theme={C} isMobile={isMobile} />
                    {renderAchievementsDuel()}
                  </div>
                </div>
              </div>
            )}

            {/* Single Student Screen Active Dashboard */}
            {!compareMode && foundStudent && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: 16, alignItems: "start" }}>
                {/* Left Column: Printable Scorecard & Standing ranks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Card theme={C}>
                    <div style={{ overflow: "hidden", position: "relative" }}>
                      {/* Hidden scorecard printable PNG content */}
                      <div style={{ position: "absolute", left: -9999, top: -9999 }}>
                        <div ref={downloadRef} style={{ width: 600, padding: 40, background: "#0f1011", color: "#f7f8f8", fontFamily: "'Inter', sans-serif", border: "1px solid #23252a", borderRadius: 16, position: "relative" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(135deg, rgba(94,106,210,0.15), transparent)" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
                            <div>
                              <div style={{ fontSize: 9, color: "#8a8f98", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>BIT Sindri Academic Report</div>
                              <h2 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: "#f7f8f8" }}>Production & Industrial Eng.</h2>
                              <div style={{ fontSize: 11, color: "#5e6ad2", fontWeight: 600, marginTop: 4 }}>GPA Scorecard</div>
                            </div>
                            <div style={{ padding: "6px 12px", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#5e6ad2" }}>
                              Level {Math.floor(parseFloat(semContext === "1" ? foundStudent.sem1.sgpa : (semContext === "2" ? foundStudent.sem2.sgpa : (parseFloat(foundStudent.sem1.sgpa) + parseFloat(foundStudent.sem2.sgpa)) / 2)) * 10)}
                            </div>
                          </div>

                          <div style={{ background: "#141516", padding: 20, borderRadius: 12, border: "1px solid #23252a", marginBottom: 24, display: "flex", gap: 20, alignItems: "center" }}>
                            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #5e6ad2", background: "rgba(94,106,210,0.1)", overflow: "hidden" }}>
                              <img src={getAvatarUrl(foundStudent)} style={{ width: "100%", height: "100%" }} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f7f8f8" }}>{foundStudent.name}</h3>
                              <div style={{ fontSize: 12, color: "#8a8f98", marginTop: 2 }}>Roll No: {foundStudent.rollNo}</div>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                            <div style={{ padding: 14, background: "#141516", border: "1px solid #23252a", borderRadius: 10, textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "#8a8f98", fontWeight: 700, textTransform: "uppercase" }}>Sem 1 GPA</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: "#f7f8f8", margin: "4px 0" }}>{parseFloat(foundStudent.sem1.sgpa).toFixed(2)}</div>
                              <div style={{ fontSize: 9, color: "#27a644", fontWeight: 700 }}>{foundStudent.sem1.status.startsWith("PASSED") ? "PASSED" : "PROMOTED"}</div>
                            </div>
                            <div style={{ padding: 14, background: "#141516", border: "1px solid #23252a", borderRadius: 10, textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "#8a8f98", fontWeight: 700, textTransform: "uppercase" }}>Sem 2 GPA</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: "#f7f8f8", margin: "4px 0" }}>{parseFloat(foundStudent.sem2.sgpa).toFixed(2)}</div>
                              <div style={{ fontSize: 9, color: "#27a644", fontWeight: 700 }}>{foundStudent.sem2.status.startsWith("PASSED") ? "PASSED" : "PROMOTED"}</div>
                            </div>
                            <div style={{ padding: 14, background: "#141516", border: "1px solid #23252a", borderRadius: 10, textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "#8a8f98", fontWeight: 700, textTransform: "uppercase" }}>Cumulative CGPA</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: "#5e6ad2", margin: "4px 0" }}>{((parseFloat(foundStudent.sem1.sgpa) + parseFloat(foundStudent.sem2.sgpa)) / 2).toFixed(2)}</div>
                              <div style={{ fontSize: 9, color: "#8a8f98", fontWeight: 600 }}>Active Scholar</div>
                            </div>
                          </div>

                          <div style={{ borderTop: "1px solid #23252a", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 10, color: "#8a8f98" }}>Generated on: {new Date().toLocaleDateString()}</div>
                            <div style={{ fontSize: 10, color: "#5e6ad2", fontWeight: 700, letterSpacing: 0.5 }}>PE DEPT - BIT SINDRI</div>
                          </div>
                        </div>
                      </div>

                      {/* Display Template Card */}
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
                            <div style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "6px 0" }}>{parseFloat(foundStudent.sem1.sgpa).toFixed(2)}</div>
                            <span style={{ fontSize: 10, background: C.green + "15", color: C.green, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>PASS</span>
                          </div>
                          <div style={{ padding: 16, background: C.raised, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Semester 2 GPA</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "6px 0" }}>{parseFloat(foundStudent.sem2.sgpa).toFixed(2)}</div>
                            <span style={{ fontSize: 10, background: C.green + "15", color: C.green, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>PASS</span>
                          </div>
                          <div style={{ padding: 16, background: C.raised, borderRadius: 10, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Cumulative CGPA</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: C.gold, margin: "6px 0" }}>{((parseFloat(foundStudent.sem1.sgpa) + parseFloat(foundStudent.sem2.sgpa)) / 2).toFixed(2)}</div>
                            <span style={{ fontSize: 10, background: C.gold + "15", color: C.gold, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>Year 1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Standing Card */}
                  <Card theme={C}>
                    <div style={{ padding: 20 }}>
                      <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Departmental Rank Standing
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
                        <div style={{ padding: 14, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Sem 1 Rank</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 4 }}>#{studentRanks[foundStudent.rollNo].r1}</div>
                        </div>
                        <div style={{ padding: 14, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Sem 2 Rank</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 4 }}>#{studentRanks[foundStudent.rollNo].r2}</div>
                        </div>
                        <div style={{ padding: 14, background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Cumulative Rank</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.gold, marginTop: 4 }}>#{studentRanks[foundStudent.rollNo].rc}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Column: Chart & Achievements list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <RadarChart student={foundStudent} opponent={null} semContext={semContext} theme={C} isMobile={isMobile} />
                  
                  {/* achievements list */}
                  <Card theme={C}>
                    <div style={{ padding: 20 }}>
                      <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Unlocked Achievements
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {getUnlockedAchievements(foundStudent).map((ach) => (
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
          </div>
        )}

        {/* TAB 1: Toppers View (Premium Podium Layout matching your screenshot) */}
        {tab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: C.text }}>Academic Toppers</h2>
              <p style={{ fontSize: 13, color: C.dim, margin: "4px 0 0" }}>Browse the outstanding students of the class by overall and subject-wise lists.</p>
            </div>

            <Card theme={C}>
              <div style={{ padding: "30px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>Branch Elite Standings</div>
                  
                  {/* Topper selection selector */}
                  <div style={{ display: "flex", gap: 4, background: C.raised, padding: 3, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    {[
                      { id: "grand", label: "Grand Total" },
                      { id: "sem1", label: "Semester 1" },
                      { id: "sem2", label: "Semester 2" }
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
                          color: topperSubject === btn.id ? "#ffffff" : C.dim,
                          cursor: "pointer"
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Podium Layout */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: isMobile ? 12 : 24, padding: "20px 0", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  {(() => {
                    // Sort students based on the active selection
                    let sortedList = [...STUDENTS].sort((a, b) => {
                      const getScore = st => {
                        if (topperSubject === "sem1") return parseFloat(st.sem1.sgpa);
                        if (topperSubject === "sem2") return parseFloat(st.sem2.sgpa);
                        return (parseFloat(st.sem1.sgpa) + parseFloat(st.sem2.sgpa)) / 2;
                      };
                      return getScore(b) - getScore(a);
                    });

                    const first = sortedList[0];
                    const second = sortedList[1];
                    const third = sortedList[2];

                    const renderPodiumCard = (st, rank, height, glow, borderColor) => {
                      if (!st) return null;
                      const sg1 = parseFloat(st.sem1.sgpa);
                      const sg2 = parseFloat(st.sem2.sgpa);
                      const cg = (sg1 + sg2) / 2;
                      const score = topperSubject === "sem1" ? sg1 : (topperSubject === "sem2" ? sg2 : cg);

                      return (
                        <div style={{
                          width: isMobile ? "100%" : 220,
                          background: C.surface,
                          border: `1.5px solid ${borderColor}`,
                          borderRadius: 12,
                          padding: 24,
                          boxSizing: "border-box",
                          textAlign: "center",
                          height: height,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          position: "relative",
                          boxShadow: glow ? `0 10px 30px ${borderColor}20` : "none",
                          order: rank === 1 ? 2 : (rank === 2 ? 1 : 3)
                        }}>
                          {/* Rank Circle Badge */}
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: C.surface,
                            border: `2px solid ${borderColor}`,
                            color: C.text,
                            fontWeight: 900,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                            boxShadow: `0 0 10px ${borderColor}40`
                          }}>
                            {rank}
                          </div>

                          <div style={{ position: "relative", display: "inline-block", margin: "0 auto 10px" }}>
                            <img src={getAvatarUrl(st)} style={{ width: 64, height: 64, borderRadius: "50%", background: C.raised, border: `2px solid ${borderColor}` }} />
                          </div>

                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{st.name}</h4>
                          <span style={{ fontSize: 10, color: C.dim, display: "block", marginTop: 2 }}>{st.rollNo}</span>

                          <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 24, fontWeight: 900, color: C.gold, fontFamily: "monospace" }}>{score.toFixed(2)}</div>
                            <span style={{ fontSize: 10, color: C.dim, fontWeight: 700, textTransform: "uppercase" }}>
                              {topperSubject === "grand" ? "CGPA" : "SGPA"}
                            </span>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        {/* 2nd Topper Podium Card */}
                        {renderPodiumCard(second, 2, isMobile ? "auto" : 260, false, C.border)}
                        {/* 1st Topper Podium Card (Tallest, center stage) */}
                        {renderPodiumCard(first, 1, isMobile ? "auto" : 310, true, C.gold)}
                        {/* 3rd Topper Podium Card */}
                        {renderPodiumCard(third, 3, isMobile ? "auto" : 240, false, C.amber)}
                      </>
                    );
                  })()}
                </div>
              </div>
            </Card>

            {/* List of top 10 students (Toppers Ledger) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.dim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Toppers Ledger</div>
              {(() => {
                let sortedList = [...STUDENTS].sort((a, b) => {
                  const getScore = st => {
                    if (topperSubject === "sem1") return parseFloat(st.sem1.sgpa);
                    if (topperSubject === "sem2") return parseFloat(st.sem2.sgpa);
                    return (parseFloat(st.sem1.sgpa) + parseFloat(st.sem2.sgpa)) / 2;
                  };
                  return getScore(b) - getScore(a);
                });

                return sortedList.slice(0, 10).map((st, idx) => {
                  const sg1 = parseFloat(st.sem1.sgpa);
                  const sg2 = parseFloat(st.sem2.sgpa);
                  const cg = (sg1 + sg2) / 2;
                  const score = topperSubject === "sem1" ? sg1 : (topperSubject === "sem2" ? sg2 : cg);

                  return (
                    <Card
                      theme={C}
                      key={st.rollNo}
                      onClick={() => {
                        setFoundStudent(st);
                        setRoll(st.rollNo);
                        setName("");
                        sfx.playSelect();
                        setTab(0);
                      }}
                      style={{ cursor: "pointer", transition: "border-color 0.2s" }}
                      title={`View ${st.name}'s Profile`}
                    >
                      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            {idx < 3 ? (
                              <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: idx === 0 ? C.gold + "15" : idx === 1 ? C.muted + "15" : "#b4530915",
                                border: `1.5px solid ${idx === 0 ? C.gold : idx === 1 ? C.borderHi : "#b45309"}`,
                                color: idx === 0 ? C.gold : idx === 1 ? C.text : "#f59e0b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 11
                              }}>
                                {idx + 1}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: "600", color: C.dim }}>
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: C.raised,
                            border: `1px solid ${C.border}`,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <img
                              src={getAvatarUrl(st)}
                              alt={`${st.name}'s Avatar`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, color: C.text }}>{st.name}</div>
                            <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace", marginTop: 1 }}>{st.rollNo}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: idx === 0 ? C.gold : C.text }}>
                              {score.toFixed(2)}
                            </span>
                            <span style={{ fontSize: 12, color: C.dim }}>/10</span>
                          </div>

                          {!isMobile && (
                            <div style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: C.gold,
                              border: `1px solid ${C.gold}30`,
                              background: `${C.gold}10`,
                              padding: "3px 8px",
                              borderRadius: 4,
                              textTransform: "uppercase"
                            }}>
                              SGPA/CGPA: {score.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: Class Analytics View */}
        {tab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: C.text }}>Cohort Analytics</h2>
              <p style={{ fontSize: 13, color: C.dim, margin: "4px 0 0" }}>Detailed comparative report showing class-wide performance between Semesters 1 and 2.</p>
            </div>

            {/* Premium 3-card stats block matching your screenshot */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
              {/* Card 1: PASS PERCENTAGE */}
              <Card theme={C}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 9, color: C.dim, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>PASS PERCENTAGE</div>
                  <h3 style={{ margin: "10px 0", fontSize: 26, fontWeight: 900, color: C.text }}>
                    {cohortMetrics.s2PassRate.toFixed(0)}% <span style={{ fontSize: 13, fontWeight: 600, color: C.dim }}>Sem 2 Pass Rate</span>
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 700, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 10 }}>
                    <span style={{ color: C.dim }}>Sem 1: {cohortMetrics.s1PassRate.toFixed(0)}%</span>
                    <span style={{ color: C.green }}>Diff: +{(cohortMetrics.s2PassRate - cohortMetrics.s1PassRate).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>

              {/* Card 2: CLASS AVERAGE SGPA */}
              <Card theme={C}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 9, color: C.dim, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>CLASS AVERAGE SGPA</div>
                  <h3 style={{ margin: "10px 0", fontSize: 26, fontWeight: 900, color: C.gold }}>
                    {cohortMetrics.s2Avg.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 600, color: C.dim }}>Sem 2 average</span>
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 700, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 10 }}>
                    <span style={{ color: C.dim }}>Sem 1 Avg: {cohortMetrics.s1Avg.toFixed(2)}</span>
                    <span style={{ color: C.green }}>Delta: +{(cohortMetrics.s2Avg - cohortMetrics.s1Avg).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Card 3: HIGHEST SGPA/CGPA */}
              <Card theme={C}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 9, color: C.dim, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>HIGHEST SGPA/CGPA</div>
                  <h3 style={{ margin: "10px 0", fontSize: 26, fontWeight: 900, color: C.text }}>
                    {cohortMetrics.maxCgpa.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 600, color: C.dim }}>Top CGPA (Year 1)</span>
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 700, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 10 }}>
                    <span style={{ color: C.dim }}>Sem 1 Max: {cohortMetrics.s1Max.toFixed(2)}</span>
                    <span style={{ color: C.dim }}>Sem 2 Max: {cohortMetrics.s2Max.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Distribution Charts sideby-side */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              {/* Semester 1 Distribution */}
              <Card theme={C}>
                <div style={{ padding: 24 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>SEMESTER 1 GPA DISTRIBUTION</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Outstanding (9.0+)", count: distributionCounts.s1Tiers.outstanding },
                      { label: "Excellent (8.0-8.9)", count: distributionCounts.s1Tiers.excellent },
                      { label: "Very Good (7.0-7.9)", count: distributionCounts.s1Tiers.verygood },
                      { label: "Good (6.0-6.9)", count: distributionCounts.s1Tiers.good }
                    ].map((t) => {
                      const pct = (t.count / STUDENTS.length) * 100;
                      return (
                        <div key={t.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                            <span>{t.label}</span>
                            <span>{t.count} students ({Math.round(pct)}%)</span>
                          </div>
                          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, background: C.gold, height: "100%", borderRadius: 3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Semester 2 Distribution */}
              <Card theme={C}>
                <div style={{ padding: 24 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>SEMESTER 2 GPA DISTRIBUTION</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Outstanding (9.0+)", count: distributionCounts.s2Tiers.outstanding },
                      { label: "Excellent (8.0-8.9)", count: distributionCounts.s2Tiers.excellent },
                      { label: "Very Good (7.0-7.9)", count: distributionCounts.s2Tiers.verygood },
                      { label: "Good (6.0-6.9)", count: distributionCounts.s2Tiers.good }
                    ].map((t) => {
                      const pct = (t.count / STUDENTS.length) * 100;
                      return (
                        <div key={t.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                            <span>{t.label}</span>
                            <span>{t.count} students ({Math.round(pct)}%)</span>
                          </div>
                          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, background: C.gold, height: "100%", borderRadius: 3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* Individual student trends comparisons */}
            <Card theme={C}>
              <div style={{ padding: 24 }}>
                <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Individual Student Performance Trend (CGPA Chart)
                </h4>
                <div className="aesthetic-scrollbar" style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: isMobile ? 8 : 12,
                  height: 165,
                  overflowX: "auto",
                  paddingBottom: 8,
                  marginTop: 14,
                  WebkitOverflowScrolling: "touch"
                }}>
                  {STUDENTS.map((st) => {
                    const sg1 = parseFloat(st.sem1.sgpa);
                    const sg2 = parseFloat(st.sem2.sgpa);
                    const cGpa = (sg1 + sg2) / 2;
                    const h = cGpa * 12; // height in pixels (0 to 120px)
                    const fill = cGpa >= 8.5
                      ? C.gold
                      : cGpa >= 7.5
                        ? "#818cf8"
                        : cGpa >= 6.5
                          ? "#6366f1"
                          : C.red;
                    
                    return (
                      <div
                        key={st.rollNo}
                        title={`${st.name}: CGPA ${cGpa.toFixed(2)}`}
                        onClick={() => {
                          setFoundStudent(st);
                          setRoll(st.rollNo);
                          setName("");
                          sfx.playSelect();
                          setTab(0);
                        }}
                        style={{
                          flex: "0 0 auto",
                          minWidth: isMobile ? 22 : 32,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: 140,
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ fontSize: 9, fontWeight: 700, color: C.dim, width: "100%", textAlign: "center", marginBottom: 4 }}>{cGpa.toFixed(2)}</div>
                        <div style={{ width: "100%", height: `${h}px`, background: fill, borderRadius: "4px 4px 0 0", opacity: 0.8, transition: "height 0.3s ease" }} />
                        <div style={{
                          fontSize: 8,
                          color: C.dim,
                          width: "100%",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          marginTop: 4
                        }}>
                          {st.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: Student Ledger View */}
        {tab === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: C.text }}>Student Result Ledger</h2>
              <p style={{ fontSize: 13, color: C.dim, margin: "4px 0 0" }}>Explore the full results list with multi-column sorting and direct filters.</p>
            </div>

            {/* Filter and Sort Bar exactly matching your screenshot */}
            <Card theme={C}>
              <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr", gap: 12, alignItems: "center" }}>
                <div>
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search by name or roll number..."
                    style={{ width: "95%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                  />
                </div>
                <div>
                  <select
                    value={ledgerFilter}
                    onChange={(e) => { setLedgerFilter(e.target.value); sfx.playSelect(); }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                  >
                    <option value="all">All Outcomes</option>
                    <option value="passed">Passed</option>
                    <option value="promoted">Promoted</option>
                  </select>
                </div>
                <div>
                  <select
                    value={ledgerSort}
                    onChange={(e) => { setLedgerSort(e.target.value); sfx.playSelect(); }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.raised, color: C.text, fontSize: 13 }}
                  >
                    <option value="rank">Sort: Rank</option>
                    <option value="name">Sort: Name</option>
                    <option value="sgpa">Sort: SGPA</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Ledger table */}
            <Card theme={C}>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.dim, marginBottom: 14 }}>Showing {filteredStudents.length} of {STUDENTS.length} students</div>
                
                <div className="aesthetic-scrollbar" style={{ overflowX: "auto", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>
                        <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600 }}>Rank</th>
                        <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600 }}>Roll Number</th>
                        <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600 }}>Student Name</th>
                        <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>Sem 1 SGPA</th>
                        <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>Sem 2 SGPA</th>
                        <th style={{ padding: "10px 12px", color: C.muted, fontWeight: 600, textAlign: "center" }}>Cumulative CGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((st) => {
                        const sg1 = parseFloat(st.sem1.sgpa);
                        const sg2 = parseFloat(st.sem2.sgpa);
                        const cg = (sg1 + sg2) / 2;
                        const rankInfo = studentRanks[st.rollNo];
                        const displayRank = semContext === "1" ? rankInfo.r1 : (semContext === "2" ? rankInfo.r2 : rankInfo.rc);

                        return (
                          <tr
                            key={st.rollNo}
                            onClick={() => {
                              setFoundStudent(st);
                              setRoll(st.rollNo);
                              setName("");
                              sfx.playSelect();
                              setTab(0);
                            }}
                            style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = C.raised)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: C.gold }}>#{displayRank}</td>
                            <td style={{ padding: "10px 12px", fontFamily: "monospace", color: C.muted }}>{st.rollNo}</td>
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: C.text }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <img src={getAvatarUrl(st)} style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${C.border}` }} />
                                <span>{st.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: C.text }}>{sg1.toFixed(2)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: C.text }}>{sg2.toFixed(2)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: C.gold, fontWeight: 800 }}>{cg.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
