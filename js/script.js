// M-Peak Coach — Home wireframe interactions

document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav
  var menuToggle = document.getElementById('menuToggle');
  var menuClose = document.getElementById('menuClose');
  var mobileNav = document.getElementById('mobileNav');

  function openMobileNav() {
    mobileNav.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openMobileNav);
  if (menuClose) menuClose.addEventListener('click', closeMobileNav);

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // FAQ accordion
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    header.addEventListener('click', function () {
      var wasOpen = item.classList.contains('opened');
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (other) {
        other.classList.remove('opened');
        other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('opened');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Header menu (logo + nav + CTA) — hidden until the visitor starts scrolling;
  // shows as a floating, semi-transparent pill once revealed. The static
  // logo hides at the same time so only one M-Peak mark is ever on screen.
  var headerMenu = document.getElementById('headerMenu');
  var staticLogo = document.querySelector('.site-header .logo');
  var siteHeader = document.querySelector('.site-header');
  if (headerMenu) {
    var SCROLL_REVEAL_THRESHOLD = 80;
    function updateHeaderMenu() {
      var scrolled = window.scrollY > SCROLL_REVEAL_THRESHOLD;
      headerMenu.classList.toggle('is-visible', scrolled);
      if (staticLogo) staticLogo.classList.toggle('is-hidden', scrolled);
      // Mobile: header bar gets a solid white background on scroll
      if (siteHeader) siteHeader.classList.toggle('is-scrolled', scrolled);
    }
    updateHeaderMenu();
    window.addEventListener('scroll', updateHeaderMenu, { passive: true });
  }

  // Header contrast — whenever a [data-header-theme="dark"] section sits
  // directly under the fixed header, flip the logo/nav/CTA to light colors
  // so every header element keeps enough contrast against what's behind it.
  var themedSections = document.querySelectorAll('[data-header-theme="dark"]');
  if (siteHeader && themedSections.length) {
    var HEADER_HEIGHT = 64;
    var themeObserver = null;
    var activeDarkSections = new Set();

    function handleThemeIntersections(entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activeDarkSections.add(entry.target);
        else activeDarkSections.delete(entry.target);
      });
      siteHeader.classList.toggle('is-on-dark', activeDarkSections.size > 0);
    }

    function setupThemeObserver() {
      if (themeObserver) themeObserver.disconnect();
      activeDarkSections.clear();
      var bottomMargin = -(window.innerHeight - HEADER_HEIGHT - 1);
      themeObserver = new IntersectionObserver(handleThemeIntersections, {
        rootMargin: '-' + HEADER_HEIGHT + 'px 0px ' + bottomMargin + 'px 0px',
        threshold: 0
      });
      themedSections.forEach(function (section) { themeObserver.observe(section); });
    }

    setupThemeObserver();
    var themeResizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(themeResizeTimeout);
      themeResizeTimeout = setTimeout(setupThemeObserver, 200);
    });
  }

  // Mobile floating "Book a Call" — appears only when none of the page's
  // own "Book a call" buttons (hero, prefooter) are in view, so it never
  // competes with one that's already on screen.
  var floatingCta = document.getElementById('floatingCta');
  var pageBookCtas = [
    document.getElementById('heroBookCta'),
    document.getElementById('bookAssessmentCta')
  ].filter(Boolean);
  if (floatingCta && pageBookCtas.length) {
    var visibleBookCtas = new Set();
    var floatingCtaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleBookCtas.add(entry.target);
        else visibleBookCtas.delete(entry.target);
      });
      floatingCta.classList.toggle('is-visible', visibleBookCtas.size === 0);
    });
    pageBookCtas.forEach(function (cta) { floatingCtaObserver.observe(cta); });
  }

  // Results page — discipline filter
  var filterTabs = document.querySelectorAll('.filter-tab');
  var resultCards = document.querySelectorAll('.result-card');
  if (filterTabs.length && resultCards.length) {
    function applyFilter(discipline) {
      resultCards.forEach(function (card) {
        var match = discipline === 'all' || card.dataset.discipline === discipline;
        card.classList.toggle('is-visible', match);
      });
    }
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        applyFilter(tab.dataset.filter);
      });
    });
    applyFilter('all');
  }

  // Booking qualification modal
  var modal = document.getElementById('bookingModal');
  if (modal) {
    var modalClose = document.getElementById('modalClose');
    var progressFill = document.getElementById('modalProgressFill');
    var summaryBox = document.getElementById('modalSummary');
    var steps = Array.prototype.slice.call(modal.querySelectorAll('.modal-step'));
    var answers = {};
    var currentStep = 1;

    function showStep(n) {
      currentStep = n;
      steps.forEach(function (step) {
        step.classList.toggle('is-active', Number(step.dataset.step) === n);
      });
      progressFill.style.width = Math.round((n / steps.length) * 100) + '%';
      if (n === steps.length) renderSummary();
    }

    function renderSummary() {
      var order = ['Discipline', 'Weekly hours', 'Goal'];
      summaryBox.innerHTML = order.map(function (key) {
        return '<div class="modal-summary-row"><span>' + key + '</span><span>' + (answers[key] || '—') + '</span></div>';
      }).join('');
    }

    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      showStep(1);
    }
    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.js-open-booking').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    steps.forEach(function (step) {
      var question = step.querySelector('.option-list');
      var nextBtn = step.querySelector('.modal-next');
      var backBtn = step.querySelector('.modal-back');
      var doneBtn = step.querySelector('.modal-done');

      if (question) {
        var options = question.querySelectorAll('.option-pill');
        options.forEach(function (option) {
          option.addEventListener('click', function () {
            options.forEach(function (o) { o.classList.remove('is-selected'); });
            option.classList.add('is-selected');
            answers[question.dataset.question] = option.dataset.value;
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          showStep(currentStep + 1);
        });
      }
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          showStep(currentStep - 1);
        });
      }
      if (doneBtn) {
        doneBtn.addEventListener('click', closeModal);
      }
    });
  }

  // Application form (Contact page)
  var applyForm = document.getElementById('applyForm');
  if (applyForm) {
    var applySteps = Array.prototype.slice.call(applyForm.querySelectorAll('.apply-step'));
    var applyConfirmation = document.getElementById('applyConfirmation');
    var applySummary = document.getElementById('applySummary');
    var applyAnswers = {};
    var applyCurrentStep = 1;

    function showApplyStep(n) {
      applyCurrentStep = n;
      applySteps.forEach(function (step) {
        step.classList.toggle('is-active', Number(step.dataset.step) === n);
      });
    }

    applySteps.forEach(function (step) {
      var question = step.querySelector('.option-list');
      var nextBtn = step.querySelector('.apply-next');
      var backBtn = step.querySelector('.apply-back');

      if (question) {
        var options = question.querySelectorAll('.option-pill');
        options.forEach(function (option) {
          option.addEventListener('click', function () {
            options.forEach(function (o) { o.classList.remove('is-selected'); });
            option.classList.add('is-selected');
            applyAnswers[question.dataset.question] = option.dataset.value;
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          showApplyStep(applyCurrentStep + 1);
        });
      }
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          showApplyStep(applyCurrentStep - 1);
        });
      }
    });

    applyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var order = ['Discipline', 'Goal', 'Weekly hours'];
      applySummary.innerHTML = order.map(function (key) {
        return '<div class="modal-summary-row"><span>' + key + '</span><span>' + (applyAnswers[key] || '—') + '</span></div>';
      }).join('');
      applyForm.style.display = 'none';
      applyConfirmation.classList.add('is-active');
      applyConfirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
