const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data (optional, but good for "recreating" data)
  // Be careful with this in production!
  // await prisma.worksheetItem.deleteMany({});
  // await prisma.worksheet.deleteMany({});
  // await prisma.pengujianItem.deleteMany({});
  // await prisma.pengujian.deleteMany({});
  // await prisma.orderItem.deleteMany({});
  // await prisma.order.deleteMany({});
  // await prisma.parameterPeralatan.deleteMany({});
  // await prisma.parameter.deleteMany({});
  // await prisma.jenisPengujian.deleteMany({});
  // await prisma.cluster.deleteMany({});
  // await prisma.peralatan.deleteMany({});
  // await prisma.pegawai.deleteMany({});
  // await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tepiank3.com' },
    update: {},
    create: {
      email: 'admin@tepiank3.com',
      firstname: 'Admin',
      fullname: 'Administrator',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create test user
  const userPassword = await bcrypt.hash(process.env.DEFAULT_USER_PASSWORD || 'user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@tepiank3.com' },
    update: {},
    create: {
      email: 'user@tepiank3.com',
      firstname: 'User',
      fullname: 'Test User',
      password: userPassword,
      role: 'USER',
      company: 'PT. Contoh Sejahtera',
      address: 'Jl. Sudirman No. 123, Jakarta',
      phone: '081234567890'
    }
  });

  // 1. Clusters
  const clusters = [
    { name: 'Faktor Fisik', description: 'Pengujian faktor fisik lingkungan kerja', icon: 'icon-fisik.svg' },
    { name: 'Faktor Kimia', description: 'Pengujian faktor kimia udara dan material', icon: 'icon-kimia.svg' },
    { name: 'Emisi', description: 'Pengujian emisi sumber tidak bergerak dan bergerak', icon: 'icon-emisi.svg' },
    { name: 'Biologi', description: 'Pengujian faktor biologi', icon: 'icon-biologi.svg' },
    { name: 'Kesehatan Kerja', description: 'Pemeriksaan kesehatan kerja', icon: 'icon-kesehatan.svg' },
    { name: 'KUDR', description: 'Kualitas Udara Dalam Ruangan', icon: 'icon-kudr.svg' },
    { name: 'Pengujian Lainnya', description: 'Pengujian teknis lainnya', icon: 'icon-lainnya.svg' }
  ];

  const clusterMap = {};
  for (const c of clusters) {
    const created = await prisma.cluster.upsert({
      where: { name: c.name },
      update: { description: c.description, icon: c.icon },
      create: c
    });
    clusterMap[c.name] = created;
  }

  // 2. Jenis Pengujian
  const jenisData = [
    // Faktor Fisik
    { name: 'Kebisingan', cluster: 'Faktor Fisik' },
    { name: 'Pencahayaan', cluster: 'Faktor Fisik' },
    { name: 'Iklim Kerja Panas', cluster: 'Faktor Fisik' },
    { name: 'Iklim Kerja Dingin', cluster: 'Faktor Fisik' },
    { name: 'Getaran', cluster: 'Faktor Fisik' },
    { name: 'Radiasi UV', cluster: 'Faktor Fisik' },
    { name: 'Gelombang Elektromagnetik (EMF)', cluster: 'Faktor Fisik' },
    // Faktor Kimia
    { name: 'Debu', cluster: 'Faktor Kimia' },
    { name: 'Gas', cluster: 'Faktor Kimia' },
    { name: 'Hidrocarbon', cluster: 'Faktor Kimia' },
    // Emisi
    { name: 'Emisi Kendaraan', cluster: 'Emisi' },
    { name: 'Emisi Genset', cluster: 'Emisi' },
    { name: 'Emisi Boiler', cluster: 'Emisi' },
    // Biologi
    { name: 'Mikrobiologi Udara', cluster: 'Biologi' },
    // Kesehatan Kerja
    { name: 'Pemeriksaan Kesehatan Kerja', cluster: 'Kesehatan Kerja' },
    // KUDR
    { name: 'Kualitas Udara Dalam Ruangan (KUDR)', cluster: 'KUDR' },
    // Lainnya
    { name: 'Pengujian Lainnya', cluster: 'Pengujian Lainnya' }
  ];

  const jenisMap = {};
  for (const j of jenisData) {
    const created = await prisma.jenisPengujian.upsert({
      where: {
        name_clusterId: {
          name: j.name,
          clusterId: clusterMap[j.cluster].id
        }
      },
      update: {},
      create: {
        name: j.name,
        clusterId: clusterMap[j.cluster].id
      }
    });
    jenisMap[j.name] = created;
  }

  // 3. Parameters
  const parameterData = [
    // Kebisingan
    { name: 'Sesaat (ambient)', satuan: 'dBA', acuan: 'Direct Reading', harga: 50000, jenis: 'Kebisingan' },
    { name: 'Kebisingan 24 jam', satuan: 'dBA', acuan: 'SNI 8427:2017', harga: 350000, jenis: 'Kebisingan' },
    { name: 'Lingkungan kerja', satuan: 'dBA', acuan: 'SNI 7231:2009', harga: 50000, jenis: 'Kebisingan' },
    { name: 'Personal', satuan: 'dBA', acuan: 'Direct Reading', harga: 350000, jenis: 'Kebisingan' },
    { name: 'Noise Contour', satuan: 'm²', acuan: 'Direct Reading', harga: 10000, jenis: 'Kebisingan' },
    // Pencahayaan
    { name: 'Umum', satuan: 'Lux', acuan: 'SNI 7062:2019, Ralat.1:2020', harga: 200000, jenis: 'Pencahayaan' },
    { name: 'Lokal', satuan: 'Lux', acuan: 'SNI 7062:2019, Ralat.1:2020', harga: 50000, jenis: 'Pencahayaan' },
    // Iklim Kerja
    { name: 'Iklim Kerja Panas (ISBB)', satuan: '°C', acuan: 'SNI 7061:2019', harga: 75000, jenis: 'Iklim Kerja Panas' },
    { name: 'Iklim Kerja Dingin', satuan: '°C', acuan: 'SNI 7061:2019', harga: 75000, jenis: 'Iklim Kerja Dingin' },
    // Getaran
    { name: 'Getaran Seluruh Tubuh', satuan: 'm/s²', acuan: 'SNI 7186:2021', harga: 100000, jenis: 'Getaran' },
    { name: 'Getaran Lengan dan Tangan', satuan: 'm/s²', acuan: 'SNI 7054:2019', harga: 100000, jenis: 'Getaran' },
    { name: 'Getaran Mekanik', satuan: 'mm/s', acuan: 'Kepmen LH No 49 Tahun 1996', harga: 125000, jenis: 'Getaran' },
    // Radiasi UV
    { name: 'Radiasi UV', satuan: 'mW/cm²', acuan: 'SNI 7060:2004', harga: 100000, jenis: 'Radiasi UV' },
    // EMF
    { name: 'Gelombang Elektromagnetik (EMF)', satuan: 'G/T', acuan: 'Direct Reading', harga: 100000, jenis: 'Gelombang Elektromagnetik (EMF)' },
    // Debu
    { name: 'Debu Udara ambient (TSP)', satuan: 'µg/Nm³', acuan: '19-7119.3-2017', harga: 1250000, jenis: 'Debu' },
    { name: 'Debu Total/ Inhalabel lingker', satuan: 'mg/m³', acuan: 'SNI 16-7058-2004', harga: 450000, jenis: 'Debu' },
    { name: 'Debu Respirabel (Personal)', satuan: 'mg/m³', acuan: 'SNI 7325:2009', harga: 450000, jenis: 'Debu' },
    { name: 'PM 10', satuan: 'µg/Nm³', acuan: 'High Volume Air Sampling', harga: 1250000, jenis: 'Debu' },
    { name: 'PM 2,5', satuan: 'µg/Nm³', acuan: 'High Volume Air Sampling', harga: 1250000, jenis: 'Debu' },
    { name: 'Pb', satuan: 'µg/Nm³', acuan: 'SNI 19-7119.4-2005', harga: 1250000, jenis: 'Debu' },
    // Gas
    { name: 'CO', satuan: 'µg/Nm³', acuan: 'Iodin Pentoksida', harga: 150000, jenis: 'Gas' },
    { name: 'NO2', satuan: 'µg/Nm³', acuan: 'SNI 7119-2:2017', harga: 150000, jenis: 'Gas' },
    { name: 'SO2', satuan: 'µg/Nm³', acuan: 'SNI 7119-7:2017', harga: 150000, jenis: 'Gas' },
    { name: 'O3', satuan: 'µg/Nm³', acuan: 'SNI 7119-8:2017', harga: 150000, jenis: 'Gas' },
    { name: 'NH3', satuan: 'ppm', acuan: 'SNI 19.7119.1-2005', harga: 150000, jenis: 'Gas' },
    { name: 'H2S', satuan: 'ppm', acuan: 'WI-M/7.2.9/ BK3-SMD', harga: 150000, jenis: 'Gas' },
    // Hidrocarbon
    { name: 'HC Total', satuan: 'µg/Nm³', acuan: 'SNI 7119.13-2009', harga: 250000, jenis: 'Hidrocarbon' },
    { name: 'Benzene', satuan: 'ppm', acuan: 'NIOSH 1501', harga: 250000, jenis: 'Hidrocarbon' },
    { name: 'Toluene', satuan: 'ppm', acuan: 'NIOSH 1501', harga: 250000, jenis: 'Hidrocarbon' },
    { name: 'Xylene', satuan: 'ppm', acuan: 'NIOSH 1501', harga: 250000, jenis: 'Hidrocarbon' },
    // Emisi Kendaraan
    { name: 'Opasitas (Kendaraan)', satuan: '%', acuan: 'Direct Reading', harga: 350000, jenis: 'Emisi Kendaraan' },
    { name: 'HC (Kendaraan)', satuan: 'ppm', acuan: 'Direct Reading', harga: 350000, jenis: 'Emisi Kendaraan' },
    { name: 'CO (Kendaraan)', satuan: '%', acuan: 'Direct Reading', harga: 350000, jenis: 'Emisi Kendaraan' },
    // Emisi Genset
    { name: 'CO (Genset)', satuan: 'mg/Nm³', acuan: 'Iodin Pentoksida', harga: 350000, jenis: 'Emisi Genset' },
    { name: 'NOx (Genset)', satuan: 'mg/Nm³', acuan: 'SNI 7119-2:2017', harga: 350000, jenis: 'Emisi Genset' },
    { name: 'SOx (Genset)', satuan: 'mg/Nm³', acuan: 'SNI 7119-7:2017', harga: 350000, jenis: 'Emisi Genset' },
    { name: 'Partikulat (Genset)', satuan: 'mg/Nm³', acuan: 'SNI 19.7117.12-2005', harga: 350000, jenis: 'Emisi Genset' },
    { name: 'Opasitas (Genset)', satuan: '%', acuan: 'SNI 19.7117.11-2005', harga: 350000, jenis: 'Emisi Genset' },
    // Emisi Boiler
    { name: 'CO (Boiler)', satuan: 'mg/Nm³', acuan: 'Iodin Pentoksida', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'NOx (Boiler)', satuan: 'mg/Nm³', acuan: 'SNI 7119-2:2017', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'SOx (Boiler)', satuan: 'mg/Nm³', acuan: 'SNI 7119-7.2017', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'NH3 (Boiler)', satuan: 'mg/Nm³', acuan: 'SNI 19.7119.1-2005', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'Cl2', satuan: 'mg/Nm³', acuan: 'Spectrophotome-try', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'H2S (Boiler)', satuan: 'mg/Nm³', acuan: 'IKM/5.4.9/BK3-SMR', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'Partikulat (Boiler)', satuan: 'mg/Nm³', acuan: 'SNI 19.7117.12-2005', harga: 350000, jenis: 'Emisi Boiler' },
    { name: 'Opasitas (Boiler)', satuan: '%', acuan: 'SNI 19.7117.11-2005', harga: 350000, jenis: 'Emisi Boiler' },
    // Mikrobiologi
    { name: 'Bakteri', satuan: 'CFU/m³', acuan: 'Impaction Agar Plate', harga: 500000, jenis: 'Mikrobiologi Udara' },
    { name: 'Jamur', satuan: 'CFU/m³', acuan: 'Impaction Agar Plate', harga: 500000, jenis: 'Mikrobiologi Udara' },
    // Kesehatan Kerja
    { name: 'Ergonomi', satuan: '-', acuan: 'SNI 9011:2021', harga: 250000, jenis: 'Pemeriksaan Kesehatan Kerja' },
    { name: 'Kelelahan', satuan: 'ms', acuan: 'Respon Rangsang Cahaya/Suara', harga: 50000, jenis: 'Pemeriksaan Kesehatan Kerja' },
    { name: 'Audiometri', satuan: 'dB', acuan: 'SNI IEC 60645 -1 : 2017', harga: 100000, jenis: 'Pemeriksaan Kesehatan Kerja' },
    { name: 'Spirometri', satuan: '%', acuan: 'SNI 8850 2019', harga: 150000, jenis: 'Pemeriksaan Kesehatan Kerja' },
    { name: 'Cholinesterase', satuan: 'U/L', acuan: 'Semi kuantitatif', harga: 150000, jenis: 'Pemeriksaan Kesehatan Kerja' },
    { name: 'Kalori makanan/ Gizi Kerja', satuan: 'Kkal', acuan: 'Kuantitatif', harga: 150000, jenis: 'Pemeriksaan Kesehatan Kerja' },
    // KUDR
    { name: 'CO (KUDR)', satuan: 'ppm', acuan: 'Direct Reading', harga: 150000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    { name: 'CO2 (KUDR)', satuan: 'ppm', acuan: 'Direct Reading', harga: 150000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    { name: 'NO2 (KUDR)', satuan: 'ppm', acuan: 'Direct Reading', harga: 150000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    { name: 'HCHO (Formaldehid)', satuan: 'ppm', acuan: 'Direct Reading', harga: 250000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    { name: 'TVOC', satuan: 'ppm', acuan: 'Direct Reading', harga: 250000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    { name: 'PM 10 Respirable', satuan: 'µg/m³', acuan: 'Direct Reading', harga: 150000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    { name: 'Ozon (O3) KUDR', satuan: 'ppm', acuan: 'Direct Reading', harga: 150000, jenis: 'Kualitas Udara Dalam Ruangan (KUDR)' },
    // Lainnya
    { name: 'Psikologi Organisasi (Kuesioner SDS)', satuan: 'orang', acuan: 'Kuesioner', harga: 150000, jenis: 'Pengujian Lainnya' },
    { name: 'Uji Pembumian (Grounding)', satuan: 'titik', acuan: 'Standar PUIL', harga: 250000, jenis: 'Pengujian Lainnya' },
    { name: 'Sanitasi', satuan: 'gedung', acuan: 'Permenkes', harga: 500000, jenis: 'Pengujian Lainnya' }
  ];

  const parameterMap = {};
  for (const p of parameterData) {
    const created = await prisma.parameter.upsert({
      where: {
        name_jenisPengujianId: {
          name: p.name,
          jenisPengujianId: jenisMap[p.jenis].id
        }
      },
      update: { satuan: p.satuan, acuan: p.acuan, harga: p.harga },
      create: {
        name: p.name,
        satuan: p.satuan,
        acuan: p.acuan,
        harga: p.harga,
        jenisPengujianId: jenisMap[p.jenis].id
      }
    });
    parameterMap[p.name] = created;
  }

  // 4. Peralatan
  const peralatanData = [
    { name: 'Sound Level Meter', description: 'Untuk kebisingan', status: 'AVAILABLE', nomorAlat: 'SLM-01', lokasiPenyimpanan: 'Lab Fisik', waktuPengadaan: new Date('2023-01-15') },
    { name: 'Lux Meter', description: 'Untuk pencahayaan', status: 'AVAILABLE', nomorAlat: 'LUX-01', lokasiPenyimpanan: 'Lab Fisik', waktuPengadaan: new Date('2023-02-20') },
    { name: 'WBGT Meter', description: 'Untuk iklim kerja', status: 'AVAILABLE', nomorAlat: 'WBGT-01', lokasiPenyimpanan: 'Lab Fisik', waktuPengadaan: new Date('2023-03-10') },
    { name: 'Vibration Meter', description: 'Untuk getaran', status: 'AVAILABLE', nomorAlat: 'VIB-01', lokasiPenyimpanan: 'Lab Fisik', waktuPengadaan: new Date('2023-04-05') },
    { name: 'UV Radiometer', description: 'Untuk radiasi UV', status: 'AVAILABLE', nomorAlat: 'UV-01', lokasiPenyimpanan: 'Lab Fisik', waktuPengadaan: new Date('2023-05-12') },
    { name: 'EMF Meter', description: 'Untuk gelombang elektromagnetik', status: 'AVAILABLE', nomorAlat: 'EMF-01', lokasiPenyimpanan: 'Lab Fisik', waktuPengadaan: new Date('2023-06-01') },
    { name: 'High Volume Air Sampler (HVAS)', description: 'Untuk debu PM10/PM2.5', status: 'AVAILABLE', nomorAlat: 'HVAS-01', lokasiPenyimpanan: 'Lab Kimia', waktuPengadaan: new Date('2023-06-15') },
    { name: 'Personal Dust Sampler', description: 'Untuk debu personal', status: 'AVAILABLE', nomorAlat: 'PDS-01', lokasiPenyimpanan: 'Lab Kimia', waktuPengadaan: new Date('2023-07-01') },
    { name: 'Gas Analyzer', description: 'Untuk gas direct reading', status: 'AVAILABLE', nomorAlat: 'GAS-01', lokasiPenyimpanan: 'Lab Kimia', waktuPengadaan: new Date('2023-07-20') },
    { name: 'Impaction Air Sampler', description: 'Untuk mikrobiologi udara', status: 'AVAILABLE', nomorAlat: 'IAS-01', lokasiPenyimpanan: 'Lab Biologi', waktuPengadaan: new Date('2023-08-05') },
    { name: 'Audiometer', description: 'Untuk tes pendengaran', status: 'AVAILABLE', nomorAlat: 'AUD-01', lokasiPenyimpanan: 'Klinik', waktuPengadaan: new Date('2023-08-25') },
    { name: 'Spirometer', description: 'Untuk fungsi paru', status: 'AVAILABLE', nomorAlat: 'SPI-01', lokasiPenyimpanan: 'Klinik', waktuPengadaan: new Date('2023-09-10') },
    { name: 'Reaction Timer', description: 'Untuk kelelahan kerja', status: 'AVAILABLE', nomorAlat: 'RT-01', lokasiPenyimpanan: 'Klinik', waktuPengadaan: new Date('2023-09-25') },
    { name: 'Earth Tester', description: 'Untuk grounding', status: 'AVAILABLE', nomorAlat: 'ET-01', lokasiPenyimpanan: 'Teknik', waktuPengadaan: new Date('2023-10-05') },
    { name: 'Spectrophotometer', description: 'Untuk analisis kimia lab', status: 'AVAILABLE', nomorAlat: 'SPEC-01', lokasiPenyimpanan: 'Lab Kimia', waktuPengadaan: new Date('2023-10-20') }
  ];

  const peralatanMap = {};
  for (const alat of peralatanData) {
    const created = await prisma.peralatan.upsert({
      where: { name: alat.name },
      update: { description: alat.description, status: alat.status, nomorAlat: alat.nomorAlat, lokasiPenyimpanan: alat.lokasiPenyimpanan, waktuPengadaan: alat.waktuPengadaan },
      create: alat
    });
    peralatanMap[alat.name] = created;
  }

  // 5. Pegawai
  const pegawaiData = [
    { nama: 'Budi Santoso', jabatan: 'Kepala Laboratorium', status: 'SIAP' },
    { nama: 'Siti Nurhaliza', jabatan: 'Analis Senior', status: 'SIAP' },
    { nama: 'Ahmad Ridho', jabatan: 'Analis', status: 'SPT' },
    { nama: 'Rina Wijaya', jabatan: 'Analis', status: 'SIAP' },
    { nama: 'Doni Hermawan', jabatan: 'Teknisi', status: 'STANDBY' },
    { nama: 'Lina Kusuma', jabatan: 'Staf Admin', status: 'SIAP' },
    { nama: 'Hendra Wijaya', jabatan: 'Teknisi Kalibrasi', status: 'CUTI' },
    { nama: 'Maya Putri', jabatan: 'Analis', status: 'SIAP' },
    { nama: 'Raden Suryanto', jabatan: 'Kepala Divisi', status: 'SIAP' },
    { nama: 'Dewi Lestari', jabatan: 'Analis Senior', status: 'SPT' }
  ];

  const pegawaiMap = {};
  for (const pegawai of pegawaiData) {
    const created = await prisma.pegawai.upsert({
      where: { nama: pegawai.nama },
      update: { jabatan: pegawai.jabatan, status: pegawai.status },
      create: pegawai
    });
    pegawaiMap[pegawai.nama] = created;
  }

  // 6. Parameter Peralatan Mapping
  const paramPeralatanMapping = [
    { param: 'Sesaat (ambient)', alat: 'Sound Level Meter' },
    { param: 'Kebisingan 24 jam', alat: 'Sound Level Meter' },
    { param: 'Lingkungan kerja', alat: 'Sound Level Meter' },
    { param: 'Umum', alat: 'Lux Meter' },
    { param: 'Lokal', alat: 'Lux Meter' },
    { param: 'Iklim Kerja Panas (ISBB)', alat: 'WBGT Meter' },
    { param: 'Iklim Kerja Dingin', alat: 'WBGT Meter' },
    { param: 'Getaran Seluruh Tubuh', alat: 'Vibration Meter' },
    { param: 'Getaran Lengan dan Tangan', alat: 'Vibration Meter' },
    { param: 'Radiasi UV', alat: 'UV Radiometer' },
    { param: 'Gelombang Elektromagnetik (EMF)', alat: 'EMF Meter' },
    { param: 'Debu Udara ambient (TSP)', alat: 'High Volume Air Sampler (HVAS)' },
    { param: 'Debu Respirabel (Personal)', alat: 'Personal Dust Sampler' },
    { param: 'CO', alat: 'Gas Analyzer' },
    { param: 'NO2', alat: 'Gas Analyzer' },
    { param: 'SO2', alat: 'Gas Analyzer' },
    { param: 'Bakteri', alat: 'Impaction Air Sampler' },
    { param: 'Jamur', alat: 'Impaction Air Sampler' },
    { param: 'Audiometri', alat: 'Audiometer' },
    { param: 'Spirometri', alat: 'Spirometer' },
    { param: 'Kelelahan', alat: 'Reaction Timer' },
    { param: 'Uji Pembumian (Grounding)', alat: 'Earth Tester' },
    { param: 'Cl2', alat: 'Spectrophotometer' }
  ];

  for (const mapping of paramPeralatanMapping) {
    const param = parameterMap[mapping.param];
    const alat = peralatanMap[mapping.alat];
    if (param && alat) {
      await prisma.parameterPeralatan.upsert({
        where: {
          parameterId_peralatanId: {
            parameterId: param.id,
            peralatanId: alat.id
          }
        },
        update: {},
        create: {
          parameterId: param.id,
          peralatanId: alat.id,
          quantity: 1
        }
      });
    }
  }

  // 7. Transaction Data (Order, Pengujian, Worksheet)

  // Create an Order
  const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`;
  const order = await prisma.order.upsert({
    where: { orderNumber: orderNumber },
    update: {},
    create: {
      orderNumber: orderNumber,
      userId: user.id,
      status: 'CONFIRMED',
      totalAmount: 500000,
      company: user.company,
      address: user.address,
      contactPerson: user.fullname,
      phone: user.phone,
      paymentStatus: 'PAID',
      persetujuanStatus: 'APPROVED'
    }
  });

  // Create Order Items
  const orderParams = ['Sesaat (ambient)', 'Umum', 'Iklim Kerja Panas (ISBB)'];
  for (const paramName of orderParams) {
    const param = parameterMap[paramName];
    if (param) {
      await prisma.orderItem.upsert({
        where: {
          orderId_parameterId_location: {
            orderId: order.id,
            parameterId: param.id,
            location: 'Titik 1'
          }
        },
        update: {},
        create: {
          orderId: order.id,
          parameterId: param.id,
          quantity: 1,
          price: param.harga,
          subtotal: param.harga,
          location: 'Titik 1'
        }
      });
    }
  }

  // Create Pengujian linked to Order
  const nomorPengujian = `TEST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`;
  const pengujian = await prisma.pengujian.upsert({
    where: { nomorPengujian: nomorPengujian },
    update: {},
    create: {
      nomorPengujian: nomorPengujian,
      userId: user.id,
      jenisPengujianId: jenisMap['Kebisingan'].id, // Main category
      status: 'IN_PROGRESS',
      totalAmount: 500000,
      tanggalPengujian: new Date(),
      lokasi: 'Area Produksi',
      namaPerusahaan: user.company,
      alamatPerusahaan: user.address,
      orderId: order.id
    }
  });

  // Create Pengujian Items
  for (const paramName of orderParams) {
    const param = parameterMap[paramName];
    if (param) {
      await prisma.pengujianItem.upsert({
        where: {
          pengujianId_parameterId_location: {
            pengujianId: pengujian.id,
            parameterId: param.id,
            location: 'Titik 1'
          }
        },
        update: {},
        create: {
          pengujianId: pengujian.id,
          parameterId: param.id,
          quantity: 1,
          price: param.harga,
          subtotal: param.harga,
          location: 'Titik 1'
        }
      });
    }
  }

  // Create Worksheet linked to Pengujian
  const nomorWorksheet = `WS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`;
  const worksheet = await prisma.worksheet.upsert({
    where: { nomorWorksheet: nomorWorksheet },
    update: {},
    create: {
      nomorWorksheet: nomorWorksheet,
      pengujianId: pengujian.id,
      userId: user.id,
      status: 'IN_PROGRESS',
      tanggalMulai: new Date(),
      pegawaiUtama: pegawaiMap['Budi Santoso'].id,
      pegawaiPendamping: pegawaiMap['Doni Hermawan'].id
    }
  });

  // Create Worksheet Items
  for (const paramName of orderParams) {
    const param = parameterMap[paramName];
    if (param) {
      await prisma.worksheetItem.upsert({
        where: {
          worksheetId_parameterId_location: {
            worksheetId: worksheet.id,
            parameterId: param.id,
            location: 'Titik 1'
          }
        },
        update: {},
        create: {
          worksheetId: worksheet.id,
          parameterId: param.id,
          quantity: 1,
          location: 'Titik 1',
          isReady: true
        }
      });
    }
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });