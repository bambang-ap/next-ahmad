--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3 (Debian 15.3-1.pgdg110+1)
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
    keterangan character varying(255),
    index_id character varying(47),
    index_number character varying(10)
);


ALTER TABLE public.customer_sppb_out OWNER TO postgres;

--
-- Name: customer_sppb_out_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_sppb_out_item (
    id character varying(47) NOT NULL,
    id_item character varying(47) NOT NULL,
    id_sppb_out character varying(47) NOT NULL,
    qty1 numeric,
    qty2 numeric,
    qty3 numeric,
    qty4 numeric,
    qty5 numeric,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.customer_sppb_out_item OWNER TO postgres;

--
-- Name: customer_sppb_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_sppb_relation (
    id character varying(47) NOT NULL,
    in_id character varying(47) NOT NULL,
    out_id character varying(47) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.customer_sppb_relation OWNER TO postgres;

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
-- Name: index_number; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.index_number (
    id character varying(47) NOT NULL,
    prefix character varying(100) NOT NULL,
    target character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    keterangan character varying(100)
);


ALTER TABLE public.index_number OWNER TO postgres;

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
-- Name: internal_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_item (
    id character varying(47) NOT NULL,
    sup_id character varying(47),
    nama character varying(100),
    kode character varying(100),
    ppn boolean DEFAULT false,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    harga numeric
);


ALTER TABLE public.internal_item OWNER TO postgres;

--
-- Name: internal_out_barang; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_out_barang (
    id character varying(47) NOT NULL,
    id_stock character varying(47),
    keterangan character varying(255),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    "user" character varying(100),
    qty numeric
);


ALTER TABLE public.internal_out_barang OWNER TO postgres;

--
-- Name: internal_po; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_po (
    id character varying(47) NOT NULL,
    sup_id character varying(47),
    date character varying(30),
    due_date character varying(30),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    nomor_po character varying(100),
    keterangan character varying(100),
    index_id character varying(47),
    index_number character varying(10)
);


ALTER TABLE public.internal_po OWNER TO postgres;

--
-- Name: internal_po_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_po_item (
    id character varying(47) NOT NULL,
    id_po character varying(47),
    id_item character varying(47),
    discount numeric,
    qty numeric,
    unit character varying(10),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.internal_po_item OWNER TO postgres;

--
-- Name: internal_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_request (
    id character varying(47) NOT NULL,
    sup_id character varying(47),
    date character varying(30),
    due_date character varying(30),
    items json DEFAULT '[]'::json,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    status character varying(100),
    keterangan character varying(100),
    index_id character varying(47),
    index_number character varying(10)
);


ALTER TABLE public.internal_request OWNER TO postgres;

--
-- Name: internal_sj_in; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_sj_in (
    id character varying(47) NOT NULL,
    id_po character varying(47),
    sup_id character varying(47),
    date character varying(30),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    no_sj character varying(47),
    no_lpb character varying(100)
);


ALTER TABLE public.internal_sj_in OWNER TO postgres;

--
-- Name: internal_sj_in_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_sj_in_item (
    id character varying(47) NOT NULL,
    in_id character varying(47),
    id_item character varying(47),
    qty numeric,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    unit character varying(20),
    harga numeric,
    kode character varying(100),
    nama character varying(100),
    keterangan character varying(100)
);


ALTER TABLE public.internal_sj_in_item OWNER TO postgres;

--
-- Name: internal_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_stock (
    id character varying(47) NOT NULL,
    sup_id character varying(47),
    nama character varying(100),
    kode character varying(100),
    ppn boolean DEFAULT false,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    harga numeric,
    qty numeric,
    unit character varying(20),
    id_item character varying(47),
    id_item_in character varying(47)
);


ALTER TABLE public.internal_stock OWNER TO postgres;

--
-- Name: internal_supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_supplier (
    id character varying(47) NOT NULL,
    nama character varying(100),
    alamat character varying(100),
    npwp character varying(100),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    telp character varying(20)
);


ALTER TABLE public.internal_supplier OWNER TO postgres;

--
-- Name: inv_supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inv_supplier (
    id character varying(47) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    up character varying(100),
    alamat character varying(255),
    phone character varying(20),
    npwp character varying(20)
);


ALTER TABLE public.inv_supplier OWNER TO postgres;

--
-- Name: inv_supplier_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inv_supplier_item (
    id character varying(47) NOT NULL,
    code_item character varying(100) NOT NULL,
    name_item character varying(100) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.inv_supplier_item OWNER TO postgres;

--
-- Name: inv_supplier_item_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inv_supplier_item_relation (
    id character varying(47) NOT NULL,
    item_id character varying(47) NOT NULL,
    supplier_id character varying(47) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.inv_supplier_item_relation OWNER TO postgres;

--
-- Name: inv_supplier_po; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inv_supplier_po (
    id character varying(47) NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    ppn boolean DEFAULT false,
    tgl_po character varying(50),
    tgl_req_send character varying(50),
    keterangan character varying(100),
    ppn_percentage integer DEFAULT 11
);


ALTER TABLE public.inv_supplier_po OWNER TO postgres;

--
-- Name: inv_supplier_po_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inv_supplier_po_item (
    id character varying(47) NOT NULL,
    id_po character varying(47) NOT NULL,
    id_supplier_item character varying(47) NOT NULL,
    harga numeric,
    qty numeric,
    unit character varying(20),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.inv_supplier_po_item OWNER TO postgres;

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
    printed integer DEFAULT 0,
    index_number character varying(10),
    index_id character varying(47)
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
    id_item_po character varying(47),
    id_mesin character varying(47)
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
    "updatedAt" timestamp without time zone,
    color character varying(20)
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
    qty1 numeric DEFAULT '0'::numeric,
    qty2 numeric DEFAULT '0'::numeric,
    qty3 numeric DEFAULT '0'::numeric,
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
    notes text,
    date json DEFAULT '{}'::json,
    item_from_kanban json DEFAULT '{}'::json,
    item_qc_reject_category json DEFAULT '[]'::json
);


ALTER TABLE public.scan OWNER TO postgres;

--
-- Name: scan_new; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan_new (
    id character varying(47) NOT NULL,
    id_kanban character varying(47),
    lot_no_imi character varying(100),
    id_customer character varying(47),
    status character varying(15),
    notes character varying(50),
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    is_rejected boolean DEFAULT false,
    id_po character varying(47),
    id_qc character varying(47)
);


ALTER TABLE public.scan_new OWNER TO postgres;

--
-- Name: COLUMN scan_new.id_kanban; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.scan_new.id_kanban IS 'comment';


--
-- Name: scan_new_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan_new_item (
    id character varying(47) NOT NULL,
    id_scan character varying(47) NOT NULL,
    qty1 numeric,
    qty2 numeric,
    qty3 numeric,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    id_kanban_item character varying(47),
    item_from_kanban json DEFAULT '{}'::json
);


ALTER TABLE public.scan_new_item OWNER TO postgres;

--
-- Name: scan_new_item_reject; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan_new_item_reject (
    id character varying(47) NOT NULL,
    id_item character varying(47) NOT NULL,
    qty1 numeric,
    qty2 numeric,
    qty3 numeric,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    reason character varying(10)
);


ALTER TABLE public.scan_new_item_reject OWNER TO postgres;

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
-- Name: customer_sppb_out_item customer_sppb_out_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_out_item
    ADD CONSTRAINT customer_sppb_out_item_pkey PRIMARY KEY (id);


--
-- Name: customer_sppb_relation customer_sppb_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_relation
    ADD CONSTRAINT customer_sppb_relation_pkey PRIMARY KEY (id);


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
-- Name: index_number index_number_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.index_number
    ADD CONSTRAINT index_number_pkey PRIMARY KEY (id);


--
-- Name: instruksi_kanban instruksi_kanban_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instruksi_kanban
    ADD CONSTRAINT instruksi_kanban_pkey PRIMARY KEY (id);


--
-- Name: internal_sj_in_item internal_in_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_sj_in_item
    ADD CONSTRAINT internal_in_item_pkey PRIMARY KEY (id);


--
-- Name: internal_supplier internal_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_supplier
    ADD CONSTRAINT internal_item_pkey PRIMARY KEY (id);


--
-- Name: internal_out_barang internal_out_barang_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_out_barang
    ADD CONSTRAINT internal_out_barang_pkey PRIMARY KEY (id);


--
-- Name: internal_po_item internal_po_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_po_item
    ADD CONSTRAINT internal_po_item_pkey PRIMARY KEY (id);


--
-- Name: internal_po internal_po_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_po
    ADD CONSTRAINT internal_po_pkey PRIMARY KEY (id);


--
-- Name: internal_request internal_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_request
    ADD CONSTRAINT internal_request_pkey PRIMARY KEY (id);


--
-- Name: internal_sj_in internal_sj_in_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_sj_in
    ADD CONSTRAINT internal_sj_in_pkey PRIMARY KEY (id);


--
-- Name: internal_stock internal_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_stock
    ADD CONSTRAINT internal_stock_pkey PRIMARY KEY (id);


--
-- Name: internal_item internal_supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_item
    ADD CONSTRAINT internal_supplier_pkey PRIMARY KEY (id);


--
-- Name: inv_supplier_po_item inv_supplier_po_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_po_item
    ADD CONSTRAINT inv_supplier_po_item_pkey PRIMARY KEY (id);


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
-- Name: scan_new_item scan_new_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new_item
    ADD CONSTRAINT scan_new_item_pkey PRIMARY KEY (id);


--
-- Name: scan_new_item_reject scan_new_item_reject_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new_item_reject
    ADD CONSTRAINT scan_new_item_reject_pkey PRIMARY KEY (id);


--
-- Name: scan_new scan_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new
    ADD CONSTRAINT scan_new_pkey PRIMARY KEY (id);


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
-- Name: inv_supplier_item supplier_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_item
    ADD CONSTRAINT supplier_item_pkey PRIMARY KEY (id);


--
-- Name: inv_supplier_item_relation supplier_item_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_item_relation
    ADD CONSTRAINT supplier_item_relation_pkey PRIMARY KEY (id);


--
-- Name: inv_supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: inv_supplier_po supplier_po_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_po
    ADD CONSTRAINT supplier_po_pkey PRIMARY KEY (id);


--
-- Name: createdby_1693939331115_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX createdby_1693939331115_index ON public.kanban USING btree ("createdBy");


--
-- Name: customer_sppb_in_createdAt_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customer_sppb_in_createdAt_index" ON public.customer_sppb_in USING btree ("createdAt" DESC);


--
-- Name: customer_sppb_in_id_po_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_sppb_in_id_po_index ON public.customer_sppb_in USING btree (id_po);


--
-- Name: customer_sppb_in_id_po_index2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_sppb_in_id_po_index2 ON public.customer_sppb_in USING btree (id_po);


--
-- Name: customer_sppb_in_id_po_index3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_sppb_in_id_po_index3 ON public.customer_sppb_in USING btree (id_po) INCLUDE (nomor_surat, "createdAt", tgl);


--
-- Name: customer_sppb_in_nomor_surat_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_sppb_in_nomor_surat_index ON public.customer_sppb_in USING btree (nomor_surat);


--
-- Name: customer_sppb_in_tgl_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_sppb_in_tgl_index ON public.customer_sppb_in USING btree (tgl);


--
-- Name: doc_id_1693939147464_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX doc_id_1693939147464_index ON public.kanban USING btree (doc_id);


--
-- Name: email_1693939633648_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_1693939633648_index ON public.user_pengguna USING btree (email);


--
-- Name: email_1703677742070_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX email_1703677742070_index ON public.user_pengguna USING btree (email);


--
-- Name: id_1693939527547_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_1693939527547_index ON public.customer USING btree (id);


--
-- Name: id_customer_1693938989246_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_customer_1693938989246_index ON public.po USING btree (id_customer);


--
-- Name: id_customer_1693939019302_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_customer_1693939019302_index ON public.customer_sppb_out USING btree (id_customer);


--
-- Name: id_kanban_1693939108665_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_kanban_1693939108665_index ON public.kanban_item USING btree (id_kanban);


--
-- Name: id_kanban_1693939168149_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_kanban_1693939168149_index ON public.scan USING btree (id_kanban);


--
-- Name: id_kategori_1693939411214_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_kategori_1693939411214_index ON public.hardness USING btree (id_kategori);


--
-- Name: id_kategori_1693939423366_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_kategori_1693939423366_index ON public.material USING btree (id_kategori);


--
-- Name: id_kategori_1693939433148_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_kategori_1693939433148_index ON public.parameter USING btree (id_kategori);


--
-- Name: id_kendaraan_1693939024312_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_kendaraan_1693939024312_index ON public.customer_sppb_out USING btree (id_kendaraan);


--
-- Name: id_po_1693939039051_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_po_1693939039051_index ON public.kanban USING btree (id_po);


--
-- Name: id_po_1693939054565_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_po_1693939054565_index ON public.po_itemm USING btree (id_po);


--
-- Name: id_po_1693939296738_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_po_1693939296738_index ON public.customer_sppb_in USING btree (id_po);


--
-- Name: id_po_1693939397429_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_po_1693939397429_index ON public.inv_supplier_po_item USING btree (id_po);


--
-- Name: id_sppb_in_1693939092480_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_sppb_in_1693939092480_index ON public.po_item_sppb_in USING btree (id_sppb_in);


--
-- Name: id_sppb_in_1693939278930_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_sppb_in_1693939278930_index ON public.kanban USING btree (id_sppb_in);


--
-- Name: id_supplier_item_1693939377317_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_supplier_item_1693939377317_index ON public.inv_supplier_po_item USING btree (id_supplier_item);


--
-- Name: item_id_1693939461883_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX item_id_1693939461883_index ON public.inv_supplier_item_relation USING btree (item_id);


--
-- Name: kanban_item_createdAt_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kanban_item_createdAt_index" ON public.kanban_item USING btree ("createdAt" DESC);


--
-- Name: kanban_item_id_item_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kanban_item_id_item_index ON public.kanban_item USING btree (id_item);


--
-- Name: kategori_mesin_1693938962084_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kategori_mesin_1693938962084_index ON public.master_item USING btree (kategori_mesin);


--
-- Name: kategori_mesin_1693938980082_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kategori_mesin_1693938980082_index ON public.mesin USING btree (kategori_mesin);


--
-- Name: master_item_id_1693938881549_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX master_item_id_1693938881549_index ON public.po_itemm USING btree (master_item_id);


--
-- Name: master_item_id_1693938902665_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX master_item_id_1693938902665_index ON public.kanban_item USING btree (master_item_id);


--
-- Name: master_item_id_1693938923669_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX master_item_id_1693938923669_index ON public.po_item_sppb_in USING btree (master_item_id);


--
-- Name: name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX name ON public.role USING btree (name);


--
-- Name: name_1684686351854_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX name_1684686351854_index ON public.mesin_kategori USING btree (name);


--
-- Name: password_1693939643811_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_1693939643811_index ON public.user_pengguna USING btree (password);


--
-- Name: po_item_sppb_in_createdAt_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "po_item_sppb_in_createdAt_index" ON public.po_item_sppb_in USING btree ("createdAt" DESC);


--
-- Name: status_finish_good_1693939711768_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX status_finish_good_1693939711768_index ON public.scan USING btree (status_finish_good);


--
-- Name: status_produksi_1693939711768_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX status_produksi_1693939711768_index ON public.scan USING btree (status_produksi);


--
-- Name: status_qc_1693939711768_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX status_qc_1693939711768_index ON public.scan USING btree (status_qc);


--
-- Name: supplier_id_1693939467378_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX supplier_id_1693939467378_index ON public.inv_supplier_item_relation USING btree (supplier_id);


--
-- Name: updatedby_1693939331115_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX updatedby_1693939331115_index ON public.kanban USING btree ("updatedBy");


--
-- Name: customer_sppb_in customer_sppb_in_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_in
    ADD CONSTRAINT customer_sppb_in_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.po(id);


--
-- Name: customer_sppb_out customer_sppb_out_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_out
    ADD CONSTRAINT customer_sppb_out_index_id_fkey FOREIGN KEY (index_id) REFERENCES public.index_number(id);


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
-- Name: customer_sppb_relation in_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_relation
    ADD CONSTRAINT in_id FOREIGN KEY (in_id) REFERENCES public.customer_sppb_in(id);


--
-- Name: internal_item internal_item_sup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_item
    ADD CONSTRAINT internal_item_sup_id_fkey FOREIGN KEY (sup_id) REFERENCES public.internal_supplier(id);


--
-- Name: internal_out_barang internal_out_barang_id_stock_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_out_barang
    ADD CONSTRAINT internal_out_barang_id_stock_fkey FOREIGN KEY (id_stock) REFERENCES public.internal_stock(id);


--
-- Name: internal_po internal_po_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_po
    ADD CONSTRAINT internal_po_index_id_fkey FOREIGN KEY (index_id) REFERENCES public.index_number(id);


--
-- Name: internal_po_item internal_po_item_id_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_po_item
    ADD CONSTRAINT internal_po_item_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.internal_item(id);


--
-- Name: internal_po_item internal_po_item_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_po_item
    ADD CONSTRAINT internal_po_item_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.internal_po(id);


--
-- Name: internal_po internal_po_sup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_po
    ADD CONSTRAINT internal_po_sup_id_fkey FOREIGN KEY (sup_id) REFERENCES public.internal_supplier(id);


--
-- Name: internal_request internal_request_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_request
    ADD CONSTRAINT internal_request_index_id_fkey FOREIGN KEY (index_id) REFERENCES public.index_number(id);


--
-- Name: internal_sj_in internal_sj_in_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_sj_in
    ADD CONSTRAINT internal_sj_in_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.internal_po(id);


--
-- Name: internal_sj_in_item internal_sj_in_item_id_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_sj_in_item
    ADD CONSTRAINT internal_sj_in_item_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.internal_po_item(id);


--
-- Name: internal_sj_in_item internal_sj_in_item_in_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_sj_in_item
    ADD CONSTRAINT internal_sj_in_item_in_id_fkey FOREIGN KEY (in_id) REFERENCES public.internal_sj_in(id);


--
-- Name: internal_sj_in internal_sj_in_sup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_sj_in
    ADD CONSTRAINT internal_sj_in_sup_id_fkey FOREIGN KEY (sup_id) REFERENCES public.internal_supplier(id);


--
-- Name: internal_stock internal_stock_id_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_stock
    ADD CONSTRAINT internal_stock_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.internal_item(id);


--
-- Name: internal_stock internal_stock_sup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_stock
    ADD CONSTRAINT internal_stock_sup_id_fkey FOREIGN KEY (sup_id) REFERENCES public.internal_supplier(id);


--
-- Name: inv_supplier_po_item inv_supplier_po_item_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_po_item
    ADD CONSTRAINT inv_supplier_po_item_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.inv_supplier_po(id);


--
-- Name: inv_supplier_po_item inv_supplier_po_item_id_supplier_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_po_item
    ADD CONSTRAINT inv_supplier_po_item_id_supplier_item_fkey FOREIGN KEY (id_supplier_item) REFERENCES public.inv_supplier_item_relation(id);


--
-- Name: inv_supplier_item_relation item_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_item_relation
    ADD CONSTRAINT item_id FOREIGN KEY (item_id) REFERENCES public.inv_supplier_item(id);


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
-- Name: kanban kanban_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban
    ADD CONSTRAINT kanban_index_id_fkey FOREIGN KEY (index_id) REFERENCES public.index_number(id);


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
-- Name: customer_sppb_relation out_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_sppb_relation
    ADD CONSTRAINT out_id FOREIGN KEY (out_id) REFERENCES public.customer_sppb_out(id);


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
-- Name: scan_new scan_new_id_kanban_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new
    ADD CONSTRAINT scan_new_id_kanban_fkey FOREIGN KEY (id_kanban) REFERENCES public.kanban(id);


--
-- Name: scan_new scan_new_id_po_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new
    ADD CONSTRAINT scan_new_id_po_fkey FOREIGN KEY (id_po) REFERENCES public.po(id);


--
-- Name: scan_new scan_new_id_qc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new
    ADD CONSTRAINT scan_new_id_qc_fkey FOREIGN KEY (id_qc) REFERENCES public.scan_new(id);


--
-- Name: scan_new_item scan_new_item_id_kanban_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new_item
    ADD CONSTRAINT scan_new_item_id_kanban_item_fkey FOREIGN KEY (id_kanban_item) REFERENCES public.kanban_item(id);


--
-- Name: scan_new_item scan_new_item_id_scan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new_item
    ADD CONSTRAINT scan_new_item_id_scan_fkey FOREIGN KEY (id_scan) REFERENCES public.scan_new(id);


--
-- Name: scan_new_item_reject scan_new_item_reject_id_item_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_new_item_reject
    ADD CONSTRAINT scan_new_item_reject_id_item_fkey FOREIGN KEY (id_item) REFERENCES public.scan_new_item(id);


--
-- Name: inv_supplier_item_relation supplier_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inv_supplier_item_relation
    ADD CONSTRAINT supplier_id FOREIGN KEY (supplier_id) REFERENCES public.inv_supplier(id);


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
-- PostgreSQL database dump complete
--

