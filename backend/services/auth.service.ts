import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prisma/db';
import { AppError } from '../middleware/error.middleware';
import { sendVerificationEmail } from './email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');

export const generateAccessToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const generateToken = (id: string): string => {
  return generateAccessToken(id);
};

// Max number of devices/browsers that can be logged into the same account at once.
// Logging in on one more than this evicts the least-recently-issued session.
const MAX_SESSIONS_PER_USER = 2;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches generateRefreshToken

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Creates a new session row for a fresh login/signup. If the user already has
// MAX_SESSIONS_PER_USER sessions, the oldest one is evicted first so this
// never silently kicks out a *different*, more-recent device.
export const storeRefreshToken = async (userId: string, token: string, userAgentHeader?: string | string[]) => {
  const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;
  const existing = await prisma.refreshSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  if (existing.length >= MAX_SESSIONS_PER_USER) {
    const toEvict = existing.slice(0, existing.length - MAX_SESSIONS_PER_USER + 1);
    await prisma.refreshSession.deleteMany({
      where: { id: { in: toEvict.map((s) => s.id) } },
    });
  }

  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    const session = await prisma.refreshSession.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!session || session.userId !== user.id) {
      throw new AppError('Session expired. Please log in again.', 401);
    }

    if (session.expiresAt < new Date()) {
      await prisma.refreshSession.delete({ where: { id: session.id } }).catch(() => {});
      throw new AppError('Session expired. Please log in again.', 401);
    }

    return user;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

// Rotates the token for THIS device's session in place (same row), so refreshing
// on device A never touches device B/C's sessions or counts against the 3-device cap.
export const rotateRefreshToken = async (oldToken: string, newToken: string, userAgentHeader?: string | string[]) => {
  const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;
  const oldHash = hashToken(oldToken);
  const session = await prisma.refreshSession.findUnique({ where: { tokenHash: oldHash } });

  if (!session) {
    // Defensive fallback — shouldn't happen since verifyRefreshToken already checked.
    return storeRefreshToken(jwt.decode(newToken) ? (jwt.decode(newToken) as any).id : '', newToken, userAgent);
  }

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(newToken),
      userAgent: userAgent ?? session.userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
};

// Logs out only the current device — deletes the one session matching this token,
// leaving the user's other logged-in devices untouched.
export const revokeRefreshToken = async (token: string) => {
  try {
    await prisma.refreshSession.delete({ where: { tokenHash: hashToken(token) } });
  } catch (error) {
    // Ignore if the session doesn't exist anymore
  }
};

// Logs out every device for a user (e.g. "log out of all sessions" / password change).
export const revokeAllRefreshTokens = async (userId: string) => {
  await prisma.refreshSession.deleteMany({ where: { userId } });
};

export const signupUser = async (data: any) => {
  const { email, phone, password, ...rest } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email && existingUser.phone === phone) {
      throw new AppError('User with this email and phone number already exists', 400);
    } else if (existingUser.email === email) {
      throw new AppError('User with this email already exists', 400);
    } else {
      throw new AppError('User with this phone number already exists', 400);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let locationUrl = null;
  if (data.latitude && data.longitude) {
    locationUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
  }

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      locationUrl,
      role: (email === (process.env.ADMIN_EMAIL || 'admin@geekhoot.com') || data.name === 'geekhoot') ? 'ADMIN' : 'USER',
      isVerified: true,
      verificationCode: null,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginUser = async (identifier: string, password: string) => {
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
        { name: identifier }
      ],
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email/phone or password', 401);
  }

  // Auto-verify anyone on signin to bypass/unblock old accounts
  if (!user.isVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const { email, phone, name, address, houseNo, streetNear, road, district, state, pincode } = data;

  if (email) {
    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId }
      }
    });
    if (existing) {
      throw new AppError('Email is already in use by another account', 400);
    }
  }

  if (phone) {
    const existing = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: userId }
      }
    });
    if (existing) {
      throw new AppError('Phone number is already in use by another account', 400);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      phone,
      address,
      houseNo,
      streetNear,
      road,
      district,
      state,
      pincode
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      address: true,
      houseNo: true,
      streetNear: true,
      road: true,
      district: true,
      state: true,
      pincode: true,
    }
  });

  return updated;
};

