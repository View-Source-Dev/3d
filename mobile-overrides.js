(() => {
  const isMobileLayout = () => window.matchMedia('(max-width: 900px)').matches;

  let observer = null;
  let autoRollFrame = null;
  let userPauseTimer = null;
  let activeCardIndex = 0;
  let lastAutoRollTime = 0;
  let autoRollPaused = false;

  function getCards() {
    return Array.from(document.querySelectorAll('.stack-card'));
  }

  function updateMobileMode() {
    document.documentElement.classList.toggle('mobile-stack-mode', isMobileLayout());
  }

  function clearAutoRoll() {
    if (autoRollFrame) {
      window.cancelAnimationFrame(autoRollFrame);
      autoRollFrame = null;
    }
    lastAutoRollTime = 0;
  }

  function clearUserPause() {
    if (userPauseTimer) {
      window.clearTimeout(userPauseTimer);
      userPauseTimer = null;
    }
  }

  function teardownObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    clearAutoRoll();
    clearUserPause();
  }

  function primeNearbyFrames(cards, centerIndex) {
    cards.forEach((card, index) => {
      const frame = card.querySelector('iframe');
      if (!frame || !frame.dataset.src) {
        return;
      }

      if (Math.abs(index - centerIndex) <= 3 && !frame.src) {
        frame.src = frame.dataset.src;
        frame.loading = 'eager';
      }
    });
  }

  function updateActiveCardFromViewport() {
    if (!isMobileLayout()) {
      return;
    }

    const cards = getCards();
    if (!cards.length) {
      return;
    }

    const targetCard = cards.reduce((closest, card) => {
      const rect = card.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.5;
      const cardCenter = rect.top + (rect.height * 0.5);
      const score = Math.abs(cardCenter - viewportCenter);
      if (!closest || score < closest.score) {
        return { card, score };
      }
      return closest;
    }, null);

    if (targetCard) {
      activeCardIndex = cards.indexOf(targetCard.card);
      primeNearbyFrames(cards, activeCardIndex);
    }
  }

  function stepAutoRoll(now) {
    if (!isMobileLayout()) {
      clearAutoRoll();
      return;
    }

    if (autoRollPaused) {
      autoRollFrame = window.requestAnimationFrame(stepAutoRoll);
      return;
    }

    if (!lastAutoRollTime) {
      lastAutoRollTime = now;
    }

    const delta = now - lastAutoRollTime;
    lastAutoRollTime = now;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    if (!atBottom) {
      const pixelsPerSecond = 10;
      window.scrollBy(0, (pixelsPerSecond * delta) / 1000);
    }

    autoRollFrame = window.requestAnimationFrame(stepAutoRoll);
  }

  function startAutoRoll() {
    clearAutoRoll();
    if (!isMobileLayout()) {
      return;
    }
    autoRollPaused = false;
    autoRollFrame = window.requestAnimationFrame(stepAutoRoll);
  }

  function pauseAutoRoll() {
    if (!isMobileLayout()) {
      return;
    }

    autoRollPaused = true;
    clearUserPause();
    userPauseTimer = window.setTimeout(() => {
      autoRollPaused = false;
    }, 4000);
  }

  function setupObserver() {
    teardownObserver();
    updateMobileMode();
    if (!isMobileLayout()) {
      return;
    }

    const stage = document.querySelector('#stackStage');
    const currentTitle = document.querySelector('.stack-project-current');
    const cards = Array.from(stage?.querySelectorAll('.stack-card') || []);
    if (!cards.length) {
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const frame = card.querySelector('iframe');
        if (!frame) {
          return;
        }

        if (!frame.src && frame.dataset.src) {
          frame.src = frame.dataset.src;
          frame.loading = 'eager';
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
          activeCardIndex = cards.indexOf(card);
          primeNearbyFrames(cards, activeCardIndex);
          frame.contentWindow?.postMessage(JSON.stringify({ method: 'play' }), 'https://player.vimeo.com');
          if (currentTitle) {
            currentTitle.textContent = card.dataset.projectName || '';
          }
        } else if (frame.src) {
          frame.contentWindow?.postMessage(JSON.stringify({ method: 'pause' }), 'https://player.vimeo.com');
        }
      });
    }, {
      threshold: [0.25, 0.55, 0.85],
      rootMargin: '0px 0px -12% 0px',
    });

    cards.forEach((card) => observer.observe(card));
    primeNearbyFrames(cards, 0);
    startAutoRoll();
  }

  updateMobileMode();
  window.addEventListener('load', setupObserver);
  window.addEventListener('resize', setupObserver);
  window.addEventListener('scroll', updateActiveCardFromViewport, { passive: true });
  window.addEventListener('touchstart', pauseAutoRoll, { passive: true });
  window.addEventListener('pointerdown', pauseAutoRoll, { passive: true });
})();
