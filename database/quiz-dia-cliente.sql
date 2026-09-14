-- Estrutura isolada para o quiz do Dia do Cliente.
-- Execute no banco que expõe o schema dashboard_tvsim pelo PostgREST.

create extension if not exists pgcrypto;

create table if not exists dashboard_tvsim.quiz_dia_cliente_respostas (
  id uuid primary key default gen_random_uuid(),
  token uuid not null default gen_random_uuid(),
  evento text not null,
  nome text not null,
  empresa text not null,
  respostas jsonb,
  pontuacao smallint,
  duracao_ms integer,
  status text not null default 'iniciada',
  iniciado_em timestamptz not null default clock_timestamp(),
  concluido_em timestamptz,
  criado_em timestamptz not null default clock_timestamp(),
  constraint quiz_dia_cliente_status_valido check (status in ('iniciada', 'concluida')),
  constraint quiz_dia_cliente_pontuacao_valida check (pontuacao between 0 and 7),
  constraint quiz_dia_cliente_duracao_valida check (duracao_ms >= 0),
  constraint quiz_dia_cliente_respostas_objeto check (
    respostas is null or jsonb_typeof(respostas) = 'object'
  )
);

create unique index if not exists quiz_dia_cliente_participante_unico
  on dashboard_tvsim.quiz_dia_cliente_respostas (
    evento,
    lower(regexp_replace(btrim(nome), '\s+', ' ', 'g')),
    lower(regexp_replace(btrim(empresa), '\s+', ' ', 'g'))
  );

create index if not exists quiz_dia_cliente_ordem_ranking
  on dashboard_tvsim.quiz_dia_cliente_respostas (
    evento,
    pontuacao desc,
    duracao_ms asc,
    concluido_em asc
  )
  where status = 'concluida';

create or replace function dashboard_tvsim.iniciar_quiz_dia_cliente(
  p_evento text,
  p_nome text,
  p_empresa text
)
returns jsonb
language plpgsql
security definer
set search_path = dashboard_tvsim, public
as $$
declare
  v_registro dashboard_tvsim.quiz_dia_cliente_respostas;
begin
  if char_length(btrim(p_nome)) < 2 or char_length(btrim(p_empresa)) < 2 then
    raise exception 'Nome e empresa são obrigatórios' using errcode = '22023';
  end if;

  begin
    insert into dashboard_tvsim.quiz_dia_cliente_respostas (evento, nome, empresa)
    values (
      left(btrim(p_evento), 120),
      left(regexp_replace(btrim(p_nome), '\s+', ' ', 'g'), 120),
      left(regexp_replace(btrim(p_empresa), '\s+', ' ', 'g'), 160)
    )
    returning * into v_registro;
  exception
    when unique_violation then
      raise exception 'Já existe uma participação para este nome e empresa' using errcode = '23505';
  end;

  return jsonb_build_object('id', v_registro.id, 'token', v_registro.token);
end;
$$;

create or replace function dashboard_tvsim.finalizar_quiz_dia_cliente(
  p_id uuid,
  p_token uuid,
  p_respostas jsonb,
  p_pontuacao smallint
)
returns jsonb
language plpgsql
security definer
set search_path = dashboard_tvsim, public
as $$
declare
  v_registro dashboard_tvsim.quiz_dia_cliente_respostas;
  v_concluido_em timestamptz := clock_timestamp();
begin
  if jsonb_typeof(p_respostas) <> 'object' or jsonb_object_length(p_respostas) <> 7 then
    raise exception 'As sete respostas são obrigatórias' using errcode = '22023';
  end if;

  if p_pontuacao < 0 or p_pontuacao > 7 then
    raise exception 'Pontuação inválida' using errcode = '22023';
  end if;

  select *
  into v_registro
  from dashboard_tvsim.quiz_dia_cliente_respostas
  where id = p_id and token = p_token
  for update;

  if not found then
    raise exception 'Participação inválida' using errcode = 'P0002';
  end if;

  -- Torna o envio seguro para repetição quando a conexão cai depois de concluir.
  if v_registro.status = 'concluida' then
    return jsonb_build_object(
      'pontuacao', v_registro.pontuacao,
      'duracao_ms', v_registro.duracao_ms
    );
  end if;

  update dashboard_tvsim.quiz_dia_cliente_respostas
  set respostas = p_respostas,
      pontuacao = p_pontuacao,
      duracao_ms = greatest(
        0,
        floor(extract(epoch from (v_concluido_em - iniciado_em)) * 1000)::integer
      ),
      concluido_em = v_concluido_em,
      status = 'concluida'
  where id = p_id
    and token = p_token
  returning * into v_registro;

  return jsonb_build_object(
    'pontuacao', v_registro.pontuacao,
    'duracao_ms', v_registro.duracao_ms
  );
end;
$$;

create or replace view dashboard_tvsim.quiz_dia_cliente_ranking as
select
  id,
  evento,
  nome,
  empresa,
  pontuacao,
  duracao_ms,
  concluido_em
from dashboard_tvsim.quiz_dia_cliente_respostas
where status = 'concluida';

revoke all on dashboard_tvsim.quiz_dia_cliente_respostas from public;
grant usage on schema dashboard_tvsim to public;
grant select on dashboard_tvsim.quiz_dia_cliente_ranking to public;
grant execute on function dashboard_tvsim.iniciar_quiz_dia_cliente(text, text, text) to public;
grant execute on function dashboard_tvsim.finalizar_quiz_dia_cliente(uuid, uuid, jsonb, smallint) to public;
