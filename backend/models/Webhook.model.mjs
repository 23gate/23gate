import { Sequelize, Model } from 'sequelize';
import { ethers } from 'ethers';

const MAX_WEBHOOK_FAILED_COUNT = 300;

export class Webhook extends Model {
  static structure = {
    userId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

    chainId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

    addressList: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false,
      get() {
        return Webhook.parseAddressListString(this.getDataValue('addressList'));
      },
      set(value) {
        this.setDataValue('addressList', value.map(a => ethers.getAddress(a)).join(' '));
      }
    },

    eventName: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    abi: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false
    },

    url: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    status: {
      type: Sequelize.DataTypes.ENUM('enabled', 'disabled', 'failed'),
      allowNull: false,
      defaultValue: 'enabled'
    },

    failedCount: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  };

  static parseAddressListString(str) {
    try {
      return (str || '')
        .trim()
        .split(' ')
        .map(a => ethers.getAddress(a));
    } catch {
      return null;
    }
  }

  static async findByIdAndUserId(id, userId) {
    return await this.findOne({
      where: {
        id,
        userId
      }
    });
  }

  static async isFailedWebhooksPresentByUserId(userId) {
    const count = await this.count({
      where: {
        userId,
        status: 'failed'
      }
    });

    return count > 0;
  }

  static async incrementFailedCountAndPossiblyDisableById(id) {
    if (!id) { // test webhooks have no id
      return;
    }

    // FIXME MySQL only code
    await this.sequelize.query(
      'UPDATE Webhook SET failedCount = failedCount + 1, status = IF (failedCount >= ?, "failed", status) WHERE id = ?',
      {
        replacements: [ MAX_WEBHOOK_FAILED_COUNT, id ],
        type: Sequelize.QueryTypes.UPDATE
      }
    );
  }

  static options = {
    indexes: [
      {
        type: 'FULLTEXT',
        fields: [ 'addressList', 'eventName' ]
      },
      {
        fields: [ 'userId' ]
      },
      {
        fields: [ 'chainId' ]
      }
    ]
  };
}
