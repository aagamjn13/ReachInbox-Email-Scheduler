import { Request, Response } from 'express';
import {
  handleSlackCallback,
  getSlackStatus as getSlackStatusService,
  disconnectSlack as disconnectSlackService,
} from '../services/slack.service';
import { env } from '../config/env';

/**
 * Initiate Slack OAuth. Redirects user to Slack authorization page.
 */
export const slackConnect = (req: Request, res: Response) => {
  const userId = req.user!.id;
  const scopes = 'incoming-webhook';
  const redirectUri = encodeURIComponent(env.SLACK_REDIRECT_URI);
  const state = encodeURIComponent(userId);

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

  res.redirect(slackAuthUrl);
};

/**
 * Slack OAuth callback. Exchanges code for token and stores connection.
 */
export const slackCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const userId = state as string;

  if (!code || !userId) {
    return res.redirect(`${env.FRONTEND_URL}/scheduled?slack=error`);
  }

  try {
    await handleSlackCallback(code as string, userId);
    res.redirect(`${env.FRONTEND_URL}/scheduled?slack=connected`);
  } catch (error) {
    res.redirect(`${env.FRONTEND_URL}/scheduled?slack=error`);
  }
};

/**
 * Get Slack connection status.
 */
export const getSlackStatus = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const status = await getSlackStatusService(userId);
  res.json(status);
};

/**
 * Disconnect Slack integration.
 */
export const slackDisconnect = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    await disconnectSlackService(userId);
    res.json({ message: 'Slack disconnected successfully' });
  } catch (error) {
    res.status(404).json({ error: 'No Slack connection found' });
  }
};
