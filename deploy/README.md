# Publicação — Cloudflare Pages

A landing vive no **Cloudflare Pages**, no apex. O app Next.js e os cardápios
dos clientes continuam no VPS da Vultr, atrás do Caddy, sem alteração de host.

| Host | Onde vive | Muda? |
|---|---|---|
| `balcaonaweb.com.br` | Cloudflare Pages | **sim** — hoje cai no fallback do app |
| `www.balcaonaweb.com.br` | Redirect 301 para o apex | **sim** |
| `app.balcaonaweb.com.br` | VPS (Caddy) | só ganha `noindex` |
| `*.balcaonaweb.com.br` | VPS (Caddy) | não |

---

## 1. Criar o projeto no Pages

Dashboard → **Workers & Pages** → Create → Pages → Connect to Git → este repo.

| Campo | Valor |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Production branch | `main` |

O deploy sai num endereço `*.pages.dev`. **Valide ali antes de tocar no DNS:**

- a página abre e o tema não pisca ao recarregar;
- `/robots.txt` responde **o seu** (o que fala em "Balcão na Web"), não o
  padrão da Cloudflare que fala de content signals;
- `/sitemap-index.xml` responde, e `/sitemap.xml` redireciona para ele;
- os botões "Quero ver funcionando" abrem o WhatsApp;
- cole a URL `.pages.dev` num rascunho de WhatsApp e confira se o preview
  aparece **com imagem**.

Só siga para o passo 2 quando tudo isso estiver certo.

---

## 2. Apontar o domínio

No projeto do Pages → **Custom domains** → Set up a domain → `balcaonaweb.com.br`.
A Cloudflare detecta o registro A apontando para o VPS e oferece substituir.
Aceite. Repita para `www.balcaonaweb.com.br`.

**Não toque em `app` nem no wildcard `*`** — seguem com A para o VPS.

Espere os dois ficarem `Active`.

---

## 3. Redirect do www

Com apex e www como domínio customizado, os dois servem o mesmo conteúdo —
o conteúdo duplicado que acabamos de consertar voltaria.

Rules → **Redirect Rules** → Create:

- **Se:** `Hostname` equals `www.balcaonaweb.com.br`
- **Então:** Dynamic redirect →
  `concat("https://balcaonaweb.com.br", http.request.uri.path)`
- Status **301**, *preserve query string* ligado.

Conferir:

```bash
curl -I https://www.balcaonaweb.com.br    # tem que devolver 301
```

Isso fica no painel, e não em `public/_redirects`, porque o `_redirects` do
Pages não casa por hostname — a Redirect Rule roda na borda, antes do Pages.

---

## 4. Caddy no VPS (limpeza)

Depois que o DNS virar, o bloco do apex no Caddy fica inalcançável. Duas
mudanças no VPS:

1. **Tirar o apex do bloco do menu** — ele passa a atender só
   `*.balcaonaweb.com.br`.
2. **`noindex` no app**, que é tela de login e não tem nada a ranquear:

   ```caddyfile
   app.balcaonaweb.com.br {
       header X-Robots-Tag "noindex, nofollow"
       # ... resto do bloco como já está
   }
   ```

Smoke test depois do reload:

```bash
curl -I https://app.balcaonaweb.com.br   | grep -i x-robots-tag   # noindex
curl -I https://titus.balcaonaweb.com.br | head -1                # 200
curl -I https://balcaonaweb.com.br       | grep -i server         # cloudflare
```

> Uma versão anterior deste repositório trazia um `deploy/Caddyfile` que
> fazia o **apex servir a landing pelo VPS**. Esse cenário foi descartado em
> favor do Pages e o arquivo foi removido para não ser colado por engano.

---

## 5. Search Console

O Google tem o apex indexado como `<title>Cardápio</title>` — a página de
fallback do multi-tenant. Ele não vai reindexar sozinho no seu prazo.

No mesmo dia da troca de DNS:

1. Adicione a propriedade **de domínio** `balcaonaweb.com.br` (verificação por
   TXT no DNS — cobre todos os subdomínios de uma vez).
2. Sitemaps → submeta `https://balcaonaweb.com.br/sitemap-index.xml`.
   É esse o nome que o Astro gera; `/sitemap.xml` também funciona, porque
   redireciona para ele.
3. Inspeção de URL no apex → **Solicitar indexação**.

---

## Ordem de segurança

O apex nunca fica quebrado: até o passo 2 ele mostra o fallback antigo,
depois do passo 2 mostra a landing. O passo 4 é remoção de código morto.
