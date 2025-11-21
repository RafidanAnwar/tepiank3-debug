const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePeralatanData() {
  try {
    console.log('Updating peralatan data with waktuPengadaan...');

    // Update existing records with waktuPengadaan
    const updates = [
      { id: 6, waktuPengadaan: new Date('2023-01-15') },
      { id: 7, waktuPengadaan: new Date('2023-02-20') },
      { id: 8, waktuPengadaan: new Date('2023-03-10') },
      { id: 9, waktuPengadaan: new Date('2023-04-05') },
      { id: 10, waktuPengadaan: new Date('2023-05-12') }
    ];

    for (const update of updates) {
      await prisma.peralatan.update({
        where: { id: update.id },
        data: { waktuPengadaan: update.waktuPengadaan }
      });
      console.log(`Updated peralatan ID ${update.id} with waktuPengadaan`);
    }

    console.log('✅ All peralatan records updated successfully!');
  } catch (error) {
    console.error('❌ Error updating peralatan data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePeralatanData();