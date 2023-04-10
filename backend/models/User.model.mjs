import { Sequelize, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export class User extends Model {
  static structure = {
    uuid: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
      unique: true
    },

    email: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },

    secret: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.DataTypes.UUIDV4
    }
  }

  static generateSecret() {
    return uuidv4();
  }

  static options = {
  }
}
