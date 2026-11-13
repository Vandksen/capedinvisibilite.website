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

  function bandeau() {
    let b = document.getElementById("consentement");
    if (b) { b.hidden = false; b.querySelector("button").focus(); return; }
    b = document.createElement("div");
    b.id = "consentement";
    b.className = "consentement";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-live", "polite");
    b.setAttribute("aria-label", "Mesure d'audience");
    b.innerHTML =
      '<p><strong>Mesure d\'audience.</strong> Avec votre accord, ce site utilise Google Analytics pour compter ' +
      'ses visites et ses téléchargements. Cela ne concerne que le site : l\'application, elle, ne transmet rien. ' +
      '<a href="mentions-legales.html#cookies">En savoir plus</a></p>' +
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
    document.body.appendChild(b);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-gerer-cookies]")) { e.preventDefault(); bandeau(); }
  });

  const choix = lire();
  if (choix === "accord") chargerMesure();
  else if (choix === null) {
    if (document.body) bandeau();
    else document.addEventListener("DOMContentLoaded", bandeau);
  }
})();
