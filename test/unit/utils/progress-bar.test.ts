import { buildProgressBarStages } from '../../../app/utils/progress-bar-utils';
import i18n from '../../../locale/en.json';
import { expect } from '../../utils/testUtils';

describe('progress-bar utils', () => {
  const defaultStages = [
    {
      title: i18n.components.progressBar.yourAppealDetails.title,
      ariaLabel: i18n.components.progressBar.yourAppealDetails.ariaLabel,
      active: false,
      completed: false
    },
    {
      title: i18n.components.progressBar.yourAppealArgument.title,
      ariaLabel: i18n.components.progressBar.yourAppealArgument.ariaLabel,
      active: false,
      completed: false
    },
    {
      title: i18n.components.progressBar.yourHearingDetails.title,
      ariaLabel: i18n.components.progressBar.yourHearingDetails.ariaLabel,
      active: false,
      completed: false
    },
    {
      title: i18n.components.progressBar.yourAppealDecision.title,
      ariaLabel: i18n.components.progressBar.yourAppealDecision.ariaLabel,
      active: false,
      completed: false
    }
  ];

  describe('should build progress bar stages using state', () => {

    it('appealStarted', () => {
      const stages = buildProgressBarStages('appealStarted');
      const expectedStages = defaultStages;
      expectedStages[0].active = true;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('appealSubmitted', () => {
      const stages = buildProgressBarStages('appealSubmitted');
      const expectedStages = defaultStages;
      expectedStages[0].active = true;
      expectedStages[0].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('appealSubmitted and not Paid', () => {
      const stages = buildProgressBarStages('appealSubmitted', 'Payment pending');
      const expectedStages = defaultStages;
      expectedStages[0].active = true;
      expectedStages[0].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('appealSubmitted and Paid', () => {
      const stages = buildProgressBarStages('appealSubmitted', 'Paid');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('awaitingRespondentEvidence', () => {
      const stages = buildProgressBarStages('awaitingRespondentEvidence');
      const expectedStages = defaultStages;
      expectedStages[0].active = true;
      expectedStages[0].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('awaitingReasonsForAppeal', () => {
      const stages = buildProgressBarStages('awaitingReasonsForAppeal');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('reasonsForAppealSubmitted', () => {
      const stages = buildProgressBarStages('reasonsForAppealSubmitted');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('caseUnderReview', () => {
      const stages = buildProgressBarStages('caseUnderReview');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('awaitingClarifyingQuestionsAnswers', () => {
      const stages = buildProgressBarStages('awaitingClarifyingQuestionsAnswers');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('clarifyingQuestionsAnswersSubmitted', () => {
      const stages = buildProgressBarStages('clarifyingQuestionsAnswersSubmitted');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('awaitingCmaRequirements', () => {
      const stages = buildProgressBarStages('awaitingCmaRequirements');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('cmaRequirementsSubmitted', () => {
      const stages = buildProgressBarStages('awaitingCmaRequirements');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = true;
      expectedStages[1].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });

    it('caseListedByAdminOfficer', () => {
      const stages = buildProgressBarStages('prepareForHearing');
      const expectedStages = defaultStages;
      expectedStages[0].active = false;
      expectedStages[0].completed = true;
      expectedStages[1].active = false;
      expectedStages[1].completed = true;
      expectedStages[2].active = true;
      expectedStages[2].completed = false;
      expect(expectedStages).to.deep.equal(stages);
    });
  });
});
