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

export const CONDUCT_DOC: LegalDoc = {
  title: 'Código de Conduta',
  updatedAt: '2026-07-13',
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
      title: '3. Mantenha a negociação na plataforma',
      paragraphs: [
        `A negociação, o agendamento, o pagamento e a comunicação devem ocorrer dentro da ${COMPANY}. Combinar o serviço "por fora" para evitar a comissão (desintermediação) desprotege ambas as partes — sem custódia do pagamento, sem histórico e sem mediação — e viola este Código.`,
      ],
    },
    {
      title: '4. Condutas proibidas',
      paragraphs: [
        'É proibido: publicar conteúdo ilícito, fraudulento ou enganoso; usar a plataforma para fins diferentes da contratação de serviços; tentar burlar taxas ou o sistema de pagamento; criar contas falsas ou múltiplas para manipular avaliações; e compartilhar dados de terceiros sem autorização.',
      ],
    },
    {
      title: '5. Segurança e privacidade',
      paragraphs: [
        'Não solicite nem compartilhe senhas, códigos de acesso ou dados sensíveis fora dos fluxos oficiais. Use os dados da outra parte apenas para viabilizar o serviço contratado.',
      ],
    },
    {
      title: '6. Avaliações honestas',
      paragraphs: [
        'As avaliações devem refletir a experiência real. É proibido comprar, trocar, coagir ou fraudar avaliações.',
      ],
    },
    {
      title: '7. Denúncias e mediação',
      paragraphs: [
        `Situações de descumprimento podem ser reportadas pelo canal de contato. A ${COMPANY} pode mediar conflitos e, quando necessário, reter ou devolver valores em custódia conforme as políticas aplicáveis.`,
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

export const LEGAL_DOCS: Record<'terms' | 'privacy' | 'conduct', LegalDoc> = {
  terms: TERMS_DOC,
  privacy: PRIVACY_DOC,
  conduct: CONDUCT_DOC,
};

export type LegalDocKey = keyof typeof LEGAL_DOCS;
