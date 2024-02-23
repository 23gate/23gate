import 'dotenv/config';
import { sequelize } from './models/index.mjs';

await sequelize.sync({ force: false });
await sequelize.close();
