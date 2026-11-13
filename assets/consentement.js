// Mesure d'audience (Google Analytics, balise GTM-WP4H3XDX), seulement avec l'accord du visiteur.
// Rien n'est chargé ni déposé avant « Accepter ». Le choix est gardé 6 mois dans ce navigateur
// (recommandation CNIL), puis redemandé. Un bouton « Gérer les cookies » rouvre le bandeau.
(() => {
  const BALISE = "GTM-WP4H3XDX";
  const CLE = "cape-consentement";
  const DUREE = 1000 * 60 * 60 * 24 * 182; // 6 mois

  function lire() {
    try {
      const choix = JSON.parse(localStorage.getItem(CLE) || "null");
      if (choix && Date.now() - choix.date < DUREE) return choix.valeur;
    } catch (e) { /* stockage indisponible : on redemande */ }
    return null;
  }

  function ecrire(valeur) {
    try { localStorage.setItem(CLE, JSON.stringify({ valeur, date: Date.now() })); } catch (e) { /* rien */ }
  }

  function chargerMesure() {
    if (window.__capeMesure) return;
    window.__capeMesure = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + BALISE;
    document.head.appendChild(script);
  }

  function effacerCookiesMesure() {
    // Cookies de Google Analytics (_ga, _ga_XXXX) sur le domaine du site
    const domaines = ["", location.hostname, "." + location.hostname.replace(/^www\./, "")];
    document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => /^_ga/.test(n)).forEach((nom) => {
      domaines.forEach((d) => {
        document.cookie = nom + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  // Bandeau flottant en bas d'écran s'il ne recouvre aucun contenu visible ; sinon, bande en haut de
  // page qui pousse le contenu. Testé à l'affichage et quand la fenêtre change de taille.
  const CONTENU = "h1, h2, h3, p, li, figure, .actions, .btn, .steps-nav, .callout";
  function placer(b) {
    if (b.hidden) return;
    b.classList.remove("flottant");
    if (innerWidth < 900) return;
    b.classList.add("flottant");
    const r = b.getBoundingClientRect();
    const recouvre = [...document.querySelectorAll(CONTENU)].some((e) => {
      if (b.contains(e) || e.closest("footer")) return false;
      const q = e.getBoundingClientRect();
      return q.height > 0 && q.top < r.bottom + 8 && q.bottom > r.top - 8;
    });
    if (recouvre) b.classList.remove("flottant");
  }

  // Rouvert depuis « Gérer les cookies » : sur petit écran le bandeau est en haut de page, on y remonte
  function montrer(b) {
    if (getComputedStyle(b).position !== "fixed") window.scrollTo({ top: 0 });
    b.querySelector("button").focus({ preventScroll: true });
  }

  function bandeau(rouvert = true) {
    let b = document.getElementById("consentement");
    if (b) { b.hidden = false; placer(b); montrer(b); return; }
    b = document.createElement("div");
    b.id = "consentement";
    b.className = "consentement";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-live", "polite");
    b.setAttribute("aria-label", "Mesure d'audience");
    b.innerHTML =
      '<p><strong>Mesure d\'audience.</strong> Avec votre accord, ce site compte ses visites avec Google ' +
      'Analytics. L\'application, elle, ne transmet rien. <a href="mentions-legales.html#cookies">En savoir plus</a></p>' +
      '<div class="consentement-choix">' +
      '<button type="button" data-choix="refus">Refuser</button>' +
      '<button type="button" data-choix="accord">Accepter</button>' +
      "</div>";
    b.addEventListener("click", (e) => {
      const bouton = e.target.closest("[data-choix]");
      if (!bouton) return;
      const accord = bouton.dataset.choix === "accord";
      const avant = lire();
      ecrire(accord ? "accord" : "refus");
      b.hidden = true;
      if (accord) chargerMesure();
      else if (avant === "accord" || window.__capeMesure) { effacerCookiesMesure(); location.reload(); }
    });
    document.body.prepend(b); // en tête : sur petit écran, il pousse le contenu au lieu de le recouvrir
    placer(b);
    addEventListener("resize", () => placer(b));
    if (rouvert) montrer(b);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-gerer-cookies]")) { e.preventDefault(); bandeau(); }
  });

  const choix = lire();
  if (choix === "accord") chargerMesure();
  else if (choix === null) {
    if (document.body) bandeau(false);
    else document.addEventListener("DOMContentLoaded", () => bandeau(false));
  }
})();
