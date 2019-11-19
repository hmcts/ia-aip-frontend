import * as express from 'express';
import { setupCheckAndSendController } from './controllers/check-and-send';
import { setConfirmationController } from './controllers/confirmation-page';
import { setupContactDetailsController } from './controllers/contact-details';
import { setupDevNextPageController } from './controllers/dev-next-page';
import { setupHealthController } from './controllers/health';
import { setupHomeOfficeDetailsController } from './controllers/home-office-details';
import { setupIdamController } from './controllers/idam';
import { setupIndexController } from './controllers/index';
import { setupPersonalDetailsController } from './controllers/personal-details';
import { setupStartController } from './controllers/startController';
import { setupTaskListController } from './controllers/task-list';
import { setupTypeOfAppealController } from './controllers/type-of-appeal';

import { logSession } from './middleware/session-middleware';

const router = express.Router();

const indexController = setupIndexController();
const startController = setupStartController();
const healthController = setupHealthController();
const idamController = setupIdamController();
const taskListController = setupTaskListController();
const homeOfficeDetailsController = setupHomeOfficeDetailsController();
const typeOfAppealController = setupTypeOfAppealController();
const devNextPageController = setupDevNextPageController();
const personalDetailsController = setupPersonalDetailsController();
const contactDetailsController = setupContactDetailsController();
const confirmationController = setConfirmationController();
const checkAndSendController = setupCheckAndSendController();
// not protected by idam
router.use(healthController);
router.use(startController);

// protected by idam
router.use(idamController);
// router.use(initSession);
if (process.env.NODE_ENV === 'development') router.use(logSession);
router.use(indexController);
router.use(taskListController);
router.use(homeOfficeDetailsController);
router.use(personalDetailsController);
router.use(typeOfAppealController);
router.use(devNextPageController);
router.use(contactDetailsController);
router.use(confirmationController);
router.use(checkAndSendController);

export { router };
