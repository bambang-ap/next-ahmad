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



NOTE: 
  SPPB IN
    name -> nomor surat jalan
    add tgl_surat_jalan
    after select po, show all items, user can edit qty

NOTE: hapus selection nomor po pada saat sudah close sppb in