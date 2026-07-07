/**
 * js/viva.js - Academic Documentation & Viva Center
 */

window.viva = {
  vivaQuestions: [
    {
      q: "What is the core objective of this project?",
      a: "The project builds an AI-powered Student Analytics Platform designed to automate student performance tracking, predict academic risk early using Machine Learning models, and provide explainable recommendations, while showcasing fundamental Data Structures & Algorithms (DSA)."
    },
    {
      q: "Which Machine Learning concept is used and why?",
      a: "We simulate an ensemble of Decision Trees (like a Random Forest Classifier). It takes multi-dimensional inputs (Attendance, Assignments, Test Scores, Engagement) and outputs a predicted grade. We also implement Explainable AI (similar to SHAP/LIME) to detail exactly how each input feature contributes to the output score."
    },
    {
      q: "How are Data Structures used in this project?",
      a: "We showcase 6 core structures: 1) Arrays for list containers. 2) HashMaps for fast O(1) ID search. 3) Binary Max-Heaps for priority queues based on grades. 4) Stack (LIFO) for undo/grading histories. 5) Queue (FIFO) for counseling waiting lines. 6) Graphs (Adjacency Lists) to map student study connections."
    },
    {
      q: "What is the difference between Quick Sort and Merge Sort?",
      a: "Quick Sort is an in-place Divide-and-Conquer algorithm with an average complexity of O(N log N) but a worst-case of O(N^2) if the pivot is poorly chosen. Merge Sort is a stable Divide-and-Conquer algorithm with a guaranteed complexity of O(N log N) in all cases, but it requires O(N) extra memory space for merging."
    },
    {
      q: "What is the complexity of Binary Search and why is it preferred?",
      a: "Binary Search operates in O(log N) time. It repeatedly divides the search space in half. It is significantly faster than linear search O(N), but it requires the underlying array to be pre-sorted."
    },
    {
      q: "Explain BFS vs DFS in Graphs.",
      a: "BFS (Breadth-First Search) uses a Queue to explore the graph level-by-level, making it ideal for finding shortest paths. DFS (Depth-First Search) uses a Stack (or recursion) to explore as deep as possible down a path before backtracking, which is ideal for detecting cycles and exploring topological structures."
    }
  ],

  renderVivaCenter: function() {
    const container = document.getElementById("viva-qa-container");
    if (!container) return;

    container.innerHTML = this.vivaQuestions.map((q, idx) => `
      <div class="border border-zinc-150 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/10 p-4">
        <button onclick="this.nextElementSibling.classList.toggle('hidden');" class="flex justify-between items-center w-full text-left font-bold text-gray-800 dark:text-zinc-200">
          <span>Q${idx+1}: ${q.q}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <p class="text-sm text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed hidden">
          <b>Answer:</b> ${q.a}
        </p>
      </div>
    `).join('');
  }
};
