import { Sequelize, Model } from 'sequelize';
import { randomUUID } from 'crypto';

export class User extends Model {
  static structure = {
    id: { // same as returned from OAuth2 provider (GitHub)
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },

    email: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    secret: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.DataTypes.UUIDV4
    }
  };

  static generateSecret() {
    return randomUUID();
  }

  static options = {
  };
}
