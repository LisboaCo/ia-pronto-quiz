import { createServerFn } from "@tanstack/react-start";

import {
  PERGUNTAS_DIA_CLIENTE,
  TOTAL_PERGUNTAS_DIA_CLIENTE,
  type AlternativaId,
  type PerguntaDiaClienteId,
  type RespostasDiaCliente,
} from "./quiz-dia-cliente";

export interface ParticipacaoQuiz {
  id: string;
  token: string;
  nome: string;
  empresa: string;
}

export interface ResultadoQuiz {
  pontuacao: number;
  total: number;
  duracao_ms: number;
}

export interface ItemRankingQuiz {
  id: string;
  nome: string;
  empresa: string;
  pontuacao: number;
  duracao_ms: number;
  concluido_em: string;
}

interface RegistroPreview {
  id: string;
  token: string;
  evento: string;
  nome: string;
  empresa: string;
  iniciado_em: number;
  respostas?: RespostasDiaCliente;
  pontuacao?: number;
  duracao_ms?: number;
  concluido_em?: string;
}

const GABARITO: Record<PerguntaDiaClienteId, AlternativaId> = {
  "metodo-v4": "a",
  cac: "c",
  ltv: "b",
  "ltv-cac": "d",
  churn: "c",
  cohort: "a",
  roi: "b",
};

function getBaseUrl() {
  const url = process.env["POSTGREST_DASHBOARD_TVSIM"];
  if (!url) {
    if (process.env["NODE_ENV"] !== "production") return null;
    throw new Error("POSTGREST_DASHBOARD_TVSIM não configurado");
  }
  const clean = url.replace(/\/$/, "");
  return clean.startsWith("http://") || clean.startsWith("https://") ? clean : `https://${clean}`;
}

function getRegistrosPreview() {
  const escopo = globalThis as typeof globalThis & {
    __v4DiaClientePreview?: RegistroPreview[];
  };
  escopo.__v4DiaClientePreview ??= [];
  return escopo.__v4DiaClientePreview;
}

function getEventoId() {
  return process.env["QUIZ_DIA_CLIENTE_EVENTO_ID"] ?? "dia-do-cliente-2026-09-15";
}

function getSenhaRanking() {
  return process.env["RANKING_DIA_CLIENTE_SENHA"] ?? "evento2026";
}

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function erroDaResposta(response: Response, fallback: string): Promise<Error> {
  const texto = await response.text().catch(() => "");
  let mensagem = texto;

  try {
    const corpo = JSON.parse(texto) as { message?: string };
    mensagem = corpo.message ?? texto;
  } catch {
    // Mantém a resposta textual quando ela não é JSON.
  }

  if (response.status === 409 || /já existe|duplicad|unique/i.test(mensagem)) {
    return new Error(
      "Já existe uma participação com este nome e esta empresa. Cada cliente pode responder uma vez.",
    );
  }

  return new Error(`${fallback}${mensagem ? `: ${mensagem}` : ""}`);
}

function limparIdentificacao(valor: string, limite: number) {
  return valor.trim().replace(/\s+/g, " ").slice(0, limite);
}

function chaveIdentificacao(valor: string) {
  return limparIdentificacao(valor, 160).toLocaleLowerCase("pt-BR");
}

function validarRespostas(respostas: RespostasDiaCliente) {
  const normalizadas = {} as Record<PerguntaDiaClienteId, AlternativaId>;

  for (const pergunta of PERGUNTAS_DIA_CLIENTE) {
    const resposta = respostas[pergunta.id];
    if (!resposta || !pergunta.opcoes.some((opcao) => opcao.id === resposta)) {
      throw new Error("Responda todas as perguntas antes de concluir.");
    }
    normalizadas[pergunta.id] = resposta;
  }

  return normalizadas;
}

export const iniciarParticipacaoQuiz = createServerFn({ method: "POST" })
  .validator((data: { nome: string; empresa: string }) => data)
  .handler(async ({ data }) => {
    const nome = limparIdentificacao(data.nome, 120);
    const empresa = limparIdentificacao(data.empresa, 160);

    if (nome.length < 2) throw new Error("Informe seu nome.");
    if (empresa.length < 2) throw new Error("Informe o nome da empresa.");

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      const registros = getRegistrosPreview();
      const duplicada = registros.some(
        (registro) =>
          registro.evento === getEventoId() &&
          chaveIdentificacao(registro.nome) === chaveIdentificacao(nome) &&
          chaveIdentificacao(registro.empresa) === chaveIdentificacao(empresa),
      );
      if (duplicada) {
        throw new Error(
          "Já existe uma participação com este nome e esta empresa. Cada cliente pode responder uma vez.",
        );
      }

      const participacao: ParticipacaoQuiz = {
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        nome,
        empresa,
      };
      registros.push({
        ...participacao,
        evento: getEventoId(),
        iniciado_em: Date.now(),
      });
      return participacao;
    }

    const response = await fetch(`${baseUrl}/rpc/iniciar_quiz_dia_cliente`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        p_evento: getEventoId(),
        p_nome: nome,
        p_empresa: empresa,
      }),
    });

    if (!response.ok) throw await erroDaResposta(response, "Não foi possível iniciar o quiz");

    const participacao = (await response.json()) as { id: string; token: string };
    return { ...participacao, nome, empresa } satisfies ParticipacaoQuiz;
  });

export const finalizarParticipacaoQuiz = createServerFn({ method: "POST" })
  .validator((data: { id: string; token: string; respostas: RespostasDiaCliente }) => data)
  .handler(async ({ data }) => {
    const respostas = validarRespostas(data.respostas);
    const pontuacao = PERGUNTAS_DIA_CLIENTE.reduce(
      (total, pergunta) => total + (respostas[pergunta.id] === GABARITO[pergunta.id] ? 1 : 0),
      0,
    );

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      const registro = getRegistrosPreview().find(
        (item) => item.id === data.id && item.token === data.token,
      );
      if (!registro) throw new Error("Participação inválida.");

      if (registro.pontuacao === undefined || registro.duracao_ms === undefined) {
        registro.respostas = respostas;
        registro.pontuacao = pontuacao;
        registro.duracao_ms = Math.max(0, Date.now() - registro.iniciado_em);
        registro.concluido_em = new Date().toISOString();
      }

      return {
        pontuacao: registro.pontuacao,
        duracao_ms: registro.duracao_ms,
        total: TOTAL_PERGUNTAS_DIA_CLIENTE,
      } satisfies ResultadoQuiz;
    }

    const response = await fetch(`${baseUrl}/rpc/finalizar_quiz_dia_cliente`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        p_id: data.id,
        p_token: data.token,
        p_respostas: respostas,
        p_pontuacao: pontuacao,
      }),
    });

    if (!response.ok) throw await erroDaResposta(response, "Não foi possível enviar as respostas");

    const resultado = (await response.json()) as { pontuacao: number; duracao_ms: number };
    return {
      pontuacao: Number(resultado.pontuacao),
      duracao_ms: Number(resultado.duracao_ms),
      total: TOTAL_PERGUNTAS_DIA_CLIENTE,
    } satisfies ResultadoQuiz;
  });

export const validarSenhaRanking = createServerFn({ method: "POST" })
  .validator((data: { senha: string }) => data)
  .handler(async ({ data }) => ({ valida: data.senha === getSenhaRanking() }));

export const listarRankingQuiz = createServerFn({ method: "POST" })
  .validator((data: { senha: string }) => data)
  .handler(async ({ data }) => {
    if (data.senha !== getSenhaRanking()) throw new Error("Acesso não autorizado.");

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return getRegistrosPreview()
        .filter(
          (registro) =>
            registro.evento === getEventoId() &&
            registro.pontuacao !== undefined &&
            registro.duracao_ms !== undefined &&
            registro.concluido_em,
        )
        .map((registro): ItemRankingQuiz => ({
          id: registro.id,
          nome: registro.nome,
          empresa: registro.empresa,
          pontuacao: registro.pontuacao!,
          duracao_ms: registro.duracao_ms!,
          concluido_em: registro.concluido_em!,
        }))
        .sort(
          (a, b) =>
            b.pontuacao - a.pontuacao ||
            a.duracao_ms - b.duracao_ms ||
            a.concluido_em.localeCompare(b.concluido_em),
        );
    }

    const params = new URLSearchParams({
      evento: `eq.${getEventoId()}`,
      select: "id,nome,empresa,pontuacao,duracao_ms,concluido_em",
      order: "pontuacao.desc,duracao_ms.asc,concluido_em.asc",
    });
    const response = await fetch(`${baseUrl}/quiz_dia_cliente_ranking?${params}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) throw await erroDaResposta(response, "Não foi possível carregar o ranking");

    const itens = (await response.json()) as ItemRankingQuiz[];
    return itens.map((item) => ({
      ...item,
      pontuacao: Number(item.pontuacao),
      duracao_ms: Number(item.duracao_ms),
    }));
  });
