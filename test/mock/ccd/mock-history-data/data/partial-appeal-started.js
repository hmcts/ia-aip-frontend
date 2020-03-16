const partialAppealStartedCaseData = { auditEvents: [
  {
    'id': 'editAppeal',
    'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
    'user': { 'id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f', 'lastName': 'Citizen Admin', 'firstName': 'Alex' },
    'createdDate': '2020-02-27T14:05:06.662',
    'caseTypeVersion': 5,
    'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
    'data': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
      'appealGroundsForDisplay': [],
      'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'haveHearingAttendeesAndDurationBeenRecorded': 'No',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'journeyType': 'aip',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'sendDirectionActionAvailable': 'No',
      'changeDirectionDueDateActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    }
  }, {
    'id': 'startAppeal',
    'event': { 'eventName': 'Start your appeal', 'description': 'Create case AIP' },
    'user': { 'id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f', 'lastName': 'Citizen Admin', 'firstName': 'Alex' },
    'createdDate': '2020-02-27T14:04:52.795',
    'caseTypeVersion': 5,
    'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
    'data': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
      'appealGroundsForDisplay': [],
      'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'haveHearingAttendeesAndDurationBeenRecorded': 'No',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'journeyType': 'aip',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'sendDirectionActionAvailable': 'No',
      'changeDirectionDueDateActionAvailable': 'No'
    }
  } ]};

module.exports = { ...partialAppealStartedCaseData };
