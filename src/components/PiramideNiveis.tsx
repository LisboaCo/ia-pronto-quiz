import { useEffect, useState } from "react";

import { NIVEIS } from "@/lib/diagnostico";

export interface FaixaPiramide {
  codigo: "V0" | "V1" | "V2" | "V3";
  quantidade: number;
  percentual: number;
}

/** Ordem visual: topo é o nível mais maduro. */
const ORDEM: FaixaPiramide["codigo"][] = ["V3", "V2", "V1", "V0"];

const COR: Record<FaixaPiramide["codigo"], string> = {
  V3: "var(--flag-safe)",
  V2: "var(--v4-red)",
  V1: "var(--flag-care)",
  V0: "var(--ink)",
};

/** Larguras dos degraus da pirâmide, do topo para a base. */
const LARGURA = ["34%", "56%", "78%", "100%"];

export function PiramideNiveis({ faixas }: { faixas: FaixaPiramide[] }) {
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const mapa = new Map(faixas.map((f) => [f.codigo, f]));

  return (
    <div className="mt-6 space-y-3">
      {ORDEM.map((codigo, i) => {
        const faixa = mapa.get(codigo);
        const percentual = faixa?.percentual ?? 0;
        const quantidade = faixa?.quantidade ?? 0;
        const cor = COR[codigo];

        return (
          <div key={codigo} className="flex items-center gap-5">
            <div className="flex flex-1 justify-center">
              <div
                className="flex items-center justify-center transition-all duration-700"
                style={{
                  width: animado ? LARGURA[i] : "20%",
                  height: 62,
                  background: `color-mix(in srgb, ${cor} 14%, white)`,
                  border: `2px solid ${cor}`,
                  clipPath: "polygon(9% 0, 91% 0, 100% 100%, 0 100%)",
                }}
              >
                <span
                  className="text-lg font-bold whitespace-nowrap"
                  style={{ color: cor, letterSpacing: "-0.01em" }}
                >
                  {codigo} {NIVEIS[codigo].nome}
                </span>
              </div>
            </div>

            <div className="w-[38%] shrink-0">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-5xl leading-none font-bold tabular-nums"
                  style={{ color: cor, letterSpacing: "-0.03em" }}
                >
                  {percentual}%
                </span>
                <span className="text-sm font-medium text-ink-muted">
                  {quantidade} {quantidade === 1 ? "resposta" : "respostas"}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: animado ? `${percentual}%` : "0%", background: cor }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
