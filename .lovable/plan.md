# Plano: Persistir respostas do diagnóstico no PostgreSQL via PostgREST

## Confirmação do ambiente

- O schema `dashboard_tvsim` existe e está acessível pela secret `BANCO_CLIENT_HEALTH`.
- O schema está vazio: nenhuma tabela criada ainda.
- A secret `POSTGREST_DASHBOARD_TVSIM` aponta para um PostgREST 12.2.0 (responde `200` na raiz com o OpenAPI).

## Objetivo

Trocar a camada de persistência do diagnóstico de `localStorage` para a tabela `dashboard_tvsim.respostas`, usando o PostgREST exposto pela secret `POSTGREST_DASHBOARD_TVSIM`. A lógica, perguntas, pontuação, portões em cascata, fluxo de telas e design visual permanecem 100% inalterados.

## Passos técnicos

### 1. Criar a tabela `dashboard_tvsim.respostas`

Colunas:

- `id` uuid primary key default gen_random_uuid()
- `criado_em` timestamptz default now()
- `respostas` jsonb (mapa das 15 perguntas com valores 0/1/2)
- `pontos_alicerce` smallint
- `pontos_estrutura` smallint
- `pontos_acabamento` smallint
- `nivel` text (V0, V1, V2 ou V3)
- `nome` text
- `whatsapp` text
- `email` text
- `segmento` text
- `faixa_faturamento` text
- `consentimento` boolean

Ajustar tipos e restrições (ex.: `nivel` pode ser verificado contra os 4 valores válidos).

### 2. Garantir acesso via PostgREST

- Conceder `GRANT SELECT, INSERT` na tabela para a role que o PostgREST usa para requisições anônimas/publicas (a ser verificada na implementação).
- Conceder `GRANT ALL` para `service_role` ou role administrativa, caso exista.
- Se o PostgREST exigir autenticação (JWT/apikey), descobrir a chave/credencial correspondente ou configurar o header correto nas server functions.
- Habilitar RLS apenas se necessário para o caso de uso (dados de evento público, sem identificação sensível além de nome/e-mail/whatsApp). Se habilitar RLS, criar política que permita `INSERT` e `SELECT` público para o evento.

### 3. Criar server functions para acesso ao banco

- `src/lib/respostas.functions.ts`:
  - `salvarResposta`: POST para o PostgREST inserindo um registro na tabela.
  - `listarRespostas`: GET para o PostgREST retornando todos os registros (ordenados por `criado_em`).
- Ambas as funções leem a URL da secret `POSTGREST_DASHBOARD_TVSIM` dentro do handler.
- Usar `fetch` nativo (compatível com Worker runtime). Não usar bibliotecas Node-only como `pg`.

### 4. Adaptar a camada de dados do app

- Atualizar `src/lib/respostas-store.ts` para delegar `salvarResposta` e `listarRespostas` para as server functions, mantendo a interface `RespostaRegistro` existente.
- Remover completamente o uso de `localStorage` para diagnóstico.

### 5. Atualizar as rotas

- `src/routes/index.tsx`:
  - Tornar `salvarResposta` assíncrono (aguardar a server function).
  - Adicionar estado de envio/feedback no formulário de cadastro.
- `src/routes/painel.tsx`:
  - Tornar `listarRespostas` assíncrono.
  - Manter o polling a cada 10 segundos via `useEffect` chamando a server function.
  - Garantir que os dados agora vêm do banco, permitindo que qualquer celular apareça no painel do telão.

### 6. Validação

- Inserir um registro de teste via app e confirmar que aparece no painel.
- Verificar que a pirâmide, KPIs e gráficos refletem o dado recém-salvo.
- Confirmar que a tela de cadastro continua funcionando e a lógica de níveis não mudou.

## Decisão pendente

Preciso confirmar como o PostgREST está configurado para autenticação. A secret `POSTGREST_DASHBOARD_TVSIM` contém apenas a URL base. Na implementação, testarei se a API aceita requisições sem token ou se é preciso enviar algum header (ex.: `Authorization: Bearer <token>` ou `apikey`). Se houver outra secret/credencial relacionada, você pode me passar agora para acelerar o plano.
