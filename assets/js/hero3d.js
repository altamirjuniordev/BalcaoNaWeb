/* ==========================================================================
   Hero 3D — a composicao do painel ganhando vida.

   Regra que vale para tudo aqui: o HTML ja nasce com o valor final escrito.
   O JS zera para animar. Sem JS (ou com movimento reduzido) a peca continua
   completa e legivel — so nao se mexe.
   ========================================================================== */
(function (BW) {
  'use strict';

  var U = BW.utils;
  var root = document.getElementById('hero3d');
  if (!root) return;

  var stage = U.qs('.hero3d__stage', root);
  var reduced = U.prefersReducedMotion();
  var mqStage = window.matchMedia('(min-width: 900px)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ------------------------------------------------------------- escala --
     O palco e desenhado em 520px fixos e encolhe para caber na coluna. Sem
     container queries dava para escalar por breakpoint, mas a coluna varia
     de forma continua entre 1024 e 1280 — medir e mais honesto que chutar. */
  function fit() {
    if (!mqStage.matches) { root.style.removeProperty('--stg-s'); return; }
    var largura = root.clientWidth;
    if (!largura) return;
    var s = Math.min(1, largura / 520);
    root.style.setProperty('--stg-s', String(Math.round(s * 1000) / 1000));
  }

  /* --------------------------------------------------------- contadores --
     Conta do zero ate o valor final com desaceleracao. Formato vem do HTML
     para o numero animado sair identico ao que ja estava escrito la. */
  function formatar(valor, formato) {
    if (formato === 'brl') return U.money(valor);
    if (formato === 'brl0') return U.money(valor).replace(/,\d{2}$/, '');
    return String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function contar(node) {
    var alvo = parseFloat(node.dataset.count);
    if (isNaN(alvo)) return;
    var formato = node.dataset.format || 'int';
    var prefixo = node.dataset.prefix || '';
    var inicio = 0, duracao = 1500;

    function passo(agora) {
      if (!inicio) inicio = agora;
      var t = Math.min(1, (agora - inicio) / duracao);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = prefixo + formatar(alvo * eased, formato);
      if (t < 1) requestAnimationFrame(passo);
    }

    node.textContent = prefixo + formatar(0, formato);
    requestAnimationFrame(passo);
  }

  /* Usado tambem pelo pedido novo, que soma no KPI sem reanimar do zero. */
  function somarNoKpi(node, delta) {
    var atual = parseFloat(node.dataset.count) || 0;
    var novo = atual + delta;
    node.dataset.count = String(novo);
    node.textContent = (node.dataset.prefix || '') + formatar(novo, node.dataset.format || 'int');
  }

  /* ----------------------------------------------------------- graficos --
     A linha se desenha por stroke-dashoffset; a area e os pontos entram
     depois, por CSS, quando o container ganha .is-drawn. */
  function desenharLinhas() {
    U.qsa('.h3-line', root).forEach(function (path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect();                 // forca o estado inicial
      path.style.transition = 'stroke-dashoffset 1.7s var(--ease-out) ' +
                              (path.dataset.delay || '0ms');
      path.style.strokeDashoffset = '0';
    });
    U.qsa('.h3-chart', root).forEach(function (c) { c.classList.add('is-drawn'); });
  }

  function crescerBarras() {
    U.qsa('.h3-bars i', root).forEach(function (bar, i) {
      bar.style.setProperty('--d', (i * 45) + 'ms');
      bar.style.transform = 'scaleY(0)';
      bar.getBoundingClientRect();
      bar.style.transform = 'scaleY(1)';
    });
  }

  function crescerDonut() {
    U.qsa('.h3-seg', root).forEach(function (seg, i) {
      var c = 2 * Math.PI * Number(seg.getAttribute('r'));
      var pct = Number(seg.dataset.pct) / 100;
      var arco = Math.max(0, c * pct - 3);          /* -3 = respiro entre fatias */
      seg.style.setProperty('--d', (i * 140) + 'ms');
      seg.style.strokeDasharray = '0 ' + c;
      seg.getBoundingClientRect();
      seg.style.strokeDasharray = arco + ' ' + (c - arco);
    });
  }

  /* --------------------------------------------------------- pedidos ao vivo --
     Um pedido chega, empurra a lista, some o mais antigo, avisa no toast e
     soma no caixa do dia. E o loop inteiro do produto em oito segundos. */
  var FILA = [
    { canal: 'Mesa 12',  itens: 4, valor: 58.40 },
    { canal: 'Delivery', itens: 2, valor: 47.80 },
    { canal: 'Mesa 3',   itens: 6, valor: 96.20 },
    { canal: 'Retirada', itens: 1, valor: 32.90 },
    { canal: 'Delivery', itens: 3, valor: 71.50 }
  ];

  var lista = U.qs('.h3-orders', root);
  var toast = U.qs('.h3-toast', root);
  var toastTitulo = U.qs('.h3-toast__title', root);
  var kpiPedidos = U.qs('[data-kpi="pedidos"]', root);
  var kpiCaixa = U.qs('[data-kpi="caixa"]', root);
  var numero = 129, fila = 0, timerPedido = 0, timerToast = 0;

  /* A fila anda junto: cada pedido novo empurra os outros um passo adiante.
     Em quatro chegadas a lista se recompoe sozinha nos quatro estados. */
  var PASSOS = {
    recebido:   { classe: 'preparando', texto: 'Preparando' },
    preparando: { classe: 'enviado',    texto: 'Enviado' },
    enviado:    { classe: 'concluido',  texto: 'Concluído' }
  };

  function pill(estado, texto) {
    return '<span class="h3-pill h3-pill--' + estado + '">' + texto + '</span>';
  }

  function envelhecer() {
    U.qsa('.h3-order .h3-pill', lista).forEach(function (marca) {
      var atual = (marca.className.match(/h3-pill--(\w+)/) || [])[1];
      var proximo = PASSOS[atual];
      if (!proximo) return;                    /* concluido e o fim da linha */
      marca.className = 'h3-pill h3-pill--' + proximo.classe;
      marca.textContent = proximo.texto;
    });
  }

  /* Se o status anda, o relogio tem que andar junto — senao a lista fica com
     quatro pedidos "ha 12 segundos" em estados diferentes. */
  var TEMPOS = ['agora', 'há 1 min', 'há 4 min', 'há 9 min'];

  function marcarTempos() {
    U.qsa('.h3-order__meta', lista).forEach(function (meta, i) {
      var itens = meta.textContent.split('·')[0].trim();
      meta.textContent = itens + ' · ' + (TEMPOS[i] || 'há 12 min');
    });
  }

  function novoPedido() {
    if (!lista) return;
    var dado = FILA[fila++ % FILA.length];
    envelhecer();

    var linha = U.el('div', { class: 'h3-order is-new' },
      pill('recebido', 'Recebido') +
      '<span class="h3-order__body">' +
        '<span class="h3-order__id">#' + numero + ' &middot; ' + dado.canal + '</span>' +
        '<span class="h3-order__meta">' + dado.itens + ' itens &middot; agora</span>' +
      '</span>' +
      '<span class="h3-order__val">' + U.money(dado.valor) + '</span>'
    );

    lista.insertBefore(linha, lista.firstChild);
    while (lista.children.length > 4) lista.removeChild(lista.lastElementChild);
    marcarTempos();

    if (kpiPedidos) somarNoKpi(kpiPedidos, 1);
    if (kpiCaixa) somarNoKpi(kpiCaixa, dado.valor);

    mostrarToast('Pedido #' + numero + ' no painel');
    numero++;
  }

  function mostrarToast(titulo) {
    if (!toast) return;
    if (toastTitulo) toastTitulo.textContent = titulo;
    toast.classList.add('is-on');
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { toast.classList.remove('is-on'); }, 3600);
  }

  function agendar() {
    clearTimeout(timerPedido);
    timerPedido = setTimeout(function () {
      novoPedido();
      agendar();
    }, 4500 + Math.random() * 1700);
  }

  function pararFila() { clearTimeout(timerPedido); timerPedido = 0; }

  /* ---------------------------------------------------------- parallax --
     Uma rotacao no palco inteiro; a profundidade de cada cartao ja esta no
     translateZ, entao a perspectiva faz o deslocamento por camada sozinha. */
  function setupParallax() {
    if (reduced || !mqFine.matches) return;

    var palco = root.closest('.hero') || root;
    var alvoX = 0, alvoY = 0, atualX = 0, atualY = 0, raf = 0;

    function loop() {
      atualX += (alvoX - atualX) * .08;
      atualY += (alvoY - atualY) * .08;
      stage.style.setProperty('--rx', atualX.toFixed(2) + 'deg');
      stage.style.setProperty('--ry', atualY.toFixed(2) + 'deg');

      if (Math.abs(alvoX - atualX) > .01 || Math.abs(alvoY - atualY) > .01) {
        raf = requestAnimationFrame(loop);
      } else { raf = 0; }
    }

    function acordar() { if (!raf) raf = requestAnimationFrame(loop); }

    palco.addEventListener('mousemove', function (ev) {
      if (!mqStage.matches) return;
      var r = palco.getBoundingClientRect();
      var nx = (ev.clientX - r.left) / r.width - .5;
      var ny = (ev.clientY - r.top) / r.height - .5;
      alvoY = nx * 12;          /* mouse para a direita -> gira em torno de Y */
      alvoX = -ny * 8;
      acordar();
    }, { passive: true });

    palco.addEventListener('mouseleave', function () { alvoX = 0; alvoY = 0; acordar(); });
  }

  /* ----------------------------------------------------------- entrada --
     Estado inicial so no JS: se algo falhar, os cartoes ficam visiveis em vez
     de sumidos. Mesma logica da revelacao das secoes em landing.js. */
  var camadas = U.qsa('.h3-enter', root);
  var entrou = false;

  function prepararEntrada() {
    camadas.forEach(function (node, i) {
      node.style.setProperty('--d', (i * 110) + 'ms');
      node.style.opacity = '0';
      node.style.transform = 'translateY(26px) rotateX(9deg) scale(.96)';
    });
  }

  function entrar() {
    if (entrou) return;
    entrou = true;

    camadas.forEach(function (node) {
      node.style.opacity = '1';
      node.style.transform = 'none';
    });

    U.qsa('[data-count]', root).forEach(contar);
    desenharLinhas();
    crescerBarras();
    crescerDonut();

    /* O #128 ja esta no topo da lista: o toast so confirma o que acabou de
       acontecer. Serve para a promessa aparecer na primeira olhada — e para
       o canto de cima nao ficar vazio ate o proximo pedido chegar. */
    setTimeout(function () { mostrarToast('Pedido #128 no painel'); }, 1500);

    setTimeout(function () {
      if (document.hidden) return;
      novoPedido();
      agendar();
    }, 5200);
  }

  function init() {
    fit();
    window.addEventListener('resize', U.debounce(fit, 150));
    if (window.ResizeObserver) new ResizeObserver(fit).observe(root);

    setupParallax();

    if (reduced || !('IntersectionObserver' in window)) {
      /* sem animacao: os valores finais ja estao no HTML, nada a fazer */
      return;
    }

    prepararEntrada();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entrar(); return; }
        pararFila();                     /* fora da tela nao gasta bateria */
      });
    }, { threshold: .18 });
    observer.observe(root);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pararFila();
      else if (entrou) agendar();
    });

    /* Rede de segurança: cartao invisivel no hero e pior que cartao parado. */
    window.addEventListener('load', function () {
      setTimeout(function () { if (!entrou) entrar(); }, 1400);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window.BW = window.BW || {});
