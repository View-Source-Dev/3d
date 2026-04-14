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

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
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
  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
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
    const t = Math.min(elapsed / duration, 1);
    loaderBarFill.style.width = `${t * 100}%`;

    if (t < 1) {
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

  stack.classList.add("is-linear");

  slides.forEach((asset, index) => {
    const card = document.createElement("div");
    card.className = "stack-card";
    card.dataset.stackIndex = String(index);
    card.dataset.projectName = asset.name;

    const iframe = document.createElement("iframe");
    iframe.className = "stack-video";
    iframe.dataset.src = buildVimeoSrc(asset.vimeoId);
    iframe.title = asset.name;
    iframe.loading = index < 3 ? "eager" : "lazy";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("aria-label", asset.name);
    if (index < 3) {
      iframe.src = iframe.dataset.src;
    }

    card.appendChild(iframe);
    stackStage.appendChild(card);
  });
}

function setupLinearPlayback() {
  if (!stackStage) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;
      const frame = card.querySelector("iframe");
      if (!frame) {
        return;
      }

      if (entry.isIntersecting && !frame.src && frame.dataset.src) {
        frame.src = frame.dataset.src;
      }

      if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
        postToVimeo(frame, "play");
        setActiveProject(card.dataset.projectName || "");
      } else if (frame.src) {
        postToVimeo(frame, "pause");
      }
    });
  }, {
    root: null,
    rootMargin: "220px 0px",
    threshold: [0, 0.45, 0.8],
  });

  stackStage.querySelectorAll(".stack-card").forEach((card) => {
    observer.observe(card);
  });
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
setupLinearPlayback();
runIntro();
updateWorldClocks();
window.setInterval(updateWorldClocks, 30000);
