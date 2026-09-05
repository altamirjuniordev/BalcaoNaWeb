/* ==========================================================================
   Landing — tema, sombra da nav e revelacao das secoes ao rolar.

   Some daqui, em relacao a versao antiga:
   - injecao de icones  -> agora sao SVG inline, renderizados no build
   - reescrita de links -> agora resolvidos no build, em src/data/site.ts
   - leitura do tema    -> agora no <head>, para nao piscar branco
   - troca do innerHTML do botao de tema -> agora e so CSS
   ========================================================================== */
import { qsa, storage, prefereMenosMovimento } from './utils.js';

/* ------------------------------------------------------------------ tema -- */
function ligarTema() {
  const botao = document.getElementById('theme-toggle');
  if (!botao) return;

  botao.addEventListener('click', () => {
    const raiz = document.documentElement;
    const explicito = raiz.getAttribute('data-theme');
    const atual = explicito
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const proximo = atual === 'dark' ? 'light' : 'dark';

    raiz.setAttribute('data-theme', proximo);
    storage.set('bw:tema', proximo);
  });
}

/* ------------------------------------------------------------------- nav -- */
function ligarNav() {
  const nav = document.getElementById('lp-nav');
  if (!nav) return;

  const aoRolar = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
}

/* -------------------------------------------------------------- revelacao --
   O estado inicial (invisivel) agora mora no CSS, sob `.js`, em vez de o JS
   escrever style inline em cada elemento — evita um reflow forcado por card
   e deixa o CSS decidir sozinho o que fazer com movimento reduzido. */
function ligarRevelacao() {
  const alvos = qsa('.benefit, .stepcard, .demo, .soon, .cta-final');
  if (!alvos.length) return;

  const mostrarTudo = () => alvos.forEach((n) => n.classList.add('is-revelado'));

  if (prefereMenosMovimento() || !('IntersectionObserver' in window)) {
    mostrarTudo();
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('is-revelado');
      observador.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  alvos.forEach((n) => observador.observe(n));

  /* Rede de seguranca: numa pagina cujo trabalho e converter, preco
     invisivel e pior que preco sem animacao. */
  window.addEventListener('load', () => setTimeout(mostrarTudo, 1200));
}

ligarTema();
ligarNav();
ligarRevelacao();
