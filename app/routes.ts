import { OSPlacesClient } from '@hmcts/os-places-client';
import * as express from 'express';
import requestPromise from 'request-promise-native';
import { setupIndexController } from './controllers';
import { setupCheckAndSendController } from './controllers/appeal-application/check-and-send';
import { setConfirmationController } from './controllers/appeal-application/confirmation-page';
import { setupContactDetailsController } from './controllers/appeal-application/contact-details';
import { setupHomeOfficeDetailsController } from './controllers/appeal-application/home-office-details';
import { setupOutOfTimeController } from './controllers/appeal-application/out-of-time';
import { setupPersonalDetailsController } from './controllers/appeal-application/personal-details';
import { setupTaskListController } from './controllers/appeal-application/task-list';
import { setupTypeOfAppealController } from './controllers/appeal-application/type-of-appeal';
import { setupApplicationOverviewController } from './controllers/application-overview';
import { setupAskForMoreTimeController } from './controllers/ask-for-more-time/ask-for-more-time';
import { setupClarifyingQuestionPageController } from './controllers/clarifying-questions/question-page';
import { setupClarifyingQuestionsListController } from './controllers/clarifying-questions/questions-list';
import { setupClarifyingQuestionsSupportingEvidenceUploadController } from './controllers/clarifying-questions/supporting-evidence';
import { setupSupportingEvidenceQuestionController } from './controllers/clarifying-questions/supporting-evidence-question-page';
import { setupDetailViewersController } from './controllers/detail-viewers';
import { setupEligibilityController } from './controllers/eligibility';
import { setupNotFoundController } from './controllers/file-not-found';
import { setupFooterController } from './controllers/footer';
import { setupForbiddenController } from './controllers/forbidden';
import { setupGuidancePagesController } from './controllers/guidance-page';
import { setupHealthController } from './controllers/health';
import { setupIdamController } from './controllers/idam';
import { setupCheckAndSendController as setupReasonsForAppealCheckAndSendController } from './controllers/reasons-for-appeal/check-and-send';
import { setupReasonsForAppealController } from './controllers/reasons-for-appeal/reason-for-appeal';
import { setupSessionController } from './controllers/session';
import { setupStartController } from './controllers/startController';
import { isJourneyAllowedMiddleware } from './middleware/journeyAllowed-middleware';
import { logSession } from './middleware/session-middleware';
import { AuthenticationService } from './service/authentication-service';
import { CcdService } from './service/ccd-service';
import { DocumentManagementService } from './service/document-management-service';
import IdamService from './service/idam-service';
import S2SService from './service/s2s-service';
import UpdateAppealService from './service/update-appeal-service';
import { setupSecrets } from './setupSecrets';

const config = setupSecrets();
const sessionLoggerEnabled: boolean = config.get('session.useLogger');

const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
const updateAppealService: UpdateAppealService = new UpdateAppealService(new CcdService(), authenticationService);
const documentManagementService: DocumentManagementService = new DocumentManagementService(authenticationService);
const osPlacesClient: OSPlacesClient = new OSPlacesClient(config.get('addressLookup.token'), requestPromise, config.get('addressLookup.url'));

const router = express.Router();

const indexController = setupIndexController();
const startController = setupStartController();
const healthController = setupHealthController();
const notFoundController = setupNotFoundController();
const idamController = setupIdamController();

const middleware = [ isJourneyAllowedMiddleware ];

const applicationOverview = setupApplicationOverviewController(updateAppealService);
const taskListController = setupTaskListController(middleware);
const homeOfficeDetailsController = setupHomeOfficeDetailsController(middleware, updateAppealService);
const typeOfAppealController = setupTypeOfAppealController(middleware, updateAppealService);
const personalDetailsController = setupPersonalDetailsController(middleware, { updateAppealService, osPlacesClient });
const contactDetailsController = setupContactDetailsController(middleware, updateAppealService);
const checkAndSendController = setupCheckAndSendController(middleware, updateAppealService);
const confirmationController = setConfirmationController(middleware);
const outOfTimeController = setupOutOfTimeController(middleware, { updateAppealService, documentManagementService });
const reasonsForAppealController = setupReasonsForAppealController(middleware, { updateAppealService, documentManagementService });
const reasonsForAppealCYAController = setupReasonsForAppealCheckAndSendController(middleware, updateAppealService);
const detailViewersController = setupDetailViewersController(documentManagementService);
const eligibilityController = setupEligibilityController();
const GuidancePages = setupGuidancePagesController();
const footerController = setupFooterController();
const sessionController = setupSessionController();
const forbiddenController = setupForbiddenController();
const askForMoreTime = setupAskForMoreTimeController({ updateAppealService, documentManagementService });
const clarifyingQuestionsListController = setupClarifyingQuestionsListController(middleware);
const clarifyingQuestionPageController = setupClarifyingQuestionPageController(middleware, updateAppealService);
const clarifyingQuestionsSupportingEvidenceController = setupSupportingEvidenceQuestionController(middleware, { updateAppealService, documentManagementService });
const clarifyingQuestionsSupportingEvidenceUploadController = setupClarifyingQuestionsSupportingEvidenceUploadController(middleware, { updateAppealService, documentManagementService });

// not protected by idam
router.use(indexController);
router.use(healthController);
router.use(startController);
router.use(eligibilityController);
router.use(GuidancePages);
router.use(footerController);
router.use(sessionController);
router.use(notFoundController);

// protected by idam
router.use(idamController);
router.use(askForMoreTime);
// router.use(initSession);
if (process.env.NODE_ENV === 'development' && sessionLoggerEnabled) {
  router.use(logSession);
}

router.use(taskListController);
router.use(homeOfficeDetailsController);
router.use(personalDetailsController);
router.use(typeOfAppealController);
router.use(contactDetailsController);
router.use(confirmationController);
router.use(checkAndSendController);
router.use(outOfTimeController);
router.use(applicationOverview);

router.use(reasonsForAppealController);
router.use(reasonsForAppealCYAController);
router.use(clarifyingQuestionsListController);
router.use(clarifyingQuestionPageController);
router.use(clarifyingQuestionsSupportingEvidenceController);
router.use(clarifyingQuestionsSupportingEvidenceUploadController);
router.use(detailViewersController);
router.use(forbiddenController);

export { router };
