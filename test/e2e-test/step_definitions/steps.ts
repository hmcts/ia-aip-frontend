const { checkAndSend } = require('../pages/check-and-send/check-and-send');
const { pcqQuestions } = require('../pages/pcq-questions/pcq-questions');
const { typeOfAppeal } = require('../pages/type-of-appeal/type-of-appeal');
const { decisionType } = require('../pages/decision-type/decision-type');
const { oocProtectionDepartureDate } = require('../pages/ooc-details/out-of-country');
const { outOfTimeAppeal } = require('../pages/out-of-time-appeal/out-of-time');
const { signIn } = require('../pages/sign-in');
const { common } = require('../pages/common/common');
const { fileUploadCommon } = require('../pages/common/file-upload-common');
const { homeOfficeReferenceNumber } = require('../pages/home-office-details/home-office-reference-number');
const { homeOfficeLetterSent } = require('../pages/home-office-details/home-office-letter-sent');
const { taskList } = require('../pages/task-list');
const { namePage } = require('../pages/personal-details/personal-details-name');
const { dateOfBirth } = require('../pages/personal-details/personal-details-date-of-birth');
const { nationality } = require('../pages/personal-details/personal-details-nationality');
const { enterPostcode } = require('../pages/personal-details/personal-details-enter-postcode');
const { selectAddress } = require('../pages/personal-details/personal-details-select-address');
const { enterAddress } = require('../pages/personal-details/personal-details-enter-address');
const { oocAddress } = require('../pages/personal-details/personal-details-ooc-address');
const { contactDetails } = require('../pages/contact-details/contact-details-page');
const { hasSponsor } = require('../pages/sponsor-details/has-sponsor');
const { sponsorName } = require('../pages/sponsor-details/sponsor-details-name');
const { sponsorAddress } = require('../pages/sponsor-details/sponsor-enter-address');
const { sponsorContactDetails } = require('../pages/sponsor-details/sponsor-contact-details');
const { sponsorAuthorisation } = require('../pages/sponsor-details/sponsor-authorisation');
const { reasonsForAppeal } = require('../pages/reasons-for-appeal/reasons-for-appeal');
const { reasonsForAppealCYA } = require('../pages/reasons-for-appeal/reasons-for-appeal-cya');
const { reasonsForAppealConfirmation } = require('../pages/reasons-for-appeal/reasons-for-appeal-confirmation');
const { eligibilityQuestions } = require('../pages/eligibility-questions/eligibility-question-page');
const { eligible } = require('../pages/eligibility-questions/eligible-page');
const { ineligibile } = require('../pages/eligibility-questions/ineligible-page');
const { overviewPage } = require('../pages/overview-page/overview-page');
const { error404 } = require('../pages/error-pages/404-error-page');
const { guidancePages } = require('../pages/guidance-pages/guidance-pages');
const { appealSent } = require('../pages/appeal-sent/appeal-sent');
const { askForMoreTime } = require('../pages/ask-for-more-time/ask-for-more-time');
const { caseProgression } = require('../service/case-progression-service');
const { clarifyingQuestions } = require('../pages/clarifying-questions/clarifying-questions');
const { submitHearingRequirements } = require('../pages/submit-hearing-requirements/submit-hearing-requirements');
const { cmaRequirements } = require('../pages/cma-requirements/cma-requirements');
const { uploadAddendumEvidence } = require('../pages/provide-more-evidence/upload-addendum-evidence');
const { makeHearingApplication } = require('../pages/make-application/make-hearing-application');
const { makeAppealApplication } = require('../pages/make-application/make-appeal-application');
const { changeRepresentation } = require('../pages/change-representation/change-representation');
const { startRepresentingYourself } = require('../pages/start-representing-yourself/start-representing-yourself');
const { aipToLegalRepNoC } = require('../pages/aip-to-legal-rep-noc/aip-to-legal-rep-noc');
const { legalRepCreateCase } = require('../pages/legal-rep-create-case/legal-rep-create-case');
const { applyForFTPAAppellant } = require('../pages/ftpa/apply-for-ftpa');

const { I, retries } = inject();

Before((test) => {
  test.retries(5);
});

common(I);
fileUploadCommon(I);

signIn(I);

taskList(I);
typeOfAppeal(I);
homeOfficeReferenceNumber(I);
homeOfficeLetterSent(I);
namePage(I);
dateOfBirth(I);
nationality(I);
enterPostcode(I);
selectAddress(I);
enterAddress(I);
oocAddress(I);
contactDetails(I);
hasSponsor(I);
sponsorName(I);
sponsorAddress(I);
sponsorContactDetails(I);
sponsorAuthorisation(I);
decisionType(I);
oocProtectionDepartureDate(I);
outOfTimeAppeal(I);
checkAndSend(I);
pcqQuestions(I);
reasonsForAppeal(I);
reasonsForAppealCYA(I);
reasonsForAppealConfirmation(I);
eligibilityQuestions(I);
eligible(I);
ineligibile(I);
overviewPage(I);
error404(I);
guidancePages(I);
appealSent(I);
askForMoreTime(I);
caseProgression(I);
clarifyingQuestions(I);
submitHearingRequirements(I);
cmaRequirements(I);
uploadAddendumEvidence(I);
makeHearingApplication(I);
makeAppealApplication(I);
changeRepresentation(I);
startRepresentingYourself(I);
aipToLegalRepNoC(I);
legalRepCreateCase(I);
applyForFTPAAppellant(I);
