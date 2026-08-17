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

  useEffect(() => {
    const atualizar = () => setDados(listarRespostas());
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
    <main className="min-h-screen bg-surface px-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Diagnóstico IA · Painel ao vivo
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Maturidade em IA e Tecnologia
          </h1>
        </div>
        <div className="surface-card rounded-2xl p-5 text-right">
          <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">
            Respondentes
          </p>
          <p className="mt-1 text-6xl leading-none font-bold tracking-tight text-primary">{total}</p>
        </div>
      </header>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="surface-card rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold tracking-tight text-ink">Distribuição por nível</h2>
          <GraficoBarras dados={porNivel} altura={320} destaque />
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-xl font-bold tracking-tight text-ink">Faixa de faturamento</h2>
          <GraficoBarras dados={porFaturamento} altura={320} />
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-xl font-bold tracking-tight text-ink">Como a sala usa IA hoje</h2>
          <GraficoBarras dados={distribuicaoPergunta("p12")} altura={240} />
        </div>

        <div className="surface-card rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold tracking-tight text-ink">Quem já tentou e não vingou</h2>
          <GraficoBarras dados={distribuicaoPergunta("p15")} altura={240} />
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-ink-muted">
        Atualização automática a cada 10 segundos.
      </p>
    </main>
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
    "var(--flag-renew)",
    "var(--flag-care)",
    "var(--flag-safe)",
    "var(--flag-onboarding)",
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
