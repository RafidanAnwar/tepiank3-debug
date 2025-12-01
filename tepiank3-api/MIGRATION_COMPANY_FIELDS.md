# Migration: Tambah Field Perusahaan ke Pengujian

## Deskripsi
Menambahkan field perusahaan/instansi ke model Pengujian untuk menyimpan data yang diinputkan dari halaman pengajuan layanan pengujian.

## Langkah-langkah

### 1. Update Prisma Schema
Schema sudah diupdate di `prisma/schema.prisma` dengan menambahkan field berikut ke model Pengujian:
- namaPerusahaan
- jenisKegiatan
- alamatPerusahaan
- jmlTenagaKerjaPria
- jmlTenagaKerjaWanita
- provinsi
- kota
- fasilitasKesehatan
- kecamatan
- kelurahan
- namaPenanggungJawab
- emailPerusahaan
- noHpPenanggungJawab
- statusWlkp
- emailPenanggungJawab
- nomorWlkp

### 2. Jalankan Prisma Migration
```bash
cd tepiank3-api
npx prisma migrate dev --name add_company_fields
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

## SQL Manual (Jika diperlukan)
Jika migration otomatis tidak bekerja, jalankan SQL berikut:

```sql
ALTER TABLE "pengujian" ADD COLUMN "nama_perusahaan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "jenis_kegiatan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "alamat_perusahaan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "jml_tenaga_kerja_pria" INTEGER;
ALTER TABLE "pengujian" ADD COLUMN "jml_tenaga_kerja_wanita" INTEGER;
ALTER TABLE "pengujian" ADD COLUMN "provinsi" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "kota" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "fasilitas_kesehatan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "kecamatan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "kelurahan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "nama_penanggung_jawab" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "email_perusahaan" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "no_hp_penanggung_jawab" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "status_wlkp" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "email_penanggung_jawab" TEXT;
ALTER TABLE "pengujian" ADD COLUMN "nomor_wlkp" TEXT;
```

## File yang Diubah
- `tepiank3-api/prisma/schema.prisma` - Update model Pengujian
- `tepiank3-api/routes/pengujian.js` - Update endpoint POST untuk menerima data perusahaan
- `tepiank3-app/src/services/pengajuanService.js` - Service baru untuk pengajuan
- `tepiank3-app/src/components/DaftarPengajuan.jsx` - Halaman daftar pengajuan
- `tepiank3-app/src/components/Pengujian.jsx` - Update untuk menyimpan data perusahaan

## Testing
1. Buka halaman pengajuan layanan pengujian
2. Isi semua field data perusahaan
3. Klik "Simpan & Lanjutkan"
4. Buka halaman "Daftar Pengajuan"
5. Verifikasi data perusahaan ditampilkan dengan benar
