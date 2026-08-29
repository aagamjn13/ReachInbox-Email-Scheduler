import { Client } from '@elastic/elasticsearch';
import { env } from './env';
import logger from '../utils/logger';

export const esClient = new Client({
  node: env.ELASTICSEARCH_NODE,
});

export const initElasticsearch = async () => {
  try {
    const indexName = 'emails';
    const exists = await esClient.indices.exists({ index: indexName });
    
    if (!exists) {
      await esClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              campaignId: { type: 'keyword' },
              userId: { type: 'keyword' },
              senderEmail: { type: 'keyword' },
              recipient: { type: 'text' },
              subject: { type: 'text' },
              body: { type: 'text' },
              status: { type: 'keyword' },
              sentAt: { type: 'date' },
            }
          }
        }
      });
      logger.info(`Elasticsearch index ${indexName} created.`);
    }
  } catch (error) {
    logger.error('Failed to initialize Elasticsearch', error);
  }
};
