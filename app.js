/* Portfolio interactions. Core content remains usable without JavaScript. */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('#scroll-progress');
  const menuToggle = document.querySelector('#menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !mobileMenu) return;
    const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileMenu.hidden = true;
    if (wasOpen && restoreFocus) menuToggle.focus();
  };

  if (menuToggle && mobileMenu) {
    closeMenu();
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      mobileMenu.hidden = isOpen;
    });
    mobileMenu.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', scrollY > 30);
    if (progress) {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = scrollRange > 0 ? Math.min(1, Math.max(0, scrollY / scrollRange)) : 0;
      progress.style.transform = `scaleX(${fraction})`;
    }
  };
  const scheduleScroll = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  updateScroll();

  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    try {
      const revealObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      revealElements.forEach(element => revealObserver.observe(element));
      document.documentElement.classList.add('js-enhanced');
      const showAll = event => {
        if (event.matches) {
          document.documentElement.classList.remove('js-enhanced');
          revealElements.forEach(element => element.classList.add('in-view'));
          revealObserver.disconnect();
        }
      };
      if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', showAll);
    } catch (error) {
      document.documentElement.classList.remove('js-enhanced');
      revealElements.forEach(element => element.classList.add('in-view'));
    }
  }

  const anchorLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const navSections = anchorLinks.reduce((sections, link) => {
    const id = link.getAttribute('href').slice(1);
    const section = id ? document.getElementById(id) : null;
    if (section && !sections.includes(section)) sections.push(section);
    return sections;
  }, []);
  const setActiveSection = id => {
    anchorLinks.forEach(link => {
      const isActive = id !== null && link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  if (navSections.length) {
    const updateActiveSection = () => {
      const activationLine = Math.min(window.innerHeight * 0.35, 220);
      let active = null;
      for (const section of navSections) {
        if (section.getBoundingClientRect().top <= activationLine) active = section;
      }
      setActiveSection(active ? active.id : null);
    };
    let navFrame = 0;
    const scheduleActiveSection = () => {
      if (!navFrame) {
        navFrame = window.requestAnimationFrame(() => {
          navFrame = 0;
          updateActiveSection();
        });
      }
    };
    window.addEventListener('scroll', scheduleActiveSection, { passive: true });
    window.addEventListener('resize', scheduleActiveSection, { passive: true });
    updateActiveSection();
  }

  const lensContent = {
    performance: {
      label: 'Performance lens',
      title: 'Make performance understandable.',
      text: 'Connect orders, margins and backlog with product profitability and cost analysis, bringing business performance into clear MIS and leadership reporting.',
      steps: ['Orders & margins', 'Patterns & variances', 'Management-ready insight']
    },
    planning: {
      label: 'Planning lens',
      title: 'Bring the next quarter into focus.',
      text: 'Support monthly and quarterly forecasting, track key performance indicators and monitor the annual operating plan to give teams a clearer view of what comes next.',
      steps: ['Monthly & quarterly forecasts', 'KPI & plan tracking', 'Forward-looking review']
    },
    control: {
      label: 'Control lens',
      title: 'Build confidence in the details.',
      text: 'Support close reconciliations and exception reviews, alongside SAP allocation, order and revenue recognition processes that contribute to dependable financial reporting.',
      steps: ['Reconcile & review', 'SAP & closing processes', 'Reliable financial reporting']
    }
  };
  const lensTabs = Array.from(document.querySelectorAll('.lens-tab[data-lens]'));
  const lensTabList = document.querySelector('.lens-tabs');
  const horizontalTabs = window.matchMedia('(max-width: 700px)');
  const updateTabOrientation = () => {
    if (lensTabList) lensTabList.setAttribute('aria-orientation', horizontalTabs.matches ? 'horizontal' : 'vertical');
  };
  updateTabOrientation();
  if (horizontalTabs.addEventListener) horizontalTabs.addEventListener('change', updateTabOrientation);
  else if (horizontalTabs.addListener) horizontalTabs.addListener(updateTabOrientation);
  const lensPanel = document.querySelector('#lens-panel');
  let lensTimer;
  const renderLens = key => {
    const content = lensContent[key];
    if (!content) return;
    const updates = {
      'lens-label': content.label,
      'lens-title': content.title,
      'lens-text': content.text,
      'lens-step-1': content.steps[0],
      'lens-step-2': content.steps[1],
      'lens-step-3': content.steps[2]
    };
    Object.entries(updates).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  };
  const selectLens = (tab, moveFocus = false, animate = true) => {
    const key = tab.dataset.lens;
    if (!lensContent[key]) return;
    window.clearTimeout(lensTimer);
    lensTabs.forEach(item => {
      const isSelected = item === tab;
      item.setAttribute('aria-selected', String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
      item.classList.toggle('active', isSelected);
    });
    if (lensPanel) {
      if (!tab.id) tab.id = `lens-tab-${key}`;
      lensPanel.setAttribute('aria-labelledby', tab.id);
      lensPanel.classList.remove('is-changing');
      if (animate && !reducedMotion.matches) {
        lensPanel.classList.add('is-changing');
        lensTimer = window.setTimeout(() => {
          renderLens(key);
          lensPanel.classList.remove('is-changing');
        }, 160);
      } else {
        renderLens(key);
      }
    } else {
      renderLens(key);
    }
    if (moveFocus) tab.focus();
  };
  if (lensTabs.length) {
    lensTabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'lens-panel');
      if (!tab.id) tab.id = `lens-tab-${tab.dataset.lens}`;
      tab.addEventListener('click', () => selectLens(tab));
      tab.addEventListener('keydown', event => {
        let nextIndex;
        const nextKey = horizontalTabs.matches ? 'ArrowRight' : 'ArrowDown';
        const previousKey = horizontalTabs.matches ? 'ArrowLeft' : 'ArrowUp';
        if (event.key === nextKey) nextIndex = (index + 1) % lensTabs.length;
        else if (event.key === previousKey) nextIndex = (index - 1 + lensTabs.length) % lensTabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = lensTabs.length - 1;
        else return;
        event.preventDefault();
        selectLens(lensTabs[nextIndex], true);
      });
    });
    if (lensPanel) {
      lensPanel.setAttribute('role', 'tabpanel');
      lensPanel.tabIndex = 0;
    }
    const initialTab = lensTabs.find(tab => tab.getAttribute('aria-selected') === 'true') || lensTabs[0];
    selectLens(initialTab, false, false);
  }

  const copyEmail = document.querySelector('#copy-email');
  const copyStatus = document.querySelector('#copy-status');
  let copyTimer;
  if (copyStatus) copyStatus.setAttribute('aria-live', 'polite');
  if (copyEmail) {
    copyEmail.addEventListener('click', async () => {
      const email = copyEmail.dataset.email;
      if (!email) return;
      window.clearTimeout(copyTimer);
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(email);
        copyEmail.classList.add('copied');
        if (copyStatus) copyStatus.textContent = 'Email address copied.';
        copyTimer = window.setTimeout(() => {
          copyEmail.classList.remove('copied');
          if (copyStatus) copyStatus.textContent = '';
        }, 3500);
      } catch (error) {
        copyEmail.classList.remove('copied');
        if (copyStatus) copyStatus.textContent = 'Please use the email link.';
      }
    });
  }

  const canAnimatePointer = () => finePointer.matches && !reducedMotion.matches;
  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    heroArt.addEventListener('pointermove', event => {
      if (!canAnimatePointer()) return;
      const bounds = heroArt.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-12, Math.min(12, ((event.clientX - bounds.left) / bounds.width - 0.5) * 24));
      const y = Math.max(-12, Math.min(12, ((event.clientY - bounds.top) / bounds.height - 0.5) * 24));
      heroArt.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
      heroArt.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
    });
    heroArt.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--pointer-x', '0px');
      heroArt.style.setProperty('--pointer-y', '0px');
    });
  }
  const tiltCards = Array.from(document.querySelectorAll('.tilt-card'));
  const resetTilt = card => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };
  tiltCards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!canAnimatePointer()) return;
      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      card.style.setProperty('--tilt-x', `${(-x * 2).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(y * 2).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => resetTilt(card));
  });
  const resetPointerEffects = () => {
    if (heroArt) {
      heroArt.style.setProperty('--pointer-x', '0px');
      heroArt.style.setProperty('--pointer-y', '0px');
    }
    tiltCards.forEach(resetTilt);
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', resetPointerEffects);
  if (finePointer.addEventListener) finePointer.addEventListener('change', resetPointerEffects);

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
