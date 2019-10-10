import * as express from 'express';
import { setupHealthController } from './controllers/health';
import { setupIndexController } from './controllers/index';

const router = express.Router();

const indexController = setupIndexController();
const healthController = setupHealthController();

router.use(indexController);
router.use(healthController);

export { router };
