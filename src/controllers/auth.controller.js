import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationError } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { signInSchema, signUpSchema } from '#validations/auth.validations.js';

export const signUp = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult),
      });
    }

    const { name, email, password, role } = validationResult.data;

    // Auth Service
    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User registered successfully ${email}`);
    res.status(201).json({
      message: 'User Registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('signup error', error);
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exist' });
    }
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(validationResult),
      });
    }

    const { email, password } = validationResult.data;
    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    res.status(200).json({
      message: 'User signed in',
      user,
    });
  } catch (error) {
    logger.error('signin error', error);
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(error);
  }
};

export const signOut = (req, res) => {
  cookies.clear(res, 'token');

  res.status(200).json({
    message: 'User signed out',
  });
};

export const me = (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};
