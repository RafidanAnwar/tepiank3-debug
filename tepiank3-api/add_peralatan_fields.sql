-- Add additional fields to peralatan table
ALTER TABLE peralatan 
ADD COLUMN merk VARCHAR(255),
ADD COLUMN tipe VARCHAR(255),
ADD COLUMN nomor_seri VARCHAR(255),
ADD COLUMN kode_bmn VARCHAR(255),
ADD COLUMN nup VARCHAR(255),
ADD COLUMN lokasi_penyimpanan VARCHAR(255),
ADD COLUMN tanggal_kalibrasi DATE,
ADD COLUMN koreksi VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX idx_peralatan_merk ON peralatan(merk);
CREATE INDEX idx_peralatan_tipe ON peralatan(tipe);
CREATE INDEX idx_peralatan_nomor_seri ON peralatan(nomor_seri);
CREATE INDEX idx_peralatan_kode_bmn ON peralatan(kode_bmn);
CREATE INDEX idx_peralatan_lokasi ON peralatan(lokasi_penyimpanan);