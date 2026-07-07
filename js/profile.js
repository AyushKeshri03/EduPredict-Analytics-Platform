/**
 * js/profile.js - Student Profile Portal Controller
 */

window.profileCharts = {
  radar: null,
  history: null
};

window.profile = {
  renderStudentProfile: function(studentId) {
    const student = window.db.getById(studentId);
    if (!student) {
      alert("Student ID not found!");
      return;
    }

    // Set active student state globally
    window.activeStudentId = studentId;

    // 1. Text Details
    document.getElementById("profile-name").textContent = student.name;
    document.getElementById("profile-id").textContent = student.id;
    document.getElementById("profile-class-section").textContent = `Class ${student.class}-${student.section}`;
    document.getElementById("profile-department").textContent = student.department;
    document.getElementById("profile-avatar").src = student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`;
    document.getElementById("profile-attendance-val").textContent = student.attendance + "%";
    document.getElementById("profile-attendance-bar").style.width = student.attendance + "%";
    
    // Set remarks input
    document.getElementById("profile-remarks-input").value = student.remarks || "";

    // 2. ML Predictions
    const mlResult = window.ml.predict(student.attendance, student.assignments, student.testScores, student.engagement);
    document.getElementById("profile-pred-score").textContent = mlResult.score;
    document.getElementById("profile-pred-grade").textContent = mlResult.grade;
    document.getElementById("profile-pred-confidence").textContent = mlResult.confidence + "%";
    document.getElementById("profile-pred-risk").textContent = mlResult.riskProbability + "%";
    document.getElementById("profile-pred-explanation").innerHTML = mlResult.explanation;

    // Risk indicator color
    const riskLabel = document.getElementById("profile-pred-risk-label");
    if (mlResult.riskProbability > 50) {
      riskLabel.className = "text-xs font-bold text-red-600 dark:text-red-400";
      riskLabel.textContent = "High Failure Risk";
    } else if (mlResult.riskProbability > 20) {
      riskLabel.className = "text-xs font-bold text-yellow-600 dark:text-yellow-400";
      riskLabel.textContent = "Moderate Risk";
    } else {
      riskLabel.className = "text-xs font-bold text-green-600 dark:text-green-400";
      riskLabel.textContent = "Safe / Low Risk";
    }

    // 3. Subject-wise Analysis
    // Ensure all subjects are mapped (fallback to testScores if missing)
    const subs = student.subjects || { Math: student.testScores, Science: student.testScores, English: student.testScores, Computer: student.testScores, Physics: student.testScores, Chemistry: student.testScores };
    student.subjects = subs; // sync back

    const subList = Object.entries(subs);
    const subScores = subList.map(item => item[1]);
    const subNames = subList.map(item => item[0]);

    const avgSubScore = Math.round(subScores.reduce((a,b)=>a+b, 0) / subScores.length);
    document.getElementById("profile-sub-avg").textContent = avgSubScore + "%";

    // Strongest & Weakest
    const sortedSubs = [...subList].sort((a,b) => b[1] - a[1]);
    const strongest = sortedSubs[0];
    const weakest = sortedSubs[sortedSubs.length - 1];

    document.getElementById("profile-strongest-subject").textContent = `${strongest[0]} (${strongest[1]}%)`;
    document.getElementById("profile-weakest-subject").textContent = `${weakest[0]} (${weakest[1]}%)`;

    // Subject Ranking List
    const rankingContainer = document.getElementById("profile-subject-ranking");
    if (rankingContainer) {
      rankingContainer.innerHTML = sortedSubs.map(([name, score], idx) => `
        <div class="flex items-center justify-between text-sm py-1 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-zinc-400">#${idx+1}</span>
            <span class="font-medium">${name}</span>
          </div>
          <span class="font-semibold">${score}%</span>
        </div>
      `).join('');
    }

    // Render Subject Radar Chart
    const radarCtx = document.getElementById("profileRadarChart")?.getContext("2d");
    if (radarCtx) {
      if (this.charts.radar) this.charts.radar.destroy();
      this.charts.radar = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: subNames,
          datasets: [{
            label: 'Subject Score %',
            data: subScores,
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderColor: '#4f46e5',
            pointBackgroundColor: '#4f46e5',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4f46e5'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { r: { min: 0, max: 100 } }
        }
      });
    }

    // 4. Historical Performance Line Chart
    // semesters history
    const history = student.history || [70, 72, 75, 78];
    student.history = history;

    // Calculate growth
    const growth = history.length > 1 
      ? Math.round(((history[history.length - 1] - history[0]) / history[0]) * 100)
      : 0;
    
    const growthText = document.getElementById("profile-growth");
    if (growthText) {
      if (growth >= 0) {
        growthText.className = "text-2xl font-bold text-green-600 dark:text-green-400";
        growthText.textContent = `+${growth}%`;
      } else {
        growthText.className = "text-2xl font-bold text-red-600 dark:text-red-400";
        growthText.textContent = `${growth}%`;
      }
    }

    const historyCtx = document.getElementById("profileHistoryChart")?.getContext("2d");
    if (historyCtx) {
      if (this.charts.history) this.charts.history.destroy();
      this.charts.history = new Chart(historyCtx, {
        type: 'line',
        data: {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Pred (Sem 5)'],
          datasets: [
            {
              label: 'Actual Scores',
              data: [...history, null], // actual semesters
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              borderWidth: 3,
              tension: 0.3,
              fill: false
            },
            {
              label: 'Prediction Trend',
              // link Sem 4 actual to Sem 5 predicted
              data: [null, null, null, history[history.length - 1], mlResult.score],
              borderColor: '#ef4444',
              borderDash: [5, 5],
              borderWidth: 3,
              tension: 0.1,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { min: 40, max: 100 } }
        }
      });
    }

    // 5. Intelligent AI Recommendations
    const recs = [];
    if (student.attendance < 80) {
      recs.push({ text: `Improve attendance to 90%. Focus on attending early morning classes.`, action: "Attendance Check" });
    }
    if (subs.Math < 70) {
      recs.push({ text: `Practice Mathematics 4 hours/week on algebra and calculus modules.`, action: "Practice Math" });
    }
    if (student.assignments < 80) {
      recs.push({ text: `Complete pending assignments immediately to secure standard weights.`, action: "Assignments" });
    }
    if (subs[weakest[0]] < 75) {
      recs.push({ text: `Focus on weak subject: ${weakest[0]} by reviewing lecture records and materials.`, action: weakest[0] });
    }
    if (history.length >= 2 && history[history.length - 1] < history[history.length - 2]) {
      recs.push({ text: `Revise previous semester topics to bridge core knowledge gaps.`, action: "Core Revision" });
    }
    if (student.engagement < 3) {
      recs.push({ text: `Improve class participation by active contributions in group sprints.`, action: "Class Engagement" });
    }
    
    // defaults if student performs very well
    if (recs.length < 2) {
      recs.push({ text: `Maintain current high performance. Peer tutor struggling students.`, action: "Peer Tutoring" });
      recs.push({ text: `Explore advanced research coursework or honors curriculum tracks.`, action: "Advanced Study" });
    }

    const recsContainer = document.getElementById("profile-recommendations-list");
    if (recsContainer) {
      recsContainer.innerHTML = recs.map(r => `
        <div class="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:scale-[1.01] transition-transform">
          <div class="p-2 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-500">${r.action}</span>
            <p class="text-sm text-gray-700 dark:text-zinc-300 mt-0.5">${r.text}</p>
          </div>
        </div>
      `).join('');
    }

    // 6. Gamification Badges & Streak
    // Set Streak value
    document.getElementById("profile-streak").textContent = `${student.streak || 0} Days`;
    
    // Compute badges based on metrics
    const badges = [];
    if (mlResult.score >= 90) {
      badges.push({ type: "gold", name: "Gold Scholar", desc: "Maintained predicted score above 90%", icon: "🏆" });
    } else if (mlResult.score >= 80) {
      badges.push({ type: "silver", name: "Silver Scholar", desc: "Predicted score above 80%", icon: "🥈" });
    } else {
      badges.push({ type: "bronze", name: "Bronze Badge", desc: "Overall score above 70%", icon: "🥉" });
    }

    if (student.attendance >= 95) {
      badges.push({ type: "attendance", name: "Perfect Attendance", desc: "Outstanding attendance streak", icon: "⭐" });
    }

    if (student.streak >= 10) {
      badges.push({ type: "streak", name: "Academic Streak", desc: "Streak of 10+ consecutive days active", icon: "⚡" });
    }

    if (growth > 5) {
      badges.push({ type: "growth", name: "Rank Climber", desc: "Over 5% growth compared to Sem 1", icon: "📈" });
    }

    // Check if Top Performer overall
    const studentsList = window.db.getAll();
    const maxScore = Math.max(...studentsList.map(s => s.score));
    if (student.score === maxScore) {
      badges.push({ type: "top", name: "Cohort Leader", desc: "Rank 1 performer in current semester", icon: "👑" });
    }

    const badgesContainer = document.getElementById("profile-badges-grid");
    if (badgesContainer) {
      badgesContainer.innerHTML = badges.map(b => `
        <div class="flex flex-col items-center text-center p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 hover-scale cursor-pointer">
          <span class="text-3xl">${b.icon}</span>
          <span class="text-xs font-bold mt-2 text-gray-900 dark:text-zinc-100">${b.name}</span>
          <span class="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 leading-tight">${b.desc}</span>
        </div>
      `).join('');
    }
  },

  // Save remarks edit
  saveRemarks: function() {
    const studentId = window.activeStudentId;
    if (!studentId) return;

    const remarksText = document.getElementById("profile-remarks-input").value.trim();
    const student = window.db.getById(studentId);
    if (student) {
      student.remarks = remarksText;
      window.db.update(student);
      alert("Teacher remarks saved successfully!");
      // Reload UI
      this.renderStudentProfile(studentId);
    }
  },

  charts: window.profileCharts
};
