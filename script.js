const stack = document.querySelector(".stack");
const stackStage = document.querySelector("#stackStage");
const loader = document.querySelector("#loader");
const loaderFrame = document.querySelector("#loaderFrame");
const loaderImage = document.querySelector("#loaderImage");
const loaderBar = document.querySelector("#loaderBar");
const loaderBuckets = document.querySelector("#loaderBuckets");
const loaderBarFill = document.querySelector(".loader-bar-fill");
const whiteFlash = document.querySelector("#whiteFlash");
const site = document.querySelector(".site");
const stackOverlay = document.querySelector(".stack-overlay");
const stackProjectCurrent = document.querySelector(".stack-project-current");
const stackProjectNext = document.querySelector(".stack-project-next");
const clockNodes = Array.from(document.querySelectorAll("[data-clock]"));
const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const stillAssets = [
  { type: "image", src: "STILLS/gel_I_v0005_enhanced.tif", alt: "gel study" },
  { type: "image", src: "STILLS/gel_pack_closeup_B_v0002 copy 2.png", alt: "pack closeup b" },
  { type: "image", src: "STILLS/gel_pack_closeup_C_v0002 copy 2.png", alt: "pack closeup c" },
  { type: "image", src: "STILLS/gel_pack_top_v0002 copy.png", alt: "pack top" },
  { type: "image", src: "STILLS/G_still_01 copy.png", alt: "g still 01" },
  { type: "image", src: "STILLS/G_still_02 copy.png", alt: "g still 02" },
  { type: "image", src: "STILLS/ICON_TITAN_PRODUCT_LEG_WEB_V002.jpg", alt: "icon titan" },
  { type: "image", src: "STILLS/ICON_TITAN_PRODUCT_SH0110_XRAY_V008_STILL_MS_nuke_v0001.png", alt: "icon titan" },
  { type: "image", src: "STILLS/ICON_TITAN_PRODUCT_SH040_V011_STILL_MS.png", alt: "icon titan" },
  { type: "image", src: "STILLS/ICON_TITAN_PRODUCT_SIDE_WEB_V001.jpg", alt: "icon titan" },
  { type: "image", src: "STILLS/ICON_TITAN_PRODUCT_TOP_WEB_V001.jpg", alt: "icon titan" },
  { type: "image", src: "STILLS/monolith_B_v0002 copy.png", alt: "monolith b" },
  { type: "image", src: "STILLS/monolith_C_v0002 copy 2.png", alt: "monolith c" },
  { type: "image", src: "STILLS/Screenshot 2025-06-09 174855.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2025-06-11 074106.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2025-08-18 103633.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2025-10-08 225710.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2026-02-21 152721.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2026-02-21 152729.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2026-02-21 153434.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2026-03-02 163105.png", alt: "screenshot" },
  { type: "image", src: "STILLS/Screenshot 2026-04-03 181445.png", alt: "screenshot" },
];

const slides = [
  { name: "Cadence", vimeoId: "1182987379" },
  { name: "Cadence", vimeoId: "1182987381" },
  { name: "Direction & CGI Production", vimeoId: "1182999637" },
  { name: "Direction & CGI Production", vimeoId: "1182987682" },
  { name: "Louis Vuitton", vimeoId: "1183003548" },
  { name: "Givenchy", vimeoId: "1182987619" },
  { name: "Byredo", vimeoId: "1182987608" },
  { name: "Club", vimeoId: "1183017503" },
  { name: "L'Oréal", vimeoId: "1182987487" },
  { name: "Bandit", vimeoId: "1182987377" },
  { name: "Sandro", vimeoId: "1182988010" },
  { name: "Sandro", vimeoId: "1182987807" },
  { name: "Icon", vimeoId: "1183004855" },
  { name: "Icon", vimeoId: "1182987816" },
  { name: "Lab", vimeoId: "1182987729" },
];

const state = {
  cards: [],
  mode: "desktop",
  activeIndex: 0,
  currentProgress: 0,
  targetProgress: 0,
  animationFrame: 0,
  resizeTimer: 0,
  mobileObserver: null,
  desktopTouchActive: false,
  desktopTouchY: 0,
  warmupTimer: 0,
  warmupIndex: 0,
  lastGestureAt: 0,
  lastFrameAt: 0,
};

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function wrapIndex(index) {
  return (index + slides.length) % slides.length;
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function buildVimeoSrc(vimeoId) {
  const params = new URLSearchParams({
    autoplay: "1",
    muted: "1",
    loop: "1",
    background: "1",
    autopause: "0",
    playsinline: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });
  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}#t=0.5s`;
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 768px) and (orientation: portrait)").matches;
}

function updateWorldClocks() {
  clockNodes.forEach((node) => {
    const zone = node.dataset.clock;
    if (!zone) {
      return;
    }

    node.textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: zone,
    }).format(new Date());
  });
}

function setActiveProject(name) {
  if (stackProjectCurrent) {
    stackProjectCurrent.textContent = name || "";
  }
  if (stackProjectNext) {
    stackProjectNext.textContent = "";
  }
}

function postToVimeo(frame, method) {
  if (!frame?.contentWindow) {
    return;
  }

  frame.contentWindow.postMessage(JSON.stringify({ method }), "https://player.vimeo.com");
}

function ensureFrameLoaded(card) {
  const frame = card.querySelector("iframe");
  if (!frame || frame.src || !frame.dataset.src) {
    return frame;
  }

  frame.src = frame.dataset.src;
  return frame;
}

function startVideoWarmup() {
  window.clearTimeout(state.warmupTimer);

  const warmNext = () => {
    if (state.warmupIndex >= state.cards.length) {
      return;
    }

    ensureFrameLoaded(state.cards[state.warmupIndex]);
    state.warmupIndex += 1;
    state.warmupTimer = window.setTimeout(warmNext, 220);
  };

  warmNext();
}

function syncPlaybackWindow(centerIndex) {
  state.cards.forEach((card, index) => {
    const frame = card.querySelector("iframe");
    if (!frame) {
      return;
    }

    const forwardDistance = wrapIndex(index - centerIndex);
    const backwardDistance = wrapIndex(centerIndex - index);
    const deckDistance = Math.min(forwardDistance, backwardDistance);

    if (deckDistance <= 2) {
      ensureFrameLoaded(card);
    }

    if (!frame.src) {
      return;
    }

    if (index === centerIndex) {
      postToVimeo(frame, "play");
    } else {
      postToVimeo(frame, "pause");
    }
  });
}

function syncPlaybackProgress(currentIndex, nextIndex, fraction) {
  const playNext = fraction > 0.02;
  const playing = new Set([currentIndex]);
  if (playNext) {
    playing.add(nextIndex);
  }

  state.cards.forEach((card, index) => {
    const frame = card.querySelector("iframe");
    if (!frame || !frame.src) {
      return;
    }

    if (playing.has(index)) {
      postToVimeo(frame, "play");
    } else {
      postToVimeo(frame, "pause");
    }
  });
}

function syncStackMetrics() {
  const viewportHeight = window.innerHeight;
  document.documentElement.style.setProperty("--stack-screen-height", `${viewportHeight}px`);
}

function updateDesktopCards(progress) {
  const count = slides.length;
  const wrapped = mod(progress, count);
  const baseIndex = Math.floor(wrapped);
  const fraction = wrapped - baseIndex;
  const nextIndex = wrapIndex(baseIndex + 1);
  const prevIndex = wrapIndex(baseIndex - 1);

  state.cards.forEach((card) => {
    delete card.dataset.cardState;
    delete card.dataset.cardMotion;
    card.style.opacity = "0";
    card.style.zIndex = "0";
    card.style.transform = "translate3d(0, 0, 0) scale(1)";
    card.style.clipPath = "inset(0 0 0 0)";
  });

  const currentCard = state.cards[baseIndex];
  const nextCard = state.cards[nextIndex];
  const prevCard = state.cards[prevIndex];

  ensureFrameLoaded(currentCard);
  ensureFrameLoaded(nextCard);
  ensureFrameLoaded(prevCard);

  if (currentCard) {
    currentCard.style.opacity = "1";
    currentCard.style.zIndex = "2";
    currentCard.style.transform = `translate3d(0, 0, 0) scale(${1 - fraction * 0.004})`;
  }

  if (nextCard) {
    nextCard.style.opacity = "1";
    nextCard.style.zIndex = "3";
    nextCard.style.clipPath = `inset(0 ${Math.max(0, (1 - fraction) * 100)}% 0 0)`;
    nextCard.style.transform = `translate3d(${-1.2 + fraction * 1.2}%, 0, 0) scale(${1.008 - fraction * 0.008})`;
  }

  if (prevCard && fraction < 0.015) {
    prevCard.style.opacity = "1";
    prevCard.style.zIndex = "1";
  }

  if (stackOverlay) {
    stackOverlay.style.setProperty("--swipe-progress", fraction.toFixed(4));
    stackOverlay.style.setProperty("--swipe-line-x", `${(fraction * 100).toFixed(3)}%`);
  }

  if (stackProjectCurrent) {
    stackProjectCurrent.textContent = slides[baseIndex]?.name || "";
  }
  if (stackProjectNext) {
    stackProjectNext.textContent = slides[nextIndex]?.name || "";
  }

  syncPlaybackProgress(baseIndex, nextIndex, fraction);

  if (baseIndex !== state.activeIndex) {
    state.activeIndex = baseIndex;
    syncPlaybackWindow(baseIndex);
  }
}

function stepDesktopAnimation(now) {
  if (state.mode !== "desktop") {
    state.animationFrame = 0;
    return;
  }

  const previousTime = state.lastFrameAt || now;
  const deltaMs = now - previousTime;
  state.lastFrameAt = now;

  if (now - state.lastGestureAt > 2200) {
    state.targetProgress += deltaMs * 0.00008;
  }

  const difference = state.targetProgress - state.currentProgress;
  state.currentProgress += difference * 0.09;

  if (Math.abs(difference) < 0.0001 && now - state.lastGestureAt <= 2600) {
    state.currentProgress = state.targetProgress;
  }

  updateDesktopCards(state.currentProgress);
  state.animationFrame = window.requestAnimationFrame(stepDesktopAnimation);
}

function startDesktopAnimation() {
  if (state.animationFrame) {
    return;
  }
  state.lastFrameAt = 0;
  state.animationFrame = window.requestAnimationFrame(stepDesktopAnimation);
}

function handleDesktopWheel(event) {
  if (state.mode !== "desktop") {
    return;
  }

  event.preventDefault();
  state.lastGestureAt = performance.now();
  state.targetProgress += event.deltaY * 0.0019;
  startDesktopAnimation();
}

function handleDesktopTouchStart(event) {
  if (state.mode !== "desktop" || event.touches.length !== 1) {
    return;
  }

  state.desktopTouchActive = true;
  state.desktopTouchY = event.touches[0].clientY;
  state.lastGestureAt = performance.now();
}

function handleDesktopTouchMove(event) {
  if (state.mode !== "desktop" || !state.desktopTouchActive || event.touches.length !== 1) {
    return;
  }

  const nextY = event.touches[0].clientY;
  const deltaY = state.desktopTouchY - nextY;
  state.desktopTouchY = nextY;
  event.preventDefault();
  state.lastGestureAt = performance.now();
  state.targetProgress += deltaY * 0.0045;
  startDesktopAnimation();
}

function handleDesktopTouchEnd() {
  state.desktopTouchActive = false;
}

function teardownMobileObserver() {
  if (state.mobileObserver) {
    state.mobileObserver.disconnect();
    state.mobileObserver = null;
  }
}

function setupMobileObserver() {
  teardownMobileObserver();

  state.mobileObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      const frame = ensureFrameLoaded(card);
      if (!frame) {
        return;
      }

      if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
        postToVimeo(frame, "play");
        setActiveProject(card.dataset.projectName || "");
      } else {
        postToVimeo(frame, "pause");
      }
    });
  }, {
    root: null,
    rootMargin: "240px 0px",
    threshold: [0, 0.45, 0.8],
  });

  state.cards.forEach((card) => {
    state.mobileObserver?.observe(card);
  });
}

function applyDesktopLayout() {
  state.mode = "desktop";
  stack?.classList.remove("is-linear");
  document.body.classList.add("is-fixed-stack");
  teardownMobileObserver();
  syncStackMetrics();
  state.currentProgress = mod(state.currentProgress, slides.length);
  state.targetProgress = mod(state.targetProgress || state.currentProgress, slides.length);
  updateDesktopCards(state.currentProgress);
  setActiveProject(slides[state.activeIndex]?.name || "");
  syncPlaybackWindow(state.activeIndex);
  startDesktopAnimation();
}

function applyMobileLayout() {
  state.mode = "mobile";
  stack?.classList.add("is-linear");
  document.body.classList.remove("is-fixed-stack");
  if (state.animationFrame) {
    window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
  }
  state.cards.forEach((card) => {
    delete card.dataset.cardState;
    delete card.dataset.cardMotion;
    card.style.removeProperty("transform");
    card.style.removeProperty("opacity");
    card.style.removeProperty("z-index");
    card.style.removeProperty("clip-path");
  });
  setupMobileObserver();
}

function applyResponsiveMode() {
  const nextMode = isMobileLayout() ? "mobile" : "desktop";
  if (nextMode === "mobile") {
    applyMobileLayout();
  } else {
    applyDesktopLayout();
  }
}

function handleResize() {
  window.clearTimeout(state.resizeTimer);
  state.resizeTimer = window.setTimeout(() => {
    syncStackMetrics();
    applyResponsiveMode();
  }, 80);
}

function setupLoaderBuckets() {
  if (!loaderBuckets || loaderBuckets.children.length) {
    return;
  }

  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const tile = document.createElement("span");
      tile.className = "loader-bucket";
      tile.dataset.rowOrder = String(row);
      tile.dataset.colOrder = String(col);

      const invertedImage = document.createElement("img");
      invertedImage.className = "bucket-inverted";
      invertedImage.alt = "";
      invertedImage.src = EMPTY_IMAGE;

      const finalImage = document.createElement("img");
      finalImage.className = "bucket-final";
      finalImage.alt = "";
      finalImage.src = EMPTY_IMAGE;

      tile.appendChild(invertedImage);
      tile.appendChild(finalImage);
      loaderBuckets.appendChild(tile);
    }
  }
}

function syncLoaderBuckets(imageUrl, naturalWidth, naturalHeight) {
  if (!loaderFrame || !loaderBuckets) {
    return 1520;
  }

  const frameWidth = loaderFrame.clientWidth;
  const frameHeight = loaderFrame.clientHeight;
  const scale = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight);
  const renderWidth = naturalWidth * scale;
  const renderHeight = naturalHeight * scale;
  const offsetX = (frameWidth - renderWidth) * 0.5;
  const offsetY = (frameHeight - renderHeight) * 0.5;
  const frameRect = loaderFrame.getBoundingClientRect();

  const tilesByPosition = new Map(
    Array.from(loaderBuckets.children).map((tile) => [`${tile.dataset.rowOrder}-${tile.dataset.colOrder}`, tile]),
  );

  const spiralPositions = [
    [2, 2], [2, 3], [3, 3], [3, 2],
    [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [3, 1], [2, 1],
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0],
  ];

  const orderedTiles = spiralPositions
    .map(([row, col]) => tilesByPosition.get(`${row}-${col}`))
    .filter(Boolean);

  let maxDelay = 0;

  orderedTiles.forEach((tile, index) => {
    const batch = Math.floor(index / 3);
    const delay = batch * 180;
    maxDelay = Math.max(maxDelay, delay);
    tile.style.setProperty("--bucket-delay", `${delay}ms`);

    const tileRect = tile.getBoundingClientRect();
    const localX = tileRect.left - frameRect.left;
    const localY = tileRect.top - frameRect.top;

    tile.querySelectorAll("img").forEach((tileImage) => {
      tileImage.src = imageUrl;
      tileImage.style.width = `${renderWidth}px`;
      tileImage.style.height = `${renderHeight}px`;
      tileImage.style.left = `${offsetX - localX}px`;
      tileImage.style.top = `${offsetY - localY}px`;
    });
  });

  return maxDelay + 430;
}

function animateFakeLoaderBar(duration) {
  if (!loaderBarFill) {
    return;
  }

  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    loaderBarFill.style.width = `${progress * 100}%`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  loaderBarFill.style.width = "0%";
  requestAnimationFrame(tick);
}

function buildStack() {
  if (!stackStage) {
    return;
  }

  const fragment = document.createDocumentFragment();

  slides.forEach((asset, index) => {
    const card = document.createElement("div");
    card.className = "stack-card";
    card.dataset.stackIndex = String(index);
    card.dataset.projectName = asset.name;
    card.style.setProperty("--card-dim", "0");

    const iframe = document.createElement("iframe");
    iframe.className = "stack-video";
    iframe.dataset.src = buildVimeoSrc(asset.vimeoId);
    iframe.title = asset.name;
    iframe.loading = index < 4 ? "eager" : "lazy";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("aria-label", asset.name);

    if (index < 4) {
      iframe.src = iframe.dataset.src;
    }

    card.appendChild(iframe);
    fragment.appendChild(card);
    state.cards.push(card);
  });

  stackStage.appendChild(fragment);
}

function runIntro() {
  if (!loader || !loaderFrame || !loaderImage || !loaderBar || !site) {
    site?.classList.add("is-visible");
    return;
  }

  setupLoaderBuckets();
  const introPool = shuffle(stillAssets.filter((asset) => /\.(png|jpe?g|webp|gif)$/i.test(asset.src)));
  const previewAsset = introPool[0];

  if (!previewAsset) {
    site.classList.add("is-visible");
    return;
  }

  const loaderImageAsset = new Image();
  loaderImageAsset.onload = () => {
    const duration = syncLoaderBuckets(previewAsset.src, loaderImageAsset.naturalWidth, loaderImageAsset.naturalHeight);
    loaderImage.src = previewAsset.src;
    loaderFrame.classList.add("is-loading");
    loaderBar.classList.add("is-loading");
    animateFakeLoaderBar(duration);
    startVideoWarmup();

    window.setTimeout(() => {
      loaderFrame.classList.remove("is-loading");
      loaderFrame.classList.add("is-resolved");
      loaderBar.classList.remove("is-loading");
      loaderBar.classList.add("is-resolved");

      window.setTimeout(() => {
        whiteFlash?.classList.add("is-visible");
        window.setTimeout(() => {
          loader.classList.add("is-hidden");
          site.classList.add("is-visible");
          window.setTimeout(() => {
            whiteFlash?.classList.remove("is-visible");
          }, 220);
        }, 180);
      }, 1200);
    }, duration);
  };

  loaderImageAsset.onerror = () => {
    site.classList.add("is-visible");
  };
  loaderImageAsset.src = previewAsset.src;
}

buildStack();
setActiveProject(slides[0]?.name || "");
syncStackMetrics();
applyResponsiveMode();
runIntro();
updateWorldClocks();
window.addEventListener("wheel", handleDesktopWheel, { passive: false });
window.addEventListener("touchstart", handleDesktopTouchStart, { passive: true });
window.addEventListener("touchmove", handleDesktopTouchMove, { passive: false });
window.addEventListener("touchend", handleDesktopTouchEnd, { passive: true });
window.addEventListener("touchcancel", handleDesktopTouchEnd, { passive: true });
window.addEventListener("resize", handleResize, { passive: true });
window.addEventListener("orientationchange", handleResize, { passive: true });
window.setInterval(updateWorldClocks, 30000);
