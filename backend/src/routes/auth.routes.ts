import { Router } from 'express';
import passport from 'passport';
import { googleCallback, logout, getMe } from '../controllers/auth.controller';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

router.get('/me', getMe);

router.post('/logout', logout);

export default router;
