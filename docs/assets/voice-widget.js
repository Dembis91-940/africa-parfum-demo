/* Africa Parfum — conseillère vocale Vapi (web SDK)
 * Bouton 🎙️ flottant + pilotage de l'écran (outils côté client).
 * Config : window.VOICE_CONFIG = { publicKey, assistantId, accent }
 */
(function () {
  if (window.__africaVoiceLoaded) return;
  window.__africaVoiceLoaded = true;

  var cfg = window.VOICE_CONFIG || {};
  if (!cfg.assistantId || !cfg.publicKey) return;

  var ACCENT = cfg.accent || '#dbb67b';

  /* Catalogue — ids → noms affichés (doit rester synchronisé avec le site). */
  var CATALOG = {
    'dior-sauvage': 'Sauvage',
    'chanel-n5': 'N°5',
    'ysl-libre': 'Libre',
    'tom-ford-oud-wood': 'Oud Wood',
    'guerlain-shalimar': 'Shalimar',
    'mfk-baccarat-rouge-540': 'Baccarat Rouge 540'
  };

  /* ---------- Bouton ---------- */
  var btn = document.createElement('div');
  btn.id = 'vb-btn';
  btn.innerHTML = '<span>🎙️</span>';
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', 'Parler à la conseillère vocale');
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:58px;height:58px;border-radius:50%;background:' + ACCENT + ';color:#17201a;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);z-index:99998;transition:transform .15s;border:1px solid rgba(0,0,0,.15);';
  btn.title = 'Parler à la conseillère vocale';
  btn.onmouseenter = function () { btn.style.transform = 'scale(1.08)'; };
  btn.onmouseleave = function () { btn.style.transform = 'scale(1)'; };
  document.body.appendChild(btn);

  /* ---------- Statut ---------- */
  var status = document.createElement('div');
  status.id = 'vb-status';
  status.style.cssText = 'position:fixed;bottom:90px;right:20px;background:#18251e;color:#f0eee5;padding:12px 16px;border-radius:10px;font-size:13px;display:none;z-index:99998;box-shadow:0 4px 16px rgba(0,0,0,.4);max-width:250px;text-align:center;border:1px solid ' + ACCENT + ';';
  document.body.appendChild(status);

  var vapi = null;
  var busy = false;

  function setStatus(text) {
    if (!text) { status.style.display = 'none'; status.textContent = ''; return; }
    status.textContent = text;
    status.style.display = 'block';
  }

  function loadSDK(cb) {
    if (window.VapiSDK && window.VapiSDK.default) { cb(); return; }
    var el = document.createElement('script');
    el.src = 'assets/vapi-bundle.js';
    el.onload = function () {
      var tries = 0;
      var check = function () {
        if (window.VapiSDK && window.VapiSDK.default) { cb(); }
        else if (tries < 10) { tries++; setTimeout(check, 200); }
        else { setStatus('Erreur de chargement vocal.'); }
      };
      check();
    };
    el.onerror = function () { setStatus('Erreur de chargement vocal.'); };
    document.head.appendChild(el);
  }

  function setActive(active) {
    btn.style.background = active ? '#b3423a' : ACCENT;
    btn.style.animation = active ? 'vb-pulse 1.2s infinite' : 'none';
  }
  var style = document.createElement('style');
  style.textContent = '@keyframes vb-pulse { 0%{box-shadow:0 0 0 0 rgba(219,182,123,.5);} 70%{box-shadow:0 0 0 16px rgba(219,182,123,0);} 100%{box-shadow:0 0 0 0 rgba(219,182,123,0);} }';
  document.head.appendChild(style);

  function stopCall() {
    try { if (vapi) vapi.stop(); } catch (e) {}
    setActive(false);
    busy = false;
    setStatus('');
  }

  /* ---------- Pilotage de l'écran (outils côté client) ---------- */
  function showPerfume(productId) {
    var name = CATALOG[productId];
    if (!name) return;
    var cards = document.querySelectorAll('.ae-card');
    for (var i = 0; i < cards.length; i++) {
      var label = cards[i].querySelector('.ae-card-name');
      if (label && label.textContent.trim() === name) {
        var main = cards[i].querySelector('.ae-card-main');
        if (main) { main.click(); return; }
      }
    }
  }

  function scrollToSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function handleToolCalls(m) {
    var list = m.toolCallList || [];
    list.forEach(function (tc) {
      var name = tc.name || (tc.function && tc.function.name);
      var rawArgs = tc.arguments || (tc.function && tc.function.arguments);
      var args = {};
      try { args = typeof rawArgs === 'string' ? JSON.parse(rawArgs || '{}') : (rawArgs || {}); } catch (e) { args = {}; }
      try {
        if (name === 'show_perfume' && args.productId) showPerfume(args.productId);
        else if (name === 'defiler_vers' && args.sectionId) scrollToSection(args.sectionId);
      } catch (e) {}
      /* Répondre à l'appel pour que l'agent continue (sans effet si non supporté). */
      try {
        if (tc.id) vapi.send({ type: 'add-message', message: { role: 'tool', toolCallId: tc.id, name: name, content: 'ok' } });
      } catch (e) {}
    });
  }

  btn.onclick = function () {
    if (busy) { stopCall(); return; }
    busy = true;
    setStatus('Connexion…');
    loadSDK(function () {
      try {
        vapi = new window.VapiSDK.default(cfg.publicKey);
        vapi.on('call-start', function () { setActive(true); setStatus('Je vous écoute…'); });
        vapi.on('call-end', function () { setActive(false); busy = false; setStatus(''); });
        vapi.on('speech-update', function (m) {
          if (m && m.status === 'speaking') setStatus('');
          else if (m && m.status === 'listening') setStatus('Je vous écoute…');
        });
        vapi.on('message', function (m) {
          if (m && m.type === 'tool-calls') handleToolCalls(m);
        });
        vapi.start(cfg.assistantId);
      } catch (e) {
        busy = false;
        setStatus('Impossible de démarrer la conversation. Vérifiez l’autorisation du micro.');
      }
    });
  };
})();
