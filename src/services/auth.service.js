import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing the password ${error}`);
    throw new Error('Error Hashing', {
      cause: error,
    });
  }
};

export const verifyPassword = async (password, passwordHash) => {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    logger.error(`Error verifying the password ${error}`);
    throw new Error('Error verifying password', {
      cause: error,
    });
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) throw new Error('Email already exists');

    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    logger.info(`User ${newUser.email} created successfully`);
    return newUser;
  } catch (error) {
    logger.error(`Error creating the user ${error}`);
    throw error;
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) throw new Error('Invalid credentials');

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    logger.info(`User ${user.email} signed in successfully`);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };
  } catch (error) {
    logger.error(`Error authenticating the user ${error}`);
    throw error;
  }
};
