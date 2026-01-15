// ------- Sample data (you'll replace this later) -------

const DATA = {
  as: {
    id: "as",
    label: "AS Level",
    chapters: [
      {
        id: "as-12-1",
        title: "12.1 Energy",
        meta: "Sample · replace with real",
        storyPoints: [
          {
            id: "S1",
            text: "ATP is the immediate energy source for cell processes."
          },
          {
            id: "S2",
            text: "ATP releases small, manageable amounts of energy when hydrolysed."
          },
          {
            id: "S3",
            text: "ATP is not used for long-term energy storage in cells."
          }
        ],
        questions: [
          {
            id: "Q1",
            question: "Name the immediate energy source in cells.",
            answer: "ATP"
          },
          {
            id: "Q2",
            question: "Where in the cell does glycolysis occur?",
            answer: "In the cytoplasm."
          },
          {
            id: "Q3",
            question: "What happens to ATP when it releases energy?",
            answer: "It is hydrolysed to ADP and inorganic phosphate (Pi)."
          }
        ]
      }
    ]
  },
  a2: {
    id: "a2",
    label: "A2 Level",
    chapters: [
      {
        id: "a2-18-1",
        title: "18.1 Respiration overview",
        meta: "Sample A2 chapter",
        storyPoints: [
          { id: "S1", text: "Respiration releases energy by the breakdown of organic molecules." }
        ],
        questions: [
          {
            id: "Q1",
            question: "Which molecule links glycolysis to the Krebs cycle?",
            answer: "Acetyl CoA."
          }
        ]
      }
    ]
  }
};

// ---------- State & persistence ----------

const STORAGE_KEY = "microlearn-bio-state-v1";

let appState = {
  theme: "dark",
  currentLevelId: null,  // "as" | "a2"
  currentChapterId: null,
  currentMode: "story",  // "story" | "questions" | "difficult"
  chapters: {}           // per-chapter progress
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = { ...appState, ...parsed };
    }
  } catch (e) {
    console.warn("Could not load state", e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn("Could not save state", e);
  }
}

function getChapter(levelId, chapterId) {
  const level = DATA[levelId];
  return level.chapters.find((c) => c.id === chapterId);
}

function ensureChapterState(chapterId) {
  if (!appState.chapters[chapterId]) {
    appState.chapters[chapterId] = {
      storyIndex: 0,          // how many story points have been shown
      questionIndex: 0,       // current question index
      difficultStoryIds: [],
      difficultQuestionIds: []
    };
  }
  return appState.chapters[chapterId];
}

// ---------- DOM helpers ----------

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

const screenLevels = qs("#screenLevels");
const screenChapters = qs("#screenChapters");
const screenChapter = qs("#screenChapter");
const chaptersListEl = qs("#chaptersList");

const headerTitleEl = qs("#headerTitle");
const headerSubtitleEl = qs("#headerSubtitle");
const backButton = qs("#backButton");

const modeTabs = qs("#modeTabs");
const progressLabel = qs("#progressLabel");
const progressFill = qs("#progressFill");

const storyModePanel = qs("#storyMode");
const questionsModePanel = qs("#questionsMode");
const difficultModePanel = qs("#difficultMode");

const storyFeedEl = qs("#storyFeed");
const storyNextBtn = qs("#storyNext");
const storyMarkBtn = qs("#storyMarkDifficult");

const questionAreaEl = qs("#questionArea");

const difficultEmptyEl = qs("#difficultEmpty");
const difficultListEl = qs("#difficultList");

const themeToggleBtn = qs("#themeToggle");
const toastEl = qs("#toast");

// ---------- Toast ----------

let toastTimeout = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("show");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
    toastTimeout = null;
  }, 1700);
}

// ---------- Theme ----------

function applyTheme() {
  if (appState.theme === "light") {
    document.body.classList.add("light");
    themeToggleBtn.textContent = "☼";
  } else {
    document.body.classList.remove("light");
    themeToggleBtn.textContent = "☾";
  }
}

themeToggleBtn.addEventListener("click", () => {
  appState.theme = appState.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
});

// ---------- Screen navigation ----------

function showScreen(name) {
  screenLevels.classList.add("hidden");
  screenChapters.classList.add("hidden");
  screenChapter.classList.add("hidden");

  if (name === "levels") {
    screenLevels.classList.remove("hidden");
    backButton.classList.add("hidden");
    headerSubtitleEl.textContent = "";
    headerTitleEl.textContent = "Home";
  } else if (name === "chapters") {
    screenChapters.classList.remove("hidden");
    backButton.classList.remove("hidden");
    headerTitleEl.textContent = DATA[appState.currentLevelId].label;
    headerSubtitleEl.textContent = "Choose a chapter";
  } else if (name === "chapter") {
    screenChapter.classList.remove("hidden");
    backButton.classList.remove("hidden");
    const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
    headerTitleEl.textContent = chapter.title;
    headerSubtitleEl.textContent = DATA[appState.currentLevelId].label;
  }
}

backButton.addEventListener("click", () => {
  if (screenChapter.classList.contains("hidden")) {
    // from chapters -> levels
    showScreen("levels");
  } else {
    // from chapter -> chapters
    showScreen("chapters");
  }
});

// ---------- Level selection ----------

function initLevelButtons() {
  qsa(".card-select").forEach((btn) => {
    btn.addEventListener("click", () => {
      const levelId = btn.dataset.level;
      appState.currentLevelId = levelId;
      saveState();
      renderChapters();
      showScreen("chapters");
    });
  });
}

function renderChapters() {
  const level = DATA[appState.currentLevelId];
  chaptersListEl.innerHTML = "";
  level.chapters.forEach((chapter) => {
    const chState = ensureChapterState(chapter.id);
    const totalItems =
      (chapter.storyPoints?.length || 0) + (chapter.questions?.length || 0);
    const doneItems = chState.storyIndex + chState.questionIndex;
    const pct =
      totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    const card = document.createElement("button");
    card.className = "card card-chapter";
    card.dataset.chapterId = chapter.id;

    card.innerHTML = `
      <div class="card-chapter-header">
        <div class="card-chapter-title">${chapter.title}</div>
        <div class="progress-circle">${pct}%</div>
      </div>
      <div class="chapter-meta">
        <span>${chapter.storyPoints.length} story points</span>
        <span>${chapter.questions.length} questions</span>
      </div>
    `;

    card.addEventListener("click", () => {
      appState.currentChapterId = chapter.id;
      appState.currentMode = appState.currentMode || "story";
      saveState();
      setActiveMode(appState.currentMode);
      showScreen("chapter");
      renderCurrentMode();
    });

    chaptersListEl.appendChild(card);
  });
}

// ---------- Mode switching ----------

function setActiveMode(mode) {
  appState.currentMode = mode;
  qsa(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

  storyModePanel.classList.add("hidden");
  questionsModePanel.classList.add("hidden");
  difficultModePanel.classList.add("hidden");

  if (mode === "story") storyModePanel.classList.remove("hidden");
  if (mode === "questions") questionsModePanel.classList.remove("hidden");
  if (mode === "difficult") difficultModePanel.classList.remove("hidden");

  renderCurrentMode();
}

modeTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  const mode = btn.dataset.mode;
  setActiveMode(mode);
  saveState();
});

function renderCurrentMode() {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const chState = ensureChapterState(chapter.id);

  if (appState.currentMode === "story") {
    const total = chapter.storyPoints.length;
    const shown = Math.min(chState.storyIndex, total);
    updateProgress(shown, total);
    renderStoryMode(chapter, chState);
  } else if (appState.currentMode === "questions") {
    const total = chapter.questions.length;
    const idx = Math.min(chState.questionIndex, total);
    updateProgress(idx, total);
    renderQuestionMode(chapter, chState);
  } else if (appState.currentMode === "difficult") {
    const totalHard =
      chState.difficultStoryIds.length + chState.difficultQuestionIds.length;
    updateProgress(totalHard, totalHard || 1);
    renderDifficultMode(chapter, chState);
  }
}

function updateProgress(current, total) {
  progressLabel.textContent = `${current} / ${total}`;
  const pct = total > 0 ? (current / total) * 100 : 0;
  progressFill.style.width = `${pct}%`;
}

// ---------- Story mode ----------

function renderStoryMode(chapter, chState) {
  storyFeedEl.innerHTML = "";

  const total = chapter.storyPoints.length;
  if (chState.storyIndex === 0 && total > 0) {
    chState.storyIndex = 1; // show first point automatically
    saveState();
  }

  const countToShow = Math.min(chState.storyIndex, total);
  for (let i = 0; i < countToShow; i++) {
    const point = chapter.storyPoints[i];
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = `
      <div class="bubble-meta">Point ${i + 1} · Story</div>
      <p class="bubble-text">${point.text}</p>
    `;
    storyFeedEl.appendChild(bubble);
  }

  storyFeedEl.scrollTop = storyFeedEl.scrollHeight;

  // disable Next if finished
  storyNextBtn.disabled = chState.storyIndex >= total;
}

storyNextBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const chState = ensureChapterState(chapter.id);
  if (chState.storyIndex < chapter.storyPoints.length) {
    chState.storyIndex += 1;
    saveState();
    updateProgress(chState.storyIndex, chapter.storyPoints.length);
    renderStoryMode(chapter, chState);
  }
});

storyMarkBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const chState = ensureChapterState(chapter.id);
  const idx = Math.max(chState.storyIndex - 1, 0);
  const point = chapter.storyPoints[idx];
  if (!point) return;

  if (!chState.difficultStoryIds.includes(point.id)) {
    chState.difficultStoryIds.push(point.id);
    saveState();
    showToast("Saved to Difficult");
  } else {
    showToast("Already in Difficult");
  }
});

// ---------- Question mode ----------

function renderQuestionMode(chapter, chState) {
  questionAreaEl.innerHTML = "";

  const total = chapter.questions.length;
  if (total === 0) {
    questionAreaEl.innerHTML =
      '<div class="empty-state">No questions yet for this chapter.</div>';
    return;
  }

  const idx = Math.min(chState.questionIndex, total - 1);
  const q = chapter.questions[idx];

  const cardQ = document.createElement("div");
  cardQ.className = "qa-card";
  cardQ.innerHTML = `
    <div class="qa-meta">Q${idx + 1} · Question</div>
    <div class="qa-question">${q.question}</div>
  `;

  const showAnsBtn = document.createElement("button");
  showAnsBtn.className = "btn btn-primary";
  showAnsBtn.textContent = "Show answer";

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "qa-actions hidden";

  const rightBtn = document.createElement("button");
  rightBtn.className = "btn btn-ghost";
  rightBtn.textContent = "I was right";

  const hardBtn = document.createElement("button");
  hardBtn.className = "btn btn-primary";
  hardBtn.textContent = "Still confusing";

  actionsDiv.appendChild(rightBtn);
  actionsDiv.appendChild(hardBtn);

  const answerCard = document.createElement("div");
  answerCard.className = "qa-card hidden";
  answerCard.innerHTML = `
    <div class="qa-answer-title">Answer</div>
    <div class="qa-answer-text">${q.answer}</div>
  `;

  showAnsBtn.addEventListener("click", () => {
    showAnsBtn.classList.add("hidden");
    answerCard.classList.remove("hidden");
    actionsDiv.classList.remove("hidden");
  });

  rightBtn.addEventListener("click", () => {
    advanceQuestion(chapter, chState, false);
  });

  hardBtn.addEventListener("click", () => {
    advanceQuestion(chapter, chState, true);
  });

  questionAreaEl.appendChild(cardQ);
  questionAreaEl.appendChild(showAnsBtn);
  questionAreaEl.appendChild(answerCard);
  questionAreaEl.appendChild(actionsDiv);
}

function advanceQuestion(chapter, chState, markDifficult) {
  const total = chapter.questions.length;
  const idx = Math.min(chState.questionIndex, total - 1);
  const q = chapter.questions[idx];

  if (markDifficult && !chState.difficultQuestionIds.includes(q.id)) {
    chState.difficultQuestionIds.push(q.id);
    showToast("Saved to Difficult");
  }

  if (chState.questionIndex < total) {
    chState.questionIndex += 1;
  }

  saveState();
  updateProgress(chState.questionIndex, total);
  renderQuestionMode(chapter, chState);
}

// ---------- Difficult mode ----------

function renderDifficultMode(chapter, chState) {
  difficultListEl.innerHTML = "";

  const storyMap = new Map(chapter.storyPoints.map((p) => [p.id, p]));
  const qMap = new Map(chapter.questions.map((q) => [q.id, q]));

  const items = [];

  chState.difficultStoryIds.forEach((id) => {
    const p = storyMap.get(id);
    if (p) {
      items.push({
        type: "Story",
        id,
        text: p.text
      });
    }
  });

  chState.difficultQuestionIds.forEach((id) => {
    const q = qMap.get(id);
    if (q) {
      items.push({
        type: "Question",
        id,
        text: q.question
      });
    }
  });

  if (items.length === 0) {
    difficultEmptyEl.classList.remove("hidden");
    return;
  }

  difficultEmptyEl.classList.add("hidden");

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "difficult-item";
    li.innerHTML = `
      <div class="difficult-meta">
        <span>${item.type}</span>
        <button class="icon-button remove-btn" aria-label="Remove">×</button>
      </div>
      <div>${item.text}</div>
    `;

    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.type === "Story") {
        chState.difficultStoryIds = chState.difficultStoryIds.filter(
          (x) => x !== item.id
        );
      } else {
        chState.difficultQuestionIds = chState.difficultQuestionIds.filter(
          (x) => x !== item.id
        );
      }
      saveState();
      renderDifficultMode(chapter, chState);
    });

    difficultListEl.appendChild(li);
  });
}

// ---------- PWA service worker ----------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW registration failed", err));
  });
}

// ---------- Init ----------

function init() {
  loadState();
  applyTheme();
  initLevelButtons();
  showScreen("levels");
}

init();
