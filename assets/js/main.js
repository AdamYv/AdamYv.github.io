// Bascule du thème clair / sombre. Le choix est mémorisé localement ;
// sans choix enregistré, la page suit le réglage du système.
(function () {
  var root = document.documentElement;
  var button = document.querySelector(".theme-toggle");
  if (!button) return;

  function current() {
    var forced = root.getAttribute("data-theme");
    if (forced) return forced;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function label() {
    var next = current() === "dark" ? "clair" : "sombre";
    button.setAttribute("aria-label", "Passer au thème " + next);
    button.setAttribute("title", "Passer au thème " + next);
  }

  button.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* stockage indisponible */ }
    label();
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  label();
})();
