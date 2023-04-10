import { Sequelize, Model } from 'sequelize';
import crypto from 'crypto';

async function randomBytesInHex(length) {
  const buffer = await crypto.randomBytes(length);
  return '0x' + buffer.toString('hex');
}

export class Payload extends Model {
  static structure = {
    url: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    webhookId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: true // for test webhooks
    },

    userId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: true // for test webhooks
    },

    chainId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

    transactionHash: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    blockNumber: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

    transactionIndex: {
      type: Sequelize.DataTypes.SMALLINT.UNSIGNED,
      allowNull: false
    },

    address: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    logIndex: {
      type: Sequelize.DataTypes.SMALLINT.UNSIGNED,
      allowNull: false
    },

    eventName: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    payload: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false
    },

    requestStartedAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },

    nextRequestAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },

    responseStatus: {
      type: Sequelize.DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },

    responseHeaders: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },

    responseBody: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },

    requestCount: {
      type: Sequelize.DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },

    isSending: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    createdAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }

  static createPayload({ eventName, log, args, transactionReceipt, chainId, webhookId }) {
    return {
      v: 1,
      webhookId,
      isLive: true,

      event: {
        address: log.address,
        logIndex: log.logIndex,
        name: eventName,
        args
      },

      transaction: {
        chainId,
        from: transactionReceipt.from,
        to: transactionReceipt.to,
        transactionIndex: transactionReceipt.transactionIndex,
        transactionHash: transactionReceipt.transactionHash,
        blockNumber: transactionReceipt.blockNumber
      }
    };
  }

  static signPayload(payloadString, secret) {
    return crypto.createHmac('sha384', secret).update(payloadString).digest('base64');
  }

  static async createTestPayload({ chainId, abi, eventName, addressList, url }) {
    function random(from, to) {
      const scale = to-from;
      const r = Math.round(Math.random() * scale);
      return from + r;
    }

    const payload = {
      v: 1,
      webhookId: 0,
      isLive: false,

      event: {
        address: await randomBytesInHex(20),
        logIndex: random(1, 30),
        name: eventName,
        args: {
          something: 'else'
        }
      },

      transaction: {
        chainId,
        from: await randomBytesInHex(20),
        to: await randomBytesInHex(20),
        transactionIndex: random(1, 323),
        transactionHash: await randomBytesInHex(32),
        blockNumber: random(2000000, 5000000)
      }
    };

    const payloadString = JSON.stringify(payload);

    return await this.create({
      chainId,
      abi,
      eventName,
      addressList,
      url,

      webhookId: null,
      userId: null,

      transactionHash: payload.transaction.transactionHash,
      blockNumber: payload.transaction.blockNumber,
      transactionIndex: payload.transaction.transactionIndex,
      address: payload.event.address,
      logIndex: payload.event.logIndex,
      payload: payloadString,
      nextRequestAt: new Date()
    });
  }

  static async findPayloadsToSend(limit = 30) {
    return await this.sequelize.transaction(async transaction => {
      const records = await this.findAll({
        attributes: [
          'id',
          'url',
          'payload',
          'requestCount',
          'webhookId',
          'transactionHash',
          'blockNumber',
          'transactionIndex',
          'address',
          'logIndex',
          'eventName',
          'userId',
          'chainId',
          'createdAt'
        ],

        where: {
          nextRequestAt: {
            [Sequelize.Op.lt]: new Date()
          },
          isSending: false
        },

        order: [ ['id', 'ASC'] ],

        limit,

        raw: true,

        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (records.length == 0) {
        return [];
      }

      await this.update(
        {
          isSending: true,
          requestStartedAt: new Date()
        },
        {
          where: {
            id: records.map(r => r.id)
          },
          transaction
        }
      );

      return records;
    });
  }

  static async moveToFinished(record) {
    await this.sequelize.transaction(async transaction => {
      await this.sequelize.models.PayloadFinished.create(record, { transaction });

      await this.destroy({
        where: {
          id: record.id
        },
        transaction
      });
    });
  }

  static options = {
    timestamps: false,

    indexes: [
      {
        fields: ['webhookId']
      },
      {
        fields: ['transactionHash', 'logIndex'],
        unique: true
      },
      {
        fields: ['nextRequestAt']
      }
    ]
  }
}
