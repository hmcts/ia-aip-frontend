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
  '16': [ mockData.outOfTimeDecisionInTime ]
};

module.exports = {
 // path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases',
  path: '/searchCases?ctid=${caseType}',
  method: 'POST',
  cache: false,
  template: params => {
    if (params.userId === '999') {
      const caseData = cache.get('caseData');
      if (caseData) {
        return caseData;
      }
      return [];
    } else {
      return usersToCaseData[params.userId];
    }
  }
};
