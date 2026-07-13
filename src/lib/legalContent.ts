/**
 * Conteúdo dos documentos legais — **MINUTA PROVISÓRIA**.
 * Estrutura baseada em docs/17. O texto final deve ser revisado por advogado
 * antes do lançamento; ao publicar a versão definitiva, faça o "bump" de
 * TERMS_VERSION no backend (api/src/auth/terms.constants.ts) para forçar re-aceite.
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

export const TERMS_DOC: LegalDoc = {
  title: 'Termos de Uso',
  updatedAt: '2026-07-13',
  intro: `Estes Termos regem o uso da plataforma ${COMPANY}, que conecta clientes a profissionais de serviços. Ao usar a plataforma, você concorda com estes Termos.`,
  sections: [
    {
      title: '1. Papel da plataforma',
      paragraphs: [
        `A ${COMPANY} é uma intermediadora: aproxima clientes e profissionais e facilita a negociação, o pagamento e a comunicação. A ${COMPANY} não é a prestadora do serviço contratado — a execução, a qualidade e a garantia são responsabilidade do profissional.`,
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
        'O cliente solicita um orçamento; profissionais enviam estimativas e propostas; a negociação e o agendamento ocorrem no chat. Ao aceitar uma proposta final, o cliente paga pela plataforma e o serviço é agendado e executado.',
      ],
    },
    {
      title: '4. Pagamentos e custódia',
      paragraphs: [
        'O pagamento é processado por gateway parceiro e mantido em custódia. O valor só é repassado ao profissional após a conclusão do serviço ser confirmada (pelo cliente ou por mediação da plataforma).',
      ],
    },
    {
      title: '5. Comissão e taxas',
      paragraphs: [
        `A ${COMPANY} retém uma comissão sobre os serviços concluídos, informada de forma transparente. Impostos e obrigações fiscais do serviço são de responsabilidade do profissional.`,
      ],
    },
    {
      title: '6. Cancelamento e reembolso',
      paragraphs: [
        'Cancelamentos antes do pagamento são livres. Após o pagamento, aplicam-se a Política de Cancelamento e Reembolso e a mediação da plataforma. (Detalhamento em documento específico.)',
      ],
    },
    {
      title: '7. Uso da plataforma e anti-desintermediação',
      paragraphs: [
        'Fechar o serviço "por fora" para burlar a comissão viola estes Termos e pode levar à suspensão da conta. Não é permitido conteúdo ilícito, ofensivo ou fraudulento.',
      ],
    },
    {
      title: '8. Responsabilidades e limitações',
      paragraphs: [
        `A ${COMPANY} envida esforços para manter a plataforma disponível e segura, mas não garante resultado do serviço executado pelo profissional. A responsabilidade da plataforma limita-se à intermediação.`,
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
  updatedAt: '2026-07-13',
  intro: `Esta Política explica como a ${COMPANY} trata seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).`,
  sections: [
    {
      title: '1. Dados que coletamos',
      paragraphs: [
        'Dados de cadastro (nome, e-mail, telefone), endereço/CEP e localização (para conectar você a profissionais da região), CPF/CNPJ do profissional, mensagens do chat, imagens enviadas nos orçamentos e dados de pagamento (tokenizados pelo gateway — não armazenamos dados de cartão).',
      ],
    },
    {
      title: '2. Finalidades e bases legais',
      paragraphs: [
        'Usamos os dados para executar o contrato (viabilizar orçamentos, pagamento e comunicação), cumprir obrigações legais, e por legítimo interesse (segurança e melhoria do serviço). Comunicações opcionais dependem do seu consentimento.',
      ],
    },
    {
      title: '3. Compartilhamento',
      paragraphs: [
        'Compartilhamos dados com operadores necessários à operação: gateway de pagamento (Asaas), provedor de notificações (Google/Firebase) e provedor de e-mail. Entre cliente e profissional, compartilhamos apenas o necessário para a prestação do serviço.',
      ],
    },
    {
      title: '4. Transferência internacional',
      paragraphs: [
        'Alguns provedores (ex.: Google/Firebase) processam dados em servidores fora do Brasil, com salvaguardas adequadas.',
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

export const LEGAL_DOCS: Record<'terms' | 'privacy', LegalDoc> = {
  terms: TERMS_DOC,
  privacy: PRIVACY_DOC,
};
