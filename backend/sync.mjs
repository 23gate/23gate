import 'dotenv/config';
import { sequelize } from './models/index.mjs';

await sequelize.sync({ force: true });
await sequelize.close();
