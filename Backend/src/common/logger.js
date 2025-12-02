// Backend/src/common/logger.js
import prisma from '../config/database.js';

/**
 * Log user activity
 */
export const logAction = async (userId, action, entityType, entityId = null, details = null, req = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req?.ip || req?.connection?.remoteAddress || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

/**
 * Log queue event
 */
export const logQueueEvent = async (userId, queueId, action, details = null, req = null) => {
  return logAction(userId, action, 'QueueEntry', queueId, details, req);
};

/**
 * Log table event
 */
export const logTableEvent = async (userId, tableId, action, details = null, req = null) => {
  return logAction(userId, action, 'Table', tableId, details, req);
};

/**
 * Log reservation event
 */
export const logReservationEvent = async (userId, reservationId, action, details = null, req = null) => {
  return logAction(userId, action, 'Reservation', reservationId, details, req);
};

/**
 * Log seating event
 */
export const logSeatingEvent = async (userId, sessionId, action, details = null, req = null) => {
  return logAction(userId, action, 'SeatingSession', sessionId, details, req);
};
