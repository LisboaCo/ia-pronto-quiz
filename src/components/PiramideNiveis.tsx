import { useEffect, useState } from "react";

import { NIVEIS } from "@/lib/diagnostico";

export interface FaixaPiramide {
  codigo: "V0" | "V1" | "V2" | "V3";
  quantidade: number;
  percentual: number;
}

/** Ordem visual: topo é o nível mais maduro. */
const ORDEM: FaixaPiramide["codigo"][] = ["V3", "V2", "V1", "V0"];

/** Larguras dos degraus, do topo para a base. */
const LARGURA = [34, 56, 78, 100];

/** Recorte de cada degrau para as laterais formarem uma pirâmide contínua. */
const RECORTE = [
  "polygon(50% 0, 100% 100%, 0 100%)",
  "polygon(19.6% 0, 80.4% 0, 100% 100%, 0 100%)",
  "polygon(14.1% 0, 85.9% 0, 100% 100%, 0 100%)",
  "polygon(11% 0, 89% 0, 100% 100%, 0 100%)",
];

/** Topo em vermelho da marca, degraus inferiores em escala de cinza clareando. */
const FUNDO = [
  "var(--v4-red)",
  "#c9cbd1",
  "#dcdee3",
  "#eceef1",
];

const TEXTO = ["#ffffff", "var(--ink)", "var(--ink)", "var(--ink)"];

const COR_DADO = ["var(--v4-red)", "var(--ink)", "var(--ink)", "var(--ink-muted)"];

export function PiramideNiveis({ faixas }: { faixas: FaixaPiramide[] }) {
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const mapa = new Map(faixas.map((f) => [f.codigo, f]));

  return (
    <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col items-center gap-1">
        {ORDEM.map((codigo, i) => (
          <div
            key={codigo}
            className="flex items-end justify-center transition-all duration-700 ease-out"
            style={{
              width: animado ? `${LARGURA[i]}%` : "18%",
              height: i === 0 ? 104 : 76,
              background: FUNDO[i],
              clipPath: RECORTE[i],
            }}
          >
            <div
              className="pb-3 text-center leading-tight"
              style={{ color: TEXTO[i] }}
            >
              <div
                className="text-[11px] font-semibold uppercase"
                style={{ letterSpacing: "0.12em", opacity: 0.75 }}
              >
                Nível {codigo}
              </div>
              <div
                className="text-lg font-bold whitespace-nowrap"
                style={{ letterSpacing: "-0.01em" }}
              >
                {NIVEIS[codigo].nome}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full shrink-0 space-y-5 md:w-[38%]">
        {ORDEM.map((codigo, i) => {
          const faixa = mapa.get(codigo);
          const percentual = faixa?.percentual ?? 0;
          const quantidade = faixa?.quantidade ?? 0;
          const cor = COR_DADO[i];

          return (
            <div key={codigo}>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-5xl leading-none font-bold tabular-nums"
                  style={{ color: cor, letterSpacing: "-0.03em" }}
                >
                  {percentual}%
                </span>
                <span className="text-sm font-semibold text-ink-muted">
                  {codigo}
                </span>
                <span className="text-sm font-medium text-ink-muted">
                  {quantidade} {quantidade === 1 ? "resposta" : "respostas"}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animado ? `${percentual}%` : "0%",
                    background: i === 0 ? "var(--v4-red)" : "var(--ink)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
