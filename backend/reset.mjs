import 'dotenv/config';
import { sequelize } from './models/index.mjs';

const results = await sequelize.model.Chain.findAll();
for (const entry of results) {
  await sequelize.models.Chain.setByChainId(entry.chainId, { blockNumber: 0 });
}

await sequelize.models.Payload.truncate();
await sequelize.models.PayloadFinished.truncate();
await sequelize.models.Transaction.truncate();
await sequelize.close();
