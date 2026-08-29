import { esClient } from '../config/elasticsearch';
import logger from '../utils/logger';

export const indexEmail = async (emailDocument: any) => {
  try {
    await esClient.index({
      index: 'emails',
      id: emailDocument.id,
      document: emailDocument
    });
  } catch (error) {
    logger.error(`Failed to index email ${emailDocument.id}`, error);
  }
};

export const searchEmails = async (userId: string, query: string, page: number = 1, limit: number = 20) => {
  try {
    const from = (page - 1) * limit;
    const result = await esClient.search({
      index: 'emails',
      from,
      size: limit,
      body: {
        query: {
          bool: {
            must: [
              { term: { 'userId.keyword': userId } },
              {
                multi_match: {
                  query,
                  fields: ['subject', 'body', 'recipient', 'senderEmail']
                }
              }
            ]
          }
        }
      }
    });
    
    // Ensure we safely access the hits value
    const totalHits = typeof result.hits.total === 'number' 
      ? result.hits.total 
      : (result.hits.total as any)?.value || 0;

    return {
      data: result.hits.hits.map(hit => hit._source),
      total: totalHits,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalHits / limit)
    };
  } catch (error) {
    logger.error('Search query failed', error);
    return { data: [], total: 0, page, pageSize: limit, totalPages: 0 };
  }
};
