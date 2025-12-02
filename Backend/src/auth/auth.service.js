// Backend/src/auth/auth.service.js
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { jwtHelpers } from '../middleware/auth.middleware.js';

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    const { email, password, name, role = 'WAITER' } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { token, refreshToken } = jwtHelpers.generateTokens(user);

    return {
      user,
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { token, refreshToken } = jwtHelpers.generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwtHelpers.verify(refreshToken);

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwtHelpers.sign(payload, process.env.JWT_EXPIRES_IN);

      return { token };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get current user
   */
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();
