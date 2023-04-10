import { Sequelize, Model } from 'sequelize';

export class PayloadFinished extends Model {
  static structure = {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false
    },

    url: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    webhookId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },

    userId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: true
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

    responseStatus: {
      type: Sequelize.DataTypes.SMALLINT.UNSIGNED,
      allowNull: false
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
      allowNull: false
    },

    createdAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
    }
  }

  static async expire(ageMinute) {
    await this.sequelize.query('DELETE FROM PayloadFinished WHERE createdAt <= NOW() - INTERVAL ? MINUTE', {
      replacements: [ ageMinute ]
    });
  }

  static options = {
    timestamps: false,
    indexes: [
      {
        fields: ['createdAt']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['userId', 'webhookId']
      },
      {
        fields: ['userId', 'chainId']
      }
    ]
  }
}
