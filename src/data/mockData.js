// Mock Data for BIT Sindri Production Engineering (GPA-only Portal)
export const STUDENTS = [
  {
    rollNo: "230113",
    name: "SUMIT GHOSH",
    college: "BIT SINDRI",
    branch: "PRODUCTION ENGINEERING",
    gender: "M",
    sem1: { sgpa: "9.12", status: "PASS" },
    sem2: { sgpa: "9.32", status: "PASS" }
  },
  {
    rollNo: "230114",
    name: "PAYAL BANDYOPADHYAY",
    college: "BIT SINDRI",
    branch: "PRODUCTION ENGINEERING",
    gender: "F",
    sem1: { sgpa: "8.85", status: "PASS" },
    sem2: { sgpa: "8.90", status: "PASS" }
  },
  {
    rollNo: "230115",
    name: "HEMANT KUMAR TEWARI",
    college: "BIT SINDRI",
    branch: "PRODUCTION ENGINEERING",
    gender: "M",
    sem1: { sgpa: "7.95", status: "PASS" },
    sem2: { sgpa: "8.12", status: "PASS" }
  },
  {
    rollNo: "230116",
    name: "MD SAJJAD",
    college: "BIT SINDRI",
    branch: "PRODUCTION ENGINEERING",
    gender: "M",
    sem1: { sgpa: "8.45", status: "PASS" },
    sem2: { sgpa: "8.20", status: "PASS" }
  },
  {
    rollNo: "230117",
    name: "IRFAN KHAN",
    college: "BIT SINDRI",
    branch: "PRODUCTION ENGINEERING",
    gender: "M",
    sem1: { sgpa: "7.38", status: "PASS" },
    sem2: { sgpa: "7.52", status: "PASS" }
  }
];

// Pre-calculate ranks & cumulative properties dynamically
export const studentRanks = {};

// Sort students by Sem 1 SGPA, Sem 2 SGPA, and Cumulative CGPA to find ranks
const sortedSem1 = [...STUDENTS].sort((a, b) => parseFloat(b.sem1.sgpa) - parseFloat(a.sem1.sgpa));
const sortedSem2 = [...STUDENTS].sort((a, b) => {
  const g2 = b.sem2 ? parseFloat(b.sem2.sgpa) : 0;
  const g1 = a.sem2 ? parseFloat(a.sem2.sgpa) : 0;
  return g2 - g1;
});
const sortedCumulative = [...STUDENTS].sort((a, b) => {
  const cgpaB = b.sem2 ? (parseFloat(b.sem1.sgpa) + parseFloat(b.sem2.sgpa)) / 2 : parseFloat(b.sem1.sgpa);
  const cgpaA = a.sem2 ? (parseFloat(a.sem1.sgpa) + parseFloat(a.sem2.sgpa)) / 2 : parseFloat(a.sem1.sgpa);
  return cgpaB - cgpaA;
});

STUDENTS.forEach((st) => {
  const r1 = sortedSem1.findIndex(s => s.rollNo === st.rollNo) + 1;
  const r2 = st.sem2 ? sortedSem2.findIndex(s => s.rollNo === st.rollNo) + 1 : "-";
  const rc = sortedCumulative.findIndex(s => s.rollNo === st.rollNo) + 1;
  
  studentRanks[st.rollNo] = { r1, r2, rc };
});

export const getCharacterClass = (cgpa) => {
  const cg = parseFloat(cgpa);
  if (cg >= 9.0) return { title: "Production Archmage", color: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", desc: "Absolute master of industrial systems and academic theory." };
  if (cg >= 8.0) return { title: "Production Specialist", color: "#5e6ad2", glow: "rgba(94, 106, 210, 0.4)", desc: "Highly skilled strategist of optimized operations." };
  if (cg >= 7.0) return { title: "Industrial Vanguard", color: "#10b981", glow: "rgba(16, 185, 129, 0.4)", desc: "Resilient analyst leading calculations on the workshop floor." };
  if (cg >= 6.0) return { title: "Operations Recruit", color: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)", desc: "Eager explorer of production engineering concepts." };
  return { title: "Academic Survivor", color: "#ef4444", glow: "rgba(239, 68, 68, 0.4)", desc: "Fighting the variables of industrial trials." };
};

export const getAvatarUrl = (student) => {
  return "https://api.dicebear.com/7.x/adventurer/svg?seed=" + encodeURIComponent(student.name);
};
