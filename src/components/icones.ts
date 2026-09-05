/* ==========================================================================
   Tracos dos icones — SVG inline, renderizado no build.

   Antes vinham de icones.js: 35 icones (4,8 KB) baixados para usar 10, e
   injetados por JS depois do carregamento, o que causava layout shift e
   deixava a pagina sem icone nenhum ate o script rodar. Agora saem prontos
   no HTML, sem JS e sem request.

   Todos herdam a cor do contexto via currentColor.
   ========================================================================== */

export const icones = {
  store: '<path d="M4 9h16v11H4z"/><path d="M3 9l1.6-5h14.8L21 9"/><path d="M9 20v-6h6v6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  money: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.1M18 12h.1"/>',
  phone: '<path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4c0 1.1-.9 2-2 2A16 16 0 0 1 3 5c0-1.1.9-2 2-2Z"/>',
  receipt: '<path d="M5 3h14v18l-2.5-1.6L14 21l-2-1.6L10 21l-2.5-1.6L5 21Z"/><path d="M9 8h6M9 12h6"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8-9-9Z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
};

export type Nome = keyof typeof icones;
