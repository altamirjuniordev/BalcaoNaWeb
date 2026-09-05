/* ==========================================================================
   Gera a imagem de compartilhamento (Open Graph) em public/og.png.

   POR QUE PNG E NAO SVG: o site antigo apontava og:image para um .svg.
   WhatsApp, Facebook, LinkedIn e Twitter nao renderizam SVG em preview —
   na pratica todo link compartilhado aparecia sem imagem nenhuma.

   POR QUE O LOGO E COMPOSTO E NAO DESENHADO NO SVG: o texto do SVG depende
   das fontes instaladas na maquina que roda o script, o que faria a imagem
   mudar entre o seu PC e o servidor. O logo e um PNG, entao sai igual em
   qualquer lugar. O texto que sobrou no SVG e secundario e tolera a fonte
   de sistema.

   POR QUE NAO RODA NO BUILD: pelo mesmo motivo. O PNG e gerado de proposito
   com `npm run og` e commitado.
   ========================================================================== */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

const LOGO = 'public/img/logo.png';   // variante de texto escuro (fundo claro)
const LARGURA_LOGO = 384;

const fundo = await sharp(readFileSync('src/og-fonte.svg'), { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .toBuffer();

const logo = await sharp(LOGO).resize({ width: LARGURA_LOGO }).toBuffer();

await sharp(fundo)
  .composite([{ input: logo, top: 108, left: 82 }])
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/og.png');

console.log('public/og.png gerado (1200x630)');
