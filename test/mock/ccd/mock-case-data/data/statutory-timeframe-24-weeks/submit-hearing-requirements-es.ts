import appealSubmittedCaseDataSTF24WES from './appeal-submitted-es';

export default {
  'total': 1,
  cases: [
    {
      ...appealSubmittedCaseDataSTF24WES.cases[0],
      'id': 50,
      'state': 'submitHearingRequirements',
      'case_data': {
        ...appealSubmittedCaseDataSTF24WES.cases[0].case_data,
        'makeAnApplications': [
          {
            'id': '1',
            'value': {
              'date': '2026-03-01',
              'type': 'Time extension',
              'state': 'submitHearingRequirements',
              'details': 'A reason for time extension',
              'decision': 'Pending',
              'applicant': 'Legal representative',
            }
          }
        ],
        'directions': [
          {
            'id': 1,
            'value': {
              'tag': 'legalRepresentativeHearingRequirements',
              'dateDue': '2026-03-14',
              'dateSent': '2026-03-01'
            }
          }
        ]
      }
    }
  ]
};
