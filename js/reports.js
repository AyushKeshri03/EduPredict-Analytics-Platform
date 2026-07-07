/**
 * js/reports.js - Import/Export Engine (CSV, Excel, PDF)
 */

window.reports = {
  // 1. Export entire student list to CSV
  exportCSV: function() {
    const students = window.db.getAll();
    if (students.length === 0) {
      alert("No students to export.");
      return;
    }

    const headers = ["ID", "Name", "Class", "Section", "Department", "Attendance %", "Assignments %", "Test Scores %", "Engagement", "Predicted Score", "Remarks"];
    const rows = students.map(s => [
      s.id,
      s.name,
      s.class,
      s.section,
      s.department,
      s.attendance,
      s.assignments,
      s.testScores,
      s.engagement,
      s.score || Math.round((s.attendance * 0.2) + (s.assignments * 0.3) + (s.testScores * 0.4) + (s.engagement * 2.0)),
      `"${(s.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EduPredict_Students_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 2. Export entire student list to Excel-ready format
  exportExcel: function() {
    const students = window.db.getAll();
    if (students.length === 0) {
      alert("No students to export.");
      return;
    }

    // Excel reads Tab-Separated Values (TSV) easily when saved as .xls
    const headers = ["ID", "Name", "Class", "Section", "Department", "Attendance %", "Assignments %", "Test Scores %", "Engagement", "Predicted Score", "Remarks"];
    const rows = students.map(s => [
      s.id,
      s.name,
      s.class,
      s.section,
      s.department,
      s.attendance,
      s.assignments,
      s.testScores,
      s.engagement,
      s.score || Math.round((s.attendance * 0.2) + (s.assignments * 0.3) + (s.testScores * 0.4) + (s.engagement * 2.0)),
      (s.remarks || '').replace(/\t/g, ' ')
    ]);

    const tsvContent = [headers.join("\t"), ...rows.map(e => e.join("\t"))].join("\n");
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EduPredict_Excel_Report_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 3. Trigger file click for CSV imports
  triggerCSVImport: function() {
    document.getElementById("csv-file-input").click();
  },

  // 4. Parse selected CSV and add records to DB
  importCSV: function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length <= 1) {
        alert("CSV file is empty or missing data rows.");
        return;
      }

      // Check headers
      // Expected: ID, Name, Class, Section, Department, Attendance, Assignments, TestScores, Engagement
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        // Simple CSV splitter (doesn't handle commas in quotes but standard for student lists)
        const cols = lines[i].split(",").map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 8) {
          errorCount++;
          continue;
        }

        const id = cols[0];
        const name = cols[1];
        const studentClass = cols[2];
        const section = cols[3];
        const department = cols[4] || "Science";
        const attendance = parseInt(cols[5]);
        const assignments = parseInt(cols[6]);
        const testScores = parseInt(cols[7]);
        const engagement = parseInt(cols[8] || "3");

        if (!id || !name || isNaN(attendance) || isNaN(assignments) || isNaN(testScores)) {
          errorCount++;
          continue;
        }

        const newStudent = {
          id,
          name,
          class: studentClass,
          section,
          department,
          attendance,
          assignments,
          testScores,
          engagement,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          subjects: { Math: testScores, Science: testScores, English: testScores, Computer: testScores, Physics: testScores, Chemistry: testScores },
          history: [Math.max(50, testScores - 10), Math.max(50, testScores - 5), Math.max(50, testScores - 2), testScores],
          streak: 2,
          badges: ["bronze"],
          remarks: "Imported via CSV file."
        };

        const res = window.db.add(newStudent);
        if (res.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      alert(`CSV Import Finished!\nSuccessfully added: ${successCount} students.\nFailed/Duplicates: ${errorCount}.`);
      
      // Refresh active UI dashboards
      if (window.ui) {
        window.ui.refreshAllViews();
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = "";
  },

  // 5. Generate high-quality PDF Academic Report for a single student
  downloadStudentPDF: function(studentId) {
    const student = window.db.getById(studentId);
    if (!student) return;

    const mlResult = window.ml.predict(student.attendance, student.assignments, student.testScores, student.engagement);

    // Create a temporary beautiful report layout for PDF generation
    const printArea = document.createElement("div");
    printArea.id = "pdf-temp-print-area";
    printArea.className = "p-8 bg-white text-zinc-900 border border-zinc-200 rounded max-w-4xl mx-auto space-y-6 text-sm";
    
    // Build HTML contents representing official report card
    printArea.innerHTML = `
      <div class="flex items-center justify-between border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold text-indigo-900">EduPredict AI Platform</h1>
          <p class="text-xs text-zinc-500">Official Student Performance Analytics Transcript</p>
        </div>
        <div class="text-right text-xs">
          <p class="font-semibold text-zinc-700">Date: ${new Date().toLocaleDateString()}</p>
          <p class="text-zinc-500">Transcript Ref: TR-${student.id}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded border">
        <div>
          <p class="text-xs font-semibold text-zinc-400 uppercase">Student Information</p>
          <p class="text-base font-bold mt-1 text-zinc-800">${student.name}</p>
          <p class="text-xs mt-0.5 text-zinc-500">Roll/ID: ${student.id}</p>
          <p class="text-xs text-zinc-500">Enrollment: Class ${student.class}-${student.section} (${student.department})</p>
        </div>
        <div class="border-l pl-4">
          <p class="text-xs font-semibold text-zinc-400 uppercase">Core Stats Summary</p>
          <p class="text-xs mt-1 text-zinc-600"><b>Attendance:</b> ${student.attendance}%</p>
          <p class="text-xs text-zinc-600"><b>Assignments Completed:</b> ${student.assignments}%</p>
          <p class="text-xs text-zinc-600"><b>Avg Test Score:</b> ${student.testScores}%</p>
          <p class="text-xs text-zinc-600"><b>Engagement Index:</b> ${student.engagement}/5</p>
        </div>
      </div>

      <div class="space-y-3">
        <h2 class="text-sm font-bold text-indigo-900 border-b pb-1">AI Machine Learning Diagnostics</h2>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-3 bg-indigo-50/50 rounded border">
            <span class="text-xs text-zinc-500">Predicted Score</span>
            <p class="text-xl font-bold text-indigo-700">${mlResult.score}% (${mlResult.grade})</p>
          </div>
          <div class="p-3 bg-emerald-50/50 rounded border">
            <span class="text-xs text-zinc-500">Model Confidence</span>
            <p class="text-xl font-bold text-emerald-700">${mlResult.confidence}%</p>
          </div>
          <div class="p-3 bg-red-50/50 rounded border">
            <span class="text-xs text-zinc-500">Failure Risk</span>
            <p class="text-xl font-bold text-red-700">${mlResult.riskProbability}%</p>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-sm font-bold text-indigo-900 border-b pb-1">Explainable AI (SHAP Insights)</h2>
        <div class="p-3 bg-zinc-50 rounded border text-xs text-zinc-700 leading-relaxed">
          ${mlResult.explanation}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <h2 class="text-sm font-bold text-indigo-900 border-b pb-1 mb-2">Subject Performance</h2>
          <table class="w-full text-xs text-left border">
            <thead>
              <tr class="bg-zinc-100">
                <th class="p-2 border">Subject</th>
                <th class="p-2 border text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(student.subjects).map(([name, val]) => `
                <tr>
                  <td class="p-2 border">${name}</td>
                  <td class="p-2 border text-right font-bold">${val}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div>
          <h2 class="text-sm font-bold text-indigo-900 border-b pb-1 mb-2">Academic History</h2>
          <table class="w-full text-xs text-left border mb-4">
            <thead>
              <tr class="bg-zinc-100">
                <th class="p-2 border">Semester</th>
                <th class="p-2 border text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              ${student.history.map((val, idx) => `
                <tr>
                  <td class="p-2 border">Semester ${idx+1}</td>
                  <td class="p-2 border text-right font-bold">${val}%</td>
                </tr>
              `).join('')}
              <tr class="bg-indigo-50/30">
                <td class="p-2 border font-semibold text-indigo-700">Sem 5 (Predicted)</td>
                <td class="p-2 border text-right font-bold text-indigo-700">${mlResult.score}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-sm font-bold text-indigo-900 border-b pb-1">Teacher Remarks</h2>
        <div class="p-3 bg-zinc-50 rounded border text-xs italic text-zinc-600">
          "${student.remarks || 'No remarks recorded.'}"
        </div>
      </div>

      <div class="border-t pt-4 text-center text-[10px] text-zinc-400">
        <p>This is a computer-generated analysis by EduPredict AI Platform based on historic metrics and current engagement.</p>
        <p class="mt-1 font-mono">&copy; EduPredict AI Systems</p>
      </div>
    `;

    document.body.appendChild(printArea);

    // Call html2pdf bundle (which we loaded in index.html)
    const opt = {
      margin:       0.5,
      filename:     `Academic_Report_${student.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Execute save
    html2pdf().set(opt).from(printArea).save().then(() => {
      // Cleanup
      document.body.removeChild(printArea);
    }).catch(err => {
      console.error("PDF generation failed:", err);
      // Fallback
      window.print();
      document.body.removeChild(printArea);
    });
  }
};
