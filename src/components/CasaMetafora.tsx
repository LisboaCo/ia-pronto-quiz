interface Props {
  etapa: 0 | 1 | 2 | 3;
  className?: string;
}

/** Metáfora visual de construção: terreno, fundação, estrutura, casa pronta. */
export function CasaMetafora({ etapa, className }: Props) {
  const ativo = "var(--gold)";
  const inativo = "color-mix(in oklab, var(--gold) 18%, transparent)";

  return (
    <svg
      viewBox="0 0 160 120"
      role="img"
      aria-label={`Etapa de construção ${etapa} de 3`}
      className={className}
    >
      {/* terreno */}
      <line x1="10" y1="106" x2="150" y2="106" stroke={ativo} strokeWidth="3" strokeLinecap="round" />
      <line
        x1="18"
        y1="112"
        x2="142"
        y2="112"
        stroke={inativo}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* fundação */}
      <rect
        x="32"
        y="92"
        width="96"
        height="14"
        rx="3"
        fill={etapa >= 1 ? ativo : "transparent"}
        stroke={etapa >= 1 ? ativo : inativo}
        strokeWidth="2.5"
        opacity={etapa >= 1 ? 0.85 : 1}
      />
      {/* estrutura */}
      <g stroke={etapa >= 2 ? ativo : inativo} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M40 92 V52" />
        <path d="M120 92 V52" />
        <path d="M40 52 H120" />
        <path d="M40 92 L120 52" opacity={etapa >= 2 ? 0.35 : 0.6} />
      </g>
      {/* telhado e acabamento */}
      <g
        stroke={etapa >= 3 ? ativo : inativo}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M32 52 L80 20 L128 52" />
        {etapa >= 3 && <rect x="70" y="66" width="20" height="26" rx="2" fill={ativo} opacity="0.9" />}
        {etapa >= 3 && <circle cx="80" cy="40" r="5" fill={ativo} opacity="0.7" stroke="none" />}
      </g>
    </svg>
  );
}
