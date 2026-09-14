export const EVENTO_DIA_CLIENTE = {
  titulo: "DIA DO CLIENTE",
  chamada: "Você faz parte dessa história",
  marca: "V4 Company",
  data: "15 de setembro",
} as const;

export type AlternativaId = "a" | "b" | "c" | "d";

export interface AlternativaQuiz {
  id: AlternativaId;
  texto: string;
}

export interface PerguntaQuiz {
  id: string;
  categoria: string;
  texto: string;
  opcoes: readonly AlternativaQuiz[];
}

export const PERGUNTAS_DIA_CLIENTE = [
  {
    id: "metodo-v4",
    categoria: "Método V4",
    texto: "Quais são os quatro pilares do Método V4?",
    opcoes: [
      { id: "a", texto: "Aquisição, Engajamento, Monetização e Retenção" },
      { id: "b", texto: "Branding, Conteúdo, Performance e Vendas" },
      { id: "c", texto: "Planejamento, Execução, Análise e Escala" },
      { id: "d", texto: "Tráfego, Alcance, Receita e Recompra" },
    ],
  },
  {
    id: "cac",
    categoria: "Aquisição",
    texto: "Uma empresa investiu R$ 12 mil para conquistar 40 novos clientes. Qual foi o CAC?",
    opcoes: [
      { id: "a", texto: "R$ 200" },
      { id: "b", texto: "R$ 240" },
      { id: "c", texto: "R$ 300" },
      { id: "d", texto: "R$ 480" },
    ],
  },
  {
    id: "ltv",
    categoria: "Monetização",
    texto:
      "Um cliente paga R$ 500 por mês e permanece, em média, por 10 meses. Qual é o LTV simplificado?",
    opcoes: [
      { id: "a", texto: "R$ 500" },
      { id: "b", texto: "R$ 5.000" },
      { id: "c", texto: "R$ 5.500" },
      { id: "d", texto: "R$ 10.000" },
    ],
  },
  {
    id: "ltv-cac",
    categoria: "Unit economics",
    texto: "Se o LTV é R$ 6 mil e o CAC é R$ 2 mil, qual é a relação LTV/CAC?",
    opcoes: [
      { id: "a", texto: "1:3" },
      { id: "b", texto: "2:1" },
      { id: "c", texto: "6:2" },
      { id: "d", texto: "3:1" },
    ],
  },
  {
    id: "churn",
    categoria: "Retenção",
    texto:
      "Uma empresa começou o mês com 200 clientes e perdeu 10 deles. Qual foi o Logo Churn do período?",
    opcoes: [
      { id: "a", texto: "2%" },
      { id: "b", texto: "2,5%" },
      { id: "c", texto: "5%" },
      { id: "d", texto: "10%" },
    ],
  },
  {
    id: "cohort",
    categoria: "Análise de dados",
    texto: "O que uma análise de cohort permite comparar?",
    opcoes: [
      {
        id: "a",
        texto: "Grupos de clientes com uma característica ou período de entrada em comum",
      },
      { id: "b", texto: "Somente campanhas que usaram o mesmo orçamento" },
      { id: "c", texto: "O faturamento da empresa com o de seus concorrentes" },
      { id: "d", texto: "A quantidade de seguidores entre diferentes redes sociais" },
    ],
  },
  {
    id: "roi",
    categoria: "Retorno",
    texto:
      "Uma ação recebeu R$ 10 mil e gerou R$ 40 mil de faturamento incremental. No cálculo simplificado, qual foi o ROI?",
    opcoes: [
      { id: "a", texto: "30%" },
      { id: "b", texto: "300%" },
      { id: "c", texto: "400%" },
      { id: "d", texto: "4%" },
    ],
  },
] as const satisfies readonly PerguntaQuiz[];

export type PerguntaDiaClienteId = (typeof PERGUNTAS_DIA_CLIENTE)[number]["id"];
export type RespostasDiaCliente = Partial<Record<PerguntaDiaClienteId, AlternativaId>>;

export const TOTAL_PERGUNTAS_DIA_CLIENTE = PERGUNTAS_DIA_CLIENTE.length;
