(() => {
  const isMobileLayout = () => window.matchMedia('(max-width: 900px)').matches;

  let observer = null;
  let snapTimer = null;

  function updateMobileMode() {
    document.documentElement.classList.toggle('mobile-stack-mode', isMobileLayout());
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
  }

  function scheduleSnap() {
    if (!isMobileLayout()) {
      return;
    }

    if (snapTimer) {
      window.clearTimeout(snapTimer);
    }

    snapTimer = window.setTimeout(() => {
      const cards = Array.from(document.querySelectorAll('.stack-card'));
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

      targetCard?.card?.scrollIntoView({
        block: 'start',
        behavior: 'auto',
      });
    }, 90);
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
  }

  updateMobileMode();
  window.addEventListener('load', setupObserver);
  window.addEventListener('resize', setupObserver);
  window.addEventListener('scroll', scheduleSnap, { passive: true });
})();
