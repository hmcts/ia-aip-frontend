import dateFormat from 'dateformat';
import rp from 'request-promise';

module.exports = {
  common(I) {
    Given('I have an appeal with home office reference', async () => {
      rp.post({
        uri: 'http://localhost:20000/setupCase',
        body: [{
          'id': 1573640323267110,
          'jurisdiction': 'IA',
          'state': 'appealStarted',
          'version': 8,
          'case_type_id': 'Asylum',
          'created_date': '2019-11-13T10:18:43.271',
          'last_modified': '2019-11-13T15:35:31.356',
          'security_classification': 'PUBLIC',
          'case_data': {
            'journeyType': 'aip',
            'homeOfficeReferenceNumber': 'A111111'
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
        }],
        json: true
      });
    });

    Given('I have an appeal with home office details', async () => {
      rp.post({
        uri: 'http://localhost:20000/setupCase',
        body: [{
          'id': 1573640323267110,
          'jurisdiction': 'IA',
          'state': 'appealStarted',
          'version': 8,
          'case_type_id': 'Asylum',
          'created_date': '2019-11-13T10:18:43.271',
          'last_modified': '2019-11-13T15:35:31.356',
          'security_classification': 'PUBLIC',
          'case_data': {
            'journeyType': 'aip',
            'homeOfficeReferenceNumber': 'A111111',
            'homeOfficeDecisionDate': dateFormat(new Date(), 'yyyy-mm-dd')
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
        }],
        json: true
      });
    });

    When(/^I click on back button$/, async () => {
      await I.click('.govuk-back-link');
    });

    When('I click save for later',async () => {
      I.click({ name: 'saveForLater' });
    });

    When('I click save and continue',async () => {
      I.click({ name: 'saveAndContinue' });
    });

    Then(/^I should see error summary$/, async () => {
      await I.seeElementInDOM('.govuk-error-summary');
      // await I.seeInTitle('Error: ');
    });

    Then(/^I shouldnt see error summary$/, async () => {
      I.dontSeeElementInDOM('.govuk-error-summary');
    });
  }
};
