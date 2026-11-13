/* ==========================================================================
   Interacoes da landing: simulador de pedido, graficos, calculadora, abas
   e entrada ao rolar.

   Os links de WhatsApp, que o prototipo preenchia aqui, agora saem prontos
   do build (BotaoWhats.astro, a partir de src/data/site.ts), para
   funcionarem mesmo sem JavaScript.
   ========================================================================== */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const brl = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const brl0 = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});

  /* cabeçalho, barra fixa no celular e indicação de seção atual */
  const top = $("#top"), dock = $("#dock");
  const onScroll = () => {
    top.classList.toggle("scrolled", scrollY > 8);
    const end = innerHeight + scrollY > document.body.scrollHeight - 480;
    dock.classList.toggle("show", scrollY > 720 && !end);
  };
  addEventListener("scroll", onScroll, {passive:true}); onScroll();
  const spyLinks = $$("[data-spy]");
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    spyLinks.forEach(a => a.setAttribute("aria-current", a.dataset.spy === e.target.id));
  }), {rootMargin:"-45% 0px -50% 0px"});
  ["demo","por-que","painel","como-comecar","preco","duvidas"].forEach(id => spy.observe(document.getElementById(id)));

  /* ---------- simulador guiado ---------- */
  const menu = [
    {id:"smash",name:"Smash Duplo",price:36.9,e:"🍔"},
    {id:"batata",name:"Batata Rústica",price:12.9,e:"🍟"},
    {id:"refri",name:"Refrigerante lata",price:6.5,e:"🥤"},
    {id:"brig",name:"Brigadeiro",price:7.9,e:"🍫"},
  ];
  const cart = {}; let mode = "Delivery", orderNo = 129, count = 34, cash = 1842.6;
  const items = $("#items"), send = $("#send"), guide = $("#guide"), guideText = $("#guideText");
  const cols = [$("#c1"), $("#c2"), $("#c3")];
  const setStep = (i, text, ok) => {
    cols.forEach((c,k) => { c.classList.toggle("active", k === i); c.classList.toggle("done", k < i); });
    guideText.textContent = text; guide.classList.toggle("ok", !!ok);
  };

  items.innerHTML = menu.map((m,i) => `
    <div class="item">
      <div class="thumb" aria-hidden="true">${m.e}</div>
      <div class="item-t"><b>${m.name}</b><span>${brl(m.price)}</span></div>
      <div class="qty">
        <button class="qbtn" type="button" data-id="${m.id}" data-d="-1" aria-label="Remover ${m.name}" hidden>−</button>
        <output id="q-${m.id}" hidden>0</output>
        <button class="qbtn add press${i===0?" pulse":""}" type="button" data-id="${m.id}" data-d="1" aria-label="Adicionar ${m.name}">+</button>
      </div>
    </div>`).join("");

  const total = () => menu.reduce((s,m) => s + (cart[m.id]||0)*m.price, 0);
  const renderCart = () => {
    menu.forEach(m => { const q = cart[m.id]||0, o = $("#q-"+m.id); o.textContent = q; o.hidden = !q; o.previousElementSibling.hidden = !q; });
    const t = total(), tot = $("#total"); tot.textContent = brl(t); send.disabled = !t;
    tot.classList.remove("bump"); void tot.offsetWidth; tot.classList.add("bump");
  };
  items.addEventListener("click", e => {
    const b = e.target.closest(".qbtn"); if (!b) return;
    $$(".qbtn.pulse").forEach(p => p.classList.remove("pulse"));
    cart[b.dataset.id] = Math.max(0, (cart[b.dataset.id]||0) + +b.dataset.d);
    if (+b.dataset.d > 0) { const it = b.closest(".item"); it.classList.remove("added"); void it.offsetWidth; it.classList.add("added"); }
    renderCart();
    if (total()) { send.classList.add("pulse"); setStep(0, "Boa. Agora toque em “Enviar pedido”."); }
    else { send.classList.remove("pulse"); setStep(0, "Toque em + para montar um pedido, como seu cliente faria."); }
  });
  $$(".seg button").forEach(b => b.addEventListener("click", () => {
    $$(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b)); mode = b.dataset.mode;
  }));

  let actx;
  const beep = () => { try {
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    [0,.18].forEach(d => { const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + d;
      o.frequency.value = 880; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.15);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t+.16); });
  } catch {} };

  /* Hick dentro do produto: cada pedido mostra UMA próxima ação */
  const flow = {
    Delivery: [["Novo","brand","Preparar"],["Preparando","amber","Pronto"],["Saiu p/ entrega","blue","Concluir"],["Concluído","go",null]],
    Retirada: [["Novo","brand","Preparar"],["Preparando","amber","Pronto"],["Pronto p/ retirar","blue","Concluir"],["Concluído","go",null]],
    Mesa:     [["Novo","brand","Preparar"],["Preparando","amber","Servir"],["Na mesa","blue","Concluir"],["Concluído","go",null]],
  };
  const orders = $("#orders");
  const orderHTML = o => {
    const [label, tone, act] = flow[o.mode][o.step];
    return `<div class="o-h">#${o.no} <span class="chip chip-${tone}">${label}</span></div>
      <div class="o-sub">${o.mode === "Mesa" ? "Mesa " + o.table : o.mode} · ${o.n} ${o.n > 1 ? "itens" : "item"} · ${brl(o.t)}</div>
      <button class="o-act press" type="button" ${act ? "" : "disabled aria-label='Concluído'"}>${act || "✓"}</button>`;
  };
  const addOrder = (o, isNew) => {
    const el = document.createElement("div");
    el.className = "order" + (isNew ? " new" : ""); el._o = o; el.innerHTML = orderHTML(o);
    orders.prepend(el); orders.scrollTop = 0;
  };
  addOrder({no:127, mode:"Delivery", step:2, n:2, t:49.4});
  addOrder({no:128, mode:"Mesa", table:4, step:1, n:3, t:72.3});
  orders.addEventListener("click", e => {
    const b = e.target.closest(".o-act"); if (!b || b.disabled) return;
    const el = b.closest(".order"); el.classList.remove("new");
    el._o.step = Math.min(3, el._o.step + 1); el.innerHTML = orderHTML(el._o);
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  });
  /* no celular as 3 colunas empilham: a página acompanha o pedido para não perder causa → efeito */
  const narrow = matchMedia("(max-width:680px)"), calm = matchMedia("(prefers-reduced-motion:reduce)");
  const follow = el => { if (narrow.matches) el.scrollIntoView({behavior: calm.matches ? "auto" : "smooth", block:"center"}); };

  const ticket = $("#ticket"), printer = $("#printer"), bell = $("#bell");
  send.addEventListener("click", () => {
    const t = total(); if (!t) return;
    send.classList.remove("pulse");
    const no = orderNo++, lines = menu.filter(m => cart[m.id]).map(m => ({...m, q:cart[m.id]}));
    const n = lines.reduce((s,l) => s + l.q, 0), start = performance.now(), now = new Date();
    setStep(1, "O pedido tocou no painel. Olhe a impressora…");

    setTimeout(() => {
      addOrder({no, mode, step:0, n, t}, true);
      bell.classList.remove("ring"); void bell.getBoundingClientRect(); bell.classList.add("ring"); beep();
      try { navigator.vibrate?.([60,40,60]); } catch {}
      follow($("#c2")); bumpHour();
      count++; cash += t; $("#kCount").textContent = count; $("#kCash").textContent = brl(cash);
    }, 450);

    ticket.classList.remove("out");
    setTimeout(() => {
      ticket.innerHTML = `<div class="c"><b>BOTECO DA BRASA</b><br>${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div><hr>
        <div class="c big">PEDIDO #${no}</div><div class="c">${mode.toUpperCase()}</div><hr>
        ${lines.map(l => `<div class="row"><span>${l.q}x ${l.name}</span><span>${brl(l.q*l.price).replace("R$","").trim()}</span></div>`).join("")}
        <hr><div class="row big"><span>TOTAL</span><span>${brl(t)}</span></div><hr><div class="c">balcaonaweb.com.br</div>`;
      $("#slotEmpty").hidden = true; printer.classList.add("on");
      requestAnimationFrame(() => ticket.classList.add("out"));
      setStep(2, "Comanda saindo na cozinha…");
      setTimeout(() => follow($("#c3")), 500);
      setTimeout(() => {
        printer.classList.remove("on"); $("#timer").hidden = false;
        $("#tSec").textContent = ((performance.now() - start) / 1000).toFixed(1).replace(".", ",") + "s";
        setStep(3, "Pronto: do celular à cozinha, sem ninguém digitar nada. Avance o pedido no painel ou faça outro.", true);
      }, 1250);
    }, 700);

    Object.keys(cart).forEach(k => cart[k] = 0); renderCart();
  });

  /* =================== GRÁFICOS ===================
     SVG puro, medido no tamanho real do contêiner (texto nunca distorce),
     redesenha no resize, anima só quando entra na tela. */
  const NS = "http://www.w3.org/2000/svg";
  const sv = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  /* escala "redonda": passo 1·2·5×10ⁿ, então os rótulos nunca viram 12,5 mil */
  const niceScale = (v, ticks) => { v = Math.max(v, 1); const raw = v / ticks, p = 10 ** Math.floor(Math.log10(raw)), n = raw / p; const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; return {max: step * Math.ceil(v / step), step}; };
  const kfmt = v => v === 0 ? "R$ 0" : v >= 1000 ? "R$ " + (v/1000).toLocaleString("pt-BR",{maximumFractionDigits:1}) + " mil" : "R$ " + Math.round(v);
  const easeOut = t => 1 - (1 - t) ** 3;
  const reduced = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
  const onSeen = (el, fn, th = .35) => new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { fn(); o.disconnect(); } }), {threshold:th}).observe(el);
  const makeTip = host => {
    const t = document.createElement("div"); t.className = "tip"; host.appendChild(t);
    return {
      show(x, y, html) { t.innerHTML = html; const w = t.offsetWidth, W = host.clientWidth; t.style.left = Math.max(w/2, Math.min(W - w/2, x)) + "px"; t.style.top = y + "px"; t.classList.add("on"); },
      hide() { t.classList.remove("on"); }
    };
  };
  const tipRow = (c, name, val) => `<p><i style="--c:${c}"></i>${name}<span class="num">${val}</span></p>`;
  const fillTable = (tbl, head, rows) => { tbl.insertAdjacentHTML("beforeend", `<tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>` + rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")); };

  /* --- linha (com área) + mira e dica no hover --- */
  function lineChart(host, {series, xLabel, xTicks, points = 12, height = 220}) {
    const tip = makeTip(host), pad = {l:64, r:76, t:14, b:30};
    let cur = series.map(() => Array(points).fill(0)), sc = {max:1, step:1}, raf, geo;
    const draw = () => {
      const W = host.clientWidth, H = height; if (!W) return;
      host.querySelector("svg")?.remove();
      const svg = sv("svg", {width:W, height:H, "aria-hidden":"true"}); host.prepend(svg);
      const n = cur[0].length, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      const x = i => pad.l + iw * i / (n - 1), y = v => pad.t + ih * (1 - v / sc.max);
      geo = {x, y, iw, n, H};
      const g = sv("g", {class:"grid"}, svg);
      for (let v = 0, k = 0; v <= sc.max + 1e-6; v += sc.step, k++) { const yy = Math.round(y(v)) + .5;
        sv("line", {x1:pad.l, x2:W - pad.r + 8, y1:yy, y2:yy, class:k ? "" : "base"}, g);
        sv("text", {x:pad.l - 10, y:yy + 4, "text-anchor":"end", class:"axis"}, g).textContent = kfmt(v); }
      const narrow = W < 400;   /* telas estreitas: menos marcas no eixo, nada se sobrepõe */
      (narrow ? [0, 5, 11] : xTicks).forEach(i => sv("text", {x:x(i), y:H - 8, "text-anchor":i === n - 1 ? "end" : "middle", class:"axis"}, svg).textContent = xLabel(i, false, narrow));
      series.forEach((s, si) => {
        const d = "M" + cur[si].map((v, i) => `${x(i)},${y(v)}`).join("L");
        if (s.area) sv("path", {d:`${d}L${x(n-1)},${y(0)}L${x(0)},${y(0)}Z`, fill:s.color, "fill-opacity":.12}, svg);
        sv("path", {d, fill:"none", stroke:s.color, "stroke-width":2, "stroke-linejoin":"round", "stroke-linecap":"round"}, svg);
      });
      const ends = series.map((s, si) => ({s, v:cur[si][n-1], cy:y(cur[si][n-1])}));
      ends.forEach(e => e.ly = e.cy);
      if (ends.length === 2 && Math.abs(ends[0].cy - ends[1].cy) < 20) { const [a, b] = [...ends].sort((p, q) => p.cy - q.cy), m = (a.cy + b.cy) / 2; a.ly = m - 10; b.ly = m + 10; }
      ends.forEach(e => {
        sv("circle", {cx:x(n-1), cy:e.cy, r:4, fill:e.s.color, stroke:"var(--viz-surface)", "stroke-width":2}, svg);
        sv("text", {x:x(n-1) + 12, y:e.ly + 4, class:"val"}, svg).textContent = kfmt(e.v);
      });
      geo.hover = sv("g", {}, svg);
      const hit = sv("rect", {x:pad.l - 12, y:0, width:iw + 24, height:H, fill:"transparent", style:"cursor:crosshair"}, svg);
      hit.addEventListener("pointermove", ev => {
        const r = svg.getBoundingClientRect(), i = Math.max(0, Math.min(n - 1, Math.round((ev.clientX - r.left - pad.l) / iw * (n - 1))));
        geo.hover.replaceChildren();
        sv("line", {x1:x(i), x2:x(i), y1:pad.t, y2:H - pad.b, class:"cross"}, geo.hover);
        series.forEach((s, si) => sv("circle", {cx:x(i), cy:y(cur[si][i]), r:5, fill:s.color, stroke:"var(--viz-surface)", "stroke-width":2}, geo.hover));
        tip.show(x(i), Math.min(...series.map((s, si) => y(cur[si][i]))), `<b>${xLabel(i, true)}</b>` + series.map((s, si) => tipRow(s.color, s.name, kfmt(cur[si][i]))).join(""));
      });
      hit.addEventListener("pointerleave", () => { geo.hover.replaceChildren(); tip.hide(); });
    };
    new ResizeObserver(draw).observe(host);
    return {
      prime(max) { sc = niceScale(max, 4); draw(); },   /* eixo já na escala certa antes de animar */
      set(values, animate = true) {
        const from = cur.map(a => [...a]); sc = niceScale(Math.max(...values.flat()), 4);
        cancelAnimationFrame(raf);
        if (!animate || reduced()) { cur = values; return draw(); }
        const t0 = performance.now(), dur = 650;
        const step = now => { const k = easeOut(Math.min(1, (now - t0) / dur));
          cur = values.map((a, si) => a.map((v, i) => from[si][i] + (v - from[si][i]) * k)); draw();
          if (k < 1) raf = requestAnimationFrame(step); };
        raf = requestAnimationFrame(step);
      }
    };
  }

  /* --- colunas: base quadrada, topo arredondado 4px, ≤24px, crescem em cascata --- */
  function columnChart(host, {labels, values, highlight, height = 170}) {
    const tip = makeTip(host), pad = {l:56, r:8, t:26, b:28};
    const sc = niceScale(Math.max(...values), 3);
    const draw = () => {
      const W = host.clientWidth, H = height; if (!W) return;
      host.querySelector("svg")?.remove();
      const svg = sv("svg", {width:W, height:H, "aria-hidden":"true"}); host.prepend(svg);
      const n = values.length, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, band = iw / n, bw = Math.min(24, band * .55);
      const y = v => pad.t + ih * (1 - v / sc.max);
      const g = sv("g", {class:"grid"}, svg);
      for (let v = 0, k = 0; v <= sc.max + 1e-6; v += sc.step, k++) { const yy = Math.round(y(v)) + .5;
        sv("line", {x1:pad.l, x2:W - pad.r, y1:yy, y2:yy, class:k ? "" : "base"}, g);
        sv("text", {x:pad.l - 10, y:yy + 4, "text-anchor":"end", class:"axis"}, g).textContent = kfmt(v); }
      values.forEach((v, i) => {
        const cx = pad.l + band * i + band / 2, bx = cx - bw / 2, top = y(v), base = y(0), r = Math.min(4, base - top);
        const hitR = sv("rect", {x:pad.l + band * i, y:pad.t, width:band, height:ih, class:"bar-hit"}, svg);
        const bar = sv("path", {class:"bar", fill:"var(--viz-1)", style:`--d:${i * 70}ms`,
          d:`M${bx},${base}V${top + r}Q${bx},${top} ${bx + r},${top}H${bx + bw - r}Q${bx + bw},${top} ${bx + bw},${top + r}V${base}Z`}, svg);
        sv("text", {x:cx, y:H - 8, "text-anchor":"middle", class:i === highlight ? "val" : "axis"}, svg).textContent = labels[i];
        if (i === highlight) sv("text", {x:cx, y:top - 8, "text-anchor":"middle", class:"val"}, svg).textContent = kfmt(v);
        hitR.addEventListener("pointerenter", () => { bar.classList.add("hover"); tip.show(cx, top, `<b>${labels[i] === "Hoje" ? "Hoje" : labels[i]}</b>${tipRow("var(--viz-1)", "Faturamento", brl(v))}`); });
        hitR.addEventListener("pointerleave", () => { bar.classList.remove("hover"); tip.hide(); });
      });
    };
    new ResizeObserver(draw).observe(host);
    onSeen(host, () => { host.classList.add("play"); setTimeout(() => host.classList.replace("play", "played"), 1400); });
  }

  /* --- contadores: o número sobe até o valor quando aparece --- */
  const countUp = el => {
    const to = +el.dataset.count, f = el.dataset.fmt === "brl" ? brl : v => Math.round(v).toLocaleString("pt-BR");
    if (reduced()) return el.textContent = f(to);
    const t0 = performance.now(), dur = 1100;
    const step = now => { const k = easeOut(Math.min(1, (now - t0) / dur)); el.textContent = f(to * k); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* --- painel de caixa (aba "Salão e caixa") --- */
  const week = {labels:["Sex","Sáb","Dom","Seg","Ter","Qua","Hoje"], values:[4080,4150,3320,2610,2750,2980,4890.5]};
  columnChart($("#vizWeek"), {...week, highlight:6});
  fillTable($("#tblWeek"), ["Dia","Faturamento"], week.labels.map((l, i) => [l, brl(week.values[i])]));
  onSeen($(".dash"), () => $$(".dash [data-count]").forEach(countUp), .3);
  const pay = $("#payBar"), payTip = makeTip(pay.parentElement);
  onSeen(pay, () => pay.classList.add("play"));
  $$("#payBar .part").forEach(p => {
    p.addEventListener("pointerenter", () => payTip.show(p.offsetLeft + p.offsetWidth / 2, 0, `<b>${p.dataset.name}</b>${tipRow(getComputedStyle(p).backgroundColor, "Hoje", brl(+p.dataset.v))}${tipRow("transparent", "Participação", p.style.getPropertyValue("--w") + "%")}`));
    p.addEventListener("pointerleave", () => payTip.hide());
  });

  /* --- mini-colunas ao vivo no simulador: cada pedido sobe a hora atual --- */
  const hourly = [1,3,6,5,2,1,2,4,6,4,0,0], NOW = 9;
  const hoursEl = $("#hours");
  hoursEl.innerHTML = hourly.map((v, i) => `<div class="h${i === NOW ? " now" : ""}${i > NOW ? " future" : ""}" title="${11 + i}h: ${i > NOW ? "ainda não chegou" : v + " pedidos"}"><i></i></div>`).join("");
  const paintHours = () => { const mx = Math.max(8, ...hourly); [...hoursEl.children].forEach((h, i) => h.firstChild.style.setProperty("--v", (i > NOW ? 4 : hourly[i] / mx * 100) + "%")); $("#nowCount").textContent = hourly[NOW]; };
  paintHours();
  const bumpHour = () => { hourly[NOW]++; paintHours(); const h = hoursEl.children[NOW]; h.classList.remove("pop"); void h.offsetWidth; h.classList.add("pop"); };

  /* ---------- calculadora ---------- */
  const calcChart = lineChart($("#vizCalc"), {
    series:[{name:"Com comissão", color:"var(--viz-n1)", area:true, values:[]}, {name:"Balcão na Web", color:"var(--viz-n2)", values:[]}],
    xTicks:[0,3,7,11], xLabel:(i, long, short) => long ? `${i + 1}º mês` : (i === 11 && !short ? "12 meses" : `${i + 1}º`)
  });
  let calcSeen = false;
  const series12 = m => [Array.from({length:12}, (_, i) => m * (i + 1)), Array(12).fill(0)];
  onSeen($("#vizCalc"), () => { calcSeen = true; calcChart.set(series12(target)); });
  const rev = $("#rev"), fee = $("#fee");
  let shown = 0, target = 0, raf;
  const tick = () => {   /* o número "corre" até o valor: o olho percebe a mudança */
    shown += (target - shown) * .22;
    if (Math.abs(target - shown) < 1) shown = target;
    $("#loss").textContent = brl0(shown);
    if (shown !== target) raf = requestAnimationFrame(tick);
  };
  const fill = r => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%");
  const calc = () => {
    const m = +rev.value * +fee.value / 100; target = m;
    fill(rev); fill(fee);
    $("#revO").textContent = brl0(+rev.value); $("#feeO").textContent = fee.value + "%";
    $("#year").textContent = brl0(m*12);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    if (calcSeen) calcChart.set(series12(m)); else calcChart.prime(m * 12);
    const tbl = $("#tblCalc"); tbl.querySelectorAll("tr").forEach(r => r.remove());
    fillTable(tbl, ["Mês","Com comissão","Balcão na Web"], series12(m)[0].map((v, i) => [`${i + 1}º`, brl0(v), "R$ 0"]));
  };
  rev.addEventListener("input", calc); fee.addEventListener("input", calc); calc();

  /* ---------- abas (setas do teclado, padrão WAI) ---------- */
  const tabs = $$(".tab");
  const select = t => tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
  tabs.forEach((t,i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", e => { const d = {ArrowRight:1, ArrowLeft:-1}[e.key]; if (!d) return; const n = tabs[(i+d+tabs.length)%tabs.length]; select(n); n.focus(); });
  });
  $$(".sw").forEach(s => s.addEventListener("click", () => {
    const on = s.getAttribute("aria-checked") !== "true"; s.setAttribute("aria-checked", on);
    s.previousElementSibling.querySelector("small").textContent = on ? s.dataset.on : s.dataset.off;
  }));

  /* ---------- conversa do fechamento: as falas entram em sequência (CSS) quando ela aparece ---------- */
  const chat = $("#chat");
  onSeen(chat, () => chat.classList.add("play"), .5);

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.15});
  /* entrada consistente: todo bloco de conteúdo surge igual, com escalonamento entre irmãos */
  $$(".section:not(.hero) .head, .night, .steps .card, .feats li, .closing, .faq details").forEach(el => {
    el.classList.add("reveal");
    el.style.setProperty("--i", [...el.parentElement.children].indexOf(el) % 5);
  });
  $$(".reveal:not(.receipt)").forEach(el => io.observe(el));
  /* o recibo "imprime" com clip-path, que zera a área visível: observa-se o contêiner */
  const rc = $(".receipt");
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { rc.classList.add("in"); o.disconnect(); } }), {threshold:.2}).observe(rc.parentElement);
})();
