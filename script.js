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
    { id: "a2-12-s1", text: "ATP is the immediate energy source for cell processes.", objective: "12.1.2" },
    { id: "a2-12-s2", text: "ATP releases small, manageable amounts of energy when hydrolysed.", objective: "12.1.2" },
    { id: "a2-12-s3", text: "ATP is not used for long-term energy storage in cells.", objective: "12.1.2" }
  ], questions: [
    { id: "a2-12-q1", question: "Name the immediate energy source in cells.", answer: "ATP.", objective: "12.1.2" },
    { id: "a2-12-q2", question: "Where in the cell does glycolysis occur?", answer: "In the cytoplasm.", objective: "12.2.1" },
    { id: "a2-12-q3", question: "What happens to ATP when it releases energy?", answer: "It is hydrolysed to ADP and inorganic phosphate (Pi).", objective: "12.1.2" }
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

const CHAPTER_OBJECTIVES = {
  "a2-12": {
    sections: [
      {
        id: "12.1",
        title: "12.1 Energy",
        objectives: [
          { id: "12.1.1", title: "Why organisms need energy" },
          { id: "12.1.2", title: "ATP role" }
        ]
      },
      {
        id: "12.2",
        title: "12.2 Respiration",
        objectives: [
          { id: "12.2.1", title: "Glycolysis" },
          { id: "12.2.2", title: "Link reaction + Krebs" },
          { id: "12.2.3", title: "Oxidative phosphorylation" },
          { id: "12.2.4", title: "Anaerobic respiration (yeast/mammals)" },
          { id: "12.2.5", title: "Respiratory quotient (RQ)" }
        ]
      }
    ]
  },
  "a2-13": {
    sections: [
      {
        id: "13.1",
        title: "13.1 Photosynthesis process",
        objectives: [
          { id: "13.1.1", title: "Chloroplast structure" },
          { id: "13.1.2", title: "Light-dependent stage" },
          { id: "13.1.3", title: "Light-independent stage" }
        ]
      },
      {
        id: "13.2",
        title: "13.2 Investigating environmental factors",
        objectives: [
          { id: "13.2.1", title: "Limiting factors" },
          { id: "13.2.2", title: "Absorption and action spectra" }
        ]
      }
    ]
  },
  "a2-14": {
    sections: [
      {
        id: "14.1",
        title: "14.1 Mammals",
        objectives: [
          { id: "14.1.1", title: "Negative feedback mechanisms" },
          { id: "14.1.2", title: "Kidney + nephron structure" },
          { id: "14.1.3", title: "Ultrafiltration + selective reabsorption" },
          { id: "14.1.4", title: "Osmoregulation (ADH)" },
          { id: "14.1.5", title: "Blood glucose control" }
        ]
      },
      {
        id: "14.2",
        title: "14.2 Plants",
        objectives: [
          { id: "14.2.1", title: "Stomata control (ABA)" }
        ]
      }
    ]
  },
  "a2-15": {
    sections: [
      {
        id: "15.1",
        title: "15.1 Mammals",
        objectives: [
          { id: "15.1.1", title: "Neurones + resting potential" },
          { id: "15.1.2", title: "Action potentials + saltatory conduction" },
          { id: "15.1.3", title: "Synapses (cholinergic)" },
          { id: "15.1.4", title: "Muscle contraction" }
        ]
      },
      {
        id: "15.2",
        title: "15.2 Plants",
        objectives: [
          { id: "15.2.1", title: "Auxin + gibberellin roles" }
        ]
      }
    ]
  }
};

function getObjectivesForChapter(chapterId) {
  return CHAPTER_OBJECTIVES[chapterId] || null;
}

function getObjectiveOrder(chapterId) {
  const config = getObjectivesForChapter(chapterId);
  if (!config) return [];
  return config.sections.flatMap((section) => section.objectives.map((obj) => obj.id));
}

function isObjectiveIdValid(chapterId, objectiveId) {
  if (!objectiveId) return false;
  return getObjectiveOrder(chapterId).includes(objectiveId);
}

function getObjectiveSectionId(chapterId, objectiveId) {
  const config = getObjectivesForChapter(chapterId);
  if (!config) return null;
  const section = config.sections.find((entry) =>
    entry.objectives.some((objective) => objective.id === objectiveId)
  );
  return section?.id || null;
}

function getObjectiveTitle(chapterId, objectiveId) {
  if (!objectiveId) return "";
  const config = getObjectivesForChapter(chapterId);
  if (!config) return "";
  const objective = config.sections.flatMap((section) => section.objectives)
    .find((entry) => entry.id === objectiveId);
  return objective?.title || "";
}

function getNextObjectiveId(chapterId, objectiveId) {
  const order = getObjectiveOrder(chapterId);
  const index = order.indexOf(objectiveId);
  if (index === -1) return null;
  return order[index + 1] || null;
}

function getChapterItemsForObjective(chapter, objectiveId) {
  if (!objectiveId) {
    return {
      storyPoints: chapter.storyPoints,
      questions: chapter.questions
    };
  }
  return {
    storyPoints: chapter.storyPoints.filter((point) => point.objective === objectiveId),
    questions: chapter.questions.filter((question) => question.objective === objectiveId)
  };
}

// ---------- State & persistence ----------

const STORAGE_KEY = "microlearn-bio-state-v1";
const STORAGE_PREFIX = "microlearnBio:";
const LAST_SESSION_KEY = "lastSession";
const STREAK_KEY = "microlearn_streak_v1";

const createDefaultState = () => ({
  theme: "dark",
  currentLevelId: null, // "as" | "a2"
  currentChapterId: null,
  currentMode: "story", // "story" | "questions" | "revision"
  currentObjectiveId: null,
  currentRevisionSubMode: "story",
  chapters: {}, // per-chapter progress
  settingsScopeLevelId: null,
  settingsScopeChapterId: "all"
});

let appState = createDefaultState();
let streakState = null;

// ---------- Streak helpers ----------
function getLocalYYYYMMDD(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultStreak() {
  return {
    current: 0,
    longest: 0,
    lastActiveDate: getLocalYYYYMMDD(),
    todayCounted: false
  };
}

function isValidDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseLocalDate(value) {
  if (!isValidDateString(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDayDiff(fromDate, toDate) {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (!from || !to) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to - from) / msPerDay);
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      streakState = {
        ...createDefaultStreak(),
        ...parsed
      };
    } else {
      streakState = createDefaultStreak();
    }
  } catch (e) {
    console.warn("Could not load streak", e);
    streakState = createDefaultStreak();
  }

  if (!isValidDateString(streakState.lastActiveDate)) {
    streakState.lastActiveDate = getLocalYYYYMMDD();
  }

  if (streakState.lastActiveDate !== getLocalYYYYMMDD()) {
    streakState.todayCounted = false;
  }

  if (typeof streakState.current !== "number" || streakState.current < 0) {
    streakState.current = 0;
  }
  if (typeof streakState.longest !== "number" || streakState.longest < 0) {
    streakState.longest = 0;
  }

  saveStreak();
  return streakState;
}

function saveStreak() {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streakState));
  } catch (e) {
    console.warn("Could not save streak", e);
  }
}

// Testing checklist:
// - New install: streak shows 0
// - Do one activity: becomes 1
// - Do more actions same day: stays 1
// - Next day activity: becomes 2
// - Skip a day then activity: resets to 1
// - Longest updates correctly
// - Works offline
function recordDailyActivity(reason) {
  const streak = streakState || loadStreak();
  const today = getLocalYYYYMMDD();

  if (streak.lastActiveDate !== today) {
    streak.todayCounted = false;
  }

  if (streak.lastActiveDate === today && streak.todayCounted) {
    return;
  }

  if (streak.lastActiveDate === today) {
    streak.current = Math.max(1, streak.current || 0);
  } else {
    const diff = getDayDiff(streak.lastActiveDate, today);
    if (diff === 1) {
      streak.current = (streak.current || 0) + 1;
    } else {
      streak.current = 1;
    }
  }

  streak.longest = Math.max(streak.longest || 0, streak.current);
  streak.lastActiveDate = today;
  streak.todayCounted = true;

  streakState = streak;
  saveStreak();
  updateStreakUI();
  if (reason) {
    // Reserved for analytics/debugging if needed later.
  }
}

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
  if (appState.currentObjectiveId && !isObjectiveIdValid(appState.currentChapterId, appState.currentObjectiveId)) {
    appState.currentObjectiveId = null;
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
  return key === STORAGE_KEY
    || key === LAST_SESSION_KEY
    || key === STREAK_KEY
    || key.startsWith(STORAGE_PREFIX);
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
  appState.currentObjectiveId = null;
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
      lastActiveAt: null,
      objectives: {}
    };
  }
  const chState = appState.chapters[chapterId];
  if (!Array.isArray(chState.revisionStoryIds)) chState.revisionStoryIds = [];
  if (!Array.isArray(chState.revisionQuestionIds)) chState.revisionQuestionIds = [];
  if (!chState.objectives) chState.objectives = {};
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

function ensureObjectiveState(chState, objectiveId) {
  if (!chState.objectives) chState.objectives = {};
  if (!chState.objectives[objectiveId]) {
    chState.objectives[objectiveId] = {
      storyIndex: 0,
      questionIndex: 0,
      revisionStoryIds: [],
      revisionQuestionIds: [],
      lastActiveMode: null,
      lastActiveAt: null
    };
  }
  const objState = chState.objectives[objectiveId];
  if (!Array.isArray(objState.revisionStoryIds)) objState.revisionStoryIds = [];
  if (!Array.isArray(objState.revisionQuestionIds)) objState.revisionQuestionIds = [];
  if (!objState.lastActiveMode) objState.lastActiveMode = null;
  if (!objState.lastActiveAt) objState.lastActiveAt = null;
  return objState;
}

function getActiveObjectiveId(chapterId) {
  const candidate = appState.currentObjectiveId;
  if (!candidate) return null;
  if (!isObjectiveIdValid(chapterId, candidate)) {
    appState.currentObjectiveId = null;
    return null;
  }
  return candidate;
}

function getActiveChapterContext(chapter) {
  const chState = ensureChapterState(chapter.id);
  const objectiveId = getActiveObjectiveId(chapter.id);
  const viewState = objectiveId ? ensureObjectiveState(chState, objectiveId) : chState;
  const items = getChapterItemsForObjective(chapter, objectiveId);
  return {
    chState,
    objectiveId,
    viewState,
    items
  };
}

function recordChapterActivity(chapterId, mode, objectiveId = null) {
  if (!chapterId) return;
  if (mode !== "story" && mode !== "questions") return;
  const chState = ensureChapterState(chapterId);
  if (objectiveId) {
    const objState = ensureObjectiveState(chState, objectiveId);
    objState.lastActiveMode = mode;
    objState.lastActiveAt = Date.now();
    return;
  }
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
    return revisionSubMode === "questions" ? "Focus · Questions" : "Focus · Pills";
  }
  return "Pills";
}

function buildLastSessionPayload(chapter, viewState, objectiveId) {
  if (!chapter || !viewState) return null;
  const baseSession = {
    levelId: appState.currentLevelId,
    chapterId: chapter.id,
    mode: appState.currentMode,
    objectiveId: objectiveId || null,
    storyIndex: viewState.storyIndex || 0,
    questionIndex: viewState.questionIndex || 0,
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
      revealedByIndex: revisionQuestionRevealedByIndex
    }
  };
}

function syncLastSession(chapter, viewState, objectiveId) {
  if (!chapter || !viewState) return;
  if (!appState.currentLevelId || !appState.currentChapterId) return;
  if (!["story", "questions", "revision"].includes(appState.currentMode)) return;
  const payload = buildLastSessionPayload(chapter, viewState, objectiveId);
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
  const objectiveSuffix = isObjectiveIdValid(session.chapterId, session.objectiveId)
    ? ` · ${session.objectiveId}`
    : "";
  resumeSubtitleEl.textContent = `${level.label} · ${chapter.title} · ${getModeLabel(
    session.mode,
    session.revisionSubMode
  )}${objectiveSuffix}`;
  resumeCardEl.classList.remove("hidden");
}

function restoreRevisionSession(chapter, chState, session, objectiveId) {
  if (!session?.revisionSession || appState.currentMode !== "revision") {
    resetRevisionSession();
    return;
  }
  isRevisionConfigOpen = false;
  isSelecting = false;
  selectedIds.clear();
  const queueIds = session.revisionSession.queueIds || [];
  const deck = getRevisionDeck(
    chapter,
    chState,
    appState.currentRevisionSubMode || "story",
    objectiveId
  );
  const deckMap = new Map(deck.map((item) => [item.id, item]));
  const queue = queueIds.map((id) => deckMap.get(id)).filter(Boolean);
  if (queue.length === 0) {
    resetRevisionSession();
    return;
  }

  revisionSessionQueue = queue;
  revisionSessionIndex = Math.min(session.revisionSession.sessionIndex || 0, queue.length);
  const maxQueueIndex = Math.max(queue.length - 1, 0);
  revisionSessionMaxIndex = Math.min(session.revisionSession.sessionMaxIndex || 0, maxQueueIndex);
  revisionPointIndex = Math.min(session.revisionSession.pointIndex || 0, queue.length);
  revisionPointMaxIndex = Math.min(session.revisionSession.pointMaxIndex || 0, queue.length);
  const revealedByIndex = Array.isArray(session.revisionSession.revealedByIndex)
    ? session.revisionSession.revealedByIndex
    : null;
  if (revealedByIndex) {
    revisionQuestionRevealedByIndex = revealedByIndex.slice(0, queue.length);
    if (revisionQuestionRevealedByIndex.length < queue.length) {
      revisionQuestionRevealedByIndex = revisionQuestionRevealedByIndex.concat(
        new Array(queue.length - revisionQuestionRevealedByIndex.length).fill(false)
      );
    }
  } else if (session.revisionSession.revealedById) {
    const revealedById = session.revisionSession.revealedById;
    revisionQuestionRevealedByIndex = queue.map((item) => Boolean(revealedById[item.id]));
  } else {
    revisionQuestionRevealedByIndex = new Array(queue.length).fill(false);
  }
  isRevisionSessionActive = true;
}

function applyResumeSession(session) {
  if (!isValidSession(session)) return;
  appState.currentLevelId = session.levelId;
  appState.currentChapterId = session.chapterId;
  appState.currentMode = session.mode || "story";
  appState.currentRevisionSubMode = session.revisionSubMode || "story";
  appState.currentObjectiveId = isObjectiveIdValid(session.chapterId, session.objectiveId)
    ? session.objectiveId
    : null;

  const chapter = getChapter(session.levelId, session.chapterId);
  const chState = ensureChapterState(session.chapterId);
  const objectiveId = getActiveObjectiveId(session.chapterId);
  const items = getChapterItemsForObjective(chapter, objectiveId);
  const totalStory = items.storyPoints.length;
  const totalQuestions = items.questions.length;
  const viewState = objectiveId ? ensureObjectiveState(chState, objectiveId) : chState;
  if (typeof session.storyIndex === "number") {
    viewState.storyIndex = Math.max(0, Math.min(session.storyIndex, totalStory));
  }
  if (typeof session.questionIndex === "number") {
    viewState.questionIndex = Math.max(0, Math.min(session.questionIndex, totalQuestions));
  }

  if (appState.currentMode === "revision") {
    restoreRevisionSession(chapter, chState, session, objectiveId);
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
const screenObjectives = qs("#screenObjectives");
const screenChapter = qs("#screenChapter");
const chaptersListEl = qs("#chaptersList");
const objectivesListEl = qs("#objectivesList");
const objectivesContinueBtn = qs("#objectivesContinue");

const headerTitleEl = qs("#headerTitle");
const headerSubtitleEl = qs("#headerSubtitle");
const backButton = qs("#backButton");
const streakChipBtn = qs("#streakChip");
const streakChipCountEl = qs("#streakChipCount");
const streakSheetChipEl = qs("#streakSheetChip");
const streakSheetCountEl = qs("#streakSheetCount");
const streakSheet = qs("#streakSheet");
const streakCurrentValueEl = qs("#streakCurrentValue");
const streakLongestValueEl = qs("#streakLongestValue");
const streakLastValueEl = qs("#streakLastValue");
const streakDotsEl = qs("#streakDots");

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
const revisionActionButtonsEl = qs("#revisionActionButtons");
const revisionSelectionBannerEl = qs("#revisionSelectionBanner");
const revisionSelectionBarEl = qs("#revisionSelectionBar");
const revisionSelectedCountEl = qs("#revisionSelectedCount");
const revisionSelectAllBtn = qs("#revisionSelectAll");
const revisionClearSelectionBtn = qs("#revisionClearSelection");
const revisionSelectionCtaEl = qs("#revisionSelectionCta");
const revisionSelectionCancelBtn = qs("#revisionSelectionCancel");
const revisionSelectionStartBtn = qs("#revisionSelectionStart");
const revisionHelperTextEl = qs("#revisionHelperText");
const revisionCountOptionsEl = qs("#revisionCountOptions");
const revisionOrderOptionsEl = qs("#revisionOrderOptions");
const revisionConfigStartBtn = qs("#revisionConfigStart");
const revisionConfigCancelBtn = qs("#revisionConfigCancel");
const revisionConfigCloseBtn = qs("#revisionConfigClose");

const themeToggleBtn = qs("#themeToggle");
const appEl = document.querySelector(".app");
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

function getFlameIconSVG() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12.1 2.8c1.8 2.7 2.1 4.8 1.6 6.8-.4 1.5-1.3 2.7-2.4 3.7-1.2 1.1-2 2.4-2 4.2 0 2.7 2.1 4.9 4.7 4.9s4.7-2.2 4.7-4.9c0-3.3-2.2-5.3-4.1-7.4-1.1-1.3-1.9-2.6-2.5-4.3z"></path>
      <path d="M9.4 12.7c-1.3 1.2-2.1 2.6-2.1 4.6 0 2.3 1.7 4.3 3.9 4.7"></path>
    </svg>
  `;
}

function applyStreakIcons() {
  const iconMarkup = getFlameIconSVG();
  [streakChipBtn, streakSheetChipEl].forEach((chip) => {
    const iconEl = chip?.querySelector(".streak-chip__icon");
    if (iconEl) {
      iconEl.innerHTML = iconMarkup;
    }
  });
}

applyStreakIcons();

// Question mode UI state (not persisted)
let questionRevealed = false;
let currentAnswerEl = null;

// Revision session state (not persisted)
let isRevisionSessionActive = false;
let revisionSessionQueue = [];
let revisionSessionIndex = 0;
let isRevisionConfigOpen = false;
let focusCountChoice = null;
let focusLastStandardCount = "all";
let focusOrderChoice = "random";
let pendingRevisionSubMode = null;
let isSelecting = false;
let selectedIds = new Set();
let revisionQuestionRevealedByIndex = [];
let revisionSessionMaxIndex = 0;
let revisionPointIndex = 0;
let revisionPointMaxIndex = 0;
let revisionUiMode = "idle"; // idle | setup | selecting | session
let isFocusSession = false;
let focusSessionHeaderMode = "expanded";
let isFocusSessionTapBound = false;
let focusSessionTapStart = null;
let focusContinueToastAt = 0;
const focusTapHintEl = qs("#focusTapHint");
const focusTapHintDismissBtn = qs("#focusTapHintDismiss");
const focusTapHintSubtitleEl = qs("#focusTapHintSubtitle");
const FOCUS_TAP_HINT_KEY = "focusTipSeen_questions";

const revisionDebug = false;
function logRevisionDebug(message, detail = {}) {
  if (!revisionDebug) return;
  console.log(`[revision] ${message}`, detail);
}

function setRevisionUiMode(mode) {
  // Previously setup/selecting flags could drift independently, causing Start session to no-op.
  revisionUiMode = mode;
  isRevisionConfigOpen = mode === "setup";
  isSelecting = mode === "selecting";
  isRevisionSessionActive = mode === "session";
  syncFocusSessionHeaderState();
}

const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateFocusSessionHeaderClasses() {
  if (!appEl) return;
  if (!isFocusSession) {
    appEl.classList.remove("focus-session--active", "focus-session--header-expanded");
    console.log("[focus-session] header classes cleared");
    return;
  }

  appEl.classList.add("focus-session--active");
  appEl.classList.remove("focus-session--header-expanded");
  console.log("[focus-session] header classes updated", {
    mode: focusSessionHeaderMode,
    expanded: false
  });
}

function handleFocusSessionScroll() {
  if (!isFocusSession) return;
  focusSessionHeaderMode = "compact";
  updateFocusSessionHeaderClasses();
}

function setFocusSessionActive(active) {
  if (isFocusSession === active) return;
  isFocusSession = active;
  if (active) {
    focusSessionHeaderMode = "compact";
    updateFocusSessionHeaderClasses();
    maybeShowFocusTapHint();
    syncFocusSessionTapHandlers();
    handleFocusSessionScroll();
    console.log("[focus-session] session active");
  } else {
    updateFocusSessionHeaderClasses();
    hideFocusTapHint(isFocusTapHintVisible());
    syncFocusSessionTapHandlers();
    console.log("[focus-session] session inactive");
  }
}

function syncFocusSessionHeaderState() {
  const shouldBeActive = !screenChapter.classList.contains("hidden")
    && appState.currentMode === "revision"
    && isRevisionSessionActive;
  setFocusSessionActive(shouldBeActive);
}

function isFocusTapHintVisible() {
  if (!focusTapHintEl) return false;
  return !focusTapHintEl.classList.contains("hidden");
}

function hideFocusTapHint(markSeen = true) {
  if (!focusTapHintEl) return;
  focusTapHintEl.classList.remove("focus-tap-hint--show");
  focusTapHintEl.classList.add("hidden");
  if (markSeen) {
    localStorage.setItem(FOCUS_TAP_HINT_KEY, "1");
  }
  syncFocusSessionTapHandlers();
}

function getFocusContinueMessage() {
  if (appState.currentRevisionSubMode === "story") {
    return "Use OK to continue.";
  }
  if (appState.currentRevisionSubMode === "questions") {
    const isRevealed = isRevisionQuestionRevealed(revisionSessionIndex);
    return isRevealed ? "Use Next to continue." : "Use Reveal to continue.";
  }
  return "Use Next to continue.";
}

function updateFocusTapHintContent() {
  if (!focusTapHintSubtitleEl) return;
  if (appState.currentRevisionSubMode !== "questions") return;
  focusTapHintSubtitleEl.textContent = getFocusContinueMessage();
}

function showFocusTapHint() {
  if (!focusTapHintEl) return;
  focusTapHintEl.classList.remove("hidden");
  focusTapHintEl.classList.add("focus-tap-hint--show");
  updateFocusTapHintContent();
  syncFocusSessionTapHandlers();
}

function maybeShowFocusTapHint() {
  if (!focusTapHintEl) return;
  if (appState.currentRevisionSubMode !== "questions") {
    if (isFocusTapHintVisible()) hideFocusTapHint(false);
    return;
  }
  if (localStorage.getItem(FOCUS_TAP_HINT_KEY) === "1") return;
  if (!isFocusTapHintVisible()) {
    showFocusTapHint();
  }
}

function handleFocusSessionPointerDown(event) {
  if (!isFocusSession || !isRevisionSessionActive) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  focusSessionTapStart = { x: event.clientX, y: event.clientY, time: event.timeStamp };
}

function clearFocusSessionTapStart() {
  focusSessionTapStart = null;
}

function advanceRevisionQuestion() {
  const total = revisionSessionQueue.length;
  if (revisionSessionIndex >= total) return;
  revisionSessionIndex += 1;
  revisionSessionMaxIndex = Math.max(
    revisionSessionMaxIndex,
    Math.min(revisionSessionIndex, total - 1)
  );
  recordDailyActivity("revision-next");
  renderCurrentMode();
}

function handleFocusSessionTap(event) {
  if (!isRevisionSessionActive) return;
  if (isFocusTapHintVisible()) return;
  if (!focusSessionTapStart) return;

  const tapStart = focusSessionTapStart;
  focusSessionTapStart = null;

  const target = event.target;
  if (target.closest("button, a, input, textarea, [role=\"button\"], .session-footer, .action-dock, .revision-session-actions")) {
    return;
  }

  const distanceX = event.clientX - tapStart.x;
  const distanceY = event.clientY - tapStart.y;
  const distance = Math.hypot(distanceX, distanceY);
  const duration = event.timeStamp - tapStart.time;
  if (duration > 350 || distance > 10) {
    return;
  }

  const viewportWidth = window.innerWidth;
  const x = event.clientX;
  if (!viewportWidth || Number.isNaN(x)) return;

  const leftZone = viewportWidth * 0.33;
  const rightZone = viewportWidth * 0.67;

  if (x <= leftZone) {
    handleFocusSessionBrowse(-1);
  } else if (x >= rightZone) {
    handleFocusSessionBrowse(1);
  }
}

function syncFocusSessionTapHandlers() {
  const shouldEnable = isFocusSession && isRevisionSessionActive && !isFocusTapHintVisible();
  if (shouldEnable && !isFocusSessionTapBound) {
    document.addEventListener("pointerdown", handleFocusSessionPointerDown, { capture: true, passive: true });
    document.addEventListener("pointerup", handleFocusSessionTap, { capture: true, passive: true });
    document.addEventListener("pointercancel", clearFocusSessionTapStart, { capture: true, passive: true });
    isFocusSessionTapBound = true;
  } else if (!shouldEnable && isFocusSessionTapBound) {
    document.removeEventListener("pointerdown", handleFocusSessionPointerDown, { capture: true });
    document.removeEventListener("pointerup", handleFocusSessionTap, { capture: true });
    document.removeEventListener("pointercancel", clearFocusSessionTapStart, { capture: true });
    isFocusSessionTapBound = false;
  }
}

focusTapHintDismissBtn?.addEventListener("click", () => {
  hideFocusTapHint(true);
});

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

function showFocusContinueToast() {
  const now = Date.now();
  if (now - focusContinueToastAt < 2000) return;
  focusContinueToastAt = now;
  showToast(getFocusContinueMessage());
}

function getLastStudiedLabel(streak) {
  const today = getLocalYYYYMMDD();
  const yesterday = getLocalYYYYMMDD(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (streak.lastActiveDate === today) return "Today";
  if (streak.lastActiveDate === yesterday) return "Yesterday";
  return streak.lastActiveDate;
}

function updateStreakDots(streak) {
  if (!streakDotsEl) return;
  const dots = Array.from(streakDotsEl.querySelectorAll(".streak-dot"));
  const today = getLocalYYYYMMDD();
  const yesterday = getLocalYYYYMMDD(new Date(Date.now() - 24 * 60 * 60 * 1000));
  let activeCount = 0;
  if (streak.lastActiveDate === today || streak.lastActiveDate === yesterday) {
    activeCount = Math.min(7, streak.current || 0);
  }

  dots.forEach((dot, index) => {
    const shouldActivate = activeCount > 0 && index >= dots.length - activeCount;
    dot.classList.toggle("is-active", shouldActivate);
  });
}

function updateStreakUI() {
  const streak = streakState || loadStreak();
  if (!streak) return;
  const isActive = (streak.current || 0) > 0;

  streakChipBtn?.classList.toggle("is-active", isActive);
  streakSheetChipEl?.classList.toggle("is-active", isActive);

  if (streakChipCountEl) {
    streakChipCountEl.textContent = String(streak.current || 0);
  }
  if (streakSheetCountEl) {
    streakSheetCountEl.textContent = String(streak.current || 0);
  }
  if (streakCurrentValueEl) {
    const currentLabel = streak.current === 1 ? "day" : "days";
    streakCurrentValueEl.textContent = `${streak.current} ${currentLabel}`;
  }
  if (streakLongestValueEl) {
    const longestLabel = streak.longest === 1 ? "day" : "days";
    streakLongestValueEl.textContent = `${streak.longest} ${longestLabel}`;
  }
  if (streakLastValueEl) {
    streakLastValueEl.textContent = getLastStudiedLabel(streak);
  }

  updateStreakDots(streak);
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
  setRevisionUiMode("idle");
  selectedIds.clear();
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

  if (!screenObjectives.classList.contains("hidden")) {
    if (appState.currentLevelId && appState.currentChapterId) {
      renderObjectives();
      showScreen("objectives");
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
  closeBottomSheet(streakSheet);
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

  [levelSheet, chapterSheet, streakSheet].forEach((sheet) => {
    if (!sheet) return;
    sheet.addEventListener("click", (event) => {
      if (event.target.matches("[data-sheet-close]")) {
        closeBottomSheet(sheet);
      }
    });
  });
}

streakChipBtn?.addEventListener("click", () => {
  updateStreakUI();
  openBottomSheet(streakSheet);
});

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
      ? "Pills"
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
  screenObjectives.classList.add("hidden");
  screenChapter.classList.add("hidden");

  // Header layout variant
  appHeaderEl.classList.remove("header--home");
  appHeaderEl.classList.remove("header--chapter");
  appHeaderEl.classList.remove("header--list");
  appHeaderEl.classList.remove("header--objectives");
  themeToggleBtn.classList.remove("hidden");

  if (name === "levels") {
    screenLevels.classList.remove("hidden");
    backButton.classList.add("hidden");
    settingsButton.classList.remove("hidden");
    headerSubtitleEl.textContent = "";
    headerTitleEl.textContent = "";
    appHeaderEl.classList.add("header--home");
    streakChipBtn?.classList.remove("hidden");
    renderResumeCard();
  } else if (name === "chapters") {
    screenChapters.classList.remove("hidden");
    appHeaderEl.classList.add("header--list");
    backButton.classList.remove("hidden");
    settingsButton.classList.add("hidden");
    streakChipBtn?.classList.add("hidden");
    headerTitleEl.textContent = DATA[appState.currentLevelId].label;
    headerSubtitleEl.textContent = "Choose a chapter";
  } else if (name === "objectives") {
    screenObjectives.classList.remove("hidden");
    appHeaderEl.classList.add("header--objectives");
    backButton.classList.remove("hidden");
    settingsButton.classList.add("hidden");
    streakChipBtn?.classList.add("hidden");
    const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
    headerTitleEl.textContent = "Objectives";
    headerSubtitleEl.textContent = chapter ? chapter.title : "";
  } else if (name === "chapter") {
    screenChapter.classList.remove("hidden");
    appHeaderEl.classList.add("header--chapter");
    backButton.classList.remove("hidden");
    settingsButton.classList.add("hidden");
    streakChipBtn?.classList.add("hidden");
    const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
    headerTitleEl.textContent = chapter.title;
    if (!chapter) {
      headerSubtitleEl.textContent = "";
    } else {
      const objectiveId = getActiveObjectiveId(chapter.id);
      if (objectiveId) {
        const objectiveTitle = getObjectiveTitle(chapter.id, objectiveId);
        headerSubtitleEl.textContent = [objectiveId, objectiveTitle].filter(Boolean).join(" ");
      } else {
        headerSubtitleEl.textContent = "";
      }
    }
  }

  updateStreakUI();
  syncFocusSessionHeaderState();
}

backButton.addEventListener("click", () => {
  if (!screenChapter.classList.contains("hidden")) {
    if (getObjectivesForChapter(appState.currentChapterId)) {
      renderObjectives();
      showScreen("objectives");
    } else {
      showScreen("chapters");
    }
    return;
  }

  if (!screenObjectives.classList.contains("hidden")) {
    showScreen("chapters");
    return;
  }

  if (!screenChapters.classList.contains("hidden")) {
    showScreen("levels");
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
            <span class="chapter-chip">Pills · ${progress.totalStory} · ${progress.storyPct}%</span>
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
      appState.currentObjectiveId = null;
      appState.currentMode = modeOverride || resumeMode || appState.currentMode || "story";
      saveState();

      if (getObjectivesForChapter(chapter.id)) {
        renderObjectives();
        showScreen("objectives");
        return;
      }

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

function getObjectiveProgress(chapter, chState, objectiveId) {
  const items = getChapterItemsForObjective(chapter, objectiveId);
  const totalStory = items.storyPoints.length;
  const totalQ = items.questions.length;
  const objState = ensureObjectiveState(chState, objectiveId);
  const storyDone = Math.min(objState.storyIndex || 0, totalStory);
  const questionDone = Math.min(objState.questionIndex || 0, totalQ);
  const hasContent = totalStory + totalQ > 0;
  return {
    totalStory,
    totalQ,
    storyDone,
    questionDone,
    isComplete: hasContent && storyDone >= totalStory && questionDone >= totalQ
  };
}

function getAutoOpenObjectiveSection(chapter, chState) {
  const config = getObjectivesForChapter(chapter.id);
  if (!config) return null;

  const session = loadLastSession();
  if (session?.chapterId === chapter.id && isObjectiveIdValid(chapter.id, session.objectiveId)) {
    return getObjectiveSectionId(chapter.id, session.objectiveId);
  }

  const section = config.sections.find((entry) =>
    entry.objectives.some((objective) => !getObjectiveProgress(chapter, chState, objective.id).isComplete)
  );
  return section?.id || config.sections[0]?.id || null;
}

function openObjective(chapter, objectiveId) {
  appState.currentChapterId = chapter.id;
  appState.currentObjectiveId = objectiveId;
  const chState = ensureChapterState(chapter.id);
  const progress = getObjectiveProgress(chapter, chState, objectiveId);
  const resumeMode = getResumeMode(progress, ensureObjectiveState(chState, objectiveId)) || "story";
  appState.currentMode = resumeMode;
  saveState();
  showScreen("chapter");
  setActiveMode(appState.currentMode);
  requestAnimationFrame(scrollToLatestContent);
}

function openFullChapter(chapter) {
  appState.currentChapterId = chapter.id;
  appState.currentObjectiveId = null;
  const chState = ensureChapterState(chapter.id);
  const progress = getChapterProgress(chapter, chState);
  const resumeMode = getResumeMode(progress, chState) || "story";
  appState.currentMode = resumeMode;
  saveState();
  showScreen("chapter");
  setActiveMode(appState.currentMode);
  requestAnimationFrame(scrollToLatestContent);
}

function renderObjectives() {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const config = chapter ? getObjectivesForChapter(chapter.id) : null;
  if (!objectivesListEl || !objectivesContinueBtn || !chapter || !config) return;

  const chState = ensureChapterState(chapter.id);
  const autoOpenSectionId = getAutoOpenObjectiveSection(chapter, chState);

  objectivesListEl.innerHTML = "";
  config.sections.forEach((section) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "card objective-section";

    const totalObjectives = section.objectives.length;
    const completedObjectives = section.objectives.filter((objective) =>
      getObjectiveProgress(chapter, chState, objective.id).isComplete
    ).length;
    const sectionDone = totalObjectives > 0 && completedObjectives === totalObjectives;
    const sectionProgressLabel = sectionDone ? "Done" : `${completedObjectives}/${totalObjectives}`;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "objective-section__toggle";
    toggle.setAttribute("aria-expanded", section.id === autoOpenSectionId ? "true" : "false");
    toggle.innerHTML = `
      <span class="objective-section__title">${section.title}</span>
      <span class="objective-section__meta">
        <span class="objective-section__progress${sectionDone ? " is-complete" : ""}">${sectionProgressLabel}</span>
        <span class="objective-section__chevron" aria-hidden="true">›</span>
      </span>
    `;

    const list = document.createElement("div");
    list.className = "objective-items";
    if (section.id !== autoOpenSectionId) {
      list.classList.add("hidden");
    } else {
      sectionEl.classList.add("is-open");
    }

    toggle.addEventListener("click", () => {
      const isOpen = sectionEl.classList.toggle("is-open");
      list.classList.toggle("hidden", !isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    section.objectives.forEach((objective) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "objective-item";
      item.innerHTML = `
        <span class="objective-item__label">${objective.id} ${objective.title}</span>
        <span class="objective-item__chevron" aria-hidden="true">›</span>
      `;
      item.addEventListener("click", () => {
        openObjective(chapter, objective.id);
      });
      list.appendChild(item);
    });

    sectionEl.appendChild(toggle);
    sectionEl.appendChild(list);
    objectivesListEl.appendChild(sectionEl);
  });

  objectivesContinueBtn.onclick = () => {
    openFullChapter(chapter);
  };
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
    recordChapterActivity(appState.currentChapterId, mode, getActiveObjectiveId(appState.currentChapterId));
    saveState();
  }

  // reset per-mode UI state
  if (mode !== "questions") {
    questionRevealed = false;
    currentAnswerEl = null;
  }
  if (mode !== "revision") {
    resetRevisionSession();
    setRevisionUiMode("idle");
    selectedIds.clear();
    focusCountChoice = null;
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
    setRevisionUiMode("idle");
    selectedIds.clear();
    focusCountChoice = null;
    saveState();
    renderCurrentMode();
  });
});

revisionStartBtn.addEventListener("click", () => {
  if (revisionStartBtn.disabled || revisionUiMode === "setup") return;
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const chState = chapter ? ensureChapterState(chapter.id) : null;
  const objectiveId = chapter ? getActiveObjectiveId(chapter.id) : null;
  const deckSize = chapter
    ? getRevisionDeck(chapter, chState, appState.currentRevisionSubMode, objectiveId).length
    : 0;
  focusCountChoice = deckSize >= 10 ? "10" : "all";
  focusLastStandardCount = focusCountChoice;
  setRevisionUiMode("setup");
  renderCurrentMode();
});

revisionSelectAllBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);
  const objectiveId = getActiveObjectiveId(chapter.id);
  const deck = getRevisionDeck(chapter, chState, appState.currentRevisionSubMode, objectiveId);
  selectedIds = new Set(deck.map((item) => item.id));
  renderCurrentMode();
});

revisionClearSelectionBtn.addEventListener("click", () => {
  selectedIds.clear();
  renderCurrentMode();
});

revisionConfigCancelBtn.addEventListener("click", () => {
  setRevisionUiMode("idle");
  renderCurrentMode();
});

revisionConfigCloseBtn.addEventListener("click", () => {
  setRevisionUiMode("idle");
  renderCurrentMode();
});

revisionConfigStartBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);
  const objectiveId = getActiveObjectiveId(chapter.id);
  if (focusCountChoice === "select") {
    setRevisionUiMode("selecting");
    selectedIds.clear();
    logRevisionDebug("enter selecting mode", { mode: revisionUiMode });
    renderCurrentMode();
    return;
  }
  const deck = getRevisionDeck(chapter, chState, appState.currentRevisionSubMode, objectiveId);
  const sessionItems = getRevisionItemsForCount(deck, focusCountChoice, focusOrderChoice);
  logRevisionDebug("start session from setup", {
    mode: revisionUiMode,
    order: focusOrderChoice,
    items: sessionItems.length
  });
  startReviewSession({
    chapter,
    chState,
    objectiveId,
    items: sessionItems.map((item) => item.id),
    order: focusOrderChoice,
    source: "saved"
  });
});

revisionCountOptionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn || btn.disabled) return;
  const countChoice = btn.dataset.count;
  focusCountChoice = countChoice;
  if (countChoice !== "select") {
    focusLastStandardCount = countChoice;
  }
  renderCurrentMode();
});

revisionOrderOptionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".segmented__btn");
  if (!btn) return;
  focusOrderChoice = btn.dataset.order;
  renderCurrentMode();
});

revisionSelectionCancelBtn.addEventListener("click", () => {
  setRevisionUiMode("idle");
  selectedIds.clear();
  renderCurrentMode();
});

revisionSelectionStartBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const chState = ensureChapterState(chapter.id);
  const objectiveId = getActiveObjectiveId(chapter.id);
  if (selectedIds.size === 0) {
    showToast("Select at least 1 item");
    return;
  }
  const deck = getRevisionDeck(chapter, chState, appState.currentRevisionSubMode, objectiveId);
  const sessionItems = getRevisionItemsForSelection(deck, selectedIds, focusOrderChoice);
  logRevisionDebug("start session from selection", {
    mode: revisionUiMode,
    order: focusOrderChoice,
    items: sessionItems.length
  });
  startReviewSession({
    chapter,
    chState,
    objectiveId,
    items: sessionItems.map((item) => item.id),
    order: focusOrderChoice,
    source: "saved"
  });
});

function renderCurrentMode() {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  const {
    chState,
    objectiveId,
    viewState,
    items
  } = getActiveChapterContext(chapter);

  if (appState.currentMode === "story") {
    const total = items.storyPoints.length;

    // Auto-show the first point so you land on 1/total
    if (viewState.storyIndex === 0 && total > 0) {
      viewState.storyIndex = 1;
      saveState();
    }

    const shown = Math.min(viewState.storyIndex, total);
    updateProgress(shown, total);
    renderStoryMode(chapter, viewState, objectiveId, items.storyPoints);
  } else if (appState.currentMode === "questions") {
    const total = items.questions.length;
    const current = total === 0 ? 0 : Math.min(viewState.questionIndex + 1, total);
    updateProgress(current, total);
    renderQuestionMode(chapter, viewState, objectiveId, items.questions);
  } else if (appState.currentMode === "revision") {
    renderRevisionMode(chapter, chState, objectiveId);
  }

  syncActionDock(chapter, chState, objectiveId, viewState, items);
  syncLastSession(chapter, viewState, objectiveId);
  syncFocusSessionHeaderState();
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

function syncActionDock(chapter, chState, objectiveId, viewState, items) {
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
      const isRevealed = isRevisionQuestionRevealed(revisionSessionIndex);
      const disableNext = !isRevealed;
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
  setLeftButton({ label: "Add to Focus", shape: "circle", useIcon: true });

  if (mode === "story") {
    const total = items.storyPoints.length;
    const done = viewState.storyIndex >= total;
    if (total === 0 || done) {
      actionDock.classList.add("hidden");
      return;
    }

    setRightButton({ label: "OK", shape: "circle", disabled: false });
  }

  if (mode === "questions") {
    const total = items.questions.length;
    const finished = total === 0 || viewState.questionIndex >= total;

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
  const { chState, objectiveId, viewState, items } = getActiveChapterContext(chapter);

  if (appState.currentMode === "story") {
    markCurrentStoryRevision(chapter, viewState, items.storyPoints);
  } else if (appState.currentMode === "questions") {
    markCurrentQuestionRevision(chapter, viewState, items.questions);
  } else if (appState.currentMode === "revision" && isRevisionSessionActive) {
    resetRevisionSession();
    setRevisionUiMode("idle");
    renderCurrentMode();
  }
});

actionRightBtn.addEventListener("click", () => {
  const chapter = getChapter(appState.currentLevelId, appState.currentChapterId);
  if (!chapter) return;
  const { objectiveId, viewState, items } = getActiveChapterContext(chapter);

  if (appState.currentMode === "story") {
    advanceStory(chapter, viewState, objectiveId, items.storyPoints);
  } else if (appState.currentMode === "questions") {
    handleQuestionPrimary(chapter, viewState, objectiveId, items.questions);
  } else if (appState.currentMode === "revision") {
    handlePrimaryAction();
  }
});

// ---------- Story mode ----------

function renderStoryMode(chapter, viewState, objectiveId, storyPoints) {
  const total = storyPoints.length;

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

  const countToShow = Math.min(viewState.storyIndex, total);
  const visible = storyPoints.slice(0, countToShow);

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

  if (viewState.storyIndex >= total) {
    feed.appendChild(createEndOfSetCard({
      levelId: appState.currentLevelId,
      chapterId: chapter.id,
      mode: "story",
      objectiveId
    }));
  }

  // auto scroll to latest bubble
  requestAnimationFrame(scrollToLatestContent);
}


function advanceStory(chapter, viewState, objectiveId, storyPoints) {
  const total = storyPoints.length;
  if (total === 0) return;

  if (viewState.storyIndex < total) {
    viewState.storyIndex += 1;
    recordChapterActivity(chapter.id, "story", objectiveId);
    recordDailyActivity("story-ok");
    saveState();
    renderCurrentMode();
  } else {
    showToast("End of pills");
  }
}

function markCurrentStoryRevision(chapter, viewState, storyPoints) {
  const idx = Math.max(viewState.storyIndex - 1, 0);
  const point = storyPoints[idx];
  if (!point) return;

  const chState = ensureChapterState(chapter.id);
  if (!chState.revisionStoryIds.includes(point.id)) {
    chState.revisionStoryIds.push(point.id);
    saveState();
    showToast("Saved to Focus");
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

function renderQuestionMode(chapter, viewState, objectiveId, questions) {
  const wrapper = document.createElement("div");
  wrapper.className = "qa-wrapper";

  const total = questions.length;

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

  const completedCount = Math.min(viewState.questionIndex, total);

  for (let i = 0; i < completedCount; i++) {
    const q = questions[i];
    wrapper.appendChild(makeQuestionCard(q, i, true));
  }

  if (viewState.questionIndex < total) {
    const q = questions[viewState.questionIndex];
    wrapper.appendChild(makeQuestionCard(q, viewState.questionIndex, false));
  } else {
    wrapper.appendChild(createEndOfSetCard({
      levelId: appState.currentLevelId,
      chapterId: chapter.id,
      mode: "questions",
      objectiveId
    }));
  }

  questionAreaEl.innerHTML = "";
  questionAreaEl.appendChild(wrapper);

  requestAnimationFrame(scrollToLatestContent);
}

function createEndOfSetCard({ levelId, chapterId, mode, objectiveId }) {
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
  const nextObjectiveId = objectiveId ? getNextObjectiveId(chapterId, objectiveId) : null;
  const actions = document.createElement("div");
  actions.className = "end-card-actions";

  const revisionBtn = document.createElement("button");
  revisionBtn.className = "btn btn--ghost btn--small";
  revisionBtn.type = "button";
  revisionBtn.textContent = "Review options";
  revisionBtn.addEventListener("click", () => {
    appState.currentRevisionSubMode = mode === "questions" ? "questions" : "story";
    setActiveMode("revision");
    saveState();
  });

  if (nextObjectiveId) {
    const nextObjectiveBtn = document.createElement("button");
    nextObjectiveBtn.className = "btn";
    nextObjectiveBtn.type = "button";
    const nextObjectiveTitle = getObjectiveTitle(chapterId, nextObjectiveId);
    nextObjectiveBtn.textContent = nextObjectiveTitle
      ? `Next: ${nextObjectiveId} ${nextObjectiveTitle} →`
      : `Next: ${nextObjectiveId} →`;
    nextObjectiveBtn.addEventListener("click", () => {
      appState.currentObjectiveId = nextObjectiveId;
      appState.currentMode = mode;
      saveState();
      showScreen("chapter");
      setActiveMode(mode);
    });

    const backBtn = document.createElement("button");
    backBtn.className = "btn btn--ghost btn--small";
    backBtn.type = "button";
    backBtn.textContent = "Back to chapters";
    backBtn.addEventListener("click", () => {
      showScreen("chapters");
    });

    actions.appendChild(nextObjectiveBtn);
    actions.appendChild(revisionBtn);
    actions.appendChild(backBtn);
  } else if (nextChapter) {
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


function handleQuestionPrimary(chapter, viewState, objectiveId, questions) {
  const total = questions.length;
  if (total === 0 || viewState.questionIndex >= total) return;

  if (!questionRevealed) {
    questionRevealed = true;
    if (currentAnswerEl) currentAnswerEl.classList.remove("hidden");
    recordDailyActivity("question-reveal");
    const {
      chState,
      objectiveId: activeObjectiveId,
      viewState: activeViewState,
      items
    } = getActiveChapterContext(chapter);
    syncActionDock(chapter, chState, activeObjectiveId, activeViewState, items);
    return;
  }

  // revealed -> Next
  advanceQuestion(chapter, viewState, objectiveId, questions);
}

function advanceQuestion(chapter, viewState, objectiveId, questions) {
  const total = questions.length;
  if (viewState.questionIndex < total) {
    viewState.questionIndex += 1;
  }
  recordChapterActivity(chapter.id, "questions", objectiveId);
  recordDailyActivity("question-next");
  saveState();
  renderCurrentMode();
}

function markCurrentQuestionRevision(chapter, viewState, questions) {
  const total = questions.length;
  if (total === 0 || viewState.questionIndex >= total) return;

  const idx = Math.min(viewState.questionIndex, total - 1);
  const q = questions[idx];

  const chState = ensureChapterState(chapter.id);
  if (!chState.revisionQuestionIds.includes(q.id)) {
    chState.revisionQuestionIds.push(q.id);
    saveState();
    showToast("Saved to Focus");
  } else {
    showToast("Already saved");
  }
}

// ---------- Revision mode ----------

function resetRevisionSession() {
  isRevisionSessionActive = false;
  revisionSessionQueue = [];
  revisionSessionIndex = 0;
  revisionQuestionRevealedByIndex = [];
  revisionSessionMaxIndex = 0;
  revisionPointIndex = 0;
  revisionPointMaxIndex = 0;
  console.log("[focus-session] end");
  syncFocusSessionHeaderState();
}

function getRevisionDeck(chapter, chState, subMode, objectiveId = null) {
  if (subMode === "questions") {
    const qMap = new Map(chapter.questions.map((q) => [q.id, q]));
    return chState.revisionQuestionIds
      .map((id) => qMap.get(id))
      .filter((q) => q && (!objectiveId || q.objective === objectiveId))
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
    .filter((p) => p && (!objectiveId || p.objective === objectiveId))
    .map((p) => ({
      id: p.id,
      kind: "story",
      label: "Pill",
      text: p.text
    }));
}

function getCurrentRevisionItem() {
  if (!isRevisionSessionActive) return null;
  return revisionSessionQueue[revisionSessionIndex] || null;
}

function isRevisionQuestionRevealed(index) {
  return Boolean(revisionQuestionRevealedByIndex[index]);
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
  if (!isSelecting) {
    revisionSelectedCountEl.textContent = "0 selected";
    revisionSelectAllBtn.disabled = true;
    revisionClearSelectionBtn.disabled = true;
    revisionSelectionStartBtn.disabled = true;
    return;
  }
  const selectedCount = selectedIds.size;
  revisionSelectedCountEl.textContent = `${selectedCount} selected`;
  revisionSelectAllBtn.disabled = deckSize === 0 || selectedCount === deckSize;
  revisionClearSelectionBtn.disabled = selectedCount === 0;
  revisionSelectionStartBtn.disabled = deckSize === 0 || selectedCount === 0;
}

function renderRevisionMode(chapter, chState, objectiveId) {
  const storyDeck = getRevisionDeck(chapter, chState, "story", objectiveId);
  const questionDeck = getRevisionDeck(chapter, chState, "questions", objectiveId);

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
    const {
      objectiveId: activeObjectiveId,
      viewState: activeViewState,
      items
    } = getActiveChapterContext(chapter);
    syncActionDock(chapter, chState, activeObjectiveId, activeViewState, items);
    return;
  }

  revisionSessionEl.classList.add("hidden");
  revisionHubEl.classList.remove("hidden");
  if (deck.length === 0) {
    setRevisionUiMode("idle");
    selectedIds.clear();
  }
  const deckIdSet = new Set(deck.map((item) => item.id));
  selectedIds = new Set([...selectedIds].filter((id) => deckIdSet.has(id)));
  revisionConfigEl.classList.toggle("hidden", !isRevisionConfigOpen);

  setRevisionProgress(deck.length);

  revisionListEl.innerHTML = "";
  const isEmpty = deck.length === 0;
  revisionStartBtn.disabled = isEmpty;
  revisionStartBtn.textContent = isEmpty ? "Save items to review" : "Review options";
  revisionStartBtn.classList.toggle("btn--pressed", isRevisionConfigOpen);
  revisionStartBtn.classList.toggle("btn--press-lock", isRevisionConfigOpen);
  revisionStartBtn.setAttribute("aria-pressed", isRevisionConfigOpen ? "true" : "false");
  revisionSelectionBannerEl.classList.toggle("hidden", !isSelecting);
  revisionSelectionBarEl.classList.toggle("hidden", !isSelecting);
  revisionSelectionCtaEl.classList.toggle("hidden", !isSelecting);
  revisionActionButtonsEl.classList.toggle("hidden", isSelecting);
  revisionHelperTextEl.classList.toggle("hidden", !isEmpty || isSelecting);

  if (deck.length === 0) {
    revisionEmptyEl.classList.remove("hidden");
  } else {
    revisionEmptyEl.classList.add("hidden");
  }

  deck.forEach((item) => {
    const li = document.createElement("li");
    li.className = "revision-item";
    if (isSelecting) {
      li.classList.add("revision-item--selectable");
      const checkboxWrap = document.createElement("label");
      checkboxWrap.className = "revision-checkbox-wrap";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "revision-checkbox";
      checkbox.checked = selectedIds.has(item.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedIds.add(item.id);
        } else {
          selectedIds.delete(item.id);
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
      selectedIds.delete(item.id);
      saveState();
      renderRevisionMode(chapter, chState, objectiveId);
    });

    revisionListEl.appendChild(li);
  });

  updateRevisionSelectionUI(deck.length);

  if (isRevisionConfigOpen) {
    renderRevisionConfig(deck.length);
  }
}

function getDefaultRevisionCount(deckSize, availableCounts) {
  if (deckSize >= 10 && availableCounts.includes("10")) return "10";
  if (availableCounts.includes("all")) return "all";
  return availableCounts[0] || "all";
}

function renderRevisionConfig(deckSize) {
  revisionConfigEl.classList.toggle("hidden", !isRevisionConfigOpen);
  if (!isRevisionConfigOpen) return;

  const countButtons = Array.from(revisionCountOptionsEl.querySelectorAll(".pill"));
  let availableCounts = [];
  let availableStandardCounts = [];

  countButtons.forEach((btn) => {
    const countValue = btn.dataset.count;
    if (countValue === "select") {
      btn.disabled = deckSize === 0;
      if (deckSize > 0) availableCounts.push("select");
      return;
    }
    if (countValue === "all") {
      btn.disabled = deckSize === 0;
      if (deckSize > 0) availableCounts.push("all");
      if (deckSize > 0) availableStandardCounts.push("all");
      return;
    }

    const num = Number(countValue);
    const isAvailable = num <= deckSize;
    btn.disabled = !isAvailable;
    if (isAvailable) {
      availableCounts.push(countValue);
      availableStandardCounts.push(countValue);
    }
  });

  if (!focusCountChoice || !availableCounts.includes(focusCountChoice)) {
    focusCountChoice = getDefaultRevisionCount(deckSize, availableStandardCounts);
    focusLastStandardCount = focusCountChoice;
  }

  countButtons.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.count === focusCountChoice);
  });

  const orderButtons = Array.from(revisionOrderOptionsEl.querySelectorAll(".segmented__btn"));
  orderButtons.forEach((btn) => {
    const isActive = btn.dataset.order === focusOrderChoice;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  revisionConfigStartBtn.disabled = deckSize === 0;
  revisionConfigStartBtn.textContent = focusCountChoice === "select" ? "Choose items" : "Start session";
}

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function getRevisionItemsForCount(deck, countChoice, orderChoice) {
  let ordered = deck.slice();
  if (orderChoice === "random") {
    ordered = shuffleArray(ordered.slice());
  }
  let count = countChoice === "all" ? ordered.length : Number(countChoice);
  if (!count || Number.isNaN(count)) {
    count = Math.min(ordered.length, 5);
  }
  return ordered.slice(0, count);
}

function getRevisionItemsForSelection(deck, selectionSet, orderChoice) {
  let ordered = deck.filter((item) => selectionSet.has(item.id));
  if (orderChoice === "random") {
    ordered = shuffleArray(ordered.slice());
  }
  return ordered;
}

function startReviewSession({ chapter, chState, objectiveId = null, items, order, source }) {
  const subMode = appState.currentRevisionSubMode || "story";
  const deck = getRevisionDeck(chapter, chState, subMode, objectiveId);
  if (deck.length === 0) return;
  if (!Array.isArray(items) || items.length === 0) return;

  const deckMap = new Map(deck.map((item) => [item.id, item]));
  const queue = items.map((id) => deckMap.get(id)).filter(Boolean);
  logRevisionDebug("startReviewSession", {
    mode: revisionUiMode,
    order,
    source,
    items: queue.length
  });

  if (queue.length === 0) return;
  revisionSessionQueue = queue;
  revisionSessionIndex = 0;
  revisionSessionMaxIndex = 0;
  revisionQuestionRevealedByIndex = new Array(queue.length).fill(false);
  setRevisionUiMode("session");
  selectedIds.clear();
  focusCountChoice = focusLastStandardCount;
  revisionPointIndex = 0;
  revisionPointMaxIndex = subMode === "story" ? queue.length - 1 : 0;
  recordDailyActivity("revision-start");
  console.log("[focus-session] start", {
    subMode,
    items: queue.length,
    order,
    source
  });
  renderCurrentMode();
}

function handlePrimaryAction() {
  if (!isRevisionSessionActive) return;
  const total = revisionSessionQueue.length;
  if (appState.currentRevisionSubMode === "story") {
    if (revisionPointIndex >= total) return;
    if (revisionPointIndex < total - 1) {
      revisionPointIndex += 1;
      revisionPointMaxIndex = Math.max(revisionPointMaxIndex, revisionPointIndex);
      recordDailyActivity("revision-step");
      renderCurrentMode();
      return;
    }
    revisionPointIndex = total;
    recordDailyActivity("revision-complete");
    renderCurrentMode();
    return;
  }
  if (revisionSessionIndex >= total) return;

  if (appState.currentRevisionSubMode === "questions") {
    const currentIndex = revisionSessionIndex;
    if (!isRevisionQuestionRevealed(currentIndex)) {
      revisionQuestionRevealedByIndex[currentIndex] = true;
      recordDailyActivity("revision-reveal");
      renderCurrentMode();
      return;
    }
    const nextUnlock = Math.min(currentIndex + 1, total - 1);
    if (nextUnlock >= 0) {
      revisionSessionMaxIndex = Math.max(revisionSessionMaxIndex, nextUnlock);
    }
    if (currentIndex < total - 1) {
      revisionSessionIndex = currentIndex + 1;
      recordDailyActivity("revision-next");
      renderCurrentMode();
      return;
    }
  }

  advanceRevisionQuestion();
}

function handleFocusSessionBrowse(direction) {
  if (!isRevisionSessionActive) return;
  const total = revisionSessionQueue.length;
  if (total === 0) return;

  if (appState.currentRevisionSubMode === "story") {
    const maxIndex = Math.min(revisionPointMaxIndex, total - 1);
    const targetIndex = revisionPointIndex + direction;
    if (targetIndex < 0 || targetIndex > maxIndex) {
      if (direction > 0) showFocusContinueToast();
      return;
    }
    revisionPointIndex = targetIndex;
    renderCurrentMode();
    return;
  }

  const maxIndex = Math.min(revisionSessionMaxIndex, total - 1);
  if (direction < 0 && revisionSessionIndex > 0) {
    revisionSessionIndex -= 1;
    renderCurrentMode();
    return;
  }
  if (direction > 0) {
    if (revisionSessionIndex < maxIndex) {
      revisionSessionIndex += 1;
      renderCurrentMode();
      return;
    }
    if (revisionSessionIndex === maxIndex) {
      showFocusContinueToast();
    }
  }
}

function attachRevisionSwipeHandlers(target) {
  if (!target) return;
  let startX = 0;
  let startY = 0;
  let isTracking = false;

  target.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = true;
    },
    { passive: true }
  );

  target.addEventListener(
    "touchend",
    (event) => {
      if (!isTracking) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      isTracking = false;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX < 50 || absX <= absY) return;
      if (deltaX < 0) {
        handleFocusSessionBrowse(1);
      } else {
        handleFocusSessionBrowse(-1);
      }
    },
    { passive: true }
  );
}

function renderRevisionSession() {
  revisionSessionEl.classList.remove("hidden");
  revisionSessionEl.innerHTML = "";

  const total = revisionSessionQueue.length;
  const isStorySession = appState.currentRevisionSubMode === "story";
  const currentIndex = isStorySession ? revisionPointIndex : revisionSessionIndex;
  const maxIndex = isStorySession ? revisionPointMaxIndex : revisionSessionMaxIndex;
  if (isStorySession) {
    if (isFocusTapHintVisible()) hideFocusTapHint(false);
  } else {
    updateFocusTapHintContent();
  }
  if (currentIndex >= total) {
    const doneCard = document.createElement("div");
    doneCard.className = "qa-card";
    doneCard.innerHTML = `
      <div class="qa-meta">Session complete</div>
      <div class="qa-text">You’ve finished this Focus set.</div>
    `;

    const actions = document.createElement("div");
    actions.className = "revision-session-actions";
    const backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.textContent = "Back to Focus";
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
    attachRevisionSwipeHandlers(feed);
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
      if (!isRevisionQuestionRevealed(currentIndex)) {
        ans.classList.add("hidden");
      }
      card.appendChild(ans);
    }

    revisionSessionEl.appendChild(card);
    attachRevisionSwipeHandlers(card);
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
  loadStreak();
  applyTheme();
  initSettingsScopeControls();
  initLevelButtons();
  showScreen("levels");
  updateStreakUI();
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
