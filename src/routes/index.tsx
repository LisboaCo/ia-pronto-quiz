import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Share2 } from "lucide-react";

import { HeroBackground, NumeralPilar } from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FAIXAS_FATURAMENTO,
  NIVEIS,
  PERGUNTAS,
  PILARES,
  calcularNivel,
  pontuacaoPilar,
  proximosPassos,
  type NivelCodigo,
  type Respostas,
} from "@/lib/diagnostico";
import { salvarResposta } from "@/lib/respostas-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de Maturidade em IA e Tecnologia" },
      {
        name: "description",
        content:
          "Descubra em 3 minutos o nível de maturidade da sua empresa em tecnologia e inteligência artificial.",
      },
      { property: "og:title", content: "Sua empresa está pronta para a IA?" },
      {
        property: "og:description",
        content: "Diagnóstico rápido de maturidade em IA e tecnologia para pequenas e médias empresas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosticoPage,
});

type Etapa = "abertura" | "divisoria" | "pergunta" | "cadastro" | "resultado";

const PONTOS = [2, 1, 0];

function corPorFaixa(valor: number) {
  if (valor >= 8) return "var(--flag-safe)";
  if (valor >= 6) return "var(--flag-care)";
  return "var(--flag-danger)";
}

function Marca() {
  return (
    <header className="flex items-center justify-center gap-2 py-5">
      <Chip cor="var(--v4-red)">Diagnóstico IA</Chip>
    </header>
  );
}

function Chip({ children, cor }: { children: React.ReactNode; cor: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: `color-mix(in srgb, ${cor} 12%, white)`, color: cor }}
    >
      {children}
    </span>
  );
}

function mascaraWhatsapp(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function DiagnosticoPage() {
  const [etapa, setEtapa] = useState<Etapa>("abertura");
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [nivelSalvo, setNivelSalvo] = useState<NivelCodigo | null>(null);

  const pergunta = PERGUNTAS[indice]!;
  const pilarAtual = PILARES.find((p) => p.id === pergunta.pilar)!;

  const pontos = useMemo(
    () => ({
      alicerce: pontuacaoPilar(respostas, "alicerce"),
      estrutura: pontuacaoPilar(respostas, "estrutura"),
      acabamento: pontuacaoPilar(respostas, "acabamento"),
    }),
    [respostas],
  );

  function iniciar() {
    setIndice(0);
    setRespostas({});
    setEtapa("divisoria");
  }

  function responder(opcao: number) {
    const atualizadas = { ...respostas, [pergunta.id]: PONTOS[opcao]! };
    setRespostas(atualizadas);
    const proximo = indice + 1;
    if (proximo >= PERGUNTAS.length) {
      setEtapa("cadastro");
      return;
    }
    setIndice(proximo);
    if (PERGUNTAS[proximo]!.pilar !== pergunta.pilar) setEtapa("divisoria");
  }

  function voltar() {
    if (indice === 0) {
      setEtapa("abertura");
      return;
    }
    setIndice(indice - 1);
    setEtapa("pergunta");
  }

  if (etapa === "abertura") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5 pb-12">
        <HeroBackground cubo />
        <div className="relative">
          <Marca />
        </div>
        <div className="relative flex flex-1 flex-col justify-end pt-28 pb-4">
          <div className="surface-card relative overflow-hidden rounded-2xl p-6">
            <NumeralPilar
              numero="V4"
              className="absolute -top-4 right-3 text-[92px] leading-none"
            />
            <div className="relative space-y-3">
              <p className="micro-label">Diagnóstico em 15 perguntas</p>
              <h1 className="text-3xl leading-tight font-bold text-ink">
                Sua empresa está pronta para a <span className="text-primary">IA</span>?
              </h1>
              <p className="text-xs text-ink-muted">
                Descubra o nível de maturidade do seu negócio em 3 minutos
              </p>
            </div>
            <Button
              size="lg"
              className="relative mt-6 h-12 w-full rounded-lg font-semibold"
              onClick={iniciar}
            >
              Começar diagnóstico
            </Button>
          </div>
        </div>
        <footer className="relative pb-6 text-center text-xs text-ink-muted">
          15 perguntas · resultado imediato
        </footer>
      </main>
    );
  }

  if (etapa === "divisoria") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5">
        <HeroBackground />
        <div className="relative">
          <Marca />
        </div>
        <div className="relative flex flex-1 flex-col justify-center">
          <div className="surface-card relative overflow-hidden rounded-2xl p-6">
            <NumeralPilar
              numero={pilarAtual.numero}
              className="absolute -top-6 right-2 text-[120px] leading-none"
            />
            <div className="relative space-y-3">
              <p className="micro-label">Pilar {pilarAtual.numero}</p>
              <h2 className="text-3xl font-bold text-ink">{pilarAtual.nome}</h2>
              <p className="text-xs text-ink-muted">{pilarAtual.legenda}</p>
            </div>
            <Button
              size="lg"
              className="relative mt-6 h-12 w-full rounded-lg font-semibold"
              onClick={() => setEtapa("pergunta")}
            >
              Continuar
            </Button>
          </div>
        </div>
        <div className="h-10" />
      </main>
    );
  }


  if (etapa === "pergunta") {
    const progresso = ((indice + 1) / PERGUNTAS.length) * 100;
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5">
        <div className="space-y-2 pt-6">
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wider uppercase">
            <span className="text-ink-muted">
              Pergunta {indice + 1} de {PERGUNTAS.length}
            </span>
            <span className="font-semibold text-primary">{pilarAtual.nome}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-5 py-8">
          <h2 className="text-xl leading-snug font-bold text-ink">{pergunta.texto}</h2>
          <div className="space-y-2.5">
            {pergunta.opcoes.map((opcao, i) => (
              <button
                key={opcao}
                type="button"
                onClick={() => responder(i)}
                className="surface-card flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-medium text-ink transition-colors hover:bg-row-hover focus-visible:border-primary focus-visible:bg-v4-red-soft focus-visible:outline-none active:border-primary active:bg-v4-red-soft"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-hairline text-[11px] font-semibold text-ink-muted">
                  {String.fromCharCode(65 + i)}
                </span>
                {opcao}
              </button>
            ))}
          </div>
        </div>

        <div className="pb-8">
          <Button variant="ghost" className="text-ink-muted" onClick={voltar}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        </div>
      </main>
    );
  }

  if (etapa === "cadastro") {
    return (
      <Cadastro
        pontos={pontos}
        onConcluir={async (dados) => {
          const nivel = calcularNivel(pontos.alicerce, pontos.estrutura, pontos.acabamento);
          await salvarResposta({
            respostas,
            pontos_alicerce: pontos.alicerce,
            pontos_estrutura: pontos.estrutura,
            pontos_acabamento: pontos.acabamento,
            nivel,
            ...dados,
          });
          setNivelSalvo(nivel);
          setEtapa("resultado");
        }}
      />
    );
  }

  return (
    <Resultado
      nivel={nivelSalvo ?? calcularNivel(pontos.alicerce, pontos.estrutura, pontos.acabamento)}
      pontos={pontos}
      passos={proximosPassos(respostas)}
    />
  );
}

interface DadosCadastro {
  nome: string;
  whatsapp: string;
  email: string;
  segmento: string;
  faixa_faturamento: string;
  consentimento: boolean;
}

function Cadastro({
  pontos,
  onConcluir,
}: {
  pontos: { alicerce: number; estrutura: number; acabamento: number };
  onConcluir: (dados: DadosCadastro) => Promise<void>;
}) {
  void pontos;
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [segmento, setSegmento] = useState("");
  const [faixa, setFaixa] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const digitos = whatsapp.replace(/\D/g, "");
    if (nome.trim().length < 2) return setErro("Informe seu nome completo.");
    if (digitos.length < 10) return setErro("Informe um WhatsApp válido com DDD.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro("Informe um e-mail válido.");
    if (!faixa) return setErro("Selecione a faixa de faturamento mensal.");
    if (!consentimento) return setErro("É necessário autorizar o contato para ver o resultado.");
    setErro("");
    setEnviando(true);
    try {
      await onConcluir({
        nome: nome.trim().slice(0, 120),
        whatsapp,
        email: email.trim().slice(0, 160),
        segmento: segmento.trim().slice(0, 120),
        faixa_faturamento: faixa,
        consentimento,
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5">
      <Marca />
      <form onSubmit={enviar} className="surface-card mb-10 space-y-4 rounded-2xl p-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink">
            Seu diagnóstico está <span className="text-primary">pronto</span>
          </h1>
          <p className="text-xs text-ink-muted">
            Preencha seus dados para liberar o resultado completo.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nome" className="micro-label">
            Nome
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={120}
            className="h-11 rounded-md"
            autoComplete="name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="micro-label">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            inputMode="tel"
            placeholder="(11) 90000-0000"
            value={whatsapp}
            onChange={(e) => setWhatsapp(mascaraWhatsapp(e.target.value))}
            className="h-11 rounded-md"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="micro-label">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            className="h-11 rounded-md"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="segmento" className="micro-label">
            Segmento do negócio
          </Label>
          <Input
            id="segmento"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            maxLength={120}
            className="h-11 rounded-md"
            placeholder="Ex: clínica, varejo, indústria"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="faturamento" className="micro-label">
            Faturamento mensal
          </Label>
          <Select value={faixa} onValueChange={setFaixa}>
            <SelectTrigger id="faturamento" className="h-11 w-full rounded-md">
              <SelectValue placeholder="Selecione uma faixa" />
            </SelectTrigger>
            <SelectContent>
              {FAIXAS_FATURAMENTO.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-hairline bg-row-hover p-4 text-xs leading-snug">
          <Checkbox
            checked={consentimento}
            onCheckedChange={(v) => setConsentimento(v === true)}
            className="mt-0.5"
          />
          <span className="text-ink-muted">
            Autorizo o contato sobre meu diagnóstico e concordo com o uso dos meus dados conforme a
            LGPD.
          </span>
        </label>

        {erro && <p className="text-xs font-medium text-destructive">{erro}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={enviando}
          className="h-12 w-full rounded-lg font-semibold"
        >
          Ver meu resultado
        </Button>
      </form>
    </main>
  );
}

function BarraPilar({ nome, valor }: { nome: string; valor: number }) {
  const cor = corPorFaixa(valor);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wider text-ink-muted uppercase">
          {nome}
        </span>
        <span className="text-sm font-bold tracking-tight" style={{ color: cor }}>
          {valor}/10
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(valor / 10) * 100}%`, background: cor }}
        />
      </div>
    </div>
  );
}

function Resultado({
  nivel,
  pontos,
  passos,
}: {
  nivel: NivelCodigo;
  pontos: { alicerce: number; estrutura: number; acabamento: number };
  passos: string[];
}) {
  const info = NIVEIS[nivel];
  const etapa = (["V0", "V1", "V2", "V3"].indexOf(nivel) as 0 | 1 | 2 | 3) ?? 0;
  const corNivel = ["var(--flag-danger)", "var(--flag-warn)", "var(--flag-care)", "var(--flag-safe)"][
    etapa
  ]!;

  async function compartilhar() {
    const texto = `Meu diagnóstico de maturidade em IA: nível ${info.codigo} ${info.nome}. ${info.frase}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Diagnóstico IA", text: texto });
        return;
      } catch {
        /* usuário cancelou */
      }
    }
    await navigator.clipboard?.writeText(texto);
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col bg-surface px-5 pb-10">
      <HeroBackground discreto />
      <div className="relative">
        <Marca />
      </div>
      <div className="surface-card relative rounded-2xl p-5 text-center">
        <p className="micro-label">Seu nível</p>

        <div className="mt-2">
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 text-base font-bold tracking-tight"
            style={{
              background: `color-mix(in srgb, ${corNivel} 12%, white)`,
              color: corNivel,
            }}
          >
            {info.codigo} {info.nome}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{info.frase}</p>
      </div>

      <section className="surface-card mt-4 space-y-4 rounded-2xl p-5">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Pontuação por pilar</h2>
        <BarraPilar nome="Alicerce" valor={pontos.alicerce} />
        <BarraPilar nome="Estrutura" valor={pontos.estrutura} />
        <BarraPilar nome="Acabamento" valor={pontos.acabamento} />
      </section>

      <section className="surface-card mt-4 rounded-2xl p-5">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Seus 3 próximos passos</h2>
        <ul className="mt-3 space-y-3">
          {passos.map((passo) => (
            <li key={passo} className="flex items-start gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <p className="text-sm leading-snug text-ink">{passo}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 space-y-3">
        <Button
          size="lg"
          className="h-12 w-full rounded-lg font-semibold"
          onClick={compartilhar}
        >
          <Share2 className="size-4" /> Compartilhar resultado
        </Button>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-muted">
          <Check className="size-3.5" style={{ color: "var(--flag-safe)" }} /> Resposta registrada
        </p>
        <Link
          to="/painel"
          className="block text-center text-xs text-ink-muted hover:text-primary"
        >
          Painel do evento
        </Link>
      </div>
    </main>
  );
}
