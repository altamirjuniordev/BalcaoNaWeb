/* ==========================================================================
   FAQ — fonte unica: a mesma lista alimenta os <details> visiveis e o
   JSON-LD do FAQPage.

   O HTML antigo mantinha as duas listas separadas e elas ja tinham
   divergido (7 perguntas na pagina, 6 no schema). O Google trata schema
   que nao bate com o conteudo visivel como sinal ruim, entao aqui isso
   deixa de ser possivel por construcao.
   ========================================================================== */

export interface Pergunta {
  q: string;
  /** Resposta em texto puro — vale para o <details> e para o JSON-LD. */
  a: string;
}

export const faq: Pergunta[] = [
  {
    q: 'Preciso trocar minha impressora?',
    a: 'A comanda sai na impressora térmica da cozinha, e a configuração fica por nossa conta na implantação.',
  },
  {
    q: 'O cliente precisa instalar alguma coisa?',
    a: 'Não. O cardápio abre no navegador do celular. Sem app, sem cadastro e sem senha.',
  },
  {
    q: 'Serve pro salão ou só pro delivery?',
    a: 'Pros dois, no mesmo sistema: delivery, retirada e mesas com conta acumulada.',
  },
  {
    q: 'E se acabar o papel no meio do movimento?',
    a: 'O painel avisa, guarda as comandas na fila e imprime todas assim que você troca a bobina.',
  },
  {
    q: 'Posso sair quando quiser?',
    a: 'Pode. Não tem contrato de fidelidade.',
  },
];
