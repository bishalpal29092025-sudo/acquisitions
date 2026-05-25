import { me, signIn, signOut, signUp } from '#controllers/auth.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/sign-out', signOut);
router.get('/me', authenticateToken, me);

export default router;
