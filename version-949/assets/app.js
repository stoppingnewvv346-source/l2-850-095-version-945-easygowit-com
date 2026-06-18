(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-mobile-toggle]');
  var mobileNav = qs('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;

    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-hidden', i !== index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  qsa('[data-scroll-left]').forEach(function (button) {
    button.addEventListener('click', function () {
      var row = button.parentElement.querySelector('[data-scroll-row]');
      if (row) {
        row.scrollBy({ left: -420, behavior: 'smooth' });
      }
    });
  });

  qsa('[data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var row = button.parentElement.querySelector('[data-scroll-row]');
      if (row) {
        row.scrollBy({ left: 420, behavior: 'smooth' });
      }
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters(root) {
    var panel = root || document;
    var activeKindButton = qs('[data-filter-kind].is-active', panel) || qs('[data-filter-kind="all"]', panel) || qs('[data-filter-kind].is-active');
    var activeYearButton = qs('[data-filter-year].is-active', panel) || qs('[data-filter-year="all"]', panel) || qs('[data-filter-year].is-active');
    var inlineInput = qs('[data-inline-search]', panel) || qs('[data-search-input]', panel) || qs('[data-inline-search]') || qs('[data-search-input]');
    var kind = activeKindButton ? activeKindButton.getAttribute('data-filter-kind') : 'all';
    var year = activeYearButton ? activeYearButton.getAttribute('data-filter-year') : 'all';
    var keyword = normalize(inlineInput ? inlineInput.value : '');
    var cards = qsa('.movie-card', panel);

    if (!cards.length) {
      cards = qsa('.movie-card');
    }

    cards.forEach(function (card) {
      var cardKind = card.getAttribute('data-kind') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags'),
        cardKind,
        cardYear
      ].join(' '));
      var passKind = !kind || kind === 'all' || cardKind.indexOf(kind) !== -1;
      var passYear = !year || year === 'all' || cardYear === year;
      var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-filter-hidden', !(passKind && passYear && passKeyword));
    });
  }

  qsa('[data-filter-kind]').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = button.closest('[data-filter-panel]') || document;
      qsa('[data-filter-kind]', panel).forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      applyFilters(document);
    });
  });

  qsa('[data-filter-year]').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = button.closest('[data-year-panel]') || document;
      qsa('[data-filter-year]', panel).forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      applyFilters(document);
    });
  });

  qsa('[data-inline-search], [data-search-input]').forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilters(document);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  var searchInput = qs('[data-search-input]');

  if (q && searchInput) {
    searchInput.value = q;
    applyFilters(document);
  }
})();
