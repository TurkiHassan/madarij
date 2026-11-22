(() => {
  "use strict";

  const WORLD_IDS = ["nb", "lab", "cl", "obs", "wf"];
  const STORAGE_KEY = "madarij-direction-choice";
  const root = document.documentElement;
  const studio = document.getElementById("studio");
  const progress = document.getElementById("progress");
  const topChoose = document.getElementById("choose-btn");
  const topChooseLabel = topChoose.querySelector(".choose-label");
  const tabs = Array.from(document.querySelectorAll(".studio-tab"));
  const worlds = new Map(
    WORLD_IDS.map((id) => [id, document.getElementById("world-" + id)]),
  );
  const worldChooseButtons = Array.from(
    document.querySelectorAll(".js-choose[data-choose]"),
  );
  const originalChooseHTML = new Map(
    worldChooseButtons.map((button) => [button, button.innerHTML]),
  );

  let currentWorld = "nb";
  let chosenWorld = null;
  let toastTimer = null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (WORLD_IDS.includes(stored)) chosenWorld = stored;
  } catch (error) {
    chosenWorld = null;
  }

  /* ------------------------------------------------------------
     World switching
     ------------------------------------------------------------ */

  function setTopChooseState() {
    const world = worlds.get(currentWorld);
    if (!world) return;
    const accent = world.dataset.accent || "#a64238";
    const name = world.dataset.name || "";
    const isChosen = chosenWorld === currentWorld;

    root.style.setProperty("--active-accent", accent);
    topChoose.classList.toggle("is-chosen", isChosen);
    topChoose.setAttribute("aria-pressed", String(isChosen));
    topChoose.setAttribute(
      "aria-label",
      isChosen ? `تم اختيار ${name}` : `اختيار اتجاه ${name}`,
    );

    if (isChosen) {
      topChooseLabel.innerHTML = `مختار <span class="choose-name">· ${name}</span>`;
    } else {
      topChooseLabel.textContent = "اختيار هذا الاتجاه";
    }

    worldChooseButtons.forEach((button) => {
      const isWorldChosen = chosenWorld === button.dataset.choose;
      button.classList.toggle("is-chosen", isWorldChosen);
      button.setAttribute("aria-pressed", String(isWorldChosen));
      if (isWorldChosen) {
        button.innerHTML =
          'مختار · هذا الاتجاه <svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>';
      } else {
        button.innerHTML = originalChooseHTML.get(button) || button.innerHTML;
      }
    });

    tabs.forEach((tab) => {
      tab.classList.toggle("is-chosen", tab.dataset.world === chosenWorld);
    });
  }

  function scrollToTopInstant() {
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }

  function activateWorld(id, options = {}) {
    if (!worlds.has(id)) return;
    const changed = currentWorld !== id;
    currentWorld = id;

    WORLD_IDS.forEach((worldId) => {
      const world = worlds.get(worldId);
      if (world) world.hidden = worldId !== id;
    });

    tabs.forEach((tab) => {
      const active = tab.dataset.world === id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    const activeTab = tabs.find((tab) => tab.dataset.world === id);
    if (activeTab) {
      requestAnimationFrame(() => {
        activeTab.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }

    setTopChooseState();
    if (progress) progress.style.width = "0%";

    if (changed && !options.initial) {
      scrollToTopInstant();
      try {
        history.replaceState(null, "", "#world-" + id);
      } catch (error) {
        /* A file:// URL may refuse history changes; the page still works. */
      }
    }

    if (id === "wf") {
      requestAnimationFrame(positionMarker);
    }
    updateProgress();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateWorld(tab.dataset.world);
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowLeft") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowRight") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateWorld(tab.dataset.world);
        return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        activateWorld(nextTab.dataset.world);
        nextTab.focus();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.closest("input, textarea, select, [contenteditable='true']")
    ) {
      return;
    }

    const keyMap = {
      1: "nb",
      2: "lab",
      3: "cl",
      4: "obs",
      5: "wf",
      "١": "nb",
      "٢": "lab",
      "٣": "cl",
      "٤": "obs",
      "٥": "wf",
    };

    if (keyMap[event.key]) {
      event.preventDefault();
      activateWorld(keyMap[event.key]);
      return;
    }

    if (event.key === "Escape") hideToast();
  });

  document.querySelectorAll(".js-next").forEach((button) => {
    button.addEventListener("click", () => {
      const index = WORLD_IDS.indexOf(currentWorld);
      activateWorld(WORLD_IDS[(index + 1) % WORLD_IDS.length]);
    });
  });

  /* ------------------------------------------------------------
     Selection
     ------------------------------------------------------------ */

  function showToast(id, alreadyChosen = false) {
    const world = worlds.get(id);
    if (!world) return;
    const accent = world.dataset.accent || "#a64238";
    const name = world.dataset.name || "";
    const toast = document.getElementById("toast");
    const title = document.getElementById("toast-title");
    const body = document.getElementById("toast-body");
    if (!toast || !title || !body) return;

    toast.style.setProperty("--toast-accent", accent);
    title.textContent = alreadyChosen
      ? `«${name}» مختار بالفعل`
      : `اخترت «${name}»`;
    body.textContent = alreadyChosen
      ? "يمكنك تغيير الاختيار في أي وقت من الشريط العلوي."
      : "محفوظ في هذا المتصفح. غيّر الاختيار متى شئت.";

    toast.classList.remove("is-visible");
    // Restart the countdown bar when the toast is shown again.
    void toast.offsetWidth;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 6000);
  }

  function hideToast() {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.classList.remove("is-visible");
    window.clearTimeout(toastTimer);
  }

  function chooseWorld(id) {
    if (!worlds.has(id)) return;
    if (chosenWorld === id) {
      showToast(id, true);
      return;
    }
    chosenWorld = id;
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      /* Private browsing can block storage; the choice still works this visit. */
    }
    setTopChooseState();
    showToast(id);
  }

  topChoose.addEventListener("click", () => chooseWorld(currentWorld));

  worldChooseButtons.forEach((button) => {
    button.addEventListener("click", () => chooseWorld(button.dataset.choose));
  });

  const toastClose = document.getElementById("toast-close");
  if (toastClose) toastClose.addEventListener("click", hideToast);

  /* ------------------------------------------------------------
     Scroll progress
     ------------------------------------------------------------ */

  let progressTicking = false;

  function updateProgress() {
    const doc = root;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const ratio =
      maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0;
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (studio) studio.classList.toggle("is-scrolled", window.scrollY > 6);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (progressTicking) return;
      progressTicking = true;
      requestAnimationFrame(() => {
        updateProgress();
        progressTicking = false;
      });
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    updateProgress();
    if (currentWorld === "wf") positionMarker();
  });

  /* ------------------------------------------------------------
     App-preview chart reveals
     ------------------------------------------------------------ */

  const appSections = document.querySelectorAll(
    ".nb-app-section, .lab-app-section, .cl-app-section, .obs-app-section",
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    appSections.forEach((section) => observer.observe(section));
  } else {
    appSections.forEach((section) => section.classList.add("is-inview"));
  }

  /* ------------------------------------------------------------
     Wayfinding map
     ------------------------------------------------------------ */

  const stationData = {
    goal: {
      code: "M-01",
      name: "الهدف",
      text: "هدف واحد قابل للقياس: ماذا سيفعل عبدالله، بدقة كم، وفي كم محاولة؟ الهدف المكتوب بوضوح هو أول محطة، وكل ما بعده يخدمه.",
      link: "افتح شاشة الهدف",
    },
    plan: {
      code: "M-02",
      name: "الخطة",
      text: "خطة قصيرة بخطوات يعرفها المعلم والطالب: استراتيجية، مدة، ومادة. لا قائمة طويلة تُقرأ مرة واحدة ثم تُنسى.",
      link: "افتح الخطة",
    },
    activity: {
      code: "M-03",
      name: "النشاط",
      text: "نشاط من اهتمام الطفل ومستواه: قراءة زوجية، فرز كلمات، أو سؤال فكرة رئيسة. نشاط واحد ينتهي بقرار، لا أرشيف من الأوراق.",
      link: "افتح الأنشطة",
    },
    probe: {
      code: "M-04",
      name: "المسبار",
      text: "ستون ثانية كل أسبوع: يقرأ عبدالله نصًا قصيرًا، تسجّل الأخطاء، ويظهر المعدل والدقة. هذا هو القياس الذي يخبرك إن كانت الخطة تعمل.",
      link: "افتح شاشة المسبار",
    },
    report: {
      code: "M-05",
      name: "التقرير",
      text: "تقرير واحد جاهز لولي الأمر: ما تحسّن، وما نعمل عليه الآن، وكيف يساعد في البيت — بلغة واضحة بلا مصطلحات.",
      link: "افتح التقرير",
    },
  };

  const wfMap = document.querySelector(".wf-map");
  const wfHere = document.getElementById("wf-here");
  const wfInfo = document.getElementById("wf-info");
  const wfStations = Array.from(document.querySelectorAll(".wf-station"));

  function positionMarker() {
    if (!wfMap || !wfHere) return;
    if (window.matchMedia("(max-width: 760px)").matches) return;
    const active = document.querySelector(".wf-station.is-active");
    if (!active) return;
    const dot = active.querySelector(".wf-dot");
    if (!dot) return;

    const mapRect = wfMap.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    const center = dotRect.left + dotRect.width / 2;
    const markerWidth = wfHere.offsetWidth || 74;
    let right = mapRect.right - center - markerWidth / 2;
    right = Math.max(4, Math.min(mapRect.width - markerWidth - 4, right));
    wfHere.style.right = right + "px";
  }

  function selectStation(station) {
    if (!station || !stationData[station.dataset.station]) return;
    wfStations.forEach((item) => {
      const active = item === station;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    const data = stationData[station.dataset.station];
    if (wfInfo) {
      wfInfo.innerHTML = `
        <div class="wf-info-code">${data.code} <span>${data.name}</span></div>
        <p>${data.text}</p>
        <a href="#wf-app">${data.link} <svg class="icon" aria-hidden="true"><use href="#i-arrow-l"></use></svg></a>
      `;
    }
    requestAnimationFrame(positionMarker);
  }

  wfStations.forEach((station) => {
    station.addEventListener("click", () => selectStation(station));
  });

  window.addEventListener("load", () => {
    positionMarker();
  });

  if ("fonts" in document && document.fonts.ready) {
    document.fonts.ready.then(positionMarker);
  }

  /* ------------------------------------------------------------
     Initial state
     ------------------------------------------------------------ */

  const hash = window.location.hash;
  let initialWorld = "nb";

  const worldHash = hash.match(/^#world-(nb|lab|cl|obs|wf)$/);
  if (worldHash) {
    initialWorld = worldHash[1];
  } else {
    const appHash = hash.match(/^#(nb|lab|cl|obs|wf)-/);
    if (appHash) initialWorld = appHash[1];
  }

  activateWorld(initialWorld, { initial: true });

  if (initialWorld !== "nb" || hash.startsWith("#nb-")) {
    if (!worldHash && hash) {
      const target = document.querySelector(hash);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start" });
        });
      }
    }
  }

  updateProgress();
})();
