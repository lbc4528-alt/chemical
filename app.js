const intro = document.getElementById("intro");
const site = document.getElementById("site");
const skipIntro = document.getElementById("skipIntro");
let introParticles = null;
let siteParticles = null;
let siteParticlesStarted = false;

function getParticleOptions(layer = "intro") {
  const ambient = layer === "site";
  const compactScreen = window.matchMedia("(max-width: 720px)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const limitedHardware = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const performanceMode = compactScreen || limitedHardware;
  const particleCount = ambient
    ? (performanceMode ? 22 : 38)
    : (performanceMode ? 32 : 48);

  return {
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: !performanceMode && window.devicePixelRatio <= 1.25,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: !coarsePointer && !performanceMode, mode: "grab" },
        resize: true
      },
      modes: {
        grab: {
          distance: ambient ? 150 : 180,
          links: { opacity: ambient ? 0.55 : 0.75, color: "#38bdf8" }
        }
      }
    },
    particles: {
      color: { value: "#38bdf8" },
      links: {
        color: "#38bdf8",
        distance: ambient ? 124 : 142,
        enable: true,
        opacity: ambient ? 0.16 : 0.28,
        width: 1
      },
      move: {
        enable: true,
        speed: ambient ? 0.55 : 0.9,
        direction: "none",
        random: false,
        straight: false,
        outModes: "out"
      },
      number: {
        density: { enable: true, area: 900 },
        value: particleCount
      },
      opacity: { value: ambient ? 0.38 : 0.58 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } }
    }
  };
}

function initParticleNetworks() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!intro || reduceMotion || !window.tsParticles) return;

  window.tsParticles.load("tsparticles", getParticleOptions("intro")).then((container) => {
    introParticles = container;
    if (intro.classList.contains("done")) container.destroy();
  }).catch(() => {
    introParticles = null;
  });
}

function startSiteParticles() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (siteParticlesStarted || reduceMotion || !window.tsParticles) return;
  siteParticlesStarted = true;

  window.tsParticles.load("siteParticles", getParticleOptions("site")).then((container) => {
    siteParticles = container;
    document.getElementById("siteParticles")?.classList.add("is-ready");
  }).catch(() => {
    siteParticles = null;
  });
}

function finishIntro() {
  if (!intro || !site) return;
  if (intro.classList.contains("done")) return;
  introParticles?.destroy();
  intro.classList.add("done");
  site.classList.add("ready");
  window.setTimeout(() => {
    intro.remove();
    window.setTimeout(startSiteParticles, 120);
  }, 800);
}

initParticleNetworks();
skipIntro?.addEventListener("click", finishIntro);
window.setTimeout(finishIntro, 3900);

const actionList = document.querySelector("#actions .action-list");
const actionItems = actionList ? Array.from(actionList.children) : [];

function initActionPipeline() {
  if (!actionList || !actionItems.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    actionList.style.setProperty("--pipeline-progress", "1");
    actionItems.forEach((item) => item.classList.add("pipeline-active"));
    return;
  }

  actionList.classList.add("pipeline-motion-ready");
  let frameRequested = false;

  const updatePipeline = () => {
    frameRequested = false;
    const viewportLine = window.innerHeight * 0.58;
    const listRect = actionList.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (viewportLine - listRect.top) / listRect.height));
    actionList.style.setProperty("--pipeline-progress", progress.toFixed(4));
    const valveOffset = parseFloat(getComputedStyle(actionList).getPropertyValue("--valve-y")) || 0;

    actionItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      item.classList.toggle("pipeline-active", itemRect.top + valveOffset <= viewportLine);
    });
  };

  const requestUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updatePipeline);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}

initActionPipeline();

const distillationModule = document.getElementById("distillationTrigger");

function initDistillation() {
  if (!distillationModule) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    distillationModule.classList.add("is-active");
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0]?.isIntersecting) return;
    distillationModule.classList.add("is-active");
    observer.disconnect();
  }, { threshold: 0.18 });

  observer.observe(distillationModule);
}

initDistillation();

const narrativeMotionItems = [
  {
    trigger: document.querySelector("#now .summary-list"),
    target: document.getElementById("now")
  },
  {
    trigger: document.getElementById("direction"),
    target: document.getElementById("direction")
  },
  {
    trigger: document.querySelector(".closing"),
    target: document.querySelector(".closing")
  }
].filter(({ trigger, target }) => trigger && target);

function initNarrativeMotions() {
  if (!narrativeMotionItems.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    narrativeMotionItems.forEach(({ target }) => target.classList.add("motion-active"));
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = narrativeMotionItems.find(({ trigger }) => trigger === entry.target);
      item?.target.classList.add("motion-active");
      observer.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.22
  });

  narrativeMotionItems.forEach(({ trigger }) => observer.observe(trigger));
}

initNarrativeMotions();

const evidenceModal = document.getElementById("evidenceModal");
const evidenceTitle = document.getElementById("evidenceTitle");
const evidenceViewer = document.getElementById("evidenceViewer");
const evidenceClose = document.getElementById("evidenceClose");
const evidenceNav = document.getElementById("evidenceNav");
const evidencePrev = document.getElementById("evidencePrev");
const evidenceNext = document.getElementById("evidenceNext");
const evidenceCount = document.getElementById("evidenceCount");
const evidenceButtons = document.querySelectorAll("[data-evidence]");

const evidenceData = {
  grade: {
    title: "2026학년도 1학기 성적표",
    items: [
      { type: "image", src: "evidence/grade-transcript-4_5.png", alt: "평점평균 4.5가 기재된 성적표" }
    ]
  },
  hazard: {
    title: "위험물기능사 필기 합격",
    items: [
      { type: "image", src: "evidence/hazardous-pass.png", alt: "위험물기능사 필기시험 합격 화면" }
    ]
  },
  ai: {
    title: "AI 관련 교육 수료",
    items: [
      { type: "image", src: "evidence/ai-course-1.png", alt: "산업체 수요특화형 AI교육 수료증" },
      { type: "image", src: "evidence/ai-course-2.jpg", alt: "Vibe Coding 제조 데이터 분석 교육 수료증" }
    ]
  },
  award: {
    title: "제조 데이터 분석 경연대회 2등",
    items: [
      { type: "image", src: "evidence/contest-award.jpg", alt: "바이브 코딩 제조 데이터 분석 교육 2위 상장" }
    ]
  },
  passport: {
    title: "API 여권 분석기 · 가상 시연",
    items: [
      { type: "passport-demo" }
    ]
  }
};

let currentEvidence = null;
let currentEvidenceIndex = 0;
let evidenceTrigger = null;
let evidenceHideTimer = null;
let passportDemoTimers = [];

function clearPassportDemoTimers() {
  passportDemoTimers.forEach((timer) => window.clearTimeout(timer));
  passportDemoTimers = [];
}

function renderPassportDemo() {
  const demo = document.createElement("div");
  demo.className = "passport-demo";
  demo.innerHTML = `
    <div class="passport-demo-head">
      <p>실제 여권 이미지나 외부 API를 사용하지 않습니다. 가상 샘플을 통해 이미지 입력부터 문자 인식, MRZ 규칙 검증까지의 흐름을 재현합니다.</p>
      <span class="passport-demo-badge">VIRTUAL SAMPLE</span>
    </div>
    <div class="passport-demo-grid">
      <section class="passport-sample" aria-label="가상 여권 샘플">
        <div class="passport-sample-top"><span>VIRTUAL PASSPORT SAMPLE</span><span>NOT VALID FOR TRAVEL</span></div>
        <div class="passport-identity">
          <div class="passport-photo" aria-hidden="true">◉</div>
          <div class="passport-fields">
            <div><span>SURNAME / 성</span><strong>ERIKSSON</strong></div>
            <div><span>GIVEN NAMES / 이름</span><strong>ANNA MARIA</strong></div>
            <div><span>NATIONALITY / 국적</span><strong>UTO</strong></div>
            <div><span>DATE OF BIRTH / 생년월일</span><strong>740812</strong></div>
            <div><span>SEX / 성별</span><strong>F</strong></div>
          </div>
        </div>
        <div class="passport-mrz" aria-label="가상 MRZ 문자열">
          P&lt;UTOERIKSSON&lt;&lt;ANNA&lt;MARIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          L898902C36UTO7408122F1204159ZE184226B&lt;&lt;&lt;&lt;&lt;10
        </div>
      </section>
      <section class="passport-console" aria-label="여권 분석 시연 결과">
        <ol class="passport-steps" aria-label="분석 단계">
          <li data-demo-step="0">샘플 로드</li>
          <li data-demo-step="1">OCR 분석</li>
          <li data-demo-step="2">MRZ 검증</li>
        </ol>
        <p class="passport-status" data-demo-status aria-live="polite">준비 완료 — 아래 버튼을 눌러 분석 과정을 시작하세요.</p>
        <div class="passport-result" data-demo-result hidden>
          <dl class="passport-result-grid">
            <div><dt>성명</dt><dd>ANNA MARIA ERIKSSON</dd></div>
            <div><dt>여권번호</dt><dd>L898902C3</dd></div>
            <div><dt>국적</dt><dd>UTO</dd></div>
            <div><dt>만료일</dt><dd>2012-04-15</dd></div>
          </dl>
          <div class="passport-checks" aria-label="검증 완료 항목">
            <span>✓ 여권번호 체크섬</span><span>✓ 생년월일 체크섬</span><span>✓ 만료일 체크섬</span>
          </div>
        </div>
        <div class="passport-demo-actions">
          <button class="passport-demo-start" type="button" data-demo-start>가상 샘플 분석 시작</button>
          <span class="passport-privacy">개인정보 저장·전송 없음<br>외부 API 호출 없음</span>
        </div>
      </section>
    </div>`;

  const button = demo.querySelector("[data-demo-start]");
  const status = demo.querySelector("[data-demo-status]");
  const result = demo.querySelector("[data-demo-result]");
  const steps = [...demo.querySelectorAll("[data-demo-step]")];

  button.addEventListener("click", () => {
    clearPassportDemoTimers();
    result.hidden = true;
    steps.forEach((step) => step.classList.remove("is-current", "is-complete"));
    steps[0].classList.add("is-current");
    status.className = "passport-status is-running";
    status.textContent = "가상 여권 이미지를 불러오는 중";
    button.disabled = true;
    button.textContent = "분석 중";

    passportDemoTimers.push(window.setTimeout(() => {
      steps[0].classList.replace("is-current", "is-complete");
      steps[1].classList.add("is-current");
      status.textContent = "문자 영역을 인식하고 MRZ 두 줄을 추출하는 중";
    }, 450));

    passportDemoTimers.push(window.setTimeout(() => {
      steps[1].classList.replace("is-current", "is-complete");
      steps[2].classList.add("is-current");
      status.textContent = "ICAO 형식과 체크섬 규칙을 검증하는 중";
    }, 1050));

    passportDemoTimers.push(window.setTimeout(() => {
      steps[2].classList.replace("is-current", "is-complete");
      status.className = "passport-status";
      status.textContent = "분석 완료 — MRZ 형식과 주요 체크섬이 일치합니다.";
      result.hidden = false;
      button.disabled = false;
      button.textContent = "다시 시연하기";
    }, 1700));
  });

  evidenceViewer.append(demo);
}

function renderEvidence() {
  if (!currentEvidence || !evidenceViewer || !evidenceTitle) return;
  clearPassportDemoTimers();
  const item = currentEvidence.items[currentEvidenceIndex];
  evidenceTitle.textContent = currentEvidence.title;
  evidenceViewer.replaceChildren();

  if (item.type === "passport-demo") {
    renderPassportDemo();
  } else if (item.type === "pdf") {
    const frameWrap = document.createElement("div");
    frameWrap.className = "evidence-pdf";

    const frame = document.createElement("iframe");
    frame.src = item.src + "#view=FitH&toolbar=0";
    frame.title = item.alt;

    const clickClose = document.createElement("button");
    clickClose.type = "button";
    clickClose.className = "evidence-pdf-close";
    clickClose.setAttribute("aria-label", "성적표를 닫기");
    clickClose.addEventListener("click", closeEvidence);

    frameWrap.append(frame, clickClose);
    evidenceViewer.append(frameWrap);
  } else {
    const img = document.createElement("img");
    img.className = "evidence-image";
    img.src = item.src;
    img.alt = item.alt;
    img.addEventListener("click", closeEvidence);
    evidenceViewer.append(img);
  }

  const multiple = currentEvidence.items.length > 1;
  evidenceNav.hidden = !multiple;
  if (multiple) {
    evidenceCount.textContent = `${currentEvidenceIndex + 1} / ${currentEvidence.items.length}`;
  }
}

function openEvidence(key, trigger) {
  const data = evidenceData[key];
  if (!data || !evidenceModal) return;
  window.clearTimeout(evidenceHideTimer);
  currentEvidence = data;
  currentEvidenceIndex = 0;
  evidenceTrigger = trigger;
  renderEvidence();
  evidenceModal.hidden = false;
  evidenceModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    evidenceModal.classList.add("open");
    evidenceClose?.focus();
  });
}

function closeEvidence() {
  if (!evidenceModal || evidenceModal.hidden) return;
  clearPassportDemoTimers();
  evidenceModal.classList.remove("open");
  evidenceModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  evidenceHideTimer = window.setTimeout(() => {
    evidenceModal.hidden = true;
    evidenceViewer?.replaceChildren();
  }, 220);
  evidenceTrigger?.focus();
}

evidenceButtons.forEach((button) => {
  button.addEventListener("click", () => openEvidence(button.dataset.evidence, button));
});

evidenceClose?.addEventListener("click", closeEvidence);
evidenceModal?.addEventListener("click", (event) => {
  if (event.target === evidenceModal) closeEvidence();
});
evidencePrev?.addEventListener("click", () => {
  if (!currentEvidence) return;
  currentEvidenceIndex = (currentEvidenceIndex - 1 + currentEvidence.items.length) % currentEvidence.items.length;
  renderEvidence();
});
evidenceNext?.addEventListener("click", () => {
  if (!currentEvidence) return;
  currentEvidenceIndex = (currentEvidenceIndex + 1) % currentEvidence.items.length;
  renderEvidence();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeEvidence();
});
