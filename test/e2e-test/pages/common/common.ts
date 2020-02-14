import * as _ from 'lodash';
import moment from 'moment';
import rp from 'request-promise';
import { paths } from '../../../../app/paths';

const { fillInDate } = require('../helper-functions');

const caseData = {
  'id': 1573640323267110,
  'jurisdiction': 'IA',
  'state': 'appealStarted',
  'version': 8,
  'case_type_id': 'Asylum',
  'created_date': '2019-11-13T10:18:43.271',
  'last_modified': '2019-11-13T15:35:31.356',
  'security_classification': 'PUBLIC',
  'case_data': {
    'journeyType': 'aip'
  },
  'data_classification': {
    'journeyType': 'PUBLIC',
    'homeOfficeReferenceNumber': 'PUBLIC'
  },
  'after_submit_callback_response': null,
  'callback_response_status_code': null,
  'callback_response_status': null,
  'delete_draft_response_status_code': null,
  'delete_draft_response_status': null,
  'security_classifications': {
    'journeyType': 'PUBLIC',
    'homeOfficeReferenceNumber': 'PUBLIC'
  }
};

async function setupData(newCaseData) {
  const caseDataClone = _.cloneDeep(caseData);
  _.merge(caseDataClone.case_data, newCaseData);
  await rp.post({
    uri: 'http://localhost:20000/setupCase',
    body: [ caseDataClone ],
    json: true
  });
}

const PATHS = {
  'reasons for appeal': paths.reasonsForAppeal.decision,
  'supporting evidence question': paths.reasonsForAppeal.supportingEvidence,
  'supporting evidence upload': paths.reasonsForAppeal.supportingEvidenceUpload,
  'reasons for appeal check your answers': paths.reasonsForAppeal.checkAndSend,
  'Out of time appeal': paths.homeOffice.appealLate,
  'Task list': paths.taskList,
  'Check and send': paths.checkAndSend
};

module.exports = {
  common(I) {
    Given('I have an appeal with home office reference', async () => {
      await setupData({ homeOfficeReferenceNumber: 'A1111111' });
    });

    Given('I have an appeal with home office details', async () => {
      await setupData({
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD')
      });
    });

    Given('I have an appeal with home office details and name', async () => {
      await setupData({
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName'
      });
    });

    Given('I have an appeal with home office details, name and date of birth', async () => {
      await setupData({
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1981-01-01'
      });
    });

    Given('I have an appeal with home office details, name, date of birth and nationality', async () => {
      await setupData({
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1981-01-01',
        appellantNationalities: [
          {
            id: '1',
            value: {
              code: 'FI'
            }
          }
        ]
      });
    });

    Given('I have an appeal with home office details, name, date of birth, nationality and address', async () => {
      await setupData({
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1981-01-01',
        appellantNationalities: [
          {
            id: '1',
            value: {
              code: 'FI'
            }
          }
        ],
        appellantAddress: {
          AddressLine1: 'Address line 1',
          PostTown: 'Town',
          PostCode: 'CM15 9BN'
        }
      });
    });

    Given('I have an appeal with home office details, personal details and contact details', async () => {
      await setupData({
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1981-01-01',
        appellantNationalities: [
          {
            id: '1',
            value: {
              code: 'FI'
            }
          }
        ],
        appellantAddress: {
          AddressLine1: 'Address line 1',
          PostTown: 'Town',
          PostCode: 'CM15 9BN'
        },
        subscriptions: [ {
          id: 1,
          value: {
            subscriber: 'appellant',
            wantsEmail: 'No',
            email: null,
            wantsSms: 'Yes',
            mobileNumber: '07899999999'
          }
        } ]
      });
    });

    Given('I have an out of time appeal with reason for being late an evidence', async () => {
      await setupData({
        appealType: 'protection',
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().subtract(20, 'days').format('YYYY-MM-DD'),
        submissionOutOfTime: 'Yes',
        applicationOutOfTimeExplanation: 'The reason why the appeal is late',
        applicationOutOfTimeDocument: {
          document_filename: '1581607687239-fake.png',
          document_url: 'http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909'
        },
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1981-01-01',
        appellantNationalities: [
          {
            id: '1',
            value: {
              code: 'FI'
            }
          }
        ],
        appellantAddress: {
          AddressLine1: 'Address line 1',
          PostTown: 'Town',
          PostCode: 'CM15 9BN'
        },
        subscriptions: [{
          id: 1,
          value: {
            subscriber: 'appellant',
            wantsEmail: 'No',
            email: null,
            wantsSms: 'Yes',
            mobileNumber: '07899999999'
          }
        }]
      });
    });

    When(/^I click "([^"]*)" button$/, async (selector: string) => {
      await I.click(selector);
    });

    When(/^I enter a day "([^"]*)" month "([^"]*)" year "([^"]*)"$/, async (day, month, year) => {
      await fillInDate(day, month, year);
    });

    Then(/^I should see error summary$/, async () => {
      await I.seeElementInDOM('.govuk-error-summary');
      await I.seeInTitle('Error: ');
    });

    Then(/^I shouldnt see error summary$/, async () => {
      I.dontSeeElementInDOM('.govuk-error-summary');
    });

    Then(/^I expect to be redirect back to the task\-list$/, async () => {
      await I.seeInCurrentUrl('/task-list');
    });

    Then(/^I should see the "([^"]*)" page$/, async (key: string) => {
      await I.seeInCurrentUrl(`${PATHS[key]}`);
    });

    When(/^I visit the "([^"]*)" page$/, async (key: string) => {
      await I.seeInCurrentUrl(`${PATHS[key]}`);
      await I.amOnPage(`https://localhost:3000${PATHS[key]}`);
    });

    Then(/^I click continue$/, async () => {
      await I.click('Continue');
    });

    Given(/^I am on the "([^"]*)" page$/, async (key: string) => {
      await I.seeInCurrentUrl(`${PATHS[key]}`);
      await I.amOnPage(`https://localhost:3000${PATHS[key]}`);
    });
  }
};
