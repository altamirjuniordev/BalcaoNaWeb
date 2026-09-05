/* ==========================================================================
   Utilitarios — so o que a landing realmente usa.

   O arquivo original vinha do sistema de cardapio e trazia junto mascara de
   telefone, parse de dinheiro, escape de HTML, delegacao de eventos, trap de
   foco, lock de scroll e observador de imagem: nada disso e chamado nesta
   pagina. Sobraram sete funcoes.
   ========================================================================== */

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', minimumFractionDigits: 2,
});

export const money = (valor) => brl.format(Number(valor) || 0);

export const qs = (sel, raiz) => (raiz || document).querySelector(sel);
export const qsa = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));

export function el(tag, attrs, html) {
  const node = document.createElement(tag);
  if (attrs) for (const k of Object.keys(attrs)) node.setAttribute(k, attrs[k]);
  if (html != null) node.innerHTML = html;
  return node;
}

export function debounce(fn, espera = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), espera);
  };
}

export const prefereMenosMovimento = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Em modo anonimo o acesso ao localStorage lanca excecao — nao basta
   checar se veio null. */
export const storage = {
  get(chave) {
    try { return localStorage.getItem(chave); } catch { return null; }
  },
  set(chave, valor) {
    try { localStorage.setItem(chave, valor); return true; } catch { return false; }
  },
};
