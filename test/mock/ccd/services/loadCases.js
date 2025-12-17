const mockData = require('../mock-case-data');
const cache = require('memory-cache');

const usersToCaseData = {
  '1': [],
  '2': [ mockData.partialAppealStartedCaseData ],
  '3': [ mockData.appealSubmittedCaseData ],
  '4': [ mockData.awaitingReasonsForAppealCaseData ],
  '5': [ mockData.partialAwaitingReasonsForAppealCaseData ],
  '6': [ mockData.clarifyingQuestionsCaseData],
  '7': [ mockData.awaitingReasonsForAppealCaseDataWithTimeExtension ],
  '8': [ mockData.clarifyingQuestionsCaseDataWithTimeExtensions ],
  '9': [ mockData.awaitingCmaRequirements ],
  '10': [ mockData.awaitingCmaRequirementsWithTimeExtensions ],
  '11': [ mockData.submittedCmaRequirements ],
  '12': [ mockData.cmaListed ],
  '14': [ mockData.outOfTimeDecisionGranted ],
  '15': [ mockData.outOfTimeDecisionRejected ],
  '16': [ mockData.outOfTimeDecisionInTime ],
  '17': [ mockData.uploadAddendumEvidence ],
  '18': [ mockData.decided ],
  '19': [ mockData.ftpaOutOfTimeApplicationStarted ]
};

module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases',
  method: 'GET',
  cache: false,
  template: params => {
    if (['20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35'].includes(params.userId)) {
      const caseData = cache.get(`caseData${params.userId}`);
      if (caseData) {
        return caseData;
      }
      return [];
    } else {
      return usersToCaseData[params.userId];
    }
  }
};
