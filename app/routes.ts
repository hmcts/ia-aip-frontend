import * as express from 'express';
import { setupContactDetailsController } from './controllers/contact-details';
import { setupDevNextPageController } from './controllers/dev-next-page';
import { setupHealthController } from './controllers/health';
import { setupHomeOfficeDetailsController } from './controllers/home-office-details';
import { setupIdamController } from './controllers/idam';
import { setupIndexController } from './controllers/index';
import { setupPersonalDetailsController } from './controllers/personal-details';
import { setupTaskListController } from './controllers/task-list';
import { setupTypeOfAppealController } from './controllers/type-of-appeal';

const router = express.Router();

const indexController = setupIndexController();
const healthController = setupHealthController();
const idamController = setupIdamController();
const taskListController = setupTaskListController();
const homeOfficeDetailsController = setupHomeOfficeDetailsController();
const typeOfAppealController = setupTypeOfAppealController();
const devNextPageController = setupDevNextPageController();
const personalDetailsController = setupPersonalDetailsController();
const contactDetailsController = setupContactDetailsController();

// not protected by idam
router.use(healthController);

// protected by idam
router.use(idamController);
router.use(indexController);
router.use(taskListController);
router.use(homeOfficeDetailsController);
router.use(personalDetailsController);
router.use(typeOfAppealController);
router.use(devNextPageController);
router.use(contactDetailsController);

export { router };
