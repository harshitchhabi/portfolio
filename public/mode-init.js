// Runs before first paint. A file, not an inline script, so the CSP stays strict.
(function () {
  var html = document.documentElement;
  // A remembered "skip the show": the plain view never flashes the full one.
  try {
    if (localStorage.getItem('skip-show') === 'on') html.setAttribute('data-mode', 'skip');
  } catch (e) {}
  // Hold the big display titles back until their font is in (it's preloaded,
  // so usually a few ms), instead of flashing Georgia and swapping. Gives up
  // after 900ms and shows them anyway.
  try {
    if (document.fonts && document.fonts.load) {
      html.classList.add('fonts-wait');
      var done = function () {
        html.classList.remove('fonts-wait');
      };
      Promise.race([document.fonts.load('400 1em "Redaction 50"'), new Promise(function (r) { setTimeout(r, 900); })]).then(done, done);
    }
  } catch (e) {}
})();
