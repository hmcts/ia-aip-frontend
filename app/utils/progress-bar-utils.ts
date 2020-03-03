import i18n from '../../locale/en.json';

function buildProgressBarStages(state: string) {
  const stages = {
    yourAppealDetails: {
      activeStatus: [ 'appealStarted', 'appealSubmitted', 'awaitingRespondentEvidence' ]
    },
    yourAppealArgument: {
      activeStatus: [ 'awaitingReasonsForAppeal' ]
    },
    yourHearingDetails: {
      activeStatus: []
    },
    yourAppealDecision: {
      activeStatus: []
    }
  };

  const yourAppealDetailsStage = {
    title: i18n.components.progressBar.yourAppealDetails.title,
    ariaLabel: i18n.components.progressBar.yourAppealDetails.ariaLabel,
    active: stages.yourAppealDetails.activeStatus.includes(state),
    completed: !stages.yourAppealDetails.activeStatus.includes(state)
  };

  const yourAppealArgumentStage = {
    title: i18n.components.progressBar.yourAppealArgument.title,
    ariaLabel: i18n.components.progressBar.yourAppealArgument.ariaLabel,
    active: stages.yourAppealArgument.activeStatus.includes(state),
    completed: yourAppealDetailsStage.completed && !stages.yourAppealArgument.activeStatus.includes(state)
  };

  const yourHearingDetailsStage = {
    title: i18n.components.progressBar.yourHearingDetails.title,
    ariaLabel: i18n.components.progressBar.yourHearingDetails.ariaLabel,
    active: stages.yourHearingDetails.activeStatus.includes(state),
    completed: yourAppealArgumentStage.completed && !stages.yourHearingDetails.activeStatus.includes(state)
  };

  const yourAppealDecisionStage = {
    title: i18n.components.progressBar.yourAppealDecision.title,
    ariaLabel: i18n.components.progressBar.yourAppealDecision.ariaLabel,
    active: stages.yourAppealDecision.activeStatus.includes(state),
    completed: yourHearingDetailsStage.completed && !stages.yourAppealDecision.activeStatus.includes(state)
  };

  const progressBarStages = [
    yourAppealDetailsStage,
    yourAppealArgumentStage,
    yourHearingDetailsStage,
    yourAppealDecisionStage
  ];

  return progressBarStages;
}

export {
  buildProgressBarStages
};
