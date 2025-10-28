import { getCitizenUserFromThread } from './user-service';

const config = require('config');
const caseOfficerUserName = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword = process.env.TEST_CASEOFFICER_PASSWORD;
const adminOfficerUserName = config.get('testAccounts.testAdminOfficerUserName');
const adminOfficerPassword = process.env.TEST_ADMINOFFICER_PASSWORD;
const judgeUserName = config.get('testAccounts.testJudgeUserName');
const judgePassword = process.env.TEST_JUDGE_X_PASSWORD;

const testUrl = config.get('testUrl');
let exUiUrl;
let caseUrl;

if (testUrl.includes('localhost')) {
  exUiUrl = 'http://localhost:3002/';
} else if (testUrl.includes('aat') || testUrl.includes('preview')) {
  exUiUrl = 'https://manage-case.aat.platform.hmcts.net/';
} else if (testUrl.includes('demo')) {
  exUiUrl = 'https://manage-case.demo.platform.hmcts.net/';
}
let onlineCaseReference: string;

module.exports = {
  manualCaseProgression(I) {
    When(/^I grab the Online Case Reference$/, async () => {
      await I.click('I am no longer representing myself');
      await I.waitForText('Online case reference number:', 45);
      let ref = await I.grabTextFrom('//li');
      onlineCaseReference = ref.split('Online case reference number: ')[1];
      caseUrl = exUiUrl + 'cases/case-details/' + onlineCaseReference.split('-').join('');
    });

    When(/^I sign in as a Case Officer and Request Home Office data$/, async () => {
      await I.amOnPage(exUiUrl);
      await I.waitForText('Sign in or create an account', 45);
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 45);
      await I.amOnPage(caseUrl);
      await I.waitForText('Do this next', 45);
      await I.selectOption('#next-step', 'Request Home Office data');
      await I.handleNextStep('Match appellant details', 'requestHomeOfficeData', onlineCaseReference);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Request Home Office data');
      await I.waitForText('You have matched the appellant details', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I Request respondent evidence$/, async () => {
      await I.selectOption('#next-step', 'Request respondent evidence');
      await I.handleNextStep('You are directing the Home Office to supply their documents and evidence.', 'requestRespondentEvidence', onlineCaseReference);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Send direction');
      await I.waitForText('You have sent a direction', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 45);
      await I.see('What happens next');
    });

    When(/^I Request the reasons for appeal$/, async () => {
      await I.selectOption('#next-step', 'AiP - Request Appeal Reasons');
      await I.handleNextStep('Explain the direction you are issuing', 'requestReasonsForAppeal', onlineCaseReference);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Submit');
      await I.waitForText('You have sent a direction', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I sign in as a Case Officer and Ask Clarifying Questions$/, async () => {
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'AiP - Ask clarifying questions');
      await I.handleNextStep('Direct the appellant to answer clarifying questions', 'sendDirectionWithQuestions', onlineCaseReference);
      await I.click('Add new');
      await I.fillField('#sendDirectionQuestions_0_question', 'This is question that is to be answered');
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Submit');
      await I.waitForText('Your direction has been sent', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I sign in as a Case Officer and Request respondent review$/, async () => {
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'Request respondent review');
      await I.handleNextStep('You are directing the respondent to review and respond to the appeal skeleton argument.', 'requestRespondentReview', onlineCaseReference);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Send direction');
      await I.waitForText('You have sent a direction', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I Force the case to submit hearing requirements$/, async () => {
      await I.selectOption('#next-step', 'Force case - hearing reqs');
      await I.handleNextStep('Reasons to force the case progression', 'forceCaseToSubmitHearingRequirements', onlineCaseReference);
      await I.click('Continue');
      await I.fillField('#reasonToForceCaseToSubmitHearingRequirements', 'this is a reason to force case to submit hearing requirements');
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Submit');
      await I.waitForText("You've forced the case progression to submit hearing requirements", 45);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 45);
      await I.see('What happens next');
    });

    When(/^I sign in as a Case Officer and Review and record the hearing requirements$/, async () => {
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'Hearing requirements');
      await I.click('Go');
      await I.waitForText('Review the appellant\'s hearing requirements and select length of hearing.', 45);
      await I.selectOption('#listCaseHearingLength', '1 hour');
      await I.click('Continue');
      await I.waitForText('Additional adjustments', 45);
      await I.fillField('#remoteVideoCallTribunalResponse', 'Some adjustments the Tribunal will need to provide.');
      await I.click('Continue');
      await I.waitForText('Does the appellant have any physical or mental health issues that may impact them on the day?', 45);
      await I.click('Continue');
      await I.waitForText('Do you have multimedia evidence?', 45);
      await I.click('Continue');
      await I.waitForText('Does the appellant need a single-sex court?', 45);
      await I.click('Continue');
      await I.waitForText('Does the appellant need an in camera court?', 45);
      await I.click('Continue');
      await I.waitForText('Is there anything else you would like to request?', 45);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Submit');
      await I.waitForText('You\'ve recorded the agreed hearing adjustments', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 45);
      await I.see('What happens next');
    });

    When(/^I sign in as an Admin Officer and List the case$/, async () => {
      await I.waitForText('Sign out', 45);
      await I.click('Sign out');
      await I.waitForText('Sign in', 45);
      await I.fillField('#username', adminOfficerUserName);
      await I.fillField('#password', adminOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 45);
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'List the case');
      await I.handleNextStep('Add the hearing details below.', 'listCase', onlineCaseReference);
      await I.fillField('#ariaListingReference', 'LP/12345/2022');
      await I.checkOption('#isRemoteHearing_No');
      await I.fillField('#listCaseHearingDate-day', '10');
      await I.fillField('#listCaseHearingDate-month', '10');
      await I.fillField('#listCaseHearingDate-year', '2025');
      await I.click('Continue');
      await I.see('Check your answers');
      await I.click('List case');
      await I.waitForText('You have listed the case', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 45);
      await I.see('What happens next');
    });

    When(/^I sign in as a Case Officer and Create the case summary$/, async () => {
      await I.click('Sign out');
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 45);
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'Create case summary');
      await I.handleNextStep('Create a case summary and upload it below', 'createCaseSummary', onlineCaseReference);
      await I.attachFile("input[type='file']", `/test/files/valid-image-file.png`);
      await I.fillField('#caseSummaryDescription', 'case summary document');
      await I.wait(5);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Upload');
      await I.waitForText('You have uploaded the case summary', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I Generate the hearing bundle$/, async () => {
      await I.selectOption('#next-step', 'Generate hearing bundle');
      try {
        await I.click('Go');
        await I.waitInUrl('/trigger/generateHearingBundle/submit', 60);
      } catch {
        await I.amOnPage(exUiUrl + 'cases/case-details/' + onlineCaseReference + '/trigger/generateHearingBundle/submit');
        await I.waitInUrl('/trigger/generateHearingBundle/submit', 60);
      }
      await I.see('Generate hearing bundle', 'h1');
      await I.click('Generate');
      await I.waitForText('The hearing bundle is being generated', 45);
      await I.wait(15);
      await I.click('Close and Return to case details');
      await I.wait(2);
      await I.refreshPage();
      await I.waitForText('Do this next', 45);
    });

    When(/^I Start decision and reasons$/, async () => {
      await I.selectOption('#next-step', 'Start decision and reasons');
      await I.handleNextStep('Write a brief introduction to the case', 'decisionAndReasonsStarted', onlineCaseReference);
      await I.click('Continue');
      await I.waitForText('Add the appellant\'s case summary', 45);
      await I.click('Continue');
      await I.waitForText('Do both parties agree the immigration history?', 45);
      await I.click('No');
      await I.click('Continue');
      await I.waitForText('Do both parties agree the schedule of issues?', 45);
      await I.click('No');
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Save');
      await I.waitForText('You have started the decision and reasons process', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 45);
      await I.see('What happens next');
    });

    When(/^I sign in as a Judge and Prepare Decision and Reasons$/, async () => {
      await I.click('Sign out');
      await I.fillField('#username', judgeUserName);
      await I.fillField('#password', judgePassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 45);
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'Prepare Decision and Reasons');
      await I.handleNextStep('Are you giving an anonymity direction?', 'generateDecisionAndReasons', onlineCaseReference);
      await I.click('No');
      await I.click('Continue');
      await I.waitForText('Give the names of the legal representatives in this case', 45);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Generate');
      await I.waitForText('The Decision and Reasons document is ready to download', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I Complete the Decision and Reasons$/, async () => {
      await I.waitForText('Current progress of the case', 45);
      await I.selectOption('#next-step', 'Complete decision and reasons');
      await I.handleNextStep('What is your decision?', 'sendDecisionAndReasons', onlineCaseReference);
      await I.checkOption('#isDecisionAllowed-allowed');
      await I.click('Continue');
      await I.waitForText('Upload your decision and reasons', 45);
      await I.attachFile("input[type='file']", `/test/files/valid-pdf-file.pdf`);
      await I.wait(5);
      await I.checkOption('#isDocumentSignedToday_values-isDocumentSignedToday');
      await I.checkOption('#isFeeConsistentWithDecision_values-isFeeConsistentWithDecision');
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Upload');
      await I.waitForText('You\'ve uploaded the Decision and Reasons document', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('No further action required.', 45);
      await I.see('No further action required.');
    });

    When(/^I sign in as a Case Officer and End the appeal$/, async () => {
      await I.amOnPage(exUiUrl);
      await I.waitForText('Sign in or create an account', 45);
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 45);
      await I.amOnPage(exUiUrl + 'cases/case-details/' + getCitizenUserFromThread().caseId);
      await I.waitForText('Do this next', 45);
      await I.selectOption('#next-step', 'End the appeal');
      await I.handleNextStep('This appeal has ended. Record the outcome and reasons below.', 'endAppeal', onlineCaseReference);
      await I.click('#endAppealOutcome-Withdrawn');
      await I.fillField('#endAppealOutcomeReason', 'a reason for outcome');
      await I.click('Continue');
      await I.waitForText('Record who approved this outcome.', 45);
      await I.click('#endAppealApproverType-Judge');
      await I.fillField('#endAppealApproverName', 'Judgy Judge');
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('End appeal');
      await I.waitForText('You have ended the appeal', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 45);
      await I.see('What happens next');
    });

    When(/^I Force the case to case under review$/, async () => {
      await I.selectOption('#next-step', 'Force case - case under review');
      await I.handleNextStep('Reasons to force the case progression', 'forceCaseToCaseUnderReview', onlineCaseReference);
      await I.click('Continue');
      await I.fillField('#reasonToForceCaseToCaseUnderReview', 'this is a reason to force case to case under review');
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Submit');
      await I.waitForText('You have forced the case progression to case under review', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I Request respondent review$/, async () => {
      await I.selectOption('#next-step', 'Request respondent review');
      await I.handleNextStep('You are directing the respondent to review and respond to the appeal skeleton argument.', 'requestRespondentReview', onlineCaseReference);
      await I.click('Continue');
      await I.waitForText('Check your answers', 45);
      await I.click('Send direction');
      await I.waitForText('You have sent a direction', 45);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 45);
      await I.see('Do this next');
    });

    When(/^I List without requirements$/, async () => {
      await I.selectOption('#next-step', 'List without requirements');
      await I.handleNextStep('Listing length', 'listCaseWithoutHearingRequirements', onlineCaseReference);
      await I.fillField('#listingLength_hours', '1');
      await I.click('Continue');
      await I.waitForText('What hearing channel type is required?', 60);
      await I.checkOption('#hearingChannel_INTER');
      await I.click('Continue');
      await I.waitForText('Is the appeal suitable to float', 60);
      await I.checkOption('No');
      await I.click('Continue');
      await I.waitForText('Are there any additional instructions for the hearing?', 60);
      await I.checkOption('No');
      await I.click('Continue');
      await I.waitForText('Check your answers', 60);
      await I.click('Submit');
      await I.waitForText("You've recorded the agreed hearing adjustments", 60);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 60);
      await I.see('What happens next');
    });
  }
};
