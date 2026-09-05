/* ==========================================================================
   Landing — icones, tema, sombra da nav e revelacao das secoes ao rolar.
   Tudo progressivo: sem JS a pagina continua legivel e navegavel.
   ========================================================================== */
(function (BW) {
  'use strict';

  var U = BW.utils;

  function fillIcons() {
    // Ícones declarados por data-icon no HTML
    U.qsa('[data-icon]').forEach(function (node) {
      var name = node.dataset.icon;
      if (BW.icons[name]) node.insertAdjacentHTML('beforeend', BW.icons[name]);
    });

    // Marca do logo
    var mark = document.getElementById('logo-mark');
    if (mark) mark.innerHTML = BW.icons.store;

    var note = document.getElementById('hero-note');
    if (note) note.insertAdjacentHTML('afterbegin', BW.icons.checkCircle);

    var comanda = document.getElementById('comanda-note');
    if (comanda) comanda.insertAdjacentHTML('afterbegin', BW.icons.checkCircle);
  }

  /* O sistema (cardápio + painel) mora fora desta página. Aqui só apontamos
     os botões para ele — um lugar só para configurar, em vez de 14 hrefs. */
  function aplicarLinks() {
    var cfg = window.BW_LANDING || {};

    function externo(node, url, extra) {
      node.href = url + (extra || '');
      node.target = '_blank';
      node.rel = 'noopener';
    }

    U.qsa('[data-link="demo"]').forEach(function (node) {
      if (cfg.urlDemo) { externo(node, cfg.urlDemo); return; }
      // Sem demo publicada: esconde o botão em vez de fingir que leva a algum
      // lugar. Links de texto (rodapé) continuam servindo como âncora interna.
      if (node.classList.contains('btn')) node.hidden = true;
    });

    /* O onboarding é feito por nós, então todo CTA leva a uma conversa —
       não a um autocadastro. Com o número preenchido, os botões viram um
       link de WhatsApp com a mensagem já escrita. */
    var numero = U.onlyDigits(cfg.whatsappContato);
    if (!numero) return;   // sem número: seguem como âncora interna

    var texto = encodeURIComponent(cfg.mensagemContato || '');
    U.qsa('[data-link="contato"]').forEach(function (node) {
      externo(node, 'https://wa.me/' + numero, texto ? '?text=' + texto : '');
    });
  }

  function setupTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var saved = U.storage.get('bw:tema', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    function paint() {
      var explicit = document.documentElement.getAttribute('data-theme');
      var isDark = explicit
        ? explicit === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      btn.innerHTML = isDark ? BW.icons.sun : BW.icons.moon;
      btn.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    }

    btn.addEventListener('click', function () {
      var explicit = document.documentElement.getAttribute('data-theme');
      var current = explicit || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      U.storage.set('bw:tema', next);
      paint();
    });

    paint();
  }

  function setupNav() {
    var nav = document.getElementById('lp-nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Entrada suave das seções — respeita prefers-reduced-motion. */
  function setupReveal() {
    if (U.prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    var targets = U.qsa('.benefit, .stepcard, .demo, .soon, .cta-final');
    targets.forEach(function (node, i) {
      node.style.opacity = '0';
      node.style.transform = 'translateY(14px)';
      node.style.transition = 'opacity .5s var(--ease-out) ' + (i % 4 * 60) + 'ms, ' +
                              'transform .5s var(--ease-out) ' + (i % 4 * 60) + 'ms';
    });

    function revelar(node) {
      node.style.opacity = '1';
      node.style.transform = 'none';
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revelar(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

    targets.forEach(function (node) { observer.observe(node); });

    /* Rede de segurança: numa página cujo trabalho é converter, preço invisível
       é pior que preço sem animação. Se o observer não disparar por qualquer
       motivo, tudo aparece assim que a página termina de carregar. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        targets.forEach(function (node) {
          if (node.style.opacity === '0') revelar(node);
        });
      }, 1200);
    });
  }

  function init() {
    fillIcons();
    aplicarLinks();
    setupTheme();
    setupNav();
    setupReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window.BW = window.BW || {});
