// ------- Sample data (you'll replace this later) -------

const DATA = {
  as: {
    id: "as",
    label: "AS Level",
    chapters: [
      { id: "as-1", title: "1 Cell structure", storyPoints: [], questions: [] },
      { id: "as-2", title: "2 Biological molecules", storyPoints: [], questions: [] },
      { id: "as-3", title: "3 Enzymes", storyPoints: [], questions: [] },
      { id: "as-4", title: "4 Cell membranes and transport", storyPoints: [], questions: [] },
      { id: "as-5", title: "5 The mitotic cell cycle", storyPoints: [], questions: [] },
      { id: "as-6", title: "6 Nucleic acids and protein synthesis", storyPoints: [], questions: [] },
      { id: "as-7", title: "7 Transport in plants", storyPoints: [], questions: [] },
      { id: "as-8", title: "8 Transport in mammals", storyPoints: [], questions: [] },
      { id: "as-9", title: "9 Gas exchange", storyPoints: [], questions: [] },
      { id: "as-10", title: "10 Infectious diseases", storyPoints: [], questions: [] },
      { id: "as-11", title: "11 Immunity", storyPoints: [], questions: [] },
    ]
  },
  a2: {
    id: "a2",
    label: "A2 Level",
    chapters: [
      { id: "a2-12", title: "12 Energy and respiration", storyPoints: [
    { id: "a2-12-s1", text: "ATP is the immediate energy source for cell processes." },
    { id: "a2-12-s2", text: "ATP releases small, manageable amounts of energy when hydrolysed." },
    { id: "a2-12-s3", text: "ATP is not used for long-term energy storage in cells." }
  ], questions: [
    { id: "a2-12-q1", question: "Name the immediate energy source in cells.", answer: "ATP." },
    { id: "a2-12-q2", question: "Where in the cell does glycolysis occur?", answer: "In the cytoplasm." },
    { id: "a2-12-q3", question: "What happens to ATP when it releases energy?", answer: "It is hydrolysed to ADP and inorganic phosphate (Pi)." }
  ] },
      { id: "a2-13", title: "13 Photosynthesis", storyPoints: [], questions: [] },
      { id: "a2-14", title: "14 Homeostasis", storyPoints: [], questions: [] },
      { id: "a2-15", title: "15 Control and coordination", storyPoints: [], questions: [] },
      { id: "a2-16", title: "16 Inheritance", storyPoints: [], questions: [] },
      { id: "a2-17", title: "17 Selection and evolution", storyPoints: [], questions: [] },
      { id: "a2-18", title: "18 Classification, biodiversity and conservation", storyPoints: [], questions: [] },
      { id: "a2-19", title: "19 Genetic technology", storyPoints: [], questions: [] },
    ]
  }
};

// ---------- State & persistence ----------

const STORAGE_KEY = "microlearn-bio-state-v1";

let appState = {
  theme: "dark",
  currentLevelId: null, // "as" | "a2"
  currentChapterId: null,
  currentMode: "story", // "story" | "questions" | "revision"
  currentRevisionSubMode: "story",
  chapters: {} // per-chapter progress
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = { ...appState, ...parsed };
    }
    migrateState();
  } catch (e) {
    console.warn("Could not load state", e);
  }
}

function migrateState() {
  if (!appState.currentRevisionSubMode) {
    appState.currentRevisionSubMode = "story";
  }
  if (appState.currentMode === "difficult") {
    appState.currentMode = "revision";
  }

  if (!appState.chapters) {
    appState.chapters = {};
    return;
  }

  Object.values(appState.chapters).forEach((chState) => {
    if (!Array.isArray(chState.revisionStoryIds)) {
      chState.revisionStoryIds = Array.isArray(chState.difficultStoryIds)
        ? [...chState.difficultStoryIds]
        : [];
    }
    if (!Array.isArray(chState.revisionQuestionIds)) {
      chState.revisionQuestionIds = Array.isArray(chState.difficultQuestionIds)
        ? [...chState.difficultQuestionIds]
        : [];
    }
  });
  saveState();
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
      revisionStoryIds: [],
      revisionQuestionIds: []
    };
  }
  const chState = appState.chapters[chapterId];
  if (!Array.isArray(chState.revisionStoryIds)) chState.revisionStoryIds = [];
  if (!Array.isArray(chState.revisionQuestionIds)) chState.revisionQuestionIds = [];
  if (Array.isArray(chState.difficultStoryIds) && chState.revisionStoryIds.length === 0) {
    chState.revisionStoryIds = [...chState.difficultStoryIds];
  }
  if (Array.isArray(chState.difficultQuestionIds) && chState.revisionQuestionIds.length === 0) {
    chState.revisionQuestionIds = [...chState.difficultQuestionIds];
  }
  return chState;
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
const revisionModePanel = qs("#revisionMode");

const storyFeedEl = qs("#storyFeed");
const questionAreaEl = qs("#questionArea");

const revisionEmptyEl = qs("#revisionEmpty");
const revisionListEl = qs("#revisionList");
const revisionHubEl = qs("#revisionHub");
const revisionConfigEl = qs("#revisionConfig");
const revisionSessionEl = qs("#revisionSession");
const revisionStartBtn = qs("#revisionStartBtn");
const revisionCountOptionsEl = qs("#revisionCountOptions");
const revisionOrderOptionsEl = qs("#revisionOrderOptions");
const revisionConfigStartBtn = qs("#revisionConfigStart");
const revisionConfigCancelBtn = qs("#revisionConfigCancel");

const themeToggleBtn = qs("#themeToggle");
const appHeaderEl = document.querySelector(".app-header");
const toastEl = qs("#toast");

// Floating actions (Story + Questions)
const actionDock = qs("#actionDock");
const actionLeftBtn = qs("#actionLeft");
const actionRightBtn = qs("#actionRight");

// Question mode UI state (not persisted)
let questionRevealed = false;
let currentAnswerEl = null;

// Revision session state (not persisted)
let isRevisionSessionActive = false;
let revisionSessionQueue = [];
let revisionSessionIndex = 0;
let revisionQuestionRevealed = false;
let revisionConfigOpen = false;
let revisionSelectedCount = null;
let revisionOrder = "in-order";

const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToLatestContent() {
  // Keep the newest card/bubble visible after advancing.
  const behavior = prefersReducedMotion ? "auto" : "smooth";
  if (screenChapter.classList.contains("hidden")) return;

  if (appState.currentMode === "story") {
    const last = storyFeedEl?.lastElementChild?.lastElementChild || storyFeedEl?.lastElementChild;
    if (last) last.scrollIntoView({ block: "end", behavior });
  }

  if (appState.currentMode === "questions") {
    const wrapper = questionAreaEl?.firstElementChild;
    const last = wrapper?.lastElementChild;
    if (last) last.scrollIntoView({ block: "end", behavior });
  }
}

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

  // Header layout variant
  appHeaderEl.classList.remove("header--home");
  appHeaderEl.classList.remove("header--chapter");
  appHeaderEl.classList.remove("header--list");

  if (name === "levels") {
    screenLevels.classList.remove("hidden");
    backButton.classList.add("hidden");
    headerSubtitleEl.textContent = "";
    headerTitleEl.textContent = "";
    appHeaderEl.classList.add("header--home");
  } else if (name === "chapters") {
    screenChapters.classList.remove("hidden");
    appHeaderEl.classList.add("header--list");
    backButton.classList.remove("hidden");
    headerTitleEl.textContent = DATA[appState.currentLevelId].label;
    headerSubtitleEl.textContent = "Choose a chapter";
  } else if (name === "chapter") {
    screenChapter.classList.remove("hidden");
    appHeaderEl.classList.add("header--chapter");
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
    const totalStory = chapter.storyPoints?.length || 0;
    const totalQ = chapter.questions?.length || 0;
    const totalItems = totalStory + totalQ;

    const shownStory = Math.min(chState.storyIndex, totalStory);
    const doneItems = shownStory + chState.questionIndex;
    const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    const isSoon = totalItems === 0;
    const badge = isSoon ? "Soon" : `${pct}%`;

    const card = document.createElement("button");
    card.className = "card card-chapter";
    card.dataset.chapterId = chapter.id;

    card.innerHTML = `
      <div class="card-chapter-header">
        <div class="card-chapter-title">${chapter.title}</div>
        <div class="progress-circle">${badge}</div>
      </div>
      <div class="chapter-meta">
        ${isSoon ? "<span>Coming soon</span>" : `<span>${totalStory} story points</span><span>${totalQ} questions</span>`}
      </div>
    `;

    card.addEventListener("click", () => {
      if (isSoon) {
        showToast("Coming soon");
        return;
      }

      appState.currentChapterId = chapter.id;
      appState.currentMode = appState.currentMode || "story";
      saveState();
      setActiveMode(appState.currentMode);
      showScreen("chapter");
      renderCurrentMode();
      requestAnimationFrame(scrollToLatestContent);
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
  revisionModePanel.classList.add("hidden");

  if (mode === "story") storyModePanel.classList.remove("hidden");
  if (mode === "questions") questionsModePanel.classList.remove("hidden");
  if (mode === "revision") revisionModePanel.classList.remove("hidden");

  // reset per-mode UI state
  if (mode !== "questions") {
    questionRevealed = false;
    currentAnswerEl = null;
  }
  if (mode !== "revision") {
    resetRevisionSession();
    revisionConfigOpen = false;
  }

  renderCurrentMode();
  requestAnimationFrame(scrollToLatestContent);
}

modeTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  const mode = btn.dataset.mode;
  setActiveMode(mode);
  saveState();
});

qsa("[data-revision-submode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.revisionSubmode) {
      appState.currentRevisionSubMode = btn.dataset.revisionSubmode;
      revisionConfigOpen = false;
      saveState();
      renderCurrentMode();
    }
  });
});

revisionStartBtn.addEventListener("click", () => {
  if (revisionStartBtn.disabled) return;
  revisionConfigOpen = true;
  renderCurrentMode();
});

revisionConfigCancelBtn.addEventListener("click", () => {
  revisionConfigOpen = false;
  renderCurrentMode();
});

revisionConfigStartBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);
  startRevisionSession(chapter, chState);
});

revisionCountOptionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn || btn.disabled) return;
  revisionSelectedCount = btn.dataset.count;
  renderCurrentMode();
});

revisionOrderOptionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".segmented__btn");
  if (!btn) return;
  revisionOrder = btn.dataset.order;
  renderCurrentMode();
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
  } else if (appState.currentMode === "revision") {
    renderRevisionMode(chapter, chState);
  }

  syncActionDock(chapter, chState);
}

function updateProgress(current, total) {
  if (total === 0) {
    progressLabel.textContent = "—";
    progressFill.style.width = "0%";
    return;
  }

  progressLabel.textContent = `${current} / ${total}`;
  const pct = (current / total) * 100;
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

  // Show in Story + Questions + active Revision sessions only
  if (!chapter) {
    actionDock.classList.add("hidden");
    return;
  }

  if (mode === "revision" && isRevisionSessionActive) {
    actionDock.classList.remove("hidden");
    actionLeftBtn.classList.add("hidden");

    const total = revisionSessionQueue.length;
    const done = revisionSessionIndex >= total;
    if (done) {
      actionDock.classList.add("hidden");
      return;
    }

    if (appState.currentRevisionSubMode === "story") {
      setRightButton({ label: "OK", shape: "circle", disabled: false });
    } else {
      setRightButton({
        label: revisionQuestionRevealed ? "Next" : "Reveal",
        shape: "pill",
        disabled: false
      });
    }
    return;
  }

  if (mode === "revision") {
    actionDock.classList.add("hidden");
    return;
  }

  actionDock.classList.remove("hidden");
  actionLeftBtn.classList.remove("hidden");
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
    markCurrentStoryRevision(chapter, chState);
  } else if (appState.currentMode === "questions") {
    markCurrentQuestionRevision(chapter, chState);
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
  } else if (appState.currentMode === "revision") {
    handleRevisionPrimary();
  }
});

// ---------- Story mode ----------

function renderStoryMode(chapter, chState) {
  const total = chapter.storyPoints.length;

  if (total === 0) {
    const feed = document.createElement("div");
    feed.className = "bubble-feed";

    const bubble = document.createElement("div");
    bubble.className = "bubble bubble--left";
    bubble.innerHTML = `<p class="bubble-text">Coming soon.</p>`;

    feed.appendChild(bubble);
    storyFeedEl.innerHTML = "";
    storyFeedEl.appendChild(feed);
    return;
  }

  const feed = document.createElement("div");
  feed.className = "bubble-feed";

  const countToShow = Math.min(chState.storyIndex, total);
  const visible = chapter.storyPoints.slice(0, countToShow);

  visible.forEach((p) => {
    const bubble = document.createElement("div");
    bubble.className = "bubble bubble--left";
    bubble.innerHTML = `
      <p class="bubble-text">${p.text}</p>
    `;
    feed.appendChild(bubble);
  });

  storyFeedEl.innerHTML = "";
  storyFeedEl.appendChild(feed);

  // auto scroll to latest bubble
  requestAnimationFrame(scrollToLatestContent);
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

function markCurrentStoryRevision(chapter, chState) {
  const idx = Math.max(chState.storyIndex - 1, 0);
  const point = chapter.storyPoints[idx];
  if (!point) return;

  if (!chState.revisionStoryIds.includes(point.id)) {
    chState.revisionStoryIds.push(point.id);
    saveState();
    showToast("Saved to Revision");
  } else {
    showToast("Already saved");
  }
}

// ---------- Question mode ----------

function makeQuestionCard(q, index, showAnswer) {
  const card = document.createElement("div");
  card.className = "qa-card";

  // Small label (keeps orientation but doesn't dominate)
  const meta = document.createElement("div");
  meta.className = "qa-meta";
  meta.textContent = `Q${index + 1}`;

  const qText = document.createElement("div");
  qText.className = "qa-text";
  qText.textContent = q.question;

  card.appendChild(meta);
  card.appendChild(qText);

  if (q.answer) {
    const ans = document.createElement("div");
    ans.className = "qa-answer";
    ans.textContent = q.answer;

    if (!showAnswer) {
      ans.classList.add("hidden");
    }

    card.appendChild(ans);

    // If this is the current (unrevealed) question, wire up global pointer
    if (!showAnswer) {
      currentAnswerEl = ans;
    }
  }

  return card;
}

function renderQuestionMode(chapter, chState) {
  const wrapper = document.createElement("div");
  wrapper.className = "qa-wrapper";

  const total = chapter.questions.length;

  if (total === 0) {
    const done = document.createElement("div");
    done.className = "qa-card";
    done.innerHTML = `<div class="qa-meta">Coming soon</div><div class="qa-text">Questions for this chapter are being added.</div>`;
    wrapper.appendChild(done);

    questionAreaEl.innerHTML = "";
    questionAreaEl.appendChild(wrapper);
    return;
  }

  // Build a scrollable feed:
  // - all completed questions stay visible (with answers)
  // - current question appears at the bottom (answer hidden until Reveal)
  questionRevealed = false;
  currentAnswerEl = null;

  const completedCount = Math.min(chState.questionIndex, total);

  for (let i = 0; i < completedCount; i++) {
    const q = chapter.questions[i];
    wrapper.appendChild(makeQuestionCard(q, i, true));
  }

  if (chState.questionIndex < total) {
    const q = chapter.questions[chState.questionIndex];
    wrapper.appendChild(makeQuestionCard(q, chState.questionIndex, false));
  } else {
    const done = document.createElement("div");
    done.className = "qa-card";
    done.innerHTML = `<div class="qa-meta">Done</div><div class="qa-text">You’ve reached the end of this set.</div>`;
    wrapper.appendChild(done);
  }

  questionAreaEl.innerHTML = "";
  questionAreaEl.appendChild(wrapper);

  requestAnimationFrame(scrollToLatestContent);
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

function markCurrentQuestionRevision(chapter, chState) {
  const total = chapter.questions.length;
  if (total === 0 || chState.questionIndex >= total) return;

  const idx = Math.min(chState.questionIndex, total - 1);
  const q = chapter.questions[idx];

  if (!chState.revisionQuestionIds.includes(q.id)) {
    chState.revisionQuestionIds.push(q.id);
    saveState();
    showToast("Saved to Revision");
  } else {
    showToast("Already saved");
  }
}

// ---------- Revision mode ----------

function resetRevisionSession() {
  isRevisionSessionActive = false;
  revisionSessionQueue = [];
  revisionSessionIndex = 0;
  revisionQuestionRevealed = false;
}

function getRevisionDeck(chapter, chState, subMode) {
  if (subMode === "questions") {
    const qMap = new Map(chapter.questions.map((q) => [q.id, q]));
    return chState.revisionQuestionIds
      .map((id) => qMap.get(id))
      .filter(Boolean)
      .map((q) => ({
        id: q.id,
        type: "Question",
        question: q.question,
        answer: q.answer
      }));
  }

  const storyMap = new Map(chapter.storyPoints.map((p) => [p.id, p]));
  return chState.revisionStoryIds
    .map((id) => storyMap.get(id))
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      type: "Story",
      text: p.text
    }));
}

function setRevisionProgress(count) {
  if (count === 0) {
    progressLabel.textContent = "0 saved";
    progressFill.style.width = "0%";
    return;
  }

  updateProgress(count, count);
}

function renderRevisionMode(chapter, chState) {
  const storyDeck = getRevisionDeck(chapter, chState, "story");
  const questionDeck = getRevisionDeck(chapter, chState, "questions");

  let subMode = appState.currentRevisionSubMode || "story";
  if (subMode === "questions" && questionDeck.length === 0 && storyDeck.length > 0) {
    subMode = "story";
    appState.currentRevisionSubMode = subMode;
    saveState();
  }
  const deck = subMode === "questions" ? questionDeck : storyDeck;

  qsa("[data-revision-submode]").forEach((btn) => {
    const isActive = btn.dataset.revisionSubmode === subMode;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (isRevisionSessionActive) {
    revisionHubEl.classList.add("hidden");
    revisionConfigEl.classList.add("hidden");
    renderRevisionSession();
    syncActionDock(chapter, chState);
    return;
  }

  revisionSessionEl.classList.add("hidden");
  revisionHubEl.classList.remove("hidden");
  if (deck.length === 0) {
    revisionConfigOpen = false;
  }
  revisionConfigEl.classList.toggle("hidden", !revisionConfigOpen);

  setRevisionProgress(deck.length);

  revisionListEl.innerHTML = "";
  revisionStartBtn.disabled = deck.length === 0;

  if (deck.length === 0) {
    revisionEmptyEl.classList.remove("hidden");
  } else {
    revisionEmptyEl.classList.add("hidden");
  }

  deck.forEach((item) => {
    const li = document.createElement("li");
    li.className = "revision-item";
    li.innerHTML = `
      <div class="revision-meta">
        <span class="revision-tag">${item.type}</span>
        <button class="icon-button icon-button--flat remove-btn" aria-label="Remove">×</button>
      </div>
      <div class="revision-text revision-text--clamp">${item.type === "Story" ? item.text : item.question}</div>
    `;

    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.type === "Story") {
        chState.revisionStoryIds = chState.revisionStoryIds.filter((x) => x !== item.id);
      } else {
        chState.revisionQuestionIds = chState.revisionQuestionIds.filter((x) => x !== item.id);
      }
      saveState();
      renderRevisionMode(chapter, chState);
    });

    revisionListEl.appendChild(li);
  });

  if (revisionConfigOpen) {
    renderRevisionConfig(deck.length);
  }
}

function renderRevisionConfig(deckSize) {
  revisionConfigEl.classList.toggle("hidden", !revisionConfigOpen);
  if (!revisionConfigOpen) return;

  const countButtons = Array.from(revisionCountOptionsEl.querySelectorAll(".pill"));
  let availableCounts = [];

  countButtons.forEach((btn) => {
    const countValue = btn.dataset.count;
    if (countValue === "all") {
      btn.disabled = deckSize === 0;
      if (deckSize > 0) availableCounts.push("all");
    } else {
      const num = Number(countValue);
      const isAvailable = num <= deckSize;
      btn.disabled = !isAvailable;
      if (isAvailable) availableCounts.push(countValue);
    }
  });

  if (!availableCounts.includes(revisionSelectedCount)) {
    revisionSelectedCount = availableCounts[0] || "all";
  }

  countButtons.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.count === revisionSelectedCount);
  });

  const orderButtons = Array.from(revisionOrderOptionsEl.querySelectorAll(".segmented__btn"));
  orderButtons.forEach((btn) => {
    const isActive = btn.dataset.order === revisionOrder;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function startRevisionSession(chapter, chState) {
  const subMode = appState.currentRevisionSubMode || "story";
  const deck = getRevisionDeck(chapter, chState, subMode);
  if (deck.length === 0) return;

  let queue = deck.slice();
  if (revisionOrder === "random") {
    queue = shuffleArray(queue);
  }

  let count = revisionSelectedCount === "all" ? queue.length : Number(revisionSelectedCount);
  if (!count || Number.isNaN(count)) {
    count = Math.min(queue.length, 5);
  }

  revisionSessionQueue = queue.slice(0, count);
  revisionSessionIndex = 0;
  revisionQuestionRevealed = false;
  isRevisionSessionActive = true;
  revisionConfigOpen = false;
  renderCurrentMode();
}

function handleRevisionPrimary() {
  if (!isRevisionSessionActive) return;
  const total = revisionSessionQueue.length;
  if (revisionSessionIndex >= total) return;

  if (appState.currentRevisionSubMode === "questions") {
    if (!revisionQuestionRevealed) {
      revisionQuestionRevealed = true;
      renderCurrentMode();
      return;
    }
  }

  revisionSessionIndex += 1;
  revisionQuestionRevealed = false;
  renderCurrentMode();
}

function renderRevisionSession() {
  revisionSessionEl.classList.remove("hidden");
  revisionSessionEl.innerHTML = "";

  const total = revisionSessionQueue.length;
  if (revisionSessionIndex >= total) {
    const doneCard = document.createElement("div");
    doneCard.className = "qa-card";
    doneCard.innerHTML = `
      <div class="qa-meta">Revision done</div>
      <div class="qa-text">You’ve reached the end of this revision session.</div>
    `;

    const actions = document.createElement("div");
    actions.className = "revision-session-actions";
    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.textContent = "Back to Revision list";
    backBtn.addEventListener("click", () => {
      resetRevisionSession();
      renderCurrentMode();
    });
    actions.appendChild(backBtn);

    revisionSessionEl.appendChild(doneCard);
    revisionSessionEl.appendChild(actions);

    progressLabel.textContent = "Done";
    progressFill.style.width = "100%";
    return;
  }

  updateProgress(revisionSessionIndex + 1, total);

  const current = revisionSessionQueue[revisionSessionIndex];
  if (appState.currentRevisionSubMode === "story") {
    const bubble = document.createElement("div");
    bubble.className = "bubble bubble--left";
    bubble.innerHTML = `<p class="bubble-text">${current.text}</p>`;
    revisionSessionEl.appendChild(bubble);
  } else {
    const card = document.createElement("div");
    card.className = "qa-card";

    const meta = document.createElement("div");
    meta.className = "qa-meta";
    meta.textContent = "Question";

    const qText = document.createElement("div");
    qText.className = "qa-text";
    qText.textContent = current.question;

    card.appendChild(meta);
    card.appendChild(qText);

    if (current.answer) {
      const ans = document.createElement("div");
      ans.className = "qa-answer";
      ans.textContent = current.answer;
      if (!revisionQuestionRevealed) ans.classList.add("hidden");
      card.appendChild(ans);
    }

    revisionSessionEl.appendChild(card);
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
