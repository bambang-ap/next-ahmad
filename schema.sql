--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    npwp character varying(30),
    no_telp character varying(15),
    alamat character varying(255),
    up character varying(255),
    active boolean DEFAULT true
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: customer_sppb_in; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_sppb_in (
    id character varying(47) NOT NULL,
    nomor_surat character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    id_po character varying(100),
    tgl character varying(50),
    lot_no character varying(100)
);


ALTER TABLE public.customer_sppb_in OWNER TO postgres;

--
-- Name: customer_sppb_out; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_sppb_out (
    id character varying(47) NOT NULL,
    id_customer character varying(47) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    po json DEFAULT '[]'::json,
    date character varying(30),
    invoice_no character varying(47),
    id_kendaraan character varying(47),
    keterangan character varying(255)
);


ALTER TABLE public.customer_sppb_out OWNER TO postgres;

--
-- Name: document_number; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_number (
    id character varying(47) NOT NULL,
    doc_no character varying(100) NOT NULL,
    keterangan character varying(255) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    tgl_efektif character varying(100),
    revisi character varying(5) DEFAULT '00'::character varying,
    terbit character varying(5) DEFAULT 'AA'::character varying,
    target character varying(47)
);


ALTER TABLE public.document_number OWNER TO postgres;

--
-- Name: hardness; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hardness (
    id character varying(47) NOT NULL,
    id_kategori character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    keterangan character varying(255)
);


ALTER TABLE public.hardness OWNER TO postgres;

--
-- Name: hardness_kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hardness_kategori (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.hardness_kategori OWNER TO postgres;

--
-- Name: instruksi_kanban; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instruksi_kanban (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.instruksi_kanban OWNER TO postgres;

--
-- Name: kanban; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban (
    id character varying(47) NOT NULL,
    id_po character varying(47),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    id_sppb_in character varying(47),
    keterangan character varying(100),
    "createdBy" character varying(47),
    image text,
    "updatedBy" character varying(47),
    status character varying(2) DEFAULT '0'::character varying NOT NULL,
    doc_id character varying(47),
    nomor_kanban character varying(47),
    list_mesin json DEFAULT '[]'::json,
    printed integer DEFAULT 0
);


ALTER TABLE public.kanban OWNER TO postgres;

--
-- Name: kanban_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_item (
    id character varying(47) NOT NULL,
    id_item character varying(47) NOT NULL,
    id_kanban character varying(47) NOT NULL,
    qty1 numeric,
    qty2 numeric,
    qty3 numeric,
    qty4 numeric,
    qty5 numeric,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    master_item_id character varying(47),
    id_item_po character varying(47)
);


ALTER TABLE public.kanban_item OWNER TO postgres;

--
-- Name: kendaraan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kendaraan (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.kendaraan OWNER TO postgres;

--
-- Name: master_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_item (
    id character varying(47) NOT NULL,
    name character varying(255),
    kode_item character varying(255),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    kategori_mesin character varying(47),
    instruksi json DEFAULT '[]'::json,
    kategori_mesinn character varying(47)[],
    keterangan character varying(100)
);


ALTER TABLE public.master_item OWNER TO postgres;

--
-- Name: material; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material (
    id character varying(47) NOT NULL,
    id_kategori character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.material OWNER TO postgres;

--
-- Name: material_kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_kategori (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.material_kategori OWNER TO postgres;

--
-- Name: menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu (
    id character varying(47) NOT NULL,
    parent_id character varying(47),
    title character varying(100) NOT NULL,
    icon character varying(50),
    path character varying(100),
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL,
    accepted_role text NOT NULL,
    index integer NOT NULL
);


ALTER TABLE public.menu OWNER TO postgres;

--
-- Name: mesin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesin (
    id character varying(47) NOT NULL,
    nomor_mesin character varying(50) NOT NULL,
    name character varying(100),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    kategori_mesin character varying(47)
);


ALTER TABLE public.mesin OWNER TO postgres;

--
-- Name: mesin_kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesin_kategori (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.mesin_kategori OWNER TO postgres;

--
-- Name: parameter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parameter (
    id character varying(47) NOT NULL,
    id_kategori character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    keterangan character varying(255)
);


ALTER TABLE public.parameter OWNER TO postgres;

--
-- Name: parameter_kategori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parameter_kategori (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.parameter_kategori OWNER TO postgres;

--
-- Name: po; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.po (
    id character varying(47) NOT NULL,
    id_customer character varying(47),
    nomor_po character varying(100),
    tgl_po character varying(50),
    due_date character varying(50),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.po OWNER TO postgres;

--
-- Name: po_item_sppb_in; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.po_item_sppb_in (
    id character varying(47) NOT NULL,
    id_item character varying(47) NOT NULL,
    id_sppb_in character varying(47) NOT NULL,
    qty1 numeric,
    qty2 numeric,
    qty3 numeric,
    qty4 numeric,
    qty5 numeric,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    master_item_id character varying(47),
    lot_no character varying(100)
);


ALTER TABLE public.po_item_sppb_in OWNER TO postgres;

--
-- Name: po_itemm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.po_itemm (
    id character varying(47) NOT NULL,
    qty1 numeric,
    unit1 character varying(25),
    qty2 numeric,
    unit2 character varying(25),
    qty3 numeric,
    unit3 character varying(25),
    qty4 numeric,
    unit4 character varying(25),
    qty5 numeric,
    unit5 character varying(25),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    id_po character varying(47),
    harga numeric,
    master_item_id character varying(47)
);


ALTER TABLE public.po_itemm OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id character varying(47) NOT NULL,
    name character varying(50) NOT NULL,
    "updatedAt" timestamp without time zone,
    "createdAt" timestamp without time zone
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: scan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan (
    id character varying(47) NOT NULL,
    id_kanban character varying(47),
    status_produksi boolean DEFAULT false NOT NULL,
    status_qc boolean DEFAULT false NOT NULL,
    status_finish_good boolean DEFAULT false NOT NULL,
    status_out_barang boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    item_produksi json DEFAULT '[]'::json,
    item_qc json DEFAULT '[]'::json,
    item_finish_good json DEFAULT '[]'::json,
    item_out_barang json DEFAULT '[]'::json,
    lot_no_imi character varying(100),
    item_qc_reject json DEFAULT '[]'::json,
    id_customer character varying(47),
    notes text
);


ALTER TABLE public.scan OWNER TO postgres;

--
-- Name: supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    up character varying(100),
    alamat character varying(255),
    phone character varying(20),
    npwp character varying(20)
);


ALTER TABLE public.supplier OWNER TO postgres;

--
-- Name: supplier_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_item (
    id character varying(47) NOT NULL,
    code_item character varying(100) NOT NULL,
    name_item character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.supplier_item OWNER TO postgres;

--
-- Name: supplier_item_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_item_relation (
    id character varying(47) NOT NULL,
    item_id character varying(47) NOT NULL,
    supplier_id character varying(47) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.supplier_item_relation OWNER TO postgres;

--
-- Name: supplier_po; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_po (
    id character varying(47) NOT NULL,
    id_supplier character varying(47) NOT NULL,
    items json DEFAULT '{}'::json,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.supplier_po OWNER TO postgres;

--
-- Name: user_login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_login (
    id character varying(47) NOT NULL,
    id_user character varying(100) NOT NULL,
    "expiredAt" timestamp without time zone,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.user_login OWNER TO postgres;

--
-- Name: user_pengguna; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_pengguna (
    id character varying(47) NOT NULL,
    email character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    role character varying(47) NOT NULL
);


ALTER TABLE public.user_pengguna OWNER TO postgres;

--
-- Name: user_login customer_login_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_login
    ADD CONSTRAINT customer_login_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: customer_sppb_in customer_sppb_in_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_in
    ADD CONSTRAINT customer_sppb_in_pkey PRIMARY KEY (id);


--
-- Name: document_number document_number_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_number
    ADD CONSTRAINT document_number_pkey PRIMARY KEY (id);


--
-- Name: hardness_kategori hardness_kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hardness_kategori
    ADD CONSTRAINT hardness_kategori_pkey PRIMARY KEY (id);


--
-- Name: hardness hardness_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hardness
    ADD CONSTRAINT hardness_pkey PRIMARY KEY (id);


--
-- Name: user_pengguna id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_pengguna
    ADD CONSTRAINT id_pkey PRIMARY KEY (id) INCLUDE (id);


--
-- Name: instruksi_kanban instruksi_kanban_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instruksi_kanban
    ADD CONSTRAINT instruksi_kanban_pkey PRIMARY KEY (id);


--
-- Name: kanban_item kanban_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_item
    ADD CONSTRAINT kanban_item_pkey PRIMARY KEY (id);


--
-- Name: kanban kanban_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban
    ADD CONSTRAINT kanban_pkey PRIMARY KEY (id);


--
-- Name: material_kategori kategori_material_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_kategori
    ADD CONSTRAINT kategori_material_pkey PRIMARY KEY (id);


--
-- Name: kendaraan kendaraan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kendaraan
    ADD CONSTRAINT kendaraan_pkey PRIMARY KEY (id);


--
-- Name: master_item master_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_pkey PRIMARY KEY (id);


--
-- Name: material material_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT material_pkey PRIMARY KEY (id);


--
-- Name: menu menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);


--
-- Name: mesin_kategori mesin_kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesin_kategori
    ADD CONSTRAINT mesin_kategori_pkey PRIMARY KEY (id);


--
-- Name: mesin mesin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesin
    ADD CONSTRAINT mesin_pkey PRIMARY KEY (id);


--
-- Name: parameter_kategori parameter_kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parameter_kategori
    ADD CONSTRAINT parameter_kategori_pkey PRIMARY KEY (id);


--
-- Name: parameter parameter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parameter
    ADD CONSTRAINT parameter_pkey PRIMARY KEY (id);


--
-- Name: po_item_sppb_in po_item_sppb_in_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_item_sppb_in
    ADD CONSTRAINT po_item_sppb_in_pkey PRIMARY KEY (id);


--
-- Name: po_itemm po_itemm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_itemm
    ADD CONSTRAINT po_itemm_pkey PRIMARY KEY (id);


--
-- Name: po po_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po
    ADD CONSTRAINT po_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: scan scan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan
    ADD CONSTRAINT scan_pkey PRIMARY KEY (id);


--
-- Name: customer_sppb_out sppb_out_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_out
    ADD CONSTRAINT sppb_out_pk PRIMARY KEY (id);


--
-- Name: supplier_item supplier_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_item
    ADD CONSTRAINT supplier_item_pkey PRIMARY KEY (id);


--
-- Name: supplier_item_relation supplier_item_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_item_relation
    ADD CONSTRAINT supplier_item_relation_pkey PRIMARY KEY (id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: supplier_po supplier_po_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_po
    ADD CONSTRAINT supplier_po_pkey PRIMARY KEY (id);


--
-- Name: name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX name ON public.role USING btree (name);


--
-- Name: name_1684686351854_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX name_1684686351854_index ON public.mesin_kategori USING btree (name);


--
-- Name: customer_sppb_in customer_sppb_in_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_in
    ADD CONSTRAINT customer_sppb_in_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.po(id);


--
-- Name: hardness hardness_id_kategori_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hardness
    ADD CONSTRAINT hardness_id_kategori_fkey FOREIGN KEY (id_kategori) REFERENCES public.hardness_kategori(id);


--
-- Name: scan id_kanban; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan
    ADD CONSTRAINT id_kanban FOREIGN KEY (id_kanban) REFERENCES public.kanban(id);


--
-- Name: kanban kanban_doc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban
    ADD CONSTRAINT kanban_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.document_number(id);


--
-- Name: kanban kanban_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban
    ADD CONSTRAINT kanban_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.po(id);


--
-- Name: kanban_item kanban_item_id_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_item
    ADD CONSTRAINT kanban_item_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.po_item_sppb_in(id);


--
-- Name: kanban_item kanban_item_id_kanban_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_item
    ADD CONSTRAINT kanban_item_id_kanban_fkey FOREIGN KEY (id_kanban) REFERENCES public.kanban(id);


--
-- Name: material material_id_kategori_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT material_id_kategori_fkey FOREIGN KEY (id_kategori) REFERENCES public.material_kategori(id);


--
-- Name: mesin mesin_kategori_mesin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesin
    ADD CONSTRAINT mesin_kategori_mesin_fkey FOREIGN KEY (kategori_mesin) REFERENCES public.mesin_kategori(id);


--
-- Name: parameter parameter_id_kategori_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parameter
    ADD CONSTRAINT parameter_id_kategori_fkey FOREIGN KEY (id_kategori) REFERENCES public.parameter_kategori(id);


--
-- Name: po_item_sppb_in po_item_sppb_in_id_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_item_sppb_in
    ADD CONSTRAINT po_item_sppb_in_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.po_itemm(id);


--
-- Name: po_item_sppb_in po_item_sppb_in_id_sppb_in_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_item_sppb_in
    ADD CONSTRAINT po_item_sppb_in_id_sppb_in_fkey FOREIGN KEY (id_sppb_in) REFERENCES public.customer_sppb_in(id);


--
-- Name: po_itemm po_itemm_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_itemm
    ADD CONSTRAINT po_itemm_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.po(id);


--
-- Name: user_login user_login_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_login
    ADD CONSTRAINT user_login_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.user_pengguna(id);


--
-- Name: user_pengguna user_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_pengguna
    ADD CONSTRAINT user_role_fkey FOREIGN KEY (role) REFERENCES public.role(id) NOT VALID;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

