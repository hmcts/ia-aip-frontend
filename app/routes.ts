import { OSPlacesClient } from '@hmcts/os-places-client';
import config from 'config';
import * as express from 'express';
import requestPromise from 'request-promise-native';
import { setupCheckAndSendController } from './controllers/check-and-send';
import { setConfirmationController } from './controllers/confirmation-page';
import { setupContactDetailsController } from './controllers/contact-details';
import { setupEligibilityController } from './controllers/eligibility';
import { setupHealthController } from './controllers/health';
import { setupHomeOfficeDetailsController } from './controllers/home-office-details';
import { setupIdamController } from './controllers/idam';
import { setupIndexController } from './controllers/index';
import { setupOutOfTimeController } from './controllers/out-of-time';
import { setupPersonalDetailsController } from './controllers/personal-details';
import { setupReasonsForAppealController } from './controllers/reason-for-appeal';
import { setupStartController } from './controllers/startController';
import { setupTaskListController } from './controllers/task-list';
import { setupTypeOfAppealController } from './controllers/type-of-appeal';
import { logSession } from './middleware/session-middleware';
import { CcdService } from './service/ccd-service';
import IdamService from './service/idam-service';
import S2SService from './service/s2s-service';
import UpdateAppealService from './service/update-appeal-service';

export const updateAppealService: UpdateAppealService = new UpdateAppealService(new CcdService(), new IdamService(), S2SService.getInstance());
const osPlacesClient = new OSPlacesClient(config.get('addressLookup.token'), requestPromise, config.get('addressLookup.url'));

const router = express.Router();

const indexController = setupIndexController();
const startController = setupStartController();
const healthController = setupHealthController();
const idamController = setupIdamController();
const taskListController = setupTaskListController();
const homeOfficeDetailsController = setupHomeOfficeDetailsController(updateAppealService);
const typeOfAppealController = setupTypeOfAppealController(updateAppealService);
const personalDetailsController = setupPersonalDetailsController({ updateAppealService, osPlacesClient });
const contactDetailsController = setupContactDetailsController(updateAppealService);
const checkAndSendController = setupCheckAndSendController(updateAppealService);
const confirmationController = setConfirmationController();
const reasonsForAppealController = setupReasonsForAppealController({ updateAppealService });
const outOfTimeController = setupOutOfTimeController(updateAppealService);
const eligibilityController = setupEligibilityController();

// not protected by idam
router.use(healthController);
router.use(startController);
router.use(eligibilityController);

// protected by idam
router.use(idamController);
// router.use(initSession);
if (process.env.NODE_ENV === 'development') router.use(logSession);
router.use(indexController);
router.use(taskListController);
router.use(homeOfficeDetailsController);
router.use(personalDetailsController);
router.use(typeOfAppealController);
router.use(contactDetailsController);
router.use(confirmationController);
router.use(checkAndSendController);
router.use(reasonsForAppealController);
router.use(outOfTimeController);

export { router };
