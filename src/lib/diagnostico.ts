export type PilarId = "alicerce" | "estrutura" | "acabamento";

export interface Pergunta {
  id: string;
  pilar: PilarId;
  texto: string;
  opcoes: [string, string, string];
  acao: string;
}

export const PILARES: { id: PilarId; numero: number; nome: string; legenda: string }[] = [
  {
    id: "alicerce",
    numero: 1,
    nome: "Alicerce",
    legenda: "A base do negócio. Sem ela, nada se sustenta.",
  },
  {
    id: "estrutura",
    numero: 2,
    nome: "Estrutura",
    legenda: "Os números que sustentam as decisões.",
  },
  {
    id: "acabamento",
    numero: 3,
    nome: "Acabamento",
    legenda: "Tecnologia e IA operando de verdade.",
  },
];

export const PERGUNTAS: Pergunta[] = [
  {
    id: "p1",
    pilar: "alicerce",
    texto: "Sua empresa tem site próprio, atualizado, que representa bem o negócio hoje?",
    opcoes: ["Sim", "Tem, mas está desatualizado", "Não, só redes sociais"],
    acao: "Colocar de pé um site próprio que represente o negócio hoje",
  },
  {
    id: "p2",
    pilar: "alicerce",
    texto:
      "O caminho do seu cliente, do primeiro contato até a compra e o pós-venda, está desenhado em algum lugar?",
    opcoes: [
      "Sim, documentado e a equipe segue",
      "Existe, mas só na cabeça",
      "Cada venda acontece de um jeito",
    ],
    acao: "Desenhar a jornada do cliente, do primeiro contato ao pós-venda",
  },
  {
    id: "p3",
    pilar: "alicerce",
    texto: "Os processos principais (como atende, vende, entrega, cobra) estão documentados?",
    opcoes: ["Sim", "Alguns", "Nada documentado"],
    acao: "Documentar os processos principais da operação",
  },
  {
    id: "p4",
    pilar: "alicerce",
    texto:
      "Se a pessoa mais importante da operação sair amanhã, a empresa continua rodando normalmente?",
    opcoes: ["Sim, está tudo registrado", "Roda, mas com dificuldade", "Trava"],
    acao: "Registrar o conhecimento crítico para a operação não depender de uma pessoa",
  },
  {
    id: "p5",
    pilar: "alicerce",
    texto:
      "Os materiais da marca (identidade visual, tom de voz, apresentações) estão organizados em um lugar só?",
    opcoes: ["Sim", "Existem, mas espalhados", "Não existem formalizados"],
    acao: "Centralizar e formalizar os materiais da marca em um único lugar",
  },
  {
    id: "p6",
    pilar: "estrutura",
    texto: "Você sabe quanto custa trazer um cliente novo (CAC)?",
    opcoes: ["Sei o número", "Sei calcular, mas não acompanho", "Nunca calculei"],
    acao: "Calcular e acompanhar o custo de aquisição de cliente (CAC)",
  },
  {
    id: "p7",
    pilar: "estrutura",
    texto: "Você sabe quanto um cliente vale ao longo do tempo de relacionamento (LTV)?",
    opcoes: ["Sei o número", "Sei calcular, mas não acompanho", "Nunca calculei"],
    acao: "Calcular e acompanhar o valor do cliente no tempo (LTV)",
  },
  {
    id: "p8",
    pilar: "estrutura",
    texto: "Você conhece a margem de cada produto ou serviço que vende?",
    opcoes: ["Sim, por item", "Só a margem geral", "Não sei ao certo"],
    acao: "Abrir a margem de cada produto ou serviço, item por item",
  },
  {
    id: "p9",
    pilar: "estrutura",
    texto: "De onde saem os números da sua empresa?",
    opcoes: [
      "Relatórios automáticos de sistema",
      "Planilhas montadas na mão",
      "Não acompanho números",
    ],
    acao: "Tirar os números da planilha manual e gerar relatórios automáticos",
  },
  {
    id: "p10",
    pilar: "estrutura",
    texto: "Quando você toma uma decisão importante, ela é baseada em quê?",
    opcoes: ["Indicadores", "Mistura de número e intuição", "Feeling e experiência"],
    acao: "Definir indicadores que orientem as decisões importantes",
  },
  {
    id: "p11",
    pilar: "acabamento",
    texto:
      "Existe alguma automação rodando na empresa (follow-up automático, integração entre sistemas, robôs de tarefa)?",
    opcoes: ["Sim, mais de uma", "Uma ou outra", "Nenhuma"],
    acao: "Colocar a primeira automação para rodar na operação",
  },
  {
    id: "p12",
    pilar: "acabamento",
    texto: "Como a sua equipe usa IA hoje?",
    opcoes: [
      "Com padrão e diretrizes definidas pela empresa",
      "Cada um usa por conta própria",
      "Não usa",
    ],
    acao: "Definir um padrão de uso de IA para toda a equipe",
  },
  {
    id: "p13",
    pilar: "acabamento",
    texto: "Seus sistemas conversam entre si (CRM, WhatsApp, planilhas, financeiro)?",
    opcoes: ["Integrados", "Parcialmente", "Cada um é uma ilha"],
    acao: "Integrar os sistemas para os dados circularem sem retrabalho",
  },
  {
    id: "p14",
    pilar: "acabamento",
    texto:
      "Existe alguma regra sobre o que pode ou não ser colocado em ferramentas de IA (dados de cliente, informações internas)?",
    opcoes: ["Sim, formalizada", "Combinado informal", "Nunca pensamos nisso"],
    acao: "Formalizar uma política de dados e uso seguro de IA",
  },
  {
    id: "p15",
    pilar: "acabamento",
    texto: "Vocês já tentaram automatizar ou implantar alguma ferramenta que não vingou?",
    opcoes: [
      "Implantamos e funciona até hoje",
      "Tentamos e morreu no caminho",
      "Nunca tentamos",
    ],
    acao: "Retomar uma implantação com método, para não morrer no caminho",
  },
];

export const NIVEIS = {
  V0: {
    codigo: "V0",
    nome: "Terreno",
    frase: "Sua empresa ainda está no terreno: antes da IA, é preciso construir a base.",
  },
  V1: {
    codigo: "V1",
    nome: "Alicerce",
    frase: "Você tem a base, mas ainda decide no escuro: o próximo passo é dominar seus números.",
  },
  V2: {
    codigo: "V2",
    nome: "Estrutura",
    frase: "Base sólida e números na mão: sua empresa está pronta para tecnologia e IA de verdade.",
  },
  V3: {
    codigo: "V3",
    nome: "Acabamento",
    frase: "Sua empresa está entre as poucas prontas para operar com IA de forma estruturada.",
  },
} as const;

export type NivelCodigo = keyof typeof NIVEIS;

export const FAIXAS_FATURAMENTO = [
  "Até R$ 50 mil",
  "R$ 50 a 200 mil",
  "R$ 200 mil a 1 milhão",
  "Acima de R$ 1 milhão",
] as const;

export type Respostas = Record<string, number>;

export function pontuacaoPilar(respostas: Respostas, pilar: PilarId): number {
  return PERGUNTAS.filter((p) => p.pilar === pilar).reduce(
    (soma, p) => soma + (respostas[p.id] ?? 0),
    0,
  );
}

export function calcularNivel(alicerce: number, estrutura: number, acabamento: number): NivelCodigo {
  if (alicerce < 6) return "V0";
  if (estrutura < 6) return "V1";
  if (acabamento < 6) return "V2";
  return "V3";
}

export function proximosPassos(respostas: Respostas): string[] {
  return [...PERGUNTAS]
    .map((p, indice) => ({ p, indice, valor: respostas[p.id] ?? 0 }))
    .sort((a, b) => a.valor - b.valor || a.indice - b.indice)
    .slice(0, 3)
    .map((item) => item.p.acao);
}
