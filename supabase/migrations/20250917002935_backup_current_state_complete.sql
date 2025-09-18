--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'Esquema otimizado com políticas RLS melhoradas para performance';


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: http; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA public;


--
-- Name: EXTENSION http; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION http IS 'HTTP client for PostgreSQL, allows web page retrieval inside the database.';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: auto_distribute_allocation(uuid, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_distribute_allocation(payroll_entry_id uuid, target_units uuid[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  total_amount NUMERIC;
  amount_per_unit NUMERIC;
  unit_id UUID;
BEGIN
  -- Get total amount (base salary + bonus)
  SELECT (COALESCE(salario_base, 0) + COALESCE(bonus, 0))
  INTO total_amount
  FROM folha_pagamento
  WHERE id = payroll_entry_id;
  
  IF total_amount IS NULL OR total_amount = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Clear existing allocations
  DELETE FROM folha_rateio WHERE folha_pagamento_id = payroll_entry_id;
  
  -- Calculate amount per unit
  amount_per_unit := total_amount / array_length(target_units, 1);
  
  -- Insert new allocations
  FOREACH unit_id IN ARRAY target_units
  LOOP
    INSERT INTO folha_rateio (folha_pagamento_id, unidade_id, valor, percentual)
    VALUES (
      payroll_entry_id, 
      unit_id, 
      amount_per_unit,
      (amount_per_unit / total_amount) * 100
    );
  END LOOP;
  
  RETURN TRUE;
END;
$$;


--
-- Name: calculate_conditional_execution(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_conditional_execution(p_conditions jsonb) RETURNS timestamp with time zone
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_type TEXT;
  v_next_execution TIMESTAMPTZ;
BEGIN
  v_type := p_conditions->>'type';
  
  CASE v_type
    WHEN 'birthday' THEN
      -- Próximo aniversário (verificar diariamente às 9h)
      v_next_execution := (CURRENT_DATE + INTERVAL '1 day' + TIME '09:00');
    WHEN 'hire_anniversary' THEN
      -- Próximo aniversário de contratação (verificar diariamente às 9h)
      v_next_execution := (CURRENT_DATE + INTERVAL '1 day' + TIME '09:00');
    ELSE
      -- Verificação padrão a cada hora
      v_next_execution := NOW() + INTERVAL '1 hour';
  END CASE;
  
  RETURN v_next_execution;
END;
$$;


--
-- Name: calculate_next_execution(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_next_execution(p_pattern jsonb) RETURNS timestamp with time zone
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_type TEXT;
  v_interval INTEGER;
  v_time TEXT;
  v_days_of_week INTEGER[];
  v_next_execution TIMESTAMPTZ;
BEGIN
  v_type := p_pattern->>'type';
  v_interval := COALESCE((p_pattern->>'interval')::INTEGER, 1);
  v_time := COALESCE(p_pattern->>'time', '09:00');
  
  CASE v_type
    WHEN 'daily' THEN
      v_next_execution := (CURRENT_DATE + INTERVAL '1 day' + v_time::TIME);
    WHEN 'weekly' THEN
      v_days_of_week := ARRAY(SELECT jsonb_array_elements_text(p_pattern->'days_of_week')::INTEGER);
      -- Lógica para próximo dia da semana
      v_next_execution := (CURRENT_DATE + INTERVAL '7 days' + v_time::TIME);
    WHEN 'monthly' THEN
      v_next_execution := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + v_time::TIME);
    ELSE
      v_next_execution := NOW() + INTERVAL '1 hour'; -- Fallback
  END CASE;
  
  RETURN v_next_execution;
END;
$$;


--
-- Name: can_access_schedule_type(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_access_schedule_type(user_id uuid, schedule_type text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    CASE schedule_type
        WHEN 'notification' THEN
            RETURN check_user_permission(user_id, 'agendamentos.manage') OR
                   check_user_permission(user_id, 'agendamentos.view');
        WHEN 'nps' THEN
            RETURN check_user_permission(user_id, 'nps.create') OR
                   check_user_permission(user_id, 'nps.view');
        WHEN 'whatsapp' THEN
            RETURN check_user_permission(user_id, 'whatsapp.manage') OR
                   check_user_permission(user_id, 'whatsapp.view');
        WHEN 'email' THEN
            RETURN check_user_permission(user_id, 'agendamentos.manage') OR
                   check_user_permission(user_id, 'agendamentos.view');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;


--
-- Name: can_manage_schedule_type(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_manage_schedule_type(user_id uuid, schedule_type text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    CASE schedule_type
        WHEN 'notification' THEN
            RETURN check_user_permission(user_id, 'agendamentos.manage');
        WHEN 'nps' THEN
            RETURN check_user_permission(user_id, 'nps.create');
        WHEN 'whatsapp' THEN
            RETURN check_user_permission(user_id, 'whatsapp.manage');
        WHEN 'email' THEN
            RETURN check_user_permission(user_id, 'agendamentos.manage');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;


--
-- Name: can_modify_user(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_modify_user(target_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    current_user_role TEXT;
    target_user_role TEXT;
BEGIN
    -- Buscar role do usuário atual
    SELECT role INTO current_user_role 
    FROM users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'ativo';
    
    -- Buscar role do usuário alvo
    SELECT role INTO target_user_role 
    FROM users 
    WHERE id = target_user_id;
    
    -- Se não encontrou usuários, retornar false
    IF current_user_role IS NULL OR target_user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Super admin pode modificar qualquer um
    IF current_user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Admin pode modificar todos exceto super_admin
    IF current_user_role = 'admin' AND target_user_role != 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Usuário pode modificar a si mesmo
    IF target_user_id = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;


--
-- Name: can_promote_to_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_promote_to_admin(target_user_id uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    current_user_id UUID;
    current_user_role TEXT;
BEGIN
    -- Obter o ID do usuário autenticado
    current_user_id := auth.uid();
    
    -- Se não há usuário autenticado, retornar false
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Buscar role do usuário atual
    SELECT role INTO current_user_role 
    FROM users 
    WHERE auth_user_id = current_user_id 
    AND status = 'ativo';
    
    -- Se não encontrou usuário, retornar false
    IF current_user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Apenas super_admin pode promover para admin
    IF current_user_role != 'super_admin' THEN
        RETURN FALSE;
    END IF;
    
    -- Se foi fornecido um target_user_id, verificar se o usuário alvo existe e não é super_admin
    IF target_user_id IS NOT NULL THEN
        -- Verificar se o usuário alvo existe
        IF NOT EXISTS (SELECT 1 FROM users WHERE auth_user_id = target_user_id AND status = 'ativo') THEN
            RETURN FALSE;
        END IF;
        
        -- Verificar se o usuário alvo já é super_admin
        IF EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = target_user_id 
            AND role = 'super_admin' 
            AND status = 'ativo'
        ) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$;


--
-- Name: FUNCTION can_promote_to_admin(target_user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.can_promote_to_admin(target_user_id uuid) IS 'Verifica se o usuário atual pode promover outro usuário para admin. Apenas super_admin pode fazer isso.';


--
-- Name: check_auth_security_issues(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_auth_security_issues() RETURNS TABLE(issue_name text, issue_level text, current_status text, resolution_required text, manual_steps text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'auth_otp_long_expiry'::TEXT as issue_name,
    'WARN'::TEXT as issue_level,
    'REQUIRES_MANUAL_CONFIG'::TEXT as current_status,
    'Configure OTP expiry to 3600 seconds (1 hour) or less'::TEXT as resolution_required,
    'Go to Supabase Dashboard > Authentication > Settings > Auth > Set OTP expiry to 3600 seconds or less'::TEXT as manual_steps
  
  UNION ALL
  
  SELECT 
    'auth_leaked_password_protection'::TEXT as issue_name,
    'WARN'::TEXT as issue_level,
    'REQUIRES_MANUAL_CONFIG'::TEXT as current_status,
    'Enable leaked password protection using HaveIBeenPwned.org'::TEXT as resolution_required,
    'Go to Supabase Dashboard > Authentication > Settings > Auth > Enable "Prevent use of leaked passwords"'::TEXT as manual_steps;
END;
$$;


--
-- Name: check_channel_permission(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_channel_permission(p_user_id uuid, p_channel text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  CASE p_channel
    WHEN 'whatsapp' THEN
      RETURN check_user_permission(p_user_id, 'whatsapp_messages');
    WHEN 'email' THEN
      RETURN check_user_permission(p_user_id, 'email_messages');
    WHEN 'notification' THEN
      RETURN check_user_permission(p_user_id, 'notifications');
    WHEN 'nps' THEN
      RETURN check_user_permission(p_user_id, 'nps_surveys');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;


--
-- Name: FUNCTION check_channel_permission(p_user_id uuid, p_channel text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_channel_permission(p_user_id uuid, p_channel text) IS 'Verifica se usuário pode acessar canal específico';


--
-- Name: check_channel_permission(uuid, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_channel_permission(p_user_id uuid, p_channel character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
  CASE p_channel
    WHEN 'whatsapp' THEN
      -- Usar permissão de message_schedules ao invés de whatsapp_messages
      RETURN check_user_permission(p_user_id, 'message_schedules');
    WHEN 'email' THEN
      RETURN check_user_permission(p_user_id, 'email_messages');
    WHEN 'notification' THEN
      RETURN check_user_permission(p_user_id, 'notifications');
    WHEN 'nps' THEN
      RETURN check_user_permission(p_user_id, 'nps_surveys');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;


--
-- Name: check_document_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_document_status() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.status = 'vencido';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'vencendo';
    ELSE
      NEW.status = 'válido';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: check_duplicate_whatsapp_sends(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_duplicate_whatsapp_sends(survey_title text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  result JSON;
  total_sends INTEGER;
  unique_sends INTEGER;
  duplicates_count INTEGER;
BEGIN
  -- Contar total de envios para pesquisas com o título especificado
  SELECT COUNT(*) INTO total_sends
  FROM whatsapp_sends ws
  JOIN nps_surveys s ON ws.survey_id = s.id
  WHERE s.title = survey_title;
  
  -- Contar envios únicos (por user_id, survey_id, phone_number)
  SELECT COUNT(DISTINCT (ws.user_id, ws.survey_id, ws.phone_number)) INTO unique_sends
  FROM whatsapp_sends ws
  JOIN nps_surveys s ON ws.survey_id = s.id
  WHERE s.title = survey_title;
  
  -- Calcular duplicatas
  duplicates_count := total_sends - unique_sends;
  
  -- Retornar resultado como JSON
  result := json_build_object(
    'total_sends', total_sends,
    'unique_sends', unique_sends,
    'duplicates_count', duplicates_count,
    'has_duplicates', duplicates_count > 0
  );
  
  RETURN result;
END;
$$;


--
-- Name: FUNCTION check_duplicate_whatsapp_sends(survey_title text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_duplicate_whatsapp_sends(survey_title text) IS 'Verifica se há envios duplicados de WhatsApp para uma pesquisa NPS específica';


--
-- Name: check_performance_issues(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_performance_issues() RETURNS TABLE(issue_type text, description text, status text, details text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Verificar políticas RLS consolidadas
    RETURN QUERY
    SELECT 
        'RLS_POLICIES'::text,
        'Políticas RLS consolidadas'::text,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename IN ('benefit_documents', 'documents', 'evaluations', 'folha_pagamento', 'folha_rateio')
                    AND permissive = 'PERMISSIVE'
                GROUP BY tablename, unnest(roles), cmd
                HAVING COUNT(*) > 1
            ) THEN 'PENDING'
            ELSE 'FIXED'
        END::text,
        'Verificação de múltiplas políticas permissivas'::text;
    
    -- Verificar índices duplicados removidos
    RETURN QUERY
    SELECT 
        'DUPLICATE_INDEXES'::text,
        'Índices duplicados removidos'::text,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE indexname IN (
                    'idx_folha_colaborador',
                    'idx_rateio_folha',
                    'idx_folha_rateio_folha_pagamento_id'
                )
            ) THEN 'PENDING'
            ELSE 'FIXED'
        END::text,
        'Verificação de índices duplicados específicos'::text;
    
    -- Verificar novos índices de performance
    RETURN QUERY
    SELECT 
        'PERFORMANCE_INDEXES'::text,
        'Índices de performance criados'::text,
        CASE 
            WHEN (
                SELECT COUNT(*) FROM pg_indexes 
                WHERE indexname IN (
                    'idx_users_role',
                    'idx_benefit_documents_employee_benefit_id',
                    'idx_employee_benefits_employee_id',
                    'idx_documents_employee_id',
                    'idx_evaluations_employee_evaluator',
                    'idx_evaluations_employee_id',
                    'idx_evaluations_evaluator_id'
                )
            ) = 7 THEN 'FIXED'
            ELSE 'PENDING'
        END::text,
        'Verificação de índices de performance específicos'::text;
        
END;
$$;


--
-- Name: check_permission(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_permission(permission_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    current_user_id UUID;
    user_role_name TEXT;
BEGIN
    -- Obter o ID do usuário autenticado
    current_user_id := auth.uid();
    
    -- Se não há usuário autenticado, retornar false
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Buscar role do usuário atual
    SELECT role INTO user_role_name 
    FROM users 
    WHERE auth_user_id = current_user_id 
    AND status = 'ativo';
    
    -- Se não encontrou usuário, retornar false
    IF user_role_name IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Super admin e admin têm acesso total
    IF user_role_name IN ('super_admin', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se o usuário tem a permissão específica
    RETURN EXISTS (
        SELECT 1
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE r.name = user_role_name
        AND p.name = permission_name
    );
END;
$$;


--
-- Name: FUNCTION check_permission(permission_name text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_permission(permission_name text) IS 'Verifica se o usuário atual tem uma permissão específica usando o sistema atual de roles e permissões';


--
-- Name: check_schedule_system_health(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_schedule_system_health() RETURNS TABLE(component text, health_status text, details jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar tabelas principais
  RETURN QUERY
  SELECT 
    'message_schedules_table'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM message_schedules) THEN 'healthy' ELSE 'empty' END::TEXT,
    jsonb_build_object(
      'total_schedules', (SELECT COUNT(*) FROM message_schedules),
      'active_schedules', (SELECT COUNT(*) FROM message_schedules WHERE message_schedules.status = 'active'),
      'paused_schedules', (SELECT COUNT(*) FROM message_schedules WHERE message_schedules.status = 'paused')
    )
  
  UNION ALL
  
  SELECT 
    'schedule_logs_table'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM schedule_logs) THEN 'healthy' ELSE 'empty' END::TEXT,
    jsonb_build_object(
      'total_logs', (SELECT COUNT(*) FROM schedule_logs),
      'successful_executions', (SELECT COUNT(*) FROM schedule_logs WHERE schedule_logs.status = 'completed'),
      'failed_executions', (SELECT COUNT(*) FROM schedule_logs WHERE schedule_logs.status = 'failed')
    )
  
  UNION ALL
  
  SELECT 
    'pg_cron_jobs'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname LIKE '%schedule%') THEN 'configured' ELSE 'missing' END::TEXT,
    jsonb_build_object(
      'active_jobs', (SELECT COUNT(*) FROM cron.job WHERE jobname LIKE '%schedule%' AND active = true),
      'total_jobs', (SELECT COUNT(*) FROM cron.job WHERE jobname LIKE '%schedule%')
    )
  
  UNION ALL
  
  SELECT 
    'rls_policies'::TEXT,
    'configured'::TEXT,
    jsonb_build_object(
      'message_schedules_policies', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'message_schedules' AND schemaname = 'public'
      ),
      'schedule_logs_policies', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'schedule_logs' AND schemaname = 'public'
      )
    );
END;
$$;


--
-- Name: FUNCTION check_schedule_system_health(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_schedule_system_health() IS 'Verifica a saúde geral do sistema de agendamentos';


--
-- Name: check_user_permission(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_user_permission(p_user_id uuid, p_permission text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_user_role TEXT;
  v_role_id UUID;
  v_permission_exists BOOLEAN := FALSE;
BEGIN
  -- Buscar role do usuário
  SELECT role INTO v_user_role
  FROM users 
  WHERE auth_user_id = p_user_id;
  
  -- Super admin e admin têm todas as permissões
  IF v_user_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar ID da role
  SELECT id INTO v_role_id
  FROM roles 
  WHERE name = v_user_role;
  
  -- Se não encontrou a role, retorna FALSE
  IF v_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se tem a permissão específica
  SELECT EXISTS(
    SELECT 1 
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = v_role_id 
    AND p.name = p_permission
  ) INTO v_permission_exists;
  
  RETURN v_permission_exists;
END;
$$;


--
-- Name: FUNCTION check_user_permission(p_user_id uuid, p_permission text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_user_permission(p_user_id uuid, p_permission text) IS 'Verifica se usuário tem permissão específica';


--
-- Name: cleanup_expired_sessions_enhanced(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_sessions_enhanced() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  deleted_sessions integer := 0;
  deleted_recovery_tokens integer := 0;
  deleted_email_change_tokens integer := 0;
  deleted_confirmation_tokens integer := 0;
BEGIN
  -- Limpar sessões inativas por mais de 8 horas
  DELETE FROM auth.sessions 
  WHERE updated_at < NOW() - INTERVAL '8 hours';
  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
  
  -- Limpar tokens de recuperação expirados (mais de 30 minutos)
  UPDATE auth.users 
  SET recovery_token = NULL, recovery_sent_at = NULL
  WHERE recovery_sent_at IS NOT NULL 
    AND recovery_sent_at < NOW() - INTERVAL '30 minutes';
  GET DIAGNOSTICS deleted_recovery_tokens = ROW_COUNT;
  
  -- Limpar tokens de mudança de email expirados (mais de 30 minutos)
  UPDATE auth.users 
  SET email_change_token_new = NULL, email_change_sent_at = NULL
  WHERE email_change_sent_at IS NOT NULL 
    AND email_change_sent_at < NOW() - INTERVAL '30 minutes';
  GET DIAGNOSTICS deleted_email_change_tokens = ROW_COUNT;
  
  -- Limpar tokens de confirmação expirados (mais de 2 horas)
  UPDATE auth.users 
  SET confirmation_token = NULL, confirmation_sent_at = NULL
  WHERE confirmation_sent_at IS NOT NULL 
    AND confirmation_sent_at < NOW() - INTERVAL '2 hours'
    AND email_confirmed_at IS NULL;
  GET DIAGNOSTICS deleted_confirmation_tokens = ROW_COUNT;
  
  -- Registrar a operação de limpeza
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    NULL,
    'CLEANUP_EXPIRED_SESSIONS',
    json_build_object(
      'deleted_sessions', deleted_sessions,
      'deleted_recovery_tokens', deleted_recovery_tokens,
      'deleted_email_change_tokens', deleted_email_change_tokens,
      'deleted_confirmation_tokens', deleted_confirmation_tokens
    ),
    '127.0.0.1',
    'System Cleanup',
    NOW()
  );
END;
$$;


--
-- Name: cleanup_expired_tokens(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_tokens() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Limpar sessões expiradas (mais de 24 horas)
    DELETE FROM auth.sessions 
    WHERE updated_at < NOW() - INTERVAL '24 hours';
    
    -- Limpar tokens de recuperação expirados (mais de 1 hora)
    UPDATE auth.users 
    SET 
        recovery_token = NULL,
        recovery_sent_at = NULL
    WHERE recovery_sent_at < NOW() - INTERVAL '1 hour'
    AND recovery_token IS NOT NULL;
    
    -- Limpar tokens de confirmação expirados (mais de 24 horas)
    UPDATE auth.users 
    SET 
        confirmation_token = NULL,
        confirmation_sent_at = NULL
    WHERE confirmation_sent_at < NOW() - INTERVAL '24 hours'
    AND confirmation_token IS NOT NULL
    AND email_confirmed_at IS NULL;
    
    -- Limpar tokens de mudança de email expirados (mais de 1 hora)
    UPDATE auth.users 
    SET 
        email_change_token_new = NULL,
        email_change_token_current = NULL,
        email_change = NULL,
        email_change_sent_at = NULL
    WHERE email_change_sent_at < NOW() - INTERVAL '1 hour'
    AND email_change_token_new IS NOT NULL;
    
    RAISE NOTICE 'Limpeza de tokens expirados concluída';
END;
$$;


--
-- Name: FUNCTION cleanup_expired_tokens(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cleanup_expired_tokens() IS 'Remove tokens expirados e sessões antigas para melhorar a segurança';


--
-- Name: cleanup_old_schedule_logs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_schedule_logs() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Manter apenas logs dos últimos 90 dias
  DELETE FROM schedule_logs 
  WHERE executed_at < NOW() - INTERVAL '90 days';
  
  -- Log da limpeza
  RAISE NOTICE 'Limpeza de logs concluída: %', NOW();
END;
$$;


--
-- Name: FUNCTION cleanup_old_schedule_logs(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cleanup_old_schedule_logs() IS 'Função para limpeza automática de logs antigos';


--
-- Name: create_admin_user(text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_admin_user(user_email text, user_name text, user_role text DEFAULT 'usuario'::text, user_department text DEFAULT NULL::text, user_position text DEFAULT NULL::text, user_phone text DEFAULT NULL::text) RETURNS TABLE(user_id uuid, generated_password text, success boolean, message text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_user_id UUID;
  random_password TEXT;
  auth_result JSONB;
BEGIN
  -- Gerar senha aleatória de 12 caracteres
  random_password := array_to_string(
    ARRAY(
      SELECT chr((ascii('A') + round(random() * 25))::integer)
      FROM generate_series(1, 4)
    ) ||
    ARRAY(
      SELECT chr((ascii('a') + round(random() * 25))::integer)
      FROM generate_series(1, 4)
    ) ||
    ARRAY(
      SELECT chr((ascii('0') + round(random() * 9))::integer)
      FROM generate_series(1, 4)
    ), ''
  );
  
  -- Criar usuário no auth.users usando admin API
  SELECT auth.create_user(
    email => user_email,
    password => random_password,
    email_confirm => true
  ) INTO auth_result;
  
  -- Extrair o ID do usuário criado
  new_user_id := (auth_result->>'id')::UUID;
  
  -- Criar perfil na tabela profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    department,
    position,
    phone,
    status,
    preferences
  ) VALUES (
    new_user_id,
    user_name,
    user_role,
    user_department,
    user_position,
    user_phone,
    'active',
    CASE 
      WHEN user_role = 'admin' THEN '{"super_user": true}'
      ELSE '{}'
    END::jsonb
  );
  
  RETURN QUERY SELECT 
    new_user_id,
    random_password,
    true,
    'Usuário criado com sucesso';
    
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT 
    NULL::UUID,
    NULL::TEXT,
    false,
    SQLERRM;
END;
$$;


--
-- Name: create_message_schedule(character varying, text, character varying, character varying, timestamp with time zone, jsonb, character varying, jsonb, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_message_schedule(p_title character varying, p_message text, p_channel character varying, p_schedule_type character varying, p_scheduled_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_recurring_pattern jsonb DEFAULT NULL::jsonb, p_target_type character varying DEFAULT 'all'::character varying, p_target_filters jsonb DEFAULT NULL::jsonb, p_channel_config jsonb DEFAULT NULL::jsonb, p_created_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_schedule_id UUID;
    v_user_id UUID;
    v_consolidated_config JSONB;
BEGIN
    -- Obter ID do usuário atual se não fornecido
    IF p_created_by IS NULL THEN
        v_user_id := auth.uid();
    ELSE
        v_user_id := p_created_by;
    END IF;
    
    -- Verificar se o usuário está autenticado
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Consolidar configuração do canal
    v_consolidated_config := COALESCE(p_channel_config, '{}'::jsonb) || 
        jsonb_build_object(
            'original_message', p_message,
            'message_type', 'general'
        );
    
    -- Inserir novo agendamento
    INSERT INTO message_schedules (
        title,
        message,
        channel,
        schedule_type,
        scheduled_at,
        recurring_pattern,
        target_type,
        target_filters,
        channel_config,
        status,
        created_by,
        execution_stats
    ) VALUES (
        p_title,
        p_message,
        p_channel,
        p_schedule_type,
        p_scheduled_at,
        p_recurring_pattern,
        p_target_type,
        p_target_filters,
        v_consolidated_config,
        CASE 
            WHEN p_schedule_type = 'immediate' THEN 'pending'
            ELSE 'active'
        END,
        v_user_id,
        jsonb_build_object(
            'execution_count', 0,
            'success_count', 0,
            'error_count', 0,
            'max_executions', NULL,
            'last_error', NULL
        )
    ) RETURNING id INTO v_schedule_id;
    
    -- Calcular próxima execução para agendamentos recorrentes
    IF p_schedule_type = 'recurring' AND p_recurring_pattern IS NOT NULL THEN
        UPDATE message_schedules 
        SET next_execution_at = COALESCE(p_scheduled_at, NOW())
        WHERE id = v_schedule_id;
    ELSIF p_schedule_type = 'scheduled' AND p_scheduled_at IS NOT NULL THEN
        UPDATE message_schedules 
        SET next_execution_at = p_scheduled_at
        WHERE id = v_schedule_id;
    END IF;
    
    RETURN v_schedule_id;
END;
$$;


--
-- Name: create_message_schedule(text, text, text, text, timestamp with time zone, jsonb, jsonb, text, jsonb, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_message_schedule(p_title text, p_message text, p_channel text, p_schedule_type text, p_scheduled_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_recurring_pattern jsonb DEFAULT NULL::jsonb, p_conditions jsonb DEFAULT NULL::jsonb, p_target_type text DEFAULT 'all'::text, p_target_filters jsonb DEFAULT NULL::jsonb, p_channel_config jsonb DEFAULT NULL::jsonb, p_created_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_schedule_id UUID;
  v_next_execution TIMESTAMPTZ;
BEGIN
  -- Calcular próxima execução
  IF p_schedule_type = 'immediate' THEN
    v_next_execution := NOW();
  ELSIF p_schedule_type = 'scheduled' THEN
    v_next_execution := p_scheduled_at;
  ELSIF p_schedule_type = 'recurring' AND p_recurring_pattern IS NOT NULL THEN
    v_next_execution := NOW() + INTERVAL '1 hour'; -- Placeholder para cálculo de recorrência
  END IF;

  -- Inserir agendamento
  INSERT INTO message_schedules (
    title, message, channel, schedule_type,
    scheduled_at, recurring_pattern,
    target_type, target_filters, channel_config,
    created_by, next_execution_at, execution_stats
  ) VALUES (
    p_title, p_message, p_channel, p_schedule_type,
    p_scheduled_at, p_recurring_pattern,
    p_target_type, p_target_filters, p_channel_config,
    COALESCE(p_created_by, auth.uid()), v_next_execution,
    jsonb_build_object(
      'execution_count', 0,
      'success_count', 0,
      'error_count', 0
    )
  ) RETURNING id INTO v_schedule_id;

  RETURN v_schedule_id;
END;
$$;


--
-- Name: create_message_schedule(character varying, text, character varying, character varying, timestamp with time zone, jsonb, jsonb, character varying, jsonb, jsonb, integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_message_schedule(p_title character varying, p_message text, p_channel character varying, p_schedule_type character varying, p_scheduled_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_recurring_pattern jsonb DEFAULT NULL::jsonb, p_conditions jsonb DEFAULT NULL::jsonb, p_target_type character varying DEFAULT 'all'::character varying, p_target_filters jsonb DEFAULT NULL::jsonb, p_channel_config jsonb DEFAULT NULL::jsonb, p_max_executions integer DEFAULT NULL::integer, p_created_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_schedule_id UUID;
  v_next_execution TIMESTAMPTZ;
BEGIN
  -- Calcular próxima execução
  IF p_schedule_type = 'immediate' THEN
    v_next_execution := NOW();
  ELSIF p_schedule_type = 'scheduled' THEN
    v_next_execution := p_scheduled_at;
  ELSIF p_schedule_type = 'recurring' AND p_recurring_pattern IS NOT NULL THEN
    v_next_execution := calculate_next_execution(p_recurring_pattern);
  ELSIF p_schedule_type = 'conditional' THEN
    v_next_execution := calculate_conditional_execution(p_conditions);
  END IF;

  -- Inserir agendamento
  INSERT INTO message_schedules (
    title, message, channel, schedule_type,
    scheduled_at, recurring_pattern, conditions,
    target_type, target_filters, channel_config,
    max_executions, created_by, next_execution_at
  ) VALUES (
    p_title, p_message, p_channel, p_schedule_type,
    p_scheduled_at, p_recurring_pattern, p_conditions,
    p_target_type, p_target_filters, p_channel_config,
    p_max_executions, COALESCE(p_created_by, auth.uid()), v_next_execution
  ) RETURNING id INTO v_schedule_id;

  RETURN v_schedule_id;
END;
$$;


--
-- Name: FUNCTION create_message_schedule(p_title character varying, p_message text, p_channel character varying, p_schedule_type character varying, p_scheduled_at timestamp with time zone, p_recurring_pattern jsonb, p_conditions jsonb, p_target_type character varying, p_target_filters jsonb, p_channel_config jsonb, p_max_executions integer, p_created_by uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_message_schedule(p_title character varying, p_message text, p_channel character varying, p_schedule_type character varying, p_scheduled_at timestamp with time zone, p_recurring_pattern jsonb, p_conditions jsonb, p_target_type character varying, p_target_filters jsonb, p_channel_config jsonb, p_max_executions integer, p_created_by uuid) IS 'Cria um novo agendamento de mensagem';


--
-- Name: create_nps_schedule(text, text, text, text, timestamp with time zone, jsonb, jsonb, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_nps_schedule(p_title text, p_message text, p_channel text, p_schedule_type text, p_scheduled_at timestamp with time zone, p_recurring_pattern jsonb, p_target_filters jsonb, p_nps_data jsonb, p_created_by uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_schedule_id UUID;
    v_target_type TEXT;
    v_next_execution_at TIMESTAMPTZ;
    v_auth_user_id UUID;
BEGIN
    -- Determinar auth_user_id para created_by
    IF p_created_by IS NOT NULL THEN
        -- Se p_created_by foi passado, assumir que é o id da tabela users
        -- e buscar o auth_user_id correspondente
        SELECT auth_user_id INTO v_auth_user_id FROM users WHERE id = p_created_by;
        
        IF v_auth_user_id IS NULL THEN
            RAISE EXCEPTION 'Usuário não encontrado para o ID fornecido';
        END IF;
    ELSIF auth.uid() IS NOT NULL THEN
        v_auth_user_id := auth.uid();
    ELSE
        -- Usar um super_admin como fallback
        SELECT auth_user_id INTO v_auth_user_id
        FROM users 
        WHERE role = 'super_admin' 
        LIMIT 1;
        
        IF v_auth_user_id IS NULL THEN
            RAISE EXCEPTION 'Nenhum usuário válido encontrado para criar o agendamento';
        END IF;
    END IF;
    
    -- Verificar permissão usando auth_user_id
    IF NOT can_manage_schedule_type(v_auth_user_id, 'nps') THEN
        RAISE EXCEPTION 'Usuário não tem permissão para criar agendamentos NPS';
    END IF;
    
    -- Determinar target_type baseado nos filtros
    IF p_target_filters ? 'user_ids' THEN
        v_target_type := 'specific';
    ELSIF p_target_filters ? 'departments' THEN
        v_target_type := 'department';
    ELSIF p_target_filters ? 'roles' THEN
        v_target_type := 'role';
    ELSIF p_target_filters != '{}' THEN
        v_target_type := 'conditional';
    ELSE
        v_target_type := 'all';
    END IF;
    
    -- Determinar next_execution_at
    IF p_schedule_type = 'immediate' THEN
        v_next_execution_at := NOW();
    ELSIF p_scheduled_at IS NOT NULL THEN
        v_next_execution_at := p_scheduled_at;
    ELSE
        v_next_execution_at := NOW();
    END IF;
    
    -- Inserir o agendamento com status 'active' usando auth_user_id
    INSERT INTO message_schedules (
        title,
        message,
        channel,
        schedule_type,
        scheduled_at,
        recurring_pattern,
        target_type,
        target_filters,
        channel_config,
        status,
        created_by,
        next_execution_at,
        nps_data,
        type,
        execution_stats
    ) VALUES (
        p_title,
        p_message,
        p_channel,
        p_schedule_type,
        p_scheduled_at,
        p_recurring_pattern,
        v_target_type,
        p_target_filters,
        '{}', -- channel_config vazio para NPS
        'active', -- Status ativo para processamento imediato
        v_auth_user_id, -- Usar auth_user_id aqui
        v_next_execution_at,
        p_nps_data,
        'nps',
        jsonb_build_object(
            'execution_count', 0,
            'success_count', 0,
            'error_count', 0
        )
    ) RETURNING id INTO v_schedule_id;
    
    RETURN v_schedule_id;
END;
$$;


--
-- Name: create_whatsapp_schedule(text, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_whatsapp_schedule(p_name text, p_survey_id uuid, p_target_users text, p_schedule_type text DEFAULT 'immediate'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    schedule_id UUID;
    valid_user_id UUID;
    survey_record RECORD;
    base_url TEXT;
    nps_message TEXT;
    target_users_jsonb JSONB;
    response_token TEXT;
BEGIN
    -- Obter URL base das configurações do sistema
    SELECT get_system_setting('app_base_url') INTO base_url;
    
    -- Se não encontrar configuração, usar URL padrão
    IF base_url IS NULL OR base_url = '' THEN
        base_url := 'https://la-music-harmonize.vercel.app';
    END IF;
    
    -- Converter string para JSONB se necessário
    BEGIN
        target_users_jsonb := p_target_users::jsonb;
    EXCEPTION
        WHEN OTHERS THEN
            -- Se falhar, assumir que é um array vazio
            target_users_jsonb := '[]'::jsonb;
    END;
    
    -- Obter dados da pesquisa
    SELECT title, description INTO survey_record
    FROM nps_surveys
    WHERE id = p_survey_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pesquisa NPS não encontrada: %', p_survey_id;
    END IF;
    
    -- Obter um usuário válido da tabela users
    SELECT id INTO valid_user_id FROM users LIMIT 1;
    
    -- Gerar token único para a resposta NPS
    response_token := encode(gen_random_bytes(16), 'hex');
    
    -- Gerar mensagem NPS com formato correto: <base_url>/nps/<token>
    nps_message := format(
        'Olá! 👋\n\nGostaríamos de saber sua opinião sobre nossos serviços.\n\n📊 *%s*\n\nClique no link para responder:\n%s/nps/%s\n\n_Sua opinião é muito importante para nós!_',
        survey_record.title,
        base_url,
        response_token
    );
    
    -- Inserir na tabela message_schedules com type = 'nps'
    INSERT INTO message_schedules (
        type,
        title,
        message,
        content,
        channel,
        nps_data,
        target_type,
        target_filters,
        schedule_type,
        status,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        'nps',
        p_name,
        nps_message,
        nps_message,
        'whatsapp',
        jsonb_build_object(
            'survey_id', p_survey_id,
            'survey_title', survey_record.title,
            'message_template', nps_message,
            'response_token', response_token,
            'target_users', target_users_jsonb,
            'base_url', base_url
        ),
        CASE 
            WHEN jsonb_array_length(target_users_jsonb) > 0 THEN 'specific'
            ELSE 'all'
        END,
        CASE 
            WHEN jsonb_array_length(target_users_jsonb) > 0 THEN jsonb_build_object('user_ids', target_users_jsonb)
            ELSE '{}'
        END,
        p_schedule_type,
        'active',
        COALESCE(auth.uid(), valid_user_id),
        NOW(),
        NOW()
    )
    RETURNING id INTO schedule_id;
    
    -- Log da criação usando level em maiúsculas
    INSERT INTO message_schedule_logs (
        schedule_id,
        level,
        message,
        context
    ) VALUES (
        schedule_id,
        'INFO',
        'Agendamento NPS criado com URL configurável',
        jsonb_build_object(
            'survey_id', p_survey_id,
            'survey_title', survey_record.title,
            'name', p_name,
            'target_users_count', jsonb_array_length(target_users_jsonb),
            'schedule_type', p_schedule_type,
            'base_url', base_url,
            'response_token', response_token,
            'message_length', length(nps_message),
            'url_format', 'base_url/nps/token',
            'url_source', 'system_settings'
        )
    );
    
    RETURN schedule_id;
END;
$$;


--
-- Name: cron_process_message_schedules(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cron_process_message_schedules() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  schedule_record message_schedules%ROWTYPE;
BEGIN
  FOR schedule_record IN
    SELECT * FROM message_schedules
    WHERE next_execution_at IS NOT NULL
      AND next_execution_at <= NOW()
      AND status = 'active'
    ORDER BY next_execution_at ASC
  LOOP
    -- Processar agendamento NPS
    IF schedule_record.type = 'nps' THEN
      PERFORM process_nps_schedule(schedule_record::message_schedules);
    END IF;
    
    -- Atualizar o agendamento após processamento
    IF schedule_record.schedule_type = 'immediate' THEN
      -- Agendamento único - marcar como completed e limpar next_execution_at
      UPDATE message_schedules 
      SET 
        status = 'completed',
        last_executed_at = NOW(),
        next_execution_at = NULL, -- CORREÇÃO: Limpar next_execution_at
        updated_at = NOW()
      WHERE id = schedule_record.id;
    ELSE
      -- Agendamento recorrente - calcular próxima execução
      UPDATE message_schedules 
      SET 
        last_executed_at = NOW(),
        next_execution_at = CASE 
          WHEN schedule_record.recurring_pattern IS NOT NULL THEN
            -- Calcular próxima execução baseada no padrão recorrente
            NOW() + INTERVAL '1 day' -- Placeholder - implementar lógica de recorrência
          ELSE
            NULL
        END,
        updated_at = NOW()
      WHERE id = schedule_record.id;
    END IF;
  END LOOP;
END;
$$;


--
-- Name: FUNCTION cron_process_message_schedules(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cron_process_message_schedules() IS 'Função corrigida para evitar reprocessamento de agendamentos completados';


--
-- Name: delete_user_by_id(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_user_by_id(user_id_param text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  user_record RECORD;
  deleted_from text[] := '{}';
  errors text[] := '{}';
  has_auth_user_id boolean := false;
BEGIN
  -- Find the user in the users table
  SELECT id, auth_user_id, email, full_name
  INTO user_record
  FROM public.users
  WHERE auth_user_id::text = user_id_param OR id::text = user_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  has_auth_user_id := user_record.auth_user_id IS NOT NULL;
  
  -- Delete from users table
  BEGIN
    DELETE FROM public.users WHERE id = user_record.id;
    deleted_from := array_append(deleted_from, 'users');
  EXCEPTION WHEN OTHERS THEN
    errors := array_append(errors, 'users: ' || SQLERRM);
  END;
  
  -- Note: We cannot delete from auth.users via SQL function
  -- This would need to be handled by the Edge Function or admin API
  IF has_auth_user_id THEN
    deleted_from := array_append(deleted_from, 'users (auth record exists but not deleted)');
  ELSE
    deleted_from := array_append(deleted_from, 'users (no auth record)');
  END IF;
  
  RETURN json_build_object(
    'success', array_length(deleted_from, 1) > 0,
    'message', 'User deletion completed',
    'deletedFrom', deleted_from,
    'errors', CASE WHEN array_length(errors, 1) > 0 THEN errors ELSE null END,
    'userId', user_id_param
  );
END;
$$;


--
-- Name: extract_date_immutable(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.extract_date_immutable(timestamp with time zone) RETURNS date
    LANGUAGE sql IMMUTABLE
    AS $_$
  SELECT $1::date;
$_$;


--
-- Name: fill_nps_response_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fill_nps_response_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Se os campos já estão preenchidos, não fazer nada
    IF NEW.survey_id IS NOT NULL AND NEW.employee_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Tentar encontrar dados baseado no token em agendamentos recentes
    -- O token é gerado como SHA256(user_id + survey_id + timestamp)
    -- Vamos buscar em message_schedules ativos dos últimos 7 dias
    WITH recent_schedules AS (
        SELECT 
            ms.id as schedule_id,
            ms.target_filters,
            (ms.nps_data->>'survey_id')::uuid as survey_id,
            u.id as user_id,
            u.phone
        FROM message_schedules ms
        CROSS JOIN LATERAL (
            SELECT jsonb_array_elements_text(ms.target_filters->'user_ids')::uuid as user_id
        ) user_ids
        JOIN users u ON u.id = user_ids.user_id
        WHERE ms.type = 'nps' 
        AND ms.status = 'active'
        AND ms.created_at > NOW() - INTERVAL '7 days'
    )
    SELECT rs.survey_id, rs.user_id, rs.phone
    INTO NEW.survey_id, NEW.employee_id, NEW.phone_number
    FROM recent_schedules rs
    WHERE EXISTS (
        -- Verificar se algum token possível corresponde ao token fornecido
        SELECT 1 
        FROM generate_series(
            extract(epoch from NOW() - INTERVAL '24 hours')::integer,
            extract(epoch from NOW())::integer,
            3600  -- Verificar a cada hora nas últimas 24h
        ) as ts
        WHERE encode(digest(CONCAT(rs.user_id::text, rs.survey_id::text, ts::text), 'sha256'), 'hex') = NEW.response_token
    )
    LIMIT 1;
    
    -- Se não encontrou pelos agendamentos, tentar buscar por pesquisas ativas
    IF NEW.survey_id IS NULL THEN
        SELECT ns.id INTO NEW.survey_id
        FROM nps_surveys ns
        WHERE ns.status = 'active'
        ORDER BY ns.created_at DESC
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: generate_nps_link_token(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_nps_link_token(p_survey_id uuid, p_user_name text, p_user_phone text) RETURNS TABLE(token uuid, nps_url text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_token UUID;
    v_base_url TEXT := 'https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/nps/';
BEGIN
    -- Gerar token UUID único
    v_token := gen_random_uuid();
    
    -- Inserir token na tabela nps_tokens
    INSERT INTO nps_tokens (
        token,
        survey_id,
        user_name,
        user_phone,
        is_active,
        created_at
    ) VALUES (
        v_token::TEXT,
        p_survey_id,
        p_user_name,
        p_user_phone,
        true,
        NOW()
    );
    
    -- Retornar token e URL
    RETURN QUERY SELECT 
        v_token as token,
        (v_base_url || v_token::TEXT) as nps_url;
END;
$$;


--
-- Name: generate_random_password(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_random_password(length integer DEFAULT 12) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$_$;


--
-- Name: generate_response_token(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_response_token() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;


--
-- Name: get_all_permissions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_permissions() RETURNS TABLE(permission_name text, permission_description text, module_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name as permission_name,
    p.description as permission_description,
    SPLIT_PART(p.name, ':', 1) as module_name
  FROM permissions p
  ORDER BY SPLIT_PART(p.name, ':', 1), p.name;
END;
$$;


--
-- Name: get_all_system_settings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_system_settings() RETURNS TABLE(key text, value text, description text, category text, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT s.key, s.value, s.description, s.category, s.updated_at
    FROM system_settings s
    ORDER BY s.category, s.key;
END;
$$;


--
-- Name: get_avatar_url(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_avatar_url(avatar_path text) RETURNS text
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF avatar_path IS NULL OR avatar_path = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN 'https://dzmatfnltgtgjvbputtb.supabase.co/storage/v1/object/public/avatars/' || avatar_path;
END;
$$;


--
-- Name: get_configurable_roles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_configurable_roles() RETURNS TABLE(role_id uuid, role_name text, role_description text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Verificar se o usuário tem permissão para gerenciar roles
    IF NOT check_permission('settings.manage_roles') THEN
        RAISE EXCEPTION 'Acesso negado: você não tem permissão para visualizar roles configuráveis';
    END IF;
    
    RETURN QUERY
    SELECT 
        r.id as role_id,
        r.name as role_name,
        r.description as role_description
    FROM roles r
    WHERE r.name NOT IN ('super_admin', 'admin')
    ORDER BY r.name;
END;
$$;


--
-- Name: FUNCTION get_configurable_roles(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_configurable_roles() IS 'Retorna os roles que podem ser configurados (exceto super_admin e admin)';


--
-- Name: get_cron_jobs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_cron_jobs() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
BEGIN
  -- Obter informações dos cron jobs
  SELECT json_agg(
    json_build_object(
      'jobid', jobid,
      'schedule', schedule,
      'command', command,
      'nodename', nodename,
      'nodeport', nodeport,
      'database', database,
      'username', username,
      'active', active,
      'jobname', jobname
    )
  ) INTO result
  FROM cron.job;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;


--
-- Name: FUNCTION get_cron_jobs(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_cron_jobs() IS 'Retorna informações dos cron jobs ativos no sistema';


--
-- Name: get_documents_with_employees(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_documents_with_employees() RETURNS TABLE(id uuid, employee_id uuid, document_name text, document_type text, file_name text, file_path text, file_size bigint, mime_type text, expiry_date date, status text, notes text, uploaded_by text, created_at timestamp with time zone, updated_at timestamp with time zone, employee jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.employee_id,
    d.document_name,
    d.document_type,
    d.file_name,
    d.file_path,
    d.file_size,
    d.mime_type,
    d.expiry_date,
    d.status,
    d.notes,
    d.uploaded_by,
    d.created_at,
    d.updated_at,
    jsonb_build_object(
      'id', u.id,
      'full_name', u.full_name,
      'email', u.email,
      'role', u.role,
      'department', u.department,
      'position', u.position
    ) as employee
  FROM documents d
  LEFT JOIN users u ON d.employee_id = u.id
  WHERE d.deleted_at IS NULL
  ORDER BY d.created_at DESC;
END;
$$;


--
-- Name: get_employee_ranking(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employee_ranking(program_filter text DEFAULT NULL::text, evaluation_period_filter text DEFAULT NULL::text) RETURNS TABLE(employee_id uuid, employee_name text, employee_role text, employee_unit text, fideliza_stars integer, matriculador_stars integer, professor_stars integer, total_stars integer, ranking_position integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as employee_id,
    u.full_name as employee_name,
    u.role as employee_role,
    COALESCE(array_to_string(u.units, ', '), 'N/A') as employee_unit,
    COALESCE(SUM(CASE WHEN rp.name = 'Fideliza' THEN ce.stars_awarded ELSE 0 END), 0)::INTEGER as fideliza_stars,
    COALESCE(SUM(CASE WHEN rp.name = 'Matriculador' THEN ce.stars_awarded ELSE 0 END), 0)::INTEGER as matriculador_stars,
    COALESCE(SUM(CASE WHEN rp.name = 'Professor' THEN ce.stars_awarded ELSE 0 END), 0)::INTEGER as professor_stars,
    COALESCE(SUM(ce.stars_awarded), 0)::INTEGER as total_stars,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ce.stars_awarded), 0) DESC)::INTEGER as ranking_position
  FROM public.users u
  LEFT JOIN public.evaluations e ON u.id = e.employee_id
  LEFT JOIN public.criterion_evaluations ce ON e.id = ce.evaluation_id
  LEFT JOIN public.recognition_criteria rc ON ce.criterion_id = rc.id
  LEFT JOIN public.recognition_programs rp ON rc.program_id = rp.id
  WHERE 
    (program_filter IS NULL OR rp.id = program_filter::UUID)
    AND (evaluation_period_filter IS NULL OR e.period = evaluation_period_filter)
  GROUP BY u.id, u.full_name, u.role, u.units
  ORDER BY total_stars DESC;
END;
$$;


--
-- Name: get_nps_schedules(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_nps_schedules() RETURNS TABLE(id uuid, title character varying, content text, schedule_type character varying, scheduled_at timestamp with time zone, recurring_pattern jsonb, target_type character varying, target_filters jsonb, channel_config jsonb, nps_data jsonb, status character varying, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone, next_execution_at timestamp with time zone, last_executed_at timestamp with time zone, execution_count integer, success_count integer, error_count integer, survey_title text, survey_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.id,
        ms.title,
        ms.message as content,
        ms.schedule_type,
        ms.scheduled_at,
        ms.recurring_pattern,
        ms.target_type,
        ms.target_filters,
        ms.channel_config,
        ms.nps_data,
        ms.status,
        ms.created_by,
        ms.created_at,
        ms.updated_at,
        ms.next_execution_at,
        ms.last_executed_at,
        COALESCE((ms.execution_stats->>'execution_count')::INTEGER, 0) as execution_count,
        COALESCE((ms.execution_stats->>'success_count')::INTEGER, 0) as success_count,
        COALESCE((ms.execution_stats->>'error_count')::INTEGER, 0) as error_count,
        (ms.nps_data->>'survey_title')::TEXT as survey_title,
        (ms.nps_data->>'survey_id')::UUID as survey_id
    FROM message_schedules ms
    WHERE ms.type = 'nps' OR ms.nps_data IS NOT NULL
    ORDER BY ms.created_at DESC;
END;
$$;


--
-- Name: get_nps_schedules(uuid, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_nps_schedules(p_user_id uuid DEFAULT NULL::uuid, p_status text DEFAULT NULL::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, title character varying, content text, schedule_type character varying, scheduled_at timestamp with time zone, recurring_pattern jsonb, target_type character varying, target_filters jsonb, channel_config jsonb, nps_data jsonb, status character varying, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone, next_execution_at timestamp with time zone, last_executed_at timestamp with time zone, execution_count integer, success_count integer, error_count integer, survey_title text, survey_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id,
    ms.title,
    ms.content,
    ms.schedule_type,
    ms.scheduled_at,
    ms.recurring_pattern,
    ms.target_type,
    ms.target_filters,
    ms.channel_config,
    ms.nps_data,
    ms.status,
    ms.created_by,
    ms.created_at,
    ms.updated_at,
    ms.next_execution_at,
    ms.last_executed_at,
    ms.execution_count,
    ms.success_count,
    ms.error_count,
    (ms.nps_data->>'survey_title')::TEXT as survey_title,
    (ms.nps_data->>'survey_id')::UUID as survey_id
  FROM message_schedules ms
  JOIN users u ON u.id = COALESCE(p_user_id, auth.uid())
  WHERE 
    ms.channel = 'whatsapp'
    AND ms.nps_data IS NOT NULL
    AND (
      -- Super admin e admin veem todos os agendamentos NPS
      u.role IN ('super_admin', 'admin') 
      OR ms.created_by = COALESCE(p_user_id, auth.uid())
    )
    AND (p_status IS NULL OR ms.status = p_status)
  ORDER BY ms.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


--
-- Name: get_pending_nps_schedules(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pending_nps_schedules() RETURNS TABLE(schedule_id uuid, title text, survey_id uuid, survey_title text, message_content text, scheduled_at timestamp with time zone, next_execution_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.id as schedule_id,
        ms.title::text,
        (ms.nps_data->>'survey_id')::uuid as survey_id,
        ns.title::text as survey_title,
        ms.nps_data->>'message' as message_content,
        ms.scheduled_at,
        ms.next_execution_at
    FROM message_schedules ms
    JOIN nps_surveys ns ON ns.id = (ms.nps_data->>'survey_id')::uuid
    WHERE ms.type = 'nps'
    AND ms.channel = 'whatsapp'
    AND ms.status = 'active'
    AND (
        ms.next_execution_at IS NULL 
        OR ms.next_execution_at <= NOW()
    )
    ORDER BY 
        COALESCE(ms.next_execution_at, ms.scheduled_at) ASC
    LIMIT 10;
END;
$$;


--
-- Name: get_role_permissions(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_role_permissions(role_name text) RETURNS TABLE(permission_name text, permission_description text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT p.name, p.description
    FROM roles r
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE r.name = role_name
    ORDER BY p.name;
END;
$$;


--
-- Name: get_schedule_recipients(text, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_schedule_recipients(p_target_type text, p_target_filters jsonb, p_conditions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_recipients JSONB := '[]'::JSONB;
  v_query TEXT;
  v_departments TEXT[];
  v_roles TEXT[];
  v_user_ids UUID[];
  v_condition_type TEXT;
BEGIN
  CASE p_target_type
    WHEN 'all' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', full_name,
          'email', email,
          'phone', phone,
          'department', department,
          'role', role
        )
      ) INTO v_recipients
      FROM users 
      WHERE status IN ('active', 'ativo');
      
    WHEN 'department' THEN
      v_departments := ARRAY(SELECT jsonb_array_elements_text(p_target_filters->'departments'));
      
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', full_name,
          'email', email,
          'phone', phone,
          'department', department,
          'role', role
        )
      ) INTO v_recipients
      FROM users 
      WHERE status IN ('active', 'ativo')
        AND department = ANY(v_departments);
        
    WHEN 'role' THEN
      v_roles := ARRAY(SELECT jsonb_array_elements_text(p_target_filters->'roles'));
      
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', full_name,
          'email', email,
          'phone', phone,
          'department', department,
          'role', role
        )
      ) INTO v_recipients
      FROM users 
      WHERE status IN ('active', 'ativo')
        AND role = ANY(v_roles);
        
    WHEN 'specific' THEN
      v_user_ids := ARRAY(SELECT (jsonb_array_elements_text(p_target_filters->'user_ids'))::UUID);
      
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', full_name,
          'email', email,
          'phone', phone,
          'department', department,
          'role', role
        )
      ) INTO v_recipients
      FROM users 
      WHERE status IN ('active', 'ativo')
        AND id = ANY(v_user_ids);
        
    WHEN 'conditional' THEN
      v_condition_type := p_conditions->>'type';
      
      CASE v_condition_type
        WHEN 'birthday' THEN
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', id,
              'name', full_name,
              'email', email,
              'phone', phone,
              'department', department,
              'role', role,
              'birth_date', birth_date
            )
          ) INTO v_recipients
          FROM users 
          WHERE status IN ('active', 'ativo')
            AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE);
            
        WHEN 'hire_anniversary' THEN
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', id,
              'name', full_name,
              'email', email,
              'phone', phone,
              'department', department,
              'role', role,
              'hire_date', start_date
            )
          ) INTO v_recipients
          FROM users 
          WHERE status IN ('active', 'ativo')
            AND EXTRACT(MONTH FROM start_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM start_date) = EXTRACT(DAY FROM CURRENT_DATE);
      END CASE;
  END CASE;
  
  RETURN COALESCE(v_recipients, '[]'::JSONB);
END;
$$;


--
-- Name: get_schedule_statistics(uuid, text, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_schedule_statistics(p_user_id uuid DEFAULT NULL::uuid, p_channel text DEFAULT NULL::text, p_date_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_date_to timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(total_schedules bigint, active_schedules bigint, completed_schedules bigint, total_executions bigint, total_recipients bigint, success_rate numeric, avg_execution_time numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_schedules,
    COUNT(*) FILTER (WHERE ms.status = 'active')::BIGINT as active_schedules,
    COUNT(*) FILTER (WHERE ms.status = 'completed')::BIGINT as completed_schedules,
    COALESCE(SUM((ms.execution_stats->>'execution_count')::INTEGER), 0)::BIGINT as total_executions,
    COALESCE(SUM(
      COALESCE((ms.execution_stats->>'success_count')::INTEGER, 0) + 
      COALESCE((ms.execution_stats->>'error_count')::INTEGER, 0)
    ), 0)::BIGINT as total_recipients,
    CASE 
      WHEN SUM(
        COALESCE((ms.execution_stats->>'success_count')::INTEGER, 0) + 
        COALESCE((ms.execution_stats->>'error_count')::INTEGER, 0)
      ) > 0 THEN
        ROUND(
          (SUM(COALESCE((ms.execution_stats->>'success_count')::INTEGER, 0))::NUMERIC / 
           SUM(
             COALESCE((ms.execution_stats->>'success_count')::INTEGER, 0) + 
             COALESCE((ms.execution_stats->>'error_count')::INTEGER, 0)
           )::NUMERIC
          ) * 100, 2
        )
      ELSE 0
    END as success_rate,
    COALESCE(AVG(EXTRACT(EPOCH FROM (msl.created_at - ms.created_at)) * 1000), 0) as avg_execution_time
  FROM message_schedules ms
  LEFT JOIN message_schedule_logs msl ON ms.id = msl.schedule_id AND msl.level = 'INFO'
  WHERE (p_user_id IS NULL OR ms.created_by = p_user_id)
    AND (p_channel IS NULL OR ms.type = p_channel)
    AND (p_date_from IS NULL OR ms.created_at >= p_date_from)
    AND (p_date_to IS NULL OR ms.created_at <= p_date_to);
END;
$$;


--
-- Name: FUNCTION get_schedule_statistics(p_user_id uuid, p_channel text, p_date_from timestamp with time zone, p_date_to timestamp with time zone); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_schedule_statistics(p_user_id uuid, p_channel text, p_date_from timestamp with time zone, p_date_to timestamp with time zone) IS 'Obtém estatísticas de agendamentos usando a nova estrutura execution_stats';


--
-- Name: get_system_setting(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_system_setting(setting_key text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    setting_value TEXT;
BEGIN
    SELECT value INTO setting_value
    FROM system_settings
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$;


--
-- Name: get_user_effective_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_effective_role(user_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    effective_role TEXT;
BEGIN
    -- Buscar role do usuário na tabela users
    SELECT u.role INTO effective_role
    FROM public.users u
    WHERE u.auth_user_id = user_id
    AND u.status = 'ativo';
    
    RETURN COALESCE(effective_role, 'usuario');
END;
$$;


--
-- Name: FUNCTION get_user_effective_role(user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_effective_role(user_id uuid) IS 'Retorna o role efetivo de um usuário específico';


--
-- Name: get_user_permissions(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_permissions(user_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_role TEXT;
    result JSON;
BEGIN
    -- Buscar role do usuário usando auth_user_id com SECURITY DEFINER para contornar RLS
    SELECT role INTO user_role FROM users WHERE auth_user_id = user_id;
    
    IF user_role IS NULL THEN
        RETURN '[]'::JSON;
    END IF;
    
    -- Retornar todas as permissões do usuário como JSON
    SELECT json_agg(
        json_build_object(
            'name', p.name,
            'description', p.description
        )
    ) INTO result
    FROM roles r
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE r.name = user_role;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$;


--
-- Name: get_user_schedules(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_schedules(p_user_id uuid, p_schedule_type text DEFAULT NULL::text, p_status text DEFAULT NULL::text) RETURNS TABLE(id uuid, title character varying, message text, channel character varying, schedule_type character varying, target_type character varying, target_filters jsonb, channel_config jsonb, recurring_pattern jsonb, status character varying, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone, next_execution_at timestamp with time zone, last_executed_at timestamp with time zone, execution_count integer, success_count integer, error_count integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar se o usuário existe e obter sua role
  IF NOT EXISTS (SELECT 1 FROM users WHERE users.id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Retornar agendamentos baseado na role do usuário
  RETURN QUERY
  SELECT 
    ms.id,
    ms.title,
    ms.message,
    ms.channel,
    ms.schedule_type,
    ms.target_type,
    ms.target_filters,
    ms.channel_config,
    ms.recurring_pattern,
    ms.status,
    ms.created_by,
    ms.created_at,
    ms.updated_at,
    ms.next_execution_at,
    ms.last_executed_at,
    ms.execution_count,
    ms.success_count,
    ms.error_count
  FROM message_schedules ms
  JOIN users u ON u.id = p_user_id
  WHERE 
    -- Super admin e admin veem todos os agendamentos
    (u.role IN ('super_admin', 'admin') OR ms.created_by = p_user_id)
    AND (p_schedule_type IS NULL OR ms.schedule_type = p_schedule_type)
    AND (p_status IS NULL OR ms.status = p_status)
  ORDER BY ms.created_at DESC;
END;
$$;


--
-- Name: get_whatsapp_send_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_whatsapp_send_stats() RETURNS TABLE(total_pending integer, total_sent integer, total_failed integer, last_24h_sent integer, last_24h_failed integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as total_pending,
        COUNT(*) FILTER (WHERE status = 'sent')::INTEGER as total_sent,
        COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as total_failed,
        COUNT(*) FILTER (WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '24 hours')::INTEGER as last_24h_sent,
        COUNT(*) FILTER (WHERE status = 'failed' AND updated_at >= NOW() - INTERVAL '24 hours')::INTEGER as last_24h_failed
    FROM whatsapp_sends;
END;
$$;


--
-- Name: FUNCTION get_whatsapp_send_stats(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_whatsapp_send_stats() IS 'Função para obter estatísticas dos envios de WhatsApp';


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    full_name,
    email,
    role,
    nivel,
    status,
    position,
    department,
    phone
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'role', 'gerente'), -- Mudança aqui: 'gerente' em vez de 'usuario'
    COALESCE(new.raw_user_meta_data ->> 'role', 'gerente'), -- Mudança aqui também
    'ativo',
    COALESCE(new.raw_user_meta_data ->> 'position', 'Não definido'),
    COALESCE(new.raw_user_meta_data ->> 'department', 'Não definido'),
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;


--
-- Name: has_permission(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_permission(permission_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Buscar role do usuário
    SELECT role INTO user_role 
    FROM users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'ativo';
    
    -- Se não encontrou usuário, retornar false
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Super admin e admin têm acesso total
    IF user_role IN ('super_admin', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se o usuário tem a permissão específica
    RETURN EXISTS (
        SELECT 1
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE r.name = user_role
        AND p.name = permission_name
    );
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      role IN ('admin', 'super_admin') 
      OR nivel IN ('admin', 'super_admin')
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;


--
-- Name: is_admin_or_super(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_or_super() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND status = 'ativo'
  );
END;
$$;


--
-- Name: is_current_user_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_current_user_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id::text = auth.uid()::text 
    AND u.role IN ('admin', 'super_admin') 
    AND u.status = 'ativo'
  );
$$;


--
-- Name: is_own_record(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_own_record(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN user_id = auth.uid();
END;
$$;


--
-- Name: is_super_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_super_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'super_admin' 
    AND status = 'ativo'
  );
END;
$$;


--
-- Name: is_super_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_super_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      role = 'super_admin' 
      OR nivel = 'super_admin'
      OR (preferences->>'super_user')::boolean = true
    )
  );
END;
$$;


--
-- Name: is_user_admin_cached(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_user_admin_cached(user_id uuid DEFAULT auth.uid()) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Cache do resultado por sessão
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE auth_user_id = user_id AND role IN ('admin', 'super_admin')
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$;


--
-- Name: log_security_event(text, text, uuid, jsonb, jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_security_event(p_event_type text, p_table_name text DEFAULT NULL::text, p_record_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_severity text DEFAULT 'INFO'::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO security_audit_log (
    event_type, table_name, record_id, user_id, user_email,
    old_values, new_values, severity
  ) VALUES (
    p_event_type, p_table_name, p_record_id, auth.uid(), auth.email(),
    p_old_values, p_new_values, p_severity
  );
END;
$$;


--
-- Name: prevent_privilege_escalation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_privilege_escalation() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- If user is not admin and trying to change role or nivel
  IF NOT public.is_current_user_admin() THEN
    -- Prevent role changes
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      NEW.role := OLD.role;
    END IF;
    
    -- Prevent nivel changes
    IF OLD.nivel IS DISTINCT FROM NEW.nivel THEN
      NEW.nivel := OLD.nivel;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: process_nps_response(text, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_nps_response(token_param text, score_param integer, comment_param text DEFAULT NULL::text) RETURNS TABLE(success boolean, message text, response_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    token_uuid UUID;
    survey_uuid UUID;
    employee_uuid UUID;
    user_name_val TEXT;
    user_phone_val TEXT;
    new_response_id UUID;
    existing_response_count INTEGER;
BEGIN
    -- Converter token para UUID
    BEGIN
        token_uuid := token_param::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
        RETURN QUERY SELECT FALSE, 'Token inválido'::TEXT, NULL::UUID;
        RETURN;
    END;
    
    -- Verificar se o token existe e está ativo
    SELECT nt.survey_id, nt.employee_id, nt.user_name, nt.user_phone
    INTO survey_uuid, employee_uuid, user_name_val, user_phone_val
    FROM nps_tokens nt
    WHERE nt.token = token_param
      AND nt.is_active = TRUE
      AND nt.used_at IS NULL;
    
    IF survey_uuid IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Token inválido ou já utilizado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Verificar se já existe uma resposta para este token
    SELECT COUNT(*)
    INTO existing_response_count
    FROM nps_responses nr
    WHERE nr.response_token = token_param;
    
    IF existing_response_count > 0 THEN
        RETURN QUERY SELECT FALSE, 'Resposta já registrada para este token'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Validar score
    IF score_param < 0 OR score_param > 10 THEN
        RETURN QUERY SELECT FALSE, 'Score deve estar entre 0 e 10'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Inserir a resposta
    INSERT INTO nps_responses (
        id,
        survey_id,
        employee_id,
        score,
        comment,
        response_date,
        created_at,
        response_token,
        user_name,
        user_phone
    ) VALUES (
        gen_random_uuid(),
        survey_uuid,
        employee_uuid,
        score_param,
        comment_param,
        CURRENT_DATE,
        NOW(),
        token_param,
        user_name_val,
        user_phone_val
    ) RETURNING id INTO new_response_id;
    
    -- Marcar o token como usado
    UPDATE nps_tokens
    SET is_active = FALSE,
        used_at = NOW()
    WHERE token = token_param;
    
    RETURN QUERY SELECT TRUE, 'Resposta processada com sucesso'::TEXT, new_response_id;
    
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Erro interno ao processar resposta'::TEXT, NULL::UUID;
END;
$$;


--
-- Name: process_nps_response(uuid, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_nps_response(token_uuid uuid, score integer, comment text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  token_record RECORD;
  response_id UUID;
BEGIN
  -- Validar o token e buscar dados
  SELECT * INTO token_record
  FROM nps_tokens
  WHERE token = token_uuid::text
    AND is_active = true;

  -- Se token não encontrado ou inválido
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'Link inválido ou expirado',
      'already_responded', false
    );
  END IF;

  -- Verificar se já existe uma resposta para este token
  IF EXISTS (
    SELECT 1 FROM nps_responses 
    WHERE survey_id = token_record.survey_id 
    AND user_phone = token_record.user_phone
    AND created_at > token_record.created_at
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'Esta pesquisa já foi respondida',
      'already_responded', true
    );
  END IF;

  -- Criar resposta oficial no NPS
  INSERT INTO nps_responses (
    id,
    survey_id,
    respondente_id,
    pontuacao,
    comentario,
    response_method,
    user_phone,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    token_record.survey_id,
    token_record.employee_id,
    score,
    COALESCE(comment, 'Resposta via WhatsApp - Score: ' || score::text),
    'whatsapp',
    token_record.user_phone,
    NOW()
  )
  RETURNING id INTO response_id;

  -- Desativar o token
  UPDATE nps_tokens
  SET is_active = false, used_at = NOW()
  WHERE token = token_uuid::text;

  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'response_id', response_id,
    'message', 'Resposta registrada com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e retorno de falha
    RAISE LOG 'Erro ao processar resposta NPS: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'Erro interno ao processar resposta',
      'already_responded', false
    );
END;
$$;


--
-- Name: process_nps_schedule(record); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_nps_schedule(schedule_data record) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    target_user_record RECORD;
    nps_data JSONB;
    survey_id UUID;
    response_token TEXT;
    base_url TEXT;
    message_content TEXT;
    whatsapp_send_id UUID;
    target_users JSONB;
    user_id_value JSONB;
    existing_send_id UUID;
BEGIN
    -- Extrair dados NPS
    nps_data := schedule_data.nps_data;
    survey_id := (nps_data->>'survey_id')::UUID;
    response_token := nps_data->>'response_token';
    base_url := nps_data->>'base_url';
    message_content := schedule_data.message;
    target_users := nps_data->'target_users';
    
    -- Log do início do processamento
    INSERT INTO message_schedule_logs (
        schedule_id,
        level,
        message,
        context
    ) VALUES (
        schedule_data.id,
        'INFO',
        'Iniciando processamento de agendamento NPS',
        jsonb_build_object(
            'survey_id', survey_id,
            'target_users_count', COALESCE(jsonb_array_length(target_users), 0),
            'base_url', base_url,
            'response_token', response_token
        )
    );
    
    -- Se target_users está vazio ou é null, processar todos os usuários
    IF target_users IS NULL OR jsonb_array_length(target_users) = 0 THEN
        FOR target_user_record IN
            SELECT id, full_name, email, phone FROM users WHERE phone IS NOT NULL
        LOOP
            -- Verificar se já existe um envio para este usuário hoje
            SELECT id INTO existing_send_id
            FROM whatsapp_sends
            WHERE phone_number = target_user_record.phone
              AND survey_id = survey_id
              AND extract_date_immutable(created_at) = extract_date_immutable(NOW());
            
            -- Se não existe, criar novo registro
            IF existing_send_id IS NULL THEN
                -- Gerar token único para cada usuário
                response_token := encode(gen_random_bytes(16), 'hex');
                
                -- Criar registro na tabela whatsapp_sends
                INSERT INTO whatsapp_sends (
                    user_id,
                    survey_id,
                    message_content,
                    response_token,
                    phone_number,
                    status,
                    created_at
                ) VALUES (
                    target_user_record.id,
                    survey_id,
                    replace(message_content, nps_data->>'response_token', response_token),
                    response_token,
                    target_user_record.phone,
                    'pending',
                    NOW()
                ) RETURNING id INTO whatsapp_send_id;
            ELSE
                -- Log que o envio já existe
                INSERT INTO message_schedule_logs (
                    schedule_id,
                    level,
                    message,
                    context
                ) VALUES (
                    schedule_data.id,
                    'INFO',
                    'Envio NPS já existe para usuário hoje',
                    jsonb_build_object(
                        'user_id', target_user_record.id,
                        'phone', target_user_record.phone,
                        'existing_send_id', existing_send_id
                    )
                );
            END IF;
        END LOOP;
    ELSE
        -- Processar usuários específicos
        FOR user_id_value IN SELECT * FROM jsonb_array_elements(target_users)
        LOOP
            SELECT id, full_name, email, phone INTO target_user_record
            FROM users 
            WHERE id = (user_id_value->>0)::UUID;
            
            IF FOUND AND target_user_record.phone IS NOT NULL THEN
                -- Verificar se já existe um envio para este usuário hoje
                SELECT id INTO existing_send_id
                FROM whatsapp_sends
                WHERE phone_number = target_user_record.phone
                  AND survey_id = survey_id
                  AND extract_date_immutable(created_at) = extract_date_immutable(NOW());
                
                -- Se não existe, criar novo registro
                IF existing_send_id IS NULL THEN
                    -- Gerar token único para cada usuário
                    response_token := encode(gen_random_bytes(16), 'hex');
                    
                    -- Criar registro na tabela whatsapp_sends
                    INSERT INTO whatsapp_sends (
                        user_id,
                        survey_id,
                        message_content,
                        response_token,
                        phone_number,
                        status,
                        created_at
                    ) VALUES (
                        target_user_record.id,
                        survey_id,
                        replace(message_content, nps_data->>'response_token', response_token),
                        response_token,
                        target_user_record.phone,
                        'pending',
                        NOW()
                    ) RETURNING id INTO whatsapp_send_id;
                ELSE
                    -- Log que o envio já existe
                    INSERT INTO message_schedule_logs (
                        schedule_id,
                        level,
                        message,
                        context
                    ) VALUES (
                        schedule_data.id,
                        'INFO',
                        'Envio NPS já existe para usuário hoje',
                        jsonb_build_object(
                            'user_id', target_user_record.id,
                            'phone', target_user_record.phone,
                            'existing_send_id', existing_send_id
                        )
                    );
                END IF;
            END IF;
        END LOOP;
    END IF;
    
    -- Log de conclusão
    INSERT INTO message_schedule_logs (
        schedule_id,
        level,
        message,
        context
    ) VALUES (
        schedule_data.id,
        'INFO',
        'Agendamento NPS processado com sucesso',
        jsonb_build_object(
            'survey_id', survey_id,
            'processed_at', NOW()
        )
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO message_schedule_logs (
            schedule_id,
            level,
            message,
            context
        ) VALUES (
            schedule_data.id,
            'ERROR',
            'Erro ao processar agendamento NPS: ' || SQLERRM,
            jsonb_build_object(
                'sqlstate', SQLSTATE,
                'error_detail', SQLERRM,
                'survey_id', survey_id
            )
        );
        
        RETURN FALSE;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: message_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    channel character varying(50) NOT NULL,
    schedule_type character varying(50) NOT NULL,
    scheduled_at timestamp with time zone,
    recurring_pattern jsonb,
    target_type character varying(50) NOT NULL,
    target_filters jsonb,
    channel_config jsonb,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_executed_at timestamp with time zone,
    next_execution_at timestamp with time zone,
    nps_data jsonb,
    type character varying(50) DEFAULT 'general'::character varying,
    execution_stats jsonb DEFAULT '{}'::jsonb,
    response_token text,
    sent_at timestamp with time zone,
    completed_at timestamp with time zone,
    description text,
    recurrence_pattern text,
    CONSTRAINT check_message_schedule_type CHECK (((type)::text = ANY ((ARRAY['general'::character varying, 'nps'::character varying, 'whatsapp'::character varying, 'email'::character varying, 'sms'::character varying])::text[]))),
    CONSTRAINT message_schedules_channel_check CHECK (((channel)::text = ANY ((ARRAY['whatsapp'::character varying, 'email'::character varying, 'notification'::character varying, 'nps'::character varying])::text[]))),
    CONSTRAINT message_schedules_schedule_type_check CHECK (((schedule_type)::text = ANY ((ARRAY['immediate'::character varying, 'scheduled'::character varying, 'recurring'::character varying, 'conditional'::character varying])::text[]))),
    CONSTRAINT message_schedules_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying, 'active'::character varying, 'paused'::character varying])::text[]))),
    CONSTRAINT message_schedules_target_type_check CHECK (((target_type)::text = ANY ((ARRAY['all'::character varying, 'department'::character varying, 'role'::character varying, 'specific'::character varying, 'conditional'::character varying])::text[])))
);


--
-- Name: TABLE message_schedules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.message_schedules IS 'Tabela unificada para agendamentos de mensagens de todos os canais';


--
-- Name: COLUMN message_schedules.target_filters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.message_schedules.target_filters IS 'Filtros de usuários consolidados (inclui conditions)';


--
-- Name: COLUMN message_schedules.channel_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.message_schedules.channel_config IS 'Configuração do canal consolidada (inclui message, content, type)';


--
-- Name: COLUMN message_schedules.nps_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.message_schedules.nps_data IS 'Dados específicos para pesquisas NPS';


--
-- Name: COLUMN message_schedules.execution_stats; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.message_schedules.execution_stats IS 'Estatísticas de execução consolidadas';


--
-- Name: process_nps_schedule(public.message_schedules); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_nps_schedule(schedule_data public.message_schedules) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    target_user_record RECORD;
    nps_data JSONB;
    v_survey_id UUID;
    response_token TEXT;
    base_url TEXT;
    message_content TEXT;
    whatsapp_send_id UUID;
    target_user_ids JSONB;
    user_id_value TEXT;
    existing_send_id UUID;
BEGIN
    -- Extrair dados NPS
    nps_data := schedule_data.nps_data;
    v_survey_id := (nps_data->>'survey_id')::UUID;
    response_token := nps_data->>'response_token';
    base_url := nps_data->>'base_url';
    message_content := COALESCE(nps_data->>'message', schedule_data.message);
    
    -- Usar target_filters.user_ids em vez de nps_data.target_users
    target_user_ids := schedule_data.target_filters->'user_ids';
    
    -- Log do início do processamento
    INSERT INTO message_schedule_logs (
        schedule_id,
        level,
        message,
        context
    ) VALUES (
        schedule_data.id,
        'INFO',
        'Iniciando processamento de agendamento NPS',
        jsonb_build_object(
            'survey_id', v_survey_id,
            'target_type', schedule_data.target_type,
            'target_user_ids_count', COALESCE(jsonb_array_length(target_user_ids), 0),
            'base_url', base_url,
            'response_token', response_token
        )
    );
    
    -- Se target_type é 'all' ou target_user_ids está vazio, processar todos os usuários
    IF schedule_data.target_type = 'all' OR target_user_ids IS NULL OR jsonb_array_length(target_user_ids) = 0 THEN
        FOR target_user_record IN
            SELECT id, full_name, email, phone FROM users WHERE phone IS NOT NULL
        LOOP
            -- Verificar se já existe um envio para este usuário hoje
            SELECT ws.id INTO existing_send_id
            FROM whatsapp_sends ws
            WHERE ws.phone_number = target_user_record.phone
              AND ws.survey_id = v_survey_id
              AND extract_date_immutable(ws.created_at) = extract_date_immutable(NOW());
            
            -- Se não existe, criar novo registro
            IF existing_send_id IS NULL THEN
                -- Gerar token único para cada usuário
                response_token := encode(gen_random_bytes(16), 'hex');
                
                -- Criar registro na tabela whatsapp_sends
                INSERT INTO whatsapp_sends (
                    user_id,
                    survey_id,
                    message_content,
                    response_token,
                    phone_number,
                    status,
                    created_at
                ) VALUES (
                    target_user_record.id,
                    v_survey_id,
                    replace(message_content, COALESCE(nps_data->>'response_token', '[RESPONSE_TOKEN]'), response_token),
                    response_token,
                    target_user_record.phone,
                    'pending',
                    NOW()
                ) RETURNING id INTO whatsapp_send_id;
            ELSE
                -- Log que o envio já existe
                INSERT INTO message_schedule_logs (
                    schedule_id,
                    level,
                    message,
                    context
                ) VALUES (
                    schedule_data.id,
                    'INFO',
                    'Envio NPS já existe para usuário hoje',
                    jsonb_build_object(
                        'user_id', target_user_record.id,
                        'phone', target_user_record.phone,
                        'existing_send_id', existing_send_id
                    )
                );
            END IF;
        END LOOP;
    ELSE
        -- Processar usuários específicos do target_filters.user_ids
        FOR user_id_value IN SELECT jsonb_array_elements_text(target_user_ids)
        LOOP
            SELECT id, full_name, email, phone INTO target_user_record
            FROM users 
            WHERE id = user_id_value::UUID;
            
            IF FOUND AND target_user_record.phone IS NOT NULL THEN
                -- Verificar se já existe um envio para este usuário hoje
                SELECT ws.id INTO existing_send_id
                FROM whatsapp_sends ws
                WHERE ws.phone_number = target_user_record.phone
                  AND ws.survey_id = v_survey_id
                  AND extract_date_immutable(ws.created_at) = extract_date_immutable(NOW());
                
                -- Se não existe, criar novo registro
                IF existing_send_id IS NULL THEN
                    -- Gerar token único para cada usuário
                    response_token := encode(gen_random_bytes(16), 'hex');
                    
                    -- Criar registro na tabela whatsapp_sends
                    INSERT INTO whatsapp_sends (
                        user_id,
                        survey_id,
                        message_content,
                        response_token,
                        phone_number,
                        status,
                        created_at
                    ) VALUES (
                        target_user_record.id,
                        v_survey_id,
                        replace(message_content, COALESCE(nps_data->>'response_token', '[RESPONSE_TOKEN]'), response_token),
                        response_token,
                        target_user_record.phone,
                        'pending',
                        NOW()
                    ) RETURNING id INTO whatsapp_send_id;
                    
                    -- Log do envio criado
                    INSERT INTO message_schedule_logs (
                        schedule_id,
                        level,
                        message,
                        context
                    ) VALUES (
                        schedule_data.id,
                        'INFO',
                        'Envio NPS criado para usuário específico',
                        jsonb_build_object(
                            'user_id', target_user_record.id,
                            'phone', target_user_record.phone,
                            'whatsapp_send_id', whatsapp_send_id
                        )
                    );
                ELSE
                    -- Log que o envio já existe
                    INSERT INTO message_schedule_logs (
                        schedule_id,
                        level,
                        message,
                        context
                    ) VALUES (
                        schedule_data.id,
                        'INFO',
                        'Envio NPS já existe para usuário hoje',
                        jsonb_build_object(
                            'user_id', target_user_record.id,
                            'phone', target_user_record.phone,
                            'existing_send_id', existing_send_id
                        )
                    );
                END IF;
            ELSE
                -- Log usuário não encontrado ou sem telefone
                INSERT INTO message_schedule_logs (
                    schedule_id,
                    level,
                    message,
                    context
                ) VALUES (
                    schedule_data.id,
                    'WARNING',
                    'Usuário não encontrado ou sem telefone',
                    jsonb_build_object(
                        'user_id', user_id_value
                    )
                );
            END IF;
        END LOOP;
    END IF;
    
    -- Log de conclusão
    INSERT INTO message_schedule_logs (
        schedule_id,
        level,
        message,
        context
    ) VALUES (
        schedule_data.id,
        'INFO',
        'Agendamento NPS processado com sucesso',
        jsonb_build_object(
            'survey_id', v_survey_id,
            'processed_at', NOW()
        )
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO message_schedule_logs (
            schedule_id,
            level,
            message,
            context
        ) VALUES (
            schedule_data.id,
            'ERROR',
            'Erro ao processar agendamento NPS: ' || SQLERRM,
            jsonb_build_object(
                'sqlstate', SQLSTATE,
                'error_detail', SQLERRM,
                'survey_id', v_survey_id
            )
        );
        
        RETURN FALSE;
END;
$$;


--
-- Name: process_nps_schedule_for_n8n(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_nps_schedule_for_n8n(schedule_id_param uuid) RETURNS TABLE(schedule_id uuid, user_id uuid, user_name text, phone_number text, survey_id uuid, survey_title text, survey_question text, survey_url text, message_content text, response_token text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    schedule_record RECORD;
    user_record RECORD;
    survey_record RECORD;
    current_stats jsonb;
    new_stats jsonb;
    token varchar(255);
    base_url text := 'https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/public-survey';
BEGIN
    -- Buscar o agendamento
    SELECT * INTO schedule_record
    FROM message_schedules ms
    WHERE ms.id = schedule_id_param
    AND ms.type = 'nps'
    AND ms.channel = 'whatsapp'
    AND ms.status = 'active';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento NPS não encontrado ou inativo: %', schedule_id_param;
    END IF;
    
    -- Buscar dados da pesquisa
    SELECT * INTO survey_record
    FROM nps_surveys ns
    WHERE ns.id = (schedule_record.nps_data->>'survey_id')::uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pesquisa NPS não encontrada: %', (schedule_record.nps_data->>'survey_id')::uuid;
    END IF;
    
    -- Obter estatísticas atuais
    current_stats := COALESCE(schedule_record.execution_stats, '{}'::jsonb);
    
    -- Buscar usuários elegíveis baseado nos filtros
    FOR user_record IN
        SELECT u.id, u.full_name, u.phone
        FROM users u
        WHERE u.phone IS NOT NULL
        AND u.phone != ''
        AND u.status = 'ativo'
        -- Verificar se o usuário não recebeu esta pesquisa recentemente
        AND NOT EXISTS (
            SELECT 1 FROM nps_responses nr
            WHERE nr.employee_id = u.id
            AND nr.survey_id = survey_record.id
            AND nr.created_at > NOW() - INTERVAL '30 days'
        )
        -- Aplicar filtros do target_filters se existirem
        AND (
            schedule_record.target_filters IS NULL
            OR (
                (schedule_record.target_filters->>'department' IS NULL OR u.department = schedule_record.target_filters->>'department')
                AND (schedule_record.target_filters->>'role' IS NULL OR u.role = schedule_record.target_filters->>'role')
                AND (schedule_record.target_filters->>'status' IS NULL OR u.status = schedule_record.target_filters->>'status')
            )
        )
        LIMIT 50 -- Limitar para evitar sobrecarga
    LOOP
        -- Gerar token único para rastreamento
        token := 'nps_' || encode(gen_random_bytes(16), 'hex');
        
        -- Retornar dados para o n8n processar
        schedule_id := schedule_record.id;
        user_id := user_record.id;
        user_name := user_record.full_name;
        phone_number := user_record.phone;
        survey_id := survey_record.id;
        survey_title := survey_record.title;
        survey_question := survey_record.question;
        survey_url := base_url || '?survey_id=' || survey_record.id || '&token=' || token;
        message_content := schedule_record.nps_data->>'message';
        response_token := token;
        
        RETURN NEXT;
    END LOOP;
    
    -- Atualizar execution_stats com informações da execução
    new_stats := current_stats || jsonb_build_object(
        'last_execution_at', NOW(),
        'total_executions', COALESCE((current_stats->>'total_executions')::int, 0) + 1,
        'last_processed_users', (
            SELECT COUNT(*)
            FROM users u
            WHERE u.phone IS NOT NULL
            AND u.phone != ''
            AND u.status = 'ativo'
            AND NOT EXISTS (
                SELECT 1 FROM nps_responses nr
                WHERE nr.employee_id = u.id
                AND nr.survey_id = survey_record.id
                AND nr.created_at > NOW() - INTERVAL '30 days'
            )
        )
    );
    
    -- Atualizar o agendamento
    UPDATE message_schedules
    SET 
        execution_stats = new_stats,
        last_executed_at = NOW(),
        updated_at = NOW()
    WHERE id = schedule_id_param;
    
    RETURN;
END;
$$;


--
-- Name: process_pending_nps_sends(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_pending_nps_sends() RETURNS TABLE(processed_count integer, error_count integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    p_evolution_api_url TEXT := 'https://icarusai-evolution-api.br3cp2.easypanel.host';
    p_api_key TEXT := 'B2A29106F8DB-4AAC-8EE4-CCBD4B386719';
    p_instance_name TEXT := 'Hugo Teste';
    p_timeout INTEGER := 30;
    
    send_record RECORD;
    api_response JSONB;
    total_processed INTEGER := 0;
    total_errors INTEGER := 0;
BEGIN
    -- Processar mensagens pendentes
    FOR send_record IN 
        SELECT id, user_id, phone_number, message_content, survey_id
        FROM whatsapp_sends 
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 50
    LOOP
        BEGIN
            -- Chamar função de envio e capturar resposta
            SELECT send_whatsapp_message(
                p_evolution_api_url,
                p_api_key, 
                p_instance_name,
                send_record.phone_number,
                send_record.message_content,
                p_timeout
            ) INTO api_response;
            
            -- Verificar se o envio foi bem-sucedido
            IF (api_response->>'success')::boolean = true THEN
                -- Atualizar status como enviado com dados da resposta
                UPDATE whatsapp_sends 
                SET 
                    status = 'sent',
                    sent_at = NOW(),
                    whatsapp_message_id = api_response->>'message_id',
                    metadata = jsonb_build_object(
                        'api_response', api_response,
                        'whatsapp_status', api_response->>'whatsapp_status',
                        'request_id', api_response->>'request_id'
                    ),
                    error_message = NULL,
                    updated_at = NOW()
                WHERE id = send_record.id;
                
                total_processed := total_processed + 1;
            ELSE
                -- Atualizar com erro da API
                UPDATE whatsapp_sends 
                SET 
                    status = 'failed',
                    error_message = COALESCE(api_response->>'error', 'Erro desconhecido na API'),
                    metadata = jsonb_build_object('api_response', api_response),
                    updated_at = NOW()
                WHERE id = send_record.id;
                
                total_errors := total_errors + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Atualizar com erro de execução
            UPDATE whatsapp_sends 
            SET 
                status = 'failed',
                error_message = 'Erro interno: ' || SQLERRM,
                updated_at = NOW()
            WHERE id = send_record.id;
            
            total_errors := total_errors + 1;
        END;
    END LOOP;
    
    RETURN QUERY SELECT total_processed, total_errors;
END;
$$;


--
-- Name: process_whatsapp_nps_response(character varying, integer, text, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_whatsapp_nps_response(response_token_param character varying, score_param integer, comment_param text DEFAULT NULL::text, whatsapp_message_id_param character varying DEFAULT NULL::character varying) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    response_id uuid;
BEGIN
    response_id := gen_random_uuid();
    
    -- Inserir resposta NPS
    INSERT INTO nps_responses (
        id,
        score,
        comment,
        response_token,
        whatsapp_message_id,
        created_at,
        updated_at
    ) VALUES (
        response_id,
        score_param,
        comment_param,
        response_token_param,
        whatsapp_message_id_param,
        NOW(),
        NOW()
    );
    
    RETURN response_id;
END;
$$;


--
-- Name: process_whatsapp_schedule(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_whatsapp_schedule(p_schedule_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_schedule RECORD;
    v_base_url TEXT := 'https://dzmatfnltgtgjvbputtb.supabase.co';
    v_user RECORD;
    v_message TEXT;
    v_nps_url TEXT;
    v_token TEXT;
    v_current_stats JSONB;
    v_new_stats JSONB;
BEGIN
    -- Log início do processamento
    INSERT INTO message_schedule_logs (schedule_id, log_type, message)
    VALUES (p_schedule_id, 'info', 'Iniciando processamento do agendamento WhatsApp');
    
    -- Obter dados do agendamento
    SELECT * INTO v_schedule
    FROM message_schedules
    WHERE id = p_schedule_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento não encontrado: %', p_schedule_id;
    END IF;
    
    -- Obter estatísticas atuais
    v_current_stats := COALESCE(v_schedule.execution_stats, '{}'::jsonb);
    
    -- Processar usuários baseado no target_type
    IF v_schedule.target_type = 'all' THEN
        -- Processar todos os usuários com telefone
        FOR v_user IN 
            SELECT id, phone, full_name 
            FROM auth.users 
            WHERE phone IS NOT NULL AND phone != ''
        LOOP
            -- Gerar token de resposta único
            v_token := encode(gen_random_bytes(32), 'hex');
            
            -- Preparar mensagem
            v_message := v_schedule.message;
            
            -- Adicionar URL do NPS se aplicável
            IF v_schedule.nps_data IS NOT NULL THEN
                v_nps_url := v_base_url || '/nps/respond/' || v_token;
                v_message := v_message || '\n\nResponda nossa pesquisa: ' || v_nps_url;
            END IF;
            
            -- Inserir na tabela whatsapp_sends
            INSERT INTO whatsapp_sends (
                schedule_id,
                user_id,
                phone_number,
                message,
                status,
                response_token
            ) VALUES (
                p_schedule_id,
                v_user.id,
                v_user.phone,
                v_message,
                'pending',
                v_token
            );
        END LOOP;
    ELSE
        -- Processar usuários específicos baseado nos filtros
        FOR v_user IN 
            SELECT u.id, u.phone, u.full_name 
            FROM auth.users u
            WHERE u.phone IS NOT NULL AND u.phone != ''
            AND (
                v_schedule.target_filters IS NULL OR
                jsonb_typeof(v_schedule.target_filters) = 'null' OR
                u.id = ANY(SELECT jsonb_array_elements_text(v_schedule.target_filters->'user_ids')::UUID)
            )
        LOOP
            -- Gerar token de resposta único
            v_token := encode(gen_random_bytes(32), 'hex');
            
            -- Preparar mensagem
            v_message := v_schedule.message;
            
            -- Adicionar URL do NPS se aplicável
            IF v_schedule.nps_data IS NOT NULL THEN
                v_nps_url := v_base_url || '/nps/respond/' || v_token;
                v_message := v_message || '\n\nResponda nossa pesquisa: ' || v_nps_url;
            END IF;
            
            -- Inserir na tabela whatsapp_sends
            INSERT INTO whatsapp_sends (
                schedule_id,
                user_id,
                phone_number,
                message,
                status,
                response_token
            ) VALUES (
                p_schedule_id,
                v_user.id,
                v_user.phone,
                v_message,
                'pending',
                v_token
            );
        END LOOP;
    END IF;
    
    -- Atualizar estatísticas de execução
    v_new_stats := v_current_stats || jsonb_build_object(
        'execution_count', COALESCE((v_current_stats->>'execution_count')::INTEGER, 0) + 1,
        'last_executed_at', NOW()::TEXT
    );
    
    -- Atualizar agendamento
    UPDATE message_schedules 
    SET 
        last_executed_at = NOW(),
        execution_stats = v_new_stats,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    -- Log conclusão
    INSERT INTO message_schedule_logs (schedule_id, log_type, message)
    VALUES (p_schedule_id, 'info', 'Processamento do agendamento WhatsApp concluído');
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro
        INSERT INTO message_schedule_logs (schedule_id, log_type, message)
        VALUES (p_schedule_id, 'error', 'Erro no processamento: ' || SQLERRM);
        
        -- Atualizar estatísticas de erro
        v_current_stats := COALESCE(v_schedule.execution_stats, '{}'::jsonb);
        v_new_stats := v_current_stats || jsonb_build_object(
            'error_count', COALESCE((v_current_stats->>'error_count')::INTEGER, 0) + 1,
            'last_error', SQLERRM
        );
        
        UPDATE message_schedules 
        SET execution_stats = v_new_stats
        WHERE id = p_schedule_id;
        
        RAISE;
END;
$$;


--
-- Name: process_whatsapp_webhook(text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_whatsapp_webhook(whatsapp_message_id_param text, webhook_status text, webhook_data jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    send_record RECORD;
    new_status text;
BEGIN
    -- Mapear status do webhook para status interno
    new_status := CASE webhook_status
        WHEN 'sent' THEN 'sent'
        WHEN 'delivered' THEN 'delivered'
        WHEN 'read' THEN 'read'
        WHEN 'failed' THEN 'failed'
        ELSE 'error'
    END;
    
    -- Buscar envio pelo whatsapp_message_id
    SELECT * INTO send_record
    FROM whatsapp_sends 
    WHERE whatsapp_message_id = whatsapp_message_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Envio não encontrado para whatsapp_message_id: %', whatsapp_message_id_param;
    END IF;
    
    -- Atualizar status
    UPDATE whatsapp_sends 
    SET 
        status = new_status,
        delivered_at = CASE 
            WHEN new_status = 'delivered' AND delivered_at IS NULL THEN NOW()
            ELSE delivered_at 
        END,
        read_at = CASE 
            WHEN new_status = 'read' AND read_at IS NULL THEN NOW()
            ELSE read_at 
        END,
        metadata = metadata || webhook_data,
        updated_at = NOW()
    WHERE id = send_record.id;
    
    RETURN true;
END;
$$;


--
-- Name: promote_user_by_admin(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_user_by_admin(target_user_id uuid, target_role text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar se o usuário atual é admin ou super_admin
  IF NOT (
    SELECT role IN ('admin', 'super_admin') OR nivel IN ('admin', 'super_admin')
    FROM public.users 
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem promover usuários';
  END IF;

  -- Verificar se o target_role é válido para admin
  IF target_role NOT IN ('gestor_rh', 'gerente') THEN
    RAISE EXCEPTION 'Admins só podem promover usuários para gestor_rh ou gerente';
  END IF;

  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se o usuário alvo já tem um role superior
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = target_user_id 
    AND (role IN ('super_admin', 'admin') OR nivel IN ('super_admin', 'admin'))
  ) THEN
    RAISE EXCEPTION 'Não é possível alterar o role de administradores';
  END IF;

  -- Promover o usuário
  UPDATE public.users 
  SET 
    role = target_role,
    nivel = target_role,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Log da ação (se a tabela audit_log existir)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    INSERT INTO public.audit_log (user_id, action, details, created_at)
    VALUES (
      auth.uid(),
      'promote_user_by_admin',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'promoted_to', target_role
      ),
      NOW()
    );
  END IF;
END;
$$;


--
-- Name: FUNCTION promote_user_by_admin(target_user_id uuid, target_role text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.promote_user_by_admin(target_user_id uuid, target_role text) IS 'Permite que admins promovam usuários para gestor_rh ou gerente. Apenas super_admin pode promover para admin.';


--
-- Name: promote_user_to_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_user_to_admin(target_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar se o usuário atual é super_admin
  IF NOT (
    SELECT COALESCE(preferences->>'super_user', 'false')::boolean 
    FROM public.users 
    WHERE id = auth.uid()
  ) AND NOT (
    SELECT role IN ('super_admin') OR nivel IN ('super_admin')
    FROM public.users 
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Apenas super administradores podem promover usuários';
  END IF;

  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se o usuário alvo já é super_admin
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = target_user_id 
    AND (role = 'super_admin' OR nivel = 'super_admin' OR COALESCE(preferences->>'super_user', 'false')::boolean = true)
  ) THEN
    RAISE EXCEPTION 'Usuário já é super administrador';
  END IF;

  -- Promover o usuário para admin
  UPDATE public.users 
  SET 
    role = 'admin',
    nivel = 'admin',
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Log da ação (se a tabela audit_log existir)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    INSERT INTO public.audit_log (user_id, action, details, created_at)
    VALUES (
      auth.uid(),
      'promote_user_to_admin',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'promoted_to', 'admin'
      ),
      NOW()
    );
  END IF;
END;
$$;


--
-- Name: refresh_schedule_statistics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_schedule_statistics() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY schedule_statistics;
END;
$$;


--
-- Name: restore_record(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.restore_record(table_name text, record_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
BEGIN
    EXECUTE format('UPDATE public.%I SET deleted_at = NULL WHERE id = $1', table_name)
    USING record_id;
    
    RETURN FOUND;
END;
$_$;


--
-- Name: send_whatsapp_message(text, text, text, text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.send_whatsapp_message(p_api_url text, p_api_key text, p_instance_name text, p_phone_number text, p_message text, p_timeout integer DEFAULT 30) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_request_body JSONB;
    v_response_id BIGINT;
    v_status_code INTEGER;
    v_error_message TEXT;
    v_full_url TEXT;
    v_encoded_instance TEXT;
    v_response_json JSONB;
    v_headers JSONB;
    v_content TEXT;
BEGIN
    -- Validate input parameters
    IF p_api_url IS NULL OR p_api_url = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'API URL é obrigatória'
        );
    END IF;
    
    IF p_api_key IS NULL OR p_api_key = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'API Key é obrigatória'
        );
    END IF;
    
    IF p_instance_name IS NULL OR p_instance_name = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Nome da instância é obrigatório'
        );
    END IF;
    
    IF p_phone_number IS NULL OR p_phone_number = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Número de telefone é obrigatório'
        );
    END IF;
    
    IF p_message IS NULL OR p_message = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Mensagem é obrigatória'
        );
    END IF;
    
    -- Clean phone number (remove non-numeric characters)
    p_phone_number := regexp_replace(p_phone_number, '[^0-9]', '', 'g');
    
    -- Ensure phone number has country code (Brazil +55)
    IF length(p_phone_number) = 11 AND left(p_phone_number, 2) != '55' THEN
        p_phone_number := '55' || p_phone_number;
    ELSIF length(p_phone_number) = 10 AND left(p_phone_number, 2) != '55' THEN
        p_phone_number := '55' || p_phone_number;
    END IF;
    
    -- URL encode instance name (replace spaces with %20)
    v_encoded_instance := replace(p_instance_name, ' ', '%20');
    
    -- Build request headers with API key
    v_headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', p_api_key
    );
    
    -- Build request body (only number and text)
    v_request_body := jsonb_build_object(
        'number', p_phone_number,
        'text', p_message
    );
    
    -- Build URL with encoded instance name
    v_full_url := rtrim(p_api_url, '/') || '/message/sendText/' || v_encoded_instance;
    
    BEGIN
        -- Use net.http_post to send the request
        v_response_id := net.http_post(
            url := v_full_url,
            body := v_request_body,
            params := NULL,
            headers := v_headers,
            timeout_milliseconds := p_timeout * 1000
        );
        
        -- Wait for response (up to 5 seconds)
        FOR i IN 1..10 LOOP
            SELECT status_code, content INTO v_status_code, v_content
            FROM net._http_response 
            WHERE id = v_response_id;
            
            EXIT WHEN v_status_code IS NOT NULL;
            PERFORM pg_sleep(0.5);
        END LOOP;
        
        -- If we got a response
        IF v_status_code IS NOT NULL THEN
            -- Try to parse response content as JSON
            BEGIN
                v_response_json := v_content::jsonb;
            EXCEPTION WHEN OTHERS THEN
                v_response_json := jsonb_build_object('raw_content', v_content);
            END;
            
            -- Check if request was successful (200-299)
            IF v_status_code BETWEEN 200 AND 299 THEN
                RETURN jsonb_build_object(
                    'success', true,
                    'status_code', v_status_code,
                    'response', v_response_json,
                    'request_id', v_response_id,
                    'message_id', COALESCE((v_response_json->'key'->>'id'), (v_response_json->>'messageId')),
                    'whatsapp_status', COALESCE((v_response_json->>'status'), 'unknown'),
                    'phone_number', p_phone_number,
                    'message_sent', p_message
                );
            ELSE
                -- API returned an error status
                v_error_message := format('HTTP %s: %s', v_status_code, COALESCE((v_response_json->>'message'), (v_response_json->>'error'), 'Unknown error'));
                
                RETURN jsonb_build_object(
                    'success', false,
                    'status_code', v_status_code,
                    'error', v_error_message,
                    'response', v_response_json,
                    'request_id', v_response_id
                );
            END IF;
        ELSE
            -- Response not received within timeout
            RETURN jsonb_build_object(
                'success', true,
                'request_id', v_response_id,
                'message', 'Requisição enviada, aguardando resposta da API',
                'note', 'Use o request_id para verificar o status posteriormente'
            );
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        v_error_message := format('Erro ao enviar mensagem: %s', SQLERRM);
        
        RETURN jsonb_build_object(
            'success', false,
            'error', v_error_message,
            'sqlstate', SQLSTATE
        );
    END;
END;
$$;


--
-- Name: FUNCTION send_whatsapp_message(p_api_url text, p_api_key text, p_instance_name text, p_phone_number text, p_message text, p_timeout integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.send_whatsapp_message(p_api_url text, p_api_key text, p_instance_name text, p_phone_number text, p_message text, p_timeout integer) IS 'Envia mensagem WhatsApp via Evolution API - atualizada para trabalhar com a tabela consolidada whatsapp_sends';


--
-- Name: set_response_token(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_response_token() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.response_token IS NULL THEN
    NEW.response_token = generate_response_token();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: should_execute_conditional(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.should_execute_conditional(schedule_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Por enquanto, sempre retornar true para agendamentos condicionais
    -- Esta função pode ser expandida no futuro para verificar condições específicas
    RETURN true;
END;
$$;


--
-- Name: soft_delete_record(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.soft_delete_record(table_name text, record_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
BEGIN
    EXECUTE format('UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', table_name)
    USING record_id;
    
    RETURN FOUND;
END;
$_$;


--
-- Name: sync_user_tables(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_user_tables() RETURNS TABLE(action_taken text, user_id uuid, user_email text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Retornar usuários que existem em auth.users mas não em profiles
  RETURN QUERY
  SELECT 
    'orphaned_auth_user'::TEXT as action_taken,
    au.id as user_id,
    au.email::TEXT as user_email
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE p.id IS NULL;
END;
$$;


--
-- Name: toggle_schedule_status(uuid, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.toggle_schedule_status(p_schedule_id uuid, p_status character varying) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE message_schedules 
  SET status = p_status, updated_at = NOW()
  WHERE id = p_schedule_id;
  
  RETURN FOUND;
END;
$$;


--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_app_base_url(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_app_base_url(new_url text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Atualizar ou inserir a configuração da URL base
    INSERT INTO system_settings (key, value, updated_at)
    VALUES ('app_base_url', new_url, NOW())
    ON CONFLICT (key) 
    DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at;
    
    -- Log da atualização usando level em maiúsculas
    INSERT INTO system_logs (level, message, context)
    VALUES (
        'INFO',
        'URL base da aplicação atualizada',
        jsonb_build_object(
            'new_url', new_url,
            'updated_by', COALESCE(auth.uid()::text, 'system'),
            'timestamp', NOW()
        )
    );
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro usando level em maiúsculas
    INSERT INTO system_logs (level, message, context)
    VALUES (
        'ERROR',
        'Erro ao atualizar URL base: ' || SQLERRM,
        jsonb_build_object(
            'new_url', new_url,
            'error_detail', SQLERRM,
            'sqlstate', SQLSTATE,
            'timestamp', NOW()
        )
    );
    
    RETURN FALSE;
END;
$$;


--
-- Name: update_folha_pagamento_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_folha_pagamento_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_message_schedules_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_message_schedules_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_missing_whatsapp_message_ids(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_missing_whatsapp_message_ids() RETURNS TABLE(updated_count integer, error_count integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    send_record RECORD;
    response_record RECORD;
    response_json JSONB;
    message_id TEXT;
    total_updated INTEGER := 0;
    total_errors INTEGER := 0;
BEGIN
    -- Buscar envios com status 'sent' mas sem whatsapp_message_id
    FOR send_record IN 
        SELECT id, metadata
        FROM whatsapp_sends 
        WHERE status = 'sent' 
        AND whatsapp_message_id IS NULL
        AND metadata ? 'request_id'
    LOOP
        BEGIN
            -- Buscar a resposta HTTP correspondente
            SELECT content INTO response_json
            FROM net._http_response 
            WHERE id = (send_record.metadata->>'request_id')::bigint
            AND status_code BETWEEN 200 AND 299;
            
            IF response_json IS NOT NULL THEN
                -- Extrair o message_id da resposta
                message_id := COALESCE(
                    (response_json->'key'->>'id'), 
                    (response_json->>'messageId')
                );
                
                IF message_id IS NOT NULL THEN
                    -- Atualizar o envio com o message_id
                    UPDATE whatsapp_sends 
                    SET 
                        whatsapp_message_id = message_id,
                        metadata = metadata || jsonb_build_object(
                            'api_response', response_json,
                            'whatsapp_status', COALESCE((response_json->>'status'), 'unknown')
                        ),
                        updated_at = NOW()
                    WHERE id = send_record.id;
                    
                    total_updated := total_updated + 1;
                END IF;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            total_errors := total_errors + 1;
        END;
    END LOOP;
    
    RETURN QUERY SELECT total_updated, total_errors;
END;
$$;


--
-- Name: update_nps_schedules_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_nps_schedules_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_nps_whatsapp_messages_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_nps_whatsapp_messages_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_nps_whatsapp_sends_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_nps_whatsapp_sends_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_payrolls_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_payrolls_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_role_permissions(text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_role_permissions(role_name text, permission_names text[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    role_id UUID;
    perm_id UUID;
    permission_name TEXT;
    current_user_id UUID;
    user_role_name TEXT;
BEGIN
    -- Obter o ID do usuário autenticado
    current_user_id := auth.uid();
    
    -- Se não há usuário autenticado, negar acesso
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Buscar role do usuário atual
    SELECT role INTO user_role_name 
    FROM users 
    WHERE auth_user_id = current_user_id 
    AND status = 'ativo';
    
    -- Verificar se o usuário tem permissão (super_admin ou admin)
    IF user_role_name NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: apenas super_admin e admin podem gerenciar permissões de roles';
    END IF;
    
    -- Não permitir alterações nos roles super_admin e admin
    IF role_name IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Não é possível alterar permissões dos roles super_admin e admin';
    END IF;
    
    -- Obter o ID do role
    SELECT id INTO role_id
    FROM roles
    WHERE name = role_name;
    
    IF role_id IS NULL THEN
        RAISE EXCEPTION 'Role não encontrado: %', role_name;
    END IF;
    
    -- Remover todas as permissões existentes do role
    DELETE FROM role_permissions
    WHERE role_id = update_role_permissions.role_id;
    
    -- Adicionar as novas permissões
    FOREACH permission_name IN ARRAY permission_names
    LOOP
        SELECT id INTO perm_id
        FROM permissions
        WHERE name = permission_name;
        
        IF perm_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (update_role_permissions.role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$;


--
-- Name: FUNCTION update_role_permissions(role_name text, permission_names text[]); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_role_permissions(role_name text, permission_names text[]) IS 'Atualiza as permissões de um role específico (apenas super_admin e admin podem usar)';


--
-- Name: update_schedule_after_execution(uuid, boolean, integer, integer, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_schedule_after_execution(p_schedule_id uuid, p_success boolean, p_recipients_count integer DEFAULT 0, p_success_count integer DEFAULT 0, p_error_count integer DEFAULT 0, p_error_message text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_schedule RECORD;
  v_next_execution TIMESTAMPTZ;
  v_execution_stats JSONB;
BEGIN
  -- Buscar agendamento atual
  SELECT * INTO v_schedule FROM message_schedules WHERE id = p_schedule_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Schedule not found: %', p_schedule_id;
  END IF;
  
  -- Obter estatísticas atuais
  v_execution_stats := COALESCE(v_schedule.execution_stats, '{}'::jsonb);
  
  -- Calcular próxima execução
  v_next_execution := NULL;
  
  IF v_schedule.schedule_type = 'recurring' AND p_success THEN
    -- Para agendamentos recorrentes, calcular próxima execução baseada no padrão
    CASE (v_schedule.recurring_pattern->>'type')::TEXT
      WHEN 'daily' THEN v_next_execution := NOW() + INTERVAL '1 day';
      WHEN 'weekly' THEN v_next_execution := NOW() + INTERVAL '1 week';
      WHEN 'monthly' THEN v_next_execution := NOW() + INTERVAL '1 month';
      ELSE v_next_execution := NOW() + INTERVAL '1 hour';
    END CASE;
  END IF;
  
  -- Atualizar estatísticas
  v_execution_stats := v_execution_stats || jsonb_build_object(
    'execution_count', COALESCE((v_execution_stats->>'execution_count')::INTEGER, 0) + 1,
    'success_count', COALESCE((v_execution_stats->>'success_count')::INTEGER, 0) + p_success_count,
    'error_count', COALESCE((v_execution_stats->>'error_count')::INTEGER, 0) + p_error_count,
    'last_error', CASE WHEN p_success THEN NULL ELSE p_error_message END
  );
  
  -- Atualizar agendamento
  UPDATE message_schedules SET
    execution_stats = v_execution_stats,
    last_executed_at = NOW(),
    next_execution_at = v_next_execution,
    status = CASE 
      WHEN v_next_execution IS NULL AND v_schedule.schedule_type IN ('scheduled', 'immediate') THEN 'completed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_schedule_id;
  
  -- Inserir log na tabela correta
  INSERT INTO message_schedule_logs (
    schedule_id,
    level,
    message,
    context
  ) VALUES (
    p_schedule_id,
    CASE WHEN p_success THEN 'INFO' ELSE 'ERROR' END,
    CASE WHEN p_success THEN 'Execução bem-sucedida' ELSE 'Erro na execução: ' || COALESCE(p_error_message, 'Erro desconhecido') END,
    jsonb_build_object(
      'executed_at', NOW(),
      'recipients_count', p_recipients_count,
      'success_count', p_success_count,
      'error_count', p_error_count,
      'error_message', p_error_message
    )
  );
END;
$$;


--
-- Name: update_schedule_after_execution(uuid, boolean, text, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_schedule_after_execution(p_schedule_id uuid, p_success boolean, p_error_message text DEFAULT NULL::text, p_recipients_count integer DEFAULT 0, p_success_count integer DEFAULT 0, p_error_count integer DEFAULT 0) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_schedule RECORD;
  v_next_execution TIMESTAMPTZ;
BEGIN
  -- Buscar agendamento atual
  SELECT * INTO v_schedule FROM message_schedules WHERE id = p_schedule_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Schedule not found: %', p_schedule_id;
  END IF;
  
  -- Calcular próxima execução
  v_next_execution := NULL;
  
  IF v_schedule.schedule_type = 'recurring' AND p_success THEN
    v_next_execution := calculate_next_execution(v_schedule.recurring_pattern);
  ELSIF v_schedule.schedule_type = 'conditional' AND p_success THEN
    v_next_execution := calculate_conditional_execution(v_schedule.conditions);
  END IF;
  
  -- Verificar se deve parar (max_executions atingido)
  IF v_schedule.max_executions IS NOT NULL AND 
     v_schedule.execution_count + 1 >= v_schedule.max_executions THEN
    v_next_execution := NULL;
  END IF;
  
  -- Atualizar agendamento
  UPDATE message_schedules SET
    execution_count = execution_count + 1,
    success_count = success_count + p_success_count,
    error_count = error_count + p_error_count,
    last_executed_at = NOW(),
    next_execution_at = v_next_execution,
    last_error = CASE WHEN p_success THEN NULL ELSE p_error_message END,
    status = CASE 
      WHEN v_next_execution IS NULL AND v_schedule.schedule_type IN ('scheduled', 'immediate') THEN 'completed'
      WHEN v_next_execution IS NULL AND v_schedule.max_executions IS NOT NULL THEN 'completed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_schedule_id;
  
  -- Inserir log
  INSERT INTO schedule_logs (
    schedule_id,
    status,
    recipients_count,
    success_count,
    error_count,
    execution_data,
    error_details
  ) VALUES (
    p_schedule_id,
    CASE WHEN p_success THEN 'success' ELSE 'error' END,
    p_recipients_count,
    p_success_count,
    p_error_count,
    jsonb_build_object(
      'executed_at', NOW(),
      'recipients_count', p_recipients_count,
      'success_count', p_success_count,
      'error_count', p_error_count
    ),
    CASE WHEN p_error_message IS NOT NULL THEN 
      jsonb_build_object('error', p_error_message)
    ELSE NULL END
  );
END;
$$;


--
-- Name: FUNCTION update_schedule_after_execution(p_schedule_id uuid, p_success boolean, p_error_message text, p_recipients_count integer, p_success_count integer, p_error_count integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_schedule_after_execution(p_schedule_id uuid, p_success boolean, p_error_message text, p_recipients_count integer, p_success_count integer, p_error_count integer) IS 'Atualiza agendamento após execução';


--
-- Name: update_schedule_execution_stats(uuid, integer, integer, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_schedule_execution_stats(schedule_id_param uuid, sent_count integer DEFAULT 0, failed_count integer DEFAULT 0, execution_details jsonb DEFAULT NULL::jsonb) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    current_stats jsonb;
    new_stats jsonb;
BEGIN
    -- Buscar estatísticas atuais
    SELECT execution_stats INTO current_stats
    FROM message_schedules
    WHERE id = schedule_id_param;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Preparar novas estatísticas
    current_stats := COALESCE(current_stats, '{}'::jsonb);
    
    new_stats := current_stats || jsonb_build_object(
        'last_execution_at', NOW(),
        'total_executions', COALESCE((current_stats->>'total_executions')::int, 0) + 1,
        'total_sent', COALESCE((current_stats->>'total_sent')::int, 0) + sent_count,
        'total_failed', COALESCE((current_stats->>'total_failed')::int, 0) + failed_count,
        'last_sent_count', sent_count,
        'last_failed_count', failed_count
    );
    
    -- Adicionar detalhes da execução se fornecidos
    IF execution_details IS NOT NULL THEN
        new_stats := new_stats || jsonb_build_object('last_execution_details', execution_details);
    END IF;
    
    -- Atualizar o agendamento
    UPDATE message_schedules
    SET 
        execution_stats = new_stats,
        last_executed_at = NOW(),
        updated_at = NOW(),
        -- Calcular próxima execução se for recorrente
        next_execution_at = CASE 
            WHEN recurring_pattern IS NOT NULL THEN
                CASE 
                    WHEN recurring_pattern->>'frequency' = 'daily' THEN NOW() + INTERVAL '1 day'
                    WHEN recurring_pattern->>'frequency' = 'weekly' THEN NOW() + INTERVAL '1 week'
                    WHEN recurring_pattern->>'frequency' = 'monthly' THEN NOW() + INTERVAL '1 month'
                    ELSE NULL
                END
            ELSE NULL
        END
    WHERE id = schedule_id_param;
    
    RETURN FOUND;
END;
$$;


--
-- Name: update_system_setting(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_system_setting(setting_key text, setting_value text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE system_settings 
    SET value = setting_value, updated_at = NOW() 
    WHERE key = setting_key;
    
    IF NOT FOUND THEN
        INSERT INTO system_settings (key, value, updated_at)
        VALUES (setting_key, setting_value, NOW());
    END IF;
    
    RETURN TRUE;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_users_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_users_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_whatsapp_schedules_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_whatsapp_schedules_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_whatsapp_send_status(uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_whatsapp_send_status(send_id_param uuid, new_status text, whatsapp_message_id_param text DEFAULT NULL::text, error_message_param text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    updated_rows integer;
BEGIN
    -- Validar status
    IF new_status NOT IN ('pending', 'sent', 'delivered', 'read', 'failed', 'error') THEN
        RAISE EXCEPTION 'Status inválido: %', new_status;
    END IF;
    
    -- Atualizar registro
    UPDATE whatsapp_sends 
    SET 
        status = new_status,
        whatsapp_message_id = COALESCE(whatsapp_message_id_param, whatsapp_message_id),
        error_message = CASE 
            WHEN new_status IN ('failed', 'error') THEN error_message_param
            ELSE NULL 
        END,
        sent_at = CASE 
            WHEN new_status = 'sent' AND sent_at IS NULL THEN NOW()
            ELSE sent_at 
        END,
        delivered_at = CASE 
            WHEN new_status = 'delivered' AND delivered_at IS NULL THEN NOW()
            ELSE delivered_at 
        END,
        read_at = CASE 
            WHEN new_status = 'read' AND read_at IS NULL THEN NOW()
            ELSE read_at 
        END,
        updated_at = NOW()
    WHERE id = send_id_param;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    IF updated_rows = 0 THEN
        RAISE EXCEPTION 'Envio não encontrado: %', send_id_param;
    END IF;
    
    RETURN true;
END;
$$;


--
-- Name: update_whatsapp_send_status(uuid, text, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_whatsapp_send_status(p_send_id uuid, p_status text, p_sent_at timestamp with time zone DEFAULT now(), p_error_message text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Validar status
    IF p_status NOT IN ('sent', 'failed', 'pending') THEN
        RAISE EXCEPTION 'Status inválido: %. Valores permitidos: sent, failed, pending', p_status;
    END IF;

    -- Atualizar o registro
    UPDATE whatsapp_sends 
    SET 
        status = p_status,
        sent_at = CASE WHEN p_status = 'sent' THEN p_sent_at ELSE sent_at END,
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = p_send_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    -- Retornar true se atualizou algum registro
    RETURN v_updated_count > 0;
END;
$$;


--
-- Name: FUNCTION update_whatsapp_send_status(p_send_id uuid, p_status text, p_sent_at timestamp with time zone, p_error_message text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_whatsapp_send_status(p_send_id uuid, p_status text, p_sent_at timestamp with time zone, p_error_message text) IS 'Função para n8n atualizar status dos envios de WhatsApp';


--
-- Name: validate_nps_response_token(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_nps_response_token(token_param text) RETURNS TABLE(is_valid boolean, schedule_id uuid, survey_id uuid, user_id uuid, phone_number text, survey_title text, survey_question text, error_message text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    schedule_record RECORD;
    survey_record RECORD;
    user_record RECORD;
    found_user BOOLEAN := FALSE;
BEGIN
    -- Buscar agendamento pelo token
    SELECT ms.*, (ms.nps_data->>'survey_id')::UUID as survey_id_extracted
    INTO schedule_record
    FROM message_schedules ms
    WHERE ms.response_token = token_param
    AND ms.type = 'nps'
    AND ms.channel = 'whatsapp';
    
    -- Se não encontrou o agendamento
    IF NOT FOUND THEN
        is_valid := FALSE;
        error_message := 'Token inválido ou expirado';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar dados da pesquisa
    SELECT * INTO survey_record
    FROM nps_surveys ns
    WHERE ns.id = schedule_record.survey_id_extracted;
    
    IF NOT FOUND THEN
        is_valid := FALSE;
        error_message := 'Pesquisa NPS não encontrada';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Buscar dados do usuário (se disponível no nps_data)
    IF schedule_record.nps_data ? 'user_id' THEN
        SELECT * INTO user_record
        FROM users u
        WHERE u.id = (schedule_record.nps_data->>'user_id')::UUID;
        
        IF FOUND THEN
            found_user := TRUE;
        END IF;
    END IF;
    
    -- Verificar se já foi respondido
    IF EXISTS (
        SELECT 1 FROM nps_responses nr
        WHERE nr.response_token = token_param
    ) THEN
        is_valid := FALSE;
        error_message := 'Esta pesquisa já foi respondida';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Token válido
    is_valid := TRUE;
    schedule_id := schedule_record.id;
    survey_id := survey_record.id;
    
    IF found_user THEN
        user_id := user_record.id;
        phone_number := COALESCE(user_record.phone, schedule_record.nps_data->>'phone_number');
    ELSE
        user_id := (schedule_record.nps_data->>'user_id')::UUID;
        phone_number := schedule_record.nps_data->>'phone_number';
    END IF;
    
    survey_title := survey_record.title;
    survey_question := survey_record.question;
    error_message := NULL;
    
    RETURN NEXT;
END;
$$;


--
-- Name: validate_nps_token(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_nps_token(token_param text) RETURNS TABLE(is_valid boolean, send_data jsonb, error_message text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN nt.token IS NULL THEN FALSE
            WHEN nt.is_active = FALSE THEN FALSE
            WHEN EXISTS (
                SELECT 1 FROM nps_responses nr 
                WHERE nr.survey_id = nt.survey_id 
                AND nr.user_phone = nt.user_phone
            ) THEN FALSE
            ELSE TRUE
        END as is_valid,
        CASE 
            WHEN nt.token IS NOT NULL THEN
                jsonb_build_object(
                    'survey_id', nt.survey_id,
                    'survey_title', COALESCE(ns.title, 'Pesquisa NPS'),
                    'user_name', nt.user_name,
                    'user_phone', nt.user_phone,
                    'question', COALESCE(ns.question, 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa?'),
                    'already_responded', EXISTS (
                        SELECT 1 FROM nps_responses nr 
                        WHERE nr.survey_id = nt.survey_id 
                        AND nr.user_phone = nt.user_phone
                    )
                )
            ELSE NULL
        END as send_data,
        CASE 
            WHEN nt.token IS NULL THEN 'Token não encontrado'
            WHEN nt.is_active = FALSE THEN 'Token já foi utilizado'
            WHEN EXISTS (
                SELECT 1 FROM nps_responses nr 
                WHERE nr.survey_id = nt.survey_id 
                AND nr.user_phone = nt.user_phone
            ) THEN 'Pesquisa já foi respondida'
            ELSE NULL
        END as error_message
    FROM nps_tokens nt
    LEFT JOIN nps_surveys ns ON ns.id = nt.survey_id
    WHERE nt.token = token_param;
END;
$$;


--
-- Name: validate_password_strength(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_password_strength(password text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
BEGIN
    -- Verificar comprimento mínimo (8 caracteres)
    IF length(password) < 8 THEN
        RAISE EXCEPTION 'Senha deve ter pelo menos 8 caracteres';
    END IF;
    
    -- Verificar se contém pelo menos uma letra maiúscula
    IF password !~ '[A-Z]' THEN
        RAISE EXCEPTION 'Senha deve conter pelo menos uma letra maiúscula';
    END IF;
    
    -- Verificar se contém pelo menos uma letra minúscula
    IF password !~ '[a-z]' THEN
        RAISE EXCEPTION 'Senha deve conter pelo menos uma letra minúscula';
    END IF;
    
    -- Verificar se contém pelo menos um número
    IF password !~ '[0-9]' THEN
        RAISE EXCEPTION 'Senha deve conter pelo menos um número';
    END IF;
    
    -- Verificar se contém pelo menos um caractere especial
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RAISE EXCEPTION 'Senha deve conter pelo menos um caractere especial';
    END IF;
    
    -- Verificar senhas comuns/fracas
    IF lower(password) IN ('password', '123456', '12345678', 'qwerty', 'abc123', 'password123') THEN
        RAISE EXCEPTION 'Senha muito comum, escolha uma senha mais segura';
    END IF;
    
    RETURN true;
END;
$_$;


--
-- Name: FUNCTION validate_password_strength(password text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_password_strength(password text) IS 'Valida a força da senha conforme critérios de segurança';


--
-- Name: validate_password_strength_enhanced(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_password_strength_enhanced(password text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
BEGIN
  -- Verificar comprimento mínimo (12 caracteres)
  IF length(password) < 12 THEN
    RETURN false;
  END IF;
  
  -- Verificar se contém pelo menos uma letra minúscula
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Verificar se contém pelo menos uma letra maiúscula
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Verificar se contém pelo menos um número
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Verificar se contém pelo menos um caractere especial
  IF password !~ '[!@#$%^&*()_+\-=\[\]{};''\\:"|<>?,./`~]' THEN
    RETURN false;
  END IF;
  
  -- Verificar contra senhas comuns
  IF lower(password) IN ('123456789012', 'password1234', 'qwerty123456', 'admin1234567', 'welcome12345') THEN
    RETURN false;
  END IF;
  
  -- Verificar sequências simples
  IF password ~ '(.)\1{3,}' THEN -- 4 ou mais caracteres repetidos
    RETURN false;
  END IF;
  
  -- Verificar sequências numéricas
  IF password ~ '(0123|1234|2345|3456|4567|5678|6789|7890)' THEN
    RETURN false;
  END IF;
  
  -- Verificar sequências alfabéticas
  IF lower(password) ~ '(abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$_$;


--
-- Name: validate_security_settings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_security_settings() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  result json;
  functions_with_search_path integer;
  rls_enabled_tables integer;
  security_policies integer;
BEGIN
  -- Verificar funções com search_path configurado
  SELECT COUNT(*)
  INTO functions_with_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('validate_password_strength_enhanced', 'cleanup_expired_sessions_enhanced')
    AND prosecdef = true
    AND array_to_string(proconfig, ',') LIKE '%search_path=%';
  
  -- Verificar tabelas com RLS habilitado
  SELECT COUNT(*)
  INTO rls_enabled_tables
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relname = 'security_audit_log'
    AND c.relrowsecurity = true;
  
  -- Verificar políticas de segurança
  SELECT COUNT(*)
  INTO security_policies
  FROM pg_policy pol
  JOIN pg_class c ON pol.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relname = 'security_audit_log';
  
  -- Construir resultado
  result := json_build_object(
    'functions_with_search_path', functions_with_search_path,
    'rls_enabled_tables', rls_enabled_tables,
    'security_policies', security_policies,
    'search_path_issues_resolved', CASE WHEN functions_with_search_path = 2 THEN true ELSE false END,
    'recommendations', json_build_array(
      'Configure OTP expiry to 3600 seconds (1 hour) or less in Supabase Dashboard > Authentication > Settings',
      'Enable leaked password protection in Supabase Dashboard > Authentication > Settings > Password Protection',
      'Both settings must be configured through the Supabase Dashboard as they are managed at the project level'
    )
  );
  
  RETURN result;
END;
$$;


--
-- Name: validate_simple_nps_token(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_simple_nps_token(token_param text) RETURNS TABLE(is_valid boolean, send_data jsonb, error_message text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN nt.token IS NULL THEN FALSE
            WHEN nt.is_active = FALSE THEN FALSE
            WHEN nt.used_at IS NOT NULL THEN FALSE
            WHEN EXISTS (
                SELECT 1 FROM nps_responses nr 
                WHERE nr.survey_id = nt.survey_id 
                AND nr.user_phone = nt.user_phone
            ) THEN FALSE
            ELSE TRUE
        END as is_valid,
        CASE 
            WHEN nt.token IS NOT NULL THEN
                jsonb_build_object(
                    'survey_id', nt.survey_id,
                    'survey_title', COALESCE(ns.title, 'Pesquisa NPS'),
                    'user_name', nt.user_name,
                    'user_phone', nt.user_phone,
                    'question', COALESCE(ns.question, 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa?'),
                    'already_responded', EXISTS (
                        SELECT 1 FROM nps_responses nr 
                        WHERE nr.survey_id = nt.survey_id 
                        AND nr.user_phone = nt.user_phone
                    )
                )
            ELSE NULL
        END as send_data,
        CASE 
            WHEN nt.token IS NULL THEN 'Token não encontrado'
            WHEN nt.is_active = FALSE THEN 'Token foi desativado'
            WHEN nt.used_at IS NOT NULL THEN 'Token já foi utilizado'
            WHEN EXISTS (
                SELECT 1 FROM nps_responses nr 
                WHERE nr.survey_id = nt.survey_id 
                AND nr.user_phone = nt.user_phone
            ) THEN 'Pesquisa já foi respondida'
            ELSE NULL
        END as error_message
    FROM nps_tokens nt
    LEFT JOIN nps_surveys ns ON ns.id = nt.survey_id
    WHERE nt.token = token_param;
END;
$$;


--
-- Name: validate_user_schedule_permissions(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_user_schedule_permissions(user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_role TEXT;
    permissions JSONB;
BEGIN
    -- Buscar role do usuário
    SELECT u.role INTO user_role
    FROM users u
    WHERE u.auth_user_id = user_id;
    
    -- Se não encontrou o usuário, retornar sem permissões
    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'isAdmin', false,
            'canManageNotifications', false,
            'canViewNotifications', false,
            'canManageNPS', false,
            'canViewNPS', false,
            'canManageWhatsApp', false,
            'canViewWhatsApp', false,
            'canManageEmail', false,
            'canViewEmail', false,
            'availableTypes', '[]'::JSONB
        );
    END IF;
    
    -- Construir objeto de permissões
    SELECT jsonb_build_object(
        'isAdmin', user_role IN ('super_admin', 'admin'),
        'canManageNotifications', can_manage_schedule_type(user_id, 'notification'),
        'canViewNotifications', can_access_schedule_type(user_id, 'notification'),
        'canManageNPS', can_manage_schedule_type(user_id, 'nps'),
        'canViewNPS', can_access_schedule_type(user_id, 'nps'),
        'canManageWhatsApp', can_manage_schedule_type(user_id, 'whatsapp'),
        'canViewWhatsApp', can_access_schedule_type(user_id, 'whatsapp'),
        'canManageEmail', can_manage_schedule_type(user_id, 'email'),
        'canViewEmail', can_access_schedule_type(user_id, 'email'),
        'availableTypes', (
            SELECT jsonb_agg(schedule_type)
            FROM (
                SELECT 'notification' as schedule_type WHERE can_access_schedule_type(user_id, 'notification')
                UNION
                SELECT 'nps' WHERE can_access_schedule_type(user_id, 'nps')
                UNION
                SELECT 'whatsapp' WHERE can_access_schedule_type(user_id, 'whatsapp')
                UNION
                SELECT 'email' WHERE can_access_schedule_type(user_id, 'email')
            ) types
        )
    ) INTO permissions;
    
    RETURN permissions;
END;
$$;


--
-- Name: FUNCTION validate_user_schedule_permissions(user_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_user_schedule_permissions(user_id uuid) IS 'Valida permissões de usuário para funcionalidades de agendamento';


--
-- Name: verify_security_configuration(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.verify_security_configuration() RETURNS TABLE(check_name text, status text, details text, severity text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Verificar funções sem SECURITY DEFINER
  RETURN QUERY
  SELECT 
    'Functions without SECURITY DEFINER'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || COUNT(*) || ' functions without SECURITY DEFINER'::text,
    CASE WHEN COUNT(*) = 0 THEN 'INFO' ELSE 'MEDIUM' END::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('sync_user_tables', 'update_users_updated_at', 'create_admin_user', 
                      'generate_random_password', 'update_updated_at_column', 'sync_role_nivel',
                      'is_super_user', 'handle_new_user', 'is_admin', 'prevent_privilege_escalation')
    AND NOT p.prosecdef;

  -- Verificar índices em chaves estrangeiras
  RETURN QUERY
  SELECT 
    'Missing foreign key indexes'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARN' END::text,
    'Found ' || COUNT(*) || ' foreign key columns without indexes'::text,
    'LOW'::text
  FROM information_schema.key_column_usage kcu
  LEFT JOIN pg_indexes pi ON pi.tablename = kcu.table_name 
    AND pi.indexdef LIKE '%' || kcu.column_name || '%'
  WHERE kcu.table_schema = 'public'
    AND kcu.constraint_name LIKE '%_fkey'
    AND pi.indexname IS NULL;

  -- Verificar tabela de auditoria
  RETURN QUERY
  SELECT 
    'Security audit table'::text,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_log') 
         THEN 'PASS' ELSE 'FAIL' END::text,
    'Security audit logging table status'::text,
    'MEDIUM'::text;

END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: benefit_dependents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benefit_dependents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_benefit_id uuid NOT NULL,
    name text NOT NULL,
    relationship text NOT NULL,
    birth_date date,
    document_number text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: benefit_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benefit_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_benefit_id uuid NOT NULL,
    document_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: benefit_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benefit_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benefits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    valor numeric(10,2),
    tipo text,
    type_id uuid,
    ativo boolean DEFAULT true,
    descricao text,
    coverage jsonb,
    eligibility_rules jsonb DEFAULT '[]'::jsonb,
    provider text,
    start_date date,
    end_date date,
    performance_goals jsonb DEFAULT '[]'::jsonb,
    renewal_settings jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: content_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_key text NOT NULL,
    title text,
    subtitle text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: criterion_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.criterion_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evaluation_id uuid NOT NULL,
    criterion_id uuid NOT NULL,
    is_met boolean DEFAULT false NOT NULL,
    stars_awarded integer,
    observation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    document_name text NOT NULL,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    mime_type text NOT NULL,
    expiry_date date,
    status text DEFAULT 'válido'::text NOT NULL,
    notes text,
    uploaded_by text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT documents_status_check CHECK ((status = ANY (ARRAY['válido'::text, 'vencido'::text, 'vencendo'::text, 'pendente'::text])))
);


--
-- Name: employee_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    program_id uuid NOT NULL,
    achievement_type text NOT NULL,
    achievement_title text NOT NULL,
    achievement_description text,
    stars_earned integer DEFAULT 0 NOT NULL,
    achievement_date date DEFAULT CURRENT_DATE NOT NULL,
    evaluation_period text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: employee_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_benefits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    benefit_id uuid NOT NULL,
    enrollment_date date DEFAULT CURRENT_DATE NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    coverage_details jsonb,
    premium_amount numeric(10,2),
    deduction_amount numeric(10,2),
    effective_date date,
    termination_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_benefits_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text, 'cancelled'::text])))
);


--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    evaluator_id uuid,
    type text NOT NULL,
    period text NOT NULL,
    score numeric(3,2) DEFAULT 0,
    status text DEFAULT 'em_andamento'::text NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    comments text,
    meeting_date date,
    meeting_time time without time zone,
    location text,
    topics text[],
    follow_up_actions text,
    confidential boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    approved boolean DEFAULT false,
    approved_by uuid,
    approved_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT evaluations_status_check CHECK ((status = ANY (ARRAY['em_andamento'::text, 'concluida'::text]))),
    CONSTRAINT evaluations_type_check CHECK ((type = ANY (ARRAY['avaliacao_360'::text, 'auto_avaliacao'::text, 'avaliacao_gestor'::text, 'coffee_connection'::text])))
);


--
-- Name: folha_pagamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folha_pagamento (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    colaborador_id uuid,
    mes integer NOT NULL,
    ano integer NOT NULL,
    classificacao character varying(50),
    funcao character varying(100),
    salario_base numeric(10,2) DEFAULT 0,
    bonus numeric(10,2) DEFAULT 0,
    comissao numeric(10,2) DEFAULT 0,
    passagem numeric(10,2) DEFAULT 0,
    reembolso numeric(10,2) DEFAULT 0,
    inss numeric(10,2) DEFAULT 0,
    lojinha numeric(10,2) DEFAULT 0,
    bistro numeric(10,2) DEFAULT 0,
    adiantamento numeric(10,2) DEFAULT 0,
    outros_descontos numeric(10,2) DEFAULT 0,
    observacoes text,
    status character varying(20) DEFAULT 'rascunho'::character varying,
    aprovado_por uuid,
    aprovado_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    payroll_id uuid,
    transport_voucher numeric DEFAULT 0,
    salary_advance numeric DEFAULT 0,
    nome_colaborador text,
    cpf_colaborador text,
    unidade text,
    CONSTRAINT check_employee_data CHECK (((colaborador_id IS NOT NULL) OR ((nome_colaborador IS NOT NULL) AND (cpf_colaborador IS NOT NULL) AND (unidade IS NOT NULL))))
);


--
-- Name: TABLE folha_pagamento; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.folha_pagamento IS 'Tabela da folha de pagamento - constraint duplicada removida';


--
-- Name: COLUMN folha_pagamento.colaborador_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.folha_pagamento.colaborador_id IS 'Referência para users.auth_user_id - dados pessoais vêm de lá';


--
-- Name: COLUMN folha_pagamento.nome_colaborador; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.folha_pagamento.nome_colaborador IS 'Nome do colaborador para funcionários não cadastrados no sistema';


--
-- Name: COLUMN folha_pagamento.cpf_colaborador; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.folha_pagamento.cpf_colaborador IS 'CPF do colaborador para funcionários não cadastrados no sistema';


--
-- Name: COLUMN folha_pagamento.unidade; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.folha_pagamento.unidade IS 'Unidade do colaborador para funcionários não cadastrados no sistema';


--
-- Name: CONSTRAINT check_employee_data ON folha_pagamento; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT check_employee_data ON public.folha_pagamento IS 'Garante que ou o colaborador está cadastrado (colaborador_id) ou os dados básicos estão preenchidos';


--
-- Name: folha_rateio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folha_rateio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    folha_pagamento_id uuid,
    unidade_id uuid,
    valor numeric(10,2) NOT NULL,
    percentual numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    id integer NOT NULL,
    employee_id uuid NOT NULL,
    type text NOT NULL,
    severity text NOT NULL,
    description text NOT NULL,
    incident_date date NOT NULL,
    reporter_id uuid,
    status text DEFAULT 'ativo'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT incidents_severity_check CHECK ((severity = ANY (ARRAY['leve'::text, 'moderado'::text, 'grave'::text]))),
    CONSTRAINT incidents_status_check CHECK ((status = ANY (ARRAY['ativo'::text, 'resolvido'::text, 'arquivado'::text])))
);


--
-- Name: incidents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.incidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.incidents_id_seq OWNED BY public.incidents.id;


--
-- Name: message_schedule_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_schedule_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    level character varying(50) NOT NULL,
    message text NOT NULL,
    context jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT message_schedule_logs_level_check CHECK (((level)::text = ANY ((ARRAY['INFO'::character varying, 'WARN'::character varying, 'ERROR'::character varying, 'DEBUG'::character varying])::text[])))
);


--
-- Name: TABLE message_schedule_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.message_schedule_logs IS 'Tabela de logs para agendamentos de mensagens - única tabela de logs ativa para o sistema de agendamento';


--
-- Name: monthly_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monthly_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    month_year text NOT NULL,
    fideliza_stars integer DEFAULT 0 NOT NULL,
    matriculador_stars integer DEFAULT 0 NOT NULL,
    professor_stars integer DEFAULT 0 NOT NULL,
    total_stars integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    recipients uuid[] NOT NULL,
    recipient_names text[] NOT NULL,
    channel text NOT NULL,
    status text DEFAULT 'rascunho'::text NOT NULL,
    scheduled_for timestamp with time zone,
    sent_at timestamp with time zone,
    template_id text,
    metadata jsonb,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'whatsapp'::text, 'ambos'::text]))),
    CONSTRAINT notifications_status_check CHECK ((status = ANY (ARRAY['rascunho'::text, 'programado'::text, 'enviado'::text, 'entregue'::text, 'lido'::text, 'falhado'::text]))),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['lembrete'::text, 'aniversario'::text, 'aviso'::text, 'comunicado'::text, 'personalizada'::text])))
);


--
-- Name: nps_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nps_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    survey_id uuid,
    employee_id uuid,
    score integer NOT NULL,
    comment text,
    category text,
    department text,
    response_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    response_token character varying(255),
    whatsapp_message_id character varying(255),
    phone_number character varying(20),
    sent_at timestamp with time zone,
    user_name text,
    user_phone text,
    CONSTRAINT nps_responses_score_check CHECK (((score >= 0) AND (score <= 10)))
);


--
-- Name: COLUMN nps_responses.survey_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_responses.survey_id IS 'ID da pesquisa - pode ser preenchido posteriormente via trigger';


--
-- Name: COLUMN nps_responses.employee_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_responses.employee_id IS 'ID do funcionário - pode ser preenchido posteriormente via trigger';


--
-- Name: COLUMN nps_responses.response_token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_responses.response_token IS 'Token único para vincular resposta ao envio WhatsApp';


--
-- Name: COLUMN nps_responses.whatsapp_message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_responses.whatsapp_message_id IS 'ID da mensagem no WhatsApp para rastreamento';


--
-- Name: COLUMN nps_responses.phone_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_responses.phone_number IS 'Número de telefone usado para envio (para auditoria)';


--
-- Name: COLUMN nps_responses.sent_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_responses.sent_at IS 'Timestamp de quando a mensagem foi enviada via WhatsApp';


--
-- Name: nps_surveys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nps_surveys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    survey_type text DEFAULT 'nps'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    target_employees uuid[],
    target_departments text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_anonymous boolean DEFAULT true,
    auto_send boolean DEFAULT false,
    frequency_days integer DEFAULT 30,
    last_sent_at timestamp with time zone,
    next_send_date date,
    question text DEFAULT 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?'::text,
    CONSTRAINT nps_surveys_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text]))),
    CONSTRAINT nps_surveys_survey_type_check CHECK ((survey_type = ANY (ARRAY['nps'::text, 'satisfaction'::text])))
);


--
-- Name: COLUMN nps_surveys.is_anonymous; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_surveys.is_anonymous IS 'Define se a pesquisa é anônima';


--
-- Name: COLUMN nps_surveys.auto_send; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_surveys.auto_send IS 'Define se a pesquisa deve ser enviada automaticamente';


--
-- Name: COLUMN nps_surveys.frequency_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_surveys.frequency_days IS 'Frequência em dias para envio automático';


--
-- Name: COLUMN nps_surveys.last_sent_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_surveys.last_sent_at IS 'Data/hora do último envio automático';


--
-- Name: COLUMN nps_surveys.next_send_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_surveys.next_send_date IS 'Próxima data de envio automático';


--
-- Name: COLUMN nps_surveys.question; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nps_surveys.question IS 'Pergunta principal da pesquisa NPS';


--
-- Name: nps_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nps_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    employee_id text,
    employee_name text,
    question text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    survey_id uuid,
    user_name text,
    user_phone text,
    used_at timestamp with time zone
);


--
-- Name: payrolls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payrolls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payrolls_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT payrolls_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'paid'::text]))),
    CONSTRAINT payrolls_year_check CHECK ((year >= 2020))
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE permissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.permissions IS 'Tabela que define todas as permissões disponíveis no sistema';


--
-- Name: policy_backup_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.policy_backup_performance (
    id integer NOT NULL,
    backup_date timestamp without time zone DEFAULT now(),
    table_name text,
    policy_name text,
    policy_definition text
);


--
-- Name: policy_backup_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.policy_backup_performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: policy_backup_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.policy_backup_performance_id_seq OWNED BY public.policy_backup_performance.id;


--
-- Name: recognition_criteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recognition_criteria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type text NOT NULL,
    weight integer DEFAULT 1 NOT NULL,
    max_stars integer,
    is_required boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT recognition_criteria_type_check CHECK ((type = ANY (ARRAY['checkbox'::text, 'stars'::text, 'observation'::text])))
);


--
-- Name: recognition_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recognition_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    color text NOT NULL,
    icon text NOT NULL,
    total_possible_stars integer DEFAULT 0 NOT NULL,
    target_roles text[] DEFAULT '{}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    department_id uuid,
    CONSTRAINT roles_name_check CHECK ((name = ANY (ARRAY['super_admin'::text, 'admin'::text, 'gestor_rh'::text, 'gerente'::text])))
);


--
-- Name: schedule_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    employee_id uuid NOT NULL,
    unit text NOT NULL,
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    type text NOT NULL,
    description text,
    location text,
    email_alert boolean DEFAULT false,
    whatsapp_alert boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT schedule_events_type_check CHECK ((type = ANY (ARRAY['plantao'::text, 'avaliacao'::text, 'reuniao'::text, 'folga'::text, 'outro'::text])))
);


--
-- Name: security_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    table_name text,
    record_id uuid,
    user_id uuid,
    user_email text,
    ip_address inet,
    user_agent text,
    old_values jsonb,
    new_values jsonb,
    "timestamp" timestamp with time zone DEFAULT now(),
    severity text DEFAULT 'INFO'::text,
    CONSTRAINT security_audit_log_severity_check CHECK ((severity = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text, 'CRITICAL'::text, 'INFO'::text])))
);


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level character varying(10) NOT NULL,
    message text NOT NULL,
    context jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT system_logs_level_check CHECK (((level)::text = ANY ((ARRAY['INFO'::character varying, 'WARN'::character varying, 'ERROR'::character varying, 'DEBUG'::character varying])::text[])))
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    category text DEFAULT 'general'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: unidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unidades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(100) NOT NULL,
    codigo character varying(10) NOT NULL,
    ativa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    "position" text DEFAULT 'Não definido'::text,
    department text DEFAULT 'Não definido'::text,
    units text[] DEFAULT '{}'::text[],
    start_date date,
    birth_date date,
    address text,
    emergency_contact text,
    emergency_phone text,
    bio text,
    avatar_url text,
    role text DEFAULT 'usuario'::text NOT NULL,
    nivel text,
    status text DEFAULT 'ativo'::text NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    last_login timestamp with time zone,
    bank text,
    agency text,
    account text,
    cpf text,
    pix text,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'gestor_rh'::text, 'gerente'::text]))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'suspenso'::text])))
);


--
-- Name: vacation_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacation_balances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    total_days integer DEFAULT 30 NOT NULL,
    used_days integer DEFAULT 0 NOT NULL,
    remaining_days integer DEFAULT 30 NOT NULL,
    yearly_allowance integer DEFAULT 30 NOT NULL,
    expiration_date date DEFAULT (CURRENT_DATE + '1 year'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: vacation_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacation_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days integer NOT NULL,
    reason text NOT NULL,
    type text DEFAULT 'vacation'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    request_date date DEFAULT CURRENT_DATE NOT NULL,
    approved_by uuid,
    approved_date date,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vacation_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT vacation_requests_type_check CHECK ((type = ANY (ARRAY['vacation'::text, 'medical'::text, 'personal'::text, 'maternity'::text, 'paternity'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_08_29; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_29 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_30; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_30 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_31; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_31 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_01; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_02; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_03; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_04; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_15; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_16; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_18; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_19; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: messages_2025_08_29; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_29 FOR VALUES FROM ('2025-08-29 00:00:00') TO ('2025-08-30 00:00:00');


--
-- Name: messages_2025_08_30; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_30 FOR VALUES FROM ('2025-08-30 00:00:00') TO ('2025-08-31 00:00:00');


--
-- Name: messages_2025_08_31; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_31 FOR VALUES FROM ('2025-08-31 00:00:00') TO ('2025-09-01 00:00:00');


--
-- Name: messages_2025_09_01; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_01 FOR VALUES FROM ('2025-09-01 00:00:00') TO ('2025-09-02 00:00:00');


--
-- Name: messages_2025_09_02; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_02 FOR VALUES FROM ('2025-09-02 00:00:00') TO ('2025-09-03 00:00:00');


--
-- Name: messages_2025_09_03; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_03 FOR VALUES FROM ('2025-09-03 00:00:00') TO ('2025-09-04 00:00:00');


--
-- Name: messages_2025_09_04; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_04 FOR VALUES FROM ('2025-09-04 00:00:00') TO ('2025-09-05 00:00:00');


--
-- Name: messages_2025_09_15; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_15 FOR VALUES FROM ('2025-09-15 00:00:00') TO ('2025-09-16 00:00:00');


--
-- Name: messages_2025_09_16; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_16 FOR VALUES FROM ('2025-09-16 00:00:00') TO ('2025-09-17 00:00:00');


--
-- Name: messages_2025_09_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_17 FOR VALUES FROM ('2025-09-17 00:00:00') TO ('2025-09-18 00:00:00');


--
-- Name: messages_2025_09_18; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_18 FOR VALUES FROM ('2025-09-18 00:00:00') TO ('2025-09-19 00:00:00');


--
-- Name: messages_2025_09_19; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_19 FOR VALUES FROM ('2025-09-19 00:00:00') TO ('2025-09-20 00:00:00');


--
-- Name: messages_2025_09_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_20 FOR VALUES FROM ('2025-09-20 00:00:00') TO ('2025-09-21 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: incidents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents ALTER COLUMN id SET DEFAULT nextval('public.incidents_id_seq'::regclass);


--
-- Name: policy_backup_performance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_backup_performance ALTER COLUMN id SET DEFAULT nextval('public.policy_backup_performance_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: benefit_dependents benefit_dependents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_dependents
    ADD CONSTRAINT benefit_dependents_pkey PRIMARY KEY (id);


--
-- Name: benefit_documents benefit_documents_employee_benefit_id_document_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_documents
    ADD CONSTRAINT benefit_documents_employee_benefit_id_document_id_key UNIQUE (employee_benefit_id, document_id);


--
-- Name: benefit_documents benefit_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_documents
    ADD CONSTRAINT benefit_documents_pkey PRIMARY KEY (id);


--
-- Name: benefit_types benefit_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_types
    ADD CONSTRAINT benefit_types_name_key UNIQUE (name);


--
-- Name: benefit_types benefit_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_types
    ADD CONSTRAINT benefit_types_pkey PRIMARY KEY (id);


--
-- Name: benefits benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_pkey PRIMARY KEY (id);


--
-- Name: content_sections content_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_pkey PRIMARY KEY (id);


--
-- Name: content_sections content_sections_section_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_section_key_key UNIQUE (section_key);


--
-- Name: criterion_evaluations criterion_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criterion_evaluations
    ADD CONSTRAINT criterion_evaluations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_achievements employee_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_achievements
    ADD CONSTRAINT employee_achievements_pkey PRIMARY KEY (id);


--
-- Name: employee_benefits employee_benefits_employee_id_benefit_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits
    ADD CONSTRAINT employee_benefits_employee_id_benefit_id_key UNIQUE (employee_id, benefit_id);


--
-- Name: employee_benefits employee_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits
    ADD CONSTRAINT employee_benefits_pkey PRIMARY KEY (id);


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id);


--
-- Name: folha_pagamento folha_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folha_pagamento
    ADD CONSTRAINT folha_pagamento_pkey PRIMARY KEY (id);


--
-- Name: folha_rateio folha_rateio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folha_rateio
    ADD CONSTRAINT folha_rateio_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: message_schedule_logs message_schedule_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_schedule_logs
    ADD CONSTRAINT message_schedule_logs_pkey PRIMARY KEY (id);


--
-- Name: message_schedules message_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_schedules
    ADD CONSTRAINT message_schedules_pkey PRIMARY KEY (id);


--
-- Name: monthly_progress monthly_progress_employee_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_progress
    ADD CONSTRAINT monthly_progress_employee_id_month_year_key UNIQUE (employee_id, month_year);


--
-- Name: monthly_progress monthly_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monthly_progress
    ADD CONSTRAINT monthly_progress_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: nps_responses nps_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_responses
    ADD CONSTRAINT nps_responses_pkey PRIMARY KEY (id);


--
-- Name: nps_responses nps_responses_survey_id_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_responses
    ADD CONSTRAINT nps_responses_survey_id_employee_id_key UNIQUE (survey_id, employee_id);


--
-- Name: nps_surveys nps_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_surveys
    ADD CONSTRAINT nps_surveys_pkey PRIMARY KEY (id);


--
-- Name: nps_tokens nps_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_tokens
    ADD CONSTRAINT nps_tokens_pkey PRIMARY KEY (id);


--
-- Name: nps_tokens nps_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_tokens
    ADD CONSTRAINT nps_tokens_token_key UNIQUE (token);


--
-- Name: payrolls payrolls_month_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_month_year_key UNIQUE (month, year);


--
-- Name: payrolls payrolls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: policy_backup_performance policy_backup_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_backup_performance
    ADD CONSTRAINT policy_backup_performance_pkey PRIMARY KEY (id);


--
-- Name: recognition_criteria recognition_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recognition_criteria
    ADD CONSTRAINT recognition_criteria_pkey PRIMARY KEY (id);


--
-- Name: recognition_programs recognition_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recognition_programs
    ADD CONSTRAINT recognition_programs_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schedule_events schedule_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_pkey PRIMARY KEY (id);


--
-- Name: security_audit_log security_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: unidades unidades_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unidades
    ADD CONSTRAINT unidades_codigo_key UNIQUE (codigo);


--
-- Name: unidades unidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unidades
    ADD CONSTRAINT unidades_pkey PRIMARY KEY (id);


--
-- Name: users users_auth_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vacation_balances vacation_balances_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_balances
    ADD CONSTRAINT vacation_balances_employee_id_key UNIQUE (employee_id);


--
-- Name: vacation_balances vacation_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_balances
    ADD CONSTRAINT vacation_balances_pkey PRIMARY KEY (id);


--
-- Name: vacation_requests vacation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_requests
    ADD CONSTRAINT vacation_requests_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_29 messages_2025_08_29_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_29
    ADD CONSTRAINT messages_2025_08_29_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_30 messages_2025_08_30_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_30
    ADD CONSTRAINT messages_2025_08_30_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_31 messages_2025_08_31_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_31
    ADD CONSTRAINT messages_2025_08_31_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_01 messages_2025_09_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_01
    ADD CONSTRAINT messages_2025_09_01_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_02 messages_2025_09_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_02
    ADD CONSTRAINT messages_2025_09_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_03 messages_2025_09_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_03
    ADD CONSTRAINT messages_2025_09_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_04 messages_2025_09_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_04
    ADD CONSTRAINT messages_2025_09_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_15 messages_2025_09_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_15
    ADD CONSTRAINT messages_2025_09_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_16 messages_2025_09_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_16
    ADD CONSTRAINT messages_2025_09_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_17 messages_2025_09_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_17
    ADD CONSTRAINT messages_2025_09_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_18 messages_2025_09_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_18
    ADD CONSTRAINT messages_2025_09_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_19 messages_2025_09_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_19
    ADD CONSTRAINT messages_2025_09_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_20 messages_2025_09_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_20
    ADD CONSTRAINT messages_2025_09_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_benefit_dependents_employee_benefit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_benefit_dependents_employee_benefit_id ON public.benefit_dependents USING btree (employee_benefit_id);


--
-- Name: idx_benefit_documents_document_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_benefit_documents_document_id ON public.benefit_documents USING btree (document_id);


--
-- Name: idx_benefit_documents_employee_benefit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_benefit_documents_employee_benefit_id ON public.benefit_documents USING btree (employee_benefit_id);


--
-- Name: idx_benefits_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_benefits_type_id ON public.benefits USING btree (type_id);


--
-- Name: idx_criterion_evaluations_criterion_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_criterion_evaluations_criterion_id ON public.criterion_evaluations USING btree (criterion_id);


--
-- Name: idx_documents_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_employee_id ON public.documents USING btree (employee_id);


--
-- Name: idx_employee_achievements_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_achievements_date ON public.employee_achievements USING btree (achievement_date);


--
-- Name: idx_employee_achievements_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_achievements_employee_id ON public.employee_achievements USING btree (employee_id);


--
-- Name: idx_employee_achievements_program_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_achievements_program_id ON public.employee_achievements USING btree (program_id);


--
-- Name: idx_employee_benefits_benefit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_benefits_benefit_id ON public.employee_benefits USING btree (benefit_id);


--
-- Name: idx_employee_benefits_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_benefits_employee_id ON public.employee_benefits USING btree (employee_id);


--
-- Name: idx_evaluations_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluations_approved_by ON public.evaluations USING btree (approved_by);


--
-- Name: idx_evaluations_employee_evaluator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluations_employee_evaluator ON public.evaluations USING btree (employee_id, evaluator_id);


--
-- Name: idx_evaluations_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluations_employee_id ON public.evaluations USING btree (employee_id);


--
-- Name: idx_evaluations_evaluator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluations_evaluator_id ON public.evaluations USING btree (evaluator_id);


--
-- Name: idx_folha_mes_ano; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_mes_ano ON public.folha_pagamento USING btree (mes, ano);


--
-- Name: idx_folha_pagamento_aprovado_por; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_pagamento_aprovado_por ON public.folha_pagamento USING btree (aprovado_por);


--
-- Name: idx_folha_pagamento_colaborador_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_pagamento_colaborador_id ON public.folha_pagamento USING btree (colaborador_id);


--
-- Name: idx_folha_pagamento_colaborador_mes_ano; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_pagamento_colaborador_mes_ano ON public.folha_pagamento USING btree (colaborador_id, mes, ano);


--
-- Name: idx_folha_pagamento_cpf_colaborador; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_pagamento_cpf_colaborador ON public.folha_pagamento USING btree (cpf_colaborador);


--
-- Name: idx_folha_pagamento_nome_colaborador; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_pagamento_nome_colaborador ON public.folha_pagamento USING btree (nome_colaborador);


--
-- Name: idx_folha_pagamento_payroll_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_pagamento_payroll_id ON public.folha_pagamento USING btree (payroll_id);


--
-- Name: idx_folha_rateio_folha_pagamento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_rateio_folha_pagamento ON public.folha_rateio USING btree (folha_pagamento_id);


--
-- Name: idx_folha_rateio_unidade_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_folha_rateio_unidade_id ON public.folha_rateio USING btree (unidade_id);


--
-- Name: idx_incidents_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_employee_id ON public.incidents USING btree (employee_id);


--
-- Name: idx_incidents_reporter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_reporter_id ON public.incidents USING btree (reporter_id);


--
-- Name: idx_message_schedule_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedule_logs_created_at ON public.message_schedule_logs USING btree (created_at);


--
-- Name: idx_message_schedule_logs_schedule_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedule_logs_schedule_id ON public.message_schedule_logs USING btree (schedule_id);


--
-- Name: idx_message_schedules_channel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_channel ON public.message_schedules USING btree (channel);


--
-- Name: idx_message_schedules_channel_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_channel_status ON public.message_schedules USING btree (channel, status);


--
-- Name: idx_message_schedules_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_created_by ON public.message_schedules USING btree (created_by);


--
-- Name: idx_message_schedules_created_by_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_created_by_status ON public.message_schedules USING btree (created_by, status);


--
-- Name: idx_message_schedules_execution_stats; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_execution_stats ON public.message_schedules USING gin (execution_stats);


--
-- Name: idx_message_schedules_next_execution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_next_execution ON public.message_schedules USING btree (next_execution_at) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_message_schedules_schedule_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_schedule_type ON public.message_schedules USING btree (schedule_type);


--
-- Name: idx_message_schedules_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_status ON public.message_schedules USING btree (status);


--
-- Name: idx_message_schedules_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_schedules_type ON public.message_schedules USING btree (type);


--
-- Name: idx_nps_responses_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_responses_employee_id ON public.nps_responses USING btree (employee_id);


--
-- Name: idx_nps_responses_response_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_responses_response_token ON public.nps_responses USING btree (response_token);


--
-- Name: idx_nps_responses_survey_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_responses_survey_id ON public.nps_responses USING btree (survey_id);


--
-- Name: idx_nps_responses_user_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_responses_user_phone ON public.nps_responses USING btree (user_phone);


--
-- Name: idx_nps_responses_whatsapp_message_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_responses_whatsapp_message_id ON public.nps_responses USING btree (whatsapp_message_id);


--
-- Name: idx_nps_tokens_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_tokens_is_active ON public.nps_tokens USING btree (is_active);


--
-- Name: idx_nps_tokens_survey_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_tokens_survey_id ON public.nps_tokens USING btree (survey_id);


--
-- Name: idx_nps_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_tokens_token ON public.nps_tokens USING btree (token);


--
-- Name: idx_nps_tokens_user_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nps_tokens_user_phone ON public.nps_tokens USING btree (user_phone);


--
-- Name: idx_permissions_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_permissions_name ON public.permissions USING btree (name);


--
-- Name: idx_recognition_criteria_program_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recognition_criteria_program_id ON public.recognition_criteria USING btree (program_id);


--
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- Name: INDEX idx_role_permissions_permission_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_role_permissions_permission_id IS 'Índice para otimizar consultas de permissões por permission_id';


--
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- Name: INDEX idx_role_permissions_role_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_role_permissions_role_id IS 'Índice para otimizar consultas de permissões por role_id';


--
-- Name: idx_roles_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roles_department_id ON public.roles USING btree (department_id);


--
-- Name: idx_schedule_events_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_events_employee_id ON public.schedule_events USING btree (employee_id);


--
-- Name: idx_security_audit_log_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_event_type ON public.security_audit_log USING btree (event_type);


--
-- Name: idx_security_audit_log_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_severity ON public.security_audit_log USING btree (severity);


--
-- Name: idx_security_audit_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log USING btree (user_id);


--
-- Name: idx_system_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at);


--
-- Name: idx_system_logs_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_level ON public.system_logs USING btree (level);


--
-- Name: idx_users_auth_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_auth_user_id ON public.users USING btree (auth_user_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_vacation_requests_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vacation_requests_approved_by ON public.vacation_requests USING btree (approved_by);


--
-- Name: idx_vacation_requests_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vacation_requests_employee_id ON public.vacation_requests USING btree (employee_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: messages_2025_08_29_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_29_pkey;


--
-- Name: messages_2025_08_30_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_30_pkey;


--
-- Name: messages_2025_08_31_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_31_pkey;


--
-- Name: messages_2025_09_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_01_pkey;


--
-- Name: messages_2025_09_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_02_pkey;


--
-- Name: messages_2025_09_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_03_pkey;


--
-- Name: messages_2025_09_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_04_pkey;


--
-- Name: messages_2025_09_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_15_pkey;


--
-- Name: messages_2025_09_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_16_pkey;


--
-- Name: messages_2025_09_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_17_pkey;


--
-- Name: messages_2025_09_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_18_pkey;


--
-- Name: messages_2025_09_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_19_pkey;


--
-- Name: messages_2025_09_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_20_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: users prevent_privilege_escalation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_privilege_escalation_trigger BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.prevent_privilege_escalation();


--
-- Name: content_sections set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.content_sections FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: evaluations set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: incidents set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: notifications set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: nps_surveys set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.nps_surveys FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: schedule_events set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.schedule_events FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: vacation_balances set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.vacation_balances FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: vacation_requests set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.vacation_requests FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: nps_responses trigger_fill_nps_response_data; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_fill_nps_response_data BEFORE INSERT ON public.nps_responses FOR EACH ROW EXECUTE FUNCTION public.fill_nps_response_data();


--
-- Name: folha_pagamento trigger_update_folha_pagamento_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_folha_pagamento_updated_at BEFORE UPDATE ON public.folha_pagamento FOR EACH ROW EXECUTE FUNCTION public.update_folha_pagamento_updated_at();


--
-- Name: message_schedules trigger_update_message_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_message_schedules_updated_at BEFORE UPDATE ON public.message_schedules FOR EACH ROW EXECUTE FUNCTION public.update_message_schedules_updated_at();


--
-- Name: users trigger_update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_users_updated_at();


--
-- Name: benefit_documents update_benefit_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_benefit_documents_updated_at BEFORE UPDATE ON public.benefit_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_sections update_content_sections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_sections_updated_at BEFORE UPDATE ON public.content_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: departments update_departments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: documents update_document_status; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_document_status BEFORE INSERT OR UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.check_document_status();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: folha_pagamento update_folha_pagamento_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_folha_pagamento_updated_at BEFORE UPDATE ON public.folha_pagamento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payrolls update_payrolls_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payrolls_updated_at BEFORE UPDATE ON public.payrolls FOR EACH ROW EXECUTE FUNCTION public.update_payrolls_updated_at();


--
-- Name: permissions update_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: unidades update_unidades_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: benefit_documents benefit_documents_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_documents
    ADD CONSTRAINT benefit_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: benefits benefits_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.benefit_types(id);


--
-- Name: criterion_evaluations criterion_evaluations_criterion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criterion_evaluations
    ADD CONSTRAINT criterion_evaluations_criterion_id_fkey FOREIGN KEY (criterion_id) REFERENCES public.recognition_criteria(id) ON DELETE CASCADE;


--
-- Name: documents documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_achievements employee_achievements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_achievements
    ADD CONSTRAINT employee_achievements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_achievements employee_achievements_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_achievements
    ADD CONSTRAINT employee_achievements_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.recognition_programs(id) ON DELETE CASCADE;


--
-- Name: employee_benefits employee_benefits_benefit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits
    ADD CONSTRAINT employee_benefits_benefit_id_fkey FOREIGN KEY (benefit_id) REFERENCES public.benefits(id) ON DELETE CASCADE;


--
-- Name: employee_benefits employee_benefits_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_benefits
    ADD CONSTRAINT employee_benefits_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: evaluations evaluations_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evaluations evaluations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: evaluations evaluations_evaluator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: benefit_dependents fk_benefit_dependents_employee_benefit; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefit_dependents
    ADD CONSTRAINT fk_benefit_dependents_employee_benefit FOREIGN KEY (employee_benefit_id) REFERENCES public.employee_benefits(id) ON DELETE CASCADE;


--
-- Name: schedule_events fk_schedule_events_employee_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT fk_schedule_events_employee_id FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: folha_pagamento folha_pagamento_payroll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folha_pagamento
    ADD CONSTRAINT folha_pagamento_payroll_id_fkey FOREIGN KEY (payroll_id) REFERENCES public.payrolls(id);


--
-- Name: folha_rateio folha_rateio_folha_pagamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folha_rateio
    ADD CONSTRAINT folha_rateio_folha_pagamento_id_fkey FOREIGN KEY (folha_pagamento_id) REFERENCES public.folha_pagamento(id) ON DELETE CASCADE;


--
-- Name: folha_rateio folha_rateio_unidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folha_rateio
    ADD CONSTRAINT folha_rateio_unidade_id_fkey FOREIGN KEY (unidade_id) REFERENCES public.unidades(id);


--
-- Name: incidents incidents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: incidents incidents_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: message_schedule_logs message_schedule_logs_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_schedule_logs
    ADD CONSTRAINT message_schedule_logs_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.message_schedules(id) ON DELETE CASCADE;


--
-- Name: message_schedules message_schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_schedules
    ADD CONSTRAINT message_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: nps_responses nps_responses_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_responses
    ADD CONSTRAINT nps_responses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: nps_responses nps_responses_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_responses
    ADD CONSTRAINT nps_responses_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.nps_surveys(id) ON DELETE CASCADE;


--
-- Name: nps_tokens nps_tokens_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nps_tokens
    ADD CONSTRAINT nps_tokens_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.nps_surveys(id);


--
-- Name: recognition_criteria recognition_criteria_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recognition_criteria
    ADD CONSTRAINT recognition_criteria_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.recognition_programs(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vacation_requests vacation_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_requests
    ADD CONSTRAINT vacation_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vacation_requests vacation_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_requests
    ADD CONSTRAINT vacation_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: system_logs Allow log reads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow log reads" ON public.system_logs FOR SELECT USING (true);


--
-- Name: nps_tokens Allow public access to active NPS tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public access to active NPS tokens" ON public.nps_tokens FOR SELECT USING ((is_active = true));


--
-- Name: nps_responses Allow public insert of NPS responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert of NPS responses" ON public.nps_responses FOR INSERT WITH CHECK (true);


--
-- Name: system_logs Allow system log inserts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow system log inserts" ON public.system_logs FOR INSERT WITH CHECK (true);


--
-- Name: benefit_dependents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.benefit_dependents ENABLE ROW LEVEL SECURITY;

--
-- Name: benefit_dependents benefit_dependents_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_dependents_authenticated_policy ON public.benefit_dependents USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: benefit_dependents benefit_dependents_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_dependents_policy ON public.benefit_dependents USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: benefit_dependents benefit_dependents_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_dependents_service_role_policy ON public.benefit_dependents TO service_role USING (true) WITH CHECK (true);


--
-- Name: benefit_dependents benefit_dependents_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_dependents_super_admin_policy ON public.benefit_dependents USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: benefit_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.benefit_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: benefit_documents benefit_documents_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_documents_authenticated_policy ON public.benefit_documents USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: benefit_documents benefit_documents_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_documents_policy ON public.benefit_documents USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: benefit_documents benefit_documents_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_documents_service_role_policy ON public.benefit_documents TO service_role USING (true) WITH CHECK (true);


--
-- Name: benefit_documents benefit_documents_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_documents_super_admin_policy ON public.benefit_documents USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: benefit_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.benefit_types ENABLE ROW LEVEL SECURITY;

--
-- Name: benefit_types benefit_types_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_types_authenticated_policy ON public.benefit_types USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: benefit_types benefit_types_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_types_service_role_policy ON public.benefit_types TO service_role USING (true) WITH CHECK (true);


--
-- Name: benefit_types benefit_types_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefit_types_super_admin_policy ON public.benefit_types USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: benefits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

--
-- Name: benefits benefits_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_authenticated_policy ON public.benefits USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: benefits benefits_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_service_role_policy ON public.benefits TO service_role USING (true) WITH CHECK (true);


--
-- Name: benefits benefits_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_super_admin_policy ON public.benefits USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: content_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: content_sections content_sections_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_sections_authenticated_policy ON public.content_sections USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: content_sections content_sections_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_sections_service_role_policy ON public.content_sections TO service_role USING (true) WITH CHECK (true);


--
-- Name: content_sections content_sections_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY content_sections_super_admin_policy ON public.content_sections USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: criterion_evaluations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.criterion_evaluations ENABLE ROW LEVEL SECURITY;

--
-- Name: criterion_evaluations criterion_evaluations_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY criterion_evaluations_authenticated_policy ON public.criterion_evaluations USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: criterion_evaluations criterion_evaluations_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY criterion_evaluations_service_role_policy ON public.criterion_evaluations TO service_role USING (true) WITH CHECK (true);


--
-- Name: criterion_evaluations criterion_evaluations_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY criterion_evaluations_super_admin_policy ON public.criterion_evaluations USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments departments_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_authenticated_policy ON public.departments USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: departments departments_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_service_role_policy ON public.departments TO service_role USING (true) WITH CHECK (true);


--
-- Name: departments departments_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_super_admin_policy ON public.departments USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: documents documents_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_policy ON public.documents USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: documents documents_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_service_role_policy ON public.documents TO service_role USING (true) WITH CHECK (true);


--
-- Name: documents documents_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY documents_super_admin_policy ON public.documents USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: employee_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_achievements employee_achievements_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_achievements_policy ON public.employee_achievements USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: employee_achievements employee_achievements_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_achievements_service_role_policy ON public.employee_achievements TO service_role USING (true) WITH CHECK (true);


--
-- Name: employee_achievements employee_achievements_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_achievements_super_admin_policy ON public.employee_achievements USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: employee_benefits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_benefits employee_benefits_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_benefits_policy ON public.employee_benefits USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: employee_benefits employee_benefits_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_benefits_service_role_policy ON public.employee_benefits TO service_role USING (true) WITH CHECK (true);


--
-- Name: employee_benefits employee_benefits_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_benefits_super_admin_policy ON public.employee_benefits USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: evaluations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

--
-- Name: evaluations evaluations_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY evaluations_policy ON public.evaluations USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: evaluations evaluations_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY evaluations_service_role_policy ON public.evaluations TO service_role USING (true) WITH CHECK (true);


--
-- Name: evaluations evaluations_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY evaluations_super_admin_policy ON public.evaluations USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: folha_pagamento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.folha_pagamento ENABLE ROW LEVEL SECURITY;

--
-- Name: folha_pagamento folha_pagamento_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folha_pagamento_authenticated_policy ON public.folha_pagamento TO authenticated USING ((public.is_admin_or_super() OR public.has_permission('folha_pagamento.view'::text))) WITH CHECK ((public.is_admin_or_super() OR public.has_permission('folha_pagamento.create'::text) OR public.has_permission('folha_pagamento.edit'::text) OR public.has_permission('folha_pagamento.manage'::text)));


--
-- Name: folha_pagamento folha_pagamento_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folha_pagamento_service_role_policy ON public.folha_pagamento TO service_role USING (true) WITH CHECK (true);


--
-- Name: folha_pagamento folha_pagamento_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folha_pagamento_super_admin_policy ON public.folha_pagamento USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: folha_rateio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.folha_rateio ENABLE ROW LEVEL SECURITY;

--
-- Name: folha_rateio folha_rateio_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folha_rateio_authenticated_policy ON public.folha_rateio USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: folha_rateio folha_rateio_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folha_rateio_service_role_policy ON public.folha_rateio TO service_role USING (true) WITH CHECK (true);


--
-- Name: folha_rateio folha_rateio_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY folha_rateio_super_admin_policy ON public.folha_rateio USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: incidents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

--
-- Name: incidents incidents_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY incidents_authenticated_policy ON public.incidents USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: incidents incidents_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY incidents_service_role_policy ON public.incidents TO service_role USING (true) WITH CHECK (true);


--
-- Name: incidents incidents_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY incidents_super_admin_policy ON public.incidents USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: message_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: message_schedules message_schedules_channel_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY message_schedules_channel_policy ON public.message_schedules USING (public.check_channel_permission(auth.uid(), (channel)::text)) WITH CHECK (public.check_channel_permission(auth.uid(), (channel)::text));


--
-- Name: message_schedules message_schedules_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY message_schedules_delete_policy ON public.message_schedules FOR DELETE USING (((auth.uid() = created_by) OR public.check_user_permission(auth.uid(), 'delete_message_schedules'::text) OR public.check_user_permission(auth.uid(), 'manage_message_schedules'::text)));


--
-- Name: message_schedules message_schedules_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY message_schedules_insert_policy ON public.message_schedules FOR INSERT WITH CHECK ((public.check_user_permission(auth.uid(), 'create_message_schedules'::text) OR public.check_user_permission(auth.uid(), 'manage_message_schedules'::text)));


--
-- Name: message_schedules message_schedules_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY message_schedules_select_policy ON public.message_schedules FOR SELECT USING (((auth.uid() = created_by) OR public.check_user_permission(auth.uid(), 'view_message_schedules'::text) OR public.check_user_permission(auth.uid(), 'manage_message_schedules'::text)));


--
-- Name: message_schedules message_schedules_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY message_schedules_update_policy ON public.message_schedules FOR UPDATE USING (((auth.uid() = created_by) OR public.check_user_permission(auth.uid(), 'edit_message_schedules'::text) OR public.check_user_permission(auth.uid(), 'manage_message_schedules'::text))) WITH CHECK (((auth.uid() = created_by) OR public.check_user_permission(auth.uid(), 'edit_message_schedules'::text) OR public.check_user_permission(auth.uid(), 'manage_message_schedules'::text)));


--
-- Name: monthly_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monthly_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_progress monthly_progress_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY monthly_progress_policy ON public.monthly_progress USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: monthly_progress monthly_progress_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY monthly_progress_service_role_policy ON public.monthly_progress TO service_role USING (true) WITH CHECK (true);


--
-- Name: monthly_progress monthly_progress_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY monthly_progress_super_admin_policy ON public.monthly_progress USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_policy ON public.notifications USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: notifications notifications_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_service_role_policy ON public.notifications TO service_role USING (true) WITH CHECK (true);


--
-- Name: notifications notifications_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_super_admin_policy ON public.notifications USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: nps_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: nps_responses nps_responses_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY nps_responses_policy ON public.nps_responses USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: nps_responses nps_responses_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY nps_responses_service_role_policy ON public.nps_responses TO service_role USING (true) WITH CHECK (true);


--
-- Name: nps_responses nps_responses_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY nps_responses_super_admin_policy ON public.nps_responses USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: nps_surveys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nps_surveys ENABLE ROW LEVEL SECURITY;

--
-- Name: nps_surveys nps_surveys_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY nps_surveys_authenticated_policy ON public.nps_surveys USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: nps_surveys nps_surveys_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY nps_surveys_service_role_policy ON public.nps_surveys TO service_role USING (true) WITH CHECK (true);


--
-- Name: nps_surveys nps_surveys_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY nps_surveys_super_admin_policy ON public.nps_surveys USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: nps_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nps_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: payrolls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

--
-- Name: payrolls payrolls_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payrolls_authenticated_policy ON public.payrolls USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: payrolls payrolls_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payrolls_service_role_policy ON public.payrolls TO service_role USING (true) WITH CHECK (true);


--
-- Name: payrolls payrolls_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payrolls_super_admin_policy ON public.payrolls USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions permissions_modify_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY permissions_modify_policy ON public.permissions USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());


--
-- Name: permissions permissions_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY permissions_select_policy ON public.permissions FOR SELECT USING (((( SELECT auth.role() AS role) = 'authenticated'::text) AND public.is_admin_or_super()));


--
-- Name: permissions permissions_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY permissions_service_role_policy ON public.permissions TO service_role USING (true) WITH CHECK (true);


--
-- Name: policy_backup_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.policy_backup_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: policy_backup_performance policy_backup_performance_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY policy_backup_performance_admin_policy ON public.policy_backup_performance USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: policy_backup_performance policy_backup_performance_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY policy_backup_performance_service_role_policy ON public.policy_backup_performance TO service_role USING (true) WITH CHECK (true);


--
-- Name: policy_backup_performance policy_backup_performance_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY policy_backup_performance_super_admin_policy ON public.policy_backup_performance USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: recognition_criteria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recognition_criteria ENABLE ROW LEVEL SECURITY;

--
-- Name: recognition_criteria recognition_criteria_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY recognition_criteria_authenticated_policy ON public.recognition_criteria USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: recognition_criteria recognition_criteria_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY recognition_criteria_service_role_policy ON public.recognition_criteria TO service_role USING (true) WITH CHECK (true);


--
-- Name: recognition_criteria recognition_criteria_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY recognition_criteria_super_admin_policy ON public.recognition_criteria USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: recognition_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recognition_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: recognition_programs recognition_programs_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY recognition_programs_authenticated_policy ON public.recognition_programs USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: recognition_programs recognition_programs_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY recognition_programs_service_role_policy ON public.recognition_programs TO service_role USING (true) WITH CHECK (true);


--
-- Name: recognition_programs recognition_programs_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY recognition_programs_super_admin_policy ON public.recognition_programs USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions role_permissions_modify_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role_permissions_modify_policy ON public.role_permissions USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());


--
-- Name: role_permissions role_permissions_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role_permissions_select_policy ON public.role_permissions FOR SELECT USING (((( SELECT auth.role() AS role) = 'authenticated'::text) AND public.is_admin_or_super()));


--
-- Name: role_permissions role_permissions_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role_permissions_service_role_policy ON public.role_permissions TO service_role USING (true) WITH CHECK (true);


--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: roles roles_modify_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY roles_modify_policy ON public.roles USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());


--
-- Name: roles roles_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY roles_select_policy ON public.roles FOR SELECT USING (((( SELECT auth.role() AS role) = 'authenticated'::text) AND public.is_admin_or_super()));


--
-- Name: roles roles_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY roles_service_role_policy ON public.roles TO service_role USING (true) WITH CHECK (true);


--
-- Name: schedule_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_events schedule_events_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY schedule_events_authenticated_policy ON public.schedule_events USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: schedule_events schedule_events_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY schedule_events_service_role_policy ON public.schedule_events TO service_role USING (true) WITH CHECK (true);


--
-- Name: schedule_events schedule_events_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY schedule_events_super_admin_policy ON public.schedule_events USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: security_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: security_audit_log security_audit_log_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY security_audit_log_admin_policy ON public.security_audit_log USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: security_audit_log security_audit_log_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY security_audit_log_service_role_policy ON public.security_audit_log TO service_role USING (true) WITH CHECK (true);


--
-- Name: security_audit_log security_audit_log_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY security_audit_log_super_admin_policy ON public.security_audit_log USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: system_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: unidades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

--
-- Name: unidades unidades_authenticated_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY unidades_authenticated_policy ON public.unidades USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: unidades unidades_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY unidades_service_role_policy ON public.unidades TO service_role USING (true) WITH CHECK (true);


--
-- Name: unidades unidades_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY unidades_super_admin_policy ON public.unidades USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_delete_policy ON public.users FOR DELETE USING (public.is_admin_or_super());


--
-- Name: users users_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_insert_policy ON public.users FOR INSERT WITH CHECK (public.is_admin_or_super());


--
-- Name: users users_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_select_policy ON public.users FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (public.is_admin_or_super() OR public.has_permission('usuarios.view'::text) OR public.has_permission('funcionarios.view'::text) OR (id = auth.uid()))));


--
-- Name: users users_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_service_role_policy ON public.users TO service_role USING (true) WITH CHECK (true);


--
-- Name: users users_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_super_admin_policy ON public.users USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: users users_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_policy ON public.users FOR UPDATE USING (public.can_modify_user(id)) WITH CHECK (public.can_modify_user(id));


--
-- Name: vacation_balances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vacation_balances ENABLE ROW LEVEL SECURITY;

--
-- Name: vacation_balances vacation_balances_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vacation_balances_policy ON public.vacation_balances USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: vacation_balances vacation_balances_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vacation_balances_service_role_policy ON public.vacation_balances TO service_role USING (true) WITH CHECK (true);


--
-- Name: vacation_balances vacation_balances_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vacation_balances_super_admin_policy ON public.vacation_balances USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: vacation_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: vacation_requests vacation_requests_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vacation_requests_policy ON public.vacation_requests USING ((( SELECT auth.role() AS role) = 'authenticated'::text));


--
-- Name: vacation_requests vacation_requests_service_role_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vacation_requests_service_role_policy ON public.vacation_requests TO service_role USING (true) WITH CHECK (true);


--
-- Name: vacation_requests vacation_requests_super_admin_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vacation_requests_super_admin_policy ON public.vacation_requests USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super());


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow authenticated users to delete documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'documents'::text));


--
-- Name: objects Allow authenticated users to update documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to update documents" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'documents'::text));


--
-- Name: objects Allow authenticated users to upload documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'documents'::text));


--
-- Name: objects Allow authenticated users to view documents; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to view documents" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'documents'::text));


--
-- Name: objects Avatar images are publicly accessible; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects Users can delete their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can update their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: objects Users can upload their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

