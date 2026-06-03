import appealSubmittedCaseDataSTF24W from './appeal-submitted';

export default {
  ...appealSubmittedCaseDataSTF24W,
  'id': 50,
  'state': 'submitHearingRequirements',
  'case_data': {
    ...appealSubmittedCaseDataSTF24W.case_data,
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

};
