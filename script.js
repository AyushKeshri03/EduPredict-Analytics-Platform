// EduPredict - DSA-rich Frontend JavaScript (No backend)

// --- DSA Data Structures ---
let students = []; // Array of student objects
let studentMap = {}; // Hash map for fast lookup by ID

// --- Utility Functions ---
function calculateScore(attendance, assignments, testScores, engagement) {
    return Math.round(
        (attendance * 0.2) +
        (assignments * 0.3) +
        (testScores * 0.4) +
        (engagement * 2.0)
    );
}

function getStudentObj(id, attendance, assignments, testScores, engagement) {
    return {
        id,
        attendance: Number(attendance),
        assignments: Number(assignments),
        testScores: Number(testScores),
        engagement: Number(engagement),
        score: calculateScore(attendance, assignments, testScores, engagement)
    };
}

function getRecommendations(student) {
    const {attendance, assignments, testScores, engagement, score} = student;
    const recs = [];
    if (attendance < 85) recs.push("Improve attendance through better time management and engagement strategies");
    if (assignments < 80) recs.push("Focus on completing assignments on time with better planning");
    if (testScores < 70) recs.push("Enhance test preparation through targeted study sessions and practice tests");
    if (engagement < 4) recs.push("Increase classroom participation and engagement in learning activities");
    if (score < 60) recs.push("Consider additional academic support or tutoring services");
    else if (score > 85) recs.push("Excellent performance! Consider advanced coursework or enrichment activities");
    if (recs.length === 0) {
        recs.push("Maintain current performance levels and continue with existing strategies");
        recs.push("Consider setting higher academic goals for continued growth");
    }
    return recs;
}

// --- Main UI Prediction (single student, as before) ---
let radarChartInstance = null; // Chart.js instance for radar chart
let classRadarChartInstance = null; // Chart.js instance for class radar chart

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    setupEventListeners();
    updatePrediction();
    setupDSAFeatures();
});

function initializeSliders() {
    ['attendance', 'assignments', 'testScores'].forEach(id => {
        const slider = document.getElementById(id);
        const display = document.getElementById(id + 'Value');
        if (slider && display) display.textContent = slider.value + '%';
    });
}

function setupEventListeners() {
    document.getElementById('attendance').addEventListener('input', function() {
        document.getElementById('attendanceValue').textContent = this.value + '%';
        updatePrediction();
    });
    document.getElementById('assignments').addEventListener('input', function() {
        document.getElementById('assignmentsValue').textContent = this.value + '%';
        updatePrediction();
    });
    document.getElementById('testScores').addEventListener('input', function() {
        document.getElementById('testScoresValue').textContent = this.value + '%';
        updatePrediction();
    });
    document.getElementById('engagement').addEventListener('change', updatePrediction);
    document.getElementById('predictBtn').addEventListener('click', updatePrediction);
}

function updatePrediction() {
    const attendance = parseInt(document.getElementById('attendance').value);
    const assignments = parseInt(document.getElementById('assignments').value);
    const testScores = parseInt(document.getElementById('testScores').value);
    const engagement = parseInt(document.getElementById('engagement').value); // 1-5 scale
    const score = calculateScore(attendance, assignments, testScores, engagement);
    const clampedScore = Math.min(100, Math.max(0, score));
    document.getElementById('performanceScore').textContent = clampedScore;
    document.getElementById('scoreMeter').style.width = clampedScore + '%';
    updateRecommendations({attendance, assignments, testScores, engagement, score}, clampedScore);
    updateRadarChart(attendance, assignments, testScores, engagement);

    // Sync legacy UI elements with real ML simulation results
    if (window.ml) {
        const mlRes = window.ml.predict(attendance, assignments, testScores, engagement);
        const lGrade = document.getElementById('legacy-ml-grade');
        const lConf = document.getElementById('legacy-ml-confidence');
        const lRisk = document.getElementById('legacy-ml-risk');
        const lXai = document.getElementById('legacy-ml-xai');
        if (lGrade) lGrade.textContent = mlRes.grade;
        if (lConf) lConf.textContent = mlRes.confidence + "%";
        if (lRisk) lRisk.textContent = mlRes.riskProbability + "%";
        if (lXai) lXai.innerHTML = mlRes.explanation;
    }
}

function updateRadarChart(attendance, assignments, testScores, engagement) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Attendance', 'Assignments', 'Test Scores', 'Engagement'],
            datasets: [{
                label: 'Student Metrics',
                data: [attendance, assignments, testScores, engagement * 20],
                backgroundColor: 'rgba(74, 109, 167, 0.2)',
                borderColor: 'rgba(74, 109, 167, 1)',
                pointBackgroundColor: 'rgba(245, 213, 71, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(74, 109, 167, 1)'
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    pointLabels: { font: { size: 14 } }
                }
            }
        }
    });
}

function updateRecommendations(student, overallScore) {
    const recommendations = getRecommendations(student);
    document.getElementById('recommendations').innerHTML = recommendations.map(rec => `
        <div class="flex items-start">
            <div class="bg-[var(--accent)] p-1 rounded-full mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </div>
            <p>${rec}</p>
        </div>
    `).join('');
}

// --- DSA Features: Add Student, Leaderboard, Stats, Search ---
function setupDSAFeatures() {
    document.getElementById('addStudentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('studentId').value.trim();
        const attendance = document.getElementById('studentAttendance').value;
        const assignments = document.getElementById('studentAssignments').value;
        const testScores = document.getElementById('studentTestScores').value;
        const engagement = document.getElementById('studentEngagement').value;
        if (!id || id in studentMap) {
            alert('Student ID is required and must be unique.');
            return;
        }
        const student = getStudentObj(id, attendance, assignments, testScores, engagement);
        
        // Sync with LocalStorage database if available
        if (window.db) {
            student.subjects = { Math: student.testScores, Science: student.testScores, English: student.testScores, Computer: student.testScores, Physics: student.testScores, Chemistry: student.testScores };
            student.history = [Math.max(50, student.testScores - 12), Math.max(50, student.testScores - 8), Math.max(50, student.testScores - 4), student.testScores];
            student.streak = 1;
            student.badges = ["bronze"];
            student.remarks = "Added via legacy predictor form.";
            window.db.add(student);
        } else {
            students.push(student);
            studentMap[id] = student;
            renderLeaderboard();
            renderClassStats();
            renderTopK();
            renderAtRisk();
            updateClassRadarChart();
        }
        
        this.reset();
    });
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('searchId').value.trim();
        let result = '';
        // Linear search
        const found = students.find(s => s.id === id);
        if (found) {
            result = `<b>ID:</b> ${found.id} <b>Score:</b> ${found.score} <b>At Risk:</b> ${found.score < 60 ? 'Yes' : 'No'}`;
        } else {
            result = 'Student not found.';
        }
        document.getElementById('searchResult').innerHTML = result;
    });

    // Initial render for class radar chart
    updateClassRadarChart();
}

function renderLeaderboard() {
    // Sort students by score descending (DSA: sorting)
    const sorted = [...students].sort((a, b) => b.score - a.score);
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = sorted.map((s, i) => `
        <tr>
            <td class="border px-2 py-1">${i + 1}</td>
            <td class="border px-2 py-1">${s.id}</td>
            <td class="border px-2 py-1">${s.score}</td>
            <td class="border px-2 py-1">${s.score < 60 ? '<span class="text-red-600 font-bold">Yes</span>' : 'No'}</td>
        </tr>
    `).join('');

    // Update class radar chart after leaderboard changes (in case of future remove/edit)
    updateClassRadarChart();
}

function renderTopK() {
    // Simulate a max-heap/priority queue for top 3
    const sorted = [...students].sort((a, b) => b.score - a.score);
    const topK = sorted.slice(0, 3);
    document.getElementById('topKList').innerHTML = topK.map(s => `<li>${s.id} (${s.score})</li>`).join('');
}

function renderAtRisk() {
    // Filter at-risk students (score < 60)
    const atRisk = students.filter(s => s.score < 60);
    document.getElementById('atRiskList').innerHTML = atRisk.length
        ? atRisk.map(s => `<li>${s.id} (${s.score})</li>`).join('')
        : '<li>None</li>';
}

function renderClassStats() {
    if (students.length === 0) {
        document.getElementById('classStats').innerHTML = 'No students yet.';
        return;
    }
    // DSA: mean, median, std dev
    const scores = students.map(s => s.score);
    const mean = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2) : sorted[mid].toFixed(2);
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stddev = Math.sqrt(variance).toFixed(2);
    document.getElementById('classStats').innerHTML = `
        <b>Mean:</b> ${mean} &nbsp; <b>Median:</b> ${median} &nbsp; <b>Std Dev:</b> ${stddev}
    `;
}

function updateClassRadarChart() {
    const ctx = document.getElementById('classRadarChart').getContext('2d');
    if (classRadarChartInstance) {
        classRadarChartInstance.destroy();
    }
    if (students.length === 0) {
        classRadarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Attendance', 'Assignments', 'Test Scores', 'Engagement'],
                datasets: [{
                    label: 'Class Average',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(232, 180, 188, 0.15)',
                    borderColor: 'rgba(232, 180, 188, 0.7)',
                    pointBackgroundColor: 'rgba(245, 213, 71, 1)',
                    pointBorderColor: '#fff',
                }]
            },
            options: {
                responsive: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        pointLabels: { font: { size: 14 } }
                    }
                }
            }
        });
        return;
    }
    // Calculate averages
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const attendanceAvg = avg(students.map(s => s.attendance));
    const assignmentsAvg = avg(students.map(s => s.assignments));
    const testScoresAvg = avg(students.map(s => s.testScores));
    const engagementAvg = avg(students.map(s => s.engagement)) * 20;
    classRadarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Attendance', 'Assignments', 'Test Scores', 'Engagement'],
            datasets: [{
                label: 'Class Average',
                data: [attendanceAvg, assignmentsAvg, testScoresAvg, engagementAvg],
                backgroundColor: 'rgba(232, 180, 188, 0.15)',
                borderColor: 'rgba(232, 180, 188, 0.7)',
                pointBackgroundColor: 'rgba(245, 213, 71, 1)',
                pointBorderColor: '#fff',
            }]
        },
        options: {
            responsive: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    pointLabels: { font: { size: 14 } }
                }
            }
        }
    });
}