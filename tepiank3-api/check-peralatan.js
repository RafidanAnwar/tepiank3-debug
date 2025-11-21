const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPeralatanData() {
  try {
    console.log('Checking existing peralatan data...');
    
    const peralatan = await prisma.peralatan.findMany();
    console.log('Found peralatan records:', peralatan.length);
    
    peralatan.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Name: ${item.name}`);
    });
    
  } catch (error) {
    console.error('Error checking peralatan data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPeralatanData();