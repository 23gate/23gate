/* eslint-disable max-classes-per-file, class-methods-use-this, no-underscore-dangle */
import { Sequelize, DataTypes, Utils } from 'sequelize';

class BIGINTNATIVE extends DataTypes.ABSTRACT.prototype.constructor {
  static key = 'BIGINTNATIVE';

  toSql() {
    return 'VARCHAR(80)';
  }

  validate(value, options) { // eslint-disable-line no-unused-vars
    console.trace('validate');
    return typeof value === 'bigint';
  }

  _sanitize(value) {
    if (value === null || value === undefined) {
      return null;
    }

    const _value = typeof value === 'bigint' ? value : BigInt(value);
    return _value < 0n ? 0n : _value;
  }

  _stringify(value) {
    return value.toString();
  }

  _value(value) {
    console.trace('value');
    return value;
  }

  // Optional: parser for values received from the database
  static parse(value) {
    console.trace('static parse');
    return BigInt(value);
  }
}

BIGINTNATIVE.prototype.key = 'BIGINTNATIVE';
BIGINTNATIVE.key = 'BIGINTNATIVE';
DataTypes.BIGINTNATIVE = Utils.classToInvokable(BIGINTNATIVE);

export class TXHASH extends DataTypes.ABSTRACT.prototype.constructor {
  static key = 'TXHASH';

  // toSql must return the SQL that will be used in a CREATE TABLE statement.
  toSql() {
    return 'BINARY(32)';
  }

  validate() {
    return true;
  }

  _sanitize(value) {
    return value;
  }

  _stringify(value) {
    return value;
  }

  _value(value) {
    return value;
  }

  static parse(value) {
    return value;
  }
}

TXHASH.prototype.key = 'TXHASH';
TXHASH.key = 'TXHASH';
DataTypes.TXHASH = Utils.classToInvokable(TXHASH);

const { User } = await import('./User.model.mjs');
const { Transaction } = await import('./Transaction.model.mjs');
const { Chain } = await import('./Chain.model.mjs');
const { Webhook } = await import('./Webhook.model.mjs');
const { Payload } = await import('./Payload.model.mjs');
const { PayloadFinished } = await import('./PayloadFinished.model.mjs');

const options = {
  logging: false,
  define: {
    freezeTableName: true
  },
  dialectOptions: {
    decimalNumbers: true,
    socketPath: process.env.SOCKET_PATH
  }
};

export const sequelize = new Sequelize(process.env.SQL, options);

// actually try to connect
await sequelize.authenticate();

sequelize.query('SET CHARACTER SET utf8mb4');
sequelize.query('SET NAMES UTF8mb4');

[ User, Transaction, Chain, Webhook, Payload, PayloadFinished ].forEach(table => table.init(table.structure, { ...table.options, sequelize }));

await sequelize.sync();
