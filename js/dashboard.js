/**
 * js/dashboard.js - Teacher & Admin Analytics Dashboard Controller
 */

// Keep track of active Chart.js instances
window.dashboardCharts = {
  department: null,
  classSection: null,
  monthlyTrend: null,
  subjectStats: null
};

window.dashboard = {
  // Helper to animate numbers
  animateCounter: function(id, start, end, duration = 1000, suffix = "") {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (end - start) + start);
      obj.textContent = val + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = end + suffix;
      }
    };
    window.requestAnimationFrame(step);
  },

  // Calculate and Render Teacher Dashboard
  renderTeacherDashboard: function() {
    const students = window.db.getAll();
    if (!students || students.length === 0) return;

    // Averages
    const total = students.length;
    const scores = students.map(s => s.score);
    const avgScore = Math.round(scores.reduce((a,b)=>a+b, 0) / total);
    
    // Sort to find top/lowest
    const sortedByScore = [...students].sort((a,b) => b.score - a.score);
    const topPerformer = sortedByScore[0].name;
    const lowestPerformer = sortedByScore[sortedByScore.length - 1].name;
    
    const passCount = students.filter(s => s.score >= 60).length;
    const passPercent = Math.round((passCount / total) * 100);
    
    const avgAtt = Math.round(students.map(s => s.attendance).reduce((a,b)=>a+b, 0) / total);
    const avgAss = Math.round(students.map(s => s.assignments).reduce((a,b)=>a+b, 0) / total);
    
    const atRisk = students.filter(s => s.score < 60).length;
    const excellent = students.filter(s => s.score >= 90).length;
    const inactive = students.filter(s => s.attendance < 75).length;

    // Animate cards
    this.animateCounter("card-total-students", 0, total);
    this.animateCounter("card-avg-score", 0, avgScore, 1000, "%");
    this.animateCounter("card-pass-percent", 0, passPercent, 1000, "%");
    this.animateCounter("card-avg-attendance", 0, avgAtt, 1000, "%");
    this.animateCounter("card-avg-assignments", 0, avgAss, 1000, "%");
    this.animateCounter("card-at-risk", 0, atRisk);
    this.animateCounter("card-excellent", 0, excellent);
    this.animateCounter("card-inactive", 0, inactive);

    // Text details
    const topPerformerEl = document.getElementById("card-top-performer");
    if (topPerformerEl) topPerformerEl.textContent = topPerformer;
    const lowestPerformerEl = document.getElementById("card-lowest-performer");
    if (lowestPerformerEl) lowestPerformerEl.textContent = lowestPerformer;

    // Render Student Table
    this.renderStudentTable(students);
  },

  // Render Student List in Table
  renderStudentTable: function(studentsList) {
    const tbody = document.getElementById("teacher-student-tbody");
    if (!tbody) return;

    if (studentsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-zinc-400">
            No student records found matching filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = studentsList.map(s => {
      const mlResult = window.ml.predict(s.attendance, s.assignments, s.testScores, s.engagement);
      const isRisk = mlResult.score < 60;
      
      const riskPill = isRisk 
        ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">High Risk (${mlResult.riskProbability}%)</span>`
        : mlResult.score >= 90
          ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-bold">Excellent</span>`
          : `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">Low Risk</span>`;

      return `
        <tr class="hover:bg-gray-50 dark:hover:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex items-center gap-3">
              <img src="${s.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.id}" class="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800" />
              <div>
                <div class="font-bold text-gray-900 dark:text-zinc-100">${s.name}</div>
                <div class="text-xs text-gray-400 dark:text-zinc-500">${s.id}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
            Class ${s.class}-${s.section} <span class="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">${s.department}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
            <div class="flex items-center justify-center gap-1">
              <span class="font-semibold">${s.attendance}%</span>
              <div class="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden hidden sm:block">
                <div class="h-full bg-blue-500 rounded-full" style="width: ${s.attendance}%"></div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
            <div class="flex items-center justify-center gap-1">
              <span class="font-semibold">${s.assignments}%</span>
              <div class="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden hidden sm:block">
                <div class="h-full bg-emerald-500 rounded-full" style="width: ${s.assignments}%"></div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-indigo-600 dark:text-indigo-400">
            ${mlResult.score} (${mlResult.grade})
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
            ${riskPill}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
            <div class="flex items-center justify-end gap-2">
              <button onclick="window.ui.viewStudentProfile('${s.id}')" class="px-2 py-1 text-xs rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50">Profile</button>
              <button onclick="window.ui.editStudent('${s.id}')" class="px-2 py-1 text-xs rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-150 dark:hover:bg-zinc-700">Edit</button>
              <button onclick="window.ui.deleteStudent('${s.id}')" class="px-2 py-1 text-xs rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Render Admin Dashboard Visualizations
  renderAdminDashboard: function() {
    const students = window.db.getAll();
    if (!students || students.length === 0) return;

    // Aggregations for Department charts
    const depts = ["Science", "Commerce", "Arts"];
    const deptScores = depts.map(d => {
      const list = students.filter(s => s.department === d);
      return list.length === 0 ? 0 : Math.round(list.reduce((acc,s)=>acc+s.score,0)/list.length);
    });

    // Aggregations for Class comparisons
    const classes = ["10", "11", "12"];
    const classScores = classes.map(c => {
      const list = students.filter(s => s.class === c);
      return list.length === 0 ? 0 : Math.round(list.reduce((acc,s)=>acc+s.score,0)/list.length);
    });

    // Aggregations for Section comparisons
    const sections = ["A", "B", "C"];
    const sectionScores = sections.map(sec => {
      const list = students.filter(s => s.section === sec);
      return list.length === 0 ? 0 : Math.round(list.reduce((acc,s)=>acc+s.score,0)/list.length);
    });

    // Aggregations for Subject comparisons
    const subjects = ["Math", "Science", "English", "Computer", "Physics", "Chemistry"];
    const subjectAverages = {};
    subjects.forEach(sub => {
      const list = students.map(s => s.subjects?.[sub] || s.testScores); // fallback
      subjectAverages[sub] = Math.round(list.reduce((a,b)=>a+b, 0) / list.length);
    });

    // Sort subjects to find Top and Worst
    const sortedSubjects = Object.entries(subjectAverages).sort((a,b)=>b[1]-a[1]);
    
    // Top Subject List UI
    const topSubContainer = document.getElementById("admin-top-subjects");
    if (topSubContainer) {
      topSubContainer.innerHTML = sortedSubjects.slice(0, 3).map(([sub, avg], idx) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
          <div class="flex items-center gap-2">
            <span class="font-bold">#${idx+1}</span>
            <span>${sub}</span>
          </div>
          <span class="font-bold">${avg}%</span>
        </div>
      `).join('');
    }

    // Worst Subject List UI
    const worstSubContainer = document.getElementById("admin-worst-subjects");
    if (worstSubContainer) {
      worstSubContainer.innerHTML = sortedSubjects.slice(-3).reverse().map(([sub, avg], idx) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300">
          <div class="flex items-center gap-2">
            <span class="font-bold">#${idx+1}</span>
            <span>${sub}</span>
          </div>
          <span class="font-bold">${avg}%</span>
        </div>
      `).join('');
    }

    // 1. Department Comparison Chart
    const deptCtx = document.getElementById("adminDeptChart")?.getContext("2d");
    if (deptCtx) {
      if (this.charts?.department) this.charts.department.destroy();
      this.charts.department = new Chart(deptCtx, {
        type: 'bar',
        data: {
          labels: depts,
          datasets: [{
            label: 'Avg Score %',
            data: deptScores,
            backgroundColor: ['rgba(99, 102, 241, 0.75)', 'rgba(16, 185, 129, 0.75)', 'rgba(245, 158, 11, 0.75)'],
            borderColor: ['#4f46e5', '#10b981', '#f59e0b'],
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 100 } }
        }
      });
    }

    // 2. Class & Section Comparison Chart (Grouped)
    const classCtx = document.getElementById("adminClassChart")?.getContext("2d");
    if (classCtx) {
      if (this.charts?.classSection) this.charts.classSection.destroy();
      this.charts.classSection = new Chart(classCtx, {
        type: 'bar',
        data: {
          labels: ['Class 10', 'Class 11', 'Class 12', 'Sec A', 'Sec B', 'Sec C'],
          datasets: [{
            label: 'Comparison Avg %',
            data: [...classScores, ...sectionScores],
            backgroundColor: 'rgba(74, 109, 167, 0.7)',
            borderColor: 'rgba(74, 109, 167, 1)',
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 100 } }
        }
      });
    }

    // 3. Monthly Performance Trend Chart (Simulated Progress)
    const monthCtx = document.getElementById("adminMonthlyChart")?.getContext("2d");
    if (monthCtx) {
      if (this.charts?.monthlyTrend) this.charts.monthlyTrend.destroy();
      this.charts.monthlyTrend = new Chart(monthCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Science',
              data: [72, 74, 76, 75, 78, 80],
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.05)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Commerce',
              data: [68, 70, 71, 70, 73, 76],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Arts',
              data: [65, 68, 66, 68, 70, 72],
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { min: 50, max: 100 } }
        }
      });
    }

    // 4. Overall Subject performance bar chart
    const subCtx = document.getElementById("adminSubjectChart")?.getContext("2d");
    if (subCtx) {
      if (this.charts?.subjectStats) this.charts.subjectStats.destroy();
      this.charts.subjectStats = new Chart(subCtx, {
        type: 'radar',
        data: {
          labels: subjects,
          datasets: [{
            label: 'School Subject Avg',
            data: subjects.map(s => subjectAverages[s]),
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#4f46e5',
            pointBackgroundColor: '#4f46e5'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { r: { min: 0, max: 100 } }
        }
      });
    }
  },

  charts: window.dashboardCharts
};
