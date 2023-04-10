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

    this.create({ chainId });

    return 0;
  }

  static async setByChainId(chainId, { blockNumber }, transaction) {
    await this.sequelize.query(
      'UPDATE Chain SET updatedAt = UNIX_TIMESTAMP(), blockNumber = ? WHERE chainId = ?',
      {
        replacements: [ blockNumber, chainId ],
        type: Sequelize.QueryTypes.UPDATE,
        transaction
      }
    );
  }

  static options = {
    timestamps: false
  }
}
