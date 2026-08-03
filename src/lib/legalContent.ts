/**
 * Conteúdo dos documentos legais — **MINUTA PROVISÓRIA** (revisar com advogado).
 * MODO INDICAÇÃO (2026-07-30): a plataforma apenas CONECTA cliente e profissional;
 * NÃO processa, intermedeia nem retém pagamento — o pagamento é combinado e pago
 * diretamente entre as partes. Espelha api/src/legal/legal-defaults.ts.
 */

export interface LegalSection {
  title: string;
  paragraphs: string[];
}
export interface LegalDoc {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

const COMPANY = 'OrcaLink';
const UPDATED = '2026-07-30';

export const TERMS_DOC: LegalDoc = {
  title: 'Termos de Uso',
  updatedAt: UPDATED,
  intro: `Estes Termos regem o uso da plataforma ${COMPANY}, um serviço de INDICAÇÃO que conecta clientes a profissionais de serviços. Ao usar a plataforma, você concorda com estes Termos.`,
  sections: [
    {
      title: '1. Papel da plataforma — apenas indicação',
      paragraphs: [
        `A ${COMPANY} é uma plataforma de indicação e conexão: aproxima clientes e profissionais e oferece um espaço para negociação, comunicação e agendamento. A ${COMPANY} NÃO é prestadora do serviço, NÃO processa, intermedeia ou retém pagamentos e NÃO é parte do contrato de prestação de serviço.`,
        'A contratação, a execução, a qualidade, a garantia e o PAGAMENTO do serviço são de responsabilidade exclusiva do cliente e do profissional, que negociam diretamente entre si.',
      ],
    },
    {
      title: '2. Conta e cadastro',
      paragraphs: [
        'Você deve ter 18 anos ou mais e fornecer informações verdadeiras. É responsável por manter a segurança da sua conta e por toda atividade realizada nela.',
      ],
    },
    {
      title: '3. Como funciona',
      paragraphs: [
        'O cliente descreve o que precisa; profissionais enviam estimativas e propostas; a negociação e o agendamento ocorrem no chat. Ao aceitar uma proposta, cliente e profissional combinam o serviço e o pagamento DIRETAMENTE entre si. A plataforma registra o acordo para organização, mas não recebe, não guarda e não repassa valores.',
      ],
    },
    {
      title: '4. Pagamento — direto entre as partes',
      paragraphs: [
        `A ${COMPANY} NÃO processa pagamentos. O valor do serviço e a forma de pagamento são combinados e pagos diretamente entre cliente e profissional, pelos meios que eles escolherem. A ${COMPANY} não mantém custódia, não emite cobrança e não tem responsabilidade sobre o pagamento, inadimplência, estorno ou reembolso.`,
      ],
    },
    {
      title: '5. Remuneração da plataforma',
      paragraphs: [
        `A ${COMPANY} poderá cobrar do profissional uma taxa ou comissão pela indicação/uso da plataforma, acordada de forma transparente e paga diretamente à ${COMPANY}. Não há cobrança sobre valores processados pela plataforma, pois a plataforma não processa pagamentos. Impostos e obrigações fiscais do serviço são de responsabilidade do profissional.`,
      ],
    },
    {
      title: '6. Cancelamento e reembolso',
      paragraphs: [
        'Como a plataforma não processa pagamentos, cancelamentos, reembolsos ou ajustes de valor são resolvidos diretamente entre cliente e profissional, conforme o que combinaram. A plataforma pode colaborar como canal de comunicação, sem responsabilidade financeira. (Detalhamento em documento específico.)',
      ],
    },
    {
      title: '7. Conteúdo e uso da plataforma',
      paragraphs: [
        'Não é permitido conteúdo ilícito, ofensivo, enganoso ou fraudulento. O uso deve respeitar o Código de Conduta. A plataforma pode suspender contas que descumpram estes Termos ou a lei.',
      ],
    },
    {
      title: '8. Responsabilidades e limitações',
      paragraphs: [
        `A ${COMPANY} envida esforços para manter a plataforma disponível e segura, mas NÃO garante a contratação, a qualidade, a execução ou o pagamento do serviço. A responsabilidade da ${COMPANY} limita-se à disponibilização do meio de conexão entre as partes; ela não responde por danos decorrentes do serviço prestado ou de acordos financeiros entre cliente e profissional.`,
      ],
    },
    {
      title: '9. Alterações e foro',
      paragraphs: [
        'Estes Termos podem ser atualizados; mudanças relevantes exigem novo aceite. Aplica-se a legislação brasileira, elegendo-se o foro do domicílio do consumidor quando aplicável.',
      ],
    },
  ],
};

export const PRIVACY_DOC: LegalDoc = {
  title: 'Política de Privacidade',
  updatedAt: UPDATED,
  intro: `Esta Política explica como a ${COMPANY} trata seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).`,
  sections: [
    {
      title: '1. Dados que coletamos',
      paragraphs: [
        'Dados de cadastro (nome, e-mail, telefone), endereço/CEP e localização (para conectar você a profissionais da região), CPF/CNPJ do profissional, mensagens do chat e imagens enviadas nos orçamentos. A plataforma NÃO coleta nem armazena dados de pagamento (cartão, conta bancária), pois não processa pagamentos.',
      ],
    },
    {
      title: '2. Finalidades e bases legais',
      paragraphs: [
        'Usamos os dados para operar a plataforma de indicação (conectar as partes), cumprir obrigações legais e por legítimo interesse (segurança e melhoria do serviço). Comunicações opcionais dependem do seu consentimento.',
      ],
    },
    {
      title: '3. Compartilhamento',
      paragraphs: [
        'Compartilhamos dados com operadores necessários à operação (provedor de notificações e de e-mail). Entre cliente e profissional, compartilhamos apenas o necessário para viabilizar o contato e a prestação do serviço.',
      ],
    },
    {
      title: '4. Transferência internacional',
      paragraphs: [
        'Alguns provedores processam dados em servidores fora do Brasil, com salvaguardas adequadas.',
      ],
    },
    {
      title: '5. Retenção e exclusão',
      paragraphs: [
        'Mantemos os dados pelo tempo necessário às finalidades e obrigações legais. Você pode solicitar a exclusão da sua conta e dos seus dados, ressalvadas as informações que a lei exige reter.',
      ],
    },
    {
      title: '6. Seus direitos',
      paragraphs: [
        'Você pode acessar, corrigir, exportar e excluir seus dados, além de revogar consentimentos. Para exercê-los, use o canal de contato da plataforma.',
      ],
    },
    {
      title: '7. Cookies e segurança',
      paragraphs: [
        'Usamos armazenamento local para manter sua sessão e notificações. Adotamos medidas de segurança (criptografia em trânsito, controle de acesso) para proteger seus dados.',
      ],
    },
    {
      title: '8. Encarregado (DPO) e contato',
      paragraphs: [
        'Dúvidas sobre privacidade e o exercício de direitos podem ser encaminhadas pelo canal de contato da plataforma, direcionadas ao Encarregado de Dados.',
      ],
    },
  ],
};

export const CONDUCT_DOC: LegalDoc = {
  title: 'Código de Conduta',
  updatedAt: UPDATED,
  intro: `Este Código estabelece as regras de convivência e uso da plataforma ${COMPANY} para clientes e profissionais. O objetivo é manter um ambiente seguro, honesto e respeitoso para todos.`,
  sections: [
    {
      title: '1. Respeito e comunicação',
      paragraphs: [
        'Trate todos com cordialidade e profissionalismo. Não são tolerados assédio, ameaças, discriminação (por raça, gênero, religião, orientação, deficiência ou qualquer outra), discurso de ódio ou linguagem ofensiva no chat ou em qualquer interação.',
      ],
    },
    {
      title: '2. Informações verdadeiras',
      paragraphs: [
        'Forneça dados reais e atualizados (identidade, contato, endereço, descrição do serviço). Fotos e descrições devem representar fielmente o serviço ou a necessidade. Informações falsas podem levar à suspensão.',
      ],
    },
    {
      title: '3. Negocie de boa-fé',
      paragraphs: [
        'Use o chat da plataforma para negociar e alinhar o serviço de forma clara e honesta. O pagamento é combinado diretamente entre cliente e profissional — registre o combinado (valor, forma e prazos) para evitar mal-entendidos.',
      ],
    },
    {
      title: '4. Condutas proibidas',
      paragraphs: [
        'É proibido: publicar conteúdo ilícito, fraudulento ou enganoso; usar a plataforma para fins diferentes da contratação de serviços; criar contas falsas ou múltiplas para manipular avaliações; e compartilhar dados de terceiros sem autorização.',
      ],
    },
    {
      title: '5. Segurança e privacidade',
      paragraphs: [
        'Não solicite nem compartilhe senhas, códigos de acesso ou dados sensíveis fora dos fluxos oficiais. Use os dados da outra parte apenas para viabilizar o serviço.',
      ],
    },
    {
      title: '6. Avaliações honestas',
      paragraphs: [
        'As avaliações devem refletir a experiência real. É proibido comprar, trocar, coagir ou fraudar avaliações.',
      ],
    },
    {
      title: '7. Denúncias',
      paragraphs: [
        `Situações de descumprimento podem ser reportadas pelo canal de contato. Como a ${COMPANY} não é parte do serviço nem do pagamento, sua atuação limita-se a moderar o uso da plataforma (advertir, suspender ou remover conteúdo/conta).`,
      ],
    },
    {
      title: '8. Consequências',
      paragraphs: [
        'O descumprimento deste Código pode resultar em advertência, suspensão temporária ou encerramento definitivo da conta, sem prejuízo das medidas legais cabíveis.',
      ],
    },
  ],
};

export const REFUND_DOC: LegalDoc = {
  title: 'Política de Cancelamento e Reembolso',
  updatedAt: UPDATED,
  intro: `Como a ${COMPANY} é uma plataforma de indicação e NÃO processa pagamentos, cancelamentos e reembolsos são resolvidos diretamente entre cliente e profissional.`,
  sections: [
    {
      title: '1. A plataforma não retém valores',
      paragraphs: [
        `A ${COMPANY} não recebe, não guarda e não repassa o valor do serviço. Não há custódia nem estorno pela plataforma: qualquer devolução ou ajuste é acordado e realizado diretamente entre as partes.`,
      ],
    },
    {
      title: '2. Cancelamento da negociação',
      paragraphs: [
        'Enquanto o serviço não é combinado, cliente e profissional podem encerrar a conversa livremente, sem custo.',
      ],
    },
    {
      title: '3. Cancelamento após o acordo',
      paragraphs: [
        'Depois de combinado o serviço, o cancelamento e eventual reembolso seguem o que cliente e profissional acordaram entre si. Recomenda-se registrar as condições no chat.',
      ],
    },
    {
      title: '4. Direito de arrependimento (CDC art. 49)',
      paragraphs: [
        'Em compras a distância, o consumidor pode se arrepender em até 7 (sete) dias corridos, tratando diretamente com o profissional contratado, ressalvados os serviços já iniciados a seu pedido ou de natureza urgente.',
      ],
    },
    {
      title: '5. Problemas na execução',
      paragraphs: [
        'Divergências sobre qualidade, prazo ou valor são resolvidas entre cliente e profissional. A plataforma pode servir de canal de comunicação, sem responsabilidade financeira.',
      ],
    },
    {
      title: '6. Como registrar',
      paragraphs: [
        'Mantenha o combinado (valor, forma de pagamento, prazos e condições de cancelamento) registrado no chat da plataforma, o que ajuda a comprovar o acordo entre as partes.',
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<'terms' | 'privacy' | 'conduct' | 'refund', LegalDoc> = {
  terms: TERMS_DOC,
  privacy: PRIVACY_DOC,
  conduct: CONDUCT_DOC,
  refund: REFUND_DOC,
};

export type LegalDocKey = keyof typeof LEGAL_DOCS;

/** Rota pública de cada documento (usada pelo índice `/legal`). */
export const LEGAL_ROUTES: Record<LegalDocKey, string> = {
  terms: '/termos',
  privacy: '/privacidade',
  conduct: '/conduta',
  refund: '/reembolso',
};
