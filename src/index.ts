import * as dotenv from 'dotenv';
import startServer from './server';
import startSchedule from './schedule';

dotenv.config({ path: __dirname+'/../.env' });
startServer();
startSchedule();

