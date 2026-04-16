const introScreen = document.getElementById("introScreen");
const setupScreen = document.getElementById("setupScreen");
const appScreen = document.getElementById("appScreen");

const enterTourBtn = document.getElementById("enterTourBtn");
const nicknameInput = document.getElementById("nicknameInput");
const tourStartBtn = document.getElementById("tourStartBtn");

const accountName = document.getElementById("accountName");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");

const mypageBtn = document.getElementById("mypageBtn");
const rewardBtn = document.getElementById("rewardBtn");
const markerLayer = document.getElementById("markerLayer");

const mypageModal = document.getElementById("mypageModal");
const mypageName = document.getElementById("mypageName");
const mypageCompleted = document.getElementById("mypageCompleted");
const mypageRemaining = document.getElementById("mypageRemaining");

const quizModal = document.getElementById("quizModal");
const quizBadge = document.getElementById("quizBadge");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");

const rewardModal = document.getElementById("rewardModal");

const STORAGE_KEY = "yeongdeungpo_garden_picnic_2026_state";
const TOTAL_MARKERS = 8;

const appState = {
  nickname: "",
  completedMarkers: [],
  activeQuizId: null,
};

const markers = [
  {
    id: 1,
    x: 18,
    y: 19,
    question: "정원소풍의 분위기와 가장 잘 어울리는 활동은 무엇일까요?",
    options: ["자연 속 산책과 체험", "자동차 경주", "비행 훈련", "실내 시험"],
    answer: 0,
  },
  {
    id: 2,
    x: 72,
    y: 28,
    question: "이 웹사이트의 투어 방식은 무엇인가요?",
    options: ["지도 위 마커를 눌러 퀴즈를 푼다", "오프라인 종이 제출만 한다", "영상만 시청한다", "전화로만 참여한다"],
    answer: 0,
  },
  {
    id: 3,
    x: 55,
    y: 35,
    question: "닉네임은 어느 단계에서 입력하나요?",
    options: ["셋업 페이지", "보상 팝업", "마이페이지", "인트로 하단"],
    answer: 0,
  },
  {
    id: 4,
    x: 40,
    y: 56,
    question: "마커 퀴즈를 맞히면 해당 마커는 어떻게 되나요?",
    options: ["비활성화된다", "두 배로 늘어난다", "사라졌다 다시 생긴다", "랜덤 위치로 이동한다"],
    answer: 0,
  },
  {
    id: 5,
    x: 24,
    y: 72,
    question: "앱 페이지 상단에서 확인할 수 있는 정보가 아닌 것은?",
    options: ["남은 여행지", "완료 수", "마이페이지", "계좌번호"],
    answer: 3,
  },
  {
    id: 6,
    x: 78,
    y: 70,
    question: "모든 퀴즈를 완료하면 어떤 버튼이 활성화되나요?",
    options: ["투어 코스 보상 받기", "로그인하기", "위치 재설정", "회원탈퇴"],
    answer: 0,
  },
  {
    id: 7,
    x: 63,
    y: 83,
    question: "보상 안내 팝업의 내용은 무엇인가요?",
    options: ["안내소에 방문해 팝업을 보여주면 선물 교환", "앱을 삭제하면 상품 지급", "이메일 전송 후 당일 택배 수령", "자동 계좌 입금"],
    answer: 0,
  },
  {
    id: 8,
    x: 52,
    y: 47,
    question: "이 프로젝트의 행사 타이틀은 무엇인가요?",
    options: ["2026 영등포공원 정원소풍", "2025 경기문화재단 스탬프투어", "한강 야간마라톤", "서울 봄꽃 걷기"],
    answer: 0,
  },
];

function sanitizeNickname(value) {
  return value.replace(/\s+/g, " ").trim().slice(0, 12);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    appState.nickname =
      typeof parsed.nickname === "string" ? parsed.nickname : "";

    appState.completedMarkers = Array.isArray(parsed.completedMarkers)
      ? parsed.completedMarkers.filter((id) => Number.isInteger(id))
      : [];
  } catch (error) {
    console.error("저장된 데이터를 불러오지 못했습니다.", error);
  }
}

function showScreen(targetScreen) {
  introScreen.classList.add("hidden");
  setupScreen.classList.add("hidden");
  appScreen.classList.add("hidden");

  targetScreen.classList.remove("hidden");
}

function updateStartButtonState() {
  const nickname = sanitizeNickname(nicknameInput.value);
  tourStartBtn.disabled = nickname.length === 0;
}

function getCompletedCount() {
  return appState.completedMarkers.length;
}

function getRemainingCount() {
  return TOTAL_MARKERS - getCompletedCount();
}

function applyNicknameToUI() {
  const safeName = appState.nickname || "게스트";
  accountName.textContent = safeName;
  mypageName.textContent = safeName;
}

function updateProgressUI() {
  const completed = getCompletedCount();
  const remaining = getRemainingCount();

  completedCount.textContent = `${completed} / ${TOTAL_MARKERS}`;
  remainingCount.textContent = String(remaining);

  mypageCompleted.textContent = `${completed} / ${TOTAL_MARKERS}`;
  mypageRemaining.textContent = String(remaining);

  const isAllCompleted = completed === TOTAL_MARKERS;

  rewardBtn.disabled = !isAllCompleted;

  if (isAllCompleted) {
    rewardBtn.classList.add("reward-active");
  } else {
    rewardBtn.classList.remove("reward-active");
  }
}

function renderMarkers() {
  markerLayer.innerHTML = "";

  markers.forEach((marker) => {
    const isCompleted = appState.completedMarkers.includes(marker.id);

    const markerButton = document.createElement("button");
    markerButton.type = "button";
    markerButton.className = `map-marker${isCompleted ? " disabled" : ""}`;
    markerButton.style.left = `${marker.x}%`;
    markerButton.style.top = `${marker.y}%`;
    markerButton.textContent = String(marker.id);
    markerButton.setAttribute("aria-label", `이벤트 구역 ${marker.id}`);
    markerButton.dataset.markerId = String(marker.id);

    if (isCompleted) {
      markerButton.disabled = true;
      markerButton.title = `이벤트 구역 ${marker.id} 완료`;
    } else {
      markerButton.title = `이벤트 구역 ${marker.id} 퀴즈 열기`;
      markerButton.addEventListener("click", () => {
        openQuizModal(marker.id);
      });
    }

    markerLayer.appendChild(markerButton);
  });
}

function openQuizModal(markerId) {
  const quiz = markers.find((item) => item.id === markerId);
  if (!quiz) return;

  appState.activeQuizId = markerId;

  quizBadge.textContent = `이벤트 구역 ${quiz.id}`;
  quizQuestion.textContent = quiz.question;
  quizFeedback.textContent = "";
  quizOptions.innerHTML = "";

  quiz.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option-btn";
    button.textContent = option;

    button.addEventListener("click", () => {
      handleQuizAnswer(quiz, index, button);
    });

    quizOptions.appendChild(button);
  });

  quizModal.classList.remove("hidden");
  quizModal.setAttribute("aria-hidden", "false");
}

function handleQuizAnswer(quiz, selectedIndex, clickedButton) {
  const optionButtons = Array.from(
    quizOptions.querySelectorAll(".quiz-option-btn")
  );

  optionButtons.forEach((button) => {
    button.disabled = true;
  });

  if (selectedIndex === quiz.answer) {
    clickedButton.classList.add("correct");
    quizFeedback.textContent = "정답입니다! 해당 구역을 완료했어요.";

    if (!appState.completedMarkers.includes(quiz.id)) {
      appState.completedMarkers.push(quiz.id);
      appState.completedMarkers.sort((a, b) => a - b);
      saveState();
    }

    updateProgressUI();
    renderMarkers();

    window.setTimeout(() => {
      closeModal("quiz");
    }, 850);
  } else {
    clickedButton.classList.add("wrong");
    quizFeedback.textContent = "오답입니다. 다시 한 번 도전해 보세요.";

    window.setTimeout(() => {
      openQuizModal(quiz.id);
    }, 850);
  }
}

function openMyPageModal() {
  applyNicknameToUI();
  updateProgressUI();
  mypageModal.classList.remove("hidden");
  mypageModal.setAttribute("aria-hidden", "false");
}

function openRewardModal() {
  if (getCompletedCount() !== TOTAL_MARKERS) return;

  rewardModal.classList.remove("hidden");
  rewardModal.setAttribute("aria-hidden", "false");
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

function goToSetupScreen() {
  showScreen(setupScreen);
  window.setTimeout(() => {
    nicknameInput.focus();
  }, 50);
}

function startTour() {
  const nickname = sanitizeNickname(nicknameInput.value);

  if (!nickname) {
    tourStartBtn.disabled = true;
    return;
  }

  appState.nickname = nickname;
  saveState();

  applyNicknameToUI();
  updateProgressUI();
  renderMarkers();

  showScreen(appScreen);
}

function bindModalCloseEvents() {
  document.querySelectorAll("[data-close]").forEach((element) => {
    element.addEventListener("click", () => {
      const type = element.getAttribute("data-close");
      closeModal(type);
    });
  });
}

function bindEvents() {
  enterTourBtn.addEventListener("click", goToSetupScreen);

  nicknameInput.addEventListener("input", () => {
    nicknameInput.value = nicknameInput.value.replace(/\n/g, "");
    updateStartButtonState();
  });

  nicknameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !tourStartBtn.disabled) {
      startTour();
    }
  });

  tourStartBtn.addEventListener("click", startTour);
  mypageBtn.addEventListener("click", openMyPageModal);
  rewardBtn.addEventListener("click", openRewardModal);

  bindModalCloseEvents();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal("quiz");
      closeModal("mypage");
      closeModal("reward");
    }
  });
}

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