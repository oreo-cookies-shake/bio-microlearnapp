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
const STORAGE_PREFIX = "microlearnBio:";
const LAST_SESSION_KEY = "lastSession";

const createDefaultState = () => ({
  theme: "dark",
  currentLevelId: null, // "as" | "a2"
  currentChapterId: null,
  currentMode: "story", // "story" | "questions" | "revision"
  currentRevisionSubMode: "story",
  chapters: {}, // per-chapter progress
  settingsScopeLevelId: null,
  settingsScopeChapterId: "all"
});

let appState = createDefaultState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = { ...createDefaultState(), ...parsed };
    } else {
      appState = createDefaultState();
    }
    migrateState();
  } catch (e) {
    console.warn("Could not load state", e);
    appState = createDefaultState();
  }
}

function migrateState() {
  if (!appState.currentRevisionSubMode) {
    appState.currentRevisionSubMode = "story";
  }
  if (appState.currentMode === "difficult") {
    appState.currentMode = "revision";
  }

  if (!DATA[appState.settingsScopeLevelId]) {
    appState.settingsScopeLevelId = DATA[appState.currentLevelId]
      ? appState.currentLevelId
      : "as";
  }
  if (!appState.settingsScopeChapterId) {
    appState.settingsScopeChapterId = "all";
  }
  if (appState.settingsScopeChapterId !== "all") {
    const level = DATA[appState.settingsScopeLevelId];
    const hasChapter = level?.chapters?.some((chapter) => chapter.id === appState.settingsScopeChapterId);
    if (!hasChapter) {
      appState.settingsScopeChapterId = "all";
    }
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

function loadLastSession() {
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Could not load last session", e);
    return null;
  }
}

function saveLastSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(LAST_SESSION_KEY);
      return;
    }
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Could not save last session", e);
  }
}

function clearLastSession() {
  try {
    localStorage.removeItem(LAST_SESSION_KEY);
  } catch (e) {
    console.warn("Could not clear last session", e);
  }
}

function isAppStorageKey(key) {
  return key === STORAGE_KEY || key === LAST_SESSION_KEY || key.startsWith(STORAGE_PREFIX);
}

function getAllAppKeys() {
  const keys = new Set();
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && isAppStorageKey(key)) {
      keys.add(key);
    }
  }
  return Array.from(keys);
}

function resetPointsProgress() {
  const chapterIds = Object.keys(appState.chapters);
  resetPointsProgressFor(chapterIds);
}

function resetQuestionsProgress() {
  const chapterIds = Object.keys(appState.chapters);
  resetQuestionsProgressFor(chapterIds);
}

function resetAllProgress() {
  resetPointsProgress();
  resetQuestionsProgress();
}

function resetPointsProgressFor(chapterIds) {
  chapterIds.forEach((chapterId) => {
    const chState = appState.chapters[chapterId];
    if (!chState) return;
    chState.storyIndex = 0;
    chState.revisionStoryIds = [];
  });
}

function resetQuestionsProgressFor(chapterIds) {
  chapterIds.forEach((chapterId) => {
    const chState = appState.chapters[chapterId];
    if (!chState) return;
    chState.questionIndex = 0;
    chState.revisionQuestionIds = [];
  });
}

function resetAllProgressFor(chapterIds) {
  resetPointsProgressFor(chapterIds);
  resetQuestionsProgressFor(chapterIds);
}

function exportBackup() {
  const keys = getAllAppKeys();
  const data = {};
  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  });
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    data
  };
}

function importBackup(payload) {
  const data = payload && typeof payload === "object" ? payload.data : null;
  if (!data || typeof data !== "object") {
    return { ok: false, error: "invalid-format" };
  }

  const entries = Object.entries(data).filter(
    ([key, value]) => isAppStorageKey(key) && typeof value === "string"
  );

  if (entries.length === 0) {
    return { ok: false, error: "no-entries" };
  }

  getAllAppKeys().forEach((key) => localStorage.removeItem(key));
  entries.forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  return { ok: true };
}

function getChapter(levelId, chapterId) {
  const level = DATA[levelId];
  return level.chapters.find((c) => c.id === chapterId);
}

function getNextChapter(levelId, chapterId) {
  const level = DATA[levelId];
  if (!level) return null;
  const index = level.chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index === -1) return null;
  return level.chapters[index + 1] || null;
}

function isChapterComingSoon(chapter) {
  if (!chapter) return false;
  const totalStory = chapter.storyPoints?.length || 0;
  const totalQ = chapter.questions?.length || 0;
  return totalStory + totalQ === 0;
}

function navigateToChapter(chapterId, mode) {
  appState.currentChapterId = chapterId;
  appState.currentMode = mode;
  saveState();
  showScreen("chapter");
  setActiveMode(mode);
}

function ensureChapterState(chapterId) {
  if (!appState.chapters[chapterId]) {
    appState.chapters[chapterId] = {
      storyIndex: 0, // how many story points have been shown
      questionIndex: 0, // current question index (0-based)
      revisionStoryIds: [],
      revisionQuestionIds: [],
      lastActiveMode: null,
      lastActiveAt: null
    };
  }
  const chState = appState.chapters[chapterId];
  if (!Array.isArray(chState.revisionStoryIds)) chState.revisionStoryIds = [];
  if (!Array.isArray(chState.revisionQuestionIds)) chState.revisionQuestionIds = [];
  if (!chState.lastActiveMode) chState.lastActiveMode = null;
  if (!chState.lastActiveAt) chState.lastActiveAt = null;
  if (Array.isArray(chState.difficultStoryIds) && chState.revisionStoryIds.length === 0) {
    chState.revisionStoryIds = [...chState.difficultStoryIds];
  }
  if (Array.isArray(chState.difficultQuestionIds) && chState.revisionQuestionIds.length === 0) {
    chState.revisionQuestionIds = [...chState.difficultQuestionIds];
  }
  return chState;
}

function recordChapterActivity(chapterId, mode) {
  if (!chapterId) return;
  if (mode !== "story" && mode !== "questions") return;
  const chState = ensureChapterState(chapterId);
  chState.lastActiveMode = mode;
  chState.lastActiveAt = Date.now();
}

function getChapterProgress(chapter, chState) {
  const totalStory = chapter.storyPoints?.length || 0;
  const totalQ = chapter.questions?.length || 0;
  const storyDone = Math.min(chState.storyIndex || 0, totalStory);
  const questionDone = Math.min(chState.questionIndex || 0, totalQ);
  const storyPct = totalStory > 0 ? Math.round((storyDone / totalStory) * 100) : 0;
  const questionPct = totalQ > 0 ? Math.round((questionDone / totalQ) * 100) : 0;
  return {
    totalStory,
    totalQ,
    storyDone,
    questionDone,
    storyPct,
    questionPct
  };
}

function getResumeMode(progress, chState) {
  const hasStoryProgress = progress.storyDone > 0;
  const hasQuestionProgress = progress.questionDone > 0;
  if (hasStoryProgress && hasQuestionProgress) {
    return chState.lastActiveMode || "story";
  }
  if (hasStoryProgress) return "story";
  if (hasQuestionProgress) return "questions";
  return null;
}

function getModeLabel(mode, revisionSubMode = "story") {
  if (mode === "questions") return "Questions";
  if (mode === "revision") {
    return revisionSubMode === "questions" ? "Revision · Questions" : "Revision · Points";
  }
  return "Points";
}

function buildLastSessionPayload(chapter, chState) {
  if (!chapter || !chState) return null;
  const baseSession = {
    levelId: appState.currentLevelId,
    chapterId: chapter.id,
    mode: appState.currentMode,
    storyIndex: chState.storyIndex || 0,
    questionIndex: chState.questionIndex || 0,
    revisionSubMode: appState.currentRevisionSubMode || "story",
    updatedAt: Date.now()
  };

  if (appState.currentMode !== "revision" || !isRevisionSessionActive) {
    return { ...baseSession, revisionSession: null };
  }

  const queueIds = revisionSessionQueue.map((item) => item.id);
  return {
    ...baseSession,
    revisionSession: {
      queueIds,
      sessionIndex: revisionSessionIndex,
      sessionMaxIndex: revisionSessionMaxIndex,
      pointIndex: revisionPointIndex,
      pointMaxIndex: revisionPointMaxIndex,
      revealedById: revisionQuestionRevealedById
    }
  };
}

function syncLastSession(chapter, chState) {
  if (!chapter || !chState) return;
  if (!appState.currentLevelId || !appState.currentChapterId) return;
  if (!["story", "questions", "revision"].includes(appState.currentMode)) return;
  const payload = buildLastSessionPayload(chapter, chState);
  saveLastSession(payload);
}

function isValidSession(session) {
  if (!session || !session.levelId || !session.chapterId || !session.mode) return false;
  const level = DATA[session.levelId];
  if (!level) return false;
  const chapter = level.chapters.find((c) => c.id === session.chapterId);
  if (!chapter || isChapterComingSoon(chapter)) return false;
  return true;
}

const RESUME_DISMISS_KEY = "microlearn.resumeDismissedOn";

function getTodayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function isResumeDismissedToday() {
  return localStorage.getItem(RESUME_DISMISS_KEY) === getTodayStamp();
}

function renderResumeCard() {
  if (!resumeCardEl || !resumeSubtitleEl) return;
  const session = loadLastSession();
  if (!isValidSession(session) || isResumeDismissedToday()) {
    resumeCardEl.classList.add("hidden");
    return;
  }
  const level = DATA[session.levelId];
  const chapter = level.chapters.find((c) => c.id === session.chapterId);
  resumeSubtitleEl.textContent = `${level.label} · ${chapter.title} · ${getModeLabel(
    session.mode,
    session.revisionSubMode
  )}`;
  resumeCardEl.classList.remove("hidden");
}

function restoreRevisionSession(chapter, chState, session) {
  if (!session?.revisionSession || appState.currentMode !== "revision") {
    resetRevisionSession();
    return;
  }
  isRevisionConfigOpen = false;
  revisionSelectMode = false;
  revisionSelectedIds.clear();
  const queueIds = session.revisionSession.queueIds || [];
  const deck = getRevisionDeck(chapter, chState, appState.currentRevisionSubMode || "story");
  const deckMap = new Map(deck.map((item) => [item.id, item]));
  const queue = queueIds.map((id) => deckMap.get(id)).filter(Boolean);
  if (queue.length === 0) {
    resetRevisionSession();
    return;
  }

  revisionSessionQueue = queue;
  revisionSessionIndex = Math.min(session.revisionSession.sessionIndex || 0, queue.length);
  revisionSessionMaxIndex = Math.min(session.revisionSession.sessionMaxIndex || 0, queue.length);
  revisionPointIndex = Math.min(session.revisionSession.pointIndex || 0, queue.length);
  revisionPointMaxIndex = Math.min(session.revisionSession.pointMaxIndex || 0, queue.length);
  revisionQuestionRevealedById = session.revisionSession.revealedById || {};
  isRevisionSessionActive = true;
}

function applyResumeSession(session) {
  if (!isValidSession(session)) return;
  appState.currentLevelId = session.levelId;
  appState.currentChapterId = session.chapterId;
  appState.currentMode = session.mode || "story";
  appState.currentRevisionSubMode = session.revisionSubMode || "story";

  const chapter = getChapter(session.levelId, session.chapterId);
  const chState = ensureChapterState(session.chapterId);
  const totalStory = chapter.storyPoints.length;
  const totalQuestions = chapter.questions.length;
  if (typeof session.storyIndex === "number") {
    chState.storyIndex = Math.max(0, Math.min(session.storyIndex, totalStory));
  }
  if (typeof session.questionIndex === "number") {
    chState.questionIndex = Math.max(0, Math.min(session.questionIndex, totalQuestions));
  }

  if (appState.currentMode === "revision") {
    restoreRevisionSession(chapter, chState, session);
  } else {
    resetRevisionSession();
  }

  saveState();
  showScreen("chapter");
  setActiveMode(appState.currentMode);
  requestAnimationFrame(scrollToLatestContent);
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
const revisionSelectionBarEl = qs("#revisionSelectionBar");
const revisionSelectedCountEl = qs("#revisionSelectedCount");
const revisionSelectAllBtn = qs("#revisionSelectAll");
const revisionClearSelectionBtn = qs("#revisionClearSelection");
const revisionCountOptionsEl = qs("#revisionCountOptions");
const revisionOrderOptionsEl = qs("#revisionOrderOptions");
const revisionConfigStartBtn = qs("#revisionConfigStart");
const revisionConfigCancelBtn = qs("#revisionConfigCancel");

const themeToggleBtn = qs("#themeToggle");
const appHeaderEl = document.querySelector(".app-header");
const toastEl = qs("#toast");
const updateToastEl = qs("#updateToast");
const updateRefreshBtn = qs("#updateRefresh");
const updateLaterBtn = qs("#updateLater");
const settingsButton = qs("#settingsButton");
const settingsModal = qs("#settingsModal");
const settingsCloseBtn = qs("#settingsClose");
const settingsLevelPicker = qs("#settingsLevelPicker");
const settingsLevelValue = qs("#settingsLevelValue");
const settingsChapterPicker = qs("#settingsChapterPicker");
const settingsChapterValue = qs("#settingsChapterValue");
const levelSheet = qs("#levelSheet");
const chapterSheet = qs("#chapterSheet");
const levelSheetOptions = qs("#levelSheetOptions");
const chapterSheetOptions = qs("#chapterSheetOptions");
const exportBackupBtn = qs("#exportBackup");
const importBackupBtn = qs("#importBackup");
const importFileInput = qs("#importFile");
const confirmDialog = qs("#confirmDialog");
const confirmCloseBtn = qs("#confirmClose");
const confirmCancelBtn = qs("#confirmCancel");
const confirmConfirmBtn = qs("#confirmConfirm");
const confirmMessageEl = qs("#confirmMessage");
const confirmTitleEl = qs("#confirmTitle");
const resumeCardEl = qs("#resumeCard");
const resumeSubtitleEl = qs("#resumeSubtitle");
const resumeButtonEl = qs("#resumeButton");
const resumeDismissBtn = qs("#resumeDismiss");
const clearResumeBtn = qs("#clearResume");

// Floating actions (Story + Questions)
const actionDock = qs("#actionDock");
const actionLeftBtn = qs("#actionLeft");
const actionRightBtn = qs("#actionRight");
const revisionSwitchDialog = qs("#revisionSwitchDialog");
const revisionSwitchCancelBtn = qs("#revisionSwitchCancel");
const revisionSwitchConfirmBtn = qs("#revisionSwitchConfirm");

const actionLeftDefaultHtml = actionLeftBtn.innerHTML;

// Question mode UI state (not persisted)
let questionRevealed = false;
let currentAnswerEl = null;

// Revision session state (not persisted)
let isRevisionSessionActive = false;
let revisionSessionQueue = [];
let revisionSessionIndex = 0;
let isRevisionConfigOpen = false;
let revisionCountChoice = null;
let revisionLastStandardCount = "all";
let revisionOrder = "in-order";
let pendingRevisionSubMode = null;
let revisionSelectMode = false;
let revisionSelectedIds = new Set();
let revisionQuestionRevealedById = {};
let revisionSessionMaxIndex = 0;
let revisionPointIndex = 0;
let revisionPointMaxIndex = 0;

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
const endOfSetCelebrations = new Set();

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("toast--show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("toast--show");
    toastEl.classList.add("hidden");
    toastTimeout = null;
  }, 2000);
}

function showUpdateToast() {
  if (!updateToastEl) return;
  updateToastEl.classList.remove("hidden");
  updateToastEl.classList.add("toast--show");
}

function hideUpdateToast() {
  if (!updateToastEl) return;
  updateToastEl.classList.remove("toast--show");
  updateToastEl.classList.add("hidden");
}

// ---------- Settings + Backup ----------

let confirmAction = null;

function openModal(modal) {
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

function openConfirmDialog({ title, message, confirmLabel, onConfirm }) {
  confirmTitleEl.textContent = title;
  confirmMessageEl.textContent = message;
  confirmConfirmBtn.textContent = confirmLabel;
  confirmAction = onConfirm;
  openModal(confirmDialog);
  confirmCancelBtn?.focus();
}

function closeConfirmDialog() {
  confirmAction = null;
  closeModal(confirmDialog);
}

function resetTransientUiState() {
  resetRevisionSession();
  isRevisionConfigOpen = false;
  revisionSelectMode = false;
  revisionSelectedIds.clear();
  questionRevealed = false;
  currentAnswerEl = null;
}

function refreshUiAfterStateChange() {
  resetTransientUiState();
  applyTheme();

  if (!screenChapter.classList.contains("hidden")) {
    if (appState.currentLevelId && appState.currentChapterId) {
      showScreen("chapter");
      renderCurrentMode();
      return;
    }
  }

  if (!screenChapters.classList.contains("hidden")) {
    if (appState.currentLevelId) {
      showScreen("chapters");
      renderChapters();
      return;
    }
  }

  showScreen("levels");
}

function getSettingsResetScope() {
  const levelId = DATA[appState.settingsScopeLevelId]
    ? appState.settingsScopeLevelId
    : DATA[appState.currentLevelId]
      ? appState.currentLevelId
      : "as";
  const chapterId = appState.settingsScopeChapterId || "all";
  return { levelId, chapterId };
}

function getChapterIdsForScope(scope) {
  const level = DATA[scope.levelId];
  if (!level) return [];
  if (scope.chapterId === "all") {
    return level.chapters.map((chapter) => chapter.id);
  }
  return level.chapters.some((chapter) => chapter.id === scope.chapterId)
    ? [scope.chapterId]
    : level.chapters.map((chapter) => chapter.id);
}

function getSettingsScopeLabel(scope) {
  const level = DATA[scope.levelId];
  const levelLabel = level?.label || "Selected level";
  if (scope.chapterId === "all") {
    return `${levelLabel} — All chapters`;
  }
  const chapterLabel = level?.chapters?.find((chapter) => chapter.id === scope.chapterId)?.title
    || "Selected chapter";
  return `${levelLabel} — ${chapterLabel}`;
}

function ensureSettingsScope() {
  if (!DATA[appState.settingsScopeLevelId]) {
    appState.settingsScopeLevelId = DATA[appState.currentLevelId]
      ? appState.currentLevelId
      : "as";
  }
  if (!appState.settingsScopeChapterId) {
    appState.settingsScopeChapterId = "all";
  }

  const level = DATA[appState.settingsScopeLevelId];
  if (
    appState.settingsScopeChapterId !== "all"
    && !level?.chapters?.some((chapter) => chapter.id === appState.settingsScopeChapterId)
  ) {
    appState.settingsScopeChapterId = "all";
  }
}

function buildLevelSheetOptions() {
  if (!levelSheetOptions) return;
  levelSheetOptions.innerHTML = "";
  Object.values(DATA).forEach((level) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "bottom-sheet__option";
    option.dataset.value = level.id;
    if (level.id === appState.settingsScopeLevelId) {
      option.classList.add("is-selected");
    }
    option.innerHTML = `
      <span class="bottom-sheet__option-label">${level.label}</span>
      <span class="bottom-sheet__check" aria-hidden="true"></span>
    `;
    levelSheetOptions.appendChild(option);
  });
}

function buildChapterSheetOptions(levelId) {
  if (!chapterSheetOptions) return;
  chapterSheetOptions.innerHTML = "";
  const allOption = document.createElement("button");
  allOption.type = "button";
  allOption.className = "bottom-sheet__option";
  allOption.dataset.value = "all";
  if (appState.settingsScopeChapterId === "all") {
    allOption.classList.add("is-selected");
  }
  allOption.innerHTML = `
    <span class="bottom-sheet__option-label">All chapters</span>
    <span class="bottom-sheet__check" aria-hidden="true"></span>
  `;
  chapterSheetOptions.appendChild(allOption);

  const level = DATA[levelId];
  if (!level) return;
  level.chapters.forEach((chapter) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "bottom-sheet__option";
    option.dataset.value = chapter.id;
    if (chapter.id === appState.settingsScopeChapterId) {
      option.classList.add("is-selected");
    }
    option.innerHTML = `
      <span class="bottom-sheet__option-label">${chapter.title}</span>
      <span class="bottom-sheet__check" aria-hidden="true"></span>
    `;
    chapterSheetOptions.appendChild(option);
  });
}

function renderSettingsScope() {
  if (!settingsLevelValue || !settingsChapterValue) return;
  const level = DATA[appState.settingsScopeLevelId];
  settingsLevelValue.textContent = level?.label || "AS Level";
  if (appState.settingsScopeChapterId === "all") {
    settingsChapterValue.textContent = "All chapters";
    return;
  }
  const chapterLabel = level?.chapters?.find(
    (chapter) => chapter.id === appState.settingsScopeChapterId
  )?.title;
  settingsChapterValue.textContent = chapterLabel || "All chapters";
}

function syncSettingsScopeControls() {
  ensureSettingsScope();
  renderSettingsScope();
  buildLevelSheetOptions();
  buildChapterSheetOptions(appState.settingsScopeLevelId);
  saveState();
}

function openBottomSheet(sheetEl) {
  if (!sheetEl || !sheetEl.classList.contains("hidden")) return;
  sheetEl.classList.remove("hidden");
  requestAnimationFrame(() => {
    sheetEl.classList.add("is-open");
  });
  document.body.classList.add("no-scroll");
}

function closeBottomSheet(sheetEl) {
  if (!sheetEl || sheetEl.classList.contains("hidden")) return;
  sheetEl.classList.remove("is-open");
  const cleanup = () => {
    if (sheetEl.classList.contains("hidden")) return;
    sheetEl.classList.add("hidden");
    sheetEl.removeEventListener("transitionend", cleanup);
    if (!document.querySelector(".bottom-sheet.is-open")) {
      document.body.classList.remove("no-scroll");
    }
  };
  sheetEl.addEventListener("transitionend", cleanup);
  setTimeout(cleanup, 250);
}

function closeAllBottomSheets() {
  closeBottomSheet(levelSheet);
  closeBottomSheet(chapterSheet);
}

function initSettingsScopeControls() {
  if (!settingsLevelPicker || !settingsChapterPicker) return;
  syncSettingsScopeControls();

  settingsLevelPicker.addEventListener("click", () => {
    syncSettingsScopeControls();
    openBottomSheet(levelSheet);
  });

  settingsChapterPicker.addEventListener("click", () => {
    syncSettingsScopeControls();
    openBottomSheet(chapterSheet);
  });

  levelSheetOptions?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-value]");
    if (!option) return;
    appState.settingsScopeLevelId = option.dataset.value;
    ensureSettingsScope();
    syncSettingsScopeControls();
    closeBottomSheet(levelSheet);
  });

  chapterSheetOptions?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-value]");
    if (!option) return;
    appState.settingsScopeChapterId = option.dataset.value;
    ensureSettingsScope();
    syncSettingsScopeControls();
    closeBottomSheet(chapterSheet);
  });

  [levelSheet, chapterSheet].forEach((sheet) => {
    if (!sheet) return;
    sheet.addEventListener("click", (event) => {
      if (event.target.matches("[data-sheet-close]")) {
        closeBottomSheet(sheet);
      }
    });
  });
}

settingsButton.addEventListener("click", () => {
  syncSettingsScopeControls();
  openModal(settingsModal);
});

settingsCloseBtn.addEventListener("click", () => {
  closeAllBottomSheets();
  closeModal(settingsModal);
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    closeAllBottomSheets();
    closeModal(settingsModal);
  }
});

confirmCloseBtn.addEventListener("click", () => {
  closeConfirmDialog();
});

confirmCancelBtn.addEventListener("click", () => {
  closeConfirmDialog();
});

confirmDialog.addEventListener("click", (e) => {
  if (e.target === confirmDialog) {
    closeConfirmDialog();
  }
});

confirmConfirmBtn.addEventListener("click", () => {
  if (confirmAction) {
    confirmAction();
  }
  closeConfirmDialog();
});

qsa("[data-reset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const kind = btn.dataset.reset;
    const scope = getSettingsResetScope();
    const chapterIds = getChapterIdsForScope(scope);
    const scopeLabel = getSettingsScopeLabel(scope);
    const actionLabel = kind === "points"
      ? "Points"
      : kind === "questions"
        ? "Questions"
        : "ALL";
    const title = `Reset ${actionLabel} progress?`;
    const message = `Reset ${actionLabel} progress for ${scopeLabel}?`;
    openConfirmDialog({
      title,
      message,
      confirmLabel: "Reset",
      onConfirm: () => {
        if (kind === "points") {
          resetPointsProgressFor(chapterIds);
        } else if (kind === "questions") {
          resetQuestionsProgressFor(chapterIds);
        } else {
          resetAllProgressFor(chapterIds);
        }
        saveState();
        refreshUiAfterStateChange();
        showToast("Progress reset ✅");
      }
    });
  });
});

clearResumeBtn?.addEventListener("click", () => {
  openConfirmDialog({
    title: "Clear resume?",
    message: "This will remove the saved resume location on this device.",
    confirmLabel: "Clear",
    onConfirm: () => {
      clearLastSession();
      renderResumeCard();
      showToast("Resume cleared");
    }
  });
});

const handleResume = () => {
  const session = loadLastSession();
  if (!session) return;
  applyResumeSession(session);
};

resumeCardEl?.addEventListener("click", handleResume);
resumeCardEl?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleResume();
  }
});
resumeButtonEl?.addEventListener("click", (event) => {
  event.stopPropagation();
  handleResume();
});
resumeDismissBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  localStorage.setItem(RESUME_DISMISS_KEY, getTodayStamp());
  renderResumeCard();
});

exportBackupBtn.addEventListener("click", () => {
  const payload = exportBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "microlearn-bio-backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup exported ✅");
});

importBackupBtn.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", async () => {
  const file = importFileInput.files && importFileInput.files[0];
  importFileInput.value = "";
  if (!file) return;

  let payload = null;
  try {
    const text = await file.text();
    payload = JSON.parse(text);
  } catch (e) {
    showToast("Backup import failed.");
    return;
  }

  if (!payload || typeof payload !== "object" || !payload.data) {
    showToast("Backup import failed.");
    return;
  }

  openConfirmDialog({
    title: "Restore backup?",
    message: "This will replace your current local progress with the backup.",
    confirmLabel: "Restore",
    onConfirm: () => {
      const result = importBackup(payload);
      if (!result.ok) {
        showToast("Backup import failed.");
        return;
      }
      loadState();
      refreshUiAfterStateChange();
      showToast("Backup imported ✅");
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  if (!confirmDialog.classList.contains("hidden")) {
    closeConfirmDialog();
    return;
  }

  if (!settingsModal.classList.contains("hidden")) {
    closeModal(settingsModal);
  }
});

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
    settingsButton.classList.remove("hidden");
    headerSubtitleEl.textContent = "";
    headerTitleEl.textContent = "";
    appHeaderEl.classList.add("header--home");
    renderResumeCard();
  } else if (name === "chapters") {
    screenChapters.classList.remove("hidden");
    appHeaderEl.classList.add("header--list");
    backButton.classList.remove("hidden");
    settingsButton.classList.add("hidden");
    headerTitleEl.textContent = DATA[appState.currentLevelId].label;
    headerSubtitleEl.textContent = "Choose a chapter";
  } else if (name === "chapter") {
    screenChapter.classList.remove("hidden");
    appHeaderEl.classList.add("header--chapter");
    backButton.classList.remove("hidden");
    settingsButton.classList.add("hidden");
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
      if (!DATA[appState.settingsScopeLevelId]) {
        appState.settingsScopeLevelId = levelId;
        appState.settingsScopeChapterId = "all";
      }
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
    const progress = getChapterProgress(chapter, chState);
    const totalItems = progress.totalStory + progress.totalQ;
    const overallPct = totalItems > 0
      ? Math.round(((progress.storyDone + progress.questionDone) / totalItems) * 100)
      : 0;

    const isSoon = totalItems === 0;
    const hasProgress = progress.storyDone > 0 || progress.questionDone > 0;
    const resumeMode = hasProgress ? getResumeMode(progress, chState) : null;

    const card = document.createElement("div");
    card.className = "card card-chapter";
    card.dataset.chapterId = chapter.id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${chapter.title} chapter`);

    card.innerHTML = `
      <div class="card-chapter-header">
        <div class="card-chapter-title">${chapter.title}</div>
        ${isSoon ? '<div class="progress-circle">Soon</div>' : `
          <div class="card-chapter-progress">${overallPct}%</div>
        `}
      </div>
      <div class="chapter-meta">
        ${isSoon ? "<span>Coming soon</span>" : `
          <div class="chapter-meta-chips">
            <span class="chapter-chip">Points · ${progress.totalStory} · ${progress.storyPct}%</span>
            <span class="chapter-chip">Questions · ${progress.totalQ} · ${progress.questionPct}%</span>
            ${hasProgress ? '<span class="chapter-chip chapter-chip--muted">Continue</span>' : ""}
          </div>
        `}
      </div>
    `;

    const openChapter = (modeOverride = null) => {
      if (isSoon) {
        showToast("Coming soon");
        return;
      }

      appState.currentChapterId = chapter.id;
      appState.currentMode = modeOverride || resumeMode || appState.currentMode || "story";
      saveState();
      showScreen("chapter");
      setActiveMode(appState.currentMode);
      requestAnimationFrame(scrollToLatestContent);
    };

    card.addEventListener("click", () => {
      openChapter();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openChapter();
      }
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

  if (mode === "story" || mode === "questions") {
    recordChapterActivity(appState.currentChapterId, mode);
    saveState();
  }

  // reset per-mode UI state
  if (mode !== "questions") {
    questionRevealed = false;
    currentAnswerEl = null;
  }
  if (mode !== "revision") {
    resetRevisionSession();
    isRevisionConfigOpen = false;
    revisionSelectMode = false;
    revisionSelectedIds.clear();
    revisionCountChoice = revisionLastStandardCount;
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
    if (!btn.dataset.revisionSubmode) return;

    if (isRevisionSessionActive && btn.dataset.revisionSubmode !== appState.currentRevisionSubMode) {
      openRevisionSwitchDialog(btn.dataset.revisionSubmode);
      return;
    }

    appState.currentRevisionSubMode = btn.dataset.revisionSubmode;
    isRevisionConfigOpen = false;
    revisionSelectMode = false;
    revisionSelectedIds.clear();
    revisionCountChoice = revisionLastStandardCount;
    saveState();
    renderCurrentMode();
  });
});

revisionStartBtn.addEventListener("click", () => {
  if (revisionStartBtn.disabled || isRevisionConfigOpen) return;
  isRevisionConfigOpen = true;
  renderCurrentMode();
});

revisionSelectAllBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);
  const deck = getRevisionDeck(chapter, chState, appState.currentRevisionSubMode);
  revisionSelectedIds = new Set(deck.map((item) => item.id));
  renderCurrentMode();
});

revisionClearSelectionBtn.addEventListener("click", () => {
  revisionSelectedIds.clear();
  renderCurrentMode();
});

revisionConfigCancelBtn.addEventListener("click", () => {
  if (revisionSelectMode) {
    revisionSelectedIds.clear();
    revisionSelectMode = false;
    revisionCountChoice = revisionLastStandardCount;
  }
  isRevisionConfigOpen = false;
  renderCurrentMode();
});

revisionConfigStartBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);
  if (revisionSelectMode && revisionSelectedIds.size === 0) {
    showToast("Select at least 1 item");
    return;
  }
  startRevisionSession(
    chapter,
    chState,
    revisionSelectMode ? Array.from(revisionSelectedIds) : null
  );
});

revisionCountOptionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn || btn.disabled) return;
  const countChoice = btn.dataset.count;
  if (countChoice === "select") {
    revisionSelectMode = true;
    revisionCountChoice = "select";
  } else {
    revisionSelectMode = false;
    revisionSelectedIds.clear();
    revisionCountChoice = countChoice;
    revisionLastStandardCount = countChoice;
  }
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
  syncLastSession(chapter, chState);
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

function setLeftButton({ label, shape = "circle", disabled = false, useIcon = false }) {
  actionLeftBtn.disabled = disabled;
  actionLeftBtn.classList.toggle("fab--circle", shape === "circle");
  actionLeftBtn.classList.toggle("fab--pill", shape === "pill");

  if (useIcon) {
    actionLeftBtn.innerHTML = actionLeftDefaultHtml;
  } else {
    actionLeftBtn.textContent = label;
  }

  actionLeftBtn.setAttribute("aria-label", label);
  actionLeftBtn.setAttribute("title", label);
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
    actionLeftBtn.classList.remove("hidden");

    const total = revisionSessionQueue.length;
    const done = appState.currentRevisionSubMode === "story"
      ? revisionPointIndex >= total
      : revisionSessionIndex >= total;
    if (done) {
      actionDock.classList.add("hidden");
      return;
    }

    if (appState.currentRevisionSubMode === "story") {
      setLeftButton({ label: "Exit", shape: "circle" });
      setRightButton({ label: "OK", shape: "circle", disabled: false });
    } else {
      const current = getCurrentRevisionItem();
      const isRevealed = isRevisionQuestionRevealed(current);
      const isAtNewest = revisionSessionIndex >= revisionSessionMaxIndex;
      const disableNext = isRevealed && !isAtNewest;
      setLeftButton({ label: "Exit", shape: "pill" });
      setRightButton({
        label: isRevealed ? "Next" : "Reveal",
        shape: "pill",
        disabled: disableNext
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
  setLeftButton({ label: "Add to Revision", shape: "circle", useIcon: true });

  if (mode === "story") {
    const total = chapter.storyPoints.length;
    const done = chState.storyIndex >= total;
    if (total === 0 || done) {
      actionDock.classList.add("hidden");
      return;
    }

    setRightButton({ label: "OK", shape: "circle", disabled: false });
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
  } else if (appState.currentMode === "revision" && isRevisionSessionActive) {
    resetRevisionSession();
    renderCurrentMode();
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

  if (chState.storyIndex >= total) {
    feed.appendChild(createEndOfSetCard({
      levelId: appState.currentLevelId,
      chapterId: chapter.id,
      mode: "story"
    }));
  }

  // auto scroll to latest bubble
  requestAnimationFrame(scrollToLatestContent);
}


function advanceStory(chapter, chState) {
  const total = chapter.storyPoints.length;
  if (total === 0) return;

  if (chState.storyIndex < total) {
    chState.storyIndex += 1;
    recordChapterActivity(chapter.id, "story");
    saveState();
    renderCurrentMode();
  } else {
    showToast("End of points");
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
    wrapper.appendChild(createEndOfSetCard({
      levelId: appState.currentLevelId,
      chapterId: chapter.id,
      mode: "questions"
    }));
  }

  questionAreaEl.innerHTML = "";
  questionAreaEl.appendChild(wrapper);

  requestAnimationFrame(scrollToLatestContent);
}

function createEndOfSetCard({ levelId, chapterId, mode }) {
  const card = document.createElement("div");
  card.className = "qa-card end-card";
  const celebrateKey = `${levelId}:${chapterId}:${mode}`;
  if (!endOfSetCelebrations.has(celebrateKey)) {
    endOfSetCelebrations.add(celebrateKey);
    card.classList.add("end-card--celebrate");
    if (!prefersReducedMotion && navigator?.vibrate) {
      navigator.vibrate(10);
    }
  }

  const meta = document.createElement("div");
  meta.className = "qa-meta";
  meta.textContent = "Done";

  const text = document.createElement("div");
  text.className = "qa-text";
  text.textContent = "You’ve reached the end of this set.";

  card.appendChild(meta);
  card.appendChild(text);

  const nextChapter = getNextChapter(levelId, chapterId);
  const actions = document.createElement("div");
  actions.className = "end-card-actions";

  const revisionBtn = document.createElement("button");
  revisionBtn.className = "btn btn--ghost btn--small";
  revisionBtn.type = "button";
  revisionBtn.textContent = "Start revision";
  revisionBtn.addEventListener("click", () => {
    appState.currentRevisionSubMode = mode === "questions" ? "questions" : "story";
    setActiveMode("revision");
    saveState();
  });

  if (nextChapter) {
    const nextBtn = document.createElement("button");
    const nextIsSoon = isChapterComingSoon(nextChapter);
    nextBtn.className = "btn";
    nextBtn.type = "button";
    nextBtn.textContent = nextIsSoon ? "Next chapter (coming soon)" : "Next chapter →";
    nextBtn.disabled = nextIsSoon;

    if (!nextIsSoon) {
      nextBtn.addEventListener("click", () => {
        navigateToChapter(nextChapter.id, mode);
      });
    }

    const backBtn = document.createElement("button");
    backBtn.className = "btn btn--ghost btn--small";
    backBtn.type = "button";
    backBtn.textContent = "Back to chapters";
    backBtn.addEventListener("click", () => {
      showScreen("chapters");
    });

    actions.appendChild(nextBtn);
    actions.appendChild(revisionBtn);
    actions.appendChild(backBtn);
  } else {
    const note = document.createElement("div");
    note.className = "end-card-note";
    note.textContent = "You’ve finished this level 🎉";
    card.appendChild(note);

    revisionBtn.classList.remove("btn--small");
    revisionBtn.classList.add("btn--ghost");
    actions.appendChild(revisionBtn);

    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.type = "button";
    backBtn.textContent = "Back to chapters";
    backBtn.addEventListener("click", () => {
      showScreen("chapters");
    });

    actions.appendChild(backBtn);
  }

  card.appendChild(actions);
  return card;
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
  recordChapterActivity(chapter.id, "questions");
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
  revisionQuestionRevealedById = {};
  revisionSessionMaxIndex = 0;
  revisionPointIndex = 0;
  revisionPointMaxIndex = 0;
}

function getRevisionDeck(chapter, chState, subMode) {
  if (subMode === "questions") {
    const qMap = new Map(chapter.questions.map((q) => [q.id, q]));
    return chState.revisionQuestionIds
      .map((id) => qMap.get(id))
      .filter(Boolean)
      .map((q) => ({
        id: q.id,
        kind: "questions",
        label: "Question",
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
      kind: "story",
      label: "Point",
      text: p.text
    }));
}

function getCurrentRevisionItem() {
  if (!isRevisionSessionActive) return null;
  return revisionSessionQueue[revisionSessionIndex] || null;
}

function isRevisionQuestionRevealed(item) {
  if (!item) return false;
  return Boolean(revisionQuestionRevealedById[item.id]);
}

function setRevisionProgress(count) {
  if (count === 0) {
    progressLabel.textContent = "0 saved";
    progressFill.style.width = "0%";
    return;
  }

  updateProgress(count, count);
}

function updateRevisionSelectionUI(deckSize) {
  if (!revisionSelectMode) {
    revisionSelectedCountEl.textContent = "0 selected";
    revisionSelectAllBtn.disabled = true;
    revisionClearSelectionBtn.disabled = true;
    revisionConfigStartBtn.disabled = deckSize === 0;
    return;
  }
  const selectedCount = revisionSelectedIds.size;
  revisionSelectedCountEl.textContent = `${selectedCount} selected`;
  revisionSelectAllBtn.disabled = deckSize === 0 || selectedCount === deckSize;
  revisionClearSelectionBtn.disabled = selectedCount === 0;
  revisionConfigStartBtn.disabled = deckSize === 0 || selectedCount === 0;
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
    btn.setAttribute("aria-disabled", isRevisionSessionActive ? "true" : "false");
    btn.classList.toggle("segmented__btn--locked", isRevisionSessionActive);
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
    isRevisionConfigOpen = false;
    revisionSelectMode = false;
    revisionSelectedIds.clear();
  }
  const deckIdSet = new Set(deck.map((item) => item.id));
  revisionSelectedIds = new Set([...revisionSelectedIds].filter((id) => deckIdSet.has(id)));
  revisionConfigEl.classList.toggle("hidden", !isRevisionConfigOpen);

  setRevisionProgress(deck.length);

  revisionListEl.innerHTML = "";
  revisionStartBtn.disabled = deck.length === 0;
  revisionStartBtn.textContent = "Start revision";
  revisionStartBtn.classList.toggle("btn--pressed", isRevisionConfigOpen);
  revisionStartBtn.classList.toggle("btn--press-lock", isRevisionConfigOpen);
  revisionStartBtn.setAttribute("aria-pressed", isRevisionConfigOpen ? "true" : "false");
  revisionSelectionBarEl.classList.toggle("hidden", !revisionSelectMode);

  if (deck.length === 0) {
    revisionEmptyEl.classList.remove("hidden");
  } else {
    revisionEmptyEl.classList.add("hidden");
  }

  deck.forEach((item) => {
    const li = document.createElement("li");
    li.className = "revision-item";
    if (revisionSelectMode) {
      li.classList.add("revision-item--selectable");
      const checkboxWrap = document.createElement("label");
      checkboxWrap.className = "revision-checkbox-wrap";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "revision-checkbox";
      checkbox.checked = revisionSelectedIds.has(item.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          revisionSelectedIds.add(item.id);
        } else {
          revisionSelectedIds.delete(item.id);
        }
        updateRevisionSelectionUI(deck.length);
      });
      checkboxWrap.appendChild(checkbox);
      li.appendChild(checkboxWrap);
    }

    const content = document.createElement("div");
    content.className = "revision-item-content";
    content.innerHTML = `
      <div class="revision-meta">
        <span class="revision-tag">${item.label}</span>
        <button class="icon-button icon-button--flat remove-btn" aria-label="Remove">×</button>
      </div>
      <div class="revision-text revision-text--clamp">${item.kind === "story" ? item.text : item.question}</div>
    `;
    li.appendChild(content);

    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.kind === "story") {
        chState.revisionStoryIds = chState.revisionStoryIds.filter((x) => x !== item.id);
      } else {
        chState.revisionQuestionIds = chState.revisionQuestionIds.filter((x) => x !== item.id);
      }
      revisionSelectedIds.delete(item.id);
      saveState();
      renderRevisionMode(chapter, chState);
    });

    revisionListEl.appendChild(li);
  });

  updateRevisionSelectionUI(deck.length);

  if (isRevisionConfigOpen) {
    renderRevisionConfig(deck.length);
  }
}

function renderRevisionConfig(deckSize) {
  revisionConfigEl.classList.toggle("hidden", !isRevisionConfigOpen);
  if (!isRevisionConfigOpen) return;

  const countButtons = Array.from(revisionCountOptionsEl.querySelectorAll(".pill"));
  let availableCounts = [];

  countButtons.forEach((btn) => {
    const countValue = btn.dataset.count;
    if (countValue === "select") {
      btn.disabled = deckSize === 0;
      if (deckSize > 0) availableCounts.push("select");
      return;
    }

    if (countValue === "all") {
      btn.disabled = deckSize === 0 || revisionSelectMode;
      if (deckSize > 0) availableCounts.push("all");
      return;
    }

    const num = Number(countValue);
    const isAvailable = num <= deckSize;
    btn.disabled = !isAvailable || revisionSelectMode;
    if (isAvailable) availableCounts.push(countValue);
  });

  if (!availableCounts.includes(revisionCountChoice)) {
    revisionCountChoice = availableCounts[0] || "all";
  }

  countButtons.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.count === revisionCountChoice);
  });

  const orderButtons = Array.from(revisionOrderOptionsEl.querySelectorAll(".segmented__btn"));
  orderButtons.forEach((btn) => {
    const isActive = btn.dataset.order === revisionOrder;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (!revisionSelectMode) {
    revisionConfigStartBtn.disabled = deckSize === 0;
  }
}

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function startRevisionSession(chapter, chState, selectedIds = null) {
  const subMode = appState.currentRevisionSubMode || "story";
  const deck = getRevisionDeck(chapter, chState, subMode);
  if (deck.length === 0) return;

  let queue = deck.slice();
  if (Array.isArray(selectedIds)) {
    if (selectedIds.length === 0) return;
    const selectedSet = new Set(selectedIds);
    queue = deck.filter((item) => selectedSet.has(item.id));
    if (revisionOrder === "random") {
      queue = shuffleArray(queue);
    }
  } else {
    if (revisionOrder === "random") {
      queue = shuffleArray(queue);
    }

    let count = revisionCountChoice === "all" ? queue.length : Number(revisionCountChoice);
    if (!count || Number.isNaN(count)) {
      count = Math.min(queue.length, 5);
    }

    queue = queue.slice(0, count);
  }

  if (queue.length === 0) return;
  revisionSessionQueue = queue;
  revisionSessionIndex = 0;
  revisionSessionMaxIndex = 0;
  revisionQuestionRevealedById = {};
  isRevisionSessionActive = true;
  isRevisionConfigOpen = false;
  revisionSelectMode = false;
  revisionSelectedIds.clear();
  revisionCountChoice = revisionLastStandardCount;
  revisionPointIndex = 0;
  revisionPointMaxIndex = 0;
  renderCurrentMode();
}

function handleRevisionPrimary() {
  if (!isRevisionSessionActive) return;
  const total = revisionSessionQueue.length;
  if (appState.currentRevisionSubMode === "story") {
    if (revisionPointIndex >= total) return;
    if (revisionPointMaxIndex < total - 1) {
      revisionPointMaxIndex += 1;
      revisionPointIndex = revisionPointMaxIndex;
      renderCurrentMode();
      return;
    }
    revisionPointIndex = total;
    renderCurrentMode();
    return;
  }
  if (revisionSessionIndex >= total) return;

  if (appState.currentRevisionSubMode === "questions") {
    const current = getCurrentRevisionItem();
    if (current && !isRevisionQuestionRevealed(current)) {
      revisionQuestionRevealedById[current.id] = true;
      renderCurrentMode();
      return;
    }
    if (revisionSessionIndex < revisionSessionMaxIndex) {
      return;
    }
  }

  revisionSessionIndex += 1;
  revisionSessionMaxIndex = Math.max(revisionSessionMaxIndex, revisionSessionIndex);
  renderCurrentMode();
}

function handleRevisionPrev() {
  if (!isRevisionSessionActive) return;
  if (appState.currentRevisionSubMode === "story") {
    if (revisionPointIndex <= 0) return;
    revisionPointIndex -= 1;
    renderCurrentMode();
    return;
  }
  if (revisionSessionIndex <= 0) return;
  revisionSessionIndex -= 1;
  renderCurrentMode();
}

function handleRevisionForward() {
  if (!isRevisionSessionActive) return;
  if (appState.currentRevisionSubMode === "story") {
    if (revisionPointIndex >= revisionPointMaxIndex) return;
    revisionPointIndex += 1;
    renderCurrentMode();
    return;
  }
  if (appState.currentRevisionSubMode !== "questions") return;
  if (revisionSessionIndex >= revisionSessionMaxIndex) return;
  revisionSessionIndex += 1;
  renderCurrentMode();
}

function renderRevisionSession() {
  revisionSessionEl.classList.remove("hidden");
  revisionSessionEl.innerHTML = "";

  const total = revisionSessionQueue.length;
  const isStorySession = appState.currentRevisionSubMode === "story";
  const currentIndex = isStorySession ? revisionPointIndex : revisionSessionIndex;
  const maxIndex = isStorySession ? revisionPointMaxIndex : revisionSessionMaxIndex;
  if (currentIndex >= total) {
    const doneCard = document.createElement("div");
    doneCard.className = "qa-card";
    doneCard.innerHTML = `
      <div class="qa-meta">Session complete</div>
      <div class="qa-text">You’ve finished this revision set.</div>
    `;

    const actions = document.createElement("div");
    actions.className = "revision-session-actions";
    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.textContent = "Back to Revision";
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

  updateProgress(currentIndex + 1, total);

  const current = revisionSessionQueue[currentIndex];
  if (!current) {
    if (isStorySession) {
      revisionPointIndex = total;
    } else {
      revisionSessionIndex = total;
    }
    renderRevisionSession();
    return;
  }

  const header = document.createElement("div");
  header.className = "revision-session-header";
  const prevBtn = document.createElement("button");
  prevBtn.className = "icon-button icon-button--flat icon-button--small";
  prevBtn.textContent = "←";
  prevBtn.setAttribute("aria-label", "Back");
  prevBtn.disabled = currentIndex === 0;
  prevBtn.addEventListener("click", handleRevisionPrev);
  header.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.className = "icon-button icon-button--flat icon-button--small";
  nextBtn.textContent = "→";
  nextBtn.setAttribute("aria-label", "Forward");
  nextBtn.disabled = currentIndex >= maxIndex;
  nextBtn.addEventListener("click", handleRevisionForward);
  header.appendChild(nextBtn);
  revisionSessionEl.appendChild(header);

  if (isStorySession) {
    const feed = document.createElement("div");
    feed.className = "bubble-feed";
    const revealedPoints = revisionSessionQueue.slice(0, Math.min(maxIndex + 1, total));

    revealedPoints.forEach((point, index) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble bubble--left revision-point";
      if (index === currentIndex) {
        bubble.classList.add("revision-point--focused");
      }
      bubble.dataset.pointIndex = String(index);
      bubble.innerHTML = `<p class="bubble-text">${point.text}</p>`;
      feed.appendChild(bubble);
    });

    revisionSessionEl.appendChild(feed);
    requestAnimationFrame(() => {
      const focused = revisionSessionEl.querySelector(".revision-point--focused");
      if (focused) {
        focused.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    });
  } else {
    const card = document.createElement("div");
    card.className = "qa-card";

    const meta = document.createElement("div");
    meta.className = "qa-meta";
    meta.textContent = `Q${currentIndex + 1}`;

    const qText = document.createElement("div");
    qText.className = "qa-text";
    qText.textContent = current.question;

    card.appendChild(meta);
    card.appendChild(qText);

    if (current.answer) {
      const ans = document.createElement("div");
      ans.className = "qa-answer";
      ans.textContent = current.answer;
      if (!isRevisionQuestionRevealed(current)) ans.classList.add("hidden");
      card.appendChild(ans);
    }

    revisionSessionEl.appendChild(card);
  }
}

// ---------- PWA service worker ----------

if ("serviceWorker" in navigator) {
  let swRegistration = null;
  let refreshPending = false;
  let hasRefreshed = false;

  const sendSkipWaiting = () => {
    if (!swRegistration?.waiting) return;
    swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
  };

  updateRefreshBtn?.addEventListener("click", () => {
    refreshPending = true;
    sendSkipWaiting();
  });

  updateLaterBtn?.addEventListener("click", () => {
    hideUpdateToast();
  });

  // Update flow: prompt on waiting SW, request skipWaiting, then reload once on controllerchange.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshPending || hasRefreshed) return;
    hasRefreshed = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        swRegistration = registration;

        if (registration.waiting) {
          showUpdateToast();
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateToast();
            }
          });
        });
      })
      .catch((err) => console.warn("SW registration failed", err));
  });
}

// ---------- Init ----------

function init() {
  loadState();
  applyTheme();
  initSettingsScopeControls();
  initLevelButtons();
  showScreen("levels");
}

// ---------- Revision mode switch dialog ----------

function openRevisionSwitchDialog(targetSubMode) {
  pendingRevisionSubMode = targetSubMode;
  revisionSwitchDialog.classList.remove("hidden");
}

function closeRevisionSwitchDialog() {
  pendingRevisionSubMode = null;
  revisionSwitchDialog.classList.add("hidden");
}

revisionSwitchCancelBtn.addEventListener("click", () => {
  closeRevisionSwitchDialog();
});

revisionSwitchConfirmBtn.addEventListener("click", () => {
  if (!pendingRevisionSubMode) {
    closeRevisionSwitchDialog();
    return;
  }

  resetRevisionSession();
  appState.currentRevisionSubMode = pendingRevisionSubMode;
  isRevisionConfigOpen = true;
  saveState();
  closeRevisionSwitchDialog();
  renderCurrentMode();
});

init();
