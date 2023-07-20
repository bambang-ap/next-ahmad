join sequelize:

```typescript
  OrmKategoriMesin.hasMany(OrmMasterItem, {foreignKey: "id"});
  OrmMasterItem.belongsTo(OrmKategoriMesin, {foreignKey: "kategori_mesin"});

  const {count, rows} = await OrmMasterItem.findAndCountAll({
    limit,
    order: [["id", "asc"]],
    offset: (page - 1) * limit,
    where: wherePages([""], search),
    include: [OrmKategoriMesin],
  });
```

```sql



pg_dump -U postgres --schema-only manajemen > schema.sql

pg_dump --insert --data-only -U postgres -d manajemen \
-t customer \
-t document_number \
-t hardness \
-t hardness_kategori \
-t instruksi_kanban \
-t kendaraan \
-t material \
-t material_kategori \
-t material_kategori \
-t menu \
-t mesin \
-t mesin_kategori \
-t parameter \
-t parameter_kategori \
-t role \
-t user_pengguna \
-t user_login > data.sql

```

- Master Mesin -> Dianggap kategori (select distinct by name)
- Master Item -> Adopsi existing Kanban bagian mesin
- Master PO
	- Select item dari master item
	- Selain Nama Item & Kode Item, harga qty dll input manual
- Kanban
	- Tambah nomor kanban (generated e.x. KNB/IMI/001)
	- Tampilkan data di table hanya yg ada di table tersebut
	- Jika ingin melihat detail, bisa preview (jadi select join dll bisa efisien)
	- Input & Edit Bisa select nomor mesin

# Module Inventory Production
- master menu
  - List menu
- master user
  - Role 
    - Add role
    - List role
      - Assign menu viewer
  - User 
    - crud user (based on role)
    - list user
      - generate qr
- Mesin produksi
- menu master customer
  - crud customer (based on role)
  - list customer
    - import
    - export
- menu master PO customer
  - crud data PO
  - list data PO (based on customer ID)
    - filter by fieldName / search
    - detail PO
      - tracking
      - print / export pdf
  - menu DO customer (1 PO can store multiple DO)
    - crud data DO customer
    - list data DO (must have id PO)
- menu master kanban
  - crud kanban
  - list kanban
    - generate barcode
- menu intruksi kanban
  - crud data instuksi kanban
- menu master stock produksi
  - filter
    - customer
    - PO / DO
    - status
    - mesin produksi
- menu DO
  - Crud DO
- Global
  - Master Inventory (Role : Admin Inventory, Master Admin)
  - Stock Inventory
    - Barang masuk
    - Barang keluar
  - Suplier
    - List Suplier
  - PO suplier
    - Input PO Suplier
    - List PO
    - DO Suplier
- Report master (Dashboard) (based on user role)

- Scan data dari item masih kosong



NOTE: 
  SPPB IN
    name -> nomor surat jalan
    add tgl_surat_jalan
    after select po, show all items, user can edit qty

NOTE: hapus selection nomor po pada saat sudah close sppb in

NOTE: buat printout kanban
        Nama Customer
        No PO
        NO SPPB IN
        item code
        nama_item
        qty
        intruksi_kanban
        data mesin

- Design Kanban Printout
- Export yg bisa di export

- pas scan produksi dan scan fg, jika qty item yg dikirim ke QC kurang dari jumlah planing -> rubah data qty di item kanban supaya bisa dibuat ulang kanban dg item tsb
- pas scan qc, item qty reject masuk ke table reject item