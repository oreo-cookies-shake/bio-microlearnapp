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
      difficultQuestionIds: [],

      // Difficult-mode revision state (Option A)
      difficultTab: "story",           // "story" | "questions"
      difficultStoryReviewIndex: 0,     // how many difficult story points shown in review
      difficultQuestionReviewIndex: 0,  // current difficult question index in review
      difficultQuestionRevealed: false  // answer reveal state for difficult questions review
    };
  }

  // Backward-compatible defaults for older saved states
  const s = appState.chapters[chapterId];
  if (!s.difficultStoryIds) s.difficultStoryIds = [];
  if (!s.difficultQuestionIds) s.difficultQuestionIds = [];
  if (!s.difficultTab) s.difficultTab = "story";
  if (typeof s.difficultStoryReviewIndex !== "number") s.difficultStoryReviewIndex = 0;
  if (typeof s.difficultQuestionReviewIndex !== "number") s.difficultQuestionReviewIndex = 0;
  if (typeof s.difficultQuestionRevealed !== "boolean") s.difficultQuestionRevealed = false;

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

// Difficult review UI (created dynamically)
let difficultSubtabsEl = null;
let difficultReviewEl = null;

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
    const prog = renderDifficultMode(chapter, chState);
    updateProgress(prog.current, prog.total || 1);
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

function ensureDifficultUI() {
  if (!difficultSubtabsEl) {
    difficultSubtabsEl = document.createElement("div");
    difficultSubtabsEl.id = "difficultSubtabs";
    difficultSubtabsEl.className = "difficult-subtabs";
    difficultSubtabsEl.innerHTML = `
      <button class="subtab" data-kind="story" type="button">
        Story <span class="subtab-count" data-count="story">0</span>
      </button>
      <button class="subtab" data-kind="questions" type="button">
        Questions <span class="subtab-count" data-count="questions">0</span>
      </button>
    `;

    difficultSubtabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".subtab");
      if (!btn) return;
      const kind = btn.dataset.kind;
      const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
      const chState = ensureChapterState(chapter.id);
      chState.difficultTab = kind;
      // Reset reveal state when switching
      chState.difficultQuestionRevealed = false;
      saveState();
      renderCurrentMode();
    });

    // Insert before empty/list in the panel
    difficultModePanel.insertBefore(difficultSubtabsEl, difficultModePanel.firstChild);
  }

  if (!difficultReviewEl) {
    difficultReviewEl = document.createElement("div");
    difficultReviewEl.id = "difficultReview";
    difficultReviewEl.className = "difficult-review";
    difficultModePanel.insertBefore(difficultReviewEl, difficultEmptyEl);
  }
}

function removeFromArray(arr, value) {
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
}

function renderDifficultMode(chapter, chState) {
  ensureDifficultUI();

  // Hide the old list view (we keep it around for future “manage list” options)
  difficultListEl.classList.add("hidden");

  const storyTotal = chState.difficultStoryIds.length;
  const questionTotal = chState.difficultQuestionIds.length;

  // Auto-pick a tab that actually has items
  if (chState.difficultTab === "story" && storyTotal === 0 && questionTotal > 0) {
    chState.difficultTab = "questions";
  } else if (chState.difficultTab === "questions" && questionTotal === 0 && storyTotal > 0) {
    chState.difficultTab = "story";
  }

  // Update counts + active state
  difficultSubtabsEl
    .querySelectorAll(".subtab")
    .forEach((b) => b.classList.toggle("is-active", b.dataset.kind === chState.difficultTab));
  difficultSubtabsEl.querySelector('[data-count="story"]').textContent = storyTotal;
  difficultSubtabsEl.querySelector('[data-count="questions"]').textContent = questionTotal;

  // Empty state
  if (storyTotal + questionTotal === 0) {
    difficultEmptyEl.classList.remove("hidden");
    difficultReviewEl.classList.add("hidden");
    difficultEmptyEl.innerHTML = `
      <div class="empty-title">Nothing saved yet</div>
      <div class="empty-sub">In Story or Questions, tap the book icon to save items here.</div>
    `;
    saveState();
    return { current: 0, total: 1 };
  }

  difficultEmptyEl.classList.add("hidden");
  difficultReviewEl.classList.remove("hidden");

  let prog = { current: 0, total: 1 };

  if (chState.difficultTab === "story") {
    prog = renderDifficultStoryReview(chapter, chState);
  } else {
    prog = renderDifficultQuestionReview(chapter, chState);
  }

  saveState();
  return prog;
}

function renderDifficultStoryReview(chapter, chState) {
  const storyMap = new Map(chapter.storyPoints.map((p) => [p.id, p]));
  const saved = chState.difficultStoryIds
    .map((id) => storyMap.get(id))
    .filter(Boolean);

  const total = saved.length;
  difficultReviewEl.innerHTML = "";

  if (total === 0) {
    difficultReviewEl.innerHTML = `
      <div class="empty-state">No saved story points yet. Save some from Story mode first.</div>
    `;
    return { current: 0, total: 1 };
  }

  // Start by showing the first item
  if (chState.difficultStoryReviewIndex === 0) chState.difficultStoryReviewIndex = 1;
  const shown = Math.min(chState.difficultStoryReviewIndex, total);
  const atEnd = shown >= total;

  const feed = document.createElement("div");
  feed.className = "bubble-feed";

  for (let i = 0; i < shown; i++) {
    const p = saved[i];
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = `
      <div class="bubble-meta">Saved · Story</div>
      <div class="bubble-text">${p.text}</div>
    `;
    feed.appendChild(bubble);
  }

  difficultReviewEl.appendChild(feed);

  // Done message
  if (atEnd) {
    const done = document.createElement("div");
    done.className = "qa-done";
    done.innerHTML = `
      <div class="qa-done-meta">Done</div>
      <div class="qa-done-text">You’ve reached the end of your saved story points.</div>
    `;
    difficultReviewEl.appendChild(done);
  }

  // Actions
  const actions = document.createElement("div");
  actions.className = "difficult-actions";

  const masteredBtn = document.createElement("button");
  masteredBtn.className = "btn btn-ghost";
  masteredBtn.type = "button";
  masteredBtn.textContent = "Mastered";
  masteredBtn.disabled = shown === 0 || atEnd;

  const primaryBtn = document.createElement("button");
  primaryBtn.className = "btn btn-primary";
  primaryBtn.type = "button";
  primaryBtn.textContent = atEnd ? "Restart" : "OK";

  masteredBtn.addEventListener("click", () => {
    const current = saved[Math.max(shown - 1, 0)];
    if (!current) return;
    removeFromArray(chState.difficultStoryIds, current.id);
    chState.difficultStoryReviewIndex = Math.max(0, chState.difficultStoryReviewIndex - 1);
    showToast("Removed from Difficult");
    saveState();
    renderCurrentMode();
  });

  primaryBtn.addEventListener("click", () => {
    if (atEnd) {
      chState.difficultStoryReviewIndex = 1;
    } else {
      chState.difficultStoryReviewIndex = Math.min(total, chState.difficultStoryReviewIndex + 1);
    }
    saveState();
    renderCurrentMode();
  });

  actions.appendChild(masteredBtn);
  actions.appendChild(primaryBtn);
  difficultReviewEl.appendChild(actions);

  // Keep latest visible (like Story mode)
  feed.scrollTop = feed.scrollHeight;

  return { current: shown, total: total || 1 };
}

function renderDifficultQuestionReview(chapter, chState) {
  const qMap = new Map(chapter.questions.map((q) => [q.id, q]));
  const saved = chState.difficultQuestionIds
    .map((id) => qMap.get(id))
    .filter(Boolean);

  const total = saved.length;
  difficultReviewEl.innerHTML = "";

  if (total === 0) {
    difficultReviewEl.innerHTML = `
      <div class="empty-state">No saved questions yet. Save some from Questions mode first.</div>
    `;
    return { current: 0, total: 1 };
  }

  const idx = Math.min(chState.difficultQuestionReviewIndex, total);
  const atEnd = idx >= total;

  if (atEnd) {
    const done = document.createElement("div");
    done.className = "qa-done";
    done.innerHTML = `
      <div class="qa-done-meta">Done</div>
      <div class="qa-done-text">You’ve reached the end of your saved questions.</div>
    `;
    difficultReviewEl.appendChild(done);

    const actions = document.createElement("div");
    actions.className = "difficult-actions";
    const restartBtn = document.createElement("button");
    restartBtn.className = "btn btn-primary";
    restartBtn.type = "button";
    restartBtn.textContent = "Restart";
    restartBtn.addEventListener("click", () => {
      chState.difficultQuestionReviewIndex = 0;
      chState.difficultQuestionRevealed = false;
      saveState();
      renderCurrentMode();
    });
    actions.appendChild(restartBtn);
    difficultReviewEl.appendChild(actions);
    return { current: total, total: total || 1 };
  }

  const q = saved[idx];

  const wrapper = document.createElement("div");
  wrapper.className = "qa-wrapper";

  const qCard = document.createElement("div");
  qCard.className = "qa-card";
  qCard.innerHTML = `
    <div class="qa-meta">Q${idx + 1}</div>
    <div class="qa-question">${q.question}</div>
  `;

  const aCard = document.createElement("div");
  aCard.className = "qa-card qa-answer";
  aCard.innerHTML = `
    <div class="qa-meta">Answer</div>
    <div class="qa-answer-text">${q.answer}</div>
  `;

  const actions = document.createElement("div");
  actions.className = "difficult-actions";

  // Always show the question first
  wrapper.appendChild(qCard);

  if (!chState.difficultQuestionRevealed) {
    const showBtn = document.createElement("button");
    showBtn.className = "btn btn-primary";
    showBtn.type = "button";
    showBtn.textContent = "Show answer";
    showBtn.addEventListener("click", () => {
      chState.difficultQuestionRevealed = true;
      saveState();
      renderCurrentMode();
    });
    actions.appendChild(showBtn);
  } else {
    wrapper.appendChild(aCard);

    const gotItBtn = document.createElement("button");
    gotItBtn.className = "btn btn-ghost";
    gotItBtn.type = "button";
    gotItBtn.textContent = "Got it";

    const stillBtn = document.createElement("button");
    stillBtn.className = "btn btn-primary";
    stillBtn.type = "button";
    stillBtn.textContent = "Still hard";

    gotItBtn.addEventListener("click", () => {
      removeFromArray(chState.difficultQuestionIds, q.id);
      chState.difficultQuestionRevealed = false;
      // Keep index pointing at the next item after removal
      chState.difficultQuestionReviewIndex = Math.min(
        chState.difficultQuestionReviewIndex,
        Math.max(0, chState.difficultQuestionIds.length - 1)
      );
      showToast("Removed from Difficult");
      saveState();
      renderCurrentMode();
    });

    stillBtn.addEventListener("click", () => {
      chState.difficultQuestionRevealed = false;
      chState.difficultQuestionReviewIndex = Math.min(total, chState.difficultQuestionReviewIndex + 1);
      saveState();
      renderCurrentMode();
    });

    actions.appendChild(gotItBtn);
    actions.appendChild(stillBtn);
  }

  difficultReviewEl.appendChild(wrapper);
  difficultReviewEl.appendChild(actions);

  return { current: Math.min(idx + 1, total), total: total || 1 };
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
