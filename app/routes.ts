import * as express from 'express';
import { setupHealthController } from './controllers/health';
import { setupHomeOfficeDetailsController } from './controllers/home-office-details';
import { setupIdamController } from './controllers/idam';
import { setupIndexController } from './controllers/index';

const router = express.Router();

const indexController = setupIndexController();
const healthController = setupHealthController();
const idamController = setupIdamController();
const homeOfficeDetailsController = setupHomeOfficeDetailsController();

// not protected by idam
router.use(healthController);

// protected by idam
router.use(idamController);
router.use(indexController);
router.use(homeOfficeDetailsController);

export { router };
