/**
 * js/login.js - Authentication handlers for standalone login.html
 */

function toggleAuthTab(mode) {
  const loginForm = document.getElementById("auth-login-form");
  const signupForm = document.getElementById("auth-signup-form");
  const loginTab = document.getElementById("auth-tab-login");
  const signupTab = document.getElementById("auth-tab-signup");
  
  // Clear error banners
  const loginErrorBanner = document.getElementById("auth-login-error-banner");
  const signupErrorBanner = document.getElementById("auth-signup-error-banner");
  if (loginErrorBanner) {
    loginErrorBanner.classList.add("hidden");
    loginErrorBanner.textContent = "";
  }
  if (signupErrorBanner) {
    signupErrorBanner.classList.add("hidden");
    signupErrorBanner.textContent = "";
  }

  if (mode === "login") {
    if (loginForm) loginForm.classList.remove("hidden");
    if (signupForm) signupForm.classList.add("hidden");
    
    if (loginTab) {
      loginTab.className = "flex-1 py-2 text-center text-sm font-bold border-b-2 border-indigo-600 text-indigo-600";
    }
    if (signupTab) {
      signupTab.className = "flex-1 py-2 text-center text-sm font-semibold text-zinc-400 border-b-2 border-transparent";
    }
  } else {
    if (loginForm) loginForm.classList.add("hidden");
    if (signupForm) signupForm.classList.remove("hidden");
    
    if (loginTab) {
      loginTab.className = "flex-1 py-2 text-center text-sm font-semibold text-zinc-400 border-b-2 border-transparent";
    }
    if (signupTab) {
      signupTab.className = "flex-1 py-2 text-center text-sm font-bold border-b-2 border-emerald-600 text-emerald-600";
    }
    toggleSignupRoleFields();
  }
}

function toggleSignupRoleFields() {
  const roleSelect = document.getElementById("auth-signup-role");
  const fields = document.getElementById("auth-signup-student-fields");
  if (roleSelect && fields) {
    if (roleSelect.value === "student") {
      fields.classList.remove("hidden");
    } else {
      fields.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Sign In Form handler
  const loginForm = document.getElementById("auth-login-form");
  const loginErrorBanner = document.getElementById("auth-login-error-banner");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (loginErrorBanner) {
        loginErrorBanner.classList.add("hidden");
        loginErrorBanner.textContent = "";
      }

      const username = document.getElementById("auth-login-username").value.trim();
      const password = document.getElementById("auth-login-password").value;
      const role = document.getElementById("auth-login-role").value;

      if (!window.db) {
        console.error("Database wrapper window.db is missing.");
        return;
      }

      const res = window.db.authenticate(username, password, role);
      if (res.success) {
        const user = res.data;
        window.db.login(user.username, user.role, user.id);
        
        // Redirect to homepage dashboard
        window.location.href = "index.html";
      } else {
        if (loginErrorBanner) {
          loginErrorBanner.classList.remove("hidden");
          loginErrorBanner.textContent = `Login Failed: ${res.error}`;
        } else {
          alert(`Login Failed: ${res.error}`);
        }
      }
    });
  }

  // 2. Sign Up Form handler
  const signupForm = document.getElementById("auth-signup-form");
  const signupErrorBanner = document.getElementById("auth-signup-error-banner");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (signupErrorBanner) {
        signupErrorBanner.classList.add("hidden");
        signupErrorBanner.textContent = "";
      }

      const username = document.getElementById("auth-signup-username").value.trim();
      const password = document.getElementById("auth-signup-password").value;
      const role = document.getElementById("auth-signup-role").value;

      let studentInfo = null;
      if (role === "student") {
        const sId = document.getElementById("auth-signup-s-id").value.trim();
        const dept = document.getElementById("auth-signup-s-department").value;
        const sClass = document.getElementById("auth-signup-s-class").value;
        const section = document.getElementById("auth-signup-s-section").value;
        const att = document.getElementById("auth-signup-s-attendance").value;
        const ass = document.getElementById("auth-signup-s-assignments").value;
        const tst = document.getElementById("auth-signup-s-testscores").value;

        studentInfo = {
          id: sId || null,
          class: sClass,
          section: section,
          department: dept,
          attendance: att,
          assignments: ass,
          testScores: tst
        };
      }

      if (!window.db) {
        console.error("Database wrapper window.db is missing.");
        return;
      }

      const res = window.db.register(username, password, role, studentInfo);
      if (res.success) {
        alert(`Account created successfully for ${username}! Please Sign In with your new credentials.`);
        
        // Switch back to Login and autofill fields
        toggleAuthTab("login");
        document.getElementById("auth-login-username").value = username;
        document.getElementById("auth-login-password").value = password;
        document.getElementById("auth-login-role").value = role;
        
        window.db.addNotification(`Registered new user account: ${username} (${role.toUpperCase()})`, "success");
      } else {
        if (signupErrorBanner) {
          signupErrorBanner.classList.remove("hidden");
          signupErrorBanner.textContent = `Registration Failed: ${res.error}`;
        } else {
          alert(`Registration Failed: ${res.error}`);
        }
      }
    });
  }
});
