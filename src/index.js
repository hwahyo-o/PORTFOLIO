const fonts = [
  'Wanted Sans',
  'Gunhamimalmunteuyeot',
  'Mona Sans',
  'DearFromsol',
  'Ridibatang',
  'BonmyeongjoSourceHanSerif',
  'Arial',
];

const shuffleTargets = [
  'portfolio-word',
  'year-word',
].map(id =>
  document.getElementById(id)
);

const loadingWrap =
  document.querySelector('.loading-wrap');

const mainContent =
  document.getElementById('main-content');

let shuffleInterval;

/* =========================
   폰트 사전 로딩
========================= */

async function preloadShuffleFonts() {
  const targetText =
    'PORTFOLIO 2026';

  const webFonts =
    fonts.filter(
      font => font !== 'Arial'
    );

  const tasks =
    webFonts.map(font => {

      if (
        document.fonts.check(
          `400 90px "${font}"`,
          targetText
        )
      ) {
        return Promise.resolve();
      }

      return document.fonts.load(
        `400 90px "${font}"`,
        targetText
      );
    });

  const results =
    await Promise.allSettled(tasks);

  results.forEach(
    (result, index) => {

      if (
        result.status === 'rejected'
      ) {
        console.warn(
          '폰트 로딩 실패:',
          webFonts[index]
        );
      }

    }
  );
}

/* =========================
   최대 대기시간
========================= */

function timeout(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function prepareShuffleFonts() {

  await Promise.race([
    preloadShuffleFonts(),

    // 지나치게 느린 인터넷에서는
    // 무한정 기다리지 않음
    timeout(1200),
  ]);
}

/* =========================
   랜덤 폰트 변경
========================= */

function changeRandomFonts() {

  shuffleTargets.forEach(
    element => {

      if (!element) return;

      const randomIndex =
        Math.floor(
          Math.random() *
          fonts.length
        );

      element.style.setProperty(
        'font-family',
        fonts[randomIndex],
        'important'
      );

    }
  );

}

/* =========================
   초기 실행
========================= */

window.addEventListener(
  'DOMContentLoaded',
  async () => {

    const highlightContainer =
      document.querySelector(
        '.highlight-container'
      );

    if (highlightContainer) {
      highlightContainer.classList.add(
        'fill-highlight'
      );
    }

    /* 폰트를 먼저 준비 */
    await prepareShuffleFonts();

    /* 첫 변경 즉시 실행 */
    changeRandomFonts();

    /* 이후 반복 */
    shuffleInterval =
      setInterval(
        changeRandomFonts,
        600
      );

  }
);

/* =========================
   3초 후 메인 화면
========================= */

setTimeout(() => {

  clearInterval(
    shuffleInterval
  );

  if (loadingWrap) {
    loadingWrap.classList.add(
      'fade-out'
    );
  }

  if (mainContent) {

    mainContent.style.visibility =
      'visible';

    mainContent.style.opacity =
      '1';

  }

  setTimeout(() => {

    if (loadingWrap) {
      loadingWrap.style.display =
        'none';
    }

  }, 1000);

}, 3000);