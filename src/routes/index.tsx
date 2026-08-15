import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Share2, Sparkles } from "lucide-react";

import { CasaMetafora } from "@/components/CasaMetafora";
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

function Marca() {
  return (
    <header className="flex items-center justify-center gap-2 py-5">
      <Sparkles className="size-4 text-primary" aria-hidden />
      <span className="font-display text-sm font-bold tracking-[0.22em] text-primary uppercase">
        Diagnóstico IA
      </span>
    </header>
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-6">
        <Marca />
        <div className="flex flex-1 flex-col justify-center gap-8 py-6">
          <CasaMetafora etapa={3} className="mx-auto h-32 w-44 opacity-90" />
          <div className="space-y-4 text-center">
            <h1 className="text-4xl leading-[1.05] font-extrabold">
              Sua empresa está <span className="text-gradient-gold">pronta para a IA?</span>
            </h1>
            <p className="text-base text-muted-foreground">
              Descubra o nível de maturidade do seu negócio em 3 minutos
            </p>
          </div>
          <Button
            size="lg"
            className="h-14 w-full text-base font-bold shadow-gold"
            onClick={iniciar}
          >
            Começar diagnóstico
          </Button>
        </div>
        <footer className="pb-8 text-center text-xs tracking-wide text-muted-foreground">
          15 perguntas · resultado imediato
        </footer>
      </main>
    );
  }

  if (etapa === "divisoria") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-6">
        <Marca />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <CasaMetafora
            etapa={pilarAtual.numero as 1 | 2 | 3}
            className="h-36 w-52"
          />
          <div className="space-y-3">
            <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              Pilar {pilarAtual.numero}
            </p>
            <h2 className="text-4xl font-extrabold">{pilarAtual.nome}</h2>
            <p className="text-sm text-muted-foreground">{pilarAtual.legenda}</p>
          </div>
          <Button
            size="lg"
            className="h-14 w-full text-base font-bold"
            onClick={() => setEtapa("pergunta")}
          >
            Continuar
          </Button>
        </div>
        <div className="h-10" />
      </main>
    );
  }

  if (etapa === "pergunta") {
    const progresso = ((indice + 1) / PERGUNTAS.length) * 100;
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-6">
        <div className="space-y-3 pt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Pergunta {indice + 1} de {PERGUNTAS.length}
            </span>
            <span className="text-primary uppercase">{pilarAtual.nome}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6 py-8">
          <h2 className="text-2xl leading-snug font-bold">{pergunta.texto}</h2>
          <div className="space-y-3">
            {pergunta.opcoes.map((opcao, i) => (
              <button
                key={opcao}
                type="button"
                onClick={() => responder(i)}
                className="surface-card flex w-full items-center gap-3 rounded-xl px-5 py-5 text-left text-base font-medium transition-all active:scale-[0.98] hover:border-primary/60"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/50 text-xs font-bold text-primary">
                  {String.fromCharCode(65 + i)}
                </span>
                {opcao}
              </button>
            ))}
          </div>
        </div>

        <div className="pb-8">
          <Button variant="ghost" className="text-muted-foreground" onClick={voltar}>
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
        onConcluir={(dados) => {
          const nivel = calcularNivel(pontos.alicerce, pontos.estrutura, pontos.acabamento);
          salvarResposta({
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
  onConcluir: (dados: DadosCadastro) => void;
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

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const digitos = whatsapp.replace(/\D/g, "");
    if (nome.trim().length < 2) return setErro("Informe seu nome completo.");
    if (digitos.length < 10) return setErro("Informe um WhatsApp válido com DDD.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro("Informe um e-mail válido.");
    if (!faixa) return setErro("Selecione a faixa de faturamento mensal.");
    if (!consentimento) return setErro("É necessário autorizar o contato para ver o resultado.");
    setErro("");
    setEnviando(true);
    onConcluir({
      nome: nome.trim().slice(0, 120),
      whatsapp,
      email: email.trim().slice(0, 160),
      segmento: segmento.trim().slice(0, 120),
      faixa_faturamento: faixa,
      consentimento,
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6">
      <Marca />
      <form onSubmit={enviar} className="flex flex-1 flex-col gap-5 pb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">
            Seu diagnóstico está <span className="text-gradient-gold">pronto!</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha seus dados para liberar o resultado completo.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={120}
            className="h-12"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            inputMode="tel"
            placeholder="(11) 90000-0000"
            value={whatsapp}
            onChange={(e) => setWhatsapp(mascaraWhatsapp(e.target.value))}
            className="h-12"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            className="h-12"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="segmento">Segmento do negócio</Label>
          <Input
            id="segmento"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            maxLength={120}
            className="h-12"
            placeholder="Ex: clínica, varejo, indústria"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="faturamento">Faturamento mensal</Label>
          <Select value={faixa} onValueChange={setFaixa}>
            <SelectTrigger id="faturamento" className="h-12 w-full">
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

        <label className="surface-card flex items-start gap-3 rounded-xl p-4 text-sm leading-snug">
          <Checkbox
            checked={consentimento}
            onCheckedChange={(v) => setConsentimento(v === true)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">
            Autorizo o contato sobre meu diagnóstico e concordo com o uso dos meus dados conforme a
            LGPD.
          </span>
        </label>

        {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={enviando}
          className="h-14 w-full text-base font-bold shadow-gold"
        >
          Ver meu resultado
        </Button>
      </form>
    </main>
  );
}

function BarraPilar({ nome, valor }: { nome: string; valor: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{nome}</span>
        <span className="font-display font-bold text-primary">{valor}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${(valor / 10) * 100}%` }}
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10">
      <Marca />
      <div className="surface-card shadow-gold rounded-2xl p-6 text-center">
        <CasaMetafora etapa={etapa} className="mx-auto h-32 w-48" />
        <p className="mt-4 text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
          Seu nível
        </p>
        <h1 className="font-display text-5xl font-extrabold">
          <span className="text-gradient-gold">{info.codigo}</span>{" "}
          <span className="text-foreground">{info.nome}</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{info.frase}</p>
      </div>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-bold">Pontuação por pilar</h2>
        <BarraPilar nome="Alicerce" valor={pontos.alicerce} />
        <BarraPilar nome="Estrutura" valor={pontos.estrutura} />
        <BarraPilar nome="Acabamento" valor={pontos.acabamento} />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-bold">Seus 3 próximos passos</h2>
        {passos.map((passo, i) => (
          <div key={passo} className="surface-card flex items-start gap-3 rounded-xl p-4">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p className="text-sm leading-snug">{passo}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 space-y-3">
        <Button size="lg" className="h-14 w-full text-base font-bold" onClick={compartilhar}>
          <Share2 className="size-4" /> Compartilhar resultado
        </Button>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Check className="size-3.5 text-primary" /> Resposta registrada
        </p>
        <Link
          to="/painel"
          className="block text-center text-xs text-muted-foreground/60 hover:text-primary"
        >
          Painel do evento
        </Link>
      </div>
    </main>
  );
}
