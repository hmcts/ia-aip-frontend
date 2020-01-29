import { OSPlacesClient } from '@hmcts/os-places-client';
import config from 'config';
import * as express from 'express';
import requestPromise from 'request-promise-native';
import { setupCheckAndSendController } from './controllers/appeal-application/check-and-send';
import { setConfirmationController } from './controllers/appeal-application/confirmation-page';
import { setupContactDetailsController } from './controllers/appeal-application/contact-details';
import { setupHomeOfficeDetailsController } from './controllers/appeal-application/home-office-details';
import { setupOutOfTimeController } from './controllers/appeal-application/out-of-time';
import { setupPersonalDetailsController } from './controllers/appeal-application/personal-details';
import { setupTaskListController } from './controllers/appeal-application/task-list';
import { setupTypeOfAppealController } from './controllers/appeal-application/type-of-appeal';
import { setupReasonsForAppealController } from './controllers/case-building/reason-for-appeal';
import { setupEligibilityController } from './controllers/eligibility';
import { setupHealthController } from './controllers/health';
import { setupIdamController } from './controllers/idam';
import { setupIndexController } from './controllers/index';
import { setupStartController } from './controllers/startController';
import { logSession } from './middleware/session-middleware';
import { AuthenticationService } from './service/authentication-service';
import { CcdService } from './service/ccd-service';
import { DocumentManagementService } from './service/document-management-service';
import IdamService from './service/idam-service';
import S2SService from './service/s2s-service';
import UpdateAppealService from './service/update-appeal-service';
import { setupSecrets } from './setupSecrets';

const config = setupSecrets();

const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
const updateAppealService: UpdateAppealService = new UpdateAppealService(new CcdService(), authenticationService);
const documentManagementService: DocumentManagementService = new DocumentManagementService(authenticationService);
const osPlacesClient: OSPlacesClient = new OSPlacesClient(config.get('addressLookup.token'), requestPromise, config.get('addressLookup.url'));

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
const reasonsForAppealController = setupReasonsForAppealController({ updateAppealService, documentManagementService });
const outOfTimeController = setupOutOfTimeController({ updateAppealService, documentManagementService });
const eligibilityController = setupEligibilityController();

// not protected by idam
router.use(healthController);
router.use(startController);

// protected by idam
router.use(idamController);
// router.use(initSession);
if (process.env.NODE_ENV === 'development') {
  router.use(logSession);
}
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
