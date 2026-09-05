# Balcão na Web — página de vendas

Landing institucional do Balcão na Web: cardápio digital com painel de pedidos
em tempo real e comanda impressa automaticamente na cozinha.

O **sistema em si (cardápio + painel) roda à parte**, no app Next.js. Esta
página só apresenta o produto e leva o lojista para a conversa no WhatsApp.

Site estático gerado com [Astro](https://astro.build): o build produz HTML puro,
sem servidor de aplicação e sem framework no navegador.

---

## Como rodar

```bash
npm install
npm run dev      # http://localhost:4321
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento, com recarga automática |
| `npm run build` | gera o site em `dist/` |
| `npm run preview` | serve o `dist/` como ficará em produção |
| `npm run og` | regera `public/og.png` a partir de `src/og-fonte.svg` |

---

## Configuração

Tudo em **`src/data/site.ts`**: domínio, URLs do app e da demo, WhatsApp,
cidade e redes sociais.

O WhatsApp (`5581995478511`) alimenta os 4 botões "Quero ver funcionando" —
nav, hero, CTA final e rodapé. Se for esvaziado, eles voltam a ser âncora
interna: a página funciona, mas não converte.

`instagram` e `facebook` seguem vazios. Preenchidos, entram no `sameAs` do
schema, que ajuda o Google a ligar o site à entidade da marca — vale preencher
assim que os perfis existirem.

---

## Estrutura

```
src/
  data/
    site.ts          configuração central (WhatsApp, domínio, URLs, local)
    faq.ts           perguntas — fonte única do <details> E do JSON-LD
  layouts/Base.astro <head>, fontes, tema, scripts
  components/
    Seo.astro        meta, Open Graph, Twitter e JSON-LD de uma página
    Icon.astro       + icones.ts — SVG inline, sem JS
    Nav / Hero / Hero3D / ComoFunciona / PorQue / Painel / EmBreve /
    Faq / CtaFinal / Footer
  styles/
    tokens.css       design tokens (cor, tipo, espaço, sombra) — não mexi
    base.css         reset e componentes base — não mexi
    landing.css      seções da landing — não mexi
    hero3d.css       composição do painel — não mexi
    fontes.css       @font-face das fontes self-hosted
    ajustes.css      o que precisou de CSS porque saiu do JS
  scripts/
    utils.js         helpers (7 funções, era 20)
    landing.js       tema, sombra da nav, revelação ao rolar
    hero3d.js        animação da composição do painel
  pages/index.astro
public/
  og.png             imagem de compartilhamento (1200×630)
  robots.txt  favicon.svg  fonts/
  _headers           cache e segurança (Cloudflare Pages)
  _redirects         /sitemap.xml -> /sitemap-index.xml
deploy/
  README.md          passo a passo da publicação
```

O design não foi alterado: os quatro CSS originais estão intactos e tudo que
mudou está em `ajustes.css`.

---

## Publicar

A landing vive no **Cloudflare Pages**, no apex; o app e os cardápios dos
clientes continuam no VPS da Vultr. Um push na `main` publica.

O passo a passo completo — criar o projeto, apontar o domínio, o redirect do
www e o que ajustar no Caddy depois — está em **[`deploy/README.md`](deploy/README.md)**.

---

## O que mudou em relação à versão anterior

### Performance

| Antes | Agora |
|---|---|
| Google Fonts por `<link>`: 2 origens externas, ~3 idas e voltas antes do primeiro texto | fontes variáveis self-hosted, com `preload` e `font-display: swap` |
| 4 CSS separados, 47 KB sem minificar | 1 CSS minificado, 7,7 KB com gzip |
| 4 JS separados, 29 KB sem minificar | 1 módulo com `defer`, 2,8 KB com gzip |
| 35 ícones baixados por JS para usar 10, injetados depois do carregamento | 10 SVG inline no HTML, zero JS, zero layout shift |
| `utils.js` com 20 funções, 13 sem uso na landing | 7 funções |
| tema lido no fim do `<body>` → flash branco a cada carregamento | script inline no `<head>`, sem flash |
| conteúdo escondido por `style` inline escrito pelo JS | estado inicial no CSS, sob a classe `js` |

### SEO

- **`og:image` era `.svg`** — WhatsApp, Facebook, LinkedIn e Twitter não
  renderizam SVG. Todo link compartilhado aparecia sem imagem. Agora é PNG.
- **`og:image` era caminho relativo** — Open Graph exige URL absoluta. Segundo
  motivo do preview quebrar.
- **FAQ dessincronizada**: 7 perguntas na página, 6 no JSON-LD. Agora saem da
  mesma lista (`src/data/faq.ts`), então não dá mais para divergir.
- **`sitemap.xml` dava 404** — agora é gerado no build e o `robots.txt` aponta
  para ele.
- **Schema ampliado**: era `SoftwareApplication` + `FAQPage` soltos; agora é um
  `@graph` ligando `Organization` (com endereço em Recife), `WebSite`,
  `WebPage`, `SoftwareApplication` e `FAQPage` pelo `@id`.
- **`og:url`, `twitter:title`/`description`/`image`** e
  `robots: max-image-preview:large` (libera a miniatura grande na busca).
- **Canonical e sitemap concordando** na barra final.

### Limpeza

- 4 SVG em `assets/img/produtos/` que nenhum arquivo referenciava.
- `servidor.js`, que anunciava um `/cardapio.html` inexistente.

---

## Pendências fora deste repositório

Estas dependem do app Next.js ou do painel da Cloudflare, não deste projeto:

1. **`app.balcaonaweb.com.br` está indexável.** É tela de login, não tem nada
   a ranquear, e página de login indexada só dilui o domínio. Adicionar no
   `<head>` do app:
   ```html
   <meta name="robots" content="noindex, nofollow">
   ```

2. **O app ainda se chama "Cardápio Fácil".** O nome do produto é
   **Balcão na Web** — decidido. Enquanto o app responder
   `<title>Cardápio Fácil — Painel</title>`, a busca por nome, os links e o
   cliente que chega por indicação se dividem entre duas marcas. Trocar agora
   custa um find-and-replace; depois custa QR Code impresso.

3. **Subdomínios dos clientes** (`titus.balcaonaweb.com.br` e os próximos)
   devem ter `<link rel="canonical">` apontando para eles mesmos, para não
   competirem entre si nem com o apex.

4. **Cache na Cloudflare**: hoje o apex responde `cf-cache-status: DYNAMIC` e
   `Cache-Control: no-store`. Servindo a landing estática pelo Caddy isso já
   melhora; uma Cache Rule para o apex faria a Cloudflare servir direto da
   borda.

---

## Otimização ainda possível

As fontes somam 82 KB — o maior item do peso da página. Dá para cortar boa
parte com subsetting (`subset-font` no build, restringindo o eixo de peso a
400–800). Não fiz porque as fontes carregam com `swap` (não seguram o texto),
ficam em cache por um ano e o subsetting por caractere quebra quando entram
páginas novas. Vale reavaliar se o site crescer e o peso incomodar.
