/* ═══════════════════════════════════════════════════
   더블탭 줌 방지 (전역)
════════════════════════════════════════════════════ */
(function preventDoubleTapZoom() {
  let lastTap = 0;
  document.addEventListener("touchend", function (e) {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
    }
    lastTap = now;
  }, { passive: false });
})();

/* ─── DOM refs ─────────────────────────────────────── */
const introScreen    = document.getElementById("introScreen");
const setupScreen    = document.getElementById("setupScreen");
const appScreen      = document.getElementById("appScreen");
const enterTourBtn   = document.getElementById("enterTourBtn");
const nicknameInput  = document.getElementById("nicknameInput");
const tourStartBtn   = document.getElementById("tourStartBtn");
const accountName    = document.getElementById("accountName");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const mypageBtn      = document.getElementById("mypageBtn");
const rewardBtn      = document.getElementById("rewardBtn");
const mapViewport    = document.getElementById("mapViewport");
const mapStage       = document.getElementById("mapStage");
const mapImage       = document.getElementById("mapImage");
const markerLayer    = document.getElementById("markerLayer");
const mypageModal    = document.getElementById("mypageModal");
const mypageName     = document.getElementById("mypageName");
const mypageCompleted= document.getElementById("mypageCompleted");
const mypageRemaining= document.getElementById("mypageRemaining");
const quizModal      = document.getElementById("quizModal");
const quizBadge      = document.getElementById("quizBadge");
const quizModalTitle = document.getElementById("quizModalTitle");
const quizQuestion   = document.getElementById("quizQuestion");
const quizOptions    = document.getElementById("quizOptions");
const quizFeedback   = document.getElementById("quizFeedback");
const rewardModal    = document.getElementById("rewardModal");

/* ─── Constants ────────────────────────────────────── */
const STORAGE_KEY   = "yeongdeungpo_garden_picnic_2026_state";
const TOTAL_MARKERS = 8;

/* ─── App state ────────────────────────────────────── */
const appState = {
  nickname: "",
  completedMarkers: [],
  activeMarkerId: null,
};

/* ════════════════════════════════════════════════════
   미션 데이터 — 4가지 유형 혼합
   type: "mcq" | "card-match" | "word-input" | "tile-order"
════════════════════════════════════════════════════ */
const markers = [

  /* ① 카드 짝 맞추기 — 자연/정원 이모지 */
  {
    id: 1, x: 18, y: 19,
    type: "card-match",
    title: "🃏 카드 짝 맞추기",
    desc: "같은 그림의 카드 두 장을 찾아 모두 맞춰보세요!",
    pairs: ["🌸", "🌿", "🦋"],
  },

  /* ② 낱말 퀴즈 — 영등포구 */
  {
    id: 2, x: 72, y: 28,
    type: "word-input",
    title: "🔤 낱말 퀴즈",
    desc: "영등포공원이 위치한 서울시 자치구 이름은 무엇일까요?",
    hint: "💡 힌트: 공원 이름 앞부분에 답이 숨어 있어요!  (예: ○○구)",
    answers: ["영등포구"],
  },

  /* ③ 4지선다 — 영등포공원 역사 */
  {
    id: 3, x: 55, y: 35,
    type: "mcq",
    title: "📋 영등포공원 퀴즈",
    desc: "영등포공원은 과거 어떤 시설의 부지였을까요?",
    options: ["🍺 맥주 공장", "🏭 방직 공장", "🚂 기차역", "🏥 병원"],
    answer: 0,
  },

  /* ④ 순서 퍼즐 — 행사 타이틀 맞추기 */
  {
    id: 4, x: 40, y: 56,
    type: "tile-order",
    title: "🧩 순서 퍼즐",
    desc: "단어를 올바른 순서로 배열해 행사 타이틀을 완성하세요!",
    tiles: ["정원소풍", "영등포공원", "2026"],
    answer: ["2026", "영등포공원", "정원소풍"],
  },

  /* ⑤ 카드 짝 맞추기 — 꽃 이모지 */
  {
    id: 5, x: 24, y: 72,
    type: "card-match",
    title: "🃏 카드 짝 맞추기",
    desc: "봄꽃 카드를 모두 짝지어 보세요!",
    pairs: ["🌺", "🌻", "🌼"],
  },

  /* ⑥ 4지선다 — 정원소풍 보상 */
  {
    id: 6, x: 78, y: 70,
    type: "mcq",
    title: "📋 정원소풍 퀴즈",
    desc: "탐험 완료 보상을 받으려면 영등포공원 안의 어느 곳을 방문해야 할까요?",
    options: ["🏛 원형광장 안내소", "🎟 공원 입구 매표소", "🛒 인근 편의점", "📦 온라인 배송 신청"],
    answer: 0,
  },

  /* ⑦ 낱말 퀴즈 — 스탬프투어 */
  {
    id: 7, x: 63, y: 83,
    type: "word-input",
    title: "🔤 낱말 퀴즈",
    desc: "마커를 찾아 미션을 완수하며 공원을 돌아다니는\n이 탐험 방식의 이름은 무엇일까요?",
    hint: "💡 힌트: 도장(스탬프)을 찍으며 완주하는 투어!  (예: ○○○투어)",
    answers: ["스탬프투어", "스탬프 투어"],
  },

  /* ⑧ 순서 퍼즐 — 사계절 */
  {
    id: 8, x: 52, y: 47,
    type: "tile-order",
    title: "🧩 순서 퍼즐",
    desc: "사계절을 올바른 순서로 배열해 보세요!",
    tiles: ["가을", "봄", "겨울", "여름"],
    answer: ["봄", "여름", "가을", "겨울"],
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
    const p = JSON.parse(saved);
    appState.nickname = typeof p.nickname === "string" ? p.nickname : "";
    appState.completedMarkers = Array.isArray(p.completedMarkers)
      ? p.completedMarkers.filter(Number.isInteger) : [];
  } catch (e) { console.error("저장 데이터 로드 실패", e); }
}

/* ─── UI helpers ───────────────────────────────────── */
function sanitizeNickname(v) { return v.replace(/\s+/g, " ").trim().slice(0, 12); }
function showScreen(t) {
  [introScreen, setupScreen, appScreen].forEach(s => s.classList.add("hidden"));
  t.classList.remove("hidden");
}
function getCompletedCount() { return appState.completedMarkers.length; }
function getRemainingCount()  { return TOTAL_MARKERS - getCompletedCount(); }
function applyNicknameToUI() {
  const n = appState.nickname || "게스트";
  accountName.textContent = n;
  mypageName.textContent  = n;
}
function updateProgressUI() {
  const done = getCompletedCount(), rem = getRemainingCount();
  completedCount.textContent  = `${done} / ${TOTAL_MARKERS}`;
  remainingCount.textContent  = String(rem);
  mypageCompleted.textContent = `${done} / ${TOTAL_MARKERS}`;
  mypageRemaining.textContent = String(rem);
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
  setTimeout(() => nicknameInput.focus(), 50);
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
  requestAnimationFrame(() => setupMapDimensions());
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
    appState.activeMarkerId = null;
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

/* ─── 미션 완료 공통 처리 ──────────────────────────── */
function markComplete(markerId) {
  if (!appState.completedMarkers.includes(markerId)) {
    appState.completedMarkers.push(markerId);
    appState.completedMarkers.sort((a, b) => a - b);
    saveState();
  }
  updateProgressUI();
  refreshMarkerState(markerId, true);
}

function setFeedback(msg, success) {
  quizFeedback.textContent = msg;
  quizFeedback.style.color = success ? "#149c56" : "#db4747";
}

/* ════════════════════════════════════════════════════
   게임 열기 — 유형 분기
════════════════════════════════════════════════════ */
function openGameModal(markerId) {
  const marker = markers.find(m => m.id === markerId);
  if (!marker) return;

  appState.activeMarkerId = markerId;
  quizBadge.textContent      = `이벤트 구역 ${marker.id}`;
  quizModalTitle.textContent = marker.title;
  quizQuestion.textContent   = marker.desc;
  quizFeedback.textContent   = "";
  quizFeedback.style.color   = "";
  quizOptions.innerHTML      = "";

  switch (marker.type) {
    case "mcq":        renderMCQ(marker);        break;
    case "card-match": renderCardMatch(marker);   break;
    case "word-input": renderWordInput(marker);   break;
    case "tile-order": renderTileOrder(marker);   break;
  }

  openModal(quizModal);
}

/* ════════════════════════════════════════════════════
   ① MCQ — 4지선다
════════════════════════════════════════════════════ */
function renderMCQ(marker) {
  marker.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleMCQAnswer(marker, idx, btn));
    quizOptions.appendChild(btn);
  });
}

function handleMCQAnswer(marker, idx, clickedBtn) {
  quizOptions.querySelectorAll(".quiz-option-btn").forEach(b => { b.disabled = true; });
  if (idx === marker.answer) {
    clickedBtn.classList.add("correct");
    setFeedback("🎉 정답입니다!", true);
    markComplete(marker.id);
    setTimeout(() => closeModal("quiz"), 900);
  } else {
    clickedBtn.classList.add("wrong");
    setFeedback("😅 오답이에요. 다시 도전해 보세요!", false);
    setTimeout(() => openGameModal(marker.id), 950);
  }
}

/* ════════════════════════════════════════════════════
   ② 카드 매칭 — 짝 찾기
════════════════════════════════════════════════════ */
function renderCardMatch(marker) {
  /* 카드 셔플 */
  const deck = [...marker.pairs, ...marker.pairs]
    .map((emoji, i) => ({ emoji, id: i }))
    .sort(() => Math.random() - 0.5);

  let flipped   = [];   // 현재 뒤집힌 카드 요소
  let matched   = 0;    // 맞춘 쌍 수
  let checking  = false;

  const grid = document.createElement("div");
  grid.className = "card-grid";

  const statusEl = document.createElement("p");
  statusEl.className = "card-grid-status";
  statusEl.textContent = `0 / ${marker.pairs.length} 쌍 완료`;

  deck.forEach(({ emoji }) => {
    const card  = document.createElement("div");
    card.className = "flip-card";
    card.dataset.emoji = emoji;

    const inner = document.createElement("div");
    inner.className = "flip-card-inner";

    const front = document.createElement("div");
    front.className = "flip-card-front";
    front.textContent = "?";

    const back = document.createElement("div");
    back.className = "flip-card-back";
    back.textContent = emoji;

    inner.append(front, back);
    card.appendChild(inner);

    card.addEventListener("click", () => {
      if (checking) return;
      if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

      card.classList.add("flipped");
      flipped.push(card);

      if (flipped.length === 2) {
        checking = true;
        const [a, b] = flipped;
        if (a.dataset.emoji === b.dataset.emoji) {
          /* 정답 — 매칭 성공 */
          setTimeout(() => {
            a.classList.add("matched");
            b.classList.add("matched");
            flipped = [];
            matched++;
            checking = false;
            statusEl.textContent = `${matched} / ${marker.pairs.length} 쌍 완료`;

            if (matched === marker.pairs.length) {
              setFeedback("🎉 모두 맞췄어요! 훌륭해요!", true);
              markComplete(marker.id);
              setTimeout(() => closeModal("quiz"), 1100);
            }
          }, 500);
        } else {
          /* 오답 — 카드 뒤집기 */
          setTimeout(() => {
            a.classList.remove("flipped");
            b.classList.remove("flipped");
            flipped = [];
            checking = false;
          }, 900);
        }
      }
    });

    grid.appendChild(card);
  });

  quizOptions.append(grid, statusEl);
}

/* ════════════════════════════════════════════════════
   ③ 낱말 퀴즈 — 텍스트 입력
════════════════════════════════════════════════════ */
function renderWordInput(marker) {
  const wrap = document.createElement("div");
  wrap.className = "word-input-wrap";

  /* 힌트 */
  if (marker.hint) {
    const hint = document.createElement("p");
    hint.className = "word-hint";
    hint.textContent = marker.hint;
    wrap.appendChild(hint);
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "word-input-field";
  input.placeholder = "정답을 입력하세요";
  input.autocomplete = "off";
  input.autocorrect = "off";
  input.spellcheck = false;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "word-submit-btn";
  btn.textContent = "정답 확인";

  const normalize = s => s.trim().replace(/\s+/g, "").toLowerCase();

  btn.addEventListener("click", () => {
    const userVal = normalize(input.value);
    if (!userVal) { setFeedback("정답을 입력해 주세요!", false); return; }

    const isCorrect = marker.answers.some(a => normalize(a) === userVal);
    if (isCorrect) {
      input.disabled = true;
      btn.disabled   = true;
      input.classList.add("correct");
      setFeedback("🎉 정답입니다!", true);
      markComplete(marker.id);
      setTimeout(() => closeModal("quiz"), 950);
    } else {
      setFeedback("😅 틀렸어요. 다시 도전해 보세요!", false);
      input.value = "";
      setTimeout(() => input.focus(), 50);
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") btn.click();
  });

  wrap.append(input, btn);
  quizOptions.appendChild(wrap);

  setTimeout(() => input.focus(), 120);
}

/* ════════════════════════════════════════════════════
   ④ 순서 퍼즐 — 타일 배열
════════════════════════════════════════════════════ */
function renderTileOrder(marker) {
  const wrap = document.createElement("div");
  wrap.className = "tile-order-wrap";

  /* 내 답 영역 */
  const ansLabel = document.createElement("p");
  ansLabel.className = "tile-area-label";
  ansLabel.textContent = "내 답 (순서대로 탭하세요)";

  const ansArea = document.createElement("div");
  ansArea.className = "tile-answer-area empty";

  /* 단어 목록 영역 */
  const srcLabel = document.createElement("p");
  srcLabel.className = "tile-area-label";
  srcLabel.textContent = "단어 목록";

  const srcArea = document.createElement("div");
  srcArea.className = "tile-source-area";

  /* 현재 배치 순서 추적 */
  const userOrder = [];

  /* 타일 생성 */
  function makeTile(text, inAnswer) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile-btn" + (inAnswer ? " in-answer" : "");
    tile.textContent = text;
    tile.dataset.word = text;

    tile.addEventListener("click", () => {
      if (inAnswer) {
        /* 답 영역 → 소스 영역으로 반환 */
        tile.remove();
        userOrder.splice(userOrder.indexOf(text), 1);
        srcArea.appendChild(makeTile(text, false));
        if (ansArea.children.length === 0) ansArea.classList.add("empty");
      } else {
        /* 소스 영역 → 답 영역으로 이동 */
        tile.remove();
        userOrder.push(text);
        ansArea.classList.remove("empty");
        ansArea.appendChild(makeTile(text, true));
      }
    });
    return tile;
  }

  /* 타일 셔플 후 소스 영역에 배치 */
  const shuffled = [...marker.tiles].sort(() => Math.random() - 0.5);
  shuffled.forEach(t => srcArea.appendChild(makeTile(t, false)));

  /* 확인 버튼 */
  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "tile-check-btn";
  checkBtn.textContent = "정답 확인";

  checkBtn.addEventListener("click", () => {
    if (userOrder.length !== marker.answer.length) {
      setFeedback(`단어를 ${marker.answer.length}개 모두 배치해 주세요!`, false);
      return;
    }
    const isCorrect = userOrder.every((w, i) => w === marker.answer[i]);
    if (isCorrect) {
      checkBtn.disabled = true;
      setFeedback("🎉 정답입니다!", true);
      markComplete(marker.id);
      setTimeout(() => closeModal("quiz"), 950);
    } else {
      setFeedback("😅 순서가 달라요. 다시 도전해 보세요!", false);
      /* 초기화: 답 영역 타일을 소스로 반환 */
      [...ansArea.querySelectorAll(".tile-btn")].forEach(t => {
        t.remove();
        srcArea.appendChild(makeTile(t.dataset.word, false));
      });
      userOrder.length = 0;
      ansArea.classList.add("empty");
    }
  });

  wrap.append(ansLabel, ansArea, srcLabel, srcArea, checkBtn);
  quizOptions.appendChild(wrap);
}

/* ─── Markers render ───────────────────────────────── */
const markerRefs = [];

function renderMarkers() {
  markerLayer.innerHTML = "";
  markerRefs.length = 0;

  markers.forEach((marker, index) => {
    const done = appState.completedMarkers.includes(marker.id);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `mission-marker${done ? " completed disabled" : ""}`;
    btn.style.left = `${marker.x}%`;
    btn.style.top  = `${marker.y}%`;
    btn.dataset.markerId = String(marker.id);
    btn.setAttribute("aria-label", `이벤트 구역 ${marker.id}`);
    btn.style.setProperty("--marker-delay", `${index * 30}ms`);

    const pin   = document.createElement("div"); pin.className = "marker-pin";
    const inner = document.createElement("div"); inner.className = "marker-inner"; inner.textContent = String(marker.id);
    const stamp = document.createElement("div"); stamp.className = "marker-stamp"; stamp.textContent = "✓";
    btn.append(pin, inner, stamp);

    if (done) {
      btn.disabled = true;
      btn.title = `이벤트 구역 ${marker.id} 완료`;
    } else {
      btn.title = `이벤트 구역 ${marker.id} 미션 열기`;
      btn.addEventListener("click", e => {
        e.stopPropagation();
        openGameModal(marker.id);
      });
    }

    markerLayer.appendChild(btn);
    markerRefs.push({ id: marker.id, element: btn });
  });
}

function refreshMarkerState(markerId, animateStamp = false) {
  const ref = markerRefs.find(r => r.id === markerId);
  if (!ref) return;
  const el   = ref.element;
  const done = appState.completedMarkers.includes(markerId);
  el.classList.toggle("completed", done);
  el.classList.toggle("disabled",  done);
  el.disabled = done;
  if (animateStamp && done) {
    el.classList.remove("stamp-animate");
    void el.offsetWidth;
    el.classList.add("stamp-animate");
  }
}

/* ─── Map pan / zoom ───────────────────────────────── */
const mapState = {
  naturalWidth: 1024, naturalHeight: 1536,
  baseScale: 1, zoom: 1, minZoom: 1, maxZoom: 5,
  offsetX: 0, offsetY: 0,
  drag: { active: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 },
  pinch: { startDistance: 0, startZoom: 1, centerX: 0, centerY: 0, worldX: 0, worldY: 0 },
  pointers: new Map(),
};

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
  if (mapImage.complete && mapImage.naturalWidth) apply();
  else mapImage.addEventListener("load", apply, { once: true });
}

function fitMapToViewport() {
  const { width: vw, height: vh } = mapViewport.getBoundingClientRect();
  mapState.baseScale = Math.min(vw / mapState.naturalWidth, vh / mapState.naturalHeight);
  mapState.zoom = Math.max(mapState.minZoom, Math.min(mapState.zoom, mapState.maxZoom));
  const s = mapState.baseScale * mapState.zoom;
  mapState.offsetX = (vw - mapState.naturalWidth  * s) / 2;
  mapState.offsetY = (vh - mapState.naturalHeight * s) / 2;
  clampOffsets(); applyTransform();
}

function applyTransform() {
  const s = mapState.baseScale * mapState.zoom;
  mapStage.style.transform = `matrix(${s},0,0,${s},${mapState.offsetX},${mapState.offsetY})`;
}

function clampOffsets() {
  const { width: vw, height: vh } = mapViewport.getBoundingClientRect();
  const s  = mapState.baseScale * mapState.zoom;
  const sw = mapState.naturalWidth  * s;
  const sh = mapState.naturalHeight * s;
  mapState.offsetX = Math.min(sw <= vw ? (vw - sw) / 2 : 0, Math.max(Math.min(0, vw - sw), mapState.offsetX));
  mapState.offsetY = Math.min(sh <= vh ? (vh - sh) / 2 : 0, Math.max(Math.min(0, vh - sh), mapState.offsetY));
}

function getDist(p1, p2) { return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY); }
function getMid(p1, p2)  { return { x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 }; }

function zoomAtPoint(nextZoom, cx, cy) {
  const clamped  = Math.min(mapState.maxZoom, Math.max(mapState.minZoom, nextZoom));
  const oldScale = mapState.baseScale * mapState.zoom;
  const newScale = mapState.baseScale * clamped;
  mapState.zoom    = clamped;
  mapState.offsetX = cx - ((cx - mapState.offsetX) / oldScale) * newScale;
  mapState.offsetY = cy - ((cy - mapState.offsetY) / oldScale) * newScale;
  clampOffsets(); applyTransform();
}

function onPointerDown(e) {
  if (e.target.closest(".mission-marker")) return;
  mapViewport.setPointerCapture(e.pointerId);
  mapState.pointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
  if (mapState.pointers.size === 1) {
    Object.assign(mapState.drag, { active: true, startX: e.clientX, startY: e.clientY,
      startOffsetX: mapState.offsetX, startOffsetY: mapState.offsetY });
  }
  if (mapState.pointers.size === 2) {
    const [p1, p2] = [...mapState.pointers.values()];
    const mid = getMid(p1, p2);
    const s   = mapState.baseScale * mapState.zoom;
    Object.assign(mapState.pinch, { startDistance: getDist(p1, p2), startZoom: mapState.zoom,
      centerX: mid.x, centerY: mid.y,
      worldX: (mid.x - mapState.offsetX) / s, worldY: (mid.y - mapState.offsetY) / s });
    mapState.drag.active = false;
  }
}
function onPointerMove(e) {
  if (!mapState.pointers.has(e.pointerId)) return;
  mapState.pointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
  if (mapState.pointers.size === 2) {
    const [p1, p2] = [...mapState.pointers.values()];
    const clamped  = Math.min(mapState.maxZoom, Math.max(mapState.minZoom,
      mapState.pinch.startZoom * (getDist(p1, p2) / mapState.pinch.startDistance)));
    const newScale = mapState.baseScale * clamped;
    mapState.zoom    = clamped;
    mapState.offsetX = mapState.pinch.centerX - mapState.pinch.worldX * newScale;
    mapState.offsetY = mapState.pinch.centerY - mapState.pinch.worldY * newScale;
    clampOffsets(); applyTransform(); return;
  }
  if (mapState.pointers.size === 1 && mapState.drag.active) {
    mapState.offsetX = mapState.drag.startOffsetX + (e.clientX - mapState.drag.startX);
    mapState.offsetY = mapState.drag.startOffsetY + (e.clientY - mapState.drag.startY);
    clampOffsets(); applyTransform();
  }
}
function onPointerUp(e) {
  mapState.pointers.delete(e.pointerId);
  if (mapState.pointers.size === 0) mapState.drag.active = false;
}
function onWheelZoom(e) {
  e.preventDefault();
  const rect = mapViewport.getBoundingClientRect();
  zoomAtPoint(mapState.zoom * (e.deltaY < 0 ? 1.12 : 0.89),
    e.clientX - rect.left, e.clientY - rect.top);
}
function bindMapEvents() {
  mapViewport.addEventListener("pointerdown",   onPointerDown,  { passive: false });
  mapViewport.addEventListener("pointermove",   onPointerMove,  { passive: false });
  mapViewport.addEventListener("pointerup",     onPointerUp);
  mapViewport.addEventListener("pointercancel", onPointerUp);
  mapViewport.addEventListener("wheel",         onWheelZoom,    { passive: false });
  window.addEventListener("resize", () => fitMapToViewport());
}

/* ─── Global events ────────────────────────────────── */
function bindEvents() {
  enterTourBtn?.addEventListener("click", goToSetupScreen);
  nicknameInput?.addEventListener("input", () => {
    nicknameInput.value = nicknameInput.value.replace(/\n/g, "");
    updateStartButtonState();
  });
  nicknameInput?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !tourStartBtn.disabled) startTour();
  });
  tourStartBtn?.addEventListener("click", startTour);
  mypageBtn?.addEventListener("click", () => {
    applyNicknameToUI(); updateProgressUI(); openModal(mypageModal);
  });
  rewardBtn?.addEventListener("click", () => {
    if (getCompletedCount() !== TOTAL_MARKERS) return;
    openModal(rewardModal);
  });

  /* data-close 버튼 통합 처리 */
  document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => closeModal(el.getAttribute("data-close")));
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal("quiz"); closeModal("mypage"); closeModal("reward"); }
  });

  bindMapEvents();
}

/* ─── Init ─────────────────────────────────────────── */
function init() {
  loadState();
  if (appState.nickname) nicknameInput.value = appState.nickname;
  applyNicknameToUI();
  updateProgressUI();
  updateStartButtonState();
  renderMarkers();
  showScreen(introScreen);
}

bindEvents();
init();
