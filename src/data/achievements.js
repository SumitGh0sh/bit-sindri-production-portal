// GPA-only achievements logic for BIT Sindri Production Engineering
export const getUnlockedAchievements = (student) => {
  if (!student) return [];
  const list = [];

  const sgpa1 = student.sem1 ? parseFloat(student.sem1.sgpa) : 0;
  const sgpa2 = student.sem2 ? parseFloat(student.sem2.sgpa) : 0;
  const cgpa = student.sem2 ? (sgpa1 + sgpa2) / 2 : sgpa1;

  // 1. Operations Recruit
  if (sgpa1 > 0) {
    list.push({
      title: "Operations Recruit",
      icon: "⚙️",
      desc: "Completed Semester 1 of Production Engineering."
    });
  }

  // 2. Consistent Optimizer
  if (sgpa2 > 0) {
    list.push({
      title: "Consistent Optimizer",
      icon: "📈",
      desc: "Successfully completed Semester 2 with a passing GPA."
    });
  }

  // 3. Lean Master
  if (sgpa1 >= 9.0 || sgpa2 >= 9.0) {
    list.push({
      title: "Lean Master",
      icon: "⚡",
      desc: "Achieved a 9.0+ SGPA in any academic term."
    });
  }

  // 4. Industrial Specialist
  if (student.sem2 && cgpa >= 8.0) {
    list.push({
      title: "Industrial Specialist",
      icon: "🛠️",
      desc: "Maintained a cumulative CGPA of 8.0+ over both terms."
    });
  }

  // 5. Efficiency Leap
  if (student.sem2 && sgpa2 > sgpa1) {
    list.push({
      title: "Efficiency Leap",
      icon: "🚀",
      desc: "Improved SGPA in Semester 2 compared to Semester 1."
    });
  }

  return list;
};
