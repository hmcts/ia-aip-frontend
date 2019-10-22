import * as express from 'express';
import { setupHealthController } from './controllers/health';
import { setupHomeOfficeDetailsController } from './controllers/home-office-details';
import { setupIdamController } from './controllers/idam';
import { setupIndexController } from './controllers/index';
import { setupPersonalDetailsController } from './controllers/personal-details-get-names';
import { setupTaskListController } from './controllers/task-list';

const router = express.Router();

const indexController = setupIndexController();
const healthController = setupHealthController();
const idamController = setupIdamController();
const taskListController = setupTaskListController();
const homeOfficeDetailsController = setupHomeOfficeDetailsController();
const personalDetailsController = setupPersonalDetailsController();

// not protected by idam
router.use(healthController);

// protected by idam
router.use(idamController);
router.use(indexController);
router.use(taskListController);
router.use(homeOfficeDetailsController);
router.use(personalDetailsController);

export { router };
