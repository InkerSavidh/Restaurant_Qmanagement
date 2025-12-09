// Backend/src/queue/allocator.service.js
import prisma from '../config/database.js';
import { seatCustomer, seatCustomerMultipleTables } from '../seating/seating.service.js';

/**
 * Automatic table allocation algorithm
 * Matches waiting customers with available tables based on party size
 */
export const runAllocator = async (userId = 'system') => {
  console.log('🤖 Running table allocator...');
  
  // Get all waiting customers in order
  const queueEntries = await prisma.queueEntry.findMany({
    where: { status: 'WAITING' },
    include: { customer: true },
    orderBy: { position: 'asc' },
  });
  
  if (queueEntries.length === 0) {
    console.log('📭 No customers in queue');
    return { allocated: 0, message: 'No customers in queue' };
  }
  
  // Get all available tables
  const availableTables = await prisma.table.findMany({
    where: { status: 'AVAILABLE', isActive: true },
    orderBy: { capacity: 'asc' },
  });
  
  if (availableTables.length === 0) {
    console.log('🚫 No available tables');
    return { allocated: 0, message: 'No available tables' };
  }
  
  let allocatedCount = 0;
  const usedTableIds = new Set();
  
  // Try to allocate tables for each customer in order
  for (const entry of queueEntries) {
    const partySize = entry.partySize;
    
    // Get available tables that haven't been used yet
    const remainingTables = availableTables.filter(t => !usedTableIds.has(t.id));
    
    if (remainingTables.length === 0) {
      console.log('⚠️ No more tables available');
      break;
    }
    
    // Try to find a single table that fits
    const singleTable = remainingTables.find(t => t.capacity >= partySize);
    
    if (singleTable) {
      // Allocate single table
      try {
        await seatCustomer(entry.id, singleTable.id, userId);
        usedTableIds.add(singleTable.id);
        allocatedCount++;
        console.log(`✅ Allocated ${entry.customer.name} (party of ${partySize}) to table ${singleTable.tableNumber}`);
      } catch (error) {
        console.error(`❌ Failed to allocate ${entry.customer.name}:`, error.message);
      }
    } else {
      // Try to find combination of tables
      const tableCombination = findTableCombination(remainingTables, partySize);
      
      if (tableCombination.length > 0) {
        try {
          await seatCustomerMultipleTables(entry.id, tableCombination.map(t => t.id), userId);
          tableCombination.forEach(t => usedTableIds.add(t.id));
          allocatedCount++;
          console.log(`✅ Allocated ${entry.customer.name} (party of ${partySize}) to tables ${tableCombination.map(t => t.tableNumber).join(', ')}`);
        } catch (error) {
          console.error(`❌ Failed to allocate ${entry.customer.name}:`, error.message);
        }
      } else {
        console.log(`⚠️ No suitable table(s) for ${entry.customer.name} (party of ${partySize})`);
      }
    }
  }
  
  console.log(`🎯 Allocator completed: ${allocatedCount} customers seated`);
  return { 
    allocated: allocatedCount, 
    message: `Successfully allocated ${allocatedCount} customer(s)` 
  };
};

/**
 * Find combination of tables that can accommodate party size
 * Simple greedy algorithm: try to use smallest tables first
 */
function findTableCombination(tables, partySize) {
  // Sort tables by capacity (smallest first)
  const sortedTables = [...tables].sort((a, b) => a.capacity - b.capacity);
  
  const combination = [];
  let totalCapacity = 0;
  
  for (const table of sortedTables) {
    if (totalCapacity >= partySize) {
      break;
    }
    combination.push(table);
    totalCapacity += table.capacity;
    
    // Limit to 3 tables max for practical reasons
    if (combination.length >= 3) {
      break;
    }
  }
  
  // Only return if we have enough capacity
  return totalCapacity >= partySize ? combination : [];
}

// Auto-allocator state (in-memory for now)
let autoAllocatorEnabled = false;
let autoAllocatorInterval = null;

export const toggleAutoAllocator = (enabled) => {
  autoAllocatorEnabled = enabled;
  
  if (enabled) {
    // Run allocator every 30 seconds
    if (!autoAllocatorInterval) {
      console.log('🤖 Auto-allocator ENABLED (runs every 30 seconds)');
      autoAllocatorInterval = setInterval(() => {
        runAllocator('auto-allocator').catch(err => {
          console.error('Auto-allocator error:', err);
        });
      }, 30000);
    }
  } else {
    // Stop auto-allocator
    if (autoAllocatorInterval) {
      console.log('🛑 Auto-allocator DISABLED');
      clearInterval(autoAllocatorInterval);
      autoAllocatorInterval = null;
    }
  }
  
  return { enabled: autoAllocatorEnabled };
};

export const getAutoAllocatorStatus = () => {
  return { enabled: autoAllocatorEnabled };
};
