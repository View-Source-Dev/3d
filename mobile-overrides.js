(() => {
  const isMobileLayout = () => window.matchMedia('(max-width: 900px)').matches;

  let observer = null;
  let snapTimer = null;
  let autoRollTimer = null;
  let userPauseTimer = null;
  let activeCardIndex = 0;

  function getCards() {
    return Array.from(document.querySelectorAll('.stack-card'));
  }

  function updateMobileMode() {
    document.documentElement.classList.toggle('mobile-stack-mode', isMobileLayout());
  }

  function clearAutoRoll() {
    if (autoRollTimer) {
      window.clearInterval(autoRollTimer);
      autoRollTimer = null;
    }
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
    if (snapTimer) {
      window.clearTimeout(snapTimer);
      snapTimer = null;
    }
    clearAutoRoll();
    clearUserPause();
  }

  function scheduleSnap() {
    if (!isMobileLayout()) {
      return;
    }

    if (snapTimer) {
      window.clearTimeout(snapTimer);
    }

    snapTimer = window.setTimeout(() => {
      const cards = getCards();
      if (!cards.length) {
        return;
      }

      const targetCard = cards.reduce((closest, card) => {
        const rect = card.getBoundingClientRect();
        const score = Math.abs(rect.top);
        if (!closest || score < closest.score) {
          return { card, score };
        }
        return closest;
      }, null);

      if (targetCard) {
        activeCardIndex = cards.indexOf(targetCard.card);
      }

      targetCard?.card?.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }, 90);
  }

  function startAutoRoll() {
    clearAutoRoll();
    if (!isMobileLayout()) {
      return;
    }

    autoRollTimer = window.setInterval(() => {
      const cards = getCards();
      if (!cards.length) {
        return;
      }

      const nextIndex = (activeCardIndex + 1) % cards.length;
      activeCardIndex = nextIndex;
      cards[nextIndex].scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }, 4200);
  }

  function pauseAutoRoll() {
    if (!isMobileLayout()) {
      return;
    }

    clearAutoRoll();
    clearUserPause();
    userPauseTimer = window.setTimeout(() => {
      startAutoRoll();
    }, 7000);
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
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
          activeCardIndex = cards.indexOf(card);
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
    startAutoRoll();
  }

  updateMobileMode();
  window.addEventListener('load', setupObserver);
  window.addEventListener('resize', setupObserver);
  window.addEventListener('scroll', scheduleSnap, { passive: true });
  window.addEventListener('touchstart', pauseAutoRoll, { passive: true });
  window.addEventListener('pointerdown', pauseAutoRoll, { passive: true });
})();
