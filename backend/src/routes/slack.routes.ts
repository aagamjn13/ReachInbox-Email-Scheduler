import { Router } from 'express';
import {
  slackConnect,
  slackCallback,
  getSlackStatus,
  slackDisconnect,
} from '../controllers/slack.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/connect', isAuthenticated, slackConnect);
router.get('/callback', asyncHandler(slackCallback));
router.get('/status', isAuthenticated, asyncHandler(getSlackStatus));
router.delete('/', isAuthenticated, asyncHandler(slackDisconnect));

export default router;
