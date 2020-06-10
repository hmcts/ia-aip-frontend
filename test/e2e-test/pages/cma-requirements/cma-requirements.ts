import moment from 'moment';
import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';
import { fillInDate } from '../helper-functions';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  cmaRequirements(I) {

    Then(/^I should see the cma requirements task-list page$/, async () => {
      await I.seeInCurrentUrl(paths.awaitingCmaRequirements.taskList);
      await I.see('Tell us your appointment needs', 'h1');
    });

    When(/^I enter a valid in-range date$/, async () => {
      const validDate = moment().add(3, 'week');
      fillInDate(validDate.day(), (validDate.month() + 1), validDate.year());
    });

    Then(/^I should see the cma requirements confirmation page$/, async () => {
      I.seeInCurrentUrl(testUrl + paths.cmaRequirementsSubmitted.confirmation);
    });

    When('I choose Yes and click save and continue', async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    When('I choose No and click save and continue', async () => {
      await I.checkOption('#answer-2');
      await I.click('Save and continue');
    });

    Then('I see cma requirements answers and content', async () => {
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.interpreterTitle);
      I.seeInSource(i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.stepFreeTitle);
      I.seeInSource(i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.hearingLoopTitle);
      I.seeInSource(i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.multimediaEvidenceTitle);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.bringEquipment.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.multimediaEvidence.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.title);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointment.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.singleSexTypeAppointment.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllFemale.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.singleSexAppointmentTitle);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.privateAppointment.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.privateAppointmentTitle);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.healthConditions.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.healthConditionsTitle);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.pastExperiences.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.pastExperiencesTitle);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.anythingElse.question);
      I.seeInSource(i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.title);
      I.seeInSource(i18n.pages.cmaRequirementsCYA.rows.anythingElseTitle);

      I.seeInSource("<pre>Reason for 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it'</pre>");
      I.seeInSource("<pre>Reason for 'Tell us why you need an all-female appointment'</pre>");
      I.seeInSource("<pre>Reason for 'Tell us why you need a private appointment'</pre>");
      I.seeInSource("<pre>Reason for 'Tell us how any physical or mental health conditions you have may affect you at the appointment'</pre>");
      I.seeInSource("<pre>Reason for 'Tell us how any past experiences that may affect you at the appointment'</pre>");
      I.seeInSource("<pre>Reason for 'Tell us what you will need and why you need it'</pre>");
      I.seeInSource("<pre>Reason for 'Why can you not go to the appointment on this date?'</pre>");

    });

  }
};
