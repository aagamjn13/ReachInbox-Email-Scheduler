export interface CreateCampaignDTO {
  subject: string;
  body: string;
  requestedStartTime: Date;
  requestedDelayMs: number;
  requestedHourlyLimit: number;
  recipients: string[];
  senderAccountIds: string[];
}
