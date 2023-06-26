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
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.customer VALUES ('2305156df0', 'PT. DHARMA PRECISION PARTS', '2023-05-15 08:41:59.797', '2023-05-15 08:41:59.797', '1234', '08521233433', 'Jl. Inti Raya Blok C3 / 12 Bekasi International Industrial Estate, Lemah Abang Kabupaten Bekasi, West Java, 17550 Indonesia', 'BPK YULI', true);
INSERT INTO public.customer VALUES ('230516a9b9', 'PT. KOMATSU UNDERCARRIAGE INDONESIA', '2023-05-16 03:18:34.311', '2023-05-16 03:18:34.311', ' 01.869.347.3-055.000', '021 8937575', 'JL. JABABEKA XI Blok H No.16 RT:000 RW:000 Kel.HARJA MEKAR Kec.CIKARANG UTARA Kota/Kab.BEKASI JAWA BARAT 17530', 'Bpk Nur Hidayat', true);
INSERT INTO public.customer VALUES ('230515e348', 'PT. SEOUL PRECISION METAL', '2023-05-15 04:03:52.375', '2023-06-10 05:19:10.527', '12345678', '0218936355', 'Jl. Jababeka VII B Blok K 2P-2Q Kawasan Industri Jababeka I, Cikarang, 17530 Bekasi - Indonesia', 'Ibu Sera', true);


--
-- Data for Name: document_number; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.document_number VALUES ('23041225043', 'IMI/FORM/PPC/01-04', 'Untuk doc 1', '2023-04-11 20:18:45.048', '2023-05-29 15:24:58.963', '2020-10-2', '00', 'AA');


--
-- Data for Name: hardness_kategori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.hardness_kategori VALUES ('1680342497-d5d4a9d8-abf9-445b-a848-78755116c2b7', 'h_kat', '2023-04-01 09:48:17.111', '2023-04-01 10:35:05.228');
INSERT INTO public.hardness_kategori VALUES ('1680550201-0d7cabec-6066-4499-9647-cb79a460041b', 'kat_h', '2023-04-03 19:30:01.245', '2023-04-03 19:30:01.245');
INSERT INTO public.hardness_kategori VALUES ('23051450947', 'Kategori Hardness', '2023-05-14 15:59:10.948', '2023-05-14 15:59:10.948');
INSERT INTO public.hardness_kategori VALUES ('2305154d26', 'SURFACE', '2023-05-15 10:59:53.14', '2023-05-15 10:59:53.14');
INSERT INTO public.hardness_kategori VALUES ('2305158842', 'CORE', '2023-05-15 10:59:59.367', '2023-05-15 10:59:59.367');
INSERT INTO public.hardness_kategori VALUES ('230515bd6b', 'CASE DEPTH', '2023-05-15 11:00:07.58', '2023-05-15 11:00:07.58');


--
-- Data for Name: hardness; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.hardness VALUES ('1680342515-89a0c290-9e40-4b5d-2ae4-6b4e7ea19aae', '1680342497-d5d4a9d8-abf9-445b-a848-78755116c2b7', 'h_1', '2023-04-01 09:48:35', '2023-04-01 10:35:12.613', NULL);
INSERT INTO public.hardness VALUES ('1680344736-ec4c8006-1e18-4581-95b1-faf83670ffb0', '1680342497-d5d4a9d8-abf9-445b-a848-78755116c2b7', 'h_2', '2023-04-01 10:25:36.012', '2023-04-01 10:35:16.949', NULL);
INSERT INTO public.hardness VALUES ('23051470808', '23051450947', 'Data Hardness', '2023-05-14 15:59:30.808', '2023-05-14 15:59:30.808', NULL);
INSERT INTO public.hardness VALUES ('230515f7f1', '2305154d26', 'MIN 450HV', '2023-05-15 11:01:24.116', '2023-05-15 11:01:24.116', NULL);
INSERT INTO public.hardness VALUES ('230515bca1', '2305158842', '270 ~ 370 HV', '2023-05-15 11:01:43.462', '2023-05-15 11:01:43.462', NULL);
INSERT INTO public.hardness VALUES ('23051526c6', '230515bd6b', 'MIN 420HV - MAX 420HV', '2023-05-15 11:02:10.695', '2023-05-15 11:02:10.695', NULL);
INSERT INTO public.hardness VALUES ('230516fde5', '2305154d26', '269 ~ 311 HB', '2023-05-16 04:55:51.548', '2023-05-16 04:55:51.548', NULL);


--
-- Data for Name: instruksi_kanban; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.instruksi_kanban VALUES ('1677935055-d89abd0e-551f-436b-a599-984f88011f22', 'cetak', '2023-03-04 13:04:15.063', '2023-03-04 13:04:15.063');
INSERT INTO public.instruksi_kanban VALUES ('1678473103-d45eb19c-5f95-494a-8922-e7e43ee904f9', 'print', '2023-03-10 18:31:43.734', '2023-03-10 18:31:43.734');
INSERT INTO public.instruksi_kanban VALUES ('230515f08c', 'Proses 1', '2023-05-14 18:02:07.259', '2023-05-14 18:02:07.259');
INSERT INTO public.instruksi_kanban VALUES ('23051576e4', 'INDUCTION', '2023-05-15 08:44:16.059', '2023-05-15 08:44:33.848');
INSERT INTO public.instruksi_kanban VALUES ('230515d133', 'CARBURIZING', '2023-05-15 11:09:22.907', '2023-05-15 11:09:22.907');
INSERT INTO public.instruksi_kanban VALUES ('230516e62c', 'QUENCHING TEMPERING', '2023-05-16 04:46:11.943', '2023-05-16 04:46:11.943');
INSERT INTO public.instruksi_kanban VALUES ('230516432e', 'QUENCHING TEMPERING BATCH TYPE', '2023-05-16 07:27:09.818', '2023-05-16 07:27:09.818');


--
-- Data for Name: kendaraan; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kendaraan VALUES ('1680726921-fbdcb20a-8552-4fea-92e2-fcd7c91f96b9', 'Truk', '2023-04-05 13:35:21.493', '2023-04-05 20:35:39.08');
INSERT INTO public.kendaraan VALUES ('1680726944-ff3f0a54-faea-4376-8cbb-01f24c5cb4b3', 'Pickup', '2023-04-05 20:35:44.334', '2023-04-05 20:35:44.334');
INSERT INTO public.kendaraan VALUES ('23051412766', 'Kendaraan', '2023-05-14 16:00:12.767', '2023-05-14 16:00:12.767');
INSERT INTO public.kendaraan VALUES ('230610fe4f', 'Motor', '2023-06-10 05:17:48.728', '2023-06-10 05:17:48.728');


--
-- Data for Name: material_kategori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.material_kategori VALUES ('1680550216-eac71de8-112c-4530-bfdb-65d534adca83', 'mat_k', '2023-04-03 19:30:16.155', '2023-04-03 19:30:16.155');
INSERT INTO public.material_kategori VALUES ('1680009885-c2cdd006-acbe-4f5d-35cd-5fe38aa343c1', 'k_mat', '2023-03-28 06:24:45.635', '2023-04-03 19:30:20.817');
INSERT INTO public.material_kategori VALUES ('23051480938', 'Kategori Material', '2023-05-14 15:59:40.938', '2023-05-14 15:59:40.938');
INSERT INTO public.material_kategori VALUES ('230515b7b4', 'SWCH 22A', '2023-05-15 11:02:41.046', '2023-05-15 11:02:41.046');
INSERT INTO public.material_kategori VALUES ('2305150c63', '10B23', '2023-05-15 11:02:58.259', '2023-05-15 11:02:58.259');
INSERT INTO public.material_kategori VALUES ('230516a58f', 'SMnB435H', '2023-05-16 04:55:03.688', '2023-05-16 04:55:03.688');


--
-- Data for Name: material; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.material VALUES ('1680009897-7ccc1f1b-ed87-428d-a9c6-0623195bc798', '1680009885-c2cdd006-acbe-4f5d-35cd-5fe38aa343c1', 'dsds', '2023-03-28 13:24:57.376', '2023-03-28 13:24:57.376');
INSERT INTO public.material VALUES ('23041287759', '1680550216-eac71de8-112c-4530-bfdb-65d534adca83', 'asdd', '2023-04-12 07:01:27.762', '2023-04-12 07:01:27.762');
INSERT INTO public.material VALUES ('23051402191', '23051480938', 'Data Material', '2023-05-14 16:00:02.192', '2023-05-14 16:00:02.192');
INSERT INTO public.material VALUES ('230515c311', '2305150c63', '10B23', '2023-05-15 11:03:09.519', '2023-05-15 11:03:09.519');
INSERT INTO public.material VALUES ('2305152336', '230515b7b4', 'SWCH 22A', '2023-05-15 11:03:23.837', '2023-05-15 11:03:23.837');
INSERT INTO public.material VALUES ('2305169603', '230516a58f', 'SMnB435H', '2023-05-16 04:55:13.873', '2023-05-16 04:55:13.873');


--
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu VALUES ('fc781874-6c08-432e-0836-b02635ef994f', NULL, 'scan out barang keluar', 'faHome', '/app/scan/out_barang', '2023-01-18 17:38:00.693', '2023-03-19 08:00:29.53', '26c1s0d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 11);
INSERT INTO public.menu VALUES ('5efd1c9e-bc33-4f15-191d-c4af7697d049', NULL, 'item', 'faHome', '/app/item', '2023-01-18 17:38:00.687', '2023-03-04 11:38:14.549', 'dsd', 12);
INSERT INTO public.menu VALUES ('f4c0c173-2d83-4501-ab53-117361a87ef0', NULL, 'Global', 'faGlobeAmericas', NULL, '2023-01-18 17:38:00.696', '2023-03-01 09:15:44.186', 'uhsdf', 13);
INSERT INTO public.menu VALUES ('6f704527-cad3-49b9-35ec-a1113dc09b49', NULL, 'menu master stock produksi', 'faHome', NULL, '2023-01-18 17:38:00.695', '2023-03-19 08:00:29.53', '26dc100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 22);
INSERT INTO public.menu VALUES ('kmjhc173-2d83-4501-ab53-117361a87ef0', NULL, 'Gallery', 'faHome', '/app/gallery', '2023-01-18 17:38:00.7', '2023-04-03 19:08:52.981', 'disabled', 5);
INSERT INTO public.menu VALUES ('26c100d8-64d7-4458-1252-47b875a7a0e6-1677992729', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677992729', 'Kategori Hardness', 'faHome', '/app/hardness/kategori', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.359', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('c5486962-a199-469f-0ae3-7ed6880c4f7a', 'f4c0c173-2d83-4501-ab53-117361a87ef0', 'Report master (Dashboard) (based on user role)', 'faHome', NULL, '2023-01-18 17:38:00.702', '2023-06-10 05:18:36.36', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('11d98283-fbf4-4093-1598-9212a30451db', 'f4c0c173-2d83-4501-ab53-117361a87ef0', 'Suplier', 'faHome', NULL, '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.361', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('26c100d8-64d7-48c8-1252-47bcd5a7ajh6-1699662729', NULL, 'Document', 'faHome', '/app/document', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.361', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 2);
INSERT INTO public.menu VALUES ('9ac9cafe-5507-458f-ae29-f2a01c9136f2', NULL, 'master user', 'faArchway', NULL, '2023-01-18 17:38:00.658', '2023-06-10 05:18:36.362', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 3);
INSERT INTO public.menu VALUES ('88c100d8-64d7-4458-1252-47b875a7a0e6-1677992729', NULL, 'Parameter', 'faHome', NULL, '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.362', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 4);
INSERT INTO public.menu VALUES ('26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1699662729', NULL, 'Material', 'faHome', NULL, '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.362', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 6);
INSERT INTO public.menu VALUES ('3efd1c9e-bc33-4f15-291d-c4af7697d049', NULL, 'SPPB Out', 'faHome', '/app/customer/customer_sppb_out', '2023-01-18 17:38:00.687', '2023-06-10 05:18:36.365', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 18);
INSERT INTO public.menu VALUES ('26col0d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', NULL, 'kendaraan', 'faHome', '/app/kendaraan', '2023-01-18 17:38:00.676', '2023-06-10 05:18:36.363', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 9);
INSERT INTO public.menu VALUES ('eece9714-f887-4bd8-1564-7a679ba33c0e', NULL, 'Mesin', 'faHome', NULL, '2023-01-18 17:38:00.676', '2023-06-10 05:18:36.363', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 7);
INSERT INTO public.menu VALUES ('ebce9714-f887-4bd8-1564-7a339ba33c0e', NULL, 'menu master customer', 'faHome', '/app/customer', '2023-01-18 17:38:00.676', '2023-06-10 05:18:36.363', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 10);
INSERT INTO public.menu VALUES ('3efd1c9e-bc33-4f15-191d-c4af7697d049', NULL, 'menu master PO customer', 'faHome', '/app/customer/po', '2023-01-18 17:38:00.687', '2023-06-10 05:18:36.363', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 11);
INSERT INTO public.menu VALUES ('3efd1c9e-bc33-4f15-161d-c4af7697d049', NULL, 'SPPB In', 'faAddressBook', '/app/customer/customer_sppb_in', '2023-01-18 17:38:00.687', '2023-06-10 05:18:36.363', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 12);
INSERT INTO public.menu VALUES ('fc781926-6c08-432e-0836-b02635ef994f', NULL, 'menu proses kanban', 'faHome', '/app/kanban/instruksi', '2023-01-18 17:38:00.693', '2023-06-10 05:18:36.364', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 13);
INSERT INTO public.menu VALUES ('cd50fa48-2737-4bb9-3ef6-8e552105124f', NULL, 'master menu', 'faFutbol', '/app/menu', '2023-01-18 17:38:00.536', '2023-06-10 05:18:36.362', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 1);
INSERT INTO public.menu VALUES ('42212d6a-d599-4710-b12f-cdcb87cfc424', NULL, 'menu master kanban', 'faAnchorCircleCheck', '/app/kanban', '2023-01-18 17:38:00.689', '2023-06-10 05:18:36.364', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 14);
INSERT INTO public.menu VALUES ('fc781926-6c08-432e-0836-b09835ef994f', NULL, 'scan QC', 'faHome', '/app/scan/qc', '2023-01-18 17:38:00.693', '2023-06-10 05:18:36.364', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 16);
INSERT INTO public.menu VALUES ('fc781926-6c08-432e-0898-b02635ef994f', NULL, 'scan produksi', 'faHome', '/app/scan/produksi', '2023-01-18 17:38:00.693', '2023-06-10 05:18:36.364', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 15);
INSERT INTO public.menu VALUES ('fc781926-6c08-762e-0836-b02635ef994f', NULL, 'scan Finish Good', 'faHome', '/app/scan/finish_good', '2023-01-18 17:38:00.693', '2023-06-10 05:18:36.365', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 17);
INSERT INTO public.menu VALUES ('45b03359-0228-4d52-2e61-07f82031822b', 'f4c0c173-2d83-4501-ab53-117361a87ef0', 'Inventory', 'faHome', NULL, '2023-01-18 17:38:00.699', '2023-06-10 05:18:36.358', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('26c100d8-64d7-48c8-1252-47bcd457a0e6-1698762729', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1699662729', 'Kategori Material', 'faHome', '/app/material/kategori', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.359', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('bece9714-f887-4bd8-1564-7a339ba33c0e', 'vece9714-f887-4bd8-1564-7a339ba33c0e', 'Material Kategori', 'faHome', '/app/material/kategori', '2023-01-18 17:38:00.693', '2023-06-10 05:18:36.36', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('eece9714-f887-4bd8-1jh4-7a679ba33c0e', 'eece9714-f887-4bd8-1564-7a679ba33c0e', 'Nama Mesin', 'faHome', '/app/mesin/kategori', '2023-01-18 17:38:00.676', '2023-06-10 05:18:36.36', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('67c56e11-440e-4229-a1fe-3575ca214d84', 'f4c0c173-2d83-4501-ab53-117361a87ef0', 'PO suplier', 'faHome', NULL, '2023-01-18 17:38:00.701', '2023-06-10 05:18:36.36', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677992729', NULL, 'Hardness', 'faHome', NULL, '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.362', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 5);
INSERT INTO public.menu VALUES ('26col0d8-64d7-48c8-1252-47bcd5a7a0g6-1577662729', NULL, 'Master Item', 'faHome', '/app/item', '2023-01-18 17:38:00.676', '2023-06-10 05:18:36.363', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 8);
INSERT INTO public.menu VALUES ('87c100d8-64d7-4458-1252-47b875a7a0e6-1677992729', '88c100d8-64d7-4458-1252-47b875a7a0e6-1677992729', 'Data Parameter', 'faHome', '/app/parameter', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.358', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('ebce9714-f887-4bd8-1564-7a679ba33c0e', 'eece9714-f887-4bd8-1564-7a679ba33c0e', 'master mesin', 'faHome', '/app/mesin', '2023-01-18 17:38:00.676', '2023-06-10 05:18:36.361', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('f70be0d5-86cd-4cd0-81ca-42645230b305', '9ac9cafe-5507-458f-ae29-f2a01c9136f2', 'user', 'faHome', '/app/user', '2023-01-18 17:38:00.698', '2023-06-10 05:18:36.361', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('26c100d8-64d7-48c8-1252-47b875a7a0e6-1677992729', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677992729', 'Data Hardness', 'faHome', '/app/hardness', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.358', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('9ac9menu-5507-458f-ae30-f2a01c9136f2', NULL, 'Dashboard', 'faMapMarkedAlt', '/app', '2023-01-18 17:38:00.658', '2023-06-10 05:18:36.361', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e,26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729,039556db-fb53-46a4-0e1c-87eab77c4b0f-1677664761', 0);
INSERT INTO public.menu VALUES ('26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1698762729', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1699662729', 'Data Material', 'faHome', '/app/material', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.358', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('88c100d8-64d7-4458-1252-47b875a8k0e6-1677992729', '88c100d8-64d7-4458-1252-47b875a7a0e6-1677992729', 'Kategori Parameter', 'faHome', '/app/parameter/kategori', '2023-01-18 17:38:00.7', '2023-06-10 05:18:36.359', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);
INSERT INTO public.menu VALUES ('6980510f-69d0-4103-886f-8170e44f522c', '9ac9cafe-5507-458f-ae29-f2a01c9136f2', 'role', 'faArrowAltCircleLeft', '/app/user/role', '2023-01-18 17:38:00.697', '2023-06-10 05:18:36.361', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', -1);


--
-- Data for Name: mesin_kategori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.mesin_kategori VALUES ('230524a7b8', 'Bubut', '2023-05-23 17:15:01.769', '2023-05-23 17:15:01.769');
INSERT INTO public.mesin_kategori VALUES ('230521603b', 'Perubah Konveyor', '2023-05-21 02:24:46.417', '2023-05-25 01:14:46.855');
INSERT INTO public.mesin_kategori VALUES ('2305252e34', 'Pencacah', '2023-05-25 05:36:29.646', '2023-05-25 05:36:29.646');
INSERT INTO public.mesin_kategori VALUES ('230526209f', 'Udin', '2023-05-26 02:02:08.695', '2023-05-26 02:02:08.695');


--
-- Data for Name: mesin; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.mesin VALUES ('230524cdc3', 'sdfsdf', NULL, '2023-05-23 17:15:15.917', '2023-05-23 17:15:15.917', '230524a7b8');
INSERT INTO public.mesin VALUES ('230524532b', 'BBT01', NULL, '2023-05-23 10:15:20.563', '2023-05-28 05:21:47.553', '230524a7b8');
INSERT INTO public.mesin VALUES ('2305245268', 'BBT02', NULL, '2023-05-23 10:15:25.358', '2023-05-28 05:21:52.548', '230524a7b8');
INSERT INTO public.mesin VALUES ('230525116c', 'PCC01', NULL, '2023-05-24 22:36:37.712', '2023-05-28 05:22:01.996', '2305252e34');
INSERT INTO public.mesin VALUES ('230525c8c9', 'PCC02', NULL, '2023-05-24 22:36:49.741', '2023-05-28 05:22:07.058', '2305252e34');
INSERT INTO public.mesin VALUES ('2305263b73', '01', NULL, '2023-05-25 19:02:32.279', '2023-05-28 05:22:11.336', '230526209f');
INSERT INTO public.mesin VALUES ('230526df03', '02', NULL, '2023-05-25 19:02:15.805', '2023-05-28 05:22:15.438', '230526209f');
INSERT INTO public.mesin VALUES ('2305260118', '03', NULL, '2023-05-25 19:02:22.788', '2023-05-28 05:22:18.686', '230526209f');
INSERT INTO public.mesin VALUES ('230521243a', 'abcde', NULL, '2023-05-21 09:33:17.874', '2023-05-28 05:22:27.355', '230521603b');
INSERT INTO public.mesin VALUES ('23052182d5', 'fghijk', NULL, '2023-05-21 02:34:27.666', '2023-05-28 05:22:44.009', '230521603b');
INSERT INTO public.mesin VALUES ('230524d9fb', 'lmnop', NULL, '2023-05-23 03:15:11.402', '2023-05-28 05:22:50.557', '230521603b');
INSERT INTO public.mesin VALUES ('2305285d3b', 'PCC03', NULL, '2023-05-28 05:23:03.645', '2023-05-28 05:23:03.645', '2305252e34');
INSERT INTO public.mesin VALUES ('230528722c', 'BB03', NULL, '2023-05-28 05:23:12.187', '2023-05-28 05:23:12.187', '230524a7b8');


--
-- Data for Name: parameter_kategori; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.parameter_kategori VALUES ('1680343613-ed8a9e86-969a-4af9-182f-a463010df11e', 'p_kat', '2023-04-01 10:06:53.493', '2023-04-01 10:34:55.379');
INSERT INTO public.parameter_kategori VALUES ('1680550393-6c2fcf88-862b-45a4-1a39-5a90f37a4e5d', 'kat_p', '2023-04-03 19:33:13.265', '2023-04-03 19:33:13.265');
INSERT INTO public.parameter_kategori VALUES ('23051418068', 'Kategori Parameter', '2023-05-14 08:58:38.071', '2023-05-14 15:58:47.75');
INSERT INTO public.parameter_kategori VALUES ('23051582a8', 'QUENCHING', '2023-05-15 10:58:51.95', '2023-05-15 10:58:51.95');
INSERT INTO public.parameter_kategori VALUES ('230515a1f6', 'TEMPERING', '2023-05-15 10:59:00.815', '2023-05-15 10:59:00.815');
INSERT INTO public.parameter_kategori VALUES ('230516833e', 'CP', '2023-05-16 04:56:16.693', '2023-05-16 04:56:16.693');


--
-- Data for Name: parameter; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.parameter VALUES ('1680345288-b9363825-4442-4c6d-0d3c-bd7f0555d0f5', '1680343613-ed8a9e86-969a-4af9-182f-a463010df11e', 'p_1', '2023-04-01 10:34:48.88', '2023-04-01 10:35:24.093', NULL);
INSERT INTO public.parameter VALUES ('23051438265', '23051418068', 'Data Parameter', '2023-05-14 15:58:58.265', '2023-05-14 15:58:58.265', NULL);
INSERT INTO public.parameter VALUES ('230515da83', '23051418068', 'BATCH TYPE', '2023-05-15 08:51:07.274', '2023-05-15 08:51:07.274', NULL);
INSERT INTO public.parameter VALUES ('2305158962', '23051582a8', '860 X 60', '2023-05-15 10:59:20.857', '2023-05-15 10:59:20.857', NULL);
INSERT INTO public.parameter VALUES ('230515385f', '230515a1f6', '580 X 90''', '2023-05-15 10:59:36.85', '2023-05-15 10:59:36.85', NULL);
INSERT INTO public.parameter VALUES ('23051607fe', '23051582a8', '870X120''', '2023-05-16 04:56:58.627', '2023-05-16 04:56:58.627', NULL);
INSERT INTO public.parameter VALUES ('2305162e35', '230515a1f6', '500X60', '2023-05-16 04:57:16.978', '2023-05-16 04:57:16.978', NULL);
INSERT INTO public.parameter VALUES ('230516da98', '230516833e', '0.40', '2023-05-16 04:57:34.734', '2023-05-16 04:57:34.734', NULL);
INSERT INTO public.parameter VALUES ('2305189151', '230516833e', 'hj', '2023-05-18 07:00:34.429', '2023-05-18 07:00:34.429', 'jknjkh');


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.role VALUES ('26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 'admin', '2023-03-01 16:57:27', '2023-03-01 16:57:29');
INSERT INTO public.role VALUES ('039556db-fb53-46a4-0e1c-87eab77c4b0f-1677664761', 'user', '2023-03-01 09:59:24.863', '2023-03-01 09:59:21.01');
INSERT INTO public.role VALUES ('1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e', 'Finance', '2023-04-03 20:27:00.097', '2023-03-14 01:42:02.365');


--
-- Data for Name: user_pengguna; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_pengguna VALUES ('26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', 'admin@gmail.com', 'admin', 'admin', '2023-03-01 16:58:21', '2023-03-01 16:58:23', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729');
INSERT INTO public.user_pengguna VALUES ('1678516362-f8cf036e-f848-4779-394f-51c7836491c0', 'dsd', 'dsd', 'ddsd', '2023-03-11 06:32:42.725', '2023-03-11 06:32:42.725', '039556db-fb53-46a4-0e1c-87eab77c4b0f-1677664761');
INSERT INTO public.user_pengguna VALUES ('2d729f2d-5283-4e54-3313-8d4ab37a92ae-1677664788', 'user@gmail.com', 'new user', '12345678', '2023-03-01 09:59:48.185', '2023-03-11 07:20:25.028', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729');
INSERT INTO public.user_pengguna VALUES ('1678783341-93293c5b-7300-4051-2715-e9153a3bb689', 'finance@gmail.com', 'ahmadfinance', '123', '2023-03-14 08:42:21.408', '2023-03-14 08:44:20.209', '1678783322-68f730b9-3b9f-4ac3-a382-7733f4be577e');


--
-- Data for Name: user_login; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_login VALUES ('1679748892-91564ede-c909-4918-881a-9765f3d844b7', '26c100d8-64d7-48c8-1252-47bcd5a7a0e6-1677662729', '2023-04-25 12:54:52.62', '2023-03-25 12:54:52.632', '2023-03-25 12:54:52.632');
INSERT INTO public.user_login VALUES ('1679748940-c7193653-039a-4e9a-2985-6335b3f0b3c2', '2d729f2d-5283-4e54-3313-8d4ab37a92ae-1677664788', '2023-04-25 12:55:40.773', '2023-03-25 12:55:40.782', '2023-03-25 12:55:40.782');
INSERT INTO public.user_login VALUES ('1679748936-1a8b2493-016e-4084-82e8-cc2f12cafb27', '1678516362-f8cf036e-f848-4779-394f-51c7836491c0', '2023-04-28 14:54:12.456', '2023-03-25 12:55:36.127', '2023-03-28 14:54:12.468');
INSERT INTO public.user_login VALUES ('1679748900-c8838b60-27ea-4701-ba33-416605c5e7d6', '1678783341-93293c5b-7300-4051-2715-e9153a3bb689', '2023-04-28 15:10:31.828', '2023-03-25 12:55:00.516', '2023-03-28 15:10:31.833');


--
-- PostgreSQL database dump complete
--

