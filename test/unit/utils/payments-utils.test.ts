import { appendCaseReferenceAndAppellantName } from '../../../app/utils/payments-utils';
import { expect } from '../../utils/testUtils';

it('build details with sub building name', () => {
  const caseReference = 'aCaseReference';
  const appellantSurname = 'Surname';
  const caseReferenceAndAppellantName = appendCaseReferenceAndAppellantName(caseReference, appellantSurname);

  expect(caseReferenceAndAppellantName).to.eql('aCaseReference_Surname');
});
