// Backend/src/waiters/waiters.service.js
import prisma from '../config/database.js';
import bcrypt from 'bcrypt';

export const getWaiters = async () => {
  const users = await prisma.user.findMany({
    where: { role: 'WAITER', isActive: true },
    select: { id: true, email: true, name: true },
  });
  
  return users.map(u => ({
    id: u.id,
    username: u.email,
    name: u.name,
  }));
};

export const createWaiter = async (data) => {
  const { username, password } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: username,
      password: hashedPassword,
      name: username.split('@')[0],
      role: 'WAITER',
    },
    select: { id: true, email: true, name: true },
  });
  
  return { id: user.id, username: user.email, name: user.name };
};

export const updateWaiter = async (id, data) => {
  const updateData = {};
  if (data.username) updateData.email = data.username;
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true },
  });
  
  return { id: user.id, username: user.email, name: user.name };
};

export const deleteWaiter = async (id) => {
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
  return { success: true };
};
