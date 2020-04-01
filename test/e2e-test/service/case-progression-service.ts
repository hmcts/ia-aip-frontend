import { paths } from '../../../app/paths';
import { CcdService } from '../../../app/service/ccd-service';
import { AuthenticationService } from './authentication-service';
import { updateAppeal } from './ccd-service';
import { aipCurrentUser, getUserId, getUserToken } from './idam-service';
import { getS2sToken } from './s2s-service';
const testUrl = require('config').get('testUrl');

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
      await I.amOnPage(testUrl + paths.logout);
      I.amOnPage(testUrl + paths.login);
      await I.seeInTitle('Sign in - HMCTS Access');
      I.fillField('#username', aipCurrentUser.email);
      I.fillField('#password', aipCurrentUser.password);
      I.click('.button');
    });

    Given(/^I sign in as a Case Officer and request HO Bundle$/, async () => {

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

    Given(/^I sign in as a Case Officer and request the reasons for appeal$/, async () => {

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

    Given(/^I sign in as a Home Office Generic and upload the HO Bundle$/, async () => {
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
                'document_url': 'http://dm-store:4506/documents/BBB',
                'document_binary_url': 'http://dm-store:4506/documents/BBB/binary',
                'document_filename': 'some-new-evidence.pdf'
              },
              'description': 'Some new evidence'
            }
          },
          {
            'id': '2',
            'value': {
              'document': {
                'document_url': 'http://dm-store:4506/documents/CCC',
                'document_binary_url': 'http://dm-store:4506/documents/CCC/binary',
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
  }
};
