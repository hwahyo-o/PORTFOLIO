// 로딩 페이지의 타이포그래피 폰트 셔플 script - start

// 1. 필요한 상태 및 변수 정의
// 1-1. 폰트 리스트 및 순서 지정
const fonts = [
  'Wanted Sans',
  'Mona',
  'DearFromsol',
  'Gunhamimalmunteuyeot',
  'Ridibatang',
  'BonmyeongjoSourceHanSerif',
  'Arial',
];

const state = {
  loadingFont: fonts[0],
};

// 2. 컨트롤 할 대상 글자 요소들 지정 및 지정한 대상끼리 서로 다른 글꼴 적용되게 만들기
// const target1 = document.getElementById('portfolio-word'); 하이라이트 내 단어
// const target2 = document.getElementById('year-word');      추가 지정 단어
// 아래거는 지정한 대상끼리 같은 글꼴로 랜덤 적용되게, 두 타겟 단어를 배열 형식을 통해 일괄 선택 처리
const shuffleTargets = ['portfolio-word', 'year-word'].map(id => document.getElementById(id));
const loadingWrap = document.querySelector('.loading-wrap'); // 1번: 로딩박스 전체 최외곽 div
const mainContent = document.getElementById('main-content');

let shuffleInterval;

// 3번: 무작위 폰트 셔플 함수 (우선순위 강제 적용 버전)
function changeRandomFonts() {
  shuffleTargets.forEach(element => {
    if (element) {
      const randomIndex = Math.floor(Math.random() * fonts.length);
      
      // [수정] style.setProperty를 사용해 !important를 붙여서 기존 CSS 규칙을 강제로 덮어씁니다.
      element.style.setProperty('font-family', fonts[0], 'important');
    }
  });
}

// 1번: 사이트 접속 즉시 실행 프로세스 시작
window.addEventListener('DOMContentLoaded', () => {
  // 2번: 제공해주신 CSS 클래스 주입으로 하이라이트 시동 (0.6초간 진행)
  const highlightContainer = document.querySelector('.highlight-container');
  if (highlightContainer) {
    highlightContainer.classList.add('fill-highlight');
  }
});

// 3번: 하이라이트 완료 시점(0.5초 = 500ms 후)에 폰트 셔플 작동
setTimeout(() => {
  shuffleInterval = setInterval(changeRandomFonts, 900); // 900ms 간격 무작위 셔플
}, 500);

// ========================================================
// 4번: 처음 사이트에 접속한 순간을 기점으로 총 3초 뒤 화면 전환
// ========================================================
setTimeout(() => {
  clearInterval(shuffleInterval); // 폰트 셔플 정지

  // 1. 로딩 박스에 제공해주신 .fade-out 클래스를 추가하여 페이드 아웃 시동
  if (loadingWrap) {
    loadingWrap.classList.add('fade-out');
  }

  // 2. 메인 콘텐츠 원본 값으로 복구 (기존 CSS의 transition: opacity 1s ease에 의해 1초 동안 페이드 인)
  if (mainContent) {
    mainContent.style.visibility = 'visible';
    mainContent.style.opacity = '1';
  }

  // 3. 로딩 박스가 완전히 숨겨진 후 뒤쪽 요소 클릭 방지를 위한 완전히 숨김 처리
  setTimeout(() => {
    if (loadingWrap) {
      loadingWrap.style.display = 'none';
    }
  }, 1000); 

}, 3000);
