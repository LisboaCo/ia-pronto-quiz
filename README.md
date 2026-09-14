# Diagnóstico IA: Próximo Nível

Crie um aplicativo web mobile-first em português brasileiro chamado "Diagnóstico de Maturidade em IA e Tecnologia" — um quiz de diagnóstico para ser usado ao vivo em um evento presencial para donos de pequenas e médias empresas, respondido pelo celular via QR code. Use um visual profissional escuro (dark) com acentos em um tom de destaque (pode ser âmbar/dourado), tipografia forte, sem aparência de template genérico. Nome da marca provisório no topo: "Diagnóstico IA" (será substituído depois pela marca do evento).

ESTRUTURA E FLUXO:

1. TELA DE ABERTURA: título "Sua empresa está pronta para a IA?", subtítulo "Descubra o nível de maturidade do seu negócio em 3 minutos", botão grande "Começar diagnóstico". Rodapé discreto com o texto "15 perguntas · resultado imediato".

2. QUIZ: 15 perguntas, UMA POR TELA, com barra de progresso no topo (ex: "Pergunta 4 de 15") e navegação com botão "Voltar". Cada pergunta tem exatamente 3 opções de resposta em cards grandes e tocáveis (mobile-first). As perguntas são divididas em 3 pilares, e ao entrar em cada pilar mostre uma tela-divisória rápida com o nome do pilar (Pilar 1: Alicerce / Pilar 2: Estrutura / Pilar 3: Acabamento) usando metáfora visual de construção de uma casa.

PERGUNTAS E PONTUAÇÃO (cada opção vale 2, 1 ou 0 pontos, na ordem listada):

PILAR 1 — ALICERCE:
P1. "Sua empresa tem site próprio, atualizado, que representa bem o negócio hoje?" → "Sim" (2) / "Tem, mas está desatualizado" (1) / "Não, só redes sociais" (0)
P2. "O caminho do seu cliente — do primeiro contato até a compra e o pós-venda — está desenhado em algum lugar?" → "Sim, documentado e a equipe segue" (2) / "Existe, mas só na cabeça" (1) / "Cada venda acontece de um jeito" (0)
P3. "Os processos principais (como atende, vende, entrega, cobra) estão documentados?" → "Sim" (2) / "Alguns" (1) / "Nada documentado" (0)
P4. "Se a pessoa mais importante da operação sair amanhã, a empresa continua rodando normalmente?" → "Sim, está tudo registrado" (2) / "Roda, mas com dificuldade" (1) / "Trava" (0)
P5. "Os materiais da marca (identidade visual, tom de voz, apresentações) estão organizados em um lugar só?" → "Sim" (2) / "Existem, mas espalhados" (1) / "Não existem formalizados" (0)

PILAR 2 — ESTRUTURA:
P6. "Você sabe quanto custa trazer um cliente novo (CAC)?" → "Sei o número" (2) / "Sei calcular, mas não acompanho" (1) / "Nunca calculei" (0)
P7. "Você sabe quanto um cliente vale ao longo do tempo de relacionamento (LTV)?" → "Sei o número" (2) / "Sei calcular, mas não acompanho" (1) / "Nunca calculei" (0)
P8. "Você conhece a margem de cada produto ou serviço que vende?" → "Sim, por item" (2) / "Só a margem geral" (1) / "Não sei ao certo" (0)
P9. "De onde saem os números da sua empresa?" → "Relatórios automáticos de sistema" (2) / "Planilhas montadas na mão" (1) / "Não acompanho números" (0)
P10. "Quando você toma uma decisão importante, ela é baseada em quê?" → "Indicadores" (2) / "Mistura de número e intuição" (1) / "Feeling e experiência" (0)

PILAR 3 — ACABAMENTO:
P11. "Existe alguma automação rodando na empresa (follow-up automático, integração entre sistemas, robôs de tarefa)?" → "Sim, mais de uma" (2) / "Uma ou outra" (1) / "Nenhuma" (0)
P12. "Como a sua equipe usa IA hoje?" → "Com padrão e diretrizes definidas pela empresa" (2) / "Cada um usa por conta própria" (1) / "Não usa" (0)
P13. "Seus sistemas conversam entre si (CRM, WhatsApp, planilhas, financeiro)?" → "Integrados" (2) / "Parcialmente" (1) / "Cada um é uma ilha" (0)
P14. "Existe alguma regra sobre o que pode ou não ser colocado em ferramentas de IA (dados de cliente, informações internas)?" → "Sim, formalizada" (2) / "Combinado informal" (1) / "Nunca pensamos nisso" (0)
P15. "Vocês já tentaram automatizar ou implantar alguma ferramenta que não vingou?" → "Implantamos e funciona até hoje" (2) / "Tentamos e morreu no caminho" (1) / "Nunca tentamos" (0)

CÁLCULO DO NÍVEL (regra de portões em cascata, NÃO usar apenas a soma total):
- Pontuação por pilar: 0 a 10.
- V0 — TERRENO: pilar Alicerce < 6. Frase: "Sua empresa ainda está no terreno: antes da IA, é preciso construir a base."
- V1 — ALICERCE: Alicerce >= 6, mas Estrutura < 6. Frase: "Você tem a base, mas ainda decide no escuro: o próximo passo é dominar seus números."
- V2 — ESTRUTURA: Alicerce >= 6 e Estrutura >= 6, mas Acabamento < 6. Frase: "Base sólida e números na mão: sua empresa está pronta para tecnologia e IA de verdade."
- V3 — ACABAMENTO: os três pilares >= 6. Frase: "Sua empresa está entre as poucas prontas para operar com IA de forma estruturada."

3. TELA DE CADASTRO (obrigatória, ANTES do resultado): título "Seu diagnóstico está pronto!". Campos: Nome (obrigatório), WhatsApp (obrigatório, com máscara brasileira), E-mail (obrigatório), Segmento do negócio (texto livre), Faturamento mensal (select obrigatório: "Até R$ 50 mil" / "R$ 50 a 200 mil" / "R$ 200 mil a 1 milhão" / "Acima de R$ 1 milhão"). Checkbox obrigatório de consentimento: "Autorizo o contato sobre meu diagnóstico e concordo com o uso dos meus dados conforme a LGPD."

4. TELA DE RESULTADO: mostrar o nível com destaque visual grande (V0 Terreno / V1 Alicerce / V2 Estrutura / V3 Acabamento) usando uma ilustração/ícone da metáfora de construção (terreno vazio → fundação → estrutura → casa pronta), a frase de diagnóstico do nível, três mini-barras mostrando a pontuação de cada pilar (X/10), e uma seção "Seus 3 próximos passos" com recomendações geradas a partir das 3 perguntas de menor pontuação do respondente (usar o texto da pergunta reformulado como ação, ex: se P3 foi 0 → "Documentar os processos principais da operação"). Botão de compartilhar resultado.

5. PAINEL AGREGADO (rota /painel, protegida por uma senha simples definida em código, ex: "evento2026"): dashboard em tela cheia otimizado para projeção em telão (dark, números grandes), com atualização automática a cada 10 segundos, mostrando: (a) total de respondentes; (b) distribuição por nível em gráfico de barras horizontal grande com percentuais (V0/V1/V2/V3); (c) destaque "Como a sala usa IA hoje" com a distribuição das respostas da P12; (d) destaque "Quem já tentou e não vingou" com a distribuição da P15; (e) distribuição por faixa de faturamento. Usar Recharts.

BACKEND: habilite o banco de dados (Supabase) e crie uma tabela "respostas" armazenando: timestamp, respostas das 15 perguntas (valores 0/1/2), pontuação por pilar, nível calculado, nome, whatsapp, email, segmento, faixa de faturamento, consentimento. O painel lê dessa tabela. A inserção acontece ao concluir o cadastro (o resultado só aparece após gravar). Não exigir login dos respondentes.

IMPORTANTE: todo o texto do app em português brasileiro; nunca usar travessão (—) nos textos visíveis do app, usar vírgula ou ponto no lugar; mobile-first radical (a plateia responde pelo celular); o painel /painel é desktop/telão.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ia-pronto-quiz.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fd8a2b36-36e5-4675-a963-4541c2d9ce06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
