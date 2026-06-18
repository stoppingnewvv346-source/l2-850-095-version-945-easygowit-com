(function () {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var configNode = document.getElementById('movie-config');

  if (!video || !overlay || !configNode) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var source = config.source || '';
  var started = false;
  var hls = null;

  function attachSource() {
    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    if (!started) {
      attachSource();
      started = true;
    }

    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
