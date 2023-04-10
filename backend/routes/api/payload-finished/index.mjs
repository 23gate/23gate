import { chainIdByTitle } from '../../../../common/networks.mjs';

export default async function routes(instance) {
  instance.get(
    '/',

    {
      schema: {
        query: {
          type: 'object',
          properties: {
            limit: {
              type: 'number'
            },
            offset: {
              type: 'number'
            }
          },
          required: ['limit', 'offset']
        }
      }
    },

    async request => {
      const where = [
        { userId: request.user.id }
      ];

      const options = {
        limit: request.query.limit,
        offset: request.query.offset,
        subQuery: false,
        raw: true,
        order: [[ 'id', 'DESC' ]]
      };

      if (request.query.search) {
        const searchStringNormalized = request.query.search.trim().replace(/\s+/g, ' ');
        const searchStringNormalizedLowerCase = searchStringNormalized.toLowerCase();

        if (request.query.search.startsWith('http')) {
          where.push({
            url: {
              [instance.sequelize.Sequelize.Op.startsWith]: request.query.search
            }
          });

        } else if (request.query.search.startsWith('#')) {
          where.push({
            webhookId: request.query.search.substring(1) // let MySQL do the casting
          });

        } else if (chainIdByTitle[searchStringNormalizedLowerCase]) {
          where.push({
            chainId: chainIdByTitle[searchStringNormalizedLowerCase]
          });

        } else {
          where.push({
            eventName: searchStringNormalized
          });
        }
      }

      options.where = {
        [instance.sequelize.Sequelize.Op.and]: where
      };

      const result = await instance.sequelize.models.PayloadFinished.findAndCountAll(options);

      return { success: true, ...result };
    }
  );
}
