/* ================================================================
   2026 영등포공원 정원소풍 탐험대 — script.js
   ================================================================ */

"use strict";

/* ── 이중-탭 줌 방지 ────────────────────────────────────────────── */
(function preventDoubleTapZoom() {
  let lastTap = 0;
  document.addEventListener("touchend", function (e) {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });
})();

/* ── 인트로 핀치 줌 방지 ────────────────────────────────────────── */
(function preventIntroPinchZoom() {
  document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
  }, { passive: false });
  document.addEventListener("touchmove", function (e) {
    if (e.touches.length > 1) {
      const screen = document.getElementById("introScreen");
      if (screen && !screen.classList.contains("hidden")) e.preventDefault();
    }
  }, { passive: false });
})();

/* ── DOM 참조 ────────────────────────────────────────────────────── */
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

const quizModal      = document.getElementById("quizModal");
const quizCloseBtn   = document.getElementById("quizCloseBtn");
const quizBadge      = document.getElementById("quizBadge");
const quizModalTitle = document.getElementById("quizModalTitle");
const quizQuestion   = document.getElementById("quizQuestion");
const quizOptions    = document.getElementById("quizOptions");
const quizFeedback   = document.getElementById("quizFeedback");

const mypageModal    = document.getElementById("mypageModal");
const mypageName     = document.getElementById("mypageName");
const mypageCompleted = document.getElementById("mypageCompleted");
const mypageRemaining = document.getElementById("mypageRemaining");

const rewardModal    = document.getElementById("rewardModal");

/* ── 상수 ─────────────────────────────────────────────────────────── */
const TOTAL = 8;
const STORAGE_KEY_NICK  = "jeongsopung_nickname";
const STORAGE_KEY_DONE  = "jeongsopung_done";

/* ── 게임 데이터 ──────────────────────────────────────────────────── */
const markers = [
  {
    id: 1, x: 18, y: 19,
    type: "card-match",
    title: "🃏 카드 짝 맞추기",
    desc: "같은 그림의 카드를 모두 찾아 짝을 맞춰보세요!",
    pairs: ["🌸", "🌿", "🦋", "🌷"]
  },
  {
    id: 2, x: 72, y: 28,
    type: "tile-order",
    title: "🔤 낱말 맞추기",
    desc: "섞인 글자를 올바른 순서로 탭하여 낱말을 완성하세요!",
    tiles: ["원", "정", "풍", "소"],
    answer: ["정", "원", "소", "풍"]
  },
  {
    id: 3, x: 55, y: 35,
    type: "spot-diff",
    title: "🔍 다른 그림 찾기",
    desc: "그림들 중 나머지와 다른 하나를 찾아 탭하세요!",
    rounds: [
      { cells: ["🌸","🌸","🌸","🌸","🌸","🌸","🌺","🌸","🌸"], odd: 6 },
      { cells: ["🌿","🌿","🌿","🌿","🍀","🌿","🌿","🌿","🌿"], odd: 4 },
      { cells: ["🦋","🦋","🐝","🦋","🦋","🦋","🦋","🦋","🦋"], odd: 2 }
    ]
  },
  {
    id: 4, x: 40, y: 56,
    type: "seq-memory",
    title: "🧠 순서 기억하기",
    desc: "꽃이 빛나는 순서를 기억했다가 같은 순서로 눌러보세요!",
    sequence: [0, 3, 1, 2],
    emojis: ["🌸", "🌿", "🌷", "🍀"]
  },
  {
    id: 5, x: 24, y: 72,
    type: "shadow-match",
    title: "🌑 그림자 맞추기",
    desc: "실루엣을 보고 어떤 그림인지 골라보세요!",
    rounds: [
      { shadow: "🌸", choices: ["🌻", "🌸", "🌷", "🍀"], answer: 1 },
      { shadow: "🦋", choices: ["🐝", "🐛", "🦋", "🐞"], answer: 2 },
      { shadow: "🌺", choices: ["🌸", "🌺", "🌼", "🌹"], answer: 1 }
    ]
  },
  {
    id: 6, x: 78, y: 70,
    type: "ox-quiz",
    title: "⭕❌ OX 퀴즈",
    desc: "영등포공원과 정원소풍 행사에 관한 퀴즈입니다!",
    questions: [
      { q: "영등포공원은 서울특별시 영등포구에 위치해 있다.", a: true },
      { q: "2026 정원소풍 행사는 3일간 진행된다. (6.12~6.14)", a: true },
      { q: "영등포공원은 과거 맥주 공장 부지였다.", a: true },
      { q: "탐험 완료 보상은 공원 정문 매표소에서 받을 수 있다.", a: false }
    ]
  },
  {
    id: 7, x: 63, y: 83,
    type: "mcq",
    title: "📋 영등포공원 역사 퀴즈",
    desc: "영등포공원은 과거 어떤 시설의 부지였을까요?",
    options: ["🍺 맥주 공장", "🏭 방직 공장", "🚂 기차역", "🏥 병원"],
    answer: 0
  },
  {
    id: 8, x: 52, y: 47,
    type: "word-input",
    title: "🔤 낱말 퀴즈",
    desc: "영등포공원이 위치한 서울시 자치구의 이름은 무엇일까요?",
    hint: "💡 힌트: 공원 이름 앞부분에 답이 있어요!  (예: ○○○구)",
    answers: ["영등포구"]
  }
];

/* ── 상태 ──────────────────────────────────────────────────────────── */
let nickname = "";
let completedIds = new Set();

function loadStorage() {
  try {
    nickname = localStorage.getItem(STORAGE_KEY_NICK) || "";
    const raw = localStorage.getItem(STORAGE_KEY_DONE);
    completedIds = raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    nickname = "";
    completedIds = new Set();
  }
}

function saveStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_NICK, nickname);
    localStorage.setItem(STORAGE_KEY_DONE, JSON.stringify([...completedIds]));
  } catch (e) { /* noop */ }
}

/* ── 화면 전환 ─────────────────────────────────────────────────────── */
function showScreen(id) {
  [introScreen, setupScreen, appScreen].forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ── UI 업데이트 ───────────────────────────────────────────────────── */
function updateStats() {
  const done = completedIds.size;
  const rem  = TOTAL - done;
  completedCount.textContent  = `${done} / ${TOTAL}`;
  remainingCount.textContent  = `${rem}`;
  mypageCompleted.textContent = `${done} / ${TOTAL}`;
  mypageRemaining.textContent = `${rem}`;
  if (done >= TOTAL) {
    rewardBtn.disabled = false;
    rewardBtn.classList.add("reward-active");
  }
  renderMarkers();
}

/* ── 마커 렌더링 ───────────────────────────────────────────────────── */
const floatDurations = ["2.0s","2.8s","2.3s","3.1s","1.9s","2.6s","2.4s","2.7s"];
const floatDelays    = ["0ms","420ms","180ms","760ms","320ms","900ms","55ms","540ms"];

function renderMarkers() {
  markerLayer.innerHTML = "";
  markers.forEach((m, index) => {
    const btn = document.createElement("button");
    btn.className = "mission-marker" + (completedIds.has(m.id) ? " done" : "");
    btn.type = "button";
    btn.setAttribute("aria-label", `구역 ${m.id}`);
    btn.style.left = m.x + "%";
    btn.style.top  = m.y + "%";
    btn.style.setProperty("--marker-float-duration", floatDurations[index] || "2.3s");
    btn.style.setProperty("--marker-delay",          floatDelays[index]    || "0ms");
    btn.innerHTML = completedIds.has(m.id)
      ? `<span class="marker-icon">✅</span><span class="marker-label">${m.id}</span>`
      : `<span class="marker-icon">📍</span><span class="marker-label">${m.id}</span>`;
    btn.addEventListener("click", () => openGameModal(m));
    markerLayer.appendChild(btn);
  });
}

/* ── 지도 Pan & Zoom ────────────────────────────────────────────────── */
const mapState = {
  naturalWidth: 1024,
  naturalHeight: 1536,
  baseScale: 1,
  zoom: 1.3,
  minZoom: 1.0,
  maxZoom: 5,
  panX: 0,
  panY: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
  lastDist: 0
};

function applyTransform() {
  mapStage.style.transform =
    `translate(${mapState.panX}px, ${mapState.panY}px) scale(${mapState.zoom})`;
}

function clampPan() {
  const vpW = mapViewport.clientWidth;
  const vpH = mapViewport.clientHeight;
  const imgW = mapState.baseScale * mapState.zoom * mapState.naturalWidth;
  const imgH = mapState.baseScale * mapState.zoom * mapState.naturalHeight;
  const maxX = Math.max(0, (imgW - vpW) / 2);
  const maxY = Math.max(0, (imgH - vpH) / 2);
  mapState.panX = Math.max(-maxX, Math.min(maxX, mapState.panX));
  mapState.panY = Math.max(-maxY, Math.min(maxY, mapState.panY));
}

function initMap() {
  mapImage.onload = () => {
    mapState.naturalWidth  = mapImage.naturalWidth  || 1024;
    mapState.naturalHeight = mapImage.naturalHeight || 1536;
    mapState.zoom = 1.3;
    mapState.panX = 0;
    mapState.panY = 0;
    applyTransform();
  };
  if (mapImage.complete) {
    mapState.zoom = 1.3;
    mapState.panX = 0;
    mapState.panY = 0;
    applyTransform();
  }

  // 포인터 이벤트 (마우스/터치 드래그)
  mapViewport.addEventListener("pointerdown", onPointerDown);
  mapViewport.addEventListener("pointermove", onPointerMove);
  mapViewport.addEventListener("pointerup",   onPointerUp);
  mapViewport.addEventListener("pointercancel", onPointerUp);
  mapViewport.addEventListener("wheel", onWheel, { passive: false });

  // 터치 핀치 줌
  mapViewport.addEventListener("touchstart",  onTouchStart,  { passive: false });
  mapViewport.addEventListener("touchmove",   onTouchMove,   { passive: false });
  mapViewport.addEventListener("touchend",    onTouchEnd,    { passive: false });
}

function onPointerDown(e) {
  if (e.touches && e.touches.length > 1) return;
  mapState.dragging = true;
  mapState.lastX = e.clientX;
  mapState.lastY = e.clientY;
  mapViewport.setPointerCapture && mapViewport.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!mapState.dragging) return;
  const dx = e.clientX - mapState.lastX;
  const dy = e.clientY - mapState.lastY;
  mapState.panX += dx;
  mapState.panY += dy;
  mapState.lastX = e.clientX;
  mapState.lastY = e.clientY;
  clampPan();
  applyTransform();
}

function onPointerUp() {
  mapState.dragging = false;
}

function onWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  mapState.zoom = Math.max(mapState.minZoom, Math.min(mapState.maxZoom, mapState.zoom * delta));
  clampPan();
  applyTransform();
}

let touchStartDist = 0;
let touchStartZoom = 1;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    touchStartDist = getTouchDist(e.touches);
    touchStartZoom = mapState.zoom;
    mapState.dragging = false;
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist = getTouchDist(e.touches);
    if (touchStartDist > 0) {
      mapState.zoom = Math.max(mapState.minZoom,
        Math.min(mapState.maxZoom, touchStartZoom * (dist / touchStartDist)));
      clampPan();
      applyTransform();
    }
  }
}

function onTouchEnd(e) {
  if (e.touches.length < 2) {
    touchStartDist = 0;
  }
}

/* ── 모달 ─────────────────────────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id + "Modal").classList.remove("hidden");
  document.getElementById(id + "Modal").setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  document.getElementById(id + "Modal").classList.add("hidden");
  document.getElementById(id + "Modal").setAttribute("aria-hidden", "true");
}

document.addEventListener("click", e => {
  const key = e.target.dataset.close;
  if (key) closeModal(key);
});

/* ── 피드백 헬퍼 ─────────────────────────────────────────────────── */
function setFeedback(msg, success) {
  quizFeedback.textContent = msg;
  quizFeedback.style.color = success ? "#357028" : "#C83820";
}

function clearGame() {
  quizOptions.innerHTML = "";
  quizFeedback.textContent = "";
  quizFeedback.style.color = "";
}

/* ── 게임 모달 열기 ───────────────────────────────────────────────── */
function openGameModal(marker) {
  clearGame();
  quizBadge.textContent   = `구역 ${marker.id}`;
  quizModalTitle.textContent = marker.title;
  quizQuestion.textContent   = marker.desc;

  if (completedIds.has(marker.id)) {
    quizOptions.innerHTML = `<p class="quiz-done-msg">✅ 이미 완료한 구역입니다!</p>`;
    openModal("quiz");
    return;
  }

  switch (marker.type) {
    case "mcq":          renderMCQ(marker);         break;
    case "card-match":   renderCardMatch(marker);   break;
    case "word-input":   renderWordInput(marker);   break;
    case "tile-order":   renderTileOrder(marker);   break;
    case "spot-diff":    renderSpotDiff(marker);    break;
    case "seq-memory":   renderSeqMemory(marker);   break;
    case "shadow-match": renderShadowMatch(marker); break;
    case "ox-quiz":      renderOxQuiz(marker);      break;
    default: break;
  }

  openModal("quiz");
}

function markComplete(markerId) {
  completedIds.add(markerId);
  saveStorage();
  updateStats();
}

/* ═══════════════════════════════════════════════════════════════════
   게임 렌더러
═══════════════════════════════════════════════════════════════════ */

/* ── 1. 카드 짝 맞추기 (4쌍 = 8장, 4열) ─────────────────────────── */
function renderCardMatch(marker) {
  const items = [...marker.pairs, ...marker.pairs]
    .map((v, i) => ({ v, i, r: Math.random() }))
    .sort((a, b) => a.r - b.r);

  let first = null, second = null, locked = false, matched = 0;

  const grid = document.createElement("div");
  grid.className = "card-grid";

  items.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="card-inner">
      <div class="card-front">🌱</div>
      <div class="card-back">${item.v}</div>
    </div>`;
    card.addEventListener("click", () => {
      if (locked || card.classList.contains("flipped") || card.classList.contains("matched")) return;
      card.classList.add("flipped");
      if (!first) {
        first = { card, item };
      } else {
        second = { card, item };
        locked = true;
        if (first.item.v === second.item.v) {
          first.card.classList.add("matched");
          second.card.classList.add("matched");
          matched++;
          first = null; second = null; locked = false;
          if (matched === marker.pairs.length) {
            setFeedback("🎉 모든 카드를 맞췄어요! 미션 완료!", true);
            setTimeout(() => markComplete(marker.id), 600);
          }
        } else {
          setTimeout(() => {
            first.card.classList.remove("flipped");
            second.card.classList.remove("flipped");
            first = null; second = null; locked = false;
          }, 900);
        }
      }
    });
    grid.appendChild(card);
  });

  quizOptions.appendChild(grid);
}

/* ── 2. 낱말 맞추기 (타일 순서) ─────────────────────────────────── */
function renderTileOrder(marker) {
  const shuffled = [...marker.tiles].sort(() => Math.random() - 0.5);
  let selected = [];

  const wrap = document.createElement("div");
  wrap.className = "tile-order-wrap";

  // 입력 표시줄
  const display = document.createElement("div");
  display.className = "tile-display";
  display.textContent = "_ ".repeat(marker.answer.length).trim();
  wrap.appendChild(display);

  // 타일 버튼들
  const tileRow = document.createElement("div");
  tileRow.className = "tile-row";
  const btns = [];

  shuffled.forEach(ch => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile-btn";
    btn.textContent = ch;
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.classList.add("tile-used");
      selected.push(ch);
      display.textContent = selected.join(" ");
      if (selected.length === marker.answer.length) {
        const ok = selected.join("") === marker.answer.join("");
        if (ok) {
          setFeedback("🎉 정답이에요! 미션 완료!", true);
          setTimeout(() => markComplete(marker.id), 600);
        } else {
          setFeedback("😅 틀렸어요! 다시 도전해보세요.", false);
          setTimeout(() => {
            selected = [];
            display.textContent = "_ ".repeat(marker.answer.length).trim();
            btns.forEach(b => { b.disabled = false; b.classList.remove("tile-used"); });
          }, 900);
        }
      }
    });
    btns.push(btn);
    tileRow.appendChild(btn);
  });

  wrap.appendChild(tileRow);
  quizOptions.appendChild(wrap);
}

/* ── 3. 다른 그림 찾기 (3라운드) ───────────────────────────────── */
function renderSpotDiff(marker) {
  let round = 0;

  const wrap = document.createElement("div");
  wrap.className = "spot-diff-wrap";

  function showRound() {
    wrap.innerHTML = "";
    if (round >= marker.rounds.length) {
      setFeedback("🎉 모두 찾았어요! 미션 완료!", true);
      setTimeout(() => markComplete(marker.id), 600);
      return;
    }
    const r = marker.rounds[round];
    const info = document.createElement("p");
    info.className = "spot-round-info";
    info.textContent = `라운드 ${round + 1} / ${marker.rounds.length}`;
    wrap.appendChild(info);

    const grid = document.createElement("div");
    grid.className = "spot-diff-grid";
    r.cells.forEach((emoji, idx) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "spot-diff-cell";
      cell.textContent = emoji;
      cell.addEventListener("click", () => {
        if (idx === r.odd) {
          cell.classList.add("spot-correct");
          setFeedback(`✅ 정답! (${round + 1}/${marker.rounds.length})`, true);
          round++;
          setTimeout(showRound, 700);
        } else {
          cell.classList.add("spot-wrong");
          setFeedback("❌ 다시 찾아보세요!", false);
          setTimeout(() => cell.classList.remove("spot-wrong"), 500);
        }
      });
      grid.appendChild(cell);
    });
    wrap.appendChild(grid);
  }

  showRound();
  quizOptions.appendChild(wrap);
}

/* ── 4. 순서 기억하기 (Simon) ───────────────────────────────────── */
function renderSeqMemory(marker) {
  const wrap = document.createElement("div");
  wrap.className = "seq-game-wrap";

  const statusEl = document.createElement("p");
  statusEl.className = "seq-status";
  statusEl.textContent = "순서를 기억하세요…";
  wrap.appendChild(statusEl);

  const grid = document.createElement("div");
  grid.className = "seq-grid";

  const cellBtns = marker.emojis.map((emoji, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "seq-btn";
    btn.textContent = emoji;
    btn.disabled = true;
    grid.appendChild(btn);
    return btn;
  });
  wrap.appendChild(grid);

  quizOptions.appendChild(wrap);

  let playerInput = [];
  let accepting = false;

  function highlightCell(idx, duration) {
    return new Promise(res => {
      cellBtns[idx].classList.add("seq-active");
      setTimeout(() => {
        cellBtns[idx].classList.remove("seq-active");
        res();
      }, duration);
    });
  }

  async function playSequence() {
    accepting = false;
    cellBtns.forEach(b => b.disabled = true);
    statusEl.textContent = "순서를 기억하세요…";
    await new Promise(r => setTimeout(r, 600));
    for (const idx of marker.sequence) {
      await highlightCell(idx, 600);
      await new Promise(r => setTimeout(r, 300));
    }
    statusEl.textContent = "기억한 순서대로 눌러보세요!";
    accepting = true;
    cellBtns.forEach(b => b.disabled = false);
  }

  cellBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!accepting) return;
      playerInput.push(i);
      btn.classList.add("seq-active");
      setTimeout(() => btn.classList.remove("seq-active"), 300);

      const pos = playerInput.length - 1;
      if (playerInput[pos] !== marker.sequence[pos]) {
        accepting = false;
        setFeedback("😅 순서가 틀렸어요! 다시 도전해요.", false);
        playerInput = [];
        setTimeout(playSequence, 1000);
        return;
      }

      if (playerInput.length === marker.sequence.length) {
        accepting = false;
        setFeedback("🎉 완벽해요! 미션 완료!", true);
        setTimeout(() => markComplete(marker.id), 700);
      }
    });
  });

  playSequence();
}

/* ── 5. 그림자 맞추기 (3라운드) ────────────────────────────────── */
function renderShadowMatch(marker) {
  let round = 0;

  const wrap = document.createElement("div");
  wrap.className = "shadow-game-wrap";

  function showRound() {
    wrap.innerHTML = "";
    if (round >= marker.rounds.length) {
      setFeedback("🎉 모두 맞췄어요! 미션 완료!", true);
      setTimeout(() => markComplete(marker.id), 600);
      return;
    }
    const r = marker.rounds[round];

    const info = document.createElement("p");
    info.className = "spot-round-info";
    info.textContent = `라운드 ${round + 1} / ${marker.rounds.length}`;
    wrap.appendChild(info);

    const shadowEl = document.createElement("div");
    shadowEl.className = "shadow-emoji";
    shadowEl.textContent = r.shadow;
    wrap.appendChild(shadowEl);

    const hint = document.createElement("p");
    hint.className = "shadow-hint";
    hint.textContent = "이 그림자의 정체는?";
    wrap.appendChild(hint);

    const choiceRow = document.createElement("div");
    choiceRow.className = "shadow-choices";
    r.choices.forEach((emoji, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shadow-choice-btn";
      btn.textContent = emoji;
      btn.addEventListener("click", () => {
        if (idx === r.answer) {
          btn.classList.add("shadow-correct");
          setFeedback(`✅ 정답! (${round + 1}/${marker.rounds.length})`, true);
          round++;
          setTimeout(showRound, 700);
        } else {
          btn.classList.add("shadow-wrong");
          setFeedback("❌ 다시 골라보세요!", false);
          setTimeout(() => btn.classList.remove("shadow-wrong"), 500);
        }
      });
      choiceRow.appendChild(btn);
    });
    wrap.appendChild(choiceRow);
  }

  showRound();
  quizOptions.appendChild(wrap);
}

/* ── 6. OX 퀴즈 (4문항) ────────────────────────────────────────── */
function renderOxQuiz(marker) {
  let qIdx = 0;

  const wrap = document.createElement("div");
  wrap.className = "ox-game-wrap";

  function showQuestion() {
    wrap.innerHTML = "";
    if (qIdx >= marker.questions.length) {
      setFeedback("🎉 모두 맞췄어요! 미션 완료!", true);
      setTimeout(() => markComplete(marker.id), 600);
      return;
    }
    const q = marker.questions[qIdx];

    const info = document.createElement("p");
    info.className = "spot-round-info";
    info.textContent = `${qIdx + 1} / ${marker.questions.length}`;
    wrap.appendChild(info);

    const qEl = document.createElement("p");
    qEl.className = "ox-question";
    qEl.textContent = q.q;
    wrap.appendChild(qEl);

    const btnRow = document.createElement("div");
    btnRow.className = "ox-btn-row";

    ["⭕", "❌"].forEach((label, i) => {
      const answer = i === 0; // ⭕ = true, ❌ = false
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ox-btn ox-btn--" + (answer ? "o" : "x");
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (answer === q.a) {
          setFeedback(`✅ 정답! (${qIdx + 1}/${marker.questions.length})`, true);
          qIdx++;
          setTimeout(showQuestion, 800);
        } else {
          setFeedback("❌ 틀렸어요! 다시 도전해요.", false);
          setTimeout(() => {
            qIdx = 0;
            quizFeedback.textContent = "";
            showQuestion();
          }, 900);
        }
      });
      btnRow.appendChild(btn);
    });

    wrap.appendChild(btnRow);
  }

  showQuestion();
  quizOptions.appendChild(wrap);
}

/* ── 7. 4지선다 ─────────────────────────────────────────────────── */
function renderMCQ(marker) {
  const wrap = document.createElement("div");
  wrap.className = "mcq-wrap";

  marker.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mcq-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (i === marker.answer) {
        btn.classList.add("mcq-correct");
        setFeedback("🎉 정답이에요! 미션 완료!", true);
        wrap.querySelectorAll(".mcq-option").forEach(b => b.disabled = true);
        setTimeout(() => markComplete(marker.id), 700);
      } else {
        btn.classList.add("mcq-wrong");
        setFeedback("😅 틀렸어요! 다시 골라보세요.", false);
        setTimeout(() => btn.classList.remove("mcq-wrong"), 600);
      }
    });
    wrap.appendChild(btn);
  });

  quizOptions.appendChild(wrap);
}

/* ── 8. 낱말 직접 입력 ──────────────────────────────────────────── */
function renderWordInput(marker) {
  const wrap = document.createElement("div");
  wrap.className = "word-input-wrap";

  if (marker.hint) {
    const hint = document.createElement("p");
    hint.className = "word-hint";
    hint.textContent = marker.hint;
    wrap.appendChild(hint);
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "word-input";
  input.placeholder = "정답을 입력하세요";
  input.autocomplete = "off";
  wrap.appendChild(input);

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "word-submit-btn";
  submitBtn.textContent = "확인";
  submitBtn.addEventListener("click", () => {
    const val = input.value.trim();
    const ok = marker.answers.some(a => a === val);
    if (ok) {
      setFeedback("🎉 정답이에요! 미션 완료!", true);
      input.disabled = true;
      submitBtn.disabled = true;
      setTimeout(() => markComplete(marker.id), 700);
    } else {
      setFeedback("😅 틀렸어요! 다시 입력해보세요.", false);
      input.value = "";
    }
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") submitBtn.click();
  });
  wrap.appendChild(submitBtn);
  quizOptions.appendChild(wrap);
}

/* ── 인트로 화면 ─────────────────────────────────────────────────── */
enterTourBtn.addEventListener("click", () => {
  loadStorage();
  if (nickname) {
    showScreen("appScreen");
    accountName.textContent = nickname;
    mypageName.textContent  = nickname;
    updateStats();
    initMap();
  } else {
    showScreen("setupScreen");
  }
});

/* ── 셋업 화면 ──────────────────────────────────────────────────── */
nicknameInput.addEventListener("input", () => {
  tourStartBtn.disabled = nicknameInput.value.trim().length === 0;
});

tourStartBtn.addEventListener("click", () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return;
  nickname = nick;
  saveStorage();
  accountName.textContent = nickname;
  mypageName.textContent  = nickname;
  showScreen("appScreen");
  updateStats();
  initMap();
});

/* ── 마이페이지 ─────────────────────────────────────────────────── */
mypageBtn.addEventListener("click", () => {
  mypageName.textContent      = nickname || "-";
  mypageCompleted.textContent = `${completedIds.size} / ${TOTAL}`;
  mypageRemaining.textContent = `${TOTAL - completedIds.size}`;
  openModal("mypage");
});

/* ── 보상 ────────────────────────────────────────────────────────── */
rewardBtn.addEventListener("click", () => {
  if (completedIds.size >= TOTAL) openModal("reward");
});

/* ── 초기화 ──────────────────────────────────────────────────────── */
(function init() {
  loadStorage();
  // 인트로 화면이 기본
  introScreen.classList.remove("hidden");
  setupScreen.classList.add("hidden");
  appScreen.classList.add("hidden");
})();
