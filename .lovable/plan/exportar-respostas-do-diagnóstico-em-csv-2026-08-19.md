# Exportar respostas do diagnóstico em CSV

Você não está conseguindo acessar a tabela direto no banco, então eu gero o arquivo pra você baixar.

## O que vou fazer

1. Consultar a tabela `dashboard_tvsim.respostas` (todas as colunas, ordenadas por `criado_em`).
2. Exportar para `/mnt/documents/respostas-diagnostico.csv`, com cabeçalho.
3. Confirmar a quantidade de linhas exportadas e te passar o link do arquivo.

Sem alterações no app, no banco ou na lógica — apenas leitura e geração do arquivo.

## Detalhes técnicos

- Conexão pela secret `BANCO_CLIENT_HEALTH` via `psql`.
- `COPY (SELECT * FROM dashboard_tvsim.respostas ORDER BY criado_em) TO STDOUT WITH CSV HEADER`.
- A coluna `respostas` sai como JSON em uma única célula; se preferir, posso gerar uma segunda versão com uma coluna por pergunta (p1..p15).
