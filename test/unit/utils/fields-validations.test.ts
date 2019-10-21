import { homeOfficeNumberValidation } from '../../../app/utils/fields-validations';
import i18n from '../../../locale/en.json';
import { expect } from '../../utils/testUtils';

describe('fields-validations', () => {
  it('should validate', () => {
    const validations = homeOfficeNumberValidation('A1234567');
    expect(validations).to.equal(false);
  });

  it('should fail validation and return empty warning message', () => {
    const validations = homeOfficeNumberValidation('');
    expect(validations).to.equal(i18n.fieldsValidations.empty);
  });
});
