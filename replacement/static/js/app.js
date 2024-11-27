// app.js

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------
  // Dark Mode Toggle
  // ----------------------
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  }

  // ----------------------
  // Simulation Variables
  // ----------------------
  let simulationHistory = []; // Stores the history of simulation steps
  let currentStep = 0;        // Tracks the current step in the simulation
  let intervalId = null;      // Stores the interval ID for play/pause functionality

  // ----------------------
  // Event Listener for Start Simulation Button
  // ----------------------
  const startSimulationBtn = document.getElementById('startSimulation');
  if (startSimulationBtn) {
    startSimulationBtn.addEventListener('click', () => {
      // Retrieve and process user inputs
      const pageRefsInput = document.getElementById('pageReferences').value.trim();
      const pageRefs = pageRefsInput.split(/\s+/).map(Number);
      const frameCount = parseInt(document.getElementById('frameCount').value);
      const algorithm = document.getElementById('algorithm').value;

      // Validate inputs
      if (validateInput(pageRefs, frameCount)) {
        let simulationResult;

        // Execute the selected algorithm
        switch (algorithm) {
          case 'FIFO':
            simulationResult = simulateFIFO(pageRefs, frameCount);
            break;
          case 'LFU':
            simulationResult = simulateLFU(pageRefs, frameCount);
            break;
          case 'LRU':
            simulationResult = simulateLRU(pageRefs, frameCount);
            break;
          case 'Optimal':
            simulationResult = simulateOptimal(pageRefs, frameCount);
            break;
          default:
            alert('Algorithm not implemented.');
            return;
        }

        // Update simulation history and reset current step
        simulationHistory = simulationResult.history;
        currentStep = 0;

        // Expose simulationHistory globally for chart.js
        window.simulationHistory = simulationHistory;

        // Display total page faults
        const totalPageFaultsElem = document.getElementById('totalPageFaults');
        if (totalPageFaultsElem) {
          totalPageFaultsElem.innerText = `Total Page Faults: ${simulationResult.pageFaults}`;
        }

        // Clear previous visualization, narration, and feedback
        const visualizationArea = document.getElementById('visualizationArea');
        if (visualizationArea) visualizationArea.innerHTML = '';

        const narrationText = document.getElementById('narrationText');
        if (narrationText) narrationText.innerText = '';

        const aiFeedback = document.getElementById('aiFeedback');
        if (aiFeedback) {
          aiFeedback.innerText = '';
          aiFeedback.classList.remove('text-red-500');
          aiFeedback.classList.add('text-gray-800', 'dark:text-gray-200');
        }

        // Ensure any simulation-specific errors are cleared
        const simulationError = document.getElementById('simulationError');
        if (simulationError) {
          simulationError.innerText = '';
          simulationError.classList.add('hidden');
        }

        // Initialize the visualization with frame labels
        initializeVisualization(frameCount);

        // Show the first step
        showStep(0);
        currentStep = 1; // Since we have shown the first step

        // Enable simulation controls appropriately
        const nextStepBtn = document.getElementById('nextStep');
        const prevStepBtn = document.getElementById('prevStep');
        const playPauseBtn = document.getElementById('playPause');

        if (nextStepBtn) nextStepBtn.disabled = false;
        if (prevStepBtn) prevStepBtn.disabled = true;
        if (playPauseBtn) playPauseBtn.disabled = false;

        // Generate AI feedback based on the simulation results
        generateFeedback({
          algorithm: algorithm,
          pageFaults: simulationResult.pageFaults,
          frames: frameCount,
          pageReferences: pageRefs,
        });
      } else {
        console.log('Validation failed.');
      }
    });
  }

  // ----------------------
  // Input Validation Function
  // ----------------------
  function validateInput(pages, frameCount) {
    let isValid = true;

    // Validate Page References
    const pageReferencesInput = document.getElementById('pageReferences');
    const pageReferencesError = document.getElementById('pageReferencesError');
    if (!pageReferencesInput || !pageReferencesError) {
      console.error('Page References input or error element not found.');
      return false;
    }

    if (pages.length === 0 || pages.some((p) => isNaN(p))) {
      isValid = false;
      pageReferencesInput.classList.add('input-error');
      pageReferencesError.classList.remove('hidden');
    } else {
      pageReferencesInput.classList.remove('input-error');
      pageReferencesError.classList.add('hidden');
    }

    // Validate Frame Count
    const frameCountInput = document.getElementById('frameCount');
    const frameCountError = document.getElementById('frameCountError');
    if (!frameCountInput || !frameCountError) {
      console.error('Frame Count input or error element not found.');
      return false;
    }

    if (isNaN(frameCount) || frameCount <= 0) {
      isValid = false;
      frameCountInput.classList.add('input-error');
      frameCountError.classList.remove('hidden');
    } else {
      frameCountInput.classList.remove('input-error');
      frameCountError.classList.add('hidden');
    }

    return isValid;
  }

  // ----------------------
  // Remove Error Styles on Input
  // ----------------------
  const pageReferencesInput = document.getElementById('pageReferences');
  const frameCountInput = document.getElementById('frameCount');

  if (pageReferencesInput) {
    pageReferencesInput.addEventListener('input', () => {
      const error = document.getElementById('pageReferencesError');
      pageReferencesInput.classList.remove('input-error');
      if (error) error.classList.add('hidden');
    });
  }

  if (frameCountInput) {
    frameCountInput.addEventListener('input', () => {
      const error = document.getElementById('frameCountError');
      frameCountInput.classList.remove('input-error');
      if (error) error.classList.add('hidden');
    });
  }

  // ----------------------
  // Page Replacement Algorithms
  // ----------------------

  function simulateFIFO(pages, frameCount) {
    let frames = Array(frameCount).fill(null); // Initialize frames
    let pageFaults = 0;
    let history = [];
    let pointer = 0; // Points to the frame to be replaced next

    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
      let hitFrames = [];

      if (!frames.includes(page)) {
        fault = true;
        frames[pointer] = page;
        frameUpdated = pointer;
        pointer = (pointer + 1) % frameCount;
        pageFaults++;
      } else {
        // Identify the frame that was hit
        const hitIndex = frames.indexOf(page);
        hitFrames.push(hitIndex);
      }

      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
        hitFrames: hitFrames, // Array of frame indices that had hits
      });
    });

    return { history, pageFaults };
  }


  //LFU
  function simulateLFU(pages, frameCount) {
    let frames = Array(frameCount).fill(null); // 当前存储的页面框架
    let pageFaults = 0; // 缺页次数
    let history = []; // 历史记录
    let frequency = {}; // 用于跟踪页面使用频率
    let lastUsed = {}; // 用于记录每个页面上次使用的时间

    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
      let hitFrames = [];

      // 更新页面使用频率和时间戳
      if (!frequency[page]) {
        frequency[page] = 0;
      }
      frequency[page]++;
      lastUsed[page] = index;

      if (!frames.includes(page)) {
        fault = true;

        if (frames.includes(null)) {
          // 如果有空位，直接放入
          const emptyIndex = frames.indexOf(null);
          frames[emptyIndex] = page;
          frameUpdated = emptyIndex;
        } else {
          // 找到使用频率最低的页面
          let minFrequency = Math.min(...frames.map(f => frequency[f]));
          let candidates = frames.filter(f => frequency[f] === minFrequency);

          // 如果有多个候选者，选择最久未使用的
          let victim = candidates.reduce((leastRecentlyUsed, candidate) => {
            return lastUsed[candidate] < lastUsed[leastRecentlyUsed] ? candidate : leastRecentlyUsed;
          });

          const victimIndex = frames.indexOf(victim);
          frames[victimIndex] = page;
          frameUpdated = victimIndex;

          // 清除被替换页面的记录
          delete frequency[victim];
          delete lastUsed[victim];
        }
        pageFaults++;
      } else {
        // 页面命中
        const hitIndex = frames.indexOf(page);
        hitFrames.push(hitIndex);
      }

      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
        hitFrames: hitFrames, // 命中的框架索引
      });
    });

    return { history, pageFaults };
  }


  function simulateLRU(pages, frameCount) {
    let frames = Array(frameCount).fill(null);
    let pageFaults = 0;
    let history = [];
    let recentUsage = []; // Tracks the order of page usage

    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
      let hitFrames = [];

      if (!frames.includes(page)) {
        fault = true;
        if (frames.includes(null)) {
          const emptyIndex = frames.indexOf(null);
          frames[emptyIndex] = page;
          frameUpdated = emptyIndex;
        } else {
          // Find the least recently used page
          const lruPage = recentUsage.shift();
          const lruIndex = frames.indexOf(lruPage);
          frames[lruIndex] = page;
          frameUpdated = lruIndex;
        }
        pageFaults++;
      } else {
        // Page hit
        const hitIndex = frames.indexOf(page);
        hitFrames.push(hitIndex);
        // Update recent usage by removing the page from its current position
        const usageIndex = recentUsage.indexOf(page);
        if (usageIndex !== -1) {
          recentUsage.splice(usageIndex, 1);
        }
      }

      // Update recent usage by adding the current page
      recentUsage.push(page);

      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
        hitFrames: hitFrames, // Array of frame indices that had hits
      });
    });

    return { history, pageFaults };
  }

  function simulateOptimal(pages, frameCount) {
    let frames = Array(frameCount).fill(null);
    let pageFaults = 0;
    let history = [];

    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
      let hitFrames = [];

      if (!frames.includes(page)) {
        fault = true;
        if (frames.includes(null)) {
          const emptyIndex = frames.indexOf(null);
          frames[emptyIndex] = page;
          frameUpdated = emptyIndex;
        } else {
          // Predict future usage for each page in frames
          let futureIndices = frames.map((framePage) => {
            let nextUse = pages.slice(index + 1).indexOf(framePage);
            return nextUse === -1 ? Infinity : nextUse;
          });

          // Select the frame with the farthest next use
          let maxFuture = Math.max(...futureIndices);
          let victimIndices = futureIndices
            .map((val, idx) => ({ val, idx }))
            .filter(obj => obj.val === maxFuture)
            .map(obj => obj.idx);

          // If multiple victims, select the first one
          let victimIndex = victimIndices[0];

          frames[victimIndex] = page;
          frameUpdated = victimIndex;
        }
        pageFaults++;
      } else {
        // Page hit
        const hitIndex = frames.indexOf(page);
        hitFrames.push(hitIndex);
      }

      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
        hitFrames: hitFrames, // Array of frame indices that had hits
      });
    });

    return { history, pageFaults };
  }

  // ----------------------
  // Initialize Visualization Function
  // ----------------------
  function initializeVisualization(frameCount) {
    const visualizationArea = document.getElementById('visualizationArea');
    if (!visualizationArea) {
      console.error('Visualization area not found.');
      return;
    }
    visualizationArea.innerHTML = ''; // Clear previous content

    // Create the table element
    const table = document.createElement('table');
    table.className = 'w-full border-collapse text-center';
    table.id = 'simulationTable';

    // Create the header row
    const headerRow = document.createElement('tr');
    headerRow.id = 'tableHeaderRow';

    const emptyHeader = document.createElement('th');
    emptyHeader.className = 'border px-2 py-1';
    emptyHeader.innerText = '物理块';
    headerRow.appendChild(emptyHeader);

    table.appendChild(headerRow);

    // Create rows for each frame
    for (let i = 0; i < frameCount; i++) {
      const row = document.createElement('tr');
      row.classList.add('frame-row');
      row.dataset.frameIndex = i;

      // Frame label cell
      const frameCell = document.createElement('td');
      frameCell.className = 'border px-2 py-1 font-semibold';
      frameCell.innerText = `物理块 ${i + 1}`;
      row.appendChild(frameCell);

      table.appendChild(row);
    }

    visualizationArea.appendChild(table);
  }

  // ----------------------
  // Show Step Function
  // ----------------------
  function showStep(stepIndex) {
    const table = document.getElementById('simulationTable');
    if (!table) {
      console.error('Simulation table not found.');
      return;
    }
  
    const step = simulationHistory[stepIndex];
    if (!step) {
      console.error(`Step ${stepIndex} not found in simulation history.`);
      return;
    }
  
    // Add a new header cell for the current step
    const headerRow = document.getElementById('tableHeaderRow');
    const th = document.createElement('th');
    th.className = 'border px-2 py-1';
    th.innerText = `T${step.step}`;
    headerRow.appendChild(th);
  
    // For each frame, add a new cell
    const frameRows = table.querySelectorAll('.frame-row');
  
    frameRows.forEach((row) => {
      const frameIndex = parseInt(row.dataset.frameIndex);
      const cell = document.createElement('td');
      cell.className = 'border px-2 py-1 relative';
  
      const pageInFrame = step.frames[frameIndex];
  
      if (pageInFrame !== null) {
        cell.innerText = pageInFrame;
      }
  
      // Remove any existing color classes to prevent conflicts
      cell.classList.remove('bg-red-200', 'bg-green-200', 'text-red-800', 'text-green-800', 'text-red-200', 'text-green-200');
  
      // Apply custom classes based on faults and hits
      if (step.frameUpdated === frameIndex) {
        if (step.fault) {
          // Page fault occurred in this frame
          cell.classList.add('page-fault', 'has-tooltip');
          cell.setAttribute('data-tippy-content', `Page fault: Loaded page ${pageInFrame} into Frame ${frameIndex + 1}`);
        } else {
          // Page hit occurred in this frame
          cell.classList.add('page-hit', 'has-tooltip');
          cell.setAttribute('data-tippy-content', `Page hit: Page ${pageInFrame} was already in Frame ${frameIndex + 1}`);
        }
      }
  
      // Apply hit class for hits that are not the updated frame
      if (!step.fault && step.hitFrames.includes(frameIndex)) {
        cell.classList.add('page-hit', 'has-tooltip');
        cell.setAttribute('data-tippy-content', `Page hit: Page ${pageInFrame} was already in Frame ${frameIndex + 1}`);
      }
  
      row.appendChild(cell);
  
      // Initialize tooltip for this cell
      if (typeof tippy === 'function') { // Ensure tippy is loaded
        tippy(cell, {
          placement: 'top',
          arrow: true,
          animation: 'scale',
        });
      }
    });
  
    // Update narration
    const narrationText = document.getElementById('narrationText');
    if (narrationText) {
      if (step.fault) {
        narrationText.innerText = `在时间 T${step.step}, 页面 ${step.page} 导致了一次缺页中断并被加载到帧 ${step.frameUpdated + 1}.`;
      } else if (step.hitFrames.length > 0) {
        narrationText.innerText = `在时间 T${step.step}, 页面 ${step.page} 已经在内存中 (命中).`;
      } else {
        narrationText.innerText = `在时间 T${step.step}, 页面 ${step.page} 已经在内存中，没有缺页中断发生`;
      }
    }
  }

  // ----------------------
  // Controls Event Listeners
  // ----------------------
  const nextStepBtn = document.getElementById('nextStep');
  const prevStepBtn = document.getElementById('prevStep');
  const playPauseBtn = document.getElementById('playPause');

  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      if (currentStep < simulationHistory.length) {
        showStep(currentStep);
        currentStep++;
        if (prevStepBtn) prevStepBtn.disabled = false;
      }
      if (currentStep >= simulationHistory.length) {
        if (nextStepBtn) nextStepBtn.disabled = true;
      }
    });
  }

  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        removeStep(currentStep);
        if (nextStepBtn) nextStepBtn.disabled = false;
      } else if (currentStep === 1) {
        currentStep--;
        removeStep(0);
        if (prevStepBtn) prevStepBtn.disabled = true;
        if (nextStepBtn) nextStepBtn.disabled = false;
      }
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        playPauseBtn.innerText = '播放';
      } else {
        intervalId = setInterval(() => {
          if (currentStep < simulationHistory.length) {
            showStep(currentStep);
            currentStep++;
            if (prevStepBtn) prevStepBtn.disabled = false;
          }
          if (currentStep >= simulationHistory.length) {
            clearInterval(intervalId);
            intervalId = null;
            playPauseBtn.innerText = '播放';
            if (nextStepBtn) nextStepBtn.disabled = true;
          }
        }, 1000); // Adjust the speed as needed (milliseconds)
        playPauseBtn.innerText = '暂停';
      }
    });
  }

  // ----------------------
  // Remove Step Function (for Previous button)
  // ----------------------
  function removeStep(stepIndex) {
    const table = document.getElementById('simulationTable');
    if (!table) {
      console.error('Simulation table not found.');
      return;
    }

    // Remove the last header cell
    const headerRow = document.getElementById('tableHeaderRow');
    if (headerRow && headerRow.lastChild) {
      headerRow.removeChild(headerRow.lastChild);
    } else {
      console.warn('No header cell to remove.');
    }

    // Remove the last cell from each frame row
    const frameRows = table.querySelectorAll('.frame-row');
    frameRows.forEach((row) => {
      if (row.lastChild) {
        // Remove tooltip-related data attributes and classes
        const cell = row.lastChild;
        cell.classList.remove('bg-red-200', 'bg-green-200', 'has-tooltip');
        cell.removeAttribute('data-tippy-content');
        row.removeChild(cell);
      } else {
        console.warn(`No cell to remove from frame row ${row.dataset.frameIndex}.`);
      }
    });

    // Update narration
    const narrationText = document.getElementById('narrationText');
    if (stepIndex > 0) {
      const step = simulationHistory[stepIndex - 1];
      if (narrationText) {
        if (step.fault) {
          narrationText.innerText = `在时间 T${step.step}, 页面 ${step.page} 导致了一次缺页中断并被加载到帧 ${step.frameUpdated + 1}.`;
        } else if (step.hitFrames.length > 0) {
          narrationText.innerText = `在时间 T${step.step}, 页面 ${step.page} 已经在内存中 (命中).`;
        } else {
          narrationText.innerText = `在时间 T${step.step}, 页面 ${step.page} 已经在内存中，没有缺页中断发生`;
        }
      }
    } else {
      if (narrationText) {
        narrationText.innerText = '等待模拟';
      }
    }
  }

});