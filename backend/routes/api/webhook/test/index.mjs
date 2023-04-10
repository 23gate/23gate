import { ethers } from 'ethers';
import { networks } from '../../../../../common/networks.mjs';
import { sequelize } from '../../../../models/index.mjs';
import { setTimeout } from 'node:timers/promises';

export default async function routes(instance) {
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

      const record = await sequelize.models.Payload.createTestPayload({
        chainId: request.body.webhook.chainId,
        abi: [ formattedEvent ],
        eventName: eventFragment.name,
        addressList,
        url: request.body.webhook.url
      });

      return {
        success: true,
        id: record.id
      };
    }
  );

  instance.get(
    '/:id(^\\d+)/',

    async request => {
      const id = request.params.id;

      let c = 10;
      do {
        const payloadFinished = await sequelize.models.PayloadFinished.findByPk(id);

        if (payloadFinished) {
          return {
            success: true,
            status: payloadFinished.responseStatus
          };
        }

        await setTimeout(1000);
      } while (c-- >= 0);

      return {
        success: true,
        status: 0
      };
    }
  );
}
