/* ==========================================================================
   Utilitarios compartilhados — formatacao, DOM, storage, foco e teclado.
   ========================================================================== */
(function (BW) {
  'use strict';

  var brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 2
  });

  var U = {
    /* ------------------------------------------------------- formatacao -- */
    money: function (value) { return brl.format(Number(value) || 0); },

    /** "+ R$ 5,00" / "- R$ 14,00" / "" para zero — usado nas opcoes. */
    moneyDelta: function (value) {
      var v = Number(value) || 0;
      if (v === 0) return '';
      return (v > 0 ? '+ ' : '- ') + brl.format(Math.abs(v));
    },

    /** Converte "1234" digitado em telefone BR mascarado. */
    maskPhone: function (raw) {
      var d = String(raw || '').replace(/\D/g, '').slice(0, 11);
      if (d.length <= 2) return d;
      if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    },

    onlyDigits: function (s) { return String(s || '').replace(/\D/g, ''); },

    /** Converte "12,50" ou "R$ 12,50" em 12.5 */
    parseMoney: function (s) {
      var clean = String(s || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
      var n = parseFloat(clean);
      return isNaN(n) ? 0 : n;
    },

    /** Normaliza para busca: minusculo e sem acento. */
    normalize: function (s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    escapeHtml: function (s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    uid: function (prefix) {
      return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9);
    },

    /* -------------------------------------------------------------- DOM -- */
    qs: function (sel, root) { return (root || document).querySelector(sel); },
    qsa: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },

    el: function (tag, attrs, html) {
      var node = document.createElement(tag);
      if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
      if (html != null) node.innerHTML = html;
      return node;
    },

    /** Delegacao de eventos: um listener por container, nao por card. */
    delegate: function (root, eventName, selector, handler) {
      root.addEventListener(eventName, function (ev) {
        var target = ev.target.closest(selector);
        if (target && root.contains(target)) handler(ev, target);
      });
    },

    debounce: function (fn, wait) {
      var t;
      return function () {
        var args = arguments, ctx = this;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, wait || 200);
      };
    },

    /* ---------------------------------------------------------- storage -- */
    /* Sempre em try/catch: modo anonimo e cookies bloqueados fazem o
       acesso ao localStorage lancar excecao, nao so devolver null. */
    storage: {
      get: function (key, fallback) {
        try {
          var raw = window.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
      },
      set: function (key, value) {
        try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { return false; }
      },
      remove: function (key) {
        try { window.localStorage.removeItem(key); } catch (e) { /* noop */ }
      }
    },

    /* ------------------------------------------------- foco e acessibilidade -- */
    FOCUSABLE: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',

    /** Prende o Tab dentro do painel aberto e devolve o foco ao fechar. */
    trapFocus: function (container) {
      var previous = document.activeElement;

      function onKeydown(ev) {
        if (ev.key !== 'Tab') return;
        var items = U.qsa(U.FOCUSABLE, container).filter(function (n) {
          return n.offsetParent !== null || n === document.activeElement;
        });
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }

      container.addEventListener('keydown', onKeydown);

      return function release() {
        container.removeEventListener('keydown', onKeydown);
        if (previous && typeof previous.focus === 'function') previous.focus();
      };
    },

    /** Trava o scroll do body sem "pular" por causa da barra de rolagem. */
    lockScroll: (function () {
      var count = 0, savedY = 0;
      return function (on) {
        if (on) {
          if (count === 0) {
            savedY = window.scrollY;
            var sbw = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = sbw > 0 ? sbw + 'px' : '';
            document.body.classList.add('is-locked');
          }
          count++;
        } else {
          count = Math.max(0, count - 1);
          if (count === 0) {
            document.body.classList.remove('is-locked');
            document.body.style.paddingRight = '';
            window.scrollTo({ top: savedY, behavior: 'instant' in window ? 'instant' : 'auto' });
          }
        }
      };
    })(),

    prefersReducedMotion: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    isDesktop: function () { return window.matchMedia('(min-width: 768px)').matches; },

    /** Marca a imagem como carregada (remove o skeleton) sem causar layout shift. */
    watchImage: function (img) {
      if (!img) return;
      var done = function () {
        img.classList.add('is-loaded');
        var holder = img.parentElement;
        if (holder) holder.classList.remove('skeleton');
      };
      if (img.complete && img.naturalWidth > 0) done();
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    }
  };

  BW.utils = U;
})(window.BW = window.BW || {});
