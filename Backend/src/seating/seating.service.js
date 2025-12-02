// Backend/src/seating/seating.service.js
import prisma from '../config/database.js';

export const getActiveSeating = async () => {
  const sessions = await prisma.seatingSession.findMany({
    where: { endedAt: null },
    include: {
      table: true,
      queueEntry: { include: { customer: true } },
    },
    orderBy: { seatedAt: 'desc' },
  });
  
  return sessions.map(s => ({
    id: s.id,
    tableNumber: `T${s.table.tableNumber}`,
    customerName: s.queueEntry?.customer?.name || 'Walk-in',
    partySize: s.partySize,
    phone: s.queueEntry?.customer?.phoneNumber || 'N/A',
    seatedAt: s.seatedAt.toISOString(),
  }));
};

export const seatCustomer = async (queueEntryId, tableId, userId) => {
  const queueEntry = await prisma.queueEntry.findUnique({
    where: { id: queueEntryId },
    include: { customer: true },
  });
  
  if (!queueEntry) throw new Error('Queue entry not found');
  
  // Get table and validate capacity
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });
  
  if (!table) throw new Error('Table not found');
  if (table.status !== 'AVAILABLE') throw new Error('Table is not available');
  if (table.capacity < queueEntry.partySize) {
    throw new Error(`Table capacity (${table.capacity}) is less than party size (${queueEntry.partySize})`);
  }
  
  // Create seating session
  const session = await prisma.seatingSession.create({
    data: {
      tableId,
      queueEntryId,
      partySize: queueEntry.partySize,
      assignedById: userId,
    },
  });
  
  // Update queue entry status
  await prisma.queueEntry.update({
    where: { id: queueEntryId },
    data: { status: 'SEATED', seatedAt: new Date() },
  });
  
  // Update table status
  await prisma.table.update({
    where: { id: tableId },
    data: { status: 'OCCUPIED' },
  });
  
  // Update positions for remaining queue entries
  await prisma.queueEntry.updateMany({
    where: { status: 'WAITING', position: { gt: queueEntry.position } },
    data: { position: { decrement: 1 } },
  });
  
  return session;
};

export const seatCustomerMultipleTables = async (queueEntryId, tableIds, userId) => {
  const queueEntry = await prisma.queueEntry.findUnique({
    where: { id: queueEntryId },
    include: { customer: true },
  });
  
  if (!queueEntry) throw new Error('Queue entry not found');
  
  // Get all tables and validate
  const tables = await prisma.table.findMany({
    where: { id: { in: tableIds } },
  });
  
  if (tables.length !== tableIds.length) throw new Error('One or more tables not found');
  
  const unavailableTables = tables.filter(t => t.status !== 'AVAILABLE');
  if (unavailableTables.length > 0) {
    throw new Error(`Tables ${unavailableTables.map(t => t.tableNumber).join(', ')} are not available`);
  }
  
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  if (totalCapacity < queueEntry.partySize) {
    throw new Error(`Total capacity (${totalCapacity}) is less than party size (${queueEntry.partySize})`);
  }
  
  // Create seating sessions for each table
  const sessions = await Promise.all(
    tableIds.map(tableId =>
      prisma.seatingSession.create({
        data: {
          tableId,
          queueEntryId,
          partySize: queueEntry.partySize,
          assignedById: userId,
        },
      })
    )
  );
  
  // Update queue entry status
  await prisma.queueEntry.update({
    where: { id: queueEntryId },
    data: { status: 'SEATED', seatedAt: new Date() },
  });
  
  // Update all table statuses
  await prisma.table.updateMany({
    where: { id: { in: tableIds } },
    data: { status: 'OCCUPIED' },
  });
  
  // Update positions for remaining queue entries
  await prisma.queueEntry.updateMany({
    where: { status: 'WAITING', position: { gt: queueEntry.position } },
    data: { position: { decrement: 1 } },
  });
  
  return sessions;
};

export const endSeatingSession = async (sessionId) => {
  const session = await prisma.seatingSession.update({
    where: { id: sessionId },
    data: { endedAt: new Date() },
    include: { table: true },
  });
  
  // Update table status
  await prisma.table.update({
    where: { id: session.tableId },
    data: { status: 'AVAILABLE' },
  });
  
  return session;
};
