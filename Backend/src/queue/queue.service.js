// Backend/src/queue/queue.service.js
import prisma from '../config/database.js';

export const getQueueList = async () => {
  const entries = await prisma.queueEntry.findMany({
    where: { status: 'WAITING' },
    include: { customer: true },
    orderBy: { position: 'asc' },
  });
  
  return entries.map(entry => ({
    id: entry.id,
    customerName: entry.customer.name,
    partySize: entry.partySize,
    phone: entry.customer.phoneNumber?.startsWith('walk-in-') ? 'N/A' : (entry.customer.phoneNumber || 'N/A'),
    waitTime: entry.estimatedWaitMinutes,
    position: entry.position,
    entryTime: entry.entryTime.toISOString(),
    status: entry.status,
  }));
};

export const getNextInQueue = async () => {
  const entry = await prisma.queueEntry.findFirst({
    where: { status: 'WAITING' },
    include: { customer: true },
    orderBy: { position: 'asc' },
  });
  
  if (!entry) return null;
  
  return {
    id: entry.id,
    customerName: entry.customer.name,
    partySize: entry.partySize,
    phone: entry.customer.phoneNumber?.startsWith('walk-in-') ? 'N/A' : (entry.customer.phoneNumber || 'N/A'),
    waitTime: entry.estimatedWaitMinutes,
    position: entry.position,
  };
};

export const addToQueue = async (data) => {
  const { name, partySize, phone } = data;
  
  // Always create a new customer for each queue entry
  const customer = await prisma.customer.create({
    data: { 
      name, 
      phoneNumber: phone && phone.trim() ? phone : null 
    },
  });
  
  // Get next position
  const lastEntry = await prisma.queueEntry.findFirst({
    where: { status: 'WAITING' },
    orderBy: { position: 'desc' },
  });
  const position = (lastEntry?.position || 0) + 1;
  
  // Calculate wait time (simple: 15 min per party ahead)
  const estimatedWaitMinutes = position * 15;
  
  const entry = await prisma.queueEntry.create({
    data: {
      customerId: customer.id,
      partySize,
      position,
      estimatedWaitMinutes,
    },
    include: { customer: true },
  });
  
  return entry;
};

export const removeFromQueue = async (queueId) => {
  console.log('📝 Service: Updating queue entry to CANCELLED:', queueId);
  const entry = await prisma.queueEntry.update({
    where: { id: queueId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
  
  console.log('📝 Service: Entry cancelled, updating positions for entries after position:', entry.position);
  // Update positions for remaining entries
  await prisma.queueEntry.updateMany({
    where: { status: 'WAITING', position: { gt: entry.position } },
    data: { position: { decrement: 1 } },
  });
  
  console.log('✅ Service: Queue entry removed successfully');
  return entry;
};
