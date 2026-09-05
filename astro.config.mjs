import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Alimenta o sitemap, as URLs absolutas de Open Graph e o canonical.
  // Trocar aqui muda tudo isso de uma vez.
  site: 'https://balcaonaweb.com.br',
  trailingSlash: 'never',

  integrations: [sitemap()],

  build: {
    // CSS num arquivo so: a pagina e pequena o bastante para nao valer
    // a pena dividir, e 1 request bate 4 em qualquer conexao.
    inlineStylesheets: 'auto',

    // 'file' gera /pagina.html em vez de /pagina/index.html. Combina com
    // trailingSlash: 'never' — com 'directory' o servidor redireciona
    // /pagina para /pagina/, brigando com o canonical sem barra.
    format: 'file',
  },

  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
