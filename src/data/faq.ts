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
    q: 'Quem cadastra o meu cardápio?',
    a: 'Nós. Você envia o cardápio que já usa — PDF, foto, planilha ou o link de outro sistema — e a gente monta tudo: categorias, fotos, preços, complementos, adicionais e opções como meio a meio. Você só confere antes de publicar.',
  },
  {
    q: 'Como o pedido chega até a cozinha?',
    a: 'O pedido entra no seu painel em tempo real, com som de alerta, e a comanda sai impressa automaticamente na impressora térmica da cozinha em cerca de 2 segundos. Se entrarem vários pedidos de uma vez, todas as comandas saem, uma atrás da outra.',
  },
  {
    q: 'E se acabar o papel da impressora?',
    a: 'O painel avisa que o papel acabou e guarda a comanda. Assim que você troca a bobina, ela sai sozinha. Nenhum pedido fica para trás.',
  },
  {
    q: 'Serve para o salão ou só para delivery?',
    a: 'Os dois, no mesmo sistema. No salão você tem as mesas numeradas na tela: o atendente lança o pedido na mesa usando o mesmo cardápio, a conta vai acumulando e fecha em dois toques, escolhendo a forma de pagamento. No delivery e na retirada valem a sua taxa de entrega e o pedido mínimo.',
  },
  {
    q: 'Meu cliente precisa instalar alguma coisa?',
    a: 'Não. O cardápio é um site que abre no navegador do celular, sem app, sem cadastro e sem senha. Você administra tudo pelo navegador também, no computador ou no celular.',
  },
  {
    q: 'Vocês cobram comissão sobre as vendas?',
    a: 'Não. É preço fixo mensal, sem comissão por pedido e sem contrato de fidelidade. O dinheiro da venda vai inteiro para você, porque o pagamento acontece direto entre a sua loja e o cliente.',
  },
  {
    q: 'Consigo pausar um produto que acabou?',
    a: 'Em dois toques, pelo painel. O item some do cardápio na hora, em todos os celulares. Vale para fechar a loja no meio do expediente também, e o horário de funcionamento pode ser diferente em cada dia da semana.',
  },
];
