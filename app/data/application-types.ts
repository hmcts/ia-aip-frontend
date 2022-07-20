const applicationTypes = {
  timeExtension: {
    code: 'askForMoreTime',
    type: 'Time extension'
  },
  expedite: {
    code: 'askHearingSooner',
    type: 'Expedite'
  },
  adjourn: {
    code: 'askChangeDate',
    type: 'Adjourn'
  },
  transfer: {
    code: 'askChangeLocation',
    type: 'Transfer'
  },
  judgesReview: {
    code: 'askJudgeReview',
    type: 'Judge\'s review of application decision'
  },
  linkOrUnlink: {
    code: 'askLinkUnlink',
    type: 'Link/unlink appeals'
  },
  reinstate: {
    code: 'askReinstate',
    type: 'Reinstate an ended appeal'
  },
  withdraw: {
    code: 'askWithdraw',
    type: 'Withdraw'
  },
  updateAppealDetails: {
    code: 'askUpdateDetails',
    type: 'Update appeal details'
  },
  updateHearingRequirements: {
    code: 'askUpdateHearingRequirements',
    type: 'Update hearing requirements'
  },
  other: {
    code: 'askSomethingElse',
    type: 'Other'
  }
};

export {
  applicationTypes
};
