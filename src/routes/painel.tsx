import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import cuboAsset from "@/assets/v4-cubo.png.asset.json";
import { HeroBackground } from "@/components/HeroBackground";
import { PiramideNiveis } from "@/components/PiramideNiveis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FAIXAS_FATURAMENTO, NIVEIS, PERGUNTAS } from "@/lib/diagnostico";
import { listarRespostas, type RespostaRegistro } from "@/lib/respostas-store";

const SENHA = "evento2026";

export const Route = createFileRoute("/painel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel do evento · Diagnóstico IA" },
      {
        name: "description",
        content: "Painel agregado, ao vivo, das respostas do diagnóstico de maturidade em IA.",
      },
      { property: "og:title", content: "Painel do evento · Diagnóstico IA" },
      {
        property: "og:description",
        content: "Resultados agregados do diagnóstico de maturidade em IA em tempo real.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  const [liberado, setLiberado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  if (!liberado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (senha === SENHA) setLiberado(true);
            else setErro("Senha incorreta.");
          }}
          className="surface-card w-full max-w-sm space-y-4 rounded-2xl p-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-ink">Painel do evento</h1>
          <p className="text-xs text-ink-muted">Acesso restrito à organização.</p>
          <Input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="h-11 rounded-md"
          />
          {erro && <p className="text-xs text-destructive">{erro}</p>}
          <Button type="submit" className="h-11 w-full rounded-lg font-semibold">
            Entrar
          </Button>
        </form>
      </main>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [dados, setDados] = useState<RespostaRegistro[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const atualizar = async () => {
      setCarregando(true);
      try {
        const respostas = await listarRespostas();
        setDados(respostas);
      } finally {
        setCarregando(false);
      }
    };
    atualizar();
    const timer = setInterval(atualizar, 10000);
    return () => clearInterval(timer);
  }, []);

  const total = dados.length;

  const porNivel = useMemo(
    () =>
      (["V0", "V1", "V2", "V3"] as const).map((codigo) => {
        const quantidade = dados.filter((d) => d.nivel === codigo).length;
        return {
          codigo,
          nome: `${codigo} ${NIVEIS[codigo].nome}`,
          quantidade,
          percentual: total ? Math.round((quantidade / total) * 100) : 0,
        };
      }),
    [dados, total],
  );

  const distribuicaoPergunta = (id: string) => {
    const pergunta = PERGUNTAS.find((p) => p.id === id)!;
    const pontos = [2, 1, 0];
    return pergunta.opcoes.map((opcao, i) => {
      const quantidade = dados.filter((d) => d.respostas[id] === pontos[i]).length;
      return {
        nome: opcao,
        quantidade,
        percentual: total ? Math.round((quantidade / total) * 100) : 0,
      };
    });
  };

  const porFaturamento = useMemo(
    () =>
      FAIXAS_FATURAMENTO.map((faixa) => {
        const quantidade = dados.filter((d) => d.faixa_faturamento === faixa).length;
        return {
          nome: faixa,
          quantidade,
          percentual: total ? Math.round((quantidade / total) * 100) : 0,
        };
      }),
    [dados, total],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-8 py-8">
      {/* marca V4 como textura de fundo do painel */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `url(${cuboAsset.url})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right -8% bottom -12%",
          backgroundSize: "58% auto",
          opacity: 0.14,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--surface) 0%, color-mix(in srgb, var(--surface) 82%, transparent) 55%, transparent 100%)",
        }}
      />

      <div className="relative">
      <header className="surface-card relative overflow-hidden rounded-2xl px-8 py-7">
        <HeroBackground discreto />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="micro-label" style={{ color: "var(--color-v4-red)" }}>
              Diagnóstico IA · Painel ao vivo
            </p>
            <h1
              className="mt-2 text-5xl font-bold text-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              Maturidade em IA e Tecnologia
            </h1>
          </div>
          <div className="text-right">
            <p className="micro-label">Respondentes</p>
            <p
              className="mt-1 text-7xl leading-none font-bold text-primary"
              style={{ letterSpacing: "-0.02em" }}
            >
              {total}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {porNivel.map((item) => (
          <Kpi key={item.nome} rotulo={item.nome} valor={`${item.percentual}%`} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="surface-card rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Em qual nível está cada empresa
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Percentual da sala em cada fase da construção.
          </p>
          <PiramideNiveis faixas={porNivel} />
        </div>


        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Faixa de faturamento</h2>
          <GraficoBarras dados={porFaturamento} altura={320} />
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Como a sala usa IA hoje</h2>
          <GraficoBarras dados={distribuicaoPergunta("p12")} altura={240} />
        </div>

        <div className="surface-card rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Quem já tentou e não vingou
          </h2>
          <GraficoBarras dados={distribuicaoPergunta("p15")} altura={240} />
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Atualização automática a cada 10 segundos.
      </p>
      </div>
    </main>
  );
}

function Kpi({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <p className="micro-label">{rotulo}</p>
      <p className="mt-2 text-5xl font-bold text-ink" style={{ letterSpacing: "-0.02em" }}>
        {valor}
      </p>
    </div>
  );
}


interface ItemGrafico {
  nome: string;
  quantidade: number;
  percentual: number;
}

function GraficoBarras({
  dados,
  altura,
  destaque = false,
}: {
  dados: ItemGrafico[];
  altura: number;
  destaque?: boolean;
}) {
  const cores = [
    "var(--v4-red)",
    "var(--flag-care)",
    "var(--flag-safe)",
    "var(--ink)",
    "var(--ink-muted)",
    "var(--flag-warn)",
  ];
  return (
    <div style={{ height: altura }} className="mt-4 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 64 }}>
          <XAxis type="number" hide domain={[0, Math.max(1, ...dados.map((d) => d.quantidade))]} />
          <YAxis
            type="category"
            dataKey="nome"
            width={destaque ? 190 : 170}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--ink)",
              fontSize: destaque ? 18 : 14,
              fontWeight: 600,
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--hairline)",
              background: "var(--card)",
              fontSize: 12,
              color: "var(--ink)",
            }}
            formatter={(valor: number) => [`${valor} respostas`, ""]}
          />
          <Bar dataKey="quantidade" radius={[0, 8, 8, 0]} barSize={destaque ? 42 : 26}>
            {dados.map((item, i) => (
              <Cell key={item.nome} fill={cores[i % cores.length]} />
            ))}
            <LabelList
              dataKey="percentual"
              position="right"
              formatter={(valor: number) => `${valor}%`}
              style={{
                fill: "var(--ink)",
                fontSize: destaque ? 24 : 18,
                fontWeight: 700,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
