/**
 * js/notifications.js - Real-time Classroom Alerts & Notifications Engine
 */

window.notifications = {
  // Update Notificationbell badge count and list content
  renderNotifications: function() {
    const listContainer = document.getElementById("notifications-list");
    const badge = document.getElementById("notifications-badge");
    if (!listContainer) return;

    const notifs = window.db.getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;

    // Toggle Badge
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove("hidden");
        badge.classList.add("bell-glow");
      } else {
        badge.classList.add("hidden");
        badge.classList.remove("bell-glow");
      }
    }

    if (notifs.length === 0) {
      listContainer.innerHTML = `
        <div class="p-4 text-center text-xs text-gray-400 dark:text-zinc-500">
          No notifications yet.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = notifs.map(n => {
      let iconColor = "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
      let iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m4 4h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      `;

      if (n.type === "error") {
        iconColor = "text-red-500 bg-red-50 dark:bg-red-950/20";
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        `;
      } else if (n.type === "warning") {
        iconColor = "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        `;
      } else if (n.type === "success") {
        iconColor = "text-green-500 bg-green-50 dark:bg-green-950/20";
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        `;
      }

      const readDot = n.read 
        ? "" 
        : `<span class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex-shrink-0"></span>`;

      return `
        <div class="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 transition-colors">
          <div class="p-1.5 rounded ${iconColor}">
            ${iconSvg}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-700 dark:text-zinc-300 font-medium leading-normal">${n.message}</p>
            <span class="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 block">${n.time}</span>
          </div>
          ${readDot}
        </div>
      `;
    }).join('');
  },

  // Read through active database to trigger alerts
  runDynamicAlertsCheck: function() {
    const students = window.db.getAll();
    const existingNotifs = window.db.getNotifications();
    const existingMessages = existingNotifs.map(n => n.message);

    students.forEach(s => {
      // Rule 1: Attendance critical (<75)
      if (s.attendance < 75) {
        const msg = `Student ${s.name} (${s.id}) attendance has fallen to ${s.attendance}%. Immediate counseling required.`;
        if (!existingMessages.includes(msg)) {
          window.db.addNotification(msg, "error");
        }
      }

      // Rule 2: Risk alert (<60 Score)
      if (s.score < 60) {
        const msg = `Academic Alert: ${s.name} (${s.id}) predicted score is failing (${s.score}%).`;
        if (!existingMessages.includes(msg)) {
          window.db.addNotification(msg, "warning");
        }
      }

      // Rule 3: Perfect attendance (>=98)
      if (s.attendance >= 98) {
        const msg = `Milestone: ${s.name} (${s.id}) reached perfect attendance of ${s.attendance}%!`;
        if (!existingMessages.includes(msg)) {
          window.db.addNotification(msg, "success");
        }
      }
    });

    this.renderNotifications();
  },

  markAllAsRead: function() {
    window.db.markNotificationsAsRead();
    this.renderNotifications();
  },

  toggleNotificationPanel: function() {
    const panel = document.getElementById("notifications-panel");
    if (panel) {
      panel.classList.toggle("hidden");
    }
  }
};
