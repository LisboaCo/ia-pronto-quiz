interface Props {
  etapa: 0 | 1 | 2 | 3;
  className?: string;
}

/** Metáfora visual de construção em traço fino: terreno, fundação, estrutura, casa pronta. */
export function CasaMetafora({ etapa, className }: Props) {
  const ativo = "var(--v4-red)";
  const inativo = "var(--hairline)";

  return (
    <svg
      viewBox="0 0 160 120"
      role="img"
      aria-label={`Etapa de construção ${etapa} de 3`}
      className={className}
      fill="none"
    >
      {/* terreno */}
      <line x1="14" y1="106" x2="146" y2="106" stroke={ativo} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="112" x2="134" y2="112" stroke={inativo} strokeWidth="2" strokeLinecap="round" />
      {/* fundação */}
      <rect
        x="32"
        y="92"
        width="96"
        height="14"
        rx="3"
        stroke={etapa >= 1 ? ativo : inativo}
        strokeWidth="2"
      />
      {/* estrutura */}
      <g stroke={etapa >= 2 ? ativo : inativo} strokeWidth="2" strokeLinecap="round">
        <path d="M40 92 V52" />
        <path d="M120 92 V52" />
        <path d="M40 52 H120" />
      </g>
      {/* telhado e acabamento */}
      <g
        stroke={etapa >= 3 ? ativo : inativo}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M32 52 L80 22 L128 52" />
        <rect x="70" y="66" width="20" height="26" rx="2" />
      </g>
    </svg>
  );
}
