import {
  appellantNamesValidation,
  dateValidation,
  emailValidation,
  homeOfficeNumberValidation,
  mobilePhoneValidation,
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

  describe('dateValidation @only', () => {
    const errors = { ...i18n.validationErrors.dateLetterSent };

    it('should validate', () => {
      const validDate = { day: '1', month: '1', year: '2019' };
      const validations = dateValidation(validDate, errors);
      expect(validations).to.deep.equal(null);
    });

    it('fields cannot be empty', () => {
      let notValidDate = { day: '', month: '', year: '' };
      let validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal({
        day: createError('day', errors.missing)
      });

      notValidDate = { day: '1', month: '', year: '' };
      validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal({
        month: createError('month', errors.missing)
      });

      notValidDate = { day: '1', month: '1', year: '' };
      validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal({
        year: createError('year', errors.missing)
      });
    });

    it('fields must be numbers', () => {
      const notValidDate = { day: 'a', month: 'b', year: 'c' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat)
        });
    });

    it('fields must be integers', () => {
      const notValidDate = { day: '1.1', month: '2.2', year: '1000.1' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat)
        });
    });

    it('fields must greater than 0', () => {
      // not sure how we can do this for day and month
      const notValidDate = { day: '0', month: '0', year: '0' };
      const validations = dateValidation(notValidDate, errors);

      expect(validations).to.deep.equal(
        {
          day: createError('day', errors.incorrectFormat)
        });
    });

    it('fields must be in past', () => {
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

  describe('mobilePhoneValidation', () => {
    it('should fail validation with landline phone number', () => {
      const object = { 'text-message-value': '01632960001' };
      const validationResult = mobilePhoneValidation(object);
      const expectedResponse = {
        'text-message-value': {
          href: '#text-message-value',
          key: 'text-message-value',
          text: 'Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('mobile phone number cases', () => {
    it('should validate a mobile phone number', () => {
      const object = { 'text-message-value': '07700900982' };
      const validationResult = mobilePhoneValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should validate a mobile phone number with spaces', () => {
      const object = { 'text-message-value': '07700 900 982' };
      const validationResult = mobilePhoneValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail validation if not a valid UK mobile phone number', () => {
      const object = { 'text-message-value': '09700000000' };
      const validationResult = mobilePhoneValidation(object);

      const expectedResponse = {
        'text-message-value': {
          href: '#text-message-value',
          key: 'text-message-value',
          text: 'Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999'
        }
      };

      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  describe('mobile phone number with prefix cases', () => {

    it('should validate a valid mobile phone number with prefix', () => {
      const object = { 'text-message-value': '+447123456789' };
      const validationResult = mobilePhoneValidation(object);
      expect(validationResult).to.equal(null);
    });

    it('should fail validation with a phone number with prefix', () => {
      const object = { 'text-message-value': '+448081570192' };
      const validationResult = mobilePhoneValidation(object);
      const expectedResponse = {
        'text-message-value': {
          'key': 'text-message-value',
          'text': 'Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999',
          'href': '#text-message-value'
        }
      };
      expect(validationResult).to.deep.equal(expectedResponse);
    });
  });

  it('should fail phone validation and return "string.empty" type', () => {
    const object = { 'text-message-value': '' };
    const validationResult = mobilePhoneValidation(object);
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
    const validationResult = mobilePhoneValidation(object);
    const expectedResponse = {
      'text-message-value': {
        'key': 'text-message-value',
        'text': 'Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999',
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
