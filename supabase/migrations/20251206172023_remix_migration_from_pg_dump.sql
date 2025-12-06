CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_email text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    entity_name text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: history_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.history_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    employee_name text NOT NULL,
    days jsonb NOT NULL,
    total_days integer NOT NULL,
    total_advances numeric NOT NULL,
    net_total numeric NOT NULL,
    week_number integer NOT NULL,
    closed_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    total_extras numeric DEFAULT 0 NOT NULL
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    employee_name text NOT NULL,
    sale_amount numeric DEFAULT 0 NOT NULL,
    sale_date timestamp with time zone DEFAULT now() NOT NULL,
    description text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: week_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.week_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    employee_name text NOT NULL,
    days jsonb NOT NULL,
    total_days integer DEFAULT 0 NOT NULL,
    total_advances numeric DEFAULT 0 NOT NULL,
    net_total numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    total_extras numeric DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: history_records history_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.history_records
    ADD CONSTRAINT history_records_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: week_records week_records_employee_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.week_records
    ADD CONSTRAINT week_records_employee_id_unique UNIQUE (employee_id);


--
-- Name: week_records week_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.week_records
    ADD CONSTRAINT week_records_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_entity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs USING btree (entity_type);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sales fk_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: history_records history_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.history_records
    ADD CONSTRAINT history_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: week_records week_records_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.week_records
    ADD CONSTRAINT week_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: week_records week_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.week_records
    ADD CONSTRAINT week_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: employees Admins can create employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: history_records Admins can create history records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create history records" ON public.history_records FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: week_records Admins can create week records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create week records" ON public.week_records FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: employees Admins can delete employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete employees" ON public.employees FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: history_records Admins can delete history records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete history records" ON public.history_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sales Admins can delete sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete sales" ON public.sales FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: week_records Admins can delete week records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete week records" ON public.week_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sales Admins can insert sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert sales" ON public.sales FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: employees Admins can update employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update employees" ON public.employees FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sales Admins can update sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update sales" ON public.sales FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: week_records Admins can update week records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update week records" ON public.week_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: audit_logs Anyone authenticated can create audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone authenticated can create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_roles Authenticated users can insert own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: audit_logs Everyone can view all audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view all audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);


--
-- Name: employees Everyone can view all employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view all employees" ON public.employees FOR SELECT TO authenticated USING (true);


--
-- Name: history_records Everyone can view all history records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view all history records" ON public.history_records FOR SELECT TO authenticated USING (true);


--
-- Name: sales Everyone can view all sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view all sales" ON public.sales FOR SELECT USING (true);


--
-- Name: week_records Everyone can view all week records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view all week records" ON public.week_records FOR SELECT TO authenticated USING (true);


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: history_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.history_records ENABLE ROW LEVEL SECURITY;

--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: week_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.week_records ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


