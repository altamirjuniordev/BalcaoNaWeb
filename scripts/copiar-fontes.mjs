/* ==========================================================================
   Copia as fontes dos pacotes @fontsource-variable para public/fonts/.

   Rodar com `npm run fontes` depois de atualizar algum desses pacotes. Nao
   roda no build: os .woff2 sao commitados, entao o deploy nao depende disto.

   So o subconjunto latin, que cobre o portugues inteiro. Os @font-face
   ficam em src/styles/fontes.css.
   ========================================================================== */
import { copyFileSync, mkdirSync } from 'node:fs';

const ORIGEM = 'node_modules/@fontsource-variable';
const SAIDA = 'public/fonts';

const fontes = [
  // [pacote, arquivo no pacote, nome publicado]
  ['bricolage-grotesque', 'bricolage-grotesque-latin-opsz-normal.woff2', 'bricolage-grotesque-latin-opsz.woff2'],
  ['instrument-sans', 'instrument-sans-latin-wght-normal.woff2', 'instrument-sans-latin-var.woff2'],
  ['jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono-latin-var.woff2'],
];

mkdirSync(SAIDA, { recursive: true });
for (const [pacote, arquivo, destino] of fontes) {
  copyFileSync(`${ORIGEM}/${pacote}/files/${arquivo}`, `${SAIDA}/${destino}`);
}

console.log(`${fontes.length} fontes copiadas para ${SAIDA}/`);
