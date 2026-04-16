/* ─── DOM refs ─────────────────────────────────────── */
const introScreen   = document.getElementById("introScreen");
const setupScreen   = document.getElementById("setupScreen");
const appScreen     = document.getElementById("appScreen");

const enterTourBtn  = document.getElementById("enterTourBtn");
const nicknameInput = document.getElementById("nicknameInput");
const tourStartBtn  = document.getElementById("tourStartBtn");

const accountName   = document.getElementById("accountName");
const completedCount= document.getElementById("completedCount");
const remainingCount= document.getElementById("remainingCount");

const mypageBtn     = document.getElementById("mypageBtn");
const rewardBtn     = document.getElementById("rewardBtn");

const mapViewport   = document.getElementById("mapViewport");
const mapStage      = document.getElementById("mapStage");
const mapImage      = document.getElementById("mapImage");
const markerLayer   = document.getElementById("markerLayer");

const mypageModal   = document.getElementById("mypageModal");
const mypageName    = document.getElementById("mypageName");
const mypageCompleted = document.getElementById("mypageCompleted");
const mypageRemaining = document.getElementById("mypageRemaining");

const quizModal     = document.getElementById("quizModal");
const quizBadge     = document.getElementById("quizBadge");
const quizQuestion  = document.getElementById("quizQuestion");
const quizOptions   = document.getElementById("quizOptions");
const quizFeedback  = document.getElementById("quizFeedback");

const rewardModal   = document.getElementById("rewardModal");

/* ─── Constants ────────────────────────────────────── */
const STORAGE_KEY   = "yeongdeungpo_garden_picnic_2026_state";
const TOTAL_MARKERS = 8;

/* ─── App state ────────────────────────────────────── */
const appState = {
  nickname: "",
  completedMarkers: [],
  activeQuizId: null,
};

/* ─── Map pan/zoom state ───────────────────────────── */
const mapState = {
  naturalWidth: 1024,
  naturalHeight: 1536,
  baseScale: 1,
  zoom: 1,
  minZoom: 1,
  maxZoom: 5,
  offsetX: 0,
  offsetY: 0,
  drag: { active: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 },
  pinch: { startDistance: 0, startZoom: 1, centerX: 0, centerY: 0, worldX: 0, worldY: 0 },
  pointers: new Map(),
};

/* ─── Markers data ─────────────────────────────────── */
const markers = [
  {
    id: 1, x: 18, y: 19,
    question: "정원소풍의 분위기와 가장 잘 어울리는 활동은 무엇일까요?",
    options: ["자연 속 산책과 체험", "자동차 경주", "비행 훈련", "실내 시험"],
    answer: 0,
  },
  {
    id: 2, x: 72, y: 28,
    question: "이 웹사이트의 탐험 방식은 무엇인가요?",
    options: ["지도 위 마커를 눌러 퀴즈를 푼다", "오프라인 종이 제출만 한다", "영상만 시청한다", "전화로만 참여한다"],
    answer: 0,
  },
  {
    id: 3, x: 55, y: 35,
    question: "닉네임은 어느 단계에서 입력하나요?",
    options: ["셋업 페이지", "보상 팝업", "마이페이지", "인트로 하단"],
    answer: 0,
  },
  {
    id: 4, x: 40, y: 56,
    question: "마커 퀴즈를 맞히면 해당 마커는 어떻게 되나요?",
    options: ["비활성화된다", "두 배로 늘어난다", "사라졌다 다시 생긴다", "랜덤 위치로 이동한다"],
    answer: 0,
  },
  {
    id: 5, x: 24, y: 72,
    question: "앱 페이지 상단에서 확인할 수 있는 정보가 아닌 것은?",
    options: ["남은 여행지", "완료 수", "마이페이지", "계좌번호"],
    answer: 3,
  },
  {
    id: 6, x: 78, y: 70,
    question: "모든 퀴즈를 완료하면 어떤 버튼이 활성화되나요?",
    options: ["탐험 완료 보상 받기", "로그인하기", "위치 재설정", "회원탈퇴"],
    answer: 0,
  },
  {
    id: 7, x: 63, y: 83,
    question: "보상 안내 팝업의 내용은 무엇인가요?",
    options: ["안내소에 방문해 팝업을 보여주면 선물 교환", "앱을 삭제하면 상품 지급", "이메일 전송 후 당일 택배 수령", "자동 계좌 입금"],
    answer: 0,
  },
  {
    id: 8, x: 52, y: 47,
    question: "이 프로젝트의 행사 타이틀은 무엇인가요?",
    options: ["2026 영등포공원 정원소풍", "2025 경기문화재단 스탬프투어", "한강 야간마라톤", "서울 봄꽃 걷기"],
    answer: 0,
  },
];

/* ─── Storage ──────────────────────────────────────── */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    nickname: appState.nickname,
    completedMarkers: appState.completedMarkers,
  }));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    appState.nickname = typeof parsed.nickname === "string" ? parsed.nickname : "";
    appState.completedMarkers = Array.isArray(parsed.completedMarkers)
      ? parsed.completedMarkers.filter((id) => Number.isInteger(id))
      : [];
  } catch (e) {
    console.error("저장된 데이터를 불러오지 못했습니다.", e);
  }
}

/* ─── UI helpers ───────────────────────────────────── */
function sanitizeNickname(value) {
  return value.replace(/\s+/g, " ").trim().slice(0, 12);
}

function showScreen(target) {
  [introScreen, setupScreen, appScreen].forEach((s) => s.classList.add("hidden"));
  target.classList.remove("hidden");
}

function getCompletedCount() { return appState.completedMarkers.length; }
function getRemainingCount()  { return TOTAL_MARKERS - getCompletedCount(); }

function applyNicknameToUI() {
  const name = appState.nickname || "게스트";
  accountName.textContent = name;
  mypageName.textContent  = name;
}

function updateProgressUI() {
  const done      = getCompletedCount();
  const remaining = getRemainingCount();

  completedCount.textContent  = `${done} / ${TOTAL_MARKERS}`;
  remainingCount.textContent  = String(remaining);
  mypageCompleted.textContent = `${done} / ${TOTAL_MARKERS}`;
  mypageRemaining.textContent = String(remaining);

  const allDone = done === TOTAL_MARKERS;
  rewardBtn.disabled = !allDone;
  rewardBtn.classList.toggle("reward-active", allDone);
}

function updateStartButtonState() {
  tourStartBtn.disabled = sanitizeNickname(nicknameInput.value).length === 0;
}

/* ─── Screens ──────────────────────────────────────── */
function goToSetupScreen() {
  showScreen(setupScreen);
  window.setTimeout(() => nicknameInput.focus(), 50);
}

function startTour() {
  const nickname = sanitizeNickname(nicknameInput.value);
  if (!nickname) { tourStartBtn.disabled = true; return; }

  appState.nickname = nickname;
  saveState();

  applyNicknameToUI();
  updateProgressUI();
  renderMarkers();
  showScreen(appScreen);

  // Init map after screen is visible
  requestAnimationFrame(() => {
    setupMapDimensions();
  });
}

/* ─── Modal helpers ────────────────────────────────── */
function openModal(el) {
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}

function closeModal(type) {
  if (type === "quiz") {
    quizModal.classList.add("hidden");
    quizModal.setAttribute("aria-hidden", "true");
    quizOptions.innerHTML = "";
    quizFeedback.textContent = "";
    appState.activeQuizId = null;
  }
  if (type === "mypage") {
    mypageModal.classList.add("hidden");
    mypageModal.setAttribute("aria-hidden", "true");
  }
  if (type === "reward") {
    rewardModal.classList.add("hidden");
    rewardModal.setAttribute("aria-hidden", "true");
  }
}

/* ─── Quiz ─────────────────────────────────────────── */
function openQuizModal(markerId) {
  const quiz = markers.find((m) => m.id === markerId);
  if (!quiz) return;

  appState.activeQuizId = markerId;
  quizBadge.textContent    = `이벤트 구역 ${quiz.id}`;
  quizQuestion.textContent = quiz.question;
  quizFeedback.textContent = "";
  quizOptions.innerHTML    = "";

  quiz.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.type      = "button";
    btn.className = "quiz-option-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => handleQuizAnswer(quiz, index, btn));
    quizOptions.appendChild(btn);
  });

  openModal(quizModal);
}

function handleQuizAnswer(quiz, selectedIndex, clickedBtn) {
  Array.from(quizOptions.querySelectorAll(".quiz-option-btn"))
    .forEach((b) => { b.disabled = true; });

  if (selectedIndex === quiz.answer) {
    clickedBtn.classList.add("correct");
    quizFeedback.textContent = "정답입니다! 해당 구역을 완료했어요.";

    if (!appState.completedMarkers.includes(quiz.id)) {
      appState.completedMarkers.push(quiz.id);
      appState.completedMarkers.sort((a, b) => a - b);
      saveState();
    }

    updateProgressUI();
    refreshMarkerState(quiz.id, true);

    window.setTimeout(() => closeModal("quiz"), 850);
  } else {
    clickedBtn.classList.add("wrong");
    quizFeedback.textContent = "오답입니다. 다시 한 번 도전해 보세요.";
    window.setTimeout(() => openQuizModal(quiz.id), 850);
  }
}

/* ─── Markers ──────────────────────────────────────── */
const markerRefs = []; // { id, element }

function renderMarkers() {
  markerLayer.innerHTML = "";
  markerRefs.length = 0;

  markers.forEach((marker, index) => {
    const done = appState.completedMarkers.includes(marker.id);

    const btn = document.createElement("button");
    btn.type      = "button";
    btn.className = `mission-marker${done ? " completed disabled" : ""}`;
    btn.style.left = `${marker.x}%`;
    btn.style.top  = `${marker.y}%`;
    btn.dataset.markerId = String(marker.id);
    btn.setAttribute("aria-label", `이벤트 구역 ${marker.id}`);
    btn.style.setProperty("--marker-delay", `${index * 30}ms`);

    // Pin shape element
    const pin = document.createElement("div");
    pin.className = "marker-pin";

    // Number label
    const inner = document.createElement("div");
    inner.className = "marker-inner";
    inner.textContent = String(marker.id);

    // Stamp checkmark
    const stamp = document.createElement("div");
    stamp.className = "marker-stamp";
    stamp.textContent = "✓";

    btn.appendChild(pin);
    btn.appendChild(inner);
    btn.appendChild(stamp);

    if (done) {
      btn.disabled = true;
      btn.title = `이벤트 구역 ${marker.id} 완료`;
    } else {
      btn.title = `이벤트 구역 ${marker.id} 퀴즈 열기`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openQuizModal(marker.id);
      });
    }

    markerLayer.appendChild(btn);
    markerRefs.push({ id: marker.id, element: btn });
  });
}

function refreshMarkerState(markerId, animateStamp = false) {
  const ref = markerRefs.find((r) => r.id === markerId);
  if (!ref) return;

  const el   = ref.element;
  const done = appState.completedMarkers.includes(markerId);

  el.classList.toggle("completed", done);
  el.classList.toggle("disabled", done);
  el.disabled = done;

  if (animateStamp && done) {
    el.classList.remove("stamp-animate");
    void el.offsetWidth;
    el.classList.add("stamp-animate");
  }
}

/* ─── Map pan/zoom ─────────────────────────────────── */
function setupMapDimensions() {
  const apply = () => {
    mapState.naturalWidth  = mapImage.naturalWidth  || 1024;
    mapState.naturalHeight = mapImage.naturalHeight || 1536;

    mapImage.style.width  = `${mapState.naturalWidth}px`;
    mapImage.style.height = `${mapState.naturalHeight}px`;
    mapStage.style.width  = `${mapState.naturalWidth}px`;
    mapStage.style.height = `${mapState.naturalHeight}px`;

    fitMapToViewport();
  };

  if (mapImage.complete && mapImage.naturalWidth) {
    apply();
  } else {
    mapImage.addEventListener("load", apply, { once: true });
  }
}

function fitMapToViewport() {
  const rect = mapViewport.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;

  mapState.baseScale = Math.min(vw / mapState.naturalWidth, vh / mapState.naturalHeight);
  mapState.zoom = Math.max(mapState.minZoom, Math.min(mapState.zoom, mapState.maxZoom));

  const scale = mapState.baseScale * mapState.zoom;
  mapState.offsetX = (vw - mapState.naturalWidth  * scale) / 2;
  mapState.offsetY = (vh - mapState.naturalHeight * scale) / 2;

  clampOffsets();
  applyTransform();
}

function applyTransform() {
  const s = mapState.baseScale * mapState.zoom;
  mapStage.style.transform = `matrix(${s},0,0,${s},${mapState.offsetX},${mapState.offsetY})`;
}

function clampOffsets() {
  const rect = mapViewport.getBoundingClientRect();
  const vw = rect.width, vh = rect.height;
  const s  = mapState.baseScale * mapState.zoom;
  const sw = mapState.naturalWidth  * s;
  const sh = mapState.naturalHeight * s;

  const minX = Math.min(0, vw - sw);
  const maxX = sw <= vw ? (vw - sw) / 2 : 0;
  const minY = Math.min(0, vh - sh);
  const maxY = sh <= vh ? (vh - sh) / 2 : 0;

  mapState.offsetX = Math.min(maxX, Math.max(minX, mapState.offsetX));
  mapState.offsetY = Math.min(maxY, Math.max(minY, mapState.offsetY));
}

function getDist(p1, p2) {
  return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
}

function getMid(p1, p2) {
  return { x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 };
}

function zoomAtPoint(nextZoom, cx, cy) {
  const clamped  = Math.min(mapState.maxZoom, Math.max(mapState.minZoom, nextZoom));
  const oldScale = mapState.baseScale * mapState.zoom;
  const newScale = mapState.baseScale * clamped;
  const wx       = (cx - mapState.offsetX) / oldScale;
  const wy       = (cy - mapState.offsetY) / oldScale;

  mapState.zoom    = clamped;
  mapState.offsetX = cx - wx * newScale;
  mapState.offsetY = cy - wy * newScale;

  clampOffsets();
  applyTransform();
}

function onPointerDown(e) {
  if (e.target.closest(".mission-marker")) return;
  mapViewport.setPointerCapture(e.pointerId);
  mapState.pointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

  if (mapState.pointers.size === 1) {
    mapState.drag.active       = true;
    mapState.drag.startX       = e.clientX;
    mapState.drag.startY       = e.clientY;
    mapState.drag.startOffsetX = mapState.offsetX;
    mapState.drag.startOffsetY = mapState.offsetY;
  }

  if (mapState.pointers.size === 2) {
    const [p1, p2] = [...mapState.pointers.values()];
    const mid      = getMid(p1, p2);
    const s        = mapState.baseScale * mapState.zoom;

    mapState.pinch.startDistance = getDist(p1, p2);
    mapState.pinch.startZoom     = mapState.zoom;
    mapState.pinch.centerX       = mid.x;
    mapState.pinch.centerY       = mid.y;
    mapState.pinch.worldX        = (mid.x - mapState.offsetX) / s;
    mapState.pinch.worldY        = (mid.y - mapState.offsetY) / s;
    mapState.drag.active         = false;
  }
}

function onPointerMove(e) {
  if (!mapState.pointers.has(e.pointerId)) return;
  mapState.pointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

  if (mapState.pointers.size === 2) {
    const [p1, p2]  = [...mapState.pointers.values()];
    const dist       = getDist(p1, p2);
    const ratio      = dist / mapState.pinch.startDistance;
    const nextZoom   = mapState.pinch.startZoom * ratio;
    const clamped    = Math.min(mapState.maxZoom, Math.max(mapState.minZoom, nextZoom));
    const newScale   = mapState.baseScale * clamped;

    mapState.zoom    = clamped;
    mapState.offsetX = mapState.pinch.centerX - mapState.pinch.worldX * newScale;
    mapState.offsetY = mapState.pinch.centerY - mapState.pinch.worldY * newScale;

    clampOffsets();
    applyTransform();
    return;
  }

  if (mapState.pointers.size === 1 && mapState.drag.active) {
    mapState.offsetX = mapState.drag.startOffsetX + (e.clientX - mapState.drag.startX);
    mapState.offsetY = mapState.drag.startOffsetY + (e.clientY - mapState.drag.startY);
    clampOffsets();
    applyTransform();
  }
}

function onPointerUp(e) {
  mapState.pointers.delete(e.pointerId);
  if (mapState.pointers.size === 0) {
    mapState.drag.active = false;
  }
}

function onWheelZoom(e) {
  e.preventDefault();
  const rect   = mapViewport.getBoundingClientRect();
  const cx     = e.clientX - rect.left;
  const cy     = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? 1.12 : 0.89;
  zoomAtPoint(mapState.zoom * factor, cx, cy);
}

function bindMapEvents() {
  mapViewport.addEventListener("pointerdown",   onPointerDown,  { passive: false });
  mapViewport.addEventListener("pointermove",   onPointerMove,  { passive: false });
  mapViewport.addEventListener("pointerup",     onPointerUp);
  mapViewport.addEventListener("pointercancel", onPointerUp);
  mapViewport.addEventListener("wheel",         onWheelZoom,    { passive: false });
  window.addEventListener("resize", () => fitMapToViewport());
}

/* ─── Events ───────────────────────────────────────── */
function bindModalCloseEvents() {
  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => closeModal(el.getAttribute("data-close")));
  });
}

function bindEvents() {
  enterTourBtn?.addEventListener("click", goToSetupScreen);

  nicknameInput?.addEventListener("input", () => {
    nicknameInput.value = nicknameInput.value.replace(/\n/g, "");
    updateStartButtonState();
  });

  nicknameInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !tourStartBtn.disabled) startTour();
  });

  tourStartBtn?.addEventListener("click", startTour);
  mypageBtn?.addEventListener("click", () => {
    applyNicknameToUI();
    updateProgressUI();
    openModal(mypageModal);
  });

  rewardBtn?.addEventListener("click", () => {
    if (getCompletedCount() !== TOTAL_MARKERS) return;
    openModal(rewardModal);
  });

  bindModalCloseEvents();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal("quiz");
      closeModal("mypage");
      closeModal("reward");
    }
  });

  bindMapEvents();
}

/* ─── Init ─────────────────────────────────────────── */
function init() {
  loadState();

  if (appState.nickname) {
    nicknameInput.value = appState.nickname;
  }

  applyNicknameToUI();
  updateProgressUI();
  updateStartButtonState();
  renderMarkers();
  showScreen(introScreen);
}

bindEvents();
init();
