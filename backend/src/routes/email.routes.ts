import { Router } from 'express';
import {
  scheduleEmails,
  getScheduledEmails,
  getSentEmails,
  getEmailById,
  search,
} from '../controllers/email.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCampaignSchema } from '../validators/email.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(isAuthenticated);

router.post('/schedule', validate(createCampaignSchema), asyncHandler(scheduleEmails));
router.get('/scheduled', asyncHandler(getScheduledEmails));
router.get('/sent', asyncHandler(getSentEmails));
router.get('/search', asyncHandler(search));
router.get('/:id', asyncHandler(getEmailById));

export default router;
