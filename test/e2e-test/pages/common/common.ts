import * as _ from 'lodash';
import moment from 'moment';
import rp from 'request-promise';
import { paths } from '../../../../app/paths';
const mockData = require('../../../mock/ccd/mock-case-data');

const { fillInDate } = require('../helper-functions');

const testUrl = require('config').get('testUrl');

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

async function setupCase(ccdCase: CcdCaseDetails) {
  await rp.post({
    uri: 'http://localhost:20000/setupCase',
    body: [ ccdCase ],
    json: true
  });
}

const PATHS = {
  'reasons for appeal': paths.awaitingReasonsForAppeal.decision,
  'supporting evidence question': paths.awaitingReasonsForAppeal.supportingEvidence,
  'supporting evidence upload': paths.awaitingReasonsForAppeal.supportingEvidenceUpload,
  'reasons for appeal check your answers': paths.awaitingReasonsForAppeal.checkAndSend,
  'Out of time appeal': paths.appealStarted.appealLate,
  'Task list': paths.appealStarted.taskList,
  'Check and send': paths.appealStarted.checkAndSend,
  'provide more evidence': paths.common.provideMoreEvidenceForm,
  'provide more evidence check': paths.common.provideMoreEvidenceCheck,
  'provide more evidence sent': paths.common.provideMoreEvidenceConfirmation,
  'why evidence late': paths.common.whyEvidenceLate
};

module.exports = {
  common(I) {
    Given('I have an ended appeal', async () => {
      await setupCase(mockData.endedAppeal);
    });

    Given('I have an out of time granted decision appeal', async () => {
      await setupCase(mockData.outOfTimeDecisionGranted);
    });

    Given('I have an out of time rejected decision appeal', async () => {
      await setupCase(mockData.outOfTimeDecisionRejected);
    });

    Given('I have an out of time in-time decision appeal', async () => {
      await setupCase(mockData.outOfTimeDecisionInTime);
    });

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
        appealType: 'protection',
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName'
      });
    });

    Given('I have an appeal with home office details, name and date of birth', async () => {
      await setupData({
        appealType: 'protection',
        homeOfficeReferenceNumber: 'A1111111',
        homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
        appellantGivenNames: 'givenName',
        appellantFamilyName: 'familyName',
        appellantDateOfBirth: '1981-01-01'
      });
    });

    Given('I have an appeal with home office details, name, date of birth and nationality', async () => {
      await setupData({
        appealType: 'protection',
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
        appealType: 'protection',
        appellantInUk: 'Yes',
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

    Given('I have a fresh appeal', async () => {
      await setupData({
        appealType: 'protection',
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
        }],
        uploadTheNoticeOfDecisionDocs: []
      });
    });

    Given('I have an appeal with home office details, name, date of birth, nationality, address and reason for appeal', async () => {
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
        } ],
        appealType: 'protection',
        uploadTheNoticeOfDecisionDocs: []
      });
    });

    Given('I have an EU or EUSS or HU appeal with home office details, name, date of birth, nationality, address and reason for appeal', async () => {
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
        } ],
        appealType: 'refusalOfHumanRights',
        feeWithoutHearing: '80',
        feeCode: 'abc',
        feeVersion: '2',
        uploadTheNoticeOfDecisionDocs: []
      });
    });

    When(/^I click "([^"]*)" button$/, async (selector: string) => {
      await I.wait(1);
      await I.click(selector);
    });

    When(/^I click "([^"]*)" link$/, async (selector: string) => {
      await I.click(selector);
    });

    When(/^I enter a day "([^"]*)" month "([^"]*)" year "([^"]*)"$/, async (day, month, year) => {
      await fillInDate(day, month, year);
    });

    Then(/^I should see error summary$/,async () => {
      await I.seeElementInDOM('.govuk-error-summary');
      await I.seeInTitle('Error: ');
    });

    Then(/^I shouldnt see error summary$/, async () => {
      I.dontSeeElementInDOM('.govuk-error-summary');
    });

    Then(/^I expect to be redirect back to the task\-list$/, async () => {
      await I.waitInUrl(paths.appealStarted.taskList,10);
      await I.seeInCurrentUrl(paths.appealStarted.taskList);
    });

    Then(/^I see "([^"]*)" in current url$/, async (key: string) => {
      await I.waitInUrl(key,10);
      await I.seeInCurrentUrl(key);
    });

    When(/^I visit the "([^"]*)" page$/, async (key: string) => {
      await I.waitInUrl(`${PATHS[key]}`,10);
      await I.seeInCurrentUrl(`${PATHS[key]}`);
      await I.amOnPage(`${testUrl}${PATHS[key]}`);
    });

    When(/^I visit the health page$/, async () => {
      await I.amOnPage(`${testUrl}/health`);
    });

    When(/^I visit the overview page$/, async () => {
      await I.amOnPage(`${testUrl}/appeal-overview`);
    });

    Then(/^I click continue$/, async () => {
      await I.click('Continue');
    });

    Then(/^I click the "([^"]*)" button$/, async (text) => {
      await I.click(text);
    });

    Given(/^I am on the "([^"]*)" page$/, async (key: string) => {
      await I.waitInUrl(`${PATHS[key]}`,10);
      await I.seeInCurrentUrl(`${PATHS[key]}`);
      await I.amOnPage(`${testUrl}${PATHS[key]}`);
    });

    Then(/^I am on the overview page$/, async () => {
      await I.amOnPage(`${testUrl}/appeal-overview`);
    });

    Then(/^I see "([^"]*)" on the page$/, async (text: string) => {
      await I.see(text);
    });

    Then(/^I dont see "([^"]*)" on the page$/, async (text: string) => {
      await I.dontSee(text);
    });

    Then(/^I see "([^"]*)" in title$/, async (title: string) => {
      await I.waitForText(title, 30);
      await I.see(title, 'h1');
    });

    Then(/^I see "([^"]*)" in subheading$/, async (title: string) => {
      await I.see(title, ['h2', 'h3', 'h4']);
    });

    Then(/^I see "([^"]*)" in timeline$/, async (title: string) => {
      await I.see(title, '.timeline-event');
    });

    Then(/^I see "([^"]*)" in summary list$/, async (title: string) => {
      await I.see(title, '.govuk-summary-list');
    });

    Then(/^I see "([^"]*)" item in list$/, async (title: string) => {
      await I.see(title, 'ul');
    });

    Then(/^I see "([^"]*)" link$/, async (title: string) => {
      await I.see(title, 'a');
    });

    Then(/^I see "([^"]*)" description in overview banner$/, async (title: string) => {
      await I.see(title, '.overview-banner');
    });

    Then(/^I fill textarea with "([^"]*)"$/, async (title: string) => {
      await I.fillField('textarea', title);
    });

    Then(/^I fill "([^"]*)" field with "([^"]*)"$/, async (field, value) => {
      await I.fillField(field, value);
    });

    Then(/^I select "([^"]*)" from "([^"]*)" drop-down$/, async (option, dropdown) => {
      await I.selectOption(dropdown, option);
    });

    Then(/^I check "([^"]*)" option$/, async (option) => {
      await I.checkOption(option);
    });

    Then(/^I click "([^"]*)" change link$/, async (text) => {
      await I.click(
        'Change',
        `//div/dt[contains(text(), "${text}")]/parent::div//a`
      );
    });

    When('I select No and click save and continue', async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    When('I select Yes and click save and continue', async () => {
      await I.checkOption('#answer-2');
      await I.click('Save and continue');
    });

    When('I select from the drop-down', async () => {
      await I.selectOption('#language','Afar');
    });

    Then('I should see the date time and hearing centre in do this next', async () => {
      await I.seeInSource('Hearing Centre:');
    });

    Then(/^I see "([^"]*)" in timeline$/, async (title: string) => {
      await I.see(title, '.timeline-event');
    });

    Then(/^I see "([^"]*)" in summary list$/, async (title: string) => {
      await I.see(title, '.govuk-summary-list');
    });

    When(/^I wait for ([^"]*) seconds$/, async (waitTime: string) => {
      await I.wait(waitTime);
    });
  }
};
