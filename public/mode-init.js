// Applies a remembered "skip the show" before first paint, so the plain view
// never flashes the full one. A file, not an inline script, so the CSP stays strict.
(function () {
  try {
    if (localStorage.getItem('skip-show') === 'on') document.documentElement.setAttribute('data-mode', 'skip');
  } catch (e) {}
})();
