// Lectures de la semaine : liste les papiers des 7 derniers jours fournis
// par l'API QFin Papers (GET /api/v1/digest). Aucune donnée de l'API n'est
// injectée en HTML : tout passe par textContent.
(function () {
  // URL publique de l'API, sans « / » final (ex. "https://papers.exemple.fr").
  // Seul GET /api/v1/digest est public ; le serveur n'autorise que l'origine
  // https://adamyv.github.io.
  var API_BASE = "https://adam-dell-home.tail0d4f16.ts.net:10000";

  // En local uniquement, ?api=http://127.0.0.1:5000 permet de tester.
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var override = new URLSearchParams(location.search).get("api");
  if (isLocal && override) API_BASE = override.replace(/\/+$/, "");

  var THEMES = {
    pricing: "Pricing & dérivés",
    trading: "Trading algo & ML",
    risk: "Risque & portefeuille"
  };
  var ABSTRACT_MAX = 1200;

  var list = document.querySelector(".papers");
  var status = document.querySelector(".papers-status");
  var toolbar = document.querySelector(".papers-toolbar");
  var filters = document.querySelector(".papers-filters");
  var count = document.querySelector(".papers-count");
  var active = document.querySelector(".papers-active");
  var clearBtn = document.querySelector(".papers-clear");

  var papers = [];
  var theme = "";      // filtre de thème
  var category = "";   // filtre de catégorie (clic sur un mot-clé)

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function safeUrl(url) {
    try {
      var u = new URL(url);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch (e) { return ""; }
  }

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    if (!m) return "";
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }

  // Certaines revues donnent la date du numéro à venir : ces papiers sont
  // placés en fin de liste avec la mention « à paraître ».
  var now = new Date();
  var today = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
  function isUpcoming(p) { return String(p.published || "").slice(0, 10) > today; }

  function showStatus(text) {
    status.textContent = text;
    status.hidden = false;
  }

  function renderFilters() {
    filters.textContent = "";
    var options = [["", "Tous"]].concat(Object.keys(THEMES).map(function (k) { return [k, THEMES[k]]; }));
    options.forEach(function (opt) {
      var n = opt[0] ? papers.filter(function (p) { return (p.themes || []).indexOf(opt[0]) !== -1; }).length : papers.length;
      var btn = el("button", "chip-btn", opt[1] + " · " + n);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(theme === opt[0]));
      btn.addEventListener("click", function () { theme = opt[0]; render(); });
      filters.appendChild(btn);
    });
  }

  function renderPaper(p) {
    var li = el("li", "paper");

    var meta = el("p", "paper-meta");
    var date = formatDate(p.published);
    if (date) meta.appendChild(el("span", null, isUpcoming(p) ? "À paraître (" + date + ")" : date));
    if (p.source) meta.appendChild(el("span", null, p.source));
    li.appendChild(meta);

    var h = el("h2", "paper-title");
    var url = safeUrl(p.url);
    if (url) {
      var a = el("a", null, p.title);
      a.href = url;
      a.rel = "noopener";
      h.appendChild(a);
    } else {
      h.textContent = p.title;
    }
    li.appendChild(h);

    if (p.authors) li.appendChild(el("p", "paper-authors", p.authors));

    var tags = el("ul", "tags paper-tags");
    (p.themes || []).forEach(function (t) {
      if (THEMES[t]) tags.appendChild(el("li", "tag-theme", THEMES[t]));
    });
    (p.categories || []).forEach(function (c) {
      var item = el("li");
      var b = el("button", "tag-btn", c);
      b.type = "button";
      b.title = "Afficher les papiers « " + c + " »";
      b.addEventListener("click", function () { category = c; render(); window.scrollTo({ top: 0 }); });
      item.appendChild(b);
      tags.appendChild(item);
    });
    if (tags.children.length) li.appendChild(tags);

    var actions = el("div", "paper-actions");
    if (p.abstract) {
      var details = el("details", "paper-abstract");
      details.appendChild(el("summary", null, "Lire l'abstract"));
      var text = p.abstract.length > ABSTRACT_MAX ? p.abstract.slice(0, ABSTRACT_MAX).trim() + "…" : p.abstract;
      details.appendChild(el("p", null, text));
      actions.appendChild(details);
    }
    var pdf = safeUrl(p.pdf_url);
    if (pdf) {
      var link = el("a", "paper-pdf", "PDF");
      link.href = pdf;
      link.rel = "noopener";
      actions.appendChild(link);
    }
    if (actions.children.length) li.appendChild(actions);

    return li;
  }

  function render() {
    renderFilters();
    var shown = papers.filter(function (p) {
      if (theme && (p.themes || []).indexOf(theme) === -1) return false;
      if (category && (p.categories || []).indexOf(category) === -1) return false;
      return true;
    });

    active.hidden = !category;
    active.querySelector("span").textContent = category ? "Catégorie : " + category : "";

    count.textContent = shown.length + (shown.length > 1 ? " papiers" : " papier");
    list.textContent = "";
    shown.forEach(function (p) { list.appendChild(renderPaper(p)); });
    if (shown.length) status.hidden = true;
    else showStatus("Aucun papier pour ce filtre cette semaine.");
  }

  clearBtn.addEventListener("click", function () { category = ""; render(); });

  if (!API_BASE) {
    showStatus("La liste de la semaine sera bientôt disponible.");
    return;
  }

  var controller = "AbortController" in window ? new AbortController() : null;
  var timer = controller && setTimeout(function () { controller.abort(); }, 15000);

  fetch(API_BASE + "/api/v1/digest?days=7&limit=200&sort=date&format=json", {
    headers: { Accept: "application/json" },
    signal: controller ? controller.signal : undefined
  })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      papers = (data && Array.isArray(data.items) ? data.items : []).filter(function (p) {
        return p && typeof p.title === "string" && p.title;
      });
      papers = papers.filter(function (p) { return !isUpcoming(p); })
        .concat(papers.filter(isUpcoming).reverse());
      if (!papers.length) {
        showStatus("Aucun nouveau papier ces 7 derniers jours.");
        return;
      }
      toolbar.hidden = false;
      render();
    })
    .catch(function () {
      showStatus("La liste n'a pas pu être chargée. Réessaie dans quelques minutes.");
    })
    .then(function () { if (timer) clearTimeout(timer); });
})();
