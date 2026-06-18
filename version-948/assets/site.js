(function () {
    var ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    var normalize = function (value) {
        return (value || '').toString().toLowerCase().trim();
    };

    var textOf = function (item) {
        return normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-year'),
            item.getAttribute('data-region'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-tags'),
            item.textContent
        ].join(' '));
    };

    var applyFilter = function (input, list, emptyState) {
        var keyword = normalize(input.value);
        var items = Array.prototype.slice.call(list.children);
        var visible = 0;

        items.forEach(function (item) {
            var matched = !keyword || textOf(item).indexOf(keyword) !== -1;
            item.classList.toggle('hidden-by-filter', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    };

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var show = function (index) {
                current = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            };

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show((current + 1) % slides.length);
                }, 5200);
            }
        }

        var rail = document.querySelector('[data-movie-rail]');
        var railLeft = document.querySelector('[data-rail-left]');
        var railRight = document.querySelector('[data-rail-right]');

        if (rail && railLeft && railRight) {
            railLeft.addEventListener('click', function () {
                rail.scrollBy({ left: -360, behavior: 'smooth' });
            });
            railRight.addEventListener('click', function () {
                rail.scrollBy({ left: 360, behavior: 'smooth' });
            });
        }

        var localFilter = document.querySelector('[data-local-filter] input');
        var localList = document.querySelector('[data-filter-list]');
        var emptyState = document.querySelector('[data-empty-state]');

        if (localFilter && localList) {
            localFilter.addEventListener('input', function () {
                applyFilter(localFilter, localList, emptyState);
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var searchInput = document.querySelector('[data-search-input]');
        var queryList = document.querySelector('[data-query-results]');

        if (searchInput && queryList) {
            searchInput.value = query;
            applyFilter(searchInput, queryList, emptyState);
            searchInput.addEventListener('input', function () {
                applyFilter(searchInput, queryList, emptyState);
            });
        }

        var player = document.querySelector('[data-player]');
        if (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.player-cover');
            var jump = document.querySelector('[data-player-jump]');
            var source = player.getAttribute('data-hls');
            var hlsInstance = null;
            var prepared = false;

            var prepare = function () {
                if (prepared) {
                    return;
                }
                prepared = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = source;
            };

            var play = function () {
                prepare();
                player.classList.add('is-playing');
                var started = video.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(function () {});
                }
            };

            if (cover) {
                cover.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            if (jump) {
                jump.addEventListener('click', function (event) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    play();
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
