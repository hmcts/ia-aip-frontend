import moment from 'moment';
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
  function createError(fieldName, errorMessage) {
    return {
      href: `#${fieldName}`,
      key: fieldName,
      text: errorMessage
    };
  }

  describe('homeOfficeNumberValidation', () => {
    it('should validate', () => {
      const validations = homeOfficeNumberValidation({ homeOfficeRefNumber: 'A1234567' });
      expect(validations).to.equal(null);
    });

    it('should fail validation and return empty warning message', () => {
      const validations = homeOfficeNumberValidation({ homeOfficeRefNumber: '' });

      expect(validations).to.deep.equal({
        homeOfficeRefNumber: {
          href: '#homeOfficeRefNumber',
          key: 'homeOfficeRefNumber',
          text: 'Enter the Home Office reference number'
        }
      });
    });
  });

  describe('dateValidation', () => {
    const errors = {
      missingDay: 'missing day',
      missingMonth: 'missing month',
      missingYear: 'missing year',
      incorrectFormat: 'incorrect format',
      inPast: 'must be in past'
    };

    it('should validate', () => {
      const validDate = { day: '1', month: '1', year: '2019' };
      const validations = dateValidation(validDate, errors);
      expect(validations).to.deep.equal(null);
    });

    it('shouldnt validate @only2', () => {
      const inValidDate = { day: '1', month: '1', year: '20190' };
      const validations = dateValidation(inValidDate, errors);
      expect(validations).to.deep.equal(null);
    });

    it('fields cannot be empty', () => {
      const notValidDate = { day: '', month: '', year: '' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.missingDay),
          month: createError('month', errors.missingMonth),
          year: createError('year', errors.missingYear),
          date: createError('date', '')
        });
    });

    it('fields must be numbers', () => {
      const notValidDate = { day: 'a', month: 'b', year: 'c' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat),
          month: createError('month', errors.incorrectFormat),
          year: createError('year', errors.incorrectFormat),
          date: createError('date', '')
        });
    });

    it('fields must be integers', () => {
      const notValidDate = { day: '1.1', month: '2.2', year: '1000.1' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat),
          month: createError('month', errors.incorrectFormat),
          year: createError('year', errors.incorrectFormat)
        });
    });

    it('fields must greater than 0', () => {
      // not sure how we can do this for day and month
      const notValidDate = { day: '0', month: '0', year: '0' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat),
          month: createError('month', errors.incorrectFormat),
          year: createError('year', errors.incorrectFormat),
          date: createError('date', '')
        });
    });

    it('fields must be in past', () => {
      // not sure how we can do this for day and month
      const notValidDate = { day: '1', month: '1', year: '5000' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          date: createError('date', errors.inPast)
        });
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
