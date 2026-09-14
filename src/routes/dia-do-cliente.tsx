import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  LoaderCircle,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

import { HeroBackground, NumeralPilar } from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EVENTO_DIA_CLIENTE,
  PERGUNTAS_DIA_CLIENTE,
  TOTAL_PERGUNTAS_DIA_CLIENTE,
  type AlternativaId,
  type RespostasDiaCliente,
} from "@/lib/quiz-dia-cliente";
import {
  finalizarParticipacao,
  iniciarParticipacao,
  type ParticipacaoQuiz,
  type ResultadoQuiz,
} from "@/lib/quiz-dia-cliente-store";

export const Route = createFileRoute("/dia-do-cliente")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dia do Cliente · Você faz parte dessa história · V4 Company" },
      {
        name: "description",
        content: "Quiz especial de métricas de negócios para clientes V4 Company.",
      },
      { property: "og:title", content: "Dia do Cliente · V4 Company" },
      {
        property: "og:description",
        content: "Você faz parte dessa história. Participe do quiz especial da V4 Company.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiaDoClientePage,
});

type Etapa =
  | "restaurando"
  | "abertura"
  | "cadastro"
  | "preparacao"
  | "pergunta"
  | "enviando"
  | "erro-envio"
  | "resultado";

interface EstadoPersistido {
  versao: 1;
  participacao: ParticipacaoQuiz;
  respostas: RespostasDiaCliente;
  indice: number;
  resultado?: ResultadoQuiz;
}

const STORAGE_KEY = "v4-dia-cliente-2026-participacao";

function MarcaEvento() {
  return (
    <header className="relative flex items-center justify-center py-5">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-primary uppercase shadow-sm backdrop-blur">
        <span className="size-1.5 rounded-full bg-primary" />
        Dia do Cliente · 15/09
      </span>
    </header>
  );
}

function tempoFormatado(milissegundos: number) {
  const segundos = Math.max(0, Math.round(milissegundos / 1000));
  const minutos = Math.floor(segundos / 60);
  const restante = segundos % 60;
  return minutos ? `${minutos}min ${String(restante).padStart(2, "0")}s` : `${restante}s`;
}

function mensagemErro(erro: unknown, fallback: string) {
  return erro instanceof Error && erro.message ? erro.message : fallback;
}

function DiaDoClientePage() {
  const [etapa, setEtapa] = useState<Etapa>("restaurando");
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [participacao, setParticipacao] = useState<ParticipacaoQuiz | null>(null);
  const [respostas, setRespostas] = useState<RespostasDiaCliente>({});
  const [indice, setIndice] = useState(0);
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [erro, setErro] = useState("");
  const [iniciando, setIniciando] = useState(false);
  const respondendo = useRef(false);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);
      if (!salvo) {
        setEtapa("abertura");
        return;
      }

      const estado = JSON.parse(salvo) as EstadoPersistido;
      if (estado.versao !== 1 || !estado.participacao?.id || !estado.participacao?.token) {
        window.localStorage.removeItem(STORAGE_KEY);
        setEtapa("abertura");
        return;
      }

      setParticipacao(estado.participacao);
      setNome(estado.participacao.nome);
      setEmpresa(estado.participacao.empresa);
      setRespostas(estado.respostas ?? {});
      setIndice(Math.min(Math.max(estado.indice ?? 0, 0), TOTAL_PERGUNTAS_DIA_CLIENTE - 1));

      if (estado.resultado) {
        setResultado(estado.resultado);
        setEtapa("resultado");
      } else {
        setEtapa("pergunta");
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setEtapa("abertura");
    }
  }, []);

  function persistir(
    participacaoAtual: ParticipacaoQuiz,
    respostasAtuais: RespostasDiaCliente,
    indiceAtual: number,
    resultadoAtual?: ResultadoQuiz,
  ) {
    const estado: EstadoPersistido = {
      versao: 1,
      participacao: participacaoAtual,
      respostas: respostasAtuais,
      indice: indiceAtual,
      resultado: resultadoAtual,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }

  async function comecarQuiz() {
    if (iniciando) return;
    setErro("");
    setIniciando(true);

    try {
      const novaParticipacao = await iniciarParticipacao(nome, empresa);
      setParticipacao(novaParticipacao);
      setRespostas({});
      setIndice(0);
      persistir(novaParticipacao, {}, 0);
      setEtapa("pergunta");
    } catch (falha) {
      setErro(mensagemErro(falha, "Não foi possível iniciar. Tente novamente."));
    } finally {
      setIniciando(false);
    }
  }

  async function enviarRespostas(respostasFinais: RespostasDiaCliente) {
    if (!participacao) return;
    setEtapa("enviando");
    setErro("");
    persistir(participacao, respostasFinais, TOTAL_PERGUNTAS_DIA_CLIENTE - 1);

    try {
      const novoResultado = await finalizarParticipacao(participacao, respostasFinais);
      setResultado(novoResultado);
      persistir(participacao, respostasFinais, TOTAL_PERGUNTAS_DIA_CLIENTE - 1, novoResultado);
      setEtapa("resultado");
    } catch (falha) {
      setErro(mensagemErro(falha, "Não foi possível enviar suas respostas."));
      setEtapa("erro-envio");
    }
  }

  function responder(alternativa: AlternativaId) {
    if (respondendo.current || !participacao) return;
    respondendo.current = true;

    const pergunta = PERGUNTAS_DIA_CLIENTE[indice]!;
    const atualizadas = { ...respostas, [pergunta.id]: alternativa };
    setRespostas(atualizadas);

    if (indice === TOTAL_PERGUNTAS_DIA_CLIENTE - 1) {
      void enviarRespostas(atualizadas);
      return;
    }

    const proximoIndice = indice + 1;
    setIndice(proximoIndice);
    persistir(participacao, atualizadas, proximoIndice);
    window.setTimeout(() => {
      respondendo.current = false;
    }, 180);
  }

  function voltarPergunta() {
    if (!participacao || indice === 0) return;
    const anterior = indice - 1;
    setIndice(anterior);
    persistir(participacao, respostas, anterior);
    respondendo.current = false;
  }

  if (etapa === "restaurando") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <LoaderCircle className="size-7 animate-spin text-primary" aria-label="Carregando" />
      </main>
    );
  }

  if (etapa === "abertura") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-surface px-5 pb-8">
        <HeroBackground cubo />
        <MarcaEvento />

        <div className="relative flex flex-1 flex-col justify-end pt-36 pb-5">
          <section className="surface-card relative overflow-hidden rounded-2xl p-6">
            <NumeralPilar
              numero="V4"
              className="absolute -top-4 right-3 text-[94px] leading-none"
            />
            <div className="relative">
              <p className="micro-label">{EVENTO_DIA_CLIENTE.marca}</p>
              <h1 className="mt-2 text-4xl leading-[1.02] font-extrabold text-ink">
                Você faz parte dessa <span className="text-primary">história.</span>
              </h1>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
                Mostre o quanto você domina as métricas que fazem um negócio crescer e concorra a um
                prêmio especial.
              </p>

              <div className="mt-5 flex gap-2">
                <span className="rounded-full bg-row-hover px-3 py-1.5 text-xs font-semibold text-ink">
                  7 perguntas
                </span>
                <span className="rounded-full bg-v4-red-soft px-3 py-1.5 text-xs font-semibold text-primary">
                  1 vencedor
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="relative mt-7 h-12 w-full rounded-lg font-bold"
              onClick={() => setEtapa("cadastro")}
            >
              Participar do quiz
            </Button>
          </section>
        </div>

        <footer className="relative text-center text-xs text-ink-muted">
          {EVENTO_DIA_CLIENTE.data} · Prêmio revelado no fim da live
        </footer>
      </main>
    );
  }

  if (etapa === "cadastro") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5 pb-8">
        <HeroBackground discreto />
        <MarcaEvento />

        <div className="relative flex flex-1 flex-col justify-center py-6">
          <form
            className="surface-card space-y-5 rounded-2xl p-6"
            onSubmit={(evento) => {
              evento.preventDefault();
              const nomeLimpo = nome.trim();
              const empresaLimpa = empresa.trim();
              if (nomeLimpo.length < 2) return setErro("Informe seu nome.");
              if (empresaLimpa.length < 2) return setErro("Informe o nome da empresa.");
              setNome(nomeLimpo);
              setEmpresa(empresaLimpa);
              setErro("");
              setEtapa("preparacao");
            }}
          >
            <div>
              <p className="micro-label">Identificação</p>
              <h1 className="mt-2 text-3xl font-bold text-ink">Quem está jogando?</h1>
              <p className="mt-2 text-sm text-ink-muted">
                Seu nome e sua empresa aparecerão no ranking da live.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nome" className="micro-label">
                Seu nome
              </Label>
              <div className="relative">
                <UserRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  id="nome"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Nome e sobrenome"
                  className="h-12 rounded-lg pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="empresa" className="micro-label">
                Empresa
              </Label>
              <div className="relative">
                <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  id="empresa"
                  value={empresa}
                  onChange={(evento) => setEmpresa(evento.target.value)}
                  maxLength={160}
                  autoComplete="organization"
                  placeholder="Nome da sua empresa"
                  className="h-12 rounded-lg pl-10"
                />
              </div>
            </div>

            {erro && <p className="text-xs font-semibold text-destructive">{erro}</p>}

            <Button type="submit" size="lg" className="h-12 w-full rounded-lg font-bold">
              Continuar
            </Button>
          </form>
        </div>

        <Button
          variant="ghost"
          className="relative self-start text-ink-muted"
          onClick={() => {
            setErro("");
            setEtapa("abertura");
          }}
        >
          <ArrowLeft className="size-4" /> Voltar
        </Button>
      </main>
    );
  }

  if (etapa === "preparacao") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5 pb-8">
        <HeroBackground />
        <MarcaEvento />

        <div className="relative flex flex-1 flex-col justify-center py-6">
          <section className="surface-card relative overflow-hidden rounded-2xl p-6">
            <NumeralPilar
              numero="07"
              className="absolute -top-5 right-2 text-[112px] leading-none"
            />
            <div className="relative">
              <p className="micro-label">Tudo pronto, {nome.split(" ")[0]}</p>
              <h1 className="mt-2 text-3xl font-bold text-ink">Valendo!</h1>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-row-hover p-3.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm text-ink">Cada resposta correta vale 1 ponto.</p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-row-hover p-3.5">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm text-ink">Em caso de empate, o menor tempo vence.</p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-row-hover p-3.5">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm text-ink">Você pode participar apenas uma vez.</p>
                </div>
              </div>

              {erro && <p className="mt-4 text-xs font-semibold text-destructive">{erro}</p>}

              <Button
                size="lg"
                disabled={iniciando}
                className="mt-6 h-12 w-full rounded-lg font-bold"
                onClick={() => void comecarQuiz()}
              >
                {iniciando ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" /> Preparando
                  </>
                ) : (
                  "Começar agora"
                )}
              </Button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-muted">
                O cronômetro começa quando você tocar no botão.
              </p>
            </div>
          </section>
        </div>

        <Button
          variant="ghost"
          className="relative self-start text-ink-muted"
          disabled={iniciando}
          onClick={() => {
            setErro("");
            setEtapa("cadastro");
          }}
        >
          <ArrowLeft className="size-4" /> Corrigir identificação
        </Button>
      </main>
    );
  }

  if (etapa === "pergunta") {
    const pergunta = PERGUNTAS_DIA_CLIENTE[indice]!;
    const progresso = ((indice + 1) / TOTAL_PERGUNTAS_DIA_CLIENTE) * 100;

    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5">
        <div className="space-y-2 pt-6">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase">
            <span className="text-ink-muted">
              Pergunta {indice + 1} de {TOTAL_PERGUNTAS_DIA_CLIENTE}
            </span>
            <span className="text-primary">{pergunta.categoria}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6 py-8">
          <h1 className="text-2xl leading-snug font-bold text-ink">{pergunta.texto}</h1>

          <div className="space-y-2.5">
            {pergunta.opcoes.map((opcao) => {
              const marcada = respostas[pergunta.id] === opcao.id;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => responder(opcao.id)}
                  className={`surface-card flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-semibold text-ink transition-all hover:border-primary/40 hover:bg-v4-red-soft focus-visible:border-primary focus-visible:outline-none active:scale-[0.99] ${
                    marcada ? "border-primary bg-v4-red-soft" : ""
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold uppercase ${
                      marcada
                        ? "border-primary bg-primary text-white"
                        : "border-hairline text-ink-muted"
                    }`}
                  >
                    {opcao.id}
                  </span>
                  <span className="leading-snug">{opcao.texto}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pb-8">
          <Button
            variant="ghost"
            className="text-ink-muted"
            disabled={indice === 0}
            onClick={voltarPergunta}
          >
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          <span className="text-[11px] text-ink-muted">Toque em uma alternativa</span>
        </div>
      </main>
    );
  }

  if (etapa === "enviando") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-surface px-6 text-center">
        <HeroBackground discreto />
        <div className="relative">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-v4-red-soft">
            <LoaderCircle className="size-8 animate-spin text-primary" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-ink">Calculando seu resultado</h1>
          <p className="mt-2 text-sm text-ink-muted">Sua posição aparecerá no ranking da live.</p>
        </div>
      </main>
    );
  }

  if (etapa === "erro-envio") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-surface px-5">
        <HeroBackground discreto />
        <section className="surface-card relative w-full rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Suas respostas estão salvas</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Tivemos uma falha de conexão ao enviá-las. Você pode tentar novamente sem refazer o
            quiz.
          </p>
          {erro && <p className="mt-4 text-xs font-semibold text-destructive">{erro}</p>}
          <Button
            size="lg"
            className="mt-6 h-12 w-full rounded-lg font-bold"
            onClick={() => void enviarRespostas(respostas)}
          >
            Tentar enviar novamente
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-surface px-5 pb-8">
      <HeroBackground cubo />
      <MarcaEvento />

      <div className="relative flex flex-1 flex-col justify-end pt-36 pb-5">
        <section className="surface-card relative overflow-hidden rounded-2xl p-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-v4-red-soft">
            <Sparkles className="size-8 text-primary" />
          </div>
          <p className="micro-label mt-5">Respostas enviadas</p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">Você está no jogo!</h1>
          <p className="mt-2 text-sm text-ink-muted">{empresa}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-row-hover p-4">
              <p className="micro-label">Acertos</p>
              <p className="mt-1 text-3xl font-extrabold text-primary">
                {resultado?.pontuacao ?? 0}/{resultado?.total ?? TOTAL_PERGUNTAS_DIA_CLIENTE}
              </p>
            </div>
            <div className="rounded-2xl bg-row-hover p-4">
              <p className="micro-label">Tempo</p>
              <p className="mt-1 text-3xl font-extrabold text-ink">
                {tempoFormatado(resultado?.duracao_ms ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-primary/15 bg-v4-red-soft p-4 text-sm leading-relaxed text-ink">
            Acompanhe sua posição no telão. O prêmio especial será revelado no fim da live.
          </div>
        </section>
      </div>

      <footer className="relative text-center text-xs text-ink-muted">
        Obrigado por fazer parte da nossa história.
      </footer>
    </main>
  );
}
