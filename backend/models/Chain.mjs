import { Sequelize, Model } from 'sequelize';

export class Chain extends Model {
  static structure = {
    chainId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },

    blockNumber: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },

    updatedAt: {
      type: Sequelize.DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }

  static async getLastSyncedBlockByChainId(chainId) {
    const record = await this.findByPk(chainId);
    if (record) {
      return record.blockNumber;
    }

    await this.create({ chainId });

    return 0;
  }

  static async setByChainId(chainId, { blockNumber }, transaction) {
    await this.update(
      {
        blockNumber,
        updatedAt: Math.floor(Date.now() / 1000)
      },
      {
        where: {
          chainId
        },
        transaction
      }
    );
  }

  static options = {
    timestamps: false
  }
}
