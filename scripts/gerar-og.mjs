/* ==========================================================================
   Gera a imagem de compartilhamento (Open Graph) a partir do SVG fonte.

   POR QUE PNG E NAO SVG: o site antigo apontava og:image para um .svg.
   WhatsApp, Facebook, LinkedIn e Twitter nao renderizam SVG em preview —
   na pratica todo link compartilhado aparecia sem imagem nenhuma.

   POR QUE NAO RODA NO BUILD: o SVG tem texto, e o resultado depende das
   fontes instaladas na maquina. Rodar no build faria a imagem mudar entre
   o seu PC e o servidor. Entao o PNG e gerado uma vez, versionado, e so
   regerado de proposito com `npm run og`.
   ========================================================================== */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

const svg = readFileSync('src/og-fonte.svg');

await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/og.png');

console.log('public/og.png gerado (1200x630)');
