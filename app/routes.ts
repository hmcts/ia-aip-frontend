import * as express from 'express';
import { setupIndexController } from './controllers/index';
import { setupHealthController } from './controllers/health';

const router = express.Router();

const indexController = setupIndexController();
const healthController = setupHealthController();

router.use(indexController);
router.use(healthController);

export { router };
