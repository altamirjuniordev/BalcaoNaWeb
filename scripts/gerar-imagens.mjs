/* ==========================================================================
   Gera o logo e os favicons a partir das artes originais em src/images/.

   Rodar com `npm run img` depois de trocar alguma arte. Nao roda no build:
   o resultado e commitado, entao o deploy nao depende disto.

   O que este script resolve:

   1. PESO. As artes originais somam ~1 MB. A pagina inteira otimizada tem
      ~100 KB. Reduzidas para o tamanho em que sao realmente exibidas, as
      duas caem para ~22 KB.

   2. BORDA TRANSPARENTE. O logo largo tinha 17% da altura em transparencia,
      o que encolhia o texto na barra de navegacao sem motivo.

   3. TEXTO BRANCO NO TEMA CLARO. A arte do logo tem "BALCÃO" em branco, feita
      para fundo escuro. Sobre o creme do tema claro a palavra desaparecia.
      A funcao abaixo gera a variante de texto escuro, recolorindo so os
      pixels acromaticos (branco e cinza) e deixando laranja e azul intactos.
   ========================================================================== */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const ORIGEM_LOGO = 'src/images/logo_larga.png';
const ORIGEM_ICONE = 'src/images/favicon.png';
const SAIDA = 'public/img';

/* O ink e o bg do tema claro, de src/styles/tokens.css. */
const INK = [27, 22, 19];
const BG = [251, 247, 242];

/** Inverte a luminancia dos pixels sem cor; preserva os coloridos e o alpha. */
async function variantePraFundoClaro(entrada) {
  const { data, info } = await sharp(entrada).raw().toBuffer({ resolveWithObject: true });
  const saida = Buffer.from(data);

  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b);
    const saturacao = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;

    // Laranja e azul da marca ficam como estao.
    if (saturacao > 0.22) continue;

    // Branco vira ink, o contorno escuro vira o bg — a antialiasing das
    // bordas continua suave porque a rampa inteira e mapeada, nao so os
    // extremos.
    const t = (255 - max) / 255;
    for (let c = 0; c < 3; c++) saida[i + c] = Math.round(INK[c] + t * (BG[c] - INK[c]));
  }

  return sharp(saida, { raw: info }).png().toBuffer();
}

mkdirSync(SAIDA, { recursive: true });

/* ---------------------------------------------------------------- logo -- */
// threshold 1 = corta so o que e de fato transparente
const recortado = await sharp(ORIGEM_LOGO).trim({ threshold: 1 }).png().toBuffer();
const claro = await variantePraFundoClaro(recortado);

const png = { compressionLevel: 9, palette: true };

// Exibido a 36px de altura; 80px cobre telas 2x. (PNG em paleta ficou menor
// que WebP aqui — 6 KB contra 11 KB — porque a arte e de cores chapadas.)
await sharp(claro).resize({ height: 80 }).png(png).toFile(`${SAIDA}/logo-claro.png`);
await sharp(recortado).resize({ height: 80 }).png(png).toFile(`${SAIDA}/logo-escuro.png`);

// Organization.logo do schema: o Google pede >=112px de altura e renderiza
// sobre fundo claro.
await sharp(claro).resize({ height: 200 }).png(png).toFile(`${SAIDA}/logo.png`);

/* ------------------------------------------------------------- favicons -- */
const transparente = { r: 0, g: 0, b: 0, alpha: 0 };
for (const t of [16, 32, 48, 180]) {
  await sharp(ORIGEM_ICONE)
    .resize(t, t, { fit: 'contain', background: transparente })
    .png(png)
    .toFile(`${SAIDA}/favicon-${t}.png`);
}

console.log(`imagens geradas em ${SAIDA}/`);
