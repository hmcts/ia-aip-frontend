const applicationTypes = {
  timeExtension: {
    code: 'askForMoreTime',
    type: 'Time extension'
  },
  expedite: {
    parent: 'askChangeHearing',
    code: 'askHearingSooner',
    type: 'Expedite'
  },
  adjourn: {
    parent: 'askChangeHearing',
    code: 'askChangeDate',
    type: 'Adjourn'
  },
  transfer: {
    parent: 'askChangeHearing',
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
    parent: 'askChangeHearing',
    code: 'askUpdateHearingRequirements',
    type: 'Update hearing requirements'
  },
  changeHearingType: {
    code: 'askChangeHearingType',
    type: 'Change hearing type'
  },
  other: {
    code: 'askSomethingElse',
    type: 'Other'
  }
};

export {
  applicationTypes
};
