import { salvarResposta as salvarServerFn, listarRespostas as listarServerFn } from "./respostas.functions";
import type { RespostaRegistro } from "./respostas.functions";

export type { RespostaRegistro };

export async function listarRespostas(): Promise<RespostaRegistro[]> {
  return listarServerFn();
}

export async function salvarResposta(
  registro: Omit<RespostaRegistro, "id" | "criado_em">,
): Promise<RespostaRegistro> {
  const { id } = await salvarServerFn({ data: registro });
  const todas = await listarServerFn();
  const inserida = todas.find((r) => r.id === id);
  if (!inserida) throw new Error("Resposta salva não foi encontrada após inserção");
  return inserida;
}
