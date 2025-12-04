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
  
  return sessions.map(s => {
    // Try to get customer info from notes if queue entry was deleted
    let customerName = 'Walk-in';
    let phone = 'N/A';
    
    if (s.queueEntry?.customer) {
      customerName = s.queueEntry.customer.name;
      phone = s.queueEntry.customer.phoneNumber || 'N/A';
    } else if (s.notes) {
      try {
        const customerInfo = JSON.parse(s.notes);
        customerName = customerInfo.customerName || 'Walk-in';
        phone = customerInfo.customerPhone || 'N/A';
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    return {
      id: s.id,
      tableNumber: `T${s.table.tableNumber}`,
      customerName,
      partySize: s.partySize,
      phone,
      seatedAt: s.seatedAt.toISOString(),
    };
  });
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
  
  // Store customer info before deleting queue entry
  const customerInfo = {
    customerId: queueEntry.customerId,
    customerName: queueEntry.customer.name,
    customerPhone: queueEntry.customer.phoneNumber,
    entryTime: queueEntry.entryTime,
  };
  
  // Create seating session with customer info
  const session = await prisma.seatingSession.create({
    data: {
      tableId,
      queueEntryId,
      partySize: queueEntry.partySize,
      assignedById: userId,
      notes: JSON.stringify(customerInfo), // Store customer info in notes
    },
  });
  
  // Delete queue entry (customer is now seated)
  await prisma.queueEntry.delete({
    where: { id: queueEntryId },
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
  
  // Store customer info before deleting queue entry
  const customerInfo = {
    customerId: queueEntry.customerId,
    customerName: queueEntry.customer.name,
    customerPhone: queueEntry.customer.phoneNumber,
    entryTime: queueEntry.entryTime,
  };
  
  // Create seating sessions for each table with customer info
  const sessions = await Promise.all(
    tableIds.map(tableId =>
      prisma.seatingSession.create({
        data: {
          tableId,
          queueEntryId,
          partySize: queueEntry.partySize,
          assignedById: userId,
          notes: JSON.stringify(customerInfo), // Store customer info in notes
        },
      })
    )
  );
  
  // Delete queue entry (customer is now seated)
  await prisma.queueEntry.delete({
    where: { id: queueEntryId },
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
  // Get the session to find the queue entry
  const session = await prisma.seatingSession.findUnique({
    where: { id: sessionId },
    include: { queueEntry: true, table: true },
  });
  
  if (!session) throw new Error('Session not found');
  
  // Find ALL sessions for this queue entry (in case of multiple tables)
  const allSessions = await prisma.seatingSession.findMany({
    where: {
      queueEntryId: session.queueEntryId,
      endedAt: null,
    },
    include: { table: true },
  });
  
  // Get customer info from notes
  let customerInfo = { customerName: 'Walk-in', customerPhone: 'N/A', entryTime: session.seatedAt };
  if (session.notes) {
    try {
      customerInfo = JSON.parse(session.notes);
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Calculate times
  const endTime = new Date();
  const arrivalTime = new Date(customerInfo.entryTime);
  const seatedTime = session.seatedAt;
  const totalWait = Math.round((seatedTime - arrivalTime) / 60000);
  const dineTime = Math.round((endTime - seatedTime) / 60000);
  
  // Combine table numbers
  const tableNumbers = allSessions.map(s => `T${s.table.tableNumber}`).join(', ');
  
  // Create customer history record
  await prisma.customerHistory.create({
    data: {
      customerId: customerInfo.customerId,
      customerName: customerInfo.customerName,
      customerPhone: customerInfo.customerPhone || null,
      partySize: session.partySize,
      tableNumbers,
      arrivalTime,
      seatedTime,
      departedTime: endTime,
      totalWaitTime: totalWait,
      totalDiningTime: dineTime,
    },
  });
  
  // Update all table statuses to AVAILABLE
  const tableIds = allSessions.map(s => s.tableId);
  await prisma.table.updateMany({
    where: { id: { in: tableIds } },
    data: { status: 'AVAILABLE' },
  });
  
  // Delete all sessions for this customer
  await prisma.seatingSession.deleteMany({
    where: {
      queueEntryId: session.queueEntryId,
    },
  });
  
  return session;
};
