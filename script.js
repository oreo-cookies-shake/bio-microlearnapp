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

function makeDifficultKey(type, id) {
  return `${type}:${id}`;
}

function normalizeChapterState(st) {
  if (!st || typeof st !== "object") return st;

  if (typeof st.storyIndex !== "number" || st.storyIndex < 0) st.storyIndex = 0;
  if (typeof st.questionIndex !== "number" || st.questionIndex < 0) st.questionIndex = 0;

  if (!Array.isArray(st.difficultStoryIds)) st.difficultStoryIds = [];
  if (!Array.isArray(st.difficultQuestionIds)) st.difficultQuestionIds = [];
  if (!Array.isArray(st.difficultItems)) st.difficultItems = [];

  if (!st.difficultUi || typeof st.difficultUi !== "object") st.difficultUi = {};
  if (!st.difficultUi.view) st.difficultUi.view = "revise"; // "revise" | "list" | "session"

  if (!st.difficultSessions || typeof st.difficultSessions !== "object") st.difficultSessions = {};
  if (!st.difficultSessions.story) st.difficultSessions.story = null;
  if (!st.difficultSessions.question) st.difficultSessions.question = null;

  // Migrate legacy arrays -> unified ordered list
  if (st.difficultItems.length === 0 && (st.difficultStoryIds.length || st.difficultQuestionIds.length)) {
    for (const id of st.difficultStoryIds) {
      st.difficultItems.push({ key: makeDifficultKey("story", id), type: "story", id });
    }
    for (const id of st.difficultQuestionIds) {
      st.difficultItems.push({ key: makeDifficultKey("question", id), type: "question", id });
    }
  }

  // De-dupe + sanitize
  const seen = new Set();
  st.difficultItems = st.difficultItems
    .filter((it) => it && typeof it === "object" && it.type && it.id)
    .map((it) => {
      const type = it.type === "questions" ? "question" : it.type;
      return { ...it, type, key: it.key || makeDifficultKey(type, it.id) };
    })
    .filter((it) => {
      if (seen.has(it.key)) return false;
      seen.add(it.key);
      return true;
    });

  // Keep legacy arrays in sync (some UI uses them)
  st.difficultStoryIds = st.difficultItems.filter((it) => it.type === "story").map((it) => it.id);
  st.difficultQuestionIds = st.difficultItems.filter((it) => it.type === "question").map((it) => it.id);

  return st;
}

function ensureChapterState(chapterId) {
  if (!appState.chapters[chapterId]) {
    appState.chapters[chapterId] = normalizeChapterState({
      storyIndex: 0, // how many story points have been shown
      questionIndex: 0, // current question index (0-based)
      difficultStoryIds: [],
      difficultQuestionIds: [],
      difficultItems: [],
      difficultUi: { view: "revise" },
      difficultSessions: { story: null, question: null }
    });
  } else {
    appState.chapters[chapterId] = normalizeChapterState(appState.chapters[chapterId]);
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
const difficultControlsEl = qs("#difficultControls");
const difficultListViewEl = qs("#difficultListView");
const difficultReviseViewEl = qs("#difficultReviseView");
const difficultSessionViewEl = qs("#difficultSessionView");

const themeToggleBtn = qs("#themeToggle");
const toastEl = qs("#toast");

// Floating actions (Story + Questions)
const actionDock = qs("#actionDock");
const actionLeftBtn = qs("#actionLeft");
const actionRightBtn = qs("#actionRight");

// Question mode UI state (not persisted)
let questionRevealed = false;
let currentAnswerEl = null;

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
    const { current, total } = getDifficultProgress(chapter, chState);
    updateProgress(current, total);
    renderDifficultMode(chapter, chState);
  }

  syncActionDock(chapter, chState);
}

function updateProgress(current, total) {
  progressLabel.textContent = `${current} / ${total}`;
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

  // Show in Story + Questions only
  if (mode === "difficult" || !chapter) {
    actionDock.classList.add("hidden");
    return;
  }
  actionDock.classList.remove("hidden");

  // Left button is always the book
  actionLeftBtn.disabled = false;

  if (mode === "story") {
    const total = chapter.storyPoints.length;
    const done = chState.storyIndex >= total;
    setRightButton({ label: "OK", shape: "circle", disabled: total === 0 || done });
  }

  if (mode === "questions") {
    const total = chapter.questions.length;
    const finished = total === 0 || chState.questionIndex >= total;

    if (finished) {
      actionDock.classList.add("hidden");
      return;
    }

    setRightButton({
      label: questionRevealed ? "Next" : "Reveal",
      shape: "pill",
      disabled: false
    });
  }
}

actionLeftBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);

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
  normalizeChapterState(chState);
  const idx = chState.storyIndex - 1;
  const point = chapter.storyPoints[idx];
  if (!point) {
    showToast("Nothing to save yet");
    return;
  }

  const added = addToDifficult(chState, "story", point.id);
  if (added) {
    showToast("Saved to Difficult");
    saveState();
    // If user is in difficult mode already, refresh
    if (appState.currentMode === "difficult") renderCurrentMode();
  } else {
    showToast("Already in Difficult");
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
  normalizeChapterState(chState);
  const q = chapter.questions[chState.questionIndex];
  if (!q) {
    showToast("No question to save");
    return;
  }

  const added = addToDifficult(chState, "question", q.id);
  if (added) {
    showToast("Saved to Difficult");
    saveState();
    if (appState.currentMode === "difficult") renderCurrentMode();
  } else {
    showToast("Already in Difficult");
  }
}


// ---------- Difficult mode ----------

function addToDifficult(chState, type, id) {
  normalizeChapterState(chState);
  const key = makeDifficultKey(type, id);
  if (chState.difficultItems.some((it) => it.key === key)) return false;

  chState.difficultItems.push({
    key,
    type,
    id,
    addedAt: Date.now()
  });

  // keep legacy arrays in sync
  chState.difficultStoryIds = chState.difficultItems
    .filter((it) => it.type === "story")
    .map((it) => it.id);
  chState.difficultQuestionIds = chState.difficultItems
    .filter((it) => it.type === "question")
    .map((it) => it.id);

  return true;
}

function removeFromDifficult(chState, key) {
  normalizeChapterState(chState);
  chState.difficultItems = chState.difficultItems.filter((it) => it.key !== key);

  // remove from any saved sessions too
  for (const kind of ["story", "question"]) {
    const s = chState.difficultSessions[kind];
    if (!s || !Array.isArray(s.keys)) continue;
    const beforeLen = s.keys.length;
    s.keys = s.keys.filter((k) => k !== key);
    if (s.index >= s.keys.length) s.index = s.keys.length; // allow "done" state
    if (beforeLen !== s.keys.length) {
      s.updatedAt = Date.now();
      if (kind === "question") s.revealed = false;
    }
  }

  // keep legacy arrays in sync
  chState.difficultStoryIds = chState.difficultItems
    .filter((it) => it.type === "story")
    .map((it) => it.id);
  chState.difficultQuestionIds = chState.difficultItems
    .filter((it) => it.type === "question")
    .map((it) => it.id);
}

function clearChapterDifficult(chState) {
  normalizeChapterState(chState);
  chState.difficultItems = [];
  chState.difficultStoryIds = [];
  chState.difficultQuestionIds = [];
  chState.difficultSessions = { story: null, question: null };
  chState.difficultUi = { view: "list", kind: "story" };
}


function resolveDifficultItem(chapter, item) {
  if (!item) return null;
  if (item.type === "story") {
    const p = chapter.storyPoints.find((x) => x.id === item.id);
    if (!p) return null;
    return { key: item.key, type: "story", label: "Story", text: p.text };
  }

  if (item.type === "question") {
    const q = chapter.questions.find((x) => x.id === item.id);
    if (!q) return null;
    return { key: item.key, type: "question", label: "Question", question: q.question, answer: q.answer };
  }

  return null;
}

function getDifficultCounts(chState) {
  normalizeChapterState(chState);
  const story = chState.difficultItems.filter((it) => it.type === "story").length;
  const question = chState.difficultItems.filter((it) => it.type === "question").length;
  return { story, question, total: story + question };
}

function getDifficultProgress(chapter, chState) {
  normalizeChapterState(chState);
  const counts = getDifficultCounts(chState);

  // If in session, show session progress
  if (chState.difficultUi.view === "session" && chState.difficultUi.kind) {
    const kind = chState.difficultUi.kind;
    const s = chState.difficultSessions[kind];
    if (s && Array.isArray(s.keys) && s.keys.length > 0) {
      const total = s.keys.length;
      const current = Math.min(s.index + 1, total);
      return { current, total };
    }
  }

  // Otherwise show count of saved items
  if (counts.total === 0) return { current: 0, total: 1 };
  return { current: counts.total, total: counts.total };
}

function setDifficultView(chState, view, kind = null) {
  normalizeChapterState(chState);
  chState.difficultUi.view = view;
  if (kind) chState.difficultUi.kind = kind;
  saveState();
  renderCurrentMode();
}

function startDifficultSession(chapter, chState, kind, size) {
  normalizeChapterState(chState);

  const keys = chState.difficultItems
    .filter((it) => it.type === kind)
    .map((it) => it.key);

  let sessionKeys = keys;
  if (size !== "all") {
    const n = Math.max(1, Number(size) || 1);
    sessionKeys = keys.slice(0, n);
  }

  chState.difficultSessions[kind] = {
    keys: sessionKeys,
    index: 0,
    size,
    revealed: false,
    updatedAt: Date.now()
  };

  chState.difficultUi.view = "session";
  chState.difficultUi.kind = kind;
  saveState();
  renderCurrentMode();
}

function continueDifficultSession(chState, kind) {
  normalizeChapterState(chState);
  chState.difficultUi.view = "session";
  chState.difficultUi.kind = kind;
  saveState();
  renderCurrentMode();
}

function clearDifficultSession(chState, kind) {
  normalizeChapterState(chState);
  chState.difficultSessions[kind] = null;
  saveState();
  renderCurrentMode();
}


function renderDifficultControls(chapter, chState) {
  if (!difficultControlsEl) return;

  normalizeChapterState(chState);
  const counts = getDifficultCounts(chState);
  const view = chState.difficultUi.view || "revise";

  difficultControlsEl.innerHTML = "";

  // Segmented: Revise / List
  const seg = document.createElement("div");
  seg.className = "difficult-seg";

  const makeSegBtn = (label, targetView) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (view === targetView) b.classList.add("is-active");
    b.addEventListener("click", () => setDifficultView(chState, targetView, chState.difficultUi.kind || "story"));
    return b;
  };

  seg.appendChild(makeSegBtn("Revise", "revise"));
  seg.appendChild(makeSegBtn("List", "list"));

  // Hint
  const hint = document.createElement("div");
  hint.className = "difficult-hint";
  if (counts.total === 0) {
    hint.textContent = "No saved items yet";
  } else {
    const parts = [];
    if (counts.story) parts.push(`${counts.story} story`);
    if (counts.question) parts.push(`${counts.question} questions`);
    hint.textContent = `Saved: ${parts.join(" · ")}`;
  }

  // Actions
  const actions = document.createElement("div");
  actions.className = "difficult-actions";

  if (counts.total > 0) {
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn btn-ghost btn-small";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => {
      if (!confirm("Clear all saved Difficult items for this chapter?")) return;
      clearChapterDifficult(chState);
      saveState();
      renderCurrentMode();
    });
    actions.appendChild(clearBtn);
  }

  difficultControlsEl.appendChild(seg);
  difficultControlsEl.appendChild(hint);
  difficultControlsEl.appendChild(actions);
}



function renderDifficultListView(chapter, chState) {
  if (!difficultListViewEl) return;
  difficultListEl.innerHTML = "";

  const resolved = chState.difficultItems
    .map((it) => resolveDifficultItem(chapter, it))
    .filter(Boolean);

  if (resolved.length === 0) {
    difficultEmptyEl.classList.remove("hidden");
    return;
  }

  difficultEmptyEl.classList.add("hidden");

  resolved.forEach((item) => {
    const li = document.createElement("li");
    li.className = "difficult-item";

    const mainText = item.type === "story" ? item.text : item.question;

    li.innerHTML = `
      <div class="difficult-meta">
        <span class="difficult-tag">${item.label}</span>
        <button class="icon-button remove-btn" aria-label="Remove">×</button>
      </div>
      <div class="difficult-text">${mainText}</div>
    `;

    li.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromDifficult(chState, item.key);
      saveState();
      renderCurrentMode();
    });

    difficultListEl.appendChild(li);
  });
}


function renderDifficultReviseView(chapter, chState) {
  if (!difficultReviseViewEl) return;

  normalizeChapterState(chState);
  const storyTotal = chState.difficultItems.filter((it) => it.type === "story").length;
  const qTotal = chState.difficultItems.filter((it) => it.type === "question").length;

  const storySession = chState.difficultSessions.story;
  const qSession = chState.difficultSessions.question;

  const storyProgress =
    storySession && Array.isArray(storySession.keys)
      ? `${Math.min(storySession.index + 1, storySession.keys.length)}/${storySession.keys.length}`
      : null;

  const qProgress =
    qSession && Array.isArray(qSession.keys)
      ? `${Math.min(qSession.index + 1, qSession.keys.length)}/${qSession.keys.length}`
      : null;

  const storyOptions = [
    { value: "all", label: `All (${storyTotal})` },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];

  const qOptions = [
    { value: "all", label: `All (${qTotal})` },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
  ];

  difficultReviseViewEl.innerHTML = `
    <div class="difficult-session-card">
      <div class="difficult-card-title">Story session</div>
      <div class="difficult-card-sub">
        ${storyTotal === 0 ? "Save story facts first (book icon)" : `${storyTotal} saved${storyProgress ? ` · In progress: ${storyProgress}` : ""}`}
      </div>

      <div class="difficult-row">
        <label class="label" for="storySessionSize">How many</label>
        <select class="select" id="storySessionSize" ${storyTotal === 0 ? "disabled" : ""}>
          ${storyOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}
        </select>
      </div>

      <div class="btn-row">
        ${storySession
          ? `<button class="btn btn-ghost" id="resumeStory">Resume</button>
             <button class="btn btn-primary" id="restartStory">Restart</button>`
          : `<button class="btn btn-primary" id="startStory" ${storyTotal === 0 ? "disabled" : ""}>Start</button>`
        }
      </div>
    </div>

    <div class="difficult-session-card">
      <div class="difficult-card-title">Questions session</div>
      <div class="difficult-card-sub">
        ${qTotal === 0 ? "Save questions first (book icon)" : `${qTotal} saved${qProgress ? ` · In progress: ${qProgress}` : ""}`}
      </div>

      <div class="difficult-row">
        <label class="label" for="questionSessionSize">How many</label>
        <select class="select" id="questionSessionSize" ${qTotal === 0 ? "disabled" : ""}>
          ${qOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}
        </select>
      </div>

      <div class="btn-row">
        ${qSession
          ? `<button class="btn btn-ghost" id="resumeQuestion">Resume</button>
             <button class="btn btn-primary" id="restartQuestion">Restart</button>`
          : `<button class="btn btn-primary" id="startQuestion" ${qTotal === 0 ? "disabled" : ""}>Start</button>`
        }
      </div>
    </div>

    ${storySession || qSession
      ? `<div class="btn-row" style="margin-top: 10px;">
           <button class="btn btn-ghost" id="resetSessions">Reset sessions</button>
         </div>`
      : ""
    }
  `;

  const storySizeSel = difficultReviseViewEl.querySelector("#storySessionSize");
  const qSizeSel = difficultReviseViewEl.querySelector("#questionSessionSize");

  const bind = (id, fn) => {
    const el = difficultReviseViewEl.querySelector(`#${id}`);
    if (el) el.addEventListener("click", fn);
  };

  bind("startStory", () => {
    const size = storySizeSel ? storySizeSel.value : "all";
    startDifficultSession(chapter, chState, "story", size);
  });

  bind("resumeStory", () => {
    setDifficultView(chState, "session", "story");
  });

  bind("restartStory", () => {
    const size = storySizeSel ? storySizeSel.value : "all";
    startDifficultSession(chapter, chState, "story", size);
  });

  bind("startQuestion", () => {
    const size = qSizeSel ? qSizeSel.value : "all";
    startDifficultSession(chapter, chState, "question", size);
  });

  bind("resumeQuestion", () => {
    setDifficultView(chState, "session", "question");
  });

  bind("restartQuestion", () => {
    const size = qSizeSel ? qSizeSel.value : "all";
    startDifficultSession(chapter, chState, "question", size);
  });

  bind("resetSessions", () => {
    if (!confirm("Reset both Story and Questions sessions for this chapter?")) return;
    chState.difficultSessions.story = null;
    chState.difficultSessions.question = null;
    saveState();
    renderCurrentMode();
  });
}



function renderDifficultSessionView(chapter, chState) {
  if (!difficultSessionViewEl) return;

  const kind = chState.difficultUi.kind;
  const session = chState.difficultSessions[kind];

  if (!kind || !session || !Array.isArray(session.keys) || session.keys.length === 0) {
    difficultSessionViewEl.innerHTML = `
      <div class="empty-state">No session found. Start a session from the Revise tab.</div>
      <button class="btn btn-primary" id="backToRevise">Back</button>
    `;
    difficultSessionViewEl.querySelector("#backToRevise")?.addEventListener("click", () => {
      setDifficultView(chState, "revise");
    });
    return;
  }

  // Skip missing items (if they were removed)
  while (session.index < session.keys.length) {
    const key = session.keys[session.index];
    const it = chState.difficultItems.find((x) => x.key === key);
    if (it) break;
    session.index += 1;
  }

  if (session.index >= session.keys.length) {
    difficultSessionViewEl.innerHTML = `
      <div class="difficult-done">Session complete 🎉</div>
      <div class="btn-row">
        <button class="btn" id="restartSession">Restart</button>
        <button class="btn btn-primary" id="backToRevise">Back</button>
      </div>
    `;
    difficultSessionViewEl.querySelector("#restartSession")?.addEventListener("click", () => {
      startDifficultSession(chapter, chState, kind, session.size || "all");
    });
    difficultSessionViewEl.querySelector("#backToRevise")?.addEventListener("click", () => {
      setDifficultView(chState, "revise");
    });
    return;
  }

  const key = session.keys[session.index];
  const item = resolveDifficultItem(chapter, chState.difficultItems.find((x) => x.key === key));

  if (!item) {
    session.index += 1;
    saveState();
    renderCurrentMode();
    return;
  }

  const title = kind === "story" ? "Story" : "Questions";
  const progress = `${session.index + 1} / ${session.keys.length}`;

  if (kind === "story") {
    difficultSessionViewEl.innerHTML = `
      <div class="difficult-session-header">
        <div class="difficult-session-title">${title} · ${progress}</div>
        <button class="btn btn-ghost" id="exitSession">Exit</button>
      </div>

      <div class="bubble">
        <div class="bubble-meta">Difficult · Story</div>
        <p class="bubble-text">${item.text}</p>
      </div>

      <div class="btn-row">
        <button class="btn" id="mastered">Mastered</button>
        <button class="btn btn-primary" id="next">OK</button>
      </div>
    `;

    difficultSessionViewEl.querySelector("#exitSession")?.addEventListener("click", () => {
      setDifficultView(chState, "revise");
    });

    difficultSessionViewEl.querySelector("#next")?.addEventListener("click", () => {
      session.index += 1;
      saveState();
      renderCurrentMode();
    });

    difficultSessionViewEl.querySelector("#mastered")?.addEventListener("click", () => {
      removeFromDifficult(chState, item.key);
      showToast("Removed from Difficult");
      saveState();
      renderCurrentMode();
    });

    return;
  }

  // question session
  const revealed = !!session.revealed;
  difficultSessionViewEl.innerHTML = `
    <div class="difficult-session-header">
      <div class="difficult-session-title">${title} · ${progress}</div>
      <button class="btn btn-ghost" id="exitSession">Exit</button>
    </div>

    <div class="qa-card">
      <div class="qa-meta">Difficult · Question</div>
      <div class="qa-text">${item.question}</div>
    </div>

    <div class="qa-card qa-answer ${revealed ? "" : "hidden"}" id="sessionAnswer">
      <div class="qa-meta">Answer</div>
      <div class="qa-text">${item.answer}</div>
    </div>

    <div class="btn-row">
      <button class="btn" id="mastered">Mastered</button>
      <button class="btn btn-primary" id="primary">${revealed ? "Next" : "Reveal"}</button>
    </div>
  `;

  difficultSessionViewEl.querySelector("#exitSession")?.addEventListener("click", () => {
    setDifficultView(chState, "revise");
  });

  difficultSessionViewEl.querySelector("#mastered")?.addEventListener("click", () => {
    removeFromDifficult(chState, item.key);
    showToast("Removed from Difficult");
    // After removal, keep the same index (next item will slide in)
    session.revealed = false;
    saveState();
    renderCurrentMode();
  });

  difficultSessionViewEl.querySelector("#primary")?.addEventListener("click", () => {
    if (!session.revealed) {
      session.revealed = true;
      saveState();
      renderCurrentMode();
      return;
    }

    // Next
    session.revealed = false;
    session.index += 1;
    saveState();
    renderCurrentMode();
  });
}

function renderDifficultMode(chapter, chState) {
  normalizeChapterState(chState);

  // Default view: encourage Revise if there are items, otherwise show List
  const counts = getDifficultCounts(chState);
  if (!chState.difficultUi || !chState.difficultUi.view) {
    chState.difficultUi = { view: counts.total > 0 ? "revise" : "list", kind: "story" };
  }

  renderDifficultControls(chapter, chState);

  const view = chState.difficultUi.view || "revise";

  difficultListViewEl?.classList.toggle("hidden", view !== "list");
  difficultReviseViewEl?.classList.toggle("hidden", view !== "revise");
  difficultSessionViewEl?.classList.toggle("hidden", view !== "session");

  if (view === "list") {
    renderDifficultListView(chapter, chState);
  } else if (view === "revise") {
    renderDifficultReviseView(chapter, chState);
  } else if (view === "session") {
    renderDifficultSessionView(chapter, chState);
  }
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
