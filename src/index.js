// 로딩 페이지의 타이포그래피 폰트 셔플 인트로 애니메이션 js - start
const INTRO_DURATION_MS = 3000;
const SHUFFLE_INTERVAL_MS = 600;
const FONT_PREPARE_TIMEOUT_MS = 1200;
const HIGHLIGHT_FALLBACK_MS = 850;
const LOADER_HIDE_DELAY_MS = 850;
const TARGET_TEXT = 'PORTFOLIO 2026';

const fontDefinitions = [
  { name: 'Wanted Sans Variable', weight: 700 },
  { name: 'Gunhamimalmunteuyeot', weight: 400 },
  { name: 'Mona10x12', weight: 700 },
  { name: 'DearFromsol', weight: 400 },
  { name: 'Ridibatang', weight: 400 },
  { name: 'BonmyeongjoSourceHanSerif', weight: 400 },
];

const SYSTEM_FALLBACK_FONT = 'Arial';
const readyFonts = new Set([SYSTEM_FALLBACK_FONT]);
const lastFontByElement = new WeakMap();

const shuffleTargets = [
  document.getElementById('portfolio-word'),
  document.getElementById('year-word'),
].filter(Boolean);

const loadingWrap = document.querySelector('.loading-wrap');
const mainContent = document.getElementById('main-content');
const highlightContainer = document.querySelector('.highlight-container');

let shuffleInterval = null;
let loaderHideTimer = null;

/* =========================
   공통 유틸리티
========================= */

function delay(ms) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function addReadyFont(fontName) {
  readyFonts.add(fontName);
}

/* =========================
   폰트 사전 로딩
========================= */

async function loadShuffleFont({ name, weight }) {
  try {
    const faces = await document.fonts.load(
      `${weight} 90px "${name}"`,
      TARGET_TEXT
    );

    if (faces.length > 0) {
      addReadyFont(name);
      return true;
    }

    console.warn(`[font] 정의를 찾지 못했습니다: ${name}`);
  } catch (error) {
    console.warn(`[font] 로딩 실패: ${name}`, error);
  }

  return false;
}

async function prepareShuffleFonts() {
  if (!document.fonts || typeof document.fonts.load !== 'function') {
    return;
  }

  /*
    모든 폰트 로딩은 동시에 시작합니다.
    1.2초 안에 끝난 폰트만 우선 셔플 후보로 사용하고,
    늦게 완료된 폰트는 Promise가 끝나는 즉시 readyFonts에 추가됩니다.
  */
  const fontTasks = fontDefinitions.map(loadShuffleFont);

  await Promise.race([
    Promise.allSettled(fontTasks),
    delay(FONT_PREPARE_TIMEOUT_MS),
  ]);
}

/* =========================
   하이라이트 완료 감지
========================= */

function runHighlightAnimation() {
  if (!highlightContainer) {
    return Promise.resolve();
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    highlightContainer.classList.add('fill-highlight');
    return Promise.resolve();
  }

  return new Promise(resolve => {
    let settled = false;
    let fallbackTimer = null;

    const finish = () => {
      if (settled) return;
      settled = true;

      highlightContainer.removeEventListener('transitionend', handleTransitionEnd);

      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }

      resolve();
    };

    const handleTransitionEnd = event => {
      const isWidthTransition = event.propertyName === 'width';
      const isExpectedPseudoElement =
        !event.pseudoElement || event.pseudoElement === '::before';

      if (isWidthTransition && isExpectedPseudoElement) {
        finish();
      }
    };

    highlightContainer.addEventListener(
      'transitionend',
      handleTransitionEnd
    );

    /*
      이벤트 리스너를 먼저 붙인 뒤 다음 프레임에서 클래스를 추가해
      transitionend 이벤트를 놓칠 가능성을 줄입니다.
    */
    window.requestAnimationFrame(() => {
      highlightContainer.classList.add('fill-highlight');
    });

    /*
      transitionend가 브라우저 환경상 발생하지 않는 경우에도
      인트로가 멈추지 않도록 안전장치를 둡니다.
    */
    fallbackTimer = window.setTimeout(
      finish,
      HIGHLIGHT_FALLBACK_MS
    );
  });
}

/* =========================
   랜덤 폰트 셔플
========================= */

function pickNextFont(element, fontsUsedThisFrame) {
  const allReadyFonts = Array.from(readyFonts);
  const previousFont = lastFontByElement.get(element);

  let candidates = allReadyFonts.filter(
    font =>
      font !== previousFont &&
      !fontsUsedThisFrame.has(font)
  );

  if (candidates.length === 0) {
    candidates = allReadyFonts.filter(
      font => font !== previousFont
    );
  }

  if (candidates.length === 0) {
    candidates = allReadyFonts;
  }

  return candidates[
    Math.floor(Math.random() * candidates.length)
  ];
}

function changeRandomFonts() {
  if (shuffleTargets.length === 0 || readyFonts.size === 0) {
    return;
  }

  const fontsUsedThisFrame = new Set();

  shuffleTargets.forEach(element => {
    const nextFont = pickNextFont(
      element,
      fontsUsedThisFrame
    );

    if (!nextFont) return;

    element.style.setProperty(
      'font-family',
      `"${nextFont}"`,
      'important'
    );

    lastFontByElement.set(element, nextFont);
    fontsUsedThisFrame.add(nextFont);
  });
}

function startFontShuffle() {
  changeRandomFonts();

  stopFontShuffle();

  shuffleInterval = window.setInterval(
    changeRandomFonts,
    SHUFFLE_INTERVAL_MS
  );
}

function stopFontShuffle() {
  if (shuffleInterval !== null) {
    window.clearInterval(shuffleInterval);
    shuffleInterval = null;
  }
}

/* =========================
   메인 화면 전환
========================= */

function revealMainContent() {
  stopFontShuffle();

  if (loadingWrap) {
    loadingWrap.classList.add('fade-out');
  }

  if (mainContent) {
    mainContent.classList.add('is-visible');
  }

  document.body.classList.remove('is-loading');

  loaderHideTimer = window.setTimeout(() => {
    if (loadingWrap) {
      loadingWrap.hidden = true;
    }
  }, LOADER_HIDE_DELAY_MS);
}

/* =========================
   인트로 전체 실행
========================= */

async function runIntro() {
  const introStartedAt = performance.now();

  /*
    두 작업을 동시에 시작하되,
    - 폰트 준비
    - 하이라이트 실제 종료
    두 조건이 모두 만족된 뒤 셔플을 시작합니다.
  */
  await Promise.all([
    prepareShuffleFonts(),
    runHighlightAnimation(),
  ]);

  startFontShuffle();

  const elapsed = performance.now() - introStartedAt;
  const remaining = Math.max(
    0,
    INTRO_DURATION_MS - elapsed
  );

  await delay(remaining);

  revealMainContent();
}

/*
  이 파일은 body 끝에서 실행되므로 필요한 DOM은 이미 만들어져 있습니다.
  예외가 생겨도 메인 콘텐츠가 영구적으로 가려지지 않도록 fail-safe를 둡니다.
*/
runIntro().catch(error => {
  console.error('[intro] 초기화 중 오류가 발생했습니다.', error);
  revealMainContent();
});

window.addEventListener(
  'pagehide',
  () => {
    stopFontShuffle();

    if (loaderHideTimer !== null) {
      window.clearTimeout(loaderHideTimer);
      loaderHideTimer = null;
    }
  },
  { once: true }
);
// 로딩 페이지의 타이포그래피 폰트 셔플 인트로 애니메이션 js - end