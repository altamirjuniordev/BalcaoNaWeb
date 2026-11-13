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
| `npm run img` | regera logo e favicons a partir de `src/images/` |
| `npm run og` | regera `public/og.png` (rode depois de `npm run img`) |
| `npm run fontes` | copia as fontes dos pacotes `@fontsource-variable` para `public/fonts/` |

---

## Configuração

Tudo em **`src/data/site.ts`**: domínio, URLs do app e da demo, WhatsApp,
cidade e redes sociais.

O WhatsApp (`5581995478511`) alimenta os 5 botões verdes da página: os 4
"Quero ver funcionando" (barra do topo, hero, fechamento e barra fixa do
celular) e o "Pedir o valor no WhatsApp" da seção de preço, que abre a
conversa já perguntando a mensalidade. Todos passam por
`components/BotaoWhats.astro` e saem prontos do build, sem depender de
JavaScript. Se o número for esvaziado, eles viram âncora interna: a página
funciona, mas não converte.

`mensagemWhatsapp` é o texto que já vai escrito na conversa — **e também a
primeira fala da conversa ilustrada do fechamento**, então as duas nunca
divergem.

A página **não aponta para a loja de nenhum cliente ativo**: os links
"cardápio real", o QR Code e a menção à primeira loja que existiam no
protótipo saíram. A demonstração é o simulador do topo, com uma loja
inventada.

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
  layouts/Base.astro <head>, fontes, scripts
  components/
    Seo.astro        meta, Open Graph, Twitter e JSON-LD de uma página
    Icones.astro     sprite de ícones (<symbol>), usado com <use href="#i-…">
    Logo.astro       marcador laranja + nome em texto, na barra do topo
    BotaoWhats.astro o botão verde; monta o link do WhatsApp no build
    — as seções, na ordem em que aparecem —
    Nav              barra do topo
    Hero             promessa + Simulador (celular → painel → impressora)
    Calculadora      quanto a comissão leva por mês e por ano
    Painel           recursos em 3 abas, com as telas de exemplo
    ComoComecar      os 3 passos da implantação
    Preco            a "comanda mensal" e o botão de pedir o valor
    Faq              perguntas (lê de data/faq.ts)
    CtaFinal         fechamento com a conversa de WhatsApp animada
    Footer           rodapé + barra fixa do celular
  styles/
    site.css         o sistema de design inteiro: tokens no :root, depois
                     os componentes na ordem da página
    fontes.css       @font-face das fontes self-hosted
  images/            artes originais da marca (fonte, não vão para o ar)
  scripts/
    landing.js       simulador, gráficos, calculadora, abas, entrada ao rolar
  pages/index.astro
public/
  og.png             imagem de compartilhamento (1200×630)
  img/               logo (para o schema) e favicons — gerados, não editar
  fonts/             3 fontes variáveis — copiadas por `npm run fontes`
  robots.txt
  _headers           cache e segurança (Cloudflare Pages)
  _redirects         /sitemap.xml -> /sitemap-index.xml
scripts/             geradores (imagens, og, fontes) — rodam à mão, não no build
deploy/
  README.md          passo a passo da publicação
```

O design veio de um protótipo em um único `index.html`. O CSS e o JavaScript
dele estão em `site.css` e `landing.js` praticamente como chegaram; o que
mudou no porte para o Astro está na seção abaixo.

---

## Publicar

A landing vive no **Cloudflare Pages**, no apex; o app e os cardápios dos
clientes continuam no VPS da Vultr. Um push na `main` publica.

O passo a passo completo — criar o projeto, apontar o domínio, o redirect do
www e o que ajustar no Caddy depois — está em **[`deploy/README.md`](deploy/README.md)**.

---

## Do protótipo para o site

O visual e o comportamento são os do protótipo. O que mudou foi por baixo:

| No protótipo | No site |
|---|---|
| Google Fonts por `<link>`: 2 origens externas, e a folha de estilo segurava a primeira pintura | fontes variáveis self-hosted, com `preload` e `font-display: swap` |
| QR Code no fechamento, montado por uma biblioteca de CDN | saiu; no lugar, uma conversa de WhatsApp que mostra o que acontece depois do clique (só HTML e CSS) |
| links de WhatsApp com `href="#"`, preenchidos por JS, com o número escrito no script | links prontos no HTML, a partir de `site.ts` |
| CSS e JS inline, sem minificar, 78 KB num arquivo só | HTML 8,6 KB + CSS 7,0 KB + JS 6,5 KB (gzip), CSS e JS com cache de um ano |
| blocos com entrada animada começavam invisíveis mesmo sem JS | estado inicial sob a classe `js`: sem JavaScript nada some |
| `© 2026` fixo, URL do app repetida no HTML | ano do build e URL de `site.ts` |
| links e menção à loja de um cliente ativo | saíram |
| 5 perguntas só no HTML | as mesmas 5 em `faq.ts`, que também gera o JSON-LD |

A página não faz **nenhuma requisição a outro domínio**: tudo sai do
próprio site.

### SEO

Vem da migração anterior para o Astro e continua valendo:


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

## A marca

**Na página, o logo é texto**: o marcador laranja com o balcão e o nome na
fonte dos títulos (`Logo.astro`), como no protótipo. A arte da marca aparece
em três lugares fora dela: no favicon, na imagem de compartilhamento
(`og.png`) e no `Organization.logo` do schema, que o Google usa no painel de
conhecimento.

As artes originais ficam em `src/images/` e **não são publicadas** — o que vai
para o ar é o que `npm run img` gera em `public/img/`. Juntas, as originais
somam ~1 MB; as versões publicadas somam ~32 KB.

Três coisas que o script resolve e vale saber antes de trocar a arte:

- **O logo tem o texto em branco**, feito para fundo escuro — sobre fundo
  claro a palavra "BALCÃO" desaparece. O script gera a variante de texto
  escuro recolorindo só os pixels sem cor; laranja e azul ficam intactos.
- **O logo original tinha 17% da altura em borda transparente**. O script
  recorta.
- **O favicon fica ilegível a 16px** — a arte tem wifi, balcão, notebook e
  monograma, e tudo isso vira um borrão no tamanho da aba do navegador. A
  partir de 32px funciona. Se um dia valer a pena, o caminho é uma versão
  simplificada só para 16px, com duas ou três formas.

## Otimização ainda possível

As fontes somam 147 KB — de longe o maior item do peso da página. A dos
títulos (Bricolage Grotesque, 77 KB) pesa mais porque carrega o eixo de peso
inteiro e a página só usa o 800: fixar o peso em 800 mantendo o eixo óptico
(`fonttools varLib.instancer`) deve cortar perto da metade. Não fiz porque as
fontes carregam com `swap` (não seguram o texto) e ficam em cache por um ano.
Vale reavaliar se o peso incomodar no celular.
