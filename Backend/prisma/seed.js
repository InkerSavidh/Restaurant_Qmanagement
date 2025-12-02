// Backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create waiter user
  const waiterPassword = await bcrypt.hash('waiter123', 10);
  
  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@restaurant.com' },
    update: {},
    create: {
      email: 'waiter@restaurant.com',
      password: waiterPassword,
      name: 'Waiter User',
      role: 'WAITER',
    },
  });

  console.log('✅ Waiter user created:', waiter.email);

  // Create floors
  const groundFloor = await prisma.floor.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Ground Floor',
      displayOrder: 1,
    },
  });

  const firstFloor = await prisma.floor.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'First Floor',
      displayOrder: 2,
    },
  });

  const terrace = await prisma.floor.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      name: 'Terrace',
      displayOrder: 3,
    },
  });

  console.log('✅ Floors created');

  // Create tables for Ground Floor
  const tables = [
    { tableNumber: '1', capacity: 2, floorId: '1', status: 'AVAILABLE' },
    { tableNumber: '2', capacity: 4, floorId: '1', status: 'OCCUPIED' },
    { tableNumber: '3', capacity: 4, floorId: '1', status: 'AVAILABLE' },
    { tableNumber: '4', capacity: 6, floorId: '1', status: 'RESERVED' },
    { tableNumber: '5', capacity: 2, floorId: '1', status: 'CLEANING' },
    { tableNumber: '6', capacity: 8, floorId: '1', status: 'AVAILABLE' },
    // First Floor
    { tableNumber: '1', capacity: 2, floorId: '2', status: 'AVAILABLE' },
    { tableNumber: '2', capacity: 4, floorId: '2', status: 'AVAILABLE' },
    { tableNumber: '3', capacity: 4, floorId: '2', status: 'OCCUPIED' },
    { tableNumber: '4', capacity: 6, floorId: '2', status: 'AVAILABLE' },
    // Terrace
    { tableNumber: '1', capacity: 4, floorId: '3', status: 'AVAILABLE' },
    { tableNumber: '2', capacity: 4, floorId: '3', status: 'AVAILABLE' },
    { tableNumber: '3', capacity: 6, floorId: '3', status: 'AVAILABLE' },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: {
        tableNumber_floorId: {
          tableNumber: table.tableNumber,
          floorId: table.floorId,
        },
      },
      update: {},
      create: table,
    });
  }

  console.log('✅ Tables created');

  // Create sample waiters
  const waiters = [
    { name: 'John Doe', phoneNumber: '+1234567890', email: 'john@restaurant.com' },
    { name: 'Jane Smith', phoneNumber: '+1234567891', email: 'jane@restaurant.com' },
  ];

  for (const waiterData of waiters) {
    await prisma.waiter.create({
      data: waiterData,
    });
  }

  console.log('✅ Waiters created');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
