const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

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
      role: 'USER'
    }
  });

  const clusters = [
    {
      name: 'Lingkungan Kerja',
      description: 'Pengujian kualitas udara dan kebisingan',
      icon: 'icon-claster-lingkunagn-kerja-select.svg'
    },
    {
      name: 'Keselamatan Kerja',
      description: 'Audit alat pelindung dan SOP keselamatan',
      icon: 'icon-claster-keselamatan-kerja-select.svg'
    },
    {
      name: 'Kesehatan Kerja',
      description: 'Pemeriksaan kesehatan tenaga kerja',
      icon: 'icon-claster-kesehatan-kerja-select.svg'
    }
  ];

  const clusterMap = {};
  for (const cluster of clusters) {
    const created = await prisma.cluster.upsert({
      where: { name: cluster.name },
      update: {
        description: cluster.description,
        icon: cluster.icon
      },
      create: cluster
    });
    clusterMap[cluster.name] = created;
  }

  const jenisData = [
    {
      name: 'Pengukuran Kebisingan',
      description: 'Monitoring tingkat kebisingan area kerja',
      clusterName: 'Lingkungan Kerja'
    },
    {
      name: 'Pengukuran Kualitas Udara',
      description: 'Parameter O2, CO, CO2, SO2, H2S',
      clusterName: 'Lingkungan Kerja'
    },
    {
      name: 'Inspeksi APD',
      description: 'Pengecekan kelayakan APD',
      clusterName: 'Keselamatan Kerja'
    },
    {
      name: 'Pemeriksaan Kesehatan Umum',
      description: 'Pemeriksaan fisik rutin karyawan',
      clusterName: 'Kesehatan Kerja'
    }
  ];

  const jenisMap = {};
  for (const jenis of jenisData) {
    const created = await prisma.jenisPengujian.upsert({
      where: {
        name_clusterId: {
          name: jenis.name,
          clusterId: clusterMap[jenis.clusterName].id
        }
      },
      update: {
        description: jenis.description
      },
      create: {
        name: jenis.name,
        description: jenis.description,
        clusterId: clusterMap[jenis.clusterName].id
      }
    });
    jenisMap[jenis.name] = created;
  }

  const parameterData = [
    { name: 'Noise Level (dBA)', satuan: 'dBA', acuan: 'Permenaker 05/2018', harga: 250000, jenis: 'Pengukuran Kebisingan' },
    { name: 'Vibrasi Tangan', satuan: 'm/s²', acuan: 'Permenaker 05/2018', harga: 300000, jenis: 'Pengukuran Kebisingan' },
    { name: 'Oksigen (O₂)', satuan: '%', acuan: 'Permenaker 05/2018', harga: 200000, jenis: 'Pengukuran Kualitas Udara' },
    { name: 'Karbon Monoksida (CO)', satuan: 'ppm', acuan: 'Permenaker 05/2018', harga: 220000, jenis: 'Pengukuran Kualitas Udara' },
    { name: 'Karbon Dioksida (CO₂)', satuan: 'ppm', acuan: 'Permenaker 05/2018', harga: 220000, jenis: 'Pengukuran Kualitas Udara' },
    { name: 'Helm Safety', satuan: 'unit', acuan: 'Standar SNI', harga: 180000, jenis: 'Inspeksi APD' },
    { name: 'Safety Shoes', satuan: 'unit', acuan: 'Standar SNI', harga: 200000, jenis: 'Inspeksi APD' },
    { name: 'Pemeriksaan Tekanan Darah', satuan: 'mmHg', acuan: 'Standar WHO', harga: 150000, jenis: 'Pemeriksaan Kesehatan Umum' },
    { name: 'Pemeriksaan Kadar Gula Darah', satuan: 'mg/dL', acuan: 'Standar WHO', harga: 170000, jenis: 'Pemeriksaan Kesehatan Umum' }
  ];

  for (const param of parameterData) {
    await prisma.parameter.upsert({
      where: {
        name_jenisPengujianId: {
          name: param.name,
          jenisPengujianId: jenisMap[param.jenis].id
        }
      },
      update: {
        satuan: param.satuan,
        acuan: param.acuan,
        harga: param.harga
      },
      create: {
        name: param.name,
        satuan: param.satuan,
        acuan: param.acuan,
        harga: param.harga,
        jenisPengujianId: jenisMap[param.jenis].id
      }
    });
  }

  const peralatanData = [
    {
      name: 'Sound Level Meter',
      description: 'Alat pengukur tingkat kebisingan',
      status: 'AVAILABLE',
      nomorAlat: 'SLM-001',
      lokasiPenyimpanan: 'Lab Lingkungan'
    },
    {
      name: 'Vibration Meter',
      description: 'Alat pengukur vibrasi tangan',
      status: 'AVAILABLE',
      nomorAlat: 'VBM-009',
      lokasiPenyimpanan: 'Lab Lingkungan'
    },
    {
      name: 'Gas Analyzer',
      description: 'Alat analisa gas multi parameter',
      status: 'IN_USE',
      nomorAlat: 'GAS-210',
      lokasiPenyimpanan: 'Lab Lingkungan'
    },
    {
      name: 'APD Inspection Kit',
      description: 'Perangkat inspeksi APD',
      status: 'AVAILABLE',
      nomorAlat: 'APD-015',
      lokasiPenyimpanan: 'Gudang APD'
    },
    {
      name: 'Tensimeter Digital',
      description: 'Alat ukur tekanan darah',
      status: 'MAINTENANCE',
      nomorAlat: 'MED-050',
      lokasiPenyimpanan: 'Klinik K3'
    }
  ];

  for (const alat of peralatanData) {
    await prisma.peralatan.upsert({
      where: { name: alat.name },
      update: {
        description: alat.description,
        status: alat.status,
        nomorAlat: alat.nomorAlat,
        lokasiPenyimpanan: alat.lokasiPenyimpanan
      },
      create: alat
    });
  }

  // Seed Pegawai data
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

  for (const pegawai of pegawaiData) {
    await prisma.pegawai.upsert({
      where: { nama: pegawai.nama },
      update: {
        jabatan: pegawai.jabatan,
        status: pegawai.status
      },
      create: pegawai
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('👤 Admin user: admin@tepiank3.com / admin123');
  console.log('👤 Test user: user@tepiank3.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });