/**
 * js/dsa.js - Advanced DSA algorithm visualizers & complexity analysis
 */

window.dsa = {
  // Common states
  delayMs: 400,
  isSorting: false,
  isSearching: false,
  isTraversing: false,

  // --- Utility sleep helper ---
  sleep: function() {
    return new Promise(resolve => setTimeout(resolve, this.delayMs));
  },

  // ==========================================
  // 1. SORTING VISUALIZER (Quick / Merge)
  // ==========================================
  sortArray: [85, 55, 94, 78, 62, 98, 50, 72],
  
  initSortingVisualizer: function() {
    const container = document.getElementById("sorting-bars-container");
    if (!container) return;
    this.renderSortBars();
  },

  renderSortBars: function(activeIndices = [], pivotIndex = -1, sortedIndices = []) {
    const container = document.getElementById("sorting-bars-container");
    if (!container) return;

    container.innerHTML = this.sortArray.map((val, idx) => {
      let colorClass = "bg-indigo-500 dark:bg-indigo-600"; // default
      if (sortedIndices.includes(idx)) colorClass = "bg-green-500 dark:bg-green-600";
      else if (idx === pivotIndex) colorClass = "bg-red-500 dark:bg-red-600";
      else if (activeIndices.includes(idx)) colorClass = "bg-yellow-500 dark:bg-yellow-600";

      return `
        <div class="flex flex-col items-center justify-end h-40 w-10 sm:w-12">
          <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">${val}</span>
          <div class="w-full ${colorClass} rounded-t transition-all duration-300 dsa-bar" style="height: ${val * 1.2}px"></div>
          <span class="text-[10px] text-gray-400 mt-1">idx:${idx}</span>
        </div>
      `;
    }).join('');
  },

  resetSortArray: function() {
    if (this.isSorting) return;
    this.sortArray = [85, 55, 94, 78, 62, 98, 50, 72];
    this.renderSortBars();
    document.getElementById("sort-log").innerHTML = "Array reset. Ready to sort.";
  },

  runQuickSort: async function() {
    if (this.isSorting) return;
    this.isSorting = true;
    const log = document.getElementById("sort-log");
    log.innerHTML = "Initializing Quick Sort (Average: O(N log N) | Space: O(log N))...";
    
    await this.quickSortHelper(0, this.sortArray.length - 1, log);
    
    const allSorted = Array.from({length: this.sortArray.length}, (_, i) => i);
    this.renderSortBars([], -1, allSorted);
    log.innerHTML = "<b>Quick Sort Complete!</b> Array is fully sorted.";
    this.isSorting = false;
  },

  quickSortHelper: async function(low, high, log) {
    if (low < high) {
      const pIdx = await this.partition(low, high, log);
      await this.quickSortHelper(low, pIdx - 1, log);
      await this.quickSortHelper(pIdx + 1, high, log);
    }
  },

  partition: async function(low, high, log) {
    const pivot = this.sortArray[high];
    log.innerHTML = `Partitioning: choosing index ${high} (value ${pivot}) as pivot.`;
    this.renderSortBars([], high);
    await this.sleep();

    let i = low - 1;
    for (let j = low; j < high; j++) {
      this.renderSortBars([j, i + 1], high);
      log.innerHTML = `Comparing elements: array[${j}] = ${this.sortArray[j]} with pivot = ${pivot}.`;
      await this.sleep();

      if (this.sortArray[j] < pivot) {
        i++;
        // Swap
        const temp = this.sortArray[i];
        this.sortArray[i] = this.sortArray[j];
        this.sortArray[j] = temp;
        log.innerHTML = `Swap index ${i} (${this.sortArray[i]}) and index ${j} (${this.sortArray[j]}).`;
        this.renderSortBars([i, j], high);
        await this.sleep();
      }
    }
    const temp = this.sortArray[i + 1];
    this.sortArray[i + 1] = this.sortArray[high];
    this.sortArray[high] = temp;
    log.innerHTML = `Swap pivot index ${high} into correct sorted spot at index ${i + 1}.`;
    this.renderSortBars([], i + 1);
    await this.sleep();

    return i + 1;
  },

  runMergeSort: async function() {
    if (this.isSorting) return;
    this.isSorting = true;
    const log = document.getElementById("sort-log");
    log.innerHTML = "Initializing Merge Sort (Average: O(N log N) | Space: O(N))...";
    
    await this.mergeSortHelper(0, this.sortArray.length - 1, log);
    
    const allSorted = Array.from({length: this.sortArray.length}, (_, i) => i);
    this.renderSortBars([], -1, allSorted);
    log.innerHTML = "<b>Merge Sort Complete!</b> Array is fully sorted.";
    this.isSorting = false;
  },

  mergeSortHelper: async function(l, r, log) {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    log.innerHTML = `Dividing: range [${l} - ${r}] into [${l} - ${m}] and [${m+1} - ${r}].`;
    await this.sleep();
    await this.mergeSortHelper(l, m, log);
    await this.mergeSortHelper(m + 1, r, log);
    await this.merge(l, m, r, log);
  },

  merge: async function(l, m, r, log) {
    log.innerHTML = `Merging segments [${l} to ${m}] and [${m+1} to ${r}].`;
    const temp = [];
    let i = l, j = m + 1;
    while (i <= m && j <= r) {
      this.renderSortBars([i, j]);
      await this.sleep();
      if (this.sortArray[i] <= this.sortArray[j]) {
        temp.push(this.sortArray[i++]);
      } else {
        temp.push(this.sortArray[j++]);
      }
    }
    while (i <= m) temp.push(this.sortArray[i++]);
    while (j <= r) temp.push(this.sortArray[j++]);

    for (let k = 0; k < temp.length; k++) {
      this.sortArray[l + k] = temp[k];
      this.renderSortBars([l + k]);
      await this.sleep();
    }
  },

  // ==========================================
  // 2. BINARY SEARCH VISUALIZER
  // ==========================================
  searchArray: [50, 55, 62, 72, 78, 85, 94, 98],
  
  initSearchVisualizer: function() {
    this.renderSearchBlocks();
  },

  renderSearchBlocks: function(low = -1, high = -1, mid = -1, found = -1) {
    const container = document.getElementById("search-blocks-container");
    if (!container) return;

    container.innerHTML = this.searchArray.map((val, idx) => {
      let colorClass = "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
      let ptrText = "";

      if (idx === found) {
        colorClass = "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 font-bold";
        ptrText = "<span class='text-[10px] text-green-500 absolute -bottom-5'>Found</span>";
      } else if (idx === mid) {
        colorClass = "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 font-bold";
        ptrText = "<span class='text-[10px] text-red-500 absolute -bottom-5'>Mid</span>";
      } else if (idx === low && idx === high) {
        colorClass = "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
        ptrText = "<span class='text-[10px] text-yellow-600 absolute -bottom-5'>L,H</span>";
      } else if (idx === low) {
        colorClass = "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20";
        ptrText = "<span class='text-[10px] text-indigo-500 absolute -bottom-5'>Low</span>";
      } else if (idx === high) {
        colorClass = "border-purple-500 bg-purple-50 dark:bg-purple-950/20";
        ptrText = "<span class='text-[10px] text-purple-500 absolute -bottom-5'>High</span>";
      } else if (low !== -1 && high !== -1 && (idx < low || idx > high)) {
        colorClass = "opacity-30 border-zinc-250 bg-zinc-100";
      }

      return `
        <div class="relative flex flex-col items-center justify-center border-2 rounded w-12 h-12 ${colorClass}">
          <span class="text-sm font-bold">${val}</span>
          <span class="text-[9px] text-zinc-400 absolute -top-5">idx:${idx}</span>
          ${ptrText}
        </div>
      `;
    }).join('');
  },

  runBinarySearch: async function() {
    if (this.isSearching) return;
    const targetInput = document.getElementById("search-target");
    if (!targetInput) return;
    const target = parseInt(targetInput.value);
    if (isNaN(target)) {
      alert("Please enter a valid target score to search.");
      return;
    }

    this.isSearching = true;
    const log = document.getElementById("search-log");
    log.innerHTML = `Starting Binary Search for target: ${target}. (Complexity: O(log N))`;

    let low = 0;
    let high = this.searchArray.length - 1;
    let foundIdx = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      this.renderSearchBlocks(low, high, mid);
      log.innerHTML = `low = ${low}, high = ${high}, calculating mid = ${mid}. Checking index ${mid} (value ${this.searchArray[mid]}).`;
      await this.sleep();
      await this.sleep(); // extra pause for reading

      if (this.searchArray[mid] === target) {
        foundIdx = mid;
        log.innerHTML = `<b>Target Found!</b> array[${mid}] = ${target}.`;
        this.renderSearchBlocks(low, high, mid, mid);
        break;
      } else if (this.searchArray[mid] < target) {
        log.innerHTML = `Since array[${mid}] = ${this.searchArray[mid]} &lt; ${target}, target must lie in the right half. Moving low = ${mid + 1}.`;
        low = mid + 1;
      } else {
        log.innerHTML = `Since array[${mid}] = ${this.searchArray[mid]} &gt; ${target}, target must lie in the left half. Moving high = ${mid - 1}.`;
        high = mid - 1;
      }
      this.renderSearchBlocks(low, high);
      await this.sleep();
    }

    if (foundIdx === -1) {
      log.innerHTML = `<b>Search Complete.</b> Target ${target} was not found in the array (low &gt; high).`;
      this.renderSearchBlocks();
    }
    this.isSearching = false;
  },

  // ==========================================
  // 3. HEAP / PRIORITY QUEUE VISUALIZER
  // ==========================================
  heapArray: [95, 88, 76, 68, 80, 52, 70], // seeded max-heap

  initHeapVisualizer: function() {
    this.renderHeapTree();
  },

  renderHeapTree: function() {
    const container = document.getElementById("heap-tree-container");
    if (!container) return;

    // We render as a styled grid showing tree levels
    // Level 0: Index 0
    // Level 1: Index 1, 2
    // Level 2: Index 3, 4, 5, 6
    let html = '<div class="flex flex-col gap-8 items-center w-full max-w-md">';
    
    // Helper to render nodes
    const node = (idx) => {
      if (idx >= this.heapArray.length) return `<div class="w-10 h-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-800 text-xs">null</div>`;
      return `
        <div class="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-700 text-white flex flex-col items-center justify-center font-bold text-sm shadow hover:scale-105 transition-transform" title="Index: ${idx}">
          <span>${this.heapArray[idx]}</span>
        </div>
      `;
    };

    // Level 0
    html += `<div class="flex justify-center">${node(0)}</div>`;
    
    // Level 1
    html += `
      <div class="flex justify-between w-2/3">
        <div class="relative flex flex-col items-center w-1/2">
          ${node(1)}
        </div>
        <div class="relative flex flex-col items-center w-1/2">
          ${node(2)}
        </div>
      </div>
    `;

    // Level 2
    html += `
      <div class="flex justify-between w-full">
        ${node(3)}
        ${node(4)}
        ${node(5)}
        ${node(6)}
      </div>
    `;

    html += '</div>';
    
    // List representation underneath
    html += `
      <div class="mt-4 flex flex-wrap gap-2 justify-center">
        <b>Array Layout:</b>
        ${this.heapArray.map((val, idx) => `<span class="px-2 py-0.5 border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs rounded font-mono">${idx}:${val}</span>`).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  insertHeap: function() {
    const val = Math.floor(Math.random() * 50) + 50; // 50-100
    if (this.heapArray.length >= 7) {
      alert("Heap visualizer is capped at size 7 for neat rendering.");
      return;
    }
    
    this.heapArray.push(val);
    document.getElementById("heap-log").innerHTML = `Inserted value ${val} at index ${this.heapArray.length - 1}. Bubble up to maintain Max-Heap.`;
    
    // Bubble up (Heapify Up)
    let idx = this.heapArray.length - 1;
    while (idx > 0) {
      let parent = Math.floor((idx - 1) / 2);
      if (this.heapArray[idx] > this.heapArray[parent]) {
        // Swap
        let temp = this.heapArray[parent];
        this.heapArray[parent] = this.heapArray[idx];
        this.heapArray[idx] = temp;
        idx = parent;
      } else {
        break;
      }
    }
    
    this.renderHeapTree();
  },

  extractHeapMax: function() {
    if (this.heapArray.length === 0) {
      alert("Heap is empty.");
      return;
    }

    const maxVal = this.heapArray[0];
    document.getElementById("heap-log").innerHTML = `Extracted top score (Max): ${maxVal}. Moving last element to root, then heapify down.`;

    if (this.heapArray.length === 1) {
      this.heapArray.pop();
    } else {
      this.heapArray[0] = this.heapArray.pop();
      // Heapify Down
      let idx = 0;
      const len = this.heapArray.length;
      while (true) {
        let left = 2 * idx + 1;
        let right = 2 * idx + 2;
        let swap = idx;

        if (left < len && this.heapArray[left] > this.heapArray[swap]) {
          swap = left;
        }
        if (right < len && this.heapArray[right] > this.heapArray[swap]) {
          swap = right;
        }

        if (swap !== idx) {
          let temp = this.heapArray[idx];
          this.heapArray[idx] = this.heapArray[swap];
          this.heapArray[swap] = temp;
          idx = swap;
        } else {
          break;
        }
      }
    }

    this.renderHeapTree();
  },

  // ==========================================
  // 4. STACK AND QUEUE VISUALIZERS
  // ==========================================
  stackArray: ["Arjun Paper", "Priya Paper", "Rahul Paper"],
  queueArray: ["S-2023-005", "S-2023-009", "S-2023-010"],

  initStackQueue: function() {
    this.renderStack();
    this.renderQueue();
  },

  renderStack: function() {
    const container = document.getElementById("stack-container");
    if (!container) return;
    
    if (this.stackArray.length === 0) {
      container.innerHTML = `<div class="h-40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-zinc-400 text-sm">Stack is Empty</div>`;
      return;
    }

    container.innerHTML = `
      <div class="flex flex-col gap-1 w-full max-w-[200px]">
        ${[...this.stackArray].reverse().map((item, idx) => `
          <div class="p-2 border rounded bg-indigo-50 dark:bg-zinc-800 border-indigo-200 dark:border-zinc-700 text-center font-semibold text-xs shadow-sm hover:translate-x-1 transition-transform">
            ${idx === 0 ? "👑 [TOP] " : ""}${item}
          </div>
        `).join('')}
      </div>
    `;
  },

  pushStack: function() {
    const studentId = "S-2023-" + String(Math.floor(Math.random() * 500) + 100);
    this.stackArray.push(`${studentId} Paper`);
    this.renderStack();
    document.getElementById("stack-queue-log").textContent = `Pushed item onto stack. (LIFO order: Last In, First Out)`;
  },

  popStack: function() {
    if (this.stackArray.length === 0) return;
    const item = this.stackArray.pop();
    this.renderStack();
    document.getElementById("stack-queue-log").textContent = `Popped item '${item}' from stack.`;
  },

  renderQueue: function() {
    const container = document.getElementById("queue-container");
    if (!container) return;

    if (this.queueArray.length === 0) {
      container.innerHTML = `<div class="p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-zinc-400 text-sm">Queue is Empty</div>`;
      return;
    }

    container.innerHTML = `
      <div class="flex flex-wrap gap-2 items-center w-full">
        ${this.queueArray.map((item, idx) => `
          <div class="p-2 border rounded bg-emerald-50 dark:bg-zinc-800 border-emerald-200 dark:border-zinc-700 font-semibold text-xs shadow-sm text-center min-w-[70px]">
            ${idx === 0 ? "👉 [FRONT] " : idx === this.queueArray.length - 1 ? "📥 [REAR] " : ""}${item}
          </div>
        `).join('')}
      </div>
    `;
  },

  enqueueQueue: function() {
    const studentId = "S-2023-" + String(Math.floor(Math.random() * 500) + 100);
    this.queueArray.push(studentId);
    this.renderQueue();
    document.getElementById("stack-queue-log").textContent = `Enqueued student '${studentId}' to queue. (FIFO order: First In, First Out)`;
  },

  dequeueQueue: function() {
    if (this.queueArray.length === 0) return;
    const item = this.queueArray.shift();
    this.renderQueue();
    document.getElementById("stack-queue-log").textContent = `Dequeued student '${item}' from front of queue.`;
  },

  // ==========================================
  // 5. GRAPH VISUALIZER (BFS / DFS Traversals)
  // ==========================================
  graphData: {
    nodes: ["Math", "Physics", "Computer", "Science", "Chemistry", "English"],
    adj: {
      "Math": ["Physics", "Computer", "Science"],
      "Physics": ["Math", "Chemistry"],
      "Computer": ["Math", "English"],
      "Science": ["Math", "Chemistry"],
      "Chemistry": ["Physics", "Science"],
      "English": ["Computer"]
    }
  },

  initGraphVisualizer: function() {
    this.renderGraph();
  },

  renderGraph: function(activeNode = "", visitedList = []) {
    const container = document.getElementById("graph-visualizer-container");
    if (!container) return;

    // Draw nodes manually. Position nodes in a clean circle or polygon layout.
    const positions = {
      "Math": { x: 150, y: 30 },
      "Physics": { x: 50, y: 100 },
      "Computer": { x: 250, y: 100 },
      "Science": { x: 90, y: 190 },
      "Chemistry": { x: 210, y: 190 },
      "English": { x: 150, y: 250 }
    };

    let svgLines = "";
    // Draw edges
    Object.entries(this.graphData.adj).forEach(([from, toList]) => {
      const p1 = positions[from];
      toList.forEach(to => {
        const p2 = positions[to];
        svgLines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#cbd5e1" stroke-width="1.5" />`;
      });
    });

    let nodesHtml = "";
    Object.entries(positions).forEach(([name, pos]) => {
      let colorClass = "bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300";
      if (name === activeNode) {
        colorClass = "bg-red-500 border-red-600 text-white current scale-110 shadow-lg";
      } else if (visitedList.includes(name)) {
        colorClass = "bg-green-500 border-green-600 text-white visited shadow-md";
      }

      nodesHtml += `
        <div class="absolute w-20 h-10 border-2 rounded-full flex items-center justify-center font-bold text-[10px] ${colorClass} hover-scale z-10 transition-all cursor-pointer shadow-sm"
             style="left: ${pos.x - 40}px; top: ${pos.y - 20}px;">
          ${name}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="relative w-[300px] h-[280px]">
        <svg class="absolute inset-0 w-full h-full">${svgLines}</svg>
        ${nodesHtml}
      </div>
    `;
  },

  runBFS: async function() {
    if (this.isTraversing) return;
    this.isTraversing = true;
    const log = document.getElementById("graph-log");
    log.innerHTML = "Initializing BFS (Queue-based, Level Order, Time: O(V + E))...";

    const visited = [];
    const queue = ["Math"];
    const visitedSet = new Set(["Math"]);

    while (queue.length > 0) {
      const current = queue.shift();
      visited.push(current);
      
      this.renderGraph(current, visited);
      log.innerHTML = `Dequeued <b>${current}</b>. Visited: [${visited.join(', ')}]. Queue state: [${queue.join(', ')}].`;
      await this.sleep();
      await this.sleep();

      const neighbors = this.graphData.adj[current];
      for (const n of neighbors) {
        if (!visitedSet.has(n)) {
          visitedSet.add(n);
          queue.push(n);
          log.innerHTML = `Enqueuing unvisited neighbor: <b>${n}</b>. Queue state: [${queue.join(', ')}].`;
          await this.sleep();
        }
      }
    }

    this.renderGraph("", visited);
    log.innerHTML = "<b>BFS Traversal Complete!</b> Visited all connected components.";
    this.isTraversing = false;
  },

  runDFS: async function() {
    if (this.isTraversing) return;
    this.isTraversing = true;
    const log = document.getElementById("graph-log");
    log.innerHTML = "Initializing DFS (Stack-based, Backtracking, Time: O(V + E))...";

    const visited = [];
    const stack = ["Math"];
    const visitedSet = new Set(["Math"]);

    while (stack.length > 0) {
      const current = stack.pop();
      visited.push(current);
      
      this.renderGraph(current, visited);
      log.innerHTML = `Popped <b>${current}</b>. Visited: [${visited.join(', ')}]. Stack state: [${stack.join(', ')}].`;
      await this.sleep();
      await this.sleep();

      const neighbors = this.graphData.adj[current];
      // Push neighbors in reverse order for correct DFS traversal path
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const n = neighbors[i];
        if (!visitedSet.has(n)) {
          visitedSet.add(n);
          stack.push(n);
          log.innerHTML = `Pushing unvisited neighbor: <b>${n}</b> to Stack. Stack: [${stack.join(', ')}].`;
          await this.sleep();
        }
      }
    }

    this.renderGraph("", visited);
    log.innerHTML = "<b>DFS Traversal Complete!</b> Visited all paths.";
    this.isTraversing = false;
  },

  // ==========================================
  // 6. DECISION TREE VISUALIZER
  // ==========================================
  initDecisionTree: function() {
    this.renderDecisionTree();
  },

  renderDecisionTree: function(metrics = { attendance: 85, assignments: 75, testScores: 68 }) {
    const container = document.getElementById("tree-visualizer-container");
    if (!container) return;

    // Simple Decision Tree Logic paths
    // Root: Attendance >= 80?
    // Left: Assignments >= 70? -> Pass (C/B) vs Fail (D/E)
    // Right: Attendance < 80 -> TestScores >= 60? -> Pass vs Fail
    const attOk = metrics.attendance >= 80;
    const assOk = metrics.assignments >= 70;
    const testOk = metrics.testScores >= 60;

    let path = ["root"];
    if (attOk) {
      path.push("att-yes");
      if (assOk) path.push("ass-yes");
      else path.push("ass-no");
    } else {
      path.push("att-no");
      if (testOk) path.push("test-yes");
      else path.push("test-no");
    }

    const highlight = (id) => path.includes(id) ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300 font-bold scale-[1.02] shadow-md active-path" : "opacity-50 text-gray-500 dark:text-zinc-500";

    container.innerHTML = `
      <div class="flex flex-col items-center gap-4 w-full text-xs">
        <!-- Root node -->
        <div class="tree-node border p-2 rounded text-center ${highlight("root")}">
          Attendance &ge; 80%? <br>
          <span class="text-[9px] text-zinc-400">Current: ${metrics.attendance}%</span>
        </div>

        <div class="flex justify-between w-full max-w-[280px]">
          <!-- Left side (Yes) -->
          <div class="flex flex-col items-center gap-4 w-1/2">
            <div class="text-[9px] font-bold text-green-600 dark:text-green-400">&mdash; Yes &mdash;</div>
            <div class="tree-node border p-2 rounded text-center ${highlight("att-yes")}">
              Assignments &ge; 70%? <br>
              <span class="text-[9px] text-zinc-400">Current: ${metrics.assignments}%</span>
            </div>
            
            <div class="flex justify-around w-full">
              <div class="tree-node border p-1 rounded text-center ${highlight("ass-yes")}">
                <span class="text-green-600 font-bold text-[10px]">PASS (A/B)</span>
              </div>
              <div class="tree-node border p-1 rounded text-center ${highlight("ass-no")}">
                <span class="text-yellow-600 font-bold text-[10px]">RISK (C/D)</span>
              </div>
            </div>
          </div>

          <!-- Right side (No) -->
          <div class="flex flex-col items-center gap-4 w-1/2">
            <div class="text-[9px] font-bold text-red-600 dark:text-red-400">&mdash; No &mdash;</div>
            <div class="tree-node border p-2 rounded text-center ${highlight("att-no")}">
              Test Scores &ge; 60%? <br>
              <span class="text-[9px] text-zinc-400">Current: ${metrics.testScores}%</span>
            </div>

            <div class="flex justify-around w-full">
              <div class="tree-node border p-1 rounded text-center ${highlight("test-yes")}">
                <span class="text-yellow-600 font-bold text-[10px]">RISK (C/D)</span>
              </div>
              <div class="tree-node border p-1 rounded text-center ${highlight("test-no")}">
                <span class="text-red-600 font-bold text-[10px]">FAIL (E/F)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
