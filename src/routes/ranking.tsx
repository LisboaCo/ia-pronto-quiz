import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Crown,
  LoaderCircle,
  LockKeyhole,
  Maximize2,
  RefreshCw,
  Trophy,
  UsersRound,
} from "lucide-react";

import cuboAsset from "@/assets/v4-cubo.png.asset.json";
import { HeroBackground } from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENTO_DIA_CLIENTE, TOTAL_PERGUNTAS_DIA_CLIENTE } from "@/lib/quiz-dia-cliente";
import { listarRanking, validarSenha, type ItemRankingQuiz } from "@/lib/quiz-dia-cliente-store";

export const Route = createFileRoute("/ranking")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ranking · Dia do Cliente · V4 Company" },
      {
        name: "description",
        content: "Ranking ao vivo do quiz especial de Dia do Cliente da V4 Company.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RankingPage,
});

const AUTH_KEY = "v4-ranking-dia-cliente-senha";

function textoErro(erro: unknown, fallback: string) {
  return erro instanceof Error && erro.message ? erro.message : fallback;
}

function tempoRanking(milissegundos: number) {
  const decimosTotais = Math.max(0, Math.round(milissegundos / 100));
  const minutos = Math.floor(decimosTotais / 600);
  const segundos = Math.floor((decimosTotais % 600) / 10);
  const decimos = decimosTotais % 10;
  return minutos
    ? `${minutos}min ${String(segundos).padStart(2, "0")},${decimos}s`
    : `${segundos},${decimos}s`;
}

function RankingPage() {
  const [senha, setSenha] = useState("");
  const [senhaAtiva, setSenhaAtiva] = useState("");
  const [verificando, setVerificando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const salva = window.sessionStorage.getItem(AUTH_KEY);
    if (!salva) {
      setVerificando(false);
      return;
    }

    validarSenha(salva)
      .then(({ valida }) => {
        if (valida) {
          setSenha(salva);
          setSenhaAtiva(salva);
        } else {
          window.sessionStorage.removeItem(AUTH_KEY);
        }
      })
      .catch(() => window.sessionStorage.removeItem(AUTH_KEY))
      .finally(() => setVerificando(false));
  }, []);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setVerificando(true);
    setErro("");
    try {
      const { valida } = await validarSenha(senha);
      if (!valida) {
        setErro("Senha incorreta.");
        return;
      }
      window.sessionStorage.setItem(AUTH_KEY, senha);
      setSenhaAtiva(senha);
    } catch (falha) {
      setErro(textoErro(falha, "Não foi possível validar o acesso."));
    } finally {
      setVerificando(false);
    }
  }

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <LoaderCircle className="size-8 animate-spin text-primary" aria-label="Carregando" />
      </main>
    );
  }

  if (!senhaAtiva) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
        <HeroBackground cubo />
        <form
          onSubmit={entrar}
          className="surface-card relative w-full max-w-sm space-y-5 rounded-2xl p-8"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-v4-red-soft">
            <LockKeyhole className="size-5 text-primary" />
          </div>
          <div>
            <p className="micro-label text-primary">Dia do Cliente</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Ranking da live</h1>
            <p className="mt-2 text-sm text-ink-muted">Acesso restrito à equipe V4.</p>
          </div>
          <Input
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            placeholder="Senha do painel"
            className="h-12 rounded-lg"
            autoFocus
          />
          {erro && <p className="text-xs font-semibold text-destructive">{erro}</p>}
          <Button type="submit" className="h-12 w-full rounded-lg font-bold">
            Abrir ranking
          </Button>
        </form>
      </main>
    );
  }

  return <RankingDashboard senha={senhaAtiva} />;
}

function RankingDashboard({ senha }: { senha: string }) {
  const [dados, setDados] = useState<ItemRankingQuiz[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  useEffect(() => {
    let ativo = true;

    const atualizar = async () => {
      try {
        const itens = await listarRanking(senha);
        if (!ativo) return;
        setDados(itens);
        setUltimaAtualizacao(new Date());
        setErro("");
      } catch (falha) {
        if (ativo) setErro(textoErro(falha, "Falha ao atualizar o ranking."));
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void atualizar();
    const timer = window.setInterval(() => void atualizar(), 5000);
    return () => {
      ativo = false;
      window.clearInterval(timer);
    };
  }, [senha]);

  const ranking = useMemo(
    () =>
      [...dados].sort(
        (a, b) =>
          b.pontuacao - a.pontuacao ||
          a.duracao_ms - b.duracao_ms ||
          a.concluido_em.localeCompare(b.concluido_em),
      ),
    [dados],
  );
  const media = ranking.length
    ? ranking.reduce((total, item) => total + item.pontuacao, 0) / ranking.length
    : 0;
  const topo = ranking.slice(0, 3);

  async function abrirTelaCheia() {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // O navegador pode bloquear tela cheia quando não há permissão.
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-5 py-5 md:px-8 md:py-7">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `url(${cuboAsset.url})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right -8% bottom -16%",
          backgroundSize: "56% auto",
          opacity: 0.12,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--surface) 0%, color-mix(in srgb, var(--surface) 82%, transparent) 60%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1600px]">
        <header className="surface-card relative overflow-hidden rounded-2xl px-6 py-5 md:px-8 md:py-6">
          <HeroBackground discreto />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
                  {EVENTO_DIA_CLIENTE.titulo} · {EVENTO_DIA_CLIENTE.data}
                </p>
              </div>
              <h1 className="mt-2 text-4xl leading-none font-extrabold text-ink md:text-5xl">
                Você faz parte dessa <span className="text-primary">história.</span>
              </h1>
              <p className="mt-2 text-sm text-ink-muted">Ranking ao vivo · V4 Company</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-row-hover px-5 py-3 text-right">
                <p className="micro-label">Participantes</p>
                <p className="mt-0.5 text-4xl leading-none font-extrabold text-primary">
                  {ranking.length}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-12 rounded-xl bg-white"
                onClick={() => void abrirTelaCheia()}
                title="Abrir em tela cheia"
              >
                <Maximize2 className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="micro-label">Pódio provisório</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">Quem conhece o método</h2>
              </div>
              <Trophy className="size-8 text-primary" />
            </div>

            {topo.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[topo[1], topo[0], topo[2]].map((item, indiceVisual) => {
                  const posicao = indiceVisual === 0 ? 2 : indiceVisual === 1 ? 1 : 3;
                  return item ? (
                    <Podio key={item.id} item={item} posicao={posicao} />
                  ) : (
                    <div
                      key={`vazio-${posicao}`}
                      className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-hairline text-sm text-ink-muted"
                    >
                      Aguardando
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-hairline text-center">
                <UsersRound className="size-8 text-ink-muted" />
                <p className="mt-3 font-semibold text-ink">O ranking começa com o primeiro envio</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Aponte a câmera para o QR Code e participe.
                </p>
              </div>
            )}
          </div>

          <div className="surface-card rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="micro-label">Desempenho da sala</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">Placar geral</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} />5 segundos
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Kpi
                rotulo="Média de acertos"
                valor={`${media.toFixed(1).replace(".", ",")}/${TOTAL_PERGUNTAS_DIA_CLIENTE}`}
              />
              <Kpi
                rotulo="Melhor nota"
                valor={`${ranking[0]?.pontuacao ?? 0}/${TOTAL_PERGUNTAS_DIA_CLIENTE}`}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-primary/15 bg-v4-red-soft p-5">
              <p className="micro-label text-primary">Critério de classificação</p>
              <p className="mt-2 text-sm font-semibold text-ink">
                Mais acertos primeiro. Em caso de empate, vence quem concluiu em menos tempo.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
              <span>{erro || "Ranking conectado"}</span>
              <span>
                {ultimaAtualizacao
                  ? `Atualizado às ${ultimaAtualizacao.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}`
                  : "Conectando"}
              </span>
            </div>
          </div>
        </section>

        <section className="surface-card mt-5 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4 md:px-6">
            <div>
              <p className="micro-label">Classificação completa</p>
              <h2 className="mt-1 text-xl font-bold text-ink">Ranking</h2>
            </div>
            <p className="hidden text-xs text-ink-muted sm:block">
              O prêmio especial será revelado no fim da live.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="bg-row-hover text-left text-[11px] tracking-wider text-ink-muted uppercase">
                  <th className="w-24 px-6 py-3 font-semibold">Posição</th>
                  <th className="px-4 py-3 font-semibold">Participante</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="w-32 px-4 py-3 text-center font-semibold">Acertos</th>
                  <th className="w-36 px-6 py-3 text-right font-semibold">Tempo</th>
                </tr>
              </thead>
              <tbody aria-live="polite">
                {ranking.map((item, indice) => (
                  <tr
                    key={item.id}
                    className={`border-t border-hairline ${indice < 3 ? "bg-v4-red-soft/40" : ""}`}
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-extrabold ${
                          indice === 0 ? "bg-primary text-white" : "bg-row-hover text-ink"
                        }`}
                      >
                        {indice + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-ink">{item.nome}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{item.empresa}</td>
                    <td className="px-4 py-3.5 text-center text-lg font-extrabold text-primary">
                      {item.pontuacao}/{TOTAL_PERGUNTAS_DIA_CLIENTE}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-ink">
                      {tempoRanking(item.duracao_ms)}
                    </td>
                  </tr>
                ))}
                {!ranking.length && !carregando && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-ink-muted">
                      Nenhum questionário concluído ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Podio({ item, posicao }: { item: ItemRankingQuiz; posicao: 1 | 2 | 3 }) {
  const destaque = posicao === 1;
  const fundo = posicao === 1 ? "bg-primary" : posicao === 2 ? "bg-ink" : "bg-[#c46b2b]";

  return (
    <article
      className={`relative overflow-hidden rounded-2xl p-4 ${
        destaque ? "md:-mt-2 md:pb-6" : "bg-row-hover"
      } ${destaque ? fundo : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex size-8 items-center justify-center rounded-full text-sm font-extrabold ${
            destaque ? "bg-white text-primary" : `${fundo} text-white`
          }`}
        >
          {posicao}º
        </span>
        {posicao === 1 && <Crown className="size-6 text-white" />}
      </div>
      <h3
        className={`mt-4 truncate text-lg font-extrabold ${destaque ? "text-white" : "text-ink"}`}
      >
        {item.nome}
      </h3>
      <p className={`mt-0.5 truncate text-xs ${destaque ? "text-white/75" : "text-ink-muted"}`}>
        {item.empresa}
      </p>
      <div className="mt-4 flex items-end justify-between gap-2">
        <p className={`text-3xl font-extrabold ${destaque ? "text-white" : "text-primary"}`}>
          {item.pontuacao}/{TOTAL_PERGUNTAS_DIA_CLIENTE}
        </p>
        <p
          className={`flex items-center gap-1 text-xs ${destaque ? "text-white/80" : "text-ink-muted"}`}
        >
          <Clock3 className="size-3.5" /> {tempoRanking(item.duracao_ms)}
        </p>
      </div>
    </article>
  );
}

function Kpi({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-row-hover p-5">
      <p className="micro-label">{rotulo}</p>
      <p className="mt-2 text-4xl font-extrabold tracking-tight text-ink">{valor}</p>
    </div>
  );
}
