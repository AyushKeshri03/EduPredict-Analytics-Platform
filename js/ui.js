/**
 * js/ui.js - View Coordinator, Authentication, Filters, and Dialog Management
 */

window.ui = {
  activeView: "landing-view",

  // 1. Initialize global Event Listeners and Setup Views
  init: function() {
    this.setupViewNavigation();
    this.setupAuthentication();
    this.setupFiltersAndSearch();
    this.setupFormSubmissions();
    this.setupThemeToggle();

    // Default load: Landing view
    this.switchView("landing-view");
    this.refreshLoginUI();
  },

  // 2. Navigation SPA Switching
  switchView: function(viewId) {
    const user = window.db.getLoggedInUser();
    
    // Role-based protection check: guests are redirected to standalone auth portal
    const protectedViews = ["teacher-view", "admin-view", "student-profile-view"];
    if (!user && protectedViews.includes(viewId)) {
      alert("Please sign in to access the platform analytics.");
      window.location.href = "login.html";
      return;
    }

    this.activeView = viewId;
    
    // Hide all view panels
    document.querySelectorAll(".view-content").forEach(el => {
      el.classList.add("hidden");
      el.classList.remove("active");
    });

    // Show target panel
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove("hidden");
      // Timeout to allow browser layout calculation for transition
      setTimeout(() => {
        target.classList.add("active");
      }, 20);
    }

    // Update navigation sidebar active highlights
    document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
      if (btn.getAttribute("data-view") === viewId) {
        btn.classList.add("bg-indigo-50", "dark:bg-indigo-900/30", "text-indigo-600", "dark:text-indigo-400");
        btn.classList.remove("text-gray-600", "dark:text-zinc-400");
      } else {
        btn.classList.remove("bg-indigo-50", "dark:bg-indigo-900/30", "text-indigo-600", "dark:text-indigo-400");
        btn.classList.add("text-gray-600", "dark:text-zinc-400");
      }
    });

    // Execute view-specific loads
    if (viewId === "teacher-view") {
      window.dashboard.renderTeacherDashboard();
    } else if (viewId === "admin-view") {
      window.dashboard.renderAdminDashboard();
    } else if (viewId === "student-profile-view") {
      // default to first student if none active
      const activeId = window.activeStudentId || "S-2023-001";
      window.profile.renderStudentProfile(activeId);
    } else if (viewId === "dsa-view") {
      window.dsa.initSortingVisualizer();
      window.dsa.initSearchVisualizer();
      window.dsa.initHeapVisualizer();
      window.dsa.initStackQueue();
      window.dsa.initGraphVisualizer();
      window.dsa.initDecisionTree();
    } else if (viewId === "viva-view") {
      window.viva.renderVivaCenter();
    } else if (viewId === "predictor-view") {
      // Trigger original predictor slider inputs update
      if (window.updatePrediction) window.updatePrediction();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setupViewNavigation: function() {
    document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        this.switchView(view);
      });
    });

    // Landing get started button redirect
    const getStartedBtn = document.getElementById("landing-get-started-btn");
    if (getStartedBtn) {
      getStartedBtn.addEventListener("click", () => {
        const user = window.db.getLoggedInUser();
        if (user) {
          this.switchView(user.role === "admin" ? "admin-view" : "teacher-view");
        } else {
          this.showLoginModal();
        }
      });
    }
  },

  // 3. User Authentication Flow (Handled via standalone login.html)
  setupAuthentication: function() {
    // Session is checked on page navigation load
  },

  refreshLoginUI: function() {
    const user = window.db.getLoggedInUser();
    const loginBtn = document.getElementById("header-login-btn");
    const logoutBtn = document.getElementById("header-logout-btn");
    const userProfileArea = document.getElementById("header-user-profile");
    const userAvatar = document.getElementById("header-user-avatar");
    const userRoleText = document.getElementById("header-user-role");

    // Defensive Check: If session is corrupt or missing key fields, clear it and trigger self-healing logout
    if (user && user.username && user.role) {
      if (loginBtn) loginBtn.classList.add("hidden");
      if (logoutBtn) logoutBtn.classList.remove("hidden");
      if (userProfileArea) userProfileArea.classList.remove("hidden");
      if (userAvatar) userAvatar.src = user.avatar;
      if (userRoleText) userRoleText.textContent = `${user.username} (${user.role.toUpperCase()})`;

      // Show/Hide Role-based Sidebar Options
      document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
        const view = btn.getAttribute("data-view");
        if (view === "admin-view" && user.role !== "admin") {
          btn.classList.add("hidden");
        } else {
          btn.classList.remove("hidden");
        }
      });
    } else {
      // Auto-heal state by clearing any partial session data
      if (user) window.db.logout();

      if (loginBtn) loginBtn.classList.remove("hidden");
      if (logoutBtn) logoutBtn.classList.add("hidden");
      if (userProfileArea) userProfileArea.classList.add("hidden");
      
      // Default hide admin tab if guest
      document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
        const view = btn.getAttribute("data-view");
        if (view === "admin-view") {
          btn.classList.add("hidden");
        }
      });
    }
  },

  showLoginModal: function() {
    window.location.href = "login.html";
  },

  hideLoginModal: function() {
    this.switchView("landing-view");
  },

  logout: function() {
    window.db.logout();
    this.refreshLoginUI();
    window.location.href = "login.html";
  },

  // 4. Advanced Searching, Filtering, and Sorting on Teacher Dashboard
  setupFiltersAndSearch: function() {
    const inputs = ["filter-search", "filter-class", "filter-section", "filter-department", "filter-risk", "filter-sort"];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => this.applyFilters());
      if (el && el.tagName === "SELECT") el.addEventListener("change", () => this.applyFilters());
    });
  },

  applyFilters: function() {
    const searchVal = document.getElementById("filter-search").value.trim().toLowerCase();
    const classVal = document.getElementById("filter-class").value;
    const sectionVal = document.getElementById("filter-section").value;
    const deptVal = document.getElementById("filter-department").value;
    const riskVal = document.getElementById("filter-risk").value;
    const sortVal = document.getElementById("filter-sort").value;

    let list = window.db.getAll();

    // 1. Search Filter (ID or Name)
    if (searchVal) {
      list = list.filter(s => s.id.toLowerCase().includes(searchVal) || s.name.toLowerCase().includes(searchVal));
    }

    // 2. Class Filter
    if (classVal !== "all") {
      list = list.filter(s => s.class === classVal);
    }

    // 3. Section Filter
    if (sectionVal !== "all") {
      list = list.filter(s => s.section === sectionVal);
    }

    // 4. Department Filter
    if (deptVal !== "all") {
      list = list.filter(s => s.department === deptVal);
    }

    // 5. Risk Filter
    if (riskVal !== "all") {
      list = list.filter(s => {
        const score = s.score || Math.round((s.attendance * 0.2) + (s.assignments * 0.3) + (s.testScores * 0.4) + (s.engagement * 2.0));
        if (riskVal === "high") return score < 60;
        if (riskVal === "low") return score >= 60 && score < 90;
        if (riskVal === "excellent") return score >= 90;
        return true;
      });
    }

    // 6. Sorting algorithms
    // Demonstrating Quick Sort logic using Javascript's sort mapped to user options
    if (sortVal === "id-asc") list.sort((a,b) => a.id.localeCompare(b.id));
    else if (sortVal === "id-desc") list.sort((a,b) => b.id.localeCompare(a.id));
    else if (sortVal === "name-asc") list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortVal === "score-desc") list.sort((a,b) => b.score - a.score);
    else if (sortVal === "score-asc") list.sort((a,b) => a.score - b.score);
    else if (sortVal === "attendance-desc") list.sort((a,b) => b.attendance - a.attendance);

    window.dashboard.renderStudentTable(list);
  },

  // 5. Add / Edit / Delete Student Forms
  setupFormSubmissions: function() {
    // Add Student submission form
    const addForm = document.getElementById("add-student-form");
    if (addForm) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("add-s-id").value.trim();
        const name = document.getElementById("add-s-name").value.trim();
        const studentClass = document.getElementById("add-s-class").value;
        const section = document.getElementById("add-s-section").value;
        const dept = document.getElementById("add-s-department").value;
        const attendance = parseInt(document.getElementById("add-s-attendance").value);
        const assignments = parseInt(document.getElementById("add-s-assignments").value);
        const testScores = parseInt(document.getElementById("add-s-testscores").value);
        const engagement = parseInt(document.getElementById("add-s-engagement").value);

        if (!id || !name) {
          alert("All fields are required.");
          return;
        }

        const score = Math.round((attendance * 0.2) + (assignments * 0.3) + (testScores * 0.4) + (engagement * 2.0));

        const student = {
          id,
          name,
          class: studentClass,
          section,
          department: dept,
          attendance,
          assignments,
          testScores,
          engagement,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          subjects: { Math: testScores, Science: testScores, English: testScores, Computer: testScores, Physics: testScores, Chemistry: testScores },
          history: [Math.max(50, testScores-12), Math.max(50, testScores-8), Math.max(50, testScores-4), testScores],
          streak: 1,
          badges: ["bronze"],
          remarks: "Added via Teacher Dashboard.",
          score
        };

        const res = window.db.add(student);
        if (res.success) {
          alert("Student added successfully!");
          addForm.reset();
          this.hideAddStudentModal();
          this.refreshAllViews();
          window.db.addNotification(`Added new student: ${name} (${id})`, "info");
          window.notifications.runDynamicAlertsCheck();
        } else {
          alert(`Error: ${res.error}`);
        }
      });
    }

    // Edit Student form submission
    const editForm = document.getElementById("edit-student-form");
    if (editForm) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("edit-s-id").value;
        const name = document.getElementById("edit-s-name").value.trim();
        const studentClass = document.getElementById("edit-s-class").value;
        const section = document.getElementById("edit-s-section").value;
        const dept = document.getElementById("edit-s-department").value;
        const attendance = parseInt(document.getElementById("edit-s-attendance").value);
        const assignments = parseInt(document.getElementById("edit-s-assignments").value);
        const testScores = parseInt(document.getElementById("edit-s-testscores").value);
        const engagement = parseInt(document.getElementById("edit-s-engagement").value);

        const score = Math.round((attendance * 0.2) + (assignments * 0.3) + (testScores * 0.4) + (engagement * 2.0));

        const oldStudent = window.db.getById(id);
        const student = {
          ...oldStudent,
          name,
          class: studentClass,
          section,
          department: dept,
          attendance,
          assignments,
          testScores,
          engagement,
          score
        };

        // Recalculate subject weights
        student.subjects = { Math: testScores, Science: testScores, English: testScores, Computer: testScores, Physics: testScores, Chemistry: testScores };

        const res = window.db.update(student);
        if (res.success) {
          alert("Student updated successfully!");
          this.hideEditStudentModal();
          this.refreshAllViews();
          window.db.addNotification(`Updated student details for ${name} (${id})`, "info");
          window.notifications.runDynamicAlertsCheck();
        } else {
          alert(`Error: ${res.error}`);
        }
      });
    }
  },

  showAddStudentModal: function() {
    document.getElementById("add-student-modal")?.classList.remove("hidden");
  },

  hideAddStudentModal: function() {
    document.getElementById("add-student-modal")?.classList.add("hidden");
  },

  editStudent: function(id) {
    const s = window.db.getById(id);
    if (!s) return;

    document.getElementById("edit-s-id").value = s.id;
    document.getElementById("edit-s-name").value = s.name;
    document.getElementById("edit-s-class").value = s.class;
    document.getElementById("edit-s-section").value = s.section;
    document.getElementById("edit-s-department").value = s.department;
    document.getElementById("edit-s-attendance").value = s.attendance;
    document.getElementById("edit-s-assignments").value = s.assignments;
    document.getElementById("edit-s-testscores").value = s.testScores;
    document.getElementById("edit-s-engagement").value = s.engagement;

    document.getElementById("edit-student-modal")?.classList.remove("hidden");
  },

  hideEditStudentModal: function() {
    document.getElementById("edit-student-modal")?.classList.add("hidden");
  },

  deleteStudent: function(id) {
    if (confirm(`Are you sure you want to delete student ID: ${id}?`)) {
      window.db.delete(id);
      this.refreshAllViews();
      window.db.addNotification(`Deleted student: ${id} from directory.`, "warning");
      window.notifications.runDynamicAlertsCheck();
    }
  },

  viewStudentProfile: function(id) {
    window.activeStudentId = id;
    this.switchView("student-profile-view");
  },

  refreshAllViews: function() {
    // Re-sync standard variables
    window.db.updateGlobalScriptState();
    
    // Refresh active components
    if (this.activeView === "teacher-view") {
      window.dashboard.renderTeacherDashboard();
    } else if (this.activeView === "admin-view") {
      window.dashboard.renderAdminDashboard();
    } else if (this.activeView === "student-profile-view") {
      window.profile.renderStudentProfile(window.activeStudentId || "S-2023-001");
    }

    // Call standard functions from script.js if they exist to keep original leaderboard in sync
    if (window.renderLeaderboard) window.renderLeaderboard();
    if (window.renderClassStats) window.renderClassStats();
    if (window.renderTopK) window.renderTopK();
    if (window.renderAtRisk) window.renderAtRisk();
    if (window.updateClassRadarChart) window.updateClassRadarChart();
  },

  // 6. Light / Dark Theme Support
  setupThemeToggle: function() {
    const toggleBtn = document.getElementById("theme-toggle-btn");
    const label = document.getElementById("theme-toggle-label");
    
    // Load preference
    const currentTheme = localStorage.getItem("theme") || "light";
    if (currentTheme === "dark") {
      document.body.classList.add("dark-theme");
      if (label) label.textContent = "Light Mode";
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
        
        // Redraw active charts to fix canvas background blending issues
        this.refreshAllViews();
      });
    }
  }
};

// Initial triggers
document.addEventListener("DOMContentLoaded", () => {
  window.ui.init();
});
