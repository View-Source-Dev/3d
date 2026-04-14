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
const stackProjectName = document.querySelector("#stackProjectName");
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
  { name: "L'Or\u00e9al", vimeoId: "1182987487" },
  { name: "Bandit", vimeoId: "1182987377" },
  { name: "Sandro", vimeoId: "1182988010" },
  { name: "Sandro", vimeoId: "1182987807" },
  { name: "Icon", vimeoId: "1183004855" },
  { name: "Icon", vimeoId: "1182987816" },
  { name: "Lab", vimeoId: "1182987729" },
];

const projectNames = slides.map((slide) => slide.name);

let stackMotionFrame = null;
let stackTargetProgress = 0;
let currentStackProgress = 0;
let activeProjectIndex = 0;
let pendingProjectIndex = 0;
let lastDominantIndex = 0;
let titleFadeFrame = null;
let titleFadePhase = "idle";
let titleFadeStart = 0;
let stackMaxProgress = 0;
let stackStartOffset = 0;
let vimeoScale = 1;
let scrollSnapTimer = null;
let isSnapping = false;
let viewportHeight = window.innerHeight || 1;
let useLinearMobileLayout = false;
let linearObserver = null;

const INITIAL_PRELOAD_COUNT = 2;
const FORWARD_PRELOAD_COUNT = 4;
const VIDEO_START_OFFSET_SECONDS = 0.5;

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
    api: "1",
  });
  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
}

function syncViewportHeight() {
  viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
  document.documentElement.style.setProperty("--stack-screen-height", `${viewportHeight}px`);
}

function shouldUseLinearMobileLayout() {
  return window.matchMedia("(max-width: 768px) and (orientation: portrait)").matches;
}

function getStackFrames() {
  return Array.from(stackStage?.querySelectorAll("iframe") || []);
}

function postToVimeo(frame, method, value) {
  if (!frame?.contentWindow) {
    return;
  }

  const payload = value === undefined ? { method } : { method, value };
  frame.contentWindow.postMessage(JSON.stringify(payload), "https://player.vimeo.com");
}

function ensureFrameLoaded(frame) {
  if (!frame || frame.src || !frame.dataset.src) {
    return;
  }

  frame.src = frame.dataset.src;
  frame.loading = "eager";
}

function setFramePlaying(frame, shouldPlay) {
  if (!frame) {
    return;
  }

  frame.dataset.shouldPlay = shouldPlay ? "true" : "false";
  if (!frame.src) {
    return;
  }

  if (shouldPlay) {
    postToVimeo(frame, "play");
  } else {
    postToVimeo(frame, "pause");
  }
}

function preloadFramesThrough(index) {
  const frames = getStackFrames();
  const maxIndex = Math.min(index, frames.length - 1);

  for (let frameIndex = 0; frameIndex <= maxIndex; frameIndex += 1) {
    ensureFrameLoaded(frames[frameIndex]);
  }
}

function setupLinearObserver() {
  if (!stackStage) {
    return;
  }

  linearObserver?.disconnect();
  linearObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      const frame = card.querySelector("iframe");
      if (!frame) {
        return;
      }

      if (entry.isIntersecting) {
        ensureFrameLoaded(frame);
      }

      const shouldPlay = entry.isIntersecting && entry.intersectionRatio > 0.35;
      setFramePlaying(frame, shouldPlay);

      if (shouldPlay) {
        const cardIndex = Number(card.dataset.stackIndex || 0);
        activeProjectIndex = cardIndex;
        pendingProjectIndex = cardIndex;
        ensureActiveProjectTitle();
      }
    });
  }, {
    root: null,
    rootMargin: "220px 0px",
    threshold: [0, 0.35, 0.7],
  });

  stackStage.querySelectorAll(".stack-card").forEach((card) => {
    linearObserver.observe(card);
  });
}

function applyLayoutMode() {
  useLinearMobileLayout = shouldUseLinearMobileLayout();
  stack?.classList.toggle("is-linear", useLinearMobileLayout);

  if (useLinearMobileLayout) {
    preloadFramesThrough(Math.min(INITIAL_PRELOAD_COUNT - 1, slides.length - 1));
    setupLinearObserver();
  } else {
    linearObserver?.disconnect();
    linearObserver = null;
  }
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
    Array.from(loaderBuckets.children).map((tile) => [
      `${tile.dataset.rowOrder}-${tile.dataset.colOrder}`,
      tile,
    ]),
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
    const randomType = Math.random();
    const offsetInBatch = randomType < 0.2
      ? 240 + Math.floor(Math.random() * 180)
      : randomType < 0.55
        ? 90 + Math.floor(Math.random() * 120)
        : Math.floor(Math.random() * 70);
    const delay = (batch * 180) + Math.floor(offsetInBatch * 0.5);
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
    const t = Math.min(elapsed / duration, 1);

    let progress;
    if (t < 0.18) {
      progress = (t / 0.18) * 0.34;
    } else if (t < 0.52) {
      const local = (t - 0.18) / 0.34;
      progress = 0.34 + (local * 0.28);
    } else if (t < 0.82) {
      const local = (t - 0.52) / 0.30;
      progress = 0.62 + (local * 0.2);
    } else {
      const local = (t - 0.82) / 0.18;
      progress = 0.82 + (local * 0.18);
    }

    const wobble = (Math.sin(t * 18) + Math.sin(t * 7)) * 0.006;
    const clamped = Math.max(0, Math.min(1, progress + wobble));
    loaderBarFill.style.width = `${clamped * 100}%`;

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      loaderBarFill.style.width = "100%";
    }
  }

  loaderBarFill.style.width = "0%";
  requestAnimationFrame(tick);
}

function buildStack() {
  if (!stackStage) {
    return;
  }

  const slideCount = slides.length || 1;
  const slots = Array.from({ length: slideCount }, (_, index) => slides[index]);

  slots.forEach((asset, index) => {
    const card = document.createElement("div");
    card.className = "stack-card";
    card.style.zIndex = "1";
    card.dataset.stackIndex = String(index);
    card.dataset.projectName = asset.name;

    const iframe = document.createElement("iframe");
    iframe.className = "stack-video";
    iframe.dataset.src = buildVimeoSrc(asset.vimeoId);
    iframe.title = asset.name;
    iframe.loading = "lazy";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("aria-label", asset.name);
    iframe.dataset.startOffsetApplied = "false";
    iframe.dataset.shouldPlay = index < 2 ? "true" : "false";
    iframe.addEventListener("load", () => {
      window.setTimeout(() => {
        if (iframe.dataset.startOffsetApplied !== "true") {
          postToVimeo(iframe, "setCurrentTime", VIDEO_START_OFFSET_SECONDS);
          iframe.dataset.startOffsetApplied = "true";
        }
        setFramePlaying(iframe, iframe.dataset.shouldPlay === "true");
      }, 240);
    });
    if (index < INITIAL_PRELOAD_COUNT) {
      iframe.src = iframe.dataset.src;
      iframe.loading = "eager";
    }

    card.appendChild(iframe);
    stackStage.appendChild(card);
  });
}

function setTitleState(currentOpacity, nextOpacity, currentShift, nextShift, currentVisible, nextVisible) {
  if (!stackProjectName) {
    return;
  }

  stackProjectName.style.setProperty("--project-opacity-current", `${currentOpacity.toFixed(3)}`);
  stackProjectName.style.setProperty("--project-opacity-next", `${nextOpacity.toFixed(3)}`);
  stackProjectName.style.setProperty("--project-shift-current", `${currentShift.toFixed(1)}px`);
  stackProjectName.style.setProperty("--project-shift-next", `${nextShift.toFixed(1)}px`);
  stackProjectName.style.setProperty("--project-visibility-current", currentVisible ? "visible" : "hidden");
  stackProjectName.style.setProperty("--project-visibility-next", nextVisible ? "visible" : "hidden");
}

function ensureActiveProjectTitle() {
  if (stackProjectCurrent) {
    stackProjectCurrent.textContent = projectNames[activeProjectIndex] || "";
  }
  if (stackProjectNext) {
    stackProjectNext.textContent = projectNames[pendingProjectIndex] || "";
  }
  setTitleState(1, 0, 0, 28, true, false);
}

function stepTitleFade(now) {
  const elapsed = now - titleFadeStart;

  if (titleFadePhase === "out") {
    const progress = clamp(elapsed / 140, 0, 1);
    setTitleState(1 - progress, 0, -28 * progress, 28, progress < 0.98, false);

    if (progress >= 1) {
      activeProjectIndex = pendingProjectIndex;
      if (stackProjectCurrent) {
        stackProjectCurrent.textContent = projectNames[activeProjectIndex] || "";
      }
      titleFadePhase = "in";
      titleFadeStart = now;
      setTitleState(0, 0, 28, 28, true, false);
      titleFadeFrame = requestAnimationFrame(stepTitleFade);
      return;
    }
  } else if (titleFadePhase === "in") {
    const progress = clamp(elapsed / 180, 0, 1);
    setTitleState(progress, 0, 28 * (1 - progress), 28, true, false);

    if (progress >= 1) {
      titleFadePhase = "idle";
      titleFadeFrame = null;
      return;
    }
  }

  titleFadeFrame = requestAnimationFrame(stepTitleFade);
}

function transitionProjectTitle(targetIndex) {
  if (!stackProjectCurrent || !stackProjectNext) {
    return;
  }

  const currentName = projectNames[activeProjectIndex] || "";
  const targetName = projectNames[targetIndex] || "";
  if (targetName && targetName === currentName) {
    pendingProjectIndex = targetIndex;
    ensureActiveProjectTitle();
    return;
  }

  if (targetIndex === activeProjectIndex && titleFadePhase === "idle") {
    ensureActiveProjectTitle();
    return;
  }

  if (targetIndex === pendingProjectIndex && titleFadePhase !== "idle") {
    return;
  }

  pendingProjectIndex = targetIndex;
  stackProjectNext.textContent = projectNames[pendingProjectIndex] || "";

  if (titleFadeFrame) {
    cancelAnimationFrame(titleFadeFrame);
    titleFadeFrame = null;
  }

  titleFadePhase = "out";
  titleFadeStart = performance.now();
  titleFadeFrame = requestAnimationFrame(stepTitleFade);
}

function updateStackMotion() {
  if (!stackStage) {
    return;
  }

  const cards = Array.from(stackStage.querySelectorAll(".stack-card"));
  const cardCount = cards.length;
  if (!cardCount) {
    return;
  }

  if (useLinearMobileLayout) {
    cards.forEach((card) => {
      card.style.zIndex = "1";
      card.style.setProperty("--stack-y", "0%");
    });
    return;
  }

  const clampedProgress = clamp(currentStackProgress, 0, Math.max(0, cardCount - 1));
  const currentIndex = Math.floor(clampedProgress);
  const nextIndex = Math.min(currentIndex + 1, cardCount - 1);
  const transitionProgress = clampedProgress - currentIndex;
  const eased = 1 - Math.pow(1 - transitionProgress, 2.8);

  cards.forEach((card, index) => {
    let translateY = 100;
    let zIndex = 1;

    if (index === currentIndex) {
      translateY = 0;
      zIndex = 2;
    }

    if (index === nextIndex) {
      translateY = (1 - eased) * 100;
      zIndex = 3;
    }

    if (translateY < 2.2) {
      translateY = 0;
    }

    if (translateY > 97.8) {
      translateY = 100;
    }

    card.style.zIndex = String(zIndex);
    card.style.setProperty("--stack-y", `${translateY}%`);
  });

  const dominantIndex = transitionProgress >= 0.5 ? nextIndex : currentIndex;
  if (dominantIndex !== lastDominantIndex) {
    if ((dominantIndex === nextIndex && transitionProgress >= 0.55)
      || (dominantIndex === currentIndex && transitionProgress <= 0.45)) {
      lastDominantIndex = dominantIndex;
      transitionProjectTitle(dominantIndex);
    }
  } else if (titleFadePhase === "idle") {
    ensureActiveProjectTitle();
  }

  const dominantCoverage = transitionProgress >= 0.5 ? transitionProgress : 1 - transitionProgress;
  const subtitleOpacity = dominantCoverage >= 0.5 ? 1 : 0.85;
  document.documentElement.style.setProperty("--subtitle-opacity", `${subtitleOpacity.toFixed(3)}`);

  cards.forEach((card, index) => {
    const frame = card.querySelector("iframe");
    if (!frame) {
      return;
    }
    const prevIndex = Math.max(0, currentIndex - 1);
    const nextNextIndex = Math.min(nextIndex + 1, cardCount - 1);
    const shouldLoad = index === currentIndex || index === nextIndex || index === prevIndex || index === nextNextIndex;
    const shouldPlay = index === currentIndex || index === nextIndex;
    if (shouldLoad) {
      ensureFrameLoaded(frame);
      setFramePlaying(frame, shouldPlay);
      if (shouldPlay) {
        frame.removeAttribute("data-paused");
      } else {
        frame.setAttribute("data-paused", "true");
      }
    } else if (frame.src) {
      setFramePlaying(frame, false);
      frame.removeAttribute("src");
      frame.setAttribute("data-paused", "true");
    }
  });

  preloadFramesThrough(Math.min(nextIndex + 1, cardCount - 1));
}

function stepStackMotion() {
  currentStackProgress += (stackTargetProgress - currentStackProgress) * 0.06;

  if (Math.abs(stackTargetProgress - currentStackProgress) < 0.001) {
    currentStackProgress = stackTargetProgress;
  }

  updateStackMotion();

  if (Math.abs(stackTargetProgress - currentStackProgress) >= 0.001) {
    stackMotionFrame = requestAnimationFrame(stepStackMotion);
  } else {
    stackMotionFrame = null;
  }
}

function queueStackMotion() {
  if (stackMotionFrame) {
    return;
  }

  stackMotionFrame = requestAnimationFrame(stepStackMotion);
}

function updateStackFromScroll() {
  if (!site?.classList.contains("is-visible")) {
    return;
  }

  if (useLinearMobileLayout) {
    return;
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  if (scrollY > stackStartOffset + (stackMaxProgress * window.innerHeight)) {
    window.scrollTo(0, stackStartOffset + (stackMaxProgress * window.innerHeight));
    return;
  }
  const local = scrollY - stackStartOffset;
  const rawProgress = local / Math.max(1, window.innerHeight);
  stackTargetProgress = clamp(rawProgress, 0, stackMaxProgress);
  queueStackMotion();

  if (scrollSnapTimer) {
    window.clearTimeout(scrollSnapTimer);
  }
  scrollSnapTimer = window.setTimeout(() => {
    snapToNearestSlide();
  }, 2000);
}

function snapToNearestSlide() {
  if (useLinearMobileLayout || isSnapping || !site?.classList.contains("is-visible")) {
    return;
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  const local = scrollY - stackStartOffset;
  const progress = clamp(local / Math.max(1, window.innerHeight), 0, stackMaxProgress);
  const targetIndex = Math.round(progress);
  const targetScroll = stackStartOffset + (targetIndex * window.innerHeight);

  if (Math.abs(targetScroll - scrollY) < 1) {
    return;
  }

  isSnapping = true;
  window.scrollTo({ top: targetScroll, behavior: "smooth" });
  window.setTimeout(() => {
    isSnapping = false;
  }, 420);
}

function updateVimeoScale() {
  const viewportAspect = window.innerWidth / Math.max(1, window.innerHeight);
  const baseAspect = 16 / 9;
  const scale = Math.max(viewportAspect / baseAspect, baseAspect / viewportAspect);
  vimeoScale = Math.max(1, scale);
  document.documentElement.style.setProperty("--vimeo-scale", vimeoScale.toFixed(4));
}

function runIntro() {
  if (!loader || !loaderFrame || !loaderImage || !loaderBar || !site) {
    site?.classList.add("is-visible");
    return;
  }

  setupLoaderBuckets();
  const introCandidates = stillAssets.filter((asset) => /\.(png|jpe?g|webp|gif)$/i.test(asset.src));
  const introPool = introCandidates.length ? introCandidates : stillAssets;
  const shuffled = shuffle(introPool);

  const tryLoad = (index = 0) => {
    const previewAsset = shuffled[index] || introPool[0];
    if (!previewAsset) {
      site?.classList.add("is-visible");
      return;
    }
    const previewSrc = previewAsset.type === "video" ? previewAsset.poster : previewAsset.src;
    const loaderImageAsset = new Image();

    loaderImageAsset.onload = () => {
      const duration = syncLoaderBuckets(previewSrc, loaderImageAsset.naturalWidth, loaderImageAsset.naturalHeight);
      loaderImage.src = previewSrc;
      loaderFrame.classList.add("is-loading");
      loaderBar.classList.add("is-loading");
      animateFakeLoaderBar(duration);

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
            window.scrollTo(0, 0);
            stackStartOffset = stackStage?.getBoundingClientRect().top + window.scrollY;
            window.setTimeout(() => {
              whiteFlash?.classList.remove("is-visible");
            }, 220);
            updateStackFromScroll();
          }, 180);
        }, 2200);
      }, duration);
    };

    loaderImageAsset.onerror = () => {
      if (index + 1 < shuffled.length) {
        tryLoad(index + 1);
      } else {
        site?.classList.add("is-visible");
      }
    };

    loaderImageAsset.src = previewSrc;
  };

  tryLoad(0);
}

buildStack();
stackMaxProgress = Math.max(0, slides.length - 1);
document.documentElement.style.setProperty("--stack-count", String(slides.length || 1));
syncViewportHeight();
applyLayoutMode();
updateVimeoScale();
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

runIntro();
updateWorldClocks();
window.setInterval(updateWorldClocks, 30000);
window.scrollTo(0, 0);
currentStackProgress = 0;
stackTargetProgress = 0;
activeProjectIndex = 0;
pendingProjectIndex = 0;
ensureActiveProjectTitle();
lastDominantIndex = 0;
updateStackMotion();

window.addEventListener("scroll", updateStackFromScroll, { passive: true });
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  syncViewportHeight();
  applyLayoutMode();
  stackStartOffset = stackStage?.getBoundingClientRect().top + window.scrollY;
  currentStackProgress = 0;
  stackTargetProgress = 0;
  activeProjectIndex = 0;
  pendingProjectIndex = 0;
  ensureActiveProjectTitle();
  updateStackMotion();
  updateStackFromScroll();
  updateVimeoScale();
});

window.addEventListener("resize", () => {
  syncViewportHeight();
  applyLayoutMode();
  stackStartOffset = stackStage?.getBoundingClientRect().top + window.scrollY;
  updateStackFromScroll();
  updateVimeoScale();
});
