/* ==========================================================================
   Icones — SVG inline (sem biblioteca externa, sem request extra).
   currentColor em tudo para herdar a cor do contexto.
   ========================================================================== */
(function (BW) {
  'use strict';

  function svg(paths, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' +
           (extra || '') + '>' + paths + '</svg>';
  }

  BW.icons = {
    search:   svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    cart:     svg('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>'),
    close:    svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    plus:     svg('<path d="M12 5v14M5 12h14"/>'),
    minus:    svg('<path d="M5 12h14"/>'),
    trash:    svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>'),
    pin:      svg('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>'),
    clock:    svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>'),
    receipt:  svg('<path d="M5 3h14v18l-2.5-1.6L14 21l-2-1.6L10 21l-2.5-1.6L5 21Z"/><path d="M9 8h6M9 12h6"/>'),
    bike:     svg('<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l1.6 4.5M5.5 17.5 10 8h5l3.5 9.5"/><circle cx="15" cy="5" r="1.4"/>'),
    check:    svg('<path d="m4 12.5 5 5L20 6.5"/>'),
    checkCircle: svg('<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>'),
    chevronRight: svg('<path d="m9 5 7 7-7 7"/>'),
    chevronLeft:  svg('<path d="m15 5-7 7 7 7"/>'),
    chevronDown:  svg('<path d="m6 9 6 6 6-6"/>'),
    alert:    svg('<path d="M12 3.5 1.8 20.5h20.4L12 3.5Z"/><path d="M12 10v4.2M12 17.4v.1"/>'),
    info:     svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>'),
    tag:      svg('<path d="M3 12V4h8l9 9-8 8-9-9Z"/><circle cx="7.5" cy="7.5" r="1.4"/>'),
    edit:     svg('<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14.5 5.5 4 4"/>'),
    user:     svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    phone:    svg('<path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4c0 1.1-.9 2-2 2A16 16 0 0 1 3 5c0-1.1.9-2 2-2Z"/>'),
    money:    svg('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.1M18 12h.1"/>'),
    card:     svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h3"/>'),
    pix:      svg('<path d="M12 3.2 20.8 12 12 20.8 3.2 12 12 3.2Z"/><path d="M8.4 8.4 12 12l3.6-3.6M8.4 15.6 12 12l3.6 3.6"/>'),
    store:    svg('<path d="M4 9h16v11H4z"/><path d="M3 9l1.6-5h14.8L21 9"/><path d="M9 20v-6h6v6"/>'),
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/><path d="M12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.83 9.83 0 0 0 4.7 1.2h.01c5.44 0 9.87-4.43 9.87-9.87S17.48 2 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.16 8.16 0 0 1-1.25-4.36c0-4.52 3.68-8.2 8.2-8.2a8.2 8.2 0 0 1 8.2 8.2c0 4.52-3.68 8.2-8.2 8.2Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14 8.5V7c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.5 3 10.5 4.5 10.5 6.8v1.7H8.5V12h2v9h3.5v-9h2.4l.4-3.5H14Z"/></svg>',
    sun:      svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon:     svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>'),
    sad:      svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 15.5c1-1.2 5-1.2 7 0"/><path d="M9 9.5v.1M15 9.5v.1"/>')
  };
})(window.BW = window.BW || {});
