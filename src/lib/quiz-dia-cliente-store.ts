import {
  finalizarParticipacaoQuiz as finalizarServerFn,
  iniciarParticipacaoQuiz as iniciarServerFn,
  listarRankingQuiz as listarRankingServerFn,
  validarSenhaRanking as validarSenhaServerFn,
  type ItemRankingQuiz,
  type ParticipacaoQuiz,
  type ResultadoQuiz,
} from "./quiz-dia-cliente.functions";
import type { RespostasDiaCliente } from "./quiz-dia-cliente";

export type { ItemRankingQuiz, ParticipacaoQuiz, ResultadoQuiz };

export async function iniciarParticipacao(nome: string, empresa: string) {
  return iniciarServerFn({ data: { nome, empresa } });
}

export async function finalizarParticipacao(
  participacao: Pick<ParticipacaoQuiz, "id" | "token">,
  respostas: RespostasDiaCliente,
) {
  return finalizarServerFn({ data: { ...participacao, respostas } });
}

export async function validarSenha(senha: string) {
  return validarSenhaServerFn({ data: { senha } });
}

export async function listarRanking(senha: string) {
  return listarRankingServerFn({ data: { senha } });
}
