import type { NivelCodigo, Respostas } from "./diagnostico";

// Camada de dados do diagnóstico.
// Hoje persiste no navegador (localStorage). Quando o banco de dados do
// Lovable Cloud estiver habilitado, basta trocar o corpo de salvarResposta e
// listarRespostas por chamadas ao banco, mantendo a mesma interface.
const CHAVE = "diagnostico-ia:respostas";

export interface RespostaRegistro {
  id: string;
  criado_em: string;
  respostas: Respostas;
  pontos_alicerce: number;
  pontos_estrutura: number;
  pontos_acabamento: number;
  nivel: NivelCodigo;
  nome: string;
  whatsapp: string;
  email: string;
  segmento: string;
  faixa_faturamento: string;
  consentimento: boolean;
}

export function listarRespostas(): RespostaRegistro[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const dados = bruto ? (JSON.parse(bruto) as RespostaRegistro[]) : [];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function salvarResposta(registro: Omit<RespostaRegistro, "id" | "criado_em">) {
  const completo: RespostaRegistro = {
    ...registro,
    id: crypto.randomUUID(),
    criado_em: new Date().toISOString(),
  };
  const atual = listarRespostas();
  window.localStorage.setItem(CHAVE, JSON.stringify([...atual, completo]));
  return completo;
}
