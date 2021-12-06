import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import { CcdService } from '../../../app/service/ccd-service';
import { AuthenticationService } from './authentication-service';
import { updateAppeal } from './ccd-service';
import { aipCurrentUser, getUserId, getUserToken } from './idam-service';
import { getS2sToken } from './s2s-service';

const config = require('config');
const testUrl = config.get('testUrl');
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

    Given(/^I sign in as the Appellant$/, async () => {
      console.log('logout signing in as appellant?????   ia_citizen9894270@hmcts.net  / Apassword123');
      console.log(testUrl + paths.common.logout);
      await I.amOnPage(testUrl + paths.common.logout);
      console.log('login in as appellant????? ');
      console.log(testUrl + paths.common.login);
      I.amOnPage(testUrl + paths.common.login);
      await I.seeInTitle('Sign in - HMCTS Access');
      I.fillField('#username', aipCurrentUser.email);
      I.fillField('#password', aipCurrentUser.password);
      I.click('.button');
    });

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
  }
};
