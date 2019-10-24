import {
  dateValidation,
  homeOfficeNumberValidation
} from '../../../app/utils/fields-validations';
import i18n from '../../../locale/en.json';
import { expect } from '../../utils/testUtils';

describe('fields-validations', () => {
  describe('homeOfficeNumberValidation', () => {
    it('should validate', () => {
      const validations = homeOfficeNumberValidation('A1234567');
      expect(validations).to.equal(false);
    });

    it('should fail validation and return empty warning message', () => {
      const validations = homeOfficeNumberValidation('');
      expect(validations).to.equal(i18n.validationErrors.empty);
    });
  });

  describe('dateValidation', () => {
    it('should validate', () => {
      const validDate = {
        day: '1',
        month: '1',
        year: '2019'
      };
      const validations = dateValidation(validDate);
      expect(validations).to.deep.equal(false);
    });

    it('should fail validation and return empty warning message', () => {
      const notValidDate = {
        day: '1',
        month: '1',
        year: '20290'
      };
      const validations = dateValidation(notValidDate);
      expect(validations).to.deep.equal([
        {
          href: '#year',
          key: 'year',
          text: 'Needs to be a valid date.'
        }
      ]);
    });
  });
});
