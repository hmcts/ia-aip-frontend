import { buildProgressBarStages } from '../../../app/utils/progress-bar-utils';
import i18n from '../../../locale/en.json';
import { expect } from '../../utils/testUtils';

describe('progress-bar utils', () => {
  it('should build progress bar stages using state', () => {
    const expectedStages = [
      {
        title: i18n.components.progressBar.yourAppealDetails.title,
        ariaLabel: i18n.components.progressBar.yourAppealDetails.ariaLabel,
        active: true,
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

    const stages = buildProgressBarStages('appealStarted');
    expect(expectedStages).to.deep.equal(stages);
  });
});
