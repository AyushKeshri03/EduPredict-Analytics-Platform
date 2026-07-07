/**
 * js/db.js - LocalStorage Database Wrapper & Seed Data
 * 
 * DESIGN FOR SCALABILITY:
 * This module abstracts all database interactions. In a production environment,
 * you would replace the LocalStorage calls in these functions with actual calls to
 * Firebase Firestore or Supabase Client (see comments inside each method).
 */

const STUDENTS_KEY = 'edupredict_db_students';
const SESSION_KEY = 'edupredict_db_session';
const NOTIFICATIONS_KEY = 'edupredict_db_notifications';
const USERS_KEY = 'edupredict_db_users';

const SEED_USERS = [
  { username: "Dr. Clara Mercer", password: "password", role: "teacher" },
  { username: "Director", password: "password", role: "admin" },
  { username: "Arjun Sharma", password: "password", role: "student", id: "S-2023-001" }
];

// Seed data representing a realistic classroom
const SEED_STUDENTS = [
  {
    id: "S-2023-001",
    name: "Arjun Sharma",
    class: "12",
    section: "A",
    department: "Science",
    attendance: 92,
    assignments: 88,
    testScores: 85,
    engagement: 4, // 1-5 scale
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    // Subject wise scores
    subjects: { Math: 88, Science: 86, English: 90, Computer: 94, Physics: 82, Chemistry: 80 },
    // Historical grades (out of 100)
    history: [82, 85, 84, 88], // Semesters 1, 2, 3, 4
    streak: 8,
    badges: ["gold", "perfect-attendance"],
    remarks: "Consistently participates in classroom discussions and shows deep logical reasoning."
  },
  {
    id: "S-2023-002",
    name: "Priya Patel",
    class: "12",
    section: "A",
    department: "Science",
    attendance: 98,
    assignments: 95,
    testScores: 94,
    engagement: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    subjects: { Math: 96, Science: 95, English: 92, Computer: 98, Physics: 94, Chemistry: 91 },
    history: [90, 92, 95, 96],
    streak: 15,
    badges: ["gold", "top-performer", "perfect-attendance"],
    remarks: "Exceptional analytical skills. A leader in laboratory activities and team projects."
  },
  {
    id: "S-2023-003",
    name: "Rahul Verma",
    class: "12",
    section: "B",
    department: "Science",
    attendance: 68,
    assignments: 55,
    testScores: 58,
    engagement: 2,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    subjects: { Math: 52, Science: 60, English: 64, Computer: 58, Physics: 50, Chemistry: 56 },
    history: [70, 65, 60, 57],
    streak: 0,
    badges: [],
    remarks: "Requires close monitoring. Low attendance is directly affecting academic achievements."
  },
  {
    id: "S-2023-004",
    name: "Ananya Iyer",
    class: "11",
    section: "A",
    department: "Science",
    attendance: 87,
    assignments: 82,
    testScores: 81,
    engagement: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    subjects: { Math: 84, Science: 82, English: 78, Computer: 85, Physics: 79, Chemistry: 80 },
    history: [75, 78, 80, 83],
    streak: 4,
    badges: ["silver", "rank-improvement"],
    remarks: "Showing positive growth semester-on-semester. Enthusiastic about computer programming."
  },
  {
    id: "S-2023-005",
    name: "Kabir Mehta",
    class: "12",
    section: "C",
    department: "Commerce",
    attendance: 84,
    assignments: 72,
    testScores: 70,
    engagement: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir",
    subjects: { Math: 75, Science: 65, English: 72, Computer: 80, Physics: 62, Chemistry: 64 },
    history: [72, 70, 71, 73],
    streak: 2,
    badges: ["bronze"],
    remarks: "A cooperative student, though mathematical practice must be prioritized."
  },
  {
    id: "S-2023-006",
    name: "Sneha Nair",
    class: "11",
    section: "B",
    department: "Commerce",
    attendance: 94,
    assignments: 90,
    testScores: 88,
    engagement: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    subjects: { Math: 91, Science: 85, English: 93, Computer: 88, Physics: 84, Chemistry: 82 },
    history: [84, 86, 88, 90],
    streak: 7,
    badges: ["gold", "rank-improvement"],
    remarks: "Very diligent. Homework submissions are neat and consistently submitted on time."
  },
  {
    id: "S-2023-007",
    name: "Aman Gupta",
    class: "11",
    section: "C",
    department: "Arts",
    attendance: 72,
    assignments: 60,
    testScores: 62,
    engagement: 2,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman",
    subjects: { Math: 50, Science: 62, English: 74, Computer: 68, Physics: 54, Chemistry: 58 },
    history: [68, 64, 63, 61],
    streak: 0,
    badges: [],
    remarks: "Struggling with attention in subjects outside of English. Mentorship is suggested."
  },
  {
    id: "S-2023-008",
    name: "Diya Roy",
    class: "12",
    section: "B",
    department: "Arts",
    attendance: 95,
    assignments: 92,
    testScores: 90,
    engagement: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diya",
    subjects: { Math: 82, Science: 90, English: 96, Computer: 94, Physics: 86, Chemistry: 89 },
    history: [87, 88, 91, 93],
    streak: 11,
    badges: ["gold", "top-performer"],
    remarks: "Incredible literary aptitude. Expresses thoughts clearly in analytical articles."
  },
  {
    id: "S-2023-009",
    name: "Rohan Das",
    class: "10",
    section: "A",
    department: "Science",
    attendance: 89,
    assignments: 78,
    testScores: 75,
    engagement: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    subjects: { Math: 78, Science: 76, English: 74, Computer: 80, Physics: 72, Chemistry: 74 },
    history: [72, 74, 76, 77],
    streak: 3,
    badges: ["bronze"],
    remarks: "Performance is steady. Could achieve higher grades with dedicated assignment reviews."
  },
  {
    id: "S-2023-010",
    name: "Meera Sen",
    class: "10",
    section: "B",
    department: "Commerce",
    attendance: 91,
    assignments: 85,
    testScores: 86,
    engagement: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    subjects: { Math: 88, Science: 82, English: 87, Computer: 85, Physics: 81, Chemistry: 83 },
    history: [80, 83, 85, 86],
    streak: 6,
    badges: ["silver"],
    remarks: "Active classroom contributor. Demonstrates sound understanding of principles."
  },
  {
    id: "S-2023-011",
    name: "Vikram Gill",
    class: "12",
    section: "A",
    department: "Commerce",
    attendance: 62,
    assignments: 48,
    testScores: 52,
    engagement: 1,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    subjects: { Math: 44, Science: 50, English: 60, Computer: 55, Physics: 48, Chemistry: 51 },
    history: [65, 59, 54, 50],
    streak: 0,
    badges: [],
    remarks: "Frequently absent. Standard review meeting needed with parents immediately."
  },
  {
    id: "S-2023-012",
    name: "Kriti Kapoor",
    class: "11",
    section: "A",
    department: "Arts",
    attendance: 99,
    assignments: 98,
    testScores: 96,
    engagement: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kriti",
    subjects: { Math: 92, Science: 97, English: 98, Computer: 99, Physics: 95, Chemistry: 96 },
    history: [93, 95, 97, 98],
    streak: 22,
    badges: ["gold", "top-performer", "perfect-attendance"],
    remarks: "Outstanding excellence across all subject domains. Standard setter for the cohort."
  },
  {
    id: "S-2023-013",
    name: "Rishi Raj",
    class: "10",
    section: "C",
    department: "Arts",
    attendance: 80,
    assignments: 70,
    testScores: 68,
    engagement: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi",
    subjects: { Math: 60, Science: 68, English: 72, Computer: 75, Physics: 64, Chemistry: 65 },
    history: [64, 67, 69, 70],
    streak: 1,
    badges: ["bronze"],
    remarks: "Well-behaved, although could push grades higher with a structured revision timetable."
  },
  {
    id: "S-2023-014",
    name: "Sanya Goel",
    class: "12",
    section: "C",
    department: "Science",
    attendance: 93,
    assignments: 91,
    testScores: 89,
    engagement: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya",
    subjects: { Math: 90, Science: 88, English: 92, Computer: 95, Physics: 87, Chemistry: 85 },
    history: [82, 85, 87, 91],
    streak: 8,
    badges: ["gold", "rank-improvement"],
    remarks: "Exhibits positive leadership traits in collaborative assignments."
  },
  {
    id: "S-2023-015",
    name: "Dev Adhikari",
    class: "11",
    section: "B",
    department: "Science",
    attendance: 75,
    assignments: 80,
    testScores: 72,
    engagement: 3,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev",
    subjects: { Math: 70, Science: 74, English: 76, Computer: 80, Physics: 68, Chemistry: 71 },
    history: [72, 73, 75, 76],
    streak: 3,
    badges: ["bronze"],
    remarks: "Attendance is marginal. Needs encouragement to remain focused during laboratory tasks."
  }
];

const SEED_NOTIFICATIONS = [
  { id: 1, type: "error", message: "Student S-2023-003 (Rahul Verma) attendance is critical: 68%", time: "2 hours ago", read: false },
  { id: 2, type: "error", message: "Student S-2023-011 (Vikram Gill) attendance is critical: 62%", time: "4 hours ago", read: false },
  { id: 3, type: "warning", message: "Assignment overdue: S-2023-007 (Aman Gupta) - Science Homework", time: "1 day ago", read: false },
  { id: 4, type: "success", message: "Student S-2023-004 (Ananya Iyer) performance improved by 5.2% this semester", time: "2 days ago", read: true },
  { id: 5, type: "info", message: "System Update: Decision Tree ML model weights updated successfully", time: "3 days ago", read: true }
];

const windowDatabase = {
  // Initialize Database
  init: function() {
    if (!localStorage.getItem(STUDENTS_KEY)) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(SEED_STUDENTS));
    }
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    }
    // Default session: Teacher
    if (!localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: "Dr. Clara Mercer", role: "teacher", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Clara" }));
    }
  },

  // Retreive all students
  // SUPABASE: const { data, error } = await supabase.from('students').select('*')
  // FIREBASE: const querySnapshot = await getDocs(collection(db, "students"));
  getAll: function() {
    this.init();
    try {
      const data = localStorage.getItem(STUDENTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Corrupted students database. Resetting...", e);
    }
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(SEED_STUDENTS));
    return SEED_STUDENTS;
  },

  // Retrieve student by ID
  // SUPABASE: const { data, error } = await supabase.from('students').select('*').eq('id', id).single()
  // FIREBASE: const docSnap = await getDoc(doc(db, "students", id));
  getById: function(id) {
    this.init();
    const students = this.getAll();
    return students.find(s => s.id === id) || null;
  },

  // Add new student
  // SUPABASE: const { data, error } = await supabase.from('students').insert([student])
  // FIREBASE: await setDoc(doc(db, "students", student.id), student);
  add: function(student) {
    this.init();
    const students = this.getAll();
    if (students.some(s => s.id === student.id)) {
      return { success: false, error: "ID already exists" };
    }
    students.push(student);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    this.updateGlobalScriptState();
    return { success: true, data: student };
  },

  // Update existing student
  // SUPABASE: const { data, error } = await supabase.from('students').update(student).eq('id', student.id)
  // FIREBASE: await updateDoc(doc(db, "students", student.id), student);
  update: function(student) {
    this.init();
    const students = this.getAll();
    const index = students.findIndex(s => s.id === student.id);
    if (index === -1) {
      return { success: false, error: "Student not found" };
    }
    students[index] = student;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    this.updateGlobalScriptState();
    return { success: true, data: student };
  },

  // Delete student
  // SUPABASE: const { error } = await supabase.from('students').delete().eq('id', id)
  // FIREBASE: await deleteDoc(doc(db, "students", id));
  delete: function(id) {
    this.init();
    let students = this.getAll();
    const originalLength = students.length;
    students = students.filter(s => s.id !== id);
    if (students.length === originalLength) {
      return { success: false, error: "Student not found" };
    }
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    this.updateGlobalScriptState();
    return { success: true };
  },

  // Keep original script.js variables synchronized in memory
  updateGlobalScriptState: function() {
    const students = this.getAll();
    window.students = students;
    if (window.studentMap) {
      window.studentMap = {};
      students.forEach(s => {
        window.studentMap[s.id] = s;
      });
    }
  },

  // Notifications API
  getNotifications: function() {
    this.init();
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Corrupted notifications database. Resetting...", e);
    }
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  },

  addNotification: function(message, type = "info") {
    this.init();
    const notifs = this.getNotifications();
    const newNotif = {
      id: Date.now(),
      type,
      message,
      time: "Just now",
      read: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    return newNotif;
  },

  markNotificationsAsRead: function() {
    this.init();
    const notifs = this.getNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  },

  // Session Authentication API
  getLoggedInUser: function() {
    this.init();
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Corrupted session database. Resetting...", e);
    }
    localStorage.removeItem(SESSION_KEY);
    return null;
  },

  getUsers: function() {
    this.init();
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Corrupted users database. Resetting...", e);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  },

  register: function(username, password, role, studentInfo = null) {
    this.init();
    const users = this.getUsers();
    
    if (users.some(u => u && u.username && u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: "Username already exists" };
    }

    const newUser = { username, password, role };
    
    if (role === "student" && studentInfo) {
      const studentId = studentInfo.id || "S-2023-" + String(Math.floor(Math.random() * 900) + 100);
      newUser.id = studentId;
      
      const newStudent = {
        id: studentId,
        name: username,
        class: studentInfo.class || "12",
        section: studentInfo.section || "A",
        department: studentInfo.department || "Science",
        attendance: Number(studentInfo.attendance || 85),
        assignments: Number(studentInfo.assignments || 80),
        testScores: Number(studentInfo.testScores || 75),
        engagement: Number(studentInfo.engagement || 3),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        subjects: { Math: 75, Science: 75, English: 80, Computer: 85, Physics: 70, Chemistry: 70 },
        history: [70, 72, 74, 75],
        streak: 1,
        badges: ["bronze"],
        remarks: "Student registered via SignUp portal."
      };
      
      this.add(newStudent);
    }
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, data: newUser };
  },

  authenticate: function(username, password, role) {
    this.init();
    const users = this.getUsers();
    const inputUser = username.trim().toLowerCase();
    
    const found = users.find(u => {
      if (!u || !u.username || !u.password || !u.role) return false;
      const matchName = u.username.toLowerCase() === inputUser;
      const matchAlias = (role === "teacher" && u.username === "Dr. Clara Mercer" && inputUser === "teacher") ||
                         (role === "admin" && u.username === "Director" && inputUser === "admin") ||
                         (role === "student" && u.username === "Arjun Sharma" && inputUser === "student");
      
      return (matchName || matchAlias) && u.password === password && u.role === role;
    });

    if (!found) {
      return { success: false, error: "Invalid username, password, or role selection." };
    }
    return { success: true, data: found };
  },

  login: function(username, role, studentId = null) {
    const avatars = {
      admin: "https://api.dicebear.com/7.x/avataaars/svg?seed=Director",
      teacher: "https://api.dicebear.com/7.x/avataaars/svg?seed=Clara",
      student: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };
    const session = {
      username,
      role,
      id: studentId,
      avatar: avatars[role] || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout: function() {
    localStorage.removeItem(SESSION_KEY);
  }
};

// Auto run sync
windowDatabase.init();
window.db = windowDatabase;
// Export global reference for script.js compatibility
window.students = windowDatabase.getAll();
window.studentMap = {};
window.students.forEach(s => {
  window.studentMap[s.id] = s;
});
