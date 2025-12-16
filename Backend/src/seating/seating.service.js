// Backend/src/seating/seating.service.js
import prisma from '../config/database.js';
import { getIO } from '../config/socket.js';
import { cache, CACHE_KEYS } from '../common/cache.service.js';

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
    // Try to get customer info from notes first (since queue entry is deleted after seating)
    let customerName = 'Walk-in';
    let customerPhone = 'N/A';
    
    if (s.notes) {
      try {
        const customerInfo = JSON.parse(s.notes);
        customerName = customerInfo.customerName || 'Walk-in';
        customerPhone = customerInfo.customerPhone || 'N/A';
      } catch (e) {
        // If notes parsing fails, try queue entry (for backward compatibility)
        customerName = s.queueEntry?.customer?.name || 'Walk-in';
        customerPhone = s.queueEntry?.customer?.phoneNumber || 'N/A';
      }
    } else {
      // Fallback to queue entry if notes don't exist
      customerName = s.queueEntry?.customer?.name || 'Walk-in';
      customerPhone = s.queueEntry?.customer?.phoneNumber || 'N/A';
    }
    
    return {
      id: s.id,
      tableNumber: `T${s.table.tableNumber}`,
      customerName,
      partySize: s.partySize,
      phone: customerPhone,
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
  
  // Save customer info to notes before deleting queue entry
  const customerInfo = JSON.stringify({
    customerId: queueEntry.customer.id,
    customerName: queueEntry.customer.name,
    customerPhone: queueEntry.customer.phoneNumber,
    entryTime: queueEntry.entryTime.toISOString(),
  });
  
  // Create seating session with customer info in notes
  const session = await prisma.seatingSession.create({
    data: {
      tableId,
      queueEntryId,
      partySize: queueEntry.partySize,
      assignedById: userId,
      notes: customerInfo, // Already stringified above
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
  
  // Invalidate cache and emit WebSocket events
  cache.delete(CACHE_KEYS.DASHBOARD_STATS);
  cache.delete(CACHE_KEYS.HOURLY_CHART);
  cache.invalidatePattern('tables:');
  
  try {
    const io = getIO();
    io.emit('seating:created', { sessionId: session.id });
    io.emit('table:statusChanged', { tableId, status: 'OCCUPIED' });
    io.emit('queue:removed', { id: queueEntryId });
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
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
  
  // Save customer info to notes before deleting queue entry
  const customerInfo = JSON.stringify({
    customerId: queueEntry.customer.id,
    customerName: queueEntry.customer.name,
    customerPhone: queueEntry.customer.phoneNumber,
    entryTime: queueEntry.entryTime.toISOString(),
  });
  
  // Create seating sessions for each table with customer info in notes
  const sessions = await Promise.all(
    tableIds.map(tableId =>
      prisma.seatingSession.create({
        data: {
          tableId,
          queueEntryId,
          partySize: queueEntry.partySize,
          assignedById: userId,
          notes: customerInfo,
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
  
  // Invalidate cache and emit WebSocket events
  cache.delete(CACHE_KEYS.DASHBOARD_STATS);
  cache.delete(CACHE_KEYS.HOURLY_CHART);
  cache.invalidatePattern('tables:');
  
  try {
    const io = getIO();
    io.emit('seating:created', { sessionIds: sessions.map(s => s.id) });
    tableIds.forEach(tableId => io.emit('table:statusChanged', { tableId, status: 'OCCUPIED' }));
    io.emit('queue:removed', { id: queueEntryId });
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
  return sessions;
};

export const endSeatingSession = async (sessionId) => {
  console.log('🔍 Attempting to end session:', sessionId);
  
  // Get the session with all details
  const session = await prisma.seatingSession.findUnique({
    where: { id: sessionId },
    include: { queueEntry: { include: { customer: true } }, table: true },
  });
  
  if (!session) {
    console.error('❌ Session not found:', sessionId);
    // Check if there are any sessions at all
    const allSessions = await prisma.seatingSession.findMany({ take: 5 });
    console.log('📋 Available sessions (first 5):', allSessions.map(s => ({ id: s.id, tableId: s.tableId })));
    throw new Error('Session not found');
  }
  
  if (session.endedAt) {
    console.log('⚠️ Session already ended:', sessionId);
    throw new Error('Session already ended');
  }
  
  console.log('✅ Session found:', { id: session.id, tableId: session.tableId, queueEntryId: session.queueEntryId });
  
  // Get customer info from notes (since queue entry was deleted)
  let customerInfo = { customerName: 'Walk-in', customerPhone: 'N/A', entryTime: session.seatedAt, customerId: null };
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
  const seatedTime = new Date(session.seatedAt);
  
  // Log for debugging
  console.log('⏰ Time calculation:', {
    arrivalTime: arrivalTime.toISOString(),
    seatedTime: seatedTime.toISOString(),
    endTime: endTime.toISOString(),
    waitMs: seatedTime - arrivalTime,
    dineMs: endTime - seatedTime,
  });
  
  // Calculate wait time (from arrival to seated) - ensure positive value and cap at reasonable max (e.g., 24 hours)
  const totalWait = Math.min(1440, Math.max(0, Math.round((seatedTime - arrivalTime) / 60000)));
  // Calculate dining time (from seated to checkout) - ensure positive value and cap at reasonable max (e.g., 12 hours)
  const dineTime = Math.min(720, Math.max(0, Math.round((endTime - seatedTime) / 60000)));
  
  // **CRITICAL FIX**: Only end THIS specific session, not all sessions for the customer
  // Update ONLY this session's endedAt timestamp
  const updatedSession = await prisma.seatingSession.update({
    where: { id: sessionId },
    data: { endedAt: endTime },
    include: { table: true },
  });
  
  // Update ONLY this table's status to AVAILABLE
  await prisma.table.update({
    where: { id: session.tableId },
    data: { status: 'AVAILABLE' },
  });
  
  console.log(`✅ Session ${sessionId} ended for table T${session.table.tableNumber}`);
  
  // Check if this was the LAST session for this customer (same queueEntryId)
  const remainingSessions = await prisma.seatingSession.findMany({
    where: { 
      queueEntryId: session.queueEntryId,
      endedAt: null, // Still active sessions
    },
  });
  
  console.log(`📊 Remaining active sessions for this customer: ${remainingSessions.length}`);
  
  // Only save to customer history when ALL sessions for this customer are ended
  if (remainingSessions.length === 0 && session.queueEntryId) {
    // Get all sessions for this customer (including the one we just ended)
    const allCustomerSessions = await prisma.seatingSession.findMany({
      where: { queueEntryId: session.queueEntryId },
      include: { table: true },
      orderBy: { seatedAt: 'asc' },
    });
    
    // Combine table numbers from all sessions
    const tableNumbers = allCustomerSessions.map(s => `T${s.table.tableNumber}`).join(', ');
    
    // Check if we already saved history for this exact seating session
    const existingHistory = await prisma.customerHistory.findFirst({
      where: {
        customerName: customerInfo.customerName,
        seatedTime: seatedTime,
        partySize: session.partySize,
      },
    });
    
    if (!existingHistory) {
      // Save to customer history
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
      console.log(`✅ Customer history saved for ${customerInfo.customerName} (party of ${session.partySize}) at tables: ${tableNumbers}`);
    } else {
      console.log(`⚠️ Customer history already exists for ${customerInfo.customerName} at ${seatedTime.toISOString()}, skipping duplicate`);
    }
  } else {
    console.log(`⏳ Not saving history yet - customer still has ${remainingSessions.length} active sessions`);
  }
  
  // Invalidate cache and emit WebSocket events
  cache.delete(CACHE_KEYS.DASHBOARD_STATS);
  cache.delete(CACHE_KEYS.HOURLY_CHART);
  cache.invalidatePattern('tables:');
  
  try {
    const io = getIO();
    io.emit('seating:ended', { sessionId, tableId: session.tableId });
    io.emit('table:statusChanged', { tableId: session.tableId, status: 'AVAILABLE' });
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
  return updatedSession;
};

export const endAllSeatingSessionsForCustomer = async (sessionId) => {
  console.log('🔍 Attempting to end ALL sessions for customer via session:', sessionId);
  
  // Get the session to find the customer
  const session = await prisma.seatingSession.findUnique({
    where: { id: sessionId },
    include: { queueEntry: { include: { customer: true } }, table: true },
  });
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  if (!session.queueEntryId) {
    // This is a walk-in or single session, just end this one
    return await endSeatingSession(sessionId);
  }
  
  // Get customer info from notes
  let customerInfo = { customerName: 'Walk-in', customerPhone: 'N/A', entryTime: session.seatedAt, customerId: null };
  if (session.notes) {
    try {
      customerInfo = JSON.parse(session.notes);
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Find ALL active sessions for this customer
  const allSessions = await prisma.seatingSession.findMany({
    where: { 
      queueEntryId: session.queueEntryId,
      endedAt: null, // Only active sessions
    },
    include: { table: true },
  });
  
  console.log(`📊 Found ${allSessions.length} active sessions for customer ${customerInfo.customerName}:`, 
    allSessions.map(s => ({ id: s.id, tableNumber: s.table.tableNumber })));
  
  if (allSessions.length === 0) {
    throw new Error('No active sessions found for this customer');
  }
  
  // Calculate times
  const endTime = new Date();
  const arrivalTime = new Date(customerInfo.entryTime);
  const seatedTime = new Date(session.seatedAt);
  
  // Calculate wait and dining times
  const totalWait = Math.min(1440, Math.max(0, Math.round((seatedTime - arrivalTime) / 60000)));
  const dineTime = Math.min(720, Math.max(0, Math.round((endTime - seatedTime) / 60000)));
  
  // End all sessions atomically
  const sessionIds = allSessions.map(s => s.id);
  const tableIds = allSessions.map(s => s.tableId);
  
  // Update all sessions to ended
  await prisma.seatingSession.updateMany({
    where: { id: { in: sessionIds } },
    data: { endedAt: endTime },
  });
  
  // Update all table statuses to AVAILABLE
  await prisma.table.updateMany({
    where: { id: { in: tableIds } },
    data: { status: 'AVAILABLE' },
  });
  
  // Combine table numbers for history
  const tableNumbers = allSessions.map(s => `T${s.table.tableNumber}`).join(', ');
  
  // Save to customer history
  const existingHistory = await prisma.customerHistory.findFirst({
    where: {
      customerName: customerInfo.customerName,
      seatedTime: seatedTime,
      partySize: session.partySize,
    },
  });
  
  if (!existingHistory) {
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
    console.log(`✅ Customer history saved for ${customerInfo.customerName} (party of ${session.partySize}) at tables: ${tableNumbers}`);
  }
  
  console.log(`✅ Ended ${sessionIds.length} sessions for ${customerInfo.customerName} at tables: ${tableNumbers}`);
  
  // Invalidate cache and emit WebSocket events
  cache.delete(CACHE_KEYS.DASHBOARD_STATS);
  cache.delete(CACHE_KEYS.HOURLY_CHART);
  cache.invalidatePattern('tables:');
  
  try {
    const io = getIO();
    io.emit('seating:ended', { sessionIds, tableIds });
    tableIds.forEach(tableId => io.emit('table:statusChanged', { tableId, status: 'AVAILABLE' }));
  } catch (error) {
    console.error('WebSocket emit error:', error);
  }
  
  return { sessionIds, tableIds, customerName: customerInfo.customerName };
};
