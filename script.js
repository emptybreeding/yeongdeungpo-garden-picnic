/* ================================================================
   2026 영등포공원 정원소풍 탐험대 — script.js
   ================================================================ */

"use strict";

/* ── 더블탭 줌 방지 ─────────────────────────────────────────────── */
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

/* ── DOM refs ────────────────────────────────────────────────────── */
const introScreen     = document.getElementById("introScreen");
const setupScreen     = document.getElementById("setupScreen");
const appScreen       = document.getElementById("appScreen");
const enterTourBtn    = document.getElementById("enterTourBtn");
const nicknameInput   = document.getElementById("nicknameInput");
const tourStartBtn    = document.getElementById("tourStartBtn");
const accountName     = document.getElementById("accountName");
const completedCount  = document.getElementById("completedCount");
const remainingCount  = document.getElementById("remainingCount");
const mypageBtn       = document.getElementById("mypageBtn");
const rewardBtn       = document.getElementById("rewardBtn");
const mapViewport     = document.getElementById("mapViewport");
const mapStage        = document.getElementById("mapStage");
const mapImage        = document.getElementById("mapImage");
const markerLayer     = document.getElementById("markerLayer");
const mypageModal     = document.getElementById("mypageModal");
const mypageName      = document.getElementById("mypageName");
const mypageCompleted = document.getElementById("mypageCompleted");
const mypageRemaining = document.getElementById("mypageRemaining");
const quizModal       = document.getElementById("quizModal");
const quizBadge       = document.getElementById("quizBadge");
const quizModalTitle  = document.getElementById("quizModalTitle");
const quizQuestion    = document.getElementById("quizQuestion");
const quizOptions     = document.getElementById("quizOptions");
const quizFeedback    = document.getElementById("quizFeedback");
const rewardModal     = document.getElementById("rewardModal");

/* ── 상수 ───────────────────────────────────────────────────────── */
const STORAGE_KEY   = "yeongdeungpo_garden_picnic_2026_state";
const TOTAL_MARKERS = 8;

/* ── 앱 상태 ────────────────────────────────────────────────────── */
const appState = {
  nickname: "",
  completedMarkers: [],
  activeMarkerId: null,
};

/* ════════════════════════════════════════════════════════════════
   미션 데이터 — 8가지 독립 유형
   type: "card-match" | "tile-order" | "spot-diff" | "seq-memory"
         "shadow-match" | "ox-quiz" | "mcq" | "word-input"
================================================================ */
const markers = [

  /* ① 카드 짝 맞추기 (4쌍 = 8장) */
  {
    id: 1, x: 18, y: 19,
    type: "card-match",
    title: "🃏 카드 짝 맞추기",
    desc: "같은 그림의 카드 두 장을 찾아 모두 맞춰보세요!",
    pairs: ["🌸", "🌿", "🦋", "🌷"],
  },

  /* ② 낱말 맞추기 (타일 순서) */
  {
    id: 2, x: 72, y: 54,
    type: "tile-order",
    title: "🔤 낱말 맞추기",
    desc: "단어를 올바른 순서로 배열해 행사 타이틀을 완성하세요!",
    tiles: ["정원소풍", "영등포공원", "2026"],
    answer: ["2026", "영등포공원", "정원소풍"],
  },

  /* ③ 다른 그림 찾기 (3라운드) */
  {
    id: 3, x: 55, y: 35,
    type: "spot-diff",
    title: "🔍 다른 그림 찾기",
    desc: "그림들 중 나머지와 다른 하나를 찾아 탭하세요!",
    rounds: [
      { cells: ["🌸","🌸","🌸","🌸","🌸","🌸","🌺","🌸","🌸"], odd: 6 },
      { cells: ["🌿","🌿","🌿","🌿","🍀","🌿","🌿","🌿","🌿"], odd: 4 },
      { cells: ["🦋","🦋","🐝","🦋","🦋","🦋","🦋","🦋","🦋"], odd: 2 },
    ],
  },

  /* ④ 순서 기억하기 (Simon) */
  {
    id: 4, x: 40, y: 56,
    type: "seq-memory",
    title: "🧠 순서 기억하기",
    desc: "꽃이 빛나는 순서를 기억했다가 같은 순서로 눌러보세요!",
    sequence: [0, 3, 1, 2],
    emojis: ["🌸", "🌿", "🌷", "🍀"],
  },

  /* ⑤ 그림자 맞추기 (3라운드) */
  {
    id: 5, x: 24, y: 72,
    type: "shadow-match",
    title: "🌑 그림자 맞추기",
    desc: "실루엣을 보고 어떤 그림인지 골라보세요!",
    rounds: [
      { shadow: "🌸", choices: ["🌻","🌸","🌷","🍀"], answer: 1 },
      { shadow: "🦋", choices: ["🐝","🐛","🦋","🐞"], answer: 2 },
      { shadow: "🌺", choices: ["🌸","🌺","🌼","🌹"], answer: 1 },
    ],
  },

  /* ⑥ OX 퀴즈 (4문항) */
  {
    id: 6, x: 78, y: 70,
    type: "ox-quiz",
    title: "⭕❌ OX 퀴즈",
    desc: "영등포공원과 정원소풍 행사에 관한 퀴즈입니다!",
    questions: [
      { q: "영등포공원은 서울특별시 영등포구에 위치해 있다.", a: true },
      { q: "2026 정원소풍 행사는 3일간 진행된다. (6.12~6.14)", a: true },
      { q: "영등포공원은 과거 맥주 공장 부지였다.", a: true },
      { q: "탐험 완료 보상은 공원 정문 매표소에서 받을 수 있다.", a: false },
    ],
  },

  /* ⑦ 4지선다 (영등포공원 역사) */
  {
    id: 7, x: 63, y: 70,
    type: "mcq",
    title: "📋 영등포공원 역사 퀴즈",
    desc: "영등포공원은 과거 어떤 시설의 부지였을까요?",
    options: ["🍺 맥주 공장", "🏭 방직 공장", "🚂 기차역", "🏥 병원"],
    answer: 0,
  },

  /* ⑧ 낱말 직접 입력 */
  {
    id: 8, x: 52, y: 47,
    type: "word-input",
    title: "🔤 낱말 퀴즈",
    desc: "영등포공원이 위치한 서울시 자치구의 이름은 무엇일까요?",
    hint: "💡 힌트: 공원 이름 앞부분에 답이 있어요!  (예: ○○○구)",
    answers: ["영등포구"],
  },
];

/* ── Storage ─────────────────────────────────────────────────── */
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
    appState.nickname         = typeof p.nickname === "string" ? p.nickname : "";
    appState.completedMarkers = Array.isArray(p.completedMarkers)
      ? p.completedMarkers.filter(Number.isInteger) : [];
  } catch (e) { /* noop */ }
}

/* ── UI helpers ──────────────────────────────────────────────── */
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

/* ── Screens ──────────────────────────────────────────────────── */
function goToSetupScreen() {
  showScreen(setupScreen);
  setTimeout(() => nicknameInput.focus(), 50);
}
function startTour() {
  const nick = sanitizeNickname(nicknameInput.value);
  if (!nick) { tourStartBtn.disabled = true; return; }
  appState.nickname = nick;
  saveState();
  applyNicknameToUI();
  updateProgressUI();
  renderMarkers();
  showScreen(appScreen);
  requestAnimationFrame(() => setupMapDimensions());
}

/* ── Modal helpers ───────────────────────────────────────────── */
function openModal(el) {
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}
function closeModal(type) {
  if (type === "quiz") {
    quizModal.classList.add("hidden");
    quizModal.setAttribute("aria-hidden", "true");
    quizOptions.innerHTML  = "";
    quizFeedback.textContent = "";
    quizFeedback.style.color = "";
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

/* ── 미션 완료 공통 처리 ──────────────────────────────────────── */
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
  quizFeedback.style.color = success ? "#357028" : "#C83820";
}

/* ════════════════════════════════════════════════════════════════
   게임 열기 — 유형 분기
================================================================ */
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

  if (appState.completedMarkers.includes(markerId)) {
    quizOptions.innerHTML = `<p class="quiz-done-msg">✅ 이미 완료한 구역입니다!</p>`;
    openModal(quizModal);
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

  openModal(quizModal);
}

/* ════════════════════════════════════════════════════════════════
   ① MCQ — 4지선다
================================================================ */
function renderMCQ(marker) {
  marker.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      quizOptions.querySelectorAll(".quiz-option-btn").forEach(b => { b.disabled = true; });
      if (idx === marker.answer) {
        btn.classList.add("correct");
        setFeedback("🎉 정답입니다!", true);
        markComplete(marker.id);
        setTimeout(() => closeModal("quiz"), 900);
      } else {
        btn.classList.add("wrong");
        setFeedback("😅 오답이에요. 다시 도전해 보세요!", false);
        setTimeout(() => openGameModal(marker.id), 950);
      }
    });
    quizOptions.appendChild(btn);
  });
}

/* ════════════════════════════════════════════════════════════════
   ② 카드 매칭 — 짝 찾기 (4쌍 = 8장)
================================================================ */
function renderCardMatch(marker) {
  const deck = [...marker.pairs, ...marker.pairs]
    .map((emoji, i) => ({ emoji, id: i }))
    .sort(() => Math.random() - 0.5);

  let flipped  = [];
  let matched  = 0;
  let checking = false;

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
          setTimeout(() => {
            a.classList.add("matched");
            b.classList.add("matched");
            flipped = []; matched++; checking = false;
            statusEl.textContent = `${matched} / ${marker.pairs.length} 쌍 완료`;
            if (matched === marker.pairs.length) {
              setFeedback("🎉 모두 맞췄어요! 훌륭해요!", true);
              markComplete(marker.id);
              setTimeout(() => closeModal("quiz"), 1100);
            }
          }, 500);
        } else {
          setTimeout(() => {
            a.classList.remove("flipped");
            b.classList.remove("flipped");
            flipped = []; checking = false;
          }, 900);
        }
      }
    });

    grid.appendChild(card);
  });

  quizOptions.append(grid, statusEl);
}

/* ════════════════════════════════════════════════════════════════
   ③ 낱말 퀴즈 — 텍스트 입력
================================================================ */
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
      input.disabled = true; btn.disabled = true;
      setFeedback("🎉 정답입니다!", true);
      markComplete(marker.id);
      setTimeout(() => closeModal("quiz"), 950);
    } else {
      setFeedback("😅 틀렸어요. 다시 도전해 보세요!", false);
      input.value = "";
      setTimeout(() => input.focus(), 50);
    }
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });

  wrap.append(input, btn);
  quizOptions.appendChild(wrap);
  setTimeout(() => input.focus(), 120);
}

/* ════════════════════════════════════════════════════════════════
   ④ 순서 퍼즐 — 타일 배열
================================================================ */
function renderTileOrder(marker) {
  const wrap = document.createElement("div");
  wrap.className = "tile-order-wrap";

  const ansLabel = document.createElement("p");
  ansLabel.className = "tile-area-label";
  ansLabel.textContent = "내 답 (순서대로 탭하세요)";

  const ansArea = document.createElement("div");
  ansArea.className = "tile-answer-area empty";

  const srcLabel = document.createElement("p");
  srcLabel.className = "tile-area-label";
  srcLabel.textContent = "단어 목록";

  const srcArea = document.createElement("div");
  srcArea.className = "tile-source-area";

  const userOrder = [];

  function makeTile(text, inAnswer) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile-btn" + (inAnswer ? " in-answer" : "");
    tile.textContent = text;
    tile.dataset.word = text;
    tile.addEventListener("click", () => {
      if (inAnswer) {
        tile.remove();
        userOrder.splice(userOrder.indexOf(text), 1);
        srcArea.appendChild(makeTile(text, false));
        if (ansArea.children.length === 0) ansArea.classList.add("empty");
      } else {
        tile.remove();
        userOrder.push(text);
        ansArea.classList.remove("empty");
        ansArea.appendChild(makeTile(text, true));
      }
    });
    return tile;
  }

  const shuffled = [...marker.tiles].sort(() => Math.random() - 0.5);
  shuffled.forEach(t => srcArea.appendChild(makeTile(t, false)));

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

/* ════════════════════════════════════════════════════════════════
   ⑤ 다른 그림 찾기 (3라운드)
================================================================ */
function renderSpotDiff(marker) {
  let round = 0;

  const wrap = document.createElement("div");
  wrap.className = "spot-diff-wrap";
  quizOptions.appendChild(wrap);

  function showRound() {
    wrap.innerHTML = "";
    if (round >= marker.rounds.length) {
      setFeedback("🎉 모두 찾았어요! 미션 완료!", true);
      markComplete(marker.id);
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
}

/* ════════════════════════════════════════════════════════════════
   ⑥ 순서 기억하기 (Simon)
================================================================ */
function renderSeqMemory(marker) {
  const wrap = document.createElement("div");
  wrap.className = "seq-game-wrap";
  quizOptions.appendChild(wrap);

  const statusEl = document.createElement("p");
  statusEl.className = "seq-status";
  statusEl.textContent = "순서를 기억하세요…";
  wrap.appendChild(statusEl);

  const grid = document.createElement("div");
  grid.className = "seq-grid";

  const cellBtns = marker.emojis.map((emoji) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "seq-btn";
    btn.textContent = emoji;
    btn.disabled = true;
    grid.appendChild(btn);
    return btn;
  });
  wrap.appendChild(grid);

  let playerInput = [];
  let accepting   = false;

  function highlightCell(idx, duration) {
    return new Promise(res => {
      cellBtns[idx].classList.add("seq-active");
      setTimeout(() => { cellBtns[idx].classList.remove("seq-active"); res(); }, duration);
    });
  }

  async function playSequence() {
    accepting = false;
    playerInput = [];
    cellBtns.forEach(b => { b.disabled = true; });
    statusEl.textContent = "순서를 기억하세요…";
    await new Promise(r => setTimeout(r, 600));
    for (const idx of marker.sequence) {
      await highlightCell(idx, 600);
      await new Promise(r => setTimeout(r, 300));
    }
    statusEl.textContent = "기억한 순서대로 눌러보세요!";
    accepting = true;
    cellBtns.forEach(b => { b.disabled = false; });
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
        setTimeout(playSequence, 1000);
        return;
      }
      if (playerInput.length === marker.sequence.length) {
        accepting = false;
        setFeedback("🎉 완벽해요! 미션 완료!", true);
        markComplete(marker.id);
      }
    });
  });

  playSequence();
}

/* ════════════════════════════════════════════════════════════════
   ⑦ 그림자 맞추기 (3라운드)
================================================================ */
function renderShadowMatch(marker) {
  let round = 0;

  const wrap = document.createElement("div");
  wrap.className = "shadow-game-wrap";
  quizOptions.appendChild(wrap);

  function showRound() {
    wrap.innerHTML = "";
    if (round >= marker.rounds.length) {
      setFeedback("🎉 모두 맞췄어요! 미션 완료!", true);
      markComplete(marker.id);
      return;
    }
    const r = marker.rounds[round];

    const info = document.createElement("p");
    info.className = "spot-round-info";
    info.textContent = `라운드 ${round + 1} / ${marker.rounds.length}`;
    wrap.appendChild(info);

    const shadowEl = document.createElement("span");
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
}

/* ════════════════════════════════════════════════════════════════
   ⑧ OX 퀴즈 (4문항)
================================================================ */
function renderOxQuiz(marker) {
  let qIdx = 0;

  const wrap = document.createElement("div");
  wrap.className = "ox-game-wrap";
  quizOptions.appendChild(wrap);

  function showQuestion() {
    wrap.innerHTML = "";
    if (qIdx >= marker.questions.length) {
      setFeedback("🎉 모두 맞췄어요! 미션 완료!", true);
      markComplete(marker.id);
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

    [{ label: "⭕", val: true }, { label: "❌", val: false }].forEach(({ label, val }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ox-btn ox-btn--" + (val ? "o" : "x");
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (val === q.a) {
          setFeedback(`✅ 정답! (${qIdx + 1}/${marker.questions.length})`, true);
          qIdx++;
          setTimeout(showQuestion, 800);
        } else {
          setFeedback("❌ 틀렸어요! 처음부터 다시 도전해요.", false);
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
}

/* ════════════════════════════════════════════════════════════════
   마커 렌더링
================================================================ */
const floatDurations = ["2.0s","2.8s","2.3s","3.1s","1.9s","2.6s","2.4s","2.7s"];
const floatDelays    = ["0ms","420ms","180ms","760ms","320ms","900ms","55ms","540ms"];
const markerRefs     = [];

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
    btn.style.setProperty("--marker-float-duration", floatDurations[index] || "2.3s");
    btn.style.setProperty("--marker-delay",          floatDelays[index]    || "0ms");

    /* 뱃지 내부: 번호 + 완료 스탬프 */
    const inner = document.createElement("span");
    inner.className = "marker-inner";
    inner.textContent = String(marker.id);

    const stamp = document.createElement("span");
    stamp.className = "marker-stamp";
    stamp.textContent = "✓";

    btn.append(inner, stamp);

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

/* ════════════════════════════════════════════════════════════════
   지도 Pan & Zoom
================================================================ */
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
  mapState.zoom      = 1.5;   /* 초기 150% */
  const s = mapState.baseScale * mapState.zoom;
  /* 지도 55% 지점이 뷰포트 중앙에 오도록 offsetX 설정 */
  mapState.offsetX = vw * 0.5 - mapState.naturalWidth  * s * 0.45;
  /* top -50px */
  mapState.offsetY = 200;
  clampOffsets();
  applyTransform();
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

  /* X축: 지도가 뷰포트보다 넓으면 [vw-sw .. 0], 좁으면 [0 .. vw-sw] */
  if (sw >= vw) {
    mapState.offsetX = Math.max(vw - sw, Math.min(0, mapState.offsetX));
  } else {
    mapState.offsetX = Math.max(0, Math.min(vw - sw, mapState.offsetX));
  }

  /* Y축: 지도가 뷰포트보다 높으면 [vh-sh .. 0], 낮으면 [0 .. vh-sh] */
  if (sh >= vh) {
    mapState.offsetY = Math.max(vh - sh, Math.min(0, mapState.offsetY));
  } else {
    mapState.offsetY = Math.max(0, Math.min(vh - sh, mapState.offsetY));
  }
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
  clampOffsets();
  applyTransform();
}

function onPointerDown(e) {
  if (e.target.closest(".mission-marker")) return;
  mapViewport.setPointerCapture(e.pointerId);
  mapState.pointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
  if (mapState.pointers.size === 1) {
    Object.assign(mapState.drag, {
      active: true, startX: e.clientX, startY: e.clientY,
      startOffsetX: mapState.offsetX, startOffsetY: mapState.offsetY,
    });
  }
  if (mapState.pointers.size === 2) {
    const [p1, p2] = [...mapState.pointers.values()];
    const mid = getMid(p1, p2);
    const s   = mapState.baseScale * mapState.zoom;
    Object.assign(mapState.pinch, {
      startDistance: getDist(p1, p2), startZoom: mapState.zoom,
      centerX: mid.x, centerY: mid.y,
      worldX: (mid.x - mapState.offsetX) / s, worldY: (mid.y - mapState.offsetY) / s,
    });
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

/* ── 전역 이벤트 바인딩 ──────────────────────────────────────── */
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
    if (e.key === "Escape") {
      closeModal("quiz"); closeModal("mypage"); closeModal("reward");
    }
  });

  bindMapEvents();
}

/* ── 초기화 ──────────────────────────────────────────────────── */
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
