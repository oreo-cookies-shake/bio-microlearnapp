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
            answer:
              "It is hydrolysed to ADP and inorganic phosphate (Pi)."
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
          {
            id: "S1",
            text: "Respiration releases energy by the breakdown of organic molecules."
          }
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
  currentLevelId: null, // "as" | "a2"
  currentChapterId: null,
  currentMode: "story", // "story" | "questions" | "difficult"
  chapters: {} // per-chapter progress
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
      storyIndex: 0, // how many story points have been shown
      questionIndex: 0, // current question index (0-based)
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
const questionAreaEl = qs("#questionArea");

const difficultEmptyEl = qs("#difficultEmpty");
const difficultListEl = qs("#difficultList");

const themeToggleBtn = qs("#themeToggle");
const toastEl = qs("#toast");

// Floating actions (Story + Questions)
const actionDock = qs("#actionDock");
const actionLeftBtn = qs("#actionLeft");
const actionRightBtn = qs("#actionRight");

// Difficult: revision session controls
const difficultListViewEl = qs("#difficultListView");
const difficultSessionViewEl = qs("#difficultSessionView");
const difficultSessionFeedEl = qs("#difficultSessionFeed");
const difficultSessionQAEl = qs("#difficultSessionQA");
const difficultSessionDoneEl = qs("#difficultSessionDone");
const difficultReviseStoryBtn = qs("#difficultReviseStory");
const difficultReviseQuestionsBtn = qs("#difficultReviseQuestions");
const difficultCountSegEl = qs("#difficultCountSeg");

// Question mode UI state (not persisted)
let questionRevealed = false;
let currentAnswerEl = null;

// Difficult session (ephemeral)
let difficultSessionCount = "all"; // "all" | "10" | "20" | "30"
let difficultSession = {
  active: false,
  type: null, // "story" | "questions"
  ids: [],
  storyShown: 0,
  qIndex: 0,
  revealed: false
};

// ---------- Toast ----------

let toastTimeout = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("toast--show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("toast--show");
    toastEl.classList.add("hidden");
    toastTimeout = null;
  }, 1600);
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
  appState.theme = appState.theme === "light" ? "dark" : "light";
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
  // Leaving chapter screen should end any in-progress difficult session
  if (!screenChapter.classList.contains("hidden") && difficultSession.active) {
    difficultSession = { active: false, type: null, ids: [], storyShown: 0, qIndex: 0, revealed: false };
  }
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
    const totalItems = (chapter.storyPoints?.length || 0) + (chapter.questions?.length || 0);
    const doneItems = chState.storyIndex + chState.questionIndex;
    const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

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
      // entering a chapter resets any ephemeral difficult session
      if (difficultSession.active) {
        difficultSession = { active: false, type: null, ids: [], storyShown: 0, qIndex: 0, revealed: false };
      }
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

  // reset per-mode UI state
  if (mode !== "questions") {
    questionRevealed = false;
    currentAnswerEl = null;
  }

  // leaving Difficult should end any revision session
  if (mode !== "difficult" && difficultSession.active) {
    difficultSession = { active: false, type: null, ids: [], storyShown: 0, qIndex: 0, revealed: false };
  }

  renderCurrentMode();
}

modeTabs.addEventListener("click", (e) => {
  const tab = e.target.closest(".mode-tab");
  if (!tab || tab.classList.contains("active")) return;

  const mode = tab.getAttribute("data-mode");

  // Leaving a difficult revision session by switching tabs
  if (appState.currentMode === "difficult" && difficultSession.active && mode !== "difficult") {
    endDifficultSession();
  }

  setActiveMode(mode);
});

// Difficult: revision session controls
if (difficultCountSegEl) {
  difficultCountSegEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    difficultSessionCount = btn.getAttribute("data-count") || "all";
    [...difficultCountSegEl.querySelectorAll(".seg-btn")].forEach((b) => b.classList.toggle("is-active", b === btn));
  });
}

if (difficultReviseStoryBtn) {
  difficultReviseStoryBtn.addEventListener("click", () => {
    const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
    if (!chapter) return;
    const chState = ensureChapterState(chapter.id);
    startDifficultSession("story", chapter, chState);
  });
}

if (difficultReviseQuestionsBtn) {
  difficultReviseQuestionsBtn.addEventListener("click", () => {
    const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
    if (!chapter) return;
    const chState = ensureChapterState(chapter.id);
    startDifficultSession("questions", chapter, chState);
  });
}

function renderCurrentMode() {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const chState = ensureChapterState(chapter.id);

  if (appState.currentMode === "story") {
    const total = chapter.storyPoints.length;

    // Auto-show the first point so you land on 1/total
    if (chState.storyIndex === 0 && total > 0) {
      chState.storyIndex = 1;
      saveState();
    }

    const shown = Math.min(chState.storyIndex, total);
    updateProgress(shown, total);
    renderStoryMode(chapter, chState);
  } else if (appState.currentMode === "questions") {
    const total = chapter.questions.length;
    const current = total === 0 ? 0 : Math.min(chState.questionIndex + 1, total);
    updateProgress(current, total);
    renderQuestionMode(chapter, chState);
  } else if (appState.currentMode === "difficult") {
    if (difficultSession.active) {
      const total = difficultSession.ids.length;
      if (difficultSession.type === "story") {
        const shown = Math.min(difficultSession.storyShown, total);
        updateProgress(shown, total || 1);
      } else if (difficultSession.type === "questions") {
        const current = total === 0 ? 0 : Math.min(difficultSession.qIndex + 1, total);
        updateProgress(current, total || 1);
      } else {
        updateProgress(0, total || 1);
      }
    } else {
      const totalHard = chState.difficultStoryIds.length + chState.difficultQuestionIds.length;
      updateProgress(totalHard, totalHard || 1, `${totalHard} saved`);
    }

    renderDifficultMode(chapter, chState);
  }

  syncActionDock(chapter, chState);
}

function updateProgress(current, total, overrideLabel) {
  if (overrideLabel) {
    progressLabel.textContent = overrideLabel;
  } else {
    progressLabel.textContent = `${current} / ${total}`;
  }
  const pct = total > 0 ? (current / total) * 100 : 0;
  progressFill.style.width = `${pct}%`;
}

// ---------- Floating action dock ----------

function setRightButton({ label, shape = "circle", disabled = false }) {
  actionRightBtn.textContent = label;
  actionRightBtn.disabled = disabled;

  actionRightBtn.classList.toggle("fab--circle", shape === "circle");
  actionRightBtn.classList.toggle("fab--pill", shape === "pill");

  actionRightBtn.setAttribute("aria-label", label);
  actionRightBtn.setAttribute("title", label);
}

function syncActionDock(chapter, chState) {
  const mode = appState.currentMode;

  if (!chapter) {
    actionDock.classList.add("hidden");
    return;
  }

  // Difficult sessions reuse the dock for navigation + drilling
  if (mode === "difficult") {
    if (!difficultSession.active) {
      actionDock.classList.add("hidden");
      return;
    }

    actionDock.classList.remove("hidden");

    // Left: back to list
    actionLeftBtn.textContent = "←";
    actionLeftBtn.disabled = false;
    actionLeftBtn.setAttribute("aria-label", "Back to list");
    actionLeftBtn.setAttribute("title", "Back to list");

    if (difficultSession.type === "story") {
      const total = difficultSession.ids.length;
      const shown = Math.min(difficultSession.storyShown, total);
      const done = total === 0 || shown >= total;
      setRightButton({ label: "OK", shape: "circle", disabled: done });
      return;
    }

    if (difficultSession.type === "questions") {
      const total = difficultSession.ids.length;
      const finished = total === 0 || difficultSession.qIndex >= total;
      if (finished) {
        setRightButton({ label: "Done", shape: "pill", disabled: true });
      } else {
        setRightButton({
          label: difficultSession.revealed ? "Next" : "Reveal",
          shape: "pill",
          disabled: false,
        });
      }
      return;
    }

    setRightButton({ label: "OK", shape: "circle", disabled: true });
    return;
  }

  // Story + Questions: normal controls
  actionDock.classList.remove("hidden");

  actionLeftBtn.textContent = "📘";
  actionLeftBtn.disabled = false;
  actionLeftBtn.setAttribute("aria-label", "Save to Difficult");
  actionLeftBtn.setAttribute("title", "Save to Difficult");

  if (mode === "story") {
    const atEnd = chState.storyIndex >= chapter.storyPoints.length;
    setRightButton({ label: "OK", shape: "circle", disabled: atEnd });
    return;
  }

  if (mode === "questions") {
    const atEnd = chState.questionIndex >= chapter.questions.length;
    if (atEnd) {
      actionDock.classList.add("hidden");
      return;
    }

    setRightButton({
      label: questionRevealed ? "Next" : "Reveal",
      shape: "pill",
      disabled: false,
    });
    return;
  }
}

actionLeftBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);

  // In Difficult session: left button exits back to the list
  if (appState.currentMode === "difficult" && difficultSession.active) {
    endDifficultSession();
    return;
  }

  if (appState.currentMode === "story") {
    markCurrentStoryDifficult(chapter, chState);
  } else if (appState.currentMode === "questions") {
    markCurrentQuestionDifficult(chapter, chState);
  }
});

actionRightBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);

  if (appState.currentMode === "difficult" && difficultSession.active) {
    if (difficultSession.type === "story") {
      advanceDifficultStorySession(chapter, chState);
    } else if (difficultSession.type === "questions") {
      handleDifficultQuestionPrimary(chapter, chState);
    }
    return;
  }

  if (appState.currentMode === "story") {
    advanceStory(chapter, chState);
  } else if (appState.currentMode === "questions") {
    handleQuestionPrimary(chapter, chState);
  }
});

// ---------- Story mode ----------

function renderStoryMode(chapter, chState) {
  storyFeedEl.innerHTML = "";

  const total = chapter.storyPoints.length;

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

  // Scroll to the latest bubble
  const last = storyFeedEl.lastElementChild;
  if (last) last.scrollIntoView({ block: "end", behavior: "smooth" });
}

function advanceStory(chapter, chState) {
  const total = chapter.storyPoints.length;
  if (total === 0) return;

  if (chState.storyIndex < total) {
    chState.storyIndex += 1;
    saveState();
    renderCurrentMode();
  } else {
    showToast("End of story");
  }
}

function markCurrentStoryDifficult(chapter, chState) {
  const idx = Math.max(chState.storyIndex - 1, 0);
  const point = chapter.storyPoints[idx];
  if (!point) return;

  if (!chState.difficultStoryIds.includes(point.id)) {
    chState.difficultStoryIds.push(point.id);
    saveState();
    showToast("Saved to Difficult");
  } else {
    showToast("Already saved");
  }
}

// ---------- Question mode ----------

function renderQuestionMode(chapter, chState) {
  questionAreaEl.innerHTML = "";
  currentAnswerEl = null;
  questionRevealed = false;

  const total = chapter.questions.length;
  if (total === 0) {
    questionAreaEl.innerHTML =
      '<div class="empty-state">No questions yet for this chapter.</div>';
    return;
  }

  // Finished all questions
  if (chState.questionIndex >= total) {
    questionAreaEl.innerHTML =
      '<div class="empty-state">You\'re done! Switch to <b>Difficult</b> to revise the items you saved.</div>';
    return;
  }

  const idx = Math.min(chState.questionIndex, total - 1);
  const q = chapter.questions[idx];

  const cardQ = document.createElement("div");
  cardQ.className = "qa-card";
  cardQ.innerHTML = `
    <div class="qa-meta">Q${idx + 1} · Question</div>
    <div class="qa-text">${q.question}</div>
  `;

  const answerCard = document.createElement("div");
  answerCard.className = "qa-card qa-answer hidden";
  answerCard.innerHTML = `
    <div class="qa-meta">Answer</div>
    <div class="qa-text">${q.answer}</div>
  `;

  currentAnswerEl = answerCard;

  questionAreaEl.appendChild(cardQ);
  questionAreaEl.appendChild(answerCard);
}

function handleQuestionPrimary(chapter, chState) {
  const total = chapter.questions.length;
  if (total === 0 || chState.questionIndex >= total) return;

  if (!questionRevealed) {
    questionRevealed = true;
    if (currentAnswerEl) currentAnswerEl.classList.remove("hidden");
    syncActionDock(chapter, chState);
    return;
  }

  // revealed -> Next
  advanceQuestion(chapter, chState);
}

function advanceQuestion(chapter, chState) {
  const total = chapter.questions.length;
  if (chState.questionIndex < total) {
    chState.questionIndex += 1;
  }
  saveState();
  renderCurrentMode();
}

function markCurrentQuestionDifficult(chapter, chState) {
  const total = chapter.questions.length;
  if (total === 0 || chState.questionIndex >= total) return;

  const idx = Math.min(chState.questionIndex, total - 1);
  const q = chapter.questions[idx];

  if (!chState.difficultQuestionIds.includes(q.id)) {
    chState.difficultQuestionIds.push(q.id);
    saveState();
    showToast("Saved to Difficult");
  } else {
    showToast("Already saved");
  }
}

// ---------- Difficult mode ----------

function getDifficultIdsForSession(sourceIds) {
  if (difficultSessionCount === "all") return [...sourceIds];
  const n = parseInt(difficultSessionCount, 10);
  if (!Number.isFinite(n) || n <= 0) return [...sourceIds];
  // Use the most recently saved N, keeping their saved order
  return sourceIds.slice(-n);
}

function startDifficultSession(type, chapter, chState) {
  const sourceIds = type === "story" ? chState.difficultStoryIds : chState.difficultQuestionIds;

  if (!sourceIds || sourceIds.length === 0) {
    showToast(type === "story" ? "No saved story points yet" : "No saved questions yet");
    return;
  }

  difficultSession.active = true;
  difficultSession.type = type;
  difficultSession.ids = getDifficultIdsForSession(sourceIds);
  difficultSession.storyShown = type === "story" ? Math.min(1, difficultSession.ids.length) : 0;
  difficultSession.qIndex = 0;
  difficultSession.revealed = false;

  renderCurrentMode();
}

function endDifficultSession() {
  difficultSession.active = false;
  difficultSession.type = null;
  difficultSession.ids = [];
  difficultSession.storyShown = 0;
  difficultSession.qIndex = 0;
  difficultSession.revealed = false;

  renderCurrentMode();
}

function renderDifficultMode(chapter, chState) {
  if (difficultSession.active) {
    renderDifficultSession(chapter, chState);
  } else {
    renderDifficultListView(chapter, chState);
  }
}

function renderDifficultListView(chapter, chState) {
  // Toggle views
  if (difficultListViewEl) difficultListViewEl.classList.remove("hidden");
  if (difficultSessionViewEl) difficultSessionViewEl.classList.add("hidden");

  // Enable/disable revise buttons
  if (difficultReviseStoryBtn) {
    difficultReviseStoryBtn.disabled = chState.difficultStoryIds.length === 0;
  }
  if (difficultReviseQuestionsBtn) {
    difficultReviseQuestionsBtn.disabled = chState.difficultQuestionIds.length === 0;
  }

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
        text: p.text,
      });
    }
  });

  chState.difficultQuestionIds.forEach((id) => {
    const q = qMap.get(id);
    if (q) {
      items.push({
        type: "Question",
        id,
        text: q.question,
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
        <span class="difficult-tag">${item.type}</span>
        <button class="icon-button remove-btn" aria-label="Remove">×</button>
      </div>
      <div class="difficult-text">${item.text}</div>
    `;

    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.type === "Story") {
        chState.difficultStoryIds = chState.difficultStoryIds.filter((x) => x !== item.id);
      } else {
        chState.difficultQuestionIds = chState.difficultQuestionIds.filter((x) => x !== item.id);
      }
      saveState();
      renderCurrentMode();
    });

    difficultListEl.appendChild(li);
  });
}

function renderDifficultSession(chapter, chState) {
  // Toggle views
  if (difficultListViewEl) difficultListViewEl.classList.add("hidden");
  if (difficultSessionViewEl) difficultSessionViewEl.classList.remove("hidden");

  if (difficultSessionFeedEl) difficultSessionFeedEl.classList.add("hidden");
  if (difficultSessionQAEl) difficultSessionQAEl.classList.add("hidden");
  if (difficultSessionDoneEl) difficultSessionDoneEl.classList.add("hidden");

  const total = difficultSession.ids.length;

  if (difficultSession.type === "story") {
    if (!difficultSessionFeedEl) return;

    difficultSessionFeedEl.classList.remove("hidden");
    difficultSessionFeedEl.innerHTML = "";

    const storyMap = new Map(chapter.storyPoints.map((p) => [p.id, p]));
    const shown = Math.min(difficultSession.storyShown, total);

    for (let i = 0; i < shown; i++) {
      const id = difficultSession.ids[i];
      const point = storyMap.get(id);
      if (!point) continue;

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = `
        <div class="bubble-meta">Difficult · Story</div>
        <p class="bubble-text">${point.text}</p>
      `;
      difficultSessionFeedEl.appendChild(bubble);
    }

    const last = difficultSessionFeedEl.lastElementChild;
    if (last) last.scrollIntoView({ block: "end", behavior: "smooth" });

    if (shown >= total) {
      if (difficultSessionDoneEl) {
        difficultSessionDoneEl.classList.remove("hidden");
        difficultSessionDoneEl.innerHTML = `
          <p class="empty-title">Session complete</p>
          <p class="empty-sub">Tap ← to return to your Difficult list.</p>
        `;
      }
    }

    return;
  }

  if (difficultSession.type === "questions") {
    if (!difficultSessionQAEl) return;

    difficultSessionQAEl.classList.remove("hidden");
    difficultSessionQAEl.innerHTML = "";

    if (total === 0 || difficultSession.qIndex >= total) {
      if (difficultSessionDoneEl) {
        difficultSessionDoneEl.classList.remove("hidden");
        difficultSessionDoneEl.innerHTML = `
          <p class="empty-title">Session complete</p>
          <p class="empty-sub">Tap ← to return to your Difficult list.</p>
        `;
      }
      return;
    }

    const qMap = new Map(chapter.questions.map((q) => [q.id, q]));
    const id = difficultSession.ids[difficultSession.qIndex];
    const q = qMap.get(id);
    if (!q) {
      // If content changed and this question no longer exists, skip it.
      difficultSession.qIndex += 1;
      difficultSession.revealed = false;
      renderCurrentMode();
      return;
    }

    const cardQ = document.createElement("div");
    cardQ.className = "qa-card";
    cardQ.innerHTML = `
      <div class="qa-meta">Difficult · Q${difficultSession.qIndex + 1}</div>
      <p class="qa-question">${q.question}</p>
    `;

    const answerCard = document.createElement("div");
    answerCard.className = "qa-answer";
    answerCard.textContent = q.answer;
    if (!difficultSession.revealed) answerCard.classList.add("hidden");

    difficultSessionQAEl.appendChild(cardQ);
    difficultSessionQAEl.appendChild(answerCard);

    return;
  }
}

function advanceDifficultStorySession(chapter, chState) {
  const total = difficultSession.ids.length;
  if (total === 0) return;

  if (difficultSession.storyShown < total) {
    difficultSession.storyShown += 1;
    renderCurrentMode();
  }
}

function handleDifficultQuestionPrimary(chapter, chState) {
  const total = difficultSession.ids.length;
  if (total === 0 || difficultSession.qIndex >= total) return;

  if (!difficultSession.revealed) {
    difficultSession.revealed = true;
    renderCurrentMode();
    return;
  }

  // revealed -> Next
  difficultSession.qIndex += 1;
  difficultSession.revealed = false;
  renderCurrentMode();
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
