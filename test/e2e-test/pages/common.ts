import * as _ from 'lodash';
import moment from 'moment';
import rp from 'request-promise';
const { fillInDate } = require('./helper-functions');

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
    body: [caseDataClone],
    json: true
  });
}

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

    When('I click Back button', async () => {
      await I.click('Back');
    });

    When('I click Save for later',async () => {
      await I.click('Save for later');
    });

    When('I click Save and continue',async () => {
      await I.click('Save and continue');
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
    When(/^I click "([^"]*)" button$/, async (button) => {
      await I.click(button);
    });
  }
};
