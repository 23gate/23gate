import { ethers } from 'ethers';
import { chainIdByTitle, networks } from '../../../../common/networks.mjs';

export default async function routes(instance) {
  instance.get(
    '/',

    {
      schema: {
        query: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
            },
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
        offset: request.query.offset
      };

      if (request.query.search) {
        if (request.query.search.startsWith('http')) {
          where.push({
            url: {
              [instance.sequelize.Sequelize.Op.startsWith]: request.query.search
            }
          });

        } else if (request.query.search.startsWith('#')) {
          where.push({
            id: request.query.search.substring(1) // let MySQL do the casting
          });

        } else {
          const searchStringNormalized = request.query.search.trim().replace(/\s+/g, ' ');

          const chainIdCandidate = chainIdByTitle[searchStringNormalized.toLowerCase()];
          if (chainIdCandidate) {
            where.push({
              chainId: chainIdCandidate
            });

          } else {
            const str = instance.sequelize.escape(searchStringNormalized + '*');
            // FIXME MySQL only
            where.push(
              instance.sequelize.Sequelize.literal(`MATCH (addressList, eventName) AGAINST(${str} IN BOOLEAN MODE)`)
            );
          }
        }
      }

      options.where = {
        [instance.sequelize.Sequelize.Op.and]: where
      };

      options.order = [[ 'id', 'DESC' ]];

      const result = await instance.sequelize.models.Webhook.findAndCountAll(options);

      return { success: true, ...result };
    }
  );

  instance.get(
    '/:id(^\\d+)/',

    async request => {
      const webhook = await instance.sequelize.models.Webhook.findByIdAndUserId(request.params.id, request.user.id);
      if (!webhook) {
        return { success: false, message: "Webhook not found" };
      }

      return { success: true, webhook };
    }
  );

  instance.post(
    '/',

    {
      schema: {
        body: {
          type: 'object',
          properties: {
            webhook: {
              type: 'object',
              properties: {
                chainId: {
                  type: 'number'
                },
                addressList: {
                  type: 'string'
                },
                event: {
                  type: 'string'
                },
                url: {
                  type: 'string'
                },
                confirmations: {
                  type: 'number'
                }
              },
              required: ['chainId', 'addressList', 'event', 'url', 'confirmations']
            },
          },
          required: ['webhook']
        }
      }
    },

    async request => {
      let userId = request.user.id;

      if (!userId) {
        // NOTE: we create user when we create webhook
        const user = await instance.sequelize.models.User.create({ email: request.user.email });
        userId = user.id;
      }

      const parsed = new ethers.Interface([ request.body.webhook.event ]);
      const eventFragment = parsed.fragments[0];
      const formattedEvent = eventFragment.format('full');

      const addressList = instance.sequelize.models.Webhook.parseAddressListString(request.body.webhook.addressList);
      if (!addressList) {
        return { success: false, message: "Failed to parse address list" };
      }

      const isNetworkFound = networks.find(n => n.chainId == request.body.webhook.chainId && n.isEnabled);
      if (!isNetworkFound) {
        return { success: false, message: "Unknown network" };
      }

      const record = {
        chainId: request.body.webhook.chainId,
        userId,
        abi: [ formattedEvent ],
        eventName: eventFragment.name,
        addressList,
        url: request.body.webhook.url
      };

      let result;
      try {
        result = await instance.sequelize.models.Webhook.create(record);
      } catch (error) {
        console.log(error);
      }

      return { success: Boolean(result) };
    }
  );

  instance.delete(
    '/:id(^\\d+)',

    async request => {
      const webhook = await instance.sequelize.models.Webhook.findByIdAndUserId(request.params.id, request.user.id);

      await instance.sequelize.transaction(async transaction => {
        await webhook.destroy({ transaction });
        await instance.sequelize.models.Payload.destroy({
          where: {
            webhookId: webhook.id,
          },
          transaction
        });
      });

      return { success: true };
    }
  );

  instance.post(
    '/:id(^\\d+)/disable/',

    async request => {
      const webhook = await instance.sequelize.models.Webhook.findByIdAndUserId(request.params.id, request.user.id);

      if (webhook.status == 'enabled' || webhook.status == 'failed') {
        webhook.status = 'disabled';
        await webhook.save();
      }

      return {
        success: true,
        status: webhook.status
      };
    }
  );

  instance.post(
    '/:id(^\\d+)/enable/',

    async request => {
      const webhook = await instance.sequelize.models.Webhook.findByIdAndUserId(request.params.id, request.user.id);

      if (webhook.status == 'disabled' || webhook.status == 'failed') {
        webhook.status = 'enabled';
        await webhook.save();
      }

      return {
        success: true,
        status: webhook.status
      };
    }
  );

  instance.post(
    '/:id(^\\d+)/update_url/',

    {
      schema: {
        body: {
          type: 'object',
          properties: {
            url: {
              type: 'string'
            }
          },
          required: ['url']
        }
      }
    },

    async request => {
      const webhook = await instance.sequelize.models.Webhook.findByIdAndUserId(request.params.id, request.user.id);

      const formerUrl = webhook.url;

      webhook.url = request.body.url;
      await webhook.save();

      await instance.sequelize.models.Payload.update(
        {
          url: request.body.url
        },
        {
          where: {
            webhookId: webhook.id,
            url: formerUrl
          }
        }
      );

      return { success: true };
    }
  );
}
