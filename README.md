# Balcão na Web — página de vendas

Landing institucional do Balcão na Web: cardápio digital com painel de pedidos
em tempo real e comanda impressa automaticamente na cozinha.

O **sistema em si (cardápio + painel) roda à parte**. Esta página só apresenta
o produto e leva o lojista para a conversa no WhatsApp.

---

## Como rodar

Site estático puro — HTML, CSS e JS, sem build e sem dependência.

```bash
node servidor.js
# http://localhost:5173
```

`servidor.js` é só para desenvolvimento. Em produção basta subir a pasta em
qualquer hospedagem estática (Netlify, Vercel, GitHub Pages, S3, cPanel).

---

## A única configuração pendente

No topo dos scripts, em `index.html`:

```js
window.BW_LANDING = {
  urlDemo: 'https://titus.balcaonaweb.com.br',
  whatsappContato: '',     // ← FALTA ISTO: 55 + DDD + número, só dígitos
  mensagemContato: 'Olá! Vi o site do Balcão na Web e quero ver o sistema funcionando na minha loja.'
};
```

- **`whatsappContato`** alimenta os 4 botões "Quero ver funcionando" (nav, hero,
  CTA final e rodapé). Preenchido, todos viram link de WhatsApp com a mensagem
  já escrita. **Enquanto estiver vazio, eles seguem como âncora interna** — a
  página funciona, mas não converte.
- **`urlDemo`** já aponta para o cardápio do Titu's Burger e alimenta os 6 links
  de "Ver cardápio de exemplo", incluindo os do rodapé.

Ambos abrem em nova aba com `rel="noopener"`.

---

## Estrutura da página

1. **Nav** fixa — Como funciona · Por que · O painel · Dúvidas + CTA
2. **Hero** — a promessa real, ao lado da composição 3D do painel
3. **Como funciona** — 3 passos: cadastramos seu cardápio · o cliente pede pelo
   link ou QR Code · o pedido cai no painel e sai impresso
4. **Por que** — 6 cards: sem comissão, sem app, comanda automática, salão +
   delivery, caixa do dia, controle da loja
5. **O painel** — quadro de pedidos em tempo real ao lado da comanda saindo da
   impressora térmica
6. **Em breve** — cliente pedindo da própria mesa pelo QR Code
7. **Dúvidas** — 7 perguntas em `<details>` nativo
8. **CTA final** — "preço fixo mensal, sem comissão" + rodapé

---

## Regras de conteúdo

A página descreve **apenas** o que o produto faz hoje. Nada aqui pode voltar
sem existir de verdade:

- O pedido **não** vai para o WhatsApp — vai para o painel e para a impressora.
  O WhatsApp aparece só como canal de contato comercial.
- **Sem** cupons, taxa por bairro, multi-loja, usuários/permissões, tabela de
  planos, autocadastro ou "crie grátis" — o onboarding é feito por vocês.
- **Sem número inventado.** A barra de destaques do hero usa só fatos: 0% de
  comissão, ~2 segundos até a comanda, salão + delivery, feito em Recife.
- **Sem prova social** enquanto não houver depoimento real. A seção de
  depoimentos foi removida, não escondida.

Os valores que aparecem dentro dos mockups (preços do cardápio no celular,
pedidos do painel, total da comanda) são ilustração de interface, como em
qualquer print de produto — não são afirmações sobre o negócio.

---

## Estrutura de arquivos

```
index.html                  a página inteira
servidor.js                 servidor estático local (dev)
assets/
├── css/
│   ├── tokens.css          cores, tipografia, espaço, raio, sombra, tema escuro
│   ├── base.css            reset, botões, campos, selos, utilitários
│   ├── landing.css         nav, hero, seções, painel, comanda, FAQ, rodapé
│   └── hero3d.css          só a composição 3D do hero (paleta própria)
├── js/
│   ├── core/utils.js       DOM, storage, prefers-reduced-motion
│   ├── core/icones.js      SVG inline (sem biblioteca de ícones)
│   ├── landing.js          ícones, links, tema, sombra da nav, revelação
│   └── hero3d.js           entrada, count-up, gráficos, pedidos ao vivo, parallax
└── img/                    favicon e imagem Open Graph
```

> `assets/img/produtos/` sobrou do mockup antigo de celular e não é mais
> referenciada por nada. Pode apagar.

---

## Decisões que valem saber

**Todos os mockups são HTML, não imagem.** A composição do hero, o celular e a
comanda térmica ficam nítidos em qualquer tela, pesam quase nada e dão para
editar sem abrir editor de imagem. Todos têm `role="img"` e `aria-label`.

**A composição do hero tem três transforms empilhados, de propósito.** Cada peça
é `.h3-layer` (posição + `translateZ`), `.h3-float` (flutuação idle) e
`.h3-enter` (entrada com stagger). Separados assim, o parallax, a flutuação e a
entrada nunca sobrescrevem um ao outro — o bug clássico de animar transform em
três lugares no mesmo elemento.

**O parallax gira o palco inteiro, não cada cartão.** Com `perspective` no pai e
`preserve-3d` no palco, a profundidade de cada camada já vem do `translateZ`: a
perspectiva desloca cada uma por conta própria. São duas variáveis de rotação
por frame em vez de cinco transforms.

**O palco é medido, não chutado.** Ele é desenhado em 520×640 fixos e o JS
calcula `--stg-s` pela largura real da coluna (que varia continuamente entre
1024 e 1280). Abaixo de 900px vira empilhado: dois cartões, sem parallax, mesma
entrada e mesmo count-up.

**Os valores animados já vêm escritos no HTML.** O JS zera para contar; sem JS a
peça aparece completa. Vale para os KPIs, a linha do gráfico e o donut.

**A comanda parece papel por contraste, não por textura.** O cartão fica cor de
creme e o papel branco por cima — é isso que faz a serrilha do picote aparecer.
No modo escuro o papel continua branco, porque bobina térmica é branca.

**A serrilha é gradiente, não `mask`.** Duas camadas de `mask-image` se somam em
vez de recortar, e o resultado seria uma borda reta; meias-luas desenhadas com
`radial-gradient` sobre a base do papel resolvem.

**Tokens como fonte única** (`tokens.css`): terracota `#E8552A` como primária,
neutros creme, verde reservado para confirmações. Trocar a identidade = trocar o
bloco `--brand-*`. O modo escuro redefine só variáveis; nenhum componente conhece
o tema.

**A revelação ao rolar tem rede de segurança.** As seções entram com fade, mas se
o `IntersectionObserver` não disparar, um timer revela tudo depois do `load`.

**FAQ em `<details>` nativo**: abre sem JS, é indexável pelo Google e já vem com
teclado e leitor de tela funcionando.

**SEO** — `SoftwareApplication` com `featureList` (sem preço e sem nota, que não
existem) e `FAQPage` em JSON-LD. Open Graph com imagem própria, já reescrita para
a promessa nova.

---

## Próximos passos sugeridos

1. **Preencher `whatsappContato`.** É o que falta para a página converter.
2. **Depoimento do Titu's Burger** — a seção de prova social só volta com cliente
   real, com nome e, de preferência, um número que ele mesmo autorize.
3. **Print ou vídeo do painel de verdade** — o mockup atual é fiel, mas a tela
   real (com o som tocando) vende mais.
4. **Analytics e pixel** — GA4 + Meta Pixel com evento por CTA, para saber qual
   seção leva ao WhatsApp.
5. **Valores dos planos** — quando definidos, a frase do CTA final vira uma
   tabela curta.
6. **Página por segmento** — `/hamburguerias`, `/pizzarias`, com headline e
   depoimento específicos. Os links do rodapé já existem para isso.
7. **Trocar o mockup pelo painel real** — a composição do hero é fiel, mas um
   print ou vídeo da tela verdadeira vende mais quando ela estiver pronta.
