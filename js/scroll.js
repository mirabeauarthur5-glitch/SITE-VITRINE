/* CALVIN HOME — gestion centralisée de la position de défilement (chargé dans <head>, avant les animations)
   - Actualisation (F5 / bouton Actualiser) : on désactive la restauration automatique du navigateur et on revient en haut
     (y compris si l'URL contient une ancre #showroom, #contact…). Le retour en haut est répété brièvement car GSAP /
     ScrollTrigger recalculent les positions au chargement ; il s'arrête dès que la personne défile.
   - Navigation normale (lien, saisie d'URL) : comportement inchangé (arrivée en haut, ou sur l'ancre demandée).
   - Retour / avance du navigateur : restauration native conservée. */
(function () {
  'use strict';
  var type = 'navigate';
  try {
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type) type = nav.type;
    else if (performance.navigation && performance.navigation.type === 1) type = 'reload';
  } catch (e) {}
  var reload = type === 'reload';
  window.CH_RELOAD = reload;
  try { if ('scrollRestoration' in history) history.scrollRestoration = reload ? 'manual' : 'auto'; } catch (e) {}
  if (!reload) return;

  var touched = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function () { touched = true; }, { passive: true, once: true });
  });
  function top() { if (!touched) window.scrollTo(0, 0); }
  top();
  document.addEventListener('DOMContentLoaded', top);
  window.addEventListener('pageshow', top);
  window.addEventListener('load', function () { top(); setTimeout(top, 150); setTimeout(top, 500); setTimeout(top, 1200); });
})();
