import { Router } from 'express';
import { getSenderAccounts } from '../controllers/sender.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(isAuthenticated);
router.get('/', asyncHandler(getSenderAccounts));

export default router;
