import { useState } from "react";

import cuboAsset from "@/assets/v4-cubo.png.asset.json";

interface Props {
  /** Versão discreta: apenas o brilho radial, sem malha de pontos nem imagem. */
  discreto?: boolean;
  /** Exibe a imagem do cubo V4 como background superior (homepage). */
  cubo?: boolean;
  className?: string;
}


const MASCARA =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 30%, black 62%), linear-gradient(to bottom, transparent 0%, black 14%, black 84%, transparent 100%)";

const MASCARA_FUNDO =
  "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)";

/** Tratamento de hero da marca: malha de pontos, brilho radial vermelho e slot de imagem. */
export function HeroBackground({ discreto = false, cubo = false, className }: Props) {
  const [semHero, setSemHero] = useState(false);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* brilho radial da marca à direita */}
      <div
        className="absolute top-1/2 h-[70%] w-[70%] -translate-y-1/2"
        style={{
          right: "6%",
          background:
            "radial-gradient(circle, rgba(227,6,19,0.22) 0%, rgba(227,6,19,0.06) 45%, transparent 70%)",
          filter: "blur(6px)",
          opacity: discreto ? 0.6 : 1,
        }}
      />

      {!discreto && (
        <>
          {/* malha de pontos nos cantos */}
          <div
            className="absolute bottom-0 left-0 h-20 w-32"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-v4-red) 1.3px, transparent 1.3px)",
              backgroundSize: "15px 15px",
              opacity: 0.24,
            }}
          />
          <div
            className="absolute top-0 right-0 h-16 w-24"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-v4-red) 1.3px, transparent 1.3px)",
              backgroundSize: "15px 15px",
              opacity: 0.22,
            }}
          />

          {/* imagem do cubo V4 usada como background da homepage */}
          {cubo && (
            <img
              src={cuboAsset.url}
              alt=""
              className="absolute inset-x-0 h-[55%] w-full object-cover"
              style={{
                top: "1.5rem",
                objectPosition: "center 20%",
                opacity: 0.32,
                mixBlendMode: "multiply",
                maskImage: MASCARA_FUNDO,
                WebkitMaskImage: MASCARA_FUNDO,
              }}
            />
          )}

          {/* slot da imagem de hero da marca, somente a partir de md */}
          {!cubo && !semHero && (
            <div className="absolute inset-y-0 right-0 hidden w-[58%] md:block">
              <img
                src="/v4-hero.png"
                alt=""
                onError={() => setSemHero(true)}
                className="absolute inset-y-0 right-0 h-full w-full object-cover"
                style={{
                  objectPosition: "70% center",
                  maskImage: MASCARA,
                  WebkitMaskImage: MASCARA,
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                  mixBlendMode: "multiply",
                  opacity: 0.95,
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Numeral grande do pilar usado como elemento gráfico de fundo. */
export function NumeralPilar({ numero, className }: { numero: number | string; className?: string }) {
  const rotulo = typeof numero === "number" ? String(numero).padStart(2, "0") : numero;
  return (
    <span
      aria-hidden
      className={`pointer-events-none font-bold ${className ?? ""}`}
      style={{ letterSpacing: "-0.06em", color: "var(--color-v4-red)", opacity: 0.12 }}
    >
      {rotulo}
    </span>
  );
}
