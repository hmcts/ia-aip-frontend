import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import { CcdService } from '../../../app/service/ccd-service';
import { AuthenticationService } from './authentication-service';
import { updateAppeal } from './ccd-service';
import { aipCurrentUser, getUserId, getUserToken } from './idam-service';
import { getS2sToken } from './s2s-service';

const config = require('config');
const caseOfficerUserName = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword = config.get('testAccounts.testCaseOfficerPassword');
const adminOfficerUserName = config.get('testAccounts.testAdminOfficerUserName');
const adminOfficerPassword = config.get('testAccounts.testAdminOfficerPassword');
const judgeUserName = config.get('testAccounts.testJudgeUserName');
const judgePassword = config.get('testAccounts.testJudgePassword');

const testUrl = config.get('testUrl');
let exUiUrl;
let caseUrl;

if (testUrl.includes('localhost')) {
  exUiUrl = 'http://localhost:3002/';
} else if (testUrl.includes('ia-case-api-pr-1911-aip-frontend')) {
  exUiUrl = 'https://xui-ia-case-api-pr-1911.preview.platform.hmcts.net/';
} else if (testUrl.includes('aat') || testUrl.includes('preview')) {
  exUiUrl = 'https://manage-case.aat.platform.hmcts.net/';
} else if (testUrl.includes('demo')) {
  exUiUrl = 'https://manage-case.demo.platform.hmcts.net/';
}
let appealReference;
const docStoreUrl = config.get('documentManagement.apiUrl');

const authenticationService = new AuthenticationService();
const ccdService = new CcdService();

// tslint:disable:no-console
async function fetchAipUserCaseData() {
  console.info('======================');
  console.info('Fetching AIP Case data');
  console.info('======================');
  const userToken = await getUserToken(aipCurrentUser);
  const userId = await getUserId(userToken);
  const serviceToken = await getS2sToken();
  const securityHeaders = { userToken, serviceToken };
  return ccdService.loadCasesForUser(userId, securityHeaders);
}

module.exports = {

  caseProgression(I) {

    Then(/^I sign in as a Case Officer and request HO Bundle$/, async () => {

      let caseDetails: any = await fetchAipUserCaseData();

      const userToken = await authenticationService.signInAsCaseOfficer();
      const userId = await getUserId(userToken);
      const serviceToken = await getS2sToken();
      const securityHeaders = { userToken, serviceToken };
      // load case
      caseDetails[0].case_data = {
        'sendDirectionExplanation': 'Send your evidence',
        'sendDirectionDateDue': '2022-01-01',
        'directions': [ {
          'id': '1',
          'value': {
            'tag': 'respondentEvidence',
            'dateDue': '2020-03-12',
            'parties': 'respondent',
            'dateSent': '2020-02-27',
            'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
            'previousDates': []
          }
        } ],
        ...caseDetails[0].case_data
      };
      const requestRespondentEvidence = {
        id: 'requestRespondentEvidence',
        summary: 'Request respondent evidence',
        description: 'Request respondent evidence'
      };
      await updateAppeal(requestRespondentEvidence, userId, caseDetails[0], securityHeaders);
    });

    Then(/^I sign in as a Case Officer and request the reasons for appeal$/, async () => {

      let caseDetails: any = await fetchAipUserCaseData();

      const userToken = await authenticationService.signInAsCaseOfficer();
      const userId = await getUserId(userToken);
      const serviceToken = await getS2sToken();
      const securityHeaders = { userToken, serviceToken };
      // load case
      caseDetails[0].case_data = {
        'sendDirectionExplanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'sendDirectionDateDue': '2021-03-26',
        'sendDirectionParties': 'appellant',
        'directions': [ {
          'id': '2',
          'value': {
            'tag': 'requestReasonsForAppeal',
            'dateDue': '2020-03-26',
            'parties': 'appellant',
            'dateSent': '2020-02-27',
            'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
            'previousDates': []
          }
        } ],
        ...caseDetails[0].case_data
      };
      const requestRespondentEvidence = {
        id: 'requestReasonsForAppeal',
        summary: 'Request reasons for appeal',
        description: 'Request reasons for appeal'
      };
      await updateAppeal(requestRespondentEvidence, userId, caseDetails[0], securityHeaders);
    });

    Then(/^I sign in as a Case Officer and request HO data to match appellant details$/, async () => {
      let caseDetails: any = await fetchAipUserCaseData();

      const userToken = await authenticationService.signInAsCaseOfficer();
      const userId = await getUserId(userToken);
      const serviceToken = await getS2sToken();
      const securityHeaders = { userToken, serviceToken };

      // load case
      caseDetails[0].case_data = {
        // 'homeOfficeReferenceNumber': '1212-0099-0062-8083',
        'homeOfficeSearchResponse': '"{"messageHeader":{"eventDateTime":"2020-08-25T08:30:29.305206Z","correlationId":"bbd96db3-090d-41c9-beda-f5c1763013b3","consumer":{"code":"HMCTS","description":"HM Courts and Tribunal Service"}},"messageType":"RESPONSE_RIGHT_OF_APPEAL_DETAILS","status":[{"person":{"givenName":null,"familyName":"TestSix","fullName":"Asylumcase TestSix","gender":{"code":"F","description":"Female"},"dayOfBirth":4,"monthOfBirth":4,"yearOfBirth":1995,"nationality":{"code":"CHL","description":"Chile"}},"applicationStatus":{"documentReference":"1212-0099-0062-8083","roleType":{"code":"SPOUSE","description":"Spouse"},"roleSubType":null,"applicationType":{"code":"ASYLUM","description":"Asylum and Protection"},"claimReasonType":null,"decisionType":{"code":"REFUSE","description":"SD outcome"},"decisionDate":"2020-07-30T00:00:00Z","decisionCommunication":null,"rejectionReasons":[{"reason":"Refused asylum"}],"metadata":null}}]}',
        'homeOfficeAppellantsList': {
          'value': {
            'code': 'NoMatch',
            'label': 'No Match'
          },
          'list_items': [
            {
              'code': 'AsylumcaseTestFive',
              'label': 'AsylumcaseTestFive-040495'
            },
            {
              'code': 'NoMatch',
              'label': 'No Match'
            }
          ]
        },
        ...caseDetails[0].case_data
      };

      const requestHomeOfficeData = {
        id: 'requestHomeOfficeData',
        summary: 'Request Home office data',
        description: 'Request Home office data'
      };

      const { data_classification, security_classifications, ...caseDetailsData } = caseDetails[0];

      console.log('match appellant details with body', JSON.stringify(caseDetailsData, null, 2));

      await updateAppeal(requestHomeOfficeData, userId, caseDetails[0], securityHeaders);
    });

    Then(/^I sign in as a Home Office Generic and upload the HO Bundle$/, async () => {
      let caseDetails: any = await fetchAipUserCaseData();

      const userToken = await authenticationService.signInAsHomeOfficeOfficer();
      const userId = await getUserId(userToken);
      const serviceToken = await getS2sToken();
      const securityHeaders = { userToken, serviceToken };
      // load case
      caseDetails[0].case_data = {
        'homeOfficeBundle': [
          {
            'id': '1',
            'value': {
              'document': {
                'document_url': `${docStoreUrl}/documents/193b760d-bb26-45fa-8446-70bdf758e30f`,
                'document_binary_url': `${docStoreUrl}/documents/193b760d-bb26-45fa-8446-70bdf758e30f/binary`,
                'document_filename': 'some-new-evidence.pdf'
              },
              'description': 'Some new evidence'
            }
          },
          {
            'id': '2',
            'value': {
              'document': {
                'document_url': `${docStoreUrl}/documents/b3efa0a3-84d7-4d7c-8dbf-bd081169e066`,
                'document_binary_url': `${docStoreUrl}/documents/b3efa0a3-84d7-4d7c-8dbf-bd081169e066/binary`,
                'document_filename': 'some-more-new-evidence.pdf'
              },
              'description': 'Some more new evidence'
            }
          }
        ],
        ...caseDetails[0].case_data
      };
      const requestRespondentEvidence = {
        id: 'uploadHomeOfficeBundle',
        summary: 'Upload Home office bundle',
        description: 'Upload Home office bundle'
      };

      await updateAppeal(requestRespondentEvidence, userId, caseDetails[0], securityHeaders);
    });

    Then(/^I sign in as a Case Officer and send directions with Clarifying Questions$/, async () => {
      let caseDetails: any = await fetchAipUserCaseData();
      const userToken = await authenticationService.signInAsCaseOfficer();
      const userId = await getUserId(userToken);
      const serviceToken = await getS2sToken();
      const securityHeaders = { userToken, serviceToken };
      caseDetails[0].case_data = {
        'sendDirectionExplanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'sendDirectionDateDue': '2021-03-26',
        'sendDirectionParties': 'appellant',
        'sendDirectionQuestions': [
          {
            'id': '1',
            'value': {
              'question': 'Give us some more information about:\n- What are their ages?\n  - What are their names?'
            }
          },
          {
            'id': '2',
            'value': {
              'question': 'Tell us more about your health issues\n- How long have you suffered from this problem?\n- How does it affect your daily life?'
            }
          }
        ],
        ...caseDetails[0].case_data
      };
      await updateAppeal(Events.SEND_DIRECTION_WITH_QUESTIONS, userId, caseDetails[0], securityHeaders);
    });

    When(/^I grab the Appeal Reference$/, async () => {
      await I.click('See your appeal progress');
      await I.waitForText('Appeal reference', 30);
      await I.click('I am no longer representing myself');
      await I.waitForText('Online case reference number:', 30);
      let ref = await I.grabTextFrom('//li');
      appealReference = ref.split('Online case reference number: ')[1];
      caseUrl = exUiUrl + 'cases/case-details/' + appealReference.split('-').join('');
    });
    When(/^I sign in as a Case Officer$/, async () => {
      console.log(exUiUrl);
      await I.amOnPage(exUiUrl);
      await I.waitForText('Sign in or create an account', 30);
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 30);
      await I.amOnPage(caseUrl);
      await I.waitForText('Do this next', 30);
    });
    When(/^I sign in as a Case Officer and Request Home Office data$/, async () => {
      console.log(exUiUrl);
      await I.amOnPage(exUiUrl);
      await I.waitForText('Sign in or create an account', 30);
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 30);
      await I.amOnPage(caseUrl);
      await I.waitForText('Do this next', 30);
      await I.selectOption('#next-step', 'Request Home Office data');
      await I.click('Go');
      await I.waitForText('Match appellant details', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Request Home Office data');
      await I.waitForText('You have matched the appellant details', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I Request respondent evidence$/, async () => {
      await I.selectOption('#next-step', 'Request respondent evidence');
      await I.click('Go');
      await I.waitForText('You are directing the Home Office to supply their documents and evidence.', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Send direction');
      await I.waitForText('You have sent a direction', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });

    When(/^I Request the reasons for appeal$/, async () => {
      await I.selectOption('#next-step', 'AiP - Request Appeal Reasons');
      await I.click('Go');
      await I.waitForText('Explain the direction you are issuing', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Submit');
      await I.waitForText('You have sent a direction', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I sign in as a Case Officer and Ask Clarifying Questions$/, async () => {
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'AiP - Ask clarifying questions');
      await I.click('Go');
      await I.waitForText('Direct the appellant to answer clarifying questions', 30);
      await I.click('Add new');
      await I.fillField('#sendDirectionQuestions_0_question', 'This is question that is to be answered');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Submit');
      await I.waitForText('Your direction has been sent', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I sign in as a Case Officer and Request respondent review$/, async () => {
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'Request respondent review');
      await I.click('Go');
      await I.waitForText('You are directing the respondent to review and respond to the appeal skeleton argument.', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Send direction');
      await I.waitForText('You have sent a direction', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I Force the case to submit hearing requirements$/, async () => {
      await I.selectOption('#next-step', 'Force case - hearing reqs');
      await I.click('Go');
      await I.waitForText('Reasons to force the case progression', 30);
      await I.click('Continue');
      await I.fillField('#reasonToForceCaseToSubmitHearingRequirements', 'this is a reason to force case to submit hearing requirements');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Submit');
      await I.waitForText("You've forced the case progression to submit hearing requirements", 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });

    When(/^I sign in as a Case Officer and Review and record the hearing requirements$/, async () => {
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'Hearing requirements');
      await I.click('Go');
      await I.waitForText('Review the appellant\'s hearing requirements and select length of hearing.', 30);
      await I.selectOption('#listCaseHearingLength', '1 hour');
      await I.click('Continue');
      await I.waitForText('Additional adjustments', 30);
      await I.fillField('#remoteVideoCallTribunalResponse', 'Some adjustments the Tribunal will need to provide.');
      await I.click('Continue');
      await I.waitForText('Does the appellant have any physical or mental health issues that may impact them on the day?', 30);
      await I.click('Continue');
      await I.waitForText('Do you have multimedia evidence?', 30);
      await I.click('Continue');
      await I.waitForText('Does the appellant need a single-sex court?', 30);
      await I.click('Continue');
      await I.waitForText('Does the appellant need an in camera court?', 30);
      await I.click('Continue');
      await I.waitForText('Is there anything else you would like to request?', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Submit');
      await I.waitForText('You\'ve recorded the agreed hearing adjustments', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });

    When(/^I sign in as an Admin Officer and List the case$/, async () => {
      await I.click('Sign out');
      await I.waitForText('Sign in', 20);
      await I.fillField('#username', adminOfficerUserName);
      await I.fillField('#password', adminOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 30);
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'List the case');
      await I.click('Go');
      await I.waitForText('Add the hearing details below.', 30);
      await I.fillField('#ariaListingReference', 'LP/12345/2022');
      await I.fillField('#listCaseHearingDate-day', '10');
      await I.fillField('#listCaseHearingDate-month', '10');
      await I.fillField('#listCaseHearingDate-year', '2025');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('List case');
      await I.waitForText('You have listed the case', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });

    When(/^I sign in as a Case Officer and Create the case summary$/, async () => {
      await I.click('Sign out');
      await I.waitForText('Sign in', 20);
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 30);
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'Create case summary');
      await I.click('Go');
      await I.waitForText('Create a case summary and upload it below', 30);
      await I.attachFile("input[type='file']", `/test/files/valid-image-file.png`);
      await I.fillField('#caseSummaryDescription', 'case summary document');
      await I.wait(5);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Upload');
      await I.waitForText('You have uploaded the case summary', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I Generate the hearing bundle$/, async () => {
      await I.selectOption('#next-step', 'Generate hearing bundle');
      await I.click('Go');
      await I.waitInUrl('/trigger/generateHearingBundle/submit', 30);
      await I.see('Generate hearing bundle', 'h1');
      await I.click('Generate');
      await I.waitForText('The hearing bundle is being generated', 30);
      await I.wait(15);
      await I.click('Close and Return to case details');
      await I.wait(2);
      await I.refreshPage();
      await I.waitForText('Do this next', 30);
    });

    When(/^I Start decision and reasons$/, async () => {
      await I.selectOption('#next-step', 'Start decision and reasons');
      await I.click('Go');
      await I.waitForText('Write a brief introduction to the case', 30);
      await I.click('Continue');
      await I.waitForText('Add the appellant\'s case summary', 30);
      await I.click('Continue');
      await I.waitForText('Do both parties agree the immigration history?', 30);
      await I.click('No');
      await I.click('Continue');
      await I.waitForText('Do both parties agree the schedule of issues?', 30);
      await I.click('No');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Save');
      await I.waitForText('You have started the decision and reasons process', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });

    When(/^I sign in as a Judge and Prepare Decision and Reasons$/, async () => {
      await I.click('Sign out');
      await I.waitForText('Sign in', 20);
      await I.fillField('#username', judgeUserName);
      await I.fillField('#password', judgePassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 30);
      await I.amOnPage(caseUrl);
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'Prepare Decision and Reasons');
      await I.click('Go');
      await I.waitForText('Are you giving an anonymity direction?', 30);
      await I.click('No');
      await I.click('Continue');
      await I.waitForText('Give the names of the legal representatives in this case', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Generate');
      await I.waitForText('The Decision and Reasons document is ready to download', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I Complete the Decision and Reasons$/, async () => {
      await I.waitForText('Current progress of the case', 30);
      await I.selectOption('#next-step', 'Complete decision and reasons');
      await I.click('Go');
      await I.waitForText('What is your decision?', 30);
      await I.checkOption('#isDecisionAllowed-allowed');
      await I.click('Continue');
      await I.waitForText('Upload your decision and reasons', 30);
      await I.attachFile("input[type='file']", `/test/files/valid-pdf-file.pdf`);
      await I.wait(5);
      await I.checkOption('#isDocumentSignedToday_values-isDocumentSignedToday');
      await I.checkOption('#isFeeConsistentWithDecision_values-isFeeConsistentWithDecision');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Upload');
      await I.waitForText('You\'ve uploaded the Decision and Reasons document', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('No further action required.', 30);
      await I.see('No further action required.');
    });

    When(/^I sign in as a Case Officer and End the appeal$/, async () => {
      await I.amOnPage(exUiUrl);
      await I.waitForText('Sign in or create an account', 30);
      await I.fillField('#username', caseOfficerUserName);
      await I.fillField('#password', caseOfficerPassword);
      await I.click('Sign in');
      await I.waitForText('Case list', 30);
      await I.amOnPage(caseUrl);
      await I.waitForText('Do this next', 30);
      await I.selectOption('#next-step', 'End the appeal');
      await I.click('Go');
      await I.waitForText('This appeal has ended. Record the outcome and reasons below.', 30);
      await I.click('#endAppealOutcome-Withdrawn');
      await I.fillField('#endAppealOutcomeReason', 'a reason for outcome');
      await I.click('Continue');
      await I.waitForText('Record who approved this outcome.', 30);
      await I.click('#endAppealApproverType-Judge');
      await I.fillField('#endAppealApproverName', 'Judgy Judge');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('End appeal');
      await I.waitForText('You have ended the appeal', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });

    When(/^I Force the case to case under review$/, async () => {
      await I.selectOption('#next-step', 'Force case - case under review');
      await I.click('Go');
      await I.waitForText('Reasons to force the case progression', 30);
      await I.click('Continue');
      await I.fillField('#reasonToForceCaseToCaseUnderReview', 'this is a reason to force case to case under review');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Submit');
      await I.waitForText('You have forced the case progression to case under review', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I Request respondent review$/, async () => {
      await I.selectOption('#next-step', 'Request respondent review');
      await I.click('Go');
      await I.waitForText('You are directing the respondent to review and respond to the appeal skeleton argument.', 30);
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Send direction');
      await I.waitForText('You have sent a direction', 30);
      await I.click('Close and Return to case details');
      await I.waitForText('Do this next', 30);
      await I.see('Do this next');
    });

    When(/^I List without requirements$/, async () => {
      await I.selectOption('#next-step', 'List without requirements');
      await I.click('Go');
      await I.waitForText('Length', 30);
      await I.selectOption('#listCaseHearingLength', '1 hour');
      await I.click('Continue');
      await I.waitForText('Check your answers', 30);
      await I.click('Submit');
      await I.waitForText("You've recorded the agreed hearing adjustments", 30);
      await I.click('Close and Return to case details');
      await I.waitForText('What happens next', 30);
      await I.see('What happens next');
    });
  }
};
