export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface SenderAccount {
  id: string;
  displayName: string;
  email: string;
  active: boolean;
}

export interface Email {
  id: string;
  campaignId: string;
  senderAccountId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RATE_LIMITED';
  failureReason: string | null;
  etherealPreviewUrl: string | null;
  senderAccount: SenderAccount;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ScheduleEmailPayload {
  senderAccountIds: string[];
  recipients: string[];
  subject: string;
  body: string;
  requestedStartTime?: string;
  requestedDelayMs?: number;
  requestedHourlyLimit?: number;
}

export interface CampaignResponse {
  campaignId: string;
  totalRecipients: number;
  firstScheduledAt: string;
  lastScheduledAt: string;
}

export interface SlackStatus {
  connected: boolean;
  teamName?: string;
  channelName?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
