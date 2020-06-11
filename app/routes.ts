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
import { setupCQAnythingElseAnswerController } from './controllers/clarifying-questions/anything-else-answer';
import { setupCQAnythingElseQuestionController } from './controllers/clarifying-questions/anything-else-question';
import { setupClarifyingQuestionsCheckSendController } from './controllers/clarifying-questions/check-and-send';
import { setupClarifyingQuestionsConfirmationPage } from './controllers/clarifying-questions/confirmation-page';
import { setupClarifyingQuestionPageController } from './controllers/clarifying-questions/question-page';
import { setupClarifyingQuestionsListController } from './controllers/clarifying-questions/questions-list';
import { setupClarifyingQuestionsSupportingEvidenceUploadController } from './controllers/clarifying-questions/supporting-evidence';
import { setupSupportingEvidenceQuestionController } from './controllers/clarifying-questions/supporting-evidence-question-page';
import { setupAccessNeedsController } from './controllers/cma-requirements/access-needs/access-needs';
import { setupAnythingElseQuestionController } from './controllers/cma-requirements/other-needs/anything-else-question';
import { setupAnythingElseReasonController } from './controllers/cma-requirements/other-needs/anything-else-reason';
import { setupBringMultimediaEquipmentQuestionController } from './controllers/cma-requirements/other-needs/bring-equipment-question';
import { setupMultimediaEquipmentReasonController } from './controllers/cma-requirements/other-needs/bring-equipment-reason';
import { setupHealthConditionsQuestionController } from './controllers/cma-requirements/other-needs/health-conditions-question';
import { setupHealthConditionsReasonController } from './controllers/cma-requirements/other-needs/health-conditions-reason';
import { setupMultimediaEvidenceQuestionController } from './controllers/cma-requirements/other-needs/multimedia-evidence-question';
import { setupPastExperiencesQuestionController } from './controllers/cma-requirements/other-needs/past-experiences-question';
import { setupPastExperiencesReasonController } from './controllers/cma-requirements/other-needs/past-experiences-reason';
import { setupPrivateAppointmentQuestionController } from './controllers/cma-requirements/other-needs/private-appointment-question';
import { setupPrivateAppointmentReasonController } from './controllers/cma-requirements/other-needs/private-appointment-reason';
import { setupSingleSexAppointmentAllFemaleReasonController } from './controllers/cma-requirements/other-needs/single-sex-appointment-all-female-reason';
import { setupSingleSexAppointmentAllMaleReasonController } from './controllers/cma-requirements/other-needs/single-sex-appointment-all-male-reason';
import { setupSingleSexAppointmentQuestionController } from './controllers/cma-requirements/other-needs/single-sex-appointment-question';
import { setupSingleSexTypeAppointmentQuestionController } from './controllers/cma-requirements/other-needs/single-sex-type-appointment-question';
import { setupCMARequirementsStartPageController } from './controllers/cma-requirements/other-needs/start-page';
import { setupCmaRequirementsTaskListController } from './controllers/cma-requirements/task-list';
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
import { isJourneyAllowedMiddleware, isTimeExtensionsInProgress } from './middleware/journeyAllowed-middleware';
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
const updateAppealService: UpdateAppealService = new UpdateAppealService(new CcdService(), authenticationService, S2SService.getInstance());
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
const askForMoreTime = setupAskForMoreTimeController([ isTimeExtensionsInProgress ], { updateAppealService, documentManagementService });
const clarifyingQuestionsListController = setupClarifyingQuestionsListController(middleware);
const clarifyingQuestionPageController = setupClarifyingQuestionPageController(middleware, updateAppealService);
const clarifyingQuestionsSupportingEvidenceController = setupSupportingEvidenceQuestionController(middleware, { updateAppealService, documentManagementService });
const clarifyingQuestionsSupportingEvidenceUploadController = setupClarifyingQuestionsSupportingEvidenceUploadController(middleware, { updateAppealService, documentManagementService });
const clarifyingQuestionsAnythingElseQuestionController = setupCQAnythingElseQuestionController(middleware, updateAppealService, documentManagementService);
const clarifyingQuestionsAnythingElseAnswerController = setupCQAnythingElseAnswerController(middleware, updateAppealService);
const clarifyingQuestionsCYAController = setupClarifyingQuestionsCheckSendController(middleware, updateAppealService);
const clarifyingQuestionsConfirmationPageController = setupClarifyingQuestionsConfirmationPage(middleware);
const cmaRequirementsTaskListController = setupCmaRequirementsTaskListController(middleware);
const cmaRequirementsAccessNeedsController = setupAccessNeedsController(middleware, updateAppealService);
const cmaRequirementsStartPageController = setupCMARequirementsStartPageController(middleware);
const cmaRequirementsMultimediaEvidenceQuestionController = setupMultimediaEvidenceQuestionController(middleware, updateAppealService);
const cmaRequirementsBringEquipmentQuestionController = setupBringMultimediaEquipmentQuestionController(middleware, updateAppealService);
const cmaRequirementsBringEquipmentReasonController = setupMultimediaEquipmentReasonController(middleware, updateAppealService);
const cmaRequirementsSingleSexAppointmentQuestionController = setupSingleSexAppointmentQuestionController(middleware, updateAppealService);
const cmaRequirementsSingleSexTypeAppointmentQuestionController = setupSingleSexTypeAppointmentQuestionController(middleware, updateAppealService);
const cmaRequirementsSingleSexAllMaleReasonAppointmentController = setupSingleSexAppointmentAllMaleReasonController(middleware, updateAppealService);
const cmaRequirementsSingleSexAllFemaleReasonAppointmentController = setupSingleSexAppointmentAllFemaleReasonController(middleware, updateAppealService);
const cmaRequirementsPrivateAppointmentQuestionController = setupPrivateAppointmentQuestionController(middleware, updateAppealService);
const cmaRequirementsPrivateReasonController = setupPrivateAppointmentReasonController(middleware, updateAppealService);
const cmaRequirementsHealthConditionsQuestionController = setupHealthConditionsQuestionController(middleware, updateAppealService);
const cmaRequirementsHealthConditionsReasonController = setupHealthConditionsReasonController(middleware, updateAppealService);
const cmaRequirementsPastExperiencesQuestionController = setupPastExperiencesQuestionController(middleware, updateAppealService);
const cmaRequirementsPastExperiencesReasonController = setupPastExperiencesReasonController(middleware, updateAppealService);
const cmaRequirementsAnythingElseQuestionController = setupAnythingElseQuestionController(middleware, updateAppealService);
const cmaRequirementsAnythingElseReasonController = setupAnythingElseReasonController(middleware, updateAppealService);

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
router.use(clarifyingQuestionsAnythingElseQuestionController);
router.use(clarifyingQuestionsAnythingElseAnswerController);
router.use(clarifyingQuestionsCYAController);
router.use(clarifyingQuestionsConfirmationPageController);

router.use(cmaRequirementsTaskListController);
router.use(cmaRequirementsAccessNeedsController);
router.use(cmaRequirementsStartPageController);
router.use(cmaRequirementsMultimediaEvidenceQuestionController);
router.use(cmaRequirementsBringEquipmentQuestionController);
router.use(cmaRequirementsBringEquipmentReasonController);
router.use(cmaRequirementsSingleSexAppointmentQuestionController);
router.use(cmaRequirementsSingleSexTypeAppointmentQuestionController);
router.use(cmaRequirementsSingleSexAllMaleReasonAppointmentController);
router.use(cmaRequirementsSingleSexAllFemaleReasonAppointmentController);
router.use(cmaRequirementsPrivateAppointmentQuestionController);
router.use(cmaRequirementsPrivateReasonController);
router.use(cmaRequirementsHealthConditionsQuestionController);
router.use(cmaRequirementsHealthConditionsReasonController);
router.use(cmaRequirementsPastExperiencesQuestionController);
router.use(cmaRequirementsPastExperiencesReasonController);
router.use(cmaRequirementsAnythingElseQuestionController);
router.use(cmaRequirementsAnythingElseReasonController);

router.use(detailViewersController);
router.use(forbiddenController);

export { router };
