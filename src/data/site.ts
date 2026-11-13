/* ==========================================================================
   Configuracao do site — fonte unica de verdade.
   Trocar numero de WhatsApp, dominio ou textos institucionais so aqui.
   ========================================================================== */

export const site = {
  nome: 'Balcão na Web',
  dominio: 'https://balcaonaweb.com.br',

  /* O sistema roda fora desta pagina. Este e o endereco real do painel.
     De proposito nao ha URL de loja de demonstracao: a pagina nao manda
     visitante para o cardapio de um cliente ativo. */
  urlApp: 'https://app.balcaonaweb.com.br',

  /* WhatsApp: 55 + DDD + numero, so digitos. Vazio = os botoes viram
     ancora interna, a pagina funciona mas nao converte. */
  whatsapp: '5581995478511',   // 55 + 81 + 995478511
  /* Tambem e a primeira fala da conversa do fechamento (CtaFinal.astro). */
  mensagemWhatsapp:
    'Oi! Vi o site e quero ver o Balcão na Web funcionando na minha loja.',

  /* Local — alimenta o schema LocalBusiness e o SEO local. */
  cidade: 'Recife',
  estado: 'PE',
  estadoNome: 'Pernambuco',
  pais: 'BR',

  /* Redes: preencher alimenta o sameAs do schema, que ajuda o Google a
     ligar o site a entidade da marca. Vazio fica de fora do JSON-LD. */
  instagram: '',
  facebook: '',
} as const;

/** Link de contato: WhatsApp quando ha numero, ancora interna quando nao ha.
    `mensagem` troca o texto que ja vai escrito na conversa — o botao da
    secao de preco, por exemplo, abre perguntando o valor. */
export function linkContato(
  mensagem: string = site.mensagemWhatsapp,
): { href: string; externo: boolean } {
  const numero = site.whatsapp.replace(/\D/g, '');
  if (!numero) return { href: '#preco', externo: false };

  const texto = encodeURIComponent(mensagem);
  return { href: `https://wa.me/${numero}?text=${texto}`, externo: true };
}
