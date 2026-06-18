(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var pageSearch = document.getElementById("pageSearch");
  var yearFilter = document.getElementById("yearFilter");
  var sortFilter = document.getElementById("sortFilter");
  var cardGrid = document.querySelector("[data-card-grid]");

  if (cardGrid) {
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll(".movie-card"));

    function applyPageFilters() {
      var keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "all";
      var visibleCards = cards.filter(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var yearMatched = year === "all" || card.getAttribute("data-year") === year;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !(yearMatched && keywordMatched));
        return yearMatched && keywordMatched;
      });

      if (sortFilter && sortFilter.value !== "default") {
        visibleCards.sort(function (a, b) {
          if (sortFilter.value === "year-desc") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
        visibleCards.forEach(function (card) {
          cardGrid.appendChild(card);
        });
      }
    }

    [pageSearch, yearFilter, sortFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyPageFilters);
        control.addEventListener("change", applyPageFilters);
      }
    });
  }

  var searchPage = document.querySelector("[data-search-page]");

  if (searchPage && window.MOVIE_SEARCH_DATA) {
    var input = document.getElementById("globalSearch");
    var category = document.getElementById("globalCategory");
    var year = document.getElementById("globalYear");
    var results = document.getElementById("searchResults");
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function renderResults() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var categoryValue = category ? category.value : "all";
      var yearValue = year ? year.value : "all";
      var data = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.oneLine, item.region, item.genre, item.tags].join(" ").toLowerCase();
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var categoryMatched = categoryValue === "all" || item.categorySlug === categoryValue;
        var yearMatched = yearValue === "all" || item.year === yearValue;
        return keywordMatched && categoryMatched && yearMatched;
      }).slice(0, 96);

      results.innerHTML = data.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
          '    <div class="card-poster">',
          '      <img src="' + item.poster + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '      <span class="card-duration">' + item.duration + '</span>',
          '    </div>',
          '    <div class="card-body">',
          '      <h3>' + escapeHtml(item.title) + '</h3>',
          '      <p>' + escapeHtml(item.oneLine) + '</p>',
          '      <div class="card-meta">',
          '        <span>' + escapeHtml(item.category) + '</span>',
          '        <span>' + escapeHtml(item.year) + '</span>',
          '      </div>',
          '    </div>',
          '  </a>',
          '</article>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[character];
      });
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", renderResults);
        control.addEventListener("change", renderResults);
      }
    });

    if ((input && input.value) || params.get("sort")) {
      renderResults();
    }
  }
})();
