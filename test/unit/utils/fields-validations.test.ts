import {
  appellantNamesValidation,
  dateValidation,
  emailValidation,
  homeOfficeNumberValidation,
  phoneValidation,
  statementOfTruthValidation,
  textAreaValidation
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
      expect(validations).to.deep.equal(null);
    });

    it('should fail validation and return empty warning message', () => {
      const notValidDate = {
        day: '1',
        month: '1',
        year: '20290'
      };
      const validations = dateValidation(notValidDate);
      expect(validations).to.deep.equal(
        {
          year: {
            href: '#year',
            key: 'year',
            text: 'Needs to be a valid date.'
          }
        }
      );
    });
  });

  describe('appellantNameValidation', () => {
    it('should validate a name', () => {
      const validationResult = appellantNamesValidation({ givenNames: 'givenNames', familyName: 'familyName' });
      expect(validationResult).to.equal(null);
    });

    it('should fail validation when given names is blank', () => {
      const validationResult = appellantNamesValidation({ givenNames: '', familyName: 'familyName' });
      expect(validationResult).to.deep.equal({
        givenNames: {
          href: '#givenNames',
          key: 'givenNames',
          text: 'Enter your given name or names'
        }
      });
    });

    it('should fail validation when family names is blank', () => {
      const validationResult = appellantNamesValidation({ givenNames: 'givenName', familyName: '' });
      expect(validationResult).to.deep.equal({
        familyName: {
          href: '#familyName',
          key: 'familyName',
          text: 'Enter your family name or names'
        }
      });
    });
  });

  describe('emailValidation', () => {
    it('should validate an email Address', () => {
      const object = { 'email-value': 'alejandro@exmple.net' };
      const validationResult = emailValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail email validation and return "string.empty" type', () => {
      const object = { 'email-value': '' };
      const validationResult = emailValidation(object);
      const expectedResponse = {
        'email-value': {
          'key': 'email-value',
          'text': 'Enter an email address',
          'href': '#email-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

    it('should fail email validation and return "string.format" type', () => {
      const object = { 'email-value': 'thisisnotanemailexample.net' };
      const validationResult = emailValidation(object);

      const expectedResponse = {
        'email-value': {
          'key': 'email-value',
          'text': 'Enter an email address in the correct format, like name@example.com',
          'href': '#email-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('phoneValidation', () => {
    it('should validate a landline phone number', () => {
      const object = { 'text-message-value': '01632960001' };
      const validationResult = phoneValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should validate a mobile phone number', () => {
      const object = { 'text-message-value': '07700900982' };
      const validationResult = phoneValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should validate a phone number with prefix', () => {
      const object = { 'text-message-value': '+448081570192' };
      const validationResult = phoneValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail phone validation and return "string.empty" type', () => {
      const object = { 'text-message-value': '' };
      const validationResult = phoneValidation(object);
      const expectedResponse = {
        'text-message-value': {
          'key': 'text-message-value',
          'text': 'Enter a phone number',
          'href': '#text-message-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

    it('should fail phone validation and return "string.format" type', () => {
      const object = { 'text-message-value': '1234567890' };
      const validationResult = phoneValidation(object);
      const expectedResponse = {
        'text-message-value': {
          'key': 'text-message-value',
          'text': 'Enter a telephone number, like 01632 960 002, 07700 900 982 or +44 808 157 0192',
          'href': '#text-message-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('textAreaValidation', () => {
    it('should validate', () => {
      const text: string = 'Some text here.';
      const key: string = 'aKey';
      const validations = textAreaValidation(text, key);

      expect(validations).to.equal(null);
    });

    it('should fail validation', () => {
      const text: string = '';
      const key: string = 'aKey';
      const validations = textAreaValidation(text, key);

      expect(validations).to.deep.equal(
        {
          [key]: {
            href: '#aKey',
            key: 'aKey',
            text: i18n.validationErrors.required
          }
        }
      );
    });
  });

  describe('statementOfTruthValidation', () => {
    it('should validate if statement present', () => {
      const object = { 'statement': 'acceptance' };
      const validationResult = statementOfTruthValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail validation and return "any.required" type', () => {
      const object = {};
      const validationResult = statementOfTruthValidation(object);
      const expectedResponse = {
        statement: {
          href: '#statement',
          key: 'statement',
          text: 'Select if you believe the information you have given is true.'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });

  });
});
