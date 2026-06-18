(function () {
    function bySelector(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = bySelector('[data-hero-slide]');
        var dots = bySelector('[data-hero-dot]');
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        bySelector('[data-filter-panel]').forEach(function (panel) {
            var container = panel.parentElement;
            var cards = bySelector('[data-movie-card]', container);
            var search = panel.querySelector('[data-filter-search]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var empty = container.querySelector('[data-empty-note]');
            function valueOf(input) {
                return input ? input.value.trim().toLowerCase() : '';
            }
            function apply() {
                var query = valueOf(search);
                var regionValue = valueOf(region);
                var typeValue = valueOf(type);
                var yearValue = valueOf(year);
                var visible = 0;
                cards.forEach(function (card) {
                    var title = (card.getAttribute('data-title') || '').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var text = (card.textContent || '').toLowerCase();
                    var matched = true;
                    if (query && title.indexOf(query) === -1 && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }
            [search, region, type, year].forEach(function (input) {
                if (input) {
                    input.addEventListener('input', apply);
                    input.addEventListener('change', apply);
                }
            });
        });
    }

    window.initHlsPlayer = function (videoId, buttonId, overlayId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var hlsInstance = null;
        if (!video || !button || !overlay || !url) {
            return;
        }
        function start() {
            if (!attached) {
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            overlay.classList.add('is-hidden');
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            start();
        });
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                var playTask = video.play();
                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {});
                }
            } else {
                video.pause();
            }
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
})();
