import { Request, Response } from 'express';
import { env } from '../config/env';

export const googleCallback = (req: Request, res: Response) => {
  res.redirect(`${env.FRONTEND_URL}/dashboard/scheduled`);
};

export const getMe = (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    return res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl,
    });
  }
  return res.status(401).json({ error: 'Not authenticated' });
};


export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
};
